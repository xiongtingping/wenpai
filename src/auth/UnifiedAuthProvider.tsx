/**
 * 🔐 统一认证提供者
 * 整合所有认证功能的单一入口，替代原有的多层架构
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContextType, AuthUser, AuthState, LoginParams, RegisterParams } from './types';
import { getAuthProviderConfig } from './config';
import { authService } from './authService';
import { tokenManager } from './tokenManager';
import { permissionManager } from './permissionManager';
import { setAuthTokenGetter } from '@/api/request';
import { logger } from '@/utils/logger';

/**
 * 生成PKCE code_verifier
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * 生成PKCE code_challenge
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// 创建认证上下文
const UnifiedAuthContext = createContext<AuthContextType | null>(null);

// 认证提供者组件
export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ===== 状态管理 =====
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    initialized: false
  });

  // ===== 初始化 =====
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * 初始化认证系统
   */
  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const config = getAuthProviderConfig();
      
      // 初始化认证服务
      await authService.initialize(config.config);
      
      // 检查现有的认证状态
      await checkExistingAuth();
      
      // 设置API请求的token获取器
      setAuthTokenGetter(() => tokenManager.getAccessToken());
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        initialized: true 
      }));
      
      logger.info('✅ 统一认证系统初始化成功');
    } catch (error) {
      logger.error('❌ 认证系统初始化失败:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '初始化失败',
        initialized: true 
      }));
    }
  };

  /**
   * 检查现有认证状态
   */
  const checkExistingAuth = async () => {
    try {
      // 从存储中获取用户信息
      const storedUser = tokenManager.getUser();
      const storedToken = tokenManager.getAccessToken();
      
      if (storedUser && storedToken) {
        // 验证token有效性
        const isValid = tokenManager.isTokenValid(storedToken);
        
        if (isValid) {
          // 尝试获取最新用户信息
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser) {
            setAuthState(prev => ({
              ...prev,
              user: currentUser,
              isAuthenticated: true
            }));
            logger.info('✅ 恢复用户登录状态', { userId: currentUser.id });
          } else {
            // 用户信息获取失败，清除本地数据
            await handleLogout();
          }
        } else {
          // token无效，尝试刷新
          await attemptTokenRefresh();
        }
      }
    } catch (error) {
      logger.warn('⚠️ 检查认证状态失败:', error);
      // 清除可能损坏的数据
      tokenManager.clearAll();
    }
  };

  /**
   * 尝试刷新token
   */
  const attemptTokenRefresh = async () => {
    try {
      if (tokenManager.getRefreshToken()) {
        const newTokenInfo = await authService.refreshToken();
        const user = await authService.getCurrentUser();
        
        if (user) {
          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true
          }));
          logger.info('✅ Token刷新成功');
        }
      }
    } catch (error) {
      logger.warn('⚠️ Token刷新失败:', error);
      tokenManager.clearAll();
    }
  };

  // ===== 认证方法 =====

  /**
   * 用户登录 - 使用弹窗模式避免redirect_uri问题
   */
  const login = useCallback(async (redirectTo?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const config = authService.getConfig();
      if (!config) {
        throw new Error('认证配置未初始化');
      }

      // 动态导入Guard组件
      const { Guard } = await import('@authing/guard');

      // 创建Guard实例 - 使用弹窗模式
      const guard = new Guard({
        appId: config.appId,
        host: config.host,
        redirectUri: config.redirectUri, // 即使弹窗模式也需要配置
        mode: 'modal', // 关键：使用弹窗模式
        defaultScene: 'login',
        // 弹窗配置
        autoRegister: false,
        closeable: true,
        clickCloseableMask: true,
        // 登录方式
        loginMethodList: ['password', 'phone-code', 'email-code'],
        // 界面配置
        title: '文派',
        lang: 'zh-CN'
      });

      // 监听登录成功事件
      guard.on('login', async (userInfo: any) => {
        try {
          logger.info('✅ Guard登录成功:', userInfo);

          // 标准化用户信息
          const user = authService.normalizeAuthUser(userInfo);

          // 更新认证状态
          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          }));

          // 关闭弹窗
          guard.hide();

          // 跳转到目标页面
          if (redirectTo) {
            window.location.href = redirectTo;
          }
        } catch (error) {
          logger.error('❌ 处理登录结果失败:', error);
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: '登录处理失败'
          }));
        }
      });

      // 监听登录失败事件
      guard.on('login-error', (error: any) => {
        logger.error('❌ Guard登录失败:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error?.message || '登录失败'
        }));
      });

      // 监听弹窗关闭事件
      guard.on('close', () => {
        setAuthState(prev => ({ ...prev, loading: false }));
      });

      // 显示登录弹窗
      guard.show();

    } catch (error) {
      logger.error('❌ 初始化Guard失败:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '登录初始化失败'
      }));
    }
  }, []);

  /**
   * 用户注册 - 使用弹窗模式避免redirect_uri问题
   */
  const register = useCallback(async (redirectTo?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const config = authService.getConfig();
      if (!config) {
        throw new Error('认证配置未初始化');
      }

      // 动态导入Guard组件
      const { Guard } = await import('@authing/guard');

      // 创建Guard实例 - 使用弹窗模式
      const guard = new Guard({
        appId: config.appId,
        host: config.host,
        redirectUri: config.redirectUri, // 即使弹窗模式也需要配置
        mode: 'modal', // 关键：使用弹窗模式
        defaultScene: 'register', // 默认显示注册页面
        // 弹窗配置
        autoRegister: false,
        closeable: true,
        clickCloseableMask: true,
        // 注册方式
        registerMethodList: ['phone', 'email'],
        // 界面配置
        title: '文派',
        lang: 'zh-CN'
      });

      // 监听注册成功事件
      guard.on('register', async (userInfo: any) => {
        try {
          logger.info('✅ Guard注册成功:', userInfo);

          // 标准化用户信息
          const user = authService.normalizeAuthUser(userInfo);

          // 更新认证状态
          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          }));

          // 关闭弹窗
          guard.hide();

          // 跳转到目标页面
          if (redirectTo) {
            window.location.href = redirectTo;
          }
        } catch (error) {
          logger.error('❌ 处理注册结果失败:', error);
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: '注册处理失败'
          }));
        }
      });

      // 监听注册失败事件
      guard.on('register-error', (error: any) => {
        logger.error('❌ Guard注册失败:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error?.message || '注册失败'
        }));
      });

      // 监听弹窗关闭事件
      guard.on('close', () => {
        setAuthState(prev => ({ ...prev, loading: false }));
      });

      // 显示注册弹窗
      guard.show();

    } catch (error) {
      logger.error('❌ 初始化Guard失败:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '注册初始化失败'
      }));
    }
  }, []);

  /**
   * 用户登出
   */
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      await authService.logout();
      await handleLogout();
      
      logger.info('✅ 用户登出成功');
    } catch (error) {
      logger.error('❌ 登出失败:', error);
      // 即使登出失败，也要清除本地状态
      await handleLogout();
    }
  }, []);

  /**
   * 处理登出后的状态清理
   */
  const handleLogout = async () => {
    setAuthState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    }));
    
    // 清除API token获取器
    setAuthTokenGetter(() => null);
  };

  /**
   * 刷新token
   */
  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      logger.info('✅ Token手动刷新成功');
    } catch (error) {
      logger.error('❌ Token手动刷新失败:', error);
      await handleLogout();
      throw error;
    }
  }, []);

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
  }, []);

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
  }, []);

  // ===== 权限方法 =====

  /**
   * 检查权限
   */
  const hasPermission = useCallback((permission: string): boolean => {
    return permissionManager.hasPermission(authState.user, permission);
  }, [authState.user]);

  /**
   * 检查角色
   */
  const hasRole = useCallback((role: string): boolean => {
    return permissionManager.hasRole(authState.user, role);
  }, [authState.user]);

  /**
   * 检查功能访问权限
   */
  const hasFeature = useCallback((feature: string): boolean => {
    return permissionManager.canUseFeature(authState.user, feature);
  }, [authState.user]);

  /**
   * 检查是否可以使用功能
   */
  const canUseFeature = useCallback((feature: string): boolean => {
    return permissionManager.canUseFeature(authState.user, feature);
  }, [authState.user]);

  // ===== 向后兼容方法 =====
  const checkAuth = checkAuthStatus; // 别名
  const handleAuthingLogin = async (user: AuthUser) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      error: null
    }));
  };

  // 简化的登录方法（暂时使用默认登录）
  const loginWithPassword = async (email: string, password: string) => {
    await login();
  };
  const loginWithEmailCode = async (email: string, code: string) => {
    await login();
  };
  const loginWithPhoneCode = async (phone: string, code: string) => {
    await login();
  };
  const sendVerificationCode = async (target: string, type: 'email' | 'phone') => {
    logger.info('发送验证码功能暂未实现');
  };
  const registerUser = async (params: RegisterParams) => {
    await register(params.redirectTo);
  };
  const resetPassword = async (email: string) => {
    logger.info('重置密码功能暂未实现');
  };

  // ===== 订阅状态 =====
  const isPro = permissionManager.isPro(authState.user);
  const isPremium = permissionManager.isPremium(authState.user);

  // ===== 上下文值 =====
  const contextValue: AuthContextType = {
    // 状态
    ...authState,

    // 认证方法
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    checkAuthStatus,

    // 向后兼容方法
    checkAuth,
    handleAuthingLogin,
    loginWithPassword,
    loginWithEmailCode,
    loginWithPhoneCode,
    sendVerificationCode,
    registerUser,
    resetPassword,
    guard: null, // 暂时为null

    // 权限方法
    hasPermission,
    hasRole,
    hasFeature,
    canUseFeature,

    // 订阅状态
    isPro,
    isPremium
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// ===== Hook =====

/**
 * 使用统一认证的Hook
 */
export const useUnifiedAuth = (): AuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

// 导出默认的hook（向后兼容）
export const useAuth = useUnifiedAuth;
