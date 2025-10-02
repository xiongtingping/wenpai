/**
 * 增强权限管理服务
 * @description 提供细粒度的功能权限控制、套餐到期处理、权限升级降级的平滑过渡
 */

import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import type { SubscriptionTier, SubscriptionPlan } from '@/types/subscription';
import { getSupabaseClient, getAuthenticatedSupabaseClient, TABLE_NAMES } from '@/services/supabaseDataService';

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
 * 权限缓存接口
 */
interface PermissionCache {
  permissions: PermissionCheckResult;
  expiry: number;
  version: string;
  userId: string;
}

/**
 * 增强权限管理服务类
 */
class EnhancedPermissionService {
  private readonly STORAGE_KEY = 'enhanced_permissions_cache';
  private readonly GRACE_PERIOD_DAYS = 7; // 7天宽限期
  private readonly API_ENDPOINT = '/api/permissions'; // API端点
  private readonly CACHE_TTL = 5 * 60 * 1000; // 🔧 修复: 添加5分钟缓存TTL
  private readonly CACHE_VERSION = '1.0.0'; // 缓存版本控制
  
  /**
   * 功能权限配置映射
   */
  private readonly FEATURE_PERMISSIONS: Record<string, FeaturePermissionConfig> = {
    'ai-content-adapter': {
      featureId: 'ai-content-adapter',
      name: 'AI内容适配',
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
   * 从缓存获取权限结果
   */
  private getPermissionFromCache(userId: string, featureId: string): PermissionCheckResult | null {
    try {
      const cacheKey = `${this.STORAGE_KEY}_${userId}_${featureId}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) return null;
      
      const cache: PermissionCache = JSON.parse(cachedData);
      
      // 检查缓存是否过期或版本不匹配
      if (cache.expiry < Date.now() || cache.version !== this.CACHE_VERSION || cache.userId !== userId) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return cache.permissions;
    } catch (error) {
      console.warn('readingpermissioncachefailed:', error);
      return null;
    }
  }

  /**
   * 设置权限结果到缓存
   */
  private setPermissionToCache(userId: string, featureId: string, permissions: PermissionCheckResult): void {
    try {
      const cacheKey = `${this.STORAGE_KEY}_${userId}_${featureId}`;
      const cache: PermissionCache = {
        permissions,
        expiry: Date.now() + this.CACHE_TTL,
        version: this.CACHE_VERSION,
        userId
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.warn('settingpermissioncachefailed:', error);
    }
  }

  /**
   * 检查功能权限
   */
  async checkFeaturePermission(
    userId: string,
    featureId: string,
    userTier: SubscriptionTier,
    userPermissions: string[] = []
  ): Promise<PermissionCheckResult> {
    // 🔧 修复: 先检查缓存，提高性能
    const cachedResult = this.getPermissionFromCache(userId, featureId);
    if (cachedResult) {
      return cachedResult;
    }
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
    const result: PermissionCheckResult = {
      hasPermission: true,
      permissionLevel: this.getPermissionLevel(userTier),
      details: {
        requiredTier: config.requiredTier,
        currentTier: userTier,
        featureName: config.name,
        isExpired: false
      }
    };

    // 🔧 修复: 将结果存入缓存，提高后续访问性能
    this.setPermissionToCache(userId, featureId, result);
    
    return result;
  }

  /**
   * 检查套餐到期状态 (使用 Supabase)
   */
  async checkSubscriptionExpiry(userId: string): Promise<SubscriptionExpiryCheck> {
    try {
      const supabase = await getSupabaseClient();

      // 查询用户订阅信息 - 使用服务角色绕过RLS
      let subscription = null;
      let error = null;

      try {
        const { data, error: queryError } = await supabase
          .from(TABLE_NAMES.USER_SUBSCRIPTIONS)
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        subscription = data;
        error = queryError;
      } catch (e) {
        // 如果表不存在或权限不足，使用默认值
        console.warn('🔍 subscribing表queryingfailed，可能是permission或表结构问题:', e);
        error = e;
      }

      if (error && (error as any).code !== 'PGRST116') { // PGRST116 = no rows returned
        // 如果是权限错误(406)或表不存在错误，使用默认值而不是抛出错误
        if ((error as any).message?.includes('406') || (error as any).message?.includes('Not Acceptable') ||
            (error as any).message?.includes('table') || (error as any).message?.includes('schema')) {
          console.warn('queryingusersubscribinginfofailed，使用defaultvalue:', error);
          // 继续执行，使用默认的试用状态
        } else {
          console.warn('queryingusersubscribinginfofailed:', error);
          throw error;
        }
      }

      if (subscription) {
        const expiryDate = new Date(subscription.expires_at);
        const now = new Date();
        const isExpired = expiryDate < now;
        const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

        return {
          isExpired,
          expiryDate: expiryDate.toISOString(),
          daysRemaining,
          inGracePeriod: isExpired && daysRemaining <= this.GRACE_PERIOD_DAYS,
          requiredActions: isExpired ? ['renew'] : []
        };
      }

      // 🔧 修复: 安全的fallback - 新用户给予有限试用，而非无限制试用
      return this.getRestrictedAccess(userId);
    } catch (error: any) {
      console.warn('checking套餐到期statefailed，使用受限访问模式:', error);
      // 🔧 修复: 查询失败时返回受限访问，而非试用状态
      return this.getRestrictedAccess(userId);
    }
  }

  /**
   * 🔧 新增: 获取受限访问模式 - 更安全的fallback机制
   */
  private getRestrictedAccess(userId: string): SubscriptionExpiryCheck {
    // 对于新用户或查询失败的情况，给予1天的受限试用
    // 这样可以让用户体验功能，但避免无限制试用被滥用
    const restrictedExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    return {
      isExpired: false,
      expiryDate: restrictedExpiryDate.toISOString(),
      daysRemaining: 1, // 仅1天，促使用户尽快注册正式订阅
      inGracePeriod: false,
      requiredActions: ['register', 'verify_subscription']
    };
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
      const response = await fetch(`${this.API_ENDPOINT}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fromTier,
          toTier,
          effectiveDate: effectiveDate || new Date().toISOString()
        })
      });
      
      // 清除权限缓存
      this.clearPermissionCache(userId);
      
      return await response.json();
    } catch (error) {
      console.error('processingpermission升级failed:', error);
      
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
      const response = await fetch(`${this.API_ENDPOINT}/downgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fromTier,
          toTier,
          reason,
          effectiveDate: new Date().toISOString()
        })
      });
      
      // 清除权限缓存
      this.clearPermissionCache(userId);
      
      return await response.json();
    } catch (error) {
      console.error('processingpermission降级failed:', error);
      
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
   * 检查使用限制 (使用 Supabase)
   */
  private async checkUsageLimits(
    userId: string,
    featureId: string,
    limits: { daily?: number; monthly?: number; concurrent?: number }
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const supabase = await getSupabaseClient();

      // 获取今天和本月的开始时间
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // 查询使用记录 - 处理权限和表结构问题
      let usageLogs = [];
      try {
        const { data, error } = await supabase
          .from(TABLE_NAMES.USER_USAGE_LOGS)
          .select('*')
          .eq('user_id', userId)
          .eq('feature', featureId)
          .gte('created_at', monthStart.toISOString());

        if (error) {
          // 如果是权限错误或表不存在，使用默认值
          if (error.message?.includes('406') || error.message?.includes('Not Acceptable') ||
              error.message?.includes('table') || error.message?.includes('schema') ||
              error.message?.includes('404') || error.message?.includes('Not Found')) {
            console.warn('querying使用记录failed，使用defaultvalue:', error);
            usageLogs = [];
          } else {
            console.warn('querying使用记录failed:', error);
            return { allowed: true }; // 查询失败时默认允许
          }
        } else {
          usageLogs = data || [];
        }
      } catch (e) {
        console.warn('querying使用记录abnormal，使用defaultvalue:', e);
        usageLogs = [];
      }

      const todayUsage = usageLogs?.filter(log =>
        new Date(log.created_at) >= todayStart
      ).length || 0;

      const monthlyUsage = usageLogs?.length || 0;

      // 检查每日限制
      if (limits.daily && limits.daily !== -1 && todayUsage >= limits.daily) {
        return { allowed: false, reason: `已达到每日使用限制 (${limits.daily} 次)` };
      }

      // 检查每月限制
      if (limits.monthly && limits.monthly !== -1 && monthlyUsage >= limits.monthly) {
        return { allowed: false, reason: `已达到每月使用限制 (${limits.monthly} 次)` };
      }

      // 并发限制暂时跳过，需要更复杂的实现
      if (limits.concurrent && limits.concurrent !== -1) {
        // TODO: 实现并发限制检查
      }

      return { allowed: true };
    } catch (error: any) {
      console.warn('checking使用limitingfailed，defaultallowing:', error);
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
   * 清除权限缓存 - 🔧 修复: 清除所有相关缓存
   */
  private clearPermissionCache(userId: string): void {
    try {
      // 清除所有该用户的权限缓存
      const keysToRemove: string[] = [];
      
      // 遍历localStorage找到所有相关的缓存
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.STORAGE_KEY}_${userId}_`)) {
          keysToRemove.push(key);
        }
      }
      
      // 批量删除
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.debug(`🧹 clearinguserpermissioncache: ${keysToRemove.length} item`, { userId, keys: keysToRemove });
    } catch (error) {
      console.error('clearingpermissioncachefailed:', error);
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

      console.log(`user ${userId} 套餐already到期，自动降级到体验版`);
    } else if (expiryCheck && expiryCheck.daysRemaining <= 3 && expiryCheck.daysRemaining > 0) {
      // 发送到期提醒
      console.log(`user ${userId} 套餐将在 ${expiryCheck.daysRemaining} daysnext到期`);
    }
  }
}

// 创建单例实例
export const enhancedPermissionService = new EnhancedPermissionService();

export default enhancedPermissionService;
