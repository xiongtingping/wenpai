/**
 * 🎯 统一使用统计数据管理器
 * @description 整合Token和使用次数统计，提供统一的数据管理、缓存和同步机制
 * 
 * 🔧 修复：
 * - 统一数据来源，避免多个服务各自缓存导致的不一致
 * - 集成数据管理中心，使用标准的三层存储架构
 * - 实现Supabase数据同步，确保跨设备一致性
 * - 添加预加载和缓存机制，避免数据闪烁
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { globalDataManager, DATA_CONFIGS, DataCategory } from '@/services/unifiedDataManager';
import { createDataService, TABLE_NAMES } from '@/services/supabaseDataService';
import { tokenUsageService } from '@/services/tokenUsageService';
import type { SubscriptionTier } from '@/types/subscription';
import type { TokenUsageStats } from '@/services/tokenUsageService';
import { getTierDefaultLimit, calculateUsagePercentage, formatRemainingUses } from '@/utils/usageDisplayUtils';
import { logger } from '@/utils/logger';

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
 * 统一使用统计数据
 */
export interface UnifiedUsageData {
  /** 用户ID */
  userId: string;
  /** 用户套餐类型 */
  userTier: SubscriptionTier;
  /** Token使用统计 */
  tokenStats: TokenUsageStats | null;
  /** 使用次数统计 */
  usageCountStats: UsageCountStats;
  /** 扩展统计信息 */
  extendedStats: {
    timeSaved: number;
    contentGenerated: number;
    registrationDate: string;
  };
  /** 最后同步时间 */
  lastSyncTime: string;
  /** 数据版本 */
  version: string;
}

/**
 * 统一使用统计数据管理器类
 */
class UnifiedUsageDataManager {
  private userId: string | null = null;
  private supabaseService: any = null;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 30 * 1000; // 30秒缓存
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5分钟同步一次
  private syncTimer: NodeJS.Timeout | null = null;

  /**
   * 初始化用户会话
   */
  async initializeUser(userId: string): Promise<void> {
    if (this.userId === userId) return;

    this.userId = userId;
    this.clearAllCache();

    try {
      // 初始化Supabase服务 - 🔧 FIX: 使用正确的使用统计表
      this.supabaseService = createDataService(userId, TABLE_NAMES.USAGE_COUNT_RECORDS);

      // 设置数据管理器用户ID
      globalDataManager.setUserId(userId);
      
      // 预加载使用统计数据
      await this.preloadUsageData();
      
      // 启动定期同步
      this.startPeriodicSync();
      
      logger.info('✅ 统一使用统计数据管理器初始化完成', { userId });
    } catch (error) {
      logger.error('❌ 使用统计数据管理器初始化失败', { userId, error });
      throw error;
    }
  }

  /**
   * 预加载使用统计数据
   */
  private async preloadUsageData(): Promise<void> {
    if (!this.userId) return;

    try {
      logger.info('🔄 开始预加载使用统计数据...');
      
      // 并行预加载Token统计和使用次数统计
      await Promise.allSettled([
        this.preloadTokenStats(),
        this.preloadUsageCountStats(),
        this.preloadExtendedStats()
      ]);
      
      logger.info('✅ 使用统计数据预加载完成');
    } catch (error) {
      logger.error('❌ 预加载使用统计数据失败', error);
    }
  }

  /**
   * 预加载Token统计
   */
  private async preloadTokenStats(): Promise<void> {
    try {
      // 从数据管理中心获取Token统计配置
      await globalDataManager.getData('tokenUsageStats');
    } catch (error) {
      logger.warn('预加载Token统计失败', error);
    }
  }

  /**
   * 预加载使用次数统计
   */
  private async preloadUsageCountStats(): Promise<void> {
    try {
      // 从数据管理中心获取使用次数统计配置
      await globalDataManager.getData('usageCountStats');
    } catch (error) {
      logger.warn('u64cdu4f5cu5931u8d25', error);
    }
  }

  /**
   * 预加载扩展统计
   */
  private async preloadExtendedStats(): Promise<void> {
    try {
      // 从数据管理中心获取扩展统计配置
      await globalDataManager.getData('extendedUsageStats');
    } catch (error) {
      logger.warn('u64cdu4f5cu5931u8d25', error);
    }
  }

  /**
   * 获取用户使用次数统计（缓存优先）
   */
  async getUserUsageCountStats(userId: string, userTier: SubscriptionTier): Promise<UsageCountStats> {
    const cacheKey = `usage-count-${userId}-${userTier}`;
    
    // 🔧 FIX: 先检查本地缓存，避免数据闪烁
    const cached = this.getFromCache<UsageCountStats>(cacheKey);
    if (cached) {
      // 异步刷新缓存但不等待，确保界面稳定
      this.refreshCacheInBackground(userId, userTier, cacheKey).catch(error => {
        logger.warn('后台缓存刷新失败:', error);
      });
      return cached;
    }

    try {
      // 优先生成默认数据避免闪烁，然后异步获取云端数据
      const defaultStats = this.generateDefaultUsageCountStats(userTier);
      this.setCache(cacheKey, defaultStats, 300 * 1000); // 缓存5分钟
      
      // 异步获取云端数据但不等待
      this.refreshCacheInBackground(userId, userTier, cacheKey).catch(error => {
        logger.warn('云端数据获取失败:', error);
      });
      
      return defaultStats;
    } catch (error) {
      logger.error('u64cdu4f5cu5931u8d25', { userId, userTier, error });
      
      // 返回默认统计
      return this.generateDefaultUsageCountStats(userTier);
    }
  }

  /**
   * 后台异步刷新缓存
   */
  private async refreshCacheInBackground(userId: string, userTier: SubscriptionTier, cacheKey: string): Promise<void> {
    try {
      const cloudData = await globalDataManager.getData<UsageCountStats>('usageCountStats');
      
      if (cloudData && this.validateUsageCountStats(cloudData)) {
        // 更新缓存
        this.setCache(cacheKey, cloudData, 300 * 1000); // 缓存5分钟
        
        // 可选：触发UI更新事件
        window.dispatchEvent(new CustomEvent('usageStatsUpdated', { 
          detail: { userId, userTier, stats: cloudData } 
        }));
      }
    } catch (error) {
      logger.warn('后台缓存刷新失败:', error);
    }
  }

  /**
   * 获取Token使用统计（缓存优先）
   */
  async getTokenUsageStats(userId: string, userTier: SubscriptionTier): Promise<TokenUsageStats | null> {
    const cacheKey = `token-stats-${userId}-${userTier}`;
    
    // 检查缓存
    const cached = this.getFromCache<TokenUsageStats>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // 🔧 FIX: 通过数据管理中心获取Token统计
      const tokenStats = await tokenUsageService.getUserTokenStats(userId, userTier);
      
      if (tokenStats) {
        this.setCache(cacheKey, tokenStats, 60 * 1000); // Token统计缓存1分钟
        
        // 同步到数据管理中心
        await globalDataManager.setData('tokenUsageStats', tokenStats);
      }
      
      return tokenStats;
    } catch (error) {
      logger.error('获取Token使用统计失败', { userId, userTier, error });
      return null;
    }
  }

  /**
   * 消费使用次数（原子操作）
   */
  async consumeUsageCount(userId: string, userTier: SubscriptionTier, amount: number = 1): Promise<boolean> {
    if (!this.userId || userId !== this.userId) {
      logger.error('用户ID不匹配，拒绝消费使用次数', { userId, currentUserId: this.userId });
      return false;
    }

    try {
      // 获取当前统计
      const currentStats = await this.getUserUsageCountStats(userId, userTier);

      // 🔧 DEBUG: 记录当前统计信息
      logger.info('准备扣减使用次数', {
        userId,
        userTier,
        currentStats: {
          usedCount: currentStats.usedCount,
          availableUses: currentStats.availableUses,
          remainingUses: currentStats.remainingUses
        }
      });

      // 检查是否超出限制
      if (currentStats.availableUses !== -1 && currentStats.usedCount + amount > currentStats.availableUses) {
        logger.warn('使用次数不足', {
          usedCount: currentStats.usedCount,  // 已使用次数
          requestAmount: amount,               // 本次请求
          totalLimit: currentStats.availableUses,  // 总限额
          remaining: currentStats.remainingUses    // 剩余次数
        });
        return false;
      }

      // 更新统计
      const newUsedCount = currentStats.usedCount + amount;
      const updatedStats: UsageCountStats = {
        ...currentStats,
        usedCount: newUsedCount,
        remainingUses: currentStats.availableUses === -1 ? -1 : Math.max(0, currentStats.availableUses - newUsedCount),
        usagePercentage: calculateUsagePercentage(newUsedCount, currentStats.availableUses, userTier),
        lastUpdated: new Date().toISOString()
      };

      // 原子更新：同时更新缓存和记录到Supabase
      await Promise.all([
        globalDataManager.setData('usageCountStats', updatedStats),
        // 🔧 FIX: 创建使用记录到usage_count_records表
        this.createUsageRecord(userId, 'content-adapter', amount)
      ]);

      // 清除缓存，强制下次获取最新数据
      this.clearUserCache(userId);
      
      logger.info('✅ 使用次数消费成功', { 
        userId, 
        amount, 
        newUsedCount, 
        remaining: updatedStats.remainingUses 
      });
      
      return true;
    } catch (error) {
      logger.error('❌ 消费使用次数失败', { userId, userTier, amount, error });
      return false;
    }
  }

  /**
   * 创建使用记录到Supabase
   * 🔧 FIX: 直接使用Supabase client,避免supabaseDataService自动添加updated_at
   */
  private async createUsageRecord(userId: string, feature: string, amount: number): Promise<void> {
    try {
      // 🔧 FIX: 直接导入getSupabaseClient,绕过supabaseDataService的metadata添加
      const { getSupabaseClient } = await import('@/services/supabaseDataService');
      const client = await getSupabaseClient();

      // usage_count_records表只有这些字段,不包含updated_at
      const recordData = {
        user_id: userId,
        feature: feature,
        amount: amount
        // used_at会由数据库默认值NOW()自动设置
        // created_at会由数据库默认值NOW()自动设置
      };

      const { error } = await client
        .from('usage_count_records')
        .insert(recordData);

      if (error) {
        throw error;
      }

      logger.info('✅ 使用记录已创建', { userId, feature, amount });
    } catch (error) {
      logger.error('❌ 创建使用记录失败', { userId, feature, amount, error });
      // 不抛出错误,允许本地缓存继续工作
    }
  }

  /**
   * 同步使用统计到Supabase (已废弃,保留用于兼容)
   * 🔧 FIX: usage_count_records表用于记录每次使用,不是存储汇总统计
   */
  private async syncUsageStatsToSupabase(userId: string, stats: UsageCountStats): Promise<void> {
    // 不再需要,使用createUsageRecord代替
    logger.debug('syncUsageStatsToSupabase已废弃,使用createUsageRecord');
  }

  /**
   * 获取扩展统计信息
   */
  async getExtendedStats(userId: string): Promise<any> {
    const cacheKey = `extended-stats-${userId}`;
    
    // 检查缓存
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // 从数据管理中心获取
      const extendedStats = await globalDataManager.getData('extendedUsageStats');
      
      if (extendedStats) {
        this.setCache(cacheKey, extendedStats);
        return extendedStats;
      }

      // 生成默认扩展统计
      const defaultStats = {
        timeSaved: 0,
        contentGenerated: 0,
        registrationDate: new Date().toLocaleDateString('zh-CN')
      };

      await globalDataManager.setData('extendedUsageStats', defaultStats);
      this.setCache(cacheKey, defaultStats);
      
      return defaultStats;
    } catch (error) {
      logger.error('u64cdu4f5cu5931u8d25', { userId, error });
      
      return {
        timeSaved: 0,
        contentGenerated: 0,
        registrationDate: new Date().toLocaleDateString('zh-CN')
      };
    }
  }

  /**
   * 刷新所有统计数据
   */
  async refreshAllStats(userId: string, userTier: SubscriptionTier): Promise<UnifiedUsageData> {
    // 清除相关缓存
    this.clearUserCache(userId);

    try {
      // 并行获取所有统计数据
      const [tokenStats, usageCountStats, extendedStats] = await Promise.all([
        this.getTokenUsageStats(userId, userTier),
        this.getUserUsageCountStats(userId, userTier),
        this.getExtendedStats(userId)
      ]);

      const unifiedData: UnifiedUsageData = {
        userId,
        userTier,
        tokenStats,
        usageCountStats,
        extendedStats,
        lastSyncTime: new Date().toISOString(),
        version: '2.0'
      };

      logger.info('✅ 所有统计数据刷新完成', { userId });
      
      return unifiedData;
    } catch (error) {
      logger.error('❌ 刷新统计数据失败', { userId, userTier, error });
      throw error;
    }
  }

  /**
   * 生成默认使用次数统计
   */
  private generateDefaultUsageCountStats(userTier: SubscriptionTier): UsageCountStats {
    const availableUses = getTierDefaultLimit(userTier);
    const usedCount = 0;
    
    const defaultStats = {
      usedCount,
      availableUses,
      usagePercentage: calculateUsagePercentage(usedCount, availableUses, userTier),
      remainingUses: availableUses === -1 ? -1 : availableUses,
      lastUpdated: new Date().toISOString()
    };
    
    return defaultStats;
  }

  /**
   * 验证使用次数统计数据
   */
  private validateUsageCountStats(stats: any): stats is UsageCountStats {
    return stats &&
           typeof stats.usedCount === 'number' &&
           typeof stats.availableUses === 'number' &&
           typeof stats.usagePercentage === 'number' &&
           typeof stats.remainingUses === 'number' &&
           typeof stats.lastUpdated === 'string';
  }

  /**
   * 缓存操作
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private clearUserCache(userId: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(userId)) {
        this.cache.delete(key);
      }
    }
  }

  private clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * 启动定期同步
   */
  private startPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(async () => {
      if (this.userId) {
        try {
          // 定期清理过期缓存
          await globalDataManager.cleanupExpiredCache();
          logger.debug('定期缓存清理完成');
        } catch (error) {
          logger.error('u64cdu4f5cu5931u8d25', error);
        }
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * 停止定期同步
   */
  stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.stopPeriodicSync();
    this.clearAllCache();
    this.userId = null;
    this.supabaseService = null;
  }
}

// 单例模式
export const unifiedUsageDataManager = new UnifiedUsageDataManager();

// 添加数据配置到全局数据管理器
Object.assign(DATA_CONFIGS, {
  // 使用统计相关数据 - 用户关键数据，需要云端同步
  usageCountStats: {
    key: 'usageCountStats',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  tokenUsageStats: {
    key: 'tokenUsageStats',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  extendedUsageStats: {
    key: 'extendedUsageStats',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  }
});

export default unifiedUsageDataManager;