import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// 🛡️ Round #3: 全局启动认证请求拦截器
import './auth/authRequestInterceptor';

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

// 检查是否正在进行登录操作（不包括回调处理）
const isLoginInProgress = () => {
  return isAuthRedirecting;
};

// 防止认证循环 - 改进版
const preventAuthLoop = (operation: string) => {
  // 对于回调处理，使用更宽松的检查
  if (operation === 'callback') {
    if (authAttempts >= MAX_AUTH_ATTEMPTS) {
      console.warn('🛑 回调处理尝试次数过多，可能存在循环');
      return false;
    }
    // 允许回调处理，但记录尝试次数
    authAttempts++;
    return true;
  }
  
  // 对于登录操作，使用严格检查
  if (authAttempts >= MAX_AUTH_ATTEMPTS) {
    console.warn('🛑 认证尝试次数过多，可能存在循环，停止自动重试');
    return false;
  }
  
  if (isLoginInProgress()) {
    console.log('⏳ 登录流程进行中，跳过重复操作');
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
      batchDOMUpdates: (callback: () => void) => void;
      debounce: (func: Function, wait: number) => Function;
    };
  }
}

// 🚀 性能优化：批量DOM操作，减少回流
const batchDOMUpdates = (callback: () => void) => {
  // 使用 requestAnimationFrame 批量处理DOM更新
  requestAnimationFrame(() => {
    // 临时隐藏元素，避免中间状态的回流
    document.body.style.visibility = 'hidden';
    document.body.style.pointerEvents = 'none';
    
    callback();
    
    // 一次性显示所有更新
    requestAnimationFrame(() => {
      document.body.style.visibility = '';
      document.body.style.pointerEvents = '';
    });
  });
};

// 🎯 监控并优化动态插入的元素
const optimizeDynamicElements = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const element = node as Element;
          
          // 针对Authing相关元素进行性能优化
          if (element.id?.includes('authing') || 
              (typeof element.className === 'string' && element.className.includes('authing')) ||
              (element as HTMLElement).tagName === 'IFRAME' && 
              (element as HTMLIFrameElement).src?.includes('authing')) {
            
            (element as HTMLElement).style.contain = 'strict';
            (element as HTMLElement).style.transform = 'translateZ(0)';
            (element as HTMLElement).style.backfaceVisibility = 'hidden';
            (element as HTMLElement).style.willChange = 'auto';
          }
          
          // 递归处理子元素
          element.querySelectorAll('[id*="authing"], [class*="authing"]').forEach((child) => {
            (child as HTMLElement).style.contain = 'strict';
            (child as HTMLElement).style.transform = 'translateZ(0)';
            (child as HTMLElement).style.backfaceVisibility = 'hidden';
          });
        }
      });
    });
  });
  
  // 监控整个文档的变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });
  
  return observer;
};

// 启动动态元素优化
let dynamicElementsObserver: MutationObserver | null = null;
if (typeof window !== 'undefined') {
  dynamicElementsObserver = optimizeDynamicElements();
}

// 防抖函数，减少频繁操作
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 暴露工具函数到全局，供其他模块使用
window.authFlowUtils = {
  preventAuthLoop,
  isInAuthFlow,
  resetAuthAttempts: () => { authAttempts = 0; isAuthRedirecting = false; },
  batchDOMUpdates,
  debounce
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
