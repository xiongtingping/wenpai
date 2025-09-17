/**
 * 🔧 最小化诊断版本 - 用于定位问题
 */

import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

function SimpleApp() {
  return (
    <div style={{ padding: 'var(--spacing-8)', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>🎉 React应用运行正常！</h1>
      <p>时间：{new Date().toLocaleString()}</p>
      <p>这说明React应用基础架构没有问题</p>
    </div>
  );
}

// 简单启动
function initializeMinimalApp() {
  try {
    console.log('🚀 启动最小化React应用...');
    
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
      <React.StrictMode>
        <SimpleApp />
      </React.StrictMode>
    );
    
    console.log('✅ 最小化应用启动成功！');
  } catch (error) {
    console.error('💥 最小化应用启动失败:', error);
  }
}

initializeMinimalApp();