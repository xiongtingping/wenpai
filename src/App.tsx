/**
 * 🚀 {t('app.comments.mainAppComponent')};
 *
 * 功能：
 * - 统一路由管理
 * - 全局状态管理
 * - 用户认证集成
 * - 主题和样式管理
 *
 *
 * - {t('app.comments.unifiedAuthPermission')}
 * - {t('app.comments.routeGuardAccess')}
 * - {t('app.comments.secureStateManagement')}
 */

import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
// import { ThemeProvider } from '@/contexts/ThemeContext'; // 🔧 FIX: 禁用ThemeContext，使用ThemeToggle统一管理主题
import './i18n';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EnhancedErrorBoundary } from '@/components/errors/EnhancedErrorBoundary';
import { AuthGuard, ProGuard, PremiumGuard } from '@/components/auth/RouteGuard';
import { useAuth } from '@/hooks/useAuth';
import { AuthModalWrapper } from '@/components/auth/AuthModalWrapper';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { AuthDataSyncProvider } from '@/hooks/useAuthDataSync';
import SessionManager from '@/components/auth/SessionManager';
import { Header } from '@/components/landing/Header';

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
import DialogDebugPage from '@/pages/DialogDebugPage';
import I18nTestPage from '@/pages/I18nTestPage';
import UserDebugPage from '@/pages/UserDebugPage';

// 🔧 FIX: 懒加载组件，避免TDZ错误和循环依赖
const LazyCreativeStudioPage = React.lazy(() => import('@/pages/CreativeStudioPage'));
const LazyCreativeStudioPageTest = React.lazy(() => import('@/pages/CreativeStudioPageTest'));
const LazyCreativeCubePage = React.lazy(() => import('@/pages/CreativeCubePage'));
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
  const location = useLocation();
  
  // 定义不需要显示Header的路由
  const noHeaderRoutes = ['/login', '/register', '/custom-login', '/forgot-password'];
  const shouldShowHeader = !noHeaderRoutes.includes(location.pathname);

  useEffect(() => {
    // 🔧 FIX: 应用启动时立即加载持久化主题，避免闪烁
    const loadPersistedTheme = () => {
      try {
        // 从localStorage读取持久化主题
        const globalTheme = localStorage.getItem('theme');
        const validThemes = ['light', 'dark', 'rainbow', 'beige', 'green'];
        
        if (globalTheme && validThemes.includes(globalTheme)) {
          console.log(`🎨 加载持久化主题: ${globalTheme}`);
          
          const html = document.documentElement;
          html.setAttribute('data-theme', globalTheme);
          
          // 清除所有主题类，应用新主题
          html.classList.remove('light', 'dark', 'rainbow', 'beige', 'green');
          html.classList.add(globalTheme);
          
          // Tailwind dark类兼容性
          if (globalTheme === 'dark') {
            html.classList.add('dark');
          } else {
            html.classList.remove('dark');
          }
          
          console.log(`🎨 主题已应用: ${globalTheme}`);
        } else {
          console.log('🎨 使用默认浅色主题');
        }
      } catch (error) {
        console.error('🎨 加载持久化主题失败:', error);
      }
    };
    
    // 立即执行主题加载
    loadPersistedTheme();

    // {t('app.startup.checkMaliciousCallback')}
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
        console.log('✅ 解析认证码:', { code: code.substring(0, 10) + '...', state });

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
        // 🔧 FIXED: 改进错误处理，避免输出Object
        try {
          const errorDetails = {
            message: error?.message || t('app.errors.unknownError'),
            name: error?.name || t('app.errors.unknownErrorType'),
            stack: error?.stack || t('app.errors.noStackTrace'),
            errorType: typeof error,
            errorString: String(error),
            // 安全地序列化错误对象
            serializedError: JSON.stringify(error, Object.getOwnPropertyNames(error))
          };

          console.error('🚨 应用级错误详情:', errorDetails);

          // 如果是网络相关错误，提供额外信息
          if (errorDetails.message.includes('Network') || errorDetails.message.includes('CORS')) {
            console.warn('💡 这可能是网络连接或CORS配置问题，不影响Dialog修复功能');
          }

        } catch (logError) {
          // 如果错误处理本身失败，使用最简单的方式
          console.error('🚨 应用级错误 (简化):', error?.message || String(error));
        }
      }}
    >
      <UnifiedAuthProvider>
        {/* <ThemeProvider> 🔧 FIX: 禁用ThemeContext，避免与ThemeToggle冲突 */}
          <AuthDataSyncProvider>
            {/* 🔧 FIXED: 移除冗余的ErrorBoundary，避免嵌套错误边界混乱 */}
            <StateManagerInitializer />
            <>
              {/* 🎯 修复完成的Header组件 - 条件渲染，登录页面不显示 */}
              {shouldShowHeader && <Header />}
              
              <ConditionalNavigation>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* {t('app.routes.homePage')} */}
                        <Route path='/' element={<HomePage />} />

                        {/* {t('app.routes.loginRegisterPages')} */}
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

                        {/* {t('app.routes.coreFunctionPages')} */}
                        {/* 📌 统一路由命名：内容适配器 */}
                        <Route path='/content-adapter' element={<AuthGuard><LazyWrapper><LazyNewAdaptPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/content-adapter-new' element={<AuthGuard><LazyWrapper><LazyNewAdaptPage /></LazyWrapper></AuthGuard>} />
                        {/* 兼容旧路由 */}
                        <Route path='/adapt' element={<Navigate to="/content-adapter" replace />} />
                        <Route path='/adapt-new' element={<Navigate to="/content-adapter-new" replace />} />
                        
                        {/* 📌 统一路由命名：创意工具 */}
                        <Route path='/creative-studio' element={<AuthGuard><LazyWrapper><LazyCreativeStudioPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/creative-studio-test' element={<AuthGuard><LazyWrapper><LazyCreativeStudioPageTest /></LazyWrapper></AuthGuard>} />
                        <Route path='/creative-cube' element={<AuthGuard><LazyWrapper><LazyCreativeCubePage /></LazyWrapper></AuthGuard>} />
                        
                        {/* 📌 统一路由命名：热点话题 */}
                        <Route path='/hot-topics' element={<HotTopicsPage />} />
                        <Route path='/enhanced-hot-topics' element={<EnhancedHotTopicsPage />} />
                        
                        {/* 📌 统一路由命名：收藏和书签 */}
                        <Route path='/my-library' element={<AuthGuard><BookmarkPage /></AuthGuard>} />
                        <Route path='/brand-library' element={<AuthGuard><LazyWrapper><LazyBrandLibraryPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/history' element={<AuthGuard><LazyWrapper><LazyHistoryPage /></LazyWrapper></AuthGuard>} />
                        {/* 兼容旧路由 */}
                        <Route path='/bookmarks' element={<Navigate to="/my-library" replace />} />
                        <Route path='/bookmark' element={<Navigate to="/my-library" replace />} />
                        <Route path='/library' element={<Navigate to="/my-library" replace />} />
                        
                        {/* 📌 统一路由命名：表情符号生成器 */}
                        <Route path='/emoji-generator' element={<EmojiPage />} />
                        {/* 兼容旧路由 */}
                        <Route path='/emoji' element={<Navigate to="/emoji-generator" replace />} />
                        
                        {/* 📌 统一路由命名：工具和管理 */}
                        <Route path='/share-manager' element={<AuthGuard><LazyWrapper><LazyShareManagerPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/wechat-templates' element={<AuthGuard><LazyWrapper><LazyWechatTemplatePage /></LazyWrapper></AuthGuard>} />

                        {/* 📌 统一路由命名：用户相关页面 */}
                        <Route path='/user-profile' element={<AuthGuard><LazyWrapper><LazyProfilePage /></LazyWrapper></AuthGuard>} />
                        <Route path='/user-settings' element={<AuthGuard><LazyWrapper><LazySettingsPage /></LazyWrapper></AuthGuard>} />
                        {/* 兼容旧路由 */}
                        <Route path='/profile' element={<Navigate to="/user-profile" replace />} />
                        <Route path='/settings' element={<Navigate to="/user-settings" replace />} />

                        {/* 📌 统一路由命名：支付相关页面 */}
                        <Route path='/payment-center' element={<PaymentPage />} />
                        <Route path='/payment-center/result' element={<PaymentResultPage />} />
                        <Route path='/payment-center/feedback' element={<PaymentFeedbackPage />} />
                        <Route path='/payment-status' element={<PaymentStatusPage />} />
                        <Route path='/upgrade-plans' element={<UpgradeComparisonPage />} />
                        {/* 兼容旧路由 */}
                        <Route path='/payment' element={<Navigate to="/payment-center" replace />} />
                        <Route path='/payment/result' element={<Navigate to="/payment-center/result" replace />} />
                        <Route path='/payment/feedback' element={<Navigate to="/payment-center/feedback" replace />} />
                        <Route path='/upgrade' element={<Navigate to="/upgrade-plans" replace />} />

                        {/* 📌 统一路由命名：信息页面 */}
                        <Route path='/about-us' element={<AboutPage />} />
                        <Route path='/terms-of-service' element={<TermsPage />} />
                        <Route path='/privacy-policy' element={<PrivacyPage />} />
                        <Route path='/feature-showcase' element={<FeatureShowcasePage />} />
                        {/* 兼容旧路由 */}
                        <Route path='/about' element={<Navigate to="/about-us" replace />} />
                        <Route path='/terms' element={<Navigate to="/terms-of-service" replace />} />
                        <Route path='/privacy' element={<Navigate to="/privacy-policy" replace />} />
                        <Route path='/features' element={<Navigate to="/feature-showcase" replace />} />

                        {/* 临时调试页面 - 用于Token统计修复 */}
                        <Route path='/token-debug' element={<TokenDebugPage />} />

                        {/* Dialog定位测试页面 */}
                        <Route path='/dialog-test' element={<DialogTestPage />} />
                        <Route path='/dialog-debug' element={<DialogDebugPage />} />

                        {/* 国际化测试页面 */}
                        <Route path='/i18n-test' element={<I18nTestPage />} />

                        {/* 用户调试页面 */}
                        <Route path='/user-debug' element={<UserDebugPage />} />

                        {/* {t('app.routes.errorPages')} */}
                        <Route path='/403' element={<ForbiddenPage />} />
                        <Route path='/404' element={<NotFoundPage />} />

                        {/* 捕获所有未匹配路由，检查是否为恶意回调URL */}
                        <Route path='*' element={<CallbackPage />} />
                      </Routes>
                    </Suspense>
                  </ConditionalNavigation>

                  {/* {t('app.globalComponents.globalNotification')} */}
                  <Toaster />

                  {/* {t('app.globalComponents.customAuthModal')} */}
                  <AuthModalWrapper />

                  {/* {t('app.globalComponents.sessionManagement')} */}
                  <SessionManager />

                  {/* {t('app.globalComponents.backToTopButton')} */}
                  <ScrollToTop />
                </>
              {/* 🔧 FIXED: 移除冗余的ErrorBoundary结束标签 */}
            </AuthDataSyncProvider>
          {/* </ThemeProvider> 🔧 FIX: 禁用ThemeContext，避免与ThemeToggle冲突 */}
        </UnifiedAuthProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;
