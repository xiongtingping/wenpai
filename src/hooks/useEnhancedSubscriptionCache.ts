/**
 * 增强订阅缓存Hook
 * @description 基于智能缓存策略的订阅状态管理，优化性能和用户体验
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  subscriptionCacheStrategy, 
  CacheStrategy,
  type CacheStats 
} from '@/services/subscriptionCacheStrategy';
import { calculateSubscriptionStatus, type SubscriptionStatus } from '@/utils/subscriptionStatusUtils';
import { unifiedSubscriptionService } from '@/services/unifiedSubscriptionService';
import { logger } from '@/utils/logger';

/**
 * 缓存选项
 */
export interface SubscriptionCacheOptions {
  /** 缓存策略 */
  strategy?: CacheStrategy;
  /** 是否启用自动刷新 */
  enableAutoRefresh?: boolean;
  /** 自动刷新间隔（毫秒） */
  autoRefreshInterval?: number;
  /** 是否启用后台更新 */
  enableBackgroundUpdate?: boolean;
  /** 错误重试次数 */
  maxRetries?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
}

/**
 * Hook返回值
 */
export interface EnhancedSubscriptionCacheReturn {
  /** 主要订阅状态 */
  primaryStatus: SubscriptionStatus | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否来自缓存 */
  isFromCache: boolean;
  /** 最后更新时间 */
  lastUpdated: Date | null;
  /** 缓存统计 */
  cacheStats: CacheStats;
  /** 手动刷新 */
  refresh: () => Promise<void>;
  /** 强制刷新（忽略缓存） */
  forceRefresh: () => Promise<void>;
  /** 清除缓存 */
  clearCache: () => Promise<void>;
  /** 预热缓存 */
  warmupCache: () => Promise<void>;
}

/**
 * 默认选项
 */
const DEFAULT_OPTIONS: SubscriptionCacheOptions = {
  strategy: CacheStrategy.MEMORY_FIRST,
  enableAutoRefresh: true,
  autoRefreshInterval: 5 * 60 * 1000, // 5分钟
  enableBackgroundUpdate: true,
  maxRetries: 3,
  retryDelay: 1000
};

/**
 * 增强订阅缓存Hook
 */
export function useEnhancedSubscriptionCache(
  options: SubscriptionCacheOptions = {}
): EnhancedSubscriptionCacheReturn {
  const { user } = useAuth();
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [primaryStatus, setPrimaryStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats>(subscriptionCacheStrategy.getStats());

  const retryCountRef = useRef(0);
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 获取缓存键
   */
  const getCacheKey = useCallback((userId: string): string => {
    return `subscription_status_${userId}`;
  }, []);

  /**
   * 从网络获取订阅状态
   */
  const fetchFromNetwork = useCallback(async (userId: string): Promise<SubscriptionStatus> => {
    try {
      const result = await unifiedSubscriptionService.getUserSubscriptionStatus(userId, user);
      
      // 转换为SubscriptionStatus格式
      const status = calculateSubscriptionStatus({
        id: userId,
        subscription: result.subscription
      });

      return status;
    } catch (error) {
      logger.error('从网络获取订阅状态失败:', error);
      throw error;
    }
  }, [user]);

  /**
   * 获取订阅状态
   */
  const getSubscriptionStatus = useCallback(async (
    useCache: boolean = true,
    strategy: CacheStrategy = opts.strategy!
  ): Promise<SubscriptionStatus | null> => {
    if (!user?.id) {
      return null;
    }

    const cacheKey = getCacheKey(user.id);

    try {
      let result: SubscriptionStatus | null = null;
      let fromCache = false;

      if (useCache) {
        // 使用缓存策略获取数据
        result = await subscriptionCacheStrategy.get<SubscriptionStatus>(
          cacheKey,
          strategy,
          () => fetchFromNetwork(user.id)
        );
        
        // 检查是否来自缓存
        const cachedData = await subscriptionCacheStrategy.get<SubscriptionStatus>(
          cacheKey,
          CacheStrategy.CACHE_ONLY
        );
        fromCache = !!cachedData;
      } else {
        // 直接从网络获取
        result = await fetchFromNetwork(user.id);
        // 更新缓存
        if (result) {
          await subscriptionCacheStrategy.set(cacheKey, result, 'network');
        }
      }

      setIsFromCache(fromCache);
      setLastUpdated(new Date());
      retryCountRef.current = 0;

      return result;
    } catch (error) {
      logger.error('获取订阅状态失败:', error);
      
      // 重试逻辑
      if (retryCountRef.current < opts.maxRetries!) {
        retryCountRef.current++;
        logger.info(`订阅状态获取重试 ${retryCountRef.current}/${opts.maxRetries}`);
        
        await new Promise(resolve => setTimeout(resolve, opts.retryDelay!));
        return getSubscriptionStatus(useCache, strategy);
      }

      throw error;
    }
  }, [user?.id, opts.strategy, opts.maxRetries, opts.retryDelay, getCacheKey, fetchFromNetwork]);

  /**
   * 刷新订阅状态
   */
  const refresh = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const status = await getSubscriptionStatus(true, opts.strategy!);
      setPrimaryStatus(status);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取订阅状态失败';
      setError(errorMessage);
      logger.error('刷新订阅状态失败:', error);
    } finally {
      setIsLoading(false);
      setCacheStats(subscriptionCacheStrategy.getStats());
    }
  }, [user?.id, getSubscriptionStatus, opts.strategy]);

  /**
   * 强制刷新（忽略缓存）
   */
  const forceRefresh = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const status = await getSubscriptionStatus(false);
      setPrimaryStatus(status);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '强制刷新失败';
      setError(errorMessage);
      logger.error('强制刷新订阅状态失败:', error);
    } finally {
      setIsLoading(false);
      setCacheStats(subscriptionCacheStrategy.getStats());
    }
  }, [user?.id, getSubscriptionStatus]);

  /**
   * 清除缓存
   */
  const clearCache = useCallback(async () => {
    if (!user?.id) return;

    try {
      const cacheKey = getCacheKey(user.id);
      await subscriptionCacheStrategy.delete(cacheKey);
      setCacheStats(subscriptionCacheStrategy.getStats());
      logger.info('订阅状态缓存已清除');
    } catch (error) {
      logger.error('清除缓存失败:', error);
    }
  }, [user?.id, getCacheKey]);

  /**
   * 预热缓存
   */
  const warmupCache = useCallback(async () => {
    if (!user?.id) return;

    try {
      const cacheKey = getCacheKey(user.id);
      await subscriptionCacheStrategy.warmup(
        [cacheKey],
        async (key) => {
          const userId = key.replace('subscription_status_', '');
          return await fetchFromNetwork(userId);
        }
      );
      setCacheStats(subscriptionCacheStrategy.getStats());
      logger.info('订阅状态缓存预热完成');
    } catch (error) {
      logger.error('缓存预热失败:', error);
    }
  }, [user?.id, getCacheKey, fetchFromNetwork]);

  /**
   * 后台更新
   */
  const backgroundUpdate = useCallback(async () => {
    if (!user?.id || !opts.enableBackgroundUpdate) return;

    try {
      const status = await getSubscriptionStatus(
        true, 
        CacheStrategy.CACHE_AND_REFRESH
      );
      
      if (status && JSON.stringify(status) !== JSON.stringify(primaryStatus)) {
        setPrimaryStatus(status);
        setLastUpdated(new Date());
        logger.info('后台更新订阅状态完成');
      }
    } catch (error) {
      logger.warn('后台更新失败:', error);
    }
  }, [user?.id, opts.enableBackgroundUpdate, getSubscriptionStatus, primaryStatus]);

  /**
   * 设置自动刷新
   */
  const setupAutoRefresh = useCallback(() => {
    if (!opts.enableAutoRefresh || !opts.autoRefreshInterval) return;

    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
    }

    autoRefreshTimerRef.current = setInterval(() => {
      backgroundUpdate();
    }, opts.autoRefreshInterval);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [opts.enableAutoRefresh, opts.autoRefreshInterval, backgroundUpdate]);

  // 初始化和用户变化时的处理
  useEffect(() => {
    if (user?.id) {
      refresh();
    } else {
      setPrimaryStatus(null);
      setIsLoading(false);
      setError(null);
      setIsFromCache(false);
      setLastUpdated(null);
    }
  }, [user?.id, refresh]);

  // 设置自动刷新
  useEffect(() => {
    const cleanup = setupAutoRefresh();
    return cleanup;
  }, [setupAutoRefresh]);

  // 监听缓存自动刷新事件
  useEffect(() => {
    const handleAutoRefresh = (event: CustomEvent) => {
      const cacheKey = event.detail;
      if (user?.id && cacheKey === getCacheKey(user.id)) {
        backgroundUpdate();
      }
    };

    window.addEventListener('cache-auto-refresh', handleAutoRefresh as EventListener);
    
    return () => {
      window.removeEventListener('cache-auto-refresh', handleAutoRefresh as EventListener);
    };
  }, [user?.id, getCacheKey, backgroundUpdate]);

  // 页面可见性变化时刷新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        // 页面重新可见时进行后台更新
        setTimeout(() => backgroundUpdate(), 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, backgroundUpdate]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, []);

  return {
    primaryStatus,
    isLoading,
    error,
    isFromCache,
    lastUpdated,
    cacheStats,
    refresh,
    forceRefresh,
    clearCache,
    warmupCache
  };
}

export default useEnhancedSubscriptionCache;