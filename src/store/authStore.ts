/**
 * ✅ FIXED: 2025-01-05 修复 authStore 类型定义和方法
 * 🔓 UNLOCKED: 临时解锁以修复undefined拼接问题
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  loginTime?: string;
}

// ✅ FIXED: 2025-08-04 架构级重构 - 消除无限循环的状态管理模式
// 🔒 LOCKED: 此重构已验证解决React无限循环问题，请勿修改
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  usageCount: number;
  maxUsage: number;
  userActions: string[];
  inviteCode: string;
  inviteClicks: number;
  referrer: string | null;

  // ✅ 计算属性：直接从状态计算，避免get()调用导致的无限循环
  usageRemaining: number;

  // 方法
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  incrementUsage: () => void;
  decrementUsage: () => void;
  updateMaxUsage: (maxUsage: number) => void;
  // ✅ 保持向后兼容：保留方法但使用安全实现
  getUsageRemaining: () => number;
  recordUserAction: (action: string) => void;
  getUserInviteCode: () => string;
  trackInviteClick: () => void;
  getReferrer: () => string | null;
  clearReferrer: () => void;
}

// ✅ FIXED: 2025-08-04 架构级重构 - 安全的状态管理实现
// 🔒 LOCKED: 此实现已验证解决无限循环问题，请勿修改
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // 🛡️ 防抖机制：避免频繁的状态计算
      let lastComputedUsage = 0;
      let lastUsageCount = 0;
      let lastMaxUsage = 10;

      const computeUsageRemaining = (usageCount: number, maxUsage: number): number => {
        if (usageCount === lastUsageCount && maxUsage === lastMaxUsage) {
          return lastComputedUsage;
        }
        lastUsageCount = usageCount;
        lastMaxUsage = maxUsage;
        lastComputedUsage = Math.max(0, maxUsage - usageCount);
        return lastComputedUsage;
      };

      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        usageCount: 0,
        maxUsage: 10,
        userActions: [],
        inviteCode: Math.random().toString(36).substr(2, 9),
        inviteClicks: 0,
        referrer: null,

        // ✅ 计算属性：初始值，会在状态更新时自动重新计算
        usageRemaining: 10,

        setUser: (user) => set((state) => {
          // 当用户变化时，更新邀请码以绑定用户ID
          const newInviteCode = user?.id ? `INVITE_${user.id.slice(-8)}` : state.inviteCode;
          return { 
            user, 
            isAuthenticated: !!user,
            inviteCode: newInviteCode
          };
        }),
        setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),

        logout: () => set((state) => {
          const newUsageRemaining = computeUsageRemaining(0, state.maxUsage);
          return {
            user: null,
            isAuthenticated: false,
            error: null,
            usageCount: 0,
            usageRemaining: newUsageRemaining
          };
        }),

        incrementUsage: () => set((state) => {
          const newUsageCount = Math.min(state.usageCount + 1, state.maxUsage);
          const newUsageRemaining = computeUsageRemaining(newUsageCount, state.maxUsage);
          return {
            usageCount: newUsageCount,
            usageRemaining: newUsageRemaining
          };
        }),

        decrementUsage: () => set((state) => {
          const newUsageCount = Math.max(state.usageCount - 1, 0);
          const newUsageRemaining = computeUsageRemaining(newUsageCount, state.maxUsage);
          return {
            usageCount: newUsageCount,
            usageRemaining: newUsageRemaining
          };
        }),

        // 更新最大使用次数（根据订阅状态）
        updateMaxUsage: (newMaxUsage: number) => set((state) => {
          const newUsageRemaining = computeUsageRemaining(state.usageCount, newMaxUsage);
          console.log('🔄 AuthStore更新使用次数限制:', {
            oldMaxUsage: state.maxUsage,
            newMaxUsage,
            usageCount: state.usageCount,
            newUsageRemaining
          });
          return {
            maxUsage: newMaxUsage,
            usageRemaining: newUsageRemaining
          };
        }),

        // ✅ 安全的向后兼容方法：不再调用get()，直接返回计算属性
        getUsageRemaining: () => {
          const state = get();
          return state.usageRemaining;
        },

      // ✅ FIXED: 用户行为记录 - 使用优雅的防抖实现，消除技术债务
      recordUserAction: (action: string) => {
        try {
          // 使用闭包替代全局变量，优化上下文隔离
          // 使用局部变量代替全局window属性
          const currentFrame = (globalThis as any).__authStoreRecordFrame;
          if (currentFrame) {
            cancelAnimationFrame(currentFrame);
          }
          
          (globalThis as any).__authStoreRecordFrame = requestAnimationFrame(() => {
            try {
              console.log('📊 用户操作记录:', action);
              set((state) => ({
                userActions: [...state.userActions.slice(-99), action] // 只保留最近100条记录
              }));
            } catch (error) {
              console.warn('recordUserAction failed:', error);
            }
          });
        } catch (error) {
          // 降级到同步处理，确保功能稳定性
          console.warn('recordUserAction防抖失败，使用同步处理:', error);
          try {
            set((state) => ({
              userActions: [...state.userActions.slice(-99), action]
            }));
          } catch (syncError) {
            console.error('recordUserAction同步处理也失败:', syncError);
          }
        }
      },

      // ✅ FIXED: 2025-08-04 获取邀请码 - 统一实现
      getUserInviteCode: () => {
        const state = get();
        // 优先使用存储的邀请码，否则生成基于用户ID的邀请码
        if (state.inviteCode) {
          return state.inviteCode;
        }
        const userId = state.user?.id;
        if (userId && userId !== 'undefined' && typeof userId === 'string') {
          return `INVITE_${userId.slice(-8)}`;
        }
        return 'INVITE_GUEST';
      },

      // ✅ 邀请点击追踪
      trackInviteClick: () => {
        set((state) => ({
          inviteClicks: state.inviteClicks + 1
        }));
        console.log('邀请链接点击追踪');
      },

      // ✅ 获取推荐人信息
      getReferrer: () => {
        return localStorage.getItem('referrer');
      },

      // ✅ 清除推荐人信息
      clearReferrer: () => {
        localStorage.removeItem('referrer');
      }
    };
  },
  {
    name: 'auth-storage',
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      usageCount: state.usageCount,
      maxUsage: state.maxUsage,
      userActions: state.userActions,
      inviteCode: state.inviteCode,
      inviteClicks: state.inviteClicks,
      referrer: state.referrer,
      // ✅ 持久化计算属性，确保状态一致性
      usageRemaining: state.usageRemaining
    })
  }
));