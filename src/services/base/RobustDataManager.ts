/**
 * 🛡️ 健壮数据管理器基类
 *
 * 在BaseDataManager基础上增加:
 * - 并发控制 (锁机制)
 * - 错误重试
 * - 数据校验
 * - 缓存增强 (LRU清理、校验和)
 * - 性能监控
 *
 * @extends BaseDataManager
 */

import { BaseDataManager, BaseDataManagerConfig } from './BaseDataManager';
import {
  dataLockManager,
  retryManager,
  dataValidator,
  memoryManager,
  StorageError
} from '../robustnessEnhancements';
import { logger } from '@/utils/logger';

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: StorageError;
  errorMessage?: string;
  duration?: number;
}

export interface GetDataOptions {
  forceRefresh?: boolean;
  timeout?: number;
  skipCache?: boolean;
  skipValidation?: boolean;
}

export interface SetDataOptions {
  syncToCloud?: boolean;
  skipValidation?: boolean;
  timeout?: number;
  retryConfig?: any;
}

export interface OperationStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  cacheHitRate: number;
  cacheHits: number;
  cacheMisses: number;
  retryRate: number;
  lastError?: string;
  lastErrorTime?: Date;
}

export interface RobustnessConfig extends BaseDataManagerConfig {
  enableLocking?: boolean;
  enableRetry?: boolean;
  enableValidation?: boolean;
  enableChecksum?: boolean;
  maxCacheSize?: number;
  maxCacheAgeMs?: number;
}

interface EnhancedCacheItem<T> {
  data: T;
  timestamp: number;
  expires?: number;
  version: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
  checksum?: string;
}

/**
 * 健壮数据管理器抽象类
 */
export abstract class RobustDataManager extends BaseDataManager {
  protected enhancedCache = new Map<string, EnhancedCacheItem<any>>();
  protected operationQueue = new Map<string, Promise<any>>();
  protected stats: OperationStats;
  protected robustnessConfig: Required<RobustnessConfig>;

  constructor(config: RobustnessConfig = {}) {
    super(config);

    this.robustnessConfig = {
      userId: config.userId || '',
      supabaseService: config.supabaseService,
      enableLogging: config.enableLogging ?? true,
      enableLocking: config.enableLocking ?? true,
      enableRetry: config.enableRetry ?? true,
      enableValidation: config.enableValidation ?? true,
      enableChecksum: config.enableChecksum ?? true,
      maxCacheSize: config.maxCacheSize ?? 100,
      maxCacheAgeMs: config.maxCacheAgeMs ?? 30 * 60 * 1000
    };

    this.stats = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      cacheHits: 0,
      cacheMisses: 0,
      retryRate: 0
    };

    this.setupPeriodicCleanup();
  }

  /**
   * 健壮的数据获取
   */
  async getRobustData<T>(key: string, options: GetDataOptions = {}): Promise<OperationResult<T>> {
    const operationId = `get_${key}_${Date.now()}`;
    const startTime = Date.now();

    try {
      this.stats.totalOperations++;

      // 1. 检查是否有正在进行的操作
      if (this.operationQueue.has(key)) {
        this.log('debug', `⏳ 等待正在进行的操作: ${key}`);
        const result = await this.operationQueue.get(key);
        return { success: true, data: result };
      }

      // 2. 从增强缓存获取数据（如果不跳过缓存）
      if (!options.skipCache && !options.forceRefresh) {
        const cached = this.getFromEnhancedCache<T>(key);
        if (cached && this.isCacheValid(cached)) {
          this.updateCacheAccess(key);
          this.recordSuccess(startTime, true); // 缓存命中
          return {
            success: true,
            data: cached.data,
            duration: Date.now() - startTime
          };
        }
      }

      // 3. 执行数据获取操作
      const operation = this.performGetOperation<T>(key, options);
      this.operationQueue.set(key, operation);

      try {
        const result = await operation;
        this.recordSuccess(startTime, false); // 缓存未命中
        return result;
      } finally {
        this.operationQueue.delete(key);
      }

    } catch (error) {
      this.recordFailure(startTime, error);
      return {
        success: false,
        error: StorageError.UNKNOWN_ERROR,
        errorMessage: error instanceof Error ? error.message : '操作失败',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * 健壮的数据保存
   */
  async setRobustData<T>(key: string, data: T, options: SetDataOptions = {}): Promise<OperationResult> {
    const operationId = `set_${key}_${Date.now()}`;
    const startTime = Date.now();

    try {
      this.stats.totalOperations++;

      // 1. 数据验证
      if (this.robustnessConfig.enableValidation && !options.skipValidation) {
        const validation = dataValidator.validate(key, data);
        if (!validation.isValid) {
          this.log('warn', `❌ 数据验证失败 ${key}:`, validation.errors);
          return {
            success: false,
            error: StorageError.INVALID_FORMAT,
            errorMessage: validation.errors.join('; ')
          };
        }

        if (validation.warnings.length > 0) {
          this.log('warn', `⚠️ 数据验证警告 ${key}:`, validation.warnings);
        }

        data = validation.sanitizedData;
      }

      // 2. 并发控制
      if (this.robustnessConfig.enableLocking) {
        const lockAcquired = await dataLockManager.acquireLock(key, operationId);
        if (!lockAcquired) {
          return {
            success: false,
            error: StorageError.CONCURRENT_WRITE,
            errorMessage: '数据正在被其他操作修改，请稍后重试'
          };
        }

        try {
          return await this.performSetOperation(key, data, options, operationId, startTime);
        } finally {
          dataLockManager.releaseLock(key, operationId);
        }
      } else {
        return await this.performSetOperation(key, data, options, operationId, startTime);
      }

    } catch (error) {
      this.recordFailure(startTime, error);
      return {
        success: false,
        error: StorageError.UNKNOWN_ERROR,
        errorMessage: error instanceof Error ? error.message : '操作失败',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * 执行获取操作 (带重试)
   */
  private async performGetOperation<T>(key: string, options: GetDataOptions): Promise<OperationResult<T>> {
    if (this.robustnessConfig.enableRetry) {
      return await retryManager.executeWithRetry(
        async () => {
          const data = await this.doGetOperation<T>(key, options);
          return { success: true, data };
        },
        {},
        `getData(${key})`
      );
    } else {
      try {
        const data = await this.doGetOperation<T>(key, options);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: StorageError.UNKNOWN_ERROR,
          errorMessage: error instanceof Error ? error.message : '操作失败'
        };
      }
    }
  }

  /**
   * 实际的获取操作
   */
  private async doGetOperation<T>(key: string, options: GetDataOptions): Promise<T> {
    // 尝试从云端获取
    const cloudData = await this.getCloudData<T>(key);
    if (cloudData !== null) {
      this.setEnhancedCache(key, cloudData);
      return cloudData;
    }

    // 从localStorage获取
    const localData = this.getCacheData<T>(key);
    if (localData !== null) {
      this.setEnhancedCache(key, localData);
      return localData;
    }

    throw new Error(`数据不存在: ${key}`);
  }

  /**
   * 执行保存操作 (带重试)
   */
  private async performSetOperation<T>(
    key: string,
    data: T,
    options: SetDataOptions,
    operationId: string,
    startTime: number
  ): Promise<OperationResult> {
    if (this.robustnessConfig.enableRetry) {
      const result = await retryManager.executeWithRetry(
        () => this.doSetOperation(key, data, options),
        options.retryConfig,
        `setData(${key})`
      );

      if (result.success) {
        this.recordSuccess(startTime, false);
      } else {
        this.recordFailure(startTime, new Error(result.errorMessage));
      }

      return result;
    } else {
      try {
        await this.doSetOperation(key, data, options);
        this.recordSuccess(startTime, false);
        return { success: true, duration: Date.now() - startTime };
      } catch (error) {
        this.recordFailure(startTime, error);
        return {
          success: false,
          error: StorageError.UNKNOWN_ERROR,
          errorMessage: error instanceof Error ? error.message : '操作失败',
          duration: Date.now() - startTime
        };
      }
    }
  }

  /**
   * 实际的保存操作
   */
  private async doSetOperation<T>(key: string, data: T, options: SetDataOptions): Promise<void> {
    // 保存到增强缓存
    this.setEnhancedCache(key, data);

    // 保存到localStorage
    if (!this.setCacheData(key, data)) {
      throw new Error(`localStorage保存失败`);
    }

    // 保存到云端（如果需要）
    if (options.syncToCloud && this.supabaseService && this.userId) {
      await this.setCloudData(key, data);
    }
  }

  /**
   * 增强缓存设置
   */
  private setEnhancedCache<T>(key: string, data: T, expiresIn?: number): void {
    const now = Date.now();
    const jsonString = JSON.stringify(data);
    const size = new Blob([jsonString]).size;

    const item: EnhancedCacheItem<T> = {
      data,
      timestamp: now,
      expires: expiresIn ? now + expiresIn : undefined,
      version: 1,
      size,
      accessCount: 1,
      lastAccessed: now,
      checksum: this.robustnessConfig.enableChecksum ? this.calculateChecksum(jsonString) : undefined
    };

    this.enhancedCache.set(key, item);
    memoryManager.recordAccess(key);

    // 检查缓存大小限制
    if (this.enhancedCache.size > this.robustnessConfig.maxCacheSize) {
      memoryManager.cleanupLRU(this.enhancedCache, this.robustnessConfig.maxCacheSize);
    }
  }

  /**
   * 增强缓存获取
   */
  private getFromEnhancedCache<T>(key: string): EnhancedCacheItem<T> | null {
    return this.enhancedCache.get(key) || null;
  }

  /**
   * 更新缓存访问
   */
  private updateCacheAccess(key: string): void {
    const item = this.enhancedCache.get(key);
    if (item) {
      item.accessCount++;
      item.lastAccessed = Date.now();
      memoryManager.recordAccess(key);
    }
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid<T>(item: EnhancedCacheItem<T>): boolean {
    if (item.expires && Date.now() > item.expires) {
      return false;
    }

    // 检查数据完整性
    if (this.robustnessConfig.enableChecksum && item.checksum) {
      const currentChecksum = this.calculateChecksum(JSON.stringify(item.data));
      if (currentChecksum !== item.checksum) {
        this.log('warn', `数据完整性检查失败，可能存在损坏`);
        return false;
      }
    }

    return true;
  }

  /**
   * 计算校验和
   */
  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * 记录成功操作
   */
  private recordSuccess(startTime: number, cacheHit: boolean): void {
    this.stats.successfulOperations++;
    if (cacheHit) {
      this.stats.cacheHits++;
    } else {
      this.stats.cacheMisses++;
    }
    this.updateCacheHitRate();

    const duration = Date.now() - startTime;
    this.updateAverageResponseTime(duration);
  }

  /**
   * 记录失败操作
   */
  private recordFailure(startTime: number, error: any): void {
    this.stats.failedOperations++;
    this.stats.lastError = error instanceof Error ? error.message : '未知错误';
    this.stats.lastErrorTime = new Date();

    const duration = Date.now() - startTime;
    this.updateAverageResponseTime(duration);
  }

  /**
   * 更新平均响应时间
   */
  private updateAverageResponseTime(duration: number): void {
    const totalOps = this.stats.successfulOperations + this.stats.failedOperations;
    this.stats.averageResponseTime = (this.stats.averageResponseTime * (totalOps - 1) + duration) / totalOps;
  }

  /**
   * 更新缓存命中率
   */
  private updateCacheHitRate(): void {
    const totalCacheAccess = this.stats.cacheHits + this.stats.cacheMisses;
    if (totalCacheAccess > 0) {
      this.stats.cacheHitRate = this.stats.cacheHits / totalCacheAccess;
    }
  }

  /**
   * 清理过期数据
   */
  async cleanup(): Promise<{ removed: number; errors: number }> {
    let removed = 0;
    let errors = 0;

    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (const [key, item] of this.enhancedCache.entries()) {
        if (item.expires && now > item.expires) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        this.enhancedCache.delete(key);
        removed++;
      });

      // LRU清理
      if (this.enhancedCache.size > this.robustnessConfig.maxCacheSize) {
        const removedByLRU = memoryManager.cleanupLRU(this.enhancedCache, this.robustnessConfig.maxCacheSize);
        removed += removedByLRU.length;
      }

      logger.info(`🧹 清理完成: 移除 ${removed} 个缓存项, ${errors} 个错误`);
    } catch (error) {
      errors++;
      logger.error('清理过程发生错误:', error);
    }

    return { removed, errors };
  }

  /**
   * 获取操作统计
   */
  getOperationStats(): OperationStats & { cacheStats: any } {
    return {
      ...this.stats,
      cacheStats: {
        size: this.enhancedCache.size,
        memoryUsage: memoryManager.getMemoryUsage(),
        hitRate: this.stats.cacheHitRate,
        averageAccessCount: this.getAverageAccessCount()
      }
    };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      cacheHits: 0,
      cacheMisses: 0,
      retryRate: 0
    };
  }

  /**
   * 获取平均访问次数
   */
  private getAverageAccessCount(): number {
    if (this.enhancedCache.size === 0) return 0;

    const totalAccess = Array.from(this.enhancedCache.values())
      .reduce((sum, item) => sum + item.accessCount, 0);

    return totalAccess / this.enhancedCache.size;
  }

  /**
   * 设置定期清理
   */
  private setupPeriodicCleanup(): void {
    // 每5分钟清理一次过期缓存
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    // 每小时输出统计信息
    setInterval(() => {
      const stats = this.getOperationStats();
      logger.info('📊 数据管理器统计:', stats);
    }, 60 * 60 * 1000);
  }
}

export default RobustDataManager;
