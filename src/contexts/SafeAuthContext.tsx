/**
 * 🔧 [SAFE_AUTH_CONTEXT_v2025.08.15]
 * 安全认证上下文 - 使用修复后的Authing Guard
 * 
 * 这是一个新的认证上下文，专门解决Authing Guard的正则表达式错误问题
 * 不修改原有的UnifiedAuthContext（因为它被标记为LOCKED）
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserInfo } from '@/types/auth';
import { getAuthingConfig } from '@/config/authing';
import { 
  createSafeGuardInstance, 
  getGuardInstance, 
  resetGuardInstance,
  safeShowGuard,
  isGuardAvailable 
} from '@/utils/authingGuardFixer';

/**
 * 安全认证上下文类型
 */
interface SafeAuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  handleAuthingLogin: (userInfo: any) => void;
}

/**
 * 创建安全认证上下文
 */
const SafeAuthContext = createContext<SafeAuthContextType | undefined>(undefined);

/**
 * 安全认证提供者组件
 */
export const SafeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * 初始化Guard实例
   */
  const initializeGuard = async (): Promise<boolean> => {
    try {
      console.log('🔄 开始初始化安全Guard实例...');
      
      const guardInstance = await createSafeGuardInstance();
      
      if (guardInstance) {
        // 设置事件监听器
        guardInstance.on('login', (userInfo: any) => {
          console.log('🔐 Guard 登录成功:', userInfo);
          handleAuthingLogin(userInfo);
        });

        guardInstance.on('register', (userInfo: any) => {
          console.log('📝 Guard 注册成功:', userInfo);
          handleAuthingLogin(userInfo);
        });

        guardInstance.on('login-error', (error: any) => {
          console.error('❌ Guard 登录失败:', error);
          setError('登录失败: ' + (error.message || error));
        });

        guardInstance.on('register-error', (error: any) => {
          console.error('❌ Guard 注册失败:', error);
          setError('注册失败: ' + (error.message || error));
        });

        guardInstance.on('close', () => {
          console.log('🔒 Guard 弹窗已关闭');
        });

        console.log('✅ 安全Guard初始化成功');
        return true;
      } else {
        throw new Error('Guard 实例创建失败');
      }
    } catch (error) {
      console.error('❌ 安全Guard初始化失败:', error);
      setError('认证系统初始化失败: ' + (error.message || error));
      return false;
    }
  };

  /**
   * 处理 Authing 登录成功
   */
  const handleAuthingLogin = (userInfo: any) => {
    try {
      console.log('🔐 处理 Authing 登录:', userInfo);

      // 安全的字符串提取函数
      const safeString = (value: any, fallback: string = '') => {
        if (value === null || value === undefined || value === 'undefined' || value === 'null') {
          return fallback;
        }
        const str = String(value).trim();
        return str === 'undefined' || str === 'null' || str === '' ? fallback : str;
      };

      // 统一用户信息格式
      const user: UserInfo = {
        id: safeString(userInfo.id) || safeString(userInfo.userId) || safeString(userInfo.sub) || `user_${Date.now()}`,
        username: safeString(userInfo.username) || safeString(userInfo.nickname) || safeString(userInfo.name) || '用户',
        email: safeString(userInfo.email) || safeString(userInfo.emailAddress) || '',
        phone: safeString(userInfo.phone) || safeString(userInfo.phoneNumber) || '',
        nickname: safeString(userInfo.nickname) || safeString(userInfo.username) || safeString(userInfo.name) || '用户',
        avatar: safeString(userInfo.avatar) || safeString(userInfo.photo) || safeString(userInfo.picture) || '',
        loginTime: new Date().toISOString(),
        roles: Array.isArray(userInfo.roles) ? userInfo.roles : ['user'],
        permissions: Array.isArray(userInfo.permissions) ? userInfo.permissions : ['basic'],
        ...userInfo
      };

      // 最终安全检查
      Object.keys(user).forEach(key => {
        if (user[key as keyof UserInfo] === undefined || user[key as keyof UserInfo] === 'undefined') {
          console.warn(`🛠️ 修复用户信息中的undefined字段: ${key}`);
          (user as any)[key] = '';
        }
      });

      console.log('✅ 安全处理后的用户信息:', user);
      
      // 存储用户信息
      setUser(user);
      localStorage.setItem('authing_user', JSON.stringify(user));
      
      // 处理登录成功后的跳转
      const redirectTo = localStorage.getItem('login_redirect_to');
      if (redirectTo) {
        localStorage.removeItem('login_redirect_to');
        console.log('🎯 登录成功后跳转到指定页面:', redirectTo);
        setTimeout(() => {
          navigate(redirectTo);
        }, 500);
      }
      
      console.log('✅ 用户登录成功:', user);
      
    } catch (error) {
      console.error('❌ 处理 Authing 登录失败:', error);
      setError('登录处理失败');
    }
  };

  /**
   * 登录方法
   */
  const login = async (redirectTo?: string) => {
    try {
      console.log('🔐 开始安全登录流程...');
      setError(null);

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
        console.log('📝 保存跳转目标:', redirectTo);
      }

      // 使用安全的Guard显示方法
      await safeShowGuard();

    } catch (error) {
      console.error('❌ 安全登录失败:', error);
      setError('登录失败，请刷新页面重试');
    }
  };

  /**
   * 注册方法
   */
  const register = async (redirectTo?: string) => {
    try {
      console.log('📝 开始安全注册流程...');
      setError(null);
      
      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }
      
      // 使用安全的Guard显示方法
      await safeShowGuard();
      
    } catch (error) {
      console.error('❌ 安全注册失败:', error);
      setError('注册失败');
    }
  };

  /**
   * 登出方法
   */
  const logout = async () => {
    try {
      console.log('🚪 开始安全登出流程...');
      
      // 清除用户信息
      setUser(null);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('login_redirect_to');
      localStorage.removeItem('authing_token');
      
      // 跳转到首页
      navigate('/');
      
      console.log('✅ 用户登出成功');
      
    } catch (error) {
      console.error('❌ 登出失败:', error);
      setError('登出失败');
    }
  };

  /**
   * 检查认证状态
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // 从localStorage恢复用户信息
      const savedUser = localStorage.getItem('authing_user');
      if (savedUser) {
        try {
          const userInfo = JSON.parse(savedUser);
          setUser(userInfo);
          console.log('✅ 从localStorage恢复用户信息:', userInfo);
        } catch (parseError) {
          console.error('❌ 解析保存的用户信息失败:', parseError);
          localStorage.removeItem('authing_user');
        }
      }
      
    } catch (error) {
      console.error('❌ 检查认证状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时检查认证状态和初始化Guard
  useEffect(() => {
    const init = async () => {
      await checkAuth();
      await initializeGuard();
    };
    
    init();
  }, []);

  const contextValue: SafeAuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    handleAuthingLogin
  };

  return (
    <SafeAuthContext.Provider value={contextValue}>
      {children}
    </SafeAuthContext.Provider>
  );
};

/**
 * 使用安全认证上下文的Hook
 */
export const useSafeAuth = () => {
  const context = useContext(SafeAuthContext);
  if (context === undefined) {
    throw new Error('useSafeAuth must be used within a SafeAuthProvider');
  }
  return context;
};

export default SafeAuthContext;
