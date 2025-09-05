/**
 * 🚀 文派 - 主应用组件 (已清理测试代码)
 *
 * 功能：
 * - 统一路由管理
 * - 全局状态管理
 * - 用户认证集成
 * - 主题和样式管理
 *
 * 🔒 安全特性：
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthGuard, ProGuard, PremiumGuard } from '@/components/auth/RouteGuard';
import { useUnifiedUserStateManager, useStatePreloader, useSmartStateRefresh } from '@/hooks/useUnifiedUserState';
import { GuardProvider } from '@authing/guard-react18';
import { AuthModalWrapper } from '@/components/auth/AuthModalWrapper';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { AuthDataSyncProvider } from '@/hooks/useAuthDataSync';
import '@authing/guard-react18/dist/esm/guard.min.css';

// 核心页面组件
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';

// 业务功能页面
import PaymentPage from '@/pages/PaymentPage';
import PaymentStatusPage from '@/pages/PaymentStatusPage';
import PaymentResultPage from '@/pages/PaymentResultPage';
import PaymentFeedbackPage from '@/pages/PaymentFeedbackPage';
import AdaptPage from '@/pages/AdaptPage';
import CreativeStudioPage from '@/pages/CreativeStudioPage';
import HotTopicsPage from '@/pages/HotTopicsPage';
import EnhancedHotTopicsPage from '@/pages/EnhancedHotTopicsPage';
import BookmarkPage from '@/pages/BookmarkPage';
import BrandLibraryPage from '@/pages/BrandLibraryPage';
import ProfilePage from '@/pages/ProfilePage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import EmojiPage from '@/pages/EmojiPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import CallbackPage from '@/pages/CallbackPage';
import SettingsPage from '@/pages/SettingsPage';
import HistoryPage from '@/pages/HistoryPage';
import UpgradeComparisonPage from '@/pages/UpgradeComparisonPage';
import FeatureShowcasePage from '@/pages/FeatureShowcasePage';
import ShareManagerPage from '@/pages/ShareManagerPage';
import WechatTemplatePage from '@/pages/WechatTemplatePage';
import { CustomLoginPage } from '@/pages/CustomLoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
// 移除调试页面
// 移除测试组件

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
  useUnifiedUserStateManager(); // 初始化统一状态管理
  useStatePreloader(); // 预加载状态
  useSmartStateRefresh(); // 智能状态刷新
  return null;
};

/**
 * 主应用组件
 */
const App: React.FC = () => {
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
    
    // 🔧 DEBUG: 检查GuardProvider配置
    const appId = import.meta.env.VITE_AUTHING_APP_ID || (globalThis as any).__ENV__?.VITE_AUTHING_APP_ID;
    const host = import.meta.env.VITE_AUTHING_HOST || (globalThis as any).__ENV__?.VITE_AUTHING_HOST;
    console.log('🔧 GuardProvider配置检查:', { appId, host, hasAppId: !!appId, hasHost: !!host });
    
    // 立即处理恶意回调URL重定向
    if (currentUrl.includes('callbackhttp://')) {
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
    <ErrorBoundary>
      <ThemeProvider>
        <ErrorBoundary>
          <GuardProvider
            appId={import.meta.env.VITE_AUTHING_APP_ID || (globalThis as any).__ENV__?.VITE_AUTHING_APP_ID}
            mode="modal"
            host={import.meta.env.VITE_AUTHING_HOST || (globalThis as any).__ENV__?.VITE_AUTHING_HOST}
            config={{
              autoRegister: true,
              placeholder: {
                username: '请输入用户名',
                email: '请输入邮箱',
                password: '请输入密码'
              },
              // 🔧 FIX: 添加网络连接优化配置
              timeout: 30000, // 30秒超时
              retry: 1, // 减少重试次数
              retryDelay: 1000, // 1秒重试延迟
              // 添加错误处理
              onError: (error: any) => {
                console.warn('🔧 Guard Provider错误:', error);
                // 静默处理网络错误，不影响应用启动
                const isNetworkError = error?.message?.includes('Failed to fetch') ||
                                      error?.message?.includes('ERR_CONNECTION') ||
                                      error?.message?.includes('net::');
                if (isNetworkError) {
                  console.log('🔧 Guard网络连接问题，应用继续正常运行');
                }
              }
            }}
          >
            <UnifiedAuthProvider>
              <AuthDataSyncProvider>
                <ErrorBoundary>
                  <StateManagerInitializer />
                      <>
                    <ConditionalNavigation>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* 首页 */}
                        <Route path="/" element={<HomePage />} />

                        {/* 登录页面 */}
                        <Route path="/custom-login" element={<CustomLoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                        {/* 登录回调页面 - 支持各种回调URL格式 */}
                        <Route path="/callback" element={<CallbackPage />} />
                        <Route path="/callback/" element={<CallbackPage />} />
                        <Route path="/callback/*" element={<CallbackPage />} />
                        <Route path="/callbackhttp/*" element={<CallbackPage />} />

                        {/* 核心功能页面 - 需要登录 */}
                        <Route path="/adapt" element={<AuthGuard><AdaptPage /></AuthGuard>} />
                        <Route path="/creative-studio" element={<AuthGuard><CreativeStudioPage /></AuthGuard>} />
                        <Route path="/hot-topics" element={<HotTopicsPage />} />
                        <Route path="/enhanced-hot-topics" element={<EnhancedHotTopicsPage />} />
                        <Route path="/bookmark" element={<AuthGuard><BookmarkPage /></AuthGuard>} />
                        <Route path="/library" element={<AuthGuard><BookmarkPage /></AuthGuard>} />
                        <Route path="/brand-library" element={<AuthGuard><BrandLibraryPage /></AuthGuard>} />
                        <Route path="/history" element={<AuthGuard><HistoryPage /></AuthGuard>} />
                        <Route path="/emoji" element={<EmojiPage />} />
                        <Route path="/share-manager" element={<AuthGuard><ShareManagerPage /></AuthGuard>} />
                        <Route path="/wechat-templates" element={<AuthGuard><WechatTemplatePage /></AuthGuard>} />

                        {/* 用户相关页面 - 需要登录 */}
                        <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
                        <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />

                        {/* 支付相关页面 */}
                        <Route path="/payment" element={<PaymentPage />} />
                        <Route path="/payment/result" element={<PaymentResultPage />} />
                        <Route path="/payment/feedback" element={<PaymentFeedbackPage />} />
                        <Route path="/payment-status" element={<PaymentStatusPage />} />
                        <Route path="/upgrade" element={<UpgradeComparisonPage />} />

                        {/* 信息页面 */}
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/features" element={<FeatureShowcasePage />} />


                        {/* 调试页面已移除 */}

                        {/* 错误页面 */}
                        <Route path="/403" element={<ForbiddenPage />} />
                        <Route path="/404" element={<NotFoundPage />} />
                        
                        {/* 捕获所有未匹配路由，检查是否为恶意回调URL */}
                        <Route path="*" element={<CallbackPage />} />
                      </Routes>
                    </Suspense>
                  </ConditionalNavigation>

                  {/* 全局通知组件 */}
                  <Toaster />

                  {/* 自定义认证模态框 */}
                  <AuthModalWrapper />

                  {/* 返回顶部按钮 */}
                  <ScrollToTop />
                      </>
                </ErrorBoundary>
              </AuthDataSyncProvider>
            </UnifiedAuthProvider>
          </GuardProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
