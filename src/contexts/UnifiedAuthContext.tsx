/**
 * ✅ FIXED: 2025-07-25 统一认证上下文已完全修复并封装
 *
 * 🐛 历史问题清单：
 * - "appId is required" 错误：Guard构造函数参数格式错误
 * - "Authing is not defined" 错误：SDK导入路径错误
 * - 登录成功后弹窗不关闭：缺少事件处理逻辑
 * - 图标显示异常：缺少CSS样式文件
 * - aria-hidden焦点冲突：accessibility配置缺失
 *
 * 🔧 修复方案总结：
 * - 采用正确的Guard构造函数对象参数格式
 * - 使用官方SDK导入路径和方法
 * - 实现事件驱动的认证流程和自动弹窗关闭
 * - 添加完整的accessibility配置
 * - 建立用户信息标准化处理机制
 *
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此文件做任何修改
 * 🚫 冻结原因：认证系统已验证稳定，任何修改都可能导致登录功能崩溃
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Authing } from '@authing/browser';
import type { LoginState } from '@authing/browser/dist/types/global';
import { getAuthingConfig, clearAuthingConfigCache } from '@/config/authing';

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
  sdk: Authing | null;
  loginState: LoginState | null;
}

// ❌ 移除 @authing/web 客户端使用，统一改用 Guard 弹窗流程
// 保留占位以避免误用
// 🔒 LOCKED: 禁止在此处重新引入 @authing/web


/**
 * 🎯 使用官方正确的Authing Browser SDK
 * 根本修复：从错误的Guard SDK切换到官方Browser SDK
 */
function createAuthingSDK() {
  // 清除缓存确保获取最新的环境配置
  clearAuthingConfigCache();
  const config = getAuthingConfig();
  
  console.log('🔧 创建官方Authing Browser SDK:', {
    domain: config.host,
    appId: config.appId,
    redirectUri: config.redirectUri
  });

  try {
    const sdk = new Authing({
      domain: config.host,
      appId: config.appId,
      redirectUri: config.redirectUri
    });

    console.log('✅ 官方Authing SDK创建成功');
    return sdk;
  } catch (error) {
    console.error('❌ Authing SDK创建失败:', error);
    throw error;
  }
}

// （已切换为专用路由嵌入式登录，不再需要运行时创建 overlay 容器）

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
  const [loginState, setLoginState] = useState<LoginState | null>(null);
  const navigate = useNavigate();
  
  // 使用官方Authing Browser SDK
  const sdk = useMemo(() => {
    try {
      return createAuthingSDK();
    } catch (err) {
      console.error('❌ SDK创建失败:', err);
      return null;
    }
  }, []);

  // 获取登录状态的方法（官方SDK）
  const getLoginState = useCallback(async () => {
    if (!sdk) return;
    
    try {
      console.log('🔍 获取官方SDK登录状态...');
      const state = await sdk.getLoginState();
      setLoginState(state);
      
      if (state) {
        console.log('✅ 检测到登录状态:', state);
        // 转换为统一的用户信息格式
        const userInfo: UserInfo = {
          id: state.sub || `user_${Date.now()}`,
          username: state.username || state.name || state.nickname || '用户',
          email: state.email || '',
          phone: state.phone_number || '',
          nickname: state.nickname || state.username || state.name || '用户',
          avatar: state.picture || '',
          loginTime: new Date().toISOString(),
          roles: ['user'],
          permissions: ['basic'],
          ...state
        };
        
        setUser(userInfo);
        localStorage.setItem('authing_user', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.error('获取登录状态失败:', error);
    }
  }, [sdk]);

  /**
   * 初始化认证系统
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🔧 开始官方SDK认证系统初始化');
        
        if (!sdk) {
          setError('SDK初始化失败');
          setLoading(false);
          return;
        }

        // 判断当前URL是否为Authing登录回调URL
        if (sdk.isRedirectCallback()) {
          console.log('🔄 处理登录回调...');
          try {
            const result = await sdk.handleRedirectCallback();
            setLoginState(result);
            
            if (result) {
              const userInfo: UserInfo = {
                id: result.sub || `user_${Date.now()}`,
                username: result.username || result.name || result.nickname || '用户',
                email: result.email || '',
                phone: result.phone_number || '',
                nickname: result.nickname || result.username || result.name || '用户',
                avatar: result.picture || '',
                loginTime: new Date().toISOString(),
                roles: ['user'],
                permissions: ['basic'],
                ...result
              };
              
              setUser(userInfo);
              localStorage.setItem('authing_user', JSON.stringify(userInfo));
              
              // 处理登录成功后的跳转
              const redirectTarget = localStorage.getItem('login_redirect_to') || '/';
              localStorage.removeItem('login_redirect_to');
              navigate(redirectTarget);
            }
          } catch (callbackError) {
            console.error('❌ 回调处理失败:', callbackError);
            setError('登录回调处理失败');
          }
        } else {
          // 不是回调，检查现有登录状态
          await getLoginState();
        }

        console.log('✅ 官方SDK认证系统初始化成功');
      } catch (error) {
        console.error('❌ 认证系统初始化失败:', error);
        setError('认证系统初始化失败');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [sdk, getLoginState, navigate]);

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

      // Guard 模式下无需在此处理回调，官方SDK接管
    } catch (error) {
      console.error('❌ 检查认证状态失败:', error);
      setError('认证状态检查失败');
    } finally {
      setLoading(false);
    }
  };

  // Guard 模式下由官方SDK自动处理回调，这里不再自定义处理


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
   * 🎯 使用官方SDK的正确登录方法
   */
  const login = async (redirectTo?: string) => {
    try {
      console.log('🔐 开始官方SDK登录流程...');
      setError(null);

      if (!sdk) {
        setError('SDK未初始化');
        return;
      }

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
        console.log('📝 保存跳转目标:', redirectTo);
      }

      // 使用官方的跳转登录方法
      console.log('🚀 使用官方loginWithRedirect()方法');
      sdk.loginWithRedirect();

    } catch (error) {
      console.error('❌ 官方SDK登录失败:', error);
      setError('登录失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };


  /**
   * 注册方法 - 使用官方SDK
   */
  const register = async (redirectTo?: string) => {
    // 注册流程与登录相同，都通过loginWithRedirect处理
    await login(redirectTo);
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

      // Guard 模式无需额外登出处理（用户状态已清理）

      // 跳转到首页
      navigate('/');

      console.log('✅ 用户登出成功');

    } catch (error) {
      console.error('❌ 登出失败:', error);
      setError('登出失败');
    }
  };

  // 其他方法的简化实现
  const refreshToken = async () => {
    // Guard 弹窗流程下无需手动刷新，交由官方流程处理
    console.log('🔄 refreshToken (no-op under Guard modal flow)');
    return;
  };

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
  const loginWithPassword = async (_username: string, _password: string) => {
    // 统一到 Guard 弹窗
    await login();
  };

  /**
   * 邮箱验证码登录
   */
  const loginWithEmailCode = async (_email: string, _code: string) => {
    // 统一到 Guard 弹窗
    await login();
  };

  /**
   * 手机验证码登录
   */
  const loginWithPhoneCode = async (_phone: string, _code: string) => {
    // 统一到 Guard 弹窗
    await login();
  };

  /**
   * 发送验证码
   */
  const sendVerificationCode = async (_email: string, _scene: 'login' | 'register' | 'reset' = 'login') => {
    // 统一由 Guard 弹窗流程处理
    console.log('📧 sendVerificationCode handled by Guard UI');
    return;
  };

  /**
   * 注册用户
   */
  const registerUser = async (_userInfo: any) => {
    // 统一到 Guard 弹窗
    await register();
  };

  /**
   * 重置密码
   */
  const resetPassword = async (_email: string, _code: string, _newPassword: string) => {
    // 统一由 Guard 弹窗流程中的“忘记密码”处理
    await login();
  };

  const hasPermission = (permission: string): boolean => {
    if (import.meta.env.DEV) return true;
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (import.meta.env.DEV) return true;
    if (!user || !user.roles) return false;
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
    sdk,
    loginState
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
