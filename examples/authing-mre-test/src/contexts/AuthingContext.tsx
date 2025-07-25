/**
 * ✅ FIXED: 2025-01-05 创建简化的 Authing 上下文用于 MRE 测试
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Authing } from '@authing/web';
import { Guard } from '@authing/guard-react';

interface UserInfo {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  [key: string]: any;
}

interface AuthingContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  guard: Guard | null;
}

const AuthingContext = createContext<AuthingContextType | undefined>(undefined);

// 单例实例
let authingClient: Authing | null = null;
let guardInstance: Guard | null = null;

const getAuthingConfig = () => {
  // @ts-ignore
  const env = (import.meta as any).env || (window as any).__ENV__ || {};
  const appId = env.VITE_AUTHING_APP_ID || '687e0afae2b84f86865b644';
  const userPoolId = env.VITE_AUTHING_USERPOOL_ID || '687e0a47a9c1c3d9177b8da1';
  const host = env.VITE_AUTHING_HOST || 'https://ai-wenpai.authing.cn';
  const redirectUri = env.VITE_AUTHING_REDIRECT_URI || 'http://localhost:3000/callback';
  return { appId, userPoolId, host, redirectUri };
};

const getAuthingClient = () => {
  if (!authingClient) {
    const config = getAuthingConfig();
    authingClient = new Authing({
      appId: config.appId,
      userPoolId: config.userPoolId,
      domain: config.host.replace('https://', ''),
      redirectUri: config.redirectUri,
      scope: 'openid profile email phone'
    });
  }
  return authingClient;
};

const getGuardInstance = () => {
  if (!guardInstance) {
    const config = getAuthingConfig();
    guardInstance = new Guard({
      appId: config.appId,
      redirectUri: config.redirectUri,
      mode: 'modal',
      defaultScene: 'login',
      lang: 'zh-CN',
      config: {
        autoRegister: true,
        loginMethodList: ['password'],
        registerMethodList: ['email']
      }
    });
  }
  return guardInstance;
};

export const AuthingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const guardRef = useRef<Guard | null>(null);
  const authingRef = useRef<Authing | null>(null);

  useEffect(() => {
    try {
      authingRef.current = getAuthingClient();
      guardRef.current = getGuardInstance();
      
      if (guardRef.current) {
        guardRef.current.on('login', (userInfo: any) => {
          console.log('🔐 Guard 登录成功:', userInfo);
          handleLogin(userInfo);
        });
        
        guardRef.current.on('register', (userInfo: any) => {
          console.log('📝 Guard 注册成功:', userInfo);
          handleLogin(userInfo);
        });
        
        guardRef.current.on('login-error', (error: any) => {
          console.error('❌ Guard 登录失败:', error);
          setError('登录失败: ' + (error.message || error));
        });
      }
      
      console.log('✅ Authing 实例初始化成功');
    } catch (error) {
      console.error('❌ Authing 实例初始化失败:', error);
      setError('认证系统初始化失败');
    }
  }, []);

  const handleLogin = (userInfo: any) => {
    const user: UserInfo = {
      id: userInfo.id || userInfo.userId || userInfo.sub || `user_${Date.now()}`,
      username: userInfo.username || userInfo.nickname || userInfo.name || '用户',
      email: userInfo.email || userInfo.emailAddress || '',
      phone: userInfo.phone || userInfo.phoneNumber || '',
      nickname: userInfo.nickname || userInfo.username || userInfo.name || '用户',
      avatar: userInfo.avatar || userInfo.photo || userInfo.picture || '',
      ...userInfo
    };
    
    setUser(user);
    localStorage.setItem('authing_user', JSON.stringify(user));
    console.log('✅ 用户登录成功:', user);
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedUser = localStorage.getItem('authing_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('✅ 从本地存储恢复用户信息:', userData);
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code && authingRef.current) {
        console.log('🔐 检测到认证回调，处理登录...');
        try {
          const userInfo = await authingRef.current.handleRedirectCallback();
          if (userInfo) {
            handleLogin(userInfo);
          }
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch (error) {
          console.error('❌ 处理认证回调失败:', error);
          setError('认证回调处理失败');
        }
      }
      
    } catch (error) {
      console.error('❌ 检查认证状态失败:', error);
      setError('认证状态检查失败');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      console.log('🔐 开始登录流程...');
      setError(null);
      
      if (guardRef.current) {
        guardRef.current.show();
      } else {
        throw new Error('Guard 实例未初始化');
      }
    } catch (error) {
      console.error('❌ 登录失败:', error);
      setError('登录失败');
    }
  };

  const register = async () => {
    try {
      console.log('📝 开始注册流程...');
      setError(null);
      
      if (guardRef.current) {
        guardRef.current.startRegister();
      } else {
        throw new Error('Guard 实例未初始化');
      }
    } catch (error) {
      console.error('❌ 注册失败:', error);
      setError('注册失败');
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 开始登出流程...');
      
      setUser(null);
      localStorage.removeItem('authing_user');
      
      if (guardRef.current) {
        await guardRef.current.logout();
      }
      
      navigate('/');
      console.log('✅ 用户登出成功');
    } catch (error) {
      console.error('❌ 登出失败:', error);
      setError('登出失败');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AuthingContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    guard: guardRef.current
  };

  return (
    <AuthingContext.Provider value={contextValue}>
      {children}
    </AuthingContext.Provider>
  );
};

export const useAuthing = (): AuthingContextType => {
  const context = useContext(AuthingContext);
  if (context === undefined) {
    throw new Error('useAuthing must be used within an AuthingProvider');
  }
  return context;
}; 