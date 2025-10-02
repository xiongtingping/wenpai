/**
 * 支付回调处理
 * @description 处理支付平台的回调,更新订阅状态
 * @created 2025-10-02
 */

import { createClient } from '@supabase/supabase-js';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 支付回调数据接口
 */
interface PaymentCallbackData {
  // 支付平台信息
  provider: 'bufpay' | 'alipay' | 'wechat' | 'stripe';
  paymentId: string;
  orderId: string;

  // 用户信息
  userId: string;

  // 订单信息
  productId: string;
  productName: string;
  amount: number;
  currency: string;

  // 状态
  status: 'success' | 'failed' | 'pending';

  // 订阅信息
  subscriptionTier: SubscriptionTier;
  subscriptionPeriod: 'monthly' | 'yearly';

  // 时间戳
  paidAt?: string;

  // 元数据
  metadata?: Record<string, any>;
}

/**
 * 支付回调响应接口
 */
interface PaymentCallbackResponse {
  success: boolean;
  message: string;
  subscriptionId?: string;
  paymentId?: string;
  error?: string;
}

/**
 * 计算订阅过期时间
 */
function calculateExpiresAt(
  period: 'monthly' | 'yearly',
  startDate: Date = new Date()
): Date {
  const expiresAt = new Date(startDate);

  if (period === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }

  return expiresAt;
}

/**
 * 计算下次计费时间
 */
function calculateNextBillingDate(
  period: 'monthly' | 'yearly',
  startDate: Date = new Date()
): Date {
  return calculateExpiresAt(period, startDate);
}

/**
 * POST /api/webhooks/payment-callback
 * 处理支付回调
 */
export async function POST(request: Request) {
  try {
    const callbackData: PaymentCallbackData = await request.json();

    console.log('[Payment Callback] Received:', {
      provider: callbackData.provider,
      paymentId: callbackData.paymentId,
      userId: callbackData.userId,
      status: callbackData.status
    });

    // 验证必填字段
    if (!callbackData.userId || !callbackData.paymentId || !callbackData.productId) {
      return Response.json({
        success: false,
        message: '缺少必填字段',
        error: 'Missing required fields'
      } as PaymentCallbackResponse, { status: 400 });
    }

    // 初始化 Supabase 客户端 (使用服务角色密钥)
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '' // 服务角色密钥,绕过RLS
    );

    // 1. 记录支付记录
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_records')
      .insert({
        user_id: callbackData.userId,
        payment_id: callbackData.paymentId,
        payment_method: callbackData.provider,
        payment_provider: callbackData.provider,
        amount: callbackData.amount,
        currency: callbackData.currency || 'CNY',
        final_amount: callbackData.amount,
        order_id: callbackData.orderId,
        product_id: callbackData.productId,
        product_name: callbackData.productName,
        status: callbackData.status,
        paid_at: callbackData.paidAt || new Date().toISOString(),
        metadata: callbackData.metadata || {}
      })
      .select()
      .single();

    if (paymentError) {
      console.error('[Payment Callback] Payment record error:', paymentError);
      return Response.json({
        success: false,
        message: '支付记录创建失败',
        error: paymentError.message
      } as PaymentCallbackResponse, { status: 500 });
    }

    console.log('[Payment Callback] Payment recorded:', paymentRecord.id);

    // 2. 如果支付成功,更新订阅状态
    if (callbackData.status === 'success') {
      const now = new Date();
      const expiresAt = calculateExpiresAt(callbackData.subscriptionPeriod, now);
      const nextBillingDate = calculateNextBillingDate(callbackData.subscriptionPeriod, now);

      // 检查用户是否已有订阅
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', callbackData.userId)
        .single();

      let subscriptionData;

      if (existingSubscription) {
        // 更新现有订阅
        const { data: updatedSubscription, error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            tier: callbackData.subscriptionTier,
            status: 'active',
            period: callbackData.subscriptionPeriod,
            expires_at: expiresAt.toISOString(),
            next_billing_date: nextBillingDate.toISOString(),
            payment_method: callbackData.provider,
            last_payment_id: callbackData.paymentId
          })
          .eq('user_id', callbackData.userId)
          .select()
          .single();

        if (updateError) {
          console.error('[Payment Callback] Subscription update error:', updateError);
          return Response.json({
            success: false,
            message: '订阅更新失败',
            error: updateError.message
          } as PaymentCallbackResponse, { status: 500 });
        }

        subscriptionData = updatedSubscription;
        console.log('[Payment Callback] Subscription updated:', subscriptionData.id);
      } else {
        // 创建新订阅
        const { data: newSubscription, error: createError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: callbackData.userId,
            tier: callbackData.subscriptionTier,
            status: 'active',
            period: callbackData.subscriptionPeriod,
            expires_at: expiresAt.toISOString(),
            next_billing_date: nextBillingDate.toISOString(),
            payment_method: callbackData.provider,
            last_payment_id: callbackData.paymentId,
            auto_renew: false
          })
          .select()
          .single();

        if (createError) {
          console.error('[Payment Callback] Subscription creation error:', createError);
          return Response.json({
            success: false,
            message: '订阅创建失败',
            error: createError.message
          } as PaymentCallbackResponse, { status: 500 });
        }

        subscriptionData = newSubscription;
        console.log('[Payment Callback] Subscription created:', subscriptionData.id);
      }

      // 3. 更新支付记录关联订阅ID
      await supabase
        .from('payment_records')
        .update({ subscription_id: subscriptionData.id })
        .eq('payment_id', callbackData.paymentId);

      // 4. 清除用户权限缓存
      try {
        const response = await fetch('/api/permissions/clear-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: callbackData.userId })
        });

        if (response.ok) {
          console.log('[Payment Callback] Permission cache cleared');
        }
      } catch (error) {
        console.warn('[Payment Callback] Failed to clear cache:', error);
        // 不阻塞主流程
      }

      // 5. 返回成功响应
      return Response.json({
        success: true,
        message: '支付处理成功',
        subscriptionId: subscriptionData.id,
        paymentId: paymentRecord.id
      } as PaymentCallbackResponse);
    }

    // 支付未成功
    return Response.json({
      success: true,
      message: '支付记录已保存',
      paymentId: paymentRecord.id
    } as PaymentCallbackResponse);

  } catch (error) {
    console.error('[Payment Callback] Unexpected error:', error);
    return Response.json({
      success: false,
      message: '支付处理失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as PaymentCallbackResponse, { status: 500 });
  }
}

/**
 * GET /api/webhooks/payment-callback
 * 验证webhook端点是否正常
 */
export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'payment-callback',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}
