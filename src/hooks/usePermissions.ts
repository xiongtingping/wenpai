/**
 * 权限管理 Hook
 * 提供细粒度的权限控制功能
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthing } from './useAuthing';
import authingService from '@/services/authingService';

/**
 * 权限类型定义
 */
export interface Permission {
  resource: string;
  action: string;
}

/**
 * 角色类型定义
 */
export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
}

/**
 * 权限状态接口
 */
interface PermissionState {
  /** 用户角色列表 */
  roles: Role[];
  /** 用户权限列表 */
  permissions: Permission[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 权限检查结果接口
 */
interface PermissionCheckResult {
  /** 是否有权限 */
  hasPermission: boolean;
  /** 缺少的权限 */
  missingPermissions: Permission[];
  /** 缺少的角色 */
  missingRoles: string[];
}

/**
 * usePermissions Hook 返回值接口
 */
interface UsePermissionsReturn extends PermissionState {
  /** 检查是否有指定权限 */
  hasPermission: (resource: string, action: string) => boolean;
  /** 检查是否有指定角色 */
  hasRole: (roleName: string) => boolean;
  /** 检查是否有任意指定权限 */
  hasAnyPermission: (permissions: Permission[]) => boolean;
  /** 检查是否有所有指定权限 */
  hasAllPermissions: (permissions: Permission[]) => boolean;
  /** 检查是否有任意指定角色 */
  hasAnyRole: (roleNames: string[]) => boolean;
  /** 检查是否有所有指定角色 */
  hasAllRoles: (roleNames: string[]) => boolean;
  /** 详细权限检查 */
  checkPermissions: (requiredPermissions: Permission[], requiredRoles: string[]) => PermissionCheckResult;
  /** 刷新权限信息 */
  refreshPermissions: () => Promise<void>;
}

/**
 * 开发环境最高权限配置
 */
const DEV_PERMISSIONS: Permission[] = [
  { resource: 'content', action: 'read' },
  { resource: 'content', action: 'create' },
  { resource: 'content', action: 'update' },
  { resource: 'content', action: 'delete' },
  { resource: 'user', action: 'read' },
  { resource: 'user', action: 'update' },
  { resource: 'user', action: 'delete' },
  { resource: 'payment', action: 'read' },
  { resource: 'payment', action: 'create' },
  { resource: 'payment', action: 'update' },
  { resource: 'payment', action: 'delete' },
  { resource: 'admin', action: 'read' },
  { resource: 'admin', action: 'create' },
  { resource: 'admin', action: 'update' },
  { resource: 'admin', action: 'delete' },
  { resource: 'system', action: 'read' },
  { resource: 'system', action: 'create' },
  { resource: 'system', action: 'update' },
  { resource: 'system', action: 'delete' },
  { resource: 'theme', action: 'switch' },
  { resource: 'theme', action: 'customize' },
  { resource: 'api', action: 'read' },
  { resource: 'api', action: 'write' },
  { resource: 'api', action: 'delete' },
  { resource: 'hot-topics', action: 'read' },
  { resource: 'hot-topics', action: 'create' },
  { resource: 'hot-topics', action: 'update' },
  { resource: 'hot-topics', action: 'delete' },
  { resource: 'subscription', action: 'read' },
  { resource: 'subscription', action: 'create' },
  { resource: 'subscription', action: 'update' },
  { resource: 'subscription', action: 'delete' },
  { resource: 'notification', action: 'read' },
  { resource: 'notification', action: 'create' },
  { resource: 'notification', action: 'update' },
  { resource: 'notification', action: 'delete' },
  { resource: 'emoji', action: 'read' },
  { resource: 'emoji', action: 'create' },
  { resource: 'emoji', action: 'update' },
  { resource: 'emoji', action: 'delete' },
];

const DEV_ROLES: Role[] = [
  { id: '1', name: '超级管理员', code: 'super-admin', description: '拥有所有权限的超级管理员' },
  { id: '2', name: '管理员', code: 'admin', description: '系统管理员' },
  { id: '3', name: '专业用户', code: 'premium', description: '高级功能用户' },
  { id: '4', name: '高级用户', code: 'pro', description: '专业版用户' },
  { id: '5', name: '普通用户', code: 'user', description: '基础功能用户' },
  { id: '6', name: '测试用户', code: 'tester', description: '测试专用用户' },
];

/**
 * 检查是否为开发环境
 */
const isDevelopment = () => {
  return import.meta.env.DEV || 
         process.env.NODE_ENV === 'development' || 
         import.meta.env.VITE_DEV_MODE === 'true';
};

/**
 * 权限管理 Hook
 * @returns UsePermissionsReturn
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isLoggedIn } = useAuthing();
  const [state, setState] = useState<PermissionState>({
    roles: [],
    permissions: [],
    loading: false,
    error: null,
  });

  /**
   * 加载用户权限信息
   */
  const loadPermissions = useCallback(async () => {
    // 开发环境下使用最高权限配置
    if (isDevelopment()) {
      setState({
        roles: DEV_ROLES,
        permissions: DEV_PERMISSIONS,
        loading: false,
        error: null,
      });
      return;
    }

    if (!isLoggedIn || !user) {
      setState({
        roles: [],
        permissions: [],
        loading: false,
        error: null,
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 调用真实API获取用户权限和角色
      const [permissions, roles] = await Promise.all([
        authingService.getUserPermissions(),
        authingService.getUserRoles()
      ]);

      // 转换权限格式
      const formattedPermissions: Permission[] = permissions.map((perm: string) => {
        const [resource, action] = perm.split(':');
        return { resource, action };
      });

      // 转换角色格式
      const formattedRoles: Role[] = roles.map((role: Record<string, unknown>) => ({
        id: (role.id as string) || (role.code as string),
        name: (role.name as string) || (role.displayName as string),
        code: role.code as string,
        description: (role.description as string) || ''
      }));

      setState({
        roles: formattedRoles,
        permissions: formattedPermissions,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('加载权限信息失败:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: '加载权限信息失败',
      }));
    }
  }, [isLoggedIn, user]);

  /**
   * 检查是否有指定权限
   */
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    // 开发环境下返回true
    if (isDevelopment()) {
      return true;
    }
    return state.permissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  }, [state.permissions]);

  /**
   * 检查是否有指定角色
   */
  const hasRole = useCallback((roleName: string): boolean => {
    // 开发环境下返回true
    if (isDevelopment()) {
      return true;
    }
    return state.roles.some(role => role.name === roleName || role.code === roleName);
  }, [state.roles]);

  /**
   * 检查是否有任意指定权限
   */
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    // 开发环境下返回true
    if (isDevelopment()) {
      return true;
    }
    return permissions.some(permission => hasPermission(permission.resource, permission.action));
  }, [hasPermission]);

  /**
   * 检查是否有所有指定权限
   */
  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    // 开发环境下返回true
    if (isDevelopment()) {
      return true;
    }
    return permissions.every(permission => hasPermission(permission.resource, permission.action));
  }, [hasPermission]);

  /**
   * 检查是否有任意指定角色
   */
  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    // 开发环境下返回true
    if (isDevelopment()) {
      return true;
    }
    return roleNames.some(roleName => hasRole(roleName));
  }, [hasRole]);

  /**
   * 检查是否有所有指定角色
   */
  const hasAllRoles = useCallback((roleNames: string[]): boolean => {
    // 开发环境下返回true
    if (isDevelopment()) {
      return true;
    }
    return roleNames.every(roleName => hasRole(roleName));
  }, [hasRole]);

  /**
   * 详细权限检查
   */
  const checkPermissions = useCallback((
    requiredPermissions: Permission[],
    requiredRoles: string[]
  ): PermissionCheckResult => {
    // 开发环境下返回全部通过
    if (isDevelopment()) {
      return {
        hasPermission: true,
        missingPermissions: [],
        missingRoles: [],
      };
    }

    const missingPermissions = requiredPermissions.filter(
      permission => !hasPermission(permission.resource, permission.action)
    );
    
    const missingRoles = requiredRoles.filter(roleName => !hasRole(roleName));
    
    const hasPermission = missingPermissions.length === 0;
    const hasRole = missingRoles.length === 0;
    
    return {
      hasPermission: hasPermission && hasRole,
      missingPermissions,
      missingRoles,
    };
  }, [hasPermission, hasRole]);

  /**
   * 刷新权限信息
   */
  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  // 当用户登录状态改变时，重新加载权限
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    ...state,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    checkPermissions,
    refreshPermissions,
  };
} 