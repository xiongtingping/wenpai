/**
 * 用户等级判断工具函数
 * @description 标准化的用户订阅等级判断逻辑,避免重复实现
 * @author 权限系统团队
 * @created 2025-10-03
 *
 * 🎯 设计原则:
 * 1. 单一真实来源(SSOT) - 只有这一个函数判断用户等级
 * 2. 多种来源兼容 - 支持subscription.tier、vipLevel、permissions等
 * 3. 向后兼容 - 支持旧字段名(subscription_tier、is_vip)
 * 4. 明确的降级策略 - 无法确定时返回trial
 */

import type { SubscriptionTier } from '@/types/subscription';
import type { SessionUserInfo } from '@/types/permissions';

/**
 * 订阅等级权重映射
 * 用于比较等级高低
 */
export const TIER_WEIGHTS: Record<SubscriptionTier, number> = {
  trial: 0,
  pro: 1,
  premium: 2
} as const;

/**
 * 获取用户当前订阅等级
 *
 * 优先级策略:
 * 1. user.subscription.tier (新架构,最优先)
 * 2. user.vipLevel (VIP系统)
 * 3. user.permissions (从权限数组推断)
 * 4. user.isVip (旧的VIP标识,映射为pro)
 * 5. 默认返回trial
 *
 * @param user 用户信息,可以为null
 * @returns 用户订阅等级
 *
 * @example
 * ```ts
 * const tier = getUserTier(user); // 'trial' | 'pro' | 'premium'
 * ```
 */
export function getUserTier(user: SessionUserInfo | null | undefined): SubscriptionTier {
  // 无用户信息,返回默认等级
  if (!user) {
    return 'trial';
  }

  // 1. 优先从用户订阅信息获取 (新架构)
  if (user.subscription?.tier) {
    const tier = user.subscription.tier;
    if (isValidTier(tier)) {
      return tier;
    }
  }

  // 2. 从VIP等级推断
  if (user.vipLevel) {
    const normalizedLevel = normalizeVipLevel(user.vipLevel);
    if (normalizedLevel) {
      return normalizedLevel;
    }
  }

  // 3. 从权限数组推断 (按优先级:premium > pro > trial)
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    if (user.permissions.includes('tier:premium')) {
      return 'premium';
    }
    if (user.permissions.includes('tier:pro')) {
      return 'pro';
    }
  }

  // 4. 旧的VIP标识 (向后兼容)
  if (user.isVip || user.is_vip) {
    return 'pro'; // 默认VIP映射为专业版
  }

  // 5. 兼容旧字段名
  if (user.subscription_tier) {
    const tier = user.subscription_tier;
    if (isValidTier(tier)) {
      return tier;
    }
  }

  // 6. 默认返回体验版
  return 'trial';
}

/**
 * 验证等级字符串是否有效
 */
function isValidTier(tier: any): tier is SubscriptionTier {
  return tier === 'trial' || tier === 'pro' || tier === 'premium';
}

/**
 * 规范化VIP等级字符串
 * 支持各种可能的VIP等级表示
 */
function normalizeVipLevel(vipLevel: string | SubscriptionTier): SubscriptionTier | null {
  const normalized = String(vipLevel).toLowerCase().trim();

  // 精确匹配
  if (normalized === 'premium' || normalized === 'high级版') {
    return 'premium';
  }
  if (normalized === 'pro' || normalized === '专业版') {
    return 'pro';
  }
  if (normalized === 'trial' || normalized === '体验版' || normalized === 'free') {
    return 'trial';
  }

  // 模糊匹配
  if (normalized.includes('premium') || normalized.includes('high级')) {
    return 'premium';
  }
  if (normalized.includes('pro') || normalized.includes('专业')) {
    return 'pro';
  }

  return null;
}

/**
 * 比较两个订阅等级
 * @returns 1 if tier1 > tier2, -1 if tier1 < tier2, 0 if equal
 *
 * @example
 * ```ts
 * compareTiers('premium', 'pro') // 1
 * compareTiers('trial', 'premium') // -1
 * compareTiers('pro', 'pro') // 0
 * ```
 */
export function compareTiers(tier1: SubscriptionTier, tier2: SubscriptionTier): number {
  const weight1 = TIER_WEIGHTS[tier1];
  const weight2 = TIER_WEIGHTS[tier2];

  if (weight1 > weight2) return 1;
  if (weight1 < weight2) return -1;
  return 0;
}

/**
 * 检查用户等级是否满足要求
 *
 * @param user 用户信息
 * @param requiredTier 所需等级
 * @returns 是否满足等级要求
 *
 * @example
 * ```ts
 * hasRequiredTier(user, 'pro') // true if user is pro or premium
 * hasRequiredTier(user, 'premium') // true only if user is premium
 * ```
 */
export function hasRequiredTier(
  user: SessionUserInfo | null | undefined,
  requiredTier: SubscriptionTier
): boolean {
  const userTier = getUserTier(user);
  return compareTiers(userTier, requiredTier) >= 0;
}

/**
 * 获取等级名称(中文)
 */
export function getTierName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    trial: '体验版',
    pro: '专业版',
    premium: '高级版'
  };
  return names[tier];
}

/**
 * 获取等级图标
 */
export function getTierIcon(tier: SubscriptionTier): string {
  const icons: Record<SubscriptionTier, string> = {
    trial: '⭐',
    pro: '⚡',
    premium: '👑'
  };
  return icons[tier];
}

/**
 * 检查是否需要升级
 *
 * @param user 用户信息
 * @param targetTier 目标等级
 * @returns 是否需要升级及升级信息
 */
export function requiresUpgrade(
  user: SessionUserInfo | null | undefined,
  targetTier: SubscriptionTier
): {
  required: boolean;
  currentTier: SubscriptionTier;
  targetTier: SubscriptionTier;
  tierGap: number;
} {
  const currentTier = getUserTier(user);
  const required = compareTiers(currentTier, targetTier) < 0;
  const tierGap = TIER_WEIGHTS[targetTier] - TIER_WEIGHTS[currentTier];

  return {
    required,
    currentTier,
    targetTier,
    tierGap
  };
}

/**
 * 获取建议的升级目标
 *
 * @param user 用户信息
 * @param requiredFeatures 需要的功能权限列表
 * @returns 建议的升级等级
 */
export function getSuggestedUpgrade(
  user: SessionUserInfo | null | undefined,
  requiredFeatures: Array<'pro' | 'premium'>
): SubscriptionTier | null {
  const currentTier = getUserTier(user);

  // 如果已经是最高级,无需升级
  if (currentTier === 'premium') {
    return null;
  }

  // 如果需要premium功能
  if (requiredFeatures.includes('premium')) {
    return 'premium';
  }

  // 如果需要pro功能且当前是trial
  if (requiredFeatures.includes('pro') && currentTier === 'trial') {
    return 'pro';
  }

  return null;
}

// 导出类型和常量
export type { SubscriptionTier };
export { TIER_WEIGHTS as SUBSCRIPTION_TIER_WEIGHTS };
