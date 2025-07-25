import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { ScrollManager } from '@/components/layout/ScrollManager';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import PageTracker from '@/components/analytics/PageTracker';

// 页面组件导入
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import LoginPage from '@/pages/LoginPage';
import CallbackPage from '@/pages/CallbackPage';

import PaymentPage from '@/pages/PaymentPage';
import PaymentTestPage from '@/pages/PaymentTestPage';
import PaymentPlanDemoPage from '@/pages/PaymentPlanDemoPage';
import CreemPaymentTestPage from '@/pages/CreemPaymentTestPage';
import CheckoutTestPage from '@/pages/CheckoutTestPage';
import PaymentStatusPage from '@/pages/PaymentStatusPage';
import AdaptPage from '@/pages/AdaptPage';
import CreativeStudioPage from '@/pages/CreativeStudioPage';
import HotTopicsPage from '@/pages/HotTopicsPage';
import BookmarkPage from '@/pages/BookmarkPage';
import BrandLibraryPage from '@/pages/BrandLibraryPage';
import ContentExtractorPage from '@/pages/ContentExtractorPage';
import ProfilePage from '@/pages/ProfilePage';
import AIConfigTestPage from '@/pages/AIConfigTestPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import FunctionalityTestPage from '@/pages/FunctionalityTestPage';
import QRCodeTestPage from '@/pages/QRCodeTestPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import EmojiPage from '@/pages/EmojiPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SettingsPage from '@/pages/SettingsPage';
import AuthTestPage from '@/pages/AuthTestPage';
import SimpleAuthTestPage from '@/pages/SimpleAuthTestPage';

/**
 * 条件性导航组件
 * 在首页时隐藏TopNavigation，在二级页面时显示
 */
const ConditionalNavigation: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // 首页不显示TopNavigation，二级页面显示
  if (isHomePage) {
    return null;
  }
  
  return <TopNavigation />;
};

/**
 * 应用主组件
 */
function AppContent() {
  return (
    <>
      {/* 滚动管理组件 - 启用自动滚动到顶部 */}
      <ScrollManager autoScrollToTop={true} />
      <PageTracker />
      
      {/* 条件性顶部导航栏 - 首页隐藏，二级页面显示 */}
      <ConditionalNavigation />
      
      <div className="min-h-screen bg-background">
        <Routes>
          {/* 公开页面 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/emoji-generator" element={<EmojiPage />} />
          
          {/* 支付相关页面 */}
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-test" element={<PaymentTestPage />} />
          <Route path="/payment-plan-demo" element={<PaymentPlanDemoPage />} />
          <Route path="/creem-payment-test" element={<CreemPaymentTestPage />} />
          <Route path="/checkout-test" element={<CheckoutTestPage />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
          
          {/* 需要认证的页面 */}
          <Route path="/adapt" element={
            <PermissionGuard required="auth:required">
              <AdaptPage />
            </PermissionGuard>
          } />
          
          {/* 需要专业版权限的页面 */}
          <Route path="/creative-studio" element={
            <PermissionGuard required="feature:creative-studio">
              <CreativeStudioPage />
            </PermissionGuard>
          } />
          
          <Route path="/content-extractor" element={
            <PermissionGuard required="feature:content-extractor">
              <ContentExtractorPage />
            </PermissionGuard>
          } />
          
          <Route path="/hot-topics" element={
            <PermissionGuard required="auth:required">
              <HotTopicsPage />
            </PermissionGuard>
          } />
          
          <Route path="/library" element={
            <PermissionGuard required="auth:required">
              <BookmarkPage />
            </PermissionGuard>
          } />
          
          {/* 需要高级版权限的页面 */}
          <Route path="/brand-library" element={
            <PermissionGuard required="feature:brand-library">
              <BrandLibraryPage />
            </PermissionGuard>
          } />
          
          <Route path="/profile" element={
            <PermissionGuard required="auth:required">
              <ProfilePage />
            </PermissionGuard>
          } />
          
          <Route path="/settings" element={
            <PermissionGuard required="auth:required">
              <SettingsPage />
            </PermissionGuard>
          } />
          
          {/* 测试页面 */}
          <Route path="/ai-config-test" element={<AIConfigTestPage />} />
          <Route path="/permission-test" element={<PermissionTestPage />} />
          <Route path="/functionality-test" element={<FunctionalityTestPage />} />
          <Route path="/qrcode-test" element={<QRCodeTestPage />} />
          <Route path="/auth-test" element={<AuthTestPage />} />
          <Route path="/simple-auth-test" element={<SimpleAuthTestPage />} />
          
          {/* 404页面 - 必须放在最后 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
}

/**
 * 应用根组件
 * 包装认证提供者
 */
export default function App() {
  return (
    <UnifiedAuthProvider>
      <AppContent />
    </UnifiedAuthProvider>
  );
}