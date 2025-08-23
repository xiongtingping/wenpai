/**
 * 🎯 基于@authing/browser官方SDK的统一认证Provider
 * 替换复杂的自定义实现，使用官方推荐模式
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { LoginState } from '@authing/browser/dist/types/global';
import { OfficialAuthService } from './OfficialAuthService';
import type { AuthUser } from './OfficialAuthService';
import { logger } from '@/utils/logger';

// 认证上下文类型定义
export interface AuthContextType {
  // 状态
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // 方法
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  getAccessToken: () => Promise<string | null>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | null>(null);

// 认证状态类型
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Props类型
interface OfficialAuthProviderProps {
  children: React.ReactNode;
}

/**
 * 基于官方SDK的认证Provider
 */
export function OfficialAuthProvider({ children }: OfficialAuthProviderProps) {
  const authService = useMemo(() => OfficialAuthService.getInstance(), []);
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    initialized: false
  });

  /**
   * 处理登录状态更新
   */
  const updateAuthState = useCallback((loginState: LoginState | null) => {
    if (loginState?.user) {
      const user: AuthUser = {
        id: loginState.user.sub || loginState.user.id || 'unknown',
        nickname: loginState.user.nickname,
        name: loginState.user.name,
        username: loginState.user.username,
        email: loginState.user.email,
        avatar: loginState.user.picture || loginState.user.avatar,
        phone: loginState.user.phone,
        ...loginState.user
      };

      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      }));

      logger.info('✅ 用户登录状态已更新:', {
        userId: user.id,
        nickname: user.nickname
      });
    } else {
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }));

      logger.info('🚪 用户登出状态已更新');
    }
  }, []);

  /**
   * 初始化认证状态
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.info('🚀 初始化官方SDK认证状态...');
        setAuthState(prev => ({ ...prev, loading: true }));

        // 检查是否是回调URL
        if (authService.isRedirectCallback()) {
          logger.info('🔄 检测到回调URL，处理登录回调...');
          
          try {
            const loginState = await authService.handleRedirectCallback();
            updateAuthState(loginState);
          } catch (callbackError) {
            logger.error('❌ 回调处理失败:', callbackError);
            setAuthState(prev => ({
              ...prev,
              loading: false,
              error: '登录回调处理失败',
              initialized: true
            }));
            return;
          }
        } else {
          // 获取当前登录状态
          logger.info('🔍 获取当前登录状态...');
          const loginState = await authService.getLoginState();
          updateAuthState(loginState);
        }

        setAuthState(prev => ({ ...prev, initialized: true }));
        logger.info('✅ 官方SDK认证状态初始化完成');

      } catch (error) {
        logger.error('❌ 认证状态初始化失败:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: '认证初始化失败',
          initialized: true
        }));
      }
    };

    initializeAuth();
  }, [authService, updateAuthState]);

  /**
   * 登录方法
   */
  const login = useCallback(async () => {
    try {
      if (authState.loading) {
        logger.info('🛑 登录正在进行中，跳过重复调用');
        return;
      }

      if (authState.isAuthenticated) {
        logger.info('✅ 用户已登录，无需重复登录');
        return;
      }

      logger.info('🚀 开始官方SDK登录流程...');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // 🎯 使用官方SDK登录方法
      await authService.login();

    } catch (error) {
      logger.error('❌ 官方SDK登录失败:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '登录失败'
      }));
    }
  }, [authService, authState.loading, authState.isAuthenticated]);

  /**
   * 登出方法
   */
  const logout = useCallback(async () => {
    try {
      logger.info('🚪 开始官方SDK登出...');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      await authService.logout();
      
      // 清除本地状态
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }));

      logger.info('✅ 官方SDK登出成功');

    } catch (error) {
      logger.error('❌ 官方SDK登出失败:', error);
      
      // 即使登出失败，也清除本地状态
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }));
    }
  }, [authService]);

  /**
   * 刷新Token
   */
  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      logger.info('✅ Token刷新成功');
    } catch (error) {
      logger.error('❌ Token刷新失败:', error);
      await logout();
      throw error;
    }
  }, [authService, logout]);

  /**
   * 更新用户信息
   */
  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    try {
      const updatedUser = await authService.updateUser(updates);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      logger.info('✅ 用户信息更新成功');
    } catch (error) {
      logger.error('❌ 用户信息更新失败:', error);
      throw error;
    }
  }, [authService]);

  /**
   * 检查认证状态
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const user = await authService.getCurrentUser();
      const isAuthenticated = !!user;

      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated
      }));

      return isAuthenticated;
    } catch (error) {
      logger.error('❌ 检查认证状态失败:', error);
      return false;
    }
  }, [authService]);

  /**
   * 获取访问令牌
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      return await authService.getAccessToken();
    } catch (error) {
      logger.error('❌ 获取访问令牌失败:', error);
      return null;
    }
  }, [authService]);

  // 上下文值
  const contextValue: AuthContextType = {
    // 状态
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    initialized: authState.initialized,

    // 方法
    login,
    logout,
    refreshToken,
    updateUser,
    checkAuthStatus,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 使用认证上下文的Hook
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在OfficialAuthProvider内部使用');
  }
  return context;
}