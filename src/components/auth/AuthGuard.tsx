/**
 * ✅ FIXED: 2025-01-05 实现基础的 AuthGuard 组件
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * @module AuthGuard
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStore } from '@/stores/subscription-store';

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
const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">{t('authGuard.verifying')}</span>
    </div>
  );
};

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
  const { preloadStatus, forceRefreshAfterUpgrade } = useSubscriptionStore();

  // 🔧 2025-01 重构: 预加载已移到App.tsx（应用级）
  // AuthGuard只负责监听支付成功和订阅更新事件
  // 注释：预加载逻辑已移到App.tsx，这里不再重复执行

  // 🆕 监听支付成功和订阅更新事件，强制刷新订阅状态
  useEffect(() => {
    if (!user?.id) return;

    const handlePaymentSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      const expectedTier = customEvent.detail?.expectedTier;

      console.log('💳 支付成功，强制刷新订阅状态', {
        userId: user.id,
        expectedTier
      });

      forceRefreshAfterUpgrade(user.id, expectedTier);
    };

    const handleSubscriptionUpdated = (event: CustomEvent) => {
      const expectedTier = event.detail?.tier;

      console.log('📝 订阅更新，强制刷新订阅状态', {
        userId: user.id,
        expectedTier,
        detail: event.detail
      });

      forceRefreshAfterUpgrade(user.id, expectedTier);
    };

    // 监听支付成功事件
    window.addEventListener('paymentSuccess', handlePaymentSuccess as EventListener);
    window.addEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);

    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess as EventListener);
      window.removeEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);
    };
  }, [user?.id, forceRefreshAfterUpgrade]);

  useEffect(() => {
    if (!requireAuth) return;
    if (loading) return;
    if (!isAuthenticated || !user) {
      console.log('🔐 AuthGuard: user not authenticated, redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
    } else {
      console.log('🔐 AuthGuard: user already authenticated, access granted');
    }
  }, [isAuthenticated, loading, user, requireAuth, redirectTo, navigate]);

  if (!requireAuth) return <>{children}</>;
  if (loading && showLoading) return <LoadingSpinner />;
  if (loading) return null;
  if (!isAuthenticated || !user) return fallback ? <>{fallback}</> : null;
  return <>{children}</>;
};
