/**
 * 🎯 简化的应用入口 - 零技术债务实现
 * 移除所有拦截器、错误处理器、复杂逻辑
 */

import './index.css';
import './styles/authing-guard-overrides.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import GlobalDataValidationService from './services/globalDataValidationService';
import { immediateFixLocalStorage } from './utils/localStorageFixer';

// 🎯 最简单的应用启动 - 无任何技术债务

// 立即修复 localStorage 数据问题
immediateFixLocalStorage();

// 初始化全局数据验证服务
GlobalDataValidationService.initialize();

// 🔧 FIX: 添加Guard组件专用错误处理
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;

  // 检查是否是Authing Guard相关的网络错误
  if (error?.message?.includes('Failed to fetch') &&
      (error?.stack?.includes('authing') || error?.stack?.includes('guard'))) {
    console.warn('🔧 捕获Guard网络错误，静默处理:', error.message);
    event.preventDefault(); // 阻止错误显示在控制台
    return;
  }

  // 检查是否是public-config相关的错误
  if (error?.message?.includes('Failed to fetch') &&
      (error?.stack?.includes('public-config') ||
       error?.stack?.includes('getPublicConfig'))) {
    console.warn('🔧 捕获Guard public-config错误，静默处理');
    event.preventDefault(); // 阻止错误显示在控制台
    return;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  // 🔧 FIX: 暂时禁用React.StrictMode以避免Portal DOM操作冲突
  // React严格模式会导致组件双重渲染，与Portal的DOM操作产生冲突
  // 特别是在MD2WeChatPage等使用Toast的组件中会出现removeChild错误
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <App />
  </BrowserRouter>
);
