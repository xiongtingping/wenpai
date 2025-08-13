/**
 * ✅ FIXED: 2025-08-04 架构级重构 - 优化权限检查逻辑
 * 🔒 LOCKED: 此重构已验证解决React无限循环问题，请勿修改
 *
 * 🐛 原问题：权限检查在渲染过程中触发状态更新，导致无限循环
 * 🔧 修复方案：使用React.memo优化、缓存权限结果、避免渲染时状态更新
 */

import React, { useMemo, useCallback } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

export interface PermissionGuardProps {
  children: React.ReactNode;
  required?: string;
  fallback?: React.ReactNode;
  autoRedirect?: boolean;
}

// ✅ 权限检查结果缓存，避免重复计算
const permissionCache = new Map<string, boolean>();
const CACHE_TTL = 5000; // 5秒缓存
const cacheTimestamps = new Map<string, number>();

/**
 * 安全的权限检查函数 - 避免在渲染过程中触发状态更新
 */
const checkPermissionSafely = (
  required: string | undefined,
  isAuthenticated: boolean,
  user: any,
  isDevelopment: boolean
): boolean => {
  if (!required) return true;

  // 移除开发环境权限绕过，使用真实权限检查

  console.log('🔒 权限检查:', required, { isAuthenticated, user: user?.id });

  // 缓存检查
  const cacheKey = `${required}_${isAuthenticated}_${user?.id || 'anonymous'}`;
  const now = Date.now();
  const cachedTime = cacheTimestamps.get(cacheKey);

  if (cachedTime && (now - cachedTime) < CACHE_TTL && permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey)!;
  }

  // 权限检查逻辑
  let hasPermission = false;

  if (!isAuthenticated || !user) {
    hasPermission = false;
  } else if (required === 'auth:required') {
    hasPermission = true;
  } else if (required.startsWith('feature:')) {
    // 功能权限检查
    hasPermission = true; // 简化实现，实际可根据需要扩展
  } else {
    hasPermission = false;
  }

  // 更新缓存
  permissionCache.set(cacheKey, hasPermission);
  cacheTimestamps.set(cacheKey, now);

  return hasPermission;
};

/**
 * 权限守卫组件 - 使用React.memo优化性能
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = React.memo(({
  children,
  required,
  fallback = <div>权限不足</div>
}) => {
  const { user, isAuthenticated } = useUnifiedAuth();

  // ✅ FIXED: 检查强制生产模式
  const forceProductionMode = useMemo(() =>
    import.meta.env.VITE_FORCE_PRODUCTION_MODE === 'true', []);
  const isDevelopment = useMemo(() =>
    !forceProductionMode && import.meta.env.DEV, [forceProductionMode]);

  // ✅ 使用useMemo缓存权限检查结果，避免每次渲染都重新计算
  const hasPermission = useMemo(() => {
    return checkPermissionSafely(required, isAuthenticated, user, isDevelopment);
  }, [required, isAuthenticated, user?.id, isDevelopment]);

  // ✅ 使用useCallback优化渲染性能
  const renderContent = useCallback(() => {
    return hasPermission ? children : fallback;
  }, [hasPermission, children, fallback]);

  return <>{renderContent()}</>;
});

// ✅ 设置displayName以便调试
PermissionGuard.displayName = 'PermissionGuard';