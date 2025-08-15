import './index.css';
// ✅ FIXED: 2025-07-25 添加Authing Guard样式文件，修复图标显示异常
import '@authing/guard/dist/esm/guard.min.css';

// 🛡️ [UNDEFINED_PROTECTION_SYSTEM_v2025.08.14] 使用现有的封装系统
// 启用已有的完整undefinedundefined防护系统
import './utils/undefinedProblemSolution';

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
