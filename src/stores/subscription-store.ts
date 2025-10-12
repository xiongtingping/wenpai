/**
 * 订阅状态全局Store
 * 🔧 优化: 使用Zustand管理订阅状态，避免重复查询
 *
 * 优势:
 * 1. 全局单例，所有组件共享同一个状态
 * 2. 避免重复查询，提升性能
 * 3. 自动预加载，切换页面瞬时响应
 * 4. 集成unifiedSubscriptionService的三层缓存
 */

import React from 'react';
import { create } from 'zustand';
import { unifiedSubscriptionService, type SubscriptionStatusResult } from '@/services/unifiedSubscriptionService';
import { logger } from '@/utils/logger';

interface SubscriptionState {
  // 订阅状态数据
  status: SubscriptionStatusResult | null;

  // 加载状态
  loading: boolean;
  initialLoading: boolean;
  error: string | null;

  // 最后更新时间
  lastUpdated: number | null;

  // Actions
  fetchStatus: (userId: string, userProfile?: any) => Promise<void>;
  refreshStatus: (userId: string) => Promise<void>;
  forceRefreshAfterUpgrade: (userId: string, expectedTier?: string) => Promise<void>;
  preloadStatus: (userId: string, userProfile?: any) => Promise<void>;
  clearStatus: () => void;

  // 辅助方法
  isExpired: () => boolean;
  hasFeature: (featureId: string) => boolean;
  getTier: () => string;
}

/**
 * 订阅状态全局Store
 */
export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // 初始状态
  status: null,
  loading: false,
  initialLoading: true,
  error: null,
  lastUpdated: null,

  /**
   * 获取订阅状态
   * 🔧 优化: 使用unifiedSubscriptionService的三层缓存
   * 🔧 2025-01 重构: 同步到unified-state-store
   */
  fetchStatus: async (userId: string, userProfile?: any) => {
    const startTime = Date.now();

    try {
      set({ loading: true, error: null });

      logger.info('🔍 开始获取订阅状态', { userId });

      // 使用unifiedSubscriptionService（带三层缓存）
      const status = await unifiedSubscriptionService.getUserSubscriptionStatus(userId, userProfile);

      const duration = Date.now() - startTime;

      set({
        status,
        loading: false,
        initialLoading: false,
        lastUpdated: Date.now(),
        error: null
      });

      // 🔧 新增: 同步到unified-state-store
      try {
        const { useUnifiedStore } = await import('./unified-state-store');
        const currentTier = useUnifiedStore.getState().user.subscription;

        // 只在tier变化时更新，避免不必要的重渲染
        if (currentTier !== status.tier) {
          logger.info('🔄 同步订阅状态到unified-state-store', {
            oldTier: currentTier,
            newTier: status.tier
          });
          useUnifiedStore.getState().updateUserSubscription(status.tier);
        }
      } catch (syncError) {
        logger.warn('⚠️ 同步到unified-state-store失败', syncError);
        // 同步失败不影响主流程
      }

      logger.info('✅ 订阅状态获取成功', {
        userId,
        tier: status.tier,
        source: status.source,
        duration: duration + 'ms'
      });

    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('❌ 订阅状态获取失败', {
        userId,
        error,
        duration: duration + 'ms'
      });

      set({
        loading: false,
        initialLoading: false,
        error: error instanceof Error ? error.message : '获取订阅状态失败'
      });

      throw error;
    }
  },

  /**
   * 刷新订阅状态（强制重新查询）
   * 🔧 优化: 清除所有层级的缓存（内存、本地、云）
   */
  refreshStatus: async (userId: string) => {
    logger.info('🔄 强制刷新订阅状态', { userId });

    // 1. 清除unifiedSubscriptionService的所有缓存
    await unifiedSubscriptionService.refreshUserSubscription(userId);

    // 2. 清除Store的内存缓存
    set({
      status: null,
      lastUpdated: null
    });

    // 3. 重新从数据库查询
    await get().fetchStatus(userId);

    logger.info('✅ 订阅状态刷新完成', { userId });
  },

  /**
   * 🆕 订阅升级后的强制刷新
   * 用于支付成功、订阅变更等场景
   *
   * 特点:
   * - 清除所有层级的缓存（内存、localStorage、Supabase）
   * - 等待数据库更新（2秒 + 重试）
   * - 重试机制确保获取到最新数据
   * - 通知所有使用订阅状态的组件
   * 🔧 2025-01 重构: 同步到unified-state-store
   *
   * @param userId 用户ID
   * @param expectedTier 期望的订阅等级（可选，用于验证）
   */
  forceRefreshAfterUpgrade: async (userId: string, expectedTier?: string) => {
    logger.info('🚀 订阅升级后强制刷新', { userId, expectedTier });

    try {
      // 设置加载状态
      set({
        loading: true,
        error: null
      });

      // 使用unifiedSubscriptionService的强制刷新方法
      // 它会自动处理：清除缓存、等待数据库、重试查询
      const result = await unifiedSubscriptionService.forceRefreshAfterPayment(
        userId,
        expectedTier,
        5 // 最多重试5次
      );

      // 更新Store状态
      set({
        status: result,
        loading: false,
        initialLoading: false,
        error: null,
        lastUpdated: Date.now()
      });

      // 🔧 新增: 同步到unified-state-store
      try {
        const { useUnifiedStore } = await import('./unified-state-store');
        logger.info('🔄 强制刷新后同步到unified-state-store', {
          tier: result.tier
        });
        useUnifiedStore.getState().updateUserSubscription(result.tier);
      } catch (syncError) {
        logger.warn('⚠️ 同步到unified-state-store失败', syncError);
      }

      // 触发全局事件，通知其他组件（保持向后兼容 + 统一新事件）
      window.dispatchEvent(new CustomEvent('subscriptionRefreshed', {
        detail: {
          userId,
          tier: result.tier,
          timestamp: Date.now()
        }
      }));
      // 新标准事件：userSubscriptionUpdated（推荐监听）
      window.dispatchEvent(new CustomEvent('userSubscriptionUpdated', {
        detail: {
          userId,
          tier: result.tier,
          timestamp: Date.now()
        }
      }));

      logger.info('✅ 订阅升级后刷新完成', {
        userId,
        tier: result.tier,
        isExpired: result.isExpired,
        expiresAt: result.expiresAt
      });

    } catch (error) {
      logger.error('❌ 订阅升级后刷新失败', { userId, error });
      set({
        loading: false,
        error: error instanceof Error ? error.message : '刷新失败'
      });
      throw error;
    }
  },

  /**
   * 预加载订阅状态
   * 🔧 2025-01 重构: 等待加载完成，确保组件能获取到正确的订阅状态
   *
   * 用途：
   * - 用户登录后立即调用
   * - 确保订阅状态在组件渲染前加载完成
   * - 避免组件显示错误的默认状态（trial）
   */
  preloadStatus: async (userId: string, userProfile?: any) => {
    try {
      logger.info('🚀 开始预加载订阅状态', { userId });

      // 🔧 关键修复: 等待fetchStatus完成
      // 这样AuthGuard可以等待预加载完成后再渲染子组件
      await get().fetchStatus(userId, userProfile);

      logger.info('✅ 订阅状态预加载完成', {
        userId,
        tier: get().status?.tier,
        isExpired: get().status?.isExpired
      });
    } catch (error) {
      logger.error('❌ 预加载订阅状态失败:', error);

      // 即使失败也要设置initialLoading=false
      set({
        initialLoading: false,
        error: error instanceof Error ? error.message : '预加载失败'
      });

      throw error;
    }
  },

  /**
   * 清除订阅状态（用户登出时）
   */
  clearStatus: () => {
    logger.info('🧹 清除订阅状态');
    
    set({
      status: null,
      loading: false,
      initialLoading: true,
      error: null,
      lastUpdated: null
    });
  },

  /**
   * 检查订阅是否过期
   */
  isExpired: () => {
    const { status } = get();
    return status?.isExpired ?? true;
  },

  /**
   * 检查是否有特定功能权限
   */
  hasFeature: (featureId: string) => {
    const { status } = get();
    if (!status) return false;
    
    // 这里可以根据tier和featureId判断权限
    // 简化版本：pro和premium有所有功能
    return status.tier === 'pro' || status.tier === 'premium';
  },

  /**
   * 获取当前套餐等级
   */
  getTier: () => {
    const { status } = get();
    return status?.tier ?? 'trial';
  }
}));

/**
 * 🔧 优化: 简化的Hook，直接使用全局Store
 *
 * 优势:
 * 1. 所有组件共享同一个状态
 * 2. 避免重复查询
 * 3. 切换页面瞬时响应（从缓存读取）
 *
 * 🔧 关键优化:
 * - 不在Hook中触发查询，完全依赖预加载
 * - 所有组件共享同一个全局状态
 * - 切换页面时直接读取缓存，无需重新查询
 */
export function useSubscription(userId?: string) {
  const store = useSubscriptionStore();

  // 🔧 关键修复: 移除自动查询逻辑
  // 完全依赖AuthGuard中的预加载
  // 这样切换页面时不会重新查询，直接使用全局状态

  return {
    status: store.status,
    loading: store.loading,
    initialLoading: store.initialLoading,
    error: store.error,
    lastUpdated: store.lastUpdated,

    // Actions
    refresh: () => userId ? store.refreshStatus(userId) : Promise.resolve(),
    forceRefreshAfterUpgrade: (expectedTier?: string) => userId ? store.forceRefreshAfterUpgrade(userId, expectedTier) : Promise.resolve(),
    preload: (userProfile?: any) => userId ? store.preloadStatus(userId, userProfile) : Promise.resolve(),

    // 辅助方法
    isExpired: store.isExpired(),
    hasFeature: store.hasFeature,
    tier: store.getTier(),

    // 兼容性字段
    hasActiveSubscription: !store.isExpired(),
    primaryStatus: store.status ? {
      status: store.status.isExpired ? 'expired' : 'active',
      tier: store.status.tier,
      expiresAt: store.status.expiresAt,
      daysRemaining: store.status.daysRemaining,
      needsAlert: store.status.daysRemaining <= 7 && store.status.daysRemaining > 0,
      alertLevel: store.status.daysRemaining <= 3 ? 'error' : 'warning',
      alertMessage: store.status.daysRemaining > 0
        ? `订阅将在${store.status.daysRemaining}天后到期`
        : '订阅已到期',
      statusLabel: store.status.isExpired ? '已到期' : '活跃',
      statusColor: store.status.isExpired ? 'red' : 'green'
    } : null
  };
}

