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
import FunctionalityTestPage from '@/pages/FunctionalityTestPage';
import QRCodeTestPage from '@/pages/QRCodeTestPage';
import AuthingTestPage from '@/pages/AuthingTestPage';
import AuthingConfigTestPage from '@/pages/AuthingConfigTestPage';
import AuthingGuardTestPage from '@/pages/AuthingGuardTestPage';
import AuthingCompleteTestPage from '@/pages/AuthingCompleteTestPage';
import CallbackPage from '@/pages/CallbackPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import EmojiPage from '@/pages/EmojiPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SettingsPage from '@/pages/SettingsPage';

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
          
          {/* 404页面 - 必须放在最后 */}
          <Route path="*" element={<NotFoundPage />} />
          
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
          
          <Route path="/settings" element={
            <AuthGuard>
              <SettingsPage />
            </AuthGuard>
          } />
          
          {/* 测试页面 */}
          <Route path="/ai-config-test" element={<AIConfigTestPage />} />
          <Route path="/permission-test" element={<PermissionTestPage />} />
          <Route path="/functionality-test" element={<FunctionalityTestPage />} />
          <Route path="/qrcode-test" element={<QRCodeTestPage />} />
          <Route path="/authing-test" element={<AuthingTestPage />} />
          <Route path="/authing-config-test" element={<AuthingConfigTestPage />} />
          <Route path="/authing-guard-test" element={<AuthingGuardTestPage />} />
          <Route path="/authing-complete-test" element={<AuthingCompleteTestPage />} />
        </Routes>
      </div>
    </>
  );
}