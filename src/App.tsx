import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// 页面导入
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import AdaptPage from '@/pages/AdaptPage';
import InvitePage from '@/pages/InvitePage';
import BrandLibraryPage from '@/pages/BrandLibraryPage';
import HotTopicsPage from '@/pages/HotTopicsPage';
import ApiTestPage from '@/pages/ApiTestPage';
import PaymentPage from '@/pages/PaymentPage';
import ProfilePage from '@/pages/ProfilePage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import ChangelogPage from '@/pages/ChangelogPage';
import HistoryPage from '@/pages/HistoryPage';
import LoginPage from '@/pages/LoginPage';
import LoginRegisterPage from '@/pages/LoginRegisterPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import Callback from '@/pages/Callback';
import AuthTestPage from '@/pages/AuthTestPage';
import UserStatusPage from '@/pages/UserStatusPage';
import BookmarkPage from '@/pages/BookmarkPage';
import WechatTemplatePage from '@/pages/WechatTemplatePage';
import TestNewFeaturesPage from '@/pages/TestNewFeaturesPage';
import ContentExtractorPage from '@/pages/ContentExtractorPage';
import CreativeStudioPage from '@/pages/CreativeStudioPage';
import ShareManagerPage from '@/pages/ShareManagerPage';
import EmojiPage from '@/pages/EmojiPage';
import AboutPage from '@/pages/AboutPage';
import ToolLayout from '@/components/layout/ToolLayout';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

/**
 * 应用内容组件
 */
const AppContent: React.FC = () => {
  return (
    <div>
      {/* 滚动到顶部组件 */}
      <ScrollToTop />
      
      {/* 路由内容 */}
      <Routes>
        {/* 公开页面 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-register" element={<LoginRegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/api-test" element={<ApiTestPage />} />
        <Route path="/auth-test" element={<AuthTestPage />} />
        <Route path="/user-status" element={<UserStatusPage />} />

        {/* 需要登录的受保护页面 */}
        <Route path="/adapt" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <AdaptPage />
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/invite" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <InvitePage />
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/brand-library" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <BrandLibraryPage />
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/hot-topics" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <HotTopicsPage />
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/history" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <HistoryPage />
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/payment" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <PaymentPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/bookmarks" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <BookmarkPage />
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/library" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <BookmarkPage />
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/share-manager" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ShareManagerPage />
          </ProtectedRoute>
        } />
        
        <Route path="/wechat-templates" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <WechatTemplatePage />
            </ToolLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/test-new-features" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <TestNewFeaturesPage />
            </ToolLayout>
          </ProtectedRoute>
        } />

        <Route path="/content-extractor" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <ContentExtractorPage />
            </ToolLayout>
          </ProtectedRoute>
        } />

        <Route path="/creative-studio" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <CreativeStudioPage />
            </ToolLayout>
          </ProtectedRoute>
        } />

        <Route path="/emoji-generator" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <EmojiPage />
            </ToolLayout>
          </ProtectedRoute>
        } />

        <Route path="/emojis" element={
          <ProtectedRoute requireAuth={true} redirectTo="/login">
            <ToolLayout>
              <EmojiPage />
            </ToolLayout>
          </ProtectedRoute>
        } />

        <Route path="/about" element={<AboutPage />} />

        {/* 404 页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

/**
 * 主 App 组件
 */
function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;