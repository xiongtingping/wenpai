/**
 * Token统计查询器 - 核心读取服务
 * @description 负责从Supabase查询Token使用统计数据
 *
 * 职责:
 * 1. 查询月度/日度Token使用量
 * 2. 计算统计指标 (使用率、剩余量等)
 * 3. 查询历史记录
 * 4. 按功能分组统计
 *
 * 数据来源:
 * - Supabase是唯一真实数据源 (SSOT)
 * - 所有统计都实时从数据库计算
 * - 不维护本地累加状态
 */

import { logger } from '@/utils/logger';
import { getSupabaseClient, TABLE_NAMES } from '@/services/supabaseDataService';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import type { SubscriptionTier } from '@/types/subscription';
import {
  type TokenStats,
  type TokenStatsQuery,
  type TokenUsageRecord,
  type TokenHistoryQuery,
  type DBTokenUsageRecord,
  TokenTrackingError,
  TokenTrackingErrorType
} from '../types';

export class TokenStatsQueryService {
  private static instance: TokenStatsQueryService;

  private constructor() {}

  static getInstance(): TokenStatsQueryService {
    if (!TokenStatsQueryService.instance) {
      TokenStatsQueryService.instance = new TokenStatsQueryService();
    }
    return TokenStatsQueryService.instance;
  }

  /**
   * 🎯 核心方法: 获取Token统计
   *
   * @throws {TokenTrackingError} 数据库错误
   */
  async getStats(query: TokenStatsQuery): Promise<TokenStats> {
    try {
      const { userId, userTier } = query;

      logger.debug('🔍 查询Token统计', { userId, userTier });

      // 1. 获取套餐限额
      const monthlyLimit = this.getTokenLimit(userTier);

      // 2. 计算时间范围
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // 3. 查询月度使用量
      const monthlyUsed = await this.queryTokenUsage(
        userId,
        monthStart.toISOString()
      );

      // 4. 查询日度使用量
      const dailyUsed = await this.queryTokenUsage(
        userId,
        dayStart.toISOString()
      );

      // 5. 计算派生指标
      const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
      const usagePercentage =
        monthlyLimit > 0 ? (monthlyUsed / monthlyLimit) * 100 : 0;
      const needUpgrade = usagePercentage > 80;

      const stats: TokenStats = {
        userId,
        userTier,
        monthlyLimit,
        monthlyUsed,
        monthlyRemaining,
        dailyUsed,
        usagePercentage,
        needUpgrade,
        statsTime: now.toISOString(),
        source: 'database'
      };

      logger.debug('✅ Token统计查询成功', {
        monthlyUsed,
        monthlyLimit,
        usagePercentage: usagePercentage.toFixed(2) + '%'
      });

      return stats;
    } catch (error) {
      logger.error('❌ Token统计查询失败', { query, error });

      throw new TokenTrackingError(
        TokenTrackingErrorType.DATABASE_ERROR,
        'Failed to query token stats',
        { query, originalError: error }
      );
    }
  }

  /**
   * 查询指定时间范围内的Token使用量
   */
  private async queryTokenUsage(
    userId: string,
    startTime: string,
    endTime?: string
  ): Promise<number> {
    const client = await getSupabaseClient();

    let query = client
      .from(TABLE_NAMES.USER_USAGE_LOGS)
      .select('total_tokens')
      .eq('user_id', userId)
      .eq('success', true) // ⚠️  只统计成功的调用
      .gte('created_at', startTime); // 🔧 FIX: 使用 created_at 而不是 timestamp

    if (endTime) {
      query = query.lte('created_at', endTime); // 🔧 FIX: 使用 created_at 而不是 timestamp
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // 累加Token数量
    const totalTokens = (data || []).reduce(
      (sum, record) => sum + (record.total_tokens || 0),
      0
    );

    logger.debug('📊 Token使用量查询结果', {
      userId,
      startTime,
      recordCount: data?.length || 0,
      totalTokens
    });

    return totalTokens;
  }

  /**
   * 获取Token使用历史记录
   */
  async getHistory(query: TokenHistoryQuery): Promise<TokenUsageRecord[]> {
    const { userId, limit = 20, offset = 0, feature, timeRange } = query;

    try {
      const client = await getSupabaseClient();

      let dbQuery = client
        .from(TABLE_NAMES.USER_USAGE_LOGS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }) // 🔧 FIX: 使用 created_at 而不是 timestamp
        .range(offset, offset + limit - 1);

      // 功能筛选
      if (feature) {
        dbQuery = dbQuery.eq('feature', feature);
      }

      // 时间范围筛选
      if (timeRange) {
        dbQuery = dbQuery
          .gte('timestamp', timeRange.startDate)
          .lte('timestamp', timeRange.endDate);
      }

      const { data, error } = await dbQuery;

      if (error) {
        throw error;
      }

      // 转换为camelCase格式
      const records: TokenUsageRecord[] = (data || []).map(
        this.convertDBRecordToUsageRecord
      );

      logger.debug('📜 查询历史记录成功', {
        userId,
        recordCount: records.length
      });

      return records;
    } catch (error) {
      logger.error('❌ 查询历史记录失败', { query, error });

      throw new TokenTrackingError(
        TokenTrackingErrorType.DATABASE_ERROR,
        'Failed to query token usage history',
        { query, originalError: error }
      );
    }
  }

  /**
   * 按功能分组统计
   */
  async getStatsByFeature(
    userId: string,
    userTier: SubscriptionTier
  ): Promise<Record<string, { totalTokens: number; requestCount: number; percentage: number }>> {
    try {
      const client = await getSupabaseClient();

      // 查询本月所有记录
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data, error } = await client
        .from(TABLE_NAMES.USER_USAGE_LOGS)
        .select('feature, total_tokens')
        .eq('user_id', userId)
        .eq('success', true)
        .gte('created_at', monthStart.toISOString()); // 🔧 FIX: 使用 created_at 而不是 timestamp

      if (error) {
        throw error;
      }

      // 按功能分组统计
      const featureStats: Record<
        string,
        { totalTokens: number; requestCount: number; percentage: number }
      > = {};

      let totalTokens = 0;

      (data || []).forEach((record: any) => {
        const feature = record.feature || 'unknown';
        const tokens = record.total_tokens || 0;

        if (!featureStats[feature]) {
          featureStats[feature] = {
            totalTokens: 0,
            requestCount: 0,
            percentage: 0
          };
        }

        featureStats[feature].totalTokens += tokens;
        featureStats[feature].requestCount += 1;
        totalTokens += tokens;
      });

      // 计算百分比
      Object.values(featureStats).forEach(stats => {
        stats.percentage =
          totalTokens > 0 ? (stats.totalTokens / totalTokens) * 100 : 0;
      });

      logger.debug('📊 功能统计查询成功', {
        userId,
        featureCount: Object.keys(featureStats).length,
        totalTokens
      });

      return featureStats;
    } catch (error) {
      logger.error('❌ 功能统计查询失败', { userId, error });

      throw new TokenTrackingError(
        TokenTrackingErrorType.DATABASE_ERROR,
        'Failed to query stats by feature',
        { userId, originalError: error }
      );
    }
  }

  /**
   * 获取套餐Token限额
   */
  private getTokenLimit(tier: SubscriptionTier): number {
    try {
      const plan = getSubscriptionPlan(tier);
      return plan.limits.tokenLimit;
    } catch (error) {
      logger.warn(`获取套餐${tier}限额失败,使用默认值`, error);

      // Fallback值
      const fallbackLimits: Record<SubscriptionTier, number> = {
        free: 10000,
        trial: 100000,
        pro: 200000,
        premium: 500000
      };

      return fallbackLimits[tier] || 100000;
    }
  }

  /**
   * 转换数据库记录为业务对象 (snake_case → camelCase)
   */
  private convertDBRecordToUsageRecord(
    dbRecord: DBTokenUsageRecord
  ): TokenUsageRecord {
    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      feature: dbRecord.feature,
      taskType: dbRecord.task_type,
      inputTokens: dbRecord.input_tokens,
      outputTokens: dbRecord.output_tokens,
      totalTokens: dbRecord.total_tokens,
      model: dbRecord.model,
      contentSummary: dbRecord.content_summary,
      success: dbRecord.success,
      errorMessage: dbRecord.error_message,
      timestamp: dbRecord.timestamp,
      metadata: dbRecord.metadata || undefined
    };
  }

  /**
   * 获取用户总Token使用量 (所有时间)
   */
  async getTotalTokensUsed(userId: string): Promise<number> {
    try {
      const client = await getSupabaseClient();

      const { data, error } = await client
        .from(TABLE_NAMES.USER_USAGE_LOGS)
        .select('total_tokens')
        .eq('user_id', userId)
        .eq('success', true);

      if (error) {
        throw error;
      }

      const total = (data || []).reduce(
        (sum, record) => sum + (record.total_tokens || 0),
        0
      );

      return total;
    } catch (error) {
      logger.error('❌ 查询总Token使用量失败', { userId, error });
      throw new TokenTrackingError(
        TokenTrackingErrorType.DATABASE_ERROR,
        'Failed to query total tokens used',
        { userId, originalError: error }
      );
    }
  }
}

/**
 * 导出单例实例
 */
export const tokenStatsQuery = TokenStatsQueryService.getInstance();
