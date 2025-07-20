/**
 * 权限守卫类型定义
 * 
 * 定义所有权限守卫组件的 Props 类型和返回值类型
 */

import { ReactNode } from 'react';

/**
 * 基础认证守卫属性
 */
export interface AuthGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 是否需要认证 */
  requireAuth?: boolean;
  /** 未认证时重定向的路径 */
  redirectTo?: string;
  /** 加载时显示的组件 */
  loadingComponent?: ReactNode;
}

/**
 * 路由保护守卫属性
 */
export interface ProtectedRouteProps {
  /** 子组件 */
  children: ReactNode;
  /** 未认证时重定向的路径 */
  redirectTo?: string;
  /** 加载时显示的组件 */
  loadingComponent?: ReactNode;
}

/**
 * 权限检查守卫属性
 */
export interface PermissionGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 需要的权限列表 */
  requiredPermissions?: string[];
  /** 需要的角色列表 */
  requiredRoles?: string[];
  /** 无权限时重定向的路径 */
  redirectTo?: string;
  /** 加载时显示的组件 */
  loadingComponent?: ReactNode;
  /** 无权限时显示的组件 */
  noPermissionComponent?: ReactNode;
}

/**
 * 功能预览守卫属性
 */
export interface PreviewGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 功能ID */
  featureId: string;
  /** 功能名称 */
  featureName: string;
  /** 功能描述 */
  featureDescription: string;
  /** 是否允许关闭 */
  allowClose?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
}

/**
 * VIP功能守卫属性
 */
export interface VIPGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 需要的VIP等级 */
  requiredLevel?: 'basic' | 'pro' | 'premium';
  /** 无权限时显示的组件 */
  fallback?: ReactNode;
  /** 是否显示升级提示 */
  showUpgradePrompt?: boolean;
}

/**
 * 功能访问守卫属性
 */
export interface FeatureGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 功能标识 */
  feature: string;
  /** 无权限时显示的组件 */
  fallback?: ReactNode;
  /** 是否显示权限提示 */
  showPermissionHint?: boolean;
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  /** 是否有权限 */
  hasPermission: boolean;
  /** 缺少的权限 */
  missingPermissions: Array<{ resource: string; action: string }>;
  /** 缺少的角色 */
  missingRoles: string[];
}

/**
 * 功能权限检查结果
 */
export interface FeaturePermissionResult {
  /** 是否有权限 */
  hasPermission: boolean;
  /** 错误信息 */
  message?: string;
  /** 建议操作 */
  suggestions?: string[];
  /** 需要的计划 */
  requiredPlan?: string;
} 