/**
 * 统一支付端点配置
 * 集中管理所有支付相关的API端点和配置
 * 支持环境变量验证,无硬编码
 */

import { logger } from '@/utils/logger';

/**
 * 支付端点配置接口
 */
export interface PaymentEndpointConfig {
  // BufPay API配置
  bufpay: {
    apiBaseURL: string;
    queryURL: string;
    notifyURL: string;
    returnURL: string;
    feedbackURL: string;
    merchantId?: string;
    secretKey?: string;
  };

  // 内部API配置
  internal: {
    createOrderURL: string;
    repairPermissionsURL: string;
    bufpayProxyURL: string;
  };
}

/**
 * 获取当前origin (支持SSR)
 */
function getOrigin(): string {
  // 优先使用环境变量配置的域名
  const configuredOrigin = import.meta.env.VITE_APP_ORIGIN;
  if (configuredOrigin) {
    return configuredOrigin;
  }

  // 开发环境
  if (import.meta.env.DEV) {
    return 'http://localhost:5173';
  }

  // 生产环境
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // SSR环境fallback
  return 'https://www.wenpai.xyz';
}

/**
 * 验证必需的环境变量
 */
function validateRequiredEnvVars(keys: string[]): void {
  const missing = keys.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    const errorMsg = `❌ 缺少必需的支付配置环境变量:\n${missing.map(k => `  - ${k}`).join('\n')}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * 获取支付端点配置
 */
function getPaymentEndpoints(): PaymentEndpointConfig {
  const origin = getOrigin();

  // 验证必需的环境变量
  // 注意: SECRET_KEY和MERCHANT_ID仅在服务端需要,前端可选
  const requiredKeys = [
    'VITE_BUFPAY_API_URL',
    'VITE_BUFPAY_QUERY_URL',
  ];

  try {
    validateRequiredEnvVars(requiredKeys);
  } catch (error) {
    // 开发环境给出警告但不阻断
    if (import.meta.env.DEV) {
      logger.warn('支付配置验证失败(开发环境):', error);
    } else {
      throw error;
    }
  }

  const config: PaymentEndpointConfig = {
    bufpay: {
      apiBaseURL: import.meta.env.VITE_BUFPAY_API_URL || 'https://api.bufpay.com',
      queryURL: import.meta.env.VITE_BUFPAY_QUERY_URL || 'https://bufpay.com/api/query',
      notifyURL: import.meta.env.VITE_BUFPAY_NOTIFY_URL || `${origin}/.netlify/functions/payment-notify`,
      returnURL: import.meta.env.VITE_BUFPAY_RETURN_URL || `${origin}/payment/result`,
      feedbackURL: import.meta.env.VITE_BUFPAY_FEEDBACK_URL || `${origin}/payment/feedback`,
      merchantId: import.meta.env.VITE_BUFPAY_MERCHANT_ID,
      secretKey: import.meta.env.VITE_BUFPAY_SECRET_KEY,
    },
    internal: {
      createOrderURL: `${origin}/.netlify/functions/create-order`,
      repairPermissionsURL: `${origin}/.netlify/functions/repair-order-permissions`,
      bufpayProxyURL: `${origin}/.netlify/functions/bufpay-proxy`,
    }
  };

  return config;
}

/**
 * 单例配置实例
 */
let cachedConfig: PaymentEndpointConfig | null = null;

export function getPaymentConfig(): PaymentEndpointConfig {
  if (!cachedConfig) {
    cachedConfig = getPaymentEndpoints();

    // 开发环境输出配置信息(脱敏)
    if (import.meta.env.DEV) {
      logger.debug('💰 支付配置已加载:', {
        bufpayAPI: cachedConfig.bufpay.apiBaseURL,
        notifyURL: cachedConfig.bufpay.notifyURL,
        hasMerchantId: !!cachedConfig.bufpay.merchantId,
        hasSecretKey: !!cachedConfig.bufpay.secretKey,
      });
    }
  }

  return cachedConfig;
}

/**
 * 重置缓存(仅测试使用)
 */
export function resetPaymentConfig(): void {
  cachedConfig = null;
}

/**
 * 便捷导出 - 默认配置
 */
export const PAYMENT_CONFIG = getPaymentConfig();

/**
 * 类型安全的配置访问器
 */
export const PaymentConfigAccessor = {
  getBufPayAPIURL: () => getPaymentConfig().bufpay.apiBaseURL,
  getBufPayQueryURL: (aoid?: string) => {
    const base = getPaymentConfig().bufpay.queryURL;
    return aoid ? `${base}/${aoid}` : base;
  },
  getNotifyURL: () => getPaymentConfig().bufpay.notifyURL,
  getReturnURL: (orderId?: string) => {
    const base = getPaymentConfig().bufpay.returnURL;
    return orderId ? `${base}?order_id=${orderId}` : base;
  },
  getFeedbackURL: () => getPaymentConfig().bufpay.feedbackURL,
  getCreateOrderURL: () => getPaymentConfig().internal.createOrderURL,
  getRepairPermissionsURL: () => getPaymentConfig().internal.repairPermissionsURL,
  getBufPayProxyURL: (query?: string) => {
    const base = getPaymentConfig().internal.bufpayProxyURL;
    return query ? `${base}?query=${query}` : base;
  },

  // 安全访问敏感配置
  getMerchantId: () => {
    const id = getPaymentConfig().bufpay.merchantId;
    if (!id) {
      throw new Error('VITE_BUFPAY_MERCHANT_ID未配置');
    }
    return id;
  },
  getSecretKey: () => {
    const key = getPaymentConfig().bufpay.secretKey;
    if (!key) {
      throw new Error('VITE_BUFPAY_SECRET_KEY未配置');
    }
    return key;
  },
};

/**
 * 支付错误码映射
 */
export const PaymentErrors = {
  // 订单相关
  ORDER_NOT_FOUND: { code: 'E001', message: '订单不存在' },
  ORDER_ALREADY_PAID: { code: 'E002', message: '订单已支付' },
  ORDER_EXPIRED: { code: 'E003', message: '订单已过期' },
  ORDER_CREATION_FAILED: { code: 'E004', message: '创建订单失败' },

  // 支付相关
  PAYMENT_FAILED: { code: 'E101', message: '支付失败' },
  PAYMENT_SIGNATURE_INVALID: { code: 'E102', message: '签名验证失败' },
  PAYMENT_AMOUNT_MISMATCH: { code: 'E103', message: '支付金额不匹配' },
  PAYMENT_CALLBACK_FAILED: { code: 'E104', message: '支付回调处理失败' },

  // 权限相关
  PERMISSION_GRANT_FAILED: { code: 'E201', message: '权限发放失败' },
  SUBSCRIPTION_CREATE_FAILED: { code: 'E202', message: '创建订阅失败' },
  SUBSCRIPTION_NOT_FOUND: { code: 'E203', message: '订阅不存在' },

  // 配置相关
  CONFIG_MISSING: { code: 'E301', message: '支付配置缺失' },
  CONFIG_INVALID: { code: 'E302', message: '支付配置无效' },

  // 网络相关
  NETWORK_ERROR: { code: 'E401', message: '网络错误' },
  TIMEOUT_ERROR: { code: 'E402', message: '请求超时' },

  // 未知错误
  UNKNOWN_ERROR: { code: 'E999', message: '未知错误' },
} as const;

/**
 * 获取错误信息
 */
export function getPaymentErrorMessage(code: string): string {
  const entry = Object.values(PaymentErrors).find(e => e.code === code);
  return entry?.message || PaymentErrors.UNKNOWN_ERROR.message;
}

/**
 * 支付状态映射(统一使用)
 */
export const PAYMENT_STATUS_MAP = {
  // BufPay状态
  'not_exist': '订单不存在',
  'new': '新订单',
  'payed': '已支付未回调',
  'success': '支付成功',
  'fee_error': '余额不足',
  'expire': '订单已过期',

  // 内部订单状态
  'pending': '待支付',
  'paid': '已支付',
  'processed': '已处理',
  'failed': '支付失败',
  'cancelled': '已取消',
  'refunded': '已退款',
  'expired': '已过期',
} as const;

export type PaymentStatusKey = keyof typeof PAYMENT_STATUS_MAP;

/**
 * 获取状态显示文本
 */
export function getPaymentStatusText(status: string): string {
  return PAYMENT_STATUS_MAP[status as PaymentStatusKey] || '未知状态';
}
