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
  showLogin: () => Promise<void>;
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Guard初始化只执行一次
  useEffect(() => {
    const initGuard = async () => {
      try {
        const config = getAuthingConfig();
        const guardInstance = new Guard(config);
        // 事件绑定必须在实例化后
        guardInstance.on('login', (userInfo: any) => {
          const convertedUser: User = {
            id: String(userInfo.id || userInfo.userId || ''),
            username: String(userInfo.username || userInfo.nickname || ''),
            email: String(userInfo.email || ''),
            phone: String(userInfo.phone || ''),
            nickname: String(userInfo.nickname || userInfo.username || ''),
            avatar: String(userInfo.photo || userInfo.avatar || ''),
            ...((userInfo as unknown) as Record<string, unknown>)
          };
          setUser(convertedUser);
          setStatus('authenticated');
        });
        guardInstance.on('register', (userInfo: any) => {
          const convertedUser: User = {
            id: String(userInfo.id || userInfo.userId || ''),
            username: String(userInfo.username || userInfo.nickname || ''),
            email: String(userInfo.email || ''),
            phone: String(userInfo.phone || ''),
            nickname: String(userInfo.nickname || userInfo.username || ''),
            avatar: String(userInfo.photo || userInfo.avatar || ''),
            ...((userInfo as unknown) as Record<string, unknown>)
          };
          setUser(convertedUser);
          setStatus('authenticated');
        });
        // 修复类型错误：'logout'事件绑定加any断言
        (guardInstance as any).on('logout', () => {
          setUser(null);
          setStatus('unauthenticated');
        });
        setGuard(guardInstance);
        setIsInitialized(true);
      } catch (error) {
        setStatus('unauthenticated');
        setIsInitialized(false);
        setGuard(null);
        console.error('初始化 Guard 失败:', error);
      }
    };
    initGuard();
  }, []);

  const checkAuth = useCallback(async () => {
    if (!guard) {
      setStatus('unauthenticated');
      return;
    }
    setStatus('loading');
    try {
      const loginStatus = await guard.checkLoginStatus();
      if (loginStatus) {
        const userInfo = await guard.trackSession();
        if (userInfo) {
          const convertedUser: User = {
            id: String((userInfo as any).id || (userInfo as any).userId || ''),
            username: String((userInfo as any).username || (userInfo as any).nickname || ''),
            email: String((userInfo as any).email || ''),
            phone: String((userInfo as any).phone || ''),
            nickname: String((userInfo as any).nickname || (userInfo as any).username || ''),
            avatar: String((userInfo as any).photo || (userInfo as any).avatar || ''),
            ...((userInfo as unknown) as Record<string, unknown>)
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
      setUser(null);
      setStatus('unauthenticated');
    }
  }, [guard]);

  const login = useCallback(async () => {
    if (!guard) return;
    try {
      await guard.startWithRedirect();
    } catch (error) {
      try {
        guard.show();
      } catch (modalError) {
        console.error('Modal login also failed:', modalError);
      }
    }
  }, [guard]);

  const register = useCallback(async () => {
    if (!guard) return;
    try {
      await guard.startWithRedirect();
    } catch (error) {
      try {
        guard.show();
      } catch (modalError) {
        console.error('Modal register also failed:', modalError);
      }
    }
  }, [guard]);

  const logout = useCallback(async () => {
    if (guard) {
      try {
        await guard.logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  }, [guard]);

  // showLogin 现在为 async，确保 guard 已初始化
  const showLogin = useCallback(async () => {
    if (!isInitialized || !guard) {
      console.log('Guard not ready, waiting...');
      return;
    }
    try {
      await guard.show();
    } catch (e) {
      console.error('Guard.show() failed, redirect fallback:', e);
      try {
        await guard.startWithRedirect();
      } catch (redirectError) {
        console.error('Redirect fallback also failed:', redirectError);
      }
    }
  }, [isInitialized, guard]);

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