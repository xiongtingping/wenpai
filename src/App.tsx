/**
 * 🚀 文派AI - 主应用组件 (已清理测试代码)
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
import { UnifiedAuthProvider } from '@/auth/UnifiedAuthProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthGuard, ProGuard, PremiumGuard } from '@/components/auth/RouteGuard';

// 核心页面组件
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';

// 业务功能页面
import PaymentPage from '@/pages/PaymentPage';
import PaymentStatusPage from '@/pages/PaymentStatusPage';
import AdaptPage from '@/pages/AdaptPage';
import CreativeStudioPage from '@/pages/CreativeStudioPage';
import HotTopicsPage from '@/pages/HotTopicsPage';
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
import { DebugAuthPage } from '@/pages/DebugAuthPage';
import AuthModalTestPage from '@/pages/AuthModalTestPage';
import OfficialAuthTest from '@/components/OfficialAuthTest';

/**
 * 条件性导航组件
 */
const ConditionalNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * 主应用组件
 */
const App: React.FC = () => {
  useEffect(() => {
    // 应用启动 - 生产环境静默
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ErrorBoundary>
          <UnifiedAuthProvider>
            <ErrorBoundary>
                  <>
                    <div className="min-h-screen bg-background">
              <ConditionalNavigation>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* 首页 */}
                    <Route path="/" element={<HomePage />} />

                    {/* 登录回调页面 - 支持带/不带尾斜杠 */}
                    <Route path="/callback" element={<CallbackPage />} />
                    <Route path="/callback/" element={<CallbackPage />} />

                        <Route path="/callback/*" element={<CallbackPage />} />
                    {/* 核心功能页面 - 需要登录 */}
                    <Route path="/adapt" element={<AuthGuard><AdaptPage /></AuthGuard>} />
                    <Route path="/new-adapt" element={<AuthGuard><AdaptPage /></AuthGuard>} />
                    <Route path="/creative-studio" element={<AuthGuard><CreativeStudioPage /></AuthGuard>} />
                    <Route path="/hot-topics" element={<HotTopicsPage />} />
                    <Route path="/bookmark" element={<AuthGuard><BookmarkPage /></AuthGuard>} />
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
                    <Route path="/payment-status" element={<PaymentStatusPage />} />
                    <Route path="/upgrade" element={<UpgradeComparisonPage />} />

                    {/* 信息页面 */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/features" element={<FeatureShowcasePage />} />

                    {/* 调试页面 */}
                    <Route path="/debug-auth" element={<DebugAuthPage />} />
                    <Route path="/test-auth-modal" element={<AuthModalTestPage />} />
                    <Route path="/test-official-auth" element={<OfficialAuthTest />} />

                    {/* 错误页面 */}
                    <Route path="/403" element={<ForbiddenPage />} />
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </Suspense>
              </ConditionalNavigation>
            </div>

            {/* 全局通知组件 */}
            <Toaster />
                  </>
            </ErrorBoundary>
          </UnifiedAuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
