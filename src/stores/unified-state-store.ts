/**
 * 🎯 统一状态管理系统 - Single Source of Truth (SSOT)
 * 遵循 CLAUDE.md 架构治理规范，实现单一数据源
 * 
 * 架构原则：
 * - 单一数据源 (SSOT)
 * - 类型安全
 * - 性能优化
 * - 持久化支持
 * - 错误处理
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import type { SubscriptionTier } from '@/types/subscription';

// ============================================================================
// 🎯 核心状态接口定义
// ============================================================================

/**
 * 用户信息状态
 */
export interface UserState {
  id: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  nickname: string | null;
  avatar: string | null;
  roles: string[];
  permissions: string[];
  subscription: SubscriptionTier;
  isAuthenticated: boolean;
  loginTime: string | null;
  lastActivity: string | null;
}

/**
 * Token使用状态
 */
export interface TokenUsageState {
  currentStats: {
    userId: string;
    monthlyLimit: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    usagePercentage: number;
    needUpgrade: boolean;
    lastUpdated: string;
  } | null;
  usageHistory: Array<{
    id: string;
    userId: string;
    feature: string;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  featureStats: Record<string, {
    totalTokens: number;
    requestCount: number;
    percentage: number;
  }>;
}

/**
 * 应用主题状态
 */
export interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  isCompact: boolean;
}

/**
 * 应用设置状态
 */
export interface AppSettingsState {
  language: string;
  autoSave: boolean;
  notifications: boolean;
  experimentalFeatures: boolean;
  debugMode: boolean;
}

/**
 * 内容同步状态
 */
export interface ContentSyncState {
  lastSyncTime: string | null;
  pendingChanges: number;
  issyncing: boolean;
  syncErrors: string[];
}

/**
 * 收藏夹状态
 */
export interface FavoritesState {
  items: Array<{
    id: string;
    type: 'content' | 'template' | 'prompt';
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }>;
  tags: string[];
  activeFilter: string | null;
}

/**
 * 加载状态
 */
export interface LoadingState {
  global: boolean;
  auth: boolean;
  tokenUsage: boolean;
  contentSync: boolean;
  favorites: boolean;
}

/**
 * 错误状态
 */
export interface ErrorState {
  global: string | null;
  auth: string | null;
  tokenUsage: string | null;
  contentSync: string | null;
  favorites: string | null;
}

// ============================================================================
// 🎯 统一状态接口
// ============================================================================

export interface UnifiedState {
  // 核心状态
  user: UserState;
  tokenUsage: TokenUsageState;
  theme: ThemeState;
  appSettings: AppSettingsState;
  contentSync: ContentSyncState;
  favorites: FavoritesState;
  
  // 辅助状态
  loading: LoadingState;
  error: ErrorState;
  
  // 元数据
  lastUpdated: string;
  version: string;
}

// ============================================================================
// 🎯 状态操作接口
// ============================================================================

export interface UnifiedActions {
  // 用户状态操作
  setUser: (user: Partial<UserState>) => void;
  updateUserSubscription: (subscription: SubscriptionTier) => void;
  clearUser: () => void;
  updateLastActivity: () => void;
  
  // Token使用操作
  updateTokenStats: (stats: TokenUsageState['currentStats']) => void;
  addTokenUsage: (usage: TokenUsageState['usageHistory'][0]) => void;
  updateFeatureStats: (stats: TokenUsageState['featureStats']) => void;
  clearTokenUsage: () => void;
  
  // 主题操作
  setThemeMode: (mode: ThemeState['mode']) => void;
  setPrimaryColor: (color: string) => void;
  setFontSize: (size: ThemeState['fontSize']) => void;
  toggleCompactMode: () => void;
  
  // 应用设置操作
  updateAppSettings: (settings: Partial<AppSettingsState>) => void;
  setLanguage: (language: string) => void;
  toggleExperimentalFeatures: () => void;
  
  // 内容同步操作
  startSync: () => void;
  completeSync: () => void;
  failSync: (error: string) => void;
  addPendingChange: () => void;
  clearPendingChanges: () => void;
  
  // 收藏夹操作
  addFavorite: (item: FavoritesState['items'][0]) => void;
  removeFavorite: (id: string) => void;
  updateFavorite: (id: string, updates: Partial<FavoritesState['items'][0]>) => void;
  addTag: (tag: string) => void;
  setActiveFilter: (filter: string | null) => void;
  
  // 加载状态操作
  setLoading: (key: keyof LoadingState, loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  
  // 错误状态操作
  setError: (key: keyof ErrorState, error: string | null) => void;
  clearError: (key: keyof ErrorState) => void;
  clearAllErrors: () => void;
  
  // 通用操作
  reset: () => void;
  resetSection: (section: keyof Omit<UnifiedState, 'loading' | 'error' | 'lastUpdated' | 'version'>) => void;
  updateLastUpdated: () => void;
}

// ============================================================================
// 🎯 初始状态定义
// ============================================================================

const initialUserState: UserState = {
  id: null,
  username: null,
  email: null,
  phone: null,
  nickname: null,
  avatar: null,
  roles: [],
  permissions: [],
  subscription: 'free',
  isAuthenticated: false,
  loginTime: null,
  lastActivity: null,
};

const initialTokenUsageState: TokenUsageState = {
  currentStats: null,
  usageHistory: [],
  featureStats: {},
};

const initialThemeState: ThemeState = {
  mode: 'system',
  primaryColor: '#3b82f6',
  fontSize: 'medium',
  isCompact: false,
};

const initialAppSettingsState: AppSettingsState = {
  language: 'zh-CN',
  autoSave: true,
  notifications: true,
  experimentalFeatures: false,
  debugMode: false,
};

const initialContentSyncState: ContentSyncState = {
  lastSyncTime: null,
  pendingChanges: 0,
  issyncing: false,
  syncErrors: [],
};

const initialFavoritesState: FavoritesState = {
  items: [],
  tags: [],
  activeFilter: null,
};

const initialLoadingState: LoadingState = {
  global: false,
  auth: false,
  tokenUsage: false,
  contentSync: false,
  favorites: false,
};

const initialErrorState: ErrorState = {
  global: null,
  auth: null,
  tokenUsage: null,
  contentSync: null,
  favorites: null,
};

const initialState: UnifiedState = {
  user: initialUserState,
  tokenUsage: initialTokenUsageState,
  theme: initialThemeState,
  appSettings: initialAppSettingsState,
  contentSync: initialContentSyncState,
  favorites: initialFavoritesState,
  loading: initialLoadingState,
  error: initialErrorState,
  lastUpdated: new Date().toISOString(),
  version: '1.0.0',
};

// ============================================================================
// 🎯 统一状态管理Store
// ============================================================================

export const useUnifiedStore = create<UnifiedState & UnifiedActions>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,

        // 用户状态操作
        setUser: (userUpdates) => {
          set((state) => {
            // 🔧 安全检查：处理null或undefined的userUpdates
            if (userUpdates && typeof userUpdates === 'object') {
              Object.assign(state.user, userUpdates);
              state.user.isAuthenticated = !!(userUpdates.id);
              if (userUpdates.id) {
                state.user.loginTime = new Date().toISOString();
              }
            } else {
              // 如果userUpdates为null，清除用户状态
              state.user = {
                ...initialState.user,
                isAuthenticated: false
              };
            }
            state.lastUpdated = new Date().toISOString();
          });
        },

        updateUserSubscription: (subscription) => {
          set((state) => {
            state.user.subscription = subscription;
            state.lastUpdated = new Date().toISOString();
          });
        },

        clearUser: () => {
          set((state) => {
            state.user = { ...initialUserState };
            state.tokenUsage = { ...initialTokenUsageState };
            state.lastUpdated = new Date().toISOString();
          });
        },

        updateLastActivity: () => {
          set((state) => {
            state.user.lastActivity = new Date().toISOString();
            state.lastUpdated = new Date().toISOString();
          });
        },

        // Token使用操作
        updateTokenStats: (stats) => {
          set((state) => {
            state.tokenUsage.currentStats = stats;
            state.lastUpdated = new Date().toISOString();
          });
        },

        addTokenUsage: (usage) => {
          set((state) => {
            state.tokenUsage.usageHistory.unshift(usage);
            // 保持最新50条记录
            if (state.tokenUsage.usageHistory.length > 50) {
              state.tokenUsage.usageHistory = state.tokenUsage.usageHistory.slice(0, 50);
            }
            state.lastUpdated = new Date().toISOString();
          });
        },

        updateFeatureStats: (stats) => {
          set((state) => {
            state.tokenUsage.featureStats = stats;
            state.lastUpdated = new Date().toISOString();
          });
        },

        clearTokenUsage: () => {
          set((state) => {
            state.tokenUsage = { ...initialTokenUsageState };
            state.lastUpdated = new Date().toISOString();
          });
        },

        // 主题操作
        setThemeMode: (mode) => {
          set((state) => {
            state.theme.mode = mode;
            state.lastUpdated = new Date().toISOString();
          });
        },

        setPrimaryColor: (color) => {
          set((state) => {
            state.theme.primaryColor = color;
            state.lastUpdated = new Date().toISOString();
          });
        },

        setFontSize: (size) => {
          set((state) => {
            state.theme.fontSize = size;
            state.lastUpdated = new Date().toISOString();
          });
        },

        toggleCompactMode: () => {
          set((state) => {
            state.theme.isCompact = !state.theme.isCompact;
            state.lastUpdated = new Date().toISOString();
          });
        },

        // 应用设置操作
        updateAppSettings: (settings) => {
          set((state) => {
            Object.assign(state.appSettings, settings);
            state.lastUpdated = new Date().toISOString();
          });
        },

        setLanguage: (language) => {
          set((state) => {
            state.appSettings.language = language;
            state.lastUpdated = new Date().toISOString();
          });
        },

        toggleExperimentalFeatures: () => {
          set((state) => {
            state.appSettings.experimentalFeatures = !state.appSettings.experimentalFeatures;
            state.lastUpdated = new Date().toISOString();
          });
        },

        // 内容同步操作
        startSync: () => {
          set((state) => {
            state.contentSync.issyncing = true;
            state.loading.contentSync = true;
            state.error.contentSync = null;
            state.lastUpdated = new Date().toISOString();
          });
        },

        completeSync: () => {
          set((state) => {
            state.contentSync.issyncing = false;
            state.contentSync.lastSyncTime = new Date().toISOString();
            state.contentSync.pendingChanges = 0;
            state.contentSync.syncErrors = [];
            state.loading.contentSync = false;
            state.lastUpdated = new Date().toISOString();
          });
        },

        failSync: (error) => {
          set((state) => {
            state.contentSync.issyncing = false;
            state.contentSync.syncErrors.push(error);
            state.loading.contentSync = false;
            state.error.contentSync = error;
            state.lastUpdated = new Date().toISOString();
          });
        },

        addPendingChange: () => {
          set((state) => {
            state.contentSync.pendingChanges += 1;
            state.lastUpdated = new Date().toISOString();
          });
        },

        clearPendingChanges: () => {
          set((state) => {
            state.contentSync.pendingChanges = 0;
            state.lastUpdated = new Date().toISOString();
          });
        },

        // 收藏夹操作
        addFavorite: (item) => {
          set((state) => {
            state.favorites.items.push(item);
            // 添加新标签
            item.tags.forEach(tag => {
              if (!state.favorites.tags.includes(tag)) {
                state.favorites.tags.push(tag);
              }
            });
            state.lastUpdated = new Date().toISOString();
          });
        },

        removeFavorite: (id) => {
          set((state) => {
            state.favorites.items = state.favorites.items.filter(item => item.id !== id);
            state.lastUpdated = new Date().toISOString();
          });
        },

        updateFavorite: (id, updates) => {
          set((state) => {
            const index = state.favorites.items.findIndex(item => item.id === id);
            if (index !== -1) {
              Object.assign(state.favorites.items[index], updates);
              state.favorites.items[index].updatedAt = new Date().toISOString();
            }
            state.lastUpdated = new Date().toISOString();
          });
        },

        addTag: (tag) => {
          set((state) => {
            if (!state.favorites.tags.includes(tag)) {
              state.favorites.tags.push(tag);
            }
            state.lastUpdated = new Date().toISOString();
          });
        },

        setActiveFilter: (filter) => {
          set((state) => {
            state.favorites.activeFilter = filter;
            state.lastUpdated = new Date().toISOString();
          });
        },

        // 加载状态操作
        setLoading: (key, loading) => {
          set((state) => {
            state.loading[key] = loading;
            state.lastUpdated = new Date().toISOString();
          });
        },

        setGlobalLoading: (loading) => {
          set((state) => {
            state.loading.global = loading;
            state.lastUpdated = new Date().toISOString();
          });
        },

        // 错误状态操作
        setError: (key, error) => {
          set((state) => {
            state.error[key] = error;
            state.lastUpdated = new Date().toISOString();
          });
        },

        clearError: (key) => {
          set((state) => {
            state.error[key] = null;
            state.lastUpdated = new Date().toISOString();
          });
        },

        clearAllErrors: () => {
          set((state) => {
            state.error = { ...initialErrorState };
            state.lastUpdated = new Date().toISOString();
          });
        },

        // 通用操作
        reset: () => {
          set({ ...initialState, lastUpdated: new Date().toISOString() });
        },

        resetSection: (section) => {
          set((state) => {
            switch (section) {
              case 'user':
                state.user = { ...initialUserState };
                break;
              case 'tokenUsage':
                state.tokenUsage = { ...initialTokenUsageState };
                break;
              case 'theme':
                state.theme = { ...initialThemeState };
                break;
              case 'appSettings':
                state.appSettings = { ...initialAppSettingsState };
                break;
              case 'contentSync':
                state.contentSync = { ...initialContentSyncState };
                break;
              case 'favorites':
                state.favorites = { ...initialFavoritesState };
                break;
            }
            state.lastUpdated = new Date().toISOString();
          });
        },

        updateLastUpdated: () => {
          set((state) => {
            state.lastUpdated = new Date().toISOString();
          });
        },
      })),
      {
        name: 'wenpai-unified-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // 持久化核心状态，排除临时状态
          user: {
            ...state.user,
            lastActivity: null, // 不持久化活动时间
          },
          tokenUsage: {
            ...state.tokenUsage,
            usageHistory: state.tokenUsage.usageHistory.slice(0, 20), // 只保存20条历史
          },
          theme: state.theme,
          appSettings: state.appSettings,
          favorites: state.favorites,
          lastUpdated: state.lastUpdated,
          version: state.version,
        }),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          // 数据迁移逻辑
          if (version === 0) {
            // 从旧版本迁移
            return {
              ...initialState,
              ...persistedState,
              version: '1.0.0',
            };
          }
          return persistedState;
        },
      }
    )
  )
);

// ============================================================================
// 🎯 便捷选择器Hook
// ============================================================================

/**
 * 用户状态选择器
 */
export const useUserState = () => {
  return useUnifiedStore((state) => state.user);
};

/**
 * 认证状态选择器
 */
export const useAuthState = () => {
  return useUnifiedStore((state) => ({
    isAuthenticated: state.user.isAuthenticated,
    user: state.user,
    loading: state.loading.auth,
    error: state.error.auth,
  }));
};

/**
 * Token使用状态选择器
 */
export const useTokenUsageState = () => {
  return useUnifiedStore((state) => ({
    ...state.tokenUsage,
    loading: state.loading.tokenUsage,
    error: state.error.tokenUsage,
  }));
};

/**
 * 主题状态选择器
 */
export const useThemeState = () => {
  return useUnifiedStore((state) => state.theme);
};

/**
 * 应用设置状态选择器
 */
export const useAppSettingsState = () => {
  return useUnifiedStore((state) => state.appSettings);
};

/**
 * 收藏夹状态选择器
 */
export const useFavoritesState = () => {
  return useUnifiedStore((state) => ({
    ...state.favorites,
    loading: state.loading.favorites,
    error: state.error.favorites,
  }));
};

/**
 * 内容同步状态选择器
 */
export const useContentSyncState = () => {
  return useUnifiedStore((state) => ({
    ...state.contentSync,
    loading: state.loading.contentSync,
    error: state.error.contentSync,
  }));
};

/**
 * 加载状态选择器
 */
export const useLoadingState = () => {
  return useUnifiedStore((state) => state.loading);
};

/**
 * 错误状态选择器
 */
export const useErrorState = () => {
  return useUnifiedStore((state) => state.error);
};

// ============================================================================
// 🎯 默认导出
// ============================================================================

export default useUnifiedStore;