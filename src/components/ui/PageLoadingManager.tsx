/**
 * 页面加载管理器
 * @description 管理整个页面的加载状态，防止状态闪烁，提供一致的用户体验
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 页面加载阶段
 */
export enum PageLoadingPhase {
  /** 初始化 */
  INITIALIZING = 'initializing',
  /** 认证中 */
  AUTHENTICATING = 'authenticating',
  /** 加载用户数据 */
  LOADING_USER_DATA = 'loading_user_data',
  /** 加载订阅信息 */
  LOADING_SUBSCRIPTION = 'loading_subscription',
  /** 加载使用统计 */
  LOADING_USAGE_STATS = 'loading_usage_stats',
  /** 加载权限 */
  LOADING_PERMISSIONS = 'loading_permissions',
  /** 加载页面数据 */
  LOADING_PAGE_DATA = 'loading_page_data',
  /** 完成 */
  COMPLETE = 'complete',
  /** 错误 */
  ERROR = 'error'
}

/**
 * 页面加载状态
 */
export interface PageLoadingState {
  phase: PageLoadingPhase;
  progress: number; // 0-100
  message: string;
  error?: string;
  canRetry?: boolean;
  details?: Record<string, any>;
}

/**
 * 页面加载上下文
 */
interface PageLoadingContextType {
  state: PageLoadingState;
  updateState: (updates: Partial<PageLoadingState>) => void;
  setPhase: (phase: PageLoadingPhase, message?: string) => void;
  setError: (error: string, canRetry?: boolean) => void;
  retry: () => void;
  isLoading: boolean;
  isComplete: boolean;
  hasError: boolean;
}

const PageLoadingContext = createContext<PageLoadingContextType | null>(null);

/**
 * 使用页面加载上下文
 */
export function usePageLoading() {
  const context = useContext(PageLoadingContext);
  if (!context) {
    throw new Error('usePageLoading must be used within a PageLoadingProvider');
  }
  return context;
}

/**
 * 阶段进度映射
 */
const PHASE_PROGRESS_MAP: Record<PageLoadingPhase, number> = {
  [PageLoadingPhase.INITIALIZING]: 10,
  [PageLoadingPhase.AUTHENTICATING]: 20,
  [PageLoadingPhase.LOADING_USER_DATA]: 35,
  [PageLoadingPhase.LOADING_SUBSCRIPTION]: 50,
  [PageLoadingPhase.LOADING_USAGE_STATS]: 65,
  [PageLoadingPhase.LOADING_PERMISSIONS]: 80,
  [PageLoadingPhase.LOADING_PAGE_DATA]: 90,
  [PageLoadingPhase.COMPLETE]: 100,
  [PageLoadingPhase.ERROR]: 0
};

/**
 * 阶段消息映射
 */
const PHASE_MESSAGE_MAP: Record<PageLoadingPhase, string> = {
  [PageLoadingPhase.INITIALIZING]: '初始化系统...',
  [PageLoadingPhase.AUTHENTICATING]: '验证身份...',
  [PageLoadingPhase.LOADING_USER_DATA]: '加载用户信息...',
  [PageLoadingPhase.LOADING_SUBSCRIPTION]: '检查订阅状态...',
  [PageLoadingPhase.LOADING_USAGE_STATS]: '获取使用统计...',
  [PageLoadingPhase.LOADING_PERMISSIONS]: '验证权限...',
  [PageLoadingPhase.LOADING_PAGE_DATA]: '加载页面数据...',
  [PageLoadingPhase.COMPLETE]: '加载完成',
  [PageLoadingPhase.ERROR]: '加载失败'
};

/**
 * 页面加载提供者属性
 */
interface PageLoadingProviderProps {
  children: ReactNode;
  /** 初始阶段 */
  initialPhase?: PageLoadingPhase;
  /** 重试回调 */
  onRetry?: () => void;
  /** 自动重试间隔（毫秒）*/
  autoRetryInterval?: number;
  /** 最大自动重试次数 */
  maxAutoRetries?: number;
}

/**
 * 页面加载提供者
 */
export const PageLoadingProvider: React.FC<PageLoadingProviderProps> = ({
  children,
  initialPhase = PageLoadingPhase.INITIALIZING,
  onRetry,
  autoRetryInterval = 5000,
  maxAutoRetries = 3
}) => {
  const [state, setState] = useState<PageLoadingState>({
    phase: initialPhase,
    progress: PHASE_PROGRESS_MAP[initialPhase],
    message: PHASE_MESSAGE_MAP[initialPhase]
  });

  const [retryCount, setRetryCount] = useState(0);

  const updateState = (updates: Partial<PageLoadingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setPhase = (phase: PageLoadingPhase, message?: string) => {
    updateState({
      phase,
      progress: PHASE_PROGRESS_MAP[phase],
      message: message || PHASE_MESSAGE_MAP[phase],
      error: undefined
    });
  };

  const setError = (error: string, canRetry = true) => {
    updateState({
      phase: PageLoadingPhase.ERROR,
      progress: 0,
      message: PHASE_MESSAGE_MAP[PageLoadingPhase.ERROR],
      error,
      canRetry
    });
  };

  const retry = () => {
    if (onRetry) {
      setRetryCount(prev => prev + 1);
      setPhase(PageLoadingPhase.INITIALIZING, '重新加载...');
      onRetry();
    }
  };

  // 自动重试逻辑
  useEffect(() => {
    if (
      state.phase === PageLoadingPhase.ERROR &&
      state.canRetry &&
      retryCount < maxAutoRetries &&
      autoRetryInterval > 0
    ) {
      const timer = setTimeout(() => {
        retry();
      }, autoRetryInterval);

      return () => clearTimeout(timer);
    }
  }, [state.phase, state.canRetry, retryCount, maxAutoRetries, autoRetryInterval]);

  const contextValue: PageLoadingContextType = {
    state,
    updateState,
    setPhase,
    setError,
    retry,
    isLoading: state.phase !== PageLoadingPhase.COMPLETE && state.phase !== PageLoadingPhase.ERROR,
    isComplete: state.phase === PageLoadingPhase.COMPLETE,
    hasError: state.phase === PageLoadingPhase.ERROR
  };

  return (
    <PageLoadingContext.Provider value={contextValue}>
      {children}
    </PageLoadingContext.Provider>
  );
};

/**
 * 页面加载屏幕属性
 */
interface PageLoadingScreenProps {
  /** 自定义类名 */
  className?: string;
  /** 显示详细信息 */
  showDetails?: boolean;
  /** 显示进度条 */
  showProgress?: boolean;
  /** 自定义加载图标 */
  LoadingIcon?: React.ComponentType<{ className?: string }>;
}

/**
 * 页面加载屏幕
 */
export const PageLoadingScreen: React.FC<PageLoadingScreenProps> = ({
  className = '',
  showDetails = true,
  showProgress = true,
  LoadingIcon = Loader2
}) => {
  const { state, retry, hasError } = usePageLoading();

  if (hasError) {
    return (
      <div className={`flex items-center justify-center min-h-screen p-6 ${className}`}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">加载失败</h3>
            <p className="text-muted-foreground text-sm">
              {state.error || '页面加载时发生错误'}
            </p>
            {state.canRetry && (
              <Button onClick={retry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新加载
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center min-h-screen p-6 ${className}`}>
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          {/* 加载图标 */}
          <LoadingIcon className="w-12 h-12 text-primary mx-auto animate-spin" />
          
          {/* 加载消息 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {state.message}
            </h3>
            
            {/* 进度条 */}
            {showProgress && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out progress-bar"
                  style={{ '--progress-width': `${Math.min(state.progress, 100)}%` } as React.CSSProperties}
                />
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              {Math.round(state.progress)}% 完成
            </p>
          </div>
          
          {/* 详细信息 */}
          {showDetails && state.details && (
            <div className="text-left space-y-2">
              <h4 className="text-sm font-medium text-foreground">加载详情：</h4>
              <div className="space-y-1">
                {Object.entries(state.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="text-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * 页面加载骨架屏
 */
export const PageLoadingSkeleton: React.FC<{
  className?: string;
  layout?: 'dashboard' | 'list' | 'card' | 'form';
}> = ({ className = '', layout = 'dashboard' }) => {
  const skeletonLayouts = {
    dashboard: (
      <div className="space-y-6">
        {/* 头部 */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* 主要内容 */}
        <Card className="animate-pulse">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    
    list: (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded animate-pulse">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    ),
    
    card: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    
    form: (
      <Card className="max-w-2xl mx-auto animate-pulse">
        <CardContent className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  };

  return (
    <div className={`p-6 ${className}`}>
      {skeletonLayouts[layout]}
    </div>
  );
};

/**
 * 智能页面包装器
 */
export const SmartPageWrapper: React.FC<{
  children: ReactNode;
  className?: string;
  loadingLayout?: 'dashboard' | 'list' | 'card' | 'form';
  enableLoadingScreen?: boolean;
}> = ({ 
  children, 
  className = '', 
  loadingLayout = 'dashboard',
  enableLoadingScreen = false 
}) => {
  const { isLoading, isComplete } = usePageLoading();

  if (isLoading && !isComplete) {
    if (enableLoadingScreen) {
      return <PageLoadingScreen className={className} />;
    } else {
      return <PageLoadingSkeleton className={className} layout={loadingLayout} />;
    }
  }

  return <div className={className}>{children}</div>;
};

export default PageLoadingProvider;