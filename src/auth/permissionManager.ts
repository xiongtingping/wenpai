/**
 * 🔐 统一权限管理器
 * 负责所有权限检查、角色验证、功能访问控制
 */

import { AuthUser, Permission, Role, PERMISSIONS, SUBSCRIPTION_PLANS } from './types';
import { logger } from '@/utils/logger';

class PermissionManager {
  private static instance: PermissionManager;
  
  // 权限配置映射
  private permissionConfigs: Map<string, any> = new Map();
  
  // 订阅计划功能映射
  private planFeatures: Map<string, string[]> = new Map([
    [SUBSCRIPTION_PLANS.FREE, [
      PERMISSIONS.AUTH_REQUIRED,
      PERMISSIONS.FEATURE_AI_ADAPTER,
      PERMISSIONS.THEME_BASIC
    ]],
    [SUBSCRIPTION_PLANS.PRO, [
      PERMISSIONS.AUTH_REQUIRED,
      PERMISSIONS.FEATURE_AI_ADAPTER,
      PERMISSIONS.FEATURE_BRAND_LIBRARY,
      PERMISSIONS.FEATURE_CREATIVE_STUDIO,
      PERMISSIONS.FEATURE_HOT_TOPICS,
      PERMISSIONS.FEATURE_ADVANCED_AI,
      PERMISSIONS.THEME_BASIC,
      PERMISSIONS.THEME_ADVANCED
    ]],
    [SUBSCRIPTION_PLANS.PREMIUM, [
      PERMISSIONS.AUTH_REQUIRED,
      PERMISSIONS.FEATURE_AI_ADAPTER,
      PERMISSIONS.FEATURE_BRAND_LIBRARY,
      PERMISSIONS.FEATURE_CREATIVE_STUDIO,
      PERMISSIONS.FEATURE_HOT_TOPICS,
      PERMISSIONS.FEATURE_UNLIMITED_USAGE,
      PERMISSIONS.FEATURE_ADVANCED_AI,
      PERMISSIONS.FEATURE_PRIORITY_SUPPORT,
      PERMISSIONS.THEME_BASIC,
      PERMISSIONS.THEME_ADVANCED,
      PERMISSIONS.THEME_PREMIUM
    ]]
  ]);

  private constructor() {
    this.initializePermissionConfigs();
  }

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  // ===== 初始化权限配置 =====

  /**
   * 初始化权限配置
   */
  private initializePermissionConfigs(): void {
    // 基础权限配置
    this.permissionConfigs.set(PERMISSIONS.AUTH_REQUIRED, {
      name: '登录权限',
      description: '需要用户登录才能访问',
      level: 'basic'
    });

    // 功能权限配置
    this.permissionConfigs.set(PERMISSIONS.FEATURE_AI_ADAPTER, {
      name: 'AI内容适配器',
      description: '使用AI内容适配功能',
      level: 'basic',
      quotaLimited: true
    });

    this.permissionConfigs.set(PERMISSIONS.FEATURE_BRAND_LIBRARY, {
      name: '品牌库',
      description: '访问品牌资产管理功能',
      level: 'pro',
      requiresSubscription: true
    });

    this.permissionConfigs.set(PERMISSIONS.FEATURE_CREATIVE_STUDIO, {
      name: '创意工作室',
      description: '使用创意生成工具',
      level: 'pro',
      requiresSubscription: true
    });

    this.permissionConfigs.set(PERMISSIONS.FEATURE_HOT_TOPICS, {
      name: '热点雷达',
      description: '访问热点话题监控',
      level: 'pro',
      requiresSubscription: true
    });

    this.permissionConfigs.set(PERMISSIONS.FEATURE_UNLIMITED_USAGE, {
      name: '无限使用',
      description: '不受使用次数限制',
      level: 'premium',
      requiresSubscription: true
    });

    this.permissionConfigs.set(PERMISSIONS.FEATURE_ADVANCED_AI, {
      name: '高级AI模型',
      description: '使用最新最强的AI模型',
      level: 'pro',
      requiresSubscription: true
    });

    this.permissionConfigs.set(PERMISSIONS.FEATURE_PRIORITY_SUPPORT, {
      name: '优先支持',
      description: '享受优先客户支持',
      level: 'premium',
      requiresSubscription: true
    });

    // 主题权限配置
    this.permissionConfigs.set(PERMISSIONS.THEME_BASIC, {
      name: '基础主题',
      description: '使用基础主题样式',
      level: 'basic'
    });

    this.permissionConfigs.set(PERMISSIONS.THEME_ADVANCED, {
      name: '高级主题',
      description: '使用高级主题样式',
      level: 'pro',
      requiresSubscription: true
    });

    this.permissionConfigs.set(PERMISSIONS.THEME_PREMIUM, {
      name: '专业主题',
      description: '使用专业主题样式',
      level: 'premium',
      requiresSubscription: true
    });
  }

  // ===== 权限检查 =====

  /**
   * 检查用户是否有指定权限
   */
  hasPermission(user: AuthUser | null, permission: string): boolean {
    try {
      // 基础权限检查
      if (permission === PERMISSIONS.AUTH_REQUIRED) {
        return !!user;
      }

      // 如果用户未登录，除了基础权限外都没有
      if (!user) {
        return false;
      }

      // 检查用户明确的权限列表
      if (user.permissions?.includes(permission)) {
        return true;
      }

      // 基于订阅计划检查权限
      const userPlan = user.subscription?.plan || SUBSCRIPTION_PLANS.FREE;
      const planPermissions = this.planFeatures.get(userPlan) || [];
      
      if (planPermissions.includes(permission)) {
        // 如果需要订阅，检查订阅是否有效
        const config = this.permissionConfigs.get(permission);
        if (config?.requiresSubscription) {
          return this.hasValidSubscription(user);
        }
        return true;
      }

      // 检查角色权限
      if (user.roles?.length) {
        return this.checkRolePermissions(user.roles, permission);
      }

      return false;
    } catch (error) {
      logger.error('❌ 权限检查失败:', error);
      return false;
    }
  }

  /**
   * 检查用户是否有指定角色
   */
  hasRole(user: AuthUser | null, role: string): boolean {
    if (!user?.roles) {
      return false;
    }
    return user.roles.includes(role);
  }

  /**
   * 检查用户是否可以使用指定功能
   */
  canUseFeature(user: AuthUser | null, feature: string): boolean {
    // 功能权限检查
    if (!this.hasPermission(user, feature)) {
      return false;
    }

    // 配额检查
    const config = this.permissionConfigs.get(feature);
    if (config?.quotaLimited && user) {
      return this.checkQuota(user, feature);
    }

    return true;
  }

  /**
   * 检查用户订阅状态
   */
  hasValidSubscription(user: AuthUser | null): boolean {
    if (!user?.subscription) {
      return false;
    }

    const { plan, expiresAt } = user.subscription;
    
    // 免费计划不需要检查过期时间
    if (plan === SUBSCRIPTION_PLANS.FREE) {
      return true;
    }

    // 检查订阅是否过期
    if (expiresAt) {
      return new Date(expiresAt) > new Date();
    }

    return false;
  }

  /**
   * 检查用户是否为Pro用户
   */
  isPro(user: AuthUser | null): boolean {
    if (!user?.subscription) {
      return false;
    }
    
    const plan = user.subscription.plan;
    return (plan === SUBSCRIPTION_PLANS.PRO || plan === SUBSCRIPTION_PLANS.PREMIUM) && 
           this.hasValidSubscription(user);
  }

  /**
   * 检查用户是否为Premium用户
   */
  isPremium(user: AuthUser | null): boolean {
    if (!user?.subscription) {
      return false;
    }
    
    return user.subscription.plan === SUBSCRIPTION_PLANS.PREMIUM && 
           this.hasValidSubscription(user);
  }

  // ===== 配额管理 =====

  /**
   * 检查用户配额
   */
  private checkQuota(user: AuthUser, feature: string): boolean {
    if (!user.stats) {
      return false;
    }

    const { monthlyUsage = 0, remainingQuota = 0 } = user.stats;
    
    // Premium用户无限制
    if (this.isPremium(user)) {
      return true;
    }

    // 检查剩余配额
    return remainingQuota > 0;
  }

  /**
   * 消费用户配额
   */
  consumeQuota(user: AuthUser, feature: string, amount: number = 1): boolean {
    if (!user.stats) {
      return false;
    }

    // Premium用户无限制
    if (this.isPremium(user)) {
      return true;
    }

    const { remainingQuota = 0 } = user.stats;
    
    if (remainingQuota >= amount) {
      user.stats.remainingQuota = remainingQuota - amount;
      user.stats.monthlyUsage = (user.stats.monthlyUsage || 0) + amount;
      return true;
    }

    return false;
  }

  // ===== 角色权限检查 =====

  /**
   * 检查角色权限
   */
  private checkRolePermissions(roles: string[], permission: string): boolean {
    // 这里可以实现更复杂的角色权限映射
    // 暂时简化处理
    if (roles.includes('admin') || roles.includes('super_admin')) {
      return true;
    }

    if (roles.includes('pro_user')) {
      const proPermissions = this.planFeatures.get(SUBSCRIPTION_PLANS.PRO) || [];
      return proPermissions.includes(permission);
    }

    if (roles.includes('premium_user')) {
      const premiumPermissions = this.planFeatures.get(SUBSCRIPTION_PLANS.PREMIUM) || [];
      return premiumPermissions.includes(permission);
    }

    return false;
  }

  // ===== 权限信息获取 =====

  /**
   * 获取所有可用权限
   */
  getAllPermissions(): string[] {
    const allPermissions = new Set<string>();
    
    // 添加PERMISSIONS常量中定义的所有权限
    Object.values(PERMISSIONS).forEach(permission => {
      allPermissions.add(permission);
    });
    
    // 添加订阅计划中定义的所有权限
    this.planFeatures.forEach(permissions => {
      permissions.forEach(permission => {
        allPermissions.add(permission);
      });
    });
    
    // 添加常用的管理员权限
    const adminPermissions = [
      'admin:all',
      'super_admin:all',
      'tier:premium',
      'tier:pro',
      'feature:unlimited',
      'creative:unlimited',
      'brand:unlimited',
      'theme:all',
      'cms:edit',
      'user:view',
      'user:edit',
      'system:admin'
    ];
    
    adminPermissions.forEach(permission => {
      allPermissions.add(permission);
    });
    
    return Array.from(allPermissions);
  }

  /**
   * 获取权限配置信息
   */
  getPermissionConfig(permission: string): any {
    return this.permissionConfigs.get(permission);
  }

  /**
   * 获取用户所有权限
   */
  getUserPermissions(user: AuthUser | null): string[] {
    if (!user) {
      return [];
    }

    const permissions: Set<string> = new Set();

    // 添加基础权限
    permissions.add(PERMISSIONS.AUTH_REQUIRED);

    // 添加订阅计划权限
    const userPlan = user.subscription?.plan || SUBSCRIPTION_PLANS.FREE;
    const planPermissions = this.planFeatures.get(userPlan) || [];
    planPermissions.forEach(p => permissions.add(p));

    // 添加明确授予的权限
    if (user.permissions) {
      user.permissions.forEach(p => permissions.add(p));
    }

    // 添加角色权限
    if (user.roles) {
      user.roles.forEach(role => {
        const rolePermissions = this.getRolePermissions(role);
        rolePermissions.forEach(p => permissions.add(p));
      });
    }

    return Array.from(permissions);
  }

  /**
   * 获取角色权限
   */
  private getRolePermissions(role: string): string[] {
    // 这里可以实现角色权限映射
    switch (role) {
      case 'admin':
      case 'super_admin':
        return Object.values(PERMISSIONS);
      case 'pro_user':
        return this.planFeatures.get(SUBSCRIPTION_PLANS.PRO) || [];
      case 'premium_user':
        return this.planFeatures.get(SUBSCRIPTION_PLANS.PREMIUM) || [];
      default:
        return this.planFeatures.get(SUBSCRIPTION_PLANS.FREE) || [];
    }
  }

  // ===== 调试和监控 =====

  /**
   * 获取权限检查日志（仅开发环境）
   */
  getPermissionLog(user: AuthUser | null, permission: string): any {
    if (process.env.NODE_ENV === 'production') {
      return { message: '生产环境不显示权限日志' };
    }

    const hasPermission = this.hasPermission(user, permission);
    const config = this.getPermissionConfig(permission);
    
    return {
      user: user ? { id: user.id, plan: user.subscription?.plan } : null,
      permission,
      hasPermission,
      config,
      userPermissions: this.getUserPermissions(user),
      isPro: this.isPro(user),
      isPremium: this.isPremium(user),
      hasValidSubscription: this.hasValidSubscription(user)
    };
  }
}

// 导出单例实例
export const permissionManager = PermissionManager.getInstance();
export default permissionManager;
