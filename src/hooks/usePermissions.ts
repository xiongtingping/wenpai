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
      const formattedRoles: Role[] = roles.map((role: any) => ({
        id: role.id || role.code,
        name: role.name || role.displayName,
        code: role.code,
        description: role.description || ''
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
    return state.permissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  }, [state.permissions]);

  /**
   * 检查是否有指定角色
   */
  const hasRole = useCallback((roleName: string): boolean => {
    return state.roles.some(role => role.name === roleName || role.code === roleName);
  }, [state.roles]);

  /**
   * 检查是否有任意指定权限
   */
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission.resource, permission.action));
  }, [hasPermission]);

  /**
   * 检查是否有所有指定权限
   */
  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission.resource, permission.action));
  }, [hasPermission]);

  /**
   * 检查是否有任意指定角色
   */
  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  }, [hasRole]);

  /**
   * 检查是否有所有指定角色
   */
  const hasAllRoles = useCallback((roleNames: string[]): boolean => {
    return roleNames.every(roleName => hasRole(roleName));
  }, [hasRole]);

  /**
   * 详细权限检查
   */
  const checkPermissions = useCallback((
    requiredPermissions: Permission[],
    requiredRoles: string[]
  ): PermissionCheckResult => {
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