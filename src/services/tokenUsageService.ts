/**
 * Token使用量统计服务
 * @description 统一管理所有AI调用的token使用量统计、限额检查、使用记录等功能
 */

import { request } from '@/api/request';
import type { SubscriptionTier } from '@/types/subscription';
import { logger } from '@/utils/logger';
import { createDataService, TABLE_NAMES, getSupabaseClient } from '@/services/supabaseDataService';

// 临时的套餐配置函数，避免循环依赖
function getTokenLimitForTier(tier: SubscriptionTier): number {
  switch (tier) {
    case 'trial':
      return 100000; // 10万tokens
    case 'pro':
      return 200000; // 20万tokens
    case 'premium':
      return 500000; // 50万tokens
    default:
      return 100000;
  }
}

/**
 * Token使用记录接口
 */
export interface TokenUsageRecord {
  /** 记录ID */
  id: string;
  /** 用户ID */
  userId: string;
  /** 功能类型 */
  feature: string;
  /** 任务类型 */
  taskType?: string;
  /** 输入token数量 */
  inputTokens: number;
  /** 输出token数量 */
  outputTokens: number;
  /** 总token数量 */
  totalTokens: number;
  /** 使用的AI模型 */
  model: string;
  /** 使用时间 */
  timestamp: string;
  /** 请求内容摘要 */
  contentSummary?: string;
  /** 响应状态 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * Token使用统计接口
 */
export interface TokenUsageStats {
  /** 用户ID */
  userId: string;
  /** 用户套餐类型 */
  userTier: SubscriptionTier;
  /** 月度token限额 */
  monthlyLimit: number;
  /** 本月已使用token数量 */
  monthlyUsed: number;
  /** 本月剩余token数量 */
  monthlyRemaining: number;
  /** 今日已使用token数量 */
  dailyUsed: number;
  /** 使用百分比 */
  usagePercentage: number;
  /** 是否需要升级 */
  needUpgrade: boolean;
  /** 最后更新时间 */
  lastUpdated: string;
}

/**
 * Token限额检查结果
 */
export interface TokenLimitCheckResult {
  /** 是否允许使用 */
  allowed: boolean;
  /** 拒绝原因 */
  reason?: string;
  /** 当前使用统计 */
  stats: TokenUsageStats;
  /** 建议操作 */
  suggestedAction?: 'upgrade' | 'wait' | 'reduce_usage';
}

/**
 * Token使用量统计服务类
 */
class TokenUsageService {
  private readonly API_ENDPOINT = '/.netlify/functions/api/token-usage';
  
  /**
   * 获取用户套餐的token限额
   */
  private getTokenLimitByTier(tier: SubscriptionTier): number {
    return getTokenLimitForTier(tier);
  }

  /**
   * 获取当前月份的键值
   */
  private getCurrentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * 获取当前日期的键值
   */
  private getCurrentDateKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }


  /**
   * 记录token使用量
   */
  async recordTokenUsage(record: Omit<TokenUsageRecord, 'id' | 'timestamp'>): Promise<void> {
    const fullRecord: TokenUsageRecord = {
      ...record,
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. 保存到Supabase数据库
      await this.saveTokenUsageToDatabase(fullRecord);
      
      // 2. 尝试同步到后端
      await this.syncTokenUsageToBackend(fullRecord);
      
      logger.debug('✅ Token使用量记录成功:', {
        userId: record.userId,
        feature: record.feature,
        totalTokens: record.totalTokens,
        model: record.model
      });
    } catch (error) {
      console.error('❌ Token使用量记录失败:', error);
      // 即使后端同步失败，Supabase记录也应该保存
      await this.saveTokenUsageToDatabase(fullRecord);
    }
  }

  /**
   * 保存token使用记录到Supabase数据库
   */
  private async saveTokenUsageToDatabase(record: TokenUsageRecord): Promise<void> {
    try {
      // 使用Supabase数据服务保存使用记录
      const dataService = createDataService(record.userId, TABLE_NAMES.USER_USAGE_LOGS);
      await dataService.create(record);
      
      logger.debug('✅ Token使用记录已保存到Supabase:', {
        recordId: record.id,
        userId: record.userId,
        totalTokens: record.totalTokens
      });
    } catch (error) {
      console.error('保存Token使用记录到Supabase失败:', error);
      // 🚨 数据库失败时必须抛出错误，不能使用localStorage回退
      throw new Error(`Supabase数据库操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 同步token使用记录到后端
   */
  private async syncTokenUsageToBackend(record: TokenUsageRecord): Promise<void> {
    try {
      await request.post(`${this.API_ENDPOINT}/record`, record);
    } catch (error) {
      console.error('同步token使用记录到后端失败:', error);
      // 🚨 API失败时必须抛出错误，不能允许本地记录掩盖问题
      throw new Error(`Token使用记录同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取用户token使用统计
   */
  async getUserTokenStats(userId: string, userTier: SubscriptionTier): Promise<TokenUsageStats> {
    try {
      const dataService = createDataService(userId, TABLE_NAMES.USER_USAGE_LOGS);
      const monthKey = this.getCurrentMonthKey();
      const dateKey = this.getCurrentDateKey();

      // 查询当月使用记录
      const monthlyRecords = await dataService.findMany({
        filters: {
          timestamp: {
            operator: 'gte',
            value: `${monthKey}-01T00:00:00.000Z`
          }
        }
      });

      // 查询当日使用记录
      const dailyRecords = await dataService.findMany({
        filters: {
          timestamp: {
            operator: 'gte', 
            value: `${dateKey}T00:00:00.000Z`
          }
        }
      });

      const monthlyLimit = this.getTokenLimitByTier(userTier);
      const monthlyUsed = monthlyRecords.data.reduce((sum, record: any) => sum + (record.totalTokens || 0), 0);
      const dailyUsed = dailyRecords.data.reduce((sum, record: any) => sum + (record.totalTokens || 0), 0);
      const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
      const usagePercentage = monthlyLimit > 0 ? (monthlyUsed / monthlyLimit) * 100 : 0;
      const needUpgrade = usagePercentage >= 80;

      return {
        userId,
        userTier,
        monthlyLimit,
        monthlyUsed,
        monthlyRemaining,
        dailyUsed,
        usagePercentage,
        needUpgrade,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('从Supabase获取用户Token统计失败:', error);
      // 🚨 数据库失败时必须抛出错误，不能使用本地数据
      throw new Error(`Supabase查询失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查token使用限额
   */
  async checkTokenLimit(userId: string, userTier: SubscriptionTier, estimatedTokens: number): Promise<TokenLimitCheckResult> {
    const stats = await this.getUserTokenStats(userId, userTier);

    // 检查是否超过月度限额
    if (stats.monthlyUsed + estimatedTokens > stats.monthlyLimit) {
      return {
        allowed: false,
        reason: `本月Token使用量即将超过限额。当前已使用 ${stats.monthlyUsed.toLocaleString()}，限额 ${stats.monthlyLimit.toLocaleString()}`,
        stats,
        suggestedAction: 'upgrade'
      };
    }

    // 检查是否接近限额（90%以上）
    const projectedUsage = stats.monthlyUsed + estimatedTokens;
    const projectedPercentage = (projectedUsage / stats.monthlyLimit) * 100;

    if (projectedPercentage >= 90) {
      return {
        allowed: true,
        reason: `Token使用量接近限额，建议升级套餐`,
        stats,
        suggestedAction: 'upgrade'
      };
    }

    return {
      allowed: true,
      stats
    };
  }

  /**
   * 获取用户token使用历史记录
   */
  async getUserTokenHistory(userId: string, limit: number = 50): Promise<TokenUsageRecord[]> {
    try {
      const dataService = createDataService(userId, TABLE_NAMES.USER_USAGE_LOGS);
      const result = await dataService.findMany({
        limit,
        orderBy: 'timestamp',
        orderDirection: 'desc'
      });

      return result.data as TokenUsageRecord[];
    } catch (error) {
      console.error('从Supabase获取用户Token历史失败:', error);
      // 🚨 数据库失败时必须抛出错误，不能返回空数组
      throw new Error(`Supabase查询失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取用户按功能分类的token使用统计
   */
  async getUserTokenStatsByFeature(userId: string): Promise<Record<string, { totalTokens: number; requestCount: number; percentage: number }>> {
    try {
      const dataService = createDataService(userId, TABLE_NAMES.USER_USAGE_LOGS);
      const monthKey = this.getCurrentMonthKey();

      // 查询当月记录 - 直接使用Supabase客户端进行时间范围查询
      const client = await getSupabaseClient();
      const { data: records, error } = await client
        .from(TABLE_NAMES.USER_USAGE_LOGS)
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', `${monthKey}-01T00:00:00.000Z`);
        
      if (error) {
        throw new Error(`查询记录失败: ${error.message}`);
      }
      
      const monthlyRecords = { data: records || [] };

      const tokenRecords = monthlyRecords.data as TokenUsageRecord[];
      const result: Record<string, { totalTokens: number; requestCount: number; percentage: number }> = {};
      
      // 计算总tokens
      const totalTokens = tokenRecords.reduce((sum, record) => sum + record.totalTokens, 0);

      // 按功能分组统计
      tokenRecords.forEach(record => {
        if (!result[record.feature]) {
          result[record.feature] = {
            totalTokens: 0,
            requestCount: 0,
            percentage: 0
          };
        }
        result[record.feature].totalTokens += record.totalTokens;
        result[record.feature].requestCount += 1;
      });

      // 计算百分比
      Object.values(result).forEach(stats => {
        stats.percentage = totalTokens > 0 ? (stats.totalTokens / totalTokens) * 100 : 0;
      });

      return result;
    } catch (error) {
      console.error('从Supabase获取功能统计失败:', error);
      // 🚨 数据库失败时必须抛出错误，不能返回空对象
      throw new Error(`Supabase查询失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 清理过期的token使用记录
   */
  async cleanupExpiredRecords(userId: string, retentionMonths: number = 6): Promise<void> {
    try {
      const dataService = createDataService(userId, TABLE_NAMES.USER_USAGE_LOGS);
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

      // 查询过期记录
      const expiredRecords = await dataService.findMany({
        filters: {
          timestamp: {
            operator: 'lt',
            value: cutoffDate.toISOString()
          }
        }
      });

      // 批量删除过期记录
      if (expiredRecords.data.length > 0) {
        const expiredIds = expiredRecords.data.map(record => record.id!);
        await dataService.deleteMany(expiredIds);
        
        logger.debug('✅ 清理过期Token记录成功:', {
          userId,
          deletedCount: expiredIds.length,
          cutoffDate: cutoffDate.toISOString()
        });
      }
    } catch (error) {
      console.error('清理过期Token记录失败:', error);
      // 🚨 数据库失败时必须抛出错误
      throw new Error(`Supabase清理操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 导出用户token使用数据
   */
  async exportUserTokenData(userId: string): Promise<string> {
    try {
      const dataService = createDataService(userId, TABLE_NAMES.USER_USAGE_LOGS);
      
      // 获取所有用户记录
      const allRecords = await dataService.findMany({
        orderBy: 'timestamp',
        orderDirection: 'desc'
      });

      // 计算统计信息
      const records = allRecords.data as TokenUsageRecord[];
      const totalTokens = records.reduce((sum, record) => sum + record.totalTokens, 0);
      const totalRequests = records.length;

      const exportData = {
        userId,
        exportTime: new Date().toISOString(),
        summary: {
          totalRecords: totalRequests,
          totalTokensUsed: totalTokens,
          dateRange: {
            earliest: records[records.length - 1]?.timestamp,
            latest: records[0]?.timestamp
          }
        },
        records
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('从Supabase导出用户数据失败:', error);
      // 🚨 数据库失败时必须抛出错误
      throw new Error(`Supabase导出操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// 导出单例实例
export const tokenUsageService = new TokenUsageService();
export default tokenUsageService;
