/**
 * 统一用户状态Hook - 解决状态闪烁问题
 * 
 * 🎯 核心功能：
 * 1. 提供统一的状态访问接口
 * 2. 自动处理状态初始化和缓存
 * 3. 消除状态闪烁和重复请求
 * 4. 支持状态预加载和智能更新
 */

import { useEffect, useCallback } from 'react';
import { useUnifiedUserState } from '@/stores/unifiedUserStateStore';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/utils/logger';

/**
 * 统一用户状态管理Hook
 * 
 * 使用方式：
 * ```typescript
 * const { user, subscriptionStatus, usageRemaining, isLoading } = useUnifiedUserState();
 * ```
 */
export const useUnifiedUserStateManager = () => {
  const unifiedState = useUnifiedUserState();
  const { user, isAuthenticated } = useAuth();
  const { primaryStatus, hasActiveSubscription, refresh: refreshSubscription } = useSubscriptionStatus();
  const { usageCount, maxUsage } = useAuthStore();

  // 同步用户状态
  useEffect(() => {
    if (user !== unifiedState.user) {
      logger.info('🔄 同步用户状态到统一存储');
      unifiedState.updateUserState(user);
    }
  }, [user, unifiedState]);

  // 同步订阅状态
  useEffect(() => {
    if (primaryStatus && primaryStatus !== unifiedState.subscriptionStatus) {
      logger.info('🔄 同步订阅状态到统一存储');
      unifiedState.updateSubscriptionState(primaryStatus);
    }
  }, [primaryStatus, unifiedState]);

  // 同步使用次数状态
  useEffect(() => {
    if (usageCount !== unifiedState.usageCount || maxUsage !== unifiedState.maxUsage) {
      logger.info('🔄 同步使用次数状态到统一存储');
      unifiedState.updateUsageState(usageCount, maxUsage);
    }
  }, [usageCount, maxUsage, unifiedState]);

  // 监听支付成功事件
  useEffect(() => {
    const handlePaymentSuccess = () => {
      logger.info('🎉 收到支付成功事件，刷新统一状态');
      unifiedState.clearCache();
      unifiedState.refreshAllStates();
    };

    const handleSubscriptionUpdated = (event: CustomEvent) => {
      logger.info('🔄 收到订阅更新事件，刷新统一状态', event.detail);
      unifiedState.clearCache();
      unifiedState.refreshAllStates();
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    window.addEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);

    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);
    };
  }, [unifiedState]);

  // 🔧 FIX: 立即初始化状态，不等待认证完成
  useEffect(() => {
    // 如果有缓存的用户信息或当前已认证，立即初始化
    if ((isAuthenticated || unifiedState.user) && !unifiedState.isInitialized) {
      logger.info('🚀 立即初始化统一用户状态');
      unifiedState.initializeState();
    }
  }, [isAuthenticated, unifiedState]);

  // 🔧 FIX: 应用启动时预加载缓存状态
  useEffect(() => {
    if (unifiedState.user && unifiedState.isStateValid()) {
      logger.info('🚀 使用缓存状态，避免闪烁');
      // 状态已缓存且有效，无需重新加载
    }
  }, []);

  return unifiedState;
};

/**
 * 便捷的状态访问Hook - 用户信息
 */
export const useUserInfo = () => {
  const state = useUnifiedUserState(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized
  }));

  return state;
};

/**
 * 便捷的状态访问Hook - 订阅信息
 */
export const useSubscriptionInfo = () => {
  const state = useUnifiedUserState(state => ({
    subscriptionStatus: state.subscriptionStatus,
    hasActiveSubscription: state.hasActiveSubscription,
    userTier: state.userTier,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized
  }));

  return state;
};

/**
 * 便捷的状态访问Hook - 使用次数信息
 */
export const useUsageInfo = () => {
  const state = useUnifiedUserState(state => ({
    usageCount: state.usageCount,
    maxUsage: state.maxUsage,
    usageRemaining: state.usageRemaining,
    userTier: state.userTier,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized
  }));

  return state;
};

/**
 * 便捷的状态访问Hook - 完整状态
 */
export const useCompleteUserState = () => {
  const state = useUnifiedUserState(state => ({
    // 用户信息
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    
    // 订阅信息
    subscriptionStatus: state.subscriptionStatus,
    hasActiveSubscription: state.hasActiveSubscription,
    userTier: state.userTier,
    
    // 使用次数信息
    usageCount: state.usageCount,
    maxUsage: state.maxUsage,
    usageRemaining: state.usageRemaining,
    
    // 状态管理
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
    
    // 操作方法
    refreshAllStates: state.refreshAllStates,
    clearCache: state.clearCache
  }));

  return state;
};

/**
 * 状态预加载Hook - 在应用启动时预加载状态
 */
export const useStatePreloader = () => {
  const unifiedState = useUnifiedUserState();
  const { isAuthenticated } = useAuth();

  const preloadStates = useCallback(async () => {
    if (isAuthenticated && !unifiedState.isStateValid()) {
      logger.info('🚀 预加载用户状态，避免页面切换时的闪烁');
      try {
        await unifiedState.initializeState();
      } catch (error) {
        logger.error('状态预加载失败:', error);
      }
    }
  }, [isAuthenticated, unifiedState]);

  useEffect(() => {
    preloadStates();
  }, [preloadStates]);

  return { preloadStates };
};

/**
 * 智能状态刷新Hook - 根据页面可见性智能刷新状态
 */
export const useSmartStateRefresh = () => {
  const unifiedState = useUnifiedUserState();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !unifiedState.isStateValid()) {
        logger.info('🔄 页面重新可见，刷新状态');
        unifiedState.refreshAllStates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [unifiedState]);
};

/**
 * 状态同步Hook - 确保所有状态管理系统保持同步
 */
export const useStateSynchronizer = () => {
  const unifiedState = useUnifiedUserState();
  const { user } = useAuth();
  const { primaryStatus } = useSubscriptionStatus();
  const { usageCount, maxUsage, updateMaxUsage } = useAuthStore();

  // 同步到旧的状态管理系统
  useEffect(() => {
    if (unifiedState.isInitialized && unifiedState.maxUsage !== maxUsage) {
      logger.info('🔄 同步使用次数限制到AuthStore');
      updateMaxUsage(unifiedState.maxUsage);
    }
  }, [unifiedState.maxUsage, unifiedState.isInitialized, maxUsage, updateMaxUsage]);

  return {
    syncStates: () => {
      logger.info('🔄 手动同步所有状态');
      if (user) unifiedState.updateUserState(user);
      if (primaryStatus) unifiedState.updateSubscriptionState(primaryStatus);
      unifiedState.updateUsageState(usageCount, maxUsage);
    }
  };
};
