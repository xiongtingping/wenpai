/**
 * 🔐 安全存储 Hook
 * 提供类型安全的数据存储操作，自动处理用户隔离和权限验证
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { useState, useEffect, useCallback } from 'react';
import { useDataStorage } from '@/utils/dataStorageManager';
import { useAuth } from '@/hooks/useAuth';

export interface UseSecureStorageOptions {
  /** 是否在组件挂载时自动加载数据 */
  autoLoad?: boolean;
  /** 数据变化时的回调函数 */
  onDataChange?: (data: any) => void;
  /** 错误处理回调 */
  onError?: (error: Error) => void;
  /** 默认值 */
  defaultValue?: any;
}

export interface UseSecureStorageResult<T> {
  /** 当前数据 */
  data: T | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 保存数据 */
  save: (value: T) => Promise<void>;
  /** 重新加载数据 */
  reload: () => Promise<void>;
  /** 删除数据 */
  remove: () => Promise<void>;
  /** 清除错误 */
  clearError: () => void;
}

/**
 * 安全存储 Hook
 */
export function useSecureStorage<T = any>(
  dataType: string,
  options: UseSecureStorageOptions = {}
): UseSecureStorageResult<T> {
  const {
    autoLoad = true,
    onDataChange,
    onError,
    defaultValue = null
  } = options;

  const { user, isAuthenticated } = useAuth();
  const dataStorage = useDataStorage();

  const [data, setData] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 处理错误
   */
  const handleError = useCallback((err: Error) => {
    const errorMessage = err.message || '操作失败';
    setError(errorMessage);
    onError?.(err);
    console.error(`存储操作失败 [${dataType}]:`, err);
  }, [dataType, onError]);

  /**
   * 加载数据
   */
  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await dataStorage.load<T>(dataType);
      const newData = result !== null ? result : defaultValue;
      
      setData(newData);
      onDataChange?.(newData);
    } catch (err) {
      handleError(err as Error);
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [dataType, dataStorage, defaultValue, onDataChange, handleError]);

  /**
   * 保存数据
   */
  const save = useCallback(async (value: T) => {
    try {
      setLoading(true);
      setError(null);

      await dataStorage.save(dataType, value);
      setData(value);
      onDataChange?.(value);
    } catch (err) {
      handleError(err as Error);
      throw err; // 重新抛出错误，让调用者处理
    } finally {
      setLoading(false);
    }
  }, [dataType, dataStorage, onDataChange, handleError]);

  /**
   * 删除数据
   */
  const remove = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await dataStorage.remove(dataType);
      setData(defaultValue);
      onDataChange?.(defaultValue);
    } catch (err) {
      handleError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dataType, dataStorage, defaultValue, onDataChange, handleError]);

  /**
   * 用户变化时重新加载数据
   */
  useEffect(() => {
    if (autoLoad) {
      reload();
    }
  }, [user?.id, isAuthenticated, autoLoad, reload]);

  /**
   * 组件卸载时清理过期数据
   */
  useEffect(() => {
    return () => {
      dataStorage.cleanupExpiredData();
    };
  }, [dataStorage]);

  return {
    data,
    loading,
    error,
    save,
    reload,
    remove,
    clearError
  };
}

/**
 * UI 偏好设置 Hook
 */
export function useUIPreferences() {
  return {
    theme: useSecureStorage<string>('ui_theme', { defaultValue: 'system' }),
    language: useSecureStorage<string>('ui_language', { defaultValue: 'zh-CN' }),
    layout: useSecureStorage<string>('ui_layout', { defaultValue: 'default' }),
    sidebarCollapsed: useSecureStorage<boolean>('ui_sidebar_collapsed', { defaultValue: false }),
    fontSize: useSecureStorage<number>('ui_font_size', { defaultValue: 14 }),
    colorScheme: useSecureStorage<string>('ui_color_scheme', { defaultValue: 'blue' })
  };
}

/**
 * 临时数据 Hook
 */
export function useTempStorage<T = any>(key: string, defaultValue?: T) {
  return useSecureStorage<T>(`form_draft_${key}`, { 
    defaultValue,
    autoLoad: true 
  });
}

/**
 * 用户业务数据 Hook
 */
export function useUserData<T = any>(dataType: string, options?: UseSecureStorageOptions) {
  const { user } = useAuth();
  
  return useSecureStorage<T>(dataType, {
    ...options,
    autoLoad: !!user?.id && (options?.autoLoad !== false)
  });
}

/**
 * 批量存储操作 Hook
 */
export function useBatchStorage() {
  const dataStorage = useDataStorage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const batchSave = useCallback(async (items: Array<{ dataType: string; value: any }>) => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all(
        items.map(item => dataStorage.save(item.dataType, item.value))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'u64cdu4f5cu5931u8d25';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dataStorage]);

  const batchLoad = useCallback(async <T = any>(dataTypes: string[]): Promise<Record<string, T | null>> => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.all(
        dataTypes.map(async dataType => ({
          dataType,
          data: await dataStorage.load<T>(dataType)
        }))
      );

      return results.reduce((acc, { dataType, data }) => {
        acc[dataType] = data;
        return acc;
      }, {} as Record<string, T | null>);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'u64cdu4f5cu5931u8d25';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dataStorage]);

  const batchRemove = useCallback(async (dataTypes: string[]) => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all(
        dataTypes.map(dataType => dataStorage.remove(dataType))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'u64cdu4f5cu5931u8d25';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dataStorage]);

  return {
    loading,
    error,
    batchSave,
    batchLoad,
    batchRemove,
    clearError: () => setError(null)
  };
}

export default useSecureStorage;
