import { useState, useEffect, useCallback } from 'react';

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  username?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  [key: string]: unknown;
}

/**
 * 认证状态类型
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * 用户认证 Hook
 * 管理用户登录状态和用户信息
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

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
   * 登录用户
   * @param userData - 用户数据
   */
  const login = useCallback((userData: User) => {
    try {
      localStorage.setItem('authing_user', JSON.stringify(userData));
      setUser(userData);
      setStatus('authenticated');
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  }, []);

  /**
   * 登出用户
   */
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('authing_user');
      setUser(null);
      setStatus('unauthenticated');
    } catch (error) {
      console.error('清除用户信息失败:', error);
    }
  }, []);

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
   * 检查用户是否已认证
   */
  const isAuthenticated = status === 'authenticated';

  /**
   * 检查是否正在加载
   */
  const isLoading = status === 'loading';

  return {
    user,
    status,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };
}; 