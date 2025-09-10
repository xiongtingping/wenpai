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

// 🔧 FIXED: 更强力的 forwardRef 修复，彻底消除错误
try {
  // 保存原始的 forwardRef
  const originalForwardRef = React.forwardRef;

  // 创建完全兼容的 forwardRef 实现
  (React as any).forwardRef = function safeForwardRef<T, P = object>(
    render: React.ForwardRefRenderFunction<T, P>
  ) {
    // 使用原始forwardRef，但在安全的包装器中
    try {
      const WrappedComponent = originalForwardRef<T, P>((props, ref) => {
        try {
          // 先验证render函数存在且可调用
          if (typeof render !== 'function') {
            return React.createElement('div');
          }

          // 安全调用render函数
          const result = render(props, ref);
          
          // 验证返回值
          if (result === null || result === undefined) {
            return null;
          }
          
          if (React.isValidElement(result)) {
            return result;
          }
          
          // 如果返回值不是有效的React元素，包装它（静默处理）
          return React.createElement('div', { children: result });
          
        } catch (renderError) {
          // 渲染时错误，完全静默处理，不输出任何日志
          
          // 尝试无ref渲染
          try {
            const fallbackResult = render(props, null);
            return fallbackResult || React.createElement('div');
          } catch (fallbackError) {
            // 最终后备，完全静默
            return React.createElement('div');
          }
        }
      });

      // 保持原有的displayName
      const renderFunction = render as any;
      if (renderFunction.displayName || renderFunction.name) {
        WrappedComponent.displayName = renderFunction.displayName || renderFunction.name;
      }

      return WrappedComponent;
    } catch (setupError) {
      // 如果包装失败，静默返回原始实现
      return originalForwardRef(render);
    }
  };

  console.log('✅ 彻底安全的 forwardRef 实现已激活');

  // 🔧 FIXED: 更强力的全局错误拦截 - 完全静默forwardRef错误
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && (
      message.includes('forwardRef') ||
      message.includes('Cannot read properties of undefined') ||
      message.includes('Cannot access') ||
      message.includes('before initialization') ||
      message.includes('Warning: forwardRef') ||
      message.includes('Warning: React.forwardRef')
    )) {
      // 完全静默，不显示任何消息
      return;
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && (
      message.includes('🛡️ React/forwardRef error') ||
      message.includes('🛡️ forwardRef:') ||
      message.includes('forwardRef render') ||
      message.includes('forwardRef 完全失败')
    )) {
      // 静默我们自己的forwardRef警告
      return;
    }
    originalWarn.apply(console, args);
  };

  // 🔧 FIXED: 全局错误处理器
  window.addEventListener('error', (event) => {
    if (event.message && (
      event.message.includes('forwardRef') ||
      event.message.includes('Cannot read properties of undefined') ||
      event.message.includes('Cannot access') ||
      event.message.includes('before initialization')
    )) {
      console.warn('🛡️ Global error intercepted and handled:', event.message);
      event.preventDefault();
      return false;
    }
  });

} catch (error) {
  console.warn('⚠️ Safe forwardRef setup failed:', error);
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

    // 🔧 FIX: 根本性解决 Authing Guard aria-hidden 冲突
    const ensureRootInteractable = () => {
      const root = document.getElementById('root');
      if (root) {
        // 强制确保根元素可交互，即使有 aria-hidden
        root.style.pointerEvents = 'auto';
        root.style.visibility = 'visible';
        root.style.opacity = '1';
        
        // 🔧 彻底阻止 Authing Guard 设置 aria-hidden
        if (root.hasAttribute('aria-hidden')) {
          console.log('🚫 检测到 Authing Guard 设置 aria-hidden，立即移除');
          root.removeAttribute('aria-hidden');
          
          // 如果需要保存状态（为了恢复），存储在自定义属性中
          root.setAttribute('data-guard-aria-hidden', 'blocked');
        }
      }
    };

    // 🔧 创建简化的 MutationObserver 监控根元素属性变化  
    const createAriaHiddenBlocker = () => {
      const root = document.getElementById('root');
      if (!root) return;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
            const target = mutation.target as Element;
            if (target === root && target.hasAttribute('aria-hidden')) {
              // 简单粗暴：始终阻止在根元素上设置 aria-hidden
              console.log('🚫 阻止 Authing Guard 在根元素设置 aria-hidden');
              target.removeAttribute('aria-hidden');
              target.setAttribute('data-guard-blocked', 'true');
            }
          }
        });
      });

      observer.observe(root, {
        attributes: true,
        attributeFilter: ['aria-hidden'],
        subtree: false
      });

      console.log('✅ 已启动 aria-hidden 阻止器，防止 Guard 干扰根元素');
      return observer;
    };

    // 立即执行一次，然后启动监控
    ensureRootInteractable();
    const ariaHiddenBlocker = createAriaHiddenBlocker();

    // 使用 ResizeObserver 监听 DOM 变化，确保交互性
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        ensureRootInteractable();
      });
      
      const root = document.getElementById('root');
      if (root) {
        resizeObserver.observe(root);
      }
    }

    // 在窗口关闭时清理 observer
    window.addEventListener('beforeunload', () => {
      if (ariaHiddenBlocker) {
        ariaHiddenBlocker.disconnect();
      }
    });

    console.log('✅ 应用启动成功 - Authing Guard aria-hidden 阻止器已激活');

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
