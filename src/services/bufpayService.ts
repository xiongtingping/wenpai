/**
 * BufPay 支付服务
 */

import { PaymentRequest, PaymentResponse, BUFPAY_CONFIG } from '@/types/payment';
import { OrderService } from './orderService';
import { logger } from '@/utils/logger';

export class BufPayService {
  /**
   * 创建支付订单
   */
  static async createPayment(request: PaymentRequest): Promise<{
    orderId: string;
    paymentInfo: PaymentResponse;
  }> {
    try {
      logger.info('开始创建订单，请求参数:', {
        userId: request.userId,
        userEmail: request.userEmail,
        productName: request.productName,
        productType: request.productType,
        durationType: request.durationType,
        amount: request.amount,
        payType: request.payType
      });

      // 使用统一的create-order接口
      const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:8888' : '';
      const response = await fetch(`${apiBaseUrl}/.netlify/functions/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // create-order函数返回JSON响应
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '创建订单失败');
      }

      logger.info('支付订单创建成功:', { 
        orderId: result.orderId, 
        paymentInfo: result.paymentInfo 
      });

      return {
        orderId: result.orderId,
        paymentInfo: result.paymentInfo
      };
    } catch (error) {
      logger.error('创建支付订单失败:', error);
      throw error;
    }
  }

  /**
   * 查询支付状态
   */
  static async queryPaymentStatus(aoid: string): Promise<{
    status: string;
    message: string;
  }> {
    try {
      const response = await fetch(`${BUFPAY_CONFIG.QUERY_URL}?query=${aoid}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      const statusMap: Record<string, string> = {
        'not_exist': '订单不存在',
        'new': '等待支付',
        'payed': '支付成功，处理中',
        'success': '支付成功',
        'fee_error': '余额不足',
        'expire': '订单已过期'
      };

      return {
        status: result.status,
        message: statusMap[result.status] || '未知状态'
      };
    } catch (error) {
      logger.error('查询支付状态失败:', error);
      throw error;
    }
  }

  /**
   * 处理支付回调
   */
  static async handlePaymentNotify(notifyData: {
    aoid: string;
    order_id: string;
    order_uid: string;
    price: string;
    pay_price: string;
    sign: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('收到支付回调:', { orderId: notifyData.order_id, aoid: notifyData.aoid });

      // 1. 验证签名
      const { verifyNotifySign } = await import('@/utils/paymentUtils');
      const isValidSign = verifyNotifySign(
        notifyData.aoid,
        notifyData.order_id,
        notifyData.order_uid,
        notifyData.price,
        notifyData.pay_price,
        notifyData.sign
      );

      if (!isValidSign) {
        logger.error('支付回调签名验证失败:', notifyData);
        return { success: false, message: '签名验证失败' };
      }

      // 2. 查询订单
      const order = await OrderService.getOrderById(notifyData.order_id);
      if (!order) {
        logger.error('订单不存在:', { orderId: notifyData.order_id });
        return { success: false, message: '订单不存在' };
      }

      // 3. 检查订单状态
      if (order.status === 'paid' || order.status === 'processed') {
        logger.info('订单已处理，跳过:', { orderId: notifyData.order_id, status: order.status });
        return { success: true, message: '订单已处理' };
      }

      // 4. 更新订单为已支付
      const updatedOrder = await OrderService.markOrderAsPaid(notifyData.order_id, {
        aoid: notifyData.aoid,
        payPrice: parseFloat(notifyData.pay_price)
      });

      // 5. 处理权限开通
      await OrderService.processOrderPermissions(updatedOrder);

      logger.info('支付回调处理成功:', { 
        orderId: notifyData.order_id, 
        userId: order.user_id,
        productType: order.product_type,
        durationType: order.duration_type
      });

      return { success: true, message: '处理成功' };
    } catch (error) {
      logger.error('处理支付回调失败:', error);
      return { success: false, message: '处理失败' };
    }
  }

  /**
   * 检查订单支付状态
   */
  static async checkOrderStatus(orderId: string): Promise<{
    order: any;
    isPaid: boolean;
    subscription?: any;
    needsRepair?: boolean;
  }> {
    try {
      logger.info('检查订单状态:', { orderId });

      const order = await OrderService.getOrderById(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      const isPaid = order.status === 'paid' || order.status === 'processed';

      let subscription = null;
      let needsRepair = false;

      if (isPaid) {
        // 获取用户订阅，但要检查是否与当前订单关联
        subscription = await OrderService.getUserSubscriptionByOrderId(orderId);

        // 如果没有找到与订单关联的订阅，检查是否需要修复
        if (!subscription && (order.status === 'paid' || order.status === 'processed')) {
          needsRepair = true;
          logger.warn('检测到需要修复的订单:', {
            orderId,
            status: order.status,
            hasSubscription: false
          });

          // 尝试自动修复
          try {
            const { OrderStatusService } = await import('./orderStatusService');
            const repairResult = await OrderStatusService.repairOrderPermissions(orderId);

            if (repairResult.success) {
              logger.info('订单权限自动修复成功:', { orderId });
              subscription = repairResult.subscriptionData;
              needsRepair = false;
            } else {
              logger.error('订单权限自动修复失败:', repairResult.message);
            }
          } catch (repairError) {
            logger.error('自动修复过程中出错:', repairError);
          }
        }
      }

      logger.info('订单状态检查结果:', {
        orderId,
        status: order.status,
        isPaid,
        hasSubscription: !!subscription,
        needsRepair
      });

      return {
        order,
        isPaid,
        subscription,
        needsRepair
      };
    } catch (error) {
      logger.error('检查订单状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户当前订阅状态
   */
  static async getUserSubscriptionStatus(userId: string): Promise<{
    hasSubscription: boolean;
    subscriptionType?: 'professional' | 'premium';
    expiresAt?: string;
    isExpired?: boolean;
  }> {
    try {
      const subscription = await OrderService.getUserSubscription(userId);
      
      if (!subscription) {
        return { hasSubscription: false };
      }

      const isExpired = new Date(subscription.expires_at) <= new Date();
      
      return {
        hasSubscription: true,
        subscriptionType: subscription.subscription_type,
        expiresAt: subscription.expires_at,
        isExpired
      };
    } catch (error) {
      logger.error('获取用户订阅状态失败:', error);
      throw error;
    }
  }

  /**
   * 查询 BufPay 支付状态
   * 接口地址：https://bufpay.com/api/query/aoid
   * 返回状态：not_exist, new, payed, success, fee_error, expire
   */
  static async queryBufPayStatus(aoid: string): Promise<string | null> {
    try {
      // 方法1: 通过配置的代理路由查询  
      const proxyUrl = `/.netlify/functions/bufpay-proxy?query=${aoid}`;
      logger.info('查询 BufPay 状态:', { aoid, proxyUrl });

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 检查响应是否为 JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 如果不是 JSON，可能是 HTML 错误页面，尝试直接调用
        logger.warn('代理返回非JSON响应，尝试直接查询');
        return await this.queryBufPayDirectly(aoid);
      }

      const result = await response.json();
      logger.info('BufPay 查询响应:', { aoid, result });

      return result.status || null;
    } catch (error) {
      logger.error('查询 BufPay 状态失败:', error);
      // 降级到直接查询
      try {
        logger.info('尝试直接查询 BufPay...');
        return await this.queryBufPayDirectly(aoid);
      } catch (fallbackError) {
        logger.error('直接查询也失败:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * 直接查询 BufPay 接口（降级方案）
   */
  private static async queryBufPayDirectly(aoid: string): Promise<string | null> {
    try {
      const queryUrl = `https://bufpay.com/api/query/${aoid}`;
      
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'WenPai/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.status || null;
    } catch (error) {
      logger.error('直接查询 BufPay 失败:', error);
      throw error;
    }
  }

}
