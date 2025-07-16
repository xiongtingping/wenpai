/**
 * 统一认证上下文
 * 整合Authing认证、权限管理和用户数据存储
 */

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/types/user';
import { useAuthing } from '@/hooks/useAuthing';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserStore } from '@/store/userStore';
import { securityUtils } from '@/lib/security';
import { secureStorage } from '@/lib/security';
import UserDataService from '@/services/userDataService';
import { LoginSuccessToast } from '@/components/auth/LoginSuccessToast';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface UnifiedAuthContextState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  status: AuthStatus;

  // 认证方法
  login: (redirectTo?: string) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;

  // 权限管理
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshPermissions: () => Promise<void>;

  // 用户数据管理
  getUserData: () => any;
  updateUserData: (updates: any) => Promise<void>;
  bindTempUserId: () => Promise<void>;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextState | undefined>(undefined);

interface UnifiedAuthProviderProps {
  children: ReactNode;
}

export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({ children }) => {
  // Authing认证状态
  const { user: authingUser, isLoggedIn, loading: authingLoading, showLogin, logout: authingLogout } = useAuthing();
  
  // 权限管理
  const { hasPermission, hasRole, refreshPermissions } = usePermissions();
  
  // 用户存储
  const { tempUserId, recordUserAction } = useUserStore();
  
  // 本地状态
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  // 初始化认证状态
  useEffect(() => {
    const initAuth = () => {
      try {
        // 从Authing获取用户信息
        if (authingUser && isLoggedIn) {
          const userData: User = {
            id: authingUser.id || '',
            username: authingUser.username || '',
            email: authingUser.email || '',
            phone: authingUser.phone || '',
            nickname: authingUser.nickname || '',
            avatar: String(authingUser.avatar || ''),
            roles: authingUser.roles || [],
            permissions: authingUser.permissions || [],
            createdAt: String(authingUser.createdAt || new Date().toISOString()),
            updatedAt: String(authingUser.updatedAt || new Date().toISOString()),
          };
          
          setUser(userData);
          setStatus('authenticated');
          securityUtils.secureLog('用户认证状态初始化成功', userData);
          
          // 绑定临时用户ID
          bindTempUserId();
          
          // 处理登录成功后的跳转
          const redirectTo = localStorage.getItem('login_redirect_to');
          if (redirectTo) {
            localStorage.removeItem('login_redirect_to'); // 清除存储的跳转目标
            securityUtils.secureLog('登录成功后跳转到指定页面', { redirectTo });
            // 立即跳转，减少延迟
            try {
              const url = new URL(redirectTo, window.location.origin);
              if (url.origin === window.location.origin) {
                // 使用 React Router 的 navigate 而不是 window.location.href
                // 这里需要从外部传入 navigate 函数，暂时使用 window.location.href
                window.location.href = redirectTo;
              } else {
                console.warn('跳转目标不在同一域名下，已阻止跳转');
              }
            } catch (error) {
              console.error('跳转URL格式错误:', error);
            }
          }
        } else {
          setUser(null);
          setStatus('unauthenticated');
          securityUtils.secureLog('用户未认证');
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        setError('初始化认证状态失败');
        setStatus('unauthenticated');
      }
    };

    // 临时修复：如果Authing服务不可用，设置一个较短的超时时间
    const timeout = setTimeout(() => {
      if (authingLoading) {
        console.warn('Authing服务响应超时，设置为未认证状态');
        setUser(null);
        setStatus('unauthenticated');
      }
    }, 5000); // 5秒超时

    if (!authingLoading) {
      clearTimeout(timeout);
      initAuth();
    }

    return () => clearTimeout(timeout);
  }, [authingUser, isLoggedIn, authingLoading]);

  // 登录方法
  const login = (redirectTo?: string) => {
    try {
      // 保存跳转目标到本地存储
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }
      showLogin();
      setError(null);
    } catch (error) {
      console.error('登录失败:', error);
      setError('登录失败');
    }
  };

  // 登出方法
  const logout = async () => {
    try {
      await authingLogout();
      setUser(null);
      setStatus('unauthenticated');
      setError(null);
      securityUtils.secureLog('用户已登出');
    } catch (error) {
      console.error('登出失败:', error);
      setError('登出失败');
    }
  };

  // 更新用户信息
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      secureStorage.setItem('authing_user', updatedUser);
      setUser(updatedUser);
      securityUtils.secureLog('用户信息已更新', { userId: updatedUser.id });
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      securityUtils.secureLog('刷新用户信息');
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      setError('刷新用户信息失败');
    }
  };

  // 清除错误信息
  const clearError = () => {
    setError(null);
  };

  // 绑定临时用户ID
  const bindTempUserId = async () => {
    if (user) {
      try {
        const userDataService = UserDataService.getInstance();
        // 这里需要从本地存储获取临时用户ID，然后绑定到正式用户ID
        if (tempUserId && tempUserId !== user.id) {
          await userDataService.bindTempUserToRealUser(tempUserId, user.id);
          securityUtils.secureLog('临时用户ID绑定成功', { tempUserId, realUserId: user.id });
        }
      } catch (error) {
        console.error('绑定临时用户ID失败:', error);
        setError('绑定临时用户ID失败');
      }
    }
  };

  // 获取用户数据
  const getUserData = () => {
    return { tempUserId, user };
  };

  // 更新用户数据
  const updateUserData = async (updates: any) => {
    try {
      // 记录用户行为
      recordUserAction('featureUsage', {
        feature: 'user_data_update',
        metadata: updates
      });
      securityUtils.secureLog('用户数据已更新', { updates });
    } catch (error) {
      console.error('更新用户数据失败:', error);
      setError('更新用户数据失败');
    }
  };

  // 跳转到个人中心
  const goToProfile = () => {
    window.location.href = '/profile';
  };

  // 计算属性
  const isAuthenticated = status === 'authenticated';
  const loading = status === 'loading' || authingLoading;

  // 权限检查函数
  const checkPermission = (permission: string) => {
    // 将单个权限字符串转换为 resource:action 格式
    const [resource, action] = permission.includes(':') ? permission.split(':') : [permission, 'read'];
    return hasPermission(resource, action);
  };

  // 上下文值
  const contextValue: UnifiedAuthContextState = {
    user,
    isAuthenticated,
    loading,
    error,
    status,
    login,
    logout,
    updateUser,
    refreshUser,
    clearError,
    hasPermission: checkPermission,
    hasRole,
    refreshPermissions,
    getUserData,
    updateUserData,
    bindTempUserId,
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
      {showLoginSuccess && user && (
        <LoginSuccessToast
          user={user}
          onClose={() => setShowLoginSuccess(false)}
          onGoToProfile={goToProfile}
        />
      )}
    </UnifiedAuthContext.Provider>
  );
};

/**
 * 使用统一认证上下文
 * @returns 统一认证上下文状态
 */
export const useUnifiedAuthContext = (): UnifiedAuthContextState => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuthContext must be used within a UnifiedAuthProvider');
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
  const { isAuthenticated, loading, status } = useUnifiedAuthContext();

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
    // 重定向到登录页面
    window.location.href = redirectTo;
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
  const { hasPermission, hasRole, loading } = useUnifiedAuthContext();

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
    requiredPermissions.every(permission => hasPermission(permission));

  // 检查角色
  const hasRequiredRoles = requiredRoles.length === 0 || 
    requiredRoles.some(role => hasRole(role));

  if (hasRequiredPermissions && hasRequiredRoles) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}; 