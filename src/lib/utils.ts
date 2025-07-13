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
 */
export function saveReferrerFromURL(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get('ref');

  if (referrerId) {
    localStorage.setItem('referrer-id', referrerId);
    console.log('推荐人ID已保存:', referrerId);
  }
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
}
