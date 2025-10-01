/**
 * 数据访问控制工具
 * @description 防止水平越权和垂直越权访问
 */

import type { SessionUserInfo } from '@/types/unifiedAuth';

/**
 * 资源类型定义
 */
export type ResourceType = 
  | 'user_profile'
  | 'user_subscription'
  | 'user_tokens'
  | 'user_projects'
  | 'user_files'
  | 'user_analytics'
  | 'system_config'
  | 'admin_data'
  | 'billing_info';

/**
 * 访问级别定义
 */
export type AccessLevel = 'read' | 'write' | 'delete' | 'admin';

/**
 * 数据访问规则
 */
export interface AccessRule {
  resourceType: ResourceType;
  accessLevel: AccessLevel;
  condition: (user: SessionUserInfo, targetUserId?: string, resourceId?: string) => boolean;
  errorMessage: string;
}

/**
 * 用户角色权重
 */
const ROLE_WEIGHTS = {
  guest: 0,
  user: 1,
  vip: 2,
  moderator: 3,
  admin: 4,
  super_admin: 5
} as const;

/**
 * 获取用户角色权重
 */
function getUserRoleWeight(user: SessionUserInfo | null): number {
  if (!user) return ROLE_WEIGHTS.guest;
  
  const role = user.roles?.[0] || 'user';
  return ROLE_WEIGHTS[role as keyof typeof ROLE_WEIGHTS] || ROLE_WEIGHTS.user;
}

/**
 * 数据访问规则定义
 */
const ACCESS_RULES: AccessRule[] = [
  // 用户资料访问规则
  {
    resourceType: 'user_profile',
    accessLevel: 'read',
    condition: (user, targetUserId) => {
      // 用户可以读取自己的资料，管理员可以读取所有用户资料
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权查看其他用户的资料'
  },
  {
    resourceType: 'user_profile',
    accessLevel: 'write',
    condition: (user, targetUserId) => {
      // 用户只能修改自己的资料，管理员可以修改所有用户资料
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权修改其他用户的资料'
  },
  
  // 用户订阅信息访问规则
  {
    resourceType: 'user_subscription',
    accessLevel: 'read',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权查看其他用户的订阅信息'
  },
  {
    resourceType: 'user_subscription',
    accessLevel: 'write',
    condition: (user, targetUserId) => {
      // 普通用户不能直接修改订阅信息，只有管理员可以
      return getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权修改订阅信息'
  },
  
  // Token使用数据访问规则
  {
    resourceType: 'user_tokens',
    accessLevel: 'read',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权查看其他用户的Token使用情况'
  },
  {
    resourceType: 'user_tokens',
    accessLevel: 'write',
    condition: (user, targetUserId) => {
      // 只有管理员可以修改Token记录
      return getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权修改Token使用记录'
  },
  
  // 用户项目数据访问规则
  {
    resourceType: 'user_projects',
    accessLevel: 'read',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.moderator;
    },
    errorMessage: '无权查看其他用户的项目'
  },
  {
    resourceType: 'user_projects',
    accessLevel: 'write',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权修改其他用户的项目'
  },
  {
    resourceType: 'user_projects',
    accessLevel: 'delete',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权删除其他用户的项目'
  },
  
  // 用户文件访问规则
  {
    resourceType: 'user_files',
    accessLevel: 'read',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.moderator;
    },
    errorMessage: '无权访问其他用户的文件'
  },
  {
    resourceType: 'user_files',
    accessLevel: 'write',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权修改其他用户的文件'
  },
  {
    resourceType: 'user_files',
    accessLevel: 'delete',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权删除其他用户的文件'
  },
  
  // 用户分析数据访问规则
  {
    resourceType: 'user_analytics',
    accessLevel: 'read',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权查看其他用户的分析数据'
  },
  
  // 系统配置访问规则
  {
    resourceType: 'system_config',
    accessLevel: 'read',
    condition: (user) => {
      return getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权查看系统配置'
  },
  {
    resourceType: 'system_config',
    accessLevel: 'write',
    condition: (user) => {
      return getUserRoleWeight(user) >= ROLE_WEIGHTS.super_admin;
    },
    errorMessage: '无权修改系统配置'
  },
  
  // 管理员数据访问规则
  {
    resourceType: 'admin_data',
    accessLevel: 'read',
    condition: (user) => {
      return getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '需要管理员权限'
  },
  {
    resourceType: 'admin_data',
    accessLevel: 'write',
    condition: (user) => {
      return getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '需要管理员权限'
  },
  
  // 账单信息访问规则
  {
    resourceType: 'billing_info',
    accessLevel: 'read',
    condition: (user, targetUserId) => {
      return user.id === targetUserId || getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权查看其他用户的账单信息'
  },
  {
    resourceType: 'billing_info',
    accessLevel: 'write',
    condition: (user, targetUserId) => {
      // 只有管理员可以修改账单信息
      return getUserRoleWeight(user) >= ROLE_WEIGHTS.admin;
    },
    errorMessage: '无权修改账单信息'
  }
];

/**
 * 数据访问控制类
 */
export class DataAccessController {
  /**
   * 检查数据访问权限
   */
  static checkAccess(
    user: SessionUserInfo | null,
    resourceType: ResourceType,
    accessLevel: AccessLevel,
    targetUserId?: string,
    resourceId?: string
  ): { allowed: boolean; reason?: string } {
    if (!user) {
      return {
        allowed: false,
        reason: '用户未登录'
      };
    }

    // 查找匹配的访问规则
    const rule = ACCESS_RULES.find(r => 
      r.resourceType === resourceType && r.accessLevel === accessLevel
    );

    if (!rule) {
      console.warn(`not found访问规则: ${resourceType}:${accessLevel}`);
      return {
        allowed: false,
        reason: '未定义的访问规则'
      };
    }

    // 执行权限检查
    const allowed = rule.condition(user, targetUserId, resourceId);
    
    if (!allowed) {
      console.warn('data访问被denied:', {
        userId: user.id,
        userRole: user.roles?.[0] || 'user',
        resourceType,
        accessLevel,
        targetUserId,
        resourceId,
        reason: rule.errorMessage
      });
    } else {
      console.log('data访问permissionvalidating通过:', {
        userId: user.id,
        userRole: user.roles?.[0] || 'user',
        resourceType,
        accessLevel,
        targetUserId,
        resourceId
      });
    }

    return {
      allowed,
      reason: allowed ? undefined : rule.errorMessage
    };
  }

  /**
   * 检查用户是否可以访问目标用户的数据
   */
  static checkUserDataAccess(
    user: SessionUserInfo | null,
    targetUserId: string,
    resourceType: ResourceType = 'user_profile',
    accessLevel: AccessLevel = 'read'
  ): { allowed: boolean; reason?: string } {
    return this.checkAccess(user, resourceType, accessLevel, targetUserId);
  }

  /**
   * 检查管理员权限
   */
  static checkAdminAccess(
    user: SessionUserInfo | null,
    accessLevel: AccessLevel = 'read'
  ): { allowed: boolean; reason?: string } {
    return this.checkAccess(user, 'admin_data', accessLevel);
  }

  /**
   * 检查系统配置权限
   */
  static checkSystemConfigAccess(
    user: SessionUserInfo | null,
    accessLevel: AccessLevel = 'read'
  ): { allowed: boolean; reason?: string } {
    return this.checkAccess(user, 'system_config', accessLevel);
  }

  /**
   * 验证API请求的数据访问权限
   */
  static validateApiAccess(
    user: SessionUserInfo | null,
    requestData: any,
    resourceType: ResourceType,
    accessLevel: AccessLevel = 'read'
  ): { valid: boolean; error?: string } {
    // 检查基本权限
    const basicCheck = this.checkAccess(user, resourceType, accessLevel);
    if (!basicCheck.allowed) {
      return {
        valid: false,
        error: basicCheck.reason
      };
    }

    // 检查请求数据中的用户ID
    const targetUserId = requestData?.userId || requestData?.targetUserId || requestData?.user_id;
    if (targetUserId) {
      const userDataCheck = this.checkUserDataAccess(user, targetUserId, resourceType, accessLevel);
      if (!userDataCheck.allowed) {
        return {
          valid: false,
          error: userDataCheck.reason
        };
      }
    }

    return { valid: true };
  }

  /**
   * 过滤用户可访问的数据列表
   */
  static filterAccessibleData<T extends { userId?: string; user_id?: string }>(
    user: SessionUserInfo | null,
    dataList: T[],
    resourceType: ResourceType,
    accessLevel: AccessLevel = 'read'
  ): T[] {
    if (!user) return [];

    return dataList.filter(item => {
      const targetUserId = item.userId || item.user_id;
      if (!targetUserId) return false;

      const check = this.checkUserDataAccess(user, targetUserId, resourceType, accessLevel);
      return check.allowed;
    });
  }

  /**
   * 创建数据访问日志
   */
  static logDataAccess(
    user: SessionUserInfo | null,
    resourceType: ResourceType,
    accessLevel: AccessLevel,
    success: boolean,
    targetUserId?: string,
    resourceId?: string,
    details?: any
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      userRole: user?.roles?.[0] || 'guest',
      resourceType,
      accessLevel,
      targetUserId,
      resourceId,
      success,
      details,
      ip: typeof window !== 'undefined' ? 'client-side' : 'server-side'
    };

    // 在生产环境中，这应该发送到日志服务器
    if (process.env.NODE_ENV === 'production') {
      // TODO: 发送到审计日志服务
      console.log('data访问审计日志:', logEntry);
    } else {
      console.log('data访问日志:', logEntry);
    }
  }
}

/**
 * HOC: 数据访问控制装饰器
 */
export function withDataAccessControl(
  resourceType: ResourceType,
  accessLevel: AccessLevel = 'read'
) {
  return function decorator<T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;
    
    descriptor.value = function (this: any, ...args: any[]) {
      // 假设第一个参数是用户对象
      const user = args[0] as SessionUserInfo | null;
      
      // 检查访问权限
      const accessCheck = DataAccessController.checkAccess(user, resourceType, accessLevel);
      
      if (!accessCheck.allowed) {
        throw new Error(`数据访问被拒绝: ${accessCheck.reason}`);
      }
      
      // 记录访问日志
      DataAccessController.logDataAccess(user, resourceType, accessLevel, true);
      
      // 执行原方法
      return method.apply(this, args);
    } as T;
    
    return descriptor;
  };
}

export default DataAccessController;