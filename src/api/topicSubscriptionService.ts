/**
 * 话题订阅服务
 * 支持自定义话题监控、实时更新和热度追踪
 * 
 * ✅ 使用统一API请求模块，禁止直接使用fetch/axios
 * 📌 所有API地址从环境变量获取，严禁硬编码
 */

import request from './request';
import { 
  notifyTopicUpdate, 
  notifyHeatAlert, 
  notifySubscriptionStatus 
} from '@/services/notificationService';

/**
 * 订阅话题接口
 */
export interface TopicSubscription {
  id: string;
  keyword: string;
  name: string;
  description?: string;
  platforms: string[];
  sources: string[];
  isActive: boolean;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastCheckAt?: string;
  lastChecked?: string | null;
  lastNotification?: string | null;
  checkInterval: number; // 检查间隔（分钟）
  minHeatThreshold?: number; // 最小热度阈值
  maxHeatThreshold?: number; // 最大热度阈值（用于热度警报）
}

/**
 * 话题监控结果接口
 */
export interface TopicMonitorResult {
  id: string;
  subscriptionId: string;
  keyword: string;
  title: string;
  content: string;
  url: string;
  platform: string;
  source: string;
  heat: number;
  publishedAt: string;
  discoveredAt: string;
  tags: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevance: number; // 相关性评分 0-1
}

/**
 * 话题热度趋势接口
 */
export interface TopicHeatTrend {
  keyword: string;
  date: string;
  heat: number;
  mentions: number;
  platforms: string[];
}

/**
 * 搜索源配置
 */
export interface SearchSource {
  id: string;
  name: string;
  type: 'news' | 'social' | 'search' | 'rss';
  apiUrl?: string;
  apiKey?: string;
  isEnabled: boolean;
  rateLimit: number; // 每分钟请求限制
}

/**
 * 默认搜索源配置
 */
const DEFAULT_SEARCH_SOURCES: SearchSource[] = [
  {
    id: 'baidu-news',
    name: '百度新闻',
    type: 'news',
    apiUrl: 'https://api.baidu.com/news/search',
    isEnabled: true,
    rateLimit: 10
  },
  {
    id: 'weibo-search',
    name: '微博搜索',
    type: 'social',
    apiUrl: 'https://m.weibo.cn/api/container/getIndex',
    isEnabled: true,
    rateLimit: 20
  },
  {
    id: 'zhihu-search',
    name: '知乎搜索',
    type: 'social',
    apiUrl: 'https://www.zhihu.com/api/v4/search_v3',
    isEnabled: true,
    rateLimit: 15
  },
  {
    id: 'toutiao-search',
    name: '头条搜索',
    type: 'news',
    apiUrl: 'https://www.toutiao.com/search_content/',
    isEnabled: true,
    rateLimit: 12
  },
  {
    id: 'bilibili-search',
    name: 'B站搜索',
    type: 'social',
    apiUrl: 'https://api.bilibili.com/x/web-interface/search/type',
    isEnabled: true,
    rateLimit: 8
  },
  {
    id: 'douyin-search',
    name: '抖音搜索',
    type: 'social',
    apiUrl: 'https://www.douyin.com/aweme/v1/web/search/item/',
    isEnabled: true,
    rateLimit: 5
  }
];

/**
 * 获取订阅话题列表
 */
export function getTopicSubscriptions(): TopicSubscription[] {
  try {
    const stored = localStorage.getItem('topic-subscriptions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('获取话题订阅失败:', error);
    return [];
  }
}

/**
 * 保存订阅话题列表
 */
export function saveTopicSubscriptions(subscriptions: TopicSubscription[]): void {
  try {
    localStorage.setItem('topic-subscriptions', JSON.stringify(subscriptions));
  } catch (error) {
    console.error('保存话题订阅失败:', error);
  }
}

/**
 * 添加新的话题订阅
 */
export function addTopicSubscription(subscription: Omit<TopicSubscription, 'id' | 'createdAt' | 'updatedAt'>): TopicSubscription {
  const subscriptions = getTopicSubscriptions();
  const newSubscription: TopicSubscription = {
    ...subscription,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  subscriptions.push(newSubscription);
  saveTopicSubscriptions(subscriptions);
  
  // 发送通知
  notifySubscriptionStatus('created', newSubscription.name);
  
  return newSubscription;
}

/**
 * 更新话题订阅
 */
export function updateTopicSubscription(id: string, updates: Partial<TopicSubscription>): TopicSubscription | null {
  const subscriptions = getTopicSubscriptions();
  const index = subscriptions.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  const oldSubscription = subscriptions[index];
  subscriptions[index] = {
    ...oldSubscription,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveTopicSubscriptions(subscriptions);
  
  // 发送通知
  notifySubscriptionStatus('updated', subscriptions[index].name);
  
  return subscriptions[index];
}

/**
 * 删除话题订阅
 */
export function deleteTopicSubscription(id: string): boolean {
  const subscriptions = getTopicSubscriptions();
  const subscription = subscriptions.find(s => s.id === id);
  const filtered = subscriptions.filter(s => s.id !== id);
  
  if (filtered.length === subscriptions.length) {
    return false; // 没有找到要删除的订阅
  }
  
  saveTopicSubscriptions(filtered);
  
  // 发送通知
  if (subscription) {
    notifySubscriptionStatus('deleted', subscription.name);
  }
  
  return true;
}

/**
 * 监控话题关键词
 */
export async function monitorTopic(subscription: TopicSubscription): Promise<TopicMonitorResult[]> {
  const results: TopicMonitorResult[] = [];
  
  try {
    // 并发搜索各个平台
    const searchPromises = subscription.sources.map(async (sourceId) => {
      try {
        const source = DEFAULT_SEARCH_SOURCES.find(s => s.id === sourceId);
        if (!source || !source.isEnabled) return [];
        
        const searchResults = await searchKeyword(subscription.keyword, source);
        return searchResults.map(result => ({
          ...result,
          subscriptionId: subscription.id,
          keyword: subscription.keyword
        }));
      } catch (error) {
        console.error(`搜索源 ${sourceId} 失败:`, error);
        return [];
      }
    });
    
    const allResults = await Promise.allSettled(searchPromises);
    
    // 合并所有搜索结果
    allResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      }
    });
    
    // 去重和排序
    const uniqueResults = deduplicateResults(results);
    const sortedResults = uniqueResults.sort((a, b) => b.heat - a.heat);
    
    // 检查热度阈值
    if (subscription.maxHeatThreshold) {
      const highHeatResults = sortedResults.filter(r => r.heat >= subscription.maxHeatThreshold!);
      if (highHeatResults.length > 0 && subscription.notificationEnabled) {
        const maxHeat = Math.max(...highHeatResults.map(r => r.heat));
        notifyHeatAlert(subscription.keyword, maxHeat, subscription.maxHeatThreshold);
      }
    }
    
    // 更新最后检查时间
    updateTopicSubscription(subscription.id, {
      lastCheckAt: new Date().toISOString()
    });
    
    // 发送话题更新通知
    if (subscription.notificationEnabled) {
      notifyTopicUpdate(subscription.keyword, sortedResults, subscription.name);
    }
    
    return sortedResults;
  } catch (error) {
    console.error('监控话题失败:', error);
    return [];
  }
}

/**
 * 搜索关键词
 */
async function searchKeyword(keyword: string, source: SearchSource): Promise<TopicMonitorResult[]> {
  const results: TopicMonitorResult[] = [];
  
  try {
    switch (source.type) {
      case 'news':
        results.push(...await searchNews(keyword, source));
        break;
      case 'social':
        results.push(...await searchSocial(keyword, source));
        break;
      case 'search':
        results.push(...await searchWeb(keyword, source));
        break;
    }
  } catch (error) {
    console.error(`搜索关键词 "${keyword}" 在 ${source.name} 失败:`, error);
  }
  
  return results;
}

/**
 * 搜索新闻
 */
async function searchNews(keyword: string, source: SearchSource): Promise<TopicMonitorResult[]> {
  // 模拟新闻搜索，实际项目中可以集成真实的新闻API
  const mockNews = [
    {
      title: `关于"${keyword}"的最新新闻报道`,
      content: `这是一条关于"${keyword}"的新闻内容，包含了相关的信息和背景。`,
      heat: Math.floor(Math.random() * 100000) + 1000,
      sentiment: 'neutral' as const
    },
    {
      title: `"${keyword}"相关热点事件`,
      content: `近期关于"${keyword}"的热点事件引发了广泛关注。`,
      heat: Math.floor(Math.random() * 80000) + 500,
      sentiment: 'positive' as const
    }
  ];
  
  return mockNews.map(news => ({
    id: generateId(),
    subscriptionId: '',
    keyword,
    title: news.title,
    content: news.content,
    url: '#',
    platform: source.name,
    source: source.id,
    heat: news.heat,
    publishedAt: new Date().toISOString(),
    discoveredAt: new Date().toISOString(),
    tags: [keyword],
    sentiment: news.sentiment,
    relevance: 0.9
  }));
}

/**
 * 搜索社交媒体
 */
async function searchSocial(keyword: string, source: SearchSource): Promise<TopicMonitorResult[]> {
  // 模拟社交媒体搜索
  const mockSocial = [
    {
      title: `"${keyword}"相关讨论`,
      content: `社交媒体上关于"${keyword}"的热门讨论内容。`,
      heat: Math.floor(Math.random() * 50000) + 500,
      sentiment: 'positive' as const
    },
    {
      title: `"${keyword}"用户热议`,
      content: `用户们对"${keyword}"的讨论和观点分享。`,
      heat: Math.floor(Math.random() * 30000) + 200,
      sentiment: 'neutral' as const
    }
  ];
  
  return mockSocial.map(social => ({
    id: generateId(),
    subscriptionId: '',
    keyword,
    title: social.title,
    content: social.content,
    url: '#',
    platform: source.name,
    source: source.id,
    heat: social.heat,
    publishedAt: new Date().toISOString(),
    discoveredAt: new Date().toISOString(),
    tags: [keyword],
    sentiment: social.sentiment,
    relevance: 0.8
  }));
}

/**
 * 搜索网页
 */
async function searchWeb(keyword: string, source: SearchSource): Promise<TopicMonitorResult[]> {
  // 模拟网页搜索
  const mockWeb = [
    {
      title: `"${keyword}"相关网页内容`,
      content: `关于"${keyword}"的网页搜索结果和相关信息。`,
      heat: Math.floor(Math.random() * 20000) + 100,
      sentiment: 'neutral' as const
    }
  ];
  
  return mockWeb.map(web => ({
    id: generateId(),
    subscriptionId: '',
    keyword,
    title: web.title,
    content: web.content,
    url: '#',
    platform: source.name,
    source: source.id,
    heat: web.heat,
    publishedAt: new Date().toISOString(),
    discoveredAt: new Date().toISOString(),
    tags: [keyword],
    sentiment: web.sentiment,
    relevance: 0.7
  }));
}

/**
 * 去重搜索结果
 */
function deduplicateResults(results: TopicMonitorResult[]): TopicMonitorResult[] {
  const seen = new Set<string>();
  return results.filter(result => {
    const key = `${result.url}-${result.platform}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * 获取话题热度趋势
 */
export async function getTopicHeatTrend(keyword: string, days: number = 7): Promise<TopicHeatTrend[]> {
  // 模拟热度趋势数据，实际项目中可以从历史数据计算
  const trends: TopicHeatTrend[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    trends.push({
      keyword,
      date: date.toISOString().split('T')[0],
      heat: Math.floor(Math.random() * 100000) + 1000,
      mentions: Math.floor(Math.random() * 100) + 10,
      platforms: ['微博', '知乎', '百度', 'B站', '抖音']
    });
  }
  
  return trends;
}

/**
 * 获取可用的搜索源
 */
export function getAvailableSearchSources(): SearchSource[] {
  return DEFAULT_SEARCH_SOURCES;
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 检查订阅更新
 */
export async function checkAllSubscriptions(): Promise<Record<string, TopicMonitorResult[]>> {
  const subscriptions = getTopicSubscriptions().filter(s => s.isActive);
  const results: Record<string, TopicMonitorResult[]> = {};
  
  for (const subscription of subscriptions) {
    const now = new Date();
    const lastCheck = subscription.lastCheckAt ? new Date(subscription.lastCheckAt) : null;
    
    // 检查是否需要更新
    if (!lastCheck || (now.getTime() - lastCheck.getTime()) >= subscription.checkInterval * 60 * 1000) {
      const monitorResults = await monitorTopic(subscription);
      results[subscription.id] = monitorResults;
    }
  }
  
  return results;
}

/**
 * 启用/禁用订阅
 */
export function toggleSubscription(id: string, isActive: boolean): boolean {
  const subscription = updateTopicSubscription(id, { isActive });
  if (subscription) {
    notifySubscriptionStatus(isActive ? 'enabled' : 'disabled', subscription.name);
    return true;
  }
  return false;
}

/**
 * 获取订阅统计信息
 */
export function getSubscriptionStats() {
  const subscriptions = getTopicSubscriptions();
  const activeCount = subscriptions.filter(s => s.isActive).length;
  const totalCount = subscriptions.length;
  const notificationEnabledCount = subscriptions.filter(s => s.notificationEnabled).length;
  
  return {
    total: totalCount,
    active: activeCount,
    inactive: totalCount - activeCount,
    notificationEnabled: notificationEnabledCount,
    notificationDisabled: totalCount - notificationEnabledCount
  };
} 