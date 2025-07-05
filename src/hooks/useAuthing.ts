/**
 * Authing Hook
 * 提供 Authing 认证相关的功能
 */

import { useState, useEffect, useCallback } from 'react';
import { Guard } from '@authing/guard-react';
import { getAuthingConfig } from '@/config/authing';

/**
 * 用户信息接口
 */
interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  [key: string]: unknown;
}

/**
 * Authing Hook 返回值接口
 */
interface UseAuthingReturn {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  guard: Guard | null;
  checkLoginStatus: () => Promise<boolean>;
  getCurrentUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  showLogin: () => void;
  hideLogin: () => void;
}

/**
 * Authing Hook
 * @returns Authing 相关功能
 */
export const useAuthing = (): UseAuthingReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guard, setGuard] = useState<Guard | null>(null);

  /**
   * 初始化 Guard
   */
  useEffect(() => {
    const initGuard = async () => {
      try {
        const config = getAuthingConfig();
        const newGuard = new Guard(config);
        setGuard(newGuard);
        
        // 检查初始登录状态
        const status = await newGuard.checkLoginStatus();
        setIsLoggedIn(Boolean(status));
        setLoading(false);
      } catch (error) {
        console.error('初始化 Guard 失败:', error);
        setLoading(false);
      }
    };

    initGuard();
  }, []);

  /**
   * 检查登录状态
   */
  const checkLoginStatus = useCallback(async (): Promise<boolean> => {
    if (!guard) return false;
    
    try {
      const status = await guard.checkLoginStatus();
      // JwtTokenStatus 可能是 'valid' | 'invalid' | 'expired' 等
      const isLoggedInStatus = Boolean(status);
      setIsLoggedIn(isLoggedInStatus);
      setLoading(false);
      return isLoggedInStatus;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      setIsLoggedIn(false);
      setLoading(false);
      return false;
    }
  }, [guard]);

  /**
   * 获取当前用户
   */
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    if (!guard) return null;
    
    try {
      const userInfo = await guard.trackSession();
      if (userInfo) {
        // 转换 Authing SDK 的用户类型到我们的 User 类型
        const userData: User = {
          id: String((userInfo as any).id || (userInfo as any).userId || ''),
          username: String((userInfo as any).username || (userInfo as any).nickname || ''),
          email: String((userInfo as any).email || ''),
          phone: String((userInfo as any).phone || ''),
          nickname: String((userInfo as any).nickname || (userInfo as any).username || ''),
          avatar: String((userInfo as any).photo || (userInfo as any).avatar || ''),
          ...userInfo // 保留其他属性
        };
        
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }, [guard]);

  /**
   * 登出
   */
  const logout = useCallback(async (): Promise<void> => {
    if (!guard) return;
    
    try {
      await guard.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('登出失败:', error);
    }
  }, [guard]);

  /**
   * 显示登录界面
   */
  const showLogin = useCallback((): void => {
    if (guard) {
      guard.show();
    }
  }, [guard]);

  /**
   * 隐藏登录界面
   */
  const hideLogin = useCallback((): void => {
    if (guard) {
      guard.hide();
    }
  }, [guard]);

  return {
    user,
    isLoggedIn,
    loading,
    guard,
    checkLoginStatus,
    getCurrentUser,
    logout,
    showLogin,
    hideLogin
  };
}; 