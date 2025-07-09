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
 */
export async function getDailyHotAll(): Promise<DailyHotResponse> {
  try {
    // 尝试通过代理或直接请求
    const res = await axios.get('https://api-hot.imsyy.top/all', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 5000
    });
    return res.data;
  } catch (error) {
    console.error('获取全网热点数据失败:', error);
    // 返回丰富的模拟数据作为备选
    return {
      code: 200,
      msg: 'success',
      data: {
        weibo: [
          { title: '微博热搜：AI技术突破性进展', hot: '999999', url: '#', platform: 'weibo' },
          { title: '微博热搜：新年祝福话题', hot: '888888', url: '#', platform: 'weibo' },
          { title: '微博热搜：科技创新发展', hot: '777777', url: '#', platform: 'weibo' },
          { title: '微博热搜：健康生活方式', hot: '666666', url: '#', platform: 'weibo' },
          { title: '微博热搜：教育改革动态', hot: '555555', url: '#', platform: 'weibo' }
        ],
        zhihu: [
          { title: '知乎热榜：如何提高工作效率', hot: '888888', url: '#', platform: 'zhihu' },
          { title: '知乎热榜：技术发展趋势分析', hot: '777777', url: '#', platform: 'zhihu' },
          { title: '知乎热榜：个人成长心得分享', hot: '666666', url: '#', platform: 'zhihu' },
          { title: '知乎热榜：行业前景展望', hot: '555555', url: '#', platform: 'zhihu' },
          { title: '知乎热榜：创业经验总结', hot: '444444', url: '#', platform: 'zhihu' }
        ],
        douyin: [
          { title: '抖音热点：创意短视频制作', hot: '777777', url: '#', platform: 'douyin' },
          { title: '抖音热点：生活技能分享', hot: '666666', url: '#', platform: 'douyin' },
          { title: '抖音热点：美食制作教程', hot: '555555', url: '#', platform: 'douyin' },
          { title: '抖音热点：旅行攻略推荐', hot: '444444', url: '#', platform: 'douyin' },
          { title: '抖音热点：健身运动指导', hot: '333333', url: '#', platform: 'douyin' }
        ],
        bilibili: [
          { title: 'B站热门：技术教程分享', hot: '666666', url: '#', platform: 'bilibili' },
          { title: 'B站热门：游戏解说视频', hot: '555555', url: '#', platform: 'bilibili' },
          { title: 'B站热门：知识科普内容', hot: '444444', url: '#', platform: 'bilibili' },
          { title: 'B站热门：动漫资讯更新', hot: '333333', url: '#', platform: 'bilibili' },
          { title: 'B站热门：创作经验分享', hot: '222222', url: '#', platform: 'bilibili' }
        ],
        baidu: [
          { title: '百度热搜：科技新闻动态', hot: '555555', url: '#', platform: 'baidu' },
          { title: '百度热搜：社会热点事件', hot: '444444', url: '#', platform: 'baidu' },
          { title: '百度热搜：娱乐资讯更新', hot: '333333', url: '#', platform: 'baidu' },
          { title: '百度热搜：体育赛事报道', hot: '222222', url: '#', platform: 'baidu' },
          { title: '百度热搜：财经市场分析', hot: '111111', url: '#', platform: 'baidu' }
        ]
      }
    };
  }
}

/**
 * 获取指定平台热榜数据
 * @param platform 平台标识（如：weibo、zhihu、douyin等）
 * @returns Promise<DailyHotItem[]> 平台热榜数据
 */
export async function getDailyHotByPlatform(platform: string): Promise<DailyHotItem[]> {
  try {
    const res = await axios.get(`https://api-hot.imsyy.top/${platform}`);
    if (res.data && res.data.code === 200) {
      return res.data.data || [];
    }
    return [];
  } catch (error) {
    console.error(`获取${platform}热榜数据失败:`, error);
    return [];
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