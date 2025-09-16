/**
 * 🚀 文派 - 主应用组件 (已清理测试代码);
 *
 * 功能：
 * - 统一路由管理
 * - 全局状态管理
 * - 用户认证集成
 * - 主题和样式管理
 *
 *
 * - 统一的用户认证和权限控制
 * - 路由守卫和访问控制
 * - 安全的状态管理
 */

import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './i18n';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EnhancedErrorBoundary } from '@/components/errors/EnhancedErrorBoundary';
import { AuthGuard, ProGuard, PremiumGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/hooks/useAuth';
import { AuthModalWrapper } from '@/components/auth/AuthModalWrapper';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { AuthDataSyncProvider } from '@/hooks/useAuthDataSync';
import SessionManager from '@/components/auth/SessionManager';

// 核心页面组件
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';

// 业务功能页面
import PaymentPage from '@/pages/PaymentPage';
import PaymentStatusPage from '@/pages/PaymentStatusPage';
import PaymentResultPage from '@/pages/PaymentResultPage';
import PaymentFeedbackPage from '@/pages/PaymentFeedbackPage';
// Lazy loaded below
// import AdaptPage from '@/pages/AdaptPage';
// Lazy loaded below
import HotTopicsPage from '@/pages/HotTopicsPage';
import EnhancedHotTopicsPage from '@/pages/EnhancedHotTopicsPage';
import BookmarkPage from '@/pages/BookmarkPage';
// Lazy loaded below
// Lazy loaded below
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import EmojiPage from '@/pages/EmojiPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import CallbackPage from '@/pages/CallbackPage';
// Lazy loaded below
// Lazy loaded below
import UpgradeComparisonPage from '@/pages/UpgradeComparisonPage';
import FeatureShowcasePage from '@/pages/FeatureShowcasePage';
// Lazy loaded below
// Lazy loaded below
import { CustomLoginPage } from '@/pages/CustomLoginPage21st';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
// 临时调试页面
import TokenDebugPage from '@/pages/TokenDebugPage';
import DialogTestPage from '@/pages/DialogTestPage';
import I18nTestPage from '@/pages/I18nTestPage';

// 🔧 FIX: 懒加载组件，避免TDZ错误和循环依赖
const LazyCreativeStudioPage = React.lazy(() => import('@/pages/CreativeStudioPage'));
const LazyBrandLibraryPage = React.lazy(() => import('@/pages/BrandLibraryPage'));
const LazyProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const LazyHistoryPage = React.lazy(() => import('@/pages/HistoryPage'));
const LazyShareManagerPage = React.lazy(() => import('@/pages/ShareManagerPage'));
const LazyWechatTemplatePage = React.lazy(() => import('@/pages/WechatTemplatePage'));
const LazyNewAdaptPage = React.lazy(() => import('@/pages/NewAdaptPage'));

const LazySettingsPage = React.lazy(() => import('@/pages/SettingsPage'));

// 🔧 错误边界包装器，处理懒加载失败
const LazyWrapper: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => {
  const { t } = useTranslation();
  return (
    <ErrorBoundary fallback={<div>{t('app.errors.pageLoadFailed') }</div>}>
      <Suspense fallback={fallback || <LoadingSpinner text={t('app.common.loading')} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * 条件性导航组件
 */
const ConditionalNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * 统一状态管理初始化组件 - 修复状态闪烁问题
 */
const StateManagerInitializer: React.FC = () => {
  // 使用真实的认证状态
  useAuth();
  return null;
};

/**
 * 主应用组件
 */
const App: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // 应用启动时检查是否为恶意回调URL
    const currentUrl = window.location.href;
    console.log('🚀 App启动，当前URL:', currentUrl);

    // 🔧 DEBUG: 强制检查Authing配置加载情况
    console.log('🔧 检查环境变量加载:', {
      VITE_AUTHING_APP_ID: import.meta.env.VITE_AUTHING_APP_ID,
      VITE_AUTHING_DOMAIN: import.meta.env.VITE_AUTHING_DOMAIN,
      VITE_AUTHING_HOST: import.meta.env.VITE_AUTHING_HOST,
      DEV: import.meta.env.DEV
    });

    // GuardProvider 已移除 - 仅使用自定义登录表单

    // 立即处理恶意回调URL重定向
    if (currentUrl.includes('callbackhttp:// ')) {
      console.log('🚨 App层检测到恶意回调URL，立即处理重定向...');

      const codeMatch = currentUrl.match(/code=([^&]+)/);
      const stateMatch = currentUrl.match(/state=([^&]+)/);

      if (codeMatch && stateMatch) {
        const code = codeMatch[1];
        const state = stateMatch[1];
        console.log('✅ App层解析到授权码:', { code: code.substring(0, 10) + '...', state });

        // 重定向到正确的回调URL
        const correctCallbackUrl = `${window.location.origin}/callback?code=${code}&state=${state}`;
        console.log('🔄 App层重定向到:', correctCallbackUrl);
        window.location.href = correctCallbackUrl;
        return;
      }
    }
  }, []);

  return (
    <EnhancedErrorBoundary
      level='application'
      enableAutoRecovery={true}
      enablePerformanceTracking={true}
      onError={(error) => {
        console.error('🚨 应用级错误:', error);
      }}
    >
      <UnifiedAuthProvider>
        <ThemeProvider>
          <AuthDataSyncProvider>
            <ErrorBoundary>
              <StateManagerInitializer />
              <>
                <ConditionalNavigation>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* 首页 */}
                        <Route path='/' element={<HomePage />} />

                        {/* 登录注册页面 */}
                        <Route path='/login' element={<CustomLoginPage />} />
                        <Route path='/register' element={<CustomLoginPage />} />
                        <Route path='/forgot-password' element={<ForgotPasswordPage />} />

                        {/* 兼容旧路由 */}
                        <Route path='/custom-login' element={<CustomLoginPage />} />

                        {/* 登录回调页面 - 支持各种回调URL格式 */}
                        <Route path='/callback' element={<CallbackPage />} />
                        <Route path='/callback/' element={<CallbackPage />} />
                        <Route path='/callback/*' element={<CallbackPage />} />
                        <Route path='/callbackhttp/*' element={<CallbackPage />} />

                        {/* 核心功能页面 - 需要登录 */}
                        <Route path='/adapt' element={<AuthGuard><LazyWrapper><LazyNewAdaptPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/adapt-new' element={<AuthGuard><LazyWrapper><LazyNewAdaptPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/creative-studio' element={<AuthGuard><LazyWrapper><LazyCreativeStudioPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/hot-topics' element={<HotTopicsPage />} />
                        <Route path='/enhanced-hot-topics' element={<EnhancedHotTopicsPage />} />
                        <Route path='/bookmark' element={<AuthGuard><BookmarkPage /></AuthGuard>} />
                        <Route path='/library' element={<AuthGuard><BookmarkPage /></AuthGuard>} />
                        <Route path='/brand-library' element={<AuthGuard><LazyWrapper><LazyBrandLibraryPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/history' element={<AuthGuard><LazyWrapper><LazyHistoryPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/emoji' element={<EmojiPage />} />
                        <Route path='/share-manager' element={<AuthGuard><LazyWrapper><LazyShareManagerPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/wechat-templates' element={<AuthGuard><LazyWrapper><LazyWechatTemplatePage /></LazyWrapper></AuthGuard>} />

                        {/* 用户相关页面 - 需要登录 */}
                        <Route path='/profile' element={<AuthGuard><LazyWrapper><LazyProfilePage /></LazyWrapper></AuthGuard>} />
                        <Route path='/settings' element={<AuthGuard><LazyWrapper><LazySettingsPage /></LazyWrapper></AuthGuard>} />

                        {/* 支付相关页面 */}
                        <Route path='/payment' element={<PaymentPage />} />
                        <Route path='/payment/result' element={<PaymentResultPage />} />
                        <Route path='/payment/feedback' element={<PaymentFeedbackPage />} />
                        <Route path='/payment-status' element={<PaymentStatusPage />} />
                        <Route path='/upgrade' element={<UpgradeComparisonPage />} />

                        {/* 信息页面 */}
                        <Route path='/about' element={<AboutPage />} />
                        <Route path='/terms' element={<TermsPage />} />
                        <Route path='/privacy' element={<PrivacyPage />} />
                        <Route path='/features' element={<FeatureShowcasePage />} />

                        {/* 临时调试页面 - 用于Token统计修复 */}
                        <Route path='/token-debug' element={<TokenDebugPage />} />

                        {/* Dialog定位测试页面 */}
                        <Route path='/dialog-test' element={<DialogTestPage />} />

                        {/* 国际化测试页面 */}
                        <Route path='/i18n-test' element={<I18nTestPage />} />

                        {/* 错误页面 */}
                        <Route path='/403' element={<ForbiddenPage />} />
                        <Route path='/404' element={<NotFoundPage />} />

                        {/* 捕获所有未匹配路由，检查是否为恶意回调URL */}
                        <Route path='*' element={<CallbackPage />} />
                      </Routes>
                    </Suspense>
                  </ConditionalNavigation>

                  {/* 全局通知组件 */}
                  <Toaster />

                  {/* 自定义认证模态框 */}
                  <AuthModalWrapper />

                  {/* 会话管理 */}
                  <SessionManager />

                  {/* 返回顶部按钮 */}
                  <ScrollToTop />
                </>
              </ErrorBoundary>
            </AuthDataSyncProvider>
          </ThemeProvider>
        </UnifiedAuthProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;
