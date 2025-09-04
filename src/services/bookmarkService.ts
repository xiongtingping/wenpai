/**
 * 🔖 统一书签服务
 * 基于统一数据管理器的书签功能实现
 * 
 * 功能：
 * - 话题书签管理
 * - 内容书签管理  
 * - 云端持久化存储
 * - 跨设备数据同步
 */

import { globalDataManager } from '@/services/unifiedDataManager';

// 书签类型
export type BookmarkType = 
  | 'hot-topic'      // 热点话题
  | 'library-item'   // 资料库项目
  | 'content'        // 生成内容
  | 'template'       // 模板
  | 'emoji'          // 表情
  | 'creative-idea'; // 创意想法

// 书签项目接口
export interface BookmarkItem {
  id: string;
  type: BookmarkType;
  title: string;
  content: string;
  description?: string;
  url?: string;
  tags: string[];
  source: string;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  isBookmarked: boolean;
}

// 热点话题书签接口（兼容现有代码）
export interface TopicBookmark {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  url?: string;
  createdAt: number;
}

/**
 * 书签服务类
 */
export class BookmarkService {
  private static instance: BookmarkService;
  private cache: BookmarkItem[] | null = null;
  private topicCache: TopicBookmark[] | null = null;
  private lastCacheUpdate: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  static getInstance(): BookmarkService {
    if (!BookmarkService.instance) {
      BookmarkService.instance = new BookmarkService();
    }
    return BookmarkService.instance;
  }

  /**
   * 获取所有书签
   */
  async getBookmarks(forceRefresh = false): Promise<BookmarkItem[]> {
    try {
      if (!forceRefresh && this.cache && this.isCacheValid()) {
        return this.cache;
      }

      const bookmarks = await globalDataManager.getData<BookmarkItem[]>('bookmarkedTopics');
      const result = bookmarks || [];
      
      this.updateCache(result);
      return result;
    } catch (error) {
      console.error('获取书签失败:', error);
      return this.cache || [];
    }
  }

  /**
   * 获取热点话题书签（向后兼容）
   */
  async getTopicBookmarks(forceRefresh = false): Promise<TopicBookmark[]> {
    try {
      if (!forceRefresh && this.topicCache && this.isCacheValid()) {
        return this.topicCache;
      }

      // 从新的统一数据获取
      let topics = await globalDataManager.getData<TopicBookmark[]>('bookmarked-topics');
      
      // 如果新数据为空，尝试从旧的localStorage键获取
      if (!topics || topics.length === 0) {
        try {
          const oldData = localStorage.getItem('bookmarked-topics');
          if (oldData) {
            topics = JSON.parse(oldData);
            // 迁移到新的统一数据系统
            if (topics && topics.length > 0) {
              await globalDataManager.setData('bookmarked-topics', topics);
              console.log('✅ 话题书签已迁移到统一数据系统');
            }
          }
        } catch (error) {
          console.error('旧数据迁移失败:', error);
        }
      }

      const result = topics || [];
      this.topicCache = result;
      return result;
    } catch (error) {
      console.error('获取话题书签失败:', error);
      return this.topicCache || [];
    }
  }

  /**
   * 添加书签
   */
  async addBookmark(item: Omit<BookmarkItem, 'id' | 'createdAt' | 'updatedAt' | 'isBookmarked'>): Promise<string> {
    try {
      const bookmarks = await this.getBookmarks();
      
      const id = this.generateId();
      const now = Date.now();
      
      const bookmarkItem: BookmarkItem = {
        ...item,
        id,
        createdAt: now,
        updatedAt: now,
        isBookmarked: true
      };

      const updatedBookmarks = [...bookmarks, bookmarkItem];
      
      const success = await globalDataManager.setData('bookmarkedTopics', updatedBookmarks);
      
      if (success) {
        this.updateCache(updatedBookmarks);
        console.log('✅ 书签添加成功:', item.title);
        return id;
      } else {
        throw new Error('保存书签失败');
      }
    } catch (error) {
      console.error('添加书签失败:', error);
      throw error;
    }
  }

  /**
   * 添加话题书签（向后兼容）
   */
  async addTopicBookmark(topic: Omit<TopicBookmark, 'id' | 'createdAt'>): Promise<string> {
    try {
      const bookmarks = await this.getTopicBookmarks();
      
      const id = this.generateId();
      const now = Date.now();
      
      const bookmarkItem: TopicBookmark = {
        ...topic,
        id,
        createdAt: now
      };

      const updatedBookmarks = [...bookmarks, bookmarkItem];
      
      const success = await globalDataManager.setData('bookmarked-topics', updatedBookmarks);
      
      if (success) {
        this.topicCache = updatedBookmarks;
        console.log('✅ 话题书签添加成功:', topic.title);
        return id;
      } else {
        throw new Error('保存话题书签失败');
      }
    } catch (error) {
      console.error('添加话题书签失败:', error);
      throw error;
    }
  }

  /**
   * 移除书签
   */
  async removeBookmark(id: string): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarks();
      const updatedBookmarks = bookmarks.filter(item => item.id !== id);
      
      const success = await globalDataManager.setData('bookmarkedTopics', updatedBookmarks);
      
      if (success) {
        this.updateCache(updatedBookmarks);
        console.log('✅ 书签移除成功:', id);
        return true;
      } else {
        throw new Error('保存书签失败');
      }
    } catch (error) {
      console.error('移除书签失败:', error);
      return false;
    }
  }

  /**
   * 移除话题书签（向后兼容）
   */
  async removeTopicBookmark(id: string): Promise<boolean> {
    try {
      const bookmarks = await this.getTopicBookmarks();
      const updatedBookmarks = bookmarks.filter(item => item.id !== id);
      
      const success = await globalDataManager.setData('bookmarked-topics', updatedBookmarks);
      
      if (success) {
        this.topicCache = updatedBookmarks;
        console.log('✅ 话题书签移除成功:', id);
        return true;
      } else {
        throw new Error('保存话题书签失败');
      }
    } catch (error) {
      console.error('移除话题书签失败:', error);
      return false;
    }
  }

  /**
   * 检查是否已书签
   */
  async isBookmarked(content: string): Promise<boolean> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.some(item => item.content === content);
  }

  /**
   * 检查话题是否已书签
   */
  async isTopicBookmarked(topicId: string): Promise<boolean> {
    const bookmarks = await this.getTopicBookmarks();
    return bookmarks.some(item => item.id === topicId);
  }

  /**
   * 根据类型获取书签
   */
  async getBookmarksByType(type: BookmarkType): Promise<BookmarkItem[]> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.filter(item => item.type === type);
  }

  /**
   * 搜索书签
   */
  async searchBookmarks(query: string): Promise<BookmarkItem[]> {
    const bookmarks = await this.getBookmarks();
    const lowerQuery = query.toLowerCase();
    
    return bookmarks.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 搜索话题书签
   */
  async searchTopicBookmarks(query: string): Promise<TopicBookmark[]> {
    const bookmarks = await this.getTopicBookmarks();
    const lowerQuery = query.toLowerCase();
    
    return bookmarks.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 获取书签统计信息
   */
  async getStats() {
    const bookmarks = await this.getBookmarks();
    const topicBookmarks = await this.getTopicBookmarks();
    
    return {
      totalBookmarks: bookmarks.length,
      totalTopicBookmarks: topicBookmarks.length,
      byType: bookmarks.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<BookmarkType, number>),
      byCategory: topicBookmarks.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * 导出书签
   */
  async exportBookmarks() {
    const bookmarks = await this.getBookmarks();
    const topicBookmarks = await this.getTopicBookmarks();
    
    return {
      bookmarks,
      topicBookmarks,
      exportedAt: Date.now()
    };
  }

  /**
   * 导入书签
   */
  async importBookmarks(data: {
    bookmarks?: BookmarkItem[];
    topicBookmarks?: TopicBookmark[];
  }): Promise<boolean> {
    try {
      let success = true;
      
      if (data.bookmarks) {
        success = success && await globalDataManager.setData('bookmarkedTopics', data.bookmarks);
        if (success) {
          this.updateCache(data.bookmarks);
        }
      }
      
      if (data.topicBookmarks) {
        success = success && await globalDataManager.setData('bookmarked-topics', data.topicBookmarks);
        if (success) {
          this.topicCache = data.topicBookmarks;
        }
      }
      
      console.log('✅ 书签导入成功');
      return success;
    } catch (error) {
      console.error('导入书签失败:', error);
      return false;
    }
  }

  /**
   * 清空所有书签
   */
  async clearAllBookmarks(): Promise<boolean> {
    try {
      const success1 = await globalDataManager.setData('bookmarkedTopics', []);
      const success2 = await globalDataManager.setData('bookmarked-topics', []);
      
      if (success1 && success2) {
        this.updateCache([]);
        this.topicCache = [];
        console.log('✅ 所有书签已清空');
        return true;
      } else {
        throw new Error('清空书签失败');
      }
    } catch (error) {
      console.error('清空书签失败:', error);
      return false;
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 更新缓存
   */
  private updateCache(bookmarks: BookmarkItem[]): void {
    this.cache = bookmarks;
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
    this.topicCache = null;
    this.lastCacheUpdate = 0;
  }
}

// 导出单例实例
export const bookmarkService = BookmarkService.getInstance();

/**
 * React Hook: 书签功能
 */
export function useBookmarks() {
  const addBookmark = (item: Omit<BookmarkItem, 'id' | 'createdAt' | 'updatedAt' | 'isBookmarked'>) => {
    return bookmarkService.addBookmark(item);
  };

  const addTopicBookmark = (topic: Omit<TopicBookmark, 'id' | 'createdAt'>) => {
    return bookmarkService.addTopicBookmark(topic);
  };

  const removeBookmark = (id: string) => {
    return bookmarkService.removeBookmark(id);
  };

  const removeTopicBookmark = (id: string) => {
    return bookmarkService.removeTopicBookmark(id);
  };

  const getBookmarks = (forceRefresh = false) => {
    return bookmarkService.getBookmarks(forceRefresh);
  };

  const getTopicBookmarks = (forceRefresh = false) => {
    return bookmarkService.getTopicBookmarks(forceRefresh);
  };

  const isBookmarked = (content: string) => {
    return bookmarkService.isBookmarked(content);
  };

  const isTopicBookmarked = (topicId: string) => {
    return bookmarkService.isTopicBookmarked(topicId);
  };

  const searchBookmarks = (query: string) => {
    return bookmarkService.searchBookmarks(query);
  };

  const searchTopicBookmarks = (query: string) => {
    return bookmarkService.searchTopicBookmarks(query);
  };

  const getStats = () => {
    return bookmarkService.getStats();
  };

  const exportBookmarks = () => {
    return bookmarkService.exportBookmarks();
  };

  const importBookmarks = (data: any) => {
    return bookmarkService.importBookmarks(data);
  };

  const clearAllBookmarks = () => {
    return bookmarkService.clearAllBookmarks();
  };

  return {
    addBookmark,
    addTopicBookmark,
    removeBookmark,
    removeTopicBookmark,
    getBookmarks,
    getTopicBookmarks,
    isBookmarked,
    isTopicBookmarked,
    searchBookmarks,
    searchTopicBookmarks,
    getStats,
    exportBookmarks,
    importBookmarks,
    clearAllBookmarks
  };
}

export default BookmarkService;