import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * 错误边界包装器
 */
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <UnifiedAuthProvider>
      <App />
    </UnifiedAuthProvider>
  </ErrorBoundary>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithErrorBoundary />
  </React.StrictMode>,
);
