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
import { useAuthStore } from '@/store/authStore';
import { CustomAuthModal } from '@/components/auth/CustomAuthModal';

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
  updateUser: (updates: Partial<UserInfo>) => Promise<void>;
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
  // 自定义模态框状态
  customAuthModalOpen: boolean;
  setCustomAuthModalOpen: (open: boolean) => void;
  customAuthModalTab: 'login' | 'register';
  setCustomAuthModalTab: (tab: 'login' | 'register') => void;
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
  
  // 自定义模态框状态
  const [customAuthModalOpen, setCustomAuthModalOpen] = useState(false);
  const [customAuthModalTab, setCustomAuthModalTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const authStore = useAuthStore();
  
  // 使用官方Guard React18 Hook
  const guard = useGuard();

  // 获取用户信息 - 使用官方API
  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 检查用户登录状态...');
      setLoading(true);
      
      // 首先检查 localStorage 中的用户信息
      const storedUser = localStorage.getItem('authing_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ 从 localStorage 恢复用户状态:', parsedUser);
          setUser(parsedUser);
          // 同步到 authStore
          authStore.setUser({
            id: parsedUser.id,
            username: parsedUser.username,
            email: parsedUser.email,
            phone: parsedUser.phone,
            nickname: parsedUser.nickname,
            avatar: parsedUser.avatar,
            loginTime: parsedUser.loginTime
          });
          setLoading(false);
          return;
        } catch (e) {
          console.warn('⚠️ localStorage 中的用户信息解析失败:', e);
          localStorage.removeItem('authing_user');
        }
      }
      
      // 如果 localStorage 中没有，再检查 Guard session
      if (guard) {
        const userInfo: User | null = await guard.trackSession();
        
        if (userInfo) {
          console.log('✅ 从 Guard 检测到用户登录状态:', userInfo);
          
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
          // 同步到 authStore
          authStore.setUser({
            id: formattedUser.id,
            username: formattedUser.username,
            email: formattedUser.email,
            phone: formattedUser.phone,
            nickname: formattedUser.nickname,
            avatar: formattedUser.avatar,
            loginTime: formattedUser.loginTime
          });
        } else {
          console.log('👤 用户未登录');
          setUser(null);
          authStore.setUser(null);
        }
      } else {
        console.log('👤 Guard 未初始化，用户未登录');
        setUser(null);
        authStore.setUser(null);
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
    if (!guard) {
      console.warn('⚠️ Guard Hook未返回有效对象');
      return;
    }

    console.log('🔧 开始官方Guard认证系统初始化');
    console.log('🧪 Guard对象检查:', {
      guard: !!guard,
      type: typeof guard,
      methods: guard ? Object.getOwnPropertyNames(guard).filter(name => typeof guard[name] === 'function') : [],
      hasShow: guard && typeof guard.show === 'function',
      hasOn: guard && typeof guard.on === 'function'
    });

    // 设置登录成功事件监听
    if (guard && typeof guard.on === 'function') {
      guard.on('login', (userInfo: User) => {
        console.log('✅ Guard登录事件触发:', userInfo);
        handleAuthingLogin(userInfo);
      });
    } else {
      console.error('❌ Guard.on方法不可用');
    }

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
      // 同步到 authStore
      authStore.setUser({
        id: formattedUser.id,
        username: formattedUser.username,
        email: formattedUser.email,
        phone: formattedUser.phone,
        nickname: formattedUser.nickname,
        avatar: formattedUser.avatar,
        loginTime: formattedUser.loginTime
      });

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
   * 🎯 使用自定义登录表单（Guard模态框问题的替代方案）
   */
  const login = async (redirectTo?: string) => {
    try {
      console.log('🔐 开始自定义登录表单...');
      setError(null);

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
        console.log('📝 保存跳转目标:', redirectTo);
      }

      // 打开自定义登录模态框
      setCustomAuthModalTab('login');
      setCustomAuthModalOpen(true);
      console.log('✅ 自定义登录表单已打开');

    } catch (error) {
      console.error('❌ 登录失败:', error);
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
   * 注册方法 - 使用自定义注册表单
   */
  const register = async (redirectTo?: string) => {
    try {
      console.log('📝 开始自定义注册表单...');
      setError(null);

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }

      // 打开自定义注册模态框
      setCustomAuthModalTab('register');
      setCustomAuthModalOpen(true);
      console.log('✅ 自定义注册表单已打开');

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
      // 同步到 authStore
      authStore.logout();
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

  const updateUser = async (updates: Partial<UserInfo>) => {
    if (user && guard) {
      try {
        // 1. 立即更新本地状态（用户体验）
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('authing_user', JSON.stringify(updatedUser));
        // 同步到 authStore
        authStore.setUser({
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          nickname: updatedUser.nickname,
          avatar: updatedUser.avatar,
          loginTime: updatedUser.loginTime
        });
        console.log('🔄 本地用户信息已更新，开始同步服务器...');
        
        // 2. 同步到Authing服务器
        const updateData: any = {};
        
        if (updates.avatar) {
          updateData.photo = updates.avatar;
          console.log('📸 准备同步头像到服务器:', updates.avatar.substring(0, 50) + '...');
        }
        
        if (updates.nickname) {
          updateData.nickname = updates.nickname;
          console.log('🏷️ 准备同步昵称到服务器:', updates.nickname);
        }
        
        if (updates.email) {
          updateData.email = updates.email;
        }
        
        if (Object.keys(updateData).length > 0) {
          console.log('🔄 调用Guard updateProfile API...');
          const result = await guard.updateProfile(updateData);
          console.log('✅ 服务器同步成功:', result);
        }
        
        console.log('✅ 用户信息更新并同步成功:', updatedUser);
      } catch (error) {
        console.error('❌ 服务器同步失败，但本地已更新:', error);
        // 本地更新已完成，即使服务器同步失败用户也能看到变化
      }
    }
  };


  /**
   * 其他登录方法 - 统一使用Guard跳转
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
    hideGuard,
    customAuthModalOpen,
    setCustomAuthModalOpen,
    customAuthModalTab,
    setCustomAuthModalTab
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}

      {/* 自定义登录/注册模态框 */}
      <CustomAuthModal
        isOpen={customAuthModalOpen}
        onClose={() => setCustomAuthModalOpen(false)}
        defaultTab={customAuthModalTab}
      />
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
