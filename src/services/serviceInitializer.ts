/**
 * 🚀 统一服务初始化器 - 集成所有数据持久化相关服务
 * 遵循CLAUDE.md规范，系统性地管理服务依赖和初始化顺序
 */

import { PerformanceMonitor } from './performanceMonitor';
import { IntelligentCacheManager } from './intelligentCacheManager';
import { EnhancedSyncOptimizer } from './enhancedSyncOptimizer';
import { UnifiedStorageStrategy } from './unifiedStorageStrategy';
import { supabase } from '@/config/supabase';

export interface ServiceInitializationConfig {
  // 性能监控配置
  enablePerformanceMonitoring: boolean;
  enableWebVitals: boolean;
  performanceReportInterval: number;
  
  // 缓存配置
  cacheMaxSize: number;
  cacheMaxMemoryMB: number;
  cacheCleanupInterval: number;
  
  // 同步配置
  syncBatchSize: number;
  syncInterval: number;
  enableCompression: boolean;
  
  // 存储策略配置
  defaultStorageLevel: 'memory' | 'session' | 'local' | 'database' | 'hybrid';
  enableDataIsolation: boolean;
  enableAutomaticCleanup: boolean;
}

export class ServiceManager {
  private static instance: ServiceManager;
  private performanceMonitor?: PerformanceMonitor;
  private cacheManager?: IntelligentCacheManager;
  private syncOptimizer?: EnhancedSyncOptimizer;
  private storageStrategy?: UnifiedStorageStrategy;
  private isInitialized = false;
  private initializationPromise?: Promise<void>;

  private constructor() {}

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  /**
   * 初始化所有服务
   */
  public async initialize(config: Partial<ServiceInitializationConfig> = {}): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializeServices(config);
    await this.initializationPromise;
  }

  private async _initializeServices(userConfig: Partial<ServiceInitializationConfig>): Promise<void> {
    const startTime = performance.now();

    // 默认配置
    const config: ServiceInitializationConfig = {
      enablePerformanceMonitoring: true,
      enableWebVitals: true,
      performanceReportInterval: 300000, // 5分钟
      cacheMaxSize: 1000,
      cacheMaxMemoryMB: 50,
      cacheCleanupInterval: 600000, // 10分钟
      syncBatchSize: 50,
      syncInterval: 30000, // 30秒
      enableCompression: true,
      defaultStorageLevel: 'hybrid',
      enableDataIsolation: true,
      enableAutomaticCleanup: true,
      ...userConfig
    };

    try {
      console.log('🚀 开始初始化数据持久化服务...');

      // 1. 初始化性能监控器（最高优先级）
      if (config.enablePerformanceMonitoring) {
        this.performanceMonitor = new PerformanceMonitor();
        
        if (config.enableWebVitals) {
          this.performanceMonitor.startWebVitalsMonitoring();
        }

        // 设置定期报告
        if (config.performanceReportInterval > 0) {
          setInterval(() => {
            const report = this.performanceMonitor?.getPerformanceReport();
            if (report) {
              console.log('📊 性能报告:', report);
            }
          }, config.performanceReportInterval);
        }

        console.log('✅ 性能监控系统已初始化');
      }

      // 2. 初始化智能缓存管理器
      this.cacheManager = new IntelligentCacheManager({
        maxSize: config.cacheMaxSize,
        maxMemoryMB: config.cacheMaxMemoryMB,
        enablePerformanceTracking: true,
        enableAutomaticCleanup: config.enableAutomaticCleanup,
        cleanupInterval: config.cacheCleanupInterval
      });

      console.log('✅ 智能缓存管理器已初始化');

      // 3. 初始化增强同步优化器
      this.syncOptimizer = new EnhancedSyncOptimizer({
        batchSize: config.syncBatchSize,
        syncInterval: config.syncInterval,
        enableCompression: config.enableCompression,
        retryAttempts: 3,
        retryDelay: 1000
      });

      // 启动同步处理
      this.syncOptimizer.startSyncProcessing();
      
      console.log('✅ 增强同步优化器已初始化');

      // 4. 初始化统一存储策略
      this.storageStrategy = new UnifiedStorageStrategy({
        defaultLevel: config.defaultStorageLevel,
        enableDataIsolation: config.enableDataIsolation,
        enableAutomaticCleanup: config.enableAutomaticCleanup,
        supabaseClient: supabase
      });

      console.log('✅ 统一存储策略已初始化');

      // 5. 服务间依赖注入
      this._setupServiceIntegration();

      // 记录初始化性能
      const initTime = performance.now() - startTime;
      this.performanceMonitor?.recordDataLoadingEvent(
        'service_initialization',
        startTime,
        performance.now(),
        true,
        {
          services: ['performance', 'cache', 'sync', 'storage'],
          config,
          initTimeMs: initTime
        }
      );

      this.isInitialized = true;
      console.log(`🎉 所有服务初始化完成，耗时: ${Math.round(initTime)}ms`);

    } catch (error) {
      console.error('💥 服务初始化失败:', error);
      
      // 记录失败
      this.performanceMonitor?.recordDataLoadingEvent(
        'service_initialization',
        startTime,
        performance.now(),
        false,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

      throw error;
    }
  }

  /**
   * 设置服务间的集成和依赖注入
   */
  private _setupServiceIntegration(): void {
    if (!this.cacheManager || !this.syncOptimizer || !this.storageStrategy || !this.performanceMonitor) {
      throw new Error('Services not properly initialized');
    }

    // 缓存管理器集成性能监控
    const originalCacheGet = this.cacheManager.get.bind(this.cacheManager);
    const originalCacheSet = this.cacheManager.set.bind(this.cacheManager);

    this.cacheManager.get = (key: string) => {
      const startTime = performance.now();
      const result = originalCacheGet(key);
      const endTime = performance.now();

      this.performanceMonitor?.recordDataLoadingEvent(
        'cache_get',
        startTime,
        endTime,
        result !== null,
        { key, hit: result !== null }
      );

      return result;
    };

    this.cacheManager.set = (key: string, value: any, options?: any) => {
      const startTime = performance.now();
      const result = originalCacheSet(key, value, options);
      const endTime = performance.now();

      this.performanceMonitor?.recordDataLoadingEvent(
        'cache_set',
        startTime,
        endTime,
        result,
        { key, size: JSON.stringify(value).length }
      );

      return result;
    };

    // 同步优化器集成性能监控
    this.syncOptimizer.onSyncComplete = (result) => {
      this.performanceMonitor?.recordDataLoadingEvent(
        'data_sync',
        result.startTime,
        result.endTime,
        result.success,
        {
          operation: result.operation,
          dataKey: result.dataKey,
          compressed: result.compressed,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize
        }
      );
    };

    // 存储策略集成缓存管理器
    this.storageStrategy.setCacheManager(this.cacheManager);

    console.log('🔗 服务间集成完成');
  }

  /**
   * 获取性能监控器实例
   */
  public getPerformanceMonitor(): PerformanceMonitor | undefined {
    return this.performanceMonitor;
  }

  /**
   * 获取缓存管理器实例
   */
  public getCacheManager(): IntelligentCacheManager | undefined {
    return this.cacheManager;
  }

  /**
   * 获取同步优化器实例
   */
  public getSyncOptimizer(): EnhancedSyncOptimizer | undefined {
    return this.syncOptimizer;
  }

  /**
   * 获取存储策略实例
   */
  public getStorageStrategy(): UnifiedStorageStrategy | undefined {
    return this.storageStrategy;
  }

  /**
   * 获取系统健康状态
   */
  public getSystemHealth(): {
    isInitialized: boolean;
    services: {
      performance: boolean;
      cache: boolean;
      sync: boolean;
      storage: boolean;
    };
    metrics?: any;
  } {
    return {
      isInitialized: this.isInitialized,
      services: {
        performance: !!this.performanceMonitor,
        cache: !!this.cacheManager,
        sync: !!this.syncOptimizer,
        storage: !!this.storageStrategy
      },
      metrics: this.performanceMonitor?.getCurrentMetrics()
    };
  }

  /**
   * 优雅关闭所有服务
   */
  public async shutdown(): Promise<void> {
    console.log('🔄 开始关闭服务...');

    try {
      // 停止同步处理
      if (this.syncOptimizer) {
        this.syncOptimizer.stopSyncProcessing();
      }

      // 清理缓存
      if (this.cacheManager) {
        this.cacheManager.clear();
      }

      // 停止性能监控
      if (this.performanceMonitor) {
        // 生成最终报告
        const finalReport = this.performanceMonitor.getPerformanceReport();
        console.log('📊 最终性能报告:', finalReport);
      }

      this.isInitialized = false;
      this.initializationPromise = undefined;

      console.log('✅ 所有服务已安全关闭');

    } catch (error) {
      console.error('💥 服务关闭时出错:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const serviceManager = ServiceManager.getInstance();

/**
 * 便捷初始化函数
 */
export async function initializeDataServices(config?: Partial<ServiceInitializationConfig>): Promise<ServiceManager> {
  const manager = ServiceManager.getInstance();
  await manager.initialize(config);
  return manager;
}

/**
 * 获取服务实例的便捷函数
 */
export function getDataServices() {
  const manager = ServiceManager.getInstance();
  
  return {
    performance: manager.getPerformanceMonitor(),
    cache: manager.getCacheManager(),
    sync: manager.getSyncOptimizer(),
    storage: manager.getStorageStrategy(),
    health: manager.getSystemHealth()
  };
}