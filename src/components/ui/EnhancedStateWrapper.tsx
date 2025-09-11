/**
 * 增强状态包装器 - 完善防闪烁覆盖范围
 * @description 提供全面的状态管理和防闪烁机制，覆盖更多使用场景
 */

import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useUnifiedUsageStats } from '@/hooks/useUnifiedUsageStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

/**
 * 状态类型
 */
export type StateType = 
  | 'auth' 
  | 'subscription' 
  | 'usage' 
  | 'permission' 
  | 'data' 
  | 'network' 
  | 'combined';

/**
 * 加载状态
 */
export interface LoadingState {
  isLoading: boolean;
  isInitialized: boolean;
  hasError: boolean;
  error?: string;
  lastUpdated?: number;
}

/**
 * 增强状态包装器属性
 */
interface EnhancedStateWrapperProps {
  children: React.ReactNode;
  /** 要监控的状态类型 */
  stateType: StateType | StateType[];
  /** 自定义加载组件 */
  loadingComponent?: React.ReactNode;
  /** 自定义错误组件 */
  errorComponent?: React.ReactNode;
  /** 自定义骨架屏 */
  skeleton?: React.ReactNode;
  /** 显示模式 */
  mode?: 'spinner' | 'skeleton' | 'card' | 'minimal';
  /** 最小加载时间（防止闪烁） */
  minLoadingTime?: number;
  /** 延迟显示加载状态的时间 */
  delayTime?: number;
  /** 自定义类名 */
  className?: string;
  /** 是否启用重试 */
  enableRetry?: boolean;
  /** 重试回调 */
  onRetry?: () => void;
  /** 加载完成回调 */
  onLoaded?: () => void;
  /** 错误回调 */
  onError?: (error: string) => void;
}

/**
 * 默认骨架屏组件
 */
const DefaultSkeleton: React.FC<{ mode: string }> = ({ mode }) => {
  switch (mode) {
    case 'card':
      return (
        <Card className="animate-pulse">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      );
    case 'skeleton':
      return (
        <div className="space-y-3 animate-pulse">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    case 'minimal':
      return <Skeleton className="h-4 w-16" />;
    default:
      return (
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      );
  }
};

/**
 * 默认错误组件
 */
const DefaultErrorComponent: React.FC<{ 
  error: string; 
  enableRetry?: boolean; 
  onRetry?: () => void;
}> = ({ error, enableRetry, onRetry }) => (
  <div className="flex items-center space-x-2 text-destructive text-sm">
    <AlertCircle className="w-4 h-4" />
    <span>{error}</span>
    {enableRetry && onRetry && (
      <button
        onClick={onRetry}
        className="text-primary hover:text-blue-800 underline ml-2"
      >
        重试
      </button>
    )}
  </div>
);

/**
 * 获取状态钩子
 */
function useStateStatus(stateType: StateType): LoadingState {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const { primaryStatus, loading: subLoading, error: subError } = useSubscriptionStatus();
  const { loading: usageLoading, error: usageError, lastUpdated } = useUnifiedUsageStats();

  return useMemo(() => {
    switch (stateType) {
      case 'auth':
        return {
          isLoading: authLoading,
          isInitialized: user !== null || !isAuthenticated,
          hasError: false,
          lastUpdated: Date.now()
        };

      case 'subscription':
        return {
          isLoading: subLoading,
          isInitialized: primaryStatus !== null,
          hasError: !!subError,
          error: subError || undefined,
          lastUpdated: Date.now()
        };

      case 'usage':
        return {
          isLoading: usageLoading,
          isInitialized: !usageLoading,
          hasError: !!usageError,
          error: usageError || undefined,
          lastUpdated: lastUpdated ? new Date(lastUpdated).getTime() : Date.now()
        };

      case 'permission':
        // 权限状态通常依赖认证和订阅状态
        return {
          isLoading: authLoading || subLoading,
          isInitialized: (user !== null || !isAuthenticated) && primaryStatus !== null,
          hasError: !!subError,
          error: subError || undefined,
          lastUpdated: Date.now()
        };

      case 'combined':
        // 组合状态：任一状态加载中则显示加载
        const isAnyLoading = authLoading || subLoading || usageLoading;
        const hasAnyError = !!subError || !!usageError;
        const isAllInitialized = (user !== null || !isAuthenticated) && 
                                primaryStatus !== null && 
                                !usageLoading;
        return {
          isLoading: isAnyLoading,
          isInitialized: isAllInitialized,
          hasError: hasAnyError,
          error: subError || usageError || undefined,
          lastUpdated: Math.max(
            Date.now(),
            lastUpdated ? new Date(lastUpdated).getTime() : 0
          )
        };

      case 'data':
      case 'network':
      default:
        return {
          isLoading: false,
          isInitialized: true,
          hasError: false,
          lastUpdated: Date.now()
        };
    }
  }, [
    stateType, authLoading, isAuthenticated, user,
    subLoading, subError, primaryStatus,
    usageLoading, usageError, lastUpdated
  ]);
}

/**
 * 组合多个状态
 */
function useCombinedStateStatus(stateTypes: StateType[]): LoadingState {
  const states = stateTypes.map(type => useStateStatus(type));

  return useMemo(() => {
    const isAnyLoading = states.some(s => s.isLoading);
    const hasAnyError = states.some(s => s.hasError);
    const isAllInitialized = states.every(s => s.isInitialized);
    const firstError = states.find(s => s.hasError)?.error;
    const lastUpdated = Math.max(...states.map(s => s.lastUpdated || 0));

    return {
      isLoading: isAnyLoading,
      isInitialized: isAllInitialized,
      hasError: hasAnyError,
      error: firstError,
      lastUpdated
    };
  }, [states]);
}

/**
 * 防闪烁延迟钩子
 */
function useAntiFlicker(
  isLoading: boolean,
  minLoadingTime: number = 300,
  delayTime: number = 100
) {
  const [showLoading, setShowLoading] = useState(false);
  const [forceMinTime, setForceMinTime] = useState(false);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let minTimer: NodeJS.Timeout;

    if (isLoading) {
      // 延迟显示加载状态
      delayTimer = setTimeout(() => {
        setShowLoading(true);
        setForceMinTime(true);

        // 确保最小显示时间
        minTimer = setTimeout(() => {
          setForceMinTime(false);
        }, minLoadingTime);
      }, delayTime);
    } else {
      // 如果正在强制显示，等待最小时间结束
      if (!forceMinTime) {
        setShowLoading(false);
      }
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minTimer);
    };
  }, [isLoading, minLoadingTime, delayTime, forceMinTime]);

  useEffect(() => {
    if (!forceMinTime && !isLoading) {
      setShowLoading(false);
    }
  }, [forceMinTime, isLoading]);

  return showLoading;
}

/**
 * 增强状态包装器组件
 */
export const EnhancedStateWrapper: React.FC<EnhancedStateWrapperProps> = ({
  children,
  stateType,
  loadingComponent,
  errorComponent,
  skeleton,
  mode = 'spinner',
  minLoadingTime = 300,
  delayTime = 100,
  className = '',
  enableRetry = false,
  onRetry,
  onLoaded,
  onError
}) => {
  // 获取状态
  const stateStatus = Array.isArray(stateType) 
    ? useCombinedStateStatus(stateType)
    : useStateStatus(stateType);

  // 防闪烁处理
  const shouldShowLoading = useAntiFlicker(
    stateStatus.isLoading,
    minLoadingTime,
    delayTime
  );

  // 状态变化回调
  useEffect(() => {
    if (stateStatus.isInitialized && !stateStatus.isLoading && !stateStatus.hasError) {
      onLoaded?.();
    }
  }, [stateStatus.isInitialized, stateStatus.isLoading, stateStatus.hasError, onLoaded]);

  useEffect(() => {
    if (stateStatus.hasError && stateStatus.error) {
      onError?.(stateStatus.error);
    }
  }, [stateStatus.hasError, stateStatus.error, onError]);

  // 如果有错误，显示错误组件
  if (stateStatus.hasError) {
    if (errorComponent) {
      return <div className={className}>{errorComponent}</div>;
    }
    return (
      <div className={className}>
        <DefaultErrorComponent
          error={stateStatus.error || '加载失败'}
          enableRetry={enableRetry}
          onRetry={onRetry}
        />
      </div>
    );
  }

  // 如果正在加载，显示加载组件
  if (shouldShowLoading || !stateStatus.isInitialized) {
    if (loadingComponent) {
      return <div className={className}>{loadingComponent}</div>;
    }

    if (skeleton) {
      return <div className={className}>{skeleton}</div>;
    }

    // 默认加载组件
    const LoadingIcon = mode === 'spinner' ? Loader2 : RefreshCw;
    
    switch (mode) {
      case 'card':
        return (
          <div className={className}>
            <DefaultSkeleton mode="card" />
          </div>
        );
      case 'skeleton':
        return (
          <div className={className}>
            <DefaultSkeleton mode="skeleton" />
          </div>
        );
      case 'minimal':
        return (
          <div className={className}>
            <DefaultSkeleton mode="minimal" />
          </div>
        );
      default:
        return (
          <div className={`flex items-center space-x-2 ${className}`}>
            <LoadingIcon className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">加载中...</span>
          </div>
        );
    }
  }

  // 状态正常，显示子组件
  return <>{children}</>;
};

/**
 * 预定义的状态包装器组件
 */

// 认证状态包装器
export const AuthStateWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  mode?: 'spinner' | 'skeleton' | 'minimal';
}> = ({ children, className, mode = 'minimal' }) => (
  <EnhancedStateWrapper 
    stateType="auth" 
    mode={mode} 
    className={className}
    minLoadingTime={200}
  >
    {children}
  </EnhancedStateWrapper>
);

// 订阅状态包装器（增强版）
export const EnhancedSubscriptionWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  showError?: boolean;
}> = ({ children, className, showError = true }) => (
  <EnhancedStateWrapper 
    stateType="subscription" 
    mode="minimal" 
    className={className}
    enableRetry={showError}
    minLoadingTime={250}
  >
    {children}
  </EnhancedStateWrapper>
);

// 使用统计状态包装器
export const UsageStatsWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  mode?: 'spinner' | 'skeleton' | 'card';
}> = ({ children, className, mode = 'spinner' }) => (
  <EnhancedStateWrapper 
    stateType="usage" 
    mode={mode} 
    className={className}
    minLoadingTime={400}
  >
    {children}
  </EnhancedStateWrapper>
);

// 权限状态包装器
export const PermissionStateWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <EnhancedStateWrapper 
    stateType="permission" 
    mode="minimal" 
    className={className}
    minLoadingTime={200}
  >
    {children}
  </EnhancedStateWrapper>
);

// 组合状态包装器
export const CombinedStateWrapper: React.FC<{
  children: React.ReactNode;
  states: StateType[];
  className?: string;
  mode?: 'spinner' | 'skeleton' | 'card';
}> = ({ children, states, className, mode = 'spinner' }) => (
  <EnhancedStateWrapper 
    stateType={states} 
    mode={mode} 
    className={className}
    minLoadingTime={500}
    delayTime={150}
  >
    {children}
  </EnhancedStateWrapper>
);

export default EnhancedStateWrapper;