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
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * 检查认证状态
   */
  const checkAuth = useCallback(async () => {
    try {
      console.log('Checking auth status...');
      setStatus('loading');
      
      if (!guard) {
        console.log('Guard not available, setting unauthenticated');
        setStatus('unauthenticated');
        return;
      }

      const loginStatus = await guard.checkLoginStatus();
      console.log('Login status:', loginStatus);
      
      if (loginStatus) {
        // 获取用户信息
        const userInfo = await guard.trackSession();
        console.log('User info:', userInfo);
        
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
          console.log('User authenticated:', convertedUser);
        } else {
          setUser(null);
          setStatus('unauthenticated');
          console.log('No user info found');
        }
      } else {
        setUser(null);
        setStatus('unauthenticated');
        console.log('Not logged in');
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
    console.log('Login success:', userInfo);
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
    console.log('Register success:', userInfo);
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
    console.log('Logout success');
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  /**
   * 初始化 Guard
   */
  useEffect(() => {
    const initGuard = async () => {
      try {
        console.log('Initializing Authing Guard...');
        const config = getAuthingConfig();
        console.log('Authing config:', config);
        
        const newGuard = new Guard(config);
        console.log('Guard created:', newGuard);
        
        // 设置事件监听器
        newGuard.on('login', handleLoginSuccess as any);
        newGuard.on('register', handleRegister as any);
        newGuard.on('login-error', (error: any) => {
          console.error('Login error:', error);
        });
        newGuard.on('close', () => {
          console.log('Login modal closed');
        });
        newGuard.on('logout' as any, handleLogoutSuccess as any);
        
        setGuard(newGuard);
        setIsInitialized(true);
        console.log('Guard initialized successfully');
        
        // 检查初始认证状态
        await checkAuth();
      } catch (error) {
        console.error('初始化 Guard 失败:', error);
        setStatus('unauthenticated');
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initGuard();
    }
  }, [handleLoginSuccess, handleRegister, checkAuth, handleLogoutSuccess, isInitialized]);

  /**
   * 登录 - 使用重定向方式
   */
  const login = useCallback(async () => {
    console.log('Login called');
    if (guard) {
      try {
        console.log('Attempting login with redirect...');
        await guard.startWithRedirect();
      } catch (error) {
        console.error('Login redirect failed:', error);
        // 回退到弹窗方式
        try {
          console.log('Falling back to modal login...');
          guard.show();
        } catch (modalError) {
          console.error('Modal login also failed:', modalError);
        }
      }
    } else {
      console.error('Guard not available for login');
    }
  }, [guard]);

  /**
   * 注册 - 使用重定向方式
   */
  const register = useCallback(async () => {
    console.log('Register called');
    if (guard) {
      try {
        console.log('Attempting register with redirect...');
        await guard.startWithRedirect({ scene: 'register' });
      } catch (error) {
        console.error('Register redirect failed:', error);
        // 回退到弹窗方式
        try {
          console.log('Falling back to modal register...');
          guard.show();
        } catch (modalError) {
          console.error('Modal register also failed:', modalError);
        }
      }
    } else {
      console.error('Guard not available for register');
    }
  }, [guard]);

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    console.log('Logout called');
    if (guard) {
      try {
        await guard.logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  }, [guard]);

  /**
   * 显示登录界面 - 优先使用重定向，失败时回退到弹窗
   */
  const showLogin = useCallback(() => {
    console.log('showLogin called, guard:', guard, 'isInitialized:', isInitialized);
    
    if (!isInitialized) {
      console.log('Guard not initialized yet, please wait...');
      return;
    }
    
    if (guard) {
      // 优先使用重定向登录
      login().catch(error => {
        console.error('Login failed:', error);
      });
    } else {
      console.error('Guard not available');
    }
  }, [guard, isInitialized, login]);

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