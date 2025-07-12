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
 * DailyHotApi 响应数据结构
 */
export interface DailyHotResponse {
  /** 响应状态码 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 响应数据 */
  data: Record<string, DailyHotItem[]>;
}

/**
 * 获取全网热点聚合数据
 * @returns Promise<DailyHotResponse> 全网热点聚合数据
 * @throws Error 当API请求失败时抛出错误
 */
export async function getDailyHotAll(): Promise<DailyHotResponse> {
  // 尝试多个API源，确保能够获取到真实数据
  const apiSources = [
    {
      name: 'netlify-proxy',
      url: '/.netlify/functions/api',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'hot-topics' })
    },
    {
      name: 'direct-api',
      url: 'https://api-hot.imsyy.top/all',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  ];

  for (const source of apiSources) {
    try {
      console.log(`尝试使用API源: ${source.name}`);
      
      const options: RequestInit = {
        method: source.method,
        headers: source.headers
      };

      if (source.body) {
        options.body = source.body;
      }

      const response = await fetch(source.url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 检查响应格式
      if (data.code === 200 && data.data) {
        console.log(`✅ 成功使用API源: ${source.name}`);
        return data;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(`API源 ${source.name} 失败:`, error);
      // 继续尝试下一个源
      continue;
    }
  }

  // 所有API源都失败了
  throw new Error('无法获取热点数据，请检查网络连接或稍后重试');
}

/**
 * 获取指定平台热榜数据
 * @param platform 平台标识（如：weibo、zhihu、douyin等）
 * @returns Promise<DailyHotItem[]> 平台热榜数据
 */
export async function getDailyHotByPlatform(platform: string): Promise<DailyHotItem[]> {
  // 尝试多个API源，确保能够获取到真实数据
  const apiSources = [
    {
      name: 'netlify-proxy',
      url: '/.netlify/functions/api',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'hot-topics', platform })
    },
    {
      name: 'direct-api',
      url: `https://api-hot.imsyy.top/${platform}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  ];

  for (const source of apiSources) {
    try {
      console.log(`尝试使用API源获取${platform}数据: ${source.name}`);
      
      const options: RequestInit = {
        method: source.method,
        headers: source.headers
      };

      if (source.body) {
        options.body = source.body;
      }

      const response = await fetch(source.url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 检查响应数据格式
      if (!data) {
        throw new Error('API返回空数据');
      }

      // 处理不同的响应格式
      if (data.code === 200 && Array.isArray(data.data)) {
        // 标准格式：{ code: 200, data: [...] }
        console.log(`✅ 成功使用API源获取${platform}数据: ${source.name}`);
        return data.data.map((item: any) => ({
          ...item,
          platform // 添加平台标识
        }));
      } else if (Array.isArray(data)) {
        // 直接返回数组格式
        console.log(`✅ 成功使用API源获取${platform}数据: ${source.name}`);
        return data.map((item: any) => ({
          ...item,
          platform // 添加平台标识
        }));
      } else if (data.code === 200 && typeof data.data === 'object') {
        // 对象格式，尝试提取数组
        const responseData = data.data;
        if (Array.isArray(responseData)) {
          console.log(`✅ 成功使用API源获取${platform}数据: ${source.name}`);
          return responseData.map((item: any) => ({
            ...item,
            platform
          }));
        } else {
          // 如果是对象，尝试找到包含数组的字段
          const arrayFields = Object.keys(responseData).filter(key => Array.isArray(responseData[key]));
          if (arrayFields.length > 0) {
            console.log(`✅ 成功使用API源获取${platform}数据: ${source.name}`);
            return responseData[arrayFields[0]].map((item: any) => ({
              ...item,
              platform
            }));
          }
        }
      } else if (data.error) {
        throw new Error(data.error);
      }
      
      console.warn(`平台${platform}返回数据格式异常:`, data);
      continue; // 尝试下一个源
    } catch (error) {
      console.error(`API源 ${source.name} 获取${platform}数据失败:`, error);
      // 继续尝试下一个源
      continue;
    }
  }

  // 所有API源都失败了
  throw new Error(`无法获取${platform}平台数据，请检查网络连接或稍后重试`);
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
    'weibo': '微博',
    'zhihu': '知乎',
    'douyin': '抖音',
    'bilibili': 'B站',
    'baidu': '百度',
    '36kr': '36氪',
    'ithome': 'IT之家',
    'sspai': '少数派',
    'juejin': '掘金',
    'csdn': 'CSDN',
    'github': 'GitHub',
    'v2ex': 'V2EX',
    'ngabbs': 'NGA',
    'hellogithub': 'HelloGitHub',
    'weatheralarm': '中央气象台',
    'earthquake': '中国地震台',
    'history': '历史上的今天'
  };
  
  return platformNames[platform] || platform;
}

/**
 * 获取平台图标CSS类名
 * @param platform 平台标识
 * @returns string 图标CSS类名
 */
export function getPlatformIconClass(platform: string): string {
  const platformIcons: Record<string, string> = {
    'weibo': 'icon-weibo',
    'zhihu': 'icon-zhihu',
    'douyin': 'icon-douyin',
    'bilibili': 'icon-bilibili',
    'baidu': 'icon-baidu',
    '36kr': 'icon-36kr',
    'ithome': 'icon-ithome',
    'sspai': 'icon-sspai',
    'juejin': 'icon-juejin',
    'csdn': 'icon-csdn',
    'github': 'icon-github',
    'v2ex': 'icon-v2ex',
    'ngabbs': 'icon-ngabbs',
    'hellogithub': 'icon-hellogithub',
    'weatheralarm': 'icon-weather',
    'earthquake': 'icon-earthquake',
    'history': 'icon-history'
  };
  
  return platformIcons[platform] || 'icon-default';
}



/**
 * 获取摩鱼日历数据
 * @returns Promise<any>
 */
export async function fetchMoyuCalendar() {
  const res = await axios.get('https://api.vvhan.com/api/moyu');
  return res.data;
} 