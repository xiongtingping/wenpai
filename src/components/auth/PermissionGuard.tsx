/**
 * ✅ FIXED: 2025-01-05 修复 PermissionGuard 组件类型定义
 * 🔓 UNLOCKED: 临时解锁以修复undefined拼接问题
 */

import React from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

export interface PermissionGuardProps {
  children: React.ReactNode;
  required?: string;
  fallback?: React.ReactNode;
}

/**
 * 权限守卫组件
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  required,
  fallback = <div>权限不足</div>
}) => {
  const { user, isAuthenticated } = useUnifiedAuth();

  // 如果没有权限要求，直接渲染子组件
  if (!required) {
    return <>{children}</>;
  }

  // 检查认证状态
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // 检查特定权限
  if (required === 'auth:required') {
    return <>{children}</>;
  }

  // 检查功能权限
  if (required.startsWith('feature:')) {
    const feature = required.replace('feature:', '');
    // 这里可以添加具体的功能权限检查逻辑
    return <>{children}</>;
  }

  return <>{fallback}</>;
}; 