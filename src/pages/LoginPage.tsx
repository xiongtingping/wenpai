/**
 * 只用 Authing Guard 的登录页面
 */

import { useAuthing } from '@/hooks/useAuthing';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 只用 Authing Guard 的登录页面
 */
export default function LoginPage() {
  const { showLogin, isLoggedIn } = useAuthing();
  const navigate = useNavigate();

  // 页面加载自动弹出 Authing Guard
  useEffect(() => {
    showLogin();
  }, [showLogin]);

  // 登录成功后自动跳转首页
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h2>请使用 Authing Guard 登录</h2>
    </div>
  );
} 