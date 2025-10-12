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
 * 🔧 2025-01 重构: 添加跨Tab同步和缓存版本控制
 */
class UnifiedSubscriptionService {
  private readonly CACHE_KEY = 'unified_subscription_cache';
  private readonly CACHE_VERSION = 2; // 🔧 新增: 缓存版本号
  private readonly CACHE_TTL = 10 * 60 * 1000; // 🔧 优化: 10分钟缓存TTL（从2分钟增加）
  private readonly GRACE_PERIOD_DAYS = 7; // 7天宽限期

  // 🔧 新增: 内存缓存，比localStorage更快
  private memoryCache: Map<string, { result: SubscriptionStatusResult; expiry: number }> = new Map();

  // 🔧 新增: 正在进行的查询，避免重复请求
  private pendingQueries: Map<string, Promise<SubscriptionStatusResult>> = new Map();

  // 🔧 新增: 跨Tab同步监听器
  private storageListener: ((event: StorageEvent) => void) | null = null;

  // 🔧 性能警告去重: 记录已警告过的慢查询用户，避免重复输出
  private slowQueryWarned: Set<string> = new Set();

  // 🔧 FIX: 防止无限查询的请求节流
  private queryThrottle: Map<string, number> = new Map();
  private readonly THROTTLE_MS = 1000; // 每个用户1秒内最多查询1次

  constructor() {
    // 🔧 新增: 设置跨Tab同步监听
    this.setupCrossTabSync();
  }

  /**
   * 获取用户订阅状态 - 统一入口
   * 优先级: 内存缓存 > localStorage缓存 > Supabase > 用户资料推断 > 默认试用
   *
   * 🔧 优化:
   * 1. 添加内存缓存（最快）
   * 2. 防止重复查询（请求去重）
   * 3. 增加缓存时间到10分钟
   */
  async getUserSubscriptionStatus(userId: string, userProfile?: any): Promise<SubscriptionStatusResult> {
    try {
      const startTime = Date.now();

      // 🔧 优化1: 优先从内存缓存获取（最快，无IO）
      const memCached = this.getFromMemoryCache(userId);
      if (memCached) {
        logger.debug('✅ 从内存缓存获取订阅状态', {
          userId,
          duration: Date.now() - startTime + 'ms'
        });
        return memCached;
      }

      // 🔧 优化2: 从localStorage缓存获取（较快）
      const diskCached = this.getFromDiskCache(userId);
      if (diskCached) {
        // 同时更新内存缓存
        this.setToMemoryCache(userId, diskCached);
        logger.debug('✅ 从磁盘缓存获取订阅状态', {
          userId,
          duration: Date.now() - startTime + 'ms'
        });
        return diskCached;
      }

      // 🔧 优化3: 检查是否有正在进行的查询，避免重复请求
      const pendingQuery = this.pendingQueries.get(userId);
      if (pendingQuery) {
        logger.debug('⏳ 等待正在进行的订阅查询', { userId });
        return await pendingQuery;
      }

      // 🔧 优化4: 创建新的查询Promise并缓存
      const queryPromise = this.fetchSubscriptionStatus(userId, userProfile);
      this.pendingQueries.set(userId, queryPromise);

      try {
        const result = await queryPromise;
        logger.info('✅ 订阅状态查询完成', {
          userId,
          tier: result.tier,
          source: result.source,
          duration: Date.now() - startTime + 'ms'
        });
        return result;
      } finally {
        // 查询完成后清除pending状态
        this.pendingQueries.delete(userId);
      }

    } catch (error) {
      logger.error('获取用户订阅状态失败:', error);

      // 出错时返回受限访问
      return this.getRestrictedFallback(userId);
    }
  }

  /**
   * 🔧 新增: 实际执行订阅状态查询的方法
   */
  private async fetchSubscriptionStatus(userId: string, userProfile?: any): Promise<SubscriptionStatusResult> {
    // 1. 优先从Supabase获取真实订阅数据
    const supabaseResult = await this.getFromSupabase(userId);
    if (supabaseResult) {
      this.setToCache(userId, supabaseResult);
      return supabaseResult;
    }

    // 2. 从用户资料推断
    const profileResult = this.inferFromUserProfile(userId, userProfile);
    if (profileResult) {
      this.setToCache(userId, profileResult);
      return profileResult;
    }

    // 3. 默认试用状态（安全fallback）
    const fallbackResult = this.getTrialFallback(userId);
    this.setToCache(userId, fallbackResult);
    return fallbackResult;
  }

  /**
   * 从Supabase获取订阅数据
   * 🔧 优化:
   * 1. 只查询必要字段，减少数据传输
   * 2. 添加性能日志
   * 3. 建议添加数据库索引: (user_id, status, created_at)
   */
  private async getFromSupabase(userId: string): Promise<SubscriptionStatusResult | null> {
    try {
      // 🔧 FIX: 检查节流，防止同一用户短时间内重复查询
      const lastQuery = this.queryThrottle.get(userId);
      const now = Date.now();

      if (lastQuery && now - lastQuery < this.THROTTLE_MS) {
        logger.warn('🚫 查询被节流拦截，防止无限循环', {
          userId,
          timeSinceLastQuery: now - lastQuery,
          throttleMs: this.THROTTLE_MS
        });
        return null;
      }

      // 记录本次查询时间
      this.queryThrottle.set(userId, now);

      const startTime = Date.now();
      const client = await getSupabaseClient();

      // 🔧 优化: 只查询必要字段，减少数据传输量
      const { data: subscription, error } = await client
        .from(TABLE_NAMES.USER_SUBSCRIPTIONS)
        .select('user_id, tier, status, expires_at, created_at, updated_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const duration = Date.now() - startTime;

      if (error) {
        logger.warn('Supabase订阅查询失败:', { error, duration: duration + 'ms' });
        return null;
      }

      // 🔧 性能监控: 记录慢查询（每个用户只警告一次，避免控制台污染）
      if (duration > 1000) {
        if (!this.slowQueryWarned.has(userId)) {
          this.slowQueryWarned.add(userId);
          logger.warn('⚠️ Supabase订阅查询较慢', {
            userId,
            duration: duration + 'ms',
            suggestion: '建议添加数据库索引: CREATE INDEX idx_user_subscriptions_lookup ON user_subscriptions(user_id, status, created_at DESC);',
            note: '此警告每个用户只显示一次'
          });
        }
      } else {
        logger.debug('✅ Supabase订阅查询完成', { userId, duration: duration + 'ms' });
      }

      if (!subscription) {
        return null;
      }

      // 统一/兼容列名：支持 tier 或 subscription_type
      const rawTier = (subscription as any).tier || (subscription as any).subscription_type;
      const tier: SubscriptionTier = (rawTier === 'premium') ? 'premium' : (rawTier === 'pro' || rawTier === 'professional') ? 'pro' : 'trial';

      // 计算到期状态
      const expiresAt = new Date((subscription as any).expires_at);
      const currentDate = new Date();
      const isExpired = expiresAt < currentDate;
      const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)));

      return {
        userId,
        tier,
        isExpired,
        expiresAt: (subscription as any).expires_at,
        daysRemaining,
        source: 'supabase',
        lastUpdated: new Date().toISOString(),
        subscription: {
          tier,
          period: this.inferPeriod(subscription),
          startDate: new Date((subscription as any).started_at || (subscription as any).created_at),
          endDate: new Date((subscription as any).expires_at),
          autoRenew: (subscription as any).auto_renew || false,
          registrationDate: new Date((subscription as any).created_at)
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
    // 🔧 清除正在进行的查询
    this.pendingQueries.delete(userId);
    await this.getUserSubscriptionStatus(userId);
  }

  /**
   * 🆕 强制刷新订阅状态（支付成功后使用）
   *
   * 特点：
   * - 清除所有缓存
   * - 等待数据库更新
   * - 重试机制确保获取到最新数据
   *
   * @param userId 用户ID
   * @param expectedTier 期望的订阅等级（可选，用于验证）
   * @param maxRetries 最大重试次数
   */
  async forceRefreshAfterPayment(
    userId: string,
    expectedTier?: string,
    maxRetries: number = 5
  ): Promise<SubscriptionStatusResult> {
    logger.info('🚀 支付后强制刷新订阅状态', {
      userId,
      expectedTier,
      maxRetries
    });

    // 1. 清除所有缓存
    this.clearCache(userId);
    this.pendingQueries.delete(userId);
    logger.info('🧹 已清除所有缓存');

    // 2. 等待数据库更新（支付回调可能有延迟）
    const initialWait = 2000; // 2秒
    logger.info(`⏳ 等待${initialWait}ms，确保数据库已更新`);
    await new Promise(resolve => setTimeout(resolve, initialWait));

    // 3. 重试查询，直到获取到最新数据
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      logger.info(`🔄 第${attempt}/${maxRetries}次查询订阅状态`);

      // 清除缓存，确保查询数据库
      this.clearCache(userId);
      this.pendingQueries.delete(userId);

      // 查询最新状态
      const result = await this.getUserSubscriptionStatus(userId);

      logger.info(`📊 查询结果:`, {
        attempt,
        tier: result.tier,
        isExpired: result.isExpired,
        expiresAt: result.expiresAt,
        expectedTier
      });

      // 如果指定了期望的等级，验证是否匹配
      if (expectedTier) {
        if (result.tier === expectedTier && !result.isExpired) {
          logger.info('✅ 订阅状态已更新为期望等级', {
            tier: result.tier,
            expectedTier
          });
          return result;
        } else {
          logger.warn('⚠️ 订阅状态尚未更新', {
            currentTier: result.tier,
            expectedTier,
            isExpired: result.isExpired,
            attempt
          });
        }
      } else {
        // 如果没有指定期望等级，检查是否不是trial
        if (result.tier !== 'trial' && !result.isExpired) {
          logger.info('✅ 订阅状态已更新（非试用）', {
            tier: result.tier
          });
          return result;
        }
      }

      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        const retryWait = 1000 * attempt; // 递增等待：1s, 2s, 3s, 4s
        logger.info(`⏳ 等待${retryWait}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, retryWait));
      }
    }

    // 所有重试都失败，返回最后一次查询结果
    logger.warn('⚠️ 达到最大重试次数，返回当前状态');
    const finalResult = await this.getUserSubscriptionStatus(userId);
    return finalResult;
  }

  /**
   * 🔧 新增: 预加载订阅状态
   * 在用户登录后立即调用，提前加载订阅信息到缓存
   */
  async preloadSubscriptionStatus(userId: string, userProfile?: any): Promise<void> {
    try {
      logger.info('🚀 预加载订阅状态', { userId });

      // 后台异步加载，不阻塞主流程
      this.getUserSubscriptionStatus(userId, userProfile).catch(error => {
        logger.warn('预加载订阅状态失败:', error);
      });
    } catch (error) {
      // 预加载失败不影响主流程
      logger.warn('预加载订阅状态异常:', error);
    }
  }

  /**
   * 🔧 新增: 批量预加载（用于管理后台等场景）
   */
  async batchPreloadSubscriptions(userIds: string[]): Promise<void> {
    try {
      logger.info('🚀 批量预加载订阅状态', { count: userIds.length });

      // 并发加载，但限制并发数
      const batchSize = 5;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        await Promise.all(
          batch.map(userId =>
            this.getUserSubscriptionStatus(userId).catch(error => {
              logger.warn(`预加载用户${userId}订阅失败:`, error);
            })
          )
        );
      }
    } catch (error) {
      logger.warn('批量预加载订阅状态失败:', error);
    }
  }

  /**
   * 🔧 优化: 内存缓存管理（最快）
   */
  private getFromMemoryCache(userId: string): SubscriptionStatusResult | null {
    try {
      const cached = this.memoryCache.get(userId);

      if (!cached) return null;

      // 检查是否过期
      if (cached.expiry < Date.now()) {
        this.memoryCache.delete(userId);
        return null;
      }

      return cached.result;
    } catch (error) {
      console.warn('读取内存缓存失败:', error);
      return null;
    }
  }

  private setToMemoryCache(userId: string, result: SubscriptionStatusResult): void {
    try {
      this.memoryCache.set(userId, {
        result,
        expiry: Date.now() + this.CACHE_TTL
      });
    } catch (error) {
      console.warn('设置内存缓存失败:', error);
    }
  }

  /**
   * 🔧 优化: localStorage缓存管理（较快）
   * 🔧 2025-01 重构: 添加版本控制
   */
  private getFromDiskCache(userId: string): SubscriptionStatusResult | null {
    try {
      const cacheKey = `${this.CACHE_KEY}_${userId}`;
      const cached = localStorage.getItem(cacheKey);

      if (!cached) return null;

      const data = JSON.parse(cached);

      // 🔧 新增: 版本检查
      if (data.version !== this.CACHE_VERSION) {
        logger.info('🔄 缓存版本不匹配，清除旧缓存', {
          cached: data.version,
          current: this.CACHE_VERSION
        });
        localStorage.removeItem(cacheKey);
        return null;
      }

      if (data.expiry < Date.now()) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data.result;
    } catch (error) {
      console.warn('读取磁盘缓存失败:', error);
      return null;
    }
  }

  private setToDiskCache(userId: string, result: SubscriptionStatusResult): void {
    try {
      const cacheKey = `${this.CACHE_KEY}_${userId}`;
      const cacheData = {
        version: this.CACHE_VERSION, // 🔧 新增: 版本号
        result,
        expiry: Date.now() + this.CACHE_TTL
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('设置磁盘缓存失败:', error);
    }
  }

  /**
   * 🔧 优化: 统一缓存设置（同时设置内存和磁盘缓存）
   */
  private setToCache(userId: string, result: SubscriptionStatusResult): void {
    this.setToMemoryCache(userId, result);
    this.setToDiskCache(userId, result);
  }

  /**
   * 🔧 优化: 统一缓存清除
   */
  private clearCache(userId: string): void {
    try {
      // 清除内存缓存
      this.memoryCache.delete(userId);

      // 清除磁盘缓存
      const cacheKey = `${this.CACHE_KEY}_${userId}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('清除订阅缓存失败:', error);
    }
  }

  /**
   * 🔧 新增: 设置跨Tab同步监听
   */
  private setupCrossTabSync(): void {
    if (typeof window === 'undefined') return;

    this.storageListener = (event: StorageEvent) => {
      // 只处理订阅缓存的变更
      if (!event.key?.startsWith(this.CACHE_KEY)) return;

      logger.info('🔄 检测到其他Tab更新订阅缓存', {
        key: event.key,
        newValue: event.newValue ? 'updated' : 'deleted'
      });

      // 提取userId
      const userId = event.key.replace(`${this.CACHE_KEY}_`, '');

      // 清除内存缓存，强制下次从localStorage读取
      this.memoryCache.delete(userId);

      // 触发全局事件，通知组件刷新
      window.dispatchEvent(new CustomEvent('subscriptionCacheUpdated', {
        detail: { userId, source: 'cross-tab' }
      }));
    };

    window.addEventListener('storage', this.storageListener);
    logger.info('✅ 跨Tab同步监听已启动');
  }

  /**
   * 🔧 新增: 清理跨Tab同步监听器
   */
  public destroy(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
      logger.info('🧹 跨Tab同步监听已清理');
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