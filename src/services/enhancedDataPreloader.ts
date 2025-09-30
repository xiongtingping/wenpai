/**
 * 🚀 增强数据预加载系统
 * 基于完整数据持久化分类报告的预加载策略
 * 
 * 功能特性：
 * - 关键数据预加载（用户登录时立即加载）
 * - 智能优先级管理（高频数据优先）
 * - 并发控制（避免同时发起过多请求）
 * - 缓存预热（提前缓存常用数据）
 * - 渐进式加载（按重要程度分批加载）
 * - 后台刷新（定期更新数据）
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { UnifiedDataManager, globalDataManager } from './unifiedDataManager';
import { logger } from '@/utils/logger';

// 预加载优先级
export enum PreloadPriority {
  CRITICAL = 1,    // 关键数据 - 立即加载
  HIGH = 2,        // 高频数据 - 优先加载  
  MEDIUM = 3,      // 中频数据 - 延迟加载
  LOW = 4          // 低频数据 - 按需加载
}

// 预加载配置项
export interface PreloadConfig {
  key: string;
  priority: PreloadPriority;
  maxRetries?: number;
  retryDelay?: number;
  cacheOnly?: boolean;  // 仅缓存，不从云端获取
  backgroundRefresh?: boolean; // 后台定期刷新
}

// 预加载结果
export interface PreloadResult {
  key: string;
  success: boolean;
  loadTime: number;
  source: 'cache' | 'cloud' | 'fallback';
  error?: string;
}

// 预加载统计
export interface PreloadStats {
  total: number;
  successful: number;
  failed: number;
  averageLoadTime: number;
  cacheHitRate: number;
}

/**
 * 数据预加载配置 - 基于使用频率和重要性
 */
const PRELOAD_CONFIGS: PreloadConfig[] = [
  // === CRITICAL 级别：用户核心数据 ===
  {
    key: 'favorites',
    priority: PreloadPriority.CRITICAL,
    maxRetries: 3,
    backgroundRefresh: true
  },
  {
    key: 'bookmarked-topics', 
    priority: PreloadPriority.CRITICAL,
    maxRetries: 3,
    backgroundRefresh: true
  },
  {
    key: 'preferredAIModel',
    priority: PreloadPriority.CRITICAL,
    maxRetries: 2
  },
  {
    key: 'theme',
    priority: PreloadPriority.CRITICAL,
    cacheOnly: true // 主题设置仅从缓存读取
  },
  {
    key: 'globalSettings',
    priority: PreloadPriority.CRITICAL,
    maxRetries: 3
  },

  // === HIGH 级别：高频使用数据 ===
  {
    key: 'shareHistory',
    priority: PreloadPriority.HIGH,
    maxRetries: 2,
    backgroundRefresh: true
  },
  {
    key: 'selectedPlan',
    priority: PreloadPriority.HIGH,
    cacheOnly: true
  },
  {
    key: 'interestFilters',
    priority: PreloadPriority.HIGH,
    maxRetries: 2
  },
  {
    key: 'emoji-favorites',
    priority: PreloadPriority.HIGH,
    backgroundRefresh: true
  },

  // === MEDIUM 级别：中频数据 ===
  {
    key: 'selectedPlatforms',
    priority: PreloadPriority.MEDIUM,
    cacheOnly: true
  },
  {
    key: 'user-interest-weights',
    priority: PreloadPriority.MEDIUM,
    maxRetries: 1
  },

  // === LOW 级别：缓存数据 ===
  {
    key: 'hotTopicsData',
    priority: PreloadPriority.LOW,
    cacheOnly: true,
    retryDelay: 1000
  },
  {
    key: 'login_redirect_to',
    priority: PreloadPriority.LOW,
    cacheOnly: true
  }
];

/**
 * 增强数据预加载器类
 */
export class EnhancedDataPreloader {
  private dataManager: UnifiedDataManager;
  private loadingPromises = new Map<string, Promise<PreloadResult>>();
  private loadResults = new Map<string, PreloadResult>();
  private lastPreloadTime: number = 0;
  private backgroundRefreshInterval: NodeJS.Timeout | null = null;

  constructor(dataManager: UnifiedDataManager = globalDataManager) {
    this.dataManager = dataManager;
  }

  /**
   * 启动完整预加载流程
   */
  async startPreloadProcess(userId: string): Promise<PreloadStats> {
    const startTime = Date.now();
    
    logger.info(`🚀 开始数据预加载流程，用户: ${userId}`);
    
    // 设置用户ID
    this.dataManager.setUserId(userId);
    
    // 清理之前的结果
    this.loadResults.clear();
    
    // 按优先级分组
    const configsByPriority = this.groupConfigsByPriority();
    
    // 分批并发加载
    for (const [priority, configs] of configsByPriority.entries()) {
      const priorityName = PreloadPriority[priority];
      logger.debug(`📊 加载优先级 ${priorityName}: ${configs.length} 项`);
      
      await this.loadPriorityBatch(configs, priority);
      
      // 关键数据和高频数据之间稍作间隔
      if (priority === PreloadPriority.CRITICAL) {
        await this.delay(50);
      }
    }
    
    // 启动后台刷新
    this.startBackgroundRefresh();
    
    // 记录预加载时间
    this.lastPreloadTime = Date.now();
    
    const stats = this.calculateStats(startTime);
    logger.info(`✅ 预加载完成: ${stats.successful}/${stats.total}, 用时 ${Date.now() - startTime}ms`);
    
    return stats;
  }

  /**
   * 获取单个数据项（带预加载检查）
   */
  async getDataWithPreload<T>(key: string): Promise<T | null> {
    // 如果正在加载中，等待加载完成
    const loadingPromise = this.loadingPromises.get(key);
    if (loadingPromise) {
      await loadingPromise;
    }

    return await this.dataManager.getData<T>(key);
  }

  /**
   * 检查数据是否已预加载
   */
  isPreloaded(key: string): boolean {
    const result = this.loadResults.get(key);
    return result?.success === true;
  }

  /**
   * 获取预加载结果
   */
  getPreloadResult(key: string): PreloadResult | null {
    return this.loadResults.get(key) || null;
  }

  /**
   * 获取所有预加载结果
   */
  getAllPreloadResults(): PreloadResult[] {
    return Array.from(this.loadResults.values());
  }

  /**
   * 强制刷新指定数据
   */
  async refreshData(key: string): Promise<PreloadResult> {
    const config = PRELOAD_CONFIGS.find(c => c.key === key);
    if (!config) {
      throw new Error(`未找到预加载配置: ${key}`);
    }

    return await this.loadSingleItem(config, true);
  }

  /**
   * 停止后台刷新
   */
  stopBackgroundRefresh() {
    if (this.backgroundRefreshInterval) {
      clearInterval(this.backgroundRefreshInterval);
      this.backgroundRefreshInterval = null;
    }
  }

  /**
   * 获取预加载统计信息
   */
  getStats(): PreloadStats | null {
    if (this.loadResults.size === 0) {
      return null;
    }

    return this.calculateStats(this.lastPreloadTime);
  }

  // === 私有方法 ===

  /**
   * 按优先级分组配置
   */
  private groupConfigsByPriority(): Map<PreloadPriority, PreloadConfig[]> {
    const groups = new Map<PreloadPriority, PreloadConfig[]>();
    
    PRELOAD_CONFIGS.forEach(config => {
      if (!groups.has(config.priority)) {
        groups.set(config.priority, []);
      }
      groups.get(config.priority)!.push(config);
    });
    
    // 按优先级排序（数字小的优先）
    return new Map([...groups.entries()].sort(([a], [b]) => a - b));
  }

  /**
   * 加载优先级批次
   */
  private async loadPriorityBatch(
    configs: PreloadConfig[], 
    priority: PreloadPriority
  ): Promise<void> {
    const maxConcurrent = this.getMaxConcurrentForPriority(priority);
    const chunks = this.chunkArray(configs, maxConcurrent);
    
    for (const chunk of chunks) {
      const promises = chunk.map(config => this.loadSingleItem(config));
      await Promise.allSettled(promises);
      
      // 批次之间稍作间隔，避免过载
      if (chunks.length > 1) {
        await this.delay(20);
      }
    }
  }

  /**
   * 加载单个数据项
   */
  private async loadSingleItem(
    config: PreloadConfig, 
    forceRefresh = false
  ): Promise<PreloadResult> {
    const { key, maxRetries = 1, retryDelay = 500, cacheOnly = false } = config;
    
    // 防止重复加载
    if (!forceRefresh && this.loadingPromises.has(key)) {
      return await this.loadingPromises.get(key)!;
    }

    const loadPromise = this.performLoad(config, forceRefresh);
    this.loadingPromises.set(key, loadPromise);

    try {
      const result = await loadPromise;
      this.loadResults.set(key, result);
      return result;
    } finally {
      // 延迟清理promise，避免短时间内重复请求
      setTimeout(() => {
        this.loadingPromises.delete(key);
      }, 1000);
    }
  }

  /**
   * 执行实际加载
   */
  private async performLoad(
    config: PreloadConfig,
    forceRefresh = false
  ): Promise<PreloadResult> {
    const { key, maxRetries = 1, retryDelay = 500, cacheOnly = false } = config;
    const startTime = Date.now();
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let data: any = null;
        let source: 'cache' | 'cloud' | 'fallback' = 'cache';

        if (cacheOnly) {
          // 仅从缓存获取
          data = await this.dataManager.getData(key);
          source = 'cache';
        } else {
          // 智能获取（云端优先）
          data = await this.dataManager.getData(key, forceRefresh);
          source = data ? 'cloud' : 'cache';
        }

        const loadTime = Date.now() - startTime;
        
        return {
          key,
          success: true,
          loadTime,
          source
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(i18n.t('common.errors.加载失败'));
        
        logger.warn(`⚠️ 预加载失败 ${key} (尝试 ${attempt}/${maxRetries}):`, error);
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          await this.delay(retryDelay * attempt);
        }
      }
    }

    // 所有重试都失败，返回失败结果
    return {
      key,
      success: false,
      loadTime: Date.now() - startTime,
      source: 'fallback',
      error: lastError?.message || i18n.t('common.errors.加载失败')
    };
  }

  /**
   * 启动后台刷新
   */
  private startBackgroundRefresh() {
    // 停止之前的刷新
    this.stopBackgroundRefresh();
    
    // 每5分钟刷新一次需要后台刷新的数据
    this.backgroundRefreshInterval = setInterval(async () => {
      const refreshConfigs = PRELOAD_CONFIGS.filter(c => c.backgroundRefresh);
      
      if (refreshConfigs.length > 0) {
        logger.debug(`🔄 后台数据刷新: ${refreshConfigs.length} 项`);
        
        for (const config of refreshConfigs) {
          try {
            await this.loadSingleItem(config, true);
          } catch (error) {
            logger.warn(`后台刷新失败 ${config.key}:`, error);
          }
        }
      }
    }, 5 * 60 * 1000); // 5分钟
  }

  /**
   * 计算统计信息
   */
  private calculateStats(startTime: number): PreloadStats {
    const results = Array.from(this.loadResults.values());
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const totalLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0);
    const cacheHits = results.filter(r => r.source === 'cache').length;

    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      averageLoadTime: results.length > 0 ? totalLoadTime / results.length : 0,
      cacheHitRate: results.length > 0 ? cacheHits / results.length : 0
    };
  }

  /**
   * 获取优先级对应的最大并发数
   */
  private getMaxConcurrentForPriority(priority: PreloadPriority): number {
    switch (priority) {
      case PreloadPriority.CRITICAL: return 3;
      case PreloadPriority.HIGH: return 2;
      case PreloadPriority.MEDIUM: return 2;
      case PreloadPriority.LOW: return 1;
      default: return 1;
    }
  }

  /**
   * 分组数组
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例实例
export const dataPreloader = new EnhancedDataPreloader();

/**
 * React Hook: 数据预加载
 */
export function useDataPreloader() {
  return {
    startPreload: dataPreloader.startPreloadProcess.bind(dataPreloader),
    getData: dataPreloader.getDataWithPreload.bind(dataPreloader),
    isPreloaded: dataPreloader.isPreloaded.bind(dataPreloader),
    refreshData: dataPreloader.refreshData.bind(dataPreloader),
    getStats: dataPreloader.getStats.bind(dataPreloader),
    getResults: dataPreloader.getAllPreloadResults.bind(dataPreloader)
  };
}

export default EnhancedDataPreloader;