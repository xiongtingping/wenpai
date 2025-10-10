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
   */
  refreshStatus: async (userId: string) => {
    logger.info('🔄 强制刷新订阅状态', { userId });
    
    // 清除缓存
    await unifiedSubscriptionService.refreshUserSubscription(userId);
    
    // 重新获取
    await get().fetchStatus(userId);
  },

  /**
   * 预加载订阅状态（后台异步）
   * 🔧 优化: 在用户登录后立即调用，提前加载到缓存
   */
  preloadStatus: async (userId: string, userProfile?: any) => {
    try {
      logger.info('🚀 预加载订阅状态到全局Store', { userId });
      
      // 后台异步加载，不阻塞主流程
      get().fetchStatus(userId, userProfile).catch(error => {
        logger.warn('预加载订阅状态失败:', error);
      });
    } catch (error) {
      // 预加载失败不影响主流程
      logger.warn('预加载订阅状态异常:', error);
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

