/**
 * 热点话题服务 - 简化版本
 * 提供全网热点话题相关API请求
 */
import request from './request';

export interface DailyHotItem {
  title: string;
  hot: string;
  url: string;
  mobil_url?: string;
  index?: number;
  desc?: string;
  pic?: string;
  platform?: string;
  content?: string;
  relatedTopics?: string[];
  rank?: number;
  preferenceScore?: number;
  matchedKeywords?: string[];
  isHighPriority?: boolean;
}

export interface DailyHotResponse {
  code: number;
  message?: string;
  data: Record<string, DailyHotItem[]>;
  updateTime?: string;
}

/**
 * 获取全网热点聚合数据
 */
export async function getDailyHotAll(): Promise<DailyHotResponse> {
  const platforms = ['weibo', 'zhihu', 'douyin', 'bilibili', 'baidu'];
  const aggregatedData: Record<string, DailyHotItem[]> = {};
  
  const platformPromises = platforms.map(async (platform) => {
    try {
      const platformData = await getDailyHotByPlatform(platform);
      return { platform, data: platformData };
    } catch (error) {
      console.warn(`获取${platform}数据失败:`, error);
      return { platform, data: [] };
    }
  });

  try {
    const results = await Promise.allSettled(platformPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.data.length > 0) {
        aggregatedData[result.value.platform] = result.value.data;
      }
    });

    if (Object.keys(aggregatedData).length === 0) {
      throw new Error('所有平台数据获取失败');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ 成功聚合${Object.keys(aggregatedData).length}个平台的数据`);
    }

    return {
      code: 200,
      message: '获取成功',
      data: aggregatedData,
      updateTime: new Date().toISOString()
    };
  } catch (error) {
    console.error('聚合热点数据失败:', error);
    throw new Error('获取热点数据失败，请稍后重试');
  }
}

/**
 * 获取指定平台热榜数据
 */
export async function getDailyHotByPlatform(platform: string): Promise<DailyHotItem[]> {
  if (platform === 'weatheralarm' || platform === 'earthquake') {
    return [];
  }

  const apiSources = [
    {
      name: 'direct-api',
      url: `https://api-hot.imsyy.top/${platform}`,
      method: 'GET' as const
    }
  ];

  for (const source of apiSources) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`尝试使用API源获取${platform}数据: ${source.name}`);
      }
      
      const data = await request.get(source.url);

      if (!data) {
        throw new Error('API返回空数据');
      }
      
      let items: any[] = [];
      if (data.code === 200 && Array.isArray(data.data)) {
        items = data.data;
      } else if (Array.isArray(data)) {
        items = data;
      }
      
      if (items.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ 成功使用API源获取${platform}数据: ${source.name}`);
        }
        
        return items.map((item: any, index: number) => ({
          ...item,
          platform,
          content: `"${item.title}"在${platform}上引发关注。`,
          relatedTopics: [],
          rank: index + 1,
          desc: item.desc || item.title
        }));
      }
      
      continue;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`API源 ${source.name} 获取${platform}数据失败:`, error);
      }
      continue;
    }
  }

  throw new Error(`获取${platform}平台数据失败`);
}

/**
 * 获取支持的平台列表
 */
export function getSupportedPlatforms(): string[] {
  return [
    'weibo',
    'zhihu', 
    'douyin',
    'bilibili',
    'baidu',
    '36kr',
    'ithome'
  ];
}

/**
 * 获取平台显示名称
 */
export function getPlatformDisplayName(platform: string): string {
  const platformNames: Record<string, string> = {
    'weibo': '微博',
    'zhihu': '知乎',
    'douyin': '抖音',
    'bilibili': 'B站',
    'baidu': '百度',
    '36kr': '36氪',
    'ithome': 'IT之家'
  };
  return platformNames[platform] || platform;
}

/**
 * 获取平台图标类名
 */
export function getPlatformIconClass(platform: string): string {
  return `icon-${platform}`;
}

/**
 * 聚合所有平台数据并按综合热度排序
 */
export function aggregateAndSortTopics(allData: Record<string, DailyHotItem[]>): DailyHotItem[] {
  const allTopics: DailyHotItem[] = [];
  
  for (const [platform, items] of Object.entries(allData)) {
    allTopics.push(...items.slice(0, 3));
  }
  
  return allTopics.sort((a, b) => {
    const hotA = parseInt(a.hot) || 0;
    const hotB = parseInt(b.hot) || 0;
    return hotB - hotA;
  });
}

/**
 * 获取热点话题列表
 */
export async function fetchHotTopics(platform?: string): Promise<DailyHotItem[]> {
  try {
    if (platform) {
      return await getDailyHotByPlatform(platform);
    } else {
      const allData = await getDailyHotAll();
      return aggregateAndSortTopics(allData.data);
    }
  } catch (error) {
    console.error('获取热点话题失败:', error);
    return [];
  }
}

/**
 * 获取话题详情
 */
export async function fetchTopicDetail(topicId: string): Promise<DailyHotItem | null> {
  try {
    // 这里可以根据需要实现具体的话题详情获取逻辑
    // 目前返回 null，表示功能暂未实现
    console.log('获取话题详情:', topicId);
    return null;
  } catch (error) {
    console.error('获取话题详情失败:', error);
    return null;
  }
}

/**
 * 获取摩鱼日历数据
 */
export async function fetchMoyuCalendar() {
  const res = await request.get('https://api.vvhan.com/api/moyu');
  return res.data;
}
