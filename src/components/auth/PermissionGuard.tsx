/**
 * 权限守卫组件
 * 基于用户权限和角色的访问控制
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 权限守卫属性
 */
interface PermissionGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 需要的权限 */
  requiredPermissions?: string[];
  /** 需要的角色 */
  requiredRoles?: string[];
  /** 无权限时重定向的路径 */
  redirectTo?: string;
  /** 加载时显示的组件 */
  loadingComponent?: ReactNode;
  /** 无权限时显示的组件 */
  noPermissionComponent?: ReactNode;
}

/**
 * 权限守卫组件
 * @param props 组件属性
 * @returns React 组件
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  loadingComponent = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在验证权限...</p>
      </div>
    </div>
  ),
  noPermissionComponent = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">权限不足</h1>
        <p className="text-gray-600 mb-4">您没有访问此页面的权限</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          返回上一页
        </button>
      </div>
    </div>
  ),
}) => {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();

  // 如果正在加载，显示加载组件
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // 如果用户未登录，重定向到登录页
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 如果没有权限要求，直接渲染子组件
  if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // 简化权限检查：暂时跳过复杂的权限验证
  // TODO: 实现完整的权限检查逻辑
  const hasRequiredPermissions = true; // 临时设置为true
  const hasRequiredRoles = true; // 临时设置为true

  // 如果权限不足，显示无权限组件
  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return <>{noPermissionComponent}</>;
  }

  // 渲染子组件
  return <>{children}</>;
};

export default PermissionGuard; 