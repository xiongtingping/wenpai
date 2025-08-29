/**
 * 直接登录表单 - 绕过Guard加载问题
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DirectLoginFormProps {
  onLogin?: (userInfo: any) => void;
  onError?: (error: string) => void;
}

export const DirectLoginForm: React.FC<DirectLoginFormProps> = ({ onLogin, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 直接登录尝试...');
      
      // 模拟登录成功（临时方案）
      const mockUser = {
        id: 'temp_user_' + Date.now(),
        email: email,
        username: email.split('@')[0],
        nickname: email.split('@')[0],
        avatar: '',
        token: 'temp_token_' + Math.random().toString(36)
      };
      
      console.log('✅ 登录成功（临时）:', mockUser);
      
      // 存储用户信息
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      sessionStorage.setItem('token', mockUser.token);
      
      onLogin?.(mockUser);
      
      // 跳转回主页
      navigate('/');
      
    } catch (error) {
      console.error('❌ 登录失败:', error);
      const errorMsg = error instanceof Error ? error.message : '登录失败';
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md">
      <div>
        <label className="block text-sm font-medium mb-2">邮箱</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="请输入邮箱"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="请输入密码"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            登录中...
          </div>
        ) : (
          '登录'
        )}
      </button>
      
      <div className="text-center text-xs text-muted-foreground mt-4">
        <p>⚠️ 临时登录方案：Guard加载问题修复中</p>
        <p>使用任意邮箱和密码可以登录</p>
      </div>
    </form>
  );
};