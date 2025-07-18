import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { ScrollManager } from '@/components/layout/ScrollManager';
import AuthGuard from '@/components/auth/AuthGuard';
import PageTracker from '@/components/analytics/PageTracker';

// 页面组件导入
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import LoginPage from '@/pages/LoginPage';
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
import ProfilePage from '@/pages/ProfilePage';
import AIConfigTestPage from '@/pages/AIConfigTestPage';
import PermissionTestPage from '@/pages/PermissionTestPage';

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

export default function App() {
  return (
    <>
      {/* 滚动管理组件 - 禁用自动滚动到顶部 */}
      <ScrollManager autoScrollToTop={false} />
      <PageTracker />
      
      {/* 条件性顶部导航栏 - 首页隐藏，二级页面显示 */}
      <ConditionalNavigation />
      
      <div className="min-h-screen bg-background">
        <Routes>
          {/* 公开页面 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* 支付相关页面 */}
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-test" element={<PaymentTestPage />} />
          <Route path="/payment-plan-demo" element={<PaymentPlanDemoPage />} />
          <Route path="/creem-payment-test" element={<CreemPaymentTestPage />} />
          <Route path="/checkout-test" element={<CheckoutTestPage />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
          
          {/* 需要认证的页面 */}
          <Route path="/adapt" element={
            <AuthGuard>
              <AdaptPage />
            </AuthGuard>
          } />
          
          <Route path="/creative-studio" element={
            <AuthGuard>
              <CreativeStudioPage />
            </AuthGuard>
          } />
          
          <Route path="/hot-topics" element={
            <AuthGuard>
              <HotTopicsPage />
            </AuthGuard>
          } />
          
          <Route path="/library" element={
            <AuthGuard>
              <BookmarkPage />
            </AuthGuard>
          } />
          
          <Route path="/brand-library" element={
            <AuthGuard>
              <BrandLibraryPage />
            </AuthGuard>
          } />
          
          <Route path="/profile" element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          } />
          
          {/* 测试页面 */}
          <Route path="/ai-config-test" element={<AIConfigTestPage />} />
          <Route path="/permission-test" element={<PermissionTestPage />} />
        </Routes>
      </div>
    </>
  );
}