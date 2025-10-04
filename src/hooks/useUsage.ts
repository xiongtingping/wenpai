/**
 * 🎯 统一使用统计Hook - 基于Store架构
 * @description 简化的Hook，直接从unified-state-store获取数据
 * 
 * 优势:
 * - 单一数据源 (Single Source of Truth)
 * - 无需多层缓存
 * - 无需事件系统
 * - 自动响应式更新
 * - 乐观更新 + 回滚机制
 */

import { useUnifiedStore } from '@/stores/unified-state-store';
import { useEffect } from 'react';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 使用统计Hook - 替代useUnifiedUsageStats
 */
export function useUsage() {
  // 🎯 从Store选择需要的数据 (自动订阅)
  const user = useUnifiedStore(state => state.user);
  const tokenStats = useUnifiedStore(state => state.tokenUsage.currentStats);
  const usageCount = useUnifiedStore(state => state.usageCount);
  const loading = useUnifiedStore(state => state.loading.tokenUsage);
  const error = useUnifiedStore(state => state.error.tokenUsage);

  // 🎯 操作方法
  const consumeUsage = useUnifiedStore(state => state.consumeUsage);
  const refreshStats = useUnifiedStore(state => state.refreshUsageStats);
  const initializeStats = useUnifiedStore(state => state.initializeUsageStats);

  // 🎯 自动初始化 (用户登录后)
  useEffect(() => {
    if (user.id && user.subscription) {
      initializeStats(user.id, user.subscription);
    }
  }, [user.id, user.subscription, initializeStats]);

  return {
    // 数据
    user,
    tokenStats,
    usageCount: {
      used: usageCount.used,
      available: usageCount.available,
      remaining: usageCount.remaining,
      percentage: usageCount.percentage,
      lastUpdated: usageCount.lastUpdated
    },
    loading,
    error,
    
    // 操作
    consumeUsage,
    refreshStats,
    
    // 便捷方法
    canUse: usageCount.available === -1 || usageCount.remaining > 0,
    needUpgrade: tokenStats?.needUpgrade || false,
    userTier: user.subscription as SubscriptionTier,
  };
}

/**
 * 仅获取使用次数的轻量Hook
 */
export function useUsageCount() {
  const usageCount = useUnifiedStore(state => state.usageCount);
  const loading = useUnifiedStore(state => state.loading.tokenUsage);
  const consumeUsage = useUnifiedStore(state => state.consumeUsage);

  return {
    used: usageCount.used,
    available: usageCount.available,
    remaining: usageCount.remaining,
    percentage: usageCount.percentage,
    loading,
    consumeUsage,
    canUse: usageCount.available === -1 || usageCount.remaining > 0
  };
}

/**
 * 仅获取Token统计的轻量Hook
 */
export function useTokenStats() {
  const tokenStats = useUnifiedStore(state => state.tokenUsage.currentStats);
  const loading = useUnifiedStore(state => state.loading.tokenUsage);

  return {
    stats: tokenStats,
    loading,
    monthlyUsed: tokenStats?.monthlyUsed || 0,
    monthlyLimit: tokenStats?.monthlyLimit || 0,
    monthlyRemaining: tokenStats?.monthlyRemaining || 0,
    needUpgrade: tokenStats?.needUpgrade || false
  };
}
