/**
 * 🎯 防闪烁数据组件库
 * 提供智能数据加载和渐进式展示功能
 * 
 * 核心特性：
 * - 缓存优先加载，减少闪烁
 * - 骨架屏占位，平滑过渡  
 * - 错误边界处理
 * - 数据预加载支持
 */

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { globalDataManager } from '@/services/unifiedDataManager';

// 数据加载状态
interface DataLoadingState {
  isLoading: boolean;
  hasData: boolean;
  error: string | null;
}

// 数据上下文
interface DataContextType {
  preloadedData: Map<string, any>;
  loadingStates: Map<string, DataLoadingState>;
  setPreloadedData: (key: string, data: any) => void;
  setLoadingState: (key: string, state: DataLoadingState) => void;
}

const DataContext = createContext<DataContextType | null>(null);

/**
 * 数据提供者组件
 */
export const DataProvider: React.FC<{ children: React.ReactNode  }> = ({ children }) => {
  const [preloadedData] = useState(() => new Map<string, any>());
  const [loadingStates] = useState(() => new Map<string, DataLoadingState>());

  const setPreloadedData = (key: string, data: any) => {
    preloadedData.set(key, data);
  };

  const setLoadingState = (key: string, state: DataLoadingState) => {
    loadingStates.set(key, state);
  };

  return (
    <DataContext.Provider value={{
      preloadedData,
      loadingStates,
      setPreloadedData,
      setLoadingState
    }}>
      {children}
    </DataContext.Provider>
  );
};

/**
 * 使用数据上下文的Hook
 */
function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext必须在DataProvider内使用');
  }
  return context;
}

/**
 * 智能数据加载Hook
 */
export function useSmartData<T>(
  dataKey: string,
  options: {
    fallbackValue?: T;
    enablePreload?: boolean;
    cacheFirst?: boolean;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(options.fallbackValue || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const mounted = useRef(true);
  const dataContext = useDataContext();

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // 设置用户ID
    globalDataManager.setUserId(user.id);

    const loadData = async () => {
      try {
        setError(null);
        
        // 1. 检查预加载的数据
        if (dataContext.preloadedData.has(dataKey)) {
          const preloaded = dataContext.preloadedData.get(dataKey);
          if (mounted.current) {
            setData(preloaded);
            setIsLoading(false);
          }
          return;
        }

        // 2. 缓存优先策略
        if (options.cacheFirst !== false) {
          const cachedData = await globalDataManager.getData<T>(dataKey, false);
          if (cachedData && mounted.current) {
            setData(cachedData);
            setIsLoading(false);
            // 预加载到上下文
            dataContext.setPreloadedData(dataKey, cachedData);
            return;
          }
        }

        // 3. 强制刷新获取最新数据
        const freshData = await globalDataManager.getData<T>(dataKey, true);
        if (mounted.current) {
          setData(freshData || options.fallbackValue || null);
          setIsLoading(false);
          
          if (freshData) {
            dataContext.setPreloadedData(dataKey, freshData);
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(t('components.errors.数据加载失败'));
        console.error(`数据加载失败 ${dataKey}:`, error);
        
        if (mounted.current) {
          setError(error.message);
          setIsLoading(false);
          options.onError?.(error);
        }
      }
    };

    loadData();
  }, [dataKey, user?.id, options.cacheFirst, options.fallbackValue]);

  const refetch = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const freshData = await globalDataManager.getData<T>(dataKey, true);
      if (mounted.current) {
        setData(freshData || options.fallbackValue || null);
        setIsLoading(false);
        
        if (freshData) {
          dataContext.setPreloadedData(dataKey, freshData);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(t('components.errors.刷新失败'));
      if (mounted.current) {
        setError(error.message);
        setIsLoading(false);
      }
    }
  };

  const updateData = async (newData: T) => {
    try {
      const success = await globalDataManager.setData(dataKey, newData);
      if (success && mounted.current) {
        setData(newData);
        dataContext.setPreloadedData(dataKey, newData);
      }
      return success;
    } catch (err) {
      console.error(`数据更新失败 ${dataKey}:`, err);
      return false;
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    updateData
  };
}

/**
 * 数据感知组件 - 防闪烁数据展示
 */
export const DataAwareComponent: React.FC<{
  dataKey: string;
  fallbackValue?: any;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string) => React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: (data: any, actions: { refetch: () => Promise<void>; updateData: (newData: any) => Promise<boolean> }) => React.ReactNode;
  className?: string;
}> = ({
  dataKey,
  fallbackValue,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  className
}) => {
  const { data, isLoading, error, refetch, updateData } = useSmartData(dataKey, {
    fallbackValue,
    cacheFirst: true
  });

  // 错误状态
  if (error) {
    return (
      <div className={className}>
        {errorComponent ? errorComponent(error) : (
          <div className="text-destructive text-sm">
            加载失败: {error}
            <button 
              onClick={refetch}
              className="ml-2 text-primary hover:underline"
            >
              重试
            </button>
          </div>
        )}
      </div>
    );
  }

  // 加载状态
  if (isLoading && !data) {
    return (
      <div className={className}>
        {loadingComponent || <SkeletonPlaceholder />}
      </div>
    );
  }

  // 空数据状态
  if (!data && !isLoading) {
    return (
      <div className={className}>
        {emptyComponent || <div className="text-muted-foreground text-sm">暂无数据</div>}
      </div>
    );
  }

  // 正常数据展示
  return (
    <div className={`transition-opacity duration-200 ${className || ''}`}>
      {children(data, { refetch, updateData })}
    </div>
  );
};

/**
 * 骨架屏占位组件
 */
export const SkeletonPlaceholder: React.FC<{
  rows?: number;
  className?: string;
}> = ({ rows = 3, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-muted rounded"
          style={{ width: `${100 - (index * 10)}%` }}
        />
      ))}
    </div>
  );
};

/**
 * 渐进式加载容器
 */
export const ProgressiveLoader: React.FC<{
  children: React.ReactNode;
  delay?: number; // 延迟显示时间（ms）
  className?: string;
}> = ({ children, delay = 50, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    } ${className}`}>
      {children}
    </div>
  );
};

/**
 * 数据预加载Hook
 */
export function useDataPreloader() {
  const { user } = useAuth();
  const dataContext = useDataContext();

  const preloadData = async (dataKeys: string[]) => {
    if (!user?.id) return;

    globalDataManager.setUserId(user.id);
    console.log('🔄 开始预加载数据:', dataKeys);

    const promises = dataKeys.map(async (key) => {
      try {
        const data = await globalDataManager.getData(key);
        if (data) {
          dataContext.setPreloadedData(key, data);
        }
        return { key, success: true };
      } catch (error) {
        console.error(`预加载失败 ${key}:`, error);
        return { key, success: false, error };
      }
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ 数据预加载完成: ${successful}/${dataKeys.length}`);
    return results;
  };

  return { preloadData };
}

/**
 * 数据同步状态显示组件
 */
export const DataSyncIndicator: React.FC<{
  dataKey: string;
  showIcon?: boolean;
  className?: string;
}> = ({ dataKey, showIcon = true, className = '' }) => {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <span className="animate-spin">🔄</span>;
      case 'error':
        return <span className="text-destructive">❌</span>;
      default:
        return <span className="text-success">✅</span>;
    }
  };

  const getSyncText = () => {
    switch (syncStatus) {
      case 'syncing':
        return '同步中...';
      case 'error':
        return '同步失败';
      default:
        return '已同步';
    }
  };

  return (
    <div className={`flex items-center text-xs text-muted-foreground ${className}`}>
      {showIcon && getSyncIcon()}
      <span className="ml-1">{getSyncText()}</span>
    </div>
  );
};

export default {
  DataProvider,
  DataAwareComponent,
  SkeletonPlaceholder,
  ProgressiveLoader,
  useSmartData,
  useDataPreloader,
  DataSyncIndicator
};