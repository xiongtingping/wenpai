import './index.css';
// ✅ FIXED: 2025-07-25 添加Authing Guard样式文件，修复图标显示异常
import '@authing/guard/dist/esm/guard.min.css';

// 🚨 [UNDEFINED_FIXER_RESTORED_v2025.08.14] 恢复关键的undefinedundefined修复器
// 专门解决生产环境中出现的字符串拼接问题
import './utils/productionUndefinedFixer';
// 🚨 Authing Guard 专用修复器
// 专门解决 Authing Guard 在生产环境中的问题
import './utils/authingProductionFixer';
// 🔍 生产环境配置检查器
// 检查可能导致 undefinedundefined 的配置问题
import './utils/productionEnvChecker';
// 🚨 紧急检测器 - 找到undefinedundefined的真正源头
import './utils/emergencyUndefinedDetector';
// 🛡️ Authing错误修复器 - 专门修复Authing内部错误
import './utils/authingErrorFixer';

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
