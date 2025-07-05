/**
 * 统一认证上下文
 * 整合 Authing 认证和用户状态管理
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Guard } from '@authing/guard-react';
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
  [key: string]: any;
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
  showLogin: () => void;
  hideLogin: () => void;
  getGuard: () => Guard | null;
}

/**
 * 认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者属性
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
  const [guard, setGuard] = useState<Guard | null>(null);

  /**
   * 获取是否正在加载
   */
  const isLoading = status === 'loading';

  /**
   * 获取是否已认证
   */
  const isAuthenticated = status === 'authenticated';

  /**
   * 初始化 Authing Guard
   */
  const initGuard = (): Guard => {
    if (!guard) {
      const config = getAuthingConfig();
      const newGuard = new Guard({
        appId: config.appId,
        host: config.host,
        redirectUri: config.redirectUri,
        mode: 'modal',
        defaultScene: 'login',
        lang: 'zh-CN',
      });
      setGuard(newGuard);
      return newGuard;
    }
    return guard;
  };

  /**
   * 检查认证状态
   */
  const checkAuth = async (): Promise<void> => {
    try {
      setStatus('loading');
      const currentGuard = initGuard();
      
      // 检查登录状态
      const loginStatus = await currentGuard.checkLoginStatus();
      console.log('检查登录状态:', loginStatus);
      
      if (loginStatus) {
        // 获取用户信息
        const userInfo = await currentGuard.trackSession();
        console.log('获取用户信息:', userInfo);
        
        if (userInfo) {
          setUser(userInfo);
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  /**
   * 登录
   */
  const login = async (): Promise<void> => {
    try {
      const currentGuard = initGuard();
      currentGuard.show();
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  /**
   * 注册
   */
  const register = async (): Promise<void> => {
    try {
      const currentGuard = initGuard();
      currentGuard.startRegister();
      currentGuard.show();
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  /**
   * 登出
   */
  const logout = async (): Promise<void> => {
    try {
      const currentGuard = initGuard();
      await currentGuard.logout();
      setUser(null);
      setStatus('unauthenticated');
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  };

  /**
   * 显示登录弹窗
   */
  const showLogin = (): void => {
    const currentGuard = initGuard();
    currentGuard.show();
  };

  /**
   * 隐藏登录弹窗
   */
  const hideLogin = (): void => {
    if (guard) {
      guard.hide();
    }
  };

  /**
   * 获取 Guard 实例
   */
  const getGuard = (): Guard | null => {
    return guard;
  };

  // 初始化认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  // 设置 Guard 事件监听
  useEffect(() => {
    if (guard) {
      // 登录成功事件
      const handleLogin = (userInfo: User) => {
        console.log('登录成功:', userInfo);
        setUser(userInfo);
        setStatus('authenticated');
        guard.hide();
      };

      // 注册成功事件
      const handleRegister = (userInfo: User) => {
        console.log('注册成功:', userInfo);
        setUser(userInfo);
        setStatus('authenticated');
        guard.hide();
      };

      // 登录失败事件
      const handleLoginError = (error: any) => {
        console.error('登录失败:', error);
      };

      // 关闭事件
      const handleClose = () => {
        console.log('登录弹窗已关闭');
      };

      guard.on('login', handleLogin);
      guard.on('register', handleRegister);
      guard.on('login-error', handleLoginError);
      guard.on('close', handleClose);

      // 清理事件监听 - 使用 unmount 方法
      return () => {
        guard.unmount();
      };
    }
  }, [guard]);

  const contextValue: AuthContextType = {
    user,
    status,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    showLogin,
    hideLogin,
    getGuard,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文 Hook
 * @returns 认证上下文
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
}; 