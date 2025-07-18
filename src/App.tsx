import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { initializeConfigValidation } from '@/utils/configValidator';
import { setupGlobalErrorHandler } from '@/utils/errorHandler';
import { runConfigDiagnostics, generateConfigReport } from '@/utils/configDiagnostics';

// 页面导入
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
import BrandLibraryPage from '@/pages/BrandLibraryPage';
import AIConfigTestPage from '@/pages/AIConfigTestPage';
import PermissionTestPage from '@/pages/PermissionTestPage';

// 组件导入
import AuthGuard from '@/components/auth/AuthGuard';
import PageTracker from '@/components/analytics/PageTracker';

/**
 * 主应用组件
 * @returns {JSX.Element}
 */
export default function App() {
  const { user, isAuthenticated } = useUnifiedAuth();

  /**
   * 应用初始化
   */
  useEffect(() => {
    // 初始化全局错误处理
    setupGlobalErrorHandler();
    
    // 初始化配置验证
    initializeConfigValidation();
    
    // 运行配置诊断
    const diagnostics = runConfigDiagnostics();
    if (diagnostics.length > 0) {
      console.log('🔧 配置诊断结果:');
      console.log(generateConfigReport());
      
      // 在生产环境中，只显示关键错误
      if (import.meta.env.PROD) {
        const errors = diagnostics.filter(d => d.status === 'error');
        if (errors.length > 0) {
          console.warn('❌ 发现关键配置错误:', errors.map(e => e.message).join(', '));
        }
      }
    } else {
      console.log('✅ 所有配置正常');
    }
    
    console.log('🚀 应用启动完成');
  }, []);

  // 等待认证初始化完成
  if (!user && isAuthenticated === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <PageTracker />
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
          
          <Route path="/brand-library" element={
            <AuthGuard>
              <BrandLibraryPage />
            </AuthGuard>
          } />
          
          {/* 测试页面 */}
          <Route path="/ai-config-test" element={<AIConfigTestPage />} />
          <Route path="/permission-test" element={<PermissionTestPage />} />
        </Routes>
      </div>
      <Toaster />
    </Router>
  );
}