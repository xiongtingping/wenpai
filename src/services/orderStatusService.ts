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

      // 调用后端 API 修复权限
      const response = await fetch('/.netlify/functions/repair-order-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      
      logger.info('订单权限修复成功:', { 
        orderId, 
        success: result.success,
        message: result.message
      });

      return result;
    } catch (error) {
      logger.error('修复订单权限失败:', error);
      return {
        success: false,
        message: `修复失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
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
