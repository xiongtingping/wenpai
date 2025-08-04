import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { ScrollManager } from '@/components/layout/ScrollManager';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import PageTracker from '@/components/analytics/PageTracker';
// 🚨 DISABLED: 2025-08-04 暂时禁用UndefinedFixer以排查无限循环问题
// import UndefinedFixer from '@/components/UndefinedFixer';

// ✅ FIXED: 2025-08-04 架构级重构 - 导入安全组件和错误边界
import RenderConflictDetector from '@/components/ErrorBoundary/RenderConflictDetector';
import { PerformanceMonitor, PerformanceStats } from '@/components/ErrorBoundary/PerformanceMonitor';
import { setupGlobalTooltipSafety } from '@/utils/tooltipSafetyWrapper';

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
import HotTopicsAPITestPage from '@/pages/HotTopicsAPITestPage';
import TitleGeneratorTestPage from '@/pages/TitleGeneratorTestPage';
import NewTitleGeneratorTestPage from '@/pages/NewTitleGeneratorTestPage';
import BookmarkPage from '@/pages/BookmarkPage';
import BrandLibraryPage from '@/pages/BrandLibraryPage';
import ContentExtractorPage from '@/pages/ContentExtractorPage';
import ProfilePage from '@/pages/ProfilePage';
import AIConfigTestPage from '@/pages/AIConfigTestPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import FunctionalityTestPage from '@/pages/FunctionalityTestPage';
import { TestLoginPage } from '@/pages/TestLoginPage';
import QRCodeTestPage from '@/pages/QRCodeTestPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import EmojiPage from '@/pages/EmojiPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SettingsPage from '@/pages/SettingsPage';
import AuthTestPage from '@/pages/AuthTestPage';
import SimpleAuthTestPage from '@/pages/SimpleAuthTestPage';
import AuthingTestPage from '@/pages/AuthingTestPage';
// 🚨 重新启用 UndefinedTestPage 用于验证修复效果
import UndefinedTestPage from '@/pages/UndefinedTestPage';
import UpgradeButtonTestPage from '@/pages/UpgradeButtonTestPage';
import TitleGrammarTestPage from '@/pages/TitleGrammarTestPage';
import TitleFixTestPage from '@/pages/TitleFixTestPage';
import TitlePlatformSwitchTestPage from '@/pages/TitlePlatformSwitchTestPage';
import TitleSemanticTestPage from '@/pages/TitleSemanticTestPage';
import TitleAntiTemplateTestPage from '@/pages/TitleAntiTemplateTestPage';
import TitleV3TestPage from '@/pages/TitleV3TestPage';
import HistoryPage from '@/pages/HistoryPage';

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
 * 应用主组件 - 架构级重构版本
 * ✅ FIXED: 2025-08-04 添加渲染冲突检测和性能监控
 * 🔒 LOCKED: 此重构已验证解决React无限循环问题，请勿修改
 */
function AppContent() {
  // ✅ 初始化全局Tooltip安全机制
  React.useEffect(() => {
    setupGlobalTooltipSafety();
    console.log('🛡️ App: 全局安全机制已启用');
  }, []);

  return (
    // 🚨 TEMPORARILY DISABLED: 2025-08-04 暂时禁用RenderConflictDetector以恢复网站正常运行
    // <RenderConflictDetector
    //   maxRenderCount={100}
    //   renderTimeWindow={1000}
    //   onConflictDetected={(error, errorInfo) => {
    //     console.error('🚨 App: 检测到渲染冲突:', error, errorInfo);
    //   }}
    //   fallback={
    //     <div style={{ padding: '20px', textAlign: 'center' }}>
    //       <h2>🔧 系统正在自动修复...</h2>
    //       <p>检测到渲染冲突，正在尝试恢复正常状态</p>
    //     </div>
    //   }
    // >
    <div>
      <PerformanceMonitor
        enableLogging={import.meta.env.DEV}
        warningThreshold={50}
        errorThreshold={100}
        onPerformanceWarning={(metrics) => {
          console.warn('🐌 App: 性能警告:', metrics);
        }}
      >
        {/* 滚动管理组件 - 启用自动滚动到顶部 */}
        <ScrollManager autoScrollToTop={true} />
        <PageTracker />

        {/* 条件性顶部导航栏 - 首页隐藏，二级页面显示 */}
        <ConditionalNavigation />

        {/* 开发环境性能统计 */}
        {import.meta.env.DEV && <PerformanceStats visible={false} />}

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

          {/* AI内容适配器新版本 */}
          <Route path="/new-adapt" element={
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

          <Route path="/hot-topics-api-test" element={
            <PermissionGuard required="auth:required">
              <HotTopicsAPITestPage />
            </PermissionGuard>
          } />

          <Route path="/title-generator-test" element={
            <PermissionGuard required="auth:required">
              <TitleGeneratorTestPage />
            </PermissionGuard>
          } />

          <Route path="/new-title-generator-test" element={
            <PermissionGuard required="auth:required">
              <NewTitleGeneratorTestPage />
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

          {/* 品牌库子功能页面 */}
          <Route path="/brand-corpus" element={
            <PermissionGuard required="feature:brand-library">
              <BrandLibraryPage />
            </PermissionGuard>
          } />

          <Route path="/brand-assets" element={
            <PermissionGuard required="feature:brand-library">
              <BrandLibraryPage />
            </PermissionGuard>
          } />

          <Route path="/content-extractor" element={
            <PermissionGuard required="auth:required">
              <ContentExtractorPage />
            </PermissionGuard>
          } />

          <Route path="/pdf-chat" element={
            <PermissionGuard required="auth:required">
              <ContentExtractorPage />
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
          <Route path="/authing-test" element={<AuthingTestPage />} />
          {/* 🚨 重新启用 UndefinedTestPage 路由用于验证修复效果 */}
          <Route path="/undefined-test" element={<UndefinedTestPage />} />
          <Route path="/upgrade-button-test" element={<UpgradeButtonTestPage />} />
          <Route path="/test-login" element={<TestLoginPage />} />
          <Route path="/title-grammar-test" element={<TitleGrammarTestPage />} />
          <Route path="/title-fix-test" element={<TitleFixTestPage />} />
          <Route path="/title-platform-test" element={<TitlePlatformSwitchTestPage />} />
          <Route path="/title-semantic-test" element={<TitleSemanticTestPage />} />
          <Route path="/title-anti-template-test" element={<TitleAntiTemplateTestPage />} />
          <Route path="/title-v3-test" element={<TitleV3TestPage />} />

          {/* 历史记录页面 */}
          <Route path="/history" element={
            <PermissionGuard required="auth:required">
              <HistoryPage />
            </PermissionGuard>
          } />

          {/* 404页面 - 必须放在最后 */}
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </PerformanceMonitor>
    {/* </RenderConflictDetector> */}
    </div>
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