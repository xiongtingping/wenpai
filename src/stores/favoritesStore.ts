/**
 * 统一收藏系统状态管理
 * 整合所有页面的收藏功能，统一管理收藏内容
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 收藏项目类型
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

// 收藏系统状态接口
export interface FavoritesState {
  favorites: FavoriteItem[];
  totalCount: number;
  lastUpdated: number;
}

// 收藏系统操作接口
export interface FavoritesActions {
  // 添加收藏
  addFavorite: (item: Omit<FavoriteItem, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>) => string;
  
  // 移除收藏
  removeFavorite: (id: string) => void;
  
  // 切换收藏状态
  toggleFavorite: (id: string) => boolean;
  
  // 检查是否已收藏
  isFavorited: (id: string) => boolean;
  
  // 根据类型获取收藏
  getFavoritesByType: (type: FavoriteItemType) => FavoriteItem[];
  
  // 根据来源获取收藏
  getFavoritesBySource: (source: string) => FavoriteItem[];
  
  // 搜索收藏
  searchFavorites: (query: string) => FavoriteItem[];
  
  // 更新收藏项目
  updateFavorite: (id: string, updates: Partial<FavoriteItem>) => void;
  
  // 批量操作
  addMultipleFavorites: (items: Omit<FavoriteItem, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>[]) => string[];
  removeMultipleFavorites: (ids: string[]) => void;
  
  // 导出收藏
  exportFavorites: () => FavoriteItem[];
  
  // 导入收藏
  importFavorites: (items: FavoriteItem[]) => void;
  
  // 清空收藏
  clearFavorites: () => void;
  
  // 获取统计信息
  getStats: () => {
    total: number;
    byType: Record<FavoriteItemType, number>;
    bySource: Record<string, number>;
    recentCount: number;
  };
}

// 初始状态
const initialState: FavoritesState = {
  favorites: [],
  totalCount: 0,
  lastUpdated: 0
};

// 生成唯一ID
const generateId = (): string => {
  return `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 创建收藏系统store
export const useFavoritesStore = create<FavoritesState & FavoritesActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addFavorite: (item) => {
        const id = generateId();
        const now = Date.now();
        const favoriteItem: FavoriteItem = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
          isFavorite: true
        };
        
        set((state) => ({
          favorites: [...state.favorites, favoriteItem],
          totalCount: state.totalCount + 1,
          lastUpdated: now
        }));
        
        return id;
      },
      
      removeFavorite: (id: string) => {
        set((state) => ({
          favorites: state.favorites.filter(item => item.id !== id),
          totalCount: Math.max(0, state.totalCount - 1),
          lastUpdated: Date.now()
        }));
      },
      
      toggleFavorite: (id: string) => {
        const state = get();
        const item = state.favorites.find(fav => fav.id === id);
        
        if (item) {
          // 如果已存在，移除收藏
          get().removeFavorite(id);
          return false;
        } else {
          // 如果不存在，这里需要外部提供完整的item信息
          // 这个方法主要用于已知item存在的情况下切换状态
          return false;
        }
      },
      
      isFavorited: (id: string) => {
        return get().favorites.some(item => item.id === id);
      },
      
      getFavoritesByType: (type: FavoriteItemType) => {
        return get().favorites.filter(item => item.type === type);
      },
      
      getFavoritesBySource: (source: string) => {
        return get().favorites.filter(item => item.source === source);
      },
      
      searchFavorites: (query: string) => {
        const lowerQuery = query.toLowerCase();
        return get().favorites.filter(item => 
          item.title.toLowerCase().includes(lowerQuery) ||
          item.content.toLowerCase().includes(lowerQuery) ||
          item.description?.toLowerCase().includes(lowerQuery) ||
          item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      },
      
      updateFavorite: (id: string, updates: Partial<FavoriteItem>) => {
        set((state) => ({
          favorites: state.favorites.map(item => 
            item.id === id 
              ? { ...item, ...updates, updatedAt: Date.now() }
              : item
          ),
          lastUpdated: Date.now()
        }));
      },
      
      addMultipleFavorites: (items) => {
        const now = Date.now();
        const favoriteItems: FavoriteItem[] = items.map(item => ({
          ...item,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          isFavorite: true
        }));
        
        set((state) => ({
          favorites: [...state.favorites, ...favoriteItems],
          totalCount: state.totalCount + favoriteItems.length,
          lastUpdated: now
        }));
        
        return favoriteItems.map(item => item.id);
      },
      
      removeMultipleFavorites: (ids: string[]) => {
        set((state) => ({
          favorites: state.favorites.filter(item => !ids.includes(item.id)),
          totalCount: Math.max(0, state.totalCount - ids.length),
          lastUpdated: Date.now()
        }));
      },
      
      exportFavorites: () => {
        return get().favorites;
      },
      
      importFavorites: (items: FavoriteItem[]) => {
        const now = Date.now();
        set({
          favorites: items.map(item => ({ ...item, updatedAt: now })),
          totalCount: items.length,
          lastUpdated: now
        });
      },
      
      clearFavorites: () => {
        set({
          favorites: [],
          totalCount: 0,
          lastUpdated: Date.now()
        });
      },
      
      getStats: () => {
        const favorites = get().favorites;
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        
        const byType: Record<FavoriteItemType, number> = {
          'content-generation': 0,
          'creative-cube': 0,
          'history': 0,
          'wechat-template': 0,
          'emoji': 0,
          'hot-topic': 0,
          'brand-asset': 0,
          'library-item': 0
        };
        
        const bySource: Record<string, number> = {};
        let recentCount = 0;
        
        favorites.forEach(item => {
          byType[item.type]++;
          bySource[item.source] = (bySource[item.source] || 0) + 1;
          if (item.createdAt > oneWeekAgo) {
            recentCount++;
          }
        });
        
        return {
          total: favorites.length,
          byType,
          bySource,
          recentCount
        };
      }
    }),
    {
      name: 'favorites-storage',
      // 持久化所有状态
      partialize: (state) => ({
        favorites: state.favorites,
        totalCount: state.totalCount,
        lastUpdated: state.lastUpdated
      })
    }
  )
);

// 收藏系统工具函数
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
