import React, { Suspense, useEffect, startTransition } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useUserStore } from '@/store/userStore';
import { logEnvCheckResults } from '@/utils/envChecker';

// 核心组件 - 立即加载
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoginPage from '@/pages/LoginPage';
import LoginRegisterPage from '@/pages/LoginRegisterPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import Callback from '@/pages/Callback';
import ApiTestPage from '@/pages/ApiTestPage';
import AuthTestPage from '@/pages/AuthTestPage';
import UserStatusPage from '@/pages/UserStatusPage';
import AuthStatusTestPage from '@/pages/AuthStatusTestPage';
import ToolLayout from '@/components/layout/ToolLayout';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import DevTools from '@/components/ui/dev-tools';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import VIPPage from '@/pages/VIPPage';
import VIPTestPage from '@/pages/VIPTestPage';

// 懒加载组件 - 按需加载
const AdaptPage = React.lazy(() => import('@/pages/AdaptPage'));
const InvitePage = React.lazy(() => import('@/pages/InvitePage'));
const BrandLibraryPage = React.lazy(() => import('@/pages/BrandLibraryPage'));
const HotTopicsPage = React.lazy(() => import('@/pages/HotTopicsPage'));
const HotTopicDetailPage = React.lazy(() => import('@/pages/HotTopicDetailPage'));
const PaymentPage = React.lazy(() => import('@/pages/PaymentPage'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const UserDataPage = React.lazy(() => import('@/pages/UserDataPage'));
const UserProfilePage = React.lazy(() => import('@/pages/UserProfilePage'));
const UserProfileTestPage = React.lazy(() => import('@/pages/UserProfileTestPage'));
const LoginButtonTestPage = React.lazy(() => import('@/pages/LoginButtonTestPage'));
const AuthingStatusTestPage = React.lazy(() => import('@/pages/AuthingStatusTestPage'));
const LogoutButtonTestPage = React.lazy(() => import('@/pages/LogoutButtonTestPage'));
const UserEditFormTestPage = React.lazy(() => import('@/pages/UserEditFormTestPage'));
const PrivacyPage = React.lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = React.lazy(() => import('@/pages/TermsPage'));
const ChangelogPage = React.lazy(() => import('@/pages/ChangelogPage'));
const HistoryPage = React.lazy(() => import('@/pages/HistoryPage'));
const BookmarkPage = React.lazy(() => import('@/pages/BookmarkPage'));
const WechatTemplatePage = React.lazy(() => import('@/pages/WechatTemplatePage'));
const TestNewFeaturesPage = React.lazy(() => import('@/pages/TestNewFeaturesPage'));
const ContentExtractorPage = React.lazy(() => import('@/pages/ContentExtractorPage'));
const CreativeStudioPage = React.lazy(() => import('@/pages/CreativeStudioPage'));
const ShareManagerPage = React.lazy(() => import('@/pages/ShareManagerPage'));
const EmojiPage = React.lazy(() => import('@/pages/EmojiPage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const TestPage = React.lazy(() => import('@/pages/TestPage'));
const AITestPage = React.lazy(() => import('@/pages/AITestPage'));
const ReferrerTestPage = React.lazy(() => import('@/pages/ReferrerTestPage'));
const UnifiedAuthTestPage = React.lazy(() => import('@/pages/UnifiedAuthTestPage'));
const ArchitectureTestPage = React.lazy(() => import('@/pages/ArchitectureTestPage'));
const AuthingSystemTestPage = React.lazy(() => import('@/pages/AuthingSystemTestPage'));
const AuthingLoginTestPage = React.lazy(() => import('@/pages/AuthingLoginTestPage'));
const AuthingSDKTestPage = React.lazy(() => import('@/pages/AuthingSDKTestPage'));
const FunctionalityTestPage = React.lazy(() => import('@/pages/FunctionalityTestPage'));
const APIConfigTestPage = React.lazy(() => import('@/pages/APIConfigTestPage'));
const CreemAPITestPage = React.lazy(() => import('@/pages/CreemAPITestPage'));
const QRCodeTestPage = React.lazy(() => import('@/pages/QRCodeTestPage'));
const SimpleQRTestPage = React.lazy(() => import('@/pages/SimpleQRTestPage'));
const CheckoutTestPage = React.lazy(() => import('@/pages/CheckoutTestPage'));
const DirectLinkQRCodeTestPage = React.lazy(() => import('@/pages/DirectLinkQRCodeTestPage'));
const SimpleQRCodePage = React.lazy(() => import('@/pages/SimpleQRCodePage'));
const CreemAPIFixTestPage = React.lazy(() => import('@/pages/CreemAPIFixTestPage'));
const SimpleCreemTestPage = React.lazy(() => import('@/pages/SimpleCreemTestPage'));
const CreemDebugPage = React.lazy(() => import('@/pages/CreemDebugPage'));
const AlipayQRCodeDemoPage = React.lazy(() => import('@/pages/AlipayQRCodeDemoPage'));
const PaymentPlanDemoPage = React.lazy(() => import('@/pages/PaymentPlanDemoPage'));
const PaymentFlowTestPage = React.lazy(() => import('@/pages/PaymentFlowTestPage'));
const PaymentTestPage = React.lazy(() => import('@/pages/PaymentTestPage'));
const TestNavigationPage = React.lazy(() => import('@/pages/TestNavigationPage'));


/**
 * 加载中组件
 */
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">加载中...</p>
    </div>
  </div>
);

/**
 * 应用内容组件
 */
const AppContent: React.FC = () => {
  const { initializeUserData, saveReferrer } = useUserStore();

  // 在应用启动时初始化用户数据和保存推荐人ID
  useEffect(() => {
    initializeUserData();
    saveReferrer();
    
    // 检查环境变量配置（仅在开发环境且未检查过时执行）
    if (import.meta.env.DEV && !(window as any).__envCheckInitialized) {
      // 延迟执行，确保环境变量已加载
      setTimeout(() => {
        logEnvCheckResults();
      }, 1000);
      
      // 标记已初始化
      (window as any).__envCheckInitialized = true;
    }
  }, [initializeUserData, saveReferrer]);

  return (
    <div>
      {/* 滚动到顶部组件 */}
      <ScrollToTop />
      
      {/* 路由内容 */}
      <Routes>
        {/* 公开页面 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PrivacyPage />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TermsPage />
          </Suspense>
        } />
        <Route path="/changelog" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ChangelogPage />
          </Suspense>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-register" element={<LoginRegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/api-test" element={<ApiTestPage />} />
        <Route path="/auth-test" element={<AuthTestPage />} />
        <Route path="/user-status" element={<UserStatusPage />} />
        <Route path="/auth-status-test" element={<AuthStatusTestPage />} />
        <Route path="/referrer-test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ReferrerTestPage />
          </Suspense>
        } />

        {/* 需要登录的受保护页面 */}
        <Route path="/adapt" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <AdaptPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/invite" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <Suspense fallback={<LoadingSpinner />}>
              <InvitePage />
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/brand-library" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <BrandLibraryPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/hot-topics" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <HotTopicsPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/hot-topics/detail/:platform/:title" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <HotTopicDetailPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        {/* VIP页面 */}
        <Route path="/vip" element={<VIPPage />} />
        <Route path="/vip-test" element={<VIPTestPage />} />
        
        {/* 支付相关页面 */}
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <PaymentTestPage />
          </Suspense>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <ProfilePage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/user-profile" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <UserProfilePage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/user-profile-test" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <UserProfileTestPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/login-button-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <LoginButtonTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        <Route path="/authing-status-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <AuthingStatusTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        <Route path="/logout-button-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <LogoutButtonTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        <Route path="/user-edit-form-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <UserEditFormTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 统一认证测试页面 */}
        <Route path="/unified-auth-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <UnifiedAuthTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 架构测试页面 */}
        <Route path="/architecture-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <ArchitectureTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* Authing系统测试页面 */}
        <Route path="/authing-system-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <AuthingSystemTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* Authing登录测试页面 */}
        <Route path="/authing-login-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <AuthingLoginTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* Authing SDK统一登录测试页面 */}
        <Route path="/authing-sdk-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <AuthingSDKTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 功能测试页面 */}
        <Route path="/functionality-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <FunctionalityTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* API配置测试页面 */}
        <Route path="/api-config-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <APIConfigTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* Creem API测试页面 */}
        <Route path="/creem-api-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <CreemAPITestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 二维码测试页面 */}
        <Route path="/qrcode-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <QRCodeTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 简单二维码测试页面 */}
        <Route path="/simple-qr-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <SimpleQRTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 完整支付流程测试页面 */}
        <Route path="/checkout-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <CheckoutTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 直接链接二维码测试页面 */}
        <Route path="/direct-link-qrcode-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <DirectLinkQRCodeTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 简单二维码页面 */}
        <Route path="/simple-qrcode" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <SimpleQRCodePage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* Creem API修复测试页面 */}
        <Route path="/creem-api-fix-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <CreemAPIFixTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 简单Creem API测试页面 */}
        <Route path="/simple-creem-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <SimpleCreemTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* Creem API调试页面 */}
        <Route path="/creem-debug" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <CreemDebugPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 支付宝二维码演示页面 */}
        <Route path="/alipay-qrcode-demo" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <AlipayQRCodeDemoPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 支付计划演示页面 */}
        <Route path="/payment-plan-demo" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <PaymentPlanDemoPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 服务条款页面 */}
        <Route path="/terms" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <TermsPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 隐私政策页面 */}
        <Route path="/privacy" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <PrivacyPage />
            </Suspense>
          </ToolLayout>
        } />
        
        {/* 支付流程测试页面 */}
        <Route path="/payment-flow-test" element={
          <ToolLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <PaymentFlowTestPage />
            </Suspense>
          </ToolLayout>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <SettingsPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/user-data" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <UserDataPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/history" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <HistoryPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/library" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <BookmarkPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/wechat-templates" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <WechatTemplatePage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/test-new-features" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <TestNewFeaturesPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/content-extractor" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <ContentExtractorPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/creative-studio" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <CreativeStudioPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/share-manager" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <ShareManagerPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/emoji-generator" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <EmojiPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/about" element={
          <Suspense fallback={<LoadingSpinner />}>
            <AboutPage />
          </Suspense>
        } />
        
        <Route path="/test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TestPage />
          </Suspense>
        } />
        
        <Route path="/ai-test" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <AITestPage />
              </Suspense>
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        {/* 导航测试页面 */}
        <Route path="/test-navigation" element={
          <Suspense fallback={<LoadingSpinner />}>
            <TestNavigationPage />
          </Suspense>
        } />
        
        {/* 404页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* 开发工具 */}
      <DevTools />
    </div>
  );
};

/**
 * 主应用组件
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <UnifiedAuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </UnifiedAuthProvider>
    </BrowserRouter>
  );
};

export default App;