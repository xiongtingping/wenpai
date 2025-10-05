/**
 * 🔄 兼容性层
 * 为旧的状态管理提供兼容接口，确保平滑迁移到统一状态管理
 * 遵循 CLAUDE.md 禁止删除功能的原则
 */

import { useUnifiedStore, useTokenUsageState, useAuthState, useThemeState, useFavoritesState } from './unified-state-store';

// ============================================================================
// 🎯 Token Usage Store 兼容层
// ============================================================================

/**
 * @deprecated 使用 useTokenUsageState 替代
 * 兼容旧的 useTokenUsageStore
 */
export const useTokenUsageStore = () => {
  const tokenState = useTokenUsageState();
  const unifiedStore = useUnifiedStore();

  return {
    // 旧的状态属性
    currentStats: tokenState.currentStats,
    usageHistory: tokenState.usageHistory,
    featureStats: tokenState.featureStats,
    loading: tokenState.loading,
    error: tokenState.error,
    lastUpdated: unifiedStore.lastUpdated,

    // 旧的操作方法
    refreshStats: async (userId: string, userTier: any) => {
      // 兼容性实现
    },

    refreshHistory: async (userId: string, limit?: number) => {
      // 兼容性实现
    },

    refreshFeatureStats: async (userId: string) => {
      // 兼容性实现
    },

    recordUsage: async (record: any) => {
      unifiedStore.addTokenUsage(record);
    },

    checkLimit: async (userId: string, userTier: any, estimatedTokens: number) => {
      throw new Error('checkLimit 需要迁移到服务层');
    },

    clearError: () => {
      unifiedStore.clearError('tokenUsage');
    },

    reset: () => {
      unifiedStore.resetSection('tokenUsage');
    },
  };
};

/**
 * @deprecated 使用 useTokenUsageState 替代
 * 兼容旧的 useTokenUsage Hook
 */
export const useTokenUsage = (userId?: string, userTier?: any) => {
  return useTokenUsageStore();
};

// ============================================================================
// 🎯 Usage Store 兼容层
// ============================================================================

/**
 * @deprecated 使用 useTokenUsageState 替代
 * 兼容旧的 useUsageStore
 */
export const useUsageStore = () => {
  const tokenState = useTokenUsageState();
  const unifiedStore = useUnifiedStore();

  return {
    // 旧的状态属性（模拟）
    records: tokenState.usageHistory,
    dailyUsage: {},
    monthlyUsage: {},
    totalUsage: tokenState.usageHistory.length,
    lastUpdated: Date.now(),

    // 旧的操作方法
    recordUsage: (feature: string, userId = 'anonymous', metadata?: Record<string, any>) => {
      const record = {
        id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        feature,
        totalTokens: 100, // 估算值
        inputTokens: 50,
        outputTokens: 50,
        timestamp: new Date().toISOString(),
        metadata,
      };
      unifiedStore.addTokenUsage(record);
    },

    getTodayUsage: (feature?: string, userId?: string) => {
      return 0;
    },

    getMonthlyUsage: (feature?: string, userId?: string) => {
      return 0;
    },

    getTotalUsage: (feature?: string, userId?: string) => {
      return tokenState.usageHistory.length;
    },

    clearRecords: () => {
      unifiedStore.clearTokenUsage();
    },

    getUsageStats: () => {
      return {
        total: tokenState.usageHistory.length,
        today: 0,
        thisMonth: 0,
        topFeatures: [],
      };
    },
  };
};

// ============================================================================
// 🎯 Auth Store 兼容层
// ============================================================================

/**
 * @deprecated 使用 useAuthState 替代
 * 兼容旧的 useAuthStore
 */
export const useAuthStore = () => {
  const authState = useAuthState();
  const unifiedStore = useUnifiedStore();

  return {
    // 🎯 状态属性（包含会话状态）
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    authStatus: authState.authStatus, // 🎯 新增
    loading: authState.loading,
    error: authState.error,

    // 🎯 会话状态（新增）
    sessionWarning: authState.sessionWarning,
    sessionRemainingTime: authState.sessionRemainingTime,
    sessionExpiresAt: authState.sessionExpiresAt,

    // 🎯 操作方法
    setUser: (user: any) => {
      // 🔧 安全检查：处理null值，避免传递给unified store时出错
      if (user === null || user === undefined) {
        unifiedStore.clearUser();
      } else {
        unifiedStore.setUser(user);
      }
    },

    clearUser: () => {
      unifiedStore.clearUser();
    },

    updateProfile: (profile: any) => {
      unifiedStore.setUser(profile);
    },

    setLoading: (loading: boolean) => {
      unifiedStore.setLoading('auth', loading);
    },

    setError: (error: string | null) => {
      unifiedStore.setError('auth', error);
    },

    // 🎯 会话管理方法（新增）
    setAuthStatus: (status: any) => {
      unifiedStore.setAuthStatus(status);
    },

    setSessionWarning: (warning: boolean) => {
      unifiedStore.setSessionWarning(warning);
    },

    setSessionRemainingTime: (time: number) => {
      unifiedStore.setSessionRemainingTime(time);
    },

    setSessionExpiresAt: (timestamp: number | null) => {
      unifiedStore.setSessionExpiresAt(timestamp);
    },

    extendSession: () => {
      unifiedStore.extendSession();
    },

    // 使用统计相关方法 - 临时兼容实现
    usageCount: 0,
    maxUsage: 10, // 默认值
    usageRemaining: 10,

    decrementUsage: () => {
    },

    updateMaxUsage: (newMaxUsage: number) => {
    },

    // 用户行为记录方法 - 兼容PageTracker组件
    recordUserAction: (action: string, metadata?: Record<string, any>) => {
      try {
        // 简化的行为记录，仅记录到本地存储用于开发和调试
        const actionRecord = {
          action,
          timestamp: new Date().toISOString(),
          metadata: metadata || {},
          userId: authState.user?.id || 'anonymous'
        };

        // 存储到本地用于调试（最多保留100条记录）
        const existingRecords = JSON.parse(localStorage.getItem('wenpai_user_actions') || '[]');
        existingRecords.push(actionRecord);
        if (existingRecords.length > 100) {
          existingRecords.splice(0, existingRecords.length - 100); // 保留最新100条
        }
        localStorage.setItem('wenpai_user_actions', JSON.stringify(existingRecords));

        console.log('📊 userrow为already记录:', action);
      } catch (error) {
        console.error('📊 userrow为记录failed:', error);
      }
    },
  };
};

// ============================================================================
// 🎯 Theme Context 兼容层
// ============================================================================

/**
 * @deprecated 使用 useThemeState 替代
 * 兼容旧的主题上下文
 */
export const useTheme = () => {
  const themeState = useThemeState();
  const unifiedStore = useUnifiedStore();

  return {
    // 旧的状态属性
    theme: themeState.mode,
    primaryColor: themeState.primaryColor,
    fontSize: themeState.fontSize,
    isCompact: themeState.isCompact,

    // 旧的操作方法
    setTheme: (theme: 'light' | 'dark' | 'system') => {
      unifiedStore.setThemeMode(theme);
    },

    setPrimaryColor: (color: string) => {
      unifiedStore.setPrimaryColor(color);
    },

    setFontSize: (size: 'small' | 'medium' | 'large') => {
      unifiedStore.setFontSize(size);
    },

    toggleCompactMode: () => {
      unifiedStore.toggleCompactMode();
    },
  };
};

// ============================================================================
// 🎯 Favorites Store 兼容层
// ============================================================================

/**
 * @deprecated 使用 useFavoritesState 替代
 * 兼容旧的 useFavoritesStore
 */
export const useFavoritesStore = () => {
  const favoritesState = useFavoritesState();
  const unifiedStore = useUnifiedStore();

  return {
    // 旧的状态属性
    items: favoritesState.items,
    tags: favoritesState.tags,
    activeFilter: favoritesState.activeFilter,
    loading: favoritesState.loading,
    error: favoritesState.error,

    // 旧的操作方法
    addFavorite: (item: any) => {
      unifiedStore.addFavorite(item);
    },

    removeFavorite: (id: string) => {
      unifiedStore.removeFavorite(id);
    },

    updateFavorite: (id: string, updates: any) => {
      unifiedStore.updateFavorite(id, updates);
    },

    addTag: (tag: string) => {
      unifiedStore.addTag(tag);
    },

    setActiveFilter: (filter: string | null) => {
      unifiedStore.setActiveFilter(filter);
    },
  };
};

// ============================================================================
// 🎯 Content Sync Store 兼容层
// ============================================================================

/**
 * @deprecated 使用 useContentSyncState 替代
 * 兼容旧的 useContentSyncStore
 */
export const useContentSyncStore = () => {
  const syncState = useUnifiedStore((state) => ({
    ...state.contentSync,
    loading: state.loading.contentSync,
    error: state.error.contentSync,
  }));
  const unifiedStore = useUnifiedStore();

  return {
    // 旧的状态属性
    lastSyncTime: syncState.lastSyncTime,
    pendingChanges: syncState.pendingChanges,
    isSyncing: syncState.issyncing,
    syncErrors: syncState.syncErrors,
    loading: syncState.loading,
    error: syncState.error,
    
    // 内容相关属性 - 临时兼容实现
    selectedTitle: '',
    selectedContent: '',
    selectedTags: [],
    platformId: '',
    lastUpdated: Date.now(),

    // 旧的操作方法
    startSync: () => {
      unifiedStore.startSync();
    },

    completeSync: () => {
      unifiedStore.completeSync();
    },

    failSync: (error: string) => {
      unifiedStore.failSync(error);
    },

    addPendingChange: () => {
      unifiedStore.addPendingChange();
    },

    clearPendingChanges: () => {
      unifiedStore.clearPendingChanges();
    },

    // 获取当前内容方法 - 临时兼容实现
    getCurrentContent: () => {
      return {
        title: '',
        content: '',
        tags: [],
        platformId: ''
      };
    },
  };
};

// ============================================================================
// 🎯 Favorites Utils 兼容层
// ============================================================================

// 收藏项目类型定义
export type FavoriteItemType = 
  | 'content-generation'  // 智能内容生成页面
  | 'creative-cube'       // 九宫格创意魔方
  | 'history'            // 历史记录
  | 'wechat-template'    // 朋友圈模板
  | 'emoji'              // Emoji图片
  | 'hot-topic'          // 热点话题
  | 'brand-asset'        // 品牌资料
  | 'library-item';      // 资料库项目

// 收藏项目接口
export interface FavoriteItem {
  id: string;
  type: FavoriteItemType;
  title: string;
  content: string;
  description?: string;
  tags: string[];
  source: string; // 来源页面或平台
  metadata: Record<string, any>; // 额外的元数据
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
}

/**
 * @deprecated 使用统一状态管理的收藏工具函数替代
 * 兼容旧的 favoritesUtils
 */
export const favoritesUtils = {
  /**
   * 创建收藏项目
   */
  createFavoriteItem: (
    type: FavoriteItemType,
    title: string,
    content: string,
    source: string,
    options?: {
      description?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    }
  ): Omit<FavoriteItem, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'> => {
    return {
      type,
      title,
      content,
      source,
      description: options?.description || '',
      tags: options?.tags || [],
      metadata: options?.metadata || {}
    };
  },
  
  /**
   * 格式化收藏项目用于显示
   */
  formatFavoriteForDisplay: (item: FavoriteItem) => {
    const typeNames: Record<FavoriteItemType, string> = {
      'content-generation': '内容生成',
      'creative-cube': '创意魔方',
      'history': '历史记录',
      'wechat-template': '朋友圈模板',
      'emoji': 'Emoji图片',
      'hot-topic': '热点话题',
      'brand-asset': '品牌资料',
      'library-item': '资料库'
    };
    
    return {
      ...item,
      typeName: typeNames[item.type],
      contentPreview: item.content.length > 100 
        ? item.content.substring(0, 100) + '...' 
        : item.content,
      formattedDate: new Date(item.createdAt).toLocaleDateString('zh-CN')
    };
  },
  
  /**
   * 验证收藏项目
   */
  validateFavoriteItem: (item: Partial<FavoriteItem>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!item.title) {
      errors.push('标题不能为空');
    }
    
    if (!item.content) {
      errors.push('内容不能为空');
    }
    
    if (!item.type) {
      errors.push('类型不能为空');
    }
    
    if (!item.source) {
      errors.push('来源不能为空');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ============================================================================
// 🎯 Content Sync Utils 兼容层
// ============================================================================

/**
 * @deprecated 使用统一状态管理的内容同步工具函数替代
 * 兼容旧的 contentSyncUtils
 */
export const contentSyncUtils = {
  /**
   * 检查内容是否已准备就绪
   */
  isContentReady: (state: any): boolean => {
    return !!(
      state.selectedTitle &&
      state.selectedContent &&
      state.selectedVersion &&
      state.isContentReady
    );
  },
  
  /**
   * 获取内容摘要
   */
  getContentSummary: (state: any): string => {
    const { selectedTitle, selectedContent, selectedTags } = state;
    const contentPreview = selectedContent.length > 50 
      ? selectedContent.substring(0, 50) + '...' 
      : selectedContent;
    
    return `标题: ${selectedTitle}\n内容: ${contentPreview}\n标签: ${selectedTags.join(', ')}`;
  },
  
  /**
   * 验证内容完整性
   */
  validateContent: (state: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!state.selectedTitle) {
      errors.push('未选择标题');
    }
    
    if (!state.selectedContent) {
      errors.push('未选择内容版本');
    }
    
    if (!state.selectedVersion) {
      errors.push('未指定版本');
    }
    
    if (state.selectedTags.length === 0) {
      errors.push('未设置标签');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ============================================================================
// 🎯 导出兼容性接口
// ============================================================================

export {
  // 新的统一状态管理 - 推荐使用
  useUnifiedStore,
  useTokenUsageState,
  useAuthState,
  useThemeState,
  useFavoritesState,
};

// 兼容性层已激活 - 静默运行，避免控制台警告
// TODO: 逐步迁移到统一状态管理系统
// 📚 详细文档: /src/stores/unified-state-store.ts
// 🎯 迁移工具: /src/utils/stateMigrationTool.ts

export default {
  useTokenUsageStore,
  useTokenUsage,
  useUsageStore,
  useAuthStore,
  useTheme,
  useFavoritesStore,
};