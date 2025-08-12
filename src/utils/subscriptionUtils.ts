/**
 * 订阅和权限相关的工具函数
 */

export type UserTier = 'trial' | 'pro' | 'premium';

/**
 * 获取用户等级
 */
export function getUserTier(user: any): UserTier {
  if (!user) return 'trial';
  
  // 从用户对象中获取订阅信息
  const subscription = user.subscription || user.plan || user.tier;
  
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
  const roles = user.roles || user.permissions || [];
  if (Array.isArray(roles)) {
    if (roles.includes('premium') || roles.includes('enterprise')) {
      return 'premium';
    }
    if (roles.includes('pro') || roles.includes('professional')) {
      return 'pro';
    }
  }
  
  // 默认为试用版
  return 'trial';
}

/**
 * 检查用户是否有指定等级的权限
 */
export function hasPermission(user: any, requiredTier: UserTier): boolean {
  const userTier = getUserTier(user);
  const tierLevels = { trial: 0, pro: 1, premium: 2 };
  
  return tierLevels[userTier] >= tierLevels[requiredTier];
}

/**
 * 获取等级显示名称
 */
export function getTierDisplayName(tier: UserTier): string {
  switch (tier) {
    case 'premium':
      return '高级版';
    case 'pro':
      return '专业版';
    case 'trial':
    default:
      return '免费版';
  }
}

/**
 * 获取等级颜色
 */
export function getTierColor(tier: UserTier): string {
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
