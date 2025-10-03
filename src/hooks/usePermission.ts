/**
 * 🔧 [UNIFIED_PERMISSION_HOOK_v2025.10.03]
 * 统一权限管理Hook - 重构版
 *
 * 🎯 重构目标:
 * 1. 移除重复的PERMISSION_CONFIGS,使用unifiedPermissionService
 * 2. 修复Unicode编码的错误消息
 * 3. 简化逻辑,保持向后兼容
 *
 * @description 提供统一的权限检查接口
 */

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import {
  UnifiedPermissionService,
  getUserTier
} from '@/services/unifiedPermissionService';
import type {
  ExtendedPermissionType,
  PermissionCheckResult,
  SessionUserInfo
} from '@/types/permissions';
import { logger } from '@/utils/logger';

/**
 * 统一的权限判断 Hook
 * @param permissionKey 权限键或权限键数组
 * @returns 权限判断结果
 *
 * @example
 * ```ts
 * const permission = usePermission('feature:creative-studio');
 * if (permission.pass) {
 *   // 用户有权限
 * }
 * ```
 */
export const usePermission = (
  permissionKey: ExtendedPermissionType | ExtendedPermissionType[] | string | string[]
): PermissionCheckResult & { pass: boolean; details?: any } => {
  const { user, isAuthenticated } = useAuth();
  const { primaryStatus, hasActiveSubscription } = useSubscriptionStatus();

  return useMemo(() => {
    const keys = Array.isArray(permissionKey) ? permissionKey : [permissionKey];

    // 增强的用户对象,包含订阅状态信息
    const enhancedUser: SessionUserInfo | null = user ? {
      ...user,
      // 如果有活跃订阅,使用订阅状态中的等级信息
      subscription: primaryStatus?.status === 'active' && primaryStatus.tier ? {
        ...user.subscription,
        tier: primaryStatus.tier
      } : user.subscription,
      // 根据订阅状态推断VIP等级
      vipLevel: (() => {
        if (primaryStatus?.status === 'active' && primaryStatus.tier) {
          return primaryStatus.tier;
        }
        if (primaryStatus?.status === 'active') {
          const statusLabel = primaryStatus.statusLabel?.toLowerCase() || '';
          if (statusLabel.includes('高级版') || statusLabel.includes('premium')) {
            return 'premium';
          } else if (statusLabel.includes('专业版') || statusLabel.includes('pro')) {
            return 'pro';
          }
        }
        return user.vipLevel;
      })()
    } : null;

    // 检查所有权限键
    const results: PermissionCheckResult[] = [];
    let firstFailure: PermissionCheckResult | null = null;

    for (const key of keys) {
      try {
        const result = UnifiedPermissionService.checkPermission(
          enhancedUser,
          key as ExtendedPermissionType
        );
        results.push(result);

        if (!result.hasPermission && !firstFailure) {
          firstFailure = result;
        }
      } catch (error) {
        console.error(`权限检查失败: ${key}`, error);
        // 权限配置不存在时,默认拒绝访问
        const errorResult: PermissionCheckResult = {
          hasPermission: false,
          userTier: 'trial',
          requiredTier: 'trial',
          missingPermissions: [key as ExtendedPermissionType],
          reason: `权限配置不存在: ${key}`,
          suggestedAction: isAuthenticated ? 'contact' : 'login'
        };
        results.push(errorResult);
        if (!firstFailure) {
          firstFailure = errorResult;
        }
      }
    }

    // 所有权限都通过才算通过
    const allPass = results.every(r => r.hasPermission);

    // 开发环境调试日志(降低频次)
    if (import.meta.env.DEV && Math.random() < 0.05) { // 只有5%的概率输出日志
      logger.debug('权限检查结果', {
        user: enhancedUser ? {
          id: enhancedUser.id,
          isVip: enhancedUser.isVip,
          vipLevel: enhancedUser.vipLevel
        } : null,
        hasActiveSubscription,
        permissionKey: keys,
        allPass,
        results: results.map(r => ({
          hasPermission: r.hasPermission,
          userTier: r.userTier,
          requiredTier: r.requiredTier
        }))
      });
    }

    if (allPass) {
      // 所有权限检查通过
      const currentUserTier = getUserTier(enhancedUser);
      return {
        pass: true,
        hasPermission: true,
        userTier: currentUserTier,
        requiredTier: results[0]?.requiredTier || 'trial',
        missingPermissions: [],
        suggestedAction: 'none',
        details: {
          key: keys.join(','),
          userPermissions: enhancedUser?.permissions || [],
          userRoles: enhancedUser?.roles || [],
          isVip: !!enhancedUser?.isVip,
          isLoggedIn: isAuthenticated
        }
      };
    } else {
      // 至少有一个权限检查失败
      const failure = firstFailure!;
      return {
        pass: false,
        hasPermission: false,
        userTier: failure.userTier,
        requiredTier: failure.requiredTier,
        missingPermissions: results.filter(r => !r.hasPermission).flatMap(r => r.missingPermissions),
        reason: failure.reason || `缺少权限: ${failure.permissionConfig?.description || keys[0]}`,
        suggestedAction: failure.suggestedAction,
        upgradeTarget: failure.upgradeTarget,
        redirectUrl: failure.redirectUrl || (isAuthenticated ? '/payment' : '/login'),
        permissionConfig: failure.permissionConfig,
        details: {
          key: keys.join(','),
          userPermissions: enhancedUser?.permissions || [],
          userRoles: enhancedUser?.roles || [],
          isVip: !!enhancedUser?.isVip,
          isLoggedIn: isAuthenticated
        }
      };
    }
  }, [user, isAuthenticated, permissionKey, primaryStatus, hasActiveSubscription]);
};

/**
 * VIP权限判断 Hook (向后兼容)
 * @deprecated 使用 usePermission('tier:pro') 替代
 */
export const useVipPermission = () => {
  return usePermission('tier:pro');
};

/**
 * 功能权限判断 Hook (向后兼容)
 * @deprecated 使用 usePermission('feature:{name}') 替代
 */
export const useFeaturePermission = (featureId: string) => {
  return usePermission(`feature:${featureId}` as ExtendedPermissionType);
};

/**
 * 导出权限结果接口以保持向后兼容
 */
export interface PermissionResult extends PermissionCheckResult {
  pass: boolean;
  details?: {
    key: string;
    userPermissions: string[];
    userRoles: string[];
    isVip: boolean;
    isLoggedIn: boolean;
  };
}
