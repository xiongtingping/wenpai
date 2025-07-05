/**
 * 简单测试页面
 * 用于测试基本渲染功能
 */

import React from 'react';

/**
 * 测试页面组件
 * @returns React 组件
 */
const TestPage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#1e40af', marginBottom: '1rem' }}>
          🎉 测试页面
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          如果你能看到这个页面，说明 React 应用已经正常工作了！
        </p>
        
        <div style={{
          background: '#f3f4f6',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>页面信息</h3>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            当前时间: {new Date().toLocaleString()}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            页面路径: {window.location.pathname}
          </p>
          <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
            用户代理: {navigator.userAgent.substring(0, 50)}...
          </p>
        </div>
        
        <button 
          onClick={() => alert('按钮点击成功！')}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          点击测试
        </button>
      </div>
    </div>
  );
};

export default TestPage; 