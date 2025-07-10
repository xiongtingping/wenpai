/**
 * 热点话题服务
 * 提供全网热点话题相关API请求
 * 数据源：DailyHotApi - https://github.com/imsyy/DailyHotApi
 */
import axios from 'axios';

/**
 * DailyHotApi 单条热榜数据结构
 */
export interface DailyHotItem {
  /** 话题标题 */
  title: string;
  /** 热度值 */
  hot: string;
  /** 详情链接 */
  url: string;
  /** 移动端链接 */
  mobil_url?: string;
  /** 榜单序号 */
  index?: number;
  /** 话题描述 */
  desc?: string;
  /** 话题图片 */
  pic?: string;
  /** 平台标识（用于聚合数据时标识来源） */
  platform?: string;
}

/**
 * DailyHotApi 平台热榜数据结构
 */
export interface DailyHotPlatform {
  /** 平台名称 */
  name: string;
  /** 平台标识 */
  key: string;
  /** 热榜数据 */
  data: DailyHotItem[];
}

/**
 * DailyHotApi 聚合返回数据结构
 */
export interface DailyHotResponse {
  /** 状态码 */
  code: number;
  /** 消息 */
  msg: string;
  /** 数据 */
  data: Record<string, DailyHotItem[]>;
}

/**
 * 获取全网热点聚合数据
 * @returns Promise<DailyHotResponse> 全网热点聚合数据
 * @throws Error 当API请求失败时抛出错误
 */
export async function getDailyHotAll(): Promise<DailyHotResponse> {
  try {
    // 获取支持的平台列表
    const supportedPlatforms = getSupportedPlatforms();
    const aggregatedData: Record<string, DailyHotItem[]> = {};
    
    // 并发请求各个平台的数据
    const platformPromises = supportedPlatforms.map(async (platform) => {
      try {
        const platformData = await getDailyHotByPlatform(platform);
        if (platformData.length > 0) {
          aggregatedData[platform] = platformData;
        }
        return { platform, success: true, count: platformData.length };
      } catch (error) {
        console.warn(`获取${platform}数据失败:`, error);
        return { platform, success: false, count: 0 };
      }
    });
    
    // 等待所有请求完成
    const results = await Promise.allSettled(platformPromises);
    
    // 统计成功和失败的平台
    const successfulPlatforms = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value)
      .filter(result => result.success);
    
    const failedPlatforms = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value)
      .filter(result => !result.success);
    
    console.log(`热点数据获取完成: ${successfulPlatforms.length}个平台成功, ${failedPlatforms.length}个平台失败`);
    
    // 检查是否有任何平台数据获取成功
    if (Object.keys(aggregatedData).length === 0) {
      throw new Error('所有平台数据获取失败，请检查网络连接或API服务状态');
    }
    
    return {
      code: 200,
      msg: 'success',
      data: aggregatedData
    };
  } catch (error) {
    console.error('获取全网热点数据失败:', error);
    // 直接抛出错误，不返回模拟数据
    throw new Error(`获取全网热点数据失败: ${error instanceof Error ? error.message : '网络连接异常'}`);
  }
}

/**
 * 获取指定平台热榜数据
 * @param platform 平台标识（如：weibo、zhihu、douyin等）
 * @returns Promise<DailyHotItem[]> 平台热榜数据
 */
export async function getDailyHotByPlatform(platform: string): Promise<DailyHotItem[]> {
  try {
    const res = await axios.get(`https://api-hot.imsyy.top/${platform}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 8000
    });
    
    // 检查响应数据格式
    if (!res.data) {
      throw new Error('API返回空数据');
    }
    
    // 处理不同的响应格式
    if (res.data.code === 200 && Array.isArray(res.data.data)) {
      // 标准格式：{ code: 200, data: [...] }
      return res.data.data.map((item: any) => ({
        ...item,
        platform // 添加平台标识
      }));
    } else if (Array.isArray(res.data)) {
      // 直接返回数组格式
      return res.data.map((item: any) => ({
        ...item,
        platform // 添加平台标识
      }));
    } else if (res.data.code === 200 && typeof res.data.data === 'object') {
      // 对象格式，尝试提取数组
      const data = res.data.data;
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          ...item,
          platform
        }));
      } else {
        // 如果是对象，尝试找到包含数组的字段
        const arrayFields = Object.keys(data).filter(key => Array.isArray(data[key]));
        if (arrayFields.length > 0) {
          return data[arrayFields[0]].map((item: any) => ({
            ...item,
            platform
          }));
        }
      }
    }
    
    console.warn(`平台${platform}返回数据格式异常:`, res.data);
    return [];
  } catch (error) {
    console.error(`获取${platform}热榜数据失败:`, error);
    throw error; // 重新抛出错误，让调用方处理
  }
}

/**
 * 获取支持的平台列表
 * @returns string[] 支持的平台标识列表
 */
export function getSupportedPlatforms(): string[] {
  return [
    'weibo',      // 微博
    'zhihu',      // 知乎
    'douyin',     // 抖音
    'bilibili',   // B站
    'baidu',      // 百度
    '36kr',       // 36氪
    'ithome',     // IT之家
    'sspai',      // 少数派
    'juejin',     // 掘金
    'csdn',       // CSDN
    'github',     // GitHub
    'v2ex',       // V2EX
    'ngabbs',     // NGA
    'hellogithub', // HelloGitHub
    'weatheralarm', // 中央气象台
    'earthquake',   // 中国地震台
    'history'       // 历史上的今天
  ];
}

/**
 * 获取平台显示名称
 * @param platform 平台标识
 * @returns string 平台显示名称
 */
export function getPlatformDisplayName(platform: string): string {
  const platformNames: Record<string, string> = {
    weibo: '微博',
    zhihu: '知乎',
    douyin: '抖音',
    bilibili: 'B站',
    baidu: '百度',
    '36kr': '36氪',
    ithome: 'IT之家',
    sspai: '少数派',
    juejin: '掘金',
    csdn: 'CSDN',
    github: 'GitHub',
    v2ex: 'V2EX',
    ngabbs: 'NGA',
    hellogithub: 'HelloGitHub',
    weatheralarm: '中央气象台',
    earthquake: '中国地震台',
    history: '历史上的今天'
  };
  return platformNames[platform] || platform;
}

/**
 * 获取平台图标样式
 * @param platform 平台标识
 * @returns string 平台图标CSS类名
 */
export function getPlatformIconClass(platform: string): string {
  const iconClasses: Record<string, string> = {
    weibo: 'bg-orange-500',
    zhihu: 'bg-blue-500',
    douyin: 'bg-black',
    bilibili: 'bg-pink-500',
    baidu: 'bg-blue-600',
    '36kr': 'bg-green-500',
    ithome: 'bg-blue-700',
    sspai: 'bg-purple-500',
    juejin: 'bg-yellow-500',
    csdn: 'bg-red-500',
    github: 'bg-gray-800',
    v2ex: 'bg-green-600',
    ngabbs: 'bg-blue-800',
    hellogithub: 'bg-purple-600',
    weatheralarm: 'bg-yellow-600',
    earthquake: 'bg-red-600',
    history: 'bg-indigo-500'
  };
  return iconClasses[platform] || 'bg-gray-500';
}

/**
 * 获取抖音热榜数据（保留原有接口兼容性）
 * @returns Promise<DailyHotItem[]> 抖音热榜列表
 */
export async function getDouyinHotList(): Promise<DailyHotItem[]> {
  return getDailyHotByPlatform('douyin');
      }

/**
 * 获取摩鱼日历数据
 * @returns Promise<any>
 */
export async function fetchMoyuCalendar() {
  const res = await axios.get('https://api.vvhan.com/api/moyu');
  return res.data;
} 