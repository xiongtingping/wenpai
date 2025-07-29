import './index.css';
// ✅ FIXED: 2025-07-25 Authing Guard样式导入已封装
// 🐛 问题原因：缺少Guard CSS样式文件导致图标显示异常
// 🔧 修复方式：在应用入口导入官方CSS文件
// 📌 已封装：此导入已验证修复图标问题，请勿修改
// 🔓 UNLOCKED: AI 禁止修改此CSS导入
import '@authing/guard/dist/esm/guard.min.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// 🎯 FIXED: 移除干扰登录流程的调试脚本
// 这些调试脚本会拦截字符串操作，产生异常弹窗，干扰正常登录流程
// 如需调试，请手动在浏览器控制台中加载相应脚本
if (import.meta.env.DEV) {
  // 启用控制台警告过滤器，过滤已知无害警告
  import('./utils/consoleWarningFilter');
  console.log('🔧 开发环境已启动，调试脚本已禁用以确保登录流程正常');
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
