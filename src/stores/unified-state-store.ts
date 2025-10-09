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
// 🎯 认证状态枚举
// ============================================================================

/**
 * 认证状态枚举
 * 🎯 从 auth-store.ts 迁移
 */
export enum AuthStatus {
  UNAUTHENTICATED = 'unauthenticated',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error'
}

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
  authStatus: AuthStatus; // 🎯 新增：认证状态
  loginTime: string | null;
  lastActivity: string | null;
  _lastFetchTime?: number; // 🎯 新增：数据获取时间戳（用于TTL验证）
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
 * 使用次数统计状态
 * 🎯 新增: 统一管理使用次数，避免多层缓存
 */
export interface UsageCountState {
  used: number;
  available: number;
  remaining: number;
  percentage: number;
  userTier: SubscriptionTier;
  lastUpdated: string;
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

/**
 * 存储配额状态
 */
export interface StorageQuotaState {
  used: number;
  total: number;
  usagePercent: number;
  remaining: number;
  itemCount: number;
  largestItems: Array<{ key: string; size: number }>;
  lastChecked: string | null;
  isWarning: boolean;  // 超过80%警告
  isCritical: boolean; // 超过90%严重警告
}

/**
 * 会话管理状态
 * 🎯 从 auth-store.ts 迁移
 */
export interface SessionState {
  sessionWarning: boolean;
  sessionRemainingTime: number;
  sessionExpiresAt: number | null;
}

// ============================================================================
// 🎯 统一状态接口
// ============================================================================

export interface UnifiedState {
  // 核心状态
  user: UserState;
  session: SessionState; // 🎯 新增：会话管理
  tokenUsage: TokenUsageState;
  usageCount: UsageCountState; // 🎯 新增: 使用次数统计
  theme: ThemeState;
  appSettings: AppSettingsState;
  contentSync: ContentSyncState;
  favorites: FavoritesState;
  storageQuota: StorageQuotaState;

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
  setAuthStatus: (status: AuthStatus) => void; // 🎯 新增：设置认证状态

  // 🎯 会话管理操作 (从 auth-store.ts 迁移)
  setSessionWarning: (warning: boolean) => void;
  setSessionRemainingTime: (time: number) => void;
  setSessionExpiresAt: (timestamp: number | null) => void;
  extendSession: () => void;

  // Token使用操作
  updateTokenStats: (stats: TokenUsageState['currentStats']) => void;
  addTokenUsage: (usage: TokenUsageState['usageHistory'][0]) => void;
  updateFeatureStats: (stats: TokenUsageState['featureStats']) => void;
  clearTokenUsage: () => void;

  // 🎯 使用次数操作 (新增)
  updateUsageCount: (stats: Partial<UsageCountState>) => void;
  consumeUsage: (amount: number) => Promise<boolean>;
  refreshUsageStats: () => Promise<void>;
  initializeUsageStats: (userId: string, userTier: SubscriptionTier) => Promise<void>;
  
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

  // 存储配额操作
  updateStorageQuota: (quota: Partial<StorageQuotaState>) => void;
  checkStorageQuota: () => void;

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
  subscription: 'trial' as SubscriptionTier, // 🎯 修复：使用正确的类型
  isAuthenticated: false,
  authStatus: AuthStatus.UNAUTHENTICATED, // 🎯 新增
  loginTime: null,
  lastActivity: null,
};

// 🎯 新增: 会话管理初始状态
const initialSessionState: SessionState = {
  sessionWarning: false,
  sessionRemainingTime: 0,
  sessionExpiresAt: null,
};

const initialTokenUsageState: TokenUsageState = {
  currentStats: null,
  usageHistory: [],
  featureStats: {},
};

// 🎯 新增: 使用次数初始状态
const initialUsageCountState: UsageCountState = {
  used: 0,
  available: 10, // trial默认
  remaining: 10,
  percentage: 0,
  userTier: 'trial',
  lastUpdated: new Date().toISOString(),
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

const initialStorageQuotaState: StorageQuotaState = {
  used: 0,
  total: 10 * 1024 * 1024, // 10MB估算值
  usagePercent: 0,
  remaining: 10 * 1024 * 1024,
  itemCount: 0,
  largestItems: [],
  lastChecked: null,
  isWarning: false,
  isCritical: false,
};

const initialState: UnifiedState = {
  user: initialUserState,
  session: initialSessionState, // 🎯 新增
  tokenUsage: initialTokenUsageState,
  usageCount: initialUsageCountState, // 🎯 新增
  theme: initialThemeState,
  appSettings: initialAppSettingsState,
  contentSync: initialContentSyncState,
  favorites: initialFavoritesState,
  storageQuota: initialStorageQuotaState,
  loading: initialLoadingState,
  error: initialErrorState,
  lastUpdated: new Date().toISOString(),
  version: '2.0.0', // 🎯 升级版本号
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
                // 🎯 更新数据获取时间戳
                state.user._lastFetchTime = Date.now();
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
            state.session = { ...initialSessionState }; // 🎯 同时清除会话状态
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

        setAuthStatus: (status) => {
          set((state) => {
            state.user.authStatus = status;
            state.lastUpdated = new Date().toISOString();
          });
        },

        // 🎯 会话管理操作 (从 auth-store.ts 迁移)
        setSessionWarning: (warning) => {
          set((state) => {
            state.session.sessionWarning = warning;
            state.lastUpdated = new Date().toISOString();
          });
        },

        setSessionRemainingTime: (time) => {
          set((state) => {
            state.session.sessionRemainingTime = time;
            state.lastUpdated = new Date().toISOString();
          });
        },

        setSessionExpiresAt: (timestamp) => {
          set((state) => {
            state.session.sessionExpiresAt = timestamp;
            // 设置会话时自动更新用户状态
            if (timestamp) {
              state.user.authStatus = AuthStatus.AUTHENTICATED;
            }
            state.lastUpdated = new Date().toISOString();
          });
        },

        extendSession: () => {
          set((state) => {
            // 延长会话24小时
            state.session.sessionExpiresAt = Date.now() + (24 * 60 * 60 * 1000);
            state.session.sessionWarning = false;
            state.session.sessionRemainingTime = 24 * 60 * 60;
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

        // 🎯 使用次数操作实现 (新增)
        updateUsageCount: (stats) => {
          set((state) => {
            state.usageCount = { ...state.usageCount, ...stats };
            state.lastUpdated = new Date().toISOString();
          });
        },

        consumeUsage: async (amount: number = 1) => {
          const { usageCount, user } = get();
          const userId = user.id;
          const userTier = user.subscription;

          if (!userId) {
            console.error('❌ 用户未登录，无法扣减使用次数');
            return false;
          }

          // 🎯 乐观更新: 立即更新UI
          const newUsed = usageCount.used + amount;
          const newRemaining = usageCount.available === -1 ? -1 : Math.max(0, usageCount.available - newUsed);
          const newPercentage = usageCount.available === -1 ? 0 : (newUsed / usageCount.available) * 100;

          set((state) => {
            state.usageCount.used = newUsed;
            state.usageCount.remaining = newRemaining;
            state.usageCount.percentage = newPercentage;
            state.usageCount.lastUpdated = new Date().toISOString();
            state.lastUpdated = new Date().toISOString();
          });

          try {
            // 🎯 异步同步到Supabase
            const { unifiedUsageDataManager } = await import('@/services/unifiedUsageDataManager');
            const success = await unifiedUsageDataManager.consumeUsageCount(userId, userTier, amount);

            if (!success) {
              // 🎯 失败回滚
              set((state) => {
                state.usageCount.used = usageCount.used;
                state.usageCount.remaining = usageCount.remaining;
                state.usageCount.percentage = usageCount.percentage;
              });
              return false;
            }

            return true;
          } catch (error) {
            console.error('❌ 扣减使用次数失败:', error);
            // 🎯 错误回滚
            set((state) => {
              state.usageCount.used = usageCount.used;
              state.usageCount.remaining = usageCount.remaining;
              state.usageCount.percentage = usageCount.percentage;
            });
            return false;
          }
        },

        refreshUsageStats: async () => {
          const { user } = get();
          const userId = user.id;
          const userTier = user.subscription;

          if (!userId) return;

          set((state) => {
            state.loading.tokenUsage = true;
          });

          try {
            const { unifiedUsageDataManager } = await import('@/services/unifiedUsageDataManager');

            // 🔧 FIX: 同时刷新使用次数和Token统计
            const [usageCountStats, tokenStats] = await Promise.all([
              unifiedUsageDataManager.getUserUsageCountStats(userId, userTier),
              unifiedUsageDataManager.getTokenUsageStats(userId, userTier)
            ]);

            console.log('🔄 刷新统计数据:', { usageCountStats, tokenStats });

            set((state) => {
              // 更新使用次数统计
              state.usageCount = {
                used: usageCountStats.usedCount,
                available: usageCountStats.availableUses,
                remaining: usageCountStats.remainingUses,
                percentage: usageCountStats.usagePercentage,
                userTier,
                lastUpdated: usageCountStats.lastUpdated
              };

              // 🔧 FIX: 更新Token统计
              if (tokenStats) {
                state.tokenUsage.currentStats = tokenStats;
              }

              state.loading.tokenUsage = false;
              state.lastUpdated = new Date().toISOString();
            });

            console.log('✅ 统计数据刷新完成');
          } catch (error) {
            console.error('❌ 刷新使用统计失败:', error);
            set((state) => {
              state.loading.tokenUsage = false;
              state.error.tokenUsage = error instanceof Error ? error.message : '刷新失败';
            });
          }
        },

        initializeUsageStats: async (userId: string, userTier: SubscriptionTier) => {
          console.log('🔄 Store.initializeUsageStats 开始:', { userId, userTier });

          set((state) => {
            state.loading.tokenUsage = true;
          });

          try {
            const { unifiedUsageDataManager } = await import('@/services/unifiedUsageDataManager');
            await unifiedUsageDataManager.initializeUser(userId);

            // 🔧 FIX: 同时获取使用次数和Token统计
            const [usageCountStats, tokenStats] = await Promise.all([
              unifiedUsageDataManager.getUserUsageCountStats(userId, userTier),
              unifiedUsageDataManager.getTokenUsageStats(userId, userTier)
            ]);

            console.log('✅ Store 获取到统计数据:', { usageCountStats, tokenStats });

            // 🎯 强制更新，覆盖持久化的旧值
            set((state) => {
              // 更新使用次数统计
              state.usageCount = {
                used: usageCountStats.usedCount,
                available: usageCountStats.availableUses,
                remaining: usageCountStats.remainingUses,
                percentage: usageCountStats.usagePercentage,
                userTier,
                lastUpdated: usageCountStats.lastUpdated
              };

              // 🔧 FIX: 更新Token统计（之前缺失）
              if (tokenStats) {
                state.tokenUsage.currentStats = tokenStats;
                console.log('✅ Token统计已初始化:', tokenStats);
              } else {
                console.warn('⚠️ Token统计为null，使用默认值');
              }

              state.loading.tokenUsage = false;
              state.lastUpdated = new Date().toISOString();
            });

            console.log('✅ Store初始化完成:', {
              usageCount: get().usageCount,
              tokenStats: get().tokenUsage.currentStats
            });
          } catch (error) {
            console.error('❌ 初始化使用统计失败:', error);
            set((state) => {
              state.loading.tokenUsage = false;
              state.error.tokenUsage = error instanceof Error ? error.message : '初始化失败';
            });
          }
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

        // 存储配额操作
        updateStorageQuota: (quota) => {
          set((state) => {
            Object.assign(state.storageQuota, quota);
            state.storageQuota.lastChecked = new Date().toISOString();
            // 自动判断警告状态
            state.storageQuota.isWarning = state.storageQuota.usagePercent >= 80;
            state.storageQuota.isCritical = state.storageQuota.usagePercent >= 90;
            state.lastUpdated = new Date().toISOString();
          });
        },

        checkStorageQuota: () => {
          set((state) => {
            // 动态导入避免循环依赖
            import('@/utils/storageQuotaMonitor').then(({ storageQuotaMonitor }) => {
              const quotaInfo = storageQuotaMonitor.getQuotaInfo();
              const unifiedStore = useUnifiedStore.getState();
              unifiedStore.updateStorageQuota(quotaInfo);
            }).catch(error => {
              console.error('检查存储配额失败:', error);
            });
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
              case 'session': // 🎯 新增
                state.session = { ...initialSessionState };
                break;
              case 'tokenUsage':
                state.tokenUsage = { ...initialTokenUsageState };
                break;
              case 'usageCount':
                state.usageCount = { ...initialUsageCountState };
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
              case 'storageQuota':
                state.storageQuota = { ...initialStorageQuotaState };
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
          // 🎯 优化后的存储策略：
          // ✅ 保存：UI偏好、用户身份标识
          // ❌ 不保存：运行时状态、敏感信息、业务数据

          user: {
            // ✅ 基础身份信息（带TTL验证）
            id: state.user.id,
            username: state.user.username,
            nickname: state.user.nickname,
            avatar: state.user.avatar,
            roles: state.user.roles,
            permissions: state.user.permissions,
            isAuthenticated: state.user.isAuthenticated,
            authStatus: state.user.authStatus,
            loginTime: state.user.loginTime,

            // ❌ 不持久化敏感信息（安全考虑）
            email: null,
            phone: null,

            // ❌ 不持久化运行时状态
            lastActivity: null,

            // ❌ 不持久化订阅状态（必须从 Supabase 查询）
            subscription: 'trial' as SubscriptionTier,

            // 🔧 添加数据获取时间戳（用于TTL验证）
            _lastFetchTime: Date.now(),
          },

          // ❌ 不持久化会话状态（运行时状态，每次重新计算）
          // session: state.session,

          // ❌ 不持久化业务数据（必须从 Supabase 查询）
          // tokenUsage: state.tokenUsage,
          // usageCount: state.usageCount,
          // favorites: state.favorites,
          // contentSync: state.contentSync,

          // ✅ 持久化 UI 偏好设置
          theme: state.theme,
          appSettings: state.appSettings,

          // 元数据
          lastUpdated: state.lastUpdated,
          version: state.version,
        }),
        version: 3, // 🎯 升级到 v3：优化存储策略
        migrate: (persistedState: any, version: number) => {
          console.log(`🔄 检测到 unified-store 版本: v${version}，当前版本: v3`);

          // 从 v0/v1 迁移到 v2
          if (version === 0 || version === 1) {
            console.log('🔄 迁移 v0/v1 → v2：添加会话状态');
            persistedState = {
              ...initialState,
              ...persistedState,
              session: persistedState.session || initialSessionState,
              version: '2.0.0',
            };
          }

          // 从 v2 迁移到 v3
          if (version < 3) {
            console.log('🔄 迁移 v2 → v3：优化存储策略');

            // 清理不应该持久化的数据
            const migratedState = {
              ...persistedState,

              // 清理用户敏感信息
              user: {
                ...persistedState.user,
                email: null,
                phone: null,
                subscription: 'trial' as SubscriptionTier,
                lastActivity: null,
                _lastFetchTime: Date.now(), // 添加时间戳
              },

              // 清理会话状态
              session: { ...initialSessionState },

              // 清理业务数据
              tokenUsage: { ...initialTokenUsageState },
              usageCount: { ...initialUsageCountState },
              favorites: { ...initialFavoritesState },
              contentSync: { ...initialContentSyncState },

              // 清理运行时状态
              loading: { ...initialLoadingState },
              error: { ...initialErrorState },

              version: '3.0.0',
            };

            console.log('✅ 迁移完成：v3 优化存储策略已应用');
            return migratedState;
          }

          return persistedState;
        },
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.error('❌ unified-store 恢复失败:', error);
              return;
            }

            if (!state) return;

            console.log('🔄 从 localStorage 恢复数据...');

            // 📊 监控存储大小
            const stateSize = JSON.stringify(state).length;
            const sizeMB = (stateSize / 1024 / 1024).toFixed(2);
            console.log(`📦 localStorage 使用量: ${sizeMB} MB`);

            if (stateSize > 5 * 1024 * 1024) { // 5MB
              console.warn('⚠️ localStorage 使用量过大，建议清理');
            }

            // ⏰ TTL 验证：检查用户信息是否过期
            const TTL = 24 * 60 * 60 * 1000; // 24小时
            const lastFetchTime = (state.user as any)._lastFetchTime || 0;
            const isExpired = Date.now() - lastFetchTime > TTL;

            if (isExpired) {
              console.log('⏰ 用户信息已过期（超过24小时），将从 Supabase 重新查询');
              // 保留基础身份信息，清除其他可能过期的数据
              state.user = {
                ...initialUserState,
                id: state.user.id,
                isAuthenticated: state.user.isAuthenticated,
              };
            } else {
              console.log(`✅ 用户信息有效（${Math.floor((Date.now() - lastFetchTime) / 1000 / 60 / 60)}小时前获取）`);
            }

            // 🚫 强制重置必须从云端查询的数据
            state.user.subscription = 'trial'; // 订阅状态
            state.user.email = null; // 敏感信息
            state.user.phone = null; // 敏感信息
            state.user.lastActivity = null; // 运行时状态

            // 🚫 强制重置业务数据
            state.tokenUsage = { ...initialTokenUsageState };
            state.usageCount = { ...initialUsageCountState };
            state.favorites = { ...initialFavoritesState };
            state.contentSync = { ...initialContentSyncState };

            // 🚫 强制重置会话状态（运行时状态）
            state.session = { ...initialSessionState };

            // 🚫 强制重置运行时状态
            state.loading = { ...initialLoadingState };
            state.error = { ...initialErrorState };

            console.log('✅ unified-store 恢复完成，云端数据已重置');
          };
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
 * 🎯 扩展：包含会话状态
 */
export const useAuthState = () => {
  return useUnifiedStore((state) => ({
    isAuthenticated: state.user.isAuthenticated,
    authStatus: state.user.authStatus,
    user: state.user,
    loading: state.loading.auth,
    error: state.error.auth,
    // 🎯 新增：会话状态
    sessionWarning: state.session.sessionWarning,
    sessionRemainingTime: state.session.sessionRemainingTime,
    sessionExpiresAt: state.session.sessionExpiresAt,
  }));
};

/**
 * 会话状态选择器
 * 🎯 新增
 */
export const useSessionState = () => {
  return useUnifiedStore((state) => state.session);
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

/**
 * 存储配额状态选择器
 */
export const useStorageQuotaState = () => {
  return useUnifiedStore((state) => state.storageQuota);
};

// ============================================================================
// 🎯 默认导出
// ============================================================================

export default useUnifiedStore;