/**
 * 🎯 简化的应用入口 - 零技术债务实现
 * 移除所有拦截器、错误处理器、复杂逻辑
 */

import './index.css';
import '@authing/guard/dist/esm/guard.min.css';
import './styles/authing-guard-overrides.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// 🎯 最简单的应用启动 - 无任何技术债务

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
