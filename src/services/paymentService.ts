/**
 * 支付服务
 * 处理支付相关的API调用和业务逻辑
 */

import { securityUtils } from '@/lib/security';

export interface PaymentOrder {
  id: string;
  userId: string;
  planId: string;
  planTier: string;
  planPeriod: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentMethod: string;
  paymentData: any;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface UpgradeMembershipRequest {
  planTier: string;
  planPeriod: string;
  paymentData: any;
}

export interface UpgradeMembershipResponse {
  success: boolean;
  subscription: any;
  message?: string;
  error?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private apiBaseUrl: string;

  private constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * 创建支付订单
   */
  async createPaymentOrder(
    userId: string,
    planId: string,
    amount: number,
    paymentMethod: string = 'alipay'
  ): Promise<PaymentOrder> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          userId,
          planId,
          amount,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('创建支付订单失败');
      }

      const order = await response.json();
      securityUtils.secureLog('支付订单创建成功', { orderId: order.id, amount });
      return order;
    } catch (error: any) {
      securityUtils.secureLog('创建支付订单失败', { error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * 验证支付结果
   */
  async verifyPayment(orderId: string, paymentData: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          orderId,
          paymentData,
        }),
      });

      if (!response.ok) {
        throw new Error('验证支付失败');
      }

      const result = await response.json();
      securityUtils.secureLog('支付验证结果', { orderId, success: result.success });
      return result.success;
    } catch (error: any) {
      securityUtils.secureLog('验证支付失败', { orderId, error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * 升级用户会员
   */
  async upgradeMembership(request: UpgradeMembershipRequest): Promise<UpgradeMembershipResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/upgrade-membership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '升级会员失败');
      }

      const result = await response.json();
      securityUtils.secureLog('会员升级成功', { 
        planTier: request.planTier, 
        planPeriod: request.planPeriod 
      });
      
      return {
        success: true,
        subscription: result.subscription,
        message: '会员升级成功',
      };
    } catch (error: any) {
      securityUtils.secureLog('升级会员失败', { 
        planTier: request.planTier, 
        error: error.message 
      }, 'error');
      
      return {
        success: false,
        subscription: null,
        error: error.message,
        message: '升级会员失败',
      };
    }
  }

  /**
   * 获取支付订单状态
   */
  async getPaymentOrderStatus(orderId: string): Promise<PaymentOrder> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取订单状态失败');
      }

      const order = await response.json();
      return order;
    } catch (error: any) {
      securityUtils.secureLog('获取订单状态失败', { orderId, error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * 获取用户支付历史
   */
  async getUserPaymentHistory(userId: string, limit: number = 10): Promise<PaymentOrder[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment/history?userId=${userId}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取支付历史失败');
      }

      const history = await response.json();
      return history;
    } catch (error: any) {
      securityUtils.secureLog('获取支付历史失败', { userId, error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * 处理支付成功回调
   */
  async handlePaymentSuccess(orderId: string, paymentData: any): Promise<void> {
    try {
      // 1. 验证支付
      const isPaymentValid = await this.verifyPayment(orderId, paymentData);
      if (!isPaymentValid) {
        throw new Error('支付验证失败');
      }

      // 2. 获取订单信息
      const order = await this.getPaymentOrderStatus(orderId);
      
      // 3. 升级会员
      await this.upgradeMembership({
        planTier: order.planTier,
        planPeriod: order.planPeriod,
        paymentData: paymentData,
      });

      securityUtils.secureLog('支付成功处理完成', { orderId });
    } catch (error: any) {
      securityUtils.secureLog('处理支付成功失败', { orderId, error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * 获取认证Token
   */
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || 
           localStorage.getItem('authing_token') || 
           '';
  }

  /**
   * 模拟支付成功处理（用于测试）
   */
  async simulatePaymentSuccess(paymentData: any): Promise<UpgradeMembershipResponse> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 解析支付数据，确定套餐
    const planInfo = this.parsePlanFromPayment(paymentData);
    
    // 模拟升级成功
    const subscription = {
      id: `sub_${Date.now()}`,
      userId: paymentData.userId || 'user_123',
      planTier: planInfo.tier,
      planPeriod: planInfo.period,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: this.calculateEndDate(planInfo.period),
      features: this.getPlanFeatures(planInfo.tier),
    };

    securityUtils.secureLog('模拟支付成功', { planInfo, subscription });
    
    return {
      success: true,
      subscription,
      message: '会员升级成功',
    };
  }

  /**
   * 解析支付数据，确定套餐
   */
  private parsePlanFromPayment(paymentData: any) {
    const productId = paymentData.productId;
    const amount = paymentData.amount;

    // 根据产品ID确定套餐
    if (productId.includes('pro') && productId.includes('monthly')) {
      return { tier: 'pro', name: '专业版', period: 'monthly' };
    } else if (productId.includes('pro') && productId.includes('yearly')) {
      return { tier: 'pro', name: '专业版', period: 'yearly' };
    } else if (productId.includes('premium') && productId.includes('monthly')) {
      return { tier: 'premium', name: '高级版', period: 'monthly' };
    } else if (productId.includes('premium') && productId.includes('yearly')) {
      return { tier: 'premium', name: '高级版', period: 'yearly' };
    }

    // 根据金额判断（备用方案）
    const amountInYuan = amount / 100;
    if (amountInYuan >= 99) {
      return { tier: 'premium', name: '高级版', period: 'yearly' };
    } else if (amountInYuan >= 29) {
      return { tier: 'pro', name: '专业版', period: 'monthly' };
    }

    return { tier: 'pro', name: '专业版', period: 'monthly' };
  }

  /**
   * 计算套餐结束日期
   */
  private calculateEndDate(period: string): string {
    const now = new Date();
    if (period === 'yearly') {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 1);
    }
    return now.toISOString();
  }

  /**
   * 获取套餐功能列表
   */
  private getPlanFeatures(tier: string): string[] {
    const baseFeatures = ['基础功能', '客服支持'];
    
    if (tier === 'pro') {
      return [...baseFeatures, '高级功能', '优先客服', '数据分析'];
    } else if (tier === 'premium') {
      return [...baseFeatures, '高级功能', '优先客服', '数据分析', '专属功能', '一对一服务'];
    }
    
    return baseFeatures;
  }
}

// 导出单例实例
export const paymentService = PaymentService.getInstance(); 