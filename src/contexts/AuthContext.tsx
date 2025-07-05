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
            id: String((userInfo as any).id || (userInfo as any).userId || ''),
            username: String((userInfo as any).username || (userInfo as any).nickname || ''),
            email: String((userInfo as any).email || ''),
            phone: String((userInfo as any).phone || ''),
            nickname: String((userInfo as any).nickname || (userInfo as any).username || ''),
            avatar: String((userInfo as any).photo || (userInfo as any).avatar || ''),
            ...((userInfo as unknown) as Record<string, unknown>) // 保留其他属性
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
  const handleLoginSuccess = useCallback((userInfo: any) => {
    // 转换 Authing SDK 的用户类型到我们的 User 类型
    const convertedUser: User = {
      id: String(userInfo.id || userInfo.userId || ''),
      username: String(userInfo.username || userInfo.nickname || ''),
      email: String(userInfo.email || ''),
      phone: String(userInfo.phone || ''),
      nickname: String(userInfo.nickname || userInfo.username || ''),
      avatar: String(userInfo.photo || userInfo.avatar || ''),
      ...((userInfo as unknown) as Record<string, unknown>) // 保留其他属性
    };
    
    setUser(convertedUser);
    setStatus('authenticated');
  }, []);

  /**
   * 注册处理
   */
  const handleRegister = useCallback((userInfo: any) => {
    // 转换 Authing SDK 的用户类型到我们的 User 类型
    const convertedUser: User = {
      id: String(userInfo.id || userInfo.userId || ''),
      username: String(userInfo.username || userInfo.nickname || ''),
      email: String(userInfo.email || ''),
      phone: String(userInfo.phone || ''),
      nickname: String(userInfo.nickname || userInfo.username || ''),
      avatar: String(userInfo.photo || userInfo.avatar || ''),
      ...((userInfo as unknown) as Record<string, unknown>) // 保留其他属性
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
        newGuard.on('login', handleLoginSuccess as any);
        newGuard.on('register', handleRegister as any);
        newGuard.on('login-error', () => {
          console.log('登录失败');
        });
        newGuard.on('close', () => {
          console.log('登录弹窗已关闭');
        });
        newGuard.on('logout' as any, handleLogoutSuccess as any);
        
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
    console.log('showLogin called, guard:', guard);
    if (guard) {
      try {
        guard.show();
        console.log('Guard.show() called successfully');
      } catch (error) {
        console.error('Guard.show() failed:', error);
        // 如果弹窗失败，尝试重定向登录
        try {
          (guard as any).loginWithRedirect();
        } catch (redirectError) {
          console.error('Login redirect also failed:', redirectError);
        }
      }
    } else {
      console.warn('Guard not initialized yet');
      // 如果guard未初始化，尝试重新初始化
      setTimeout(() => {
        if (guard) {
          guard.show();
        } else {
          console.error('Guard still not available after timeout');
        }
      }, 1000);
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