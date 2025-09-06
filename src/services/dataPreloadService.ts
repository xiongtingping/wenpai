/**
 * 🚀 数据预加载服务
 * 在用户操作前预加载关键数据，减少等待时间和闪烁
 * 
 * 功能特性：
 * - 路由级数据预加载
 * - 智能预测用户行为
 * - 后台批量数据获取
 * - 内存缓存管理
 */

import { globalDataManager, DATA_CONFIGS } from '@/services/unifiedDataManager';

// 路由数据依赖配置
export const ROUTE_DATA_DEPENDENCIES = {
  '/': ['theme', 'selectedPlan'],
  '/adapt': ['preferredModel', 'shareHistory', 'userSettings'],
  '/creative-studio': ['favorites', 'emojiLikes'],
  '/hot-topics': ['bookmarkedTopics', 'interestFilters'],
  '/profile': ['userSettings', 'theme'],
  '/bookmarks': ['bookmarkedTopics', 'favorites'],
  '/history': ['shareHistory'],
  '/brand-library': ['favorites', 'userSettings']
} as const;

// 预加载优先级
export enum PreloadPriority {
  CRITICAL = 1,    // 关键数据，必须预加载
  HIGH = 2,        // 高优先级，用户可能需要  
  MEDIUM = 3,      // 中优先级，后台预加载
  LOW = 4          // 低优先级，按需加载
}

// 预加载配置
interface PreloadConfig {
  priority: PreloadPriority;
  timeout: number; // 最大等待时间（ms）
  dependencies?: string[]; // 依赖的其他数据键
}

// 预定义预加载配置
const PRELOAD_CONFIGS: Record<string, PreloadConfig> = {
  // 关键数据 - 必须等待完成
  theme: { priority: PreloadPriority.CRITICAL, timeout: 1000 },
  selectedPlan: { priority: PreloadPriority.CRITICAL, timeout: 1000 },
  
  // 高优先级数据 - 影响主要功能
  preferredModel: { priority: PreloadPriority.HIGH, timeout: 2000 },
  userSettings: { priority: PreloadPriority.HIGH, timeout: 2000 },
  favorites: { priority: PreloadPriority.HIGH, timeout: 2000 },
  
  // 中优先级数据 - 增强用户体验  
  bookmarkedTopics: { priority: PreloadPriority.MEDIUM, timeout: 3000 },
  shareHistory: { priority: PreloadPriority.MEDIUM, timeout: 3000 },
  interestFilters: { priority: PreloadPriority.MEDIUM, timeout: 3000 },
  
  // 低优先级数据 - 按需加载
  emojiLikes: { priority: PreloadPriority.LOW, timeout: 5000 }
};

/**
 * 数据预加载服务类
 */
export class DataPreloadService {
  private static instance: DataPreloadService;
  private preloadPromises = new Map<string, Promise<any>>();
  private completedPreloads = new Set<string>();
  private failedPreloads = new Set<string>();

  static getInstance(): DataPreloadService {
    if (!DataPreloadService.instance) {
      DataPreloadService.instance = new DataPreloadService();
    }
    return DataPreloadService.instance;
  }

  /**
   * 为特定路由预加载数据
   */
  async preloadForRoute(route: string, userId: string): Promise<void> {
    const dependencies = ROUTE_DATA_DEPENDENCIES[route as keyof typeof ROUTE_DATA_DEPENDENCIES];
    if (!dependencies) {
      console.log(`📍 路由 ${route} 无预加载依赖`);
      return;
    }

    console.log(`🚀 开始为路由 ${route} 预加载数据:`, dependencies);
    globalDataManager.setUserId(userId);

    // 按优先级分组预加载
    const priorityGroups = this.groupByPriority(dependencies);
    
    // 关键数据必须等待完成
    if (priorityGroups.critical.length > 0) {
      await this.preloadGroup(priorityGroups.critical, true);
    }

    // 高优先级数据并行加载，但不阻塞
    if (priorityGroups.high.length > 0) {
      this.preloadGroup(priorityGroups.high, false);
    }

    // 中低优先级数据后台加载
    setTimeout(() => {
      if (priorityGroups.medium.length > 0) {
        this.preloadGroup(priorityGroups.medium, false);
      }
      if (priorityGroups.low.length > 0) {
        this.preloadGroup(priorityGroups.low, false);
      }
    }, 100);
  }

  /**
   * 智能预加载 - 预测用户行为
   */
  async smartPreload(userId: string, currentRoute: string, userActions: string[]): Promise<void> {
    globalDataManager.setUserId(userId);

    // 基于用户行为预测可能访问的路由
    const predictedRoutes = this.predictNextRoutes(currentRoute, userActions);
    
    console.log('🧠 智能预测路由:', predictedRoutes);

    // 为预测路由预加载数据
    for (const route of predictedRoutes) {
      const dependencies = ROUTE_DATA_DEPENDENCIES[route as keyof typeof ROUTE_DATA_DEPENDENCIES];
      if (dependencies) {
        // 低优先级后台预加载
        setTimeout(() => {
          this.preloadGroup(dependencies, false);
        }, 500);
      }
    }
  }

  /**
   * 批量预加载指定数据
   */
  async batchPreload(dataKeys: string[], waitForCompletion = false): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    const promises = dataKeys.map(async (key) => {
      try {
        const success = await this.preloadSingle(key);
        results.set(key, success);
        return success;
      } catch (error) {
        console.error(`预加载失败 ${key}:`, error);
        results.set(key, false);
        return false;
      }
    });

    if (waitForCompletion) {
      await Promise.allSettled(promises);
    } else {
      // 不等待完成，但记录结果
      Promise.allSettled(promises).then(() => {
        const successful = Array.from(results.values()).filter(Boolean).length;
        console.log(`📊 批量预加载完成: ${successful}/${dataKeys.length}`);
      });
    }

    return results;
  }

  /**
   * 预加载单个数据项
   */
  private async preloadSingle(dataKey: string): Promise<boolean> {
    // 避免重复预加载
    if (this.completedPreloads.has(dataKey) || this.preloadPromises.has(dataKey)) {
      return true;
    }

    const config = PRELOAD_CONFIGS[dataKey] || { 
      priority: PreloadPriority.MEDIUM, 
      timeout: 3000 
    };

    const promise = this.createPreloadPromise(dataKey, config);
    this.preloadPromises.set(dataKey, promise);

    try {
      await promise;
      this.completedPreloads.add(dataKey);
      this.preloadPromises.delete(dataKey);
      console.log(`✅ 预加载成功: ${dataKey}`);
      return true;
    } catch (error) {
      this.failedPreloads.add(dataKey);
      this.preloadPromises.delete(dataKey);
      console.error(`❌ 预加载失败 ${dataKey}:`, error);
      return false;
    }
  }

  /**
   * 创建预加载Promise（带超时）
   */
  private async createPreloadPromise(dataKey: string, config: PreloadConfig): Promise<void> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`预加载超时: ${dataKey}`));
      }, config.timeout);
    });

    const loadPromise = async (): Promise<void> => {
      // 执行数据加载
      await globalDataManager.getData(dataKey);
      console.info(`✅ 预加载完成: ${dataKey}`);
    };

    return Promise.race([loadPromise(), timeoutPromise]);
  }

  /**
   * 按优先级分组数据键
   */
  private groupByPriority(dataKeys: readonly string[]) {
    const groups = {
      critical: [] as string[],
      high: [] as string[],
      medium: [] as string[],
      low: [] as string[]
    };

    dataKeys.forEach(key => {
      const config = PRELOAD_CONFIGS[key];
      if (!config) {
        groups.medium.push(key);
        return;
      }

      switch (config.priority) {
        case PreloadPriority.CRITICAL:
          groups.critical.push(key);
          break;
        case PreloadPriority.HIGH:
          groups.high.push(key);
          break;
        case PreloadPriority.MEDIUM:
          groups.medium.push(key);
          break;
        case PreloadPriority.LOW:
          groups.low.push(key);
          break;
      }
    });

    return groups;
  }

  /**
   * 预加载一组数据
   */
  private async preloadGroup(dataKeys: readonly string[], waitForCompletion: boolean): Promise<void> {
    const promises = dataKeys.map(key => this.preloadSingle(key));

    if (waitForCompletion) {
      await Promise.allSettled(promises);
    } else {
      // 不等待，后台执行
      Promise.allSettled(promises);
    }
  }

  /**
   * 预测用户下一步可能访问的路由
   */
  private predictNextRoutes(currentRoute: string, userActions: string[]): string[] {
    // 简单的路由预测逻辑（可以根据实际使用数据优化）
    const routePredictions: Record<string, string[]> = {
      '/': ['/adapt', '/creative-studio', '/profile'],
      '/adapt': ['/history', '/brand-library'],
      '/creative-studio': ['/bookmarks', '/hot-topics'],
      '/hot-topics': ['/bookmarks', '/adapt'],
      '/profile': ['/adapt', '/creative-studio'],
      '/brand-library': ['/adapt', '/creative-studio']
    };

    // 基于用户最近行为调整预测
    const recentActions = userActions.slice(-10);
    let predictions = routePredictions[currentRoute] || [];

    // 如果用户频繁使用某个功能，提高其预测权重
    if (recentActions.filter(action => action.includes('adapt')).length > 3) {
      predictions = ['/adapt', ...predictions.filter(r => r !== '/adapt')];
    }

    if (recentActions.filter(action => action.includes('creative')).length > 3) {
      predictions = ['/creative-studio', ...predictions.filter(r => r !== '/creative-studio')];
    }

    return predictions.slice(0, 3); // 限制预测数量
  }

  /**
   * 获取预加载统计信息
   */
  getStats() {
    return {
      completed: this.completedPreloads.size,
      failed: this.failedPreloads.size,
      inProgress: this.preloadPromises.size,
      completedKeys: Array.from(this.completedPreloads),
      failedKeys: Array.from(this.failedPreloads)
    };
  }

  /**
   * 清理完成的预加载记录
   */
  cleanup() {
    this.completedPreloads.clear();
    this.failedPreloads.clear();
    this.preloadPromises.clear();
    console.log('🧹 预加载服务已清理');
  }

  /**
   * 检查数据是否已预加载
   */
  isPreloaded(dataKey: string): boolean {
    return this.completedPreloads.has(dataKey);
  }

  /**
   * 等待特定数据预加载完成
   */
  async waitForPreload(dataKey: string, timeout = 5000): Promise<boolean> {
    if (this.completedPreloads.has(dataKey)) {
      return true;
    }

    if (this.failedPreloads.has(dataKey)) {
      return false;
    }

    const promise = this.preloadPromises.get(dataKey);
    if (!promise) {
      // 开始预加载
      await this.preloadSingle(dataKey);
      return this.completedPreloads.has(dataKey);
    }

    // 等待现有的预加载完成
    try {
      await Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('等待超时')), timeout))
      ]);
      return true;
    } catch {
      return false;
    }
  }
}

// 导出单例实例
export const dataPreloadService = DataPreloadService.getInstance();

/**
 * React Hook: 数据预加载
 */
export function useDataPreloader() {
  const preloadForRoute = (route: string, userId: string) => {
    return dataPreloadService.preloadForRoute(route, userId);
  };

  const smartPreload = (userId: string, currentRoute: string, userActions: string[]) => {
    return dataPreloadService.smartPreload(userId, currentRoute, userActions);
  };

  const batchPreload = (dataKeys: string[], wait = false) => {
    return dataPreloadService.batchPreload(dataKeys, wait);
  };

  const waitForData = (dataKey: string, timeout?: number) => {
    return dataPreloadService.waitForPreload(dataKey, timeout);
  };

  const isPreloaded = (dataKey: string) => {
    return dataPreloadService.isPreloaded(dataKey);
  };

  const getStats = () => {
    return dataPreloadService.getStats();
  };

  return {
    preloadForRoute,
    smartPreload,
    batchPreload,
    waitForData,
    isPreloaded,
    getStats
  };
}

export default DataPreloadService;