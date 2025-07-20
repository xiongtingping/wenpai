/**
 * ✅ 统一认证上下文 - 使用Authing官方Guard组件
 * 
 * 本文件提供统一的认证管理，使用Authing官方推荐的Guard组件
 * 参考文档: https://docs.authing.cn/v2/reference/guard/v2/react.html
 * 
 * 主要功能:
 * - 用户认证状态管理
 * - 登录/登出功能
 * - 用户信息获取和更新
 * - 权限和角色管理
 * - 统一的错误处理
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthingConfig } from '@/config/authing';
import AuthingGuardWrapper from '@/components/auth/AuthingGuardWrapper';
import { Guard } from '@authing/guard-react';
import { getGuardConfig } from '@/config/authing';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  nickname: string;
  avatar?: string;
  loginTime?: string;
  roles?: string[];
  permissions?: string[];
  isProUser?: boolean;
  plan?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * 认证上下文类型
 */
export interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
  login: (redirectTo?: string) => void;
  register: (redirectTo?: string) => void;
  logout: () => void;
  checkAuth: () => void;
  handleAuthingLogin?: (userInfo: any) => void;
  hasPermission?: (permission: string) => boolean;
  hasRole?: (role: string) => boolean;
  updateUser?: (updates: Partial<UserInfo>) => Promise<void>;
  updateUserData?: (updates: Partial<UserInfo>) => Promise<void>;
  getUserData?: () => UserInfo | null;
  bindTempUserId?: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 统一认证提供者组件
 * 使用Authing官方Guard组件管理认证状态
 */
export const UnifiedAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGuard, setShowGuard] = useState(false);
  const [guardMode, setGuardMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const guardRef = useRef<any>(null);

  /**
   * 检查认证状态（从本地存储获取）
   */
  const checkAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 从本地存储获取用户信息
      const storedUser = localStorage.getItem('authing_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('🔐 从本地存储恢复用户信息:', userData);
        } catch (parseError) {
          console.error('❌ 解析本地用户数据失败:', parseError);
          localStorage.removeItem('authing_user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('❌ 认证检查失败:', error);
      setError(error instanceof Error ? error.message : '认证检查失败');
      setUser(null);
      localStorage.removeItem('authing_user');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 手动初始化 Authing Guard - 仅在需要时初始化
   */
  const initializeGuard = async () => {
    if (guardRef.current) {
      return guardRef.current;
    }
    
    try {
      console.log('🔧 手动初始化 Authing Guard...');
      const config = getGuardConfig();
      
      // 创建Guard实例，但不自动初始化
      guardRef.current = new Guard({
        ...config
      });
      
      console.log('✅ Authing Guard 实例创建成功');
      return guardRef.current;
      
    } catch (error) {
      console.error('❌ Authing Guard 初始化失败:', error);
      setError(error instanceof Error ? error.message : '认证服务初始化失败');
      return null;
    }
  };

  /**
   * 处理 Authing 登录/注册成功
   * 
   * ✅ FIXED: 该方法曾因用户信息处理错误导致登录状态异常，已于2024年修复
   * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
   * 🔒 LOCKED: AI 禁止对此函数做任何修改
   * 
   * 修复历史：
   * - 问题1: 用户信息字段映射错误
   * - 问题2: 登录状态更新不及时
   * - 问题3: 本地存储数据格式不一致
   * - 解决方案: 统一用户信息处理逻辑，确保字段映射正确
   */
  const handleAuthingLogin = (userInfo: any) => {
    if (!userInfo) return;
    
    console.log('🔐 处理用户登录信息:', userInfo);
    
    // 统一用户信息格式
    const user: UserInfo = {
      id: userInfo.id || userInfo.userId || userInfo.sub || `user_${Date.now()}`,
      username: userInfo.username || userInfo.nickname || userInfo.name || '用户',
      email: userInfo.email || userInfo.emailAddress || '',
      phone: userInfo.phone || userInfo.phoneNumber || '',
      nickname: userInfo.nickname || userInfo.username || userInfo.name || '用户',
      avatar: userInfo.avatar || userInfo.photo || userInfo.picture || '',
      loginTime: new Date().toISOString(),
      roles: userInfo.roles || userInfo.role || [],
      permissions: userInfo.permissions || userInfo.permission || [],
      // 保留原始数据
      ...userInfo
    };
    
    setUser(user);
    localStorage.setItem('authing_user', JSON.stringify(user));
    setShowGuard(false);
    setError(null);
    
    // 跳转逻辑
    const redirectTo = localStorage.getItem('login_redirect_to');
    if (redirectTo) {
      localStorage.removeItem('login_redirect_to');
      navigate(redirectTo, { replace: true });
    }
  };

  /**
   * 登录方法 - 使用直接跳转方式
   * 
   * ✅ FIXED: 该方法曾因Guard初始化错误导致JSON解析错误，已于2024年修复
   * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
   * 🔒 LOCKED: AI 禁止对此函数做任何修改
   * 
   * 修复历史：
   * - 问题1: Guard组件初始化失败导致JSON解析错误
   * - 问题2: 事件监听器导致内存泄漏和错误
   * - 问题3: 模态框模式导致页面显示异常
   * - 解决方案: 改用直接重定向模式，绕过Guard组件，直接跳转到Authing官方页面
   */
  const login = async (redirectTo?: string) => {
    try {
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }
      
      setGuardMode('login');
      
      // 构建登录URL，直接跳转到Authing
      const config = getAuthingConfig();
      const authUrl = new URL(`https://${config.host}/oidc/auth`);
      authUrl.searchParams.set('client_id', config.appId);
      authUrl.searchParams.set('redirect_uri', config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid profile email');
      authUrl.searchParams.set('state', 'login-' + Date.now());
      
      console.log('🔐 跳转到Authing登录:', authUrl.toString());
      
      // 直接跳转到Authing登录页面
      window.location.href = authUrl.toString();
      
    } catch (error) {
      console.error('❌ 登录失败:', error);
      setError(error instanceof Error ? error.message : '登录失败');
    }
  };

  /**
   * 注册方法 - 使用直接跳转方式
   * 
   * ✅ FIXED: 该方法曾因Guard初始化错误导致注册页面异常，已于2024年修复
   * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
   * 🔒 LOCKED: AI 禁止对此函数做任何修改
   * 
   * 修复历史：
   * - 问题1: Guard组件注册页面显示异常
   * - 问题2: screen_hint参数不生效
   * - 问题3: 注册流程中断
   * - 解决方案: 改用直接重定向模式，使用screen_hint=signup参数跳转到Authing官方注册页面
   */
  const register = async (redirectTo?: string) => {
    try {
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }
      
      setGuardMode('register');
      
      // 构建注册URL，直接跳转到Authing
      const config = getAuthingConfig();
      const authUrl = new URL(`https://${config.host}/oidc/auth`);
      authUrl.searchParams.set('client_id', config.appId);
      authUrl.searchParams.set('redirect_uri', config.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid profile email');
      authUrl.searchParams.set('state', 'register-' + Date.now());
      authUrl.searchParams.set('screen_hint', 'signup');
      
      console.log('🔐 跳转到Authing注册:', authUrl.toString());
      
      // 直接跳转到Authing注册页面
      window.location.href = authUrl.toString();
      
    } catch (error) {
      console.error('❌ 注册失败:', error);
      setError(error instanceof Error ? error.message : '注册失败');
    }
  };

  /**
   * 登出方法 - 清除本地数据
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      // 清除本地数据
      setUser(null);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('login_redirect_to');
      setError(null);
      
      // 跳转到首页
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ 登出失败:', error);
      setError(error instanceof Error ? error.message : '登出失败');
      // 即使登出失败，也清除本地数据
      setUser(null);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('login_redirect_to');
      navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading: isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    // 添加Guard组件回调支持
    handleAuthingLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用认证上下文的Hook
 * @returns 认证上下文
 */
export const useUnifiedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

/**
 * 认证保护组件
 */
interface UnifiedAuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const UnifiedAuthGuard: React.FC<UnifiedAuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, loading } = useUnifiedAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // 使用React Router导航到登录页面
    navigate(redirectTo, { replace: true });
    return null;
  }

  return <>{children}</>;
};

/**
 * 权限保护组件
 */
interface UnifiedPermissionGuardProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallback?: ReactNode;
}

export const UnifiedPermissionGuard: React.FC<UnifiedPermissionGuardProps> = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [], 
  fallback = <div>权限不足</div> 
}) => {
  const { user } = useUnifiedAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  // 检查角色权限
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => user.roles?.includes(role));

  // 检查功能权限
  const hasRequiredPermission = requiredPermissions.length === 0 || 
    requiredPermissions.some(permission => user.permissions?.includes(permission));

  if (!hasRequiredRole || !hasRequiredPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}; 