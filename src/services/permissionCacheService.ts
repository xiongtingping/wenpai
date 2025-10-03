/**
 * 权限缓存服务
 * @description 缓存权限检查结果,减少重复查询
 * @created 2025-10-02
 * @updated 2025-10-03 - 重构继承BaseService,修复内存泄漏
 */

import { BaseService, ServiceState } from './base/BaseService';
import type { ExtendedPermissionType, PermissionCheckResult } from '@/types/permissions';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 缓存项接口
 */
interface CacheItem {
  result: PermissionCheckResult;
  timestamp: number;
  expiresAt: number;
}

/**
 * 权限缓存配置
 */
interface PermissionCacheConfig {
  /** 缓存过期时间(毫秒) */
  ttl: number;
  /** 最大缓存条目数 */
  maxSize: number;
  /** 是否启用调试日志 */
  debug: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: PermissionCacheConfig = {
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  debug: false,
};

/**
 * 权限缓存服务类
 */
export class PermissionCacheService extends BaseService {
  private cache = new Map<string, CacheItem>();
  private config: PermissionCacheConfig;
  private hitCount = 0;
  private missCount = 0;

  constructor(config: Partial<PermissionCacheConfig> = {}) {
    super('PermissionCacheService');
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 初始化服务
   */
  protected async onInitialize(): Promise<void> {
    // 启动定时清理任务
    this.registerInterval(
      () => this.cleanupExpired(),
      60 * 1000 // 每分钟清理一次
    );
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(userId: string, permission: ExtendedPermissionType): string {
    return `${userId}:${permission}`;
  }

  /**
   * 获取缓存的权限结果
   */
  getCached(userId: string, permission: ExtendedPermissionType): PermissionCheckResult | null {
    const key = this.getCacheKey(userId, permission);
    const cached = this.cache.get(key);

    if (!cached) {
      this.missCount++;
      if (this.config.debug) {
        console.log(`[PermissionCache] MISS: ${key}`);
      }
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now > cached.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      if (this.config.debug) {
        console.log(`[PermissionCache] EXPIRED: ${key}`);
      }
      return null;
    }

    this.hitCount++;
    if (this.config.debug) {
      console.log(`[PermissionCache] HIT: ${key}`);
    }
    return cached.result;
  }

  /**
   * 设置缓存
   */
  setCached(
    userId: string,
    permission: ExtendedPermissionType,
    result: PermissionCheckResult
  ): void {
    const key = this.getCacheKey(userId, permission);
    const now = Date.now();

    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      result,
      timestamp: now,
      expiresAt: now + this.config.ttl,
    });

    if (this.config.debug) {
      console.log(`[PermissionCache] SET: ${key}`);
    }
  }

  /**
   * 清除指定用户的缓存
   */
  clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (this.config.debug) {
      console.log(`[PermissionCache] CLEAR USER: ${userId}, removed ${keysToDelete.length} items`);
    }
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;

    if (this.config.debug) {
      console.log(`[PermissionCache] CLEAR ALL: removed ${size} items`);
    }
  }

  /**
   * 移除最旧的缓存项
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      if (this.config.debug) {
        console.log(`[PermissionCache] EVICT: ${oldestKey}`);
      }
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (this.config.debug && keysToDelete.length > 0) {
      console.log(`[PermissionCache] CLEANUP: removed ${keysToDelete.length} expired items`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total * 100).toFixed(2) : '0';

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: `${hitRate}%`,
      ttl: this.config.ttl,
      // 包含基础服务统计信息
      ...super.getStats()
    };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * 预热缓存 - 为用户预加载常用权限
   */
  async warmup(
    userId: string,
    permissions: ExtendedPermissionType[],
    checkFunction: (permission: ExtendedPermissionType) => Promise<PermissionCheckResult>
  ): Promise<void> {
    const promises = permissions.map(async (permission) => {
      try {
        const result = await checkFunction(permission);
        this.setCached(userId, permission, result);
      } catch (error) {
        console.error(`预热缓存失败: ${permission}`, error);
      }
    });

    await Promise.all(promises);

    if (this.config.debug) {
      console.log(`[PermissionCache] WARMUP: loaded ${permissions.length} permissions for ${userId}`);
    }
  }
}

/**
 * 全局单例实例
 */
const permissionCacheInstance = new PermissionCacheService({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 200,
  debug: process.env.NODE_ENV === 'development',
});

// 自动初始化
permissionCacheInstance.initialize().catch(error => {
  console.error('[PermissionCacheService] Auto-initialization failed:', error);
});

export const permissionCache = permissionCacheInstance;

/**
 * React Hook: 使用权限缓存
 */
export function usePermissionCache() {
  return {
    getCached: permissionCache.getCached.bind(permissionCache),
    setCached: permissionCache.setCached.bind(permissionCache),
    clearUserCache: permissionCache.clearUserCache.bind(permissionCache),
    clearAll: permissionCache.clearAll.bind(permissionCache),
    getCacheStats: permissionCache.getCacheStats.bind(permissionCache),
    getStats: permissionCache.getStats.bind(permissionCache),
    cleanup: permissionCache.cleanup.bind(permissionCache),
  };
}

export default permissionCache;
