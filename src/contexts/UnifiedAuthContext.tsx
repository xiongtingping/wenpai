/**
 * 统一认证上下文
 * 整合Authing认证、权限管理和用户数据存储
 * @module UnifiedAuthContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, startTransition } from 'react';
import { useAuthing } from '../hooks/useAuthing';
import UserDataService from '../services/userDataService';
import { LoginSuccessToast } from '../components/auth/LoginSuccessToast';

// 用户类型定义
interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  [key: string]: unknown;
}

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

interface UnifiedAuthProviderProps {
  children: ReactNode;
}

// 创建上下文
const UnifiedAuthContext = createContext<UnifiedAuthContextState | null>(null);

/**
 * 获取存储在 localStorage 中的用户信息
 * @returns {User | null} 用户信息或 null
 */
const getSafeUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('authing_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      // 确保所有必需的字段都存在
      if (user && user.id) {
        return user;
      }
    } catch (e) {
      console.error('解析 localStorage 用户信息失败:', e);
    }
  }
  return null;
};

/**
 * 统一认证提供者组件
 * @param {UnifiedAuthProviderProps} props - 组件属性
 * @returns {JSX.Element} 认证提供者组件
 */
export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({ children }) => {
  // 状态管理
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  // 使用Authing Hook
  const { 
    user: authingUser, 
    isLoggedIn, 
    loading: authingLoading, 
    showLogin, 
    logout: authingLogout,
    checkLoginStatus 
  } = useAuthing();

  // 权限相关函数（简化实现）
  const hasPermission = useCallback((resource: string, action: string = 'read'): boolean => {
    // 简化权限检查，实际项目中应该从用户信息中获取权限列表
    if (!user) return false;
    
    // 开发环境下给予所有权限
    if (import.meta.env.DEV) return true;
    
    // 生产环境下的权限检查逻辑
    const userPermissions = (user as any).permissions || [];
    const permissionKey = `${resource}:${action}`;
    return userPermissions.includes(permissionKey);
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    
    // 开发环境下给予所有角色
    if (import.meta.env.DEV) return true;
    
    // 生产环境下的角色检查逻辑
    const userRoles = (user as any).roles || [];
    return userRoles.includes(role);
  }, [user]);

  const refreshPermissions = useCallback(async (): Promise<void> => {
    try {
      // 刷新权限的逻辑
      console.log('刷新权限');
    } catch (error) {
      console.error('刷新权限失败:', error);
    }
  }, []);

  // 记录用户行为
  const recordUserAction = useCallback((
    actionType: 'pageVisit' | 'featureUsage' | 'contentCreated', 
    actionData: any
  ) => {
    try {
      if (!user) return;
      const userDataService = UserDataService.getInstance();
      userDataService.recordUserAction(user.id, actionType, actionData);
    } catch (error) {
      console.error('记录用户行为失败:', error);
    }
  }, [user]);

  // 初始化认证状态
  useEffect(() => {
    const initAuth = () => {
      try {
        // 优先从localStorage恢复用户信息
        const storedUser = getSafeUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
          setStatus('authenticated');
          // securityUtils.secureLog('本地恢复用户认证状态', JSON.parse(storedUser)); // Removed
          return;
        }
        
        // 从Authing获取用户信息
        if (authingUser && isLoggedIn) {
          const userData: User = {
            id: authingUser.id || '',
            username: authingUser.username || '',
            email: authingUser.email || '',
            phone: authingUser.phone || '',
            nickname: authingUser.nickname || '',
            avatar: authingUser.avatar || '',
          };
          
          setUser(userData);
          setStatus('authenticated');
          
          // 持久化到localStorage
          localStorage.setItem('authing_user', JSON.stringify(userData));
          
          // securityUtils.secureLog('用户认证状态初始化成功', userData); // Removed
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        setStatus('unauthenticated');
      }
    };

    // 如果Authing还在加载，等待加载完成
    if (authingLoading) {
      return;
    }

    // 使用 startTransition 包装状态更新，避免 React Suspense 错误
    startTransition(() => {
      initAuth();
    });
  }, [authingUser, isLoggedIn, authingLoading]);

  // 临时修复：如果Authing服务不可用，设置一个较短的超时时间
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authingLoading) {
        console.log('Authing服务响应超时，设置为未认证状态');
        startTransition(() => {
          setUser(null);
          setStatus('unauthenticated');
        });
      }
    }, 5000); // 5秒超时

    return () => clearTimeout(timeout);
  }, [authingLoading]);

  // 登录方法
  const login = (redirectTo?: string) => {
    console.log('UnifiedAuthContext login方法被调用');
    console.log('跳转目标:', redirectTo);
    console.log('当前Authing状态:', { authingUser, isLoggedIn, authingLoading });
    
    if (redirectTo) {
      localStorage.setItem('login_redirect_to', redirectTo);
      console.log('已保存跳转目标到localStorage:', redirectTo);
    }
    
    console.log('调用Authing showLogin方法');
    showLogin();
    console.log('登录流程已启动');
  };

  // 登出方法
  const logout = async () => {
    try {
      await authingLogout();
      startTransition(() => {
        setUser(null);
        setStatus('unauthenticated');
      });
      localStorage.removeItem('authing_user');
      // securityUtils.secureLog('用户登出成功'); // Removed
    } catch (error) {
      console.error('登出失败:', error);
      startTransition(() => {
        setError('登出失败');
      });
    }
  };

  // 更新用户信息
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      // secureStorage.setItem('authing_user', updatedUser); // Removed
      startTransition(() => {
        setUser(updatedUser);
      });
      // securityUtils.secureLog('用户信息已更新', { userId: updatedUser.id }); // Removed
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      // securityUtils.secureLog('刷新用户信息'); // Removed
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      startTransition(() => {
        setError('刷新用户信息失败');
      });
    }
  };

  // 清除错误信息
  const clearError = () => {
    startTransition(() => {
      setError(null);
    });
  };

  // 绑定临时用户ID
  const bindTempUserId = async () => {
    if (user) {
      try {
        const userDataService = UserDataService.getInstance();
        // 这里需要从本地存储获取临时用户ID，然后绑定到正式用户ID
        if (tempUserId && tempUserId !== user.id) {
          await userDataService.bindTempUserToRealUser(tempUserId, user.id);
          // securityUtils.secureLog('临时用户ID绑定成功', { tempUserId, realUserId: user.id }); // Removed
        }
      } catch (error) {
        console.error('绑定临时用户ID失败:', error);
        startTransition(() => {
          setError('绑定临时用户ID失败');
        });
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
      // securityUtils.secureLog('用户数据已更新', { updates }); // Removed
    } catch (error) {
      console.error('更新用户数据失败:', error);
      startTransition(() => {
        setError('更新用户数据失败');
      });
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
 * 统一认证上下文Hook
 * @returns {UnifiedAuthContextState} 认证上下文状态
 */
function useUnifiedAuthContext(): UnifiedAuthContextState {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuthContext must be used within a UnifiedAuthProvider');
  }
  return context;
}

// 导出Hook，确保HMR兼容
export { useUnifiedAuthContext };

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