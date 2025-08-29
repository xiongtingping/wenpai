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

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuard, User } from '@authing/guard-react18';
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
  guard: any;
  startLoginModal: () => void;
  showGuard: () => void;
  hideGuard: () => void;
}

// ❌ 移除 @authing/web 客户端使用，统一改用 Guard 弹窗流程
// 保留占位以避免误用
// 🔒 LOCKED: 禁止在此处重新引入 @authing/web



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
  const navigate = useNavigate();
  
  // 使用官方Guard React18 Hook
  const guard = useGuard();

  // 获取用户信息 - 使用官方API
  const checkAuth = useCallback(async () => {
    if (!guard) return;
    
    try {
      console.log('🔍 获取用户信息...');
      setLoading(true);
      
      const userInfo: User | null = await guard.trackSession();
      
      if (userInfo) {
        console.log('✅ 检测到用户登录状态:', userInfo);
        
        // 转换为统一格式
        const formattedUser: UserInfo = {
          id: userInfo.id || userInfo.userId || userInfo.sub || `user_${Date.now()}`,
          username: userInfo.username || userInfo.nickname || userInfo.name || '用户',
          email: userInfo.email || userInfo.emailAddress || '',
          phone: userInfo.phone || userInfo.phoneNumber || '',
          nickname: userInfo.nickname || userInfo.username || userInfo.name || '用户',
          avatar: userInfo.avatar || userInfo.photo || userInfo.picture || '',
          loginTime: new Date().toISOString(),
          roles: ['user'],
          permissions: ['basic'],
          ...userInfo
        };
        
        setUser(formattedUser);
        localStorage.setItem('authing_user', JSON.stringify(formattedUser));
      } else {
        console.log('👤 用户未登录');
        setUser(null);
        localStorage.removeItem('authing_user');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setError('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  }, [guard]);

  /**
   * 初始化认证系统 - 使用官方Guard Hook
   */
  useEffect(() => {
    if (!guard) return;

    console.log('🔧 开始官方Guard认证系统初始化');

    // 设置登录成功事件监听
    guard.on('login', (userInfo: User) => {
      console.log('✅ Guard登录事件触发:', userInfo);
      handleAuthingLogin(userInfo);
    });

    // 检查当前登录状态
    checkAuth();

    console.log('✅ 官方Guard认证系统初始化成功');
  }, [guard, checkAuth]);

  /**
   * 处理Guard登录成功事件
   */
  const handleAuthingLogin = (userInfo: User) => {
    try {
      console.log('🔐 处理Guard登录成功:', userInfo);

      // 转换为统一用户信息格式
      const formattedUser: UserInfo = {
        id: userInfo.id || userInfo.userId || userInfo.sub || `user_${Date.now()}`,
        username: userInfo.username || userInfo.nickname || userInfo.name || '用户',
        email: userInfo.email || userInfo.emailAddress || '',
        phone: userInfo.phone || userInfo.phoneNumber || '',
        nickname: userInfo.nickname || userInfo.username || userInfo.name || '用户',
        avatar: userInfo.avatar || userInfo.photo || userInfo.picture || '',
        loginTime: new Date().toISOString(),
        roles: ['user'],
        permissions: ['basic'],
        ...userInfo
      };

      // 存储用户信息
      setUser(formattedUser);
      localStorage.setItem('authing_user', JSON.stringify(formattedUser));

      // 自动隐藏Guard模态框
      guard?.hide();

      // 处理登录成功后的跳转
      const redirectTarget = localStorage.getItem('login_redirect_to') || '/dashboard';
      localStorage.removeItem('login_redirect_to');
      
      console.log('🎯 登录成功，跳转到:', redirectTarget);
      setTimeout(() => {
        navigate(redirectTarget);
      }, 500);

      console.log('✅ Guard登录流程完成:', formattedUser);

    } catch (error) {
      console.error('❌ 处理Guard登录失败:', error);
      setError('登录处理失败');
    }
  };

  /**
   * 🎯 使用官方Guard模态框登录
   */
  const login = async (redirectTo?: string) => {
    try {
      console.log('🔐 开始官方Guard模态框登录...');
      setError(null);

      if (!guard) {
        setError('Guard未初始化');
        return;
      }

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
        console.log('📝 保存跳转目标:', redirectTo);
      }

      // 显示Guard模态框
      console.log('🚀 显示Guard登录模态框');
      guard.show();

    } catch (error) {
      console.error('❌ Guard登录失败:', error);
      setError('登录失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 启动登录模态框（带容器挂载）
  const startLoginModal = () => {
    if (!guard) return;
    
    console.log('🚀 启动Guard登录模态框');
    guard.show();
  };

  // 显示Guard模态框
  const showGuard = () => {
    if (!guard) return;
    guard.show();
  };

  // 隐藏Guard模态框
  const hideGuard = () => {
    if (!guard) return;
    guard.hide();
  };


  /**
   * 注册方法 - 使用官方Guard API
   */
  const register = async (redirectTo?: string) => {
    try {
      console.log('📝 开始注册流程...');
      setError(null);

      if (!guard) {
        setError('Guard未初始化');
        return;
      }

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }

      // 使用官方注册方法
      console.log('🚀 启动Guard注册流程');
      guard.startRegister();

    } catch (error) {
      console.error('❌ 注册失败:', error);
      setError('注册失败');
    }
  };

  /**
   * 登出方法 - 使用官方Guard API
   */
  const logout = async () => {
    try {
      console.log('🚪 开始登出流程...');

      if (!guard) {
        setError('Guard未初始化');
        return;
      }

      // 使用官方登出方法
      console.log('🚀 执行Guard登出');
      guard.logout();

      // 清除本地状态
      setUser(null);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('login_redirect_to');

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
   * 其他登录方法 - 统一使用Guard模态框
   */
  const loginWithPassword = async (_username: string, _password: string) => {
    await login();
  };

  const loginWithEmailCode = async (_email: string, _code: string) => {
    await login();
  };

  const loginWithPhoneCode = async (_phone: string, _code: string) => {
    await login();
  };

  const sendVerificationCode = async (_email: string, _scene: 'login' | 'register' | 'reset' = 'login') => {
    console.log('📧 验证码发送由Guard UI处理');
  };

  const registerUser = async (_userInfo: any) => {
    await register();
  };

  const resetPassword = async (_email: string, _code: string, _newPassword: string) => {
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
    guard,
    startLoginModal,
    showGuard,
    hideGuard
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
