/**
 * 订单事务服务 - 为支付流程添加事务保护和补偿机制
 */

import { supabase } from '@/config/supabase';
import { Order, UserSubscription } from '@/types/payment';
import { calculateExpiryDate } from '@/utils/paymentUtils';
import { logger } from '@/utils/logger';
import { UserIdValidator } from '@/utils/userIdValidator';

export interface OrderProcessResult {
  success: boolean;
  order?: Order;
  subscription?: UserSubscription;
  error?: string;
  rollbackPerformed?: boolean;
}

export class OrderTransactionService {
  static async processPaymentSuccess(
    orderId: string,
    paymentData: { aoid: string; payPrice: number }
  ): Promise<OrderProcessResult> {
    logger.info('🔄 开始处理支付成功订单（带事务保护）', { orderId });

    try {
      const order = await this.markOrderAsPaid(orderId, paymentData);
      
      if (!order) {
        return { success: false, error: '订单不存在或更新失败' };
      }

      try {
        UserIdValidator.validate(order.user_id, '处理订单');
      } catch (error) {
        logger.error('❌ 订单用户ID无效:', { orderId, userId: order.user_id });
        await this.rollbackOrder(orderId, 'invalid_user_id');
        return { success: false, error: '用户ID无效', rollbackPerformed: true };
      }

      try {
        const subscription = await this.createOrUpdateSubscription(order);
        await this.markOrderAsProcessed(orderId);
        
        logger.info('✅ 订单处理成功', {
          orderId,
          userId: UserIdValidator.formatForLog(order.user_id),
          subscriptionId: subscription.id
        });

        return { success: true, order, subscription };
      } catch (subscriptionError) {
        logger.error('❌ 订阅创建失败，执行回滚', { orderId, error: subscriptionError });
        await this.rollbackOrder(orderId, 'subscription_failed');
        return {
          success: false,
          error: subscriptionError instanceof Error ? subscriptionError.message : '订阅创建失败',
          rollbackPerformed: true
        };
      }
    } catch (error) {
      logger.error('❌ 订单处理异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private static async markOrderAsPaid(
    orderId: string,
    paymentData: { aoid: string; payPrice: number }
  ): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          aoid: paymentData.aoid,
          pay_price: paymentData.payPrice,
          paid_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) {
        logger.error('标记订单为已支付失败:', error);
        throw new Error('标记订单为已支付失败');
      }

      logger.info('✅ 订单标记为已支付:', { orderId, aoid: paymentData.aoid });
      return data;
    } catch (error) {
      logger.error('标记订单为已支付异常:', error);
      throw error;
    }
  }

  private static async createOrUpdateSubscription(order: Order): Promise<UserSubscription> {
    try {
      const expiryDate = calculateExpiryDate(order.duration_type);

      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', order.user_id)
        .eq('subscription_type', order.product_type)
        .eq('status', 'active')
        .single();

      let subscriptionData;

      if (existingSubscription) {
        const currentExpiry = new Date(existingSubscription.expires_at);
        const newExpiry = calculateExpiryDate(
          order.duration_type,
          currentExpiry > new Date() ? currentExpiry : new Date()
        );

        const { data, error } = await supabase
          .from('user_subscriptions')
          .update({ expires_at: newExpiry.toISOString() })
          .eq('id', existingSubscription.id)
          .select()
          .single();

        if (error) throw error;
        subscriptionData = data;

        logger.info('✅ 订阅时间延长成功:', {
          userId: UserIdValidator.formatForLog(order.user_id),
          subscriptionType: order.product_type,
          newExpiry: newExpiry.toISOString()
        });
      } else {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: order.user_id,
            subscription_type: order.product_type,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiryDate.toISOString(),
            order_id: order.order_id
          })
          .select()
          .single();

        if (error) throw error;
        subscriptionData = data;

        logger.info('✅ 新订阅创建成功:', {
          userId: UserIdValidator.formatForLog(order.user_id),
          subscriptionType: order.product_type,
          expiresAt: expiryDate.toISOString()
        });
      }

      return subscriptionData;
    } catch (error) {
      logger.error('创建或更新订阅失败:', error);
      throw error;
    }
  }

  private static async markOrderAsProcessed(orderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (error) {
        logger.error('标记订单为已处理失败:', error);
        throw new Error('标记订单为已处理失败');
      }

      logger.info('✅ 订单标记为已处理:', { orderId });
    } catch (error) {
      logger.error('标记订单为已处理异常:', error);
      throw error;
    }
  }

  private static async rollbackOrder(orderId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'failed',
          error_message: `订单处理失败: ${reason}`,
          failed_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (error) {
        logger.error('回滚订单状态失败:', error);
        throw new Error('回滚订单状态失败');
      }

      logger.info('🔄 订单状态已回滚:', { orderId, reason });
    } catch (error) {
      logger.error('回滚订单状态异常:', error);
    }
  }
}
