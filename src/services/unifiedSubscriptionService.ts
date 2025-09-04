/**
 * 统一订阅数据源管理器
 * @description 整合多个订阅数据源，提供一致的订阅状态查询
 * 🔧 修复: 解决多套订阅数据源不一致问题
 */

import { getSupabaseClient, TABLE_NAMES } from '@/services/supabaseDataService';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import type { SubscriptionTier, UserSubscription } from '@/types/subscription';
import { logger } from '@/utils/logger';

/**
 * 订阅状态查询结果
 */
export interface SubscriptionStatusResult {
  /** 用户ID */
  userId: string;
  /** 当前套餐类型 */
  tier: SubscriptionTier;
  /** 是否已到期 */
  isExpired: boolean;
  /** 到期时间 */
  expiresAt?: string;
  /** 剩余天数 */
  daysRemaining: number;
  /** 数据来源 */
  source: 'supabase' | 'user_profile' | 'fallback';
  /** 最后更新时间 */
  lastUpdated: string;
  /** 完整订阅信息 */
  subscription?: UserSubscription;
}

/**
 * 统一订阅数据源管理器
 */
class UnifiedSubscriptionService {
  private readonly CACHE_KEY = 'unified_subscription_cache';
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2分钟缓存TTL
  private readonly GRACE_PERIOD_DAYS = 7; // 7天宽限期

  /**
   * 获取用户订阅状态 - 统一入口
   * 优先级: Supabase > 用户资料推断 > 默认试用
   */
  async getUserSubscriptionStatus(userId: string, userProfile?: any): Promise<SubscriptionStatusResult> {
    try {
      // 1. 优先从缓存获取
      const cached = this.getFromCache(userId);
      if (cached) {
        return cached;
      }

      // 2. 优先从Supabase获取真实订阅数据
      const supabaseResult = await this.getFromSupabase(userId);
      if (supabaseResult) {
        this.setToCache(userId, supabaseResult);
        return supabaseResult;
      }

      // 3. 从用户资料推断
      const profileResult = this.inferFromUserProfile(userId, userProfile);
      if (profileResult) {
        this.setToCache(userId, profileResult);
        return profileResult;
      }

      // 4. 默认试用状态（安全fallback）
      const fallbackResult = this.getTrialFallback(userId);
      this.setToCache(userId, fallbackResult);
      return fallbackResult;

    } catch (error) {
      logger.error('获取用户订阅状态失败:', error);
      
      // 出错时返回受限访问
      return this.getRestrictedFallback(userId);
    }
  }

  /**
   * 从Supabase获取订阅数据
   */
  private async getFromSupabase(userId: string): Promise<SubscriptionStatusResult | null> {
    try {
      const client = await getSupabaseClient();
      
      const { data: subscription, error } = await client
        .from(TABLE_NAMES.USER_SUBSCRIPTIONS)
        .select('*')
        .eq('user_id', userId)
        .eq('payment_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Supabase订阅查询失败:', error);
        return null;
      }

      if (!subscription) {
        return null;
      }

      // 计算到期状态
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();
      const isExpired = expiresAt < now;
      const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

      return {
        userId,
        tier: subscription.subscription_type as SubscriptionTier,
        isExpired,
        expiresAt: subscription.expires_at,
        daysRemaining,
        source: 'supabase',
        lastUpdated: new Date().toISOString(),
        subscription: {
          tier: subscription.subscription_type as SubscriptionTier,
          period: this.inferPeriod(subscription),
          startDate: new Date(subscription.started_at || subscription.created_at),
          endDate: new Date(subscription.expires_at),
          autoRenew: subscription.auto_renew || false,
          registrationDate: new Date(subscription.created_at)
        }
      };
    } catch (error) {
      console.warn('从Supabase获取订阅失败:', error);
      return null;
    }
  }

  /**
   * 从用户资料推断订阅状态
   */
  private inferFromUserProfile(userId: string, userProfile?: any): SubscriptionStatusResult | null {
    if (!userProfile) return null;

    let tier: SubscriptionTier = 'trial';

    // 多种推断策略
    if (userProfile.subscription?.tier) {
      tier = userProfile.subscription.tier;
    } else if (userProfile.vipLevel === 'premium') {
      tier = 'premium';
    } else if (userProfile.vipLevel === 'pro' || userProfile.isVip) {
      tier = 'pro';
    } else if (userProfile.permissions?.includes('tier:premium')) {
      tier = 'premium';
    } else if (userProfile.permissions?.includes('tier:pro')) {
      tier = 'pro';
    }

    // 推断到期时间
    const expiresAt = userProfile.subscription?.expiresAt || 
                     userProfile.vipExpiresAt ||
                     new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const expiryDate = new Date(expiresAt);
    const isExpired = expiryDate < new Date();
    const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

    return {
      userId,
      tier,
      isExpired,
      expiresAt,
      daysRemaining,
      source: 'user_profile',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 获取试用版fallback
   */
  private getTrialFallback(userId: string): SubscriptionStatusResult {
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天试用

    return {
      userId,
      tier: 'trial',
      isExpired: false,
      expiresAt: trialEnd.toISOString(),
      daysRemaining: 7,
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 获取受限访问fallback（查询失败时）
   */
  private getRestrictedFallback(userId: string): SubscriptionStatusResult {
    const restrictedEnd = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1天受限访问

    return {
      userId,
      tier: 'trial',
      isExpired: false,
      expiresAt: restrictedEnd.toISOString(),
      daysRemaining: 1, // 仅1天，促使用户联系客服
      source: 'fallback',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 推断订阅周期
   */
  private inferPeriod(subscription: any): 'monthly' | 'yearly' {
    if (subscription.period) return subscription.period;

    const startDate = new Date(subscription.started_at || subscription.created_at);
    const endDate = new Date(subscription.expires_at);
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays > 300 ? 'yearly' : 'monthly';
  }

  /**
   * 检查用户是否有特定功能权限
   */
  async hasFeaturePermission(userId: string, featureId: string, userProfile?: any): Promise<boolean> {
    const status = await this.getUserSubscriptionStatus(userId, userProfile);
    
    // 已到期时只有宽限期内才有权限
    if (status.isExpired && status.daysRemaining <= 0) {
      return false;
    }

    // 根据功能要求检查套餐等级
    const featureRequirements: Record<string, SubscriptionTier> = {
      'ai-content-adapter': 'trial',
      'creative-studio': 'pro',
      'brand-library': 'premium',
      'advanced-ai-models': 'pro',
      'unlimited-usage': 'premium',
      'api-access': 'premium'
    };

    const requiredTier = featureRequirements[featureId];
    if (!requiredTier) return true; // 未知功能默认允许

    const tierLevels = { trial: 1, pro: 2, premium: 3 };
    return tierLevels[status.tier] >= tierLevels[requiredTier];
  }

  /**
   * 获取套餐限额配置
   */
  getSubscriptionLimits(tier: SubscriptionTier) {
    try {
      const plan = getSubscriptionPlan(tier);
      return plan.limits;
    } catch (error) {
      console.warn(`获取套餐${tier}限额配置失败:`, error);
      
      // fallback配置
      const fallbackLimits = {
        trial: { adaptUsageLimit: 10, tokenLimit: 100000, availableModels: ['GPT-4o mini'], availableFeatures: ['基础功能'] },
        pro: { adaptUsageLimit: 30, tokenLimit: 200000, availableModels: ['GPT-4o', 'GPT-4o mini'], availableFeatures: ['高级功能'] },
        premium: { adaptUsageLimit: -1, tokenLimit: 500000, availableModels: ['GPT-4o', 'GPT-4o mini'], availableFeatures: ['全部功能'] }
      };
      
      return fallbackLimits[tier];
    }
  }

  /**
   * 刷新用户订阅状态
   */
  async refreshUserSubscription(userId: string): Promise<void> {
    this.clearCache(userId);
    await this.getUserSubscriptionStatus(userId);
  }

  /**
   * 缓存管理
   */
  private getFromCache(userId: string): SubscriptionStatusResult | null {
    try {
      const cacheKey = `${this.CACHE_KEY}_${userId}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      if (data.expiry < Date.now()) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return data.result;
    } catch (error) {
      console.warn('读取订阅缓存失败:', error);
      return null;
    }
  }

  private setToCache(userId: string, result: SubscriptionStatusResult): void {
    try {
      const cacheKey = `${this.CACHE_KEY}_${userId}`;
      const cacheData = {
        result,
        expiry: Date.now() + this.CACHE_TTL
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('设置订阅缓存失败:', error);
    }
  }

  private clearCache(userId: string): void {
    try {
      const cacheKey = `${this.CACHE_KEY}_${userId}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('清除订阅缓存失败:', error);
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_KEY)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.debug(`🧹 清除订阅缓存: ${keysToRemove.length} 项`);
    } catch (error) {
      console.warn('清除所有订阅缓存失败:', error);
    }
  }
}

// 创建单例实例
export const unifiedSubscriptionService = new UnifiedSubscriptionService();

export default unifiedSubscriptionService;