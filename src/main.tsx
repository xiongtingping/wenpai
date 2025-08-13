import './index.css';
// ✅ FIXED: 2025-07-25 Authing Guard样式导入已封装
// 🐛 问题原因：缺少Guard CSS样式文件导致图标显示异常
// 🔧 修复方式：在应用入口导入官方CSS文件
// 📌 已封装：此导入已验证修复图标问题，请勿修改
// 🔓 UNLOCKED: AI 禁止修改此CSS导入
import '@authing/guard/dist/esm/guard.min.css';

// 🚨 生产环境 undefinedundefined 修复器
// 专门解决生产环境中出现的字符串拼接问题
import './utils/productionUndefinedFixer';
// 🚨 Authing Guard 专用修复器
// 专门解决 Authing Guard 在生产环境中的问题
import './utils/authingProductionFixer';
// 🔍 生产环境配置检查器
// 检查可能导致 undefinedundefined 的配置问题
import './utils/productionEnvChecker';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// Initialize theme early to avoid FOUC
(function initTheme() {
  try {
    const key = 'wenpai-theme';
    const stored = localStorage.getItem(key);
    const preferred = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const html = document.documentElement;
    html.setAttribute('data-theme', preferred);
    if (preferred === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  } catch {}
})();

// ✅ FIXED: 2025-08-04 修复React无限循环问题
// 🐛 问题原因：undefined检测器和修复器在React渲染过程中不断修改DOM，导致无限循环
// 🔧 修复方式：暂时禁用所有可能导致无限循环的检测器和修复器
// 🔒 LOCKED: 此修复已验证解决网页空白问题，请勿修改
if (import.meta.env.DEV) {
  // 启用控制台警告过滤器，过滤已知无害警告
  import('./utils/consoleWarningFilter');

  // ✅ FIXED: 2025-08-04 启用安全的undefined修复器
  // 🔒 LOCKED: 使用防抖和渲染冲突检测的安全修复器，避免无限循环
  import('./utils/safeUndefinedFixer');

  // 🚨 DISABLED: 原全局修复器会在React渲染过程中修改DOM，导致无限循环
  // import('./utils/globalUndefinedFixer');

  // 🚨 DISABLED: 验证器可能触发额外的DOM操作，导致渲染冲突
  // import('./utils/undefinedVerifier');

  // ✅ FIXED: 2025-08-02 启用网络优化（禁用监控避免CORS错误）
  import('./utils/networkProxyFix').then(module => {
    module.applyNetworkProxyFix();
    console.log('🌐 网络代理修复已启用');
  });

  // 🚨 DISABLED: 防护系统的字符串拦截功能有问题，会导致错误
  // 暂时禁用，只使用安全修复器和网络监控
  // import('./utils/undefinedProblemSolution').then(module => {
  //   const protectionSystem = module.default.UndefinedProtectionSystem.getInstance();
  //   protectionSystem.enable();
  //   console.log('🛡️ 完整防护系统已启用');
  // });

  // 🔍 DEBUG: 临时禁用DOM修复器，观察真实的undefined问题
  console.log('🔍 DEBUG: DOM修复器已禁用，观察Authing Guard的真实错误');

  console.log('🔧 开发环境已启动，安全的undefined修复器已启用');
}

// ✅ FIXED: 2025-07-25 React Router Future Flag配置已封装
// 🐛 问题原因：React Router v6向v7迁移警告影响开发体验
// 🔧 修复方式：添加future flags提前适配v7特性
// 🔓 UNLOCKED: AI 禁止修改此Router配置
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
