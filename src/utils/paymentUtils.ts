/**
 * 支付相关工具函数
 */

import CryptoJS from 'crypto-js';
import { BUFPAY_CONFIG } from '@/types/payment';

/**
 * 生成 MD5 签名
 */
export function generateMD5(text: string): string {
  return CryptoJS.MD5(text).toString().toLowerCase();
}

/**
 * 🔒 安全修复：客户端不再生成支付签名
 * 所有签名生成移至服务端 (create-order function)
 * 此函数保留仅用于类型兼容，实际签名在服务端完成
 */
export function generatePaymentSign(
  name: string,
  payType: string,
  price: string,
  orderId: string,
  orderUid: string,
  notifyUrl: string,
  returnUrl: string,
  feedbackUrl: string = ''
): string {
  // 客户端不再生成真实签名，返回占位符
  // 真实签名由 netlify/functions/create-order.js 生成
  console.warn('⚠️ 客户端不应生成支付签名，请使用服务端API');
  return 'CLIENT_SIDE_SIGNATURE_DISABLED';
}

/**
 * 🔒 安全修复：客户端不再验证回调签名
 * 所有签名验证移至服务端 (bufpay-notify function)
 * 客户端只负责数据传递，不进行安全验证
 */
export function verifyNotifySign(
  aoid: string,
  orderId: string,
  orderUid: string,
  price: string,
  payPrice: string,
  sign: string
): boolean {
  // 客户端不再进行签名验证
  // 所有安全验证在服务端完成
  console.warn('⚠️ 客户端不应验证支付签名，请在服务端验证');
  return false; // 强制返回false，确保不依赖客户端验证
}

/**
 * 生成订单号
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WP${timestamp}${random}`;
}

/**
 * 格式化金额
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * 解析产品信息
 */
export function parseProductInfo(productType: string, durationType: string) {
  const productMap = {
    'professional': '文派专业版',
    'premium': '文派高级版'
  };
  
  const durationMap = {
    'monthly': '月度会员',
    'yearly': '年度会员'
  };
  
  return {
    productName: productMap[productType as keyof typeof productMap] || '未知产品',
    durationName: durationMap[durationType as keyof typeof durationMap] || '未知时长'
  };
}

/**
 * 计算订阅到期时间
 */
export function calculateExpiryDate(durationType: 'monthly' | 'yearly', startDate?: Date): Date {
  const start = startDate || new Date();
  const expiry = new Date(start);
  
  if (durationType === 'monthly') {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (durationType === 'yearly') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  
  return expiry;
}

/**
 * 检查订阅是否有效
 */
export function isSubscriptionValid(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date();
}

/**
 * 获取用户权限等级
 */
export function getUserPermissionLevel(subscriptionType?: string): 'basic' | 'professional' | 'premium' {
  if (!subscriptionType) return 'basic';
  
  switch (subscriptionType) {
    case 'professional':
      return 'professional';
    case 'premium':
      return 'premium';
    default:
      return 'basic';
  }
}

/**
 * 格式化支付错误信息
 */
export function formatPaymentError(status: string, info?: string): string {
  const errorMap: Record<string, string> = {
    'sign_error': '签名验证失败，请重试',
    'order_payed': '订单已支付，请勿重复支付',
    'order_expire': '订单已过期，请重新下单',
    'free_limit': '今日订单数量已达上限，请明日再试',
    'fee_error': '商户余额不足，请联系客服',
    'qr_limit': '暂无可用收款码，请稍后重试',
    'missing_argument': `缺少必要参数${info ? ': ' + info : ''}`
  };
  
  return errorMap[status] || `支付失败: ${status}`;
}

/**
 * 生成支付表单数据
 */
export function generatePaymentFormData(
  name: string,
  payType: string,
  price: number,
  orderId: string,
  orderUid: string
): URLSearchParams {
  // 验证必需参数
  if (!name || name.trim() === '') {
    throw new Error('产品名称(name)不能为空');
  }
  if (!payType || payType.trim() === '') {
    throw new Error('支付类型(payType)不能为空');
  }
  if (!orderId || orderId.trim() === '') {
    throw new Error('订单ID(orderId)不能为空');
  }
  if (!orderUid || orderUid.trim() === '') {
    throw new Error('订单用户ID(orderUid)不能为空');
  }
  if (price <= 0) {
    throw new Error('价格必须大于0');
  }
  
  const priceStr = formatAmount(price);
  
  // 使用URLSearchParams而不是FormData
  const params = new URLSearchParams();
  params.append('name', name);
  params.append('pay_type', payType);
  params.append('price', priceStr);
  params.append('order_id', orderId);
  params.append('order_uid', orderUid);
  params.append('notify_url', BUFPAY_CONFIG.NOTIFY_URL);
  params.append('return_url', BUFPAY_CONFIG.RETURN_URL);
  params.append('feedback_url', BUFPAY_CONFIG.FEEDBACK_URL);
  
  // 🔒 安全修复：客户端不再生成签名
  // 签名将在服务端API中生成
  // params.append('sign', sign); // 移除客户端签名
  
  return params;
}

/**
 * 检查支付二维码是否需要用户输入金额
 */
export function needsManualAmount(qrPrice: string | undefined): boolean {
  return !qrPrice || qrPrice === '';
}

/**
 * 格式化倒计时显示
 */
export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 生成支付反馈邮件内容
 */
export function generateFeedbackEmail(orderId: string, amount: number, description: string): string {
  const subject = encodeURIComponent(`支付问题反馈 - 订单号: ${orderId}`);
  const body = encodeURIComponent(`
订单号: ${orderId}
支付金额: ¥${formatAmount(amount)}
问题描述: ${description}

请提供支付截图等相关凭证，我们会尽快为您处理。

感谢您使用文派！
  `.trim());
  
  return `mailto:support@wenpai.xyz?subject=${subject}&body=${body}`;
}
