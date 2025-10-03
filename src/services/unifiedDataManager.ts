/**
 * 🗄️ 统一数据管理器 (重构版)
 * 整合localStorage、Zustand persist、Supabase三层存储架构
 *
 * ✅ 重构改进:
 * - 继承BaseDataManager,消除重复代码
 * - 使用DataFieldAdapter,统一字段映射
 * - 强化用户ID隔离,修复安全漏洞
 * - 保持原有API兼容性
 *
 * @version 2.0
 * @date 2025-10-03
 */

import { BaseDataManager } from './base/BaseDataManager';
import { fallbackStrategy, DataFreshness } from './strategies/FallbackStrategy';
import { createDataService, TABLE_NAMES } from '@/services/supabaseDataService';
import {
  getAvailableModelsForTier,
  getModelInfo,
  isModelAvailableForTier,
  type AIModel
} from '@/config/aiModels';
import { getUserTier as getUserTierFromStorage } from '@/utils/modelPermissions';
import type { SubscriptionTier } from '@/types/subscription';

// 数据存储层级枚举
export enum StorageLayer {
  CLOUD = 'cloud',        // Supabase云端存储
  STATE = 'state',        // Zustand应用状态
  CACHE = 'cache'         // localStorage缓存
}

// 数据类型分类
export enum DataCategory {
  USER_CRITICAL = 'user_critical',    // 用户关键数据（必须云端）
  APP_STATE = 'app_state',             // 应用状态（Zustand）
  CACHE_TEMP = 'cache_temp'            // 缓存临时（localStorage）
}

// 数据配置接口
export interface DataConfig {
  key: string;
  category: DataCategory;
  ttl?: number;           // 缓存过期时间（秒）
  syncToCloud?: boolean;  // 是否同步到云端
}

/**
 * 预定义数据配置
 */
export const DATA_CONFIGS: Record<string, DataConfig> = {
  // 用户关键数据 - 必须云端持久化 (Supabase)
  favorites: {
    key: 'favorites',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  bookmarkedTopics: {
    key: 'bookmarked-topics',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  shareHistory: {
    key: 'shareHistory',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  emojiLikes: {
    key: 'emoji-favorites',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  interestFilters: {
    key: 'interestFilters',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  preferredModel: {
    key: 'preferredAIModel',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  aiModelUsage: {
    key: 'aiModelUsage',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  subscriptionTier: {
    key: 'subscriptionTier',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },
  userSettings: {
    key: 'globalSettings',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },

  // 应用状态 - Zustand管理（不持久化）
  selectedPlan: {
    key: 'selectedPlan',
    category: DataCategory.APP_STATE,
    ttl: 3600 // 1小时
  },
  selectedPlatforms: {
    key: 'selectedPlatforms',
    category: DataCategory.APP_STATE
  },

  // 用户偏好设置 - 云端持久化 (Supabase)
  theme: {
    key: 'theme',
    category: DataCategory.USER_CRITICAL,
    syncToCloud: true
  },

  // 缓存临时 - localStorage
  loginRedirect: {
    key: 'login_redirect_to',
    category: DataCategory.CACHE_TEMP,
    ttl: 600 // 10分钟
  },
  hotTopicsCache: {
    key: 'hotTopicsData',
    category: DataCategory.CACHE_TEMP,
    ttl: 300 // 5分钟
  },
  promoStart: {
    key: 'promo_start',
    category: DataCategory.CACHE_TEMP,
    ttl: 86400 // 24小时
  }
};

/**
 * 统一数据管理器类 (重构版)
 */
export class UnifiedDataManager extends BaseDataManager {
  private cacheTimestamps = new Map<string, number>();

  constructor(userId?: string) {
    super({ userId, enableLogging: true });
  }

  /**
   * 用户ID设置后的钩子 - 初始化Supabase服务
   */
  protected onUserIdSet(userId: string): void {
    try {
      this.supabaseService = createDataService(userId, TABLE_NAMES.USER_BRAND_CORPUS);
      this.log('info', '✅ 统一数据管理器已初始化，用户:', userId);
    } catch (error) {
      this.log('error', '❌ SupabaseService初始化失败:', error);
    }
  }

  /**
   * 智能数据获取 - 缓存优先策略 + 降级支持
   */
  async getData<T>(key: string, forceRefresh = false): Promise<T | null> {
    const config = DATA_CONFIGS[key];
    if (!config) {
      this.log('warn', `⚠️ 未知数据key: ${key}，使用缓存模式`);
      return this.getCacheData<T>(key);
    }

    try {
      // 1. 强制刷新时直接从云端获取
      if (forceRefresh && config.category === DataCategory.USER_CRITICAL) {
        const cloudData = await this.getCloudData<T>(key);
        if (cloudData) {
          this.updateCache(key, cloudData);
        }
        return cloudData;
      }

      // 2. 先检查缓存
      const cached = this.getCacheData<T>(key);
      if (cached && !this.isExpired(key)) {
        // 异步更新云端数据（如果需要）
        if (config.syncToCloud && this.userId) {
          this.getCloudData<T>(key).then(cloudData => {
            if (cloudData && JSON.stringify(cloudData) !== JSON.stringify(cached)) {
              this.updateCache(key, cloudData);
            }
          }).catch(error => {
            this.log('warn', `⚠️ 异步云端更新失败 ${key}:`, error);
          });
        }
        return cached;
      }

      // 3. 根据数据类型从对应层获取 (带降级策略)
      switch (config.category) {
        case DataCategory.USER_CRITICAL:
          // ✅ 使用降级策略: Cloud失败 → Stale Cache
          const result = await fallbackStrategy.readWithFallback(
            () => this.getCloudData<T>(key),
            () => this.getCacheData<T>(key),
            this.cacheTimestamps.get(key)
          );

          if (result) {
            // 更新缓存
            if (result.freshness === DataFreshness.FRESH) {
              this.updateCache(key, result.data);
            }
            // 如果是过期数据,输出用户提示
            if (result.message) {
              this.log('warn', `📡 ${key}: ${result.message}`);
            }
            return result.data;
          }
          return null;

        case DataCategory.APP_STATE:
          return this.getStateData<T>(key);

        case DataCategory.CACHE_TEMP:
          return this.getCacheData<T>(key);

        default:
          return null;
      }
    } catch (error) {
      this.log('error', `❌ 获取数据失败 ${key}:`, error);
      return null;
    }
  }

  /**
   * 智能数据保存 (带降级策略)
   */
  async setData<T>(key: string, data: T): Promise<boolean> {
    const config = DATA_CONFIGS[key];
    if (!config) {
      this.log('error', `❌ 未知数据key: ${key}，拒绝保存 - 需要在 DATA_CONFIGS 中配置`);
      return false;
    }

    try {
      let success = false;

      // 根据配置保存到对应层
      switch (config.category) {
        case DataCategory.USER_CRITICAL:
          // ✅ 使用降级策略: Cloud失败 → 本地暂存 → 后台重试
          const writeResult = await fallbackStrategy.writeWithFallback(
            data,
            () => this.setCloudData(key, data),
            () => this.setCacheData(key, data),
            key
          );

          success = writeResult.success;
          if (!writeResult.synced) {
            this.log('warn', `📡 ${key}: ${writeResult.message}`);
          }
          this.cacheTimestamps.set(key, Date.now());
          break;

        case DataCategory.APP_STATE:
          success = this.setStateData(key, data);
          break;

        case DataCategory.CACHE_TEMP:
          success = this.setCacheData(key, data);
          this.cacheTimestamps.set(key, Date.now());
          break;
      }

      // 额外的云端同步（如果配置了）
      if (success && config.syncToCloud && config.category !== DataCategory.USER_CRITICAL) {
        this.setCloudData(key, data).catch(error => {
          this.log('warn', `⚠️ 云端同步失败 ${key}:`, error);
        });
      }

      return success;
    } catch (error) {
      this.log('error', `❌ 保存数据失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 从状态层获取数据（Zustand stores）
   */
  private getStateData<T>(key: string): T | null {
    this.log('debug', `📝 状态数据访问: ${key} - 需要集成 Zustand store`);
    return null;
  }

  /**
   * 保存数据到状态层
   */
  private setStateData<T>(key: string, data: T): boolean {
    this.log('debug', `📝 状态数据保存: ${key} - 需要集成 Zustand store`);
    return false;
  }

  /**
   * 更新缓存（带时间戳）
   */
  private updateCache<T>(key: string, data: T): void {
    this.setCacheData(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * 检查缓存是否过期
   */
  private isExpired(key: string): boolean {
    const config = DATA_CONFIGS[key];
    if (!config || !config.ttl) return false;

    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return true;

    return (Date.now() - timestamp) / 1000 > config.ttl;
  }

  /**
   * 预加载关键数据
   */
  async preloadCriticalData(): Promise<void> {
    const userId = this.ensureUserId();

    const criticalKeys = Object.keys(DATA_CONFIGS).filter(
      key => DATA_CONFIGS[key].category === DataCategory.USER_CRITICAL
    );

    this.log('info', '🔄 开始预加载关键数据:', criticalKeys);

    const promises = criticalKeys.map(async (key) => {
      try {
        await this.getData(key);
        return { key, success: true };
      } catch (error) {
        this.log('error', `预加载失败 ${key}:`, error);
        return { key, success: false, error };
      }
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    this.log('info', `✅ 数据预加载完成: ${successful}/${criticalKeys.length}`);
  }

  /**
   * 清理过期缓存
   */
  cleanupExpiredCache(): void {
    this.log('info', '🧹 开始清理过期缓存...');
    let cleanedCount = 0;

    Object.keys(DATA_CONFIGS).forEach(key => {
      if (this.isExpired(key)) {
        this.deleteCacheData(key);
        this.cacheTimestamps.delete(key);
        cleanedCount++;
      }
    });

    this.log('info', `✅ 清理完成，删除了 ${cleanedCount} 个过期缓存项`);
  }

  /**
   * 获取数据统计信息
   */
  getDataStats(): {
    cloudData: number;
    stateData: number;
    cacheData: number;
    totalConfigs: number;
  } {
    const stats = {
      cloudData: 0,
      stateData: 0,
      cacheData: 0,
      totalConfigs: Object.keys(DATA_CONFIGS).length
    };

    Object.values(DATA_CONFIGS).forEach(config => {
      switch (config.category) {
        case DataCategory.USER_CRITICAL:
          stats.cloudData++;
          break;
        case DataCategory.APP_STATE:
          stats.stateData++;
          break;
        case DataCategory.CACHE_TEMP:
          stats.cacheData++;
          break;
      }
    });

    return stats;
  }

  // ============================================================================
  // 🤖 AI模型相关管理方法
  // ============================================================================

  /**
   * 获取用户订阅层级
   */
  async getUserTier(): Promise<SubscriptionTier> {
    try {
      const cachedTier = await this.getData<SubscriptionTier>('subscriptionTier');
      if (cachedTier) {
        return cachedTier;
      }

      const tier = getUserTierFromStorage();
      await this.setData('subscriptionTier', tier);
      return tier;
    } catch (error) {
      this.log('error', '获取用户tier失败:', error);
      return 'trial';
    }
  }

  /**
   * 获取用户可用的AI模型
   */
  async getUserAvailableModels(): Promise<AIModel[]> {
    const userTier = await this.getUserTier();
    return getAvailableModelsForTier(userTier);
  }

  /**
   * 检查用户是否有权限使用指定模型
   */
  async hasModelPermission(modelId: string): Promise<boolean> {
    const userTier = await this.getUserTier();
    return isModelAvailableForTier(modelId, userTier);
  }

  /**
   * 获取用户首选AI模型
   */
  async getPreferredModel(): Promise<string> {
    const preferred = await this.getData<string>('preferredModel');
    if (preferred) {
      const hasPermission = await this.hasModelPermission(preferred);
      if (hasPermission) {
        return preferred;
      }
    }

    const availableModels = await this.getUserAvailableModels();
    return availableModels[0]?.id || 'gpt-4o-mini';
  }

  /**
   * 设置用户首选AI模型
   */
  async setPreferredModel(modelId: string): Promise<boolean> {
    const hasPermission = await this.hasModelPermission(modelId);
    if (!hasPermission) {
      this.log('warn', `用户无权限使用模型: ${modelId}`);
      return false;
    }

    return await this.setData('preferredModel', modelId);
  }

  /**
   * @deprecated 此方法已废弃 - Token记录双重写入问题 (C5修复)
   * ⚠️ 请使用 unifiedTokenTrackingService.recordTokenUsage() 替代
   * 🚫 此方法将在v2.0版本中移除
   */
  async recordModelUsage(modelId: string, tokens: number, feature: string): Promise<void> {
    this.log('warn',
      '⚠️ recordModelUsage已废弃，请使用 unifiedTokenTrackingService.recordTokenUsage()',
      '\n详见: /src/services/unifiedTokenTrackingService.ts'
    );
  }

  /**
   * @deprecated 此方法已废弃 - Token统计双重数据源问题 (C5修复)
   * ⚠️ 请使用 unifiedTokenTrackingService.getTokenStats() 替代
   * 🚫 此方法将在v2.0版本中移除
   */
  async getModelUsageStats(): Promise<{
    today: Record<string, any>;
    thisMonth: Record<string, any>;
    total: Record<string, any>;
    favoriteModel: string;
    totalCalls: number;
    totalTokens: number;
  }> {
    this.log('warn',
      '⚠️ getModelUsageStats已废弃，请使用 unifiedTokenTrackingService.getTokenStats()',
      '\n详见: /src/services/unifiedTokenTrackingService.ts'
    );

    return {
      today: {},
      thisMonth: {},
      total: {},
      favoriteModel: 'gpt-4o-mini',
      totalCalls: 0,
      totalTokens: 0
    };
  }

  /**
   * 获取AI模型建议
   */
  async getModelRecommendations(): Promise<{
    recommended: AIModel[];
    reasons: string[];
  }> {
    try {
      const userTier = await this.getUserTier();
      const availableModels = await this.getUserAvailableModels();

      const recommendations: AIModel[] = [];
      const reasons: string[] = [];

      if (userTier === 'trial') {
        const trialModels = availableModels.filter(m => m.tier === 'low');
        recommendations.push(...trialModels.slice(0, 2));
        reasons.push('基于您的体验版订阅，推荐高性价比模型');
      } else {
        const latestModels = availableModels
          .filter(m => m.tier === 'high')
          .slice(0, 2);
        recommendations.push(...latestModels);
        reasons.push('为您推荐最新的高级AI模型');
      }

      return { recommended: recommendations, reasons };
    } catch (error) {
      this.log('error', '获取模型推荐失败:', error);
      return { recommended: [], reasons: [] };
    }
  }

  /**
   * 清理过期的使用统计数据
   */
  async cleanupUsageStats(): Promise<void> {
    try {
      const usage = await this.getData<Record<string, any>>('aiModelUsage') || {};
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      const cleanedUsage: Record<string, any> = {};
      let removedCount = 0;

      Object.keys(usage).forEach(date => {
        if (date >= cutoffStr) {
          cleanedUsage[date] = usage[date];
        } else {
          removedCount++;
        }
      });

      if (removedCount > 0) {
        await this.setData('aiModelUsage', cleanedUsage);
        this.log('info', `✅ 清理了 ${removedCount} 天的过期使用统计数据`);
      }
    } catch (error) {
      this.log('error', '清理使用统计失败:', error);
    }
  }
}

// ============================================================================
// 🎯 单例模式的全局数据管理器
// ============================================================================

let globalDataManagerInstance: UnifiedDataManager | null = null;

export function getGlobalDataManager(): UnifiedDataManager {
  if (!globalDataManagerInstance) {
    globalDataManagerInstance = new UnifiedDataManager();
  }
  return globalDataManagerInstance;
}

// 保持向后兼容
export const globalDataManager = {
  getData: <T>(key: string, forceRefresh?: boolean) =>
    getGlobalDataManager().getData<T>(key, forceRefresh),
  setData: <T>(key: string, data: T) =>
    getGlobalDataManager().setData(key, data),
  preloadCriticalData: () =>
    getGlobalDataManager().preloadCriticalData(),
  cleanupExpiredCache: () =>
    getGlobalDataManager().cleanupExpiredCache(),
  getDataStats: () =>
    getGlobalDataManager().getDataStats(),
  setUserId: (userId: string) =>
    getGlobalDataManager().setUserId(userId),
  getUserTier: () =>
    getGlobalDataManager().getUserTier(),
  getUserAvailableModels: () =>
    getGlobalDataManager().getUserAvailableModels(),
  hasModelPermission: (modelId: string) =>
    getGlobalDataManager().hasModelPermission(modelId),
  getPreferredModel: () =>
    getGlobalDataManager().getPreferredModel(),
  setPreferredModel: (modelId: string) =>
    getGlobalDataManager().setPreferredModel(modelId),
  recordModelUsage: (modelId: string, tokens: number, feature: string) =>
    getGlobalDataManager().recordModelUsage(modelId, tokens, feature),
  getModelUsageStats: () =>
    getGlobalDataManager().getModelUsageStats(),
  getModelRecommendations: () =>
    getGlobalDataManager().getModelRecommendations(),
  cleanupUsageStats: () =>
    getGlobalDataManager().cleanupUsageStats()
};

/**
 * React Hook: 统一数据管理
 */
export function useUnifiedData() {
  return {
    getData: globalDataManager.getData,
    setData: globalDataManager.setData,
    preloadData: globalDataManager.preloadCriticalData,
    cleanupCache: globalDataManager.cleanupExpiredCache,
    getStats: globalDataManager.getDataStats,
    setUserId: globalDataManager.setUserId,
    getUserTier: globalDataManager.getUserTier,
    getUserAvailableModels: globalDataManager.getUserAvailableModels,
    hasModelPermission: globalDataManager.hasModelPermission,
    getPreferredModel: globalDataManager.getPreferredModel,
    setPreferredModel: globalDataManager.setPreferredModel,
    recordModelUsage: globalDataManager.recordModelUsage,
    getModelUsageStats: globalDataManager.getModelUsageStats,
    getModelRecommendations: globalDataManager.getModelRecommendations,
    cleanupUsageStats: globalDataManager.cleanupUsageStats
  };
}

export default UnifiedDataManager;
