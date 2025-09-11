/**
 * 数据融合服务
 * 整合 RSSHub 数据和现有 DailyHotApi 数据
 */

import { DailyHotItem, getDailyHotAll } from '@/api/hotTopicsService';
// 🔧 FIXED: 修复导入类型问题
import hotTopicsApi from '@/api/hotTopicsApi';
import type { HotTopicItem } from '@/types/hotTopics';

export interface FusedHotTopic {
  id: string;
  title: string;
  description?: string;
  url: string;
  source: string;
  category: string;
  hotScore: number;
  publishTime: string;
  tags: string[];
  dataSource: 'dailyhot' | 'rsshub' | 'fused';
  metrics: {
    views?: number;
    comments?: number;
    shares?: number;
    likes?: number;
  };
  trend: {
    direction: 'up' | 'down' | 'stable';
    change: number;
  };
}

export interface DataFusionConfig {
  enableRSSHub: boolean;
  enableDailyHot: boolean;
  fusionStrategy: 'merge' | 'prioritize_rsshub' | 'prioritize_dailyhot';
  deduplicationThreshold: number; // 0-1, 相似度阈值
  maxTopicsPerSource: number;
  categoryMapping: Record<string, string>;
}

class DataFusionService {
  private config: DataFusionConfig;

  constructor() {
    this.config = {
      enableRSSHub: true,
      enableDailyHot: true,
      fusionStrategy: 'merge',
      deduplicationThreshold: 0.8,
      maxTopicsPerSource: 100,
      categoryMapping: {
        // RSSHub -> 统一分类映射
        '社交媒体': '社交',
        '问答社区': '知识',
        '技术开发': '科技',
        '视频娱乐': '娱乐',
        '短视频': '娱乐',
        '生活方式': '生活',
        // DailyHot -> 统一分类映射
        'weibo': '社交',
        'zhihu': '知识',
        'github': '科技',
        'bilibili': '娱乐',
        'douyin': '娱乐',
        'xiaohongshu': '生活'
      }
    };
  }

  /**
   * 获取融合后的热点数据
   */
  async getFusedHotTopics(): Promise<FusedHotTopic[]> {
    const results: FusedHotTopic[] = [];

    try {
      // 并发获取两个数据源
      const [rsshubData, dailyHotData] = await Promise.allSettled([
        this.config.enableRSSHub ? this.getRSSHubData() : Promise.resolve([]),
        this.config.enableDailyHot ? this.getDailyHotData() : Promise.resolve([])
      ]);

      // 处理RSSHub数据
      if (rsshubData.status === 'fulfilled') {
        const convertedRSSHub = rsshubData.value.map(item => this.convertRSSHubToFused(item));
        results.push(...convertedRSSHub);
      }

      // 处理DailyHot数据
      if (dailyHotData.status === 'fulfilled') {
        const convertedDailyHot = dailyHotData.value.map(item => this.convertDailyHotToFused(item));
        results.push(...convertedDailyHot);
      }

      // 数据融合处理
      return this.processFusedData(results);
    } catch (error) {
      console.error('数据融合失败:', error);
      return [];
    }
  }

  /**
   * 获取RSSHub数据
   */
  private async getRSSHubData(): Promise<HotTopicItem[]> {
    try {
      const response = await hotTopicsApi.getHotTopics({ limit: this.config.maxTopicsPerSource });
      return response.success ? response.data : [];
    } catch (error) {
      console.error('获取RSSHub数据失败:', error);
      return [];
    }
  }

  /**
   * 获取DailyHot数据
   */
  private async getDailyHotData(): Promise<DailyHotItem[]> {
    try {
      const response = await getDailyHotAll();
      if (!response.success || !response.data) return [];
      
      // 扁平化所有平台数据
      const allItems: DailyHotItem[] = [];
      Object.entries(response.data).forEach(([platform, data]) => {
        if (data && data.data) {
          const items = data.data.slice(0, this.config.maxTopicsPerSource);
          allItems.push(...items);
        }
      });
      
      return allItems;
    } catch (error) {
      console.error('获取DailyHot数据失败:', error);
      return [];
    }
  }

  /**
   * 转换RSSHub数据格式
   */
  private convertRSSHubToFused(item: HotTopicItem): FusedHotTopic {
    return {
      id: `rsshub-${item.id}`,
      title: item.title,
      description: item.description,
      url: item.link,
      source: item.source,
      category: this.mapCategory(item.category),
      hotScore: item.hotScore || 50,
      publishTime: item.pubDate,
      tags: item.tags || [],
      dataSource: 'rsshub',
      metrics: {},
      trend: {
        direction: 'stable',
        change: 0
      }
    };
  }

  /**
   * 转换DailyHot数据格式
   */
  private convertDailyHotToFused(item: DailyHotItem): FusedHotTopic {
    return {
      id: `dailyhot-${item.id || Date.now()}-${Math.random()}`,
      title: item.title,
      description: item.desc,
      url: item.url,
      source: item.mobil_url || 'unknown',
      category: this.mapCategory(item.mobil_url || 'other'),
      hotScore: this.calculateDailyHotScore(item),
      publishTime: new Date().toISOString(),
      tags: this.extractTagsFromTitle(item.title),
      dataSource: 'dailyhot',
      metrics: {
        views: item.hot ? parseInt(item.hot.toString()) : undefined
      },
      trend: {
        direction: 'stable',
        change: 0
      }
    };
  }

  /**
   * 处理融合数据
   */
  private processFusedData(data: FusedHotTopic[]): FusedHotTopic[] {
    // 1. 去重
    const deduplicated = this.deduplicateTopics(data);
    
    // 2. 根据策略排序
    const sorted = this.sortByStrategy(deduplicated);
    
    // 3. 限制数量
    return sorted.slice(0, 200);
  }

  /**
   * 去重处理
   */
  private deduplicateTopics(topics: FusedHotTopic[]): FusedHotTopic[] {
    const unique: FusedHotTopic[] = [];
    
    for (const topic of topics) {
      const isDuplicate = unique.some(existing => 
        this.calculateSimilarity(topic.title, existing.title) > this.config.deduplicationThreshold
      );
      
      if (!isDuplicate) {
        unique.push(topic);
      } else {
        // 如果是重复的，选择热度更高的
        const existingIndex = unique.findIndex(existing => 
          this.calculateSimilarity(topic.title, existing.title) > this.config.deduplicationThreshold
        );
        
        if (existingIndex !== -1 && topic.hotScore > unique[existingIndex].hotScore) {
          unique[existingIndex] = topic;
        }
      }
    }
    
    return unique;
  }

  /**
   * 根据策略排序
   */
  private sortByStrategy(topics: FusedHotTopic[]): FusedHotTopic[] {
    switch (this.config.fusionStrategy) {
      case 'prioritize_rsshub':
        return topics.sort((a, b) => {
          if (a.dataSource === 'rsshub' && b.dataSource !== 'rsshub') return -1;
          if (a.dataSource !== 'rsshub' && b.dataSource === 'rsshub') return 1;
          return b.hotScore - a.hotScore;
        });
      
      case 'prioritize_dailyhot':
        return topics.sort((a, b) => {
          if (a.dataSource === 'dailyhot' && b.dataSource !== 'dailyhot') return -1;
          if (a.dataSource !== 'dailyhot' && b.dataSource === 'dailyhot') return 1;
          return b.hotScore - a.hotScore;
        });
      
      default: // merge
        return topics.sort((a, b) => b.hotScore - a.hotScore);
    }
  }

  /**
   * 计算文本相似度
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 映射分类
   */
  private mapCategory(category: string): string {
    return this.config.categoryMapping[category] || category;
  }

  /**
   * 计算DailyHot热度分数
   */
  private calculateDailyHotScore(item: DailyHotItem): number {
    let score = 50; // 基础分数
    
    if (item.hot) {
      const hotValue = parseInt(item.hot.toString());
      if (hotValue > 1000000) score += 30;
      else if (hotValue > 100000) score += 20;
      else if (hotValue > 10000) score += 10;
    }
    
    return Math.min(100, score);
  }

  /**
   * 从标题提取标签
   */
  private extractTagsFromTitle(title: string): string[] {
    const tags: string[] = [];
    
    // 简单的关键词提取
    const keywords = ['热搜', '突发', '重大', '最新', '独家', '爆料'];
    keywords.forEach(keyword => {
      if (title.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return tags;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<DataFusionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  getConfig(): DataFusionConfig {
    return { ...this.config };
  }

  /**
   * 获取数据源统计
   */
  async getDataSourceStats(): Promise<{
    rsshub: { count: number; categories: string[] };
    dailyhot: { count: number; platforms: string[] };
    total: number;
  }> {
    try {
      const [rsshubData, dailyHotData] = await Promise.allSettled([
        this.getRSSHubData(),
        this.getDailyHotData()
      ]);

      const rsshubCount = rsshubData.status === 'fulfilled' ? rsshubData.value.length : 0;
      const dailyHotCount = dailyHotData.status === 'fulfilled' ? dailyHotData.value.length : 0;

      const rsshubCategories = rsshubData.status === 'fulfilled' 
        ? [...new Set(rsshubData.value.map(item => item.category))]
        : [];

      const dailyHotPlatforms = dailyHotData.status === 'fulfilled'
        ? [...new Set(dailyHotData.value.map(item => item.mobil_url || 'unknown'))]
        : [];

      return {
        rsshub: { count: rsshubCount, categories: rsshubCategories },
        dailyhot: { count: dailyHotCount, platforms: dailyHotPlatforms },
        total: rsshubCount + dailyHotCount
      };
    } catch (error) {
      console.error('获取数据源统计失败:', error);
      return {
        rsshub: { count: 0, categories: [] },
        dailyhot: { count: 0, platforms: [] },
        total: 0
      };
    }
  }
}

export default new DataFusionService();
