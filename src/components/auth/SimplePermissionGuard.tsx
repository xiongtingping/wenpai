/**
 * 简化权限守卫组件 - 使用统一权限系统
 * @description 基于统一权限配置的简化权限守卫，替代分散的权限检查逻辑
 */

import React from 'react';
import { UnifiedPermissionWrapper } from './UnifiedPermissionWrapper';
import type { SubscriptionTier } from '@/types/subscription';

interface SimplePermissionGuardProps {
  children: React.ReactNode;
  requiredTier: 'trial' | 'pro' | 'premium';
  featureName: string;
  description?: string;
  className?: string;
  /** 显示模式：wrapper(包装) | overlay(遮罩) | card(卡片) | button(按钮) */
  mode?: 'wrapper' | 'overlay' | 'card' | 'button';
  /** 回退组件 */
  fallback?: React.ReactNode;
}

/**
 * 简化权限守卫组件 - 基于统一权限系统
 */
export const SimplePermissionGuard: React.FC<SimplePermissionGuardProps> = ({
  children,
  requiredTier,
  featureName,
  description,
  className = '',
  mode = 'overlay',
  fallback
}) => {
  // 将订阅等级映射到权限键值
  const getPermissionKey = (tier: SubscriptionTier): string => {
    return `tier:${tier}`;
  };

  const permissionKey = getPermissionKey(requiredTier);

  return (
    <UnifiedPermissionWrapper
      permissionKey={permissionKey}
      featureName={featureName}
      description={description}
      mode={mode}
      className={className}
      fallback={fallback}
    >
      {children}
    </UnifiedPermissionWrapper>
  );

export default SimplePermissionGuard;
