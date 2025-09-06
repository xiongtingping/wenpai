/**
 * 订阅状态缓存策略服务
 * @description 提供智能的订阅状态缓存机制，优化性能和用户体验
 */

import { logger } from '@/utils/logger';
import type { SubscriptionTier, UserSubscription } from '@/types/subscription';

/**
 * 缓存策略类型
 */
export enum CacheStrategy {
  /** 内存优先 */
  MEMORY_FIRST = 'memory_first',
  /** 本地存储优先 */
  STORAGE_FIRST = 'storage_first',
  /** 网络优先 */
  NETWORK_FIRST = 'network_first',
  /** 仅缓存 */
  CACHE_ONLY = 'cache_only',
  /** 缓存并刷新 */
  CACHE_AND_REFRESH = 'cache_and_refresh'
}

/**
 * 缓存项接口
 */
export interface CacheItem<T> {
  /** 数据 */
  data: T;
  /** 创建时间 */
  createdAt: number;
  /** 最后访问时间 */
  lastAccessedAt: number;
  /** 过期时间 */
  expiresAt: number;
  /** 版本号 */
  version: number;
  /** 数据来源 */
  source: 'network' | 'storage' | 'memory' | 'fallback';
  /** 校验和 */
  checksum?: string;
  /** 访问次数 */
  accessCount: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 内存TTL（毫秒） */
  memoryTTL: number;
  /** 存储TTL（毫秒） */
  storageTTL: number;
  /** 最大内存缓存数量 */
  maxMemoryItems: number;
  /** 最大存储缓存数量 */
  maxStorageItems: number;
  /** 是否启用版本检查 */
  enableVersionCheck: boolean;
  /** 是否启用自动刷新 */
  enableAutoRefresh: boolean;
  /** 自动刷新间隔（毫秒） */
  autoRefreshInterval: number;
  /** 是否启用预加载 */
  enablePreload: boolean;
}

/**
 * 订阅状态缓存项
 */
export interface SubscriptionCacheItem extends CacheItem<any> {
  /** 用户ID */
  userId: string;
  /** 订阅层级 */
  tier: SubscriptionTier;
  /** 是否过期 */
  isExpired: boolean;
  /** 到期时间 */
  expiresAt: number;
  /** 状态标签 */
  statusLabel: string;
  /** 需要提醒 */
  needsAlert: boolean;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 内存命中率 */
  memoryHitRate: number;
  /** 存储命中率 */
  storageHitRate: number;
  /** 总请求数 */
  totalRequests: number;
  /** 缓存命中数 */
  cacheHits: number;
  /** 网络请求数 */
  networkRequests: number;
  /** 平均响应时间 */
  avgResponseTime: number;
  /** 缓存大小 */
  cacheSize: {
    memory: number;
    storage: number;
  };
}

/**
 * 默认缓存配置
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  memoryTTL: 5 * 60 * 1000,        // 5分钟内存缓存
  storageTTL: 30 * 60 * 1000,      // 30分钟存储缓存
  maxMemoryItems: 100,             // 最多100个内存缓存项
  maxStorageItems: 500,            // 最多500个存储缓存项
  enableVersionCheck: true,        // 启用版本检查
  enableAutoRefresh: true,         // 启用自动刷新
  autoRefreshInterval: 10 * 60 * 1000, // 10分钟自动刷新
  enablePreload: false             // 禁用预加载（避免不必要的请求）
};

/**
 * 订阅状态缓存策略服务
 */
export class SubscriptionCacheStrategy {
  private static instance: SubscriptionCacheStrategy;
  private config: CacheConfig;
  private memoryCache: Map<string, SubscriptionCacheItem> = new Map();
  private stats: CacheStats = {
    memoryHitRate: 0,
    storageHitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
    networkRequests: 0,
    avgResponseTime: 0,
    cacheSize: { memory: 0, storage: 0 }
  };
  private autoRefreshTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.startPeriodicCleanup();
  }

  static getInstance(config?: Partial<CacheConfig>): SubscriptionCacheStrategy {
    if (!SubscriptionCacheStrategy.instance) {
      SubscriptionCacheStrategy.instance = new SubscriptionCacheStrategy(config);
    }
    return SubscriptionCacheStrategy.instance;
  }

  /**
   * 获取缓存项
   */
  async get<T>(
    key: string, 
    strategy: CacheStrategy = CacheStrategy.MEMORY_FIRST,
    fetchFn?: () => Promise<T>
  ): Promise<T | null> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      switch (strategy) {
        case CacheStrategy.MEMORY_FIRST:
          return await this.getMemoryFirst(key, fetchFn);
          
        case CacheStrategy.STORAGE_FIRST:
          return await this.getStorageFirst(key, fetchFn);
          
        case CacheStrategy.NETWORK_FIRST:
          return await this.getNetworkFirst(key, fetchFn);
          
        case CacheStrategy.CACHE_ONLY:
          return await this.getCacheOnly(key);
          
        case CacheStrategy.CACHE_AND_REFRESH:
          return await this.getCacheAndRefresh(key, fetchFn);
          
        default:
          return await this.getMemoryFirst(key, fetchFn);
      }
    } finally {
      const endTime = Date.now();
      this.updateResponseTime(endTime - startTime);
    }
  }

  /**
   * 设置缓存项
   */
  async set<T>(
    key: string, 
    data: T, 
    source: 'network' | 'storage' | 'memory' | 'fallback' = 'network',
    customTTL?: number
  ): Promise<void> {
    const now = Date.now();
    const memoryTTL = customTTL || this.config.memoryTTL;
    const storageTTL = customTTL || this.config.storageTTL;

    const cacheItem: CacheItem<T> = {
      data,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: now + memoryTTL,
      version: this.generateVersion(),
      source,
      checksum: this.calculateChecksum(data),
      accessCount: 1
    };

    // 设置内存缓存
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      this.evictOldestMemoryItem();
    }
    this.memoryCache.set(key, cacheItem as SubscriptionCacheItem);

    // 设置存储缓存
    try {
      const storageItem = {
        ...cacheItem,
        expiresAt: now + storageTTL
      };
      localStorage.setItem(
        this.getStorageKey(key), 
        JSON.stringify(storageItem)
      );
      this.cleanupStorage();
    } catch (error) {
      logger.warn('存储缓存设置失败:', error);
    }

    // 设置自动刷新
    if (this.config.enableAutoRefresh) {
      this.setupAutoRefresh(key);
    }

    this.updateCacheSize();
  }

  /**
   * 删除缓存项
   */
  async delete(key: string): Promise<void> {
    // 删除内存缓存
    this.memoryCache.delete(key);
    
    // 删除存储缓存
    try {
      localStorage.removeItem(this.getStorageKey(key));
    } catch (error) {
      logger.warn('删除存储缓存失败:', error);
    }

    // 清除自动刷新
    const timer = this.autoRefreshTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.autoRefreshTimers.delete(key);
    }

    this.updateCacheSize();
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    // 清空内存缓存
    this.memoryCache.clear();

    // 清空存储缓存
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.getStoragePrefix())) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      logger.warn('清空存储缓存失败:', error);
    }

    // 清除所有自动刷新
    for (const timer of this.autoRefreshTimers.values()) {
      clearTimeout(timer);
    }
    this.autoRefreshTimers.clear();

    this.updateCacheSize();
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 预热缓存
   */
  async warmup(keys: string[], fetchFn: (key: string) => Promise<any>): Promise<void> {
    if (!this.config.enablePreload) {
      return;
    }

    const promises = keys.map(async key => {
      try {
        const data = await fetchFn(key);
        await this.set(key, data, 'network');
      } catch (error) {
        logger.warn(`预热缓存失败: ${key}`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * 内存优先策略
   */
  private async getMemoryFirst<T>(key: string, fetchFn?: () => Promise<T>): Promise<T | null> {
    // 检查内存缓存
    const memoryItem = this.getFromMemory<T>(key);
    if (memoryItem) {
      this.stats.cacheHits++;
      return memoryItem;
    }

    // 检查存储缓存
    const storageItem = await this.getFromStorage<T>(key);
    if (storageItem) {
      // 提升到内存缓存
      await this.set(key, storageItem, 'storage');
      this.stats.cacheHits++;
      return storageItem;
    }

    // 从网络获取
    if (fetchFn) {
      try {
        this.stats.networkRequests++;
        const data = await fetchFn();
        await this.set(key, data, 'network');
        return data;
      } catch (error) {
        logger.error('网络获取失败:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * 存储优先策略
   */
  private async getStorageFirst<T>(key: string, fetchFn?: () => Promise<T>): Promise<T | null> {
    // 检查存储缓存
    const storageItem = await this.getFromStorage<T>(key);
    if (storageItem) {
      this.stats.cacheHits++;
      return storageItem;
    }

    // 检查内存缓存
    const memoryItem = this.getFromMemory<T>(key);
    if (memoryItem) {
      this.stats.cacheHits++;
      return memoryItem;
    }

    // 从网络获取
    if (fetchFn) {
      try {
        this.stats.networkRequests++;
        const data = await fetchFn();
        await this.set(key, data, 'network');
        return data;
      } catch (error) {
        logger.error('网络获取失败:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * 网络优先策略
   */
  private async getNetworkFirst<T>(key: string, fetchFn?: () => Promise<T>): Promise<T | null> {
    if (fetchFn) {
      try {
        this.stats.networkRequests++;
        const data = await fetchFn();
        await this.set(key, data, 'network');
        return data;
      } catch (error) {
        logger.warn('网络获取失败，尝试缓存:', error);
      }
    }

    // 网络失败，尝试缓存
    const memoryItem = this.getFromMemory<T>(key);
    if (memoryItem) {
      this.stats.cacheHits++;
      return memoryItem;
    }

    const storageItem = await this.getFromStorage<T>(key);
    if (storageItem) {
      this.stats.cacheHits++;
      return storageItem;
    }

    return null;
  }

  /**
   * 仅缓存策略
   */
  private async getCacheOnly<T>(key: string): Promise<T | null> {
    const memoryItem = this.getFromMemory<T>(key);
    if (memoryItem) {
      this.stats.cacheHits++;
      return memoryItem;
    }

    const storageItem = await this.getFromStorage<T>(key);
    if (storageItem) {
      this.stats.cacheHits++;
      return storageItem;
    }

    return null;
  }

  /**
   * 缓存并刷新策略
   */
  private async getCacheAndRefresh<T>(key: string, fetchFn?: () => Promise<T>): Promise<T | null> {
    // 立即返回缓存
    const cachedData = await this.getCacheOnly<T>(key);
    
    // 后台刷新
    if (fetchFn) {
      this.refreshInBackground(key, fetchFn);
    }

    return cachedData;
  }

  /**
   * 从内存获取
   */
  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    // 更新访问信息
    item.lastAccessedAt = now;
    item.accessCount++;

    return item.data as T;
  }

  /**
   * 从存储获取
   */
  private async getFromStorage<T>(key: string): Promise<T | null> {
    try {
      const stored = localStorage.getItem(this.getStorageKey(key));
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      const now = Date.now();
      
      if (now > item.expiresAt) {
        localStorage.removeItem(this.getStorageKey(key));
        return null;
      }

      return item.data;
    } catch (error) {
      logger.warn('从存储获取缓存失败:', error);
      return null;
    }
  }

  /**
   * 后台刷新
   */
  private async refreshInBackground<T>(key: string, fetchFn: () => Promise<T>): Promise<void> {
    try {
      const data = await fetchFn();
      await this.set(key, data, 'network');
    } catch (error) {
      logger.warn('后台刷新失败:', error);
    }
  }

  /**
   * 设置自动刷新
   */
  private setupAutoRefresh(key: string): void {
    const existingTimer = this.autoRefreshTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      // 触发刷新事件
      window.dispatchEvent(new CustomEvent('cache-auto-refresh', { detail: key }));
    }, this.config.autoRefreshInterval);

    this.autoRefreshTimers.set(key, timer);
  }

  /**
   * 清理过期项
   */
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupMemory();
      this.cleanupStorage();
      this.updateStats();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  /**
   * 清理内存
   */
  private cleanupMemory(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * 清理存储
   */
  private cleanupStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      const prefix = this.getStoragePrefix();
      let storageCount = 0;

      for (const key of keys) {
        if (key.startsWith(prefix)) {
          storageCount++;
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const item = JSON.parse(stored);
              if (Date.now() > item.expiresAt) {
                localStorage.removeItem(key);
                storageCount--;
              }
            }
          } catch (error) {
            localStorage.removeItem(key);
            storageCount--;
          }
        }
      }

      // 如果超出限制，删除最旧的项目
      if (storageCount > this.config.maxStorageItems) {
        const items = keys
          .filter(k => k.startsWith(prefix))
          .map(k => {
            try {
              const stored = localStorage.getItem(k);
              return stored ? { key: k, item: JSON.parse(stored) } : null;
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .sort((a, b) => a!.item.createdAt - b!.item.createdAt);

        const itemsToRemove = items.slice(0, storageCount - this.config.maxStorageItems);
        for (const { key } of itemsToRemove) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      logger.warn('清理存储失败:', error);
    }
  }

  /**
   * 淘汰最旧的内存项
   */
  private evictOldestMemoryItem(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.lastAccessedAt < oldestTime) {
        oldestTime = item.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.memoryHitRate = (this.stats.cacheHits / this.stats.totalRequests) * 100;
      this.stats.storageHitRate = this.stats.memoryHitRate; // 简化计算
    }
  }

  /**
   * 更新响应时间
   */
  private updateResponseTime(time: number): void {
    if (this.stats.avgResponseTime === 0) {
      this.stats.avgResponseTime = time;
    } else {
      this.stats.avgResponseTime = (this.stats.avgResponseTime + time) / 2;
    }
  }

  /**
   * 更新缓存大小
   */
  private updateCacheSize(): void {
    this.stats.cacheSize.memory = this.memoryCache.size;
    
    try {
      const keys = Object.keys(localStorage);
      this.stats.cacheSize.storage = keys.filter(k => 
        k.startsWith(this.getStoragePrefix())
      ).length;
    } catch {
      this.stats.cacheSize.storage = 0;
    }
  }

  /**
   * 生成版本号
   */
  private generateVersion(): number {
    return Date.now();
  }

  /**
   * 计算校验和
   */
  private calculateChecksum(data: any): string {
    return btoa(JSON.stringify(data)).substring(0, 16);
  }

  /**
   * 获取存储键
   */
  private getStorageKey(key: string): string {
    return `${this.getStoragePrefix()}${key}`;
  }

  /**
   * 获取存储前缀
   */
  private getStoragePrefix(): string {
    return 'subscription_cache_';
  }
}

// 导出单例
export const subscriptionCacheStrategy = SubscriptionCacheStrategy.getInstance();

export default SubscriptionCacheStrategy;