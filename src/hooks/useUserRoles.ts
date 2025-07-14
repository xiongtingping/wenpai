/**
 * 用户角色检查Hook
 * 提供Authing用户角色管理和检查功能
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthing } from '@/hooks/useAuthing';
import { securityUtils } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

/**
 * 角色信息接口
 */
interface Role {
  id: string;
  name: string;
  description?: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

/**
 * 用户角色Hook返回值
 */
interface UseUserRolesReturn {
  /** 用户角色列表 */
  roles: Role[];
  /** 角色代码列表 */
  roleCodes: string[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 检查用户是否有指定角色 */
  hasRole: (roleCode: string) => boolean;
  /** 检查用户是否有指定角色组中的任意一个 */
  hasAnyRole: (roleCodes: string[]) => boolean;
  /** 检查用户是否有指定角色组中的所有角色 */
  hasAllRoles: (roleCodes: string[]) => boolean;
  /** 刷新用户角色 */
  refreshRoles: () => Promise<void>;
  /** 获取角色信息 */
  getRoleInfo: (roleCode: string) => Role | undefined;
  /** 是否为VIP用户 */
  isVip: boolean;
  /** 是否为管理员 */
  isAdmin: boolean;
  /** 是否为普通用户 */
  isNormalUser: boolean;
}

/**
 * 用户角色检查Hook
 * @param options 配置选项
 * @returns 用户角色状态和操作方法
 */
export function useUserRoles(options: {
  /** 是否自动检查角色 */
  autoCheck?: boolean;
  /** 是否启用安全日志 */
  enableSecurityLog?: boolean;
  /** VIP角色代码 */
  vipRoleCode?: string;
  /** 管理员角色代码 */
  adminRoleCode?: string;
} = {}): UseUserRolesReturn {
  const {
    autoCheck = true,
    enableSecurityLog = true,
    vipRoleCode = 'vip',
    adminRoleCode = 'admin'
  } = options;

  const [roles, setRoles] = useState<Role[]>([]);
  const [roleCodes, setRoleCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getCurrentUser } = useAuthing();
  const { toast } = useToast();

  /**
   * 安全日志记录
   */
  const logSecurity = useCallback((message: string, data?: any, level: 'info' | 'error' = 'info') => {
    if (enableSecurityLog) {
      securityUtils.secureLog(message, data, level);
    }
  }, [enableSecurityLog]);

  /**
   * 检查用户是否有指定角色
   */
  const hasRole = useCallback((roleCode: string): boolean => {
    return roleCodes.includes(roleCode);
  }, [roleCodes]);

  /**
   * 检查用户是否有指定角色组中的任意一个
   */
  const hasAnyRole = useCallback((roleCodesToCheck: string[]): boolean => {
    return roleCodesToCheck.some(code => roleCodes.includes(code));
  }, [roleCodes]);

  /**
   * 检查用户是否有指定角色组中的所有角色
   */
  const hasAllRoles = useCallback((roleCodesToCheck: string[]): boolean => {
    return roleCodesToCheck.every(code => roleCodes.includes(code));
  }, [roleCodes]);

  /**
   * 获取角色信息
   */
  const getRoleInfo = useCallback((roleCode: string): Role | undefined => {
    return roles.find(role => role.code === roleCode);
  }, [roles]);

  /**
   * 刷新用户角色
   */
  const refreshRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logSecurity('开始刷新用户角色');

      // 获取当前用户
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('用户未登录');
      }

      // 由于Authing SDK没有直接的getRoles方法，我们返回空数组
      // 在实际项目中，这里应该调用后端API获取用户角色
      const userRoles: any[] = [];
      
      if (userRoles && Array.isArray(userRoles)) {
        // 处理角色数据
        const processedRoles: Role[] = userRoles.map((role: any) => ({
          id: String(role.id || ''),
          name: String(role.name || ''),
          description: String(role.description || ''),
          code: String(role.code || ''),
          createdAt: role.createdAt || new Date().toISOString(),
          updatedAt: role.updatedAt || new Date().toISOString(),
          ...role
        }));

        const codes = processedRoles.map(role => role.code);

        setRoles(processedRoles);
        setRoleCodes(codes);

        logSecurity('用户角色刷新成功', {
          userId: user.id,
          roleCount: processedRoles.length,
          roleCodes: codes
        });

        toast({
          title: "角色信息已更新",
          description: `您当前拥有 ${processedRoles.length} 个角色`,
        });
      } else {
        setRoles([]);
        setRoleCodes([]);
        logSecurity('用户无角色信息');
      }

    } catch (err) {
      console.error('刷新用户角色失败:', err);
      const errorMessage = err instanceof Error ? err.message : '刷新角色失败';
      setError(errorMessage);
      
      logSecurity('刷新用户角色失败', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      }, 'error');

      toast({
        title: "角色刷新失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [getCurrentUser, logSecurity, toast]);

  // 计算角色状态
  const isVip = hasRole(vipRoleCode);
  const isAdmin = hasRole(adminRoleCode);
  const isNormalUser = !isVip && !isAdmin;

  // 自动检查角色
  useEffect(() => {
    if (autoCheck) {
      refreshRoles();
    }
  }, [autoCheck, refreshRoles]);

  return {
    roles,
    roleCodes,
    loading,
    error,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    refreshRoles,
    getRoleInfo,
    isVip,
    isAdmin,
    isNormalUser
  };
}

/**
 * 简化的用户角色检查Hook
 * 基于用户提供的代码逻辑
 */
export function useSimpleUserRoles() {
  const [isVip, setIsVip] = useState(false);
  const [isNormalUser, setIsNormalUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getCurrentUser } = useAuthing();

  useEffect(() => {
    const checkUserRoles = async () => {
      try {
        setLoading(true);
        
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('用户未登录');
        }

        // 由于Authing SDK没有直接的getRoles方法，我们返回空数组
        // 在实际项目中，这里应该调用后端API获取用户角色
        const roles: any[] = [];
        
        if (roles && Array.isArray(roles)) {
          const roleCodes = roles.map((role: any) => String(role.code || ''));
          
          if (roleCodes.includes('vip')) {
            console.log('是 VIP 用户');
            setIsVip(true);
            setIsNormalUser(false);
          } else {
            console.log('是普通用户');
            setIsVip(false);
            setIsNormalUser(true);
          }
        } else {
          setIsVip(false);
          setIsNormalUser(true);
        }
      } catch (error) {
        console.error('检查用户角色失败:', error);
        setError(error instanceof Error ? error.message : '检查角色失败');
        setIsVip(false);
        setIsNormalUser(true);
      } finally {
        setLoading(false);
      }
    };

    checkUserRoles();
  }, [getCurrentUser]);

  return {
    isVip,
    isNormalUser,
    loading,
    error
  };
}

/**
 * 角色权限检查Hook
 */
export function useRolePermissions() {
  const { roles, roleCodes, hasRole, hasAnyRole, hasAllRoles } = useUserRoles();

  /**
   * 检查是否有编辑权限
   */
  const canEdit = useCallback(() => {
    return hasAnyRole(['admin', 'editor', 'vip']);
  }, [hasAnyRole]);

  /**
   * 检查是否有删除权限
   */
  const canDelete = useCallback(() => {
    return hasAnyRole(['admin', 'super_admin']);
  }, [hasAnyRole]);

  /**
   * 检查是否有查看权限
   */
  const canView = useCallback(() => {
    return hasAnyRole(['admin', 'editor', 'viewer', 'vip', 'normal']);
  }, [hasAnyRole]);

  /**
   * 检查是否有管理权限
   */
  const canManage = useCallback(() => {
    return hasAnyRole(['admin', 'super_admin', 'manager']);
  }, [hasAnyRole]);

  return {
    roles,
    roleCodes,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canEdit,
    canDelete,
    canView,
    canManage
  };
} 