/**
 * 支付系统单元测试
 * 🧪 测试覆盖：支付流程、安全验证、错误处理
 */

// @ts-nocheck - 测试文件，允许类型检查宽松
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { BufPayService } from '@/services/bufpayService';
import { OrderService } from '@/services/orderService';
import { 
  generateOrderId, 
  formatAmount, 
  calculateExpiryDate,
  isSubscriptionValid,
  formatPaymentError 
} from '@/utils/paymentUtils';
import { PRICING_PLANS, PAYMENT_STATUS_MAP } from '@/types/payment';

// Mock dependencies
jest.mock('@/config/supabase');
jest.mock('@/utils/logger');
jest.mock('@/i18n');

describe('支付系统测试套件', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('支付工具函数测试', () => {
    describe('generateOrderId', () => {
      it('应该生成正确格式的订单号', () => {
        const orderId = generateOrderId();
        expect(orderId).toMatch(/^WP\d+\d{4}$/);
        expect(orderId.length).toBeGreaterThanOrEqual(17); // WP + 13位时间戳 + 4位随机数
      });

      it('每次生成的订单号应该不同', () => {
        const orderId1 = generateOrderId();
        const orderId2 = generateOrderId();
        expect(orderId1).not.toBe(orderId2);
      });
    });

    describe('formatAmount', () => {
      it('应该正确格式化金额', () => {
        expect(formatAmount(29)).toBe('29.00');
        expect(formatAmount(29.9)).toBe('29.90');
        expect(formatAmount(299.99)).toBe('299.99');
        expect(formatAmount(0)).toBe('0.00');
      });
    });

    describe('calculateExpiryDate', () => {
      it('应该正确计算月度订阅到期时间', () => {
        const startDate = new Date('2024-01-01');
        const expiryDate = calculateExpiryDate('monthly', startDate);
        expect(expiryDate.getMonth()).toBe(1); // 2月
        expect(expiryDate.getFullYear()).toBe(2024);
      });

      it('应该正确计算年度订阅到期时间', () => {
        const startDate = new Date('2024-01-01');
        const expiryDate = calculateExpiryDate('yearly', startDate);
        expect(expiryDate.getFullYear()).toBe(2025);
      });
    });

    describe('isSubscriptionValid', () => {
      it('应该正确判断订阅是否有效', () => {
        const futureDate = new Date(Date.now() + 86400000).toISOString(); // 明天
        const pastDate = new Date(Date.now() - 86400000).toISOString(); // 昨天
        
        expect(isSubscriptionValid(futureDate)).toBe(true);
        expect(isSubscriptionValid(pastDate)).toBe(false);
      });
    });

    describe('formatPaymentError', () => {
      it('应该正确格式化已知错误', () => {
        expect(formatPaymentError('sign_error')).toBe('签名验证失败，请重试');
        expect(formatPaymentError('order_payed')).toBe('订单已支付，请勿重复支付');
        expect(formatPaymentError('fee_error')).toBe('商户余额不足，请联系客服');
      });

      it('应该处理未知错误', () => {
        expect(formatPaymentError('unknown_error')).toBe('支付失败: unknown_error');
      });
    });
  });

  describe('定价配置测试', () => {
    it('应该包含所有必要的定价计划', () => {
      expect(PRICING_PLANS.professional_monthly).toBeDefined();
      expect(PRICING_PLANS.professional_yearly).toBeDefined();
      expect(PRICING_PLANS.premium_monthly).toBeDefined();
      expect(PRICING_PLANS.premium_yearly).toBeDefined();
    });

    it('定价计划应该包含正确的结构', () => {
      const plan = PRICING_PLANS.professional_monthly;
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('price');
      expect(plan).toHaveProperty('duration');
      expect(plan).toHaveProperty('type');
      expect(plan).toHaveProperty('durationType');
    });

    it('年度计划应该比月度计划更优惠', () => {
      const professionalMonthly = PRICING_PLANS.professional_monthly.price;
      const professionalYearly = PRICING_PLANS.professional_yearly.price;
      
      expect(professionalYearly).toBeLessThan(professionalMonthly * 12);
      
      const premiumMonthly = PRICING_PLANS.premium_monthly.price;
      const premiumYearly = PRICING_PLANS.premium_yearly.price;
      
      expect(premiumYearly).toBeLessThan(premiumMonthly * 12);
    });
  });

  describe('支付状态映射测试', () => {
    it('应该包含所有必要的状态映射', () => {
      const requiredStatuses = ['not_exist', 'new', 'payed', 'success', 'fee_error', 'expire'];
      requiredStatuses.forEach(status => {
        expect(PAYMENT_STATUS_MAP[status]).toBeDefined();
        expect(typeof PAYMENT_STATUS_MAP[status]).toBe('string');
        expect(PAYMENT_STATUS_MAP[status].length).toBeGreaterThan(0);
      });
    });
  });

  describe('BufPayService 测试', () => {
    describe('createPayment', () => {
      it('应该验证必需参数', async () => {
        const invalidRequest = {
          userId: '',
          userEmail: 'test@example.com',
          productName: '文派专业版',
          productType: 'professional' as const,
          durationType: 'monthly' as const,
          amount: 29,
          payType: 'alipay' as const
        };

        // Mock fetch to simulate API error
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 400,
          statusText: 'Bad Request'
        });

        await expect(BufPayService.createPayment(invalidRequest))
          .rejects
          .toThrow();
      });

      it('应该正确处理成功响应', async () => {
        const validRequest = {
          userId: 'user123',
          userEmail: 'test@example.com',
          productName: '文派专业版',
          productType: 'professional' as const,
          durationType: 'monthly' as const,
          amount: 29,
          payType: 'alipay' as const
        };

        const mockResponse = {
          success: true,
          orderId: 'WP202412345678901234',
          paymentInfo: {
            status: 'success',
            aoid: 'test_aoid',
            qr: 'test_qr_code'
          }
        };

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

        const result = await BufPayService.createPayment(validRequest);
        
        expect(result).toHaveProperty('orderId');
        expect(result).toHaveProperty('paymentInfo');
        expect(result.orderId).toBe(mockResponse.orderId);
      });
    });

    describe('queryBufPayStatus', () => {
      it('应该正确查询支付状态', async () => {
        const mockResponse = {
          status: 'success'
        };

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          headers: {
            get: (name: string) => name === 'content-type' ? 'application/json' : null
          },
          json: () => Promise.resolve(mockResponse)
        });

        const status = await BufPayService.queryBufPayStatus('test_aoid');
        expect(status).toBe('success');
      });

      it('应该处理查询失败情况', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        });

        await expect(BufPayService.queryBufPayStatus('invalid_aoid'))
          .rejects
          .toThrow();
      });
    });

    describe('getUserSubscriptionStatus', () => {
      beforeEach(() => {
        // Mock OrderService
        jest.mocked(OrderService.getUserSubscription).mockClear();
      });

      it('应该返回用户无订阅状态', async () => {
        jest.mocked(OrderService.getUserSubscription).mockResolvedValue(null);

        const status = await BufPayService.getUserSubscriptionStatus('user123');
        
        expect(status.hasSubscription).toBe(false);
        expect(status.subscriptionType).toBeUndefined();
        expect(status.expiresAt).toBeUndefined();
        expect(status.isExpired).toBeUndefined();
      });

      it('应该返回有效订阅状态', async () => {
        const futureDate = new Date(Date.now() + 86400000).toISOString();
        const mockSubscription = {
          subscription_type: 'professional' as const,
          expires_at: futureDate
        };

        jest.mocked(OrderService.getUserSubscription).mockResolvedValue(mockSubscription);

        const status = await BufPayService.getUserSubscriptionStatus('user123');
        
        expect(status.hasSubscription).toBe(true);
        expect(status.subscriptionType).toBe('professional');
        expect(status.expiresAt).toBe(futureDate);
        expect(status.isExpired).toBe(false);
      });

      it('应该识别过期订阅', async () => {
        const pastDate = new Date(Date.now() - 86400000).toISOString();
        const mockSubscription = {
          subscription_type: 'premium' as const,
          expires_at: pastDate
        };

        jest.mocked(OrderService.getUserSubscription).mockResolvedValue(mockSubscription);

        const status = await BufPayService.getUserSubscriptionStatus('user123');
        
        expect(status.hasSubscription).toBe(true);
        expect(status.isExpired).toBe(true);
      });
    });
  });

  describe('支付安全测试', () => {
    it('客户端不应包含敏感密钥', () => {
      // 确保客户端代码中没有硬编码的密钥
      const { BUFPAY_CONFIG } = require('@/types/payment');
      expect(BUFPAY_CONFIG.APP_SECRET).toBeUndefined();
    });

    it('签名验证应在服务端进行', () => {
      // 确保客户端的签名验证返回false
      const { verifyNotifySign } = require('@/utils/paymentUtils');
      const result = verifyNotifySign(
        'test_aoid',
        'test_order_id',
        'test_order_uid',
        '29.00',
        '29.00',
        'test_sign'
      );
      expect(result).toBe(false);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理网络请求超时', async () => {
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const request = {
        userId: 'user123',
        userEmail: 'test@example.com',
        productName: '文派专业版',
        productType: 'professional' as const,
        durationType: 'monthly' as const,
        amount: 29,
        payType: 'alipay' as const
      };

      await expect(BufPayService.createPayment(request))
        .rejects
        .toThrow('Request timeout');
    });

    it('应该处理无效的JSON响应', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(BufPayService.queryBufPayStatus('test_aoid'))
        .rejects
        .toThrow();
    });
  });

  describe('数据验证测试', () => {
    it('应该验证金额范围', () => {
      expect(() => formatAmount(-1)).not.toThrow();
      expect(formatAmount(-1)).toBe('-1.00');
      expect(formatAmount(0)).toBe('0.00');
      expect(formatAmount(999999.99)).toBe('999999.99');
    });

    it('应该验证订单号格式', () => {
      for (let i = 0; i < 10; i++) {
        const orderId = generateOrderId();
        expect(orderId).toMatch(/^WP\d{13}\d{4}$/);
      }
    });
  });
});