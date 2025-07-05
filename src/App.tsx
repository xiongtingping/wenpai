import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AuthGuard from '@/components/auth/AuthGuard';
import UserAvatar from '@/components/auth/UserAvatar';
import { useAuthing } from '@/hooks/useAuthing';

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
import AuthingTestPage from '@/pages/AuthingTestPage';
import AuthingLoginPage from '@/pages/AuthingLoginPage';
import Callback from '@/pages/Callback';
import PermissionTestPage from '@/pages/PermissionTestPage';

import ToolLayout from '@/components/layout/ToolLayout';

/**
 * 导航栏组件
 */
const NavigationBar: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuthing();

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
              to="/adapt"
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
              内容适配
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
            
            <Link 
              to="/history"
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
              历史记录
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isLoggedIn ? (
            <>
              <UserAvatar 
                user={user}
                showDropdown={true}
                size="md"
                showUsername={true}
                onLogout={logout}
              />
              <Link 
                to="/profile"
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
                个人中心
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/authing-login"
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
                登录
              </Link>
              <Link 
                to="/authing-test"
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
                Authing测试
              </Link>
                             <Link 
                 to="/permission-test"
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
                 权限测试
               </Link>

            </>
          )}
        </div>
      </div>
    </nav>
  );
};

/**
 * 主 App 组件
 */
function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <div>
          <NavigationBar />

          {/* 路由内容 */}
          <Routes>
            {/* 公开页面 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/authing-test" element={<AuthingTestPage />} />
            <Route path="/authing-login" element={<AuthingLoginPage />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/api-test" element={<ApiTestPage />} />
            <Route path="/permission-test" element={<PermissionTestPage />} />


            {/* 需要登录的受保护页面 */}
            <Route path="/adapt" element={
              <AuthGuard requireAuth={true} redirectTo="/authing-login">
                <ToolLayout>
                  <AdaptPage />
                </ToolLayout>
              </AuthGuard>
            } />
            
            <Route path="/invite" element={
              <AuthGuard requireAuth={true} redirectTo="/authing-login">
                <ToolLayout>
                  <InvitePage />
                </ToolLayout>
              </AuthGuard>
            } />
            
            <Route path="/brand-library" element={
              <AuthGuard requireAuth={true} redirectTo="/authing-login">
                <ToolLayout>
                  <BrandLibraryPage />
                </ToolLayout>
              </AuthGuard>
            } />
            
            <Route path="/history" element={
              <AuthGuard requireAuth={true} redirectTo="/authing-login">
                <ToolLayout>
                  <HistoryPage />
                </ToolLayout>
              </AuthGuard>
            } />
            
            <Route path="/payment" element={
              <AuthGuard requireAuth={true} redirectTo="/authing-login">
                <PaymentPage />
              </AuthGuard>
            } />
            
            <Route path="/profile" element={
              <AuthGuard requireAuth={true} redirectTo="/authing-login">
                <ProfilePage />
              </AuthGuard>
            } />

            {/* 404 页面 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;