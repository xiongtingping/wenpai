/**
 * 简化的Authing Hook - 移除网络请求，只保留基本状态管理
 * 解决网络连接错误问题
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * 简化的Authing Hook - 移除网络请求，只保留基本状态管理
 * 解决网络连接错误问题
 */
export const useAuthing = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 检查本地存储的认证状态
   */
  const checkAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem('authing_token');
      const userData = localStorage.getItem('authing_user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.warn('检查认证状态时出错:', err);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  /**
   * 登录方法 - 直接跳转到Authing登录页面
   */
  const login = useCallback((redirectUrl?: string) => {
    try {
      const targetUrl = redirectUrl || window.location.href;
      const loginUrl = `ai-wenpai.authing.cn/687e0aafee2b84f86685b644/login?redirect_uri=${encodeURIComponent(targetUrl)}`;
      window.location.href = loginUrl;
    } catch (err) {
      console.error('跳转登录页面失败:', err);
      setError('登录跳转失败');
    }
  }, []);

  /**
   * 登出方法
   */
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('authing_token');
      localStorage.removeItem('authing_user');
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('登出失败:', err);
      setError('登出失败');
    }
  }, []);

  /**
   * 获取用户信息
   */
  const getUserInfo = useCallback(() => {
    return user;
  }, [user]);

  /**
   * 初始化认证状态
   */
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    getUserInfo,
    checkAuthStatus
  };
}; 