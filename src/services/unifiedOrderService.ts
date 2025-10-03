/**
 * 统一订单服务
 * 整合旧版OrderService和新版StandardOrderService
 * 使用OrderStateMachine管理状态转换
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import { generateOrderId, calculateExpiryDate } from '@/utils/paymentUtils';
import { PaymentErrors } from '@/config/paymentEndpoints';
import {
  OrderStateMachine,
  OrderStatusGuard,
  UnifiedOrderStatus,
  OrderStatusEvent,
  StatusTransitionRecord
} from '@/types/orderStateMachine';
import type { Order, UserSubscription } from '@/types/payment';

/**
 * 创建订单参数
 */
export interface CreateOrderParams {
  userId: string;
  userEmail?: string;
  productName: string;
  productType: 'professional' | 'premium';
  durationType: 'monthly' | 'yearly';
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  payType: 'alipay' | 'wechat';
  metadata?: Record<string, any>;
}

/**
 * 权限发放结果
 */
export interface PermissionGrantResult {
  success: boolean;
  subscription?: UserSubscription;
  error?: string;
  shouldRetry: boolean;
}

/**
 * 统一订单服务类
 */
export class UnifiedOrderService {
  /**
   * 创建订单
   */
  static async createOrder(params: CreateOrderParams): Promise<Order> {
    try {
      const orderId = generateOrderId();
      const expiresAt = calculateExpiryDate(15); // 15分钟后过期

      const orderData = {
        order_id: orderId,
        user_id: params.userId,
        user_email: params.userEmail,
        product_name: params.productName,
        product_type: params.productType,
        duration_type: params.durationType,
        amount: params.amount,
        original_amount: params.originalAmount || params.amount,
        discount_amount: params.discountAmount || 0,
        pay_type: params.payType,
        payment_platform: 'bufpay',
        status: 'pending' as UnifiedOrderStatus,
        expires_at: expiresAt,
        notify_verified: false,
        metadata: params.metadata || {}
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        logger.error('创建订单失败:', {
          error,
          code: error.code,
          params: {
            userId: params.userId,
            productType: params.productType,
            durationType: params.durationType,
            amount: params.amount
          }
        });
        throw new Error(PaymentErrors.ORDER_CREATE_FAILED.message);
      }

      logger.info('订单创建成功:', { orderId, userId: params.userId });
      return data;
    } catch (error) {
      logger.error('创建订单异常:', error);
      throw error;
    }
  }

  /**
   * 获取订单
   */
  static async getOrder(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // 没有找到记录
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('查询订单失败:', { orderId, error });
      throw error;
    }
  }

  /**
   * 状态转换 - 使用状态机验证
   */
  static async transitionStatus(
    orderId: string,
    event: OrderStatusEvent,
    reason?: string,
    metadata?: Record<string, any>
  ): Promise<StatusTransitionRecord> {
    try {
      // 1. 获取当前订单
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error(PaymentErrors.ORDER_NOT_FOUND.message);
      }

      // 2. 使用状态机验证和执行转换
      const transition = OrderStateMachine.transition(
        orderId,
        order.status as UnifiedOrderStatus,
        event,
        reason
      );

      if (!transition.isValid) {
        logger.error('无效的状态转换:', {
          orderId,
          from: order.status,
          event,
          reason: transition.error
        });
        throw new Error(`无效的状态转换: ${transition.error}`);
      }

      // 3. 更新数据库
      const updateData: Record<string, any> = {
        status: transition.toStatus,
        updated_at: new Date().toISOString()
      };

      // 根据目标状态设置时间戳
      switch (transition.toStatus) {
        case 'paid':
          updateData.paid_at = new Date().toISOString();
          break;
        case 'processed':
          updateData.processed_at = new Date().toISOString();
          break;
        case 'failed':
          updateData.failed_at = new Date().toISOString();
          break;
        case 'cancelled':
          updateData.cancelled_at = new Date().toISOString();
          break;
        case 'expired':
          updateData.expired_at = new Date().toISOString();
          break;
        case 'refunded':
          updateData.refunded_at = new Date().toISOString();
          break;
      }

      // 合并元数据
      if (metadata) {
        updateData.metadata = {
          ...(order.metadata || {}),
          ...metadata
        };
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('order_id', orderId);

      if (updateError) {
        logger.error('更新订单状态失败:', { orderId, updateError });
        throw new Error('更新订单状态失败');
      }

      logger.info('订单状态转换成功:', {
        orderId,
        from: transition.fromStatus,
        to: transition.toStatus,
        event,
        reason
      });

      return transition;
    } catch (error) {
      logger.error('状态转换失败:', { orderId, event, error });
      throw error;
    }
  }

  /**
   * 标记订单为已支付(简单版本,不包含权限发放)
   */
  static async markOrderAsPaid(
    orderId: string,
    paymentInfo: {
      aoid?: string;
      platformOrderId?: string;
      payPrice: number;
      notifyData?: any;
    }
  ): Promise<Order> {
    try {
      // 使用状态机转换
      await this.transitionStatus(
        orderId,
        'payment_received',
        '支付成功回调',
        {
          aoid: paymentInfo.aoid,
          platform_order_id: paymentInfo.platformOrderId,
          pay_price: paymentInfo.payPrice,
          notify_data: paymentInfo.notifyData
        }
      );

      // 返回更新后的订单
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error(PaymentErrors.ORDER_NOT_FOUND.message);
      }

      return order;
    } catch (error) {
      logger.error('标记订单为已支付失败:', { orderId, error });
      throw error;
    }
  }

  /**
   * 处理支付回调 - 使用数据库函数保证幂等性
   * 包含支付确认 + 权限发放,原子性执行
   */
  static async processPaymentCallback(
    orderId: string,
    callbackData: {
      aoid: string;
      payPrice: number;
      notifyData?: any;
    }
  ): Promise<{
    success: boolean;
    duplicate: boolean;
    subscriptionId?: number;
    error?: string;
  }> {
    try {
      logger.info('处理支付回调:', { orderId, aoid: callbackData.aoid });

      // 调用数据库函数进行原子性处理
      const { data, error } = await supabase.rpc('process_payment_callback', {
        p_order_id: orderId,
        p_aoid: callbackData.aoid,
        p_pay_price: callbackData.payPrice,
        p_notify_data: callbackData.notifyData || null
      });

      if (error) {
        logger.error('调用支付回调函数失败:', { orderId, error });
        return {
          success: false,
          duplicate: false,
          error: error.message
        };
      }

      // 解析返回结果
      const result = data as {
        success: boolean;
        duplicate: boolean;
        subscription_id?: number;
        error?: string;
        message?: string;
        current_status?: string;
      };

      if (result.duplicate) {
        logger.info('重复的支付回调:', {
          orderId,
          currentStatus: result.current_status
        });
      } else if (result.success) {
        logger.info('支付回调处理成功:', {
          orderId,
          subscriptionId: result.subscription_id
        });
      } else {
        logger.error('支付回调处理失败:', {
          orderId,
          error: result.error
        });
      }

      return {
        success: result.success,
        duplicate: result.duplicate,
        subscriptionId: result.subscription_id,
        error: result.error
      };
    } catch (error) {
      logger.error('处理支付回调异常:', { orderId, error });
      return {
        success: false,
        duplicate: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 发放权限 - 使用数据库函数保证原子性
   */
  static async grantPermissions(orderId: string): Promise<PermissionGrantResult> {
    try {
      // 调用数据库函数进行原子性的权限发放
      const { data, error } = await supabase.rpc('repair_order_permissions', {
        p_order_id: orderId
      });

      if (error) {
        logger.error('调用权限修复函数失败:', { orderId, error });
        return {
          success: false,
          error: error.message,
          shouldRetry: true
        };
      }

      // 解析返回结果
      const result = data as {
        success: boolean;
        subscription_id?: number;
        error?: string;
        repaired?: boolean;
        message?: string;
      };

      if (!result.success) {
        logger.error('权限发放失败:', { orderId, error: result.error });
        return {
          success: false,
          error: result.error || '权限发放失败',
          shouldRetry: result.error?.includes('不存在') ? false : true
        };
      }

      // 获取订阅信息
      if (result.subscription_id) {
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('id', result.subscription_id)
          .single();

        logger.info('权限发放成功:', {
          orderId,
          subscriptionId: result.subscription_id,
          repaired: result.repaired,
          message: result.message
        });

        return {
          success: true,
          subscription: subscription || undefined,
          shouldRetry: false
        };
      }

      return {
        success: true,
        shouldRetry: false
      };
    } catch (error) {
      logger.error('权限发放异常:', { orderId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        shouldRetry: true
      };
    }
  }

  /**
   * 取消订单
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<void> {
    await this.transitionStatus(orderId, 'user_cancelled', reason || '用户取消');
  }

  /**
   * 标记订单为失败
   */
  static async markOrderAsFailed(orderId: string, reason?: string): Promise<void> {
    await this.transitionStatus(orderId, 'payment_failed', reason || '支付失败');
  }

  /**
   * 标记订单为过期
   */
  static async markOrderAsExpired(orderId: string): Promise<void> {
    await this.transitionStatus(orderId, 'order_expired', '订单超时');
  }

  /**
   * 批量查询需要修复的订单
   * 已支付但超过5分钟未处理的订单
   */
  static async getOrdersNeedingRepair(): Promise<Order[]> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'paid')
        .lt('paid_at', fiveMinutesAgo)
        .order('paid_at', { ascending: true })
        .limit(100);

      if (error) {
        logger.error('查询需要修复的订单失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('查询需要修复的订单异常:', error);
      return [];
    }
  }

  /**
   * 修复单个订单权限
   */
  static async repairOrderPermissions(orderId: string): Promise<PermissionGrantResult> {
    logger.info('开始修复订单权限:', { orderId });
    return await this.grantPermissions(orderId);
  }

  /**
   * 批量修复订单权限
   */
  static async batchRepairOrders(orderIds: string[]): Promise<{
    total: number;
    repaired: number;
    failed: number;
    results: Array<{ orderId: string; success: boolean; error?: string }>;
  }> {
    logger.info('开始批量修复订单:', { count: orderIds.length });

    const results: Array<{ orderId: string; success: boolean; error?: string }> = [];
    let repaired = 0;
    let failed = 0;

    for (const orderId of orderIds) {
      const result = await this.repairOrderPermissions(orderId);

      if (result.success) {
        repaired++;
        results.push({ orderId, success: true });
      } else {
        failed++;
        results.push({ orderId, success: false, error: result.error });
      }
    }

    logger.info('批量修复完成:', { total: orderIds.length, repaired, failed });

    return {
      total: orderIds.length,
      repaired,
      failed,
      results
    };
  }

  /**
   * 轮询订单状态
   */
  static async pollOrderStatus(
    orderId: string,
    options: {
      maxAttempts?: number;
      interval?: number;
      onTimeout?: () => void;
    } = {}
  ): Promise<Order | null> {
    const maxAttempts = options.maxAttempts || 30; // 默认30次
    const interval = options.interval || 2000; // 默认2秒

    return new Promise((resolve) => {
      let attempts = 0;

      const checkStatus = async () => {
        attempts++;
        const order = await this.getOrder(orderId);

        if (!order) {
          logger.warn('轮询时订单不存在:', { orderId });
          resolve(null);
          return;
        }

        // 如果订单已完成(任何最终状态),停止轮询
        if (OrderStatusGuard.isFinalStatus(order.status as UnifiedOrderStatus)) {
          logger.info('订单已完成,停止轮询:', { orderId, status: order.status });
          resolve(order);
          return;
        }

        // 如果达到最大尝试次数
        if (attempts >= maxAttempts) {
          logger.warn('订单状态轮询超时:', { orderId, attempts });
          options.onTimeout?.();
          resolve(order);
          return;
        }

        // 继续轮询
        setTimeout(checkStatus, interval);
      };

      checkStatus();
    });
  }

  /**
   * 检查订单是否可以取消
   */
  static canCancel(order: Order): boolean {
    return OrderStatusGuard.canCancel(order.status as UnifiedOrderStatus);
  }

  /**
   * 检查订单是否可以退款
   */
  static canRefund(order: Order): boolean {
    return OrderStatusGuard.canRefund(order.status as UnifiedOrderStatus);
  }

  /**
   * 检查订单是否需要权限修复
   */
  static needsPermissionRepair(order: Order): boolean {
    return OrderStatusGuard.needsPermissionRepair(order.status as UnifiedOrderStatus);
  }
}

export default UnifiedOrderService;
