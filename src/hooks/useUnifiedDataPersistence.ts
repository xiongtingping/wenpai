/**
 * 🗄️ 统一数据持久化Hook
 * 提供统一的数据存储和加载接口，解决数据持久化问题
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  unifiedDataPersistenceManager, 
  DataOperationResult,
  DATA_TYPE_CONFIGS 
} from '@/lib/unifiedDataPersistenceManager';
import { logger } from '@/utils/logger';

/**
 * 统一数据持久化Hook
 */
export function useUnifiedDataPersistence<T = any>(dataType: string) {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<DataOperationResult<T> | null>(null);

  // 当用户状态变化时，更新数据持久化管理器
  useEffect(() => {
    unifiedDataPersistenceManager.setUserId(user?.id || null);
  }, [user?.id]);

  /**
   * 保存数据
   */
  const saveData = useCallback(async (newData: T): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await unifiedDataPersistenceManager.saveData(dataType, newData);
      setLastOperation(result);
      
      if (result.success) {
        setData(newData);
        logger.info(`✅ 数据保存成功: ${dataType}`, { source: result.source });
        return true;
      } else {
        setError(result.error || '保存失败');
        logger.error(`❌ 数据保存失败: ${dataType}`, result.error);
        return false;
      }
    } catch (err) {
      const errorMessage = String(err);
      setError(errorMessage);
      logger.error(`❌ 数据保存异常: ${dataType}`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  /**
   * 加载数据
   */
  const loadData = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await unifiedDataPersistenceManager.loadData<T>(dataType);
      setLastOperation(result);
      
      if (result.success && result.data !== null) {
        setData(result.data);
        logger.info(`✅ 数据加载成功: ${dataType}`, { source: result.source });
        return result.data;
      } else {
        setData(null);
        if (result.error) {
          setError(result.error);
          logger.error(`❌ 数据加载失败: ${dataType}`, result.error);
        }
        return null;
      }
    } catch (err) {
      const errorMessage = String(err);
      setError(errorMessage);
      setData(null);
      logger.error(`❌ 数据加载异常: ${dataType}`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  /**
   * 删除数据
   */
  const deleteData = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await unifiedDataPersistenceManager.deleteData(dataType);
      setLastOperation(result);
      
      if (result.success) {
        setData(null);
        logger.info(`✅ 数据删除成功: ${dataType}`);
        return true;
      } else {
        setError(result.error || '删除失败');
        logger.error(`❌ 数据删除失败: ${dataType}`, result.error);
        return false;
      }
    } catch (err) {
      const errorMessage = String(err);
      setError(errorMessage);
      logger.error(`❌ 数据删除异常: ${dataType}`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  /**
   * 刷新数据（重新加载）
   */
  const refreshData = useCallback(async (): Promise<T | null> => {
    return await loadData();
  }, [loadData]);

  /**
   * 检查数据是否存在
   */
  const hasData = useCallback((): boolean => {
    return data !== null;
  }, [data]);

  /**
   * 获取数据配置信息
   */
  const getDataConfig = useCallback(() => {
    return DATA_TYPE_CONFIGS[dataType] || null;
  }, [dataType]);

  // 组件挂载时自动加载数据
  useEffect(() => {
    if (user?.id || DATA_TYPE_CONFIGS[dataType]?.strategy) {
      loadData();
    }
  }, [user?.id, dataType, loadData]);

  return {
    // 数据状态
    data,
    loading,
    error,
    lastOperation,
    
    // 操作方法
    saveData,
    loadData,
    deleteData,
    refreshData,
    
    // 工具方法
    hasData,
    getDataConfig,
    
    // 状态信息
    isOnline: navigator.onLine,
    dataSource: lastOperation?.source || 'unknown',
    isCloudSynced: lastOperation?.source === 'cloud' || lastOperation?.source === 'both'
  };
}

/**
 * 品牌资产数据Hook
 */
export function useBrandAssetsData() {
  return useUnifiedDataPersistence('brand_assets');
}

/**
 * 品牌维度数据Hook
 */
export function useBrandDimensionsData() {
  return useUnifiedDataPersistence('brand_dimensions');
}

/**
 * 用户历史记录Hook
 */
export function useUserHistoryData() {
  return useUnifiedDataPersistence('user_history');
}

/**
 * 收藏数据Hook
 */
export function useFavoritesData() {
  return useUnifiedDataPersistence('favorites');
}

/**
 * 适配历史Hook
 */
export function useAdaptHistoryData() {
  return useUnifiedDataPersistence('adapt_history');
}

/**
 * 批量数据操作Hook
 */
export function useBatchDataOperations() {
  const { user } = useAuth();

  /**
   * 批量保存多个数据类型
   */
  const batchSave = useCallback(async (dataMap: Record<string, any>): Promise<Record<string, boolean>> => {
    const results: Record<string, boolean> = {};
    
    for (const [dataType, data] of Object.entries(dataMap)) {
      try {
        const result = await unifiedDataPersistenceManager.saveData(dataType, data);
        results[dataType] = result.success;
      } catch (error) {
        logger.error(`❌ 批量保存失败: ${dataType}`, error);
        results[dataType] = false;
      }
    }
    
    return results;
  }, []);

  /**
   * 批量加载多个数据类型
   */
  const batchLoad = useCallback(async (dataTypes: string[]): Promise<Record<string, any>> => {
    const results: Record<string, any> = {};
    
    for (const dataType of dataTypes) {
      try {
        const result = await unifiedDataPersistenceManager.loadData(dataType);
        results[dataType] = result.success ? result.data : null;
      } catch (error) {
        logger.error(`❌ 批量加载失败: ${dataType}`, error);
        results[dataType] = null;
      }
    }
    
    return results;
  }, []);

  /**
   * 数据迁移工具
   */
  const migrateData = useCallback(async (fromDataType: string, toDataType: string): Promise<boolean> => {
    try {
      const result = await unifiedDataPersistenceManager.loadData(fromDataType);
      if (result.success && result.data) {
        const saveResult = await unifiedDataPersistenceManager.saveData(toDataType, result.data);
        if (saveResult.success) {
          await unifiedDataPersistenceManager.deleteData(fromDataType);
          logger.info(`✅ 数据迁移成功: ${fromDataType} -> ${toDataType}`);
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error(`❌ 数据迁移失败: ${fromDataType} -> ${toDataType}`, error);
      return false;
    }
  }, []);

  return {
    batchSave,
    batchLoad,
    migrateData,
    userId: user?.id || null
  };
}

/**
 * 数据同步状态Hook
 */
export function useDataSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    pendingSyncCount: number;
    lastSyncTime: number | null;
  }>({
    isOnline: navigator.onLine,
    pendingSyncCount: 0,
    lastSyncTime: null
  });

  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return syncStatus;
}
