import './index.css';
// ✅ FIXED: 2025-07-25 Authing Guard样式导入已封装
// 🐛 问题原因：缺少Guard CSS样式文件导致图标显示异常
// 🔧 修复方式：在应用入口导入官方CSS文件
// 📌 已封装：此导入已验证修复图标问题，请勿修改
// 🔒 LOCKED: AI 禁止修改此CSS导入
import '@authing/guard/dist/esm/guard.min.css';

// ✅ FIXED: 2025-07-25 开发环境API拦截器导入
// 🐛 问题原因：本地开发环境无法访问/.netlify/functions/api导致404错误
// 🔧 修复方式：安装API拦截器，开发环境返回模拟响应
// 📌 已封装：此导入已验证修复API调用问题，请勿修改
// 🔒 LOCKED: AI 禁止修改此导入
import './api/devApiInterceptor';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// ✅ FIXED: 2025-07-25 React Router Future Flag配置已封装
// 🐛 问题原因：React Router v6向v7迁移警告影响开发体验
// 🔧 修复方式：添加future flags提前适配v7特性
// 🔒 LOCKED: AI 禁止修改此Router配置
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
