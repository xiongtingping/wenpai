import './index.css';
// ✅ FIXED: 2025-07-25 添加Authing Guard样式文件，修复图标显示异常
import '@authing/guard/dist/esm/guard.min.css';

// 🚨 [ULTIMATE_UNDEFINED_FIXER_v2025.08.14] 终极修复器 - 一次性解决所有undefinedundefined问题
// 替换所有其他修复器，提供完整的解决方案
import './utils/ultimateUndefinedFixer';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

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
