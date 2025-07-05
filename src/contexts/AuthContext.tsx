/**
 * 统一认证上下文
 * 整合 Authing 认证和用户状态管理
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Guard } from '@authing/guard-react';
import { getAuthingConfig, getGuardConfig } from '@/config/authing';

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
    console.log('Initializing Guard...');
    try {
      const config = getGuardConfig();
      console.log('Guard config:', config);
      
      const guardInstance = new Guard({
        ...config,
        history: {
          push: (path: string) => {
            // 使用 window.location 进行导航
            console.log('Guard navigation to:', path);
            window.location.href = path;
          }
        }
      } as any);
      
      console.log('Guard instance created:', guardInstance);
      
      // 不再绑定 guard.on('push', ...)
      guardInstance.on('login', (userInfo: any) => {
        console.log('Login event triggered:', userInfo);
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
        console.log('Register event triggered:', userInfo);
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
        console.log('Logout event triggered');
        setUser(null);
        setStatus('unauthenticated');
      });
      
      setGuard(guardInstance);
      setIsInitialized(true);
      console.log('Guard initialization completed');
    } catch (error) {
      console.error('初始化 Guard 失败:', error);
      setStatus('unauthenticated');
      setIsInitialized(false);
      setGuard(null);
    }
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
    console.log('showLogin called, isInitialized:', isInitialized, 'guard:', guard);
    
    if (!isInitialized) {
      console.log('Guard not initialized yet, waiting...');
      // 等待一段时间后重试
      setTimeout(async () => {
        if (guard) {
          console.log('Retrying showLogin after delay...');
          try {
            await guard.show();
          } catch (e) {
            console.error('Retry Guard.show() failed:', e);
            try {
              await guard.startWithRedirect();
            } catch (redirectError) {
              console.error('Retry redirect fallback also failed:', redirectError);
            }
          }
        }
      }, 1000);
      return;
    }
    
    if (!guard) {
      console.error('Guard is null even though initialized');
      return;
    }
    
    try {
      console.log('Calling guard.show()...');
      await guard.show();
    } catch (e) {
      console.error('Guard.show() failed, trying redirect fallback:', e);
      try {
        console.log('Calling guard.startWithRedirect()...');
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