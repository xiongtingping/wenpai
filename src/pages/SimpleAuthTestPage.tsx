/**
 * ✅ FIXED: 2025-01-05 创建完全独立的 Authing 测试页面
 * 📌 不依赖任何外部组件或服务，专门用于测试 Authing 功能
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
 */

import React, { useState, useEffect } from 'react';

/**
 * 简化的用户信息接口
 */
interface SimpleUserInfo {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  loginTime?: string;
}

/**
 * 完全独立的 Authing 测试页面
 */
const SimpleAuthTestPage: React.FC = () => {
  const [user, setUser] = useState<SimpleUserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string>('');

  // 检查本地存储的用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('authing_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('✅ 从本地存储恢复用户信息:', userData);
      } catch (error) {
        console.error('❌ 解析用户信息失败:', error);
        localStorage.removeItem('authing_user');
      }
    }
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setTestStatus('正在启动登录...');
      
      console.log('🔐 开始登录流程...');
      
      // 模拟登录流程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建模拟用户信息
      const mockUser: SimpleUserInfo = {
        id: `user_${Date.now()}`,
        username: 'testuser',
        email: 'test@example.com',
        nickname: '测试用户',
        loginTime: new Date().toISOString()
      };
      
      // 保存到本地存储
      localStorage.setItem('authing_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setTestStatus('登录成功！用户信息已保存');
      
      console.log('✅ 登录成功:', mockUser);
    } catch (error) {
      console.error('❌ 登录失败:', error);
      setError('登录失败: ' + (error as Error).message);
      setTestStatus('登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      setTestStatus('正在启动注册...');
      
      console.log('📝 开始注册流程...');
      
      // 模拟注册流程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建模拟用户信息
      const mockUser: SimpleUserInfo = {
        id: `user_${Date.now()}`,
        username: 'newuser',
        email: 'new@example.com',
        nickname: '新用户',
        loginTime: new Date().toISOString()
      };
      
      // 保存到本地存储
      localStorage.setItem('authing_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setTestStatus('注册成功！用户信息已保存');
      
      console.log('✅ 注册成功:', mockUser);
    } catch (error) {
      console.error('❌ 注册失败:', error);
      setError('注册失败: ' + (error as Error).message);
      setTestStatus('注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      setTestStatus('正在登出...');
      
      console.log('🚪 开始登出流程...');
      
      // 模拟登出流程
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 清除本地存储
      localStorage.removeItem('authing_user');
      localStorage.removeItem('authing_token');
      setUser(null);
      setTestStatus('登出成功！用户信息已清除');
      
      console.log('✅ 登出成功');
    } catch (error) {
      console.error('❌ 登出失败:', error);
      setError('登出失败: ' + (error as Error).message);
      setTestStatus('登出失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem('authing_user');
    localStorage.removeItem('authing_token');
    setUser(null);
    setError(null);
    setTestStatus('本地存储已清除');
    console.log('🧹 本地存储已清除');
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* 页面标题 */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Authing 独立测试页面</h1>
        <p style={{ color: '#666' }}>完全独立的 Authing 功能测试，不依赖外部组件</p>
      </div>

      {/* 当前状态 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ marginTop: 0 }}>当前状态</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
          <div style={{ padding: '10px', background: 'white', borderRadius: '4px' }}>
            <strong>认证状态:</strong> {user ? '✅ 已认证' : '❌ 未认证'}
          </div>
          <div style={{ padding: '10px', background: 'white', borderRadius: '4px' }}>
            <strong>加载状态:</strong> {loading ? '🔄 加载中' : '✅ 就绪'}
          </div>
        </div>

        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '10px' 
          }}>
            <strong>错误:</strong> {error}
          </div>
        )}

        {testStatus && (
          <div style={{ 
            background: '#e8f4fd', 
            color: '#0066cc', 
            padding: '10px', 
            borderRadius: '4px' 
          }}>
            <strong>状态:</strong> {testStatus}
          </div>
        )}

        {user && (
          <div style={{ 
            background: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '4px', 
            marginTop: '15px' 
          }}>
            <h4 style={{ marginTop: 0 }}>用户信息</h4>
            <div style={{ fontSize: '14px' }}>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>用户名:</strong> {user.username || '未设置'}</p>
              <p><strong>邮箱:</strong> {user.email || '未设置'}</p>
              <p><strong>昵称:</strong> {user.nickname || '未设置'}</p>
              <p><strong>登录时间:</strong> {user.loginTime}</p>
            </div>
          </div>
        )}
      </div>

      {/* 功能测试 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ marginTop: 0 }}>功能测试</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: '10px 15px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            🔐 测试登录
          </button>
          
          <button 
            onClick={handleRegister}
            disabled={loading}
            style={{
              padding: '10px 15px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            📝 测试注册
          </button>
          
          <button 
            onClick={handleLogout}
            disabled={loading || !user}
            style={{
              padding: '10px 15px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (loading || !user) ? 'not-allowed' : 'pointer',
              opacity: (loading || !user) ? 0.6 : 1
            }}
          >
            🚪 测试登出
          </button>
          
          <button 
            onClick={handleClearStorage}
            disabled={loading}
            style={{
              padding: '10px 15px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            🧹 清除存储
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
          <p>点击按钮测试基本的认证功能</p>
          <p>所有操作都会记录到浏览器控制台</p>
        </div>
      </div>

      {/* 测试说明 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ marginTop: 0 }}>测试说明</h3>
        <div style={{ fontSize: '14px' }}>
          <p>1. 点击"测试登录"或"测试注册"按钮</p>
          <p>2. 系统会模拟真实的认证流程</p>
          <p>3. 用户信息会保存到本地存储</p>
          <p>4. 点击"测试登出"清除用户信息</p>
          <p>5. 点击"清除存储"完全清除本地数据</p>
          <p>6. 所有操作都会在浏览器控制台显示日志</p>
        </div>
      </div>

      {/* 环境信息 */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '20px' 
      }}>
        <h3 style={{ marginTop: 0 }}>环境信息</h3>
        <div style={{ fontSize: '14px' }}>
          <p><strong>页面 URL:</strong> {window.location.href}</p>
          <p><strong>用户代理:</strong> {navigator.userAgent}</p>
          <p><strong>本地存储:</strong> {localStorage.getItem('authing_user') ? '有用户数据' : '无用户数据'}</p>
          <p><strong>时间戳:</strong> {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthTestPage; 