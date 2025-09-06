/**
 * 支付计时器工具函数
 * 用于管理新用户限时优惠的计时逻辑
 */

import { supabase } from '@/config/supabase';

/**
 * 优惠时长（毫秒）
 */
export const PROMO_DURATION = 30 * 60 * 1000; // 30分钟

/**
 * 获取支付中心访问时间
 * 如果用户是第一次访问支付中心，记录当前时间作为优惠开始时间
 * @param userId 用户ID
 * @returns 支付中心访问时间
 */
export function getPaymentCenterAccessTime(userId?: string): Date | undefined {
  if (!userId || userId === 'undefined') return undefined;

  const accessTimeKey = `payment_center_access_time_${userId}`;
  const accessTime = localStorage.getItem(accessTimeKey);
  
  if (accessTime) {
    try {
      const parsed = JSON.parse(accessTime);
      // 支持旧格式（直接时间戳）和新格式（对象）
      if (typeof parsed === 'number' || typeof parsed === 'string') {
        return new Date(parseInt(parsed.toString(), 10));
      } else if (parsed.firstAccess) {
        return new Date(parsed.firstAccess);
      }
    } catch {
      // 如果解析失败，尝试作为时间戳处理
      return new Date(parseInt(accessTime, 10));
    }
  }
  
  // 如果是第一次访问支付中心，记录当前时间
  const now = new Date();
  const accessData = {
    firstAccess: now.toISOString(),
    lastAccess: now.toISOString(),
    offerExpiry: new Date(now.getTime() + PROMO_DURATION).toISOString()
  };
  localStorage.setItem(accessTimeKey, JSON.stringify(accessData));
  console.log('🎉 新用户限时优惠开始计时！', now.toLocaleString());
  return now;
}

/**
 * 检查用户是否有有效订阅
 * @param userId 用户ID
 * @returns 是否有有效订阅
 */
async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    // 🔧 FIX: 增加重试机制和更好的错误处理
    let lastError: Error | null = null;

    // 重试机制：最多尝试3次
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 订阅状态检查尝试 ${attempt}/3...`);

        // 🔧 FIX: 修复API连接配置，确保连接到正确的后端服务
        const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:8888' : 'https://www.wenpai.xyz';
        const response = await Promise.race([
          fetch(`${apiBaseUrl}/.netlify/functions/check-subscription-status?userId=${userId}`),
          // 15秒超时
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('订阅状态检查超时')), 15000)
          )
        ]);

        if (response.ok) {
          const result = await response.json();
          console.log('🔍 订阅状态检查结果:', { userId, hasSubscription: result.hasActiveSubscription });
          return result.hasActiveSubscription;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('未知错误');
        console.warn(`❌ 第 ${attempt} 次检查失败:`, lastError.message);

        // 如果不是最后一次尝试，等待后重试
        if (attempt < 3) {
          const delay = attempt * 500; // 递增延迟：500ms, 1s
          console.log(`⏳ 等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // 所有重试都失败了
    console.error('检查订阅状态异常:', lastError);

    // 🔧 FIX: 在网络错误时使用缓存数据作为降级方案
    try {
      const cached = localStorage.getItem(`subscription_status_${userId}`);
      if (cached) {
        const cachedStatus = JSON.parse(cached);
        const isActive = cachedStatus.status === 'active';
        console.log('🔄 使用缓存订阅状态作为降级方案:', { isActive, status: cachedStatus.status });
        return isActive;
      }
    } catch (e) {
      console.warn('读取缓存订阅状态失败:', e);
    }

    // 默认返回false，避免显示错误的优惠信息
    return false;
  } catch (error) {
    console.error('检查订阅状态异常:', error);
    return false;
  }
}

/**
 * 检查是否在限时优惠期内
 * @param userId 用户ID
 * @returns 是否在优惠期内
 */
export function isInPromoPeriod(userId?: string): boolean {
  if (!userId) return false;
  
  const accessTime = getPaymentCenterAccessTime(userId);
  if (!accessTime) return false;
  
  const now = new Date();
  const timeDiff = now.getTime() - accessTime.getTime();
  return timeDiff < PROMO_DURATION;
}

/**
 * 检查是否应该显示限时优惠（考虑订阅状态）
 * @param userId 用户ID
 * @returns Promise<boolean> 是否应该显示优惠
 */
export async function shouldShowPromoOffer(userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  // 如果用户已有有效订阅，不显示优惠
  const hasSubscription = await hasActiveSubscription(userId);
  if (hasSubscription) return false;
  
  // 检查是否在优惠期内
  return isInPromoPeriod(userId);
}

/**
 * 计算剩余优惠时间
 * @param userId 用户ID
 * @returns 剩余时间（毫秒）
 */
export function calculateRemainingTime(userId?: string): number {
  if (!userId) return 0;
  
  const accessTime = getPaymentCenterAccessTime(userId);
  if (!accessTime) return 0;
  
  const now = new Date();
  const timeDiff = now.getTime() - accessTime.getTime();
  return Math.max(0, PROMO_DURATION - timeDiff);
}

/**
 * 格式化倒计时显示
 * @param timeLeft 剩余时间（毫秒）
 * @returns 格式化的倒计时字符串
 */
export function formatTimeLeft(timeLeft: number): string {
  if (timeLeft <= 0) return '已结束';
  
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 重置支付中心访问时间
 * 用于测试或重新开始计时
 * @param userId 用户ID
 */
export function resetPaymentCenterAccessTime(userId?: string): void {
  if (!userId || userId === 'undefined') return;

  const accessTimeKey = `payment_center_access_time_${userId}`;
  localStorage.removeItem(accessTimeKey);
  console.log('🔄 支付中心访问时间已重置');
}

/**
 * 获取优惠状态信息
 * @param userId 用户ID
 * @returns 优惠状态信息
 */
export function getPromoStatus(userId?: string): {
  isActive: boolean;
  remainingTime: number;
  formattedTime: string;
  accessTime?: Date;
} {
  if (!userId) {
    return {
      isActive: false,
      remainingTime: 0,
      formattedTime: '已结束'
    };
  }
  
  const accessTime = getPaymentCenterAccessTime(userId);
  const remainingTime = calculateRemainingTime(userId);
  const isActive = remainingTime > 0;
  
  return {
    isActive,
    remainingTime,
    formattedTime: formatTimeLeft(remainingTime),
    accessTime
  };
}
