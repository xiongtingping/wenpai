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
 * 登录参数接口
 */
interface LoginParams {
  phone?: string;
  email?: string;
  password?: string;
  code?: string;
  remember?: boolean;
}

/**
 * 注册参数接口
 */
interface RegisterParams {
  phone?: string;
  email?: string;
  password?: string;
  code?: string;
  nickname?: string;
}

/**
 * 认证上下文接口
 */
interface AuthContextType {
  // 状态
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  // 方法
  login: (params?: LoginParams) => Promise<void>;
  register: (params?: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  
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
          // 即使有错误，也继续初始化
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
    console.log('checkAuth called, authing:', authing);
    setStatus('loading');
    
    try {
      // 首先检查本地存储中是否有用户信息
      const storedUser = localStorage.getItem('authing_user');
      const storedCode = localStorage.getItem('authing_code');
      const storedState = localStorage.getItem('authing_state');
      
      console.log('Stored user:', storedUser);
      console.log('Stored code:', storedCode);
      console.log('Stored state:', storedState);
      
      if (storedUser && storedCode) {
        console.log('Found stored user info');
        const userData = JSON.parse(storedUser);
        const convertedUser: User = {
          id: String(userData.id || userData.sub || ''),
          username: String(userData.username || userData.nickname || userData.name || ''),
          email: String(userData.email || ''),
          phone: String(userData.phone || ''),
          nickname: String(userData.nickname || userData.name || userData.username || ''),
          avatar: String(userData.picture || userData.avatar || ''),
          ...userData
        };
        console.log('Converted user from storage:', convertedUser);
        setUser(convertedUser);
        setStatus('authenticated');
        console.log('User authenticated from storage');
        return;
      }
      
      // 如果没有本地存储的用户信息，尝试从 Authing 获取
      if (!authing) {
        console.log('No authing client, setting unauthenticated');
        setStatus('unauthenticated');
        return;
      }
      
      console.log('Checking current user from Authing...');
      const currentUser = await authing.getCurrentUser();
      console.log('getCurrentUser result:', currentUser);
      
      if (currentUser) {
        console.log('User found from Authing, converting...');
        const convertedUser: User = {
          id: String(currentUser.id || ''),
          username: String(currentUser.username || currentUser.nickname || ''),
          email: String(currentUser.email || ''),
          phone: String(currentUser.phone || ''),
          nickname: String(currentUser.nickname || currentUser.username || ''),
          avatar: String(currentUser.photo || ''),
          ...((currentUser as unknown) as Record<string, unknown>)
        };
        console.log('Converted user from Authing:', convertedUser);
        setUser(convertedUser);
        setStatus('authenticated');
        console.log('User authenticated from Authing');
      } else {
        console.log('No user found, setting unauthenticated');
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [authing]);

  const login = useCallback(async (params?: LoginParams) => {
    if (!authing) {
      throw new Error('认证客户端未初始化');
    }
    
    try {
      // 暂时使用重定向登录，后续可以扩展为直接登录
      const url = await authing.buildAuthorizeUrl({
        redirectUri: getAuthingConfig().redirectUri,
        scope: 'openid profile email phone',
        state: Math.random().toString(36).substring(7),
      });
      window.location.href = url;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [authing]);

  const register = useCallback(async (params?: RegisterParams) => {
    if (!authing) {
      throw new Error('认证客户端未初始化');
    }
    
    try {
      // 暂时使用重定向注册，后续可以扩展为直接注册
      const url = await authing.buildAuthorizeUrl({
        redirectUri: getAuthingConfig().redirectUri,
        scope: 'openid profile email phone',
        state: Math.random().toString(36).substring(7),
      });
      window.location.href = url;
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    }
  }, [authing]);

  const logout = useCallback(async () => {
    try {
      // 清除本地存储
      localStorage.removeItem('authing_user');
      localStorage.removeItem('authing_code');
      localStorage.removeItem('authing_state');
      localStorage.removeItem('savedCredentials');
      
      // 尝试从 Authing 登出
      if (authing) {
        await authing.logout();
      }
      
      setUser(null);
      setStatus('unauthenticated');
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      // 即使 Authing 登出失败，也要清除本地存储
      localStorage.removeItem('authing_user');
      localStorage.removeItem('authing_code');
      localStorage.removeItem('authing_state');
      localStorage.removeItem('savedCredentials');
      setUser(null);
      setStatus('unauthenticated');
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
    isInitialized,
    login,
    register,
    logout,
    checkAuth,
    setUser,
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