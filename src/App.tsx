import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { initializeConfigValidation } from '@/utils/configValidator';

// 页面导入
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import LoginPage from '@/pages/LoginPage';
import PaymentPage from '@/pages/PaymentPage';
import PaymentTestPage from '@/pages/PaymentTestPage';
import PaymentPlanDemoPage from '@/pages/PaymentPlanDemoPage';
import CreemPaymentTestPage from '@/pages/CreemPaymentTestPage';
import CheckoutTestPage from '@/pages/CheckoutTestPage';
import EnhancedPaymentPage from '@/pages/EnhancedPaymentPage';
import PaymentStatusPage from '@/pages/PaymentStatusPage';
import AdaptPage from '@/pages/AdaptPage';
import BrandLibraryPage from '@/pages/BrandLibraryPage';
import BrandAnalysisPage from '@/pages/BrandAnalysisPage';
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
  const { isInitialized } = useUnifiedAuth();

  /**
   * 应用初始化
   */
  useEffect(() => {
    // 初始化配置验证
    initializeConfigValidation();
    
    console.log('🚀 应用启动完成');
  }, []);

  // 等待认证初始化完成
  if (!isInitialized) {
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
          <Route path="/enhanced-payment" element={<EnhancedPaymentPage />} />
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
          
          <Route path="/brand-analysis" element={
            <AuthGuard>
              <BrandAnalysisPage />
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