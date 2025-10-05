/**
 * 统一权限检查Hook
 * @description 基于统一权限配置系统的权限检查钩子，替代分散的权限检查逻辑
 */

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  getUnifiedPermissionManager,
  type UserPermissionContext,
  type UnifiedPermissionResult
} from '@/config/unifiedPermissionConfig';
import type { SystemRole } from '@/config/rolePermissionMatrix';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 统一权限检查Hook
 */
export function useUnifiedPermission(permissionKey: string) {
  const { user, isAuthenticated } = useAuth();
  const subscription = (user as any)?.subscription;

  // 🎯 强化修复：构建用户权限上下文，处理多种可能的数据结构
  const userContext: UserPermissionContext = useMemo(() => {
    // 🔍 智能提取tier信息，支持多种数据源
    const extractTier = (): SubscriptionTier => {
      // 优先级1: subscription.tier (types/unifiedAuth.ts 结构)
      if (subscription?.tier) return subscription.tier as SubscriptionTier;
      
      // 优先级2: user.subscription.tier
      if (user?.subscription?.tier) return user.subscription.tier as SubscriptionTier;
      
      // 优先级3: subscription_tier (types/permissions.ts 结构)
      if ((user as any)?.subscription_tier) return (user as any).subscription_tier as SubscriptionTier;
      
      // 优先级4: tier 直接属性
      if ((user as any)?.tier) return (user as any).tier as SubscriptionTier;
      
      // 优先级5: vipLevel 映射
      if ((user as any)?.vipLevel === 'premium') return 'premium';
      if ((user as any)?.vipLevel === 'pro') return 'pro';
      
      // 优先级6: 从开发环境的useSubscriptionStatus获取
      if (import.meta.env.DEV) {
        // 在开发环境中，如果用户已认证但没有明确的tier，假设为premium
        return isAuthenticated ? 'premium' : 'trial';
      }
      
      return 'trial';
    };

    // 🔍 智能提取VIP状态
    const extractIsVip = (): boolean => {
      // 明确的isVip或is_vip标记
      if (user?.isVip === true || (user as any)?.is_vip === true) return true;
      
      // 基于tier推断
      const tier = extractTier();
      if (tier === 'premium' || tier === 'pro') return true;
      
      // 基于subscription状态推断
      if (subscription?.tier === 'premium' || subscription?.tier === 'pro') return true;
      if (user?.subscription?.tier === 'premium' || user?.subscription?.tier === 'pro') return true;
      
      return false;
    };

    // 🔍 智能提取VIP等级
    const extractVipLevel = () => {
      const tier = extractTier();
      if (tier !== 'trial') return tier;
      
      // 备用检查
      if ((user as any)?.vipLevel) return (user as any).vipLevel;
      if (subscription?.tier) return subscription.tier;
      if (user?.subscription?.tier) return user.subscription.tier;
      
      return undefined;
    };

    // 🔍 智能提取订阅状态
    const extractSubscriptionStatus = () => {
      // 优先级1: subscription.status
      if (subscription?.status) return subscription.status;
      
      // 优先级2: user.subscription.status  
      if (user?.subscription?.status) return user.subscription.status;
      
      // 优先级3: 基于tier推断 - 如果有高级tier，假设为active
      const tier = extractTier();
      if (tier === 'premium' || tier === 'pro') return 'active';
      
      return undefined;
    };

    const finalTier = extractTier();
    const finalIsVip = extractIsVip();
    const finalVipLevel = extractVipLevel();
    const finalStatus = extractSubscriptionStatus();

    console.log('🔍 [useUnifiedPermission] userpermissionupdown文构建:', {
      originalUser: {
        id: user?.id,
        tier: (user as any)?.tier,
        subscription_tier: (user as any)?.subscription_tier,
        subscription: user?.subscription,
        isVip: user?.isVip,
        is_vip: (user as any)?.is_vip,
        vipLevel: (user as any)?.vipLevel
      },
      subscription,
      extracted: {
        finalTier,
        finalIsVip,
        finalVipLevel,
        finalStatus
      }
    });

    return {
      id: user?.id,
      isAuthenticated,
      roles: (user?.roles || []) as SystemRole[],
      tier: finalTier,
      isVip: finalIsVip,
      vipLevel: finalVipLevel,
      subscription: {
        tier: finalTier,
        status: finalStatus,
        isActive: finalStatus === 'active' || finalTier === 'premium' || finalTier === 'pro'
      },
      permissions: user?.permissions || []
    } as UserPermissionContext;
  }, [user, isAuthenticated, subscription]);

  // 执行权限检查
  const permissionResult: UnifiedPermissionResult = useMemo(() => {
    return getUnifiedPermissionManager().checkPermission(permissionKey, userContext);
  }, [permissionKey, userContext]);

  return {
    ...permissionResult,
    userContext,
    hasPermission: permissionResult.pass,
    canUpgrade: permissionResult.canUpgrade,
    upgradeUrl: permissionResult.upgradeUrl,
    requiredLevel: permissionResult.requiredLevel,
    currentLevel: permissionResult.currentLevel,
    reason: permissionResult.reason
  };
}

/**
 * 多权限检查Hook (AND逻辑)
 */
export function useMultiplePermissions(permissionKeys: string[]) {
  const { user, isAuthenticated } = useAuth();
  const subscription = (user as any)?.subscription;

  // 🎯 复用智能用户上下文构建逻辑
  const userContext: UserPermissionContext = useMemo(() => {
    // 🔍 智能提取tier信息，支持多种数据源
    const extractTier = (): SubscriptionTier => {
      if (subscription?.tier) return subscription.tier as SubscriptionTier;
      if (user?.subscription?.tier) return user.subscription.tier as SubscriptionTier;
      if ((user as any)?.subscription_tier) return (user as any).subscription_tier as SubscriptionTier;
      if ((user as any)?.tier) return (user as any).tier as SubscriptionTier;
      if ((user as any)?.vipLevel === 'premium') return 'premium';
      if ((user as any)?.vipLevel === 'pro') return 'pro';
      if (import.meta.env.DEV) return isAuthenticated ? 'premium' : 'trial';
      return 'trial';
    };

    const extractIsVip = (): boolean => {
      if (user?.isVip === true || (user as any)?.is_vip === true) return true;
      const tier = extractTier();
      if (tier === 'premium' || tier === 'pro') return true;
      if (subscription?.tier === 'premium' || subscription?.tier === 'pro') return true;
      if (user?.subscription?.tier === 'premium' || user?.subscription?.tier === 'pro') return true;
      return false;
    };

    const extractVipLevel = () => {
      const tier = extractTier();
      if (tier !== 'trial') return tier;
      if ((user as any)?.vipLevel) return (user as any).vipLevel;
      if (subscription?.tier) return subscription.tier;
      if (user?.subscription?.tier) return user.subscription.tier;
      return undefined;
    };

    const extractSubscriptionStatus = () => {
      if (subscription?.status) return subscription.status;
      if (user?.subscription?.status) return user.subscription.status;
      const tier = extractTier();
      if (tier === 'premium' || tier === 'pro') return 'active';
      return undefined;
    };

    const finalTier = extractTier();
    const finalIsVip = extractIsVip();
    const finalVipLevel = extractVipLevel();
    const finalStatus = extractSubscriptionStatus();

    return {
      id: user?.id,
      isAuthenticated,
      roles: (user?.roles || []) as SystemRole[],
      tier: finalTier,
      isVip: finalIsVip,
      vipLevel: finalVipLevel,
      subscription: {
        tier: finalTier,
        status: finalStatus,
        isActive: finalStatus === 'active' || finalTier === 'premium' || finalTier === 'pro'
      },
      permissions: user?.permissions || []
    } as UserPermissionContext;
  }, [user, isAuthenticated, subscription]);

  const permissionResult: UnifiedPermissionResult = useMemo(() => {
    return getUnifiedPermissionManager().checkMultiplePermissions(permissionKeys, userContext);
  }, [permissionKeys, userContext]);

  return {
    ...permissionResult,
    userContext,
    hasPermission: permissionResult.pass,
    canUpgrade: permissionResult.canUpgrade,
    upgradeUrl: permissionResult.upgradeUrl,
    requiredLevel: permissionResult.requiredLevel,
    currentLevel: permissionResult.currentLevel,
    reason: permissionResult.reason
  };
}

/**
 * 任一权限检查Hook (OR逻辑)
 */
export function useAnyPermission(permissionKeys: string[]) {
  const { user, isAuthenticated } = useAuth();
  const subscription = (user as any)?.subscription;

  // 🎯 复用智能用户上下文构建逻辑
  const userContext: UserPermissionContext = useMemo(() => {
    const extractTier = (): SubscriptionTier => {
      if (subscription?.tier) return subscription.tier as SubscriptionTier;
      if (user?.subscription?.tier) return user.subscription.tier as SubscriptionTier;
      if ((user as any)?.subscription_tier) return (user as any).subscription_tier as SubscriptionTier;
      if ((user as any)?.tier) return (user as any).tier as SubscriptionTier;
      if ((user as any)?.vipLevel === 'premium') return 'premium';
      if ((user as any)?.vipLevel === 'pro') return 'pro';
      if (import.meta.env.DEV) return isAuthenticated ? 'premium' : 'trial';
      return 'trial';
    };

    const extractIsVip = (): boolean => {
      if (user?.isVip === true || (user as any)?.is_vip === true) return true;
      const tier = extractTier();
      if (tier === 'premium' || tier === 'pro') return true;
      if (subscription?.tier === 'premium' || subscription?.tier === 'pro') return true;
      if (user?.subscription?.tier === 'premium' || user?.subscription?.tier === 'pro') return true;
      return false;
    };

    const extractVipLevel = () => {
      const tier = extractTier();
      if (tier !== 'trial') return tier;
      if ((user as any)?.vipLevel) return (user as any).vipLevel;
      if (subscription?.tier) return subscription.tier;
      if (user?.subscription?.tier) return user.subscription.tier;
      return undefined;
    };

    const extractSubscriptionStatus = () => {
      if (subscription?.status) return subscription.status;
      if (user?.subscription?.status) return user.subscription.status;
      const tier = extractTier();
      if (tier === 'premium' || tier === 'pro') return 'active';
      return undefined;
    };

    const finalTier = extractTier();
    const finalIsVip = extractIsVip();
    const finalVipLevel = extractVipLevel();
    const finalStatus = extractSubscriptionStatus();

    return {
      id: user?.id,
      isAuthenticated,
      roles: (user?.roles || []) as SystemRole[],
      tier: finalTier,
      isVip: finalIsVip,
      vipLevel: finalVipLevel,
      subscription: {
        tier: finalTier,
        status: finalStatus,
        isActive: finalStatus === 'active' || finalTier === 'premium' || finalTier === 'pro'
      },
      permissions: user?.permissions || []
    } as UserPermissionContext;
  }, [user, isAuthenticated, subscription]);

  const permissionResult: UnifiedPermissionResult = useMemo(() => {
    return getUnifiedPermissionManager().checkAnyPermission(permissionKeys, userContext);
  }, [permissionKeys, userContext]);

  return {
    ...permissionResult,
    userContext,
    hasPermission: permissionResult.pass,
    canUpgrade: permissionResult.canUpgrade,
    upgradeUrl: permissionResult.upgradeUrl,
    requiredLevel: permissionResult.requiredLevel,
    currentLevel: permissionResult.currentLevel,
    reason: permissionResult.reason
  };
}

/**
 * 用户可用权限Hook
 */
export function useUserPermissions() {
  const { user, isAuthenticated } = useAuth();
  const subscription = (user as any)?.subscription;

  // 🎯 复用智能用户上下文构建逻辑
  const userContext: UserPermissionContext = useMemo(() => {
    const extractTier = (): SubscriptionTier => {
      if (subscription?.tier) return subscription.tier as SubscriptionTier;
      if (user?.subscription?.tier) return user.subscription.tier as SubscriptionTier;
      if ((user as any)?.subscription_tier) return (user as any).subscription_tier as SubscriptionTier;
      if ((user as any)?.tier) return (user as any).tier as SubscriptionTier;
      if ((user as any)?.vipLevel === 'premium') return 'premium';
      if ((user as any)?.vipLevel === 'pro') return 'pro';
      if (import.meta.env.DEV) return isAuthenticated ? 'premium' : 'trial';
      return 'trial';
    };

    const extractIsVip = (): boolean => {
      if (user?.isVip === true || (user as any)?.is_vip === true) return true;
      const tier = extractTier();
      if (tier === 'premium' || tier === 'pro') return true;
      if (subscription?.tier === 'premium' || subscription?.tier === 'pro') return true;
      if (user?.subscription?.tier === 'premium' || user?.subscription?.tier === 'pro') return true;
      return false;
    };

    const extractVipLevel = () => {
      const tier = extractTier();
      if (tier !== 'trial') return tier;
      if ((user as any)?.vipLevel) return (user as any).vipLevel;
      if (subscription?.tier) return subscription.tier;
      if (user?.subscription?.tier) return user.subscription.tier;
      return undefined;
    };

    const extractSubscriptionStatus = () => {
      if (subscription?.status) return subscription.status;
      if (user?.subscription?.status) return user.subscription.status;
      const tier = extractTier();
      if (tier === 'premium' || tier === 'pro') return 'active';
      return undefined;
    };

    const finalTier = extractTier();
    const finalIsVip = extractIsVip();
    const finalVipLevel = extractVipLevel();
    const finalStatus = extractSubscriptionStatus();

    return {
      id: user?.id,
      isAuthenticated,
      roles: (user?.roles || []) as SystemRole[],
      tier: finalTier,
      isVip: finalIsVip,
      vipLevel: finalVipLevel,
      subscription: {
        tier: finalTier,
        status: finalStatus,
        isActive: finalStatus === 'active' || finalTier === 'premium' || finalTier === 'pro'
      },
      permissions: user?.permissions || []
    } as UserPermissionContext;
  }, [user, isAuthenticated, subscription]);

  const availablePermissions = useMemo(() => {
    return getUnifiedPermissionManager().getUserAvailablePermissions(userContext);
  }, [userContext]);

  return {
    availablePermissions,
    userContext,
    hasAnyPermission: availablePermissions.length > 0
  };
}

export default useUnifiedPermission;