/**
 * 使用统计状态管理
 * 管理用户的功能使用情况和统计数据
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 使用记录接口
export interface UsageRecord {
  id: string;
  userId: string; // 绑定用户ID
  feature: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// 使用统计状态接口
export interface UsageState {
  records: UsageRecord[];
  dailyUsage: Record<string, number>;
  monthlyUsage: Record<string, number>;
  totalUsage: number;
  lastUpdated: number;
}

// 使用统计操作接口
export interface UsageActions {
  // 记录使用
  recordUsage: (feature: string, userId?: string, metadata?: Record<string, any>) => void;
  
  // 获取今日使用量
  getTodayUsage: (feature?: string, userId?: string) => number;
  
  // 获取月度使用量
  getMonthlyUsage: (feature?: string, userId?: string) => number;
  
  // 获取总使用量
  getTotalUsage: (feature?: string, userId?: string) => number;
  
  // 清除记录
  clearRecords: () => void;
  
  // 获取使用统计
  getUsageStats: () => {
    total: number;
    today: number;
    thisMonth: number;
    topFeatures: Array<{ feature: string; count: number }>;
  };
}

// 初始状态
const initialState: UsageState = {
  records: [],
  dailyUsage: {},
  monthlyUsage: {},
  totalUsage: 0,
  lastUpdated: Date.now()
};

// 生成ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 获取日期键
const getDateKey = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// 获取月份键
const getMonthKey = (date: Date = new Date()): string => {
  return date.toISOString().substring(0, 7); // YYYY-MM
};

// 创建使用统计store
export const useUsageStore = create<UsageState & UsageActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordUsage: (feature: string, userId = 'anonymous', metadata?: Record<string, any>) => {
        const now = new Date();
        const dateKey = getDateKey(now);
        const monthKey = getMonthKey(now);
        
        const record: UsageRecord = {
          id: generateId(),
          userId,
          feature,
          timestamp: now.getTime(),
          metadata
        };

        set((state) => {
          const newDailyUsage = { ...state.dailyUsage };
          const newMonthlyUsage = { ...state.monthlyUsage };
          
          // 更新日使用量
          newDailyUsage[dateKey] = (newDailyUsage[dateKey] || 0) + 1;
          
          // 更新月使用量
          newMonthlyUsage[monthKey] = (newMonthlyUsage[monthKey] || 0) + 1;

          return {
            records: [...state.records, record],
            dailyUsage: newDailyUsage,
            monthlyUsage: newMonthlyUsage,
            totalUsage: state.totalUsage + 1,
            lastUpdated: now.getTime()
          };
        });
      },

      getTodayUsage: (feature?: string, userId?: string) => {
        const state = get();
        const today = getDateKey();
        
        return state.records.filter(record => {
          const recordDate = getDateKey(new Date(record.timestamp));
          const dateMatch = recordDate === today;
          const featureMatch = !feature || record.feature === feature;
          const userMatch = !userId || record.userId === userId;
          return dateMatch && featureMatch && userMatch;
        }).length;
      },

      getMonthlyUsage: (feature?: string, userId?: string) => {
        const state = get();
        const currentMonth = getMonthKey();
        
        return state.records.filter(record => {
          const recordMonth = getMonthKey(new Date(record.timestamp));
          const monthMatch = recordMonth === currentMonth;
          const featureMatch = !feature || record.feature === feature;
          const userMatch = !userId || record.userId === userId;
          return monthMatch && featureMatch && userMatch;
        }).length;
      },

      getTotalUsage: (feature?: string, userId?: string) => {
        const state = get();
        
        return state.records.filter(record => {
          const featureMatch = !feature || record.feature === feature;
          const userMatch = !userId || record.userId === userId;
          return featureMatch && userMatch;
        }).length;
      },

      clearRecords: () => {
        set({
          ...initialState,
          lastUpdated: Date.now()
        });
      },

      getUsageStats: () => {
        const state = get();
        const today = getDateKey();
        const currentMonth = getMonthKey();
        
        // 统计各功能使用次数
        const featureCounts: Record<string, number> = {};
        state.records.forEach(record => {
          featureCounts[record.feature] = (featureCounts[record.feature] || 0) + 1;
        });
        
        // 获取top功能
        const topFeatures = Object.entries(featureCounts)
          .map(([feature, count]) => ({ feature, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          total: state.totalUsage,
          today: state.dailyUsage[today] || 0,
          thisMonth: state.monthlyUsage[currentMonth] || 0,
          topFeatures
        };
      }
    }),
    {
      name: 'usage-storage',
      // 持久化所有状态
      partialize: (state) => ({
        records: state.records,
        dailyUsage: state.dailyUsage,
        monthlyUsage: state.monthlyUsage,
        totalUsage: state.totalUsage,
        lastUpdated: state.lastUpdated
      })
    }
  )
);