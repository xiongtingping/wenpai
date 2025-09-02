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

// 🎯 最简单的应用启动 - 无任何技术债务

// 初始化全局数据验证服务
GlobalDataValidationService.initialize();

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
