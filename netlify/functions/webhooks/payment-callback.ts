/**
 * Netlify Function: 支付回调处理
 * @endpoint /.netlify/functions/webhooks/payment-callback
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

type SubscriptionTier = 'trial' | 'pro' | 'premium';

interface PaymentCallbackData {
  provider: 'bufpay' | 'alipay' | 'wechat' | 'stripe';
  paymentId: string;
  orderId: string;
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  subscriptionTier: SubscriptionTier;
  subscriptionPeriod: 'monthly' | 'yearly';
  paidAt?: string;
  metadata?: Record<string, any>;
}

function calculateExpiresAt(period: 'monthly' | 'yearly', startDate: Date = new Date()): Date {
  const expiresAt = new Date(startDate);
  if (period === 'monthly') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }
  return expiresAt;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Handle GET (health check)
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        service: 'payment-callback',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      }),
    };
  }

  // Handle POST (payment callback)
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const callbackData: PaymentCallbackData = JSON.parse(event.body || '{}');

    console.log('[Payment Callback] Received:', {
      provider: callbackData.provider,
      paymentId: callbackData.paymentId,
      userId: callbackData.userId,
      status: callbackData.status,
    });

    if (!callbackData.userId || !callbackData.paymentId || !callbackData.productId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '缺少必填字段',
          error: 'Missing required fields',
        }),
      };
    }

    // 使用 Service Role Key 绕过 RLS
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // 1. 记录支付
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
        metadata: callbackData.metadata || {},
      })
      .select()
      .single();

    if (paymentError) {
      console.error('[Payment Callback] Payment record error:', paymentError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: '支付记录创建失败',
          error: paymentError.message,
        }),
      };
    }

    console.log('[Payment Callback] Payment recorded:', paymentRecord.id);

    // 2. 如果支付成功，更新订阅
    if (callbackData.status === 'success') {
      const now = new Date();
      const expiresAt = calculateExpiresAt(callbackData.subscriptionPeriod, now);
      const nextBillingDate = calculateExpiresAt(callbackData.subscriptionPeriod, now);

      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', callbackData.userId)
        .single();

      let subscriptionData;

      if (existingSubscription) {
        // 🔧 检查是否为升级（需要重置使用统计）
        const oldTier = existingSubscription.tier as SubscriptionTier;
        const oldPeriod = existingSubscription.period as 'monthly' | 'yearly';
        const newTier = callbackData.subscriptionTier;
        const newPeriod = callbackData.subscriptionPeriod;

        const isUpgrade =
          (oldTier === 'trial' && (newTier === 'pro' || newTier === 'premium')) ||
          (oldTier === 'pro' && newTier === 'premium') ||
          (oldTier === newTier && oldPeriod === 'monthly' && newPeriod === 'yearly');

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
            last_payment_id: callbackData.paymentId,
          })
          .eq('user_id', callbackData.userId)
          .select()
          .single();

        if (updateError) {
          console.error('[Payment Callback] Subscription update error:', updateError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              message: '订阅更新失败',
              error: updateError.message,
            }),
          };
        }

        subscriptionData = updatedSubscription;
        console.log('[Payment Callback] Subscription updated:', subscriptionData.id);

        // 🔧 如果是升级，重置使用统计
        if (isUpgrade) {
          console.log('[Payment Callback] Detected upgrade, resetting usage stats...', {
            oldTier,
            newTier,
            oldPeriod,
            newPeriod
          });

          try {
            // 删除 Token 使用记录
            await supabase
              .from('token_usage_records')
              .delete()
              .eq('user_id', callbackData.userId);

            // 删除使用次数记录
            await supabase
              .from('usage_count_records')
              .delete()
              .eq('user_id', callbackData.userId);

            console.log('[Payment Callback] Usage stats reset successfully');
          } catch (resetError) {
            console.error('[Payment Callback] Failed to reset usage stats:', resetError);
            // 不阻塞主流程
          }
        }
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
            auto_renew: false,
          })
          .select()
          .single();

        if (createError) {
          console.error('[Payment Callback] Subscription creation error:', createError);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              message: '订阅创建失败',
              error: createError.message,
            }),
          };
        }

        subscriptionData = newSubscription;
        console.log('[Payment Callback] Subscription created:', subscriptionData.id);
      }

      // 3. 更新支付记录关联订阅ID
      await supabase
        .from('payment_records')
        .update({ subscription_id: subscriptionData.id })
        .eq('payment_id', callbackData.paymentId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '支付处理成功',
          subscriptionId: subscriptionData.id,
          paymentId: paymentRecord.id,
        }),
      };
    }

    // 支付未成功
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '支付记录已保存',
        paymentId: paymentRecord.id,
      }),
    };
  } catch (error) {
    console.error('[Payment Callback] Unexpected error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: '支付处理失败',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
