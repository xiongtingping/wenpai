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
  /** 详细内容 */
  content?: string;
  /** 相关话题 */
  relatedTopics?: string[];
  /** 热度排名 */
  rank?: number;
  /** 偏好分数（用于智能排序） */
  preferenceScore?: number;
  /** 匹配的关键词 */
  matchedKeywords?: string[];
  /** 是否为高优先级话题 */
  isHighPriority?: boolean;
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
 * 生成话题详细内容
 * @param title 话题标题
 * @param platform 平台名称
 * @returns 详细内容
 */
function generateTopicContent(title: string, platform: string): string {
  const platformNames = {
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
    'hellogithub': 'HelloGitHub'
  };

  const platformName = platformNames[platform as keyof typeof platformNames] || platform;
  
  // 根据话题标题生成相关内容
  const contentTemplates = [
    `关于"${title}"的话题在${platformName}平台引发了广泛讨论。这个话题涉及多个方面的内容，包括背景信息、相关讨论和重要观点。`,
    `"${title}"是当前${platformName}平台的热点话题之一。这个话题涵盖了相关的背景信息、各方观点和重要讨论内容。`,
    `在${platformName}平台上，"${title}"成为了热门讨论话题。这个话题包含了详细的相关信息、背景介绍和重要观点。`,
    `"${title}"话题在${platformName}平台持续发酵，引发了大量用户的关注和讨论。这个话题涉及多个维度的内容分析。`
  ];

  return contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
}

/**
 * 生成相关话题
 * @param title 话题标题
 * @returns 相关话题列表
 */
function generateRelatedTopics(title: string): string[] {
  // 根据标题关键词生成相关话题
  const keywords = title.split(/[，。！？\s]+/).filter(word => word.length > 1);
  const relatedTopics = [];
  
  if (keywords.length > 0) {
    // 生成2-4个相关话题
    const count = Math.min(3, keywords.length);
    for (let i = 0; i < count; i++) {
      const keyword = keywords[i];
      if (keyword && keyword.length > 1) {
        relatedTopics.push(`${keyword}相关讨论`);
      }
    }
  }
  
  // 添加一些通用相关话题
  if (relatedTopics.length < 3) {
    const generalTopics = ['热门话题', '实时讨论', '最新动态'];
    for (let i = relatedTopics.length; i < 3; i++) {
      relatedTopics.push(generalTopics[i - relatedTopics.length]);
    }
  }
  
  return relatedTopics.slice(0, 3);
}

/**
 * 获取全网热点聚合数据
 * @returns Promise<DailyHotResponse> 全网热点聚合数据
 * @throws Error 当API请求失败时抛出错误
 */
export async function getDailyHotAll(): Promise<DailyHotResponse> {
  // 按照您的方案，优先使用配置了正确CORS的Netlify函数代理
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
      name: 'allorigins-proxy',
      url: 'https://api.allorigins.win/get?url=https://api-hot.imsyy.top/all',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      isAllOrigins: true
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
      // 只在开发环境下输出调试日志
      if (process.env.NODE_ENV === 'development') {
        console.log(`尝试使用API源: ${source.name}`);
      }
      
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
      
      // 处理allorigins代理的响应格式
      if (source.isAllOrigins && data.contents) {
        try {
          const parsedContents = JSON.parse(data.contents);
          if (parsedContents.code === 200 && parsedContents.data) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ 成功使用API源: ${source.name}`);
            }
            return processHotTopicsData(parsedContents);
          }
        } catch (parseError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('解析allorigins响应失败:', parseError);
          }
        }
      }
      
      // 检查标准响应格式
      if (data.code === 200 && data.data) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ 成功使用API源: ${source.name}`);
        }
        return processHotTopicsData(data);
      } else if (data.code === 200 && data.routes) {
        // 处理API路由信息，获取主要平台的数据
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ 获取到API路由信息，开始获取主要平台数据: ${source.name}`);
        }
        
        // 获取主要平台的数据
        const mainPlatforms = ['weibo', 'zhihu', 'bilibili', 'douyin'];
        const platformData: Record<string, DailyHotItem[]> = {};
        
        for (const platform of mainPlatforms) {
          try {
            const platformItems = await getDailyHotByPlatform(platform);
            platformData[platform] = platformItems;
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`获取${platform}数据失败:`, error);
            }
            platformData[platform] = [];
          }
        }
        
        return {
          code: 200,
          msg: 'success',
          data: platformData
        };
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`API源 ${source.name} 失败:`, error);
        
        // 详细的CORS错误处理
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
          console.warn(`检测到CORS错误，尝试下一个API源: ${source.name}`);
        }
      }
      
      // 继续尝试下一个源
      continue;
    }
  }

  // 所有API源都失败了
  throw new Error('无法获取热点数据，请检查网络连接或稍后重试');
}

/**
 * 处理热点话题数据，添加详细内容和相关话题
 * @param response 原始API响应
 * @returns 处理后的数据
 */
function processHotTopicsData(response: DailyHotResponse): DailyHotResponse {
  const processedData: Record<string, DailyHotItem[]> = {};
  
  for (const [platform, items] of Object.entries(response.data)) {
    // 跳过不需要的平台
    if (platform === 'weatheralarm' || platform === 'earthquake') {
      continue;
    }
    
    processedData[platform] = items.map((item, index) => ({
      ...item,
      platform,
      content: generateTopicContent(item.title, platform),
      relatedTopics: generateRelatedTopics(item.title),
      rank: index + 1, // 添加正确的排名
      desc: item.desc || item.title // 如果desc为空，使用title
    }));
  }
  
  return {
    ...response,
    data: processedData
  };
}

/**
 * 获取指定平台热榜数据
 * @param platform 平台标识（如：weibo、zhihu、douyin等）
 * @returns Promise<DailyHotItem[]> 平台热榜数据
 */
export async function getDailyHotByPlatform(platform: string): Promise<DailyHotItem[]> {
  // 跳过不需要的平台
  if (platform === 'weatheralarm' || platform === 'earthquake') {
    return [];
  }

  // 按照您的方案，优先使用配置了正确CORS的Netlify函数代理
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
      name: 'allorigins-proxy',
      url: `https://api.allorigins.win/get?url=https://api-hot.imsyy.top/${platform}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      isAllOrigins: true
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
      // 只在开发环境下输出调试日志
      if (process.env.NODE_ENV === 'development') {
        console.log(`尝试使用API源获取${platform}数据: ${source.name}`);
      }
      
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

      // 处理allorigins代理的响应格式
      let processedData = data;
      if (source.isAllOrigins && data.contents) {
        try {
          processedData = JSON.parse(data.contents);
        } catch (parseError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('解析allorigins响应失败:', parseError);
          }
          continue; // 尝试下一个源
        }
      }

      // 处理不同的响应格式
      let items: any[] = [];
      if (processedData.code === 200 && Array.isArray(processedData.data)) {
        // 标准格式：{ code: 200, data: [...] }
        items = processedData.data;
      } else if (Array.isArray(processedData)) {
        // 直接返回数组格式
        items = processedData;
      } else if (processedData.code === 200 && typeof processedData.data === 'object') {
        // 对象格式，尝试提取数组
        const responseData = processedData.data;
        if (Array.isArray(responseData)) {
          items = responseData;
        } else {
          // 如果是对象，尝试找到包含数组的字段
          const arrayFields = Object.keys(responseData).filter(key => Array.isArray(responseData[key]));
          if (arrayFields.length > 0) {
            items = responseData[arrayFields[0]];
          }
        }
      } else if (processedData.error) {
        throw new Error(processedData.error);
      }
      
      if (items.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ 成功使用API源获取${platform}数据: ${source.name}`);
        }
        
        // 处理数据，添加详细内容和相关话题
        return items.map((item: any, index: number) => ({
          ...item,
          platform,
          content: generateTopicContent(item.title, platform),
          relatedTopics: generateRelatedTopics(item.title),
          rank: index + 1,
          desc: item.desc || item.title
        }));
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`平台${platform}返回数据格式异常:`, processedData);
      }
      continue; // 尝试下一个源
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`API源 ${source.name} 获取${platform}数据失败:`, error);
      }
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
    'hellogithub' // HelloGitHub
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
    'hellogithub': 'HelloGitHub'
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
    'hellogithub': 'icon-hellogithub'
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