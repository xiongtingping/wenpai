/**
 * 🚀 主应用组件
 *
 * 功能：
 * - 统一路由管理
 * - 全局状态管理
 * - 用户认证集成
 * - 主题和样式管理
 * - 统一认证权限
 * - 路由守卫访问
 * - 安全状态管理
 */

import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
// import { ThemeProvider } from '@/contexts/ThemeContext'; // 🔧 FIX: 禁用ThemeContext，使用ThemeToggle统一管理主题
// 延迟i18n初始化以避免TDZ循环依赖
// import './i18n'; // 移除静态导入
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
import { useTokenLimitManager } from '@/hooks/useTokenLimitManager';
import { cloudSyncService } from '@/services/cloudSyncService';
import { isFeatureEnabled } from '@/config/featureToggles';

// 核心页面组件
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';

// 业务功能页面 - 优化懒加载策略
import PaymentPage from '@/pages/PaymentPage';
import PaymentStatusPage from '@/pages/PaymentStatusPage';
import PaymentResultPage from '@/pages/PaymentResultPage';
import PaymentFeedbackPage from '@/pages/PaymentFeedbackPage';
// 非首屏页面延迟加载
// 热点页面懒加载
// 其他功能页面懒加载
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import CallbackPage from '@/pages/CallbackPage';
// Lazy loaded below
// Lazy loaded below
import { CustomLoginPage } from '@/pages/CustomLoginPage21st';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
// 临时调试页面
import TokenDebugPage from '@/pages/TokenDebugPage';
import TokenUsageDiagnosticPage from '@/pages/TokenUsageDiagnosticPage';
import DialogTestPage from '@/pages/DialogTestPage';
import DialogDebugPage from '@/pages/DialogDebugPage';
import I18nTestPage from '@/pages/I18nTestPage';
import UserDebugPage from '@/pages/UserDebugPage';
import DiagnosticPage from '@/pages/DiagnosticPage';

// 🚀 优化的懒加载策略 - 按使用频率和大小分组
// 创意工具类 - 大型页面组件
const LazyCreativeStudioPage = React.lazy(() => import('@/pages/CreativeStudioPage'));
const LazyBrandLibraryPage = React.lazy(() => import('@/pages/BrandLibraryPage'));
const LazyNewAdaptPage = React.lazy(() => import('@/pages/NewAdaptPage'));

// 功能页面类 - 中等大小页面组件
const LazyProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const LazyHistoryPage = React.lazy(() => import('@/pages/HistoryPage'));
const LazyShareManagerPage = React.lazy(() => import('@/pages/ShareManagerPage'));
const LazyWechatTemplatePage = React.lazy(() => import('@/pages/WechatTemplatePage'));
const LazySettingsPage = React.lazy(() => import('@/pages/SettingsPage'));

// 热点话题类 - 特定功能页面
const LazyHotTopicsPage = React.lazy(() => import('@/pages/HotTopicsPage'));
const LazyEnhancedHotTopicsPage = React.lazy(() => import('@/pages/EnhancedHotTopicsPage'));

// 其他功能页面
const LazyBookmarkPage = React.lazy(() => import('@/pages/BookmarkPage'));
const LazyTermsPage = React.lazy(() => import('@/pages/TermsPage'));
const LazyPrivacyPage = React.lazy(() => import('@/pages/PrivacyPage'));
const LazyEmojiPage = React.lazy(() => import('@/pages/EmojiPage'));

// 订阅权限系统演示页面
const LazyPermissionDemoPage = React.lazy(() => import('@/pages/PermissionDemo'));
const LazyUpgradeComparisonPage = React.lazy(() => import('@/pages/UpgradeComparisonPage'));
const LazyFeatureShowcasePage = React.lazy(() => import('@/pages/FeatureShowcasePage'));
// 浏览器扩展页面（新）
const LazyBrowserExtensionPage = React.lazy(() => import('@/pages/BrowserExtensionPage'));

// 🔧 错误边界包装器，处理懒加载失败
// 移除内部Suspense，避免双层嵌套导致loading卡住
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<div className="flex items-center justify-center min-h-[200px] text-muted-foreground">页面加载失败</div>}>
      {children}
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

// 将依赖 useAuth 的逻辑下沉到 Provider 内部，避免在 Provider 外部调用 useAuth
const SubscriptionBootstrap: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      const preloadSubscription = async () => {
        try {
          const { useSubscriptionStore } = await import('@/stores/subscription-store');
          await useSubscriptionStore.getState().preloadStatus(user.id, user);
        } catch (error) {
          console.error('❌ 订阅状态预加载失败:', error);
        }
      };

      preloadSubscription();

      cloudSyncService.manualSync(user.id).catch((error) => {
        console.error('❌ 云端同步失败:', error);
      });

      cloudSyncService.start(user.id);

      return () => {
        cloudSyncService.stop();
      };
    }
  }, [user?.id]);

  return null;
};

const TokenLimitBootstrap: React.FC = () => {
  const { user } = useAuth();
  const { TokenLimitDialogComponent } = useTokenLimitManager(user?.id, (user as any)?.userTier);
  return <TokenLimitDialogComponent />;
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
    // 🔧 修复TDZ错误：异步初始化服务依赖
    const initServices = async () => {
      try {
        // 1. 首先初始化服务依赖（包括requestClient注册）
        const ServiceInitializer = await import('@/services/serviceInitializer');
        await ServiceInitializer.default.initialize();

        // 2. 然后初始化i18n
        await import('@/i18n');
      } catch (error) {
        console.error('❌ Service initialization failed:', error);
      }
    };

    initServices();

    // 🔧 FIX: 应用启动时加载用户保存的主题，ThemeToggle 稍后会验证权限
    const loadPersistedTheme = () => {
      try {
        const html = document.documentElement;

        // 从 localStorage 读取用户保存的主题偏好
        const savedTheme = localStorage.getItem('theme');
        const validThemes = ['light', 'dark', 'rainbow', 'beige', 'green'];

        // 如果有保存的主题且有效，先应用（信任用户之前的选择）
        // ThemeToggle 初始化后会根据实时权限验证并调整
        const themeToApply = (savedTheme && validThemes.includes(savedTheme)) ? savedTheme : 'light';

        html.setAttribute('data-theme', themeToApply);
        html.classList.remove('light', 'dark', 'rainbow', 'beige', 'green');
        html.classList.add(themeToApply);

        // Tailwind dark 类兼容性
        if (themeToApply === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }

      } catch (error) {
        console.error('🎨 Failed to load persisted theme:', error);
      }
    };

    // 立即执行主题加载
    loadPersistedTheme();

    // {t('app.startup.checkMaliciousCallback')}
    const currentUrl = window.location.href;

    // 🔧 DEBUG: 强制检查Authing配置加载情况
    //   VITE_AUTHING_APP_ID: import.meta.env.VITE_AUTHING_APP_ID,
    //   VITE_AUTHING_DOMAIN: import.meta.env.VITE_AUTHING_DOMAIN,
    //   VITE_AUTHING_HOST: import.meta.env.VITE_AUTHING_HOST,
    //   DEV: import.meta.env.DEV
    // });

    // GuardProvider 已移除 - 仅使用自定义登录表单

    // 立即处理恶意回调URL重定向
    if (currentUrl.includes('callbackhttp:// ')) {
      console.log('🚨 App layer detected malicious callback URL, handling redirect...');

      const codeMatch = currentUrl.match(/code=([^&]+)/);
      const stateMatch = currentUrl.match(/state=([^&]+)/);

      if (codeMatch && stateMatch) {
        const code = codeMatch[1];
        const state = stateMatch[1];

        // 重定向到正确的回调URL
        const correctCallbackUrl = `${window.location.origin}/callback?code=${code}&state=${state}`;
        window.location.href = correctCallbackUrl;
        return;
      }
    }
  }, []);

  return (
    <EnhancedErrorBoundary
      level='page'
      enableAutoRecovery={true}
      onError={(error) => {
        // 🔧 FIXED: 改进错误处理，避免输出Object
        try {
          const errorDetails = {
            message: error?.message || t('app.errors.unknownError'),
            name: (error as any)?.name || t('app.errors.unknownErrorType'),
            stack: error?.stack || t('app.errors.noStackTrace'),
            errorType: typeof error,
            errorString: String(error),
            // 安全地序列化错误对象
            serializedError: JSON.stringify(error, Object.getOwnPropertyNames(error))
          };

          console.error('🚨 App-level error details:', errorDetails);

          // 如果是网络相关错误，提供额外信息
          if (errorDetails.message.includes('Network') || errorDetails.message.includes('CORS')) {
            console.warn('💡 This may be a network connection or CORS configuration issue, does not affect Dialog repair functionality');
          }

        } catch (logError) {
          // 如果错误处理本身失败，使用最简单的方式
          console.error('🚨 App-level error (simplified):', error?.message || String(error));
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
                    {/* 🔧 FIX: Suspense fallback不使用i18n，避免循环依赖导致无限loading */}
                    <Suspense fallback={
                      <div className="flex items-center justify-center min-h-screen">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span className="text-sm text-muted-foreground">加载中...</span>
                        </div>
                      </div>
                    }>
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

                        {/* 📌 统一路由命名：热点话题 - 懒加载优化 */}
                        {isFeatureEnabled('hotTopics') && (
                          <>
                            <Route path='/hot-topics' element={
                              <LazyWrapper>
                                <LazyHotTopicsPage />
                              </LazyWrapper>
                            } />
                            <Route path='/enhanced-hot-topics' element={
                              <LazyWrapper>
                                <LazyEnhancedHotTopicsPage />
                              </LazyWrapper>
                            } />
                          </>
                        )}

                        {/* 📌 统一路由命名：收藏和书签 - 懒加载优化 */}
                        <Route path='/my-library' element={
                          <AuthGuard>
                            <LazyWrapper>
                              <LazyBookmarkPage />
                            </LazyWrapper>
                          </AuthGuard>
                        } />
                        <Route path='/brand-library' element={<AuthGuard><LazyWrapper><LazyBrandLibraryPage /></LazyWrapper></AuthGuard>} />
                        <Route path='/history' element={<AuthGuard><LazyWrapper><LazyHistoryPage /></LazyWrapper></AuthGuard>} />
                        {/* 兼容旧路由 */}
                        <Route path='/bookmarks' element={<Navigate to="/my-library" replace />} />
                        <Route path='/bookmark' element={<Navigate to="/my-library" replace />} />
                        <Route path='/library' element={<Navigate to="/my-library" replace />} />

                        {/* 📌 统一路由命名：表情符号生成器 - 懒加载优化 */}
                        <Route path='/emoji-generator' element={
                          <LazyWrapper>
                            <LazyEmojiPage />
                          </LazyWrapper>
                        } />
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
                        <Route path='/upgrade-plans' element={
                          <LazyWrapper>
                            <LazyUpgradeComparisonPage />
                          </LazyWrapper>
                        } />
                        {/* 兼容旧路由 */}
                        <Route path='/payment' element={<Navigate to="/payment-center" replace />} />
                        <Route path='/payment/result' element={<Navigate to="/payment-center/result" replace />} />
                        <Route path='/payment/feedback' element={<Navigate to="/payment-center/feedback" replace />} />
                        <Route path='/upgrade' element={<Navigate to="/upgrade-plans" replace />} />

                        {/* 📌 订阅权限系统演示页面 */}
                        <Route path='/permission-demo' element={
                          <LazyWrapper>
                            <LazyPermissionDemoPage />
                          </LazyWrapper>
                        } />

                        {/* 浏览器扩展页面 */}
                        <Route path='/browser-extension' element={
                          <LazyWrapper>
                            <LazyBrowserExtensionPage />
                          </LazyWrapper>
                        } />

                        {/* 📌 统一路由命名：信息页面 */}
                        <Route path='/about-us' element={<AboutPage />} />
                        <Route path='/terms-of-service' element={
                          <LazyWrapper>
                            <LazyTermsPage />
                          </LazyWrapper>
                        } />
                        <Route path='/privacy-policy' element={
                          <LazyWrapper>
                            <LazyPrivacyPage />
                          </LazyWrapper>
                        } />
                        <Route path='/feature-showcase' element={
                          <LazyWrapper>
                            <LazyFeatureShowcasePage />
                          </LazyWrapper>
                        } />
                        {/* 兼容旧路由 */}
                        <Route path='/about' element={<Navigate to="/about-us" replace />} />
                        <Route path='/terms' element={<Navigate to="/terms-of-service" replace />} />
                        <Route path='/privacy' element={<Navigate to="/privacy-policy" replace />} />
                        <Route path='/features' element={<Navigate to="/feature-showcase" replace />} />

                        {/* 临时调试页面 - 用于Token统计修复 */}
                        <Route path='/token-debug' element={<TokenDebugPage />} />
                        <Route path='/token-diagnostic' element={<TokenUsageDiagnosticPage />} />

                        {/* Dialog定位测试页面 */}
                        <Route path='/dialog-test' element={<DialogTestPage />} />
                        <Route path='/dialog-debug' element={<DialogDebugPage />} />

                        {/* 国际化测试页面 */}
                        <Route path='/i18n-test' element={<I18nTestPage />} />

                        {/* 用户调试页面 */}
                        <Route path='/user-debug' element={<UserDebugPage />} />

                        {/* 系统诊断页面 */}
                        <Route path='/diagnostic' element={<DiagnosticPage />} />

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

                  {/* Token限额管理对话框 */}
                  <TokenLimitBootstrap />

                  {/* {t('app.globalComponents.backToTopButton')} */}
                  <ScrollToTop />
                <SubscriptionBootstrap />

                </>
              {/* 🔧 FIXED: 移除冗余的ErrorBoundary结束标签 */}
            </AuthDataSyncProvider>
          {/* </ThemeProvider> 🔧 FIX: 禁用ThemeContext，避免与ThemeToggle冲突 */}
        </UnifiedAuthProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;
