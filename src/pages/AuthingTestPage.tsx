import React, { useEffect, useRef } from 'react';
import { useAuthing } from '@/hooks/useAuthing';

/**
 * Authing 测试页面
 * 用于测试 Authing Guard 功能
 */
const AuthingTestPage: React.FC = () => {
  const {
    user,
    loading,
    isLoggedIn,
    loginStatus,
    login,
    register,
    logout,
    showLogin,
    hideLogin,
    checkLoginStatus,
    getCurrentUser,
  } = useAuthing();

  const guardContainerRef = useRef<HTMLDivElement>(null);

  /**
   * 处理登录成功
   */
  const handleLoginSuccess = (user: any) => {
    console.log('登录成功:', user);
    alert(`登录成功！欢迎 ${user.nickname || user.username || user.email}`);
  };

  /**
   * 处理登录失败
   */
  const handleLoginError = (error: any) => {
    console.error('登录失败:', error);
    alert('登录失败，请重试');
  };

  /**
   * 在容器中启动登录
   */
  const startLoginInContainer = async () => {
    if (guardContainerRef.current) {
      try {
        const user = await login(guardContainerRef.current);
        if (user) {
          handleLoginSuccess(user);
        }
      } catch (error) {
        handleLoginError(error);
      }
    }
  };

  /**
   * 在容器中启动注册
   */
  const startRegisterInContainer = async () => {
    if (guardContainerRef.current) {
      try {
        const user = await register(guardContainerRef.current);
        if (user) {
          handleLoginSuccess(user);
        }
      } catch (error) {
        handleLoginError(error);
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1890ff', textAlign: 'center', marginBottom: '30px' }}>
        Authing 认证测试页面
      </h1>

      {/* 状态显示 */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h2>当前状态</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <strong>登录状态:</strong> {isLoggedIn ? '已登录' : '未登录'}
          </div>
          <div>
            <strong>加载状态:</strong> {loading ? '加载中...' : '完成'}
          </div>
          <div>
            <strong>登录状态码:</strong> {loginStatus || '未知'}
          </div>
          <div>
            <strong>用户信息:</strong> {user ? '已获取' : '未获取'}
          </div>
        </div>
        
        {user && (
          <div style={{ 
            background: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '5px',
            marginTop: '15px',
            border: '1px solid #4caf50'
          }}>
            <h3>用户信息</h3>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>操作测试</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={showLogin}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            显示登录弹窗
          </button>
          
          <button 
            onClick={hideLogin}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#666', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            隐藏登录弹窗
          </button>
          
          <button 
            onClick={checkLoginStatus}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#52c41a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            检查登录状态
          </button>
          
          <button 
            onClick={getCurrentUser}
            style={{ 
              padding: '12px 20px', 
              backgroundColor: '#722ed1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            获取用户信息
          </button>
          
          {isLoggedIn && (
            <button 
              onClick={logout}
              style={{ 
                padding: '12px 20px', 
                backgroundColor: '#ff4d4f', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              登出
            </button>
          )}
        </div>
      </div>

      {/* 容器模式测试 */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>容器模式测试</h2>
        <p>在下方容器中嵌入 Authing Guard</p>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={startLoginInContainer}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            在容器中登录
          </button>
          
          <button 
            onClick={startRegisterInContainer}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#52c41a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            在容器中注册
          </button>
        </div>
        
        <div 
          ref={guardContainerRef}
          style={{ 
            minHeight: '400px', 
            border: '2px dashed #ddd', 
            borderRadius: '5px',
            padding: '20px',
            background: '#fafafa'
          }}
        >
          <p style={{ textAlign: 'center', color: '#999', marginTop: '180px' }}>
            Authing Guard 将在这里显示
          </p>
        </div>
      </div>

      {/* 说明 */}
      <div style={{ 
        background: '#e6f7ff', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #91d5ff'
      }}>
        <h3>使用说明</h3>
        <ul>
          <li><strong>弹窗模式:</strong> 点击"显示登录弹窗"按钮，Authing Guard 将以弹窗形式显示</li>
          <li><strong>容器模式:</strong> 点击"在容器中登录/注册"按钮，Authing Guard 将嵌入到下方容器中</li>
          <li><strong>状态检查:</strong> 使用"检查登录状态"和"获取用户信息"按钮来验证认证状态</li>
          <li><strong>登出:</strong> 登录后可以使用"登出"按钮退出登录</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthingTestPage; 