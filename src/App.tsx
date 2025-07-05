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
import Callback from '@/pages/Callback';
import AuthTestPage from '@/pages/AuthTestPage';
import ToolLayout from '@/components/layout/ToolLayout';

/**
 * 应用内容组件
 */
const AppContent: React.FC = () => {
  return (
    <div>
      {/* 路由内容 */}
      <Routes>
        {/* 公开页面 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/api-test" element={<ApiTestPage />} />
        <Route path="/auth-test" element={<AuthTestPage />} />

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