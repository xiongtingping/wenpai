import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthingClient from '@/services/authingClient';
import { UserInfo } from '@/types/auth';

/**
 * 统一认证上下文接口
 */
interface UnifiedAuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  handleAuthingLogin: (userInfo: any) => void;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<UserInfo>) => void;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithEmailCode: (email: string, code: string) => Promise<void>;
  loginWithPhoneCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (email: string, scene?: 'login' | 'register' | 'reset') => Promise<void>;
  registerUser: (userInfo: any) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// 本地存储键名
const STORAGE_KEYS = {
  USER_INFO: 'wenpai_user_info',
  ACCESS_TOKEN: 'wenpai_access_token',
  REFRESH_TOKEN: 'wenpai_refresh_token',
  LOGIN_TIME: 'wenpai_login_time'
};

/**
 * 从本地存储获取用户信息
 */
const getUserFromStorage = (): UserInfo | null => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const loginTime = localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);

    if (!userStr || !accessToken) {
      return null;
    }

    const user = JSON.parse(userStr);
    return {
      ...user,
      accessToken,
      refreshToken,
      loginTime: loginTime || user.loginTime
    };
  } catch (error) {
    console.error('从本地存储获取用户信息失败:', error);
    return null;
  }
};

/**
 * 保存用户信息到本地存储
 */
const saveUserToStorage = (user: UserInfo): void => {
  try {
    const { accessToken, refreshToken, ...userInfo } = user;
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, user.loginTime);
  } catch (error) {
    console.error('保存用户信息到本地存储失败:', error);
  }
};

/**
 * 清除本地存储的用户信息
 */
const clearUserFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);
  } catch (error) {
    console.error('清除本地存储用户信息失败:', error);
  }
};

/**
 * 检查 token 是否过期
 */
const isTokenExpired = (loginTime: string): boolean => {
  const loginDate = new Date(loginTime);
  const now = new Date();
  const diffInHours = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
  return diffInHours > 24; // 24小时过期
};

/**
 * 构建用户信息对象
 */
const buildUserInfo = (authingUser: any, tokenData?: any): UserInfo => {
  return {
    id: authingUser.id || authingUser.userId || authingUser.sub,
    username: authingUser.username || authingUser.preferred_username,
    email: authingUser.email,
    phone: authingUser.phone_number || authingUser.phone,
    nickname: authingUser.nickname || authingUser.name,
    avatar: authingUser.picture || authingUser.avatar,
    isVip: authingUser.isVip || false,
    isProUser: authingUser.isProUser || false,
    vipLevel: authingUser.vipLevel || 0,
    plan: authingUser.plan || 'free',
    permissions: authingUser.permissions || [],
    roles: authingUser.roles || [],
    accessToken: tokenData?.access_token || '',
    refreshToken: tokenData?.refresh_token || '',
    loginTime: new Date().toISOString(),
  };
};

/**
 * 统一认证提供者组件
 */
export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authingClient = AuthingClient.getInstance();

  /**
   * 初始化认证状态
   */
  const initAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // 检查是否是重定向回调
      const callbackResult = await authingClient.handleCallback();
      if (callbackResult) {
        // 处理登录回调
        handleAuthingLogin(callbackResult.user);
        
        // 如果有重定向地址，跳转回去
        if (callbackResult.state) {
          window.location.href = callbackResult.state;
          return;
        }
      }

      // 从本地存储获取用户信息
      const storedUser = getUserFromStorage();
      
      if (storedUser && !isTokenExpired(storedUser.loginTime)) {
        // 验证 token 是否有效
        const isValid = await authingClient.checkLoginStatus();
        if (isValid) {
          setUser(storedUser);
          console.log('✅ 从本地存储恢复用户会话');
        } else {
          // Token 无效，清除本地存储
          clearUserFromStorage();
          console.log('⚠️ Token 已过期，清除本地存储');
        }
      } else if (storedUser) {
        // Token 过期，尝试刷新
        try {
          await refreshToken();
        } catch (error) {
          clearUserFromStorage();
          console.log('⚠️ Token 刷新失败，清除本地存储');
        }
      }
    } catch (error) {
      console.error('初始化认证状态失败:', error);
      setError(error instanceof Error ? error.message : '初始化失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理 Authing 登录回调
   */
  const handleAuthingLogin = useCallback((userInfo: any) => {
    try {
      const user = buildUserInfo(userInfo);
      setUser(user);
      saveUserToStorage(user);
      setError(null);
      console.log('✅ Authing 登录成功:', user);
    } catch (error) {
      console.error('处理 Authing 登录失败:', error);
      setError(error instanceof Error ? error.message : '登录处理失败');
    }
  }, []);

  /**
   * 登录
   */
  const login = useCallback(async (redirectTo?: string) => {
    try {
      setError(null);
      const loginUrl = authingClient.getLoginUrl(redirectTo);
      window.location.href = loginUrl;
    } catch (error) {
      console.error('登录失败:', error);
      setError(error instanceof Error ? error.message : '登录失败');
    }
  }, []);

  /**
   * 注册
   */
  const register = useCallback(async (redirectTo?: string) => {
    try {
      setError(null);
      const registerUrl = authingClient.getRegisterUrl(redirectTo);
      window.location.href = registerUrl;
    } catch (error) {
      console.error('注册失败:', error);
      setError(error instanceof Error ? error.message : '注册失败');
    }
  }, []);

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      await authingClient.logout();
      setUser(null);
      clearUserFromStorage();
      console.log('✅ 登出成功');
    } catch (error) {
      console.error('登出失败:', error);
      setError(error instanceof Error ? error.message : '登出失败');
    }
  }, []);

  /**
   * 检查认证状态
   */
  const checkAuth = useCallback(async () => {
    try {
      const isValid = await authingClient.checkLoginStatus();
      if (!isValid && user) {
        setUser(null);
        clearUserFromStorage();
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
    }
  }, [user]);

  /**
   * 刷新 token
   */
  const refreshToken = useCallback(async () => {
    try {
      const tokenSet = await authingClient.refreshToken();
      if (user) {
        const updatedUser = {
          ...user,
          accessToken: tokenSet.access_token,
          refreshToken: tokenSet.refresh_token || user.refreshToken,
          loginTime: new Date().toISOString(),
        };
        
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
        console.log('✅ Token 刷新成功');
      }
    } catch (error) {
      console.error('刷新 token 失败:', error);
      setUser(null);
      clearUserFromStorage();
      throw error;
    }
  }, [user]);

  /**
   * 更新用户信息
   */
  const updateUser = useCallback((updates: Partial<UserInfo>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  }, [user]);

  /**
   * 密码登录
   */
  const loginWithPassword = useCallback(async (username: string, password: string) => {
    try {
      setError(null);
      const userInfo = await authingClient.loginWithPassword(username, password);
      handleAuthingLogin(userInfo);
    } catch (error) {
      console.error('密码登录失败:', error);
      setError(error instanceof Error ? error.message : '密码登录失败');
      throw error;
    }
  }, [handleAuthingLogin]);

  /**
   * 邮箱验证码登录
   */
  const loginWithEmailCode = useCallback(async (email: string, code: string) => {
    try {
      setError(null);
      const userInfo = await authingClient.loginWithEmailCode(email, code);
      handleAuthingLogin(userInfo);
    } catch (error) {
      console.error('邮箱验证码登录失败:', error);
      setError(error instanceof Error ? error.message : '邮箱验证码登录失败');
      throw error;
    }
  }, [handleAuthingLogin]);

  /**
   * 手机验证码登录
   */
  const loginWithPhoneCode = useCallback(async (phone: string, code: string) => {
    try {
      setError(null);
      const userInfo = await authingClient.loginWithPhoneCode(phone, code);
      handleAuthingLogin(userInfo);
    } catch (error) {
      console.error('手机验证码登录失败:', error);
      setError(error instanceof Error ? error.message : '手机验证码登录失败');
      throw error;
    }
  }, [handleAuthingLogin]);

  /**
   * 发送验证码
   */
  const sendVerificationCode = useCallback(async (email: string, scene: 'login' | 'register' | 'reset' = 'login') => {
    try {
      setError(null);
      await authingClient.sendVerificationCode(email, scene);
    } catch (error) {
      console.error('发送验证码失败:', error);
      setError(error instanceof Error ? error.message : '发送验证码失败');
      throw error;
    }
  }, []);

  /**
   * 注册用户
   */
  const registerUser = useCallback(async (userInfo: any) => {
    try {
      setError(null);
      const newUser = await authingClient.registerUser(userInfo);
      handleAuthingLogin(newUser);
    } catch (error) {
      console.error('注册用户失败:', error);
      setError(error instanceof Error ? error.message : '注册用户失败');
      throw error;
    }
  }, [handleAuthingLogin]);

  /**
   * 重置密码
   */
  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      setError(null);
      await authingClient.resetPassword(email, code, newPassword);
    } catch (error) {
      console.error('重置密码失败:', error);
      setError(error instanceof Error ? error.message : '重置密码失败');
      throw error;
    }
  }, []);

  // 初始化认证状态
  useEffect(() => {
    initAuth();
  }, []);

  const value: UnifiedAuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    handleAuthingLogin,
    refreshToken,
    updateUser,
    loginWithPassword,
    loginWithEmailCode,
    loginWithPhoneCode,
    sendVerificationCode,
    registerUser,
    resetPassword,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

/**
 * 使用统一认证 Hook
 */
export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
}; 