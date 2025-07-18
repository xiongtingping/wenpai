import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './styles/authing-guard.css';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * 错误边界包装器
 * 确保Router在认证上下文之前初始化，避免导航冲突
 */
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <Router>
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
