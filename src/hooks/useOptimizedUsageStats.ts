/**
 * 优化的使用统计Hook
 *
 * 优化策略：
 * 1. UI层：初次加载显示skeleton，避免直接渲染错误状态
 * 2. 缓存层：使用stale-while-revalidate，先展示旧值，后台更新
 * 3. 状态层：版本号控制，防止旧缓存覆盖新数据
 * 4. 服务层：debounce/throttle控制频繁更新
 * 5. 事件层：原子更新确保一致性
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStaleWhileRevalidate } from './useStaleWhileRevalidate';
import { unifiedUsageDataManager } from '@/services/unifiedUsageDataManager';
import type { UsageCountStats } from '@/services/unifiedUsageDataManager';
import type { TokenUsageStats } from '@/services/tokenUsageService';
import type { SubscriptionTier } from '@/types/subscription';
import { logger } from '@/utils/logger';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { getTierDefaultLimit, calculateUsagePercentage } from '@/utils/usageDisplayUtils';
import { getUserTier } from '@/utils/userTierUtils';

/**
 * 扩展统计信息
 */
export interface ExtendedStats {
  timeSaved: number;
  contentGenerated: number;
  registrationDate: string;
}

/**
 * 优化的使用统计接口
 */
export interface OptimizedUsageStats {
  /** Token统计（可能是缓存数据） */
  tokenStats: TokenUsageStats | null;
  /** 使用次数统计（可能是缓存数据） */
  usageCountStats: UsageCountStats;
  /** 扩展统计 */
  extendedStats: ExtendedStats;
  /** 用户套餐 */
  userTier: SubscriptionTier;

  /** 是否首次加载中 */
  isInitialLoading: boolean;
  /** 是否后台刷新中 */
  isRefreshing: boolean;
  /** 数据是否来自缓存 */
  isStale: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 最后更新时间 */
  lastUpdated: string | null;

  /** 🔧 新增：订阅状态是否正在初始化 */
  subscriptionInitializing: boolean;

  /** 手动刷新 */
  refresh: () => Promise<void>;
  /** 消费使用次数 */
  consumeUsage: (amount?: number) => Promise<boolean>;
}

/**
 * 防抖工具函数
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流工具函数
 */
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

// Promise 版本节流，返回上一次调用的 Promise 以满足类型约束
function throttlePromise<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> {
  let lastCall = 0;
  let lastResult: any = Promise.resolve(undefined);
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      lastResult = fn(...args);
    }
    return lastResult as ReturnType<T>;
  };
}

/**
 * 统一的使用统计数据结构
 */
interface UnifiedStatsData {
  tokenStats: TokenUsageStats | null;
  usageCountStats: UsageCountStats;
  extendedStats: ExtendedStats;
  timestamp: number;
  version: number;
}

// 数据版本管理
let globalDataVersion = 0;

/**
 * 优化的使用统计Hook
 *
 * 🔧 2025-01 优化：统一从 subscriptionStore.state 读取订阅信息
 * - 优先从 subscriptionStore.status.tier 获取
 * - 等待 subscriptionStore.initialLoading === false 再渲染
 * - 仅在完全失联时才使用 getUserTier() fallback
 */
export function useOptimizedUsageStats(externalUserTier?: SubscriptionTier): OptimizedUsageStats {
  const { user } = useAuth();

  // 🔧 统一渲染依赖：从 subscriptionStore 获取订阅状态
  const {
    status: subscriptionStatus,
    initialLoading: subscriptionInitialLoading,
    error: subscriptionError
  } = useSubscriptionStore();

  // 数据版本号（用于防止旧数据覆盖新数据）
  const dataVersionRef = useRef(0);

  // 🔧 计算用户套餐：统一从 subscriptionStore.state 取值
  const userTier = useMemo<SubscriptionTier>(() => {
    // 外部传入的 tier 优先
    if (externalUserTier) return externalUserTier;

    // 🔧 优先从 subscriptionStore 获取
    if (subscriptionStatus?.tier && ['trial', 'pro', 'premium'].includes(subscriptionStatus.tier)) {
      return subscriptionStatus.tier as SubscriptionTier;
    }

    // 🔧 延迟 fallback：只在完全失联（API 和缓存都失败）时才触发
    // 如果 subscriptionStore 正在加载中，不使用 fallback（避免闪烁）
    if (subscriptionInitialLoading) {
      return 'trial'; // 加载中返回默认值，但会显示 skeleton
    }

    // 🔧 完全失联时的 fallback
    if (subscriptionError && !subscriptionStatus) {
      logger.warn('[OptimizedUsageStats] 订阅状态获取失败，使用 getUserTier fallback', {
        error: subscriptionError
      });
      return getUserTier(user);
    }

    return 'trial';
  }, [externalUserTier, subscriptionStatus, subscriptionInitialLoading, subscriptionError, user]);

  /**
   * 数据获取函数（带版本控制）
   */
  const fetchStats = useCallback(async (): Promise<UnifiedStatsData> => {
    if (!user?.id) {
      throw new Error('用户未登录');
    }

    // 递增版本号
    const currentVersion = ++globalDataVersion;
    dataVersionRef.current = currentVersion;

    logger.info('[OptimizedUsageStats] 开始获取数据', {
      userId: user.id,
      userTier,
      version: currentVersion
    });

    try {
      // 通过统一数据管理器获取所有数据
      const data = await unifiedUsageDataManager.refreshAllStats(user.id, userTier);

      // 检查版本号，防止旧数据覆盖新数据
      if (dataVersionRef.current !== currentVersion) {
        logger.warn('[OptimizedUsageStats] 检测到更新的请求，丢弃当前结果', {
          current: dataVersionRef.current,
          this: currentVersion
        });
        throw new Error('数据已过期');
      }

      return {
        ...data,
        timestamp: Date.now(),
        version: currentVersion
      };
    } catch (error) {
      logger.error('[OptimizedUsageStats] 获取数据失败', { error, version: currentVersion });
      throw error;
    }
  }, [user?.id, userTier]);

  /**
   * 数据比较函数（判断是否需要更新UI）
   */
  const compareData = useCallback((oldData: UnifiedStatsData | null, newData: UnifiedStatsData): boolean => {
    if (!oldData) return true;

    // 使用版本号判断
    if (newData.version <= oldData.version) {
      logger.debug('[OptimizedUsageStats] 新数据版本号不大于旧数据，跳过更新', {
        old: oldData.version,
        new: newData.version
      });
      return false;
    }

    // 检查关键数据是否变化
    const tokenChanged =
      oldData.tokenStats?.monthlyUsed !== newData.tokenStats?.monthlyUsed ||
      oldData.tokenStats?.monthlyLimit !== newData.tokenStats?.monthlyLimit;

    const usageChanged =
      oldData.usageCountStats.usedCount !== newData.usageCountStats.usedCount ||
      oldData.usageCountStats.availableUses !== newData.usageCountStats.availableUses;

    return tokenChanged || usageChanged;
  }, []);

  /**
   * 使用SWR策略获取数据
   */
  const {
    data: statsData,
    error,
    isLoading,
    isValidating,
    isStale,
    mutate,
    refresh: swrRefresh
  } = useStaleWhileRevalidate<UnifiedStatsData>({
    key: `usage-stats-${user?.id}-${userTier}`,
    fetcher: fetchStats,
    revalidateInterval: 30000, // 30秒自动刷新
    revalidateOnMount: true,
    revalidateOnFocus: true,
    compare: compareData
  });

  // 提取数据
  const tokenStats = statsData?.tokenStats || null;
  const usageCountStats = statsData?.usageCountStats || {
    usedCount: 0,
    availableUses: getTierDefaultLimit(userTier),
    usagePercentage: 0,
    remainingUses: getTierDefaultLimit(userTier),
    lastUpdated: new Date().toISOString()
  };
  const extendedStats = statsData?.extendedStats || {
    timeSaved: 0,
    contentGenerated: 0,
    registrationDate: new Date().toLocaleDateString('zh-CN')
  };
  const lastUpdated = statsData ? new Date(statsData.timestamp).toISOString() : null;

  /**
   * 消费使用次数（带防抖）
   */
  const consumeUsage = useCallback(async (amount: number = 1): Promise<boolean> => {
    if (!user?.id) {
      logger.warn('[OptimizedUsageStats] 用户未登录，无法消费');
      return false;
    }

    try {
      logger.info('[OptimizedUsageStats] 开始消费使用次数', { amount });

      const success = await unifiedUsageDataManager.consumeUsageCount(user.id, userTier, amount);

      if (success) {
        // 乐观更新：立即更新UI
        const newVersion = ++globalDataVersion;
        dataVersionRef.current = newVersion;

        const newUsedCount = usageCountStats.usedCount + amount;
        const newRemainingUses = usageCountStats.availableUses === -1
          ? -1
          : Math.max(0, usageCountStats.availableUses - newUsedCount);

        await mutate({
          tokenStats,
          usageCountStats: {
            ...usageCountStats,
            usedCount: newUsedCount,
            remainingUses: newRemainingUses,
            usagePercentage: calculateUsagePercentage(
              newUsedCount,
              usageCountStats.availableUses,
              userTier
            ),
            lastUpdated: new Date().toISOString()
          },
          extendedStats,
          timestamp: Date.now(),
          version: newVersion
        });

        // 后台验证：500ms后刷新真实数据
        setTimeout(() => {
          swrRefresh();
        }, 500);
      }

      return success;
    } catch (error) {
      logger.error('[OptimizedUsageStats] 消费使用次数失败', { error, amount });
      return false;
    }
  }, [user?.id, userTier, usageCountStats, tokenStats, extendedStats, mutate, swrRefresh]);

  /**
   * 节流的消费函数（防止短时间内多次调用）
   */
  const throttledConsume = useMemo(
    () => throttlePromise(consumeUsage, 1000), // 1秒节流（保持返回 Promise<boolean>）
    [consumeUsage]
  );

  /**
   * 手动刷新（防抖）
   */
  const debouncedRefresh = useMemo(
    () => debounce(swrRefresh, 300), // 300ms防抖
    [swrRefresh]
  );

  // 适配返回 Promise<void> 的 refresh 接口
  const refresh = useMemo(
    () => () => Promise.resolve().then(() => debouncedRefresh()),
    [debouncedRefresh]
  );

  /**
   * 监听使用统计更新事件（防抖处理）
   */
  useEffect(() => {
    if (!user?.id) return;

    const handleUpdate = debounce((event: CustomEvent) => {
      const { userId, stats } = event.detail;

      if (userId === user.id && stats) {
        logger.info('[OptimizedUsageStats] 收到更新事件', { userId, stats });

        const newVersion = ++globalDataVersion;
        dataVersionRef.current = newVersion;

        // 乐观更新
        mutate({
          tokenStats,
          usageCountStats: stats,
          extendedStats,
          timestamp: Date.now(),
          version: newVersion
        });
      }
    }, 100); // 100ms防抖

    window.addEventListener('usageStatsUpdated', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('usageStatsUpdated', handleUpdate as EventListener);
    };
  }, [user?.id, tokenStats, extendedStats, mutate]);

  return {
    tokenStats,
    usageCountStats,
    extendedStats,
    userTier,
    // 🔧 综合加载状态：订阅状态和使用统计都在加载中时显示加载状态
    isInitialLoading: subscriptionInitialLoading || isLoading,
    isRefreshing: isValidating,
    isStale,
    error,
    lastUpdated,
    // 🔧 新增：订阅状态初始化标志
    subscriptionInitializing: subscriptionInitialLoading,
    refresh,
    consumeUsage: throttledConsume
  };
}

export default useOptimizedUsageStats;
