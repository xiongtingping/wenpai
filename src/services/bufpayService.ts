/**
 * BufPay 支付服务
 */

import { PaymentRequest, PaymentResponse, BUFPAY_CONFIG } from '@/types/payment';
import { generatePaymentFormData, formatPaymentError } from '@/utils/paymentUtils';
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
      // 1. 创建订单记录
      logger.info('开始创建订单，请求参数:', {
        userId: request.userId,
        userEmail: request.userEmail,
        productName: request.productName,
        productType: request.productType,
        durationType: request.durationType,
        amount: request.amount,
        payType: request.payType
      });

      const { order, orderId } = await OrderService.createOrder({
        userId: request.userId,
        userEmail: request.userEmail,
        productName: request.productName,
        productType: request.productType,
        durationType: request.durationType,
        amount: request.amount,
        payType: request.payType
      });

      logger.info('开始创建支付订单:', { orderId, userId: request.userId });

      // 2. 调用 BufPay 接口
      const formData = generatePaymentFormData(
        request.productName,
        request.payType,
        request.amount,
        orderId,
        request.userId
      );

      const response = await fetch(BUFPAY_CONFIG.API_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // BufPay API 设计：返回 HTML 支付页面而非 JSON
      const contentType = response.headers.get('content-type');
      logger.info('BufPay API响应类型:', { contentType, orderId });

      // 检查是否返回HTML支付页面（BufPay的设计模式）
      if (contentType && contentType.includes('text/html')) {
        const htmlResponse = await response.text();
        logger.info('BufPay 返回HTML支付页面:', { 
          orderId, 
          htmlLength: htmlResponse.length,
          containsQR: htmlResponse.includes('qrcode')
        });

        // 构造模拟的PaymentResponse以适配现有接口
        const paymentResult: PaymentResponse = {
          status: 'ok',
          aoid: `bufpay_${orderId}_${Date.now()}`, // 生成临时支付ID
          htmlContent: htmlResponse, // 保存完整HTML内容
          // 如果需要，可以从HTML中提取QR码信息
          message: '支付页面已生成'
        };

        return {
          orderId,
          paymentInfo: paymentResult
        };
      }

      // 如果是JSON响应，使用原来的处理逻辑
      const paymentResult: PaymentResponse = await response.json();
      
      logger.info('BufPay 接口响应:', { orderId, status: paymentResult.status });

      // 3. 检查支付接口响应
      if (paymentResult.status !== 'ok') {
        const errorMessage = formatPaymentError(paymentResult.status, paymentResult.error);
        logger.error('支付接口返回错误:', { orderId, status: paymentResult.status, error: paymentResult.error });
        throw new Error(errorMessage);
      }

      // 4. 更新订单支付信息
      if (paymentResult.aoid) {
        const expiresAt = paymentResult.expires_in 
          ? new Date(Date.now() + paymentResult.expires_in * 1000).toISOString()
          : undefined;

        await OrderService.updateOrderPaymentInfo(orderId, {
          aoid: paymentResult.aoid,
          qr_code: paymentResult.qr,
          qr_image: paymentResult.qr_img,
          expires_at: expiresAt
        });
      }

      logger.info('支付订单创建成功:', { orderId, aoid: paymentResult.aoid });

      return {
        orderId,
        paymentInfo: paymentResult
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
      const response = await fetch(`${BUFPAY_CONFIG.QUERY_URL}/${aoid}`, {
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
  }> {
    try {
      const order = await OrderService.getOrderById(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      const isPaid = order.status === 'paid' || order.status === 'processed';
      
      let subscription = null;
      if (isPaid) {
        subscription = await OrderService.getUserSubscription(order.user_id);
      }

      return {
        order,
        isPaid,
        subscription
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
}
