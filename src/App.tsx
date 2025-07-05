import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserAvatar from '@/components/auth/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';

// 页面导入
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import AdaptPage from '@/pages/AdaptPage';
import InvitePage from '@/pages/InvitePage';
import BrandLibraryPage from '@/pages/BrandLibraryPage';
import ApiTestPage from '@/pages/ApiTestPage';
import PaymentPage from '@/pages/PaymentPage';
import ProfilePage from '@/pages/ProfilePage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import ChangelogPage from '@/pages/ChangelogPage';
import HistoryPage from '@/pages/HistoryPage';
import LoginPage from '@/pages/LoginPage';
import Callback from '@/pages/Callback';
import ToolLayout from '@/components/layout/ToolLayout';

/**
 * 导航栏组件
 */
const NavigationBar: React.FC = () => {
  const { user, isAuthenticated, showLogin } = useAuth();

  return (
    <nav style={{ 
      background: '#001529', 
      padding: '15px 20px',
      color: 'white'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>文派 - AI 内容适配工具</h1>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link 
              to="/"
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1890ff'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              首页
            </Link>
            
            <Link 
              to="/brand-library"
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1890ff'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              品牌库
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isAuthenticated ? (
            <UserAvatar 
              user={user}
              showDropdown={true}
              size="md"
              showUsername={true}
            />
          ) : (
            <>
              <button
                onClick={showLogin}
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1890ff'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                登录
              </button>
              <Link 
                to="/api-test"
                style={{ 
                  color: '#ffd700', 
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ffd700',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffd700'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                API测试
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

/**
 * 应用内容组件
 */
const AppContent: React.FC = () => {
  return (
    <div>
      <NavigationBar />

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