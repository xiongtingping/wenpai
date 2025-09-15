/**
 * 🔧 简化版App组件 - 用于排查问题
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 最简单的首页组件
function SimpleHomePage() {
  return (
    <div style={{ padding: 'var(--spacing-8)', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>🎉 文派AI - 智能内容创作平台</h1>
      <p>欢迎来到文派AI！这是简化版本，用于诊断问题。</p>
      <p>时间：{new Date().toLocaleString()}</p>
      <div style={{ marginTop: 'var(--spacing-8)' }}>
        <h3>功能测试：</h3>
        <button onClick={() => alert('按钮点击正常！')}>测试按钮</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SimpleHomePage />} />
        <Route path="*" element={<div>404 - 页面未找到</div>} />
      </Routes>
    </div>
  );
}

export default App;