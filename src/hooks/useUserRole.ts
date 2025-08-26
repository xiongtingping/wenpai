/**
 * 用户角色管理Hook
 * 提供用户角色状态管理和权限检查功能
 */

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserTier } from '@/utils/subscriptionUtils';

export type UserRole = 'trial' | 'pro' | 'premium';

export interface UserRoleInfo {
  /** 当前用户角色 */
  role: UserRole;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 角色显示名称 */
  roleName: string;
  /** 角色等级（数字越大权限越高） */
  roleLevel: number;
  /** 是否为VIP用户 */
  isVip: boolean;
  /** 是否为高级用户 */
  isPremium: boolean;
}

export interface PermissionCheck {
  /** 检查是否有指定权限 */
  hasPermission: (requiredRole: UserRole) => boolean;
  /** 检查是否需要升级 */
  needsUpgrade: (requiredRole: UserRole) => boolean;
  /** 获取升级目标角色 */
  getUpgradeTarget: (requiredRole: UserRole) => UserRole | null;
}

/**
 * 用户角色管理Hook
 */
export const useUserRole = (): UserRoleInfo & PermissionCheck => {
  const { user, isAuthenticated } = useAuth();

  // 计算用户角色信息
  const roleInfo = useMemo((): UserRoleInfo => {
    const role = getUserTier(user);
    
    const roleNames = {
      trial: '体验版',
      pro: '专业版',
      premium: '高级版'
    };

    const roleLevels = {
      trial: 0,
      pro: 1,
      premium: 2
    };

    return {
      role,
      isAuthenticated,
      roleName: roleNames[role],
      roleLevel: roleLevels[role],
      isVip: role === 'pro' || role === 'premium',
      isPremium: role === 'premium'
    };
  }, [user, isAuthenticated]);

  // 权限检查功能
  const permissionCheck = useMemo((): PermissionCheck => {
    const roleLevels = { trial: 0, pro: 1, premium: 2 };

    const hasPermission = (requiredRole: UserRole): boolean => {
      if (!isAuthenticated) return false;
      return roleLevels[roleInfo.role] >= roleLevels[requiredRole];
    };

    const needsUpgrade = (requiredRole: UserRole): boolean => {
      if (!isAuthenticated) return true;
      return roleLevels[roleInfo.role] < roleLevels[requiredRole];
    };

    const getUpgradeTarget = (requiredRole: UserRole): UserRole | null => {
      if (hasPermission(requiredRole)) return null;
      return requiredRole;
    };

    return {
      hasPermission,
      needsUpgrade,
      getUpgradeTarget
    };
  }, [roleInfo.role, isAuthenticated]);

  return {
    ...roleInfo,
    ...permissionCheck
  };
};

/**
 * 权限检查Hook（简化版）
 */
export const useRolePermission = (requiredRole: UserRole) => {
  const { hasPermission, needsUpgrade, getUpgradeTarget, role, roleName } = useUserRole();

  return useMemo(() => ({
    /** 是否有权限 */
    allowed: hasPermission(requiredRole),
    /** 是否需要升级 */
    blocked: needsUpgrade(requiredRole),
    /** 当前角色 */
    currentRole: role,
    /** 当前角色名称 */
    currentRoleName: roleName,
    /** 需要的角色 */
    requiredRole,
    /** 升级目标角色 */
    upgradeTarget: getUpgradeTarget(requiredRole)
  }), [hasPermission, needsUpgrade, getUpgradeTarget, role, roleName, requiredRole]);
};

/**
 * 批量权限检查Hook
 */
export const useBatchRolePermission = (permissions: Record<string, UserRole>) => {
  const { hasPermission } = useUserRole();

  return useMemo(() => {
    const results: Record<string, boolean> = {};
    
    Object.entries(permissions).forEach(([key, requiredRole]) => {
      results[key] = hasPermission(requiredRole);
    });

    return results;
  }, [hasPermission, permissions]);
};

export default useUserRole;
