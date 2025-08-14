/**
 * 🔧 SYSTEM REBUILD: 基于@authing/web的全新认证系统
 * 📌 系统性重构，解决依赖冲突和架构混乱问题
 * 🎯 只使用@authing/web，移除所有其他Authing包
 * 
 * 🔒 [AUTHING_WEB_PURE_SYSTEM_v2025.08.14]
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Authing } from '@authing/web';
import { getAuthingConfig } from '@/config/authing';
import { createAuthingInstance, getAuthingInstance } from '@/authing/guardManager';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  loginTime?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

/**
 * 认证上下文类型
 */
export interface AuthingWebContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  authingClient: Authing | null;
  
  // 核心方法
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // 扩展方法
  loginWithPassword: (account: string, password: string) => Promise<void>;
  loginWithEmailCode: (email: string, code: string) => Promise<void>;
  loginWithPhoneCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (target: string, type: 'email' | 'phone') => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  
  // 权限方法
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthingWebContext = createContext<AuthingWebContextType | undefined>(undefined);

export const useAuthingWeb = () => {
  const context = useContext(AuthingWebContext);
  if (context === undefined) {
    throw new Error('useAuthingWeb must be used within an AuthingWebProvider');
  }
  return context;
};

interface AuthingWebProviderProps {
  children: ReactNode;
}

export const AuthingWebProvider: React.FC<AuthingWebProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authingClient, setAuthingClient] = useState<Authing | null>(null);
  const navigate = useNavigate();

  /**
   * 初始化Authing客户端 - 使用统一管理器
   */
  const initializeAuthing = async () => {
    try {
      console.log('🔧 使用统一Guard管理器初始化Authing客户端...');

      // 🔧 使用统一的Guard管理器
      const client = await createAuthingInstance();

      setAuthingClient(client);
      console.log('✅ Authing Web客户端初始化成功');

      return client;
    } catch (error) {
      console.error('❌ Authing Web客户端初始化失败:', error);
      setError('认证系统初始化失败: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  /**
   * 检查认证状态
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!authingClient) {
        console.log('🔄 Authing客户端未初始化，正在初始化...');
        await initializeAuthing();
        return;
      }

      // 检查是否有token
      const token = localStorage.getItem('authing_token') || 
                   sessionStorage.getItem('authing_token');

      if (!token) {
        console.log('🔍 未找到认证token');
        setUser(null);
        setLoading(false);
        return;
      }

      // 验证token并获取用户信息
      const userInfo = await authingClient.getUserInfo();
      
      if (userInfo) {
        console.log('✅ 用户认证有效:', userInfo);
        setUser({
          id: userInfo.sub || userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          phone: userInfo.phone,
          nickname: userInfo.nickname || userInfo.name,
          avatar: userInfo.picture,
          loginTime: new Date().toISOString(),
          roles: userInfo.roles || [],
          permissions: userInfo.permissions || []
        });
      } else {
        console.log('❌ 用户信息获取失败');
        setUser(null);
        // 清除无效token
        localStorage.removeItem('authing_token');
        sessionStorage.removeItem('authing_token');
      }
    } catch (error) {
      console.error('❌ 认证检查失败:', error);
      setError('认证检查失败');
      setUser(null);
      // 清除可能无效的token
      localStorage.removeItem('authing_token');
      sessionStorage.removeItem('authing_token');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 登录 - 使用Authing Web内置登录
   */
  const login = async () => {
    try {
      console.log('🔐 开始登录流程...');
      setError(null);

      if (!authingClient) {
        throw new Error('Authing客户端未初始化');
      }

      // 🔧 使用Authing Web的内置登录方法
      // 这会重定向到Authing的登录页面
      await authingClient.loginWithRedirect();
      
    } catch (error) {
      console.error('❌ 登录失败:', error);
      setError('登录失败: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  /**
   * 登出
   */
  const logout = async () => {
    try {
      console.log('🚪 开始登出流程...');
      setError(null);

      if (authingClient) {
        await authingClient.logoutWithRedirect();
      }

      // 清除本地状态
      setUser(null);
      localStorage.removeItem('authing_token');
      sessionStorage.removeItem('authing_token');
      
      console.log('✅ 登出成功');
      navigate('/');
    } catch (error) {
      console.error('❌ 登出失败:', error);
      setError('登出失败');
      throw error;
    }
  };

  /**
   * 密码登录
   */
  const loginWithPassword = async (account: string, password: string) => {
    try {
      console.log('🔐 密码登录:', account);
      setError(null);

      if (!authingClient) {
        throw new Error('Authing客户端未初始化');
      }

      const result = await authingClient.loginWithPassword({
        connection: 'PASSWORD',
        passwordPayload: {
          email: account.includes('@') ? account : undefined,
          username: !account.includes('@') ? account : undefined,
          password: password
        }
      });

      if (result.statusCode === 200 && result.data) {
        console.log('✅ 密码登录成功:', result.data);
        
        // 保存token
        if (result.data.access_token) {
          localStorage.setItem('authing_token', result.data.access_token);
        }
        
        // 获取用户信息
        await checkAuth();
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      console.error('❌ 密码登录失败:', error);
      setError('登录失败: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  /**
   * 邮箱验证码登录
   */
  const loginWithEmailCode = async (email: string, code: string) => {
    try {
      console.log('📧 邮箱验证码登录:', email);
      setError(null);

      if (!authingClient) {
        throw new Error('Authing客户端未初始化');
      }

      const result = await authingClient.loginWithEmailCode({
        email,
        code
      });

      if (result.statusCode === 200 && result.data) {
        console.log('✅ 邮箱验证码登录成功');
        
        if (result.data.access_token) {
          localStorage.setItem('authing_token', result.data.access_token);
        }
        
        await checkAuth();
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      console.error('❌ 邮箱验证码登录失败:', error);
      setError('登录失败: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  /**
   * 手机验证码登录
   */
  const loginWithPhoneCode = async (phone: string, code: string) => {
    try {
      console.log('📱 手机验证码登录:', phone);
      setError(null);

      if (!authingClient) {
        throw new Error('Authing客户端未初始化');
      }

      const result = await authingClient.loginWithPhoneCode({
        phone,
        code
      });

      if (result.statusCode === 200 && result.data) {
        console.log('✅ 手机验证码登录成功');
        
        if (result.data.access_token) {
          localStorage.setItem('authing_token', result.data.access_token);
        }
        
        await checkAuth();
      } else {
        throw new Error(result.message || '登录失败');
      }
    } catch (error) {
      console.error('❌ 手机验证码登录失败:', error);
      setError('登录失败: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  /**
   * 发送验证码
   */
  const sendVerificationCode = async (target: string, type: 'email' | 'phone') => {
    try {
      console.log(`📤 发送${type}验证码:`, target);
      setError(null);

      if (!authingClient) {
        throw new Error('Authing客户端未初始化');
      }

      if (type === 'email') {
        await authingClient.sendEmailCode({ email: target });
      } else {
        await authingClient.sendSmsCode({ phone: target });
      }

      console.log(`✅ ${type}验证码发送成功`);
    } catch (error) {
      console.error(`❌ ${type}验证码发送失败:`, error);
      setError(`验证码发送失败: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  };

  /**
   * 注册用户
   */
  const registerUser = async (data: any) => {
    try {
      console.log('📝 注册用户:', data.email || data.phone);
      setError(null);

      if (!authingClient) {
        throw new Error('Authing客户端未初始化');
      }

      const result = await authingClient.registerWithEmailPassword({
        email: data.email,
        password: data.password,
        profile: {
          nickname: data.nickname,
          username: data.username
        }
      });

      if (result.statusCode === 200 && result.data) {
        console.log('✅ 注册成功:', result.data);
        
        if (result.data.access_token) {
          localStorage.setItem('authing_token', result.data.access_token);
        }
        
        await checkAuth();
      } else {
        throw new Error(result.message || '注册失败');
      }
    } catch (error) {
      console.error('❌ 注册失败:', error);
      setError('注册失败: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  /**
   * 重置密码
   */
  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      console.log('🔑 重置密码:', email);
      setError(null);

      if (!authingClient) {
        throw new Error('Authing客户端未初始化');
      }

      const result = await authingClient.resetPasswordByEmailCode({
        email,
        code,
        password: newPassword
      });

      if (result.statusCode === 200) {
        console.log('✅ 密码重置成功');
      } else {
        throw new Error(result.message || '密码重置失败');
      }
    } catch (error) {
      console.error('❌ 密码重置失败:', error);
      setError('密码重置失败: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  };

  /**
   * 权限检查
   */
  const hasPermission = (permission: string): boolean => {
    if (import.meta.env.DEV) {
      return true;
    }
    
    if (!user || !user.permissions) {
      return false;
    }
    
    return user.permissions.includes(permission);
  };

  /**
   * 角色检查
   */
  const hasRole = (role: string): boolean => {
    if (import.meta.env.DEV) {
      return true;
    }
    
    if (!user || !user.roles) {
      return false;
    }
    
    return user.roles.includes(role);
  };

  // 初始化
  useEffect(() => {
    const init = async () => {
      await initializeAuthing();
      await checkAuth();
    };
    
    init();
  }, []);

  // 处理回调
  useEffect(() => {
    const handleCallback = async () => {
      if (window.location.pathname === '/callback' && authingClient) {
        try {
          const result = await authingClient.handleRedirectCallback();
          if (result) {
            console.log('✅ 回调处理成功:', result);
            if (result.access_token) {
              localStorage.setItem('authing_token', result.access_token);
            }
            await checkAuth();
            navigate('/');
          }
        } catch (error) {
          console.error('❌ 回调处理失败:', error);
          setError('登录回调处理失败');
        }
      }
    };

    handleCallback();
  }, [authingClient, navigate]);

  const contextValue: AuthingWebContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    authingClient,
    login,
    logout,
    checkAuth,
    loginWithPassword,
    loginWithEmailCode,
    loginWithPhoneCode,
    sendVerificationCode,
    registerUser,
    resetPassword,
    hasPermission,
    hasRole
  };

  return (
    <AuthingWebContext.Provider value={contextValue}>
      {children}
    </AuthingWebContext.Provider>
  );
};

export default AuthingWebProvider;
