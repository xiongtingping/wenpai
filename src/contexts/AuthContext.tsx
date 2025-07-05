/**
 * 统一认证上下文
 * 整合 Authing 认证和用户状态管理
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Guard } from '@authing/guard-react';
import { getAuthingConfig } from '@/config/authing';

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
  [key: string]: unknown;
}

/**
 * 认证状态类型
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * 认证上下文接口
 */
interface AuthContextType {
  // 状态
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // 方法
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Guard 相关
  showLogin: () => void;
  hideLogin: () => void;
  guard: Guard | null;
}

/**
 * 认证上下文
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者组件
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证提供者组件
 * @param props 组件属性
 * @returns React 组件
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [guard, setGuard] = useState<Guard | null>(null);

  /**
   * 检查认证状态
   */
  const checkAuth = useCallback(async () => {
    try {
      setStatus('loading');
      
      if (!guard) {
        setStatus('unauthenticated');
        return;
      }

      const loginStatus = await guard.checkLoginStatus();
      
      if (loginStatus) {
        // 获取用户信息
        const userInfo = await guard.trackSession();
        
        if (userInfo) {
          // 转换 Authing SDK 的用户类型到我们的 User 类型
          const convertedUser: User = {
            id: String((userInfo as Record<string, unknown>).id || (userInfo as Record<string, unknown>).userId || ''),
            username: String((userInfo as Record<string, unknown>).username || (userInfo as Record<string, unknown>).nickname || ''),
            email: String((userInfo as Record<string, unknown>).email || ''),
            phone: String((userInfo as Record<string, unknown>).phone || ''),
            nickname: String((userInfo as Record<string, unknown>).nickname || (userInfo as Record<string, unknown>).username || ''),
            avatar: String((userInfo as Record<string, unknown>).photo || (userInfo as Record<string, unknown>).avatar || ''),
            ...userInfo // 保留其他属性
          };
          
          setUser(convertedUser);
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      } else {
        setUser(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [guard]);

  /**
   * 登录处理
   */
  const handleLoginSuccess = useCallback((userInfo: Record<string, unknown>) => {
    const user: User = {
      id: String(userInfo.id || userInfo.userId || ''),
      username: String(userInfo.username || userInfo.name || ''),
      email: String(userInfo.email || ''),
      nickname: String(userInfo.nickname || userInfo.displayName || ''),
      avatar: String(userInfo.avatar || userInfo.picture || ''),
      phone: String(userInfo.phone || userInfo.phoneNumber || ''),
      roles: Array.isArray(userInfo.roles) ? userInfo.roles : [],
      permissions: Array.isArray(userInfo.permissions) ? userInfo.permissions : [],
      metadata: userInfo.metadata || {}
    };
    
    setUser(user);
    setStatus('authenticated');
  }, []);

  /**
   * 注册处理
   */
  const handleRegister = useCallback((userInfo: Record<string, unknown>) => {
    // 转换 Authing SDK 的用户类型到我们的 User 类型
    const convertedUser: User = {
      id: String(userInfo.id || userInfo.userId || ''),
      username: String(userInfo.username || userInfo.nickname || ''),
      email: String(userInfo.email || ''),
      phone: String(userInfo.phone || ''),
      nickname: String(userInfo.nickname || userInfo.username || ''),
      avatar: String(userInfo.photo || userInfo.avatar || ''),
      ...userInfo // 保留其他属性
    };
    
    setUser(convertedUser);
    setStatus('authenticated');
  }, []);

  /**
   * 登出处理
   */
  const handleLogoutSuccess = useCallback(() => {
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  /**
   * 初始化 Guard
   */
  useEffect(() => {
    const initGuard = async () => {
      try {
        const config = getAuthingConfig();
        const newGuard = new Guard(config);
        
        // 设置事件监听器
        newGuard.on('login', handleLoginSuccess);
        newGuard.on('register', handleRegister);
        newGuard.on('login-error', () => {
          console.log('登录失败');
        });
        newGuard.on('close', () => {
          console.log('登录弹窗已关闭');
        });
        newGuard.on('logout', handleLogoutSuccess);
        
        setGuard(newGuard);
        
        // 检查初始认证状态
        await checkAuth();
      } catch (error) {
        console.error('初始化 Guard 失败:', error);
        setStatus('unauthenticated');
      }
    };

    initGuard();
  }, [handleLoginSuccess, handleRegister, checkAuth, handleLogoutSuccess]);

  /**
   * 登录
   */
  const login = useCallback(async () => {
    if (guard) {
      guard.show();
    }
  }, [guard]);

  /**
   * 注册
   */
  const register = useCallback(async () => {
    if (guard) {
      guard.show();
    }
  }, [guard]);

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    if (guard) {
      await guard.logout();
    }
  }, [guard]);

  /**
   * 显示登录界面
   */
  const showLogin = useCallback(() => {
    if (guard) {
      guard.show();
    }
  }, [guard]);

  /**
   * 隐藏登录界面
   */
  const hideLogin = useCallback(() => {
    if (guard) {
      guard.hide();
    }
  }, [guard]);

  const value: AuthContextType = {
    user,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    register,
    logout,
    checkAuth,
    showLogin,
    hideLogin,
    guard
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文
 * @returns 认证上下文
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 