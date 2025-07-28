/**
 * 模拟热点话题数据
 * 用作API不可用时的备用数据源
 */

import type { DailyHotItem } from '@/api/hotTopicsService';

/**
 * 生成模拟热点话题数据
 */
export function generateMockHotTopics(): Record<string, DailyHotItem[]> {
  const platforms = ['weibo', 'zhihu', 'douyin', 'bilibili', 'baidu'];
  const mockData: Record<string, DailyHotItem[]> = {};

  platforms.forEach(platform => {
    mockData[platform] = generatePlatformTopics(platform);
  });

  return mockData;
}

/**
 * 为指定平台生成模拟话题
 */
function generatePlatformTopics(platform: string): DailyHotItem[] {
  const topics: DailyHotItem[] = [];
  const topicTemplates = getTopicTemplates(platform);

  for (let i = 0; i < 20; i++) {
    const template = topicTemplates[i % topicTemplates.length];
    const hot = Math.floor(Math.random() * 1000000) + 10000;
    
    topics.push({
      title: `${template.title} ${i + 1}`,
      hot: formatHot(hot),
      url: `https://example.com/${platform}/${i + 1}`,
      index: i + 1,
      desc: template.desc,
      platform,
      content: generateContent(template.title, platform),
      relatedTopics: generateRelatedTopics(template.title),
      rank: i + 1,
      preferenceScore: Math.random() * 100,
      isHighPriority: i < 3
    });
  }

  return topics.sort((a, b) => parseInt(b.hot) - parseInt(a.hot));
}

/**
 * 获取平台话题模板
 */
function getTopicTemplates(platform: string) {
  const templates = {
    weibo: [
      { title: '热门明星动态', desc: '娱乐圈最新消息' },
      { title: '社会热点事件', desc: '引发广泛讨论的社会话题' },
      { title: '科技新闻', desc: '最新科技发展动态' },
      { title: '体育赛事', desc: '精彩体育比赛报道' },
      { title: '美食分享', desc: '网友推荐的美食' }
    ],
    zhihu: [
      { title: '如何看待最新政策', desc: '专业分析和讨论' },
      { title: '技术问题解答', desc: '编程和技术相关问题' },
      { title: '职场经验分享', desc: '工作和职业发展建议' },
      { title: '学习方法讨论', desc: '高效学习技巧分享' },
      { title: '生活感悟', desc: '人生哲理和生活智慧' }
    ],
    douyin: [
      { title: '搞笑视频合集', desc: '爆笑短视频内容' },
      { title: '美妆教程', desc: '化妆技巧和产品推荐' },
      { title: '舞蹈挑战', desc: '热门舞蹈动作教学' },
      { title: '美食制作', desc: '简单易学的美食做法' },
      { title: '宠物日常', desc: '可爱宠物的日常生活' }
    ],
    bilibili: [
      { title: '游戏攻略视频', desc: '热门游戏玩法指南' },
      { title: '动漫解说', desc: '最新动漫剧情分析' },
      { title: '科普知识', desc: '有趣的科学知识分享' },
      { title: '音乐推荐', desc: '好听的音乐作品' },
      { title: '数码评测', desc: '最新数码产品测评' }
    ],
    baidu: [
      { title: '热门搜索词', desc: '网民关注的热点话题' },
      { title: '新闻资讯', desc: '最新新闻报道' },
      { title: '生活服务', desc: '实用生活信息' },
      { title: '教育资源', desc: '学习资料和课程' },
      { title: '健康养生', desc: '健康生活方式建议' }
    ]
  };

  return templates[platform as keyof typeof templates] || templates.weibo;
}

/**
 * 生成话题内容
 */
function generateContent(title: string, platform: string): string {
  const platformNames = {
    weibo: '微博',
    zhihu: '知乎',
    douyin: '抖音',
    bilibili: 'B站',
    baidu: '百度'
  };

  const platformName = platformNames[platform as keyof typeof platformNames] || platform;
  
  return `"${title}"在${platformName}上引发热议。该话题涉及多个方面的讨论，网友们从不同角度分享观点，形成了丰富的讨论内容。相关话题包括背景分析、影响评估、未来展望等。这是一个模拟数据，用于演示和测试目的。`;
}

/**
 * 生成相关话题
 */
function generateRelatedTopics(title: string): string[] {
  const keywords = title.split(/[，。！？\s]+/).filter(word => word.length > 1);
  const relatedTopics = [];
  
  if (keywords.length > 0) {
    const count = Math.min(3, keywords.length);
    for (let i = 0; i < count; i++) {
      const keyword = keywords[i];
      if (keyword && keyword.length > 1) {
        relatedTopics.push(`${keyword}相关讨论`);
      }
    }
  }
  
  if (relatedTopics.length < 3) {
    const generalTopics = ['热门话题', '实时讨论', '最新动态'];
    for (let i = relatedTopics.length; i < 3; i++) {
      relatedTopics.push(generalTopics[i - relatedTopics.length]);
    }
  }
  
  return relatedTopics.slice(0, 3);
}

/**
 * 格式化热度值
 */
function formatHot(hot: number): string {
  if (hot >= 1000000) {
    return `${(hot / 1000000).toFixed(1)}M`;
  } else if (hot >= 1000) {
    return `${(hot / 1000).toFixed(1)}K`;
  }
  return hot.toString();
}

/**
 * 获取模拟的单平台数据
 */
export function getMockPlatformData(platform: string): DailyHotItem[] {
  return generatePlatformTopics(platform);
}

/**
 * 检查是否应该使用模拟数据
 */
export function shouldUseMockData(): boolean {
  // 在开发环境下，如果设置了特定的环境变量，则使用模拟数据
  return import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
         import.meta.env.VITE_OFFLINE_MODE === 'true';
}

/**
 * 创建模拟的API响应格式
 */
export function createMockAPIResponse() {
  return {
    code: 200,
    msg: 'success (mock data)',
    data: generateMockHotTopics()
  };
}
