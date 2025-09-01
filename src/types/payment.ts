/**
 * 支付相关类型定义
 */

export interface PaymentRequest {
  productName: string;
  productType: 'professional' | 'premium';
  durationType: 'monthly' | 'yearly';
  amount: number;
  payType: 'alipay' | 'wechat';
  userId: string;
  userEmail?: string;
}

export interface PaymentResponse {
  status: string;
  aoid?: string;
  pay_type?: string;
  price?: string;
  qr_price?: string;
  qr?: string;
  qr_img?: string;
  cid?: number;
  expires_in?: number;
  return_url?: string;
  feedback_url?: string;
  error?: string;
  // BufPay HTML支付页面支持
  htmlContent?: string;
  message?: string;
}

export interface Order {
  id: string;
  order_id: string;
  aoid?: string;
  user_id: string;
  user_email?: string;
  product_name: string;
  product_type: 'professional' | 'premium';
  duration_type: 'monthly' | 'yearly';
  amount: number;
  pay_price?: number;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'processed';
  pay_type: 'alipay' | 'wechat';
  qr_code?: string;
  qr_image?: string;
  expires_at?: string;
  created_at: string;
  paid_at?: string;
  processed_at?: string;
  metadata?: any;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_type: 'professional' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  order_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentNotifyData {
  aoid: string;
  order_id: string;
  order_uid: string;
  price: string;
  pay_price: string;
  sign: string;
}

export interface PricingPlan {
  plan_type: 'professional' | 'premium';
  duration_type: 'monthly' | 'yearly';
  price: number;
  features: string[];
  is_active: boolean;
}

// 定价配置
export const PRICING_PLANS = {
  professional_monthly: { 
    name: '文派专业版', 
    price: 29.00, 
    duration: '月度',
    type: 'professional' as const,
    durationType: 'monthly' as const
  },
  professional_yearly: { 
    name: '文派专业版', 
    price: 299.00, 
    duration: '年度',
    type: 'professional' as const,
    durationType: 'yearly' as const
  },
  premium_monthly: { 
    name: '文派高级版', 
    price: 59.00, 
    duration: '月度',
    type: 'premium' as const,
    durationType: 'monthly' as const
  },
  premium_yearly: { 
    name: '文派高级版', 
    price: 599.00, 
    duration: '年度',
    type: 'premium' as const,
    durationType: 'yearly' as const
  }
} as const;

export type PricingPlanKey = keyof typeof PRICING_PLANS;

// BufPay 配置 - 从环境变量获取
export const BUFPAY_CONFIG = {
  API_URL: import.meta.env.VITE_BUFPAY_API_URL || '/.netlify/functions/bufpay-proxy',
  QUERY_URL: import.meta.env.VITE_BUFPAY_QUERY_URL || '/.netlify/functions/bufpay-proxy',
  APP_SECRET: import.meta.env.VITE_BUFPAY_APP_SECRET || '2861731746ef4189937ef4dc11f09375',
  NOTIFY_URL: import.meta.env.VITE_BUFPAY_NOTIFY_URL || 'https://www.wenpai.xyz/.netlify/functions/payment-notify',
  RETURN_URL: import.meta.env.VITE_BUFPAY_RETURN_URL || 'https://www.wenpai.xyz/payment/result',
  FEEDBACK_URL: import.meta.env.VITE_BUFPAY_FEEDBACK_URL || 'https://www.wenpai.xyz/payment/feedback'
} as const;

// 支付状态映射
export const PAYMENT_STATUS_MAP = {
  'not_exist': '订单不存在',
  'new': '新订单',
  'payed': '已支付未回调',
  'success': '支付成功',
  'fee_error': '余额不足',
  'expire': '订单已过期'
} as const;

// 错误状态映射
export const PAYMENT_ERROR_MAP = {
  'sign_error': '签名错误',
  'order_payed': '订单已支付',
  'order_expire': '订单已过期',
  'free_limit': '免费版达到每日订单限制',
  'fee_error': '余额不足',
  'qr_limit': '无可用二维码',
  'missing_argument': '缺少参数'
} as const;
