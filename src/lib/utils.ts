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
 * 从URL参数中保存推荐人ID
 * @description 从URL的ref参数中提取推荐人ID并保存到本地存储
 * @returns 推荐人ID或null
 */
export function saveReferrerFromURL(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get('ref');

  if (referrerId && referrerId.trim()) {
    // 验证推荐人ID格式（可以根据需要调整验证规则）
    const cleanReferrerId = referrerId.trim();
    
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
