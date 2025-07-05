/**
 * Authing Hook
 * 提供 Authing 认证功能的 React Hook
 */

import { useState, useEffect, useCallback } from 'react';
import authingService from '@/services/authingService';

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
  [key: string]: any;
}

/**
 * Authing Hook 返回值接口
 */
interface UseAuthingReturn {
  /** 当前用户信息 */
  user: User | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 是否已登录 */
  isLoggedIn: boolean;
  /** 登录状态 */
  loginStatus: 'ok' | 'error' | 'loading' | null;
  /** 登录方法 */
  login: (el?: string | HTMLElement) => Promise<User | null>;
  /** 注册方法 */
  register: (el?: string | HTMLElement) => Promise<User | null>;
  /** 登出方法 */
  logout: () => Promise<void>;
  /** 检查登录状态 */
  checkLoginStatus: () => Promise<boolean>;
  /** 获取当前用户 */
  getCurrentUser: () => Promise<User | null>;
  /** 显示登录弹窗 */
  showLogin: () => void;
  /** 隐藏登录弹窗 */
  hideLogin: () => void;
  /** 处理重定向回调 */
  handleRedirectCallback: () => Promise<void>;
  /** 启动跳转模式登录 */
  startWithRedirect: () => Promise<void>;
  /** 直接设置用户信息（用于登录事件回调） */
  setUserInfo: (userInfo: User | null) => void;
}

/**
 * Authing Hook
 * @returns UseAuthingReturn
 */
export function useAuthing(): UseAuthingReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'ok' | 'error' | 'loading' | null>(null);

  /**
   * 检查登录状态
   */
  const checkLoginStatus = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const status = await authingService.checkLoginStatus();
      console.log('useAuthing - 检查登录状态:', status);
      setIsLoggedIn(status);
      setLoginStatus(status ? 'ok' : 'error');
      return status;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      setIsLoggedIn(false);
      setLoginStatus('error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取当前用户信息
   */
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentUser = await authingService.getCurrentUser();
      console.log('useAuthing - 获取当前用户:', currentUser);
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      setUser(null);
      return null;
    }
  }, []);

  /**
   * 登录
   */
  const login = useCallback(async (el?: string | HTMLElement): Promise<User | null> => {
    try {
      setLoading(true);
      setLoginStatus('loading');
      const user = await authingService.startLogin(el);
      setUser(user);
      setIsLoggedIn(true);
      setLoginStatus('ok');
      return user;
    } catch (error) {
      console.error('登录失败:', error);
      setLoginStatus('error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 注册
   */
  const register = useCallback(async (el?: string | HTMLElement): Promise<User | null> => {
    try {
      setLoading(true);
      setLoginStatus('loading');
      const user = await authingService.startRegister(el);
      setUser(user);
      setIsLoggedIn(true);
      setLoginStatus('ok');
      return user;
    } catch (error) {
      console.error('注册失败:', error);
      setLoginStatus('error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 登出
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await authingService.logout();
      setUser(null);
      setIsLoggedIn(false);
      setLoginStatus(null);
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 显示登录弹窗
   */
  const showLogin = useCallback(() => {
    authingService.show();
  }, []);

  /**
   * 隐藏登录弹窗
   */
  const hideLogin = useCallback(() => {
    authingService.hide();
  }, []);

  /**
   * 处理重定向回调
   */
  const handleRedirectCallback = useCallback(async (): Promise<void> => {
    try {
      await authingService.handleRedirectCallback();
      // 处理回调后重新获取用户信息
      await getCurrentUser();
      await checkLoginStatus();
    } catch (error) {
      console.error('处理重定向回调失败:', error);
      throw error;
    }
  }, [getCurrentUser, checkLoginStatus]);

  /**
   * 启动跳转模式登录
   */
  const startWithRedirect = useCallback(async (): Promise<void> => {
    try {
      await authingService.startWithRedirect();
    } catch (error) {
      console.error('启动跳转模式失败:', error);
      throw error;
    }
  }, []);

  /**
   * 直接设置用户信息（用于登录事件回调）
   */
  const setUserInfo = useCallback((userInfo: User | null) => {
    console.log('直接设置用户信息:', userInfo);
    setUser(userInfo);
    setIsLoggedIn(!!userInfo);
    setLoginStatus(userInfo ? 'ok' : 'error');
    setLoading(false);
  }, []);

  // 初始化时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const isLoggedIn = await checkLoginStatus();
        if (isLoggedIn) {
          await getCurrentUser();
        }
      } catch (error) {
        console.error('初始化认证失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [checkLoginStatus, getCurrentUser]);

  return {
    user,
    loading,
    isLoggedIn,
    loginStatus,
    login,
    register,
    logout,
    checkLoginStatus,
    getCurrentUser,
    setUserInfo,
    showLogin,
    hideLogin,
    handleRedirectCallback,
    startWithRedirect,
  };
} 