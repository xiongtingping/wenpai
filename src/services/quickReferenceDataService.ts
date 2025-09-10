/**
 * 快速引用数据服务
 * 统一管理品牌库、资料库、雷达收藏的数据获取
 */

import { globalDataManager } from '@/services/unifiedDataManager';
import { bookmarkService } from '@/services/bookmarkService';
import { favoritesService } from '@/services/favoritesService';

export interface QuickReferenceItem {
  id: string;
  title: string;
  content: string;
  type: 'brand' | 'library' | 'radar';
  format: 'text' | 'link' | 'image' | 'pdf';
  source?: string;
  tags: string[];
  createdAt: string;
  summary?: string;
  metadata?: Record<string, any>;
}

export interface QuickReferenceDataService {
  getBrandItems(): Promise<QuickReferenceItem[]>;
  getLibraryItems(): Promise<QuickReferenceItem[]>;
  getRadarItems(): Promise<QuickReferenceItem[]>;
  searchItems(query: string, type?: 'brand' | 'library' | 'radar'): Promise<QuickReferenceItem[]>;
}

class QuickReferenceDataServiceImpl implements QuickReferenceDataService {
  private cache = new Map<string, { data: QuickReferenceItem[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  /**
   * 获取品牌库内容
   */
  async getBrandItems(): Promise<QuickReferenceItem[]> {
    const cacheKey = 'brand-items';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // 从品牌资产数据获取
      const brandAssets = await globalDataManager.getData<any[]>('brand_assets') || [];
      
      const items: QuickReferenceItem[] = brandAssets.map(asset => ({
        id: asset.id || `brand-${Date.now()}-${Math.random()}`,
        title: asset.name || asset.title || '未命名品牌资产',
        content: asset.description || asset.content || '',
        type: 'brand' as const,
        format: this.detectFormat(asset),
        source: '品牌库',
        tags: asset.tags || [],
        createdAt: asset.createdAt || new Date().toISOString(),
        summary: asset.summary || this.generateSummary(asset.description || asset.content || ''),
        metadata: {
          assetType: asset.type,
          category: asset.category
        }
      }));

      // 缓存结果
      this.cache.set(cacheKey, { data: items, timestamp: Date.now() });
      
      return items;
    } catch (error) {
      console.error('获取品牌库内容失败:', error);
      return [];
    }
  }

  /**
   * 获取资料库内容
   */
  async getLibraryItems(): Promise<QuickReferenceItem[]> {
    const cacheKey = 'library-items';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // 从收藏服务获取资料库类型的收藏
      const favorites = await favoritesService.getFavorites();
      const libraryFavorites = favorites.filter(fav => 
        fav.type === 'library-item' || fav.type === 'brand-asset'
      );
      
      const items: QuickReferenceItem[] = libraryFavorites.map(fav => ({
        id: fav.id,
        title: fav.title,
        content: fav.content,
        type: 'library' as const,
        format: this.detectFormatFromContent(fav.content),
        source: fav.source || '我的资料库',
        tags: fav.tags,
        createdAt: new Date(fav.createdAt).toISOString(),
        summary: fav.description || this.generateSummary(fav.content),
        metadata: fav.metadata
      }));

      // 缓存结果
      this.cache.set(cacheKey, { data: items, timestamp: Date.now() });
      
      return items;
    } catch (error) {
      console.error('获取资料库内容失败:', error);
      return [];
    }
  }

  /**
   * 获取雷达收藏内容
   */
  async getRadarItems(): Promise<QuickReferenceItem[]> {
    const cacheKey = 'radar-items';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      // 从书签服务获取热点话题书签
      const topicBookmarks = await bookmarkService.getTopicBookmarks();
      
      const items: QuickReferenceItem[] = topicBookmarks.map(bookmark => ({
        id: bookmark.id,
        title: bookmark.title,
        content: bookmark.content || bookmark.description || '',
        type: 'radar' as const,
        format: bookmark.url ? 'link' : 'text',
        source: bookmark.platform || '全网雷达',
        tags: bookmark.tags || [],
        createdAt: new Date(bookmark.timestamp).toISOString(),
        summary: this.generateSummary(bookmark.content || bookmark.description || ''),
        metadata: {
          url: bookmark.url,
          platform: bookmark.platform,
          category: bookmark.category
        }
      }));

      // 缓存结果
      this.cache.set(cacheKey, { data: items, timestamp: Date.now() });
      
      return items;
    } catch (error) {
      console.error('获取雷达收藏内容失败:', error);
      return [];
    }
  }

  /**
   * 搜索内容
   */
  async searchItems(query: string, type?: 'brand' | 'library' | 'radar'): Promise<QuickReferenceItem[]> {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    let allItems: QuickReferenceItem[] = [];

    // 根据类型获取数据
    if (!type || type === 'brand') {
      const brandItems = await this.getBrandItems();
      allItems.push(...brandItems);
    }
    
    if (!type || type === 'library') {
      const libraryItems = await this.getLibraryItems();
      allItems.push(...libraryItems);
    }
    
    if (!type || type === 'radar') {
      const radarItems = await this.getRadarItems();
      allItems.push(...radarItems);
    }

    // 执行搜索
    return allItems.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      (item.summary && item.summary.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * 检测资产格式
   */
  private detectFormat(asset: any): 'text' | 'link' | 'image' | 'pdf' {
    if (asset.url) return 'link';
    if (asset.type === 'image' || asset.format === 'image') return 'image';
    if (asset.type === 'pdf' || asset.format === 'pdf') return 'pdf';
    return 'text';
  }

  /**
   * 从内容检测格式
   */
  private detectFormatFromContent(content: string): 'text' | 'link' | 'image' | 'pdf' {
    if (content.startsWith('http')) return 'link';
    if (content.includes('.jpg') || content.includes('.png') || content.includes('.gif')) return 'image';
    if (content.includes('.pdf')) return 'pdf';
    return 'text';
  }

  /**
   * 生成内容摘要
   */
  private generateSummary(content: string): string {
    if (!content) return '';
    const maxLength = 100;
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...'
      : content;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 刷新指定类型的数据
   */
  async refreshData(type: 'brand' | 'library' | 'radar'): Promise<void> {
    const cacheKey = `${type}-items`;
    this.cache.delete(cacheKey);
    
    // 重新获取数据
    switch (type) {
      case 'brand':
        await this.getBrandItems();
        break;
      case 'library':
        await this.getLibraryItems();
        break;
      case 'radar':
        await this.getRadarItems();
        break;
    }
  }
}

// 导出单例实例
export const quickReferenceDataService = new QuickReferenceDataServiceImpl();
