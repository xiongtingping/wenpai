/**
 * 内容适配方案配置
 * 定义不同的内容风格和适配策略
 */

export interface ContentScheme {
  id: string;
  name: string;
  description: string;
  version: string;
  isDefault?: boolean;
  platforms: PlatformScheme[];
  globalSettings: GlobalSchemeSettings;
  promptTemplate: string;
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
  };
}

export interface PlatformScheme {
  platformId: string;
  name: string;
  description: string;
  style: string;
  wordLimit: {
    min: number;
    max: number;
  };
  hashtagCount: number;
  tone: string;
  features: string[];
  promptModifiers: string[];
}

export interface GlobalSchemeSettings {
  defaultTone: string;
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'heavy';
  formatStyle: 'plain' | 'markdown' | 'rich';
  contentStructure: 'free' | 'structured' | 'template';
  languageStyle: 'casual' | 'professional' | 'creative' | 'academic';
}

/**
 * 默认方案 - 通用内容适配
 */
export const DEFAULT_SCHEME: ContentScheme = {
  id: 'default',
  name: '通用适配方案',
  description: '适用于大多数平台的标准内容适配方案，平衡专业性和可读性',
  version: '1.0.0',
  isDefault: true,
  platforms: [
    {
      platformId: 'xiaohongshu',
      name: '小红书',
      description: '小红书笔记风格',
      style: '种草分享风格，注重个人体验和实用价值',
      wordLimit: { min: 100, max: 1000 },
      hashtagCount: 20,
      tone: '亲切、分享、种草',
      features: ['个人体验', '图片展示', '标签丰富', '实用价值'],
      promptModifiers: [
        '使用第一人称叙述',
        '加入个人感受和体验',
        '突出实用价值和购买理由',
        '使用emoji增加亲和力'
      ]
    },
    {
      platformId: 'weibo',
      name: '微博',
      description: '微博短文风格',
      style: '简洁明了，热点敏感，互动性强',
      wordLimit: { min: 20, max: 2000 },
      hashtagCount: 3,
      tone: '简洁、热点、互动',
      features: ['话题标签', '@用户', '转发互动', '热点敏感'],
      promptModifiers: [
        '保持简洁明了',
        '加入相关话题标签',
        '鼓励用户互动',
        '关注热点话题'
      ]
    },
    {
      platformId: 'wechat',
      name: '微信',
      description: '微信公众号风格',
      style: '专业权威，深度内容，图文并茂',
      wordLimit: { min: 300, max: 20000 },
      hashtagCount: 0,
      tone: '专业、权威、深度',
      features: ['图文并茂', '深度内容', '专业术语', '权威性'],
      promptModifiers: [
        '使用专业术语',
        '提供深度分析',
        '保持权威性',
        '结构清晰'
      ]
    },
    {
      platformId: 'douyin',
      name: '抖音',
      description: '抖音短视频风格',
      style: '轻松有趣，节奏感强，互动引导',
      wordLimit: { min: 50, max: 1000 },
      hashtagCount: 5,
      tone: '轻松、有趣、活力',
      features: ['视频脚本', '音乐配合', '互动引导', '节奏感'],
      promptModifiers: [
        '保持轻松有趣的语调',
        '加入互动引导',
        '考虑视频节奏',
        '使用流行词汇'
      ]
    },
    {
      platformId: 'zhihu',
      name: '知乎',
      description: '知乎问答风格',
      style: '专业深度，逻辑清晰，引用权威',
      wordLimit: { min: 200, max: 10000 },
      hashtagCount: 0,
      tone: '专业、深度、逻辑',
      features: ['详细解答', '专业术语', '引用来源', '逻辑清晰'],
      promptModifiers: [
        '提供详细解答',
        '使用专业术语',
        '逻辑结构清晰',
        '引用权威来源'
      ]
    },
    {
      platformId: 'bilibili',
      name: 'B站',
      description: 'B站视频风格',
      style: '年轻活力，弹幕友好，分区明确',
      wordLimit: { min: 100, max: 5000 },
      hashtagCount: 10,
      tone: '年轻、活力、友好',
      features: ['弹幕互动', '视频标题', '分区标签', '年轻化'],
      promptModifiers: [
        '使用年轻化表达',
        '考虑弹幕互动',
        '明确分区定位',
        '保持友好氛围'
      ]
    }
  ],
  globalSettings: {
    defaultTone: '专业友好',
    emojiUsage: 'moderate',
    formatStyle: 'plain',
    contentStructure: 'structured',
    languageStyle: 'professional'
  },
  promptTemplate: `你是一个专业的内容适配专家，需要将原始内容适配到不同的社交媒体平台。

原始内容：
{originalContent}

目标平台：{platformName}
平台特点：{platformStyle}
字数要求：{wordLimit}
标签数量：{hashtagCount}
语调风格：{tone}
特色功能：{features}

适配要求：
1. 严格按照平台字数限制
2. 符合平台语调风格
3. 融入平台特色功能
4. 保持内容核心价值
5. 优化用户阅读体验

请为每个平台生成独立的内容，格式如下：
=== {platformName} ===
{adaptedContent}
=== 结束 ===

请确保每个平台的内容都是完整独立的，不要混合多个平台的内容。`,
  metadata: {
    author: 'AI Content Adapter',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    tags: ['通用', '标准', '多平台']
  }
};

/**
 * 营销推广方案
 */
export const MARKETING_SCHEME: ContentScheme = {
  id: 'marketing',
  name: '营销推广方案',
  description: '专注于品牌推广和产品营销的内容适配方案',
  version: '1.0.0',
  platforms: [
    {
      platformId: 'xiaohongshu',
      name: '小红书',
      description: '小红书种草营销',
      style: 'KOL种草风格，突出产品卖点和用户痛点',
      wordLimit: { min: 100, max: 1000 },
      hashtagCount: 20,
      tone: '种草、推荐、专业',
      features: ['产品展示', '用户痛点', '购买理由', 'KOL风格'],
      promptModifiers: [
        '突出产品核心卖点',
        '解决用户痛点',
        '提供购买理由',
        '使用KOL表达方式'
      ]
    },
    {
      platformId: 'weibo',
      name: '微博',
      description: '微博热点营销',
      style: '热点借势，话题营销，病毒传播',
      wordLimit: { min: 20, max: 2000 },
      hashtagCount: 3,
      tone: '热点、话题、传播',
      features: ['热点借势', '话题营销', '病毒传播', '互动引导'],
      promptModifiers: [
        '结合当前热点',
        '创造话题标签',
        '鼓励转发传播',
        '设置互动话题'
      ]
    },
    {
      platformId: 'wechat',
      name: '微信',
      description: '微信深度营销',
      style: '品牌故事，深度分析，权威背书',
      wordLimit: { min: 300, max: 20000 },
      hashtagCount: 0,
      tone: '权威、专业、可信',
      features: ['品牌故事', '深度分析', '权威背书', '专业术语'],
      promptModifiers: [
        '讲述品牌故事',
        '提供深度分析',
        '加入权威背书',
        '使用专业术语'
      ]
    },
    {
      platformId: 'douyin',
      name: '抖音',
      description: '抖音短视频营销',
      style: '创意展示，音乐配合，快速吸引',
      wordLimit: { min: 50, max: 1000 },
      hashtagCount: 5,
      tone: '创意、活力、吸引',
      features: ['创意展示', '音乐配合', '快速吸引', '视觉冲击'],
      promptModifiers: [
        '突出创意元素',
        '考虑音乐配合',
        '快速抓住注意力',
        '强调视觉冲击'
      ]
    },
    {
      platformId: 'zhihu',
      name: '知乎',
      description: '知乎专业营销',
      style: '专业解答，数据支撑，权威论证',
      wordLimit: { min: 200, max: 10000 },
      hashtagCount: 0,
      tone: '专业、权威、可信',
      features: ['专业解答', '数据支撑', '权威论证', '逻辑清晰'],
      promptModifiers: [
        '提供专业解答',
        '加入数据支撑',
        '权威论证观点',
        '保持逻辑清晰'
      ]
    },
    {
      platformId: 'bilibili',
      name: 'B站',
      description: 'B站年轻营销',
      style: '年轻化表达，二次元元素，互动营销',
      wordLimit: { min: 100, max: 5000 },
      hashtagCount: 10,
      tone: '年轻、活力、二次元',
      features: ['年轻化表达', '二次元元素', '互动营销', '分区定位'],
      promptModifiers: [
        '使用年轻化表达',
        '融入二次元元素',
        '设置互动环节',
        '明确分区定位'
      ]
    }
  ],
  globalSettings: {
    defaultTone: '营销专业',
    emojiUsage: 'moderate',
    formatStyle: 'rich',
    contentStructure: 'template',
    languageStyle: 'professional'
  },
  promptTemplate: `你是一个专业的营销内容适配专家，需要将产品/服务内容适配到不同的社交媒体平台进行营销推广。

原始内容：
{originalContent}

目标平台：{platformName}
营销风格：{platformStyle}
字数要求：{wordLimit}
标签数量：{hashtagCount}
营销语调：{tone}
营销特色：{features}

营销要求：
1. 突出产品/服务核心价值
2. 解决目标用户痛点
3. 创造购买动机
4. 符合平台营销特点
5. 优化转化效果

请为每个平台生成独立的营销内容，格式如下：
=== {platformName} ===
{adaptedContent}
=== 结束 ===

请确保每个平台的内容都是完整独立的营销文案，不要混合多个平台的内容。`,
  metadata: {
    author: 'AI Content Adapter',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    tags: ['营销', '推广', '转化']
  }
};

/**
 * 创意写作方案
 */
export const CREATIVE_SCHEME: ContentScheme = {
  id: 'creative',
  name: '创意写作方案',
  description: '注重创意表达和文学性的内容适配方案',
  version: '1.0.0',
  platforms: [
    {
      platformId: 'xiaohongshu',
      name: '小红书',
      description: '小红书创意笔记',
      style: '文艺清新，故事性强，情感共鸣',
      wordLimit: { min: 100, max: 1000 },
      hashtagCount: 20,
      tone: '文艺、清新、情感',
      features: ['故事性强', '情感共鸣', '文艺表达', '生活美学'],
      promptModifiers: [
        '讲述生动故事',
        '引发情感共鸣',
        '使用文艺表达',
        '体现生活美学'
      ]
    },
    {
      platformId: 'weibo',
      name: '微博',
      description: '微博创意短文',
      style: '金句频出，观点独特，传播性强',
      wordLimit: { min: 20, max: 2000 },
      hashtagCount: 3,
      tone: '独特、犀利、传播',
      features: ['金句频出', '观点独特', '传播性强', '话题性'],
      promptModifiers: [
        '创造金句表达',
        '提出独特观点',
        '增强传播性',
        '制造话题性'
      ]
    },
    {
      platformId: 'wechat',
      name: '微信',
      description: '微信深度文章',
      style: '文学性强，思想深度，艺术表达',
      wordLimit: { min: 300, max: 20000 },
      hashtagCount: 0,
      tone: '文学、深度、艺术',
      features: ['文学性强', '思想深度', '艺术表达', '文化内涵'],
      promptModifiers: [
        '增强文学性',
        '体现思想深度',
        '使用艺术表达',
        '融入文化内涵'
      ]
    },
    {
      platformId: 'douyin',
      name: '抖音',
      description: '抖音创意脚本',
      style: '创意十足，节奏感强，视觉冲击',
      wordLimit: { min: 50, max: 1000 },
      hashtagCount: 5,
      tone: '创意、活力、冲击',
      features: ['创意十足', '节奏感强', '视觉冲击', '音乐配合'],
      promptModifiers: [
        '突出创意元素',
        '增强节奏感',
        '创造视觉冲击',
        '配合音乐节奏'
      ]
    },
    {
      platformId: 'zhihu',
      name: '知乎',
      description: '知乎深度创作',
      style: '思想深刻，逻辑严密，文化底蕴',
      wordLimit: { min: 200, max: 10000 },
      hashtagCount: 0,
      tone: '深刻、严密、底蕴',
      features: ['思想深刻', '逻辑严密', '文化底蕴', '学术性'],
      promptModifiers: [
        '体现思想深刻',
        '保持逻辑严密',
        '展现文化底蕴',
        '增强学术性'
      ]
    },
    {
      platformId: 'bilibili',
      name: 'B站',
      description: 'B站创意内容',
      style: '二次元创意，年轻活力，文化融合',
      wordLimit: { min: 100, max: 5000 },
      hashtagCount: 10,
      tone: '二次元、活力、融合',
      features: ['二次元创意', '年轻活力', '文化融合', '互动创意'],
      promptModifiers: [
        '融入二次元元素',
        '保持年轻活力',
        '实现文化融合',
        '增加互动创意'
      ]
    }
  ],
  globalSettings: {
    defaultTone: '创意文学',
    emojiUsage: 'moderate',
    formatStyle: 'rich',
    contentStructure: 'free',
    languageStyle: 'creative'
  },
  promptTemplate: `你是一个专业的创意写作专家，需要将内容以创意文学的方式适配到不同的社交媒体平台。

原始内容：
{originalContent}

目标平台：{platformName}
创意风格：{platformStyle}
字数要求：{wordLimit}
标签数量：{hashtagCount}
创意语调：{tone}
创意特色：{features}

创意要求：
1. 运用文学修辞手法
2. 创造独特的表达方式
3. 增强情感共鸣
4. 符合平台创意特点
5. 提升艺术价值

请为每个平台生成独立的创意内容，格式如下：
=== {platformName} ===
{adaptedContent}
=== 结束 ===

请确保每个平台的内容都是完整独立的创意作品，不要混合多个平台的内容。`,
  metadata: {
    author: 'AI Content Adapter',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    tags: ['创意', '文学', '艺术']
  }
};

/**
 * 所有可用方案
 */
export const AVAILABLE_SCHEMES: ContentScheme[] = [
  DEFAULT_SCHEME,
  MARKETING_SCHEME,
  CREATIVE_SCHEME
];

/**
 * 获取方案配置
 * @param schemeId 方案ID
 * @returns ContentScheme | null
 */
export function getScheme(schemeId: string): ContentScheme | null {
  return AVAILABLE_SCHEMES.find(scheme => scheme.id === schemeId) || null;
}

/**
 * 获取默认方案
 * @returns ContentScheme
 */
export function getDefaultScheme(): ContentScheme {
  return AVAILABLE_SCHEMES.find(scheme => scheme.isDefault) || DEFAULT_SCHEME;
}

/**
 * 获取所有可用方案
 * @returns ContentScheme[]
 */
export function getAllSchemes(): ContentScheme[] {
  return AVAILABLE_SCHEMES;
}

/**
 * 获取方案中的平台配置
 * @param schemeId 方案ID
 * @param platformId 平台ID
 * @returns PlatformScheme | null
 */
export function getPlatformScheme(schemeId: string, platformId: string): PlatformScheme | null {
  const scheme = getScheme(schemeId);
  if (!scheme) return null;
  
  return scheme.platforms.find(platform => platform.platformId === platformId) || null;
}

/**
 * 验证方案配置
 * @param scheme ContentScheme
 * @returns { isValid: boolean; errors: string[] }
 */
export function validateScheme(scheme: ContentScheme): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!scheme.id || !scheme.name) {
    errors.push('方案ID和名称不能为空');
  }
  
  if (!scheme.platforms || scheme.platforms.length === 0) {
    errors.push('方案必须包含至少一个平台配置');
  }
  
  if (!scheme.promptTemplate) {
    errors.push('方案必须包含提示词模板');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 