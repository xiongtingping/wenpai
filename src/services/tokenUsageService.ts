/**
 * Token使用量统计服务
 * @description 统一管理所有AI调用的token使用量统计、限额检查、使用记录等功能
 */

import { request } from '@/api/request';
import type { SubscriptionTier } from '@/types/subscription';

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
  private readonly STORAGE_KEY = 'wenpai_token_usage';
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
   * 从本地存储获取token使用数据
   */
  private getLocalTokenUsage(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取本地token使用数据失败:', error);
      return {};
    }
  }

  /**
   * 保存token使用数据到本地存储
   */
  private saveLocalTokenUsage(data: Record<string, any>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('保存本地token使用数据失败:', error);
    }
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
      // 1. 保存到本地存储
      await this.saveTokenUsageLocally(fullRecord);
      
      // 2. 尝试同步到后端
      await this.syncTokenUsageToBackend(fullRecord);
      
      console.log('✅ Token使用量记录成功:', {
        userId: record.userId,
        feature: record.feature,
        totalTokens: record.totalTokens,
        model: record.model
      });
    } catch (error) {
      console.error('❌ Token使用量记录失败:', error);
      // 即使后端同步失败，本地记录也应该保存
      await this.saveTokenUsageLocally(fullRecord);
    }
  }

  /**
   * 保存token使用记录到本地存储
   */
  private async saveTokenUsageLocally(record: TokenUsageRecord): Promise<void> {
    const data = this.getLocalTokenUsage();
    const monthKey = this.getCurrentMonthKey();
    const dateKey = this.getCurrentDateKey();
    
    // 初始化用户数据结构
    if (!data[record.userId]) {
      data[record.userId] = {
        records: [],
        monthlyStats: {},
        dailyStats: {}
      };
    }
    
    const userData = data[record.userId];
    
    // 添加记录
    userData.records.push(record);
    
    // 更新月度统计
    if (!userData.monthlyStats[monthKey]) {
      userData.monthlyStats[monthKey] = {
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        requestCount: 0,
        features: {}
      };
    }
    
    const monthlyStats = userData.monthlyStats[monthKey];
    monthlyStats.totalTokens += record.totalTokens;
    monthlyStats.inputTokens += record.inputTokens;
    monthlyStats.outputTokens += record.outputTokens;
    monthlyStats.requestCount += 1;
    
    // 按功能统计
    if (!monthlyStats.features[record.feature]) {
      monthlyStats.features[record.feature] = {
        totalTokens: 0,
        requestCount: 0
      };
    }
    monthlyStats.features[record.feature].totalTokens += record.totalTokens;
    monthlyStats.features[record.feature].requestCount += 1;
    
    // 更新日度统计
    if (!userData.dailyStats[dateKey]) {
      userData.dailyStats[dateKey] = {
        totalTokens: 0,
        requestCount: 0
      };
    }
    
    userData.dailyStats[dateKey].totalTokens += record.totalTokens;
    userData.dailyStats[dateKey].requestCount += 1;
    
    // 保存到本地存储
    this.saveLocalTokenUsage(data);
  }

  /**
   * 同步token使用记录到后端
   */
  private async syncTokenUsageToBackend(record: TokenUsageRecord): Promise<void> {
    try {
      await request.post(`${this.API_ENDPOINT}/record`, record);
    } catch (error) {
      console.warn('同步token使用记录到后端失败:', error);
      // 不抛出错误，允许本地记录继续工作
    }
  }

  /**
   * 获取用户token使用统计
   */
  async getUserTokenStats(userId: string, userTier: SubscriptionTier): Promise<TokenUsageStats> {
    const data = this.getLocalTokenUsage();
    const userData = data[userId];
    const monthKey = this.getCurrentMonthKey();
    const dateKey = this.getCurrentDateKey();

    const monthlyLimit = this.getTokenLimitByTier(userTier);
    const monthlyUsed = userData?.monthlyStats?.[monthKey]?.totalTokens || 0;
    const dailyUsed = userData?.dailyStats?.[dateKey]?.totalTokens || 0;
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
    const usagePercentage = monthlyLimit > 0 ? (monthlyUsed / monthlyLimit) * 100 : 0;
    const needUpgrade = usagePercentage >= 80; // 80%以上建议升级

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
    const data = this.getLocalTokenUsage();
    const userData = data[userId];

    if (!userData?.records) {
      return [];
    }

    // 按时间倒序排列，返回最近的记录
    return userData.records
      .sort((a: TokenUsageRecord, b: TokenUsageRecord) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }

  /**
   * 获取用户按功能分类的token使用统计
   */
  async getUserTokenStatsByFeature(userId: string): Promise<Record<string, { totalTokens: number; requestCount: number; percentage: number }>> {
    const data = this.getLocalTokenUsage();
    const userData = data[userId];
    const monthKey = this.getCurrentMonthKey();

    if (!userData?.monthlyStats?.[monthKey]?.features) {
      return {};
    }

    const features = userData.monthlyStats[monthKey].features;
    const totalTokens = userData.monthlyStats[monthKey].totalTokens;

    const result: Record<string, { totalTokens: number; requestCount: number; percentage: number }> = {};

    for (const [feature, stats] of Object.entries(features)) {
      const featureStats = stats as { totalTokens: number; requestCount: number };
      result[feature] = {
        ...featureStats,
        percentage: totalTokens > 0 ? (featureStats.totalTokens / totalTokens) * 100 : 0
      };
    }

    return result;
  }

  /**
   * 清理过期的token使用记录
   */
  async cleanupExpiredRecords(userId: string, retentionMonths: number = 6): Promise<void> {
    const data = this.getLocalTokenUsage();
    const userData = data[userId];

    if (!userData?.records) {
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

    // 保留最近几个月的记录
    userData.records = userData.records.filter((record: TokenUsageRecord) =>
      new Date(record.timestamp) > cutoffDate
    );

    // 清理过期的月度统计
    const currentMonth = new Date();
    for (const monthKey of Object.keys(userData.monthlyStats || {})) {
      const [year, month] = monthKey.split('-').map(Number);
      const monthDate = new Date(year, month - 1);

      if (monthDate < cutoffDate) {
        delete userData.monthlyStats[monthKey];
      }
    }

    // 清理过期的日度统计（保留最近30天）
    const cutoffDateDaily = new Date();
    cutoffDateDaily.setDate(cutoffDateDaily.getDate() - 30);

    for (const dateKey of Object.keys(userData.dailyStats || {})) {
      const [year, month, day] = dateKey.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      if (date < cutoffDateDaily) {
        delete userData.dailyStats[dateKey];
      }
    }

    this.saveLocalTokenUsage(data);
  }

  /**
   * 导出用户token使用数据
   */
  async exportUserTokenData(userId: string): Promise<string> {
    const data = this.getLocalTokenUsage();
    const userData = data[userId];

    if (!userData) {
      return JSON.stringify({ message: '未找到用户数据' }, null, 2);
    }

    const exportData = {
      userId,
      exportTime: new Date().toISOString(),
      summary: {
        totalRecords: userData.records?.length || 0,
        monthlyStats: userData.monthlyStats || {},
        dailyStats: userData.dailyStats || {}
      },
      records: userData.records || []
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// 导出单例实例
export const tokenUsageService = new TokenUsageService();
export default tokenUsageService;
