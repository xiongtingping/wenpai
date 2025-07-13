/**
 * 用户业务状态管理
 * 管理用户使用量、邀请统计等业务数据
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getOrCreateTempUserId, saveReferrerFromURL, getReferrerId, clearReferrerId } from '@/lib/utils';
import UserDataService from '@/services/userDataService';
import { sendReferralReward } from '@/api/referralService';

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
  /** 推荐人ID */
  referrerId: string | null;
  /** 最后重置时间 */
  lastReset?: string;
  /** 生成邀请码 */
  generateInviteCode: () => string;
  /** 绑定临时用户ID到正式账号 */
  bindTempUserIdToAccount: (accountId: string) => Promise<void>;
  /** 获取当前用户ID（临时或正式） */
  getCurrentUserId: () => string;
  /** 记录用户行为到数据库 */
  recordUserAction: (actionType: 'pageVisit' | 'featureUsage' | 'contentCreated', actionData: any) => void;
  /** 初始化用户数据记录 */
  initializeUserData: (userInfo?: any) => void;
  /** 保存推荐人ID */
  saveReferrer: () => void;
  /** 获取推荐人ID */
  getReferrer: () => string | null;
  /** 清除推荐人ID */
  clearReferrer: () => void;
  /** 处理推荐奖励 */
  processReferralReward: () => void;
  /** 通知后端给推荐人发放奖励 */
  notifyReferrerReward: (referrerId: string) => Promise<void>;
  /** 减少使用量 */
  decrementUsage: () => void;
  /** 从邀请增加使用量 */
  addUsageFromInvite: (amount: number) => void;
  /** 从点击增加使用量 */
  addUsageFromClick: () => void;
  /** 重置月度使用量 */
  resetMonthlyUsage: () => void;
  /** 注册点击事件 */
  registerClick: () => void;
  /** 注册邀请成功 */
  registerInvite: () => void;
  /** 检查并重置每周限制 */
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
      userInviteCode: 'temp-invite-code',
      userInviteStats: {
        totalClicks: 0,
        totalRegistrations: 0,
        totalRewards: 0,
      },
      usageRemaining: 10,
      tempUserId: getOrCreateTempUserId(),
      isTempUserIdBound: false,
      referrerId: null,

      /**
       * 保存推荐人ID
       */
      saveReferrer: () => {
        const referrerId = saveReferrerFromURL();
        if (referrerId) {
          set({ referrerId });
          
          // 记录推荐人访问
          const { recordUserAction } = get();
          recordUserAction('featureUsage', {
            feature: 'referral_visit',
            metadata: { referrerId }
          });
          
          console.log('推荐人ID已保存到状态:', referrerId);
        }
      },

      /**
       * 获取推荐人ID
       */
      getReferrer: () => {
        const { referrerId } = get();
        return referrerId || getReferrerId();
      },

      /**
       * 清除推荐人ID
       */
      clearReferrer: () => {
        clearReferrerId();
        set({ referrerId: null });
      },

      /**
       * 处理推荐奖励
       * @description 处理推荐人和被推荐人的奖励逻辑
       */
      processReferralReward: () => {
        const { referrerId, addUsageFromInvite, clearReferrer, recordUserAction, notifyReferrerReward } = get();
        
        if (referrerId) {
          // 1. 给被推荐人（当前用户）增加20次使用机会
          addUsageFromInvite(20);
          
          // 2. 记录被推荐人奖励
          recordUserAction('featureUsage', {
            feature: 'referral_reward_received',
            metadata: { 
              referrerId,
              rewardAmount: 20,
              rewardType: 'usage_count',
              role: 'referred_user'
            }
          });
          
          // 3. 通知后端给推荐人增加20次使用机会
          notifyReferrerReward(referrerId);
          
          // 4. 清除推荐人ID，避免重复奖励
          clearReferrer();
          
          console.log('推荐奖励已发放:', { 
            referrerId, 
            referredUserReward: 20,
            referrerReward: 20 
          });
        }
      },

      /**
       * 通知后端给推荐人发放奖励
       * @param referrerId 推荐人ID
       */
      notifyReferrerReward: async (referrerId: string) => {
        const { tempUserId } = get();
        
        try {
          const result = await sendReferralReward({
            referrerId,
            referredUserId: tempUserId,
            rewardAmount: 20,
            rewardType: 'usage_count',
            timestamp: new Date().toISOString()
          });
          
          if (result.success) {
            console.log('推荐奖励发放成功:', {
              referrerId,
              referredUserId: tempUserId,
              referrerReward: result.referrerReward,
              referredUserReward: result.referredUserReward
            });
          } else {
            console.error('推荐奖励发放失败:', result.message);
          }
        } catch (error) {
          console.error('推荐奖励发放错误:', error);
        }
      },

      /**
       * 初始化用户数据记录
       * @param userInfo 用户信息
       */
      initializeUserData: async (userInfo?: any) => {
        const { tempUserId } = get();
        const userDataService = UserDataService.getInstance();
        
        try {
          await userDataService.createOrUpdateUserData(tempUserId, userInfo || {}, true);
          console.log('用户数据初始化成功:', tempUserId);
        } catch (error) {
          console.error('用户数据初始化失败:', error);
        }
      },

      /**
       * 记录用户行为到数据库
       * @param actionType 行为类型
       * @param actionData 行为数据
       */
      recordUserAction: async (actionType: 'pageVisit' | 'featureUsage' | 'contentCreated', actionData: any) => {
        const { tempUserId } = get();
        const userDataService = UserDataService.getInstance();
        
        try {
          await userDataService.recordUserAction(tempUserId, actionType, actionData);
        } catch (error) {
          console.error('记录用户行为失败:', error);
        }
      },

      /**
       * 减少使用量
       */
      decrementUsage: () => {
        const { usageRemaining, recordUserAction } = get();
        if (usageRemaining > 0) {
          set({ usageRemaining: usageRemaining - 1 });
          
          // 记录功能使用
          recordUserAction('featureUsage', {
            feature: 'usage_decrement',
            metadata: { remainingUsage: usageRemaining - 1 }
          });
        }
      },
      
      /**
       * 从邀请增加使用量
       */
      addUsageFromInvite: (amount: number) => {
        const { usageRemaining, recordUserAction } = get();
        set({ usageRemaining: usageRemaining + amount });
        
        // 记录邀请奖励
        recordUserAction('featureUsage', {
          feature: 'invite_reward',
          metadata: { amount, newUsage: usageRemaining + amount }
        });
      },
      
      /**
       * 从点击增加使用量
       */
      addUsageFromClick: () => {
        const { usageRemaining, recordUserAction } = get();
        set({ usageRemaining: usageRemaining + 1 });
        
        // 记录点击奖励
        recordUserAction('featureUsage', {
          feature: 'click_reward',
          metadata: { newUsage: usageRemaining + 1 }
        });
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
        
        // 记录重置操作
        const { recordUserAction } = get();
        recordUserAction('featureUsage', {
          feature: 'monthly_reset',
          metadata: { resetTime: now, newUsage: 10 }
        });
      },
      
      /**
       * 生成新的邀请码
       */
      generateInviteCode: () => {
        const newCode = `invite_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        set({ userInviteCode: newCode });
        
        // 记录邀请码生成
        const { recordUserAction } = get();
        recordUserAction('featureUsage', {
          feature: 'generate_invite_code',
          metadata: { inviteCode: newCode }
        });
        
        return newCode;
      },
      
      /**
       * 注册点击事件
       */
      registerClick: () => {
        const { userInviteStats, recordUserAction } = get();
        const updatedStats = {
          ...userInviteStats,
          totalClicks: userInviteStats.totalClicks + 1
        };
        set({ userInviteStats: updatedStats });
        
        // 记录点击事件
        recordUserAction('featureUsage', {
          feature: 'invite_click',
          metadata: { totalClicks: updatedStats.totalClicks }
        });
      },
      
      /**
       * 注册邀请成功
       */
      registerInvite: () => {
        const { userInviteStats, recordUserAction } = get();
        const updatedStats = {
          ...userInviteStats,
          totalRegistrations: userInviteStats.totalRegistrations + 1
        };
        set({ userInviteStats: updatedStats });
        
        // 记录邀请成功
        recordUserAction('featureUsage', {
          feature: 'invite_success',
          metadata: { totalRegistrations: updatedStats.totalRegistrations }
        });
      },
      
      /**
       * 检查并重置每周限制
       */
      checkAndResetWeeklyLimit: () => {
        // 暂时不实现每周限制功能
      },

      // 绑定临时用户ID到正式账号
      bindTempUserIdToAccount: async (accountId: string) => {
        const { tempUserId } = get();
        const userDataService = UserDataService.getInstance();
        
        try {
          // 保存绑定关系到数据库
          await userDataService.bindTempUserToRealUser(tempUserId, accountId);
          
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
        } catch (error) {
          console.error('绑定临时用户ID失败:', error);
          throw error;
        }
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
        tempUserId: state.tempUserId,
        isTempUserIdBound: state.isTempUserIdBound,
        referrerId: state.referrerId,
      }),
    }
  )
);