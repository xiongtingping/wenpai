import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { ScrollManager } from '@/components/layout/ScrollManager';
import AuthGuard from '@/components/auth/AuthGuard';
import PreviewGuard from '@/components/auth/PreviewGuard';
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
import ContentExtractorPage from '@/pages/ContentExtractorPage';
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
          
          {/* 需要专业版权限的页面 */}
          <Route path="/creative-studio" element={
            <AuthGuard>
              <PreviewGuard
                featureId="creative-studio"
                featureName="创意魔方"
                featureDescription="AI驱动的创意内容生成工具，包含九宫格创意魔方、营销日历、朋友圈模板和Emoji生成器"
                allowClose={true}
              >
                <CreativeStudioPage />
              </PreviewGuard>
            </AuthGuard>
          } />
          
          <Route path="/content-extractor" element={
            <AuthGuard>
              <PreviewGuard
                featureId="content-extractor"
                featureName="内容提取器"
                featureDescription="智能提取网页内容并生成摘要"
                allowClose={true}
              >
                <ContentExtractorPage />
              </PreviewGuard>
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
          
          {/* 需要高级版权限的页面 */}
          <Route path="/brand-library" element={
            <AuthGuard>
              <PreviewGuard
                featureId="brand-library"
                featureName="品牌库功能"
                featureDescription="多维品牌语料库，支持AI自动分析和用户自定义修改"
                allowClose={true}
              >
                <BrandLibraryPage />
              </PreviewGuard>
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