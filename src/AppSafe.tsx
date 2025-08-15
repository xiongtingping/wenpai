/**
 * 🔧 [APP_SAFE_v2025.08.15]
 * 安全版本的App组件 - 使用修复后的Authing Guard
 * 
 * 这是一个新的App组件，专门解决Authing Guard的正则表达式错误问题
 * 不修改原有的App.tsx，保持向后兼容
 */

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { ScrollManager } from '@/components/layout/ScrollManager';
import { DirectPermissionGuard } from '@/components/auth/DirectPermissionGuard';

// 🔧 使用直接认证上下文，完全避免Authing Guard
import { DirectAuthProvider } from '@/contexts/DirectAuthContext';
import { DirectUserDataIsolationProvider } from '@/hooks/useDirectUserDataIsolationInit';
import PageTracker from '@/components/analytics/PageTracker';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/masonry.css';

// 架构级重构 - 导入安全组件和错误边界
import RenderConflictDetector from '@/components/ErrorBoundary/RenderConflictDetector';
import { PerformanceMonitor, PerformanceStats } from '@/components/ErrorBoundary/PerformanceMonitor';
import { setupGlobalTooltipSafety } from '@/utils/tooltipSafetyWrapper';

// 系统监控服务
import { systemMonitorService } from '@/services/systemMonitorService';

// 页面组件导入
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import LoginPage from '@/pages/LoginPage';
import DirectCallbackPage from '@/pages/DirectCallbackPage';
import PaymentPage from '@/pages/PaymentPage';
import AdaptPage from '@/pages/AdaptPage';
import HotTopicsPage from '@/pages/HotTopicsPage';
import BrandLibraryPage from '@/pages/BrandLibraryPage';
import ProfilePage from '@/pages/ProfilePage';

// 其他必要的页面组件
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import NotFoundPage from '@/pages/NotFoundPage';
import EmojiPage from '@/pages/EmojiPage';

/**
 * 条件性导航组件
 */
function ConditionalNavigation() {
  const location = useLocation();
  
  // 首页和支付页面隐藏导航栏
  const hideNavigation = ['/', '/payment'].includes(location.pathname);
  
  if (hideNavigation) {
    return null;
  }
  
  return <TopNavigation />;
}

/**
 * 应用主组件 - 安全版本
 */
function AppSafeContent() {
  const location = useLocation();

  // 初始化全局安全机制
  React.useEffect(() => {
    setupGlobalTooltipSafety();
    console.log('🛡️ AppSafe: 全局安全机制已启用');
  }, []);

  // 启动系统监控服务
  React.useEffect(() => {
    systemMonitorService.start();
    console.log('🚀 AppSafe: 系统监控服务已启动');

    return () => {
      systemMonitorService.stop();
      console.log('🛑 AppSafe: 系统监控服务已停止');
    };
  }, []);

  return (
    <div>
      <PerformanceMonitor
        enableLogging={import.meta.env.DEV}
        warningThreshold={50}
        errorThreshold={100}
        onPerformanceWarning={(metrics) => {
          console.warn('🐌 AppSafe: 性能警告:', metrics);
        }}
      >
        {/* 滚动管理组件 */}
        <ScrollManager autoScrollToTop={true} />
        <PageTracker />

        {/* 条件性顶部导航栏 */}
        <ConditionalNavigation />

        {/* 开发环境性能统计 */}
        {import.meta.env.DEV && <PerformanceStats visible={false} />}

        <div className={`min-h-screen ${location.pathname === '/payment' ? '' : 'bg-background'}`}>
          <Routes>
            {/* 公开页面 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/callback" element={<DirectCallbackPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            
            {/* Emoji生成器 */}
            <Route path="/emoji-generator" element={
              <DirectPermissionGuard required="feature:emoji-generator">
                <EmojiPage />
              </DirectPermissionGuard>
            } />
            
            {/* 支付页面 */}
            <Route path="/payment" element={<PaymentPage />} />
            
            {/* 需要认证的页面 */}
            <Route path="/adapt" element={
              <DirectPermissionGuard required="auth:required">
                <AdaptPage />
              </DirectPermissionGuard>
            } />

            {/* AI内容适配器新版本 */}
            <Route path="/new-adapt" element={
              <DirectPermissionGuard required="auth:required">
                <AdaptPage />
              </DirectPermissionGuard>
            } />
            
            {/* 热点话题 */}
            <Route path="/hot-topics" element={
              <DirectPermissionGuard required="auth:required">
                <HotTopicsPage />
              </DirectPermissionGuard>
            } />
            
            {/* 品牌资料库 */}
            <Route path="/brand-library" element={
              <DirectPermissionGuard required="auth:required">
                <BrandLibraryPage />
              </DirectPermissionGuard>
            } />
            
            {/* 用户资料 */}
            <Route path="/profile" element={
              <DirectPermissionGuard required="auth:required">
                <ProfilePage />
              </DirectPermissionGuard>
            } />

            {/* 404页面 - 必须放在最后 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </PerformanceMonitor>
    </div>
  );
}

/**
 * 安全版本的应用根组件
 * 使用SafeAuthProvider替代UnifiedAuthProvider
 */
export default function AppSafe() {
  return (
    <DirectAuthProvider>
      <DirectUserDataIsolationProvider
        config={{
          enableLogging: import.meta.env.DEV,
          autoCleanupOnLogout: false,
          services: {
            payment: true,
            hashtag: true
          }
        }}
      >
        <AppSafeContent />
        <Toaster />
      </DirectUserDataIsolationProvider>
    </DirectAuthProvider>
  );
}
