/**
 * ✅ FIXED: 2025-01-05 修复 authStore 类型定义和方法
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  usageCount: number;
  maxUsage: number;
  
  // 方法
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  incrementUsage: () => void;
  decrementUsage: () => void;
  getUsageRemaining: () => number;
  recordUserAction: (action: string) => void;
  getUserInviteCode: () => string;
  trackInviteClick: () => void;
  getReferrer: () => string | null;
  clearReferrer: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      usageCount: 0,
      maxUsage: 10,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        error: null,
        usageCount: 0 
      }),

      incrementUsage: () => set((state) => ({ 
        usageCount: Math.min(state.usageCount + 1, state.maxUsage) 
      })),

      decrementUsage: () => set((state) => ({ 
        usageCount: Math.max(state.usageCount - 1, 0) 
      })),

      getUsageRemaining: () => {
        const state = get();
        return Math.max(0, state.maxUsage - state.usageCount);
      },

      recordUserAction: (action) => {
        console.log('用户操作记录:', action);
        // 这里可以添加实际的用户行为追踪逻辑
      },

      getUserInviteCode: () => {
        const state = get();
        return state.user?.id ? `INVITE_${state.user.id.slice(-8)}` : 'INVITE_GUEST';
      },

      trackInviteClick: () => {
        console.log('邀请链接点击追踪');
        // 这里可以添加实际的邀请追踪逻辑
      },

      getReferrer: () => {
        return localStorage.getItem('referrer');
      },

      clearReferrer: () => {
        localStorage.removeItem('referrer');
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        usageCount: state.usageCount
      })
    }
  )
); 