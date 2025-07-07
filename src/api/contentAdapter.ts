/**
 * 内容适配器
 * 提供多平台内容适配功能
 */

import { callOpenAIProxy, callDeepSeekProxy, callGeminiProxy } from './apiProxy';

/**
 * 平台设置接口
 */
export interface PlatformSettings {
  /** 平台名称 */
  name: string;
  /** 平台描述 */
  description: string;
  /** 内容风格 */
  style: string;
  /** 字数限制 */
  maxLength?: number;
  /** 标签要求 */
  hashtagStyle?: string;
  /** 特殊要求 */
  specialRequirements?: string[];
}

/**
 * 全局设置接口
 */
export interface GlobalSettings {
  /** 是否保持原意 */
  preserveOriginalMeaning: boolean;
  /** 是否添加标签 */
  addHashtags: boolean;
  /** 是否优化标题 */
  optimizeTitle: boolean;
  /** 是否生成多个版本 */
  generateMultipleVersions: boolean;
  /** 版本数量 */
  versionCount: number;
}

/**
 * 内容适配请求接口
 */
export interface ContentAdaptRequest {
  /** 原始内容 */
  originalContent: string;
  /** 目标平台 */
  targetPlatforms: string[];
  /** 平台设置 */
  platformSettings: Record<string, PlatformSettings>;
  /** 全局设置 */
  globalSettings: GlobalSettings;
  /** 用户偏好 */
  userPreferences?: {
    tone?: string;
    style?: string;
    keywords?: string[];
  };
}

/**
 * 内容适配响应接口
 */
export interface ContentAdaptResponse {
  /** 是否成功 */
  success: boolean;
  /** 适配结果 */
  results?: {
    platform: string;
    content: string;
    title?: string;
    hashtags?: string[];
    suggestions?: string[];
  }[];
  /** 错误信息 */
  error?: string;
  /** 详细信息 */
  detail?: string;
}

/**
 * 平台配置
 */
const PLATFORM_CONFIGS: Record<string, PlatformSettings> = {
  xiaohongshu: {
    name: '小红书',
    description: '生活方式分享平台，注重个人体验和情感表达',
    style: '亲切、真实、有温度，像朋友间的分享',
    maxLength: 1000,
    hashtagStyle: '3-5个相关标签，如 #护肤 #身体乳 #秋冬必备',
    specialRequirements: ['开头要有吸引力', '多用emoji表情', '结尾要有互动引导']
  },
  weibo: {
    name: '微博',
    description: '社交媒体平台，信息传播快速',
    style: '简洁、直接、有话题性',
    maxLength: 140,
    hashtagStyle: '2-3个热门标签',
    specialRequirements: ['开头要有爆点', '内容要有传播性']
  },
  wechat: {
    name: '微信公众号',
    description: '深度内容平台，注重价值输出',
    style: '专业、深度、有见解',
    maxLength: 3000,
    hashtagStyle: '不需要标签',
    specialRequirements: ['要有深度分析', '结构要清晰', '要有实用价值']
  },
  douyin: {
    name: '抖音',
    description: '短视频平台，注重视觉冲击',
    style: '简短、有力、有节奏感',
    maxLength: 100,
    hashtagStyle: '2-3个热门标签',
    specialRequirements: ['要有画面感', '语言要生动', '适合配音']
  },
  zhihu: {
    name: '知乎',
    description: '知识分享平台，注重专业性和逻辑性',
    style: '理性、专业、有深度',
    maxLength: 5000,
    hashtagStyle: '不需要标签',
    specialRequirements: ['要有专业分析', '逻辑要清晰', '要有数据支撑']
  },
  bilibili: {
    name: 'B站',
    description: '视频内容平台，注重互动和趣味性',
    style: '有趣、有梗、有互动',
    maxLength: 500,
    hashtagStyle: '3-5个相关标签',
    specialRequirements: ['要有梗', '要有互动性', '要符合B站文化']
  }
};

/**
 * 生成平台特定的提示词
 * @param platform 平台名称
 * @param originalContent 原始内容
 * @param settings 平台设置
 * @returns 提示词
 */
function generatePlatformPrompt(
  platform: string,
  originalContent: string,
  settings: PlatformSettings
): string {
  const config = PLATFORM_CONFIGS[platform] || settings;
  
  return `请将以下内容适配为${config.name}平台的内容风格：

原始内容：
${originalContent}

平台要求：
- 风格：${config.style}
- 字数限制：${config.maxLength || '无限制'}
- 标签风格：${config.hashtagStyle || '不需要标签'}
${config.specialRequirements ? `- 特殊要求：${config.specialRequirements.join('、')}` : ''}

请生成符合${config.name}平台特点的内容，保持原意的同时，让内容更适合该平台的用户群体和传播特点。`;
}

/**
 * 内容适配主函数
 * @param request 适配请求
 * @returns Promise with 适配结果
 */
export async function adaptContent(request: ContentAdaptRequest): Promise<ContentAdaptResponse> {
  try {
    const { originalContent, targetPlatforms, platformSettings, globalSettings } = request;
    
    if (!originalContent.trim()) {
      return {
        success: false,
        error: '原始内容不能为空'
      };
    }

    if (targetPlatforms.length === 0) {
      return {
        success: false,
        error: '请选择至少一个目标平台'
      };
    }

    const results = [];

    for (const platform of targetPlatforms) {
      try {
        const settings = platformSettings[platform] || PLATFORM_CONFIGS[platform];
        if (!settings) {
          results.push({
            platform,
            content: `不支持的平台：${platform}`,
            error: '平台配置不存在'
          });
          continue;
        }

        const prompt = generatePlatformPrompt(platform, originalContent, settings);
        
        // 根据用户选择调用不同的API
        let response;
        if (globalSettings.preserveOriginalMeaning) {
          // 使用OpenAI保持原意
          response = await callOpenAIProxy([
            { role: 'user', content: prompt }
          ]);
        } else {
          // 使用DeepSeek进行创意改编
          response = await callDeepSeekProxy([
            { role: 'user', content: prompt }
          ]);
        }

        if (response.success && response.data) {
          const content = response.data.choices?.[0]?.message?.content || '生成失败';
          
          results.push({
            platform,
            content,
            title: globalSettings.optimizeTitle ? `优化后的${settings.name}标题` : undefined,
            hashtags: globalSettings.addHashtags ? ['#相关标签1', '#相关标签2'] : undefined,
            suggestions: ['建议1', '建议2']
          });
        } else {
          results.push({
            platform,
            content: '生成失败',
            error: response.error || '未知错误'
          });
        }
      } catch (error) {
        results.push({
          platform,
          content: '生成失败',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: true,
      results
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 批量内容适配
 * @param requests 多个适配请求
 * @returns Promise with 批量结果
 */
export async function batchAdaptContent(requests: ContentAdaptRequest[]): Promise<ContentAdaptResponse[]> {
  const results = [];
  
  for (const request of requests) {
    try {
      const result = await adaptContent(request);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

/**
 * 获取平台配置
 * @returns 平台配置对象
 */
export function getPlatformConfigs(): Record<string, PlatformSettings> {
  return PLATFORM_CONFIGS;
}

/**
 * 验证平台设置
 * @param settings 平台设置
 * @returns 验证结果
 */
export function validatePlatformSettings(settings: PlatformSettings): boolean {
  if (!settings.name || !settings.style) {
    return false;
  }
  if (settings.maxLength !== undefined && settings.maxLength < 0) {
    return false;
  }
  if (settings.hashtagStyle && settings.hashtagStyle.length === 0) {
    return false;
  }
  if (settings.specialRequirements && settings.specialRequirements.length === 0) {
    return false;
  }
  return true;
}