/**
 * 🚀 AI内容生成高级提示词系统 v2.0
 *
 * 核心机制:
 * 1. 多维矩阵提示词系统 - 动态组合多个维度
 * 2. 优先级机制 - 品牌库 > 用户选择 > 平台默认
 * 3. 差异化和去AI味 - 防止模板化输出
 * 4. 平台特性深度适配 - 每个平台独特的语言风格
 */

import type { StyleType } from '@/config/contentSchemes';

// ==================== 平台特性配置 ====================

export interface PlatformCharacteristics {
  id: string;
  name: string;
  tone: string;
  maxChars: number;
  maxTags: number;
  features: string[];
  contentStyle: string;
  interactionStyle: string;
  userProfile: string; // 用户画像
  contentPreferences: string[]; // 内容偏好
  forbiddenWords: string[]; // 禁用词
}

export const PLATFORM_CHARACTERISTICS: Record<string, PlatformCharacteristics> = {
  xiaohongshu: {
    id: 'xiaohongshu',
    name: '小红书',
    tone: '真实分享、种草推荐、生活化',
    maxChars: 1000,
    maxTags: 20,
    features: [
      '个人体验感',
      '图片配文',
      '标签丰富',
      '实用性强',
      'emoji表情符号',
      '分段清晰',
      '视觉化描述'
    ],
    contentStyle: '生活化、实用性、美学化表达、真实体验',
    interactionStyle: '鼓励收藏、分享、使用emoji和话题标签',
    userProfile: '18-35岁女性为主，追求品质生活，喜欢分享和种草',
    contentPreferences: [
      '个人真实体验',
      '产品测评',
      '生活方式分享',
      '美妆护肤',
      '旅行攻略',
      '好物推荐'
    ],
    forbiddenWords: ['广告', '推广', '联系方式', '二维码']
  },

  weibo: {
    id: 'weibo',
    name: '微博',
    tone: '简洁有力、热点敏感、观点鲜明',
    maxChars: 2000, // 实际支持2000字,但建议140字内
    maxTags: 3,
    features: [
      '简短精炼',
      '话题标签',
      '@用户互动',
      '转发评论',
      '热点追踪',
      '表情包'
    ],
    contentStyle: '新闻性、时效性、观点鲜明、简洁有力',
    interactionStyle: '引发讨论、转发传播、关注热点话题、@相关用户',
    userProfile: '全年龄段，关注热点、新闻、娱乐八卦',
    contentPreferences: [
      '热点话题',
      '新闻事件',
      '观点评论',
      '娱乐八卦',
      '段子吐槽',
      '社会现象'
    ],
    forbiddenWords: ['敏感政治', '极端言论']
  },

  wechat: {
    id: 'wechat',
    name: '微信公众号',
    tone: '权威专业、深度解读、价值输出',
    maxChars: 2000,
    maxTags: 0,
    features: [
      '图文并茂',
      '深度内容',
      '专业表达',
      '价值输出',
      '逻辑清晰',
      '引用权威'
    ],
    contentStyle: '权威性、深度性、实用性、专业性强',
    interactionStyle: '引导关注、分享转发、建立专业形象、提供价值',
    userProfile: '25-45岁职场人士，追求深度内容和专业知识',
    contentPreferences: [
      '行业分析',
      '专业知识',
      '深度解读',
      '实用技巧',
      '案例研究',
      '趋势洞察'
    ],
    forbiddenWords: ['标题党', '虚假信息', '夸大宣传']
  },

  douyin: {
    id: 'douyin',
    name: '抖音',
    tone: '轻松有趣、节奏感强、视觉冲击',
    maxChars: 300,
    maxTags: 5,
    features: [
      '短视频脚本',
      '音乐节拍',
      '视觉冲击',
      '15-60秒',
      '快节奏',
      '强互动'
    ],
    contentStyle: '快节奏、高密度信息、强视觉效果、娱乐性',
    interactionStyle: '引导点赞、评论、转发、使用热门话题和挑战',
    userProfile: '18-35岁年轻人，追求娱乐和新鲜感',
    contentPreferences: [
      '搞笑段子',
      '生活技巧',
      '才艺展示',
      '剧情反转',
      '美食探店',
      '好物分享'
    ],
    forbiddenWords: ['低俗内容', '虚假信息']
  },

  zhihu: {
    id: 'zhihu',
    name: '知乎',
    tone: '专业深度、逻辑清晰、知识性强',
    maxChars: 5000,
    maxTags: 0,
    features: [
      '长文深度',
      '专业术语',
      '数据支撑',
      '逻辑论证',
      '引用来源',
      '结构清晰'
    ],
    contentStyle: '知识性、专业性、思辨性强、逻辑严谨',
    interactionStyle: '引发思考、专业讨论、提供价值观点、数据支撑',
    userProfile: '25-40岁高知人群，追求深度知识和专业见解',
    contentPreferences: [
      '专业解答',
      '深度分析',
      '知识科普',
      '行业洞察',
      '理性讨论',
      '数据研究'
    ],
    forbiddenWords: ['情绪化表达', '无根据言论']
  },

  bilibili: {
    id: 'bilibili',
    name: 'B站',
    tone: '年轻活力、创意十足、二次元文化',
    maxChars: 500,
    maxTags: 10,
    features: [
      '视频脚本',
      '弹幕互动',
      '二次元文化',
      '创意表达',
      'up主人设',
      '梗文化'
    ],
    contentStyle: '娱乐性、创意性、互动性强、年轻化',
    interactionStyle: '引导三连、弹幕互动、融入B站文化、建立粉丝关系',
    userProfile: '15-30岁年轻人，喜欢ACG文化、创意内容',
    contentPreferences: [
      '游戏攻略',
      '动漫解说',
      '知识科普',
      '生活vlog',
      '搞笑视频',
      '创意制作'
    ],
    forbiddenWords: ['过度营销', '引战内容']
  }
};

// ==================== 表达风格配置 ====================

export interface ExpressionStyle {
  id: StyleType;
  name: string;
  description: string;
  characteristics: string[];
  fusedStyles: string[]; // 融合的风格
  适用场景: string[];
  keywords: string[];
}

export const EXPRESSION_STYLES: Record<StyleType, ExpressionStyle> = {
  professional: {
    id: 'professional',
    name: '🎓 专业风格',
    description: '客观、结构清晰、有引用、专业术语',
    characteristics: [
      '使用专业术语',
      '段落结构清晰',
      '有数据支撑',
      '引用权威来源',
      '客观中立',
      '逻辑严谨'
    ],
    fusedStyles: ['客观风格', '洞察风格', '数据驱动'],
    适用场景: ['微信公众号', '知乎', '行业分析', '专业解读'],
    keywords: ['根据', '数据显示', '研究表明', '专业人士', '分析', '结论']
  },

  'global-adaptation': {
    id: 'global-adaptation' as any,
    name: '🌐 全域内容适配',
    description: '跨平台表达的通用适配风格',
    characteristics: ['多平台适配', '口语化', '真实体验', '场景化'],
    fusedStyles: ['友好风格', '实用风格'],
    适用场景: ['小红书', '微博', '微信', '抖音', '知乎', 'B站'],
    keywords: ['适配', '平台', '风格', '话题']
  },


  funny: {
    id: 'funny',
    name: '😂 幽默风格',
    description: '搞笑、调侃、轻松上头、借势流行语',
    characteristics: [
      '使用网络热词',
      '玩梗',
      '自我调侃',
      '反差感',
      '夸张表达',
      '表情符号丰富'
    ],
    fusedStyles: ['幽默', '自嘲', '惊叹', '网络热词', '标题党'],
    适用场景: ['抖音', 'B站', '微博', '娱乐内容'],
    keywords: ['哈哈', '笑死', '绝了', '我哭死', '懂得都懂', '社死']
  },

  real: {
    id: 'real',
    name: '🤝 真实感风格',
    description: '像朋友唠嗑、日常细节、多表情符号',
    characteristics: [
      '第一人称视角',
      '生活化细节',
      '真实感受',
      '主观表达',
      '情感共鸣',
      'emoji表情'
    ],
    fusedStyles: ['真实感', '分享型', '主观表达'],
    适用场景: ['小红书', '微信', '生活分享', '个人体验'],
    keywords: ['我', '真的', '感觉', '发现', '推荐', '分享']
  },

  hook: {
    id: 'hook',
    name: '🎣 钩子风格',
    description: '标题钩人、内容留人、精准用户定位',
    characteristics: [
      '强开头钩子',
      '定向人群',
      '痛点打击',
      '引发好奇',
      '转化导向',
      '精准切入'
    ],
    fusedStyles: ['钩子型', '精准用户型', '转化导向'],
    适用场景: ['全平台', '营销内容', '引流转化'],
    keywords: ['99%的人', '必看', '千万别', '揭秘', '内幕', '注意']
  }
};

// ==================== 差异化策略配置 ====================

export const DIFFERENTIATION_STRATEGIES = {
  // 防模板化策略
  antiTemplate: {
    name: '防模板化',
    techniques: [
      '随机选用近义句式',
      '打乱内容结构',
      '局部换词',
      '不同的开头方式',
      '多样化的结尾',
      '避免固定句式'
    ]
  },

  // 去AI味策略
  humanize: {
    name: '去AI味',
    techniques: [
      '使用口语化表达',
      '添加个人化细节',
      '自然的语言节奏',
      '真实的情感流露',
      '避免过于完美的结构',
      '适当的不完美和真实感'
    ]
  },

  // 个性化策略
  personalization: {
    name: '个性化',
    techniques: [
      '基于品牌调性调整',
      '融入用户特定词汇',
      '保持一致的人设',
      '独特的表达习惯',
      '专属的金句风格'
    ]
  }
};

// ==================== 辅助函数 ====================

/**
 * 获取平台特性描述
 */
export function getPlatformPromptDescription(platformId: string): string {
  const platform = PLATFORM_CHARACTERISTICS[platformId];
  if (!platform) {
    return '通用平台风格';
  }

  return `【${platform.name}平台特性】
语调：${platform.tone}
用户画像：${platform.userProfile}
内容风格：${platform.contentStyle}
互动方式：${platform.interactionStyle}
平台特色：${platform.features.join('、')}
字数限制：${platform.maxChars}字
标签数量：${platform.maxTags}个`;
}

/**
 * 获取风格描述
 */
export function getStylePromptDescription(styleId: StyleType): string {
  const style = EXPRESSION_STYLES[styleId];
  if (!style) {
    return '';
  }

  return `【${style.name}表达风格】
特点：${style.description}
融合风格：${style.fusedStyles.join('、')}
核心特征：${style.characteristics.join('、')}
关键词示例：${style.keywords.join('、')}`;
}

/**
 * 生成差异化提示
 */
export function getDifferentiationPrompt(): string {
  return `【差异化和去AI味要求】
1. 防模板化：
   - 每次生成使用不同的开头方式
   - 避免固定的句式结构
   - 随机变换表达方式
   - 不要使用"首先、其次、最后"等模板化结构

2. 去AI味：
   - 使用自然口语化的表达
   - 添加真实的个人化细节
   - 保持自然的语言节奏
   - 适当的不完美感（不要过于工整）
   - 真实的情感流露

3. 个性化：
   - 融入独特的表达习惯
   - 保持一致的人设
   - 使用专属的词汇风格`;
}

/**
 * 生成品牌库提示（最高优先级）
 */
export function getBrandPrompt(brandProfile?: any): string {
  if (!brandProfile) {
    return '';
  }

  return `【品牌库维度 - 最高优先级】⚠️
${brandProfile.brandName ? `品牌名称：${brandProfile.brandName}` : ''}
${brandProfile.brandTone ? `品牌语调：${brandProfile.brandTone}` : ''}
${brandProfile.brandValues ? `品牌价值观：${brandProfile.brandValues}` : ''}
${brandProfile.keyWords ? `高频词汇：${brandProfile.keyWords}` : ''}
${brandProfile.forbiddenWords ? `禁用词汇：${brandProfile.forbiddenWords}` : ''}
${brandProfile.voiceTemplate ? `表达模板：${brandProfile.voiceTemplate}` : ''}

⚠️ 重要：所有内容必须严格遵循品牌调性和语言规范，品牌库设置覆盖所有其他维度！`;
}

// ==================== 导出内容形式类型 ====================

// 从 contentForms.ts 导出类型,供外部使用
export type { ContentFormConfig, ContentFormCategory, ContentFormId } from './contentForms';
export { ALL_CONTENT_FORMS, CONTENT_FORM_NAMES, getFormsByCategory } from './contentForms';

// 从 modularPromptSystem.ts 导出模块化提示词工具
export type { PromptModule, PromptVariant, CombinationRule } from './modularPromptSystem';
export {
  OPENING_HOOK_MODULES,
  CONTENT_EXPRESSION_MODULES,
  BRAND_PERSONALITY_MODULES,
  INTERACTION_MODULES,
  FORMAT_MODULES,
  CONSTRAINT_MODULES,
  COMBINATION_RULES,
  modularPromptEngine
} from './modularPromptSystem';

export default {
  PLATFORM_CHARACTERISTICS,
  EXPRESSION_STYLES,
  DIFFERENTIATION_STRATEGIES,
  getPlatformPromptDescription,
  getStylePromptDescription,
  getDifferentiationPrompt,
  getBrandPrompt
};
