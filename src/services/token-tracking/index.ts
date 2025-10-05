// @ts-nocheck - 服务文件，允许类型检查宽松
/**
 * Token跟踪系统 - 统一导出接口
 * @description 新架构的Token跟踪系统,替代旧的分散服务
 *
 * 核心原则:
 * 1. Single Source of Truth: Supabase是唯一真实数据源
 * 2. Single Responsibility: 每个类只负责一件事
 * 3. Fail-Closed: 错误时拒绝请求,不静默降级
 * 4. Cache-aside: 缓存仅用于性能优化
 *
 * 使用示例:
 *
 * ```typescript
 * import { tokenTracking } from '@/services/token-tracking';
 *
 * // 记录Token使用
 * await tokenTracking.recordUsage({
 *   userId: 'user123',
 *   feature: 'content-adapter',
 *   taskType: 'generate',
 *   inputTokens: 800,
 *   outputTokens: 1200,
 *   model: 'gpt-4',
 *   success: true
 * });
 *
 * // 查询统计
 * const stats = await tokenTracking.getStats({
 *   userId: 'user123',
 *   userTier: 'pro'
 * });
 *
 * // 限额检查
 * const limitCheck = await tokenTracking.checkLimit(
 *   'user123',
 *   'pro',
 *   1000
 * );
 * ```
 */

// ===== 核心类 =====
export { TokenRecorder, tokenRecorder } from './core/TokenRecorder';
export { TokenStatsQueryService, tokenStatsQuery } from './core/TokenStatsQuery';
export { TokenLimitChecker, tokenLimitChecker } from './core/TokenLimitChecker';

// ===== 缓存管理 =====
export { TokenCacheManager, tokenCacheManager } from './cache/TokenCacheManager';
export { OfflineQueueManager, offlineQueueManager } from './cache/OfflineQueueManager';

// ===== 工具函数 =====
export * from './utils/tokenEstimator';
export * from './utils/dbConverter';

// ===== 类型定义 =====
export type {
  // 数据模型
  TokenUsageRecord,
  DBTokenUsageRecord,
  TokenStats,
  TokenLimitCheckResult,
  // 请求/查询参数
  TokenRecordRequest,
  TokenStatsQuery,
  TokenHistoryQuery,
  // 缓存/队列
  CacheEntry,
  OfflineQueueItem,
  // 配置
  TokenTrackingConfig
} from './types';

export { TokenTrackingError, TokenTrackingErrorType } from './types';

// ===== 统一接口 =====

import { tokenRecorder } from './core/TokenRecorder';
import { tokenStatsQuery } from './core/TokenStatsQuery';
import { tokenLimitChecker } from './core/TokenLimitChecker';
import { tokenCacheManager } from './cache/TokenCacheManager';
import { offlineQueueManager } from './cache/OfflineQueueManager';
import type {
  TokenRecordRequest,
  TokenStatsQuery,
  TokenHistoryQuery,
  TokenStats,
  TokenUsageRecord,
  TokenLimitCheckResult
} from './types';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * Token跟踪系统 - 统一API
 *
 * 提供简化的调用接口,封装底层实现细节
 */
export const tokenTracking = {
  // ===== 记录 Token 使用 =====

  /**
   * 记录Token使用
   *
   * @example
   * await tokenTracking.recordUsage({
   *   userId: 'user123',
   *   feature: 'content-adapter',
   *   taskType: 'generate',
   *   inputTokens: 800,
   *   outputTokens: 1200,
   *   model: 'gpt-4',
   *   success: true
   * });
   */
  async recordUsage(request: TokenRecordRequest): Promise<TokenUsageRecord> {
    try {
      // 尝试在线记录
      const record = await tokenRecorder.recordUsage(request);

      // 清除用户缓存,下次查询时获取最新数据
      tokenCacheManager.invalidateUser(request.userId);

      return record;
    } catch (error) {
      // 如果离线或数据库错误,添加到离线队列
      if (!navigator.onLine) {
        offlineQueueManager.add(request.userId, request);
        throw new Error('离线状态,已添加到队列待同步');
      }

      throw error;
    }
  },

  /**
   * 批量记录Token使用
   */
  async recordBatch(requests: TokenRecordRequest[]): Promise<number> {
    const successCount = await tokenRecorder.recordBatch(requests);

    // 清除所有相关用户的缓存
    const userIds = [...new Set(requests.map(r => r.userId))];
    userIds.forEach(userId => tokenCacheManager.invalidateUser(userId));

    return successCount;
  },

  // ===== 查询统计 =====

  /**
   * 获取Token统计 (优先使用缓存)
   *
   * @example
   * const stats = await tokenTracking.getStats({
   *   userId: 'user123',
   *   userTier: 'pro'
   * });
   */
  async getStats(query: TokenStatsQuery): Promise<TokenStats> {
    const { userId, userTier, forceRefresh = false } = query;

    // 生成缓存键
    const cacheKey = TokenCacheManager.getTokenStatsKey(userId, userTier);

    // 如果不强制刷新,尝试从缓存获取
    if (!forceRefresh) {
      const cached = tokenCacheManager.get<TokenStats>(cacheKey);
      if (cached) {
        return { ...cached, source: 'cache' as const };
      }
    }

    // 从数据库查询
    const stats = await tokenStatsQuery.getStats(query);

    // 更新缓存 (30秒TTL)
    tokenCacheManager.set(cacheKey, stats, 30 * 1000);

    return stats;
  },

  /**
   * 获取Token使用历史
   */
  async getHistory(query: TokenHistoryQuery): Promise<TokenUsageRecord[]> {
    const { userId, limit = 20, offset = 0, feature } = query;

    // 生成缓存键
    const cacheKey = TokenCacheManager.getTokenHistoryKey(userId, limit, offset, feature);

    // 尝试从缓存获取
    const cached = tokenCacheManager.get<TokenUsageRecord[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 从数据库查询
    const history = await tokenStatsQuery.getHistory(query);

    // 更新缓存 (5分钟TTL)
    tokenCacheManager.set(cacheKey, history, 5 * 60 * 1000);

    return history;
  },

  /**
   * 按功能分组统计
   */
  async getStatsByFeature(
    userId: string,
    userTier: SubscriptionTier
  ): Promise<Record<string, { totalTokens: number; requestCount: number; percentage: number }>> {
    const cacheKey = TokenCacheManager.getFeatureStatsKey(userId);

    // 尝试从缓存获取
    const cached = tokenCacheManager.get<
      Record<string, { totalTokens: number; requestCount: number; percentage: number }>
    >(cacheKey);
    if (cached) {
      return cached;
    }

    // 从数据库查询
    const stats = await tokenStatsQuery.getStatsByFeature(userId, userTier);

    // 更新缓存 (2分钟TTL)
    tokenCacheManager.set(cacheKey, stats, 2 * 60 * 1000);

    return stats;
  },

  /**
   * 获取用户总Token使用量
   */
  async getTotalTokensUsed(userId: string): Promise<number> {
    return tokenStatsQuery.getTotalTokensUsed(userId);
  },

  // ===== 限额检查 =====

  /**
   * 检查Token限额
   *
   * @example
   * const limitCheck = await tokenTracking.checkLimit('user123', 'pro', 1000);
   * if (!limitCheck.allowed) {
   *   throw new Error(limitCheck.reason);
   * }
   */
  async checkLimit(
    userId: string,
    userTier: SubscriptionTier,
    estimatedTokens: number
  ): Promise<TokenLimitCheckResult> {
    // ⚠️  限额检查不使用缓存,必须实时查询
    return tokenLimitChecker.checkLimit(userId, userTier, estimatedTokens);
  },

  /**
   * 批量限额检查
   */
  async checkBatchLimit(
    userId: string,
    userTier: SubscriptionTier,
    requests: { estimatedTokens: number; taskId: string }[]
  ): Promise<{ taskId: string; allowed: boolean; reason?: string }[]> {
    return tokenLimitChecker.checkBatchLimit(userId, userTier, requests);
  },

  /**
   * 获取升级建议
   */
  getUpgradeRecommendation(
    currentStats: TokenStats,
    estimatedMonthlyUsage: number
  ): {
    shouldUpgrade: boolean;
    recommendedTier?: SubscriptionTier;
    reason: string;
  } {
    return tokenLimitChecker.getUpgradeRecommendation(currentStats, estimatedMonthlyUsage);
  },

  // ===== 离线队列管理 =====

  /**
   * 处理离线队列
   */
  async processOfflineQueue(): Promise<{
    total: number;
    success: number;
    failed: number;
    discarded: number;
  }> {
    return offlineQueueManager.processQueue();
  },

  /**
   * 获取离线队列状态
   */
  getOfflineQueueStatus(): {
    size: number;
    oldestTimestamp: string | null;
    newestTimestamp: string | null;
    failedCount: number;
  } {
    return offlineQueueManager.getStatus();
  },

  /**
   * 清除离线队列
   */
  clearOfflineQueue(): void {
    offlineQueueManager.clear();
  },

  // ===== 缓存管理 =====

  /**
   * 清除用户缓存
   */
  invalidateUserCache(userId: string): number {
    return tokenCacheManager.invalidateUser(userId);
  },

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    tokenCacheManager.clear();
  },

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    totalEntries: number;
    totalSize: number;
    validEntries: number;
    expiredEntries: number;
  } {
    return tokenCacheManager.getStats();
  }
};

/**
 * 默认导出 (兼容旧代码)
 */
export default tokenTracking;
