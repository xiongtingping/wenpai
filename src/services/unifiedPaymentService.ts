/**
 * 统一支付服务
 * 整合旧版BufPayService和新版StandardBufPayService
 * 提供统一的支付入口,支持多provider
 */

import { logger } from '@/utils/logger';
import { BufPayService } from './bufpayService';
import { StandardBufPayService } from './standardBufpayService';
import { UnifiedOrderService } from './unifiedOrderService';
import type { PaymentRequest, PaymentResponse } from '@/types/payment';
import type { StandardPaymentRequest, StandardPaymentResponse } from './standardBufpayService';

/**
 * 支付提供商类型
 */
export type PaymentProvider = 'legacy' | 'standard';

/**
 * 统一支付请求
 */
export interface UnifiedPaymentRequest {
  userId: string;
  userEmail: string;
  productName: string;
  productType: 'professional' | 'premium';
  durationType: 'monthly' | 'yearly';
  amount: number;
  payType: 'alipay' | 'wechat';
  originalAmount?: number;
  discountAmount?: number;
  metadata?: Record<string, any>;
}

/**
 * 统一支付响应
 */
export interface UnifiedPaymentResponse {
  success: boolean;
  orderId: string;
  paymentUrl?: string;
  qrCode?: string;
  qrImage?: string;
  message: string;
  order?: any;
  provider: PaymentProvider;
  error?: string;
}

/**
 * 支付回调数据
 */
export interface PaymentCallbackData {
  orderId: string;
  aoid: string;
  payPrice: number;
  notifyData?: any;
  signature?: string;
}

/**
 * 支付回调响应
 */
export interface PaymentCallbackResponse {
  success: boolean;
  duplicate: boolean;
  subscriptionId?: number;
  message?: string;
  error?: string;
}

/**
 * 支付性能指标
 */
interface PerformanceMetric {
  action: string;
  provider: PaymentProvider;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

/**
 * 统一支付服务类
 */
export class UnifiedPaymentService {
  // 性能监控
  private static metrics: PerformanceMetric[] = [];
  private static readonly MAX_METRICS = 1000;

  /**
   * 获取当前使用的支付提供商
   */
  private static getProvider(): PaymentProvider {
    // 从环境变量读取,默认使用legacy
    const useStandard = import.meta.env.VITE_USE_STANDARD_PAYMENT === 'true';
    return useStandard ? 'standard' : 'legacy';
  }

  /**
   * 记录性能指标
   */
  private static recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    });

    // 限制数组大小
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  /**
   * 创建支付订单 - 统一入口
   */
  static async createPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    const provider = this.getProvider();
    const startTime = performance.now();

    logger.info('创建支付订单:', {
      provider,
      userId: request.userId,
      productType: request.productType,
      durationType: request.durationType,
      amount: request.amount
    });

    try {
      let result: UnifiedPaymentResponse;

      if (provider === 'standard') {
        // 使用标准支付流程
        const standardRequest: StandardPaymentRequest = {
          userId: request.userId,
          userEmail: request.userEmail,
          productName: request.productName,
          productType: request.productType,
          durationType: request.durationType,
          amount: request.amount,
          payType: request.payType,
          originalAmount: request.originalAmount,
          discountAmount: request.discountAmount
        };

        const response = await StandardBufPayService.createPayment(standardRequest);

        result = {
          success: response.success,
          orderId: response.orderId,
          paymentUrl: response.paymentUrl,
          qrCode: response.qrCode,
          message: response.message,
          order: response.order,
          provider: 'standard',
          error: response.success ? undefined : response.message
        };
      } else {
        // 使用旧版支付流程
        const legacyRequest: PaymentRequest = {
          userId: request.userId,
          userEmail: request.userEmail,
          productName: request.productName,
          productType: request.productType,
          durationType: request.durationType,
          amount: request.amount,
          payType: request.payType
        };

        const response = await BufPayService.createPayment(legacyRequest);

        result = {
          success: true,
          orderId: response.orderId,
          qrCode: response.paymentInfo.qr || undefined,
          qrImage: response.paymentInfo.qr_img || undefined,
          message: '支付订单创建成功',
          order: response.paymentInfo,
          provider: 'legacy'
        };
      }

      // 记录成功指标
      this.recordMetric({
        action: 'createPayment',
        provider,
        duration: performance.now() - startTime,
        success: true
      });

      logger.info('支付订单创建成功:', {
        provider,
        orderId: result.orderId,
        duration: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      return result;
    } catch (error) {
      // 记录失败指标
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.recordMetric({
        action: 'createPayment',
        provider,
        duration: performance.now() - startTime,
        success: false,
        error: errorMessage
      });

      logger.error('支付订单创建失败:', {
        provider,
        error,
        duration: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      return {
        success: false,
        orderId: '',
        message: '支付订单创建失败',
        provider,
        error: errorMessage
      };
    }
  }

  /**
   * 处理支付回调 - 统一入口
   */
  static async handleCallback(data: PaymentCallbackData): Promise<PaymentCallbackResponse> {
    const provider = this.getProvider();
    const startTime = performance.now();

    logger.info('处理支付回调:', {
      provider,
      orderId: data.orderId,
      aoid: data.aoid
    });

    try {
      // 使用UnifiedOrderService处理回调(带幂等性保证)
      const result = await UnifiedOrderService.processPaymentCallback(
        data.orderId,
        {
          aoid: data.aoid,
          payPrice: data.payPrice,
          notifyData: data.notifyData
        }
      );

      // 记录成功指标
      this.recordMetric({
        action: 'handleCallback',
        provider,
        duration: performance.now() - startTime,
        success: result.success
      });

      if (result.success) {
        logger.info('支付回调处理成功:', {
          provider,
          orderId: data.orderId,
          duplicate: result.duplicate,
          subscriptionId: result.subscriptionId,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`
        });
      } else {
        logger.error('支付回调处理失败:', {
          provider,
          orderId: data.orderId,
          error: result.error,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`
        });
      }

      return {
        success: result.success,
        duplicate: result.duplicate,
        subscriptionId: result.subscriptionId,
        message: result.duplicate ? '重复的回调' : '回调处理成功',
        error: result.error
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      // 记录失败指标
      this.recordMetric({
        action: 'handleCallback',
        provider,
        duration: performance.now() - startTime,
        success: false,
        error: errorMessage
      });

      logger.error('支付回调处理异常:', {
        provider,
        orderId: data.orderId,
        error,
        duration: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      return {
        success: false,
        duplicate: false,
        error: errorMessage
      };
    }
  }

  /**
   * 查询订单状态
   */
  static async queryOrderStatus(orderId: string): Promise<{
    success: boolean;
    order?: any;
    error?: string;
  }> {
    const provider = this.getProvider();
    const startTime = performance.now();

    try {
      const order = await UnifiedOrderService.getOrder(orderId);

      this.recordMetric({
        action: 'queryOrderStatus',
        provider,
        duration: performance.now() - startTime,
        success: !!order
      });

      if (!order) {
        return {
          success: false,
          error: '订单不存在'
        };
      }

      return {
        success: true,
        order
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      this.recordMetric({
        action: 'queryOrderStatus',
        provider,
        duration: performance.now() - startTime,
        success: false,
        error: errorMessage
      });

      logger.error('查询订单状态失败:', { orderId, error });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 取消订单
   */
  static async cancelOrder(orderId: string, reason?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const provider = this.getProvider();
    const startTime = performance.now();

    try {
      await UnifiedOrderService.cancelOrder(orderId, reason);

      this.recordMetric({
        action: 'cancelOrder',
        provider,
        duration: performance.now() - startTime,
        success: true
      });

      logger.info('订单取消成功:', { orderId, reason });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      this.recordMetric({
        action: 'cancelOrder',
        provider,
        duration: performance.now() - startTime,
        success: false,
        error: errorMessage
      });

      logger.error('订单取消失败:', { orderId, error });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 获取性能统计
   */
  static getPerformanceStats(): {
    action: string;
    provider: PaymentProvider;
    count: number;
    successRate: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
  }[] {
    // 按action和provider分组
    const grouped = this.metrics.reduce((acc, metric) => {
      const key = `${metric.action}:${metric.provider}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    // 计算统计数据
    return Object.entries(grouped).map(([key, metrics]) => {
      const [action, provider] = key.split(':') as [string, PaymentProvider];
      const successCount = metrics.filter(m => m.success).length;
      const durations = metrics.map(m => m.duration).sort((a, b) => a - b);

      return {
        action,
        provider,
        count: metrics.length,
        successRate: (successCount / metrics.length) * 100,
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        p95Duration: durations[Math.floor(durations.length * 0.95)] || 0,
        p99Duration: durations[Math.floor(durations.length * 0.99)] || 0
      };
    });
  }

  /**
   * 清除性能指标
   */
  static clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * 输出性能报告
   */
  static logPerformanceReport(): void {
    const stats = this.getPerformanceStats();

    if (stats.length === 0) {
      logger.info('暂无性能数据');
      return;
    }

    logger.info('支付服务性能报告:', {
      totalMetrics: this.metrics.length,
      stats: stats.map(s => ({
        action: s.action,
        provider: s.provider,
        count: s.count,
        successRate: `${s.successRate.toFixed(2)}%`,
        avgDuration: `${s.avgDuration.toFixed(2)}ms`,
        p95Duration: `${s.p95Duration.toFixed(2)}ms`,
        p99Duration: `${s.p99Duration.toFixed(2)}ms`
      }))
    });
  }
}

export default UnifiedPaymentService;
