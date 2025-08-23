/**
 * 🧪 官方@authing/browser SDK测试页面
 * 测试新的官方SDK实现是否能解决redirect问题
 */

import React, { useEffect, useState } from 'react';
import { OfficialAuthProvider, useAuth } from '../auth/OfficialAuthProvider';

// 测试组件
function AuthTestComponent() {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    initialized,
    login,
    logout
  } = useAuth();

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev.slice(-10), logEntry]); // 保留最后10条日志
    console.log(logEntry);
  };

  useEffect(() => {
    addLog(`🚀 组件初始化 - 认证状态: ${initialized ? '已初始化' : '初始化中'}`);
  }, [initialized]);

  useEffect(() => {
    if (isAuthenticated && user) {
      addLog(`✅ 用户已登录: ${user.nickname || user.name || user.id}`);
    } else if (initialized && !isAuthenticated) {
      addLog(`🚪 用户未登录`);
    }
  }, [isAuthenticated, user, initialized]);

  useEffect(() => {
    if (error) {
      addLog(`❌ 错误: ${error}`);
    }
  }, [error]);

  const handleLogin = async () => {
    try {
      addLog('🔄 开始登录...');
      await login();
    } catch (error) {
      addLog(`❌ 登录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleLogout = async () => {
    try {
      addLog('🔄 开始登出...');
      await logout();
    } catch (error) {
      addLog(`❌ 登出失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  if (!initialized) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ 
          background: '#f0f8ff', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>🔄 初始化中...</h2>
          <p>正在加载官方Authing SDK...</p>
          {loading && <div>⏳ 加载中...</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <h1>🧪 官方Authing SDK测试页面</h1>
      
      {/* 状态显示区域 */}
      <div style={{ 
        background: isAuthenticated ? '#d4edda' : '#f8d7da', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: `1px solid ${isAuthenticated ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        <h3>📊 当前状态</h3>
        <div><strong>认证状态:</strong> {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}</div>
        <div><strong>初始化:</strong> {initialized ? '✅ 完成' : '⏳ 进行中'}</div>
        <div><strong>加载中:</strong> {loading ? '⏳ 是' : '✅ 否'}</div>
        {error && <div style={{ color: '#721c24' }}><strong>错误:</strong> {error}</div>}
      </div>

      {/* 用户信息区域 */}
      {isAuthenticated && user && (
        <div style={{ 
          background: '#d1ecf1', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #bee5eb'
        }}>
          <h3>👤 用户信息</h3>
          <div><strong>ID:</strong> {user.id}</div>
          {user.nickname && <div><strong>昵称:</strong> {user.nickname}</div>}
          {user.name && <div><strong>姓名:</strong> {user.name}</div>}
          {user.email && <div><strong>邮箱:</strong> {user.email}</div>}
          {user.username && <div><strong>用户名:</strong> {user.username}</div>}
        </div>
      )}

      {/* 操作按钮区域 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🎮 操作</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {!isAuthenticated ? (
            <button 
              onClick={handleLogin}
              disabled={loading}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '⏳ 登录中...' : '🚀 登录'}
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              disabled={loading}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '⏳ 登出中...' : '🚪 登出'}
            </button>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 刷新页面
          </button>
        </div>
      </div>

      {/* 实时日志区域 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>📝 实时日志</h3>
        <div style={{ 
          background: '#ffffff', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px',
          border: '1px solid #dee2e6'
        }}>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '2px' }}>
                {log}
              </div>
            ))
          ) : (
            <div style={{ color: '#6c757d' }}>等待日志输出...</div>
          )}
        </div>
      </div>

      {/* 测试说明 */}
      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>💡 测试说明</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>此页面使用官方@authing/browser SDK</li>
          <li>支持多重回调URL配置</li>
          <li>应该不会出现redirect_uri不匹配错误</li>
          <li>观察控制台日志了解详细流程</li>
        </ul>
      </div>
    </div>
  );
}

// 主测试组件
export default function OfficialAuthTest() {
  return (
    <OfficialAuthProvider>
      <AuthTestComponent />
    </OfficialAuthProvider>
  );
}