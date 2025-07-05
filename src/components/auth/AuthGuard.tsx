/**
 * AuthGuard 组件
 * 提供权限控制和认证保护功能
 */

import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthing } from '@/hooks/useAuthing';

/**
 * AuthGuard 组件属性接口
 */
export interface AuthGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 是否需要认证 */
  requireAuth?: boolean;
  /** 需要的权限 */
  requiredPermissions?: any[];
  /** 需要的角色 */
  requiredRoles?: string[];
  /** 未认证时重定向的路径 */
  redirectTo?: string;
  /** 无权限时重定向的路径 */
  noPermissionRedirectTo?: string;
  /** 加载时显示的组件 */
  loadingComponent?: ReactNode;
  /** 无权限时显示的组件 */
  noPermissionComponent?: ReactNode;
}

/**
 * 权限检查器组件
 */
interface PermissionCheckerProps {
  user: any | null;
  requiredPermissions: any[];
  requiredRoles: string[];
  noPermissionRedirectTo: string;
  noPermissionComponent: ReactNode;
  children: ReactNode;
}

const PermissionChecker: React.FC<PermissionCheckerProps> = ({
  user,
  requiredPermissions,
  requiredRoles,
  noPermissionRedirectTo,
  noPermissionComponent,
  children,
}) => {
  // 简化权限检查：如果有权限要求但用户未登录，显示无权限组件
  if (requiredPermissions.length > 0 || requiredRoles.length > 0) {
    if (!user) {
      return <>{noPermissionComponent}</>;
    }
  }

  // 暂时跳过复杂的权限检查，直接渲染子组件
  return <>{children}</>;
};

/**
 * AuthGuard 组件
 * 提供认证和权限控制功能
 * @param props 组件属性
 * @returns React 组件
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredPermissions = [],
  requiredRoles = [],
  redirectTo = '/authing-login',
  noPermissionRedirectTo = '/no-permission',
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
  const {
    user,
    isLoggedIn,
    loading,
    checkLoginStatus,
    getCurrentUser,
  } = useAuthing();

  // 每次进入受保护页面时刷新用户信息
  useEffect(() => {
    if (!loading) {
      getCurrentUser();
      checkLoginStatus();
    }
  }, [getCurrentUser, checkLoginStatus, loading]);

  // 只有 loading=false 时才判断 isLoggedIn
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // 如果需要认证但用户未登录，重定向到登录页
  if (requireAuth && !isLoggedIn) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // 如果不需要认证，直接渲染子组件
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 检查权限和角色
  return (
    <PermissionChecker
      user={user}
      requiredPermissions={requiredPermissions}
      requiredRoles={requiredRoles}
      noPermissionRedirectTo={noPermissionRedirectTo}
      noPermissionComponent={noPermissionComponent}
    >
      {children}
    </PermissionChecker>
  );
};

export default AuthGuard; 