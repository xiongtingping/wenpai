import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { PageTracker } from '@/components/analytics/PageTracker';
import { setupGlobalConfigValidation } from '@/utils/configValidator';
import { setupGlobalPermissionCheck } from '@/utils/permissionChecker';

// 懒加载页面组件
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const AdaptPage = React.lazy(() => import('@/pages/AdaptPage'));
const CreativeCubePage = React.lazy(() => import('@/pages/CreativeCubePage'));
const CreativeStudioPage = React.lazy(() => import('@/pages/CreativeStudioPage'));
const BrandLibraryPage = React.lazy(() => import('@/pages/BrandLibraryPage'));
const BookmarkPage = React.lazy(() => import('@/pages/BookmarkPage'));
const ContentExtractorPage = React.lazy(() => import('@/pages/ContentExtractorPage'));
const HotTopicsPage = React.lazy(() => import('@/pages/HotTopicsPage'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const PaymentPage = React.lazy(() => import('@/pages/PaymentPage'));
const TermsPage = React.lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = React.lazy(() => import('@/pages/PrivacyPage'));
// const CallbackPage = React.lazy(() => import('@/pages/CallbackPage'));
const PermissionTestPage = React.lazy(() => import('@/pages/PermissionTestPage'));
const AIConfigTestPage = React.lazy(() => import('@/pages/AIConfigTestPage'));
const APIConfigTestPage = React.lazy(() => import('@/pages/APIConfigTestPage'));

// 加载组件
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

/**
 * 主应用组件 - 极简修正版
 */
function App() {
  // 初始化全局配置验证和权限检查
  React.useEffect(() => {
    setupGlobalConfigValidation();
    setupGlobalPermissionCheck();
  }, []);

  return (
    <Router>
      <UnifiedAuthProvider>
        <ScrollToTop />
        <PageTracker />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            
            
            <Route path="/permission-test" element={<PermissionTestPage />} />
            <Route path="/ai-config-test" element={<AIConfigTestPage />} />
            <Route path="/api-config-test" element={<APIConfigTestPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            {/* 工具页面 */}
            <Route path="/adapt" element={
              <ToolLayout>
                <AdaptPage />
              </ToolLayout>
            } />
            <Route path="/creative" element={
              <ToolLayout>
                <CreativeCubePage />
              </ToolLayout>
            } />
            <Route path="/creative-studio" element={
              <ToolLayout>
                <CreativeStudioPage />
              </ToolLayout>
            } />
            <Route path="/creative-cube" element={
              <ToolLayout>
                <CreativeCubePage />
              </ToolLayout>
            } />
            <Route path="/brand-library" element={
              <ToolLayout>
                <BrandLibraryPage />
              </ToolLayout>
            } />
            <Route path="/library" element={
              <ToolLayout>
                <BookmarkPage />
              </ToolLayout>
            } />
            <Route path="/content-extractor" element={
              <ToolLayout>
                <ContentExtractorPage />
              </ToolLayout>
            } />
            <Route path="/hot-topics" element={
              <ToolLayout>
                <HotTopicsPage />
              </ToolLayout>
            } />
            {/* 用户页面 */}
            <Route path="/profile" element={
              <ToolLayout>
                <ProfilePage />
              </ToolLayout>
            } />
            <Route path="/payment" element={<PaymentPage />} />
          </Routes>
        </Suspense>
        <Toaster />
      </UnifiedAuthProvider>
    </Router>
  );
}

export default App;