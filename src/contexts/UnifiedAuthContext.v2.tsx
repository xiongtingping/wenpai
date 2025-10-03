/**
 * 🔐 统一认证上下文 v2.0
 *
 * 架构重构:
 * ✅ Store作为单一真实来源 - 移除多层状态同步
 * ✅ 简化Context职责 - 仅提供业务逻辑和API调用
 * ✅ 透明加密 - Store中间件自动处理
 * ✅ 类型安全 - 使用统一类型系统
 *
 * 之前的问题 (v1):
 * ❌ Context有自己的state (user, setUser)
 * ❌ 同时操作Store和SecureService
 * ❌ 需要同步协调器解决竞态条件
 * ❌ 865行代码,难以维护
 *
 * 现在的方案 (v2):
 * ✅ Context无状态 - 所有状态来自Store
 * ✅ 只操作Store - 加密由中间件透明处理
 * ✅ 无需同步 - 单一数据源
 * ✅ ~300行代码,清晰简洁
 */

import React, { createContext, useContext, useCallback, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  UserInfo,
  AuthStatus,
  AuthContextValue,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SendCodeRequest,
  SendCodeResponse,
  PermissionCheckResult
} from '@/types/auth-types';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/authService';
import { SessionService } from '@/utils/sessionManager';

// ============================================================================
// 🎯 创建上下文
// ============================================================================

const UnifiedAuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// 🎯 Provider组件
// ============================================================================

export const UnifiedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 📌 从Store获取状态 (单一真实来源)
  const {
    user,
    isAuthenticated,
    authStatus,
    loading,
    error,
    sessionWarning,
    sessionRemainingTime,
    setUser,
    clearUser,
    updateUser: storeUpdateUser,
    setLoading,
    setError,
    clearError,
    setAuthStatus,
    setSessionWarning,
    setSessionRemainingTime
  } = useAuthStore();

  // ================================================================
  // 🔐 核心认证方法
  // ================================================================

  /**
   * 登录 - 统一入口
   */
  const login = useCallback(
    async (request: LoginRequest): Promise<LoginResponse> => {
      try {
        setLoading(true);
        clearError();
        setAuthStatus(AuthStatus.AUTHENTICATING);

        // 调用authService进行实际登录
        const { identifier, credential } = request;
        const result = await authService.loginByPassword(identifier, credential);

        if (result.success && result.user) {
          // ✅ 直接设置Store - 加密由中间件自动处理
          setUser(result.user as UserInfo);
          setAuthStatus(AuthStatus.AUTHENTICATED);

          // 处理跳转
          const redirectTo = localStorage.getItem('login_redirect_to') || '/';
          localStorage.removeItem('login_redirect_to');
          navigate(redirectTo, { replace: true });

          return result;
        } else {
          setAuthStatus(AuthStatus.ERROR);
          setError(result.message);
          return result;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '登录失败';
        setAuthStatus(AuthStatus.ERROR);
        setError(errorMsg);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError, clearError, setAuthStatus, navigate]
  );

  /**
   * 注册
   */
  const register = useCallback(
    async (request: RegisterRequest): Promise<RegisterResponse> => {
      try {
        setLoading(true);
        clearError();

        // TODO: 实现注册逻辑
        // const result = await authService.register(request);

        // 临时实现
        throw new Error('注册功能待实现');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '注册失败';
        setError(errorMsg);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, clearError]
  );

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // 调用服务端登出
      await authService.logout();

      // ✅ 清除Store - 自动加密清除
      clearUser();

      // 清理其他数据
      localStorage.removeItem('login_redirect_to');

      // 跳转首页
      navigate('/');
    } catch (error) {
      console.error('登出失败:', error);
      // 即使失败也清除本地状态
      clearUser();
    } finally {
      setLoading(false);
    }
  }, [clearUser, setLoading, navigate]);

  /**
   * 检查认证状态
   */
  const checkAuth = useCallback(async () => {
    // Store已经自动从加密存储恢复
    // 只需验证Token是否仍然有效
    if (user) {
      try {
        // 可选: 验证Token有效性
        // const isValid = await authService.verifyToken();
        // if (!isValid) clearUser();
      } catch (error) {
        console.error('认证检查失败:', error);
        clearUser();
      }
    }
  }, [user, clearUser]);

  /**
   * 刷新Token
   */
  const refreshToken = useCallback(async () => {
    // TODO: 实现Token刷新逻辑
    console.log('刷新Token');
  }, []);

  /**
   * 更新用户信息
   */
  const updateUser = useCallback(
    async (updates: Partial<UserInfo>) => {
      try {
        setLoading(true);
        clearError();

        // 调用服务端更新
        await authService.updateProfile(updates);

        // ✅ 更新Store
        storeUpdateUser(updates);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '更新用户信息失败';
        setError(errorMsg);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [storeUpdateUser, setLoading, setError, clearError]
  );

  // ================================================================
  // 📧 验证码方法
  // ================================================================

  const sendVerificationCode = useCallback(
    async (request: SendCodeRequest): Promise<SendCodeResponse> => {
      try {
        // TODO: 实现验证码发送
        return {
          success: true,
          message: '验证码已发送'
        };
      } catch (error) {
        throw error;
      }
    },
    []
  );

  // ================================================================
  // 🛡️ 权限方法
  // ================================================================

  const hasPermission = useCallback(
    (permission: string | string[]): boolean => {
      if (!user || !user.permissions) return false;

      const permissions = Array.isArray(permission) ? permission : [permission];
      return permissions.every(p => user.permissions.includes(p));
    },
    [user]
  );

  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (!user || !user.roles) return false;

      const roles = Array.isArray(role) ? role : [role];
      return roles.every(r => user.roles.includes(r));
    },
    [user]
  );

  const checkPermission = useCallback(
    (permission: string | string[]): PermissionCheckResult => {
      const hasPerm = hasPermission(permission);

      if (hasPerm) {
        return { hasPermission: true };
      }

      const permissions = Array.isArray(permission) ? permission : [permission];
      return {
        hasPermission: false,
        missingPermissions: permissions.filter(p => !user?.permissions.includes(p)),
        suggestedAction: isAuthenticated ? 'upgrade' : 'login'
      };
    },
    [hasPermission, user, isAuthenticated]
  );

  // ================================================================
  // ⏰ 会话管理
  // ================================================================

  const extendSession = useCallback(() => {
    SessionService.extend();
    setSessionWarning(false);
  }, [setSessionWarning]);

  const dismissSessionWarning = useCallback(() => {
    setSessionWarning(false);
  }, [setSessionWarning]);

  // ================================================================
  // 🔄 生命周期
  // ================================================================

  // 初始化时检查认证
  useEffect(() => {
    checkAuth();
  }, []);

  // 用户登录后启动会话管理
  useEffect(() => {
    if (!user) return;

    SessionService.start(user.id);
    SessionService.setCallbacks({
      onSessionWarning: (remainingTime) => {
        setSessionWarning(true);
        setSessionRemainingTime(remainingTime);
      },
      onSessionExpired: () => {
        logout();
      },
      onSessionExtended: () => {
        setSessionWarning(false);
      },
      onActivityDetected: () => {
        // 静默处理
      }
    });

    return () => {
      SessionService.end();
    };
  }, [user, logout, setSessionWarning, setSessionRemainingTime]);

  // ================================================================
  // 🎯 Context Value
  // ================================================================

  const contextValue: AuthContextValue = {
    // 状态
    user,
    isAuthenticated,
    authStatus,
    loading,
    error,
    sessionWarning,
    sessionRemainingTime,

    // 核心方法
    login,
    register,
    logout,
    checkAuth,
    refreshToken,
    updateUser,

    // 验证码方法
    sendVerificationCode,

    // 权限方法
    hasPermission,
    hasRole,
    checkPermission,

    // 会话管理
    extendSession,
    dismissSessionWarning
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// ============================================================================
// 🎯 Hook
// ============================================================================

export const useUnifiedAuth = (): AuthContextValue => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  }
  return context;
};

export default UnifiedAuthContext;
