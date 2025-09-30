/**
 * 统一使用量管理服务
 * @description 整合Token使用量和使用次数统计，提供统一的限额检查和管理机制
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { request } from '@/api/request';
import { tokenUsageService } from '@/services/tokenUsageService';
import type { SubscriptionTier } from '@/types/subscription';
import type { TokenUsageStats } from '@/services/tokenUsageService';
import { createDataService, TABLE_NAMES } from '@/services/supabaseDataService';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';

/**
 * 使用次数统计接口
 */
export interface UsageCountStats {
  /** 已使用次数 */
  usedCount: number;
  /** 可用总次数 */
  availableUses: number;
  /** 使用百分比 */
  usagePercentage: number;
  /** 剩余次数 */
  remainingUses: number;
  /** 最后更新时间 */
  lastUpdated: string;
}

/**
 * 统一使用量统计接口
 */
export interface UnifiedUsageStats {
  /** 用户ID */
  userId: string;
  /** 用户套餐类型 */
  userTier: SubscriptionTier;
  /** Token使用统计 */
  tokenStats: TokenUsageStats;
  /** 使用次数统计 */
  usageCountStats: UsageCountStats;
  /** 最后同步时间 */
  lastSyncTime: string;
}

/**
 * 统一限额检查结果
 */
export interface UnifiedLimitCheckResult {
  /** 是否允许使用 */
  allowed: boolean;
  /** 限制类型 */
  limitType?: 'token' | 'usage_count' | 'both';
  /** 拒绝原因 */
  reason?: string;
  /** 建议操作 */
  suggestedAction?: 'upgrade' | 'wait' | 'reduce_usage';
  /** 当前统计 */
  stats: UnifiedUsageStats;
}

/**
 * 套餐到期处理结果
 */
export interface SubscriptionExpiryResult {
  /** 是否已到期 */
  isExpired: boolean;
  /** 到期时间 */
  expiryDate?: string;
  /** 新的套餐类型 */
  newTier?: SubscriptionTier;
  /** 处理动作 */
  actions: string[];
}

/**
 * 统一使用量管理服务类
 */
class UnifiedUsageService {
  private readonly API_ENDPOINT = import.meta.env.DEV ? 'http://localhost:5173/.netlify/functions/api' : '/.netlify/functions/api';
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5分钟同步一次
  
  private syncTimer: NodeJS.Timeout | null = null;
  
  // 🔧 FIX: 添加缓存机制，防止数据闪烁
  private usageStatsCache = new Map<string, { data: UsageCountStats; timestamp: number }>();
  private readonly CACHE_DURATION = 10 * 1000; // 10秒缓存
  
  /**
   * 清除特定用户的缓存
   */
  private clearUserCache(userId: string, userTier?: SubscriptionTier): void {
    if (userTier) {
      const cacheKey = `${userId}-${userTier}`;
      this.usageStatsCache.delete(cacheKey);
    } else {
      // 清除该用户的所有缓存
      for (const key of this.usageStatsCache.keys()) {
        if (key.startsWith(userId + '-')) {
          this.usageStatsCache.delete(key);
        }
      }
    }
  }

  /**
   * 获取使用次数限额 - 🔧 修复: 统一使用subscriptionPlans配置
   */
  private getUsageCountLimit(tier: SubscriptionTier): number {
    try {
      const plan = getSubscriptionPlan(tier);
      const limit = plan.limits.adaptUsageLimit;
      console.log(`🔧 获取套餐${tier}的使用次数限额: ${limit}`, plan.limits);
      return limit;
    } catch (error) {
      console.warn(`获取套餐${tier}的使用次数限额失败，使用默认值`, error);
      const fallbackLimits = {
        'trial': 10,
        'pro': 30, 
        'premium': -1
      };
      const fallbackLimit = fallbackLimits[tier] || 10;
      console.log(`🔧 使用默认限额 ${tier}: ${fallbackLimit}`);
      return fallbackLimit;
    }
  }

  /**
   * 获取Token限额 - 🔧 修复: 统一使用subscriptionPlans配置  
   */
  private getTokenLimit(tier: SubscriptionTier): number {
    try {
      const plan = getSubscriptionPlan(tier);
      return plan.limits.tokenLimit;
    } catch (error) {
      console.warn(`获取套餐${tier}的Token限额失败，使用默认值`, error);
      const fallbackLimits = {
        'trial': 100000,
        'pro': 200000,
        'premium': 500000
      };
      return fallbackLimits[tier] || 100000;
    }
  }

  /**
   * 获取用户统一使用量统计
   */
  async getUserUnifiedStats(userId: string, userTier: SubscriptionTier): Promise<UnifiedUsageStats> {
    try {
      // 🔧 FIX: 开发环境提供模拟数据，避免API依赖
      if (import.meta.env.DEV) {
        console.log('🔧 开发环境：使用模拟统一使用量统计');
        
        // 模拟Token统计
        const tokenLimit = this.getTokenLimit(userTier);
        const monthlyUsed = Math.floor(tokenLimit * 0.3); // 30%
        const tokenStats = {
          userId,
          userTier,
          dailyUsed: Math.floor(tokenLimit * 0.1), // 10%
          monthlyUsed,
          monthlyRemaining: tokenLimit - monthlyUsed, // 🔧 FIXED: 添加monthlyRemaining
          dailyLimit: tokenLimit,
          monthlyLimit: tokenLimit,
          usagePercentage: 30,
          needUpgrade: false, // 🔧 FIXED: 添加needUpgrade
          lastUpdated: new Date().toISOString()
        };

        // 获取使用次数统计（已经处理了开发环境）
        const usageCountStats = await this.getUserUsageCountStats(userId, userTier);
        
        return {
          userId,
          userTier,
          tokenStats,
          usageCountStats,
          lastSyncTime: new Date().toISOString()
        };
      }

      // 生产环境的正常逻辑
      // 1. 获取Token使用统计
      const tokenStats = await tokenUsageService.getUserTokenStats(userId, userTier);
      
      // 2. 获取使用次数统计
      const usageCountStats = await this.getUserUsageCountStats(userId, userTier);
      
      // 3. 组合统一统计
      const unifiedStats: UnifiedUsageStats = {
        userId,
        userTier,
        tokenStats,
        usageCountStats,
        lastSyncTime: new Date().toISOString()
      };
      
      // 4. 记录统计数据（Supabase已通过tokenUsageService处理）
      
      return unifiedStats;
    } catch (error) {
      console.error('获取统一使用量统计失败:', error);
      
      // 🚨 生产环境API失败时抛出错误，开发环境已在上面处理
      throw new Error(`统一使用量API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取用户使用次数统计
   */
  async getUserUsageCountStats(userId: string, userTier: SubscriptionTier): Promise<UsageCountStats> {
    try {
      // 🔧 FIX: 检查缓存，防止数据闪烁
      const cacheKey = `${userId}-${userTier}`;
      const cached = this.usageStatsCache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
        console.log('🔧 使用缓存的使用次数统计:', cached.data);
        return cached.data;
      }
      
      // 🔧 FIX: 开发环境返回稳定的模拟数据，避免API请求失败
      if (import.meta.env.DEV) {
        console.log('🔧 开发环境：生成稳定的模拟使用次数统计', { userId, userTier });
        
        const availableUses = this.getUsageCountLimit(userTier);
        const usedCount = userTier === 'premium' ? 5 : Math.floor(availableUses * 0.3); // 模拟已使用30%
        const remainingUses = availableUses === -1 ? -1 : Math.max(0, availableUses - usedCount);
        const usagePercentage = availableUses === -1 ? 0 : (usedCount / availableUses) * 100;

        // 🔧 FIX: 使用固定时间戳，避免重复渲染
        const fixedTimestamp = new Date(2025, 0, 9, 12, 0, 0).toISOString(); // 固定为2025年1月9日12:00
        
        const mockStats = {
          usedCount,
          availableUses,
          usagePercentage,
          remainingUses,
          lastUpdated: fixedTimestamp
        };
        
        // 🔧 FIX: 缓存结果
        this.usageStatsCache.set(cacheKey, { data: mockStats, timestamp: now });
        
        console.log('🔧 返回稳定的模拟使用次数统计:', mockStats);
        
        return mockStats;
      }

      // 生产环境：调用真实的后端API
      const response = await request.post(this.API_ENDPOINT, {
        action: 'user-usage',
        userId: userId
      }); // returns { totalUsed }
      const usageData = (response as any)?.data ?? response;

      // 计算总使用次数
      const usedCount = usageData.totalUsed || 0;
      const availableUses = this.getUsageCountLimit(userTier);
      const remainingUses = availableUses === -1 ? -1 : Math.max(0, availableUses - usedCount);
      const usagePercentage = availableUses === -1 ? 0 : (usedCount / availableUses) * 100;

      const stats = {
        usedCount,
        availableUses,
        usagePercentage,
        remainingUses,
        lastUpdated: new Date().toISOString()
      };
      
      // 🔧 FIX: 缓存生产环境的结果
      this.usageStatsCache.set(cacheKey, { data: stats, timestamp: now });

      return stats;
    } catch (error) {
      console.error('从后端获取使用次数统计失败:', error);

      // 🚨 生产环境API失败时抛出错误，开发环境已在上面处理
      throw new Error(`使用次数统计API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 统一限额检查
   */
  async checkUnifiedLimit(
    userId: string, 
    userTier: SubscriptionTier, 
    estimatedTokens: number = 1000,
    requireUsageCount: boolean = true
  ): Promise<UnifiedLimitCheckResult> {
    const stats = await this.getUserUnifiedStats(userId, userTier);
    
    // 检查Token限额
    const tokenLimitExceeded = stats.tokenStats.monthlyUsed + estimatedTokens > stats.tokenStats.monthlyLimit;
    
    // 检查使用次数限额
    const usageCountLimitExceeded = requireUsageCount && 
      stats.usageCountStats.availableUses !== -1 && 
      stats.usageCountStats.usedCount >= stats.usageCountStats.availableUses;
    
    // 判断限制类型
    let limitType: 'token' | 'usage_count' | 'both' | undefined;
    let reason = '';
    let allowed = true;
    
    if (tokenLimitExceeded && usageCountLimitExceeded) {
      limitType = 'both';
      reason = 'Token使用量和使用次数均已达到限额';
      allowed = false;
    } else if (tokenLimitExceeded) {
      limitType = 'token';
      reason = `Token使用量即将超过限额。当前已使用 ${stats.tokenStats.monthlyUsed.toLocaleString()}，限额 ${stats.tokenStats.monthlyLimit.toLocaleString()}`;
      allowed = false;
    } else if (usageCountLimitExceeded) {
      limitType = 'usage_count';
      reason = `使用次数已达到限额。当前已使用 ${stats.usageCountStats.usedCount} 次，限额 ${stats.usageCountStats.availableUses} 次`;
      allowed = false;
    }
    
    // 确定建议操作
    let suggestedAction: 'upgrade' | 'wait' | 'reduce_usage' = 'upgrade';
    if (userTier === 'premium') {
      suggestedAction = 'wait'; // 高级版用户建议等待下月重置
    } else if (stats.tokenStats.usagePercentage > 90 || stats.usageCountStats.usagePercentage > 90) {
      suggestedAction = 'upgrade'; // 接近限额建议升级
    }
    
    return {
      allowed,
      limitType,
      reason,
      suggestedAction,
      stats
    };
  }

  /**
   * 消费使用次数
   */
  async consumeUsageCount(userId: string, userTier: SubscriptionTier, amount: number = 1): Promise<boolean> {
    try {
      // 1. 检查限额
      const limitCheck = await this.checkUnifiedLimit(userId, userTier, 0, true);
      if (!limitCheck.allowed && limitCheck.limitType !== 'token') {
        return false;
      }
      
      // 2. 尝试从后端消费
      await request.post(this.API_ENDPOINT, {
        action: 'consume-usage',
        userId,
        amount
      });
      
      // 3. 🔧 FIX: 使用次数消费成功后，清除缓存以获取最新数据
      this.clearUserCache(userId, userTier);
      
      return true;
    } catch (error) {
      console.error('消费使用次数失败:', error);
      return false;
    }
  }

  /**
   * 记录Token使用量
   */
  async recordTokenUsage(userId: string, tokenUsage: {
    feature: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  }): Promise<void> {
    // 委托给tokenUsageService处理
    await tokenUsageService.recordTokenUsage({
      userId,
      success: true, // 添加必需的success字段
      ...tokenUsage
    });

    // 触发统计更新
    this.refreshUserStats(userId);
  }

  /**
   * 刷新用户统计数据
   */
  private async refreshUserStats(userId: string): Promise<void> {
    try {
      // 由于使用Supabase实时数据，无需手动刷新缓存
      // 统计数据会自动从数据库获取最新值
      console.log(`刷新用户 ${userId} 统计数据 - 使用Supabase实时数据`);
    } catch (error) {
      console.error('刷新用户统计数据失败:', error);
    }
  }

  /**
   * 获取默认统一统计数据
   */
  private getDefaultUnifiedStats(userId: string, userTier: SubscriptionTier): UnifiedUsageStats {
    const tokenLimit = this.getTokenLimit(userTier);
    const usageLimit = this.getUsageCountLimit(userTier);
    
    return {
      userId,
      userTier,
      tokenStats: {
        userId,
        userTier,
        monthlyLimit: tokenLimit,
        monthlyUsed: 0,
        monthlyRemaining: tokenLimit,
        dailyUsed: 0,
        usagePercentage: 0,
        needUpgrade: false,
        lastUpdated: new Date().toISOString()
      },
      usageCountStats: {
        usedCount: 0,
        availableUses: usageLimit,
        usagePercentage: 0,
        remainingUses: usageLimit === -1 ? -1 : usageLimit,
        lastUpdated: new Date().toISOString()
      },
      lastSyncTime: new Date().toISOString()
    };
  }

  /**
   * 启动自动同步
   */
  startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(() => {
      this.syncAllUserStats();
    }, this.SYNC_INTERVAL);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * 同步所有用户统计数据
   */
  private async syncAllUserStats(): Promise<void> {
    try {
      // 使用Supabase时无需同步，数据已实时存储
      console.log('使用Supabase实时数据，无需手动同步');
    } catch (error) {
      console.error('同步用户统计数据失败:', error);
    }
  }
}

// 创建单例实例
export const unifiedUsageService = new UnifiedUsageService();

export default unifiedUsageService;
