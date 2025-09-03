/**
 * 状态同步Hook - 深度修复状态闪烁问题
 * 
 * 🎯 核心原理：
 * 1. 在组件渲染前立即同步所有状态管理系统
 * 2. 优先使用本地缓存，避免等待网络请求
 * 3. 确保多个状态管理系统数据一致性
 * 4. 提供无闪烁的用户体验
 */

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useUnifiedUserState } from '@/stores/unifiedUserStateStore';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { logger } from '@/utils/logger';

/**
 * 状态同步初始化Hook
 * 
 * 用于在应用启动时立即同步所有状态管理系统，避免状态闪烁
 */
export const useImmediateStateSync = () => {
  const { user, isAuthenticated } = useAuth();
  const authStore = useAuthStore();
  const unifiedState = useUnifiedUserState();
  const { primaryStatus, hasActiveSubscription } = useSubscriptionStatus();

  useEffect(() => {
    // 🔧 FIX: 应用启动时立即进行状态同步
    const syncStatesImmediately = () => {
      logger.info('🚀 开始立即状态同步，避免闪烁...');

      try {
        // 1. 如果有缓存的用户信息，立即应用到所有状态管理系统
        if (unifiedState.user && unifiedState.isAuthenticated) {
          const cachedUser = unifiedState.user;
          logger.info('✅ 发现缓存用户信息，立即同步:', cachedUser.id);

          // 同步到 authStore
          if (authStore.user?.id !== cachedUser.id) {
            authStore.setUser({
              id: cachedUser.id,
              username: cachedUser.username,
              email: cachedUser.email,
              phone: cachedUser.phone,
              nickname: cachedUser.nickname,
              avatar: cachedUser.avatar,
              loginTime: cachedUser.loginTime,
            });
          }

          // 2. 如果有订阅状态缓存，也立即应用
          if (unifiedState.subscriptionStatus) {
            const tier = unifiedState.userTier;
            const maxUsage = unifiedState.maxUsage;
            
            // 同步使用次数限制
            if (authStore.maxUsage !== maxUsage) {
              authStore.updateMaxUsage(maxUsage);
              logger.info('✅ 同步使用次数限制:', { 
                oldLimit: authStore.maxUsage, 
                newLimit: maxUsage, 
                tier 
              });
            }

            logger.info('✅ 缓存状态已立即同步:', {
              userId: cachedUser.id,
              userTier: tier,
              hasActiveSubscription: unifiedState.hasActiveSubscription,
              maxUsage: maxUsage
            });
          }

          // 标记为已初始化，避免重复初始化
          if (!unifiedState.isInitialized) {
            logger.info('✅ 标记统一状态为已初始化');
          }
        }
      } catch (error) {
        logger.error('❌ 立即状态同步失败:', error);
      }
    };

    // 立即执行同步
    syncStatesImmediately();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 🔧 FIX: 当用户状态变化时，立即同步到其他状态管理系统
  useEffect(() => {
    if (user && isAuthenticated) {
      logger.info('🔄 用户状态变化，立即同步到统一状态');
      unifiedState.updateUserState(user);
    }
  }, [user, isAuthenticated, unifiedState]);

  // 🔧 FIX: 当订阅状态变化时，立即更新使用次数限制
  useEffect(() => {
    if (primaryStatus && hasActiveSubscription !== undefined) {
      logger.info('🔄 订阅状态变化，立即更新使用次数限制');
      unifiedState.updateSubscriptionState(primaryStatus);

      // 计算并更新使用次数限制
      const tier = unifiedState.userTier;
      let maxUsage = 10; // 默认试用版限制
      
      if (primaryStatus.statusLabel?.includes('高级') || primaryStatus.statusLabel?.includes('premium')) {
        maxUsage = -1; // 无限制
      } else if (primaryStatus.statusLabel?.includes('专业') || primaryStatus.statusLabel?.includes('pro')) {
        maxUsage = 30;
      }

      if (authStore.maxUsage !== maxUsage) {
        authStore.updateMaxUsage(maxUsage);
        logger.info('✅ 立即更新使用次数限制:', { tier, maxUsage });
      }
    }
  }, [primaryStatus, hasActiveSubscription, unifiedState, authStore]);

  return {
    isStatesSynced: unifiedState.isInitialized && authStore.user !== null,
    syncStates: () => {
      // 提供手动同步方法
      logger.info('🔄 手动触发状态同步');
      if (user) unifiedState.updateUserState(user);
      if (primaryStatus) unifiedState.updateSubscriptionState(primaryStatus);
    }
  };
};

/**
 * 简化的状态同步Hook - 仅用于关键组件
 */
export const useQuickStateSync = () => {
  const unifiedState = useUnifiedUserState();
  const authStore = useAuthStore();

  useEffect(() => {
    // 如果统一状态有数据但 authStore 没有，立即同步
    if (unifiedState.user && !authStore.user) {
      logger.info('🔄 快速同步用户状态到 authStore');
      authStore.setUser({
        id: unifiedState.user.id,
        username: unifiedState.user.username,
        email: unifiedState.user.email,
        phone: unifiedState.user.phone,
        nickname: unifiedState.user.nickname,
        avatar: unifiedState.user.avatar,
        loginTime: unifiedState.user.loginTime,
      });
    }

    // 同步使用次数限制
    if (unifiedState.maxUsage !== authStore.maxUsage) {
      logger.info('🔄 快速同步使用次数限制');
      authStore.updateMaxUsage(unifiedState.maxUsage);
    }
  }, [unifiedState.user, unifiedState.maxUsage, authStore]);

  return {
    isQuickSynced: !!(unifiedState.user && authStore.user)
  };
};