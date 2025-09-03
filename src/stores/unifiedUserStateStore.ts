/**
 * 统一用户状态管理 - 解决状态闪烁问题的根本方案
 * 
 * 🎯 核心目标：
 * 1. 统一管理用户、订阅、使用次数等所有状态
 * 2. 提供全局缓存，避免重复请求
 * 3. 消除状态闪烁，提供一致的用户体验
 * 4. 支持状态预加载和智能缓存
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';
import type { SubscriptionStatus } from '@/types/subscription';
import { logger } from '@/utils/logger';

// 统一用户状态接口
interface UnifiedUserState {
  // 用户基础信息
  user: User | null;
  isAuthenticated: boolean;
  
  // 订阅状态
  subscriptionStatus: SubscriptionStatus | null;
  hasActiveSubscription: boolean;
  userTier: 'trial' | 'pro' | 'premium';
  
  // 使用次数状态
  usageCount: number;
  maxUsage: number;
  usageRemaining: number;
  
  // 状态管理
  isInitialized: boolean;
  isLoading: boolean;
  lastUpdated: number;
  error: string | null;
  
  // 缓存控制
  cacheExpiry: number;
  forceRefresh: boolean;
}

// 统一用户状态操作接口
interface UnifiedUserStateActions {
  // 初始化和更新
  initializeState: () => Promise<void>;
  updateUserState: (user: User | null) => Promise<void>;
  updateSubscriptionState: (status: SubscriptionStatus) => void;
  updateUsageState: (usageCount: number, maxUsage: number) => void;
  
  // 刷新操作
  refreshAllStates: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  refreshUsageStats: () => Promise<void>;
  
  // 缓存管理
  clearCache: () => void;
  isStateValid: () => boolean;
  
  // 状态重置
  resetState: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

type UnifiedUserStateStore = UnifiedUserState & UnifiedUserStateActions;

// 缓存有效期：5分钟
const CACHE_DURATION = 5 * 60 * 1000;

// 计算用户等级
const calculateUserTier = (user: User | null, subscriptionStatus: SubscriptionStatus | null): 'trial' | 'pro' | 'premium' => {
  if (!user || !subscriptionStatus || subscriptionStatus.status !== 'active') {
    return 'trial';
  }
  
  // 根据订阅状态判断等级
  if (subscriptionStatus.statusLabel?.includes('高级') || subscriptionStatus.statusLabel?.includes('premium')) {
    return 'premium';
  } else if (subscriptionStatus.statusLabel?.includes('专业') || subscriptionStatus.statusLabel?.includes('pro')) {
    return 'pro';
  }
  
  return 'trial';
};

// 计算使用次数限制
const calculateMaxUsage = (tier: 'trial' | 'pro' | 'premium'): number => {
  switch (tier) {
    case 'trial':
      return 10;
    case 'pro':
      return 30;
    case 'premium':
      return -1; // 无限制
    default:
      return 10;
  }
};

// 创建统一用户状态存储
export const useUnifiedUserState = create<UnifiedUserStateStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      subscriptionStatus: null,
      hasActiveSubscription: false,
      userTier: 'trial',
      usageCount: 0,
      maxUsage: 10,
      usageRemaining: 10,
      isInitialized: false,
      isLoading: false,
      lastUpdated: 0,
      error: null,
      cacheExpiry: 0,
      forceRefresh: false,

      // 检查状态是否有效
      isStateValid: () => {
        const state = get();
        const now = Date.now();
        return (
          state.isInitialized &&
          !state.forceRefresh &&
          now < state.cacheExpiry &&
          state.lastUpdated > 0
        );
      },

      // 初始化状态
      initializeState: async () => {
        const state = get();
        
        // 如果状态有效且不需要强制刷新，直接返回
        if (state.isStateValid() && !state.forceRefresh) {
          logger.info('🚀 使用缓存的用户状态，避免闪烁');
          return;
        }

        logger.info('🔄 开始初始化统一用户状态...');
        set({ isLoading: true, error: null });

        try {
          // 这里会从各个服务获取最新状态
          // 具体实现在后续添加
          await get().refreshAllStates();
          
          set({
            isInitialized: true,
            isLoading: false,
            lastUpdated: Date.now(),
            cacheExpiry: Date.now() + CACHE_DURATION,
            forceRefresh: false
          });
          
          logger.info('✅ 统一用户状态初始化完成');
        } catch (error) {
          logger.error('❌ 统一用户状态初始化失败:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '状态初始化失败'
          });
        }
      },

      // 更新用户状态
      updateUserState: async (user: User | null) => {
        logger.info('🔄 更新用户状态:', user?.id);
        
        const isAuthenticated = !!user;
        const currentState = get();
        
        set({
          user,
          isAuthenticated,
          lastUpdated: Date.now()
        });

        // 如果用户状态发生变化，刷新相关状态
        if (currentState.user?.id !== user?.id) {
          if (user) {
            await get().refreshSubscriptionStatus();
            await get().refreshUsageStats();
          } else {
            // 用户登出，重置状态
            set({
              subscriptionStatus: null,
              hasActiveSubscription: false,
              userTier: 'trial',
              usageCount: 0,
              maxUsage: 10,
              usageRemaining: 10
            });
          }
        }
      },

      // 更新订阅状态
      updateSubscriptionState: (status: SubscriptionStatus) => {
        logger.info('🔄 更新订阅状态:', status.status);
        
        const hasActiveSubscription = status.status === 'active';
        const userTier = calculateUserTier(get().user, status);
        const maxUsage = calculateMaxUsage(userTier);
        const usageCount = get().usageCount;
        const usageRemaining = maxUsage === -1 ? Infinity : Math.max(0, maxUsage - usageCount);
        
        set({
          subscriptionStatus: status,
          hasActiveSubscription,
          userTier,
          maxUsage,
          usageRemaining,
          lastUpdated: Date.now()
        });
      },

      // 更新使用次数状态
      updateUsageState: (usageCount: number, maxUsage?: number) => {
        logger.info('🔄 更新使用次数状态:', { usageCount, maxUsage });
        
        const currentState = get();
        const finalMaxUsage = maxUsage ?? currentState.maxUsage;
        const usageRemaining = finalMaxUsage === -1 ? Infinity : Math.max(0, finalMaxUsage - usageCount);
        
        set({
          usageCount,
          maxUsage: finalMaxUsage,
          usageRemaining,
          lastUpdated: Date.now()
        });
      },

      // 刷新所有状态
      refreshAllStates: async () => {
        logger.info('🔄 刷新所有用户状态...');
        
        const state = get();
        if (!state.user) {
          logger.warn('用户未登录，跳过状态刷新');
          return;
        }

        try {
          // 并行刷新订阅状态和使用次数
          await Promise.all([
            get().refreshSubscriptionStatus(),
            get().refreshUsageStats()
          ]);
        } catch (error) {
          logger.error('刷新状态失败:', error);
          throw error;
        }
      },

      // 刷新订阅状态
      refreshSubscriptionStatus: async () => {
        // 具体实现将在后续添加
        logger.info('🔄 刷新订阅状态...');
      },

      // 刷新使用次数统计
      refreshUsageStats: async () => {
        // 具体实现将在后续添加
        logger.info('🔄 刷新使用次数统计...');
      },

      // 清除缓存
      clearCache: () => {
        logger.info('🗑️ 清除用户状态缓存');
        set({
          cacheExpiry: 0,
          forceRefresh: true,
          lastUpdated: 0
        });
      },

      // 重置状态
      resetState: () => {
        logger.info('🔄 重置用户状态');
        set({
          user: null,
          isAuthenticated: false,
          subscriptionStatus: null,
          hasActiveSubscription: false,
          userTier: 'trial',
          usageCount: 0,
          maxUsage: 10,
          usageRemaining: 10,
          isInitialized: false,
          isLoading: false,
          lastUpdated: 0,
          error: null,
          cacheExpiry: 0,
          forceRefresh: false
        });
      },

      // 设置错误
      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'unified-user-state',
      // 只持久化必要的状态，避免过期数据
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastUpdated: state.lastUpdated,
        cacheExpiry: state.cacheExpiry
      })
    }
  )
);

// 导出便捷的状态选择器
export const useUserState = () => useUnifiedUserState(state => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error
}));

export const useSubscriptionState = () => useUnifiedUserState(state => ({
  subscriptionStatus: state.subscriptionStatus,
  hasActiveSubscription: state.hasActiveSubscription,
  userTier: state.userTier,
  isLoading: state.isLoading
}));

export const useUsageState = () => useUnifiedUserState(state => ({
  usageCount: state.usageCount,
  maxUsage: state.maxUsage,
  usageRemaining: state.usageRemaining,
  userTier: state.userTier,
  isLoading: state.isLoading
}));
