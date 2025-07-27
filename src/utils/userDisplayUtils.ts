/**
 * 用户信息显示工具函数
 * 防止undefined字符串拼接问题，提供安全的用户信息显示方法
 *
 * ✅ FIXED: 2025-07-27 创建统一的用户信息显示工具，防止"undefinedundefined"问题
 * 🔒 LOCKED: 这些工具函数已经过验证，请勿修改核心逻辑
 *
 * @example
 * // ❌ 错误的做法 - 可能产生"undefinedundefined"
 * const name = user?.nickname || user?.username || '';
 *
 * // ✅ 正确的做法 - 使用安全工具函数
 * const name = getUserDisplayName(user, '默认用户');
 */

import type { UserInfo } from '@/contexts/UnifiedAuthContext';

/**
 * 用户信息类型扩展，支持更多可能的属性名
 */
type ExtendedUserInfo = UserInfo & {
  name?: string;
  photo?: string;
  picture?: string;
  emailAddress?: string;
  phoneNumber?: string;
  userId?: string;
  sub?: string;
};

/**
 * 安全获取用户显示名称
 *
 * ⚠️ 重要：此函数专门用于防止undefined字符串拼接问题
 *
 * @param user 用户信息对象，可以为null或undefined
 * @param fallback 默认值，默认为'用户'，必须是非空字符串
 * @returns 安全的显示名称，永远不会返回undefined或null
 *
 * @example
 * getUserDisplayName(user) // 返回用户名或'用户'
 * getUserDisplayName(user, '访客') // 返回用户名或'访客'
 * getUserDisplayName(null, '匿名') // 返回'匿名'
 */
export function getUserDisplayName(user?: ExtendedUserInfo | null, fallback: string = '用户'): string {
  if (!user) return fallback;
  
  // 按优先级返回用户名称
  if (user.nickname && user.nickname.trim()) return user.nickname.trim();
  if (user.username && user.username.trim()) return user.username.trim();
  if (user.name && user.name.trim()) return user.name.trim();
  if (user.email && user.email.trim()) return user.email.trim();
  
  return fallback;
}

/**
 * 安全获取用户头像首字母
 * @param user 用户信息对象
 * @param fallback 默认值，默认为'U'
 * @returns 安全的首字母，永远不会返回undefined
 */
export function getUserInitials(user?: ExtendedUserInfo | null, fallback: string = 'U'): string {
  const displayName = getUserDisplayName(user, fallback);
  return displayName.charAt(0).toUpperCase();
}

/**
 * 安全获取用户头像URL
 * @param user 用户信息对象
 * @param fallback 默认值，默认为空字符串
 * @returns 安全的头像URL，永远不会返回undefined
 */
export function getUserAvatarUrl(user?: ExtendedUserInfo | null, fallback: string = ''): string {
  if (!user) return fallback;
  
  if (user.avatar && user.avatar.trim()) return user.avatar.trim();
  if (user.photo && user.photo.trim()) return user.photo.trim();
  if (user.picture && user.picture.trim()) return user.picture.trim();
  
  return fallback;
}

/**
 * 安全获取用户邮箱
 * @param user 用户信息对象
 * @param fallback 默认值，默认为'未设置邮箱'
 * @returns 安全的邮箱，永远不会返回undefined
 */
export function getUserEmail(user?: ExtendedUserInfo | null, fallback: string = '未设置邮箱'): string {
  if (!user) return fallback;

  if (user.email && user.email.trim()) return user.email.trim();
  if (user.emailAddress && user.emailAddress.trim()) return user.emailAddress.trim();

  return fallback;
}

/**
 * 安全获取用户手机号
 * @param user 用户信息对象
 * @param fallback 默认值，默认为'未设置手机'
 * @returns 安全的手机号，永远不会返回undefined
 */
export function getUserPhone(user?: ExtendedUserInfo | null, fallback: string = '未设置手机'): string {
  if (!user) return fallback;
  
  if (user.phone && user.phone.trim()) return user.phone.trim();
  if (user.phoneNumber && user.phoneNumber.trim()) return user.phoneNumber.trim();
  
  return fallback;
}

/**
 * 安全获取用户ID
 * @param user 用户信息对象
 * @param fallback 默认值，默认为'未知ID'
 * @returns 安全的用户ID，永远不会返回undefined
 */
export function getUserId(user?: ExtendedUserInfo | null, fallback: string = '未知ID'): string {
  if (!user) return fallback;

  if (user.id && user.id.trim()) return user.id.trim();
  if (user.userId && user.userId.trim()) return user.userId.trim();
  if (user.sub && user.sub.trim()) return user.sub.trim();

  return fallback;
}

/**
 * 生成用户头像alt属性文本
 * @param user 用户信息对象
 * @returns 安全的alt文本
 */
export function getUserAvatarAlt(user?: ExtendedUserInfo | null): string {
  const displayName = getUserDisplayName(user, '用户');
  return `${displayName}的头像`;
}

/**
 * 生成用户信息摘要（用于调试和日志）
 * @param user 用户信息对象
 * @returns 用户信息摘要字符串
 */
export function getUserSummary(user?: ExtendedUserInfo | null): string {
  if (!user) return '未登录用户';

  const displayName = getUserDisplayName(user);
  const email = getUserEmail(user, '');
  const id = getUserId(user, '');

  let summary = displayName;
  if (email) summary += ` (${email})`;
  if (id) summary += ` [${id.substring(0, 8)}...]`;

  return summary;
}

/**
 * 检查用户信息是否完整
 * @param user 用户信息对象
 * @returns 用户信息完整性检查结果
 */
export function checkUserInfoCompleteness(user?: ExtendedUserInfo | null): {
  isComplete: boolean;
  missing: string[];
  hasBasicInfo: boolean;
} {
  if (!user) {
    return {
      isComplete: false,
      missing: ['用户信息'],
      hasBasicInfo: false
    };
  }
  
  const missing: string[] = [];
  
  if (!user.nickname && !user.username && !user.name) {
    missing.push('显示名称');
  }
  
  if (!user.email && !user.emailAddress) {
    missing.push('邮箱');
  }
  
  if (!user.phone && !user.phoneNumber) {
    missing.push('手机号');
  }
  
  if (!user.avatar && !user.photo && !user.picture) {
    missing.push('头像');
  }
  
  const hasBasicInfo = !!(user.nickname || user.username || user.name || user.email);
  const isComplete = missing.length === 0;
  
  return {
    isComplete,
    missing,
    hasBasicInfo
  };
}

/**
 * 为模板字符串提供安全的用户属性
 * @param user 用户信息对象
 * @returns 包含所有安全属性的对象
 */
export function getSafeUserProps(user?: ExtendedUserInfo | null) {
  return {
    displayName: getUserDisplayName(user),
    initials: getUserInitials(user),
    avatarUrl: getUserAvatarUrl(user),
    avatarAlt: getUserAvatarAlt(user),
    email: getUserEmail(user),
    phone: getUserPhone(user),
    id: getUserId(user),
    summary: getUserSummary(user)
  };
}
