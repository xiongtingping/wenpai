/**
 * 🗄️ 统一数据管理器
 * 整合localStorage、Zustand persist、Supabase三层存储架构
 * 
 * 解决问题：
 * - 数据存储分散，访问不一致
 * - 加载闪烁问题
 * - 跨设备同步困难
 * - 数据丢失风险
 */

import { createDataService, TABLE_NAMES } from '@/services/supabaseDataService';
import { logger } from '@/utils/logger';
import { 
  getAvailableModelsForTier, 
  getModelInfo, 
  isModelAvailableForTier,
  getModelsByTier,
  getAllModels,
  type AIModel 
} from '@/config/aiModels';
import { getUserTier as getUserTierFromStorage } from '@/utils/modelPermissions';
import { tokenUsageService } from './tokenUsageService';
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
  // 🚫 移除 fallbackLayer：不使用降级方案，严格按照数据分类访问
}

/**
 * 预定义数据配置
 * 
 * 数据存储分类原则：
 * 
 * 1. USER_CRITICAL (用户关键数据) -> Supabase 云端存储
 *    - 用户的个人数据、偏好设置、收藏夹等
 *    - 需要跨设备同步和持久化存储
 *    - 必须要求用户登录后才能访问
 * 
 * 2. APP_STATE (应用状态数据) -> Zustand 状态管理
 *    - 应用的临时状态、UI 状态、当前会话数据
 *    - 在应用运行期间保持，不持久化存储
 *    - 刷新页面后重置为默认值
 * 
 * 3. CACHE_TEMP (缓存临时数据) -> localStorage 本地缓存
 *    - 临时缓存、会话数据、本地快照等
 *    - 有 TTL 过期时间，可以被清理
 *    - 不需要跨设备同步
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
    syncToCloud: true // 跨设备同步主题
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
 * 统一数据管理器类
 */
export class UnifiedDataManager {
  private userId: string | null = null;
  private supabaseService: any = null;
  private cacheTimestamps = new Map<string, number>();

  constructor(userId?: string) {
    if (userId) {
      this.setUserId(userId);
    }
  }

  /**
   * 设置用户ID并初始化云端服务
   */
  setUserId(userId: string) {
    this.userId = userId;
    try {
      this.supabaseService = createDataService(userId, TABLE_NAMES.USER_BRAND_CORPUS);
      console.log('✅ 统一数据管理器已初始化，用户:', userId);
    } catch (error) {
      console.error('❌ Supabase服务初始化失败:', error);
    }
  }

  /**
   * 智能数据获取 - 缓存优先策略
   */
  async getData<T>(key: string, forceRefresh = false): Promise<T | null> {
    const config = DATA_CONFIGS[key];
    if (!config) {
      console.warn(`⚠️ 未知数据键: ${key}，使用缓存模式`);
      return this.getCacheData<T>(key);
    }

    try {
      // 1. 强制刷新时直接从云端获取
      if (forceRefresh && config.category === DataCategory.USER_CRITICAL) {
        return await this.getCloudData<T>(key);
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
            console.warn(`⚠️ 异步云端更新失败 ${key}:`, error);
          });
        }
        return cached;
      }

      // 3. 根据数据类型从对应层获取
      switch (config.category) {
        case DataCategory.USER_CRITICAL:
          return await this.getCloudData<T>(key);
          
        case DataCategory.APP_STATE:
          return this.getStateData<T>(key);
          
        case DataCategory.CACHE_TEMP:
          return this.getCacheData<T>(key);
          
        default:
          return null;
      }
    } catch (error) {
      console.error(`❌ 获取数据失败 ${key}:`, error);
      
      // 🚫 移除降级策略：严格按照数据分类访问，不使用降级方案
      return null;
    }
  }

  /**
   * 智能数据保存
   */
  async setData<T>(key: string, data: T): Promise<boolean> {
    const config = DATA_CONFIGS[key];
    if (!config) {
      console.error(`❌ 未知数据键: ${key}，拒绝保存 - 需要在 DATA_CONFIGS 中配置`);
      return false;
    }

    try {
      let success = false;

      // 根据配置保存到对应层
      switch (config.category) {
        case DataCategory.USER_CRITICAL:
          success = await this.setCloudData(key, data);
          // 同时更新缓存以提高访问速度
          this.setCacheData(key, data);
          break;
          
        case DataCategory.APP_STATE:
          success = this.setStateData(key, data);
          break;
          
        case DataCategory.CACHE_TEMP:
          success = this.setCacheData(key, data);
          break;
      }

      // 额外的云端同步（如果配置了）
      if (success && config.syncToCloud && config.category !== DataCategory.USER_CRITICAL) {
        this.setCloudData(key, data).catch(error => {
          console.warn(`⚠️ 云端同步失败 ${key}:`, error);
        });
      }

      return success;
    } catch (error) {
      console.error(`❌ 保存数据失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 从云端获取数据
   */
  private async getCloudData<T>(key: string): Promise<T | null> {
    if (!this.supabaseService || !this.userId) {
      console.warn('⚠️ 云端服务不可用，无法获取数据:', key);
      return null;
    }

    try {
      // 🔧 FIX: 使用正确的数据库字段名
      const result = await this.supabaseService.findMany({
        filters: { brand_name: `user_${key}` },
        limit: 1,
        orderBy: 'updated_at',
        orderDirection: 'desc'
      });

      if (result.data && result.data.length > 0) {
        const data = JSON.parse(result.data[0].brand_description || '{}');
        this.updateCache(key, data); // 更新缓存
        return data;
      }

      return null;
    } catch (error) {
      console.error(`❌ 云端获取数据失败 ${key}:`, error);
      return null;
    }
  }

  /**
   * 保存数据到云端
   */
  private async setCloudData<T>(key: string, data: T): Promise<boolean> {
    if (!this.supabaseService || !this.userId) {
      console.warn('⚠️ 云端服务不可用，无法保存数据:', key);
      return false;
    }

    try {
      // 检查是否已存在
      const existing = await this.supabaseService.findMany({
        filters: { brand_name: `user_${key}` },
        limit: 1
      });

      const recordData = {
        brand_name: `user_${key}`,
        // 🔧 FIX: 暂时使用可能存在的字段名
        brand_description: JSON.stringify(data),
        metadata: JSON.stringify({
          dataKey: key,
          lastUpdated: new Date().toISOString(),
          version: '1.0'
        })
      };

      if (existing.data && existing.data.length > 0) {
        await this.supabaseService.update(existing.data[0].id, recordData);
      } else {
        await this.supabaseService.create(recordData);
      }

      console.log(`✅ 云端保存成功: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ 云端保存失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 从状态层获取数据（Zustand stores）
   * 严格按照配置的存储层级访问，不使用降级方案
   */
  private getStateData<T>(key: string): T | null {
    // 🚫 移除降级方案：状态数据只从应用状态中获取
    // 这里应该集成具体的 Zustand stores
    // 目前返回 null，表示状态层暂未初始化或数据不存在
    
    console.debug(`📝 状态数据访问: ${key} - 需要集成 Zustand store`);
    return null;
  }

  /**
   * 保存数据到状态层
   * 严格按照配置的存储层级保存，不使用降级方案
   */
  private setStateData<T>(key: string, data: T): boolean {
    // 🚫 移除降级方案：状态数据只保存到应用状态中
    // 这里应该集成具体的 Zustand stores
    // 目前返回 false，表示状态层保存失败或暂未实现
    
    console.debug(`📝 状态数据保存: ${key} - 需要集成 Zustand store`);
    return false;
  }

  /**
   * 从缓存层获取数据
   */
  private getCacheData<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`❌ 缓存读取失败 ${key}:`, error);
      return null;
    }
  }

  /**
   * 保存数据到缓存层
   */
  private setCacheData<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.cacheTimestamps.set(key, Date.now());
      return true;
    } catch (error) {
      console.error(`❌ 缓存保存失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 从指定层获取数据
   */
  private async getDataFromLayer<T>(key: string, layer: StorageLayer): Promise<T | null> {
    switch (layer) {
      case StorageLayer.CLOUD:
        return await this.getCloudData<T>(key);
      case StorageLayer.STATE:
        return this.getStateData<T>(key);
      case StorageLayer.CACHE:
        return this.getCacheData<T>(key);
      default:
        return null;
    }
  }

  /**
   * 更新缓存（带时间戳）
   */
  private updateCache<T>(key: string, data: T): void {
    this.setCacheData(key, data);
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
    if (!this.userId) {
      console.warn('⚠️ 用户未登录，跳过数据预加载');
      return;
    }

    const criticalKeys = Object.keys(DATA_CONFIGS).filter(
      key => DATA_CONFIGS[key].category === DataCategory.USER_CRITICAL
    );

    console.log('🔄 开始预加载关键数据:', criticalKeys);

    const promises = criticalKeys.map(async (key) => {
      try {
        await this.getData(key);
        return { key, success: true };
      } catch (error) {
        console.error(`预加载失败 ${key}:`, error);
        return { key, success: false, error };
      }
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ 数据预加载完成: ${successful}/${criticalKeys.length}`);
  }

  /**
   * 清理过期缓存
   */
  cleanupExpiredCache(): void {
    console.log('🧹 开始清理过期缓存...');
    let cleanedCount = 0;

    Object.keys(DATA_CONFIGS).forEach(key => {
      if (this.isExpired(key)) {
        localStorage.removeItem(key);
        this.cacheTimestamps.delete(key);
        cleanedCount++;
      }
    });

    console.log(`✅ 清理完成，删除了 ${cleanedCount} 个过期缓存项`);
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

  /**
   * AI模型相关管理方法
   */

  /**
   * 获取用户订阅层级
   */
  async getUserTier(): Promise<SubscriptionTier> {
    try {
      const cachedTier = await this.getData<SubscriptionTier>('subscriptionTier');
      if (cachedTier) {
        return cachedTier;
      }
      
      // 从存储获取层级
      const tier = getUserTierFromStorage();
      await this.setData('subscriptionTier', tier);
      return tier;
    } catch (error) {
      console.error('获取用户层级失败:', error);
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
      // 检查权限
      const hasPermission = await this.hasModelPermission(preferred);
      if (hasPermission) {
        return preferred;
      }
    }
    
    // 返回第一个可用模型
    const availableModels = await this.getUserAvailableModels();
    return availableModels[0]?.id || 'gpt-4o-mini';
  }

  /**
   * 设置用户首选AI模型
   */
  async setPreferredModel(modelId: string): Promise<boolean> {
    const hasPermission = await this.hasModelPermission(modelId);
    if (!hasPermission) {
      console.warn(`用户无权限使用模型: ${modelId}`);
      return false;
    }
    
    return await this.setData('preferredModel', modelId);
  }

  /**
   * 记录AI模型使用情况
   */
  async recordModelUsage(modelId: string, tokens: number, feature: string): Promise<void> {
    try {
      const usage = await this.getData<Record<string, any>>('aiModelUsage') || {};
      const today = new Date().toISOString().split('T')[0];
      
      if (!usage[today]) {
        usage[today] = {};
      }
      
      if (!usage[today][modelId]) {
        usage[today][modelId] = { tokens: 0, calls: 0, features: {} };
      }
      
      usage[today][modelId].tokens += tokens;
      usage[today][modelId].calls += 1;
      
      if (!usage[today][modelId].features[feature]) {
        usage[today][modelId].features[feature] = 0;
      }
      usage[today][modelId].features[feature] += 1;
      
      await this.setData('aiModelUsage', usage);
    } catch (error) {
      console.error('记录模型使用失败:', error);
    }
  }

  /**
   * 获取AI模型使用统计
   */
  async getModelUsageStats(): Promise<{
    today: Record<string, any>;
    thisMonth: Record<string, any>;
    total: Record<string, any>;
    favoriteModel: string;
    totalCalls: number;
    totalTokens: number;
  }> {
    try {
      const usage = await this.getData<Record<string, any>>('aiModelUsage') || {};
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const todayStats = usage[today] || {};
      const monthlyStats: Record<string, any> = {};
      const totalStats: Record<string, any> = {};
      
      let totalCalls = 0;
      let totalTokens = 0;
      const modelCalls: Record<string, number> = {};
      
      // 汇总所有统计
      Object.keys(usage).forEach(date => {
        const isThisMonth = date.startsWith(thisMonth);
        
        Object.keys(usage[date]).forEach(modelId => {
          const modelStats = usage[date][modelId];
          
          // 月度统计
          if (isThisMonth) {
            if (!monthlyStats[modelId]) {
              monthlyStats[modelId] = { tokens: 0, calls: 0, features: {} };
            }
            monthlyStats[modelId].tokens += modelStats.tokens;
            monthlyStats[modelId].calls += modelStats.calls;
          }
          
          // 总体统计
          if (!totalStats[modelId]) {
            totalStats[modelId] = { tokens: 0, calls: 0, features: {} };
          }
          totalStats[modelId].tokens += modelStats.tokens;
          totalStats[modelId].calls += modelStats.calls;
          
          // 计算最常用模型
          modelCalls[modelId] = (modelCalls[modelId] || 0) + modelStats.calls;
          totalCalls += modelStats.calls;
          totalTokens += modelStats.tokens;
        });
      });
      
      const favoriteModel = Object.keys(modelCalls).reduce((a, b) => 
        modelCalls[a] > modelCalls[b] ? a : b, Object.keys(modelCalls)[0] || 'gpt-4o-mini'
      );
      
      return {
        today: todayStats,
        thisMonth: monthlyStats,
        total: totalStats,
        favoriteModel,
        totalCalls,
        totalTokens
      };
    } catch (error) {
      console.error('获取模型使用统计失败:', error);
      return {
        today: {},
        thisMonth: {},
        total: {},
        favoriteModel: 'gpt-4o-mini',
        totalCalls: 0,
        totalTokens: 0
      };
    }
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
      const usageStats = await this.getModelUsageStats();
      
      // 基于使用习惯和订阅层级推荐
      const recommendations: AIModel[] = [];
      const reasons: string[] = [];
      
      // 推荐逻辑
      if (userTier === 'trial') {
        const trialModels = availableModels.filter(m => m.tier === 'low');
        recommendations.push(...trialModels.slice(0, 2));
        reasons.push('基于您的体验版订阅，推荐高性价比模型');
      } else {
        // 推荐最常用的模型
        if (usageStats.favoriteModel && getModelInfo(usageStats.favoriteModel)) {
          const favoriteModel = getModelInfo(usageStats.favoriteModel);
          if (favoriteModel && availableModels.some(m => m.id === favoriteModel.id)) {
            recommendations.push(favoriteModel);
            reasons.push('基于您的使用习惯推荐');
          }
        }
        
        // 推荐最新的高级模型
        const latestModels = availableModels
          .filter(m => m.tier === 'high')
          .slice(0, 2);
        recommendations.push(...latestModels);
        reasons.push('为您推荐最新的高级AI模型');
      }
      
      return {
        recommended: recommendations,
        reasons
      };
    } catch (error) {
      console.error('获取模型推荐失败:', error);
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
      cutoffDate.setDate(cutoffDate.getDate() - 90); // 保留90天数据
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
        console.log(`✅ 清理了 ${removedCount} 天的过期使用统计数据`);
      }
    } catch (error) {
      console.error('清理使用统计失败:', error);
    }
  }
}

/**
 * 单例模式的全局数据管理器 - 延迟创建避免TDZ
 */
let globalDataManagerInstance: UnifiedDataManager | null = null;

export function getGlobalDataManager(): UnifiedDataManager {
  if (!globalDataManagerInstance) {
    globalDataManagerInstance = new UnifiedDataManager();
  }
  return globalDataManagerInstance;
}

// 保持向后兼容
export const globalDataManager = {
  getData: (...args: any[]) => getGlobalDataManager().getData(...args),
  setData: (...args: any[]) => getGlobalDataManager().setData(...args),
  preloadCriticalData: (...args: any[]) => getGlobalDataManager().preloadCriticalData(...args),
  cleanupExpiredCache: (...args: any[]) => getGlobalDataManager().cleanupExpiredCache(...args),
  getDataStats: (...args: any[]) => getGlobalDataManager().getDataStats(...args),
  setUserId: (...args: any[]) => getGlobalDataManager().setUserId(...args),
  getUserTier: (...args: any[]) => getGlobalDataManager().getUserTier(...args),
  getUserAvailableModels: (...args: any[]) => getGlobalDataManager().getUserAvailableModels(...args),
  hasModelPermission: (...args: any[]) => getGlobalDataManager().hasModelPermission(...args),
  getPreferredModel: (...args: any[]) => getGlobalDataManager().getPreferredModel(...args),
  setPreferredModel: (...args: any[]) => getGlobalDataManager().setPreferredModel(...args),
  recordModelUsage: (...args: any[]) => getGlobalDataManager().recordModelUsage(...args),
  getModelUsageStats: (...args: any[]) => getGlobalDataManager().getModelUsageStats(...args),
  getModelRecommendations: (...args: any[]) => getGlobalDataManager().getModelRecommendations(...args),
  cleanupUsageStats: (...args: any[]) => getGlobalDataManager().cleanupUsageStats(...args)
};

/**
 * React Hook: 统一数据管理
 */
export function useUnifiedData() {
  return {
    // 基础数据管理
    getData: globalDataManager.getData.bind(globalDataManager),
    setData: globalDataManager.setData.bind(globalDataManager),
    preloadData: globalDataManager.preloadCriticalData.bind(globalDataManager),
    cleanupCache: globalDataManager.cleanupExpiredCache.bind(globalDataManager),
    getStats: globalDataManager.getDataStats.bind(globalDataManager),
    setUserId: globalDataManager.setUserId.bind(globalDataManager),
    
    // AI模型管理
    getUserTier: globalDataManager.getUserTier.bind(globalDataManager),
    getUserAvailableModels: globalDataManager.getUserAvailableModels.bind(globalDataManager),
    hasModelPermission: globalDataManager.hasModelPermission.bind(globalDataManager),
    getPreferredModel: globalDataManager.getPreferredModel.bind(globalDataManager),
    setPreferredModel: globalDataManager.setPreferredModel.bind(globalDataManager),
    recordModelUsage: globalDataManager.recordModelUsage.bind(globalDataManager),
    getModelUsageStats: globalDataManager.getModelUsageStats.bind(globalDataManager),
    getModelRecommendations: globalDataManager.getModelRecommendations.bind(globalDataManager),
    cleanupUsageStats: globalDataManager.cleanupUsageStats.bind(globalDataManager)
  };
}

export default UnifiedDataManager;