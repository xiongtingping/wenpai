import './index.css';
// ✅ FIXED: 2025-07-25 Authing Guard样式导入已封装
// 🐛 问题原因：缺少Guard CSS样式文件导致图标显示异常
// 🔧 修复方式：在应用入口导入官方CSS文件
// 📌 已封装：此导入已验证修复图标问题，请勿修改
// 🔒 LOCKED: AI 禁止修改此CSS导入
import '@authing/guard/dist/esm/guard.min.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// 启用undefined拼接检测器（仅开发环境）
if (import.meta.env.DEV) {
  import('./utils/undefinedConcatDetector');
  // 暂时禁用高级检测器，避免无限递归
  // import('./utils/advancedUndefinedDetector');
}

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
