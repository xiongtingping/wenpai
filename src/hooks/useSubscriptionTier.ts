/**
 * 统一订阅状态管理 Hook
 * @description 方案A完整版 - 单一缓存层 + 主动同步
 *
 * 🎯 设计目标：
 * 1. 真正的SSOT - unifiedSubscriptionService是唯一订阅数据源
 * 2. 消除初始化窗口 - 没有过期数据重置的机会
 * 3. 缓存一致性 - 单层缓存更容易管理
 * 4. 跨Tab同步 - BroadcastChannel实时通知
 *
 * 🔧 架构变更：
 * - 移除unified-state-store中的subscription字段
 * - 所有订阅状态读取统一走此Hook
 * - 使用BroadcastChannel实现跨Tab实时同步
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { unifiedSubscriptionService } from '@/services/unifiedSubscriptionService';
import type { SubscriptionTier } from '@/types/subscription';
import { logger } from '@/utils/logger';

/**
 * 订阅状态变更事件
 */
export interface SubscriptionChangeEvent {
  userId: string;
  tier: SubscriptionTier;
  source: 'local' | 'broadcast' | 'refresh';
  timestamp: number;
}

/**
 * Hook配置选项
 */
export interface UseSubscriptionTierOptions {
  /** 是否启用自动刷新 */
  enableAutoRefresh?: boolean;
  /** 自动刷新间隔(毫秒) */
  refreshInterval?: number;
  /** 是否启用跨Tab同步 */
  enableCrossTabSync?: boolean;
  /** 订阅状态变更回调 */
  onTierChange?: (event: SubscriptionChangeEvent) => void;
}

/**
 * Hook返回值
 */
export interface UseSubscriptionTierResult {
  /** 当前订阅等级 */
  tier: SubscriptionTier;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 手动刷新订阅状态 */
  refresh: () => Promise<void>;
  /** 是否已过期 */
  isExpired: boolean;
  /** 剩余天数 */
  daysRemaining: number;
  /** 数据来源 */
  source: 'supabase' | 'user_profile' | 'fallback';
  /** 最后更新时间 */
  lastUpdated: Date | null;
}

// 全局BroadcastChannel实例（单例模式）
let globalSubscriptionChannel: BroadcastChannel | null = null;
const channelListeners = new Set<(event: MessageEvent<SubscriptionChangeEvent>) => void>();

/**
 * 获取或创建全局BroadcastChannel
 */
function getSubscriptionChannel(): BroadcastChannel | null {
  // 检查浏览器支持
  if (typeof BroadcastChannel === 'undefined') {
    logger.warn('⚠️ BroadcastChannel not supported in this browser');
    return null;
  }

  if (!globalSubscriptionChannel) {
    try {
      globalSubscriptionChannel = new BroadcastChannel('wenpai_subscription_sync');
      logger.info('✅ 全局订阅同步通道已创建');
    } catch (error) {
      logger.error('❌ 创建BroadcastChannel失败:', error);
      return null;
    }
  }

  return globalSubscriptionChannel;
}

/**
 * 发布订阅状态变更事件
 */
export function publishSubscriptionChange(event: SubscriptionChangeEvent): void {
  const channel = getSubscriptionChannel();
  if (channel) {
    try {
      channel.postMessage(event);
      logger.debug('📤 订阅状态变更已广播', event);
    } catch (error) {
      logger.error('❌ 广播订阅状态失败:', error);
    }
  }
}

/**
 * 统一订阅状态管理 Hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { tier, loading, refresh, isExpired } = useSubscriptionTier(userId);
 *
 *   if (loading) return <Spinner />;
 *   if (isExpired) return <ExpiredNotice />;
 *
 *   return <div>Current tier: {tier}</div>;
 * }
 * ```
 */
export function useSubscriptionTier(
  userId: string | null | undefined,
  options: UseSubscriptionTierOptions = {}
): UseSubscriptionTierResult {
  const {
    enableAutoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 默认5分钟
    enableCrossTabSync = true,
    onTierChange
  } = options;

  // 状态管理
  const [tier, setTier] = useState<SubscriptionTier>('trial');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [source, setSource] = useState<'supabase' | 'user_profile' | 'fallback'>('fallback');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 使用ref避免闭包问题
  const userIdRef = useRef(userId);
  const onTierChangeRef = useRef(onTierChange);

  useEffect(() => {
    userIdRef.current = userId;
    onTierChangeRef.current = onTierChange;
  }, [userId, onTierChange]);

  /**
   * 加载订阅状态
   */
  const loadSubscriptionStatus = useCallback(async (source: 'local' | 'broadcast' | 'refresh' = 'local') => {
    const currentUserId = userIdRef.current;

    if (!currentUserId) {
      setTier('trial');
      setLoading(false);
      setError(null);
      setIsExpired(false);
      setDaysRemaining(0);
      setSource('fallback');
      setLastUpdated(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await unifiedSubscriptionService.getUserSubscriptionStatus(currentUserId);

      // 更新状态
      setTier(result.tier);
      setIsExpired(result.isExpired);
      setDaysRemaining(result.daysRemaining);
      setSource(result.source);
      setLastUpdated(new Date(result.lastUpdated));

      logger.info('✅ 订阅状态已加载', {
        userId: currentUserId,
        tier: result.tier,
        source: result.source,
        isExpired: result.isExpired
      });

      // 触发变更回调
      if (onTierChangeRef.current) {
        onTierChangeRef.current({
          userId: currentUserId,
          tier: result.tier,
          source,
          timestamp: Date.now()
        });
      }

      // 广播到其他Tab（仅本地主动查询时广播，避免循环）
      if (source === 'local' || source === 'refresh') {
        publishSubscriptionChange({
          userId: currentUserId,
          tier: result.tier,
          source,
          timestamp: Date.now()
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载订阅状态失败';
      logger.error('❌ 订阅状态加载失败:', err);
      setError(errorMessage);

      // 出错时保持trial作为安全fallback
      setTier('trial');
      setIsExpired(false);
      setDaysRemaining(0);
      setSource('fallback');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 手动刷新
   */
  const refresh = useCallback(async () => {
    logger.info('🔄 手动刷新订阅状态');
    await loadSubscriptionStatus('refresh');
  }, [loadSubscriptionStatus]);

  // 初始加载
  useEffect(() => {
    loadSubscriptionStatus('local');
  }, [loadSubscriptionStatus]);

  // 跨Tab同步
  useEffect(() => {
    if (!enableCrossTabSync || !userId) {
      return;
    }

    const channel = getSubscriptionChannel();
    if (!channel) {
      return;
    }

    const handleMessage = (event: MessageEvent<SubscriptionChangeEvent>) => {
      const data = event.data;

      // 只处理与当前用户相关的消息
      if (data.userId !== userIdRef.current) {
        return;
      }

      logger.info('📥 收到跨Tab订阅状态更新', data);

      // 更新本地状态
      setTier(data.tier);
      setLastUpdated(new Date(data.timestamp));

      // 触发变更回调
      if (onTierChangeRef.current) {
        onTierChangeRef.current(data);
      }
    };

    // 添加到全局监听器集合
    channelListeners.add(handleMessage);
    channel.addEventListener('message', handleMessage);

    logger.debug('📡 已启用跨Tab订阅同步', { userId });

    return () => {
      channelListeners.delete(handleMessage);
      channel.removeEventListener('message', handleMessage);
    };
  }, [enableCrossTabSync, userId]);

  // 自动刷新
  useEffect(() => {
    if (!enableAutoRefresh || !userId) {
      return;
    }

    const intervalId = setInterval(() => {
      logger.debug('⏰ 自动刷新订阅状态', { interval: refreshInterval });
      loadSubscriptionStatus('refresh');
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [enableAutoRefresh, userId, refreshInterval, loadSubscriptionStatus]);

  return {
    tier,
    loading,
    error,
    refresh,
    isExpired,
    daysRemaining,
    source,
    lastUpdated
  };
}

/**
 * 轻量级版本 - 仅返回tier值
 * 适用于只需要tier值的场景，减少不必要的状态管理
 *
 * @example
 * ```tsx
 * function SimpleComponent() {
 *   const tier = useSubscriptionTierValue(userId);
 *   return <div>Tier: {tier}</div>;
 * }
 * ```
 */
export function useSubscriptionTierValue(userId: string | null | undefined): SubscriptionTier {
  const { tier } = useSubscriptionTier(userId, {
    enableAutoRefresh: false,
    enableCrossTabSync: true
  });
  return tier;
}

/**
 * 清理全局资源（在应用卸载时调用）
 */
export function cleanupSubscriptionSync(): void {
  if (globalSubscriptionChannel) {
    globalSubscriptionChannel.close();
    globalSubscriptionChannel = null;
    channelListeners.clear();
    logger.info('🧹 订阅同步资源已清理');
  }
}
