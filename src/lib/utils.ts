import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 获取或创建临时用户ID
 * 用于未登录用户的功能体验
 */
export function getOrCreateTempUserId(): string {
  const key = 'temp-user-id';

  // 检查本地是否已有
  let tempId = localStorage.getItem(key);

  if (!tempId) {
    // 随机生成一个（也可以使用 uuid）
    tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem(key, tempId);
  }

  return tempId;
}

/**
 * 验证推荐人ID格式
 * @param referrerId 推荐人ID
 * @returns 是否有效
 */
export function validateReferrerId(referrerId: string): boolean {
  if (!referrerId || typeof referrerId !== 'string') {
    return false;
  }
  
  // 基本格式验证：6-20位字母数字下划线横线
  const formatRegex = /^[a-zA-Z0-9_-]{6,20}$/;
  if (!formatRegex.test(referrerId)) {
    return false;
  }
  
  // 不能是纯数字
  if (/^\d+$/.test(referrerId)) {
    return false;
  }
  
  // 不能包含连续的特殊字符
  if (/[_-]{2,}/.test(referrerId)) {
    return false;
  }
  
  return true;
}

/**
 * 检查是否已经处理过推荐奖励
 * @param referrerId 推荐人ID
 * @returns 是否已处理
 */
export function hasProcessedReferral(referrerId: string): boolean {
  const processedReferrals = JSON.parse(localStorage.getItem('processed_referrals') || '[]');
  return processedReferrals.includes(referrerId);
}

/**
 * 标记推荐奖励已处理
 * @param referrerId 推荐人ID
 */
export function markReferralProcessed(referrerId: string): void {
  const processedReferrals = JSON.parse(localStorage.getItem('processed_referrals') || '[]');
  if (!processedReferrals.includes(referrerId)) {
    processedReferrals.push(referrerId);
    localStorage.setItem('processed_referrals', JSON.stringify(processedReferrals));
  }
}

/**
 * 从URL参数中保存推荐人ID
 * @description 从URL的ref参数中提取推荐人ID并保存到本地存储
 * @returns 推荐人ID或null
 */
export function saveReferrerFromURL(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get('ref');

  if (referrerId && referrerId.trim()) {
    const cleanReferrerId = referrerId.trim();
    
    // 验证推荐人ID格式
    if (!validateReferrerId(cleanReferrerId)) {
      console.warn('无效的推荐人ID格式:', cleanReferrerId);
      return null;
    }
    
    // 检查是否已处理过
    if (hasProcessedReferral(cleanReferrerId)) {
      console.log('推荐奖励已处理过:', cleanReferrerId);
      return null;
    }
    
    // 保存到localStorage
    localStorage.setItem('referrer-id', cleanReferrerId);
    
    // 记录到控制台（仅开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('推荐人ID已保存:', cleanReferrerId);
      console.log('当前URL:', window.location.href);
    }
    
    return cleanReferrerId;
  }
  
  return null;
}

/**
 * 获取保存的推荐人ID
 * @returns 推荐人ID或null
 */
export function getReferrerId(): string | null {
  return localStorage.getItem('referrer-id');
}

/**
 * 清除推荐人ID
 */
export function clearReferrerId(): void {
  localStorage.removeItem('referrer-id');
  if (process.env.NODE_ENV === 'development') {
    console.log('推荐人ID已清除');
  }
}

/**
 * 检查当前URL是否包含推荐人参数
 * @returns 是否包含推荐人参数
 */
export function hasReferrerInURL(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('ref');
}

/**
 * 获取当前URL中的推荐人ID（不保存到localStorage）
 * @returns 推荐人ID或null
 */
export function getReferrerFromURL(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get('ref');
  return referrerId && referrerId.trim() ? referrerId.trim() : null;
}
