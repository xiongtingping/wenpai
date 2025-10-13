/**
 * 统一权限检查Hook
 * @description 基于统一权限配置系统的权限检查钩子，替代分散的权限检查逻辑
 * 🔧 2025-01-13: 迁移到useSubscriptionTier架构，确保SSOT（单一真相源）
 */

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import {
  getUnifiedPermissionManager,
  type UserPermissionContext,
  type UnifiedPermissionResult
} from '@/config/unifiedPermissionConfig';
import type { SystemRole } from '@/config/rolePermissionMatrix';

/**
 * 🔧 NEW: 构建用户权限上下文的辅助函数（使用SSOT）
 * 从useSubscriptionTier获取tier，确保单一真相源
 */
function buildUserContext(
  user: any,
  isAuthenticated: boolean,
  tier: string,
  isExpired: boolean
): UserPermissionContext {
  // 🔧 tier直接来自useSubscriptionTier（SSOT）
  const finalTier = tier;

  // 🔍 基于tier推断VIP状态
  const finalIsVip = finalTier === 'premium' || finalTier === 'pro';

  // 🔍 VIP等级等同于tier
  const finalVipLevel = finalTier !== 'trial' ? finalTier : undefined;

  // 🔍 订阅状态：未过期且是付费用户则为active
  const finalStatus = !isExpired && (finalTier === 'premium' || finalTier === 'pro') ? 'active' : undefined;

  return {
    id: user?.id,
    isAuthenticated,
    roles: (user?.roles || []) as SystemRole[],
    tier: finalTier as any,
    isVip: finalIsVip,
    vipLevel: finalVipLevel,
    subscription: {
      tier: finalTier as any,
      status: finalStatus,
      isActive: finalStatus === 'active' || finalTier === 'premium' || finalTier === 'pro'
    },
    permissions: user?.permissions || []
  } as UserPermissionContext;
}

/**
 * 统一权限检查Hook
 * 🔧 NEW: 使用useSubscriptionTier作为唯一订阅等级数据源
 */
export function useUnifiedPermission(permissionKey: string) {
  const { user, isAuthenticated } = useAuth();

  // 🔧 NEW: 使用新架构的useSubscriptionTier hook（SSOT）
  const { tier, isExpired } = useSubscriptionTier(user?.id);

  // 🎯 构建用户权限上下文（简化版，使用SSOT数据源）
  const userContext: UserPermissionContext = useMemo(() => {
    return buildUserContext(user, isAuthenticated, tier, isExpired);
  }, [user, isAuthenticated, tier, isExpired]);

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
 * 🔧 NEW: 使用useSubscriptionTier作为唯一订阅等级数据源
 */
export function useMultiplePermissions(permissionKeys: string[]) {
  const { user, isAuthenticated } = useAuth();
  const { tier, isExpired } = useSubscriptionTier(user?.id);

  const userContext: UserPermissionContext = useMemo(() => {
    return buildUserContext(user, isAuthenticated, tier, isExpired);
  }, [user, isAuthenticated, tier, isExpired]);

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
 * 🔧 NEW: 使用useSubscriptionTier作为唯一订阅等级数据源
 */
export function useAnyPermission(permissionKeys: string[]) {
  const { user, isAuthenticated } = useAuth();
  const { tier, isExpired } = useSubscriptionTier(user?.id);

  const userContext: UserPermissionContext = useMemo(() => {
    return buildUserContext(user, isAuthenticated, tier, isExpired);
  }, [user, isAuthenticated, tier, isExpired]);

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
 * 🔧 NEW: 使用useSubscriptionTier作为唯一订阅等级数据源
 */
export function useUserPermissions() {
  const { user, isAuthenticated } = useAuth();
  const { tier, isExpired } = useSubscriptionTier(user?.id);

  const userContext: UserPermissionContext = useMemo(() => {
    return buildUserContext(user, isAuthenticated, tier, isExpired);
  }, [user, isAuthenticated, tier, isExpired]);

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
