/**
 * 🚀 数据服务 Hook - 便捷访问数据持久化服务
 * 遵循CLAUDE.md规范，提供统一的数据服务访问接口
 */

import { useEffect, useState } from 'react';
import { getDataServices, serviceManager } from '@/services/serviceInitializer';
import { PerformanceMonitor } from '@/services/performanceMonitor';
import { IntelligentCacheManager } from '@/services/intelligentCacheManager';
import { EnhancedSyncOptimizer } from '@/services/enhancedSyncOptimizer';
import { UnifiedStorageStrategy } from '@/services/unifiedStorageStrategy';

export interface DataServicesState {
  performance?: PerformanceMonitor;
  cache?: IntelligentCacheManager;
  sync?: EnhancedSyncOptimizer;
  storage?: UnifiedStorageStrategy;
  isReady: boolean;
  health: {
    isInitialized: boolean;
    services: {
      performance: boolean;
      cache: boolean;
      sync: boolean;
      storage: boolean;
    };
    metrics?: any;
  };
}

/**
 * 数据服务 Hook
 * 提供访问所有数据持久化服务的便捷接口
 */
export function useDataServices(): DataServicesState {
  const [services, setServices] = useState<DataServicesState>(() => {
    const initialServices = getDataServices();
    return {
      ...initialServices,
      isReady: false,
      health: serviceManager.getSystemHealth()
    };
  });

  useEffect(() => {
    // 等待服务初始化完成
    const checkServicesReady = () => {
      const currentServices = getDataServices();
      const health = serviceManager.getSystemHealth();
      
      setServices({
        ...currentServices,
        isReady: health.isInitialized && 
                health.services.performance && 
                health.services.cache && 
                health.services.sync && 
                health.services.storage,
        health
      });
    };

    // 立即检查一次
    checkServicesReady();

    // 设置定期检查（用于监控服务状态变化）
    const interval = setInterval(checkServicesReady, 5000);

    return () => clearInterval(interval);
  }, []);

  return services;
}

/**
 * 性能监控 Hook
 * 专门用于访问性能监控服务
 */
export function usePerformanceMonitor() {
  const { performance, isReady } = useDataServices();
  
  return {
    monitor: performance,
    isReady: isReady && !!performance,
    // 便捷方法
    recordEvent: (name: string, startTime: number, endTime: number, success: boolean, metadata?: Record<string, any>) => {
      performance?.recordDataLoadingEvent(name, startTime, endTime, success, metadata || {});
    },
    getCurrentMetrics: () => performance?.getCurrentMetrics(),
    getReport: () => performance?.getPerformanceReport()
  };
}

/**
 * 缓存管理 Hook
 * 专门用于访问智能缓存服务
 */
export function useCacheManager<T = any>() {
  const { cache, isReady } = useDataServices();
  
  return {
    cache: cache as IntelligentCacheManager<T> | undefined,
    isReady: isReady && !!cache,
    // 便捷方法
    get: (key: string) => cache?.get<T>(key) || null,
    set: (key: string, value: T, options?: any) => cache?.set(key, value, options) || false,
    remove: (key: string) => cache?.remove(key),
    clear: () => cache?.clear(),
    getStats: () => cache?.getStats()
  };
}

/**
 * 数据同步 Hook
 * 专门用于访问增强同步优化器
 */
export function useDataSync() {
  const { sync, isReady } = useDataServices();
  
  return {
    sync,
    isReady: isReady && !!sync,
    // 便捷方法
    addSyncTask: (dataKey: string, operation: 'create' | 'update' | 'delete', data: any, priority?: 'low' | 'medium' | 'high' | 'critical') => {
      return sync?.addSyncTask(dataKey, operation, data, priority);
    },
    getSyncStats: () => sync?.getSyncStats(),
    forceSyncNow: () => sync?.forceSyncNow()
  };
}

/**
 * 数据存储 Hook
 * 专门用于访问统一存储策略
 */
export function useDataStorage() {
  const { storage, isReady } = useDataServices();
  
  return {
    storage,
    isReady: isReady && !!storage,
    // 便捷方法
    saveData: async (dataKey: string, data: any, level?: 'memory' | 'session' | 'local' | 'database' | 'hybrid') => {
      if (!storage) return false;
      return storage.saveData(dataKey, data, level);
    },
    loadData: async (dataKey: string) => {
      if (!storage) return null;
      return storage.loadData(dataKey);
    },
    removeData: async (dataKey: string) => {
      if (!storage) return false;
      return storage.removeData(dataKey);
    },
    getUserData: async (userId: string) => {
      if (!storage) return {};
      return storage.getUserData(userId);
    },
    clearUserData: async (userId: string) => {
      if (!storage) return false;
      return storage.clearUserData(userId);
    }
  };
}

/**
 * 综合数据操作 Hook
 * 结合缓存、同步和存储的便捷操作
 */
export function useDataOperations() {
  const cache = useCacheManager();
  const sync = useDataSync();
  const storage = useDataStorage();
  const performance = usePerformanceMonitor();
  
  const isReady = cache.isReady && sync.isReady && storage.isReady && performance.isReady;

  /**
   * 智能数据加载：先从缓存获取，没有则从存储加载并缓存
   */
  const loadDataSmart = async <T = any>(key: string): Promise<T | null> => {
    if (!isReady) return null;

    const startTime = performance.now();
    
    try {
      // 1. 先尝试从缓存获取
      const cached = cache.get<T>(key);
      if (cached !== null) {
        performance.recordEvent('data_load_cache_hit', startTime, performance.now(), true, { key });
        return cached;
      }

      // 2. 从存储加载
      const stored = await storage.loadData(key) as T;
      if (stored !== null) {
        // 3. 缓存存储的数据
        cache.set(key, stored, { ttl: 300000 }); // 5分钟TTL
        performance.recordEvent('data_load_storage_hit', startTime, performance.now(), true, { key });
        return stored;
      }

      performance.recordEvent('data_load_miss', startTime, performance.now(), true, { key });
      return null;

    } catch (error) {
      performance.recordEvent('data_load_error', startTime, performance.now(), false, { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return null;
    }
  };

  /**
   * 智能数据保存：同步到缓存、存储和远程
   */
  const saveDataSmart = async (key: string, data: any, options?: {
    level?: 'memory' | 'session' | 'local' | 'database' | 'hybrid';
    syncPriority?: 'low' | 'medium' | 'high' | 'critical';
    cacheTtl?: number;
  }): Promise<boolean> => {
    if (!isReady) return false;

    const startTime = performance.now();
    
    try {
      // 1. 立即缓存
      cache.set(key, data, { ttl: options?.cacheTtl || 300000 });

      // 2. 保存到存储
      const saveSuccess = await storage.saveData(key, data, options?.level);
      
      if (saveSuccess) {
        // 3. 添加同步任务
        await sync.addSyncTask(key, 'update', data, options?.syncPriority);
        
        performance.recordEvent('data_save_success', startTime, performance.now(), true, { 
          key, 
          level: options?.level || 'hybrid',
          priority: options?.syncPriority || 'medium'
        });
        return true;
      }

      performance.recordEvent('data_save_failed', startTime, performance.now(), false, { key });
      return false;

    } catch (error) {
      performance.recordEvent('data_save_error', startTime, performance.now(), false, { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  };

  /**
   * 智能数据删除：从缓存、存储和远程删除
   */
  const removeDataSmart = async (key: string): Promise<boolean> => {
    if (!isReady) return false;

    const startTime = performance.now();
    
    try {
      // 1. 从缓存删除
      cache.remove(key);

      // 2. 从存储删除
      const removeSuccess = await storage.removeData(key);
      
      if (removeSuccess) {
        // 3. 添加删除同步任务
        await sync.addSyncTask(key, 'delete', null, 'medium');
        
        performance.recordEvent('data_remove_success', startTime, performance.now(), true, { key });
        return true;
      }

      performance.recordEvent('data_remove_failed', startTime, performance.now(), false, { key });
      return false;

    } catch (error) {
      performance.recordEvent('data_remove_error', startTime, performance.now(), false, { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  };

  return {
    isReady,
    loadDataSmart,
    saveDataSmart,
    removeDataSmart,
    // 直接访问各个服务
    cache,
    sync,
    storage,
    performance
  };
}