/**
 * 支付计时器工具函数
 * 用于管理新用户限时优惠的计时逻辑
 */

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
  if (!userId) return undefined;
  
  const accessTimeKey = `payment_center_access_time_${userId}`;
  const accessTime = localStorage.getItem(accessTimeKey);
  
  if (accessTime) {
    return new Date(parseInt(accessTime, 10));
  }
  
  // 如果是第一次访问支付中心，记录当前时间
  const now = new Date();
  localStorage.setItem(accessTimeKey, now.getTime().toString());
  console.log('🎉 新用户限时优惠开始计时！', now.toLocaleString());
  return now;
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
  if (!userId) return;
  
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