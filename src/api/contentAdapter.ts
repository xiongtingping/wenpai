/**
 * 内容适配器API
 * 用于生成不同平台适配的内容
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { type StyleType } from '@/config/contentSchemes';
import { getContentFormById } from '@/config/contentForms';
import { callUnifiedAI } from '@/api/unifiedAIService';
import { AITaskType } from '@/api/aiService';

/**
 * 内容适配请求参数
 */
export interface ContentAdaptationRequest {
  originalContent: string;
  platform: string;
  formId?: string;
  style?: StyleType;
  charCount?: number;
}

/**
 * 内容适配响应
 */
export interface ContentAdaptationResponse {
  success: boolean;
  data?: {
    adaptedContent: string;
    platform: string;
    formId?: string;
    style: StyleType;
    prompt: string;
  };
  error?: string;
}

/**
 * 生成平台适配内容
 * @param request 内容适配请求参数
 * @returns 适配后的内容
 */
/**
 * 获取平台默认内容形式
 */
function getPlatformDefaultContentForm(platform: string): string {
  const platformDefaults: Record<string, string> = {
    'douyin': 'drama-script', // 抖音默认剧情脚本
    'kuaishou': 'drama-script', // 快手默认剧情脚本
    'xiaohongshu': 'lifestyle-sharing', // 小红书默认生活分享
    'weibo': 'hot-topic', // 微博默认热点话题
    'zhihu': 'trend-opinion', // 知乎默认趋势观点
    'bilibili': 'drama-script', // B站默认剧情脚本
    'wechat': 'trend-opinion' // 微信默认趋势观点
  };
  return platformDefaults[platform] || 'lifestyle-sharing';
}

/**
 * 获取平台特色和差异化要求
 */
function getPlatformCharacteristics(platform: string): {
  tone: string;
  features: string[];
  contentStyle: string;
  interactionStyle: string;
} {
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
}

/**
 * 生成内容形式提示词（增强版）
 */
function generateContentFormPrompt(
  originalContent: string,
  platform: string,
  formId?: string,
  style: StyleType = 'professional',
  charCount?: number
): string {
  // 获取平台特色
  const platformChar = getPlatformCharacteristics(platform);

  // 确定内容形式优先级：用户选择 > 平台默认
  let targetFormId = formId;
  if (!targetFormId) {
    targetFormId = getPlatformDefaultContentForm(platform);
  }

  const contentForm = getContentFormById(targetFormId);

  // 字符数控制
  const charLimit = charCount || 1000;
  const charInstruction = `严格控制在${charLimit}字符以内，不得超出此限制`;

  // 风格映射
  const styleMap: Record<StyleType, string> = {
    'professional': '专业权威',
    'funny': '幽默风趣',
    'real': '真实自然',
    'hook': '吸引眼球',
    'global-adaptation': '全球化适配'
  };

  if (contentForm) {
    return `你是一位专业的${platform}平台内容创作专家，请根据以下要求生成高质量的平台差异化内容：

【平台特色要求】
- 平台：${platform}
- 语调风格：${platformChar.tone}
- 内容风格：${platformChar.contentStyle}
- 互动方式：${platformChar.interactionStyle}
- 平台特征：${platformChar.features.join('、')}

【内容形式要求】
- 内容形式：${contentForm.name}
- 形式描述：${contentForm.description}
- 输出类型：${contentForm.outputType}
- 内容特征：${contentForm.characteristics.join('、')}

【内容结构】
${contentForm.structure.map((s, i) => `${i + 1}. ${s}`).join('\n')}

【表达风格】
${styleMap[style]}风格

【字符数控制】
${charInstruction}

【原始内容】
${originalContent}

【生成要求】
1. 必须体现${platform}平台的独特风格和用户习惯
2. 严格按照${contentForm.name}的形式结构生成
3. 内容要有明显的平台差异化特色
4. 字符数必须控制在${charLimit}字符以内
5. 融入${platform}平台的互动元素和表达习惯
6. 确保内容质量高、吸引力强、符合平台调性

请直接输出最终内容，不要包含任何说明文字。`;
  }

  // 如果没有指定内容形式，使用平台默认适配
  return `你是一位专业的${platform}平台内容创作专家，请将以下内容适配为具有强烈平台特色的内容：

【平台特色要求】
- 平台：${platform}
- 语调风格：${platformChar.tone}
- 内容风格：${platformChar.contentStyle}
- 互动方式：${platformChar.interactionStyle}
- 平台特征：${platformChar.features.join('、')}

【表达风格】
${styleMap[style]}风格

【字符数控制】
${charInstruction}

【原始内容】
${originalContent}

【生成要求】
1. 必须体现${platform}平台的独特风格和用户习惯
2. 内容要有明显的平台差异化特色
3. 字符数必须控制在${charLimit}字符以内
4. 融入${platform}平台的互动元素和表达习惯
5. 确保内容质量高、吸引力强、符合平台调性

请直接输出最终内容，不要包含任何说明文字。`;
}

export async function generateAdaptedContent(
  request: ContentAdaptationRequest
): Promise<ContentAdaptationResponse> {
  try {
    const { originalContent, platform, formId, style = 'professional', charCount } = request;

    if (!originalContent.trim()) {
      return {
        success: false,
        error: '原始内容不能为空'
      };
    }

    if (!platform) {
      return {
        success: false,
        error: '请选择目标平台'
      };
    }

    // 调用统一AI服务生成适配内容
    console.log('🔄 开始调用统一AI内容适配服务');

    // 生成详细的内容适配提示词
    const adaptationPrompt = generateContentFormPrompt(originalContent, platform, formId, style, charCount);

    const aiResponse = await callUnifiedAI({
      prompt: adaptationPrompt,
      taskType: AITaskType.CONTENT_ADAPTATION,
      model: 'gpt-4o-mini', // 使用性价比高的模型
      maxTokens: charCount ? Math.min(charCount * 2, 2000) : 1500,
      temperature: 0.8,
      context: {
        platform,
        style,
        charCount,
        formId,
        originalLength: originalContent.length
      }
    });

    if (aiResponse.success && aiResponse.content) {
      return {
        success: true,
        data: {
          adaptedContent: aiResponse.content,
          platform,
          ...(formId && { formId }),
          style,
          prompt: `使用统一AI服务适配到${platform}平台`
        }
      };
    } else {
      // AI调用失败时，返回错误
      return {
        success: false,
        error: aiResponse.error || '内容适配失败'
      };
    }
  } catch (error) {
    console.error('生成适配内容失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成适配内容失败'
    };
  }
}

/**
 * 重新生成平台适配内容
 * @param request 内容适配请求参数
 * @returns 重新适配后的内容
 */
export async function regenerateAdaptedContent(
  request: ContentAdaptationRequest
): Promise<ContentAdaptationResponse> {
  try {
    const { originalContent, platform, formId, style = 'professional', charCount } = request;

    if (!originalContent.trim()) {
      return {
        success: false,
        error: '原始内容不能为空'
      };
    }

    if (!platform) {
      return {
        success: false,
        error: '请选择目标平台'
      };
    }

    // 重新生成适配内容（传递字符数限制，添加随机性获得不同结果）
    const prompt = generateContentFormPrompt(originalContent, platform, formId, style, charCount);

    return {
      success: true,
      data: {
        adaptedContent: prompt,
        platform,
        ...(formId && { formId }),
        style,
        prompt
      }
    };
  } catch (error) {
    console.error('重新生成适配内容失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '重新生成适配内容失败'
    };
  }
}

/**
 * 批量生成多平台适配内容
 * @param originalContent 原始内容
 * @param platforms 目标平台列表
 * @param formId 内容形式ID
 * @param style 风格类型
 * @returns 多平台适配内容
 */
export async function generateMultiPlatformContent(
  originalContent: string,
  platforms: string[],
  formId?: string,
  style: StyleType = 'professional'
): Promise<ContentAdaptationResponse[]> {
  try {
    if (!originalContent.trim()) {
      return platforms.map(() => ({
        success: false,
        error: '原始内容不能为空'
      }));
    }

    if (platforms.length === 0) {
      return [{
        success: false,
        error: '请选择至少一个目标平台'
      }];
    }

    // 并行生成多平台内容
    const promises = platforms.map(platform =>
      generateAdaptedContent({
        originalContent,
        platform,
        ...(formId && { formId }),
        style
      })
    );

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('批量生成多平台内容失败:', error);
    return platforms.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : '批量生成多平台内容失败'
    }));
  }
}

/**
 * 获取平台列表
 */
export function getAvailablePlatforms() {
  return [
    { id: 'xiaohongshu', name: '小红书', description: '适合生活方式、美妆、旅行等分享，强调个人体验和情感共鸣', icon: '📖' },
    { id: 'zhihu', name: '知乎', description: '适合专业知识分享和理性讨论，强调逻辑和论证', icon: '🤔' },
    { id: 'douyin', name: '抖音', description: '适合短视频脚本，活泼有趣，强调视听效果', icon: '🎵' },
    { id: 'weibo', name: '新浪微博', description: '简短有力的观点表达，适合热点话题讨论', icon: '🐦' },
    { id: 'wechat', name: '公众号', description: '深度内容，适合教程、观点和专业分析', icon: '💬' },
    { id: 'bilibili', name: 'B站', description: '适合视频脚本，兼具专业性和趣味性', icon: '📺' },
    { id: 'twitter', name: 'X（推特）', description: '简短、直接的表达，支持多种语言和国际化视角', icon: '🐦' },
    { id: 'video', name: '视频号', description: '视频内容与互动引导并重，亲和力强', icon: '🎬' },
    { id: 'baijia', name: '百家号', description: '长篇深度内容，SEO友好，权威感强，适合资讯类内容', icon: '🌐' },
    { id: 'kuaishou', name: '快手', description: '接地气表达，真实朴实，亲民风格，适合生活记录', icon: '⚡' },
    { id: 'wangyi', name: '网易小蜜蜂', description: '注重原创性，文笔流畅，观点独特，适合深度评论', icon: '📰' },
    { id: 'toutiao', name: '头条号', description: '标题党友好，热点敏感，算法推荐，适合时事评论', icon: '🌐' },
    { id: 'facebook', name: 'Facebook', description: '国际化社交平台，适合品牌推广和社区互动', icon: '📘' },
    { id: 'linkedin', name: 'LinkedIn', description: '专业职场社交平台，适合商务内容和职业发展', icon: '💼' },
    { id: 'instagram', name: 'Instagram', description: '视觉化社交平台，适合图片和短视频内容', icon: '📷' },
    { id: 'douban', name: '豆瓣', description: '文艺青年聚集地，适合文化评论和生活方式分享', icon: '🎭' }
  ];
}

/**
 * 获取风格列表
 */
export function getAvailableStyles() {
  return [
    { id: 'professional', name: '专业风格', description: '专业 + 客观 + 洞察', icon: '🎯' },
    { id: 'funny', name: '幽默风格', description: '幽默 + 自嘲 + 网络热词 + 惊叹 + 标题党', icon: '😄' },
    { id: 'real', name: '真实风格', description: '真实感 + 主观 + 分享型', icon: '💝' },
    { id: 'hook', name: '钩子风格', description: '钩子型 + 精准用户导向 + 高点击转化', icon: '🎣' }
  ];
}