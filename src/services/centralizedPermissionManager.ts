/**
 * 集中权限策略管理器
 * @description 统一管理所有权限策略、规则和决策逻辑
 */

import type { SessionUserInfo } from '@/types/unifiedAuth';
import type { ExtendedPermissionType, PermissionCheckResult } from '@/types/permissions';
import { DataAccessController, type ResourceType, type AccessLevel } from '@/utils/dataAccessControl';
import { UnifiedPermissionService } from './unifiedPermissionService';

/**
 * 权限策略类型
 */
export type PermissionPolicy = 
  | 'allow_all'
  | 'deny_all'
  | 'role_based'
  | 'tier_based'
  | 'custom';

/**
 * 权限决策结果
 */
export interface PermissionDecision {
  granted: boolean;
  policy: PermissionPolicy;
  reason: string;
  fallbackAllowed?: boolean;
  recommendations?: string[];
  auditInfo: {
    timestamp: string;
    userId: string;
    permission: string;
    userTier: string;
    userRole: string;
  };
}

/**
 * 权限策略配置
 */
export interface PolicyConfig {
  name: string;
  description: string;
  policy: PermissionPolicy;
  priority: number;
  conditions?: {
    requiredRole?: string[];
    requiredTier?: string[];
    timeRestrictions?: {
      allowedHours?: [number, number];
      blockedDays?: number[];
    };
    ipRestrictions?: {
      allowedCIDRs?: string[];
      blockedIPs?: string[];
    };
    customCheck?: (user: SessionUserInfo, context?: any) => boolean;
  };
  actions: {
    onGrant?: (user: SessionUserInfo, permission: string) => void;
    onDeny?: (user: SessionUserInfo, permission: string, reason: string) => void;
  };
}

/**
 * 集中权限策略管理器
 */
export class CentralizedPermissionManager {
  private static policies: Map<string, PolicyConfig> = new Map();
  private static defaultPolicy: PermissionPolicy = 'role_based';
  private static auditEnabled: boolean = true;

  /**
   * 初始化默认权限策略
   */
  static initialize(): void {
    this.registerDefaultPolicies();
  }

  /**
   * 注册默认权限策略
   */
  private static registerDefaultPolicies(): void {
    // 管理员全权限策略
    this.registerPolicy({
      name: 'admin_full_access',
      description: '管理员拥有所有权限',
      policy: 'role_based',
      priority: 100,
      conditions: {
        requiredRole: ['admin', 'super_admin']
      },
      actions: {
        onGrant: (user, permission) => {
          console.log(`管理员 ${user.id} 获得权限: ${permission}`);
        }
      }
    });

    // Premium用户策略
    this.registerPolicy({
      name: 'premium_user_policy',
      description: 'Premium用户权限策略',
      policy: 'tier_based',
      priority: 80,
      conditions: {
        requiredTier: ['premium']
      },
      actions: {
        onGrant: (user, permission) => {
          console.log(`Premium用户 ${user.id} 获得权限: ${permission}`);
        }
      }
    });

    // Pro用户策略
    this.registerPolicy({
      name: 'pro_user_policy',
      description: 'Pro用户权限策略',
      policy: 'tier_based',
      priority: 60,
      conditions: {
        requiredTier: ['pro', 'premium']
      },
      actions: {
        onGrant: (user, permission) => {
          console.log(`Pro用户 ${user.id} 获得权限: ${permission}`);
        }
      }
    });

    // 工作时间限制策略
    this.registerPolicy({
      name: 'business_hours_policy',
      description: '工作时间权限限制',
      policy: 'custom',
      priority: 90,
      conditions: {
        timeRestrictions: {
          allowedHours: [9, 18], // 9:00 - 18:00
          blockedDays: [0, 6] // 周日和周六
        },
        customCheck: (user, context) => {
          const now = new Date();
          const hour = now.getHours();
          const day = now.getDay();
          
          // VIP用户和管理员不受时间限制
          if (user.isVip || user.roles?.includes('admin')) {
            return true;
          }
          
          return hour >= 9 && hour <= 18 && day !== 0 && day !== 6;
        }
      },
      actions: {
        onDeny: (user, permission, reason) => {
          console.warn(`用户 ${user.id} 在非工作时间被拒绝权限: ${permission}`);
        }
      }
    });

    // 安全敏感操作策略
    this.registerPolicy({
      name: 'security_sensitive_policy',
      description: '安全敏感操作权限策略',
      policy: 'custom',
      priority: 95,
      conditions: {
        customCheck: (user, context) => {
          const sensitivePermissions = [
            'admin:user-management',
            'admin:system-config',
            'feature:billing',
            'feature:user-data-export'
          ];
          
          if (sensitivePermissions.includes(context?.permission)) {
            // 需要管理员角色且账户验证完整
            return user.roles?.includes('admin') && user.email && user.phone;
          }
          
          return true;
        }
      },
      actions: {
        onDeny: (user, permission, reason) => {
          console.error(`安全敏感操作被拒绝: 用户 ${user.id}, 权限 ${permission}, 原因: ${reason}`);
          // 发送安全警报
          this.sendSecurityAlert(user, permission, reason);
        }
      }
    });

    // 数据访问策略
    this.registerPolicy({
      name: 'data_access_policy',
      description: '数据访问权限策略',
      policy: 'custom',
      priority: 85,
      conditions: {
        customCheck: (user, context) => {
          if (context?.resourceType && context?.targetUserId) {
            const accessCheck = DataAccessController.checkUserDataAccess(
              user,
              context.targetUserId,
              context.resourceType,
              context.accessLevel || 'read'
            );
            return accessCheck.allowed;
          }
          return true;
        }
      },
      actions: {
        onDeny: (user, permission, reason) => {
          console.warn(`数据访问被拒绝: 用户 ${user.id}, 权限 ${permission}, 原因: ${reason}`);
        }
      }
    });
  }

  /**
   * 注册权限策略
   */
  static registerPolicy(config: PolicyConfig): void {
    this.policies.set(config.name, config);
  }

  /**
   * 移除权限策略
   */
  static removePolicy(name: string): boolean {
    return this.policies.delete(name);
  }

  /**
   * 获取权限策略
   */
  static getPolicy(name: string): PolicyConfig | undefined {
    return this.policies.get(name);
  }

  /**
   * 列出所有权限策略
   */
  static listPolicies(): PolicyConfig[] {
    return Array.from(this.policies.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * 执行权限决策
   */
  static async makePermissionDecision(
    user: SessionUserInfo | null,
    permission: ExtendedPermissionType,
    context?: any
  ): Promise<PermissionDecision> {
    const startTime = Date.now();
    
    if (!user) {
      return this.createDecision(false, 'deny_all', '用户未登录', user, permission);
    }

    try {
      // 获取按优先级排序的策略
      const policies = this.listPolicies();
      
      // 逐一评估策略
      for (const policy of policies) {
        const evaluation = await this.evaluatePolicy(policy, user, permission, context);
        
        if (evaluation.applies) {
          const decision = this.createDecision(
            evaluation.granted,
            policy.policy,
            evaluation.reason,
            user,
            permission
          );
          
          // 执行策略动作
          if (evaluation.granted && policy.actions?.onGrant) {
            policy.actions.onGrant(user, permission);
          } else if (!evaluation.granted && policy.actions?.onDeny) {
            policy.actions.onDeny(user, permission, evaluation.reason);
          }
          
          // 记录决策时间
          decision.auditInfo.timestamp = new Date().toISOString();
          
          return decision;
        }
      }

      // 如果没有匹配的策略，使用默认策略
      return await this.applyDefaultPolicy(user, permission, context);
      
    } catch (error) {
      console.error('权限决策过程出错:', error);
      
      return this.createDecision(
        false,
        'deny_all',
        `权限决策失败: ${error instanceof Error ? error.message : '未知错误'}`,
        user,
        permission
      );
    }
  }

  /**
   * 评估单个权限策略
   */
  private static async evaluatePolicy(
    policy: PolicyConfig,
    user: SessionUserInfo,
    permission: ExtendedPermissionType,
    context?: any
  ): Promise<{ applies: boolean; granted: boolean; reason: string }> {
    const conditions = policy.conditions;
    
    if (!conditions) {
      return { applies: true, granted: true, reason: '无条件策略' };
    }

    // 检查角色条件
    if (conditions.requiredRole) {
      const userRoles = user.roles || ['user'];
      const hasRequiredRole = conditions.requiredRole.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        return { applies: false, granted: false, reason: '角色不匹配' };
      }
    }

    // 检查等级条件
    if (conditions.requiredTier) {
      const userTier = user.subscription?.tier || user.vipLevel || 'trial';
      const hasRequiredTier = conditions.requiredTier.includes(userTier);
      
      if (!hasRequiredTier) {
        return { applies: false, granted: false, reason: '订阅等级不匹配' };
      }
    }

    // 检查时间限制
    if (conditions.timeRestrictions) {
      const timeCheck = this.checkTimeRestrictions(conditions.timeRestrictions);
      if (!timeCheck.allowed) {
        return { applies: true, granted: false, reason: timeCheck.reason };
      }
    }

    // 检查IP限制
    if (conditions.ipRestrictions) {
      const ipCheck = this.checkIPRestrictions(conditions.ipRestrictions, context?.clientIP);
      if (!ipCheck.allowed) {
        return { applies: true, granted: false, reason: ipCheck.reason };
      }
    }

    // 检查自定义条件
    if (conditions.customCheck) {
      const customResult = conditions.customCheck(user, { ...context, permission });
      if (!customResult) {
        return { applies: true, granted: false, reason: '自定义条件检查失败' };
      }
    }

    return { applies: true, granted: true, reason: '策略条件满足' };
  }

  /**
   * 应用默认权限策略
   */
  private static async applyDefaultPolicy(
    user: SessionUserInfo,
    permission: ExtendedPermissionType,
    context?: any
  ): Promise<PermissionDecision> {
    try {
      // 使用现有的权限检查逻辑作为默认策略
      const result = UnifiedPermissionService.checkPermission(user, permission);
      
      return this.createDecision(
        result.hasPermission,
        this.defaultPolicy,
        result.hasPermission ? '默认策略允许' : `默认策略拒绝: 需要${result.requiredTier}权限`,
        user,
        permission
      );
    } catch (error) {
      return this.createDecision(
        false,
        'deny_all',
        `默认策略执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
        user,
        permission
      );
    }
  }

  /**
   * 检查时间限制
   */
  private static checkTimeRestrictions(restrictions: NonNullable<PolicyConfig['conditions']>['timeRestrictions']): { allowed: boolean; reason: string } {
    if (!restrictions) return { allowed: true, reason: '' };

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // 检查允许的小时范围
    if (restrictions.allowedHours) {
      const [startHour, endHour] = restrictions.allowedHours;
      if (hour < startHour || hour > endHour) {
        return { allowed: false, reason: `当前时间不在允许范围内 (${startHour}:00-${endHour}:00)` };
      }
    }

    // 检查被禁止的天数
    if (restrictions.blockedDays && restrictions.blockedDays.includes(day)) {
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return { allowed: false, reason: `${dayNames[day]}不允许访问` };
    }

    return { allowed: true, reason: '' };
  }

  /**
   * 检查IP限制
   */
  private static checkIPRestrictions(restrictions: NonNullable<PolicyConfig['conditions']>['ipRestrictions'], clientIP?: string): { allowed: boolean; reason: string } {
    if (!restrictions || !clientIP) return { allowed: true, reason: '' };

    // 检查被禁止的IP
    if (restrictions.blockedIPs && restrictions.blockedIPs.includes(clientIP)) {
      return { allowed: false, reason: `IP地址 ${clientIP} 被禁止访问` };
    }

    // 检查允许的CIDR范围 (简化实现)
    if (restrictions.allowedCIDRs && restrictions.allowedCIDRs.length > 0) {
      // 在实际实现中，这里应该使用专业的CIDR检查库
      const isAllowed = restrictions.allowedCIDRs.some(cidr => {
        // 简化的IP范围检查
        return cidr.includes(clientIP) || cidr === '*';
      });
      
      if (!isAllowed) {
        return { allowed: false, reason: `IP地址 ${clientIP} 不在允许范围内` };
      }
    }

    return { allowed: true, reason: '' };
  }

  /**
   * 创建权限决策结果
   */
  private static createDecision(
    granted: boolean,
    policy: PermissionPolicy,
    reason: string,
    user: SessionUserInfo | null,
    permission: ExtendedPermissionType
  ): PermissionDecision {
    const decision: PermissionDecision = {
      granted,
      policy,
      reason,
      auditInfo: {
        timestamp: new Date().toISOString(),
        userId: user?.id || 'anonymous',
        permission,
        userTier: user?.subscription?.tier || user?.vipLevel || 'trial',
        userRole: user?.roles?.[0] || 'guest'
      }
    };

    // 如果拒绝访问，提供建议
    if (!granted && user) {
      decision.recommendations = this.generateRecommendations(user, permission, reason);
    }

    // 记录审计日志
    if (this.auditEnabled) {
      this.auditPermissionDecision(decision);
    }

    return decision;
  }

  /**
   * 生成权限建议
   */
  private static generateRecommendations(user: SessionUserInfo, permission: ExtendedPermissionType, reason: string): string[] {
    const recommendations: string[] = [];

    if (reason.includes('未登录')) {
      recommendations.push('请先登录您的账户');
    }

    if (reason.includes('等级') || reason.includes('订阅')) {
      recommendations.push('考虑升级到更高级别的订阅计划');
      recommendations.push('查看当前功能限制详情');
    }

    if (reason.includes('角色') || reason.includes('管理员')) {
      recommendations.push('联系系统管理员获取相应权限');
    }

    if (reason.includes('时间')) {
      recommendations.push('请在允许的时间段内重试');
    }

    if (reason.includes('IP')) {
      recommendations.push('检查您的网络连接或联系系统管理员');
    }

    return recommendations;
  }

  /**
   * 发送安全警报
   */
  private static sendSecurityAlert(user: SessionUserInfo, permission: string, reason: string): void {
    const alert = {
      type: 'SECURITY_ALERT',
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
      userId: user.id,
      permission,
      reason,
      userInfo: {
        email: user.email,
        roles: user.roles,
        lastLogin: user.loginTime
      }
    };

    // 在生产环境中，这应该发送到安全监控系统
    console.error('安全警报:', alert);
    
    // TODO: 集成到实际的安全监控系统
  }

  /**
   * 审计权限决策
   */
  private static auditPermissionDecision(decision: PermissionDecision): void {
    const auditLog = {
      timestamp: decision.auditInfo.timestamp,
      userId: decision.auditInfo.userId,
      permission: decision.auditInfo.permission,
      granted: decision.granted,
      policy: decision.policy,
      reason: decision.reason,
      userTier: decision.auditInfo.userTier,
      userRole: decision.auditInfo.userRole
    };

    // 在生产环境中，这应该发送到审计日志系统
    console.log('权限决策审计:', auditLog);
    
    // TODO: 集成到实际的审计日志系统
  }

  /**
   * 批量权限决策
   */
  static async makeBatchPermissionDecisions(
    user: SessionUserInfo | null,
    permissions: ExtendedPermissionType[],
    context?: any
  ): Promise<PermissionDecision[]> {
    const decisions = await Promise.all(
      permissions.map(permission => 
        this.makePermissionDecision(user, permission, context)
      )
    );

    return decisions;
  }

  /**
   * 设置默认策略
   */
  static setDefaultPolicy(policy: PermissionPolicy): void {
    this.defaultPolicy = policy;
  }

  /**
   * 启用/禁用审计
   */
  static setAuditEnabled(enabled: boolean): void {
    this.auditEnabled = enabled;
  }

  /**
   * 获取权限决策统计
   */
  static getDecisionStats(): any {
    // TODO: 实现权限决策统计功能
    return {
      totalDecisions: 0,
      grantedDecisions: 0,
      deniedDecisions: 0,
      policiesUsed: this.policies.size
    };
  }
}

// 初始化权限管理器
CentralizedPermissionManager.initialize();

export default CentralizedPermissionManager;