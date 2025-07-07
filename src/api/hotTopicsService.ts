/**
 * 热点话题API服务
 * 支持多维度数据获取、筛选和分析
 */

/**
 * 时间范围类型
 */
export type TimeRange = '3h' | '6h' | '12h' | '24h' | '48h';

/**
 * 地区类型
 */
export type Region = 'all' | 'beijing' | 'shanghai' | 'guangzhou' | 'shenzhen' | 'hangzhou' | 'chengdu' | 'wuhan' | 'xian' | 'nanjing';

/**
 * 分类类型
 */
export type Category = 'all' | 'entertainment' | 'tech' | 'education' | 'sports' | 'finance' | 'health' | 'lifestyle' | 'politics' | 'culture';

/**
 * 平台类型
 */
export type Platform = 'all' | 'weibo' | 'zhihu' | 'xiaohongshu' | 'douyin' | 'toutiao' | 'baijiahao' | 'kuaishou';

/**
 * 趋势类型
 */
export type Trend = 'up' | 'down' | 'stable';

/**
 * 热门话题数据接口
 */
export interface HotTopic {
  id: string;
  title: string;
  description: string;
  category: Category;
  platform: Platform;
  region: Region;
  heat: number;
  trend: Trend;
  views: number;
  discussions: number;
  tags: string[];
  timestamp: string;
  url?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  relatedTopics?: string[];
}

/**
 * 筛选参数接口
 */
export interface HotTopicsFilter {
  timeRange?: TimeRange;
  region?: Region;
  category?: Category;
  platform?: Platform;
  searchQuery?: string;
  minHeat?: number;
  maxHeat?: number;
  limit?: number;
  offset?: number;
}

/**
 * 热点话题统计接口
 */
export interface HotTopicsStats {
  totalTopics: number;
  totalViews: number;
  totalDiscussions: number;
  averageHeat: number;
  topCategories: Array<{ category: Category; count: number }>;
  topPlatforms: Array<{ platform: Platform; count: number }>;
  trendingTopics: HotTopic[];
}

/**
 * 获取热门话题列表
 * @param filter 筛选参数
 * @returns Promise<HotTopic[]>
 */
export async function getHotTopics(filter: HotTopicsFilter = {}): Promise<HotTopic[]> {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟数据
    const mockData: HotTopic[] = [
      {
        id: '1',
        title: 'AI技术在教育领域的应用',
        description: '人工智能如何改变传统教育模式，提升学习效率',
        category: 'tech',
        platform: 'zhihu',
        region: 'all',
        heat: 95,
        trend: 'up',
        views: 1250000,
        discussions: 8500,
        tags: ['AI', '教育', '技术'],
        timestamp: new Date().toISOString(),
        sentiment: 'positive',
        relatedTopics: ['在线教育', '智能学习', '教育科技']
      },
      {
        id: '2',
        title: '新能源汽车市场爆发',
        description: '2024年新能源汽车销量创历史新高',
        category: 'finance',
        platform: 'weibo',
        region: 'all',
        heat: 92,
        trend: 'up',
        views: 980000,
        discussions: 6200,
        tags: ['新能源', '汽车', '市场'],
        timestamp: new Date().toISOString(),
        sentiment: 'positive',
        relatedTopics: ['电动汽车', '充电桩', '环保出行']
      },
      {
        id: '3',
        title: '健康生活方式指南',
        description: '专家分享科学的生活方式建议',
        category: 'health',
        platform: 'xiaohongshu',
        region: 'all',
        heat: 88,
        trend: 'stable',
        views: 750000,
        discussions: 4200,
        tags: ['健康', '生活', '指南'],
        timestamp: new Date().toISOString(),
        sentiment: 'positive',
        relatedTopics: ['养生', '运动', '饮食']
      },
      {
        id: '4',
        title: '传统文化复兴热潮',
        description: '年轻人重新关注传统文化的现象分析',
        category: 'culture',
        platform: 'douyin',
        region: 'all',
        heat: 85,
        trend: 'up',
        views: 680000,
        discussions: 3800,
        tags: ['文化', '传统', '复兴'],
        timestamp: new Date().toISOString(),
        sentiment: 'positive',
        relatedTopics: ['国学', '汉服', '古风']
      },
      {
        id: '5',
        title: '远程办公新趋势',
        description: '后疫情时代远程办公的发展趋势',
        category: 'lifestyle',
        platform: 'toutiao',
        region: 'all',
        heat: 82,
        trend: 'down',
        views: 520000,
        discussions: 2900,
        tags: ['远程办公', '趋势', '工作'],
        timestamp: new Date().toISOString(),
        sentiment: 'neutral',
        relatedTopics: ['混合办公', '数字化', '工作方式']
      },
      {
        id: '6',
        title: '娱乐圈最新动态',
        description: '明星八卦和娱乐新闻汇总',
        category: 'entertainment',
        platform: 'weibo',
        region: 'all',
        heat: 90,
        trend: 'up',
        views: 1100000,
        discussions: 7800,
        tags: ['娱乐', '明星', '八卦'],
        timestamp: new Date().toISOString(),
        sentiment: 'neutral',
        relatedTopics: ['综艺', '电影', '音乐']
      },
      {
        id: '7',
        title: '体育赛事精彩回顾',
        description: '最新体育赛事结果和精彩瞬间',
        category: 'sports',
        platform: 'toutiao',
        region: 'all',
        heat: 87,
        trend: 'stable',
        views: 890000,
        discussions: 4500,
        tags: ['体育', '赛事', '精彩'],
        timestamp: new Date().toISOString(),
        sentiment: 'positive',
        relatedTopics: ['足球', '篮球', '奥运会']
      },
      {
        id: '8',
        title: '时政热点分析',
        description: '最新政策解读和社会热点分析',
        category: 'politics',
        platform: 'zhihu',
        region: 'all',
        heat: 83,
        trend: 'up',
        views: 650000,
        discussions: 3200,
        tags: ['时政', '政策', '分析'],
        timestamp: new Date().toISOString(),
        sentiment: 'neutral',
        relatedTopics: ['两会', '政策', '社会']
      }
    ];

    // 应用筛选条件
    let filteredData = mockData;

    // 按地区筛选
    if (filter.region && filter.region !== 'all') {
      filteredData = filteredData.filter(topic => 
        topic.region === filter.region || topic.region === 'all'
      );
    }

    // 按分类筛选
    if (filter.category && filter.category !== 'all') {
      filteredData = filteredData.filter(topic => topic.category === filter.category);
    }

    // 按平台筛选
    if (filter.platform && filter.platform !== 'all') {
      filteredData = filteredData.filter(topic => topic.platform === filter.platform);
    }

    // 按搜索关键词筛选
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredData = filteredData.filter(topic => 
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query) ||
        topic.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 按热度范围筛选
    if (filter.minHeat !== undefined) {
      filteredData = filteredData.filter(topic => topic.heat >= filter.minHeat!);
    }
    if (filter.maxHeat !== undefined) {
      filteredData = filteredData.filter(topic => topic.heat <= filter.maxHeat!);
    }

    // 分页
    const offset = filter.offset || 0;
    const limit = filter.limit || filteredData.length;
    filteredData = filteredData.slice(offset, offset + limit);

    return filteredData;
  } catch (error) {
    console.error('获取热门话题失败:', error);
    throw new Error('获取热门话题失败');
  }
}

/**
 * 获取热点话题统计信息
 * @param filter 筛选参数
 * @returns Promise<HotTopicsStats>
 */
export async function getHotTopicsStats(filter: HotTopicsFilter = {}): Promise<HotTopicsStats> {
  try {
    const topics = await getHotTopics(filter);
    
    // 计算统计数据
    const totalTopics = topics.length;
    const totalViews = topics.reduce((sum, topic) => sum + topic.views, 0);
    const totalDiscussions = topics.reduce((sum, topic) => sum + topic.discussions, 0);
    const averageHeat = totalTopics > 0 ? Math.round(topics.reduce((sum, topic) => sum + topic.heat, 0) / totalTopics) : 0;

    // 统计分类分布
    const categoryCount = topics.reduce((acc, topic) => {
      acc[topic.category] = (acc[topic.category] || 0) + 1;
      return acc;
    }, {} as Record<Category, number>);
    
    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category: category as Category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 统计平台分布
    const platformCount = topics.reduce((acc, topic) => {
      acc[topic.platform] = (acc[topic.platform] || 0) + 1;
      return acc;
    }, {} as Record<Platform, number>);
    
    const topPlatforms = Object.entries(platformCount)
      .map(([platform, count]) => ({ platform: platform as Platform, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 获取趋势话题
    const trendingTopics = topics
      .filter(topic => topic.trend === 'up')
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 5);

    return {
      totalTopics,
      totalViews,
      totalDiscussions,
      averageHeat,
      topCategories,
      topPlatforms,
      trendingTopics
    };
  } catch (error) {
    console.error('获取统计信息失败:', error);
    throw new Error('获取统计信息失败');
  }
}

/**
 * 获取相关话题推荐
 * @param topicId 话题ID
 * @param limit 推荐数量
 * @returns Promise<HotTopic[]>
 */
export async function getRelatedTopics(topicId: string, limit: number = 5): Promise<HotTopic[]> {
  try {
    const allTopics = await getHotTopics();
    const currentTopic = allTopics.find(topic => topic.id === topicId);
    
    if (!currentTopic) {
      return [];
    }

    // 基于分类和标签推荐相关话题
    const relatedTopics = allTopics
      .filter(topic => topic.id !== topicId)
      .filter(topic => 
        topic.category === currentTopic.category ||
        topic.tags.some(tag => currentTopic.tags.includes(tag))
      )
      .sort((a, b) => b.heat - a.heat)
      .slice(0, limit);

    return relatedTopics;
  } catch (error) {
    console.error('获取相关话题失败:', error);
    throw new Error('获取相关话题失败');
  }
}

/**
 * 获取话题详情
 * @param topicId 话题ID
 * @returns Promise<HotTopic | null>
 */
export async function getTopicDetail(topicId: string): Promise<HotTopic | null> {
  try {
    const topics = await getHotTopics();
    return topics.find(topic => topic.id === topicId) || null;
  } catch (error) {
    console.error('获取话题详情失败:', error);
    throw new Error('获取话题详情失败');
  }
}

/**
 * 导出话题数据
 * @param filter 筛选参数
 * @param format 导出格式
 * @returns Promise<string>
 */
export async function exportHotTopics(
  filter: HotTopicsFilter = {}, 
  format: 'json' | 'csv' | 'excel' = 'json'
): Promise<string> {
  try {
    const topics = await getHotTopics(filter);
    
    switch (format) {
      case 'json':
        return JSON.stringify(topics, null, 2);
      case 'csv': {
        const headers = ['ID', '标题', '描述', '分类', '平台', '热度', '趋势', '浏览量', '讨论数', '标签', '时间'];
        const rows = topics.map(topic => [
          topic.id,
          topic.title,
          topic.description,
          topic.category,
          topic.platform,
          topic.heat,
          topic.trend,
          topic.views,
          topic.discussions,
          topic.tags.join(','),
          topic.timestamp
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
      }
      case 'excel':
        // 这里可以集成实际的Excel生成库
        return JSON.stringify(topics, null, 2);
      default:
        return JSON.stringify(topics, null, 2);
    }
  } catch (error) {
    console.error('导出话题数据失败:', error);
    throw new Error('导出话题数据失败');
  }
} 