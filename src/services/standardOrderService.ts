/**
 * 标准化订单服务
 * 基于标准支付流程的订单管理
 * 支持 Netlify Functions + Supabase 架构
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

export interface CreateOrderParams {
  userId: string;
  userEmail: string;
  productName: string;
  productType: 'professional' | 'premium';
  durationType: 'monthly' | 'yearly';
  amount: number; // 以分为单位
  originalAmount?: number;
  discountAmount?: number;
  payType: 'alipay' | 'wechat';
  metadata?: Record<string, any>;
}

export interface StandardOrder {
  id: string;
  order_id: string;
  user_id: string;
  user_email?: string;
  product_name: string;
  product_type: string;
  duration_type: string;
  amount: number;
  original_amount?: number;
  discount_amount: number;
  pay_type: string;
  payment_platform: string;
  platform_order_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  created_at: string;
  paid_at?: string;
  failed_at?: string;
  cancelled_at?: string;
  notify_data?: any;
  notify_verified: boolean;
  subscription_id?: string;
  metadata: Record<string, any>;
}

export class StandardOrderService {
  /**
   * 创建标准订单
   */
  static async createOrder(params: CreateOrderParams): Promise<StandardOrder> {
    try {
      // 生成订单号
      const orderId = await this.generateOrderId();
      
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
        status: 'pending',
        notify_verified: false,
        metadata: params.metadata || {}
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('标准订单创建成功:', { orderId, userId: params.userId });
      return data;
    } catch (error) {
      logger.error('创建标准订单失败:', error);
      throw error;
    }
  }

  /**
   * 查询订单
   */
  static async getOrder(orderId: string): Promise<StandardOrder | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 订单不存在
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('查询订单失败:', error);
      throw error;
    }
  }

  /**
   * 查询用户订单列表
   */
  static async getUserOrders(
    userId: string, 
    options: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ): Promise<StandardOrder[]> {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('查询用户订单失败:', error);
      throw error;
    }
  }

  /**
   * 检查订单支付状态
   */
  static async checkPaymentStatus(orderId: string): Promise<{
    status: string;
    isPaid: boolean;
    order: StandardOrder | null;
  }> {
    try {
      const order = await this.getOrder(orderId);
      
      if (!order) {
        return {
          status: 'not_found',
          isPaid: false,
          order: null
        };
      }

      return {
        status: order.status,
        isPaid: order.status === 'paid',
        order
      };
    } catch (error) {
      logger.error('检查支付状态失败:', error);
      throw error;
    }
  }

  /**
   * 轮询订单状态（用于支付结果页面）
   */
  static async pollOrderStatus(
    orderId: string,
    maxAttempts: number = 30,
    interval: number = 2000
  ): Promise<StandardOrder> {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const poll = async () => {
        try {
          attempts++;
          const order = await this.getOrder(orderId);

          if (!order) {
            reject(new Error('订单不存在'));
            return;
          }

          // 如果订单状态已确定，返回结果
          if (order.status === 'paid' || order.status === 'failed') {
            resolve(order);
            return;
          }

          // 如果达到最大尝试次数，返回当前状态
          if (attempts >= maxAttempts) {
            resolve(order);
            return;
          }

          // 继续轮询
          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * 生成订单号
   */
  private static async generateOrderId(): Promise<string> {
    try {
      // 尝试调用数据库函数生成订单号
      const { data, error } = await supabase.rpc('generate_order_id');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      // 如果数据库函数失败，使用前端生成
      logger.warn('数据库生成订单号失败，使用前端生成:', error);
      return this.generateOrderIdFallback();
    }
  }

  /**
   * 前端订单号生成备用方案
   */
  private static generateOrderIdFallback(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `WP${dateStr}${randomStr}`;
  }

  /**
   * 获取订单统计信息
   */
  static async getOrderStats(userId: string): Promise<{
    total: number;
    paid: number;
    pending: number;
    failed: number;
    totalAmount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, amount')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const stats = {
        total: data.length,
        paid: 0,
        pending: 0,
        failed: 0,
        totalAmount: 0
      };

      data.forEach(order => {
        switch (order.status) {
          case 'paid':
            stats.paid++;
            stats.totalAmount += order.amount;
            break;
          case 'pending':
            stats.pending++;
            break;
          case 'failed':
            stats.failed++;
            break;
        }
      });

      return stats;
    } catch (error) {
      logger.error('获取订单统计失败:', error);
      throw error;
    }
  }

  /**
   * 取消订单（用户主动取消）
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<StandardOrder> {
    try {
      const updateData = {
        status: 'cancelled' as const,
        cancelled_at: new Date().toISOString(),
        metadata: {
          cancelled_reason: reason,
          cancelled_by: 'user',
          cancelled_at: new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('order_id', orderId)
        .eq('status', 'pending') // 只能取消待支付的订单
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info('订单取消成功:', { orderId });
      return data;
    } catch (error) {
      logger.error('取消订单失败:', error);
      throw error;
    }
  }
}

export default StandardOrderService;
