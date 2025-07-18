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

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthingConfig } from '@/config/authing';
import AuthingGuardWrapper from '@/components/auth/AuthingGuardWrapper';

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
  logout: () => void;
  checkAuth: () => void;
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
  const navigate = useNavigate();

  /**
   * 检查认证状态
   */
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 检查本地存储的用户信息
      const savedUser = localStorage.getItem('authing_user');
      
      if (savedUser) {
        const userInfo = JSON.parse(savedUser);
        setUser(userInfo);
        
        // 如果有跳转目标，进行跳转
        const redirectTo = localStorage.getItem('login_redirect_to');
        if (redirectTo) {
          localStorage.removeItem('login_redirect_to');
          navigate(redirectTo, { replace: true });
        }
      } else {
        // 用户未登录，清除本地数据
        setUser(null);
        localStorage.removeItem('authing_user');
        localStorage.removeItem('login_redirect_to');
      }
      
    } catch (error) {
      console.error('检查认证状态失败:', error);
      setError(error instanceof Error ? error.message : '认证检查失败');
      // 清除可能存在的无效数据
      setUser(null);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('login_redirect_to');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 登录方法 - 使用Guard组件
   * @param redirectTo 登录后跳转的目标页面
   */
  const login = (redirectTo?: string) => {
    try {
      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }

      console.log('🔗 使用Guard组件进行登录');
      
      // 显示Guard弹窗
      setShowGuard(true);
      
    } catch (error) {
      console.error('登录失败:', error);
      setError(error instanceof Error ? error.message : '登录失败');
    }
  };

  /**
   * 登出方法 - 使用Guard组件
   */
  const logout = async () => {
    try {
      console.log('🔗 使用Guard组件进行登出');
      
      // 清除本地存储
      localStorage.removeItem('authing_user');
      localStorage.removeItem('login_redirect_to');
      
      // 重置状态
      setUser(null);
      
      // 使用React Router导航到首页
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('登出失败:', error);
      setError(error instanceof Error ? error.message : '登出失败');
      // 即使登出失败，也清除本地数据
      setUser(null);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('login_redirect_to');
      navigate('/', { replace: true });
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
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* 条件渲染Guard组件 */}
      {showGuard && (
        <AuthingGuardWrapper
          onLogin={(user) => {
            console.log('登录成功:', user);
            // 转换用户信息格式
            const userInfo: UserInfo = {
              id: user.id || `user_${Date.now()}`,
              username: user.username || user.nickname || '用户',
              email: user.email || '',
              phone: user.phone || '',
              nickname: user.nickname || user.username || '用户',
              avatar: (user as any).avatar || '',
              loginTime: new Date().toISOString(),
              roles: [],
              permissions: []
            };
            
            setUser(userInfo);
            localStorage.setItem('authing_user', JSON.stringify(userInfo));
            
            // 关闭Guard弹窗
            setShowGuard(false);
            
            // 恢复页面滚动状态
            const scrollY = document.body.style.top;
            if (scrollY) {
              document.body.style.position = '';
              document.body.style.top = '';
              document.body.style.width = '';
              document.body.style.overflow = '';
              document.documentElement.style.overflow = '';
              document.body.classList.remove('authing-guard-open');
              document.documentElement.classList.remove('authing-guard-open');
              
              // 修复滚动恢复逻辑，确保不会滚动到底部
              const scrollPosition = parseInt(scrollY.replace('-', '') || '0');
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPosition);
              });
            }
            
            // 如果有跳转目标，进行跳转
            const redirectTo = localStorage.getItem('login_redirect_to');
            if (redirectTo) {
              localStorage.removeItem('login_redirect_to');
              navigate(redirectTo, { replace: true });
            }
          }}
          onClose={() => {
            console.log('Guard弹窗关闭');
            setShowGuard(false);
            
            // 恢复页面滚动状态
            const scrollY = document.body.style.top;
            if (scrollY) {
              document.body.style.position = '';
              document.body.style.top = '';
              document.body.style.width = '';
              document.body.style.overflow = '';
              document.documentElement.style.overflow = '';
              document.body.classList.remove('authing-guard-open');
              document.documentElement.classList.remove('authing-guard-open');
              
              // 修复滚动恢复逻辑，确保不会滚动到底部
              const scrollPosition = parseInt(scrollY.replace('-', '') || '0');
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPosition);
              });
            }
          }}
          onLoginError={(error) => {
            console.error('登录失败:', error);
            setError(error.message || '登录失败');
          }}
        />
      )}
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
  const { user, loading } = useUnifiedAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查权限中...</p>
        </div>
      </div>
    );
  }

  // 检查权限
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => user?.permissions?.includes(permission));

  // 检查角色
  const hasRequiredRoles = requiredRoles.length === 0 || 
    requiredRoles.some(role => user?.roles?.includes(role));

  if (hasRequiredPermissions && hasRequiredRoles) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}; 