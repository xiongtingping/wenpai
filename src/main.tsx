import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// 🔧 App ID配置已通过文件清理脚本修复，无需运行时修复

// 🔧 认证流程优化：防止重复重定向和循环
let isAuthRedirecting = false;
let authAttempts = 0;
const MAX_AUTH_ATTEMPTS = 3;

// 检查是否已经在认证过程中
const isInAuthFlow = () => {
  const url = window.location.href;
  return url.includes('/callback') || 
         url.includes('code=') || 
         url.includes('state=') ||
         isAuthRedirecting;
};

// 防止认证循环
const preventAuthLoop = (operation: string) => {
  if (authAttempts >= MAX_AUTH_ATTEMPTS) {
    console.warn('🛑 认证尝试次数过多，可能存在循环，停止自动重试');
    return false;
  }
  
  if (isAuthRedirecting || isInAuthFlow()) {
    console.log('⏳ 已在认证流程中，跳过重复操作');
    return false;
  }
  
  authAttempts++;
  isAuthRedirecting = true;
  
  // 3秒后重置标志
  setTimeout(() => {
    isAuthRedirecting = false;
  }, 3000);
  
  return true;
};

// 🔧 过滤第三方服务的已知错误，减少控制台噪音
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';

  // 过滤Authing的重定向错误（这是正常的内部机制）
  if (message.includes('Error: redirect') ||
      message.includes('authing.co') ||
      message.includes('cdn.authing.co')) {
    return; // 静默处理
  }

  // 其他错误正常显示
  originalConsoleError.apply(console, args);
};

// 🔧 处理未捕获的Promise错误（主要是Authing的重定向）
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.toString() || '';

  // 过滤Authing的重定向错误
  if (errorMessage.includes('Error: redirect') ||
      errorMessage.includes('authing.co') ||
      errorMessage.includes('cdn.authing.co')) {
    event.preventDefault(); // 阻止错误显示在控制台
    return;
  }

  // 其他错误正常处理
  console.error('未捕获的Promise错误:', event.reason);
});

// 扩展Window接口
declare global {
  interface Window {
    authFlowUtils: {
      preventAuthLoop: (operation: string) => boolean;
      isInAuthFlow: () => boolean;
      resetAuthAttempts: () => void;
    };
  }
}

// 暴露工具函数到全局，供其他模块使用
window.authFlowUtils = {
  preventAuthLoop,
  isInAuthFlow,
  resetAuthAttempts: () => { authAttempts = 0; isAuthRedirecting = false; }
};

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
