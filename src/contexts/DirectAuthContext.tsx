/**
 * 🔧 [DIRECT_AUTH_CONTEXT_v2025.08.15]
 * 直接认证上下文 - 不使用Authing Guard，直接使用OAuth2流程
 * 
 * 这个实现完全避免了@authing/guard的正则表达式错误问题
 * 直接使用Authing的OAuth2 Authorization Code流程
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserInfo } from '@/types/auth';
import { getAuthingConfig } from '@/config/authing';

/**
 * 直接认证上下文类型
 */
interface DirectAuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  handleAuthCallback: (code: string, state?: string) => Promise<void>;
}

/**
 * 创建直接认证上下文
 */
const DirectAuthContext = createContext<DirectAuthContextType | undefined>(undefined);

/**
 * 直接认证提供者组件
 */
export const DirectAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * 生成随机state参数
   */
  const generateState = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  /**
   * 构建Authing OAuth2授权URL
   */
  const buildAuthUrl = (isRegister: boolean = false): string => {
    const config = getAuthingConfig();
    const state = generateState();
    
    // 保存state到localStorage用于验证
    localStorage.setItem('authing_oauth_state', state);
    
    const params = new URLSearchParams({
      client_id: config.appId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: 'openid profile email phone',
      state: state,
      // 如果是注册，添加注册参数
      ...(isRegister && { prompt: 'register' })
    });

    const authUrl = `${config.host}/oidc/auth?${params.toString()}`;
    console.log('🔗 构建的认证URL:', authUrl);
    
    return authUrl;
  };

  /**
   * 使用授权码交换访问令牌
   */
  const exchangeCodeForToken = async (code: string): Promise<any> => {
    const config = getAuthingConfig();
    
    try {
      console.log('🔄 交换授权码获取令牌...');
      
      const tokenResponse = await fetch(`${config.host}/oidc/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.appId,
          code: code,
          redirect_uri: config.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token交换失败: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('✅ 令牌交换成功:', tokenData);
      
      return tokenData;
    } catch (error) {
      console.error('❌ 令牌交换失败:', error);
      throw error;
    }
  };

  /**
   * 使用访问令牌获取用户信息
   */
  const getUserInfo = async (accessToken: string): Promise<any> => {
    const config = getAuthingConfig();
    
    try {
      console.log('🔄 获取用户信息...');
      
      const userResponse = await fetch(`${config.host}/oidc/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error(`获取用户信息失败: ${userResponse.status} ${userResponse.statusText}`);
      }

      const userData = await userResponse.json();
      console.log('✅ 用户信息获取成功:', userData);
      
      return userData;
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error);
      throw error;
    }
  };

  /**
   * 处理认证回调
   */
  const handleAuthCallback = async (code: string, state?: string) => {
    try {
      console.log('🔄 处理认证回调...', { code, state });
      setLoading(true);
      setError(null);

      // 验证state参数
      const savedState = localStorage.getItem('authing_oauth_state');
      if (state && savedState && state !== savedState) {
        throw new Error('State参数验证失败，可能存在CSRF攻击');
      }

      // 清除保存的state
      localStorage.removeItem('authing_oauth_state');

      // 1. 交换授权码获取令牌
      const tokenData = await exchangeCodeForToken(code);
      
      // 2. 使用访问令牌获取用户信息
      const userData = await getUserInfo(tokenData.access_token);
      
      // 3. 处理用户信息
      await handleUserLogin(userData, tokenData);
      
      // 4. 清除URL参数
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      console.log('✅ 认证回调处理成功');
      
    } catch (error) {
      console.error('❌ 处理认证回调失败:', error);
      setError('认证失败: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理用户登录成功
   */
  const handleUserLogin = async (userData: any, tokenData?: any) => {
    try {
      console.log('🔐 处理用户登录:', userData);

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
        id: safeString(userData.sub) || safeString(userData.id) || safeString(userData.userId) || `user_${Date.now()}`,
        username: safeString(userData.preferred_username) || safeString(userData.username) || safeString(userData.nickname) || safeString(userData.name) || '用户',
        email: safeString(userData.email) || '',
        phone: safeString(userData.phone_number) || safeString(userData.phone) || '',
        nickname: safeString(userData.nickname) || safeString(userData.name) || safeString(userData.preferred_username) || '用户',
        avatar: safeString(userData.picture) || safeString(userData.avatar) || safeString(userData.photo) || '',
        loginTime: new Date().toISOString(),
        roles: Array.isArray(userData.roles) ? userData.roles : ['user'],
        permissions: Array.isArray(userData.permissions) ? userData.permissions : ['basic'],
        ...userData
      };

      // 最终安全检查
      Object.keys(user).forEach(key => {
        if (user[key as keyof UserInfo] === undefined || user[key as keyof UserInfo] === 'undefined') {
          console.warn(`🛠️ 修复用户信息中的undefined字段: ${key}`);
          (user as any)[key] = '';
        }
      });

      console.log('✅ 安全处理后的用户信息:', user);
      
      // 存储用户信息和令牌
      setUser(user);
      localStorage.setItem('authing_user', JSON.stringify(user));
      
      if (tokenData) {
        localStorage.setItem('authing_access_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem('authing_refresh_token', tokenData.refresh_token);
        }
      }
      
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
      console.error('❌ 处理用户登录失败:', error);
      setError('登录处理失败');
    }
  };

  /**
   * 登录方法 - 直接跳转到Authing
   */
  const login = async (redirectTo?: string) => {
    try {
      console.log('🔐 开始直接登录流程...');
      setError(null);

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
        console.log('📝 保存跳转目标:', redirectTo);
      }

      // 构建认证URL并跳转
      const authUrl = buildAuthUrl(false);
      console.log('🔗 跳转到Authing登录页面:', authUrl);
      window.location.href = authUrl;

    } catch (error) {
      console.error('❌ 直接登录失败:', error);
      setError('登录失败，请重试');
    }
  };

  /**
   * 注册方法 - 直接跳转到Authing注册页面
   */
  const register = async (redirectTo?: string) => {
    try {
      console.log('📝 开始直接注册流程...');
      setError(null);
      
      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }
      
      // 构建注册URL并跳转
      const authUrl = buildAuthUrl(true);
      console.log('🔗 跳转到Authing注册页面:', authUrl);
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('❌ 直接注册失败:', error);
      setError('注册失败，请重试');
    }
  };

  /**
   * 登出方法
   */
  const logout = async () => {
    try {
      console.log('🚪 开始直接登出流程...');
      
      // 清除用户信息
      setUser(null);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('authing_access_token');
      localStorage.removeItem('authing_refresh_token');
      localStorage.removeItem('login_redirect_to');
      localStorage.removeItem('authing_oauth_state');
      
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

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: DirectAuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    handleAuthCallback
  };

  return (
    <DirectAuthContext.Provider value={contextValue}>
      {children}
    </DirectAuthContext.Provider>
  );
};

/**
 * 使用直接认证上下文的Hook
 */
export const useDirectAuth = () => {
  const context = useContext(DirectAuthContext);
  if (context === undefined) {
    throw new Error('useDirectAuth must be used within a DirectAuthProvider');
  }
  return context;
};

export default DirectAuthContext;
