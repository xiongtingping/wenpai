/**
 * 🎯 统一Token使用追踪服务
 *
 * 架构目标:
 * 1. 解决Token使用数据双重记录问题 (C5修复)
 * 2. 提供单一数据源 (SSOT) 的Token统计
 * 3. 统一Supabase数据库和本地缓存的同步逻辑
 * 4. 支持离线模式的本地队列
 *
 * 核心原则:
 * - Single Source of Truth: Supabase为主数据源，localStorage为缓存
 * - Write-Through Cache: 写入时同时更新数据库和缓存
 * - Offline Queue: 离线时累积到队列,上线后同步
 * - Real-time Stats: 从缓存快速读取统计,定期从数据库刷新
 */

import { logger } from '@/utils/logger';
import { tokenUsageService, type TokenUsageRecord } from './tokenUsageService';
import { useUnifiedStore } from '@/stores/unified-state-store';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * Token使用事件接口 (简化版)
 */
export interface TokenUsageEvent {
  feature: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  taskType?: string;
  contentSummary?: string;
  success?: boolean;
  error?: string;
}

/**
 * Token统计快照接口
 */
export interface TokenStatsSnapshot {
  userId: string;
  userTier: SubscriptionTier;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  dailyUsed: number;
  usagePercentage: number;
  needUpgrade: boolean;
  lastUpdated: string;
  cacheSource: 'database' | 'local' | 'hybrid';
}

/**
 * Token使用历史记录 (简化版)
 */
export interface TokenUsageHistoryItem {
  id: string;
  userId: string;
  feature: string;
  model: string;
  totalTokens: number;
  timestamp: string;
  success: boolean;
}

/**
 * 离线队列项
 */
interface OfflineQueueItem {
  userId: string;
  event: TokenUsageEvent;
  timestamp: string;
  retryCount: number;
}

/**
 * 本地缓存的统计数据结构
 */
interface LocalStatsCache {
  userId: string;
  monthlyUsed: number;
  dailyUsed: number;
  lastUpdated: string;
  expiresAt: string;
}

/**
 * 统一Token使用追踪服务类
 */
export class UnifiedTokenTrackingService {
  private static instance: UnifiedTokenTrackingService | null = null;
  private readonly OFFLINE_QUEUE_KEY = 'wenpai:token:offline_queue';
  private readonly STATS_CACHE_KEY = 'wenpai:token:stats_cache';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
  private syncInProgress = false;

  private constructor() {
    // 监听网络状态变化
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        logger.info('🌐 网络恢复,开始同步离线Token记录');
        this.processOfflineQueue();
      });
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(): UnifiedTokenTrackingService {
    if (!UnifiedTokenTrackingService.instance) {
      UnifiedTokenTrackingService.instance = new UnifiedTokenTrackingService();
    }
    return UnifiedTokenTrackingService.instance;
  }

  /**
   * 🎯 核心方法: 记录Token使用 (唯一写入点)
   *
   * @param userId 用户ID
   * @param event Token使用事件
   * @returns 是否记录成功
   */
  async recordTokenUsage(userId: string, event: TokenUsageEvent): Promise<boolean> {
    try {
      logger.debug('💾 记录Token使用', {
        userId,
        feature: event.feature,
        totalTokens: event.totalTokens
      });

      // 1. 尝试写入Supabase数据库 (主数据源)
      if (navigator.onLine) {
        try {
          await tokenUsageService.recordTokenUsage({
            userId,
            feature: event.feature,
            model: event.model,
            taskType: event.taskType,
            inputTokens: event.inputTokens,
            outputTokens: event.outputTokens,
            totalTokens: event.totalTokens,
            contentSummary: event.contentSummary,
            success: event.success !== false
          });

          logger.debug('✅ Token记录已写入Supabase');

          // 2. 更新本地缓存统计
          this.updateLocalStatsCache(userId, event.totalTokens);

          // 3. 更新Store状态 (实时UI反馈)
          this.updateStoreStats(userId, event);

          return true;

        } catch (dbError) {
          logger.warn('⚠️ Supabase写入失败,添加到离线队列', dbError);
          // 降级到离线队列
          this.addToOfflineQueue(userId, event);
          // 仍然更新本地缓存,保证UI显示
          this.updateLocalStatsCache(userId, event.totalTokens);
          return true; // 离线队列也算成功
        }
      } else {
        // 离线模式: 直接添加到队列
        logger.info('📴 离线模式,Token记录添加到队列');
        this.addToOfflineQueue(userId, event);
        this.updateLocalStatsCache(userId, event.totalTokens);
        return true;
      }

    } catch (error) {
      logger.error('❌ Token使用记录失败', error);
      return false;
    }
  }

  /**
   * 🎯 获取Token统计 (优先从缓存读取)
   *
   * @param userId 用户ID
   * @param userTier 用户订阅层级
   * @param forceRefresh 强制从数据库刷新
   * @returns Token统计快照
   */
  async getTokenStats(
    userId: string,
    userTier: SubscriptionTier,
    forceRefresh = false
  ): Promise<TokenStatsSnapshot | null> {
    try {
      // 1. 尝试从本地缓存读取
      if (!forceRefresh) {
        const cachedStats = this.getLocalStatsCache(userId);
        if (cachedStats) {
          logger.debug('✅ Token统计从缓存读取');
          return this.buildStatsSnapshot(cachedStats, userTier, 'local');
        }
      }

      // 2. 从数据库刷新
      if (navigator.onLine) {
        try {
          const dbStats = await tokenUsageService.getUserTokenStats(userId, userTier);

          // 更新本地缓存
          const cacheData: LocalStatsCache = {
            userId,
            monthlyUsed: dbStats.monthlyUsed,
            dailyUsed: dbStats.dailyUsed,
            lastUpdated: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.CACHE_TTL).toISOString()
          };
          localStorage.setItem(this.STATS_CACHE_KEY, JSON.stringify(cacheData));

          logger.debug('✅ Token统计从数据库刷新');
          return this.buildStatsSnapshot(cacheData, userTier, 'database');

        } catch (dbError) {
          logger.warn('⚠️ 数据库查询失败,使用过期缓存', dbError);
          const cachedStats = this.getLocalStatsCache(userId, true); // 允许过期
          if (cachedStats) {
            return this.buildStatsSnapshot(cachedStats, userTier, 'hybrid');
          }
        }
      }

      return null;

    } catch (error) {
      logger.error('❌ 获取Token统计失败', error);
      return null;
    }
  }

  /**
   * 🎯 获取Token使用历史 (从数据库查询)
   *
   * @param userId 用户ID
   * @param limit 返回条数
   * @returns Token使用历史列表
   */
  async getTokenUsageHistory(
    userId: string,
    limit = 20
  ): Promise<TokenUsageHistoryItem[]> {
    try {
      if (!navigator.onLine) {
        logger.warn('📴 离线模式,无法获取历史记录');
        return [];
      }

      const history = await tokenUsageService.getUserTokenHistory(userId, limit);

      return history.map(record => ({
        id: record.id,
        userId: record.userId,
        feature: record.feature,
        model: record.model,
        totalTokens: record.totalTokens,
        timestamp: record.timestamp,
        success: record.success
      }));

    } catch (error) {
      logger.error('❌ 获取Token历史失败', error);
      return [];
    }
  }

  /**
   * 更新本地缓存统计
   */
  private updateLocalStatsCache(userId: string, tokensUsed: number): void {
    try {
      const existing = this.getLocalStatsCache(userId, true); // 允许过期

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // 检查是否是新的一天
      const lastUpdatedDate = existing?.lastUpdated.split('T')[0];
      const isNewDay = lastUpdatedDate !== today;

      const newCache: LocalStatsCache = {
        userId,
        monthlyUsed: (existing?.monthlyUsed || 0) + tokensUsed,
        dailyUsed: isNewDay ? tokensUsed : (existing?.dailyUsed || 0) + tokensUsed,
        lastUpdated: now.toISOString(),
        expiresAt: new Date(Date.now() + this.CACHE_TTL).toISOString()
      };

      localStorage.setItem(this.STATS_CACHE_KEY, JSON.stringify(newCache));
      logger.debug('📊 本地统计缓存已更新', {
        monthlyUsed: newCache.monthlyUsed,
        dailyUsed: newCache.dailyUsed
      });

    } catch (error) {
      logger.warn('⚠️ 更新本地缓存失败', error);
    }
  }

  /**
   * 获取本地缓存统计
   */
  private getLocalStatsCache(userId: string, allowExpired = false): LocalStatsCache | null {
    try {
      const cached = localStorage.getItem(this.STATS_CACHE_KEY);
      if (!cached) return null;

      const data: LocalStatsCache = JSON.parse(cached);

      // 验证用户ID匹配
      if (data.userId !== userId) return null;

      // 检查是否过期
      if (!allowExpired && new Date(data.expiresAt) < new Date()) {
        logger.debug('⏰ 本地统计缓存已过期');
        return null;
      }

      return data;

    } catch (error) {
      logger.warn('⚠️ 读取本地缓存失败', error);
      return null;
    }
  }

  /**
   * 构建统计快照
   */
  private buildStatsSnapshot(
    cache: LocalStatsCache,
    userTier: SubscriptionTier,
    source: 'database' | 'local' | 'hybrid'
  ): TokenStatsSnapshot {
    // 从订阅计划获取限额
    const limits = this.getTierLimits(userTier);

    const monthlyRemaining = Math.max(0, limits.monthlyLimit - cache.monthlyUsed);
    const usagePercentage = (cache.monthlyUsed / limits.monthlyLimit) * 100;
    const needUpgrade = usagePercentage > 80;

    return {
      userId: cache.userId,
      userTier,
      monthlyLimit: limits.monthlyLimit,
      monthlyUsed: cache.monthlyUsed,
      monthlyRemaining,
      dailyUsed: cache.dailyUsed,
      usagePercentage,
      needUpgrade,
      lastUpdated: cache.lastUpdated,
      cacheSource: source
    };
  }

  /**
   * 获取层级限额
   */
  private getTierLimits(tier: SubscriptionTier): { monthlyLimit: number } {
    const limits: Record<SubscriptionTier, number> = {
      'free': 10000,
      'trial': 100000,
      'pro': 200000,
      'premium': 500000
    };
    return { monthlyLimit: limits[tier] || 10000 };
  }

  /**
   * 更新Store状态 (实时UI反馈)
   */
  private updateStoreStats(userId: string, event: TokenUsageEvent): void {
    try {
      const store = useUnifiedStore.getState();

      // 添加使用记录到历史
      store.addTokenUsage({
        id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        feature: event.feature,
        totalTokens: event.totalTokens,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
        timestamp: new Date().toISOString(),
        metadata: {
          model: event.model,
          taskType: event.taskType
        }
      });

      logger.debug('✅ Store状态已更新');

    } catch (error) {
      logger.warn('⚠️ 更新Store状态失败', error);
    }
  }

  /**
   * 添加到离线队列
   */
  private addToOfflineQueue(userId: string, event: TokenUsageEvent): void {
    try {
      const queue = this.getOfflineQueue();

      const item: OfflineQueueItem = {
        userId,
        event,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };

      queue.push(item);
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));

      logger.info(`📋 已添加到离线队列 (队列长度: ${queue.length})`);

    } catch (error) {
      logger.error('❌ 添加到离线队列失败', error);
    }
  }

  /**
   * 获取离线队列
   */
  private getOfflineQueue(): OfflineQueueItem[] {
    try {
      const data = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.warn('⚠️ 读取离线队列失败', error);
      return [];
    }
  }

  /**
   * 处理离线队列
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.syncInProgress) {
      logger.info('⏳ 队列同步正在进行中');
      return;
    }

    this.syncInProgress = true;

    try {
      const queue = this.getOfflineQueue();
      if (queue.length === 0) {
        logger.info('✅ 离线队列为空');
        return;
      }

      logger.info(`🔄 开始处理离线队列 (${queue.length}条记录)`);

      const successItems: number[] = [];
      const failedItems: OfflineQueueItem[] = [];

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];

        try {
          await tokenUsageService.recordTokenUsage({
            userId: item.userId,
            feature: item.event.feature,
            model: item.event.model,
            taskType: item.event.taskType,
            inputTokens: item.event.inputTokens,
            outputTokens: item.event.outputTokens,
            totalTokens: item.event.totalTokens,
            contentSummary: item.event.contentSummary,
            success: item.event.success !== false
          });

          successItems.push(i);
          logger.debug(`✅ 离线记录同步成功 [${i + 1}/${queue.length}]`);

        } catch (error) {
          logger.warn(`⚠️ 离线记录同步失败 [${i + 1}/${queue.length}]`, error);

          // 重试次数限制
          if (item.retryCount < 3) {
            item.retryCount++;
            failedItems.push(item);
          } else {
            logger.error(`❌ 离线记录重试次数超限,丢弃 [${i + 1}/${queue.length}]`);
          }
        }
      }

      // 更新队列 (只保留失败的项)
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(failedItems));

      logger.info(`✅ 离线队列处理完成 (成功: ${successItems.length}, 失败: ${failedItems.length})`);

    } catch (error) {
      logger.error('❌ 处理离线队列异常', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 🎯 便捷方法: 检查Token限额
   */
  async checkTokenLimit(
    userId: string,
    userTier: SubscriptionTier,
    estimatedTokens: number
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const stats = await this.getTokenStats(userId, userTier);

      if (!stats) {
        // 无法获取统计,默认允许 (避免阻断用户)
        return { allowed: true };
      }

      if (stats.monthlyUsed + estimatedTokens > stats.monthlyLimit) {
        return {
          allowed: false,
          reason: `本月Token已使用${stats.monthlyUsed}/${stats.monthlyLimit},不足以支持此次操作(预计${estimatedTokens})`
        };
      }

      return { allowed: true };

    } catch (error) {
      logger.error('❌ Token限额检查失败', error);
      return { allowed: true }; // 检查失败默认允许
    }
  }

  /**
   * 获取离线队列状态
   */
  getOfflineQueueStatus(): { count: number; oldestTimestamp: string | null } {
    const queue = this.getOfflineQueue();
    return {
      count: queue.length,
      oldestTimestamp: queue.length > 0 ? queue[0].timestamp : null
    };
  }

  /**
   * 清理过期缓存和队列
   */
  cleanup(): void {
    try {
      // 清理过期的统计缓存
      const cache = localStorage.getItem(this.STATS_CACHE_KEY);
      if (cache) {
        const data: LocalStatsCache = JSON.parse(cache);
        if (new Date(data.expiresAt) < new Date()) {
          localStorage.removeItem(this.STATS_CACHE_KEY);
          logger.info('🧹 已清理过期统计缓存');
        }
      }

      // 清理超过7天的离线队列项
      const queue = this.getOfflineQueue();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const filteredQueue = queue.filter(item => {
        const itemTime = new Date(item.timestamp).getTime();
        return itemTime > sevenDaysAgo;
      });

      if (filteredQueue.length < queue.length) {
        localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(filteredQueue));
        logger.info(`🧹 已清理${queue.length - filteredQueue.length}条过期离线记录`);
      }

    } catch (error) {
      logger.warn('⚠️ 清理缓存失败', error);
    }
  }
}

/**
 * 导出单例实例
 */
export const unifiedTokenTrackingService = UnifiedTokenTrackingService.getInstance();

/**
 * 导出便捷Hook (用于React组件)
 */
export function useTokenTracking() {
  const service = UnifiedTokenTrackingService.getInstance();

  return {
    recordUsage: service.recordTokenUsage.bind(service),
    getStats: service.getTokenStats.bind(service),
    getHistory: service.getTokenUsageHistory.bind(service),
    checkLimit: service.checkTokenLimit.bind(service),
    getQueueStatus: service.getOfflineQueueStatus.bind(service),
    cleanup: service.cleanup.bind(service)
  };
}

export default UnifiedTokenTrackingService;
