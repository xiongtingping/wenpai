import './index.css';
// 🔧 [AUTHING_CSS_FIX_v2025.08.15] 暂时移除Authing Guard CSS，避免正则表达式错误
// import '@authing/guard/dist/esm/guard.min.css';

// 🛡️ [UNDEFINED_PROTECTION_SYSTEM_v2025.08.14] 使用现有的封装系统
// 启用已有的完整undefinedundefined防护系统
import './utils/undefinedProblemSolution';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// 🔧 [SAFE_APP_v2025.08.15] 使用安全版本的App组件，修复Authing Guard正则表达式错误
import AppSafe from './AppSafe.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppSafe />
    </BrowserRouter>
  </React.StrictMode>
);
