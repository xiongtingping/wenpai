/**
 * 高级缓存服务
 * 支持多层缓存、智能过期、LRU淘汰策略
 */

import { TitleGenerationConfig } from '../config/titleGeneration.config';
import type { TitleGenerationResult, CacheConfig } from '../types/titleGeneration.types';

import { logger } from '@/utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  tags: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  entryCount: number;
  hitRate: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    entryCount: 0,
    hitRate: 0
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      ...TitleGenerationConfig.cache,
      ...config
    };

    if (this.config.enabled) {
      this.startCleanupTimer();
    }
  }

  /**
   * 设置缓存项
   */
  set<T>(key: string, value: T, options?: {
    ttl?: number;
    tags?: string[];
    priority?: number;
  }): void {
    if (!this.config.enabled) return;

    const now = Date.now();
    const ttl = options?.ttl || this.config.ttl;
    const tags = options?.tags || [];
    const size = this.calculateSize(value);

    // 检查是否需要清理空间
    this.ensureSpace(size);

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
      size,
      tags
    };

    this.cache.set(key, entry);
    this.stats.totalSize += size;
    this.stats.entryCount++;

    logger.debug(`📦 cachesetting: ${key} (${size} bytes, TTL: ${ttl}ms)`);
  }

  /**
   * 获取缓存项
   */
  get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > this.config.ttl;

    if (isExpired) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 更新访问统计
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;
    this.updateHitRate();

    logger.debug(`🎯 cache命middle: ${key} (访问count: ${entry.accessCount})`);
    return entry.data;
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.stats.totalSize -= entry.size;
    this.stats.entryCount--;

    logger.info(`🗑️ cachedeleting: ${key}`);
    return true;
  }

  /**
   * 根据标签删除缓存项
   */
  deleteByTag(tag: string): number {
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.delete(key);
        deletedCount++;
      }
    }

    logger.info(`🏷️ 按tagdeletingcache: ${tag} (${deletedCount}item)`);
    return deletedCount;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.stats.totalSize = 0;
    this.stats.entryCount = 0;

    logger.info(`🧹 清emptycache: ${count}item`);
  }

  /**
   * 检查缓存项是否存在且未过期
   */
  has(key: string): boolean {
    if (!this.config.enabled) return false;

    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    const isExpired = now - entry.timestamp > this.config.ttl;

    if (isExpired) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 获取缓存键列表
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存项详情
   */
  getEntryInfo(key: string): Omit<CacheEntry<any>, 'data'> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    return {
      timestamp: entry.timestamp,
      accessCount: entry.accessCount,
      lastAccessed: entry.lastAccessed,
      size: entry.size,
      tags: entry.tags
    };
  }

  /**
   * 预热缓存
   */
  async warmup(keys: Array<{ key: string; generator: () => Promise<any> }>): Promise<void> {
    logger.info(`🔥 startscache预热: ${keys.length}item`);

    const promises = keys.map(async ({ key, generator }) => {
      try {
        if (!this.has(key)) {
          const data = await generator();
          this.set(key, data, { tags: ['warmup'] });
        }
      } catch (error) {
        logger.warn(`预热failed: ${key}`, error);
      }
    });

    await Promise.allSettled(promises);
    logger.info('🔥 cache预热completed');
  }

  /**
   * 确保有足够空间
   */
  private ensureSpace(requiredSize: number): void {
    const maxSize = this.config.maxSize * 1024 * 1024; // 转换为字节

    while (this.stats.totalSize + requiredSize > maxSize && this.cache.size > 0) {
      this.evictLRU();
    }
  }

  /**
   * LRU淘汰策略
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
      logger.debug(`♻️ LRU淘汰: ${oldestKey}`);
    }
  }

  /**
   * 计算数据大小（简化版）
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // 粗略估算UTF-16字符大小
    } catch {
      return 1024; // 默认1KB
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > this.config.ttl;
      if (isExpired) {
        this.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`🧹 定期cleaning: ${cleanedCount}itemexpiredcache`);
    }
  }

  /**
   * 销毁缓存服务
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// 创建全局缓存实例
export const globalCache = new CacheService();

// 专门用于标题生成的缓存实例
export const titleCache = new CacheService({
  keyPrefix: 'title_gen_',
  ttl: 30 * 60 * 1000, // 30分钟
  maxSize: 50 // 50MB
});

export default CacheService;
