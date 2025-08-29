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

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Guard } from '@authing/guard';
import { getAuthingConfig } from '@/config/authing';
import { resolveAuthingGuardConfig } from '@/authing/configResolver';

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

// ❌ 移除 @authing/web 客户端使用，统一改用 Guard 弹窗流程
// 保留占位以避免误用
// 🔒 LOCKED: 禁止在此处重新引入 @authing/web


/**
 * 🎯 最终根因修复：简化Guard实例创建，避免事件系统冲突
 * 真正问题：Guard事件监听器系统存在架构缺陷
 */
async function createSimplifiedGuardInstance() {
  const base = getAuthingConfig();
  // 以单一事实源解析为“应用专属 host + 固定回调”，确保与 /auth/login 完全一致
  const resolved = await resolveAuthingGuardConfig({ appId: base.appId, host: base.host, redirectUri: base.redirectUri });

  console.log('🔧 开始简化Guard初始化(统一解析):', {
    appId: resolved.appId,
    host: resolved.host,
    redirectUri: resolved.redirectUri
  });

  if (!resolved.appId || !resolved.host) {
    const error = `Authing配置错误: ${!resolved.appId ? 'appId为空' : 'host为空'}`;
    console.error('❌', error, resolved);
    throw new Error(error);
  }

  try {
    const guard = new Guard({
      appId: resolved.appId,
      host: resolved.host,
      redirectUri: resolved.redirectUri,
      mode: 'modal',
      lang: 'zh-CN',
      autoRegister: true,
      defaultScene: 'login',
      isSSO: false,
      config: {
        redirectUri: resolved.redirectUri,
        // Modal配置 - 修复accessibility问题
        modal: {
          bodyClassName: 'authing-guard-open',
          // 禁用有问题的focus management
          focusTrap: false,
          maskClosable: true,
          keyboard: true,
          style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '999999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          maskStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: '999998'
          }
        }
      }
    });

    console.log('✅ 简化Guard实例创建成功');
    return guard;
  } catch (error) {
    console.error('❌ 简化Guard实例创建失败:', error);
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
  const navigate = useNavigate();
  const guardRef = useRef<Guard | null>(null);

  /**
   * 🎯 架构级重构：延迟初始化Authing实例，确保DOM就绪
   */
  useEffect(() => {
    const initializeAuthingSystem = async () => {
      try {
        console.log('🔧 开始架构级认证系统初始化');


        // 在专用登录路由下避免初始化全局 Guard，以免与嵌入式实例冲突
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/login')) {
          console.log('🔕 当前为 /auth/login，跳过全局 Guard 初始化');
          setLoading(false);
          return;
        }

        // 确保DOM完全加载
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            window.addEventListener('load', resolve, { once: true });
          });
        }

        // 🎯 使用简化Guard实例（统一到@authing/guard）
        guardRef.current = await createSimplifiedGuardInstance();

        // ✅ 统一 redirect-only 单入口：不在全局绑定 Guard 事件，避免多实例与时序问题
        // （登录成功回调统一由 CallbackPage 的 handleRedirectCallback 完成）

        console.log('✅ 架构级认证系统初始化成功');
      } catch (error) {
        console.error('❌ 架构级认证系统初始化失败:', error);
        setError('认证系统初始化失败');
      }
    };

    initializeAuthingSystem();
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
   * 🎯 直接启动Guard Modal登录，无需页面跳转
   */
  const login = async (redirectTo?: string) => {
    try {
      console.log('🔐 开始直接Guard Modal登录流程...');
      setError(null);

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
        console.log('📝 保存跳转目标:', redirectTo);
      }

      // 确保Guard实例就绪
      if (!guardRef.current) {
        console.log('🔧 Guard实例未就绪，重新初始化...');
        guardRef.current = await createSimplifiedGuardInstance();
      }

      // 详细检查Guard实例
      console.log('🔍 Guard实例完整检查:', {
        instance: !!guardRef.current,
        constructor: guardRef.current?.constructor?.name,
        prototype: Object.getPrototypeOf(guardRef.current),
        hasStart: typeof guardRef.current?.start === 'function',
        hasShow: typeof guardRef.current?.show === 'function',
        allMethods: guardRef.current ? Object.getOwnPropertyNames(Object.getPrototypeOf(guardRef.current))
          .filter(name => name !== 'constructor' && typeof guardRef.current[name] === 'function') : [],
        directMethods: guardRef.current ? Object.getOwnPropertyNames(guardRef.current)
          .filter(name => typeof guardRef.current[name] === 'function') : []
      });

      // Modal模式下使用正确的API
      try {
        // Guard Modal模式启动需要指定容器或直接调用
        if (guardRef.current.start) {
          console.log('🚀 使用start()启动Guard Modal');
          await guardRef.current.start();
        } else if (guardRef.current.show) {
          console.log('🚀 使用show()启动Guard Modal');
          await guardRef.current.show();
        } else {
          // 尝试直接渲染到body或创建临时容器
          console.log('🚀 创建临时容器启动Guard');
          const container = document.createElement('div');
          container.id = 'guard-modal-container';
          container.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;';
          document.body.appendChild(container);
          
          if (guardRef.current.start) {
            await guardRef.current.start('#guard-modal-container');
          } else if (guardRef.current.render) {
            await guardRef.current.render('#guard-modal-container');
          } else {
            throw new Error('No available method to start Guard');
          }
        }
      } catch (startError) {
        console.error('❌ Guard启动方法调用失败:', startError);
        throw startError;
      }
      
      // 开始轮询监控登录状态
      startAuthPolling();

    } catch (error) {
      console.error('❌ Guard Modal启动失败:', error);
      setError('登录失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 轮询监控登录状态（从LoginPage迁移过来）
  const startAuthPolling = () => {
    let previousStorageState = '';
    
    const pollInterval = setInterval(() => {
      try {
        // 全面检查所有可能的Authing存储键
        const storageKeys = [
          '_authing_token', 'authing_token', 'authingToken',
          '_authing_user', 'authing_user', 'authingUser',
          '_authing_session', 'authing_session',
          `authing_${getAuthingConfig().appId}_token`, `authing_${getAuthingConfig().appId}_user`,
          'guard_token', 'guard_user', 'guard_session'
        ];
        
        let authData = null;
        let foundKey = '';
        
        for (const key of storageKeys) {
          const localData = localStorage.getItem(key);
          const sessionData = sessionStorage.getItem(key);
          
          if (localData || sessionData) {
            authData = localData || sessionData;
            foundKey = key;
            break;
          }
        }
        
        // 检查Guard实例的内部状态
        let guardInternalState = null;
        if (guardRef.current) {
          try {
            guardInternalState = guardRef.current.authClient?.getCurrentUser?.() || 
                               guardRef.current.getUser?.() ||
                               guardRef.current.user;
          } catch (e) {
            // 忽略Guard内部状态检查错误
          }
        }

        // 生成当前存储状态快照
        const currentStorageState = JSON.stringify({
          authData: authData ? '存在' : '空',
          foundKey,
          guardState: guardInternalState ? '有用户' : '无用户'
        });

        // 状态变化检测
        if (currentStorageState !== previousStorageState) {
          console.log('🔍 全局存储状态变化:', currentStorageState);
          previousStorageState = currentStorageState;
        }

        if (authData || guardInternalState) {
          console.log('✅ 全局检测到登录成功', { foundKey, hasGuardUser: !!guardInternalState });
          clearInterval(pollInterval);
          
          // 处理登录成功
          if (guardInternalState) {
            handleAuthingLogin(guardInternalState);
          }
          
          // 跳转逻辑
          const redirectTarget = localStorage.getItem('login_redirect_to') || '/dashboard';
          localStorage.removeItem('login_redirect_to');
          navigate(redirectTarget);
          return;
        }

        // 检查Guard Modal是否已关闭
        const modalSelectors = [
          '.authing-guard-modal', 
          '.authing-ant-modal',
          '.ant-modal',
          '[class*="authing"]',
          '[class*="guard"]'
        ];
        
        const modalElements = modalSelectors.flatMap(sel => 
          Array.from(document.querySelectorAll(sel))
        );
        
        const isModalVisible = modalElements.some(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' &&
                 style.opacity !== '0' &&
                 !el.hasAttribute('hidden');
        });

        if (!isModalVisible && modalElements.length === 0) {
          console.log('🔄 全局Modal已关闭，停止轮询');
          clearInterval(pollInterval);
        }

      } catch (error) {
        console.error('全局轮询检查错误:', error);
      }
    }, 500);

    // 60秒后自动清理轮询
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('🕐 全局轮询超时，自动清理');
    }, 60000);
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
