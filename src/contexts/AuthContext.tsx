/**
 * 统一认证上下文
 * 整合 Authing 认证和用户状态管理
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  [key: string]: unknown;
}

/**
 * 认证状态类型
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * 认证上下文接口
 */
interface AuthContextType {
  // 状态
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // 方法
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Guard 相关
  showLogin: () => Promise<void>;
  hideLogin: () => void;
  authing: AuthenticationClient | null;
}

/**
 * 认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者组件
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证提供者组件
 * @param props 组件属性
 * @returns React 组件
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [authing, setAuthing] = useState<AuthenticationClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化 AuthenticationClient
  useEffect(() => {
    console.log('Initializing AuthenticationClient...');
    try {
      const config = getAuthingConfig();
      console.log('Authing config:', config);
      
      const authingClient = new AuthenticationClient({
        appId: config.appId,
        appHost: config.host,
        onError: (code, message, data) => {
          console.error('Authing error:', { code, message, data });
        }
      });
      
      console.log('AuthenticationClient created:', authingClient);
      setAuthing(authingClient);
      setIsInitialized(true);
      console.log('AuthenticationClient initialization completed');
    } catch (error) {
      console.error('初始化 AuthenticationClient 失败:', error);
      setStatus('unauthenticated');
      setIsInitialized(false);
      setAuthing(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    if (!authing) {
      setStatus('unauthenticated');
      return;
    }
    setStatus('loading');
    try {
      // 检查是否有缓存的用户信息
      const currentUser = await authing.getCurrentUser();
      if (currentUser) {
        const convertedUser: User = {
          id: String(currentUser.id || ''),
          username: String(currentUser.username || currentUser.nickname || ''),
          email: String(currentUser.email || ''),
          phone: String(currentUser.phone || ''),
          nickname: String(currentUser.nickname || currentUser.username || ''),
          avatar: String(currentUser.photo || ''),
          ...((currentUser as unknown) as Record<string, unknown>)
        };
        setUser(convertedUser);
        setStatus('authenticated');
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.log('No authenticated user found');
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [authing]);

  const login = useCallback(async () => {
    if (!authing) return;
    try {
      // 使用社会化登录或重定向登录
      const url = await authing.buildAuthorizeUrl({
        redirectUri: getAuthingConfig().redirectUri,
        scope: 'openid profile email phone',
        state: Math.random().toString(36).substring(7),
      });
      window.location.href = url;
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, [authing]);

  const register = useCallback(async () => {
    if (!authing) return;
    try {
      // 注册也使用相同的重定向方式
      const url = await authing.buildAuthorizeUrl({
        redirectUri: getAuthingConfig().redirectUri,
        scope: 'openid profile email phone',
        state: Math.random().toString(36).substring(7),
      });
      window.location.href = url;
    } catch (error) {
      console.error('Register failed:', error);
    }
  }, [authing]);

  const logout = useCallback(async () => {
    if (authing) {
      try {
        await authing.logout();
        setUser(null);
        setStatus('unauthenticated');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  }, [authing]);

  const showLogin = useCallback(async () => {
    console.log('showLogin called, isInitialized:', isInitialized, 'authing:', authing);
    
    if (!isInitialized) {
      console.log('AuthenticationClient not initialized yet, waiting...');
      setTimeout(async () => {
        if (authing) {
          console.log('Retrying showLogin after delay...');
          await login();
        }
      }, 1000);
      return;
    }
    
    if (!authing) {
      console.error('AuthenticationClient is null even though initialized');
      return;
    }
    
    try {
      console.log('Calling login...');
      await login();
    } catch (e) {
      console.error('Login failed:', e);
    }
  }, [isInitialized, authing, login]);

  const hideLogin = useCallback(() => {
    // AuthenticationClient 没有 hide 方法，这里可以忽略
    console.log('hideLogin called (no-op for AuthenticationClient)');
  }, []);

  // 初始化时检查认证状态
  useEffect(() => {
    if (isInitialized && authing) {
      checkAuth();
    }
  }, [isInitialized, authing, checkAuth]);

  const value: AuthContextType = {
    user,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    register,
    logout,
    checkAuth,
    showLogin,
    hideLogin,
    authing
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文
 * @returns 认证上下文
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 