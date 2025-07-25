import React from 'react';
import { useAuthing } from '../contexts/AuthingContext';

const HomePage: React.FC = () => {
  const { user, isAuthenticated, loading, error, login, register, logout } = useAuthing();

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>加载中...</h2>
          <p>正在检查认证状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Authing MRE 测试</h1>
        <p>这是一个最小可复现示例，用于测试 Authing 登录/注册功能</p>
        
        {error && (
          <div className="status error">
            <strong>错误:</strong> {error}
          </div>
        )}
        
        {isAuthenticated ? (
          <div>
            <div className="status success">
              <strong>✅ 已登录</strong>
            </div>
            
            <div className="user-info">
              <h3>用户信息:</h3>
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>用户名:</strong> {user?.username || '未设置'}</p>
              <p><strong>昵称:</strong> {user?.nickname || '未设置'}</p>
              <p><strong>邮箱:</strong> {user?.email || '未设置'}</p>
              <p><strong>手机:</strong> {user?.phone || '未设置'}</p>
              {user?.avatar && (
                <p><strong>头像:</strong> <img src={user.avatar} alt="头像" style={{ width: 50, height: 50, borderRadius: '50%' }} /></p>
              )}
            </div>
            
            <div className="button-group">
              <button className="btn btn-secondary" onClick={logout}>
                退出登录
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="status loading">
              <strong>未登录</strong>
            </div>
            
            <div className="button-group">
              <button className="btn btn-primary" onClick={login}>
                登录
              </button>
              <button className="btn btn-secondary" onClick={register}>
                注册
              </button>
            </div>
            
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <h3>测试说明:</h3>
              <ul>
                <li>点击"登录"按钮会弹出 Authing Guard 登录弹窗</li>
                <li>支持手机验证码登录和密码登录</li>
                <li>点击"注册"按钮会弹出注册弹窗</li>
                <li>登录成功后会显示用户信息</li>
                <li>支持自动处理认证回调</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 