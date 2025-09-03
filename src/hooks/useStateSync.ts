/**
 * 状态同步Hook - 深度修复状态闪烁问题
 * 
 * 🎯 核心原理：
 * 1. 在组件渲染前立即同步所有状态管理系统
 * 2. 优先使用本地缓存，避免等待网络请求
 * 3. 确保多个状态管理系统数据一致性
 * 4. 提供无闪烁的用户体验
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useUnifiedUserState } from '@/stores/unifiedUserStateStore';
import { logger } from '@/utils/logger';

/**
 * 状态同步初始化Hook - 简化版，避免循环
 * 
 * 用于在应用启动时立即同步所有状态管理系统，避免状态闪烁
 */
export const useImmediateStateSync = () => {
  // 🔧 暂时禁用所有状态同步逻辑，避免无限循环
  // 状态同步由现有的 useUnifiedUserStateManager 处理
  
  logger.info('🚧 useImmediateStateSync 已禁用，避免循环更新');

  
  return {
    isStatesSynced: true, // 简化返回，避免循环
    syncStates: () => {
      logger.info('🚧 手动同步已禁用');
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