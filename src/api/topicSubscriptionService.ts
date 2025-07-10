/**
 * 话题订阅服务
 * 支持自定义话题监控、实时更新和热度追踪
 */

import axios from 'axios';

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
  checkInterval: number; // 检查间隔（分钟）
  minHeatThreshold?: number; // 最小热度阈值
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
  return newSubscription;
}

/**
 * 更新话题订阅
 */
export function updateTopicSubscription(id: string, updates: Partial<TopicSubscription>): TopicSubscription | null {
  const subscriptions = getTopicSubscriptions();
  const index = subscriptions.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  subscriptions[index] = {
    ...subscriptions[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveTopicSubscriptions(subscriptions);
  return subscriptions[index];
}

/**
 * 删除话题订阅
 */
export function deleteTopicSubscription(id: string): boolean {
  const subscriptions = getTopicSubscriptions();
  const filtered = subscriptions.filter(s => s.id !== id);
  
  if (filtered.length === subscriptions.length) {
    return false; // 没有找到要删除的订阅
  }
  
  saveTopicSubscriptions(filtered);
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
    
    // 更新最后检查时间
    updateTopicSubscription(subscription.id, {
      lastCheckAt: new Date().toISOString()
    });
    
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
  // 这里可以集成真实的新闻API
  // 目前返回模拟数据
  return [
    {
      id: generateId(),
      subscriptionId: '',
      keyword,
      title: `关于"${keyword}"的最新新闻报道`,
      content: `这是一条关于"${keyword}"的新闻内容，包含了相关的信息和背景。`,
      url: '#',
      platform: source.name,
      source: source.id,
      heat: Math.floor(Math.random() * 100000) + 1000,
      publishedAt: new Date().toISOString(),
      discoveredAt: new Date().toISOString(),
      tags: [keyword],
      relevance: 0.9
    }
  ];
}

/**
 * 搜索社交媒体
 */
async function searchSocial(keyword: string, source: SearchSource): Promise<TopicMonitorResult[]> {
  // 这里可以集成真实的社交媒体API
  return [
    {
      id: generateId(),
      subscriptionId: '',
      keyword,
      title: `"${keyword}"相关讨论`,
      content: `社交媒体上关于"${keyword}"的热门讨论内容。`,
      url: '#',
      platform: source.name,
      source: source.id,
      heat: Math.floor(Math.random() * 50000) + 500,
      publishedAt: new Date().toISOString(),
      discoveredAt: new Date().toISOString(),
      tags: [keyword],
      relevance: 0.8
    }
  ];
}

/**
 * 搜索网页
 */
async function searchWeb(keyword: string, source: SearchSource): Promise<TopicMonitorResult[]> {
  // 这里可以集成搜索引擎API
  return [
    {
      id: generateId(),
      subscriptionId: '',
      keyword,
      title: `"${keyword}"相关网页内容`,
      content: `关于"${keyword}"的网页搜索结果和相关信息。`,
      url: '#',
      platform: source.name,
      source: source.id,
      heat: Math.floor(Math.random() * 20000) + 100,
      publishedAt: new Date().toISOString(),
      discoveredAt: new Date().toISOString(),
      tags: [keyword],
      relevance: 0.7
    }
  ];
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
  // 这里可以计算历史热度趋势
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
      platforms: ['微博', '知乎', '百度']
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