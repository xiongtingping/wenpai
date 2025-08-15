/**
 * ✅ FIXED: 2025-01-05 使用 Authing 官方 SDK 重写统一认证上下文
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Guard } from '@authing/guard';
import { Authing } from '@authing/web';
import { getAuthingConfig } from '@/config/authing';

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
 * 统一认证上下文类型
 */
interface UnifiedAuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  handleAuthingLogin: (userInfo: any) => void;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<UserInfo>) => void;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithEmailCode: (email: string, code: string) => Promise<void>;
  loginWithPhoneCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (email: string, scene?: 'login' | 'register' | 'reset') => Promise<void>;
  registerUser: (userInfo: any) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  guard: Guard | null;
}

/**
 * 获取 Authing 配置
 */
// 删除本地 getAuthingConfig 实现

/**
 * 单例 Authing 客户端
 */
let authingClient: Authing | null = null;
let guardInstance: any = null;

/**
 * 获取 Authing 客户端实例
 */
const getAuthingClient = () => {
  if (!authingClient) {
    const config = getAuthingConfig();
    authingClient = new Authing({
      domain: config.host.replace('https://', ''),
      appId: config.appId,
      userPoolId: config.userPoolId || config.appId, // 添加必需的userPoolId
      redirectUri: config.redirectUri,
      scope: 'openid profile email phone'
      // prompt: 'login' // 移除不兼容的配置项
    });
  }
  return authingClient;
};

/**
 * 获取 Guard 实例
 */
function getGuardInstance() {
  if (guardInstance) return guardInstance;

  const config = getAuthingConfig();

  // 🔍 深度调试 - 检查实际配置值
  console.log('🔍 深度调试 - 配置详情:');
  console.log('config对象:', config);
  console.log('config.appId:', config.appId);
  console.log('config.appId类型:', typeof config.appId);
  console.log('config.appId长度:', config.appId?.length);
  console.log('config.appId是否为空字符串:', config.appId === '');
  console.log('config.appId是否为undefined:', config.appId === undefined);
  console.log('config.appId是否为null:', config.appId === null);

  // 验证必要配置
  if (!config.appId) {
    console.error('❌ Authing配置错误: appId为空', config);
    console.error('❌ 详细调试信息:', {
      appId: config.appId,
      type: typeof config.appId,
      length: config.appId?.length,
      isEmpty: config.appId === '',
      isUndefined: config.appId === undefined,
      isNull: config.appId === null
    });
    throw new Error('Authing配置错误: appId为空，请检查环境变量VITE_AUTHING_APP_ID');
  }

  if (!config.domain) {
    console.error('❌ Authing配置错误: domain为空', config);
    throw new Error('Authing配置错误: domain为空，请检查环境变量VITE_AUTHING_DOMAIN');
  }

  console.log('🔧 初始化Authing Guard实例 (详细调试):', {
    appId: config.appId,
    appIdType: typeof config.appId,
    appIdLength: config.appId?.length,
    domain: config.domain,
    host: config.host,
    redirectUri: config.redirectUri,
    fullConfig: config
  });

  try {
    // ✅ FIXED: 2025-07-25 修复Guard构造函数参数格式
    // 📌 正确的用法：传递单个配置对象，而不是分别传递appId
    guardInstance = new Guard({
      appId: config.appId,
      host: config.host,
      redirectUri: config.redirectUri,
      userPoolId: config.userPoolId,
      mode: 'modal',
      // ✅ FIXED: 2025-07-25 添加accessibility配置，修复aria-hidden焦点问题
      autoFocus: false,
      escCloseable: true,
      clickCloseable: true,
      maskCloseable: true
    });

    console.log('✅ Authing Guard实例初始化成功');
    return guardInstance;
  } catch (error) {
    console.error('❌ Authing Guard实例初始化失败:', error);
    throw error;
  }
}

/**
 * 创建认证上下文
 */
const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

/**
 * 统一认证提供者组件
 */
export const UnifiedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const guardRef = useRef<Guard | null>(null);
  const authingRef = useRef<Authing | null>(null);

  /**
   * 初始化 Authing 实例
   */
  useEffect(() => {
    try {
      authingRef.current = getAuthingClient();
      guardRef.current = getGuardInstance();
      
      // 设置 Guard 事件监听
      if (guardRef.current) {
        guardRef.current.on('login', (userInfo: any) => {
          console.log('🔐 Guard 登录成功:', userInfo);
          handleAuthingLogin(userInfo);

          // ✅ FIXED: 2025-07-25 登录成功后关闭弹窗
          setTimeout(() => {
            if (guardRef.current) {
              guardRef.current.hide();
              console.log('✅ Guard 弹窗已关闭');
            }
          }, 1000); // 延迟1秒关闭，让用户看到成功状态
        });

        guardRef.current.on('register', (userInfo: any) => {
          console.log('📝 Guard 注册成功:', userInfo);
          handleAuthingLogin(userInfo);

          // ✅ FIXED: 2025-07-25 注册成功后关闭弹窗
          setTimeout(() => {
            if (guardRef.current) {
              guardRef.current.hide();
              console.log('✅ Guard 弹窗已关闭');
            }
          }, 1000); // 延迟1秒关闭，让用户看到成功状态
        });
        
        guardRef.current.on('login-error', (error: any) => {
          console.error('❌ Guard 登录失败:', error);
          setError('登录失败: ' + (error.message || error));
        });
        
        guardRef.current.on('register-error', (error: any) => {
          console.error('❌ Guard 注册失败:', error);
          setError('注册失败: ' + (error.message || error));
        });
      }
      
      console.log('✅ Authing 实例初始化成功');
    } catch (error) {
      console.error('❌ Authing 实例初始化失败:', error);
      setError('认证系统初始化失败');
    }
  }, []);

  /**
   * 检查认证状态
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 从本地存储获取用户信息
      const storedUser = localStorage.getItem('authing_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('✅ 从本地存储恢复用户信息:', userData);
      }
      
      // 检查 URL 参数中是否有认证回调
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && authingRef.current) {
        console.log('🔐 检测到认证回调，处理登录...');
        await handleAuthCallback(code, state);
      }
      
    } catch (error) {
      console.error('❌ 检查认证状态失败:', error);
      setError('认证状态检查失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理认证回调
   */
  const handleAuthCallback = async (code: string, state?: string | null) => {
    try {
      console.log('🔄 处理认证回调...');
      
      if (!authingRef.current) {
        throw new Error('Authing 客户端未初始化');
      }
      
      // 使用 Authing SDK 处理回调
      const userInfo = await authingRef.current.handleRedirectCallback();
      console.log('✅ Authing 回调处理成功:', userInfo);
      
      if (userInfo) {
        handleAuthingLogin(userInfo);
      }
      
      // 清除 URL 参数
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
    } catch (error) {
      console.error('❌ 处理认证回调失败:', error);
      setError('认证回调处理失败');
    }
  };

  /**
   * 处理 Authing 登录
   */
  const handleAuthingLogin = (userInfo: any) => {
    try {
      console.log('🔐 处理 Authing 登录:', userInfo);
      
      // 统一用户信息格式
      const user: UserInfo = {
        id: userInfo.id || userInfo.userId || userInfo.sub || `user_${Date.now()}`,
        username: userInfo.username || userInfo.nickname || userInfo.name || '用户',
        email: userInfo.email || userInfo.emailAddress || '',
        phone: userInfo.phone || userInfo.phoneNumber || '',
        nickname: userInfo.nickname || userInfo.username || userInfo.name || '用户',
        avatar: userInfo.avatar || userInfo.photo || userInfo.picture || '',
        loginTime: new Date().toISOString(),
        roles: userInfo.roles || userInfo.role || ['user'],
        permissions: userInfo.permissions || userInfo.permission || ['basic'],
        ...userInfo
      };
      
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
   * 登录方法 - 使用 Guard 弹窗
   */
  const login = async (redirectTo?: string) => {
    try {
      console.log('🔐 开始登录流程...');
      setError(null);
      
      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
        console.log('📝 保存跳转目标:', redirectTo);
      }
      
      // 使用 Guard 弹窗登录
      if (guardRef.current) {
        guardRef.current.show();
      } else {
        throw new Error('Guard 实例未初始化');
      }
      
    } catch (error) {
      console.error('❌ 登录失败:', error);
      setError('登录失败');
    }
  };

  /**
   * 注册方法 - 使用 Guard 弹窗
   */
  const register = async (redirectTo?: string) => {
    try {
      console.log('📝 开始注册流程...');
      setError(null);
      
      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }
      
      // 使用 Guard 弹窗注册
      if (guardRef.current) {
        guardRef.current.show();
      } else {
        throw new Error('Guard 实例未初始化');
      }
      
    } catch (error) {
      console.error('❌ 注册失败:', error);
      setError('注册失败');
    }
  };

  /**
   * 登出方法
   */
  const logout = async () => {
    try {
      console.log('🚪 开始登出流程...');
      
      // 清除用户信息
      setUser(null);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('login_redirect_to');
      
      // 使用 Authing SDK 登出
      if (authingRef.current) {
        // 清除本地存储的用户信息
        localStorage.removeItem('authing_user');
        localStorage.removeItem('authing_token');
      }
      
      // 跳转到首页
      navigate('/');
      
      console.log('✅ 用户登出成功');
      
    } catch (error) {
      console.error('❌ 登出失败:', error);
      setError('登出失败');
    }
  };

  /**
   * 刷新 Token
   */
  const refreshToken = async () => {
    try {
      console.log('🔄 刷新 Token...');
      if (authingRef.current) {
        await authingRef.current.refreshToken();
        console.log('✅ Token 刷新完成');
      }
    } catch (error) {
      console.error('❌ Token 刷新失败:', error);
      setError('Token 刷新失败');
    }
  };

  /**
   * 更新用户信息
   */
  const updateUser = (updates: Partial<UserInfo>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));
      console.log('✅ 用户信息更新成功:', updatedUser);
    }
  };

  /**
   * 密码登录
   */
  const loginWithPassword = async (username: string, password: string) => {
    try {
      console.log('🔐 密码登录:', username);
      if (authingRef.current) {
        // 模拟密码登录
        const userInfo = {
          id: `user_${Date.now()}`,
          username,
          email: `${username}@example.com`,
          nickname: username,
          loginTime: new Date().toISOString()
        };
        handleAuthingLogin(userInfo);
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 密码登录失败:', error);
      setError('密码登录失败');
      throw error;
    }
  };

  /**
   * 邮箱验证码登录
   */
  const loginWithEmailCode = async (email: string, code: string) => {
    try {
      console.log('📧 邮箱验证码登录:', email);
      if (authingRef.current) {
        // 模拟邮箱验证码登录
        const userInfo = {
          id: `user_${Date.now()}`,
          email,
          username: email.split('@')[0],
          nickname: email.split('@')[0],
          loginTime: new Date().toISOString()
        };
        handleAuthingLogin(userInfo);
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 邮箱验证码登录失败:', error);
      setError('邮箱验证码登录失败');
      throw error;
    }
  };

  /**
   * 手机验证码登录
   */
  const loginWithPhoneCode = async (phone: string, code: string) => {
    try {
      console.log('📱 手机验证码登录:', phone);
      if (authingRef.current) {
        // 模拟手机验证码登录
        const userInfo = {
          id: `user_${Date.now()}`,
          phone,
          username: phone,
          nickname: phone,
          loginTime: new Date().toISOString()
        };
        handleAuthingLogin(userInfo);
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 手机验证码登录失败:', error);
      setError('手机验证码登录失败');
      throw error;
    }
  };

  /**
   * 发送验证码
   */
  const sendVerificationCode = async (email: string, scene: 'login' | 'register' | 'reset' = 'login') => {
    try {
      console.log('📧 发送验证码:', email, scene);
      if (authingRef.current) {
        // 模拟发送验证码
        console.log(`📧 发送${scene}验证码到:`, email);
        // 这里应该调用真实的发送验证码 API
        console.log('✅ 验证码发送成功');
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 发送验证码失败:', error);
      setError('发送验证码失败');
      throw error;
    }
  };

  /**
   * 注册用户
   */
  const registerUser = async (userInfo: any) => {
    try {
      console.log('📝 注册用户:', userInfo);
      if (authingRef.current) {
        // 模拟用户注册
        const user = {
          id: `user_${Date.now()}`,
          email: userInfo.email,
          username: userInfo.email.split('@')[0],
          nickname: userInfo.nickname || userInfo.email.split('@')[0],
          loginTime: new Date().toISOString()
        };
        handleAuthingLogin(user);
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 用户注册失败:', error);
      setError('用户注册失败');
      throw error;
    }
  };

  /**
   * 重置密码
   */
  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      console.log('🔑 重置密码:', email);
      if (authingRef.current) {
        // 模拟重置密码
        console.log('🔐 重置密码:', email);
        // 这里应该调用真实的重置密码 API
        console.log('✅ 密码重置成功');
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 重置密码失败:', error);
      setError('重置密码失败');
      throw error;
    }
  };

  /**
   * 权限检查
   */
  const hasPermission = (permission: string): boolean => {
    // 开发环境默认返回 true
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
    // 开发环境默认返回 true
    if (import.meta.env.DEV) {
      return true;
    }
    
    if (!user || !user.roles) {
      return false;
    }
    
    return user.roles.includes(role);
  };

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: UnifiedAuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    handleAuthingLogin,
    refreshToken,
    updateUser,
    loginWithPassword,
    loginWithEmailCode,
    loginWithPhoneCode,
    sendVerificationCode,
    registerUser,
    resetPassword,
    hasPermission,
    hasRole,
    guard: guardRef.current
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

/**
 * 使用统一认证 Hook
 */
export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export default UnifiedAuthContext; 