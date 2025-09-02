/**
 * 标准化 BufPay 支付服务
 * 支持标准的支付流程：notify_url + return_url
 */

import { logger } from '@/utils/logger';
import { StandardOrderService, type CreateOrderParams } from '@/services/standardOrderService';

export interface StandardPaymentRequest {
  userId: string;
  userEmail: string;
  productName: string;
  productType: 'professional' | 'premium';
  durationType: 'monthly' | 'yearly';
  amount: number; // 以分为单位
  payType: 'alipay' | 'wechat';
  originalAmount?: number;
  discountAmount?: number;
}

export interface StandardPaymentResponse {
  success: boolean;
  orderId: string;
  paymentUrl?: string;
  qrCode?: string;
  message: string;
  order?: any;
}

export class StandardBufPayService {
  private static readonly API_BASE_URL = 'https://api.bufpay.com';
  private static readonly MERCHANT_ID = import.meta.env.VITE_BUFPAY_MERCHANT_ID;
  private static readonly SECRET_KEY = import.meta.env.VITE_BUFPAY_SECRET_KEY;
  
  // 回调地址配置
  private static readonly NOTIFY_URL = `${window.location.origin}/.netlify/functions/payment-notify`;
  private static readonly RETURN_URL = `${window.location.origin}/payment/result`;

  /**
   * 创建支付订单
   */
  static async createPayment(params: StandardPaymentRequest): Promise<StandardPaymentResponse> {
    try {
      logger.info('开始创建标准支付订单:', params);

      // 1. 先在数据库中创建订单
      const orderParams: CreateOrderParams = {
        userId: params.userId,
        userEmail: params.userEmail,
        productName: params.productName,
        productType: params.productType,
        durationType: params.durationType,
        amount: params.amount,
        originalAmount: params.originalAmount,
        discountAmount: params.discountAmount,
        payType: params.payType,
        metadata: {
          created_by: 'standard_bufpay_service',
          user_agent: navigator.userAgent,
          timestamp: Date.now()
        }
      };

      const order = await StandardOrderService.createOrder(orderParams);
      logger.info('数据库订单创建成功:', order.order_id);

      // 2. 调用 BufPay API 创建支付
      const bufpayParams = {
        merchant_id: this.MERCHANT_ID,
        out_trade_no: order.order_id,
        total_amount: params.amount,
        subject: params.productName,
        body: `${params.productName} - ${params.durationType === 'yearly' ? '年付' : '月付'}`,
        pay_type: params.payType,
        notify_url: this.NOTIFY_URL,
        return_url: `${this.RETURN_URL}?order_id=${order.order_id}`,
        timestamp: Math.floor(Date.now() / 1000)
      };

      // 生成签名
      const sign = this.generateSign(bufpayParams);
      const requestData = { ...bufpayParams, sign };

      logger.info('调用 BufPay API:', {
        url: `${this.API_BASE_URL}/pay/create`,
        orderId: order.order_id,
        amount: params.amount,
        payType: params.payType
      });

      const response = await fetch(`${this.API_BASE_URL}/pay/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WenPai/1.0'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`BufPay API 请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      logger.info('BufPay API 响应:', result);

      if (result.code !== 200) {
        throw new Error(`BufPay 创建支付失败: ${result.message || '未知错误'}`);
      }

      // 3. 更新订单的支付平台订单号
      if (result.data?.trade_no) {
        try {
          await this.updateOrderPlatformId(order.order_id, result.data.trade_no);
        } catch (error) {
          logger.warn('更新订单平台ID失败:', error);
        }
      }

      return {
        success: true,
        orderId: order.order_id,
        paymentUrl: result.data?.pay_url,
        qrCode: result.data?.qr_code,
        message: '支付订单创建成功',
        order
      };

    } catch (error) {
      logger.error('创建标准支付订单失败:', error);
      
      return {
        success: false,
        orderId: '',
        message: error instanceof Error ? error.message : '创建支付订单失败'
      };
    }
  }

  /**
   * 查询支付状态
   */
  static async queryPayment(orderId: string): Promise<{
    success: boolean;
    status: string;
    message: string;
    data?: any;
  }> {
    try {
      const params = {
        merchant_id: this.MERCHANT_ID,
        out_trade_no: orderId,
        timestamp: Math.floor(Date.now() / 1000)
      };

      const sign = this.generateSign(params);
      const requestData = { ...params, sign };

      const response = await fetch(`${this.API_BASE_URL}/pay/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`查询支付状态失败: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: result.code === 200,
        status: result.data?.status || 'unknown',
        message: result.message || '查询成功',
        data: result.data
      };

    } catch (error) {
      logger.error('查询支付状态失败:', error);
      return {
        success: false,
        status: 'error',
        message: error instanceof Error ? error.message : '查询失败'
      };
    }
  }

  /**
   * 生成签名
   */
  private static generateSign(params: Record<string, any>): string {
    try {
      // 排序参数
      const sortedKeys = Object.keys(params)
        .filter(key => params[key] !== '' && params[key] !== null && params[key] !== undefined)
        .sort();

      // 构建签名字符串
      const signString = sortedKeys
        .map(key => `${key}=${params[key]}`)
        .join('&') + `&key=${this.SECRET_KEY}`;

      // 使用 MD5 生成签名（这里需要引入 MD5 库或使用其他方式）
      // 暂时返回一个占位符，实际使用时需要实现 MD5 签名
      logger.info('签名字符串:', signString);
      
      // 这里应该使用真实的 MD5 签名
      return this.md5(signString).toUpperCase();
    } catch (error) {
      logger.error('生成签名失败:', error);
      throw error;
    }
  }

  /**
   * MD5 签名实现（简化版，实际使用时应该使用专业的加密库）
   */
  private static md5(str: string): string {
    // 这里应该使用真实的 MD5 实现
    // 可以使用 crypto-js 或其他加密库
    // 暂时返回一个占位符
    return 'placeholder_md5_hash';
  }

  /**
   * 更新订单的支付平台订单号
   */
  private static async updateOrderPlatformId(orderId: string, platformOrderId: string): Promise<void> {
    try {
      // 这里需要调用 Supabase 更新订单
      // 由于我们在前端，可能需要通过 API 或直接使用 Supabase 客户端
      logger.info('更新订单平台ID:', { orderId, platformOrderId });
      
      // 实际实现需要调用 Supabase
      // await supabase.from('orders').update({ platform_order_id: platformOrderId }).eq('order_id', orderId);
    } catch (error) {
      logger.error('更新订单平台ID失败:', error);
      throw error;
    }
  }

  /**
   * 验证回调签名
   */
  static verifyNotifySign(params: Record<string, any>, sign: string): boolean {
    try {
      const expectedSign = this.generateSign(params);
      return expectedSign === sign;
    } catch (error) {
      logger.error('验证回调签名失败:', error);
      return false;
    }
  }

  /**
   * 获取支付方式显示名称
   */
  static getPayTypeDisplayName(payType: string): string {
    switch (payType) {
      case 'alipay':
        return '支付宝';
      case 'wechat':
        return '微信支付';
      default:
        return payType;
    }
  }

  /**
   * 格式化金额显示
   */
  static formatAmount(amount: number): string {
    return (amount / 100).toFixed(2);
  }

  /**
   * 检查支付环境
   */
  static checkPaymentEnvironment(): {
    isValid: boolean;
    message: string;
  } {
    if (!this.MERCHANT_ID) {
      return {
        isValid: false,
        message: '缺少商户ID配置'
      };
    }

    if (!this.SECRET_KEY) {
      return {
        isValid: false,
        message: '缺少密钥配置'
      };
    }

    return {
      isValid: true,
      message: '支付环境配置正常'
    };
  }
}

export default StandardBufPayService;
