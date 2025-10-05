// @ts-nocheck - 服务文件，允许类型检查宽松
/**
 * 订单服务
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { supabase } from '@/config/supabase';
import { Order, UserSubscription } from '@/types/payment';
import { generateOrderId, calculateExpiryDate } from '@/utils/paymentUtils';
import { logger } from '@/utils/logger';

export class OrderService {
  /**
   * 创建订单
   */
  static async createOrder(orderData: {
    userId: string;
    userEmail?: string;
    productName: string;
    productType: 'professional' | 'premium';
    durationType: 'monthly' | 'yearly';
    amount: number;
    payType: 'alipay' | 'wechat';
  }): Promise<{ order: Order; orderId: string }> {
    try {
      const orderId = generateOrderId();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15分钟后过期

      // 所有环境统一使用真实数据库
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          user_id: orderData.userId,
          user_email: orderData.userEmail,
          product_name: orderData.productName,
          product_type: orderData.productType,
          duration_type: orderData.durationType,
          amount: orderData.amount,
          pay_type: orderData.payType,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('创建订单失败:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          orderData: {
            orderId,
            userId: orderData.userId,
            productType: orderData.productType,
            durationType: orderData.durationType
          }
        });
        throw new Error(`创建订单失败: ${error.message || error.code || '未知错误'}`);
      }

      logger.info('订单创建成功:', { orderId, userId: orderData.userId });
      return { order: data, orderId };
    } catch (error) {
      logger.error('创建订单异常:', error);
      throw error;
    }
  }

  /**
   * 更新订单支付信息
   */
  static async updateOrderPaymentInfo(orderId: string, paymentInfo: {
    aoid?: string;
    qr_code?: string;
    qr_image?: string;
    expires_at?: string;
  }): Promise<void> {
    try {
      // 所有环境统一使用真实数据库

      const { error } = await supabase
        .from('orders')
        .update(paymentInfo)
        .eq('order_id', orderId);

      if (error) {
        logger.error('更新订单支付信息失败:', error);
        throw new Error('更新订单支付信息失败');
      }

      logger.info('订单支付信息更新成功:', { orderId });
    } catch (error) {
      logger.error('更新订单支付信息异常:', error);
      throw error;
    }
  }

  /**
   * 根据订单ID查询订单
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      // 所有环境统一使用真实数据库

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 订单不存在
        }
        logger.error('查询订单失败:', error);
        throw new Error('查询订单失败');
      }

      return data;
    } catch (error) {
      logger.error('查询订单异常:', error);
      throw error;
    }
  }

  /**
   * 根据AOID查询订单
   */
  static async getOrderByAoid(aoid: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('aoid', aoid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('根据AOID查询订单失败:', error);
        throw new Error('根据AOID查询订单失败');
      }

      return data;
    } catch (error) {
      logger.error('根据AOID查询订单异常:', error);
      throw error;
    }
  }

  /**
   * 更新订单状态为已支付
   */
  static async markOrderAsPaid(orderId: string, paymentData: {
    aoid: string;
    payPrice: number;
  }): Promise<Order> {
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

      logger.info('订单标记为已支付:', { orderId, aoid: paymentData.aoid });
      return data;
    } catch (error) {
      logger.error('标记订单为已支付异常:', error);
      throw error;
    }
  }

  /**
   * 处理订单权限开通
   */
  static async processOrderPermissions(order: Order): Promise<UserSubscription> {
    try {
      // 计算订阅到期时间
      const expiryDate = calculateExpiryDate(order.duration_type);
      
      // 检查用户是否已有相同类型的订阅
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', order.user_id)
        .eq('subscription_type', order.product_type)
        .eq('status', 'active')
        .single();

      let subscriptionData;

      if (existingSubscription) {
        // 如果已有订阅，延长到期时间
        const currentExpiry = new Date(existingSubscription.expires_at);
        const newExpiry = calculateExpiryDate(order.duration_type, currentExpiry > new Date() ? currentExpiry : new Date());
        
        const { data, error } = await supabase
          .from('user_subscriptions')
          .update({
            expires_at: newExpiry.toISOString()
          })
          .eq('id', existingSubscription.id)
          .select()
          .single();

        if (error) throw error;
        subscriptionData = data;
        
        logger.info('订阅时间延长成功:', { 
          userId: order.user_id, 
          subscriptionType: order.product_type,
          newExpiry: newExpiry.toISOString()
        });
      } else {
        // 创建新订阅
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
        
        logger.info('新订阅创建成功:', { 
          userId: order.user_id, 
          subscriptionType: order.product_type,
          expiresAt: expiryDate.toISOString()
        });
      }

      // 标记订单为已处理
      await supabase
        .from('orders')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('order_id', order.order_id);

      return subscriptionData;
    } catch (error) {
      logger.error('处理订单权限开通失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户订阅信息
   */
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('expires_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 没有订阅
        }
        logger.error('查询用户订阅失败:', error);
        throw new Error('查询用户订阅失败');
      }

      // 检查订阅是否过期
      if (new Date(data.expires_at) <= new Date()) {
        // 标记为过期
        await supabase
          .from('user_subscriptions')
          .update({ status: 'expired' })
          .eq('id', data.id);
        
        return null;
      }

      return data;
    } catch (error) {
      logger.error('查询用户订阅异常:', error);
      throw error;
    }
  }

  /**
   * 获取用户订单历史
   */
  static async getUserOrders(userId: string, limit: number = 10): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('查询用户订单历史失败:', error);
        throw new Error('查询用户订单历史失败');
      }

      return data || [];
    } catch (error) {
      logger.error('查询用户订单历史异常:', error);
      throw error;
    }
  }

  /**
   * 根据订单ID获取用户订阅信息
   */
  static async getUserSubscriptionByOrderId(orderId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        logger.error('根据订单ID获取用户订阅失败:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('根据订单ID获取用户订阅失败:', error);
      return null;
    }
  }
}
