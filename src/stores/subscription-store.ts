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
  syncFromService: (params: {
    userId: string;
    userProfile?: any;
    mode?: 'standard' | 'force' | 'refresh';
    expectedTier?: string;
    emitEvent?: boolean;
  }) => Promise<SubscriptionStatusResult>;
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
export const useSubscriptionStore = create<SubscriptionState>((set, get) => {
  /**
   * 将最新订阅状态写入全局Store并同步到统一状态管理
   */
  const applyStatus = async (
    result: SubscriptionStatusResult,
    options: { emitEvent?: boolean } = {}
  ) => {
    const previousStatus = get().status;
    const emitEvent = options.emitEvent !== false;

    set({
      status: result,
      loading: false,
      initialLoading: false,
      error: null,
      lastUpdated: Date.now()
    });

    try {
      const { useUnifiedStore } = await import('./unified-state-store');
      const currentTier = useUnifiedStore.getState().user.subscription;

      if (currentTier !== result.tier) {
        logger.info('🔄 同步订阅状态到 unified-state-store', {
          previousTier: currentTier,
          nextTier: result.tier
        });
        useUnifiedStore.getState().updateUserSubscription(result.tier);
      }
    } catch (syncError) {
      logger.warn('⚠️ 同步到 unified-state-store 失败', syncError);
    }

    if (emitEvent && (!previousStatus || previousStatus.tier !== result.tier)) {
      const detail = {
        userId: result.userId,
        tier: result.tier,
        timestamp: Date.now()
      };

      window.dispatchEvent(new CustomEvent('subscriptionRefreshed', { detail }));
      window.dispatchEvent(new CustomEvent('userSubscriptionUpdated', { detail }));
    }
  };

  return {
    // 初始状态
    status: null,
    loading: false,
    initialLoading: true,
    error: null,
    lastUpdated: null,

    /**
     * 统一从服务端同步订阅状态
     */
    syncFromService: async ({
      userId,
      userProfile,
      mode = 'standard',
      expectedTier,
      emitEvent = true
    }) => {
      const startTime = Date.now();

      try {
        set((state) => ({
          loading: true,
          error: null,
          initialLoading: state.initialLoading
        }));

        logger.info('🔍 同步订阅状态', { userId, mode, expectedTier });

        let result: SubscriptionStatusResult;

        if (mode === 'force') {
          result = await unifiedSubscriptionService.forceRefreshAfterPayment(
            userId,
            expectedTier,
            5
          );
        } else {
          if (mode === 'refresh') {
            await unifiedSubscriptionService.refreshUserSubscription(userId);
          }
          result = await unifiedSubscriptionService.getUserSubscriptionStatus(userId, userProfile);
        }

        await applyStatus(result, { emitEvent });

        logger.info('✅ 订阅状态同步完成', {
          userId,
          tier: result.tier,
          source: result.source,
          duration: Date.now() - startTime + 'ms'
        });

        return result;
      } catch (error) {
        logger.error('❌ 订阅状态同步失败', {
          userId,
          mode,
          error
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
     * 获取订阅状态
     */
    fetchStatus: async (userId: string, userProfile?: any) => {
      await get().syncFromService({
        userId,
        userProfile,
        mode: 'standard',
        emitEvent: false
      });
    },

    /**
     * 刷新订阅状态（强制重新查询）
     */
    refreshStatus: async (userId: string) => {
      await get().syncFromService({
        userId,
        mode: 'refresh'
      });
    },

    /**
     * 订阅升级后的强制刷新
     */
    forceRefreshAfterUpgrade: async (userId: string, expectedTier?: string) => {
      await get().syncFromService({
        userId,
        mode: 'force',
        expectedTier,
        emitEvent: true
      });
    },

    /**
     * 预加载订阅状态
     */
    preloadStatus: async (userId: string, userProfile?: any) => {
      await get().syncFromService({
        userId,
        userProfile,
        mode: 'standard',
        emitEvent: false
      });
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
      return status.tier === 'pro' || status.tier === 'premium';
    },

    /**
     * 获取当前套餐等级
     */
    getTier: () => {
      const { status } = get();
      return status?.tier ?? 'trial';
    }
  };
});

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
