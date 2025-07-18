import React, { useEffect, useState, useRef } from 'react';
import { getAuthingConfig } from '@/config/authing';

/**
 * 自定义Authing登录弹窗组件
 * 不依赖有问题的Authing Guard组件，使用原生实现
 */
interface AuthingGuardWrapperProps {
  onLogin: (user: any) => void;
  onClose: () => void;
  onLoginError?: (error: any) => void;
}

const AuthingGuardWrapper: React.FC<AuthingGuardWrapperProps> = ({
  onLogin,
  onClose,
  onLoginError
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'phone' | 'email'>('password');
  
  // 表单数据
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    email: '',
    code: ''
  });

  useEffect(() => {
    // 防止页面滚动
    const preventScroll = () => {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('authing-guard-open');
      document.documentElement.classList.add('authing-guard-open');
    };

    // 恢复页面滚动
    const restoreScroll = () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('authing-guard-open');
      document.documentElement.classList.remove('authing-guard-open');
      
      // 修复滚动恢复逻辑，确保不会滚动到底部
      if (scrollY) {
        const scrollPosition = parseInt(scrollY.replace('-', '') || '0');
        // 使用requestAnimationFrame确保DOM更新完成后再滚动
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosition);
        });
      }
    };

    // 显示弹窗
    const timer = setTimeout(() => {
      setIsVisible(true);
      preventScroll();
    }, 100);

    return () => {
      clearTimeout(timer);
      restoreScroll();
    };
  }, []);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 模拟登录成功
      const mockUser = {
        id: `user_${Date.now()}`,
        username: formData.username || formData.phone || formData.email,
        email: formData.email,
        phone: formData.phone,
        nickname: formData.username || '用户',
        avatar: '',
        loginTime: new Date().toISOString(),
        roles: [],
        permissions: []
      };

      // 延迟模拟网络请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onLogin(mockUser);
    } catch (error) {
      setError('登录失败，请重试');
      onLoginError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 处理关闭
  const handleClose = () => {
    setIsVisible(false);
    // 恢复页面滚动
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.classList.remove('authing-guard-open');
    document.documentElement.classList.remove('authing-guard-open');
    
    // 修复滚动恢复逻辑，确保不会滚动到底部
    if (scrollY) {
      const scrollPosition = parseInt(scrollY.replace('-', '') || '0');
      // 使用requestAnimationFrame确保DOM更新完成后再滚动
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosition);
      });
    }
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="authing-guard-wrapper">
      <div className="authing-guard-overlay" onClick={handleClose}></div>
      <div className="authing-guard-modal">
        <div className="authing-guard-header">
          <h2 className="authing-guard-title">登录文派</h2>
          <button 
            className="authing-guard-close-btn"
            onClick={handleClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="authing-guard-content">
          {/* 登录方式切换 */}
          <div className="authing-guard-tabs">
            <button
              className={`authing-guard-tab ${loginMethod === 'password' ? 'active' : ''}`}
              onClick={() => setLoginMethod('password')}
              type="button"
            >
              密码登录
            </button>
            <button
              className={`authing-guard-tab ${loginMethod === 'phone' ? 'active' : ''}`}
              onClick={() => setLoginMethod('phone')}
              type="button"
            >
              手机登录
            </button>
            <button
              className={`authing-guard-tab ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => setLoginMethod('email')}
              type="button"
            >
              邮箱登录
            </button>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="authing-guard-error">
              {error}
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="authing-guard-form">
            {loginMethod === 'password' && (
              <>
                <div className="authing-guard-input-group">
                  <label className="authing-guard-label">用户名/邮箱/手机号</label>
                  <input
                    type="text"
                    className="authing-guard-input"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="请输入用户名、邮箱或手机号"
                    required
                  />
                </div>
                <div className="authing-guard-input-group">
                  <label className="authing-guard-label">密码</label>
                  <input
                    type="password"
                    className="authing-guard-input"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="请输入密码"
                    required
                  />
                </div>
              </>
            )}

            {loginMethod === 'phone' && (
              <>
                <div className="authing-guard-input-group">
                  <label className="authing-guard-label">手机号</label>
                  <input
                    type="tel"
                    className="authing-guard-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="请输入手机号"
                    required
                  />
                </div>
                <div className="authing-guard-input-group">
                  <label className="authing-guard-label">验证码</label>
                  <div className="authing-guard-code-input">
                    <input
                      type="text"
                      className="authing-guard-input"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="请输入验证码"
                      required
                    />
                    <button
                      type="button"
                      className="authing-guard-code-btn"
                      disabled={!formData.phone}
                    >
                      获取验证码
                    </button>
                  </div>
                </div>
              </>
            )}

            {loginMethod === 'email' && (
              <>
                <div className="authing-guard-input-group">
                  <label className="authing-guard-label">邮箱</label>
                  <input
                    type="email"
                    className="authing-guard-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="请输入邮箱"
                    required
                  />
                </div>
                <div className="authing-guard-input-group">
                  <label className="authing-guard-label">验证码</label>
                  <div className="authing-guard-code-input">
                    <input
                      type="text"
                      className="authing-guard-input"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="请输入验证码"
                      required
                    />
                    <button
                      type="button"
                      className="authing-guard-code-btn"
                      disabled={!formData.email}
                    >
                      获取验证码
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              className="authing-guard-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 其他选项 */}
          <div className="authing-guard-footer">
            <p className="authing-guard-tip">
              还没有账号？{' '}
              <button
                type="button"
                className="authing-guard-link"
                onClick={() => {
                  // 切换到注册模式
                  console.log('切换到注册模式');
                }}
              >
                立即注册
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthingGuardWrapper; 