import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { PageTracker } from '@/components/analytics/PageTracker';

// 懒加载页面组件
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const CreativeCubePage = React.lazy(() => import('@/pages/CreativeCubePage'));
const BrandLibraryPage = React.lazy(() => import('@/pages/BrandLibraryPage'));
const BookmarkPage = React.lazy(() => import('@/pages/BookmarkPage'));
const ContentExtractorPage = React.lazy(() => import('@/pages/ContentExtractorPage'));
const HotTopicsPage = React.lazy(() => import('@/pages/HotTopicsPage'));
// const CallbackPage = React.lazy(() => import('@/pages/CallbackPage'));
// const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const PermissionTestPage = React.lazy(() => import('@/pages/PermissionTestPage'));

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
            {/* 工具页面 */}
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
          </Routes>
        </Suspense>
        <Toaster />
      </UnifiedAuthProvider>
    </Router>
  );
}

export default App;