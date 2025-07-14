/**
 * 支付服务
 * 处理支付相关的API调用和状态管理
 */

import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { securityUtils } from '@/lib/security';

/**
 * 支付方式类型
 */
export type PaymentMethod = 'alipay' | 'wechat' | 'card';

/**
 * 支付状态类型
 */
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

/**
 * 支付订单接口
 */
export interface PaymentOrder {
  orderId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  callbackUrl?: string;
  returnUrl?: string;
}

/**
 * 创建支付订单参数
 */
export interface CreateOrderParams {
  planId: string;
  period: 'monthly' | 'yearly';
  paymentMethod: PaymentMethod;
  userId: string;
  amount: number;
  currency?: string;
  returnUrl?: string;
}

/**
 * 支付回调数据
 */
export interface PaymentCallbackData {
  out_trade_no: string;
  trade_status: string;
  total_amount: string;
  user_id: string;
  plan_id: string;
  payment_method: string;
  platform: string;
  currency?: string;
  [key: string]: any;
}

/**
 * 支付服务类
 */
class PaymentService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
  }

  /**
   * 创建支付订单
   * @param params 订单参数
   * @returns Promise<PaymentOrder>
   */
  async createOrder(params: CreateOrderParams): Promise<PaymentOrder> {
    try {
      securityUtils.secureLog('创建支付订单', {
        planId: params.planId,
        amount: params.amount,
        paymentMethod: params.paymentMethod
      });

      const response = await axios.post(`${this.baseURL}/payment-create`, {
        planId: params.planId,
        period: params.period,
        paymentMethod: params.paymentMethod,
        userId: params.userId,
        amount: params.amount,
        currency: params.currency || 'CNY',
        returnUrl: params.returnUrl || window.location.origin + '/payment-success'
      });

      if (response.data.success) {
        securityUtils.secureLog('支付订单创建成功', {
          orderId: response.data.order.orderId
        });
        return response.data.order;
      } else {
        throw new Error(response.data.message || '创建订单失败');
      }
    } catch (error) {
      securityUtils.secureLog('创建支付订单失败', {
        error: error instanceof Error ? error.message : '未知错误'
      }, 'error');
      throw error;
    }
  }

  /**
   * 查询支付订单状态
   * @param orderId 订单ID
   * @returns Promise<PaymentOrder>
   */
  async getOrderStatus(orderId: string): Promise<PaymentOrder> {
    try {
      const response = await axios.get(`${this.baseURL}/payment-status`, {
        params: { orderId }
      });

      if (response.data.success) {
        return response.data.order;
      } else {
        throw new Error(response.data.message || '查询订单状态失败');
      }
    } catch (error) {
      securityUtils.secureLog('查询支付订单状态失败', {
        orderId,
        error: error instanceof Error ? error.message : '未知错误'
      }, 'error');
      throw error;
    }
  }

  /**
   * 取消支付订单
   * @param orderId 订单ID
   * @returns Promise<void>
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      securityUtils.secureLog('取消支付订单', { orderId });

      const response = await axios.post(`${this.baseURL}/payment-cancel`, {
        orderId
      });

      if (!response.data.success) {
        throw new Error(response.data.message || '取消订单失败');
      }

      securityUtils.secureLog('支付订单取消成功', { orderId });
    } catch (error) {
      securityUtils.secureLog('取消支付订单失败', {
        orderId,
        error: error instanceof Error ? error.message : '未知错误'
      }, 'error');
      throw error;
    }
  }

  /**
   * 获取支付二维码
   * @param orderId 订单ID
   * @param paymentMethod 支付方式
   * @returns Promise<{ qrCode: string; qrCodeUrl: string }>
   */
  async getPaymentQRCode(orderId: string, paymentMethod: PaymentMethod): Promise<{ qrCode: string; qrCodeUrl: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/payment-qrcode`, {
        orderId,
        paymentMethod
      });

      if (response.data.success) {
        return {
          qrCode: response.data.qrCode,
          qrCodeUrl: response.data.qrCodeUrl
        };
      } else {
        throw new Error(response.data.message || '获取支付二维码失败');
      }
    } catch (error) {
      securityUtils.secureLog('获取支付二维码失败', {
        orderId,
        paymentMethod,
        error: error instanceof Error ? error.message : '未知错误'
      }, 'error');
      throw error;
    }
  }

  /**
   * 验证支付回调
   * @param callbackData 回调数据
   * @returns Promise<boolean>
   */
  async verifyPaymentCallback(callbackData: PaymentCallbackData): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseURL}/payment-verify`, callbackData);

      return response.data.success;
    } catch (error) {
      securityUtils.secureLog('验证支付回调失败', {
        orderId: callbackData.out_trade_no,
        error: error instanceof Error ? error.message : '未知错误'
      }, 'error');
      return false;
    }
  }

  /**
   * 获取用户支付历史
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<{ orders: PaymentOrder[]; total: number }>
   */
  async getPaymentHistory(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: PaymentOrder[]; total: number }> {
    try {
      const response = await axios.get(`${this.baseURL}/payment-history`, {
        params: { userId, page, limit }
      });

      if (response.data.success) {
        return {
          orders: response.data.orders,
          total: response.data.total
        };
      } else {
        throw new Error(response.data.message || '获取支付历史失败');
      }
    } catch (error) {
      securityUtils.secureLog('获取支付历史失败', {
        userId,
        error: error instanceof Error ? error.message : '未知错误'
      }, 'error');
      throw error;
    }
  }

  /**
   * 检查支付状态（轮询）
   * @param orderId 订单ID
   * @param maxAttempts 最大尝试次数
   * @param interval 轮询间隔（毫秒）
   * @returns Promise<PaymentOrder>
   */
  async pollPaymentStatus(orderId: string, maxAttempts: number = 30, interval: number = 2000): Promise<PaymentOrder> {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const poll = async () => {
        try {
          attempts++;
          const order = await this.getOrderStatus(orderId);

          if (order.status === 'success') {
            securityUtils.secureLog('支付成功', { orderId });
            resolve(order);
            return;
          }

          if (order.status === 'failed' || order.status === 'cancelled') {
            securityUtils.secureLog('支付失败或取消', { orderId, status: order.status });
            reject(new Error(`支付${order.status === 'failed' ? '失败' : '已取消'}`));
            return;
          }

          if (attempts >= maxAttempts) {
            securityUtils.secureLog('支付状态轮询超时', { orderId, attempts });
            reject(new Error('支付状态查询超时'));
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
   * 格式化支付金额
   * @param amount 金额
   * @param currency 货币
   * @returns string
   */
  formatAmount(amount: number, currency: string = 'CNY'): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * 获取支付方式显示名称
   * @param method 支付方式
   * @returns string
   */
  getPaymentMethodName(method: PaymentMethod): string {
    const methodNames = {
      alipay: '支付宝',
      wechat: '微信支付',
      card: '银行卡'
    };
    return methodNames[method] || method;
  }

  /**
   * 获取支付状态显示名称
   * @param status 支付状态
   * @returns string
   */
  getPaymentStatusName(status: PaymentStatus): string {
    const statusNames = {
      pending: '待支付',
      success: '支付成功',
      failed: '支付失败',
      cancelled: '已取消'
    };
    return statusNames[status] || status;
  }
}

/**
 * 支付服务实例
 */
export const paymentService = new PaymentService();

/**
 * 支付Hook
 * @returns 支付相关的方法和状态
 */
export function usePayment() {
  const { toast } = useToast();

  /**
   * 创建支付订单
   */
  const createOrder = async (params: CreateOrderParams): Promise<PaymentOrder> => {
    try {
      const order = await paymentService.createOrder(params);
      
      toast({
        title: "订单创建成功",
        description: `订单号: ${order.orderId}`,
      });

      return order;
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建订单失败';
      
      toast({
        title: "创建订单失败",
        description: message,
        variant: "destructive"
      });

      throw error;
    }
  };

  /**
   * 轮询支付状态
   */
  const pollPaymentStatus = async (orderId: string): Promise<PaymentOrder> => {
    try {
      const order = await paymentService.pollPaymentStatus(orderId);
      
      toast({
        title: "支付成功",
        description: "您的订阅已激活，请刷新页面查看最新状态",
      });

      return order;
    } catch (error) {
      const message = error instanceof Error ? error.message : '支付状态查询失败';
      
      toast({
        title: "支付状态查询失败",
        description: message,
        variant: "destructive"
      });

      throw error;
    }
  };

  /**
   * 取消支付订单
   */
  const cancelOrder = async (orderId: string): Promise<void> => {
    try {
      await paymentService.cancelOrder(orderId);
      
      toast({
        title: "订单已取消",
        description: "支付订单已成功取消",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '取消订单失败';
      
      toast({
        title: "取消订单失败",
        description: message,
        variant: "destructive"
      });

      throw error;
    }
  };

  return {
    createOrder,
    pollPaymentStatus,
    cancelOrder,
    getOrderStatus: paymentService.getOrderStatus.bind(paymentService),
    getPaymentQRCode: paymentService.getPaymentQRCode.bind(paymentService),
    getPaymentHistory: paymentService.getPaymentHistory.bind(paymentService),
    formatAmount: paymentService.formatAmount.bind(paymentService),
    getPaymentMethodName: paymentService.getPaymentMethodName.bind(paymentService),
    getPaymentStatusName: paymentService.getPaymentStatusName.bind(paymentService)
  };
} 