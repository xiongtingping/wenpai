/**
 * 受保护路由组件
 * 基于统一认证上下文的简化路由保护
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * 受保护路由属性
 */
interface ProtectedRouteProps {
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
 * 受保护路由组件
 * @param props 组件属性
 * @returns React 组件
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  loadingComponent = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在验证权限...</p>
      </div>
    </div>
  ),
}) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useUnifiedAuth();

  // 如果正在加载，显示加载组件
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // 如果需要认证但用户未登录，重定向到登录页
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // 渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute; 