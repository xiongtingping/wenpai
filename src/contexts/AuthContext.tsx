/**
 * 认证上下文
 * 提供全局认证状态管理
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AuthenticationClient } from 'authing-js-sdk';
import { authingConfig } from '@/config/authing';
import { User } from '@/types/user';

/**
 * 认证状态接口
 */
interface AuthState {
  /** 用户信息 */
  user: User | null;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 认证上下文接口
 */
interface AuthContextType extends AuthState {
  /** 登录方法 */
  login: (email: string, password: string) => Promise<void>;
  /** 注册方法 */
  register: (email: string, password: string, nickname: string) => Promise<void>;
  /** 登出方法 */
  logout: () => Promise<void>;
  /** 显示登录界面 */
  showLogin: () => Promise<void>;
  /** 隐藏登录界面 */
  hideLogin: () => void;
  /** 检查认证状态 */
  checkAuth: () => Promise<void>;
}

/**
 * 认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者属性
 */
interface AuthProviderProps {
  /** 子组件 */
  children: ReactNode;
}

/**
 * 认证提供者组件
 * @param props 组件属性
 * @returns React 组件
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authing, setAuthing] = useState<AuthenticationClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * 初始化Authing客户端
   */
  useEffect(() => {
    const initAuthing = async () => {
      try {
        const config = authingConfig();
        const authingClient = new AuthenticationClient({
          appId: config.appId,
          appHost: config.host,
          onError: (code, message, data) => {
            setState(prev => ({
              ...prev,
              error: `Authing error: ${message}`,
            }));
          },
        });

        setAuthing(authingClient);
        setIsInitialized(true);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: '初始化认证客户端失败',
          isLoading: false,
        }));
      }
    };

    initAuthing();
  }, []);

  /**
   * 检查认证状态
   */
  const checkAuth = useCallback(async () => {
    if (!authing) {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
      return;
    }

    try {
      // 检查本地存储的用户信息
      const storedUser = localStorage.getItem('authing_user');
      const storedCode = localStorage.getItem('authing_code');
      const storedState = localStorage.getItem('authing_state');

      if (storedUser && storedCode && storedState) {
        const userInfo = JSON.parse(storedUser);
        const convertedUser: User = {
          id: userInfo.id || userInfo.userId || '',
          username: userInfo.username || userInfo.nickname || '',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          nickname: userInfo.nickname || userInfo.username || '',
          avatar: userInfo.photo || userInfo.avatar || '',
          createdAt: userInfo.createdAt || new Date().toISOString(),
          updatedAt: userInfo.updatedAt || new Date().toISOString(),
        };

        setState({
          user: convertedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return;
      }

      // 从Authing获取当前用户
      const currentUser = await authing.getCurrentUser();
      
      if (currentUser) {
        const convertedUser: User = {
          id: currentUser.id || currentUser.userId || '',
          username: currentUser.username || currentUser.nickname || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          nickname: currentUser.nickname || currentUser.username || '',
          avatar: currentUser.photo || currentUser.avatar || '',
          createdAt: currentUser.createdAt || new Date().toISOString(),
          updatedAt: currentUser.updatedAt || new Date().toISOString(),
        };

        setState({
          user: convertedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '检查认证状态失败',
        isLoading: false,
      }));
    }
  }, [authing]);

  /**
   * 登录方法
   */
  const login = useCallback(async (email: string, password: string) => {
    if (!authing) throw new Error('认证客户端未初始化');

    try {
      const result = await authing.loginByEmail(email, password);
      if (result.statusCode === 200) {
        await checkAuth();
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '登录失败',
      }));
      throw error;
    }
  }, [authing, checkAuth]);

  /**
   * 注册方法
   */
  const register = useCallback(async (email: string, password: string, nickname: string) => {
    if (!authing) throw new Error('认证客户端未初始化');

    try {
      const result = await authing.registerByEmail(email, password, {
        nickname,
      });
      if (result.statusCode === 200) {
        await checkAuth();
      } else {
        throw new Error(result.message || '注册失败');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '注册失败',
      }));
      throw error;
    }
  }, [authing, checkAuth]);

  /**
   * 登出方法
   */
  const logout = useCallback(async () => {
    if (!authing) return;

    try {
      await authing.logout();
      localStorage.removeItem('authing_user');
      localStorage.removeItem('authing_code');
      localStorage.removeItem('authing_state');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '登出失败',
      }));
    }
  }, [authing]);

  /**
   * 显示登录界面
   */
  const showLogin = useCallback(async () => {
    if (!isInitialized || !authing) {
      // 等待初始化完成
      setTimeout(() => showLogin(), 100);
      return;
    }

    try {
      await authing.login();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '显示登录界面失败',
      }));
    }
  }, [isInitialized, authing]);

  /**
   * 隐藏登录界面
   */
  const hideLogin = useCallback(() => {
    // AuthenticationClient不需要手动隐藏
  }, []);

  /**
   * 初始化完成后检查认证状态
   */
  useEffect(() => {
    if (isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    showLogin,
    hideLogin,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文Hook
 * @returns AuthContextType
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 