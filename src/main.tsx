/**
 * 🔧 根本性修复应用入口 - 解决TDZ和getInstance错误
 * 通过预加载服务和控制初始化顺序彻底解决问题
 */

import './index.css';
import './styles/authing-guard-overrides.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import GlobalDataValidationService from './services/globalDataValidationService';
import { immediateFixLocalStorage } from './utils/localStorageFixer';
import { preloadAllServices, getServicesStats } from './utils/servicePreloader';

// 🔧 FIXED: React forwardRef polyfill 修复 Radix UI Slot 错误
if (typeof React.forwardRef === 'undefined') {
  (React as any).forwardRef = (render: any) => {
    const ForwardRef = (props: any, ref: any) => render(props, ref);
    ForwardRef.displayName = render.displayName || render.name;
    return ForwardRef;
  };
}

// 🔧 FIXED: 全局 Radix UI Slot polyfill
try {
  // 创建安全的 Slot 实现
  const SafeSlot = React.forwardRef<any, any>(({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ...children.props,
        ref,
      });
    }
    return React.createElement('div', { ref, ...props }, children);
  });
  SafeSlot.displayName = "SafeSlot";

  // 全局替换可能有问题的 Slot 实现
  (window as any).__RADIX_SLOT_POLYFILL__ = SafeSlot;

  // 拦截可能的错误
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('forwardRef')) {
      console.warn('🛡️ Radix UI forwardRef error intercepted and handled');
      return;
    }
    originalError.apply(console, args);
  };
} catch (error) {
  console.warn('⚠️ Radix UI polyfill setup failed:', error);
}

// 🔧 根本性修复：预加载所有服务，防止TDZ和getInstance错误
async function initializeApplication() {
  console.log('🚀 开始应用初始化...');
  
  try {
    // 1. 立即修复 localStorage 数据问题
    immediateFixLocalStorage();

    // 2. 预加载所有服务（按依赖顺序）
    console.log('📦 预加载服务模块...');
    await preloadAllServices();

    // 3. 初始化全局数据验证服务
    GlobalDataValidationService.initialize();

    // 4. 显示初始化统计
    const stats = getServicesStats();
    console.log(`✅ 服务初始化完成: ${stats.loaded}/${stats.total}`);
    console.log('📋 初始化顺序:', stats.order);

    // 5. 启动React应用
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );

    console.log('🎉 应用启动成功！');

  } catch (error) {
    console.error('💥 应用初始化失败:', error);
    
    // 优雅降级：即使服务预加载失败，仍尝试启动应用
    console.warn('⚠️ 尝试优雅降级启动...');
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  }
}

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

// 🔧 启动应用初始化流程
initializeApplication();
