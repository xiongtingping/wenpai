/**
 * 🔧 根本性修复应用入口 - 解决TDZ和getInstance错误
 * 通过预加载服务和控制初始化顺序彻底解决问题
 */

// console.log('🔥 main.tsx 开始加载...');
window.__MAIN_TSX_LOADED__ = true;

// console.log('🔥 Step 1: 开始导入CSS...');
import './index.css';
import './styles/user-avatar-dropdown-fix.css';
// console.log('✅ Step 1: CSS导入完成');
// 🎯 生产环境只保留核心样式和必要的修复
// 调试脚本已在开发中禁用以减少控制台噪音

// 🎯 收藏按钮修复已集成到CSS中，无需临时脚本
// 🧹 已清理所有调试脚本导入

// 🧹 已清理所有动态加载的调试脚本

// 🧹 已清理全局滚动检测器调试代码
// 🔧 CRITICAL: 模块加载状态检查
console.log('🔥 Step 2: 开始导入React...');

import React from 'react';

// console.log('🔥 Step 3: 开始导入ReactDOM...');
import ReactDOM from 'react-dom/client';

// console.log('🔥 Step 4: 开始导入BrowserRouter...');
import { BrowserRouter } from 'react-router-dom';
// console.log('🔥 Step 5: 开始导入App组件...');
import App from './App.tsx';
// console.log('✅ Step 5: 所有核心模块导入完成');
// 🚀 性能优化：仅导入必要的核心服务
// import { setupGlobalErrorHandler } from './utils/errorHandler'; // 改为动态导入避免TDZ
import ServiceInitializer from './services/serviceInitializer';

// 🔇 优化开发环境控制台：减少噪音，保留重要信息
if (import.meta.env.DEV) {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  // 保留原始方法供紧急情况使用
  (window as any)._originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };
  
  // 智能过滤日志
  console.log = (...args: any[]) => {
    const message = String(args[0] || '');
    // 只显示重要的调试信息
    if (message.includes('🎯') || message.includes('✅') || message.includes('🚨') || 
        message.includes('Dialog') || message.includes('修复')) {
      originalLog.apply(console, args);
    }
  };
  
  console.info = () => {}; // 静默info
  console.debug = () => {}; // 静默debug
  console.trace = () => {}; // 静默trace
  console.table = () => {}; // 静默table
  
  // 过滤警告：只显示关键警告
  console.warn = (...args: any[]) => {
    const message = String(args[0] || '');
    if (message.includes('🚨') || message.includes('💥') || message.includes('CRITICAL') ||
        message.includes('获取热点数据失败')) {
      originalWarn.apply(console, args);
    }
  };
  
  // 智能错误处理：防止API错误刷屏
  console.error = (...args: any[]) => {
    const message = String(args[0] || '');
    
    // API错误限流
    if (message.includes('❌ API响应错误') || message.includes('获取热点数据失败')) {
      const now = Date.now();
      const key = 'api_error_throttle';
      const lastTime = (window as any)[key] || 0;
      if (now - lastTime < 10000) { // 10秒内不重复显示API错误
        return;
      }
      (window as any)[key] = now;
      originalError(`🚨 网络异常: API服务暂时不可用，正在重试...`);
      return;
    }
    
    // 显示其他错误
    originalError.apply(console, args);
  };
}

// 🔧 React TDZ根因修复完成，应用正常启动

// 🚀 快速启动应用 - 性能优化
async function initializeApplication() {
  // console.log('🚀 initializeApplication 函数开始执行...');
  try {
    // 仅初始化必要的错误处理 - 使用动态导入避免TDZ
    const { setupGlobalErrorHandler } = await import('./utils/errorHandler');
    setupGlobalErrorHandler();

    // 🚀 尝试初始化服务依赖，失败时优雅降级
    console.log('🔧 正在初始化服务依赖...');
    try {
      await ServiceInitializer.initialize();
      console.log('✅ 服务依赖初始化完成');
    } catch (error) {
      console.warn('⚠️ 服务初始化失败，继续启动应用:', error);
    }

    // 立即启动React应用 - 其他服务按需加载
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
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

    // console.log('🎉 应用快速启动完成！');
    
    // 🔧 确保HTML检测能发现应用已启动
    setTimeout(() => {
      // console.log('🔍 Main app startup check: root has content', 
      //   document.getElementById('root')?.innerHTML?.length > 0);
    }, 100);

    // 🎯 根本性修复：彻底阻止root元素被设置aria-hidden
    const preventRootAriaHidden = () => {
      const root = document.getElementById('root');
      if (!root) return;
      
      // 立即移除aria-hidden属性
      root.removeAttribute('aria-hidden');
      root.removeAttribute('data-aria-hidden');
      
      // 确保根元素始终可交互
      root.style.pointerEvents = 'auto';
      root.style.visibility = 'visible';
      root.style.opacity = '1';
      
      console.log('🎯 Root元素aria-hidden已清理，确保事件正常执行');
      
      // 🔥 关键：重写setAttribute方法，彻底阻止aria-hidden被设置
      const originalSetAttribute = root.setAttribute.bind(root);
      root.setAttribute = function(name: string, value: string) {
        if (name === 'aria-hidden' || name === 'data-aria-hidden') {
          console.log('🚫 阻止设置root元素的aria-hidden属性:', { name, value });
          return; // 直接阻止设置
        }
        return originalSetAttribute(name, value);
      };
      
      console.log('✅ Root元素setAttribute已重写，aria-hidden设置已被永久阻止');
    };

    // 🔧 创建高性能的 MutationObserver 监控根元素属性变化
    const createAriaHiddenBlocker = () => {
      const root = document.getElementById('root');
      if (!root) return;

      // 批处理优化，避免频繁DOM操作
      let pendingChanges = false;
      let rafId: number | null = null;

      const processPendingChanges = () => {
        if (!pendingChanges) return;
        
        pendingChanges = false;
        rafId = null;

        // 批量处理DOM修改，减少reflow
        if (root.hasAttribute('aria-hidden')) {
          // 使用requestAnimationFrame优化性能
          requestAnimationFrame(() => {
            root.removeAttribute('aria-hidden');
            root.removeAttribute('data-aria-hidden');
            console.log('🚫 已移除根元素aria-hidden属性');
          });
        }
      };

      const observer = new MutationObserver((mutations) => {
        // 检查是否有需要处理的变化
        const hasRelevantChanges = mutations.some(mutation => 
          mutation.type === 'attributes' && 
          mutation.attributeName === 'aria-hidden' &&
          mutation.target === root
        );

        if (hasRelevantChanges && !pendingChanges) {
          pendingChanges = true;
          
          // 使用requestAnimationFrame来批处理DOM操作
          if (rafId) {
            cancelAnimationFrame(rafId);
          }
          rafId = requestAnimationFrame(processPendingChanges);
        }
      });

      observer.observe(root, {
        attributes: true,
        attributeFilter: ['aria-hidden'],
        subtree: false
      });

      console.log('✅ 已启动高性能aria-hidden管理器');

      return {
        disconnect: () => {
          observer.disconnect();
          if (rafId) {
            cancelAnimationFrame(rafId);
          }
          pendingChanges = false;
        }
      };
    };

    // 立即执行一次，然后启动监控
    preventRootAriaHidden();
    const ariaHiddenBlocker = createAriaHiddenBlocker();

    // 🔧 优化性能：减少 ResizeObserver 的使用，改用更轻量的方式
    let resizeDebounceTimer: NodeJS.Timeout | null = null;

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        // 防抖处理，避免频繁调用
        if (resizeDebounceTimer) {
          clearTimeout(resizeDebounceTimer);
        }
        resizeDebounceTimer = setTimeout(() => {
          preventRootAriaHidden();
        }, 200); // 200ms 防抖
      });

      const root = document.getElementById('root');
      if (root) {
        resizeObserver.observe(root);
      }
    }

    // 在窗口关闭时清理所有 observer
    window.addEventListener('beforeunload', () => {
      if (ariaHiddenBlocker) {
        ariaHiddenBlocker.disconnect();
      }
      if (resizeDebounceTimer) {
        clearTimeout(resizeDebounceTimer);
      }
      // 🧹 已清理所有dialogFixer相关代码
    });

    console.log('✅ 应用启动成功 - Authing Guard aria-hidden 阻止器已激活');

    // 🧹 已清理全局Dialog定位修复器调试代码

  } catch (error) {
    console.error('💥 应用初始化失败:', error);
    
    // 优雅降级：即使服务预加载失败，仍尝试启动应用
    console.warn('⚠️ 尝试优雅降级启动...');
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
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
// console.log('🔥 准备调用 initializeApplication...');
initializeApplication().catch(error => {
  console.error('💥 应用初始化失败:', error);
  
  // 即使初始化失败也要启动应用（优雅降级）
  try {
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
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
    console.log('⚠️ 应用已优雅降级启动');
  } catch (fallbackError) {
    console.error('💥💥 应用完全启动失败:', fallbackError);
  }
});
