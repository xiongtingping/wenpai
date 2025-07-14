/**
 * Authing状态检查Hook
 * 提供Authing登录状态检查和用户信息获取功能
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthing } from '@/hooks/useAuthing';
import { securityUtils } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

/**
 * 用户信息接口
 */
interface AuthingUser {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

/**
 * Authing状态Hook返回值
 */
interface UseAuthingStatusReturn {
  /** 是否已登录 */
  isLoggedIn: boolean;
  /** 用户信息 */
  user: AuthingUser | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 检查登录状态 */
  checkStatus: () => Promise<void>;
  /** 获取用户信息 */
  getUserInfo: () => Promise<void>;
  /** 登录 */
  login: (redirectUri?: string) => Promise<void>;
  /** 登出 */
  logout: () => Promise<void>;
  /** 刷新用户信息 */
  refreshUser: () => Promise<void>;
}

/**
 * Authing状态检查Hook
 * @param options 配置选项
 * @returns Authing状态和操作方法
 */
export function useAuthingStatus(options: {
  /** 是否自动检查登录状态 */
  autoCheck?: boolean;
  /** 登录后跳转路径 */
  redirectUri?: string;
  /** 是否启用安全日志 */
  enableSecurityLog?: boolean;
} = {}): UseAuthingStatusReturn {
  const {
    autoCheck = true,
    redirectUri = '/',
    enableSecurityLog = true
  } = options;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthingUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { checkLoginStatus, getCurrentUser, loginWithRedirect, logout: authingLogout } = useAuthing();
  const { toast } = useToast();

  /**
   * 安全日志记录
   */
  const logSecurity = useCallback((message: string, data?: any, level: 'info' | 'error' = 'info') => {
    if (enableSecurityLog) {
      securityUtils.secureLog(message, data, level);
    }
  }, [enableSecurityLog]);

  /**
   * 检查登录状态
   */
  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logSecurity('开始检查Authing登录状态');

      const isLoggedIn = await checkLoginStatus();
      setIsLoggedIn(isLoggedIn);

      if (isLoggedIn) {
        logSecurity('用户已登录，获取用户信息');
        await getUserInfo();
      } else {
        logSecurity('用户未登录');
        setUser(null);
      }

    } catch (err) {
      console.error('检查登录状态失败:', err);
      const errorMessage = err instanceof Error ? err.message : '检查登录状态失败';
      setError(errorMessage);
      
      logSecurity('检查登录状态失败', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      }, 'error');

      toast({
        title: "状态检查失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [checkLoginStatus, getUserInfo, logSecurity, toast]);

  /**
   * 获取用户信息
   */
  const getUserInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logSecurity('开始获取用户信息');

      const userData = await getCurrentUser();
      
      if (userData) {
        // 处理用户数据
        const processedUser: AuthingUser = {
          id: String(userData.id || userData.userId || ''),
          username: String(userData.username || ''),
          nickname: String(userData.nickname || userData.username || '用户'),
          email: String(userData.email || ''),
          phone: String(userData.phone || ''),
          photo: String(userData.photo || userData.avatar || ''),
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
          ...userData
        };

        setUser(processedUser);
        setIsLoggedIn(true);

        logSecurity('用户信息获取成功', {
          userId: processedUser.id,
          hasEmail: !!processedUser.email,
          hasPhone: !!processedUser.phone
        });

        toast({
          title: "登录成功",
          description: `欢迎回来，${processedUser.nickname}！`,
        });
      } else {
        setUser(null);
        setIsLoggedIn(false);
        logSecurity('用户信息为空');
      }

    } catch (err) {
      console.error('获取用户信息失败:', err);
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败';
      setError(errorMessage);
      
      logSecurity('获取用户信息失败', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      }, 'error');

      toast({
        title: "获取用户信息失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [getCurrentUser, logSecurity, toast]);

  /**
   * 登录
   */
  const login = useCallback(async (customRedirectUri?: string) => {
    try {
      setLoading(true);
      setError(null);

      const targetRedirectUri = customRedirectUri || redirectUri;
      
      logSecurity('用户点击登录', {
        redirectUri: targetRedirectUri,
        timestamp: new Date().toISOString()
      });

      await loginWithRedirect({
        redirectUri: targetRedirectUri
      });

      toast({
        title: "正在跳转到登录页面",
        description: "请完成登录以继续使用",
      });

    } catch (err) {
      console.error('登录失败:', err);
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      setError(errorMessage);
      
      logSecurity('登录失败', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      }, 'error');

      toast({
        title: "登录失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [loginWithRedirect, redirectUri, logSecurity, toast]);

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logSecurity('用户点击登出', {
        userId: user?.id,
        timestamp: new Date().toISOString()
      });

      await authingLogout();
      
      setUser(null);
      setIsLoggedIn(false);

      logSecurity('用户登出成功');

      toast({
        title: "登出成功",
        description: "您已安全退出登录",
      });

    } catch (err) {
      console.error('登出失败:', err);
      const errorMessage = err instanceof Error ? err.message : '登出失败';
      setError(errorMessage);
      
      logSecurity('登出失败', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      }, 'error');

      toast({
        title: "登出失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [authingLogout, user?.id, logSecurity, toast]);

  /**
   * 刷新用户信息
   */
  const refreshUser = useCallback(async () => {
    if (isLoggedIn) {
      await getUserInfo();
    }
  }, [isLoggedIn, getUserInfo]);

  // 自动检查登录状态
  useEffect(() => {
    if (autoCheck) {
      checkStatus();
    }
  }, [autoCheck, checkStatus]);

  return {
    isLoggedIn,
    user,
    loading,
    error,
    checkStatus,
    getUserInfo,
    login,
    logout,
    refreshUser
  };
}

/**
 * 简化的Authing状态检查Hook
 * 基于用户提供的代码逻辑
 */
export function useSimpleAuthingStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthingUser | null>(null);
  const [loading, setLoading] = useState(true);

  const { checkLoginStatus, getCurrentUser, loginWithRedirect } = useAuthing();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        const isLoggedIn = await checkLoginStatus();
        setIsLoggedIn(isLoggedIn);
        
        if (isLoggedIn) {
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData as AuthingUser);
          }
        } else {
          // 未登录时自动跳转到登录页面
          await loginWithRedirect();
        }
      } catch (error) {
        console.error('Authing状态检查失败:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [checkLoginStatus, getCurrentUser, loginWithRedirect]);

  return {
    isLoggedIn,
    user,
    loading
  };
} 