/**
 * 🔐 订阅工具函数
 * 提供统一的订阅状态检查、权限验证、等级管理等功能
 */

export type SubscriptionTier = 'trial' | 'pro' | 'premium';
export type UserTier = SubscriptionTier; // 向后兼容

export interface UserSubscription {
  tier: SubscriptionTier;
  expiresAt?: string;
  isActive: boolean;
  features?: string[];
}

// 导入认证系统的用户类型
import type { UserInfo as AuthSystemUser } from '@/types/auth';

// 兼容类型定义
export interface AuthUser {
  id: string;
  subscription?: UserSubscription;
  tier?: SubscriptionTier;
  [key: string]: any;
}

// 类型适配器：将认证系统的AuthUser转换为订阅工具期望的格式
export function adaptAuthUser(user: AuthSystemUser | null): AuthUser | null {
  if (!user) return null;

  return {
    ...user,
    subscription: user.subscription ? {
      tier: user.subscription.tier as any,
      isActive: (user.subscription as any).isActive,
      expiresAt: (user.subscription as any).expiresAt,
      features: (user.subscription as any).features
    } : undefined
  };
}

/**
 * 等级权重映射（用于比较等级高低）
 */
const TIER_WEIGHTS: Record<SubscriptionTier, number> = {
  trial: 0,
  pro: 1,
  premium: 2
};

/**
 * 等级显示名称映射
 */
const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  trial: '体验版',
  pro: '专业版',
  premium: '高级版'
};

/**
 * 等级功能映射
 */
const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  trial: [
    'basic-ai-generation',
    'limited-exports',
    'basic-templates'
  ],
  pro: [
    'basic-ai-generation',
    'limited-exports',
    'basic-templates',
    'advanced-ai-generation',
    'unlimited-exports',
    'premium-templates',
    'batch-processing',
    'api-access'
  ],
  premium: [
    'basic-ai-generation',
    'limited-exports',
    'basic-templates',
    'advanced-ai-generation',
    'unlimited-exports',
    'premium-templates',
    'batch-processing',
    'api-access',
    'priority-support',
    'custom-models',
    'team-collaboration',
    'advanced-analytics'
  ]
};

/**
 * 获取用户当前订阅等级
 */
export function getUserTier(user: AuthUser | AuthSystemUser | null | undefined): SubscriptionTier {
  // console.log('🔍 [getUserTier] 开始计算:', { user: user?.id, hasUser: !!user });
  
  if (!user) {
    // console.log('🔍 [getUserTier] 用户为空，返回trial');
    return 'trial';
  }

  // 如果是认证系统的用户类型，先进行适配
  const adaptedUser = 'subscription' in user && user.subscription && 'tier' in user.subscription
    ? user as AuthUser
    : adaptAuthUser(user as AuthSystemUser);

  // console.log('🔍 [getUserTier] 用户适配结果:', {
  //   original: !!user,
  //   adapted: !!adaptedUser,
  //   hasSubscription: !!adaptedUser?.subscription,
  //   subscriptionTier: adaptedUser?.subscription?.tier,
  //   directTier: (adaptedUser as any)?.tier
  // });

  if (!adaptedUser) {
    // console.log('🔍 [getUserTier] 适配用户为空，返回trial');
    return 'trial';
  }

  // 优先从 subscription 对象获取
  if (adaptedUser.subscription?.tier) {
    // console.log('🔍 [getUserTier] 从subscription获取tier:', adaptedUser.subscription.tier);
    return adaptedUser.subscription.tier;
  }

  // 其次从 tier 字段获取
  if (adaptedUser.tier) {
    // console.log('🔍 [getUserTier] 从用户对象获取tier:', adaptedUser.tier);
    return adaptedUser.tier;
  }

  // 兼容旧版本字段
  const subscription = adaptedUser.subscription || adaptedUser.plan || adaptedUser.tier;
  if (typeof subscription === 'string') {
    switch (subscription.toLowerCase()) {
      case 'premium':
      case 'enterprise':
        return 'premium';
      case 'pro':
      case 'professional':
        return 'pro';
      default:
        return 'trial';
    }
  }

  // 检查用户的权限或角色
  const roles = adaptedUser.roles || adaptedUser.permissions || [];
  if (Array.isArray(roles)) {
    if (roles.includes('premium') || roles.includes('enterprise')) {
      return 'premium';
    }
    if (roles.includes('pro') || roles.includes('professional')) {
      return 'pro';
    }
  }

  // 默认为体验版
  // console.log('🔍 [getUserTier] 所有条件都不满足，返回默认trial');
  return 'trial';
}

/**
 * 检查用户是否有指定等级的权限
 */
export function hasPermission(user: AuthUser | AuthSystemUser | null | undefined, requiredTier: SubscriptionTier): boolean {
  const userTier = getUserTier(user);
  const userWeight = TIER_WEIGHTS[userTier];
  const requiredWeight = TIER_WEIGHTS[requiredTier];

  return userWeight >= requiredWeight;
}

/**
 * 检查用户是否有指定功能的权限
 */
export function hasFeatureAccess(user: AuthUser | null | undefined, feature: string): boolean {
  const userTier = getUserTier(user);
  const tierFeatures = TIER_FEATURES[userTier] || [];

  return tierFeatures.includes(feature);
}

/**
 * 获取等级显示名称
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  return TIER_DISPLAY_NAMES[tier] || '未知版本';
}

/**
 * 获取等级权重
 */
export function getTierWeight(tier: SubscriptionTier): number {
  return TIER_WEIGHTS[tier] || 0;
}

/**
 * 获取等级颜色（向后兼容）
 */
export function getTierColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'premium':
      return 'purple';
    case 'pro':
      return 'blue';
    case 'trial':
    default:
      return 'gray';
  }
}

/**
 * 比较两个等级的高低
 */
export function compareTiers(tier1: SubscriptionTier, tier2: SubscriptionTier): number {
  return getTierWeight(tier1) - getTierWeight(tier2);
}

/**
 * 检查订阅是否有效
 */
export function isSubscriptionActive(user: AuthUser | null | undefined): boolean {
  if (!user?.subscription) return false;

  // 检查是否激活
  if (!user.subscription.isActive) return false;

  // 检查是否过期
  if (user.subscription.expiresAt) {
    const expiresAt = new Date(user.subscription.expiresAt);
    const now = new Date();
    return expiresAt > now;
  }

  return true;
}

/**
 * 获取订阅剩余天数
 */
export function getSubscriptionDaysLeft(user: AuthUser | null | undefined): number | null {
  if (!user?.subscription?.expiresAt) return null;

  const expiresAt = new Date(user.subscription.expiresAt);
  const now = new Date();
  const diffTime = expiresAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * 检查是否需要升级
 */
export function needsUpgrade(user: AuthUser | null | undefined, requiredTier: SubscriptionTier): boolean {
  return !hasPermission(user, requiredTier);
}

/**
 * 获取升级建议
 */
export function getUpgradeSuggestion(user: AuthUser | null | undefined, requiredTier: SubscriptionTier): {
  needsUpgrade: boolean;
  currentTier: SubscriptionTier;
  suggestedTier: SubscriptionTier;
  message: string;
} {
  const currentTier = getUserTier(user);
  const needsUpgradeFlag = needsUpgrade(user, requiredTier);

  return {
    needsUpgrade: needsUpgradeFlag,
    currentTier,
    suggestedTier: requiredTier,
    message: needsUpgradeFlag
      ? `当前为${getTierDisplayName(currentTier)}，需要升级到${getTierDisplayName(requiredTier)}或更高版本`
      : `当前${getTierDisplayName(currentTier)}已满足要求`
  };
}

/**
 * 获取等级功能列表
 */
export function getTierFeatures(tier: SubscriptionTier): string[] {
  return TIER_FEATURES[tier] || [];
}

/**
 * 获取所有等级信息
 */
export function getAllTiers(): Array<{
  tier: SubscriptionTier;
  name: string;
  weight: number;
  features: string[];
}> {
  return Object.keys(TIER_WEIGHTS).map(tier => ({
    tier: tier as SubscriptionTier,
    name: getTierDisplayName(tier as SubscriptionTier),
    weight: getTierWeight(tier as SubscriptionTier),
    features: getTierFeatures(tier as SubscriptionTier)
  }));
}

/**
 * 模拟用户订阅数据（开发环境使用）
 */
export function mockUserSubscription(tier: SubscriptionTier = 'trial'): UserSubscription {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天后过期

  return {
    tier,
    expiresAt: tier === 'trial' ? undefined : expiresAt.toISOString(),
    isActive: true,
    features: getTierFeatures(tier)
  };
}

/**
 * 检查功能是否在指定等级中可用
 */
export function isFeatureAvailableInTier(feature: string, tier: SubscriptionTier): boolean {
  const tierFeatures = getTierFeatures(tier);
  return tierFeatures.includes(feature);
}

/**
 * 获取功能所需的最低等级
 */
export function getFeatureMinimumTier(feature: string): SubscriptionTier | null {
  const tiers: SubscriptionTier[] = ['trial', 'pro', 'premium'];

  for (const tier of tiers) {
    if (isFeatureAvailableInTier(feature, tier)) {
      return tier;
    }
  }

  return null;
}

export default {
  getUserTier,
  hasPermission,
  hasFeatureAccess,
  getTierDisplayName,
  getTierWeight,
  getTierColor,
  compareTiers,
  isSubscriptionActive,
  getSubscriptionDaysLeft,
  needsUpgrade,
  getUpgradeSuggestion,
  getTierFeatures,
  getAllTiers,
  mockUserSubscription,
  isFeatureAvailableInTier,
  getFeatureMinimumTier
};
