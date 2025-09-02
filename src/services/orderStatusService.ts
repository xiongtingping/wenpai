/**
 * 订单状态检查和修复服务
 * 确保支付成功后权限正确发放
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

export interface OrderStatusCheck {
  orderId: string;
  orderStatus: 'pending' | 'paid' | 'processed' | 'failed' | 'expired';
  hasSubscription: boolean;
  subscriptionData?: any;
  needsRepair: boolean;
  repairActions: string[];
}

export class OrderStatusService {
  /**
   * 检查订单状态和权限发放情况
   */
  static async checkOrderStatus(orderId: string): Promise<OrderStatusCheck> {
    try {
      // 1. 获取订单信息
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error(`订单不存在: ${orderId}`);
      }

      // 2. 检查是否有对应的订阅
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'active')
        .maybeSingle();

      if (subError) {
        logger.error('查询订阅失败:', subError);
      }

      // 3. 分析状态
      const hasSubscription = !!subscription;
      const needsRepair = this.analyzeNeedsRepair(order, hasSubscription);
      const repairActions = this.getRepairActions(order, hasSubscription);

      return {
        orderId,
        orderStatus: order.status,
        hasSubscription,
        subscriptionData: subscription,
        needsRepair,
        repairActions
      };
    } catch (error) {
      logger.error('检查订单状态失败:', error);
      throw error;
    }
  }

  /**
   * 分析是否需要修复
   */
  private static analyzeNeedsRepair(order: any, hasSubscription: boolean): boolean {
    // 如果订单已支付但没有订阅，需要修复
    if (order.status === 'paid' && !hasSubscription) {
      return true;
    }

    // 如果订单状态为processed但没有订阅，需要修复
    if (order.status === 'processed' && !hasSubscription) {
      return true;
    }

    // 如果订单有错误信息，可能需要修复
    if (order.error_message) {
      return true;
    }

    return false;
  }

  /**
   * 获取修复操作建议
   */
  private static getRepairActions(order: any, hasSubscription: boolean): string[] {
    const actions: string[] = [];

    if (order.status === 'paid' && !hasSubscription) {
      actions.push('重新执行权限发放');
    }

    if (order.status === 'processed' && !hasSubscription) {
      actions.push('检查权限发放日志');
      actions.push('手动创建订阅');
    }

    if (order.error_message) {
      actions.push('清除错误信息');
      actions.push('重试权限发放');
    }

    return actions;
  }

  /**
   * 修复订单权限问题
   */
  static async repairOrderPermissions(orderId: string): Promise<{
    success: boolean;
    message: string;
    subscriptionData?: any;
  }> {
    try {
      logger.info('开始修复订单权限:', { orderId });

      // 1. 检查当前状态
      const statusCheck = await this.checkOrderStatus(orderId);
      
      if (!statusCheck.needsRepair) {
        return {
          success: true,
          message: '订单状态正常，无需修复'
        };
      }

      // 2. 获取订单详情
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error(`获取订单失败: ${orderError?.message}`);
      }

      // 3. 执行权限发放
      const subscriptionData = await this.processOrderPermissions(order);

      logger.info('订单权限修复成功:', { 
        orderId, 
        userId: order.user_id,
        subscriptionType: subscriptionData.subscription_type
      });

      return {
        success: true,
        message: '权限修复成功',
        subscriptionData
      };
    } catch (error) {
      logger.error('修复订单权限失败:', error);
      return {
        success: false,
        message: `修复失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 处理订单权限开通（与后端逻辑保持一致）
   */
  private static async processOrderPermissions(order: any): Promise<any> {
    // 计算订阅到期时间
    const expiryDate = this.calculateExpiryDate(order.duration_type);
    
    // 检查用户是否已有相同类型的订阅
    const { data: existingSubscription, error: queryError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', order.user_id)
      .eq('subscription_type', order.product_type)
      .eq('status', 'active')
      .maybeSingle();

    if (queryError) {
      throw new Error(`查询现有订阅失败: ${queryError.message}`);
    }

    let subscriptionData;

    if (existingSubscription) {
      // 延长现有订阅
      const currentExpiry = new Date(existingSubscription.expires_at);
      const newExpiry = this.calculateExpiryDate(
        order.duration_type, 
        currentExpiry > new Date() ? currentExpiry : new Date()
      );
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString(),
          order_id: order.order_id
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (error) throw new Error(`延长订阅失败: ${error.message}`);
      subscriptionData = data;
      
      logger.info('订阅延长成功:', { 
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

      if (error) throw new Error(`创建订阅失败: ${error.message}`);
      subscriptionData = data;
      
      logger.info('新订阅创建成功:', { 
        userId: order.user_id, 
        subscriptionType: order.product_type,
        expiresAt: expiryDate.toISOString()
      });
    }

    // 标记订单为已处理
    const { error: processError } = await supabase
      .from('orders')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        error_message: null, // 清除错误信息
        retry_count: null,
        last_error_at: null
      })
      .eq('order_id', order.order_id);

    if (processError) {
      throw new Error(`标记订单为已处理失败: ${processError.message}`);
    }

    return subscriptionData;
  }

  /**
   * 计算订阅到期时间
   */
  private static calculateExpiryDate(durationType: string, baseDate?: Date): Date {
    const base = baseDate || new Date();
    const expiry = new Date(base);
    
    if (durationType === 'monthly') {
      expiry.setMonth(expiry.getMonth() + 1);
    } else if (durationType === 'yearly') {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      throw new Error(`不支持的订阅类型: ${durationType}`);
    }
    
    return expiry;
  }

  /**
   * 批量检查和修复订单
   */
  static async batchRepairOrders(orderIds: string[]): Promise<{
    total: number;
    repaired: number;
    failed: number;
    results: Array<{ orderId: string; success: boolean; message: string }>;
  }> {
    const results = [];
    let repaired = 0;
    let failed = 0;

    for (const orderId of orderIds) {
      try {
        const result = await this.repairOrderPermissions(orderId);
        results.push({ orderId, ...result });
        
        if (result.success) {
          repaired++;
        } else {
          failed++;
        }
      } catch (error) {
        results.push({
          orderId,
          success: false,
          message: `修复异常: ${error instanceof Error ? error.message : '未知错误'}`
        });
        failed++;
      }
    }

    return {
      total: orderIds.length,
      repaired,
      failed,
      results
    };
  }

  /**
   * 获取需要修复的订单列表
   */
  static async getOrdersNeedingRepair(): Promise<string[]> {
    try {
      // 查找已支付但未处理的订单
      const { data: paidOrders, error: paidError } = await supabase
        .from('orders')
        .select('order_id')
        .eq('status', 'paid')
        .lt('paid_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5分钟前支付的

      if (paidError) {
        logger.error('查询已支付订单失败:', paidError);
      }

      // 查找有错误信息的订单
      const { data: errorOrders, error: errorError } = await supabase
        .from('orders')
        .select('order_id')
        .not('error_message', 'is', null);

      if (errorError) {
        logger.error('查询错误订单失败:', errorError);
      }

      const orderIds = new Set<string>();
      
      paidOrders?.forEach(order => orderIds.add(order.order_id));
      errorOrders?.forEach(order => orderIds.add(order.order_id));

      return Array.from(orderIds);
    } catch (error) {
      logger.error('获取需要修复的订单失败:', error);
      return [];
    }
  }
}

export default OrderStatusService;
