/**
 * 网络异常处理Hook
 * @description 为组件提供网络异常处理和降级策略的能力
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { useState, useEffect, useCallback } from 'react';
import { 
  networkFallbackHandler, 
  NetworkStatus, 
  FallbackStrategy,
  type RequestConfig, 
  type NetworkResponse,
  type NetworkStats 
} from '@/services/networkFallbackHandler';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

/**
 * Hook配置选项
 */
export interface NetworkFallbackOptions {
  /** 是否显示网络状态通知 */
  showNetworkNotifications?: boolean;
  /** 是否自动重试 */
  enableAutoRetry?: boolean;
  /** 是否启用预加载 */
  enablePreload?: boolean;
  /** 默认降级策略 */
  defaultFallbackStrategy?: FallbackStrategy;
  /** 是否监控网络状态 */
  monitorNetworkStatus?: boolean;
}

/**
 * Hook返回值
 */
export interface NetworkFallbackReturn {
  /** 当前网络状态 */
  networkStatus: NetworkStatus;
  /** 是否在线 */
  isOnline: boolean;
  /** 是否为慢网络 */
  isSlowNetwork: boolean;
  /** 网络统计 */
  networkStats: NetworkStats;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 发送请求 */
  request: <T = any>(config: RequestConfig) => Promise<NetworkResponse<T>>;
  /** 批量请求 */
  batchRequest: <T = any>(configs: RequestConfig[]) => Promise<NetworkResponse<T>[]>;
  /** 预加载数据 */
  preloadData: (configs: RequestConfig[]) => Promise<void>;
  /** 重试失败的请求 */
  retryFailedRequests: () => Promise<void>;
  /** 清除缓存 */
  clearCache: (pattern?: string) => void;
  /** 手动刷新网络状态 */
  refreshNetworkStatus: () => void;
}

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: NetworkFallbackOptions = {
  showNetworkNotifications: true,
  enableAutoRetry: true,
  enablePreload: false,
  defaultFallbackStrategy: FallbackStrategy.CACHE,
  monitorNetworkStatus: true
};

/**
 * 网络异常处理Hook
 */
export function useNetworkFallback(
  options: NetworkFallbackOptions = {}
): NetworkFallbackReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { toast } = useToast();

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    networkFallbackHandler.getNetworkStatus()
  );
  const [networkStats, setNetworkStats] = useState<NetworkStats>(
    networkFallbackHandler.getStats()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);

  /**
   * 发送请求
   */
  const request = useCallback(async <T = any>(
    config: RequestConfig
  ): Promise<NetworkResponse<T>> => {
    setIsLoading(true);

    try {
      // 应用默认降级策略
      const enhancedConfig: RequestConfig = {
        ...config,
        fallbackStrategy: config.fallbackStrategy || opts.defaultFallbackStrategy,
        allowFallback: config.allowFallback !== false
      };

      const response = await networkFallbackHandler.request<T>(enhancedConfig);

      // 更新统计
      setNetworkStats(networkFallbackHandler.getStats());

      // 处理响应
      if (!response.success && opts.showNetworkNotifications) {
        showErrorNotification(response.error || '请求失败', response.fromCache);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25';
      
      if (opts.showNetworkNotifications) {
        showErrorNotification(errorMessage);
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [opts.defaultFallbackStrategy, opts.showNetworkNotifications]);

  /**
   * 批量请求
   */
  const batchRequest = useCallback(async <T = any>(
    configs: RequestConfig[]
  ): Promise<NetworkResponse<T>[]> => {
    setIsLoading(true);

    try {
      const enhancedConfigs = configs.map(config => ({
        ...config,
        fallbackStrategy: config.fallbackStrategy || opts.defaultFallbackStrategy,
        allowFallback: config.allowFallback !== false
      }));

      const responses = await networkFallbackHandler.batchRequest<T>(enhancedConfigs);
      
      // 更新统计
      setNetworkStats(networkFallbackHandler.getStats());

      // 检查失败的请求
      const failedCount = responses.filter(r => !r.success).length;
      if (failedCount > 0 && opts.showNetworkNotifications) {
        showErrorNotification(`${failedCount} 个请求失败`);
      }

      return responses;
    } finally {
      setIsLoading(false);
    }
  }, [opts.defaultFallbackStrategy, opts.showNetworkNotifications]);

  /**
   * 预加载数据
   */
  const preloadData = useCallback(async (configs: RequestConfig[]): Promise<void> => {
    if (!opts.enablePreload) {
      logger.warn('预加载未启用');
      return;
    }

    try {
      await networkFallbackHandler.preloadCriticalData(configs);
      setNetworkStats(networkFallbackHandler.getStats());
      
      if (opts.showNetworkNotifications) {
        toast({
          title: 'u64cdu4f5cu5931u8d25',
          description: `成功预加载 ${configs.length} 项数据`,
          duration: 2000
        });
      }
    } catch (error) {
      logger.error('预加载失败:', error);
      
      if (opts.showNetworkNotifications) {
        toast({
          title: 'u64cdu4f5cu5931u8d25',
          description: '部分数据预加载失败',
          variant: 'destructive',
          duration: 3000
        });
      }
    }
  }, [opts.enablePreload, opts.showNetworkNotifications, toast]);

  /**
   * 重试失败的请求
   */
  const retryFailedRequests = useCallback(async (): Promise<void> => {
    if (!opts.enableAutoRetry) {
      return;
    }

    try {
      await networkFallbackHandler.retryFailedRequests();
      setNetworkStats(networkFallbackHandler.getStats());
      
      if (opts.showNetworkNotifications) {
        toast({
          title: 'u64cdu4f5cu5931u8d25',
          description: '已重试所有失败的请求',
          duration: 2000
        });
      }
    } catch (error) {
      logger.error('重试失败:', error);
    }
  }, [opts.enableAutoRetry, opts.showNetworkNotifications, toast]);

  /**
   * 清除缓存
   */
  const clearCache = useCallback((pattern?: string): void => {
    networkFallbackHandler.clearCache(pattern);
    setNetworkStats(networkFallbackHandler.getStats());
    
    if (opts.showNetworkNotifications) {
      toast({
        title: 'u64cdu4f5cu5931u8d25',
        description: pattern ? `已清除匹配 "${pattern}" 的缓存` : '已清除所有缓存',
        duration: 2000
      });
    }
  }, [opts.showNetworkNotifications, toast]);

  /**
   * 刷新网络状态
   */
  const refreshNetworkStatus = useCallback((): void => {
    const currentStatus = networkFallbackHandler.getNetworkStatus();
    const currentStats = networkFallbackHandler.getStats();
    
    setNetworkStatus(currentStatus);
    setNetworkStats(currentStats);
  }, []);

  /**
   * 显示错误通知
   */
  const showErrorNotification = useCallback((
    message: string, 
    isFromCache: boolean = false
  ): void => {
    const now = Date.now();
    // 防止通知过于频繁（5秒内只显示一次）
    if (now - lastNotificationTime < 5000) {
      return;
    }

    let title = 'u64cdu4f5cu5931u8d25';
    let description = message;
    
    if (isFromCache) {
      title = 'u64cdu4f5cu5931u8d25';
      description = '网络不可用，正在使用缓存数据';
    }

    toast({
      title,
      description,
      variant: isFromCache ? 'default' : 'destructive',
      duration: isFromCache ? 2000 : 4000
    });

    setLastNotificationTime(now);
  }, [toast, lastNotificationTime]);

  /**
   * 显示网络状态通知
   */
  const showNetworkStatusNotification = useCallback((status: NetworkStatus): void => {
    if (!opts.showNetworkNotifications) return;

    const messages = {
      [NetworkStatus.ONLINE]: { title: 'u64cdu4f5cu5931u8d25', description: 'u64cdu4f5cu5931u8d25', variant: 'default' as const },
      [NetworkStatus.OFFLINE]: { title: 'u64cdu4f5cu5931u8d25', description: 'u64cdu4f5cu5931u8d25', variant: 'destructive' as const },
      [NetworkStatus.SLOW]: { title: 'u64cdu4f5cu5931u8d25', description: 'u64cdu4f5cu5931u8d25', variant: 'destructive' as const },
      [NetworkStatus.UNSTABLE]: { title: 'u64cdu4f5cu5931u8d25', description: 'u64cdu4f5cu5931u8d25', variant: 'destructive' as const }
    };

    const notification = messages[status];
    if (notification) {
      toast({
        title: notification.title,
        description: notification.description,
        variant: notification.variant,
        duration: 3000
      });
    }
  }, [opts.showNetworkNotifications, toast]);

  // 监控网络状态变化
  useEffect(() => {
    if (!opts.monitorNetworkStatus) return;

    const checkNetworkStatus = () => {
      const currentStatus = networkFallbackHandler.getNetworkStatus();
      const currentStats = networkFallbackHandler.getStats();
      
      if (currentStatus !== networkStatus) {
        setNetworkStatus(currentStatus);
        showNetworkStatusNotification(currentStatus);
      }
      
      setNetworkStats(currentStats);
    };

    // 立即检查一次
    checkNetworkStatus();

    // 定期检查网络状态
    const interval = setInterval(checkNetworkStatus, 10000); // 每10秒检查一次

    // 监听网络状态变化事件
    const handleOnline = () => {
      checkNetworkStatus();
      if (opts.enableAutoRetry) {
        retryFailedRequests();
      }
    };

    const handleOffline = () => {
      checkNetworkStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [
    opts.monitorNetworkStatus, 
    opts.enableAutoRetry, 
    networkStatus, 
    showNetworkStatusNotification, 
    retryFailedRequests
  ]);

  // 页面可见性变化时刷新状态
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshNetworkStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshNetworkStatus]);

  return {
    networkStatus,
    isOnline: networkStatus === NetworkStatus.ONLINE,
    isSlowNetwork: networkStatus === NetworkStatus.SLOW,
    networkStats,
    isLoading,
    request,
    batchRequest,
    preloadData,
    retryFailedRequests,
    clearCache,
    refreshNetworkStatus
  };
}

export default useNetworkFallback;