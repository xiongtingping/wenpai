/**
 * 统一认证上下文
 * 提供全局的认证状态管理，整合Authing和自建后台功能
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { User } from '@/types/user';
import { securityUtils } from '@/lib/security';

/**
 * 统一认证上下文状态
 */
interface UnifiedAuthContextState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Authing功能
  login: (method: 'password' | 'code' | 'social', credentials: any) => Promise<void>;
  register: (method: 'email' | 'phone', userInfo: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (updates: Partial<User>) => Promise<void>;
  getUserRoles: () => Promise<string[]>;
  assignRole: (roleCode: string) => Promise<void>;
  refreshToken: () => Promise<void>;

  // 自建后台功能
  generateInviteLink: () => Promise<string>;
  bindInviteRelation: (inviterId: string, inviteeId: string) => Promise<void>;
  processInviteReward: (inviterId: string, inviteeId: string) => Promise<void>;
  distributeMonthlyUsage: (userTier: string) => Promise<void>;
  getUserBalance: () => Promise<any>;
  updateUserBalance: (updates: any) => Promise<void>;
  getInviteRelations: () => Promise<any[]>;
  getUserUsage: () => Promise<any>;
  recordUserAction: (action: string, data: any) => Promise<void>;

  // 工具方法
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * 统一认证上下文
 */
const UnifiedAuthContext = createContext<UnifiedAuthContextState | undefined>(undefined);

/**
 * 统一认证提供者属性
 */
interface UnifiedAuthProviderProps {
  children: ReactNode;
}

/**
 * 统一认证提供者组件
 * @param props 组件属性
 * @returns React组件
 */
export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({ children }) => {
  const unifiedAuth = useUnifiedAuth();

  /**
   * 监听用户状态变化
   */
  useEffect(() => {
    if (unifiedAuth.user) {
      securityUtils.secureLog('统一认证上下文用户状态更新', { 
        userId: unifiedAuth.user.id,
        isAuthenticated: unifiedAuth.isAuthenticated 
      });
    } else {
      securityUtils.secureLog('统一认证上下文用户已登出');
    }
  }, [unifiedAuth.user, unifiedAuth.isAuthenticated]);

  /**
   * 监听错误状态变化
   */
  useEffect(() => {
    if (unifiedAuth.error) {
      securityUtils.secureLog('统一认证上下文发生错误', { error: unifiedAuth.error }, 'error');
    }
  }, [unifiedAuth.error]);

  return (
    <UnifiedAuthContext.Provider value={unifiedAuth}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

/**
 * 使用统一认证上下文Hook
 * @returns 统一认证上下文状态
 */
export const useUnifiedAuthContext = (): UnifiedAuthContextState => {
  const context = useContext(UnifiedAuthContext);
  
  if (context === undefined) {
    throw new Error('useUnifiedAuthContext必须在UnifiedAuthProvider内部使用');
  }
  
  return context;
};

/**
 * 统一认证保护组件属性
 */
interface UnifiedAuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  loadingComponent?: ReactNode;
  noAuthComponent?: ReactNode;
}

/**
 * 统一认证保护组件
 * 用于保护需要认证的路由和组件
 * @param props 组件属性
 * @returns React组件
 */
export const UnifiedAuthGuard: React.FC<UnifiedAuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  loadingComponent = <div>加载中...</div>,
  noAuthComponent = <div>需要登录</div>
}) => {
  const { isAuthenticated, loading } = useUnifiedAuthContext();

  // 如果正在加载，显示加载组件
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // 如果需要认证但用户未登录
  if (requireAuth && !isAuthenticated) {
    // 这里可以添加重定向逻辑
    return <>{noAuthComponent}</>;
  }

  // 如果不需要认证或用户已登录，渲染子组件
  return <>{children}</>;
};

/**
 * 统一认证权限保护组件属性
 */
interface UnifiedPermissionGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  checkMode?: 'all' | 'any';
  loadingComponent?: ReactNode;
  noPermissionComponent?: ReactNode;
  onNoPermission?: () => void;
}

/**
 * 统一认证权限保护组件
 * 用于保护需要特定权限的路由和组件
 * @param props 组件属性
 * @returns React组件
 */
export const UnifiedPermissionGuard: React.FC<UnifiedPermissionGuardProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  checkMode = 'all',
  loadingComponent = <div>加载中...</div>,
  noPermissionComponent = <div>权限不足</div>,
  onNoPermission
}) => {
  const { isAuthenticated, loading, getUserRoles } = useUnifiedAuthContext();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  /**
   * 检查用户权限
   */
  const checkPermissions = async () => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      setRolesLoading(true);
      const roles = await getUserRoles();
      setUserRoles(roles);

      // 检查角色权限
      if (requiredRoles.length > 0) {
        const hasRole = checkMode === 'all' 
          ? requiredRoles.every(role => roles.includes(role))
          : requiredRoles.some(role => roles.includes(role));
        
        if (!hasRole) {
          return false;
        }
      }

      // 这里可以添加权限检查逻辑
      // 目前简化处理，只检查角色

      return true;
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    } finally {
      setRolesLoading(false);
    }
  };

  /**
   * 权限检查效果
   */
  useEffect(() => {
    if (isAuthenticated && (requiredRoles.length > 0 || requiredPermissions.length > 0)) {
      checkPermissions();
    }
  }, [isAuthenticated, requiredRoles, requiredPermissions]);

  // 如果正在加载，显示加载组件
  if (loading || rolesLoading) {
    return <>{loadingComponent}</>;
  }

  // 如果用户未登录
  if (!isAuthenticated) {
    return <>{noPermissionComponent}</>;
  }

  // 检查权限
  const hasPermission = checkMode === 'all'
    ? requiredRoles.every(role => userRoles.includes(role))
    : requiredRoles.some(role => userRoles.includes(role));

  // 如果没有权限
  if (!hasPermission) {
    if (onNoPermission) {
      onNoPermission();
    }
    return <>{noPermissionComponent}</>;
  }

  // 有权限，渲染子组件
  return <>{children}</>;
};

export default UnifiedAuthContext; 