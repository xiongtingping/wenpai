/**
 * 认证上下文
 * 提供全局认证状态管理
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuthing } from '@/hooks/useAuthing';
import { usePermissions } from '@/hooks/usePermissions';
import { getOrCreateTempUserId } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';
import { secureStorage, dataMasking, securityUtils } from '@/lib/security';

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
  [key: string]: unknown;
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
  /** 当前用户ID（包括临时ID） */
  userId: string;
  /** 是否为临时用户 */
  isTempUser: boolean;
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
        const storedUser = secureStorage.getItem('authing_user');
        if (storedUser) {
          const userData = storedUser as User;
          setUser(userData);
          setStatus('authenticated');
          securityUtils.secureLog('用户认证状态初始化成功', { userId: userData.id });
        } else {
          // 未登录用户自动生成临时ID
          const tempUserId = getOrCreateTempUserId();
          securityUtils.secureLog('生成临时用户ID', { tempUserId });
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        // 即使出错也生成临时ID
        const tempUserId = getOrCreateTempUserId();
        securityUtils.secureLog('错误后生成临时用户ID', { tempUserId, error: error instanceof Error ? error.message : '未知错误' });
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
        plan: (authingUser as Record<string, unknown>).plan as string || 'free',
        isProUser: (authingUser as Record<string, unknown>).isProUser as boolean || false,
        ...authingUser // 保留其他属性
      };

      setUser(userData);
      setStatus('authenticated');
      setError(null);

      // 安全保存用户数据
      secureStorage.setItem('authing_user', userData);
      securityUtils.secureLog('用户数据已安全保存', { userId: userData.id });

      // 绑定临时用户ID到正式用户ID
      const userStore = useUserStore.getState();
      userStore.bindTempUserIdToAccount(userData.id).then(() => {
        console.log('临时用户ID绑定成功');
      }).catch((error) => {
        console.error('绑定临时用户ID失败:', error);
      });

      // 刷新权限信息
      refreshPermissions();
    } else if (!isLoggedIn) {
      setUser(null);
      setStatus('unauthenticated');
      secureStorage.removeItem('authing_user');
      securityUtils.secureLog('用户已登出，数据已清理');
    }
  }, [isLoggedIn, authingUser, authingLoading, refreshPermissions]);

  /**
   * 登录用户
   * @param userData - 用户数据
   */
  const login = useCallback((userData: User) => {
    try {
      secureStorage.setItem('authing_user', userData);
      setUser(userData);
      setStatus('authenticated');
      setError(null);
      
      securityUtils.secureLog('用户登录成功', { userId: userData.id });
      
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
      secureStorage.removeItem('authing_user');
      setUser(null);
      setStatus('unauthenticated');
      setError(null);
      
      securityUtils.secureLog('用户登出成功');
      
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
      secureStorage.setItem('authing_user', updatedUser);
      setUser(updatedUser);
      securityUtils.secureLog('用户信息已更新', { userId: updatedUser.id });
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

  /**
   * 获取当前用户ID（包括临时ID）
   */
  const userId = user?.id || getOrCreateTempUserId();

  /**
   * 检查是否为临时用户
   */
  const isTempUser = !isAuthenticated;

  const contextValue: AuthContextType = {
    user,
    status,
    isAuthenticated,
    isLoading,
    error,
    userId,
    isTempUser,
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