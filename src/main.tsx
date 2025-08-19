import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

// 🔧 过滤第三方服务的已知错误，减少控制台噪音
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';

  // 过滤Authing的重定向错误（这是正常的内部机制）
  if (message.includes('Error: redirect') ||
      message.includes('authing.co') ||
      message.includes('cdn.authing.co')) {
    return; // 静默处理
  }

  // 其他错误正常显示
  originalConsoleError.apply(console, args);
};

// 🔧 处理未捕获的Promise错误（主要是Authing的重定向）
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.toString() || '';

  // 过滤Authing的重定向错误
  if (errorMessage.includes('Error: redirect') ||
      errorMessage.includes('authing.co') ||
      errorMessage.includes('cdn.authing.co')) {
    event.preventDefault(); // 阻止错误显示在控制台
    return;
  }

  // 其他错误正常处理
  console.error('未捕获的Promise错误:', event.reason);
});

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
