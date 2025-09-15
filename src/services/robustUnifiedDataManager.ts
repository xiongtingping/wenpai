/**
 * 🛡️ 健壮统一数据管理器
 * 整合所有健壮性改进的增强版数据管理器
 * 
 * 核心改进：
 * - 并发控制：写入锁机制防止数据竞争
 * - 错误处理：细粒度错误分类和智能重试
 * - 数据验证：完整性检查和数据清理
 * - 内存管理：LRU清理和内存监控
 * - 性能优化：批量操作和压缩存储
 * - 监控告警：操作统计和异常监控
 */

import i18n from '@/i18n';
import { 
  dataLockManager, 
  retryManager, 
  dataValidator,
  memoryManager,
  StorageError,
  OperationResult,
  ValidationResult 
} from './robustnessEnhancements';
import { createDataService, TABLE_NAMES } from './supabaseDataService';
import { safeSaveToLocalStorage, safeLoadFromLocalStorage } from '@/utils/safeDataStorage';
import { logger } from '@/utils/logger';

// 操作统计接口
interface OperationStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  cacheHitRate: number;
  retryRate: number;
  lastError?: string;
  lastErrorTime?: Date;
}

// 健壮性配置
interface RobustnessConfig {
  enableLocking: boolean;
  enableRetry: boolean;
  enableValidation: boolean;
  enableCompression: boolean;
  maxConcurrentOperations: number;
  operationTimeoutMs: number;
}

// 缓存项增强版
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
 * 健壮统一数据管理器
 */
export class RobustUnifiedDataManager {
  private userId: string | null = null;
  private supabaseService: any = null;
  private enhancedCache = new Map<string, EnhancedCacheItem<any>>();
  private operationQueue = new Map<string, Promise<any>>();
  private stats: OperationStats;
  private config: RobustnessConfig;

  // 配置常量
  private readonly MAX_CACHE_SIZE = 100;
  private readonly MAX_CACHE_AGE_MS = 30 * 60 * 1000; // 30分钟
  private readonly CHECKSUM_ENABLED = true;

  constructor(config: Partial<RobustnessConfig> = {}) {
    this.config = {
      enableLocking: true,
      enableRetry: true,
      enableValidation: true,
      enableCompression: false, // 暂时关闭，需要额外库支持
      maxConcurrentOperations: 5,
      operationTimeoutMs: 30000,
      ...config
    };

    this.stats = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      retryRate: 0
    };

    this.setupPeriodicCleanup();
  }

  /**
   * 设置用户ID并初始化服务
   */
  setUserId(userId: string) {
    this.userId = userId;
    try {
      this.supabaseService = createDataService(userId, TABLE_NAMES.USER_BRAND_CORPUS);
      logger.info('✅ 健壮数据管理器初始化成功，用户:', userId);
    } catch (error) {
      logger.error('❌ Supabase服务初始化失败:', error);
    }
  }

  /**
   * 健壮的数据获取
   */
  async getData<T>(key: string, options: {
    forceRefresh?: boolean;
    timeout?: number;
    skipCache?: boolean;
    skipValidation?: boolean;
  } = {}): Promise<OperationResult<T>> {
    const operationId = `get_${key}_${Date.now()}`;
    const startTime = Date.now();

    try {
      this.stats.totalOperations++;

      // 1. 检查是否有正在进行的操作
      if (this.operationQueue.has(key)) {
        logger.debug(`⏳ 等待正在进行的操作: ${key}`);
        const result = await this.operationQueue.get(key);
        return { success: true, data: result };
      }

      // 2. 从缓存获取数据（如果不跳过缓存）
      if (!options.skipCache && !options.forceRefresh) {
        const cached = this.getFromEnhancedCache<T>(key);
        if (cached && this.isCacheValid(cached)) {
          this.updateCacheAccess(key);
          this.recordSuccess(startTime);
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
        this.recordSuccess(startTime);
        return result;
      } finally {
        this.operationQueue.delete(key);
      }

    } catch (error) {
      this.recordFailure(startTime, error);
      return {
        success: false,
        error: StorageError.UNKNOWN_ERROR,
        errorMessage: error instanceof Error ? error.message : i18n.t('common.errors.获取数据失败'),
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * 健壮的数据保存
   */
  async setData<T>(key: string, data: T, options: {
    syncToCloud?: boolean;
    skipValidation?: boolean;
    timeout?: number;
    retryConfig?: any;
  } = {}): Promise<OperationResult> {
    const operationId = `set_${key}_${Date.now()}`;
    const startTime = Date.now();

    try {
      this.stats.totalOperations++;

      // 1. 数据验证
      if (this.config.enableValidation && !options.skipValidation) {
        const validation = dataValidator.validate(key, data);
        if (!validation.isValid) {
          logger.warn(`❌ 数据验证失败 ${key}:`, validation.errors);
          return {
            success: false,
            error: StorageError.INVALID_FORMAT,
            errorMessage: validation.errors.join('; ')
          };
        }

        if (validation.warnings.length > 0) {
          logger.warn(`⚠️ 数据验证警告 ${key}:`, validation.warnings);
        }

        // 使用清理后的数据
        data = validation.sanitizedData;
      }

      // 2. 并发控制
      if (this.config.enableLocking) {
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
        errorMessage: error instanceof Error ? error.message : i18n.t('common.errors.保存数据失败'),
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * 批量数据获取
   */
  async getBatchData<T>(keys: string[]): Promise<Record<string, OperationResult<T>>> {
    const results: Record<string, OperationResult<T>> = {};
    
    // 控制并发数
    const maxConcurrent = this.config.maxConcurrentOperations;
    const chunks = this.chunkArray(keys, maxConcurrent);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async key => ({
        key,
        result: await this.getData<T>(key)
      }));
      
      const chunkResults = await Promise.allSettled(promises);
      
      chunkResults.forEach((result, index) => {
        const key = chunk[index];
        if (result.status === 'fulfilled') {
          results[key] = result.value.result;
        } else {
          results[key] = {
            success: false,
            error: StorageError.UNKNOWN_ERROR,
            errorMessage: result.reason?.message || i18n.t('common.errors.批量获取失败')
          };
        }
      });
    }
    
    return results;
  }

  /**
   * 数据存在性检查
   */
  async dataExists(key: string): Promise<OperationResult<boolean>> {
    try {
      // 先检查缓存
      const cached = this.enhancedCache.get(key);
      if (cached && this.isCacheValid(cached)) {
        return { success: true, data: true };
      }

      // 检查localStorage
      const localData = localStorage.getItem(key);
      if (localData !== null) {
        return { success: true, data: true };
      }

      // 检查云端（如果有服务）
      if (this.supabaseService && this.userId) {
        const result = await this.supabaseService.findMany({
          filters: { corpusType: `user_${key}` },
          limit: 1
        });
        return { success: true, data: result.data && result.data.length > 0 };
      }

      return { success: true, data: false };

    } catch (error) {
      return {
        success: false,
        error: StorageError.UNKNOWN_ERROR,
        errorMessage: error instanceof Error ? error.message : i18n.t('common.errors.检查数据存在性失败')
      };
    }
  }

  /**
   * 清理过期数据
   */
  async cleanup(): Promise<{ removed: number; errors: number }> {
    let removed = 0;
    let errors = 0;

    try {
      // 清理内存缓存
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

      // 使用内存管理器进行LRU清理
      if (this.enhancedCache.size > this.MAX_CACHE_SIZE) {
        const removedByLRU = memoryManager.cleanupLRU(this.enhancedCache, this.MAX_CACHE_SIZE);
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
  resetStats() {
    this.stats = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      retryRate: 0
    };
  }

  // === 私有方法 ===

  /**
   * 执行获取操作
   */
  private async performGetOperation<T>(
    key: string, 
    options: any
  ): Promise<OperationResult<T>> {
    if (this.config.enableRetry) {
      return await retryManager.executeWithRetry(
        () => this.doGetOperation<T>(key, options),
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
          errorMessage: error instanceof Error ? error.message : i18n.t('common.errors.获取操作失败')
        };
      }
    }
  }

  /**
   * 实际的获取操作
   */
  private async doGetOperation<T>(key: string, options: any): Promise<T> {
    // 尝试从云端获取
    if (this.supabaseService && this.userId) {
      try {
        const result = await this.supabaseService.findMany({
          filters: { corpusType: `user_${key}` },
          limit: 1,
          orderBy: 'updatedAt',
          orderDirection: 'desc'
        });

        if (result.data && result.data.length > 0) {
          const data = JSON.parse(result.data[0].corpusContent);
          this.setEnhancedCache(key, data);
          return data;
        }
      } catch (error) {
        logger.warn(`云端获取失败 ${key}:`, error);
      }
    }

    // 从localStorage获取
    const { data: localData } = safeLoadFromLocalStorage<T>(key);
    if (localData !== null) {
      this.setEnhancedCache(key, localData);
      return localData as T;
    }

    throw new Error(`数据不存在: ${key}`);
  }

  /**
   * 执行保存操作
   */
  private async performSetOperation<T>(
    key: string,
    data: T,
    options: any,
    operationId: string,
    startTime: number
  ): Promise<OperationResult> {
    if (this.config.enableRetry) {
      const result = await retryManager.executeWithRetry(
        () => this.doSetOperation(key, data, options),
        options.retryConfig,
        `setData(${key})`
      );

      if (result.success) {
        this.recordSuccess(startTime);
      } else {
        this.recordFailure(startTime, new Error(result.errorMessage));
      }

      return result;
    } else {
      try {
        await this.doSetOperation(key, data, options);
        this.recordSuccess(startTime);
        return { success: true, duration: Date.now() - startTime };
      } catch (error) {
        this.recordFailure(startTime, error);
        return {
          success: false,
          error: StorageError.UNKNOWN_ERROR,
          errorMessage: error instanceof Error ? error.message : i18n.t('common.errors.保存操作失败'),
          duration: Date.now() - startTime
        };
      }
    }
  }

  /**
   * 实际的保存操作
   */
  private async doSetOperation<T>(key: string, data: T, options: any): Promise<void> {
    const promises: Promise<void>[] = [];

    // 保存到缓存
    this.setEnhancedCache(key, data);

    // 保存到localStorage
    const saveResult = safeSaveToLocalStorage(key, data);
    if (!saveResult.success) {
      throw new Error(`localStorage保存失败: ${saveResult.error}`);
    }

    // 保存到云端（如果需要）
    if (options.syncToCloud && this.supabaseService && this.userId) {
      promises.push(this.saveToCloud(key, data));
    }

    // 等待云端保存
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * 保存到云端
   */
  private async saveToCloud<T>(key: string, data: T): Promise<void> {
    const existing = await this.supabaseService.findMany({
      filters: { corpusType: `user_${key}` },
      limit: 1
    });

    const recordData = {
      corpusType: `user_${key}`,
      corpusName: `用户${key}数据_${this.userId}`,
      corpusContent: JSON.stringify(data),
      metadata: {
        dataKey: key,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      }
    };

    if (existing.data && existing.data.length > 0) {
      await this.supabaseService.update(existing.data[0].id, recordData);
    } else {
      await this.supabaseService.create(recordData);
    }
  }

  /**
   * 增强缓存获取
   */
  private getFromEnhancedCache<T>(key: string): EnhancedCacheItem<T> | null {
    return this.enhancedCache.get(key) || null;
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
      checksum: this.CHECKSUM_ENABLED ? this.calculateChecksum(jsonString) : undefined
    };

    this.enhancedCache.set(key, item);
    memoryManager.recordAccess(key);

    // 检查缓存大小限制
    if (this.enhancedCache.size > this.MAX_CACHE_SIZE) {
      memoryManager.cleanupLRU(this.enhancedCache, this.MAX_CACHE_SIZE);
    }
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
    if (this.CHECKSUM_ENABLED && item.checksum) {
      const currentChecksum = this.calculateChecksum(JSON.stringify(item.data));
      if (currentChecksum !== item.checksum) {
        logger.warn(`数据完整性检查失败，可能存在损坏`);
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
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
  }

  /**
   * 记录成功操作
   */
  private recordSuccess(startTime: number): void {
    this.stats.successfulOperations++;
    const duration = Date.now() - startTime;
    this.updateAverageResponseTime(duration);
  }

  /**
   * 记录失败操作
   */
  private recordFailure(startTime: number, error: any): void {
    this.stats.failedOperations++;
    this.stats.lastError = error instanceof Error ? error.message : i18n.t('common.errors.未知错误');
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
   * 获取平均访问次数
   */
  private getAverageAccessCount(): number {
    if (this.enhancedCache.size === 0) return 0;
    
    const totalAccess = Array.from(this.enhancedCache.values())
      .reduce((sum, item) => sum + item.accessCount, 0);
    
    return totalAccess / this.enhancedCache.size;
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
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

// 导出单例实例
export const robustDataManager = new RobustUnifiedDataManager();

export default RobustUnifiedDataManager;