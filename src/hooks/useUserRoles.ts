/**
 * 用户角色管理Hook
 * 提供用户角色检查和管理的功能
 */

import { useState, useEffect, useCallback } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { securityUtils } from '@/lib/security';

/**
 * 检查是否为开发环境
 */
const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * 角色信息接口
 */
interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
}

/**
 * 用户角色Hook返回值
 */
interface UseUserRolesReturn {
  /** 角色列表 */
  roles: Role[];
  /** 角色代码列表 */
  roleCodes: string[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 检查是否有指定角色 */
  hasRole: (roleCode: string) => boolean;
  /** 检查是否有指定角色组中的任意一个 */
  hasAnyRole: (roleCodes: string[]) => boolean;
  /** 检查是否有指定角色组中的所有角色 */
  hasAllRoles: (roleCodes: string[]) => boolean;
  /** 获取角色信息 */
  getRoleInfo: (roleCode: string) => Role | undefined;
  /** 刷新角色信息 */
  refreshRoles: () => Promise<void>;
  /** 是否为VIP用户 */
  isVip: boolean;
  /** 是否为管理员 */
  isAdmin: boolean;
}

/**
 * 开发环境角色配置
 */
const DEV_ROLES: Role[] = [
  {
    id: 'dev-admin',
    name: '开发管理员',
    code: 'admin',
    description: '开发环境管理员角色'
  },
  {
    id: 'dev-vip',
    name: '开发VIP用户',
    code: 'vip',
    description: '开发环境VIP用户角色'
  },
  {
    id: 'dev-premium',
    name: '开发高级用户',
    code: 'premium',
    description: '开发环境高级用户角色'
  }
];

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

  const { user, isAuthenticated } = useUnifiedAuth();
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
   * 加载用户角色信息
   */
  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logSecurity('开始加载用户角色信息');

      // 开发环境下使用模拟角色
      if (isDevelopment()) {
        setRoles(DEV_ROLES);
        setRoleCodes(DEV_ROLES.map(role => role.code));
        logSecurity('开发环境：使用模拟角色', { roles: DEV_ROLES.map(r => r.code) });
        return;
      }

      // 检查用户登录状态
      if (!isAuthenticated || !user) {
        setRoles([]);
        setRoleCodes([]);
        logSecurity('用户未登录，角色信息已清空');
        return;
      }

      // 从用户信息中获取角色
      const userRoles = user.roles || [];
      const roleList: Role[] = userRoles.map((roleCode: string) => ({
        id: roleCode,
        name: roleCode,
        code: roleCode,
        description: `用户角色：${roleCode}`
      }));

      setRoles(roleList);
      setRoleCodes(userRoles);

      logSecurity('用户角色信息加载成功', {
        userId: user.id,
        roles: userRoles,
        roleCount: userRoles.length
      });

    } catch (error) {
      console.error('加载用户角色信息失败:', error);
      setError(error instanceof Error ? error.message : '加载角色信息失败');
      
      logSecurity('加载用户角色信息失败', {
        error: error instanceof Error ? error.message : '未知错误',
        userId: user?.id
      }, 'error');

      toast({
        title: "角色信息加载失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, logSecurity, toast]);

  /**
   * 刷新角色信息
   */
  const refreshRoles = useCallback(async () => {
    await loadRoles();
  }, [loadRoles]);

  // 自动检查角色
  useEffect(() => {
    if (autoCheck) {
      loadRoles();
    }
  }, [autoCheck, loadRoles]);

  // 计算VIP和管理员状态
  const isVip = hasRole(vipRoleCode) || hasRole('premium') || hasRole('pro');
  const isAdmin = hasRole(adminRoleCode) || hasRole('super_admin');

  return {
    roles,
    roleCodes,
    loading,
    error,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getRoleInfo,
    refreshRoles,
    isVip,
    isAdmin
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

  const { user, isAuthenticated } = useUnifiedAuth();

  useEffect(() => {
    const checkUserRoles = async () => {
      try {
        setLoading(true);
        
        if (!isAuthenticated || !user) {
          throw new Error('用户未登录');
        }

        // 从用户信息中获取角色
        const roles = user.roles || [];
        
        if (roles && Array.isArray(roles)) {
          const roleCodes = roles.map((role: any) => String(role.code || role || ''));
          
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
  }, [isAuthenticated, user]);

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