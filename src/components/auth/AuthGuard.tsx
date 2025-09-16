/**
 * ✅ FIXED: 2025-01-05 实现基础的 AuthGuard 组件
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * @module AuthGuard
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * AuthGuard 组件属性接口
 * @typedef {Object} AuthGuardProps
 * @property {React.ReactNode} children - 需要保护的子组件
 * @property {boolean} [requireAuth=true] - 是否需要认证
 * @property {string} [redirectTo='/login'] - 未认证时重定向路径
 * @property {React.ReactNode} [fallback] - 未认证时的兜底内容
 * @property {boolean} [showLoading=true] - 是否显示加载状态
 */
export interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

/**
 * 加载组件
 */
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2 text-sm text-muted-foreground">验证中...</span>
  </div>
);

/**
 * 认证守卫组件
 * 检查用户认证状态，未认证时自动重定向到登录页
 * @param {AuthGuardProps} props
 * @returns {React.ReactNode}
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/custom-login',
  fallback,
  showLoading = true
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!requireAuth) return;
    if (loading) return;
    if (!isAuthenticated || !user) {
      console.log('🔐 AuthGuard: 用户未认证，重定向到:', redirectTo);
      navigate(redirectTo, { replace: true });
    } else {
      console.log('🔐 AuthGuard: 用户已认证，允许访问');
    }
  }, [isAuthenticated, loading, user, requireAuth, redirectTo, navigate]);

  if (!requireAuth) return <>{children}</>;
  if (loading && showLoading) return <LoadingSpinner />;
  if (loading) return null;
  if (!isAuthenticated || !user) return fallback ? <>{fallback}</> : null;
  return <>{children}</>;
};
