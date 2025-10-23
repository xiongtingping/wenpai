/**

 * 🔐 统一认证Store
 *
 * @deprecated 此文件已废弃，请使用 unified-state-store.ts
 *
 * 迁移说明：
 * - 所有功能已迁移到 src/stores/unified-state-store.ts
 * - 使用兼容层 src/stores/compatibility-layer.ts 保持向后兼容
 * - 新代码请直接使用 useUnifiedStore() 或 useAuthState()
 *
 * 迁移指南：docs/STORAGE_MIGRATION_GUIDE.md
 *
 * 架构原则:
 * ✅ 单一真实来源 (SSOT) - Zustand Store作为唯一状态源
 * ✅ 透明加密 - 敏感数据自动加密存储
 * ✅ 类型安全 - 使用统一的类型系统
 * ✅ 简洁清晰 - 移除不必要的抽象层
 *
 * 之前的问题:
 * ❌ 3层状态管理 (Context + Store + SecureService)
 * ❌ 复杂的同步协调器
 * ❌ 类型不一致
 *
 * 现在的方案:
 * ✅ Zustand Store (单一状态源)
 * ✅ 加密中间件 (透明加密)
 * ✅ 统一类型系统
 */

import { createJSONStorage } from 'zustand/middleware';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  UserInfo,
  AuthStatus,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '@/types/auth-types';
import { createSecureStorage, defaultSecureConfig } from './secure-storage-middleware';

// ============================================================================
// 🎯 认证状态接口
// ============================================================================

/**
 * 认证状态
 */
export interface AuthState {
  // 用户信息
  user: UserInfo | null;
  isAuthenticated: boolean;
  authStatus: AuthStatus;

  // 加载和错误状态
  loading: boolean;
  error: string | null;

  // 会话状态
  sessionWarning: boolean;
  sessionRemainingTime: number;
  sessionExpiresAt: number | null;

  // 元数据
  lastUpdated: string;
  version: string;
}

/**
 * 认证操作接口
 */
export interface AuthActions {
  // 核心认证操作
  setUser: (user: UserInfo | null) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<UserInfo>) => void;

  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // 认证状态
  setAuthStatus: (status: AuthStatus) => void;

  // 会话管理
  setSessionWarning: (warning: boolean) => void;
  setSessionRemainingTime: (time: number) => void;
  setSessionExpiresAt: (timestamp: number | null) => void;

  // 工具方法
  reset: () => void;
  updateLastUpdated: () => void;
}

/**
 * 完整的AuthStore类型
 */
export type AuthStore = AuthState & AuthActions;

// ============================================================================
// 🎯 初始状态
// ============================================================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  authStatus: AuthStatus.UNAUTHENTICATED,
  loading: false,
  error: null,
  sessionWarning: false,
  sessionRemainingTime: 0,
  sessionExpiresAt: null,
  lastUpdated: new Date().toISOString(),
  version: '2.0.0' // 新架构版本
};

// ============================================================================
// 🎯 创建AuthStore
// ============================================================================

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // ================================================================
      // 核心认证操作
      // ================================================================

      setUser: (user) => {
        set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
          state.authStatus = user ? AuthStatus.AUTHENTICATED : AuthStatus.UNAUTHENTICATED;
          state.error = null;
          state.lastUpdated = new Date().toISOString();

          // 设置会话过期时间 (24小时)
          if (user) {
            state.sessionExpiresAt = Date.now() + (24 * 60 * 60 * 1000);
          } else {
            state.sessionExpiresAt = null;
            state.sessionWarning = false;
            state.sessionRemainingTime = 0;
          }
        });
      },

      clearUser: () => {
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.authStatus = AuthStatus.UNAUTHENTICATED;
          state.sessionExpiresAt = null;
          state.sessionWarning = false;
          state.sessionRemainingTime = 0;
          state.error = null;
          state.lastUpdated = new Date().toISOString();
        });
      },

      updateUser: (updates) => {
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates);
            state.lastUpdated = new Date().toISOString();
          }
        });
      },

      // ================================================================
      // 状态管理
      // ================================================================

      setLoading: (loading) => {
        set((state) => {
          state.loading = loading;
        });
      },

      setError: (error) => {
        set((state) => {
          state.error = error;
          if (error) {
            state.authStatus = AuthStatus.ERROR;
          }
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      setAuthStatus: (status) => {
        set((state) => {
          state.authStatus = status;
        });
      },

      // ================================================================
      // 会话管理
      // ================================================================

      setSessionWarning: (warning) => {
        set((state) => {
          state.sessionWarning = warning;
        });
      },

      setSessionRemainingTime: (time) => {
        set((state) => {
          state.sessionRemainingTime = time;
        });
      },

      setSessionExpiresAt: (timestamp) => {
        set((state) => {
          state.sessionExpiresAt = timestamp;
        });
      },

      // ================================================================
      // 工具方法
      // ================================================================

      reset: () => {
        set({ ...initialState, lastUpdated: new Date().toISOString() });
      },

      updateLastUpdated: () => {
        set((state) => {
          state.lastUpdated = new Date().toISOString();
        });
      }
    })),
    {
      name: 'wenpai-auth-store-v2',
      storage: createJSONStorage(() => createSecureStorage(defaultSecureConfig)),
      partialize: (state) => ({
        // 只持久化必要的状态
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiresAt: state.sessionExpiresAt,
        lastUpdated: state.lastUpdated,
        version: state.version
      }) as Partial<AuthStore>,
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // 从旧版本迁移
        if (version < 2) {
          console.log('🔄 迁移认证Store到v2架构');
          return {
            ...initialState,
            user: persistedState.user || null,
            isAuthenticated: !!persistedState.user,
            version: '2.0.0'
          };
        }
        return persistedState as AuthState;
      }
    }
  )
);

// ============================================================================
// 🎯 便捷选择器 Hooks
// ============================================================================

/**
 * 获取用户信息
 */
export const useUser = () => useAuthStore((state) => state.user);

/**
 * 获取认证状态
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * 获取加载状态
 */
export const useAuthLoading = () => useAuthStore((state) => state.loading);

/**
 * 获取错误信息
 */
export const useAuthError = () => useAuthStore((state) => state.error);

/**
 * 获取会话状态
 */
export const useSessionStatus = () =>
  useAuthStore((state) => ({
    warning: state.sessionWarning,
    remainingTime: state.sessionRemainingTime,
    expiresAt: state.sessionExpiresAt
  }));

// ============================================================================
// 🎯 导出
// ============================================================================

export default useAuthStore;
