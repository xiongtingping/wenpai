/**
 * 用户业务状态管理
 * 管理用户使用量、邀请统计等业务数据
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getOrCreateTempUserId } from '@/lib/utils';

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
 * 用户存储状态接口
 */
interface UserState {
  /** 用户邀请码 */
  userInviteCode: string;
  /** 用户邀请统计 */
  userInviteStats: {
    totalClicks: number;
    totalRegistrations: number;
    totalRewards: number;
  };
  /** 剩余使用次数 */
  usageRemaining: number;
  /** 临时用户ID */
  tempUserId: string;
  /** 临时用户ID是否已绑定到正式账号 */
  isTempUserIdBound: boolean;
  /** 生成邀请码 */
  generateInviteCode: () => string;
  /** 绑定临时用户ID到正式账号 */
  bindTempUserIdToAccount: (accountId: string) => void;
  /** 获取当前用户ID（临时或正式） */
  getCurrentUserId: () => string;
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
      userInviteCode: 'temp-invite-code',
      userInviteStats: {
        totalClicks: 0,
        totalRegistrations: 0,
        totalRewards: 0,
      },
      usageRemaining: 10,
      tempUserId: getOrCreateTempUserId(),
      isTempUserIdBound: false,

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
        const newCode = `invite_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
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

      // 绑定临时用户ID到正式账号
      bindTempUserIdToAccount: (accountId: string) => {
        const { tempUserId } = get();
        
        // 保存绑定关系
        const bindingData = {
          tempUserId,
          accountId,
          boundAt: new Date().toISOString(),
        };
        
        localStorage.setItem('temp_user_binding', JSON.stringify(bindingData));
        
        // 更新状态
        set({ 
          isTempUserIdBound: true,
          tempUserId: accountId // 更新为正式账号ID
        });
        
        console.log('临时用户ID已绑定到正式账号:', bindingData);
      },

      // 获取当前用户ID（临时或正式）
      getCurrentUserId: () => {
        const { tempUserId, isTempUserIdBound } = get();
        
        // 如果已绑定，返回正式账号ID
        if (isTempUserIdBound) {
          const bindingData = localStorage.getItem('temp_user_binding');
          if (bindingData) {
            try {
              const binding = JSON.parse(bindingData);
              return binding.accountId;
            } catch (error) {
              console.error('解析绑定数据失败:', error);
            }
          }
        }
        
        // 否则返回临时ID
        return tempUserId;
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