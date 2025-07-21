/**
 * 业务状态管理
 * 使用 Zustand 管理业务相关状态，不包含认证逻辑
 * 认证逻辑统一由 UnifiedAuthContext 管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 业务状态接口
 */
interface BusinessState {
  /** 用户使用统计 */
  usage: {
    /** 已使用次数 */
    usedCount: number;
    /** 可用次数 */
    availableCount: number;
    /** 总次数 */
    totalCount: number;
    /** 使用限制 */
    limit: number;
  };
  /** 用户邀请信息 */
  invite: {
    /** 邀请码 */
    code: string;
    /** 邀请链接 */
    link: string;
    /** 邀请人数 */
    count: number;
    /** 邀请奖励 */
    reward: number;
  };
  /** 临时用户ID */
  tempUserId: string;
  /** 用户邀请统计 */
  userInviteStats: {
    totalInvites: number;
    successfulInvites: number;
    pendingInvites: number;
  };
  /** 推荐人信息 */
  referrer: string | null;
  /** 用户偏好设置 */
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'zh-CN' | 'en-US';
    notifications: boolean;
  };
}

/**
 * 业务操作接口
 */
interface BusinessActions {
  /** 更新使用统计 */
  updateUsage: (usage: Partial<BusinessState['usage']>) => void;
  /** 更新邀请信息 */
  updateInvite: (invite: Partial<BusinessState['invite']>) => void;
  /** 增加使用次数 */
  incrementUsage: () => void;
  /** 减少使用次数 */
  decrementUsage: () => void;
  /** 重置使用次数 */
  resetUsage: () => void;
  /** 记录用户行为 */
  recordUserAction: (action: string, data?: any) => void;
  /** 获取剩余使用次数 */
  getUsageRemaining: () => number;
  /** 设置临时用户ID */
  setTempUserId: (id: string) => void;
  /** 获取当前用户ID */
  getCurrentUserId: () => string;
  /** 检查是否为临时用户ID */
  isTempUserIdBound: () => boolean;
  /** 设置推荐人 */
  setReferrer: (referrer: string) => void;
  /** 获取推荐人 */
  getReferrer: () => string | null;
  /** 清除推荐人 */
  clearReferrer: () => void;
  /** 跟踪邀请点击 */
  trackInviteClick: () => void;
  /** 获取用户邀请码 */
  getUserInviteCode: () => string;
  /** 更新用户偏好 */
  updatePreferences: (preferences: Partial<BusinessState['preferences']>) => void;
  /** 清除所有业务状态 */
  clearBusinessState: () => void;
}

/**
 * 业务状态类型
 */
type BusinessStore = BusinessState & BusinessActions;

/**
 * 创建业务状态管理
 */
export const useBusinessStore = create<BusinessStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      usage: {
        usedCount: 0,
        availableCount: 10,
        totalCount: 10,
        limit: 100
      },
      invite: {
        code: '',
        link: '',
        count: 0,
        reward: 0
      },
      tempUserId: '',
      userInviteStats: {
        totalInvites: 0,
        successfulInvites: 0,
        pendingInvites: 0
      },
      referrer: null,
      preferences: {
        theme: 'system',
        language: 'zh-CN',
        notifications: true
      },

      // 操作
      updateUsage: (usage) => {
        set((state) => ({
          usage: { ...state.usage, ...usage }
        }));
      },

      updateInvite: (invite) => {
        set((state) => ({
          invite: { ...state.invite, ...invite }
        }));
      },

      incrementUsage: () => {
        set((state) => ({
          usage: {
            ...state.usage,
            usedCount: state.usage.usedCount + 1,
            availableCount: Math.max(0, state.usage.availableCount - 1)
          }
        }));
      },

      decrementUsage: () => {
        set((state) => ({
          usage: {
            ...state.usage,
            usedCount: Math.max(0, state.usage.usedCount - 1),
            availableCount: state.usage.availableCount + 1
          }
        }));
      },

      resetUsage: () => {
        set((state) => ({
          usage: {
            ...state.usage,
            usedCount: 0,
            availableCount: state.usage.totalCount
          }
        }));
      },

      recordUserAction: (action, data) => {
        console.log('用户行为记录:', action, data);
        // 这里可以添加实际的行为追踪逻辑
      },

      getUsageRemaining: () => {
        const state = get();
        return state.usage.availableCount;
      },

      setTempUserId: (id) => {
        set({ tempUserId: id });
      },

      getCurrentUserId: () => {
        const state = get();
        return state.tempUserId || '';
      },

      isTempUserIdBound: () => {
        const state = get();
        return !!state.tempUserId;
      },

      setReferrer: (referrer) => {
        set({ referrer });
      },

      getReferrer: () => {
        const state = get();
        return state.referrer;
      },

      clearReferrer: () => {
        set({ referrer: null });
      },

      trackInviteClick: () => {
        set((state) => ({
          userInviteStats: {
            ...state.userInviteStats,
            totalInvites: state.userInviteStats.totalInvites + 1
          }
        }));
      },

      getUserInviteCode: () => {
        const state = get();
        return state.invite.code || state.tempUserId || '';
      },

      updatePreferences: (preferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        }));
      },

      clearBusinessState: () => {
        set({
          usage: {
            usedCount: 0,
            availableCount: 10,
            totalCount: 10,
            limit: 100
          },
          invite: {
            code: '',
            link: '',
            count: 0,
            reward: 0
          },
          tempUserId: '',
          userInviteStats: {
            totalInvites: 0,
            successfulInvites: 0,
            pendingInvites: 0
          },
          referrer: null,
          preferences: {
            theme: 'system',
            language: 'zh-CN',
            notifications: true
          }
        });
      }
    }),
    {
      name: 'business-store',
      // 只持久化业务状态
      partialize: (state) => ({
        usage: state.usage,
        invite: state.invite,
        tempUserId: state.tempUserId,
        userInviteStats: state.userInviteStats,
        referrer: state.referrer,
        preferences: state.preferences
      })
    }
  )
);

/**
 * 使用业务状态的 Hook
 */
export const useBusinessState = () => {
  return useBusinessStore((state) => ({
    usage: state.usage,
    invite: state.invite,
    tempUserId: state.tempUserId,
    userInviteStats: state.userInviteStats,
    referrer: state.referrer,
    preferences: state.preferences
  }));
};

/**
 * 使用业务操作的 Hook
 */
export const useBusinessActions = () => {
  return useBusinessStore((state) => ({
    updateUsage: state.updateUsage,
    updateInvite: state.updateInvite,
    incrementUsage: state.incrementUsage,
    decrementUsage: state.decrementUsage,
    resetUsage: state.resetUsage,
    recordUserAction: state.recordUserAction,
    setTempUserId: state.setTempUserId,
    setReferrer: state.setReferrer,
    clearReferrer: state.clearReferrer,
    trackInviteClick: state.trackInviteClick,
    updatePreferences: state.updatePreferences,
    clearBusinessState: state.clearBusinessState
  }));
};

// 为了向后兼容，保留 useAuthStore 导出
export const useAuthStore = useBusinessStore; 