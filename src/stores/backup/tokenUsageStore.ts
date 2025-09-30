/**
 * Token使用量状态管理
 * @description 使用Zustand管理Token使用量的全局状态
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tokenUsageService } from '@/services/tokenUsageService';
import type { TokenUsageStats, TokenUsageRecord } from '@/services/tokenUsageService';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * Token使用量状态接口
 */
interface TokenUsageState {
  /** 当前用户的Token统计 */
  currentStats: TokenUsageStats | null;
  /** Token使用历史记录 */
  usageHistory: TokenUsageRecord[];
  /** 按功能分类的使用统计 */
  featureStats: Record<string, { totalTokens: number; requestCount: number; percentage: number }>;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 最后更新时间 */
  lastUpdated: string | null;
}

/**
 * Token使用量操作接口
 */
interface TokenUsageActions {
  /** 刷新用户Token统计 */
  refreshStats: (userId: string, userTier: SubscriptionTier) => Promise<void>;
  /** 刷新使用历史 */
  refreshHistory: (userId: string, limit?: number) => Promise<void>;
  /** 刷新功能统计 */
  refreshFeatureStats: (userId: string) => Promise<void>;
  /** 记录Token使用 */
  recordUsage: (record: Omit<TokenUsageRecord, 'id' | 'timestamp'>) => Promise<void>;
  /** 清除错误 */
  clearError: () => void;
  /** 重置状态 */
  reset: () => void;
  /** 检查Token限额 */
  checkLimit: (userId: string, userTier: SubscriptionTier, estimatedTokens: number) => Promise<{
    allowed: boolean;
    reason?: string;
    stats: TokenUsageStats;
  }>;
}

/**
 * 初始状态
 */
const initialState: TokenUsageState = {
  currentStats: null,
  usageHistory: [],
  featureStats: {},
  loading: false,
  error: null,
  lastUpdated: null
};

/**
 * Token使用量状态管理Store
 */
export const useTokenUsageStore = create<TokenUsageState & TokenUsageActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * 刷新用户Token统计
       */
      refreshStats: async (userId: string, userTier: SubscriptionTier) => {
        set({ loading: true, error: null });
        
        try {
          const stats = await tokenUsageService.getUserTokenStats(userId, userTier);
          set({ 
            currentStats: stats, 
            loading: false,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error('刷新Token统计失败:', error);
          set({ 
            error: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25',
            loading: false 
          });
        }
      },

      /**
       * 刷新使用历史
       */
      refreshHistory: async (userId: string, limit = 50) => {
        set({ loading: true, error: null });
        
        try {
          const history = await tokenUsageService.getUserTokenHistory(userId, limit);
          set({ 
            usageHistory: history, 
            loading: false,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error('刷新使用历史失败:', error);
          set({ 
            error: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25',
            loading: false 
          });
        }
      },

      /**
       * 刷新功能统计
       */
      refreshFeatureStats: async (userId: string) => {
        set({ loading: true, error: null });
        
        try {
          const featureStats = await tokenUsageService.getUserTokenStatsByFeature(userId);
          set({ 
            featureStats, 
            loading: false,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error('刷新功能统计失败:', error);
          set({ 
            error: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25',
            loading: false 
          });
        }
      },

      /**
       * 记录Token使用
       */
      recordUsage: async (record: Omit<TokenUsageRecord, 'id' | 'timestamp'>) => {
        try {
          await tokenUsageService.recordTokenUsage(record);
          
          // 记录成功后，更新本地状态
          const { currentStats, usageHistory } = get();
          
          // 更新统计数据
          if (currentStats && currentStats.userId === record.userId) {
            const updatedStats: TokenUsageStats = {
              ...currentStats,
              monthlyUsed: currentStats.monthlyUsed + record.totalTokens,
              monthlyRemaining: Math.max(0, currentStats.monthlyRemaining - record.totalTokens),
              usagePercentage: ((currentStats.monthlyUsed + record.totalTokens) / currentStats.monthlyLimit) * 100,
              needUpgrade: ((currentStats.monthlyUsed + record.totalTokens) / currentStats.monthlyLimit) >= 0.8,
              lastUpdated: new Date().toISOString()
            };
            
            set({ currentStats: updatedStats });
          }
          
          // 更新历史记录（添加到开头，保持时间倒序）
          const newRecord: TokenUsageRecord = {
            ...record,
            id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
          };
          
          set({ 
            usageHistory: [newRecord, ...usageHistory.slice(0, 49)], // 保持最新50条
            lastUpdated: new Date().toISOString()
          });
          
        } catch (error) {
          console.error('记录Token使用失败:', error);
          set({ 
            error: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'
          });
        }
      },

      /**
       * 检查Token限额
       */
      checkLimit: async (userId: string, userTier: SubscriptionTier, estimatedTokens: number) => {
        try {
          const result = await tokenUsageService.checkTokenLimit(userId, userTier, estimatedTokens);
          
          // 更新当前统计
          set({ 
            currentStats: result.stats,
            lastUpdated: new Date().toISOString()
          });
          
          return result;
        } catch (error) {
          console.error('检查Token限额失败:', error);
          set({ 
            error: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'
          });
          
          // 🚨 API失败时必须抛出错误，不能返回模拟允许结果
          throw new Error(`Token限额检查API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      },

      /**
       * 清除错误
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * 重置状态
       */
      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'wenpai-token-usage-store',
      partialize: (state) => ({
        currentStats: state.currentStats,
        usageHistory: state.usageHistory.slice(0, 20), // 只持久化最新20条历史
        featureStats: state.featureStats,
        lastUpdated: state.lastUpdated
      })
    }
  )
);

/**
 * Token使用量Hook - 便捷的React Hook
 */
export function useTokenUsage(userId?: string, userTier?: SubscriptionTier) {
  const store = useTokenUsageStore();
  
  // 自动刷新数据
  React.useEffect(() => {
    if (userId && userTier) {
      store.refreshStats(userId, userTier);
      store.refreshHistory(userId);
      store.refreshFeatureStats(userId);
    }
  }, [userId, userTier]);
  
  return store;
}

export default useTokenUsageStore;
