/**
 * 热点话题 API 接口
 * 整合 RSSHub 数据和本地缓存
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import rsshubService, { HotTopicItem, PlatformConfig } from '../services/rsshubService';

export interface HotTopicsResponse {
  success: boolean;
  data: HotTopicItem[];
  total: number;
  categories: string[];
  lastUpdated: string;
  error?: string;
}

export interface HotTopicsFilter {
  category?: string;
  source?: string;
  limit?: number;
  offset?: number;
  timeRange?: '1h' | '6h' | '24h' | '7d';
}

class HotTopicsApi {
  private cache: Map<string, { data: HotTopicItem[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 获取热点话题列表
   */
  async getHotTopics(filter: HotTopicsFilter = {}): Promise<HotTopicsResponse> {
    try {
      const cacheKey = this.generateCacheKey(filter);
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        return this.formatResponse(cached, '缓存数据');
      }

      // 获取新数据
      const allTopics = await rsshubService.getAllHotTopics();
      const filteredTopics = this.applyFilters(allTopics, filter);
      
      // 缓存数据
      this.setCache(cacheKey, filteredTopics);
      
      return this.formatResponse(filteredTopics, '实时数据');
    } catch (error) {
      console.error('getting热点话题failed:', error);
      return {
        success: false,
        data: [],
        total: 0,
        categories: [],
        lastUpdated: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'
      };
    }
  }

  /**
   * 获取特定平台的热点话题
   */
  async getPlatformTopics(platform: string, limit = 20): Promise<HotTopicsResponse> {
    try {
      const platformConfig = rsshubService.getSupportedPlatforms()
        .find(p => p.namespace === platform);
      
      if (!platformConfig) {
        throw new Error(`不支持的平台: ${platform}`);
      }

      const topics = await rsshubService.getPlatformHotTopics(platformConfig);
      const limitedTopics = topics.slice(0, limit);
      
      return this.formatResponse(limitedTopics, `${platformConfig.name}数据`);
    } catch (error) {
      console.error(`getting平台 ${platform} 热点failed:`, error);
      return {
        success: false,
        data: [],
        total: 0,
        categories: [],
        lastUpdated: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'
      };
    }
  }

  /**
   * 获取热点分类统计
   */
  async getCategoryStats(): Promise<{ category: string; count: number; percentage: number }[]> {
    try {
      const allTopics = await rsshubService.getAllHotTopics();
      const categoryCount = new Map<string, number>();
      
      allTopics.forEach(topic => {
        const count = categoryCount.get(topic.category) || 0;
        categoryCount.set(topic.category, count + 1);
      });

      const total = allTopics.length;
      const stats = Array.from(categoryCount.entries()).map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100)
      }));

      return stats.sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('gettingcategory统计failed:', error);
      return [];
    }
  }

  /**
   * 搜索热点话题
   */
  async searchTopics(query: string, limit = 50): Promise<HotTopicsResponse> {
    try {
      const allTopics = await rsshubService.getAllHotTopics();
      const searchResults = allTopics.filter(topic => 
        topic.title.toLowerCase().includes(query.toLowerCase()) ||
        (topic.description && topic.description.toLowerCase().includes(query.toLowerCase())) ||
        (topic.tags && topic.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
      );

      const limitedResults = searchResults.slice(0, limit);
      return this.formatResponse(limitedResults, `搜索结果: ${query}`);
    } catch (error) {
      console.error('searching热点话题failed:', error);
      return {
        success: false,
        data: [],
        total: 0,
        categories: [],
        lastUpdated: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'
      };
    }
  }

  /**
   * 获取趋势分析数据
   */
  async getTrendAnalysis(timeRange: '1h' | '6h' | '24h' | '7d' = '24h'): Promise<{
    trending: HotTopicItem[];
    rising: HotTopicItem[];
    stable: HotTopicItem[];
    categories: { name: string; trend: 'up' | 'down' | 'stable'; change: number }[];
  }> {
    try {
      // 这里可以结合历史数据进行趋势分析
      // 目前先返回基础数据结构
      const allTopics = await rsshubService.getAllHotTopics();
      
      // 简单的趋势分类（基于热度分数）
      const trending = allTopics.filter(t => (t.hotScore || 0) > 80).slice(0, 10);
      const rising = allTopics.filter(t => (t.hotScore || 0) > 60 && (t.hotScore || 0) <= 80).slice(0, 10);
      const stable = allTopics.filter(t => (t.hotScore || 0) <= 60).slice(0, 10);

      // 分类趋势（模拟数据）
      const categories = [
        { name: '科技', trend: 'up' as const, change: 15 },
        { name: '娱乐', trend: 'stable' as const, change: 0 },
        { name: '体育', trend: 'down' as const, change: -8 },
        { name: '财经', trend: 'up' as const, change: 12 }
      ];

      return { trending, rising, stable, categories };
    } catch (error) {
      console.error('getting趋势analyzingfailed:', error);
      return {
        trending: [],
        rising: [],
        stable: [],
        categories: []
      };
    }
  }

  /**
   * 获取支持的平台列表
   */
  getSupportedPlatforms(): PlatformConfig[] {
    return rsshubService.getSupportedPlatforms();
  }

  /**
   * 更新平台配置
   */
  updatePlatformConfig(namespace: string, enabled: boolean): void {
    rsshubService.updatePlatformStatus(namespace, enabled);
    // 清除相关缓存
    this.clearCache();
  }

  /**
   * 应用过滤器
   */
  private applyFilters(topics: HotTopicItem[], filter: HotTopicsFilter): HotTopicItem[] {
    let filtered = [...topics];

    // 分类过滤
    if (filter.category) {
      filtered = filtered.filter(topic => topic.category === filter.category);
    }

    // 来源过滤
    if (filter.source) {
      filtered = filtered.filter(topic => topic.source === filter.source);
    }

    // 时间范围过滤
    if (filter.timeRange) {
      const now = new Date();
      const timeLimit = this.getTimeLimit(now, filter.timeRange);
      filtered = filtered.filter(topic => new Date(topic.pubDate) >= timeLimit);
    }

    // 分页
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    
    return filtered.slice(offset, offset + limit);
  }

  /**
   * 获取时间限制
   */
  private getTimeLimit(now: Date, timeRange: string): Date {
    const timeMap = {
      '1h': 1 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    
    return new Date(now.getTime() - (timeMap[timeRange as keyof typeof timeMap] || timeMap['24h']));
  }

  /**
   * 格式化响应
   */
  private formatResponse(topics: HotTopicItem[], source: string): HotTopicsResponse {
    const categories = [...new Set(topics.map(t => t.category))];
    
    return {
      success: true,
      data: topics,
      total: topics.length,
      categories,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(filter: HotTopicsFilter): string {
    return JSON.stringify(filter);
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache(key: string): HotTopicItem[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, data: HotTopicItem[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 清除缓存
   */
  private clearCache(): void {
    this.cache.clear();
  }

  /**
   * 清除过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

export default new HotTopicsApi();
