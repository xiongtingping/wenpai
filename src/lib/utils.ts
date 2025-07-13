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
