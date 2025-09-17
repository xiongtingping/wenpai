/**
 * 🎨 防闪烁数据感知组件系统
 * 解决数据加载时的UI闪烁问题
 * 
 * 核心功能：
 * - DataAwareComponent: 数据感知组件，提供渐进式数据加载
 * - SkeletonProvider: 智能骨架屏提供者
 * - DataLoadingBoundary: 数据加载边界组件
 * - SmartSkeleton: 智能骨架屏组件
 * - PreloadIndicator: 预加载状态指示器
 */

import React, { useState, useEffect, createContext, useContext, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { dataPreloader, useDataPreloader } from '@/services/enhancedDataPreloader';
import { globalDataManager } from '@/services/unifiedDataManager';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

// === 类型定义 ===

interface DataLoadingState {
  isLoading: boolean;
  hasData: boolean;
  error?: string;
  source?: 'cache' | 'cloud' | 'fallback';
  loadTime?: number;
}

interface SkeletonContextState {
  isDataReady: boolean;
  criticalDataKeys: string[];
  loadingProgress: number;
  preloadStats: any;
}

// === Context ===

const SkeletonContext = createContext<SkeletonContextState>({ isDataReady: false,
  criticalDataKeys: [],
  loadingProgress: 0,
  preloadStats: null
 });

// === 数据感知组件 ===

interface DataAwareComponentProps<T> {
  dataKey: string;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: string) => React.ReactNode;
  children: (data: T | null, state: DataLoadingState) => React.ReactNode;
  refreshInterval?: number;
  skipCache?: boolean;
  onDataLoaded?: (data: T, state: DataLoadingState) => void;
  onError?: (error: string) => void;
}

export function DataAwareComponent<T>({
  dataKey,
  fallback = <SmartSkeleton variant="content" />,
  loadingFallback,
  errorFallback,
  children,
  refreshInterval,
  skipCache = false,
  onDataLoaded,
  onError
}: DataAwareComponentProps<T>) {
  const { t } = useTranslation();
  const [data, setData] = useState<T | null>(null);
  const [loadingState, setLoadingState] = useState<DataLoadingState>({
    isLoading: true,
    hasData: false
  });

  const { user } = useAuth();
  const { getData, isPreloaded } = useDataPreloader();
  const mountedRef = useRef(true);
  const lastLoadTimeRef = useRef<number>(0);

  // 数据加载函数
  const loadData = async (force = false) => {
    if (!mountedRef.current) return;

    const startTime = Date.now();
    setLoadingState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // 如果数据已预加载且不强制刷新，直接使用预加载数据
      if (!force && isPreloaded(dataKey)) {
        const preloadedData = await getData<T>(dataKey);
        if (preloadedData && mountedRef.current) {
          const newState: DataLoadingState = {
            isLoading: false,
            hasData: true,
            source: 'cache',
            loadTime: Date.now() - startTime
          };
          
          setData(preloadedData);
          setLoadingState(newState);
          lastLoadTimeRef.current = Date.now();
          
          onDataLoaded?.(preloadedData, newState);
          return;
        }
      }

      // 智能数据获取
      const freshData = await globalDataManager.getData<T>(dataKey, force);
      
      if (mountedRef.current) {
        const newState: DataLoadingState = {
          isLoading: false,
          hasData: freshData !== null,
          source: 'cloud',
          loadTime: Date.now() - startTime
        };

        setData(freshData);
        setLoadingState(newState);
        lastLoadTimeRef.current = Date.now();
        
        if (freshData) {
          onDataLoaded?.(freshData, newState);
        }
      }

    } catch (error) {
      if (mountedRef.current) {
        const errorMsg = error instanceof Error ? error.message : t('components.errors.数据加载失败');
        const errorState: DataLoadingState = {
          isLoading: false,
          hasData: false,
          error: errorMsg,
          loadTime: Date.now() - startTime
        };

        setLoadingState(errorState);
        onError?.(errorMsg);
        logger.warn(`DataAwareComponent数据加载失败 [${dataKey}]:`, error);
      }
    }
  };

  // 初始数据加载
  useEffect(() => {
    loadData();
  }, [dataKey, user?.id, skipCache]);

  // 定期刷新
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      const timeSinceLastLoad = Date.now() - lastLoadTimeRef.current;
      if (timeSinceLastLoad >= refreshInterval) {
        loadData(true);
      }
    }, Math.min(refreshInterval, 60000)); // 最少1分钟检查一次

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // 清理函数
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 渲染逻辑
  if (loadingState.error && errorFallback) {
    return <>{errorFallback(loadingState.error)}</>;
  }

  if (loadingState.isLoading && !loadingState.hasData) {
    return <>{loadingFallback || fallback}</>;
  }

  return <>{children(data, loadingState)}</>;
}

// === 智能骨架屏组件 ===

interface SmartSkeletonProps {
  variant?: 'text' | 'content' | 'card' | 'list' | 'custom';
  lines?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

export function SmartSkeleton({
  variant = 'content',
  lines = 3,
  width,
  height,
  className = '',
  animated = true,
  children
}: SmartSkeletonProps) {
  const baseClass = `
    bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
    ${animated ? 'animate-pulse' : ''} 
    rounded 
    ${className}
  `;

  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array(lines).fill(0).map((_, i) => (
              <div
                key={i}
                className={`${baseClass} skeleton-line ${i === lines - 1 ? 'skeleton-line-partial' : 'skeleton-line-full'}`}
              />
            ))}
          </div>
        );

      case 'card':
        return (
          <div className={`border rounded-lg p-4 space-y-3 ${className}`}>
            <div className={`${baseClass} h-6`} />
            <div className={`${baseClass} h-4 w-3/4`} />
            <div className={`${baseClass} h-4 w-1/2`} />
          </div>
        );

      case 'list':
        return (
          <div className="space-y-3">
            {Array(lines).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`${baseClass} w-10 h-10 rounded-full`} />
                <div className="flex-1 space-y-2">
                  <div className={`${baseClass} h-4 w-3/4`} />
                  <div className={`${baseClass} h-3 w-1/2`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'custom':
        return children || <div className={`${baseClass} dynamic-bg-color`} style={{ '--dynamic-bg-color': 'hsl(var(--muted))', width, height } as React.CSSProperties} />;

      default:
        return (
          <div className="space-y-3">
            <div className={`${baseClass} h-6 w-1/3`} />
            <div className="space-y-2">
              {Array(lines).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`${baseClass} skeleton-line ${i === lines - 1 ? 'skeleton-line-narrow' : 'skeleton-line-full'}`}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-pulse dynamic-bg-color" style={{ '--dynamic-bg-color': 'transparent', width, height } as React.CSSProperties}>
      {renderSkeleton()}
    </div>
  );
}

// === 骨架屏提供者 ===

interface SkeletonProviderProps {
  children: React.ReactNode;
  criticalDataKeys?: string[];
  loadingThreshold?: number; // 加载阈值，低于此值显示骨架屏
}

export function SkeletonProvider({
  children,
  criticalDataKeys = [
    'favorites',
    'theme', 
    'globalSettings',
    'preferredAIModel',
    'selectedPlan'
  ],
  loadingThreshold = 0.7
}: SkeletonProviderProps) {
  const [contextState, setContextState] = useState<SkeletonContextState>({
    isDataReady: false,
    criticalDataKeys,
    loadingProgress: 0,
    preloadStats: null
  });

  const { user } = useAuth();
  const { getStats, getResults } = useDataPreloader();

  // 监控数据就绪状态
  useEffect(() => {
    if (!user?.id) {
      setContextState(prev => ({
        ...prev,
        isDataReady: false,
        loadingProgress: 0
      }));
      return;
    }

    const checkDataReadiness = () => {
      const results = getResults();
      const stats = getStats();
      
      if (results.length === 0) {
        return; // 预加载尚未开始
      }

      // 计算关键数据加载进度
      const criticalResults = results.filter(r => 
        criticalDataKeys.includes(r.key)
      );
      
      const loadedCritical = criticalResults.filter(r => r.success);
      const progress = criticalResults.length > 0 
        ? loadedCritical.length / criticalResults.length 
        : 0;

      const isReady = progress >= loadingThreshold;

      setContextState(prev => ({
        ...prev,
        isDataReady: isReady,
        loadingProgress: progress,
        preloadStats: stats
      }));
    };

    checkDataReadiness();
    
    // 🔧 PERF FIX: 定期检查数据状态，优化频率避免过度检查
    const interval = setInterval(checkDataReadiness, 500);
    
    // 3秒后如果还没准备好，强制显示内容
    const forceShow = setTimeout(() => {
      setContextState(prev => ({ ...prev, isDataReady: true }));
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(forceShow);
    };
  }, [user?.id, criticalDataKeys, loadingThreshold]);

  return (
    <SkeletonContext.Provider value={contextState}>
      <div 
        className={`transition-opacity duration-300 ${
          contextState.isDataReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </SkeletonContext.Provider>
  );
}

// === 数据加载边界组件 ===

interface DataLoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minLoadingTime?: number; // 最小loading时间，防止闪烁
  onError?: (error: Error) => void;
}

export function DataLoadingBoundary({
  children,
  fallback = <SmartSkeleton variant="content" lines={5} />,
  minLoadingTime = 200,
  onError
}: DataLoadingBoundaryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const startTimeRef = useRef(Date.now());

  const skeletonContext = useContext(SkeletonContext);

  useEffect(() => {
    const checkReadiness = async () => {
      // 等待最小加载时间
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => 
          setTimeout(resolve, minLoadingTime - elapsed)
        );
      }

      // 检查数据是否准备就绪
      if (skeletonContext.isDataReady) {
        setIsLoading(false);
      }
    };

    if (skeletonContext.isDataReady || skeletonContext.loadingProgress > 0.8) {
      checkReadiness();
    }
  }, [skeletonContext.isDataReady, skeletonContext.loadingProgress, minLoadingTime]);

  // 错误边界
  const handleError = (error: Error) => {
    setHasError(true);
    onError?.(error);
  };

  if (hasError) {
    return (
      <div className="p-4 text-center">
        <div className="text-destructive mb-2">数据加载出现错误</div>
        <button 
          onClick={() => {
            setHasError(false);
            setIsLoading(true);
            startTimeRef.current = Date.now();
          }}
          className="px-4 py-2 bg-primary text-background rounded hover:bg-primary"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// === 预加载状态指示器 ===

interface PreloadIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showProgress?: boolean;
  className?: string;
}

export function PreloadIndicator({
  position = 'bottom-right',
  showProgress = true,
  className = ''
}: PreloadIndicatorProps) {
  const skeletonContext = useContext(SkeletonContext);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(skeletonContext.loadingProgress > 0 && !skeletonContext.isDataReady);
  }, [skeletonContext.loadingProgress, skeletonContext.isDataReady]);

  if (!visible) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={`
      fixed ${positionClasses[position]} 
      bg-background/90 backdrop-blur-sm 
      border border-border 
      rounded-lg shadow-lg 
      px-3 py-2 
      text-sm 
      z-50
      transition-all duration-300
      ${className}
    `}>
      <div className="flex items-center space-x-2">
        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
        <span>加载中...</span>
        {showProgress && (
          <span className="text-muted-foreground">
            {Math.round(skeletonContext.loadingProgress * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}

// === Hooks ===

export function useSkeletonContext() {
  return useContext(SkeletonContext);
}

export function useDataLoadingState() {
  const skeletonContext = useContext(SkeletonContext);
  const { getStats } = useDataPreloader();
  
  return useMemo(() => ({
    isDataReady: skeletonContext.isDataReady,
    loadingProgress: skeletonContext.loadingProgress,
    preloadStats: skeletonContext.preloadStats || getStats(),
    criticalDataLoaded: skeletonContext.loadingProgress >= 0.7
  }), [skeletonContext, getStats]);
}

// === 导出 ===

export {
  SkeletonContext,
  type DataLoadingState,
  type SkeletonContextState
};