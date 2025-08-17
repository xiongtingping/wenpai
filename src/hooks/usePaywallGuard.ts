/**
 * 🔐 统一付费墙守卫 Hook
 * 提供统一的权限检查和付费墙逻辑
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getUserTier, hasPermission, getTierDisplayName } from '@/utils/subscriptionUtils';

export type SubscriptionTier = 'trial' | 'pro' | 'premium';

export interface PaywallGuardResult {
  /** 是否有访问权限 */
  hasAccess: boolean;
  /** 用户当前等级 */
  userTier: SubscriptionTier;
  /** 所需等级 */
  requiredTier: SubscriptionTier;
  /** 是否需要升级 */
  needsUpgrade: boolean;
  /** 用户等级显示名称 */
  userTierName: string;
  /** 所需等级显示名称 */
  requiredTierName: string;
  /** 升级到支付页面 */
  navigateToUpgrade: () => void;
  /** 检查特定功能权限 */
  checkFeatureAccess: (featureTier: SubscriptionTier) => boolean;
}

/**
 * 使用付费墙守卫 Hook
 */
export const usePaywallGuard = (requiredTier: SubscriptionTier = 'trial'): PaywallGuardResult => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const navigate = useNavigate();

  // 获取用户当前等级
  const userTier = useMemo(() => {
    if (!isAuthenticated || !user) return 'trial';
    return getUserTier(user);
  }, [user, isAuthenticated]);

  // 检查权限
  const hasAccess = useMemo(() => {
    return hasPermission(user, requiredTier);
  }, [user, requiredTier]);

  // 是否需要升级
  const needsUpgrade = useMemo(() => {
    return !hasAccess;
  }, [hasAccess]);

  // 获取等级显示名称
  const userTierName = useMemo(() => {
    return getTierDisplayName(userTier);
  }, [userTier]);

  const requiredTierName = useMemo(() => {
    return getTierDisplayName(requiredTier);
  }, [requiredTier]);

  // 导航到升级页面
  const navigateToUpgrade = () => {
    navigate('/payment');
  };

  // 检查特定功能权限
  const checkFeatureAccess = (featureTier: SubscriptionTier) => {
    return hasPermission(user, featureTier);
  };

  return {
    hasAccess,
    userTier,
    requiredTier,
    needsUpgrade,
    userTierName,
    requiredTierName,
    navigateToUpgrade,
    checkFeatureAccess
  };
};

/**
 * 功能权限检查 Hook
 * 用于检查特定功能的访问权限
 */
export const useFeatureAccess = (featureName: string, requiredTier: SubscriptionTier) => {
  const paywallGuard = usePaywallGuard(requiredTier);
  
  return {
    ...paywallGuard,
    featureName,
    canAccess: paywallGuard.hasAccess,
    isLocked: !paywallGuard.hasAccess
  };
};

/**
 * 批量功能权限检查 Hook
 * 用于检查多个功能的访问权限
 */
export const useBatchFeatureAccess = (features: Array<{ name: string; tier: SubscriptionTier }>) => {
  const { user } = useUnifiedAuth();
  
  return useMemo(() => {
    return features.map(feature => ({
      name: feature.name,
      tier: feature.tier,
      hasAccess: hasPermission(user, feature.tier),
      needsUpgrade: !hasPermission(user, feature.tier)
    }));
  }, [user, features]);
};

export default usePaywallGuard;
