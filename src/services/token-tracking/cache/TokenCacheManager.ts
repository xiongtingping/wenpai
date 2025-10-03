/**
 * Token缓存管理器
 * @description 统一管理Token相关数据的内存缓存
 *
 * 设计原则:
 * 1. 缓存仅用于性能优化,不参与业务逻辑
 * 2. 只有内存缓存,不使用localStorage/globalDataManager
 * 3. 缓存失效时自动从数据库刷新
 * 4. 支持按用户维度清除缓存
 *
 * 缓存策略:
 * - TokenStats: 30秒TTL (统计数据变化较频繁)
 * - TokenHistory: 5分钟TTL (历史记录相对稳定)
 * - TokenLimitCheck: 不缓存 (限额检查必须实时)
 */

import { logger } from '@/utils/logger';
import type { CacheEntry } from '../types';

export class TokenCacheManager {
  private static instance: TokenCacheManager;

  private cache = new Map<string, CacheEntry<any>>();

  // 默认TTL配置
  private readonly DEFAULT_TTLS = {
    tokenStats: 30 * 1000, // 30秒
    tokenHistory: 5 * 60 * 1000, // 5分钟
    featureStats: 2 * 60 * 1000 // 2分钟
  };

  // 缓存版本 (用于全局清除)
  private version = '1.0.0';

  private constructor() {
    // 定期清理过期缓存 (每分钟)
    setInterval(() => this.cleanupExpired(), 60 * 1000);
  }

  static getInstance(): TokenCacheManager {
    if (!TokenCacheManager.instance) {
      TokenCacheManager.instance = new TokenCacheManager();
    }
    return TokenCacheManager.instance;
  }

  /**
   * 🎯 核心方法: 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      logger.debug('缓存未命中', { key });
      return null;
    }

    // 检查版本
    if (entry.version !== this.version) {
      logger.debug('缓存版本不匹配', { key, cacheVersion: entry.version, currentVersion: this.version });
      this.cache.delete(key);
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now > entry.expiresAt) {
      logger.debug('缓存已过期', { key, expiresAt: new Date(entry.expiresAt).toISOString() });
      this.cache.delete(key);
      return null;
    }

    logger.debug('缓存命中', { key, age: now - entry.timestamp });
    return entry.data as T;
  }

  /**
   * 🎯 核心方法: 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const effectiveTTL = ttl ?? this.DEFAULT_TTLS.tokenStats;

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + effectiveTTL,
      version: this.version
    };

    this.cache.set(key, entry);

    logger.debug('缓存已设置', {
      key,
      ttl: effectiveTTL,
      expiresAt: new Date(entry.expiresAt).toISOString()
    });
  }

  /**
   * 清除指定缓存
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);

    if (deleted) {
      logger.debug('缓存已清除', { key });
    }

    return deleted;
  }

  /**
   * 清除用户相关的所有缓存
   */
  invalidateUser(userId: string): number {
    let deletedCount = 0;

    for (const [key] of this.cache) {
      if (key.includes(userId)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    logger.info(`清除用户缓存 (${deletedCount}条)`, { userId });

    return deletedCount;
  }

  /**
   * 清除指定前缀的所有缓存
   */
  invalidateByPrefix(prefix: string): number {
    let deletedCount = 0;

    for (const [key] of this.cache) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    logger.info(`清除前缀缓存 (${deletedCount}条)`, { prefix });

    return deletedCount;
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();

    logger.info(`清除全部缓存 (${size}条)`);
  }

  /**
   * 清理过期缓存 (定期任务)
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.debug(`清理过期缓存 (${deletedCount}条)`);
    }
  }

  /**
   * 生成标准缓存键
   */
  static generateKey(type: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(k => `${k}:${params[k]}`)
      .join('|');

    return `${type}|${sortedParams}`;
  }

  /**
   * 获取TokenStats缓存键
   */
  static getTokenStatsKey(userId: string, userTier: string): string {
    return TokenCacheManager.generateKey('token-stats', { userId, userTier });
  }

  /**
   * 获取TokenHistory缓存键
   */
  static getTokenHistoryKey(
    userId: string,
    limit: number,
    offset: number,
    feature?: string
  ): string {
    const params: Record<string, any> = { userId, limit, offset };
    if (feature) params.feature = feature;

    return TokenCacheManager.generateKey('token-history', params);
  }

  /**
   * 获取FeatureStats缓存键
   */
  static getFeatureStatsKey(userId: string): string {
    return TokenCacheManager.generateKey('feature-stats', { userId });
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    totalEntries: number;
    totalSize: number; // 估算,单位: bytes
    validEntries: number;
    expiredEntries: number;
  } {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    let estimatedSize = 0;

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        expiredCount++;
      } else {
        validCount++;
      }

      // 估算大小 (key + JSON序列化后的data)
      estimatedSize += key.length * 2; // 字符串占2字节
      estimatedSize += JSON.stringify(entry.data).length * 2;
    }

    return {
      totalEntries: this.cache.size,
      totalSize: estimatedSize,
      validEntries: validCount,
      expiredEntries: expiredCount
    };
  }

  /**
   * 更新缓存版本 (强制清除所有缓存)
   */
  bumpVersion(): void {
    const [major, minor, patch] = this.version.split('.').map(Number);
    this.version = `${major}.${minor}.${patch + 1}`;

    logger.info('缓存版本已更新', { newVersion: this.version });

    // 不立即清除,等待自然过期 (避免瞬间压力)
  }

  /**
   * 预热缓存 (可选,用于性能优化)
   */
  async warmup<T>(
    key: string,
    loader: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // 检查缓存是否存在
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    // 加载数据
    const data = await loader();

    // 设置缓存
    this.set(key, data, ttl);

    return data;
  }
}

/**
 * 导出单例实例
 */
export const tokenCacheManager = TokenCacheManager.getInstance();
