/**
 * 支付服务
 * 处理支付相关的API调用和业务逻辑
 */

import i18n from '@/i18n';
import { securityUtils } from '@/lib/security';
import request from '@/api/request';

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

/**
 * 🔧 FIXED: 移除单例模式，改为依赖注入管理
 */
export class PaymentService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
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
      const order = await request.post(`${this.apiBaseUrl}/payment/create-order`, {
        userId,
        planId,
        amount,
        paymentMethod,
      }, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
      securityUtils.secureLog('支付订单创建成功', { orderId: order.id, amount });
      return order;
    } catch (error: any) {
      securityUtils.secureLog(i18n.t('common.errors.创建支付订单失败'), { error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * 验证支付结果
   */
  async verifyPayment(orderId: string, paymentData: any): Promise<boolean> {
    try {
      const result = await request.post(`${this.apiBaseUrl}/payment/verify`, {
        orderId,
        paymentData,
      }, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
      securityUtils.secureLog('支付验证结果', { orderId, success: result.success });
      return result.success;
    } catch (error: any) {
      securityUtils.secureLog(i18n.t('common.errors.验证支付失败'), { orderId, error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * 升级用户会员
   */
  async upgradeMembership(payload: UpgradeMembershipRequest): Promise<UpgradeMembershipResponse> {
    try {
      const result = await request.post(`${this.apiBaseUrl}/user/upgrade-membership`, payload, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
      securityUtils.secureLog(i18n.t('common.messages.会员升级成功'), {
        planTier: payload.planTier,
        planPeriod: payload.planPeriod
      });
      
      return {
        success: true,
        subscription: result.subscription,
        message: i18n.t('common.messages.会员升级成功'),
      };
    } catch (error: any) {
      securityUtils.secureLog(i18n.t('common.messages.升级会员失败'), {
        planTier: payload.planTier,
        error: error.message
      }, 'error');
      
      return {
        success: false,
        subscription: null,
        error: error.message,
        message: i18n.t('common.messages.升级会员失败'),
      };
    }
  }

  /**
   * 获取支付订单状态
   */
  async getPaymentOrderStatus(orderId: string): Promise<PaymentOrder> {
    try {
      const order = await request.get(`${this.apiBaseUrl}/payment/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
      return order;
    } catch (error: any) {
      securityUtils.secureLog(i18n.t('common.errors.获取订单状态失败'), { orderId, error: error.message }, 'error');
      throw error;
    }
  }

  /**
   * 获取用户支付历史
   */
  async getUserPaymentHistory(userId: string, limit: number = 10): Promise<PaymentOrder[]> {
    if (!userId || userId === 'undefined') {
      throw new Error('用户ID不能为空');
    }

    try {
      const history = await request.get(`${this.apiBaseUrl}/payment/history?userId=${userId}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });
      return history;
    } catch (error: any) {
      securityUtils.secureLog(i18n.t('common.errors.获取支付历史失败'), { userId, error: error.message }, 'error');
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
        throw new Error(i18n.t('common.errors.支付验证失败'));
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
      securityUtils.secureLog(i18n.t('common.errors.处理支付成功失败'), { orderId, error: error.message }, 'error');
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

  // ✅ FIXED: 已移除模拟支付功能
  // 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
  // 
  // 
  // 系统现在直接调用真实支付API，不再提供模拟支付
  async simulatePaymentSuccess(paymentData: any): Promise<never> {
    throw new Error('支付API调用失败，请检查网络连接和支付配置');
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
    if (amountInYuan >= 788) {
      return { tier: 'premium', name: '高级版', period: 'yearly' };
    } else if (amountInYuan >= 288) {
      return { tier: 'pro', name: '专业版', period: 'yearly' };
    } else if (amountInYuan >= 79) {
      return { tier: 'premium', name: '高级版', period: 'monthly' };
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
// 🔧 FIXED: 移除getInstance调用，改为通过DI容器获取
// export const paymentService = PaymentService.getInstance();

// 临时兼容性导出，建议使用DI容器获取服务
export const paymentService = new PaymentService();
