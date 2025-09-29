/**
 * 📚 统一收藏服务
 * 基于统一数据管理器的收藏功能实现
 * 
 * 特性：
 * - 云端持久化存储
 * - 跨设备数据同步
 * - 智能缓存策略
 * - 支持多种收藏类型
 */

import i18n from '@/i18n';
import { globalDataManager } from '@/services/unifiedDataManager';

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

// 收藏统计信息
export interface FavoriteStats {
  total: number;
  byType: Record<FavoriteItemType, number>;
  bySource: Record<string, number>;
  recentCount: number; // 最近7天的收藏数
}

/**
 * 收藏服务类
 */
export class FavoritesService {
  private static instance: FavoritesService;
  private cache: FavoriteItem[] | null = null;
  private lastCacheUpdate: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  static getInstance(): FavoritesService {
    if (!FavoritesService.instance) {
      FavoritesService.instance = new FavoritesService();
    }
    return FavoritesService.instance;
  }

  /**
   * 获取所有收藏
   */
  async getFavorites(forceRefresh = false): Promise<FavoriteItem[]> {
    try {
      // 检查缓存
      if (!forceRefresh && this.cache && this.isCacheValid()) {
        return this.cache;
      }

      // 从统一数据管理器获取
      const favorites = await globalDataManager.getData<FavoriteItem[]>('favorites');
      const result = favorites || [];
      
      // 更新缓存
      this.updateCache(result);
      
      return result;
    } catch (error) {
      console.error('获取收藏失败:', error);
      return this.cache || [];
    }
  }

  /**
   * 添加收藏
   */
  async addFavorite(item: Omit<FavoriteItem, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>): Promise<string> {
    try {
      const favorites = await this.getFavorites();
      
      const id = this.generateId();
      const now = Date.now();
      
      const favoriteItem: FavoriteItem = {
        ...item,
        id,
        createdAt: now,
        updatedAt: now,
        isFavorite: true
      };

      const updatedFavorites = [...favorites, favoriteItem];
      
      // 保存到统一数据管理器
      const success = await globalDataManager.setData('favorites', updatedFavorites);
      
      if (success) {
        this.updateCache(updatedFavorites);
        console.log('✅ 收藏添加成功:', item.title);
        return id;
      } else {
        throw new Error(i18n.t('common.errors.保存收藏失败'));
      }
    } catch (error) {
      console.error('添加收藏失败:', error);
      throw error;
    }
  }

  /**
   * 移除收藏
   */
  async removeFavorite(id: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(item => item.id !== id);
      
      const success = await globalDataManager.setData('favorites', updatedFavorites);
      
      if (success) {
        this.updateCache(updatedFavorites);
        console.log('✅ 收藏移除成功:', id);
        return true;
      } else {
        throw new Error(i18n.t('common.errors.保存收藏失败'));
      }
    } catch (error) {
      console.error('移除收藏失败:', error);
      return false;
    }
  }

  /**
   * 批量添加收藏
   */
  async addMultipleFavorites(items: Omit<FavoriteItem, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>[]): Promise<string[]> {
    try {
      const favorites = await this.getFavorites();
      const now = Date.now();
      
      const newFavorites = items.map(item => ({
        ...item,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now,
        isFavorite: true
      }));

      const updatedFavorites = [...favorites, ...newFavorites];
      
      const success = await globalDataManager.setData('favorites', updatedFavorites);
      
      if (success) {
        this.updateCache(updatedFavorites);
        console.log(`✅ 批量添加收藏成功: ${items.length}项`);
        return newFavorites.map(item => item.id);
      } else {
        throw new Error(i18n.t('common.errors.批量保存收藏失败'));
      }
    } catch (error) {
      console.error('批量添加收藏失败:', error);
      throw error;
    }
  }

  /**
   * 批量移除收藏
   */
  async removeMultipleFavorites(ids: string[]): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(item => !ids.includes(item.id));
      
      const success = await globalDataManager.setData('favorites', updatedFavorites);
      
      if (success) {
        this.updateCache(updatedFavorites);
        console.log(`✅ 批量移除收藏成功: ${ids.length}项`);
        return true;
      } else {
        throw new Error(i18n.t('common.errors.批量保存收藏失败'));
      }
    } catch (error) {
      console.error('批量移除收藏失败:', error);
      return false;
    }
  }

  /**
   * 更新收藏项
   */
  async updateFavorite(id: string, updates: Partial<Omit<FavoriteItem, 'id' | 'createdAt'>>): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const index = favorites.findIndex(item => item.id === id);
      
      if (index === -1) {
        throw new Error(i18n.t('common.errors.收藏项不存在'));
      }

      const updatedItem = {
        ...favorites[index],
        ...updates,
        updatedAt: Date.now()
      };

      const updatedFavorites = [...favorites];
      updatedFavorites[index] = updatedItem;
      
      const success = await globalDataManager.setData('favorites', updatedFavorites);
      
      if (success) {
        this.updateCache(updatedFavorites);
        console.log('✅ 收藏更新成功:', id);
        return true;
      } else {
        throw new Error(i18n.t('common.errors.保存收藏失败'));
      }
    } catch (error) {
      console.error('更新收藏失败:', error);
      return false;
    }
  }

  /**
   * 根据类型获取收藏
   */
  async getFavoritesByType(type: FavoriteItemType): Promise<FavoriteItem[]> {
    const favorites = await this.getFavorites();
    return favorites.filter(item => item.type === type);
  }

  /**
   * 根据来源获取收藏
   */
  async getFavoritesBySource(source: string): Promise<FavoriteItem[]> {
    const favorites = await this.getFavorites();
    return favorites.filter(item => item.source === source);
  }

  /**
   * 搜索收藏
   */
  async searchFavorites(query: string): Promise<FavoriteItem[]> {
    const favorites = await this.getFavorites();
    const lowerQuery = query.toLowerCase();
    
    return favorites.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 检查是否已收藏
   */
  async isFavorited(content: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(item => item.content === content);
  }

  /**
   * 获取收藏统计信息
   */
  async getStats(): Promise<FavoriteStats> {
    const favorites = await this.getFavorites();
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    const stats: FavoriteStats = {
      total: favorites.length,
      byType: {} as Record<FavoriteItemType, number>,
      bySource: {},
      recentCount: favorites.filter(item => item.createdAt > sevenDaysAgo).length
    };

    // 统计按类型分布
    favorites.forEach(item => {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.bySource[item.source] = (stats.bySource[item.source] || 0) + 1;
    });

    return stats;
  }

  /**
   * 导出收藏
   */
  async exportFavorites(): Promise<FavoriteItem[]> {
    return await this.getFavorites();
  }

  /**
   * 导入收藏
   */
  async importFavorites(items: FavoriteItem[]): Promise<boolean> {
    try {
      const success = await globalDataManager.setData('favorites', items);
      
      if (success) {
        this.updateCache(items);
        console.log(`✅ 收藏导入成功: ${items.length}项`);
        return true;
      } else {
        throw new Error(i18n.t('common.errors.导入收藏失败'));
      }
    } catch (error) {
      console.error('导入收藏失败:', error);
      return false;
    }
  }

  /**
   * 清空所有收藏
   */
  async clearFavorites(): Promise<boolean> {
    try {
      const success = await globalDataManager.setData('favorites', []);
      
      if (success) {
        this.updateCache([]);
        console.log('✅ 收藏已清空');
        return true;
      } else {
        throw new Error(i18n.t('common.errors.清空收藏失败'));
      }
    } catch (error) {
      console.error('清空收藏失败:', error);
      return false;
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新缓存
   */
  private updateCache(favorites: FavoriteItem[]): void {
    this.cache = favorites;
    this.lastCacheUpdate = Date.now();
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(): boolean {
    return (Date.now() - this.lastCacheUpdate) < this.CACHE_TTL;
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache = null;
    this.lastCacheUpdate = 0;
  }
}

// 延迟初始化单例实例，避免TDZ错误
let _favoritesServiceInstance: FavoritesService | null = null;

export const favoritesService = {
  // 使用代理模式延迟初始化
  get addFavorite() { return this._getInstance().addFavorite.bind(this._getInstance()); },
  get removeFavorite() { return this._getInstance().removeFavorite.bind(this._getInstance()); },
  get getFavorites() { return this._getInstance().getFavorites.bind(this._getInstance()); },
  get searchFavorites() { return this._getInstance().searchFavorites.bind(this._getInstance()); },
  get isFavorited() { return this._getInstance().isFavorited.bind(this._getInstance()); },
  get getStats() { return this._getInstance().getStats.bind(this._getInstance()); },
  get exportFavorites() { return this._getInstance().exportFavorites.bind(this._getInstance()); },
  get importFavorites() { return this._getInstance().importFavorites.bind(this._getInstance()); },
  get clearFavorites() { return this._getInstance().clearFavorites.bind(this._getInstance()); },
  get clearCache() { return this._getInstance().clearCache.bind(this._getInstance()); },
  
  _getInstance(): FavoritesService {
    if (!_favoritesServiceInstance) {
      _favoritesServiceInstance = FavoritesService.getInstance();
    }
    return _favoritesServiceInstance;
  }
};

/**
 * React Hook: 收藏功能
 */
export function useFavorites() {
  const addToFavorites = (item: Omit<FavoriteItem, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>) => {
    return favoritesService.addFavorite(item);
  };

  const removeFromFavorites = (id: string) => {
    return favoritesService.removeFavorite(id);
  };

  const getFavorites = (forceRefresh = false) => {
    return favoritesService.getFavorites(forceRefresh);
  };

  const searchFavorites = (query: string) => {
    return favoritesService.searchFavorites(query);
  };

  const isFavorited = (content: string) => {
    return favoritesService.isFavorited(content);
  };

  const getStats = () => {
    return favoritesService.getStats();
  };

  const exportFavorites = () => {
    return favoritesService.exportFavorites();
  };

  const importFavorites = (items: FavoriteItem[]) => {
    return favoritesService.importFavorites(items);
  };

  const clearFavorites = () => {
    return favoritesService.clearFavorites();
  };

  return {
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    searchFavorites,
    isFavorited,
    getStats,
    exportFavorites,
    importFavorites,
    clearFavorites
  };
}

export default FavoritesService;