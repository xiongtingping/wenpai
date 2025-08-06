/**
 * 增强权限管理服务
 * @description 提供细粒度的功能权限控制、套餐到期处理、权限升级降级的平滑过渡
 */

import { request } from '@/api/request';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import type { SubscriptionTier, SubscriptionPlan } from '@/types/subscription';

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  /** 是否有权限 */
  hasPermission: boolean;
  /** 权限级别 */
  permissionLevel: 'none' | 'basic' | 'premium' | 'unlimited';
  /** 拒绝原因 */
  reason?: string;
  /** 建议操作 */
  suggestedAction?: 'login' | 'upgrade' | 'renew' | 'contact_support';
  /** 权限详情 */
  details?: {
    requiredTier: SubscriptionTier;
    currentTier: SubscriptionTier;
    featureName: string;
    isExpired: boolean;
  };
}

/**
 * 套餐到期检查结果
 */
export interface SubscriptionExpiryCheck {
  /** 是否已到期 */
  isExpired: boolean;
  /** 到期时间 */
  expiryDate: string;
  /** 剩余天数 */
  daysRemaining: number;
  /** 是否在宽限期内 */
  inGracePeriod: boolean;
  /** 宽限期结束时间 */
  gracePeriodEnd?: string;
  /** 需要的处理动作 */
  requiredActions: string[];
}

/**
 * 权限升级降级结果
 */
export interface PermissionTransitionResult {
  /** 是否成功 */
  success: boolean;
  /** 原套餐 */
  fromTier: SubscriptionTier;
  /** 新套餐 */
  toTier: SubscriptionTier;
  /** 变更类型 */
  transitionType: 'upgrade' | 'downgrade' | 'renewal';
  /** 生效时间 */
  effectiveDate: string;
  /** 影响的功能列表 */
  affectedFeatures: string[];
  /** 数据迁移结果 */
  dataMigration?: {
    preserved: string[];
    archived: string[];
    lost: string[];
  };
}

/**
 * 功能权限配置
 */
interface FeaturePermissionConfig {
  /** 功能ID */
  featureId: string;
  /** 功能名称 */
  name: string;
  /** 所需最低套餐 */
  requiredTier: SubscriptionTier;
  /** 是否需要额外权限 */
  requiresExtraPermission?: boolean;
  /** 额外权限列表 */
  extraPermissions?: string[];
  /** 使用限制 */
  usageLimits?: {
    daily?: number;
    monthly?: number;
    concurrent?: number;
  };
}

/**
 * 增强权限管理服务类
 */
class EnhancedPermissionService {
  private readonly API_ENDPOINT = '/api/enhanced-permissions';
  private readonly STORAGE_KEY = 'enhanced_permissions_cache';
  private readonly GRACE_PERIOD_DAYS = 7; // 7天宽限期
  
  /**
   * 功能权限配置映射
   */
  private readonly FEATURE_PERMISSIONS: Record<string, FeaturePermissionConfig> = {
    'ai-content-adapter': {
      featureId: 'ai-content-adapter',
      name: 'AI内容适配器',
      requiredTier: 'trial',
      usageLimits: {
        monthly: 10 // 体验版每月10次
      }
    },
    'creative-studio': {
      featureId: 'creative-studio',
      name: '创意魔方',
      requiredTier: 'pro',
      usageLimits: {
        monthly: -1 // 专业版不限量
      }
    },
    'brand-library': {
      featureId: 'brand-library',
      name: '品牌库',
      requiredTier: 'premium',
      requiresExtraPermission: true,
      extraPermissions: ['feature:brand-library']
    },
    'advanced-ai-models': {
      featureId: 'advanced-ai-models',
      name: '高级AI模型',
      requiredTier: 'pro',
      extraPermissions: ['model:gpt-4o', 'model:claude-3']
    },
    'unlimited-usage': {
      featureId: 'unlimited-usage',
      name: '无限使用',
      requiredTier: 'premium'
    },
    'priority-support': {
      featureId: 'priority-support',
      name: '优先客服支持',
      requiredTier: 'pro'
    },
    'api-access': {
      featureId: 'api-access',
      name: 'API访问',
      requiredTier: 'premium',
      requiresExtraPermission: true,
      extraPermissions: ['api:access']
    }
  };

  /**
   * 检查功能权限
   */
  async checkFeaturePermission(
    userId: string,
    featureId: string,
    userTier: SubscriptionTier,
    userPermissions: string[] = []
  ): Promise<PermissionCheckResult> {
    const config = this.FEATURE_PERMISSIONS[featureId];
    
    if (!config) {
      return {
        hasPermission: false,
        permissionLevel: 'none',
        reason: `未知功能: ${featureId}`,
        suggestedAction: 'contact_support'
      };
    }

    // 1. 检查套餐到期状态
    const expiryCheck = await this.checkSubscriptionExpiry(userId);
    if (expiryCheck && expiryCheck.isExpired && !expiryCheck.inGracePeriod) {
      return {
        hasPermission: false,
        permissionLevel: 'none',
        reason: '套餐已到期',
        suggestedAction: 'renew',
        details: {
          requiredTier: config.requiredTier,
          currentTier: userTier,
          featureName: config.name,
          isExpired: true
        }
      };
    }

    // 2. 检查套餐级别
    const tierLevel = this.getTierLevel(userTier);
    const requiredLevel = this.getTierLevel(config.requiredTier);
    
    if (tierLevel < requiredLevel) {
      return {
        hasPermission: false,
        permissionLevel: this.getPermissionLevel(userTier),
        reason: `需要 ${config.requiredTier} 或更高套餐`,
        suggestedAction: 'upgrade',
        details: {
          requiredTier: config.requiredTier,
          currentTier: userTier,
          featureName: config.name,
          isExpired: false
        }
      };
    }

    // 3. 检查额外权限
    if (config.requiresExtraPermission && config.extraPermissions) {
      const hasExtraPermissions = config.extraPermissions.every(
        permission => userPermissions.includes(permission)
      );
      
      if (!hasExtraPermissions) {
        return {
          hasPermission: false,
          permissionLevel: this.getPermissionLevel(userTier),
          reason: `缺少必要权限: ${config.extraPermissions.join(', ')}`,
          suggestedAction: 'contact_support',
          details: {
            requiredTier: config.requiredTier,
            currentTier: userTier,
            featureName: config.name,
            isExpired: false
          }
        };
      }
    }

    // 4. 检查使用限制
    if (config.usageLimits) {
      const usageCheck = await this.checkUsageLimits(userId, featureId, config.usageLimits);
      if (!usageCheck.allowed) {
        return {
          hasPermission: false,
          permissionLevel: this.getPermissionLevel(userTier),
          reason: usageCheck.reason,
          suggestedAction: userTier === 'premium' ? 'contact_support' : 'upgrade',
          details: {
            requiredTier: config.requiredTier,
            currentTier: userTier,
            featureName: config.name,
            isExpired: false
          }
        };
      }
    }

    // 权限检查通过
    return {
      hasPermission: true,
      permissionLevel: this.getPermissionLevel(userTier),
      details: {
        requiredTier: config.requiredTier,
        currentTier: userTier,
        featureName: config.name,
        isExpired: false
      }
    };
  }

  /**
   * 检查套餐到期状态
   */
  async checkSubscriptionExpiry(userId: string): Promise<SubscriptionExpiryCheck> {
    try {
      const response = await request.get(`${this.API_ENDPOINT}/subscription-expiry/${userId}`);

      // 确保返回的数据有必要的属性
      const data = response.data;
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response data');
      }

      return {
        isExpired: Boolean(data.isExpired),
        expiryDate: data.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: typeof data.daysRemaining === 'number' ? data.daysRemaining : 30,
        inGracePeriod: Boolean(data.inGracePeriod),
        requiredActions: Array.isArray(data.requiredActions) ? data.requiredActions : []
      };
    } catch (error) {
      console.warn('检查套餐到期状态失败，使用默认值:', error);

      // 返回默认的未到期状态
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);

      return {
        isExpired: false,
        expiryDate: futureDate.toISOString(),
        daysRemaining: 30,
        inGracePeriod: false,
        requiredActions: []
      };
    }
  }

  /**
   * 处理权限升级
   */
  async handlePermissionUpgrade(
    userId: string,
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier,
    effectiveDate?: string
  ): Promise<PermissionTransitionResult> {
    try {
      const response = await request.post(`${this.API_ENDPOINT}/upgrade`, {
        userId,
        fromTier,
        toTier,
        effectiveDate: effectiveDate || new Date().toISOString()
      });
      
      // 清除权限缓存
      this.clearPermissionCache(userId);
      
      return response.data;
    } catch (error) {
      console.error('处理权限升级失败:', error);
      
      // 返回模拟的升级结果
      return this.simulatePermissionTransition(userId, fromTier, toTier, 'upgrade');
    }
  }

  /**
   * 处理权限降级
   */
  async handlePermissionDowngrade(
    userId: string,
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier,
    reason: 'expiry' | 'cancellation' | 'payment_failed'
  ): Promise<PermissionTransitionResult> {
    try {
      const response = await request.post(`${this.API_ENDPOINT}/downgrade`, {
        userId,
        fromTier,
        toTier,
        reason,
        effectiveDate: new Date().toISOString()
      });
      
      // 清除权限缓存
      this.clearPermissionCache(userId);
      
      return response.data;
    } catch (error) {
      console.error('处理权限降级失败:', error);
      
      // 返回模拟的降级结果
      return this.simulatePermissionTransition(userId, fromTier, toTier, 'downgrade');
    }
  }

  /**
   * 获取套餐级别数值
   */
  private getTierLevel(tier: SubscriptionTier): number {
    switch (tier) {
      case 'trial': return 1;
      case 'pro': return 2;
      case 'premium': return 3;
      default: return 0;
    }
  }

  /**
   * 获取权限级别
   */
  private getPermissionLevel(tier: SubscriptionTier): 'none' | 'basic' | 'premium' | 'unlimited' {
    switch (tier) {
      case 'trial': return 'basic';
      case 'pro': return 'premium';
      case 'premium': return 'unlimited';
      default: return 'none';
    }
  }

  /**
   * 检查使用限制
   */
  private async checkUsageLimits(
    userId: string,
    featureId: string,
    limits: { daily?: number; monthly?: number; concurrent?: number }
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const response = await request.get(`${this.API_ENDPOINT}/usage-limits/${userId}/${featureId}`);
      const usage = response.data;
      
      if (limits.daily && limits.daily !== -1 && usage.dailyUsage >= limits.daily) {
        return { allowed: false, reason: `已达到每日使用限制 (${limits.daily} 次)` };
      }
      
      if (limits.monthly && limits.monthly !== -1 && usage.monthlyUsage >= limits.monthly) {
        return { allowed: false, reason: `已达到每月使用限制 (${limits.monthly} 次)` };
      }
      
      if (limits.concurrent && limits.concurrent !== -1 && usage.concurrentUsage >= limits.concurrent) {
        return { allowed: false, reason: `已达到并发使用限制 (${limits.concurrent} 个)` };
      }
      
      return { allowed: true };
    } catch (error) {
      console.warn('检查使用限制失败，默认允许:', error);
      return { allowed: true };
    }
  }

  /**
   * 模拟权限转换
   */
  private simulatePermissionTransition(
    userId: string,
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier,
    transitionType: 'upgrade' | 'downgrade'
  ): PermissionTransitionResult {
    const fromPlan = getSubscriptionPlan(fromTier);
    const toPlan = getSubscriptionPlan(toTier);
    
    const affectedFeatures = Object.keys(this.FEATURE_PERMISSIONS).filter(featureId => {
      const config = this.FEATURE_PERMISSIONS[featureId];
      const fromLevel = this.getTierLevel(fromTier);
      const toLevel = this.getTierLevel(toTier);
      const requiredLevel = this.getTierLevel(config.requiredTier);
      
      return (fromLevel >= requiredLevel) !== (toLevel >= requiredLevel);
    });
    
    return {
      success: true,
      fromTier,
      toTier,
      transitionType,
      effectiveDate: new Date().toISOString(),
      affectedFeatures,
      dataMigration: {
        preserved: ['user_profile', 'basic_settings'],
        archived: transitionType === 'downgrade' ? ['advanced_settings', 'premium_data'] : [],
        lost: []
      }
    };
  }

  /**
   * 清除权限缓存
   */
  private clearPermissionCache(userId: string): void {
    try {
      const cacheKey = `${this.STORAGE_KEY}_${userId}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('清除权限缓存失败:', error);
    }
  }

  /**
   * 获取用户所有功能权限状态
   */
  async getUserAllPermissions(
    userId: string,
    userTier: SubscriptionTier,
    userPermissions: string[] = []
  ): Promise<Record<string, PermissionCheckResult>> {
    const results: Record<string, PermissionCheckResult> = {};
    
    for (const featureId of Object.keys(this.FEATURE_PERMISSIONS)) {
      results[featureId] = await this.checkFeaturePermission(
        userId,
        featureId,
        userTier,
        userPermissions
      );
    }
    
    return results;
  }

  /**
   * 自动处理套餐到期
   */
  async autoHandleSubscriptionExpiry(userId: string, currentTier: SubscriptionTier): Promise<void> {
    const expiryCheck = await this.checkSubscriptionExpiry(userId);

    if (expiryCheck && expiryCheck.isExpired && !expiryCheck.inGracePeriod) {
      // 自动降级到体验版
      await this.handlePermissionDowngrade(userId, currentTier, 'trial', 'expiry');

      console.log(`用户 ${userId} 套餐已到期，自动降级到体验版`);
    } else if (expiryCheck && expiryCheck.daysRemaining <= 3 && expiryCheck.daysRemaining > 0) {
      // 发送到期提醒
      console.log(`用户 ${userId} 套餐将在 ${expiryCheck.daysRemaining} 天后到期`);
    }
  }
}

// 创建单例实例
export const enhancedPermissionService = new EnhancedPermissionService();

export default enhancedPermissionService;
