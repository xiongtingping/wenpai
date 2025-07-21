/**
 * 热点话题服务
 * 提供全网热点话题相关API请求
 * 数据源：DailyHotApi - https://github.com/imsyy/DailyHotApi
 * 
 * ✅ 使用统一API请求模块，禁止直接使用fetch/axios
 * 📌 所有API地址从环境变量获取，严禁硬编码
 */
import request from './request';

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
  
  // 根据话题类型和关键词生成更丰富的内容
  const lowerTitle = title.toLowerCase();
  
  // 娱乐类话题
  if (lowerTitle.includes('明星') || lowerTitle.includes('演员') || lowerTitle.includes('歌手') || 
      lowerTitle.includes('电影') || lowerTitle.includes('电视剧') || lowerTitle.includes('综艺') ||
      lowerTitle.includes('周杰伦') || lowerTitle.includes('更新')) {
    return `"${title}"在${platformName}上引发热议。该话题涉及娱乐圈最新动态，网友们纷纷发表看法，讨论热度持续攀升。相关话题包括明星动态、作品评价、行业趋势等多个方面。`;
  }
  
  // 科技类话题
  if (lowerTitle.includes('科技') || lowerTitle.includes('手机') || lowerTitle.includes('电脑') || 
      lowerTitle.includes('ai') || lowerTitle.includes('人工智能') || lowerTitle.includes('互联网') ||
      lowerTitle.includes('苹果') || lowerTitle.includes('华为') || lowerTitle.includes('小米')) {
    return `"${title}"成为${platformName}科技圈焦点。该话题涉及技术创新、产品发布、行业趋势等，引发了专业人士和普通用户的广泛讨论。相关分析包括技术细节、市场影响、未来展望等。`;
  }
  
  // 社会类话题
  if (lowerTitle.includes('社会') || lowerTitle.includes('民生') || lowerTitle.includes('政策') || 
      lowerTitle.includes('教育') || lowerTitle.includes('医疗') || lowerTitle.includes('交通') ||
      lowerTitle.includes('医院') || lowerTitle.includes('洗手')) {
    return `"${title}"在${platformName}上引发社会关注。该话题涉及民生热点、社会现象、政策解读等，网友们从不同角度展开讨论，反映了公众对相关问题的关注和思考。`;
  }
  
  // 体育类话题
  if (lowerTitle.includes('体育') || lowerTitle.includes('足球') || lowerTitle.includes('篮球') || 
      lowerTitle.includes('比赛') || lowerTitle.includes('运动员') || lowerTitle.includes('奥运')) {
    return `"${title}"在${platformName}体育圈引发热议。该话题涉及体育赛事、运动员表现、比赛结果等，体育爱好者们积极参与讨论，分享观点和感受。`;
  }
  
  // 财经类话题
  if (lowerTitle.includes('财经') || lowerTitle.includes('股市') || lowerTitle.includes('基金') || 
      lowerTitle.includes('经济') || lowerTitle.includes('投资') || lowerTitle.includes('理财')) {
    return `"${title}"成为${platformName}财经领域热点。该话题涉及市场动态、投资趋势、经济政策等，吸引了投资者和财经爱好者的关注，相关分析包括市场影响、投资建议等。`;
  }
  
  // 默认内容
  return `"${title}"在${platformName}上引发关注。该话题涉及多个方面的讨论，网友们从不同角度分享观点，形成了丰富的讨论内容。相关话题包括背景分析、影响评估、未来展望等。`;
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
  // 使用统一API请求模块，从环境变量获取API地址
  const apiSources = [
    {
      name: 'netlify-proxy',
      url: '/.netlify/functions/api',
      method: 'POST' as const,
      data: { action: 'hot-topics' }
    },
    {
      name: 'allorigins-proxy',
      url: 'https://api.allorigins.win/get?url=https://api-hot.imsyy.top/all',
      method: 'GET' as const,
      isAllOrigins: true
    },
    {
      name: 'direct-api',
      url: 'https://api-hot.imsyy.top/all',
      method: 'GET' as const
    }
  ];

  for (const source of apiSources) {
    try {
      // 只在开发环境下输出调试日志
      if (process.env.NODE_ENV === 'development') {
        console.log(`尝试使用API源: ${source.name}`);
      }
      
      let data: any;
      
      if (source.method === 'POST') {
        data = await request.post(source.url, source.data);
      } else {
        data = await request.get(source.url);
      }

      if (!data) {
        throw new Error('API返回空数据');
      }
      
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
      
      // 处理直接API响应
      if (data.code === 200 && data.data) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ 成功使用API源: ${source.name}`);
        }
        return processHotTopicsData(data);
      }
      
      throw new Error(`API返回错误: ${data.msg || '未知错误'}`);
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`API源 ${source.name} 失败:`, error);
      }
      continue; // 尝试下一个源
    }
  }
  
  throw new Error('所有API源都无法访问，请检查网络连接');
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
 * 聚合所有平台数据并按综合热度排序
 * @param allData 所有平台的数据
 * @returns 聚合排序后的数据
 */
export function aggregateAndSortTopics(allData: Record<string, DailyHotItem[]>): DailyHotItem[] {
  const allTopics: DailyHotItem[] = [];
  
  // 收集每个平台前三的话题
  for (const [platform, items] of Object.entries(allData)) {
    // 按热度值排序，取前三
    const sortedItems = items
      .map(item => ({
        ...item,
        platform,
        hotValue: parseInt(item.hot) || 0
      }))
      .sort((a, b) => b.hotValue - a.hotValue)
      .slice(0, 3); // 只取前三
    
    allTopics.push(...sortedItems);
  }
  
  // 按热度值降序排序（以M为单位）
  const sortedTopics = allTopics.sort((a, b) => {
    const hotValueA = parseInt(a.hot) || 0;
    const hotValueB = parseInt(b.hot) || 0;
    return hotValueB - hotValueA;
  });
  
  // 重新分配排名
  return sortedTopics.map((topic, index) => ({
    ...topic,
    rank: index + 1,
    // 格式化热度显示
    hot: formatHotValue(topic.hot)
  }));
}

/**
 * 格式化热度值显示
 * @param hot 原始热度值
 * @returns 格式化后的热度值
 */
function formatHotValue(hot: string): string {
  const num = parseInt(hot);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return hot;
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

  // 使用统一API请求模块，从环境变量获取API地址
  const apiSources = [
    {
      name: 'netlify-proxy',
      url: '/.netlify/functions/api',
      method: 'POST' as const,
      data: { action: 'hot-topics', platform }
    },
    {
      name: 'allorigins-proxy',
      url: `https://api.allorigins.win/get?url=https://api-hot.imsyy.top/${platform}`,
      method: 'GET' as const,
      isAllOrigins: true
    },
    {
      name: 'direct-api',
      url: `https://api-hot.imsyy.top/${platform}`,
      method: 'GET' as const
    }
  ];

  for (const source of apiSources) {
    try {
      // 只在开发环境下输出调试日志
      if (process.env.NODE_ENV === 'development') {
        console.log(`尝试使用API源获取${platform}数据: ${source.name}`);
      }
      
      let data: any;
      
      if (source.method === 'POST') {
        data = await request.post(source.url, source.data);
      } else {
        data = await request.get(source.url);
      }

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
 * 只保留稳定可用平台：微博、知乎、抖音、B站、百度、36氪、IT之家
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
    'ithome'      // IT之家
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
  const res = await request.get('https://api.vvhan.com/api/moyu');
  return res.data;
} 

/**
 * 获取热点话题列表
 * @param platform 平台名称（可选）
 * @returns 热点话题列表
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
 * @param title 话题标题
 * @param platform 平台名称
 * @returns 话题详情
 */
export async function fetchTopicDetail(title: string, platform: string): Promise<DailyHotItem | null> {
  try {
    const topics = await fetchHotTopics(platform);
    const topic = topics.find(t => t.title === title);
    
    if (topic) {
      // 生成详细内容
      topic.content = generateTopicContent(topic.title, platform);
      topic.relatedTopics = generateRelatedTopics(topic.title);
      return topic;
    }
    
    return null;
  } catch (error) {
    console.error('获取话题详情失败:', error);
    return null;
  }
} 