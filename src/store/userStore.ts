/**
 * 用户业务状态管理
 * 管理用户使用量、邀请统计等业务数据
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 用户邀请统计
 */
interface UserInviteStats {
  totalClicks: number;
  totalRegistrations: number;
  totalRewardsClaimed: number;
  invitationLinks: Array<{
    code: string;
    clicks: number;
    registrations: number;
    createdAt: string;
  }>;
}

/**
 * 用户状态接口
 */
interface UserState {
  // 用户使用量
  usageRemaining: number;
  lastReset: string | null;
  
  // 邀请相关
  userInviteStats: UserInviteStats;
  userInviteCode: string;
  
  
  
  // 方法
  decrementUsage: () => void;
  addUsageFromInvite: (amount: number) => void;
        addUsageFromClick: () => void;
      resetMonthlyUsage: () => void;
      generateInviteCode: () => string;
      registerClick: () => void;
      registerInvite: () => void;
      checkAndResetWeeklyLimit: () => void;
}

/**
 * 生成唯一邀请码
 */
const generateUniqueCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 用户状态存储
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      usageRemaining: 10, // 默认初始使用量
      lastReset: null,
      userInviteCode: generateUniqueCode(),
      userInviteStats: {
        totalClicks: 0,
        totalRegistrations: 0,
        totalRewardsClaimed: 0,
        invitationLinks: []
      },

      
      /**
       * 减少使用量
       */
      decrementUsage: () => {
        const { usageRemaining } = get();
        if (usageRemaining > 0) {
          set({ usageRemaining: usageRemaining - 1 });
        }
      },
      
      /**
       * 从邀请增加使用量
       */
      addUsageFromInvite: (amount: number) => {
        const { usageRemaining } = get();
        set({ usageRemaining: usageRemaining + amount });
      },
      
      /**
       * 从点击增加使用量
       */
      addUsageFromClick: () => {
        const { usageRemaining } = get();
        set({ usageRemaining: usageRemaining + 1 });
      },
      
      /**
       * 重置月度使用量
       */
      resetMonthlyUsage: () => {
        const now = new Date().toISOString();
        set({ 
          usageRemaining: 10, // 重置为默认值
          lastReset: now 
        });
      },
      
      /**
       * 生成新的邀请码
       */
      generateInviteCode: () => {
        const newCode = generateUniqueCode();
        set({ userInviteCode: newCode });
        return newCode;
      },
      
      /**
       * 注册点击事件
       */
      registerClick: () => {
        const { userInviteStats } = get();
        const updatedStats = {
          ...userInviteStats,
          totalClicks: userInviteStats.totalClicks + 1
        };
        set({ userInviteStats: updatedStats });
      },
      
      /**
       * 注册邀请成功
       */
      registerInvite: () => {
        const { userInviteStats } = get();
        const updatedStats = {
          ...userInviteStats,
          totalRegistrations: userInviteStats.totalRegistrations + 1
        };
        set({ userInviteStats: updatedStats });
      },
      
      /**
       * 检查并重置每周限制
       */
      checkAndResetWeeklyLimit: () => {
        // 暂时不实现每周限制功能
      },
    }),
    {
      name: 'user-store', // 本地存储键名
      partialize: (state) => ({
        usageRemaining: state.usageRemaining,
        lastReset: state.lastReset,
        userInviteCode: state.userInviteCode,
        userInviteStats: state.userInviteStats,
      }),
    }
  )
);