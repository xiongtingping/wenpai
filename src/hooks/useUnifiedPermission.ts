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
import type { SubscriptionTier as UserSubscriptionTier } from '@/types/subscription';
import type { SubscriptionTier } from '@/config/rolePermissionMatrix';

/**
 * 统一权限检查Hook
 */
export function useUnifiedPermission(permissionKey: string) {
  const { user, isAuthenticated } = useAuth();
  const subscription = (user as any)?.subscription;

  // 构建用户权限上下文
  const userContext: UserPermissionContext = useMemo(() => ({
    id: user?.id,
    isAuthenticated,
    roles: (user?.roles || []) as SystemRole[],
    tier: (subscription?.tier || user?.subscription?.tier || 'trial') as SubscriptionTier,
    isVip: user?.isVip || subscription?.tier === 'premium' || subscription?.tier === 'pro',
    vipLevel: subscription?.tier || user?.subscription?.tier,
    subscription: {
      tier: subscription?.tier || user?.subscription?.tier,
      status: subscription?.status || user?.subscription?.status,
      isActive: subscription?.status === 'active' || user?.subscription?.status === 'active'
    },
    permissions: user?.permissions || []
  }), [user, isAuthenticated, subscription]);

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

  const userContext: UserPermissionContext = useMemo(() => ({
    id: user?.id,
    isAuthenticated,
    roles: (user?.roles || []) as SystemRole[],
    tier: (subscription?.tier || user?.subscription?.tier || 'trial') as SubscriptionTier,
    isVip: user?.isVip || subscription?.tier === 'premium' || subscription?.tier === 'pro',
    vipLevel: subscription?.tier || user?.subscription?.tier,
    subscription: {
      tier: subscription?.tier || user?.subscription?.tier,
      status: subscription?.status || user?.subscription?.status,
      isActive: subscription?.status === 'active' || user?.subscription?.status === 'active'
    },
    permissions: user?.permissions || []
  }), [user, isAuthenticated, subscription]);

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

  const userContext: UserPermissionContext = useMemo(() => ({
    id: user?.id,
    isAuthenticated,
    roles: (user?.roles || []) as SystemRole[],
    tier: (subscription?.tier || user?.subscription?.tier || 'trial') as SubscriptionTier,
    isVip: user?.isVip || subscription?.tier === 'premium' || subscription?.tier === 'pro',
    vipLevel: subscription?.tier || user?.subscription?.tier,
    subscription: {
      tier: subscription?.tier || user?.subscription?.tier,
      status: subscription?.status || user?.subscription?.status,
      isActive: subscription?.status === 'active' || user?.subscription?.status === 'active'
    },
    permissions: user?.permissions || []
  }), [user, isAuthenticated, subscription]);

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

  const userContext: UserPermissionContext = useMemo(() => ({
    id: user?.id,
    isAuthenticated,
    roles: (user?.roles || []) as SystemRole[],
    tier: (subscription?.tier || user?.subscription?.tier || 'trial') as SubscriptionTier,
    isVip: user?.isVip || subscription?.tier === 'premium' || subscription?.tier === 'pro',
    vipLevel: subscription?.tier || user?.subscription?.tier,
    subscription: {
      tier: subscription?.tier || user?.subscription?.tier,
      status: subscription?.status || user?.subscription?.status,
      isActive: subscription?.status === 'active' || user?.subscription?.status === 'active'
    },
    permissions: user?.permissions || []
  }), [user, isAuthenticated, subscription]);

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