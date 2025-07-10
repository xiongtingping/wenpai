/**
 * 认证上下文
 * 提供全局认证状态管理
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuthing } from '@/hooks/useAuthing';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * 认证状态类型
 */
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

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
  plan?: string;
  isProUser?: boolean;
  [key: string]: any;
}

/**
 * 认证上下文类型
 */
interface AuthContextType {
  /** 当前用户 */
  user: User | null;
  /** 认证状态 */
  status: AuthStatus;
  /** 是否已认证 */
  isAuthenticated: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 登录方法 */
  login: (userData: User) => void;
  /** 登出方法 */
  logout: () => void;
  /** 更新用户信息 */
  updateUser: (updates: Partial<User>) => void;
  /** 刷新权限信息 */
  refreshPermissions: () => Promise<void>;
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
  const { user: authingUser, isLoggedIn, loading: authingLoading } = useAuthing();
  const { refreshPermissions } = usePermissions();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  /**
   * 初始化认证状态
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('authing_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        setStatus('unauthenticated');
      }
    };

    initAuth();
  }, []);

  /**
   * 同步Authing用户状态
   */
  useEffect(() => {
    if (authingLoading) return;

    if (isLoggedIn && authingUser) {
      // 转换Authing用户格式到我们的User格式
      const userData: User = {
        id: String(authingUser.id || authingUser.userId || ''),
        username: String(authingUser.username || authingUser.nickname || ''),
        email: String(authingUser.email || ''),
        phone: String(authingUser.phone || ''),
        nickname: String(authingUser.nickname || authingUser.username || ''),
        avatar: String(authingUser.photo || authingUser.avatar || ''),
        plan: (authingUser as any).plan || 'free',
        isProUser: (authingUser as any).isProUser || false,
        ...authingUser // 保留其他属性
      };

      setUser(userData);
      setStatus('authenticated');
      setError(null);

      // 保存到localStorage
      localStorage.setItem('authing_user', JSON.stringify(userData));

      // 刷新权限信息
      refreshPermissions();
    } else if (!isLoggedIn) {
      setUser(null);
      setStatus('unauthenticated');
      localStorage.removeItem('authing_user');
    }
  }, [isLoggedIn, authingUser, authingLoading, refreshPermissions]);

  /**
   * 登录用户
   * @param userData - 用户数据
   */
  const login = useCallback((userData: User) => {
    try {
      localStorage.setItem('authing_user', JSON.stringify(userData));
      setUser(userData);
      setStatus('authenticated');
      setError(null);
      
      // 刷新权限信息
      refreshPermissions();
    } catch (error) {
      console.error('保存用户信息失败:', error);
      setError('保存用户信息失败');
    }
  }, [refreshPermissions]);

  /**
   * 登出用户
   */
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('authing_user');
      setUser(null);
      setStatus('unauthenticated');
      setError(null);
      
      // 刷新权限信息
      refreshPermissions();
    } catch (error) {
      console.error('清除用户信息失败:', error);
      setError('清除用户信息失败');
    }
  }, [refreshPermissions]);

  /**
   * 更新用户信息
   * @param updates - 要更新的用户信息
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  }, [user]);

  /**
   * 刷新权限信息
   */
  const handleRefreshPermissions = useCallback(async () => {
    try {
      await refreshPermissions();
    } catch (error) {
      console.error('刷新权限信息失败:', error);
      setError('刷新权限信息失败');
    }
  }, [refreshPermissions]);

  /**
   * 检查用户是否已认证
   */
  const isAuthenticated = status === 'authenticated';

  /**
   * 检查是否正在加载
   */
  const isLoading = status === 'loading' || authingLoading;

  const contextValue: AuthContextType = {
    user,
    status,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    refreshPermissions: handleRefreshPermissions,
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