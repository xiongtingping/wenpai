/**
 * [迁移保持原样] AI内容生成提示词系统
 * 原始位置：src/pages/AdaptPage.tsx:4152-4467
 * 迁移时间：2025-09-08
 * 禁止修改：此系统的任何逻辑、参数、文本
 */

import { type StyleType } from '@/config/contentSchemes';
import { getContentFormById } from '@/config/contentForms';

/**
 * [迁移保持原样] 获取平台特色和差异化要求
 */
export const getPlatformCharacteristics = (platform: string): {
  tone: string;
  features: string[];
  contentStyle: string;
  interactionStyle: string;
} => {
  const characteristics: Record<string, any> = {
    'douyin': {
      tone: '轻松有趣、节奏感强',
      features: ['短视频脚本格式', '音乐节拍配合', '视觉冲击力', '15-60秒时长'],
      contentStyle: '快节奏、高密度信息、强视觉效果',
      interactionStyle: '引导点赞、评论、转发，使用热门话题和挑战'
    },
    'xiaohongshu': {
      tone: '真实分享、种草推荐',
      features: ['个人体验感', '图片配文', '标签丰富', '实用性强'],
      contentStyle: '生活化、实用性、美学化表达',
      interactionStyle: '鼓励收藏、分享，使用emoji和话题标签'
    },
    'weibo': {
      tone: '简洁有力、热点敏感',
      features: ['140字精炼', '话题标签', '@用户互动', '转发评论'],
      contentStyle: '新闻性、时效性、观点鲜明',
      interactionStyle: '引发讨论、转发传播，关注热点话题'
    },
    'zhihu': {
      tone: '专业深度、逻辑清晰',
      features: ['长文深度', '专业术语', '数据支撑', '逻辑论证'],
      contentStyle: '知识性、专业性、思辨性强',
      interactionStyle: '引发思考、专业讨论，提供价值观点'
    },
    'wechat': {
      tone: '权威专业、深度解读',
      features: ['图文并茂', '深度内容', '专业表达', '价值输出'],
      contentStyle: '权威性、深度性、实用性',
      interactionStyle: '引导关注、分享转发，建立专业形象'
    },
    'bilibili': {
      tone: '年轻活力、创意十足',
      features: ['视频脚本', '弹幕互动', '二次元文化', '创意表达'],
      contentStyle: '娱乐性、创意性、互动性强',
      interactionStyle: '引导三连、弹幕互动，融入B站文化'
    }
  };

  return characteristics[platform] || {
    tone: '自然真实',
    features: ['内容适配'],
    contentStyle: '平台化表达',
    interactionStyle: '引导互动'
  };
};

/**
 * [迁移保持原样] 获取替代内容形式
 */
export const getAlternativeContentForm = (platformId: string, currentFormId?: string): string | undefined => {
  const platformAlternatives: Record<string, string[]> = {
    'douyin': ['comedy-reversal', 'drama-script', 'tutorial-guide'],
    'xiaohongshu': ['product-review', 'lifestyle-sharing', 'tutorial-guide'],
    'weibo': ['hot-topic', 'emotional-resonance', 'trend-opinion'],
    'zhihu': ['trend-opinion', 'emotional-resonance', 'deep-analysis'],
    'wechat': ['trend-opinion', 'deep-analysis', 'emotional-resonance'],
    'bilibili': ['drama-script', 'comedy-reversal', 'tutorial-guide']
  };

  const alternatives = platformAlternatives[platformId] || ['lifestyle-sharing', 'hot-topic'];
  return alternatives.find(alt => alt !== currentFormId) || alternatives[0];
};

/**
 * [迁移保持原样] 获取替代风格
 */
export const getAlternativeStyle = (currentStyle: StyleType): StyleType => {
  const styleAlternatives: Record<StyleType, StyleType> = {
    'professional': 'real',
    'funny': 'professional',
    'real': 'funny',
    'hook': 'professional'
  };
  return styleAlternatives[currentStyle] || 'real';
};

/**
 * [迁移保持原样] 生成平台维度
 */
export const generatePlatformDimension = (platform: string): string => {
  const platformChar = getPlatformCharacteristics(platform);
  return `平台差异化要求（必须体现强烈平台特色）：
- 目标平台：${platform}
- 语调风格：${platformChar.tone}
- 内容风格：${platformChar.contentStyle}
- 互动方式：${platformChar.interactionStyle}
- 平台特征：${platformChar.features.join('、')}
- 用户习惯：符合${platform}用户的阅读和互动习惯
- 平台算法：适应${platform}的内容推荐机制`;
};

/**
 * [迁移保持原样] 生成内容形式维度
 */
export const generateContentFormDimension = (formId: string): string => {
  const contentForm = getContentFormById(formId);
  if (!contentForm) return '';

  return `内容形式结构要求：
- 形式名称：${contentForm.name}
- 形式描述：${contentForm.description}
- 输出类型：${contentForm.outputType}
- 内容特征：${contentForm.characteristics.join('、')}
- 结构要求：${contentForm.structure.join(' → ')}
- 格式规范：严格按照${contentForm.name}的标准结构输出`;
};

/**
 * [迁移保持原样] 生成内容维度
 */
export const generateContentDimension = (content: string, profile?: any): string => {
  const brandContext = profile ? `\n- 品牌背景融入：将品牌核心要素自然融入原始内容` : '';
  return `原始内容作为创作基础：
- 核心内容：${content}
- 内容类型：${content.length > 500 ? '长文内容' : content.length > 100 ? '中等内容' : '短文内容'}
- 关键信息提取：保持原始内容的核心价值和关键信息${brandContext}`;
};

/**
 * [迁移保持原样] 生成品牌维度
 */
export const generateBrandDimension = async (profile: any, content: string): Promise<string> => {
  return `品牌调性覆盖所有默认设定，拥有最高权重：
- 品牌名称：${profile.name || '未设置'}
- 品牌语调：${profile.tone || '专业友好'}
- 品牌关键词：${profile.keywords?.join('、') || '暂无'}
- 禁用词汇：${profile.forbiddenWords?.join('、') || '无'}
- 品牌价值观：${profile.values?.join('、') || '暂无'}
- 品牌口号：${profile.slogans?.join('、') || '暂无'}
- 目标受众：${profile.targetAudience?.join('、') || '暂无'}
- 品牌故事要素：${profile.brandStory?.join('、') || '暂无'}
- 竞争优势：${profile.competitiveAdvantage?.join('、') || '暂无'}

要求：所有内容必须严格遵循品牌调性，避免公关风险，保持品牌形象一致性。`;
};

/**
 * [迁移保持原样] 生成风格维度
 */
export const generateStyleDimension = (style?: StyleType, profile?: any): string => {
  const styleMap = {
    'professional': '专业权威 - 用词准确、逻辑清晰、可信度高',
    'funny': '幽默风趣 - 轻松活泼、妙语连珠、娱乐性强',
    'real': '真实自然 - 贴近生活、真情实感、亲和力强',
    'hook': '吸引眼球 - 标题党风格、强烈冲击、引人注目'
  };

  // 如果没有选择风格，使用自然表达
  if (!style) {
    const brandOverride = profile ? `\n- 品牌风格覆盖：${profile.tone}风格为主导风格` : '';
    return `表达风格要求：
- 选择风格：自然表达 - 根据内容特点自然选择最合适的表达方式
- 风格特点：不强制特定风格，让内容本身决定最佳表达方式
- 语言特色：自然流畅、符合内容调性${brandOverride}`;
  }

  const brandOverride = profile ? `\n- 品牌风格覆盖：${profile.tone}风格优先于选择的${style}风格` : '';

  return `表达风格要求：
- 选择风格：${styleMap[style]}
- 风格特点：确保内容完全符合${style}风格的表达特征
- 语言特色：用词、句式、节奏都要体现${style}风格${brandOverride}`;
};

/**
 * [迁移保持原样] 生成自定义维度
 */
export const generateCustomDimension = (customText: string): string => {
  return `用户个性化要求：
- 自定义内容：${customText}
- 优先级：用户自定义要求具有高优先级
- 融合要求：将用户要求自然融入到内容中
- 创意发挥：在满足用户要求基础上进行创意扩展`;
};

/**
 * [迁移保持原样] 生成差异化维度
 */
export const generateDifferentiationDimension = (): string => {
  const differentiationStrategies = [
    '使用同义词替换常见表达',
    '调整句式结构和段落顺序',
    '融入时下热点和流行元素',
    '采用独特的比喻和类比',
    '变换开头和结尾的表达方式',
    '加入个人化的观点和见解'
  ];

  const randomStrategies = differentiationStrategies
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return `防模板化差异化要求：
- 差异化策略：${randomStrategies.join('、')}
- 创新要求：避免使用常见的模板化表达
- 独特性：确保内容具有独特的表达方式和视角
- 随机性：在保持质量的前提下增加内容的随机性和新鲜感`;
};

/**
 * [迁移保持原样] 生成有意义的标题
 * 从内容中提取关键信息作为标题，而不是使用"版本A"、"版本B"
 */
export const generateMeaningfulTitle = (content: string, platformId: string): string => {
  if (!content || content.trim().length === 0) {
    return '内容标题';
  }

  // 清理内容，移除多余的换行和空格
  const cleanContent = content.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');

  // 尝试提取第一句话作为标题
  const firstSentence = cleanContent.split(/[。！？.!?]/)[0];
  if (firstSentence && firstSentence.length > 5 && firstSentence.length <= 50) {
    return firstSentence.trim();
  }

  // 如果第一句话不合适，使用前30个字符
  const shortTitle = cleanContent.substring(0, 30);
  if (shortTitle.length < cleanContent.length) {
    return shortTitle + '...';
  }

  return shortTitle;
};

/**
 * [迁移保持原样] 多维矩阵提示词生成系统
 * 原始位置：src/pages/AdaptPage.tsx:4152-4227
 * 迁移时间：2025-09-08
 * 禁止修改：此系统的任何逻辑、参数、文本
 */
export const generateMatrixPrompt = async (
  originalContent: string,
  platform: string,
  formId?: string,
  style?: StyleType,
  charCount?: number,
  customPromptText?: string,
  useBrand: boolean = false,
  // 依赖注入参数
  brandProfile?: any,
  generateCharCountDimension?: (charCount: number, platformId: string) => string,
  generateFormatDimension?: (platform: string) => string
): Promise<string> => {
  const dimensions: string[] = [];

  // 🔺 品牌库内容（最高优先级）
  if (useBrand && brandProfile) {
    const brandDimension = await generateBrandDimension(brandProfile, originalContent);
    dimensions.push(`【品牌维度 - 最高优先级】\n${brandDimension}`);
  }

  // ✅ 原始内容维度
  const contentDimension = generateContentDimension(originalContent, useBrand ? brandProfile : null);
  dimensions.push(`【原始内容维度】\n${contentDimension}`);

  // ✅ 目标平台维度
  const platformDimension = generatePlatformDimension(platform);
  dimensions.push(`【目标平台维度】\n${platformDimension}`);

  // ⭕ 内容形式维度
  if (formId) {
    const formDimension = generateContentFormDimension(formId);
    dimensions.push(`【内容形式维度】\n${formDimension}`);
  }

  // ⭕ 表达风格维度
  const styleDimension = generateStyleDimension(style, useBrand ? brandProfile : null);
  dimensions.push(`【表达风格维度】\n${styleDimension}`);

  // ⭕ 用户自定义维度
  if (customPromptText?.trim()) {
    const customDimension = generateCustomDimension(customPromptText);
    dimensions.push(`【用户自定义维度】\n${customDimension}`);
  }

  // ⭕ 字符数控制维度
  if (charCount && generateCharCountDimension) {
    const charDimension = generateCharCountDimension(charCount, platform);
    dimensions.push(`【字符数控制维度】\n${charDimension}`);
  }

  // ⭕ 格式化要求维度
  if (generateFormatDimension) {
    const formatDimension = generateFormatDimension(platform);
    dimensions.push(`【格式化要求维度】\n${formatDimension}`);
  }

  // ⭕ 差异化维度（防止模板化）
  const differentiationDimension = generateDifferentiationDimension();
  dimensions.push(`【差异化维度】\n${differentiationDimension}`);

  // 组合所有维度
  const finalPrompt = `你是一位专业的多维度内容创作专家，请根据以下多维矩阵要求生成高质量内容：

${dimensions.join('\n\n')}

【优先级机制】
1. 品牌库 > 用户选择 > 平台默认
2. 维度越多，内容越个性化且具辨识度
3. 禁止静态模板，必须动态适应输入维度

【最终要求】
- 严格按照所有维度要求生成内容
- 确保内容具有强烈的差异化特色
- 避免模板化表达，每次生成都要有独特性
- 所有维度必须在最终内容中得到体现
- 直接输出最终内容，不要包含任何说明文字

请开始生成：`;

  return finalPrompt;
};
