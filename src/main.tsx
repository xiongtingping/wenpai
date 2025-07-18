import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './styles/authing-guard.css';
import './styles/pricing-fix.css';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * 错误边界包装器
 * 确保Router在认证上下文之前初始化，避免导航冲突
 */
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <Router
      // 禁用React Router的自动滚动到顶部行为
      // 让用户自己控制页面滚动位置
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <UnifiedAuthProvider>
        <App />
      </UnifiedAuthProvider>
    </Router>
  </ErrorBoundary>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithErrorBoundary />
  </React.StrictMode>,
);
