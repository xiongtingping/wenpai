/**
 * 内容适配器
 * 提供多平台内容适配功能
 */

import { callOpenAIProxy, callDeepSeekProxy, callGeminiProxy } from './apiProxy';
import { callOpenAIDevProxy } from './devApiProxy';

/**
 * AI API响应接口
 */
export interface AIApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  detail?: string;
  message?: string;
  content?: string;
  source?: string;
  platform?: string;
  title?: string;
  hashtags?: string[];
  suggestions?: string[];
}

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

// API提供商配置
let currentApiProvider = 'openai';
let currentModel = 'gpt-4o';

/**
 * 设置API提供商
 * @param provider 提供商名称
 */
export function setApiProvider(provider: string): void {
  currentApiProvider = provider;
  // 当切换提供商时，自动设置最佳模型
  if (provider === 'openai') {
    currentModel = 'gpt-4o';
  } else if (provider === 'deepseek') {
    currentModel = 'deepseek-v3';
  } else if (provider === 'gemini') {
    currentModel = 'gemini-pro';
  }
}

/**
 * 获取当前API提供商
 * @returns 提供商名称
 */
export function getApiProvider(): string {
  return currentApiProvider;
}

/**
 * 设置模型
 * @param model 模型名称
 */
export function setModel(model: string): void {
  currentModel = model;
}

/**
 * 获取当前模型
 * @returns 模型名称
 */
export function getModel(): string {
  return currentModel;
}

/**
 * 获取可用模型列表
 * @returns 模型列表
 */
export function getAvailableModels(): Record<string, string[]> {
  return {
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    deepseek: ['deepseek-v3', 'deepseek-chat', 'deepseek-coder'],
    gemini: ['gemini-pro', 'gemini-pro-vision']
  };
}

/**
 * 模型描述接口
 */
interface ModelDescription {
  name: string;
  useCases: string[];
  strengths: string[];
  bestFor: string;
}

/**
 * 模型描述
 */
export const modelDescriptions: Record<string, ModelDescription> = {
  'gpt-4o': {
    name: 'GPT-4o (推荐) - 最新最强大的AI模型',
    useCases: ['高级内容创作', '复杂分析', '创意设计', '专业写作'],
    strengths: ['性能最佳', '理解能力最强', '创意丰富', '响应快速'],
    bestFor: '对质量要求极高的专业任务，优先推荐'
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo - 高性能平衡选择',
    useCases: ['复杂分析', '创意写作', '技术文档'],
    strengths: ['理解能力强', '逻辑清晰', '创意丰富'],
    bestFor: '需要深度思考的复杂任务'
  },
  'gpt-4': {
    name: 'GPT-4 - 经典智能模型',
    useCases: ['复杂分析', '创意写作', '技术文档'],
    strengths: ['理解能力强', '逻辑清晰', '创意丰富'],
    bestFor: '需要深度思考的复杂任务'
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo - 快速经济选择',
    useCases: ['一般内容生成', '简单问答', '文本总结'],
    strengths: ['响应快速', '成本较低', '稳定性好'],
    bestFor: '日常内容创作和简单任务'
  },
  'deepseek-v3': {
    name: 'DeepSeek V3 (备选) - 中文优化最新版本',
    useCases: ['中文写作', '本地化内容', '中文分析', '创意内容'],
    strengths: ['中文理解优秀', '文化适应性强', '表达自然', '性能强劲'],
    bestFor: '中文内容创作和本地化任务，备选推荐'
  },
  'deepseek-chat': {
    name: 'DeepSeek Chat - 中文优化模型',
    useCases: ['中文写作', '本地化内容', '中文分析'],
    strengths: ['中文理解优秀', '文化适应性强', '表达自然'],
    bestFor: '中文内容创作和本地化任务'
  },
  'deepseek-coder': {
    name: 'DeepSeek Coder - 代码生成优化',
    useCases: ['代码生成', '代码审查', '技术文档'],
    strengths: ['代码质量高', '技术理解深', '注释完整'],
    bestFor: '编程和技术相关任务'
  },
  'gemini-pro': {
    name: 'Gemini Pro - Google多语言模型',
    useCases: ['多语言内容', '跨文化分析', '国际化任务'],
    strengths: ['多语言支持', '文化敏感', '全球化视角'],
    bestFor: '多语言和国际化内容创作'
  },
  'gemini-pro-vision': {
    name: 'Gemini Pro Vision - 支持图像理解',
    useCases: ['图像分析', '视觉内容创作', '图文结合'],
    strengths: ['视觉理解强', '图文结合', '创意丰富'],
    bestFor: '需要图像理解的任务'
  }
};

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
 * 平台样式配置
 */
export const platformStyles = PLATFORM_CONFIGS;

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
 * 生成模拟内容
 * @param platform 平台名称
 * @param originalContent 原始内容
 * @param settings 平台设置
 * @returns 模拟内容
 */
function generateMockContent(
  platform: string,
  originalContent: string,
  settings: PlatformSettings
): string {
  const config = PLATFORM_CONFIGS[platform] || settings;
  const mockContent = `这是一个模拟内容，用于平台：${config.name}。

原始内容：
${originalContent}

平台要求：
- 风格：${config.style}
- 字数限制：${config.maxLength || '无限制'}
- 标签风格：${config.hashtagStyle || '不需要标签'}
${config.specialRequirements ? `- 特殊要求：${config.specialRequirements.join('、')}` : ''}

请生成符合${config.name}平台特点的内容，保持原意的同时，让内容更适合该平台的用户群体和传播特点。`;
  return mockContent;
}

/**
 * 生成适配内容
 * @param originalContent 原始内容
 * @param platforms 目标平台
 * @param settings 设置
 * @returns Promise with 适配结果
 */
export async function generateAdaptedContent(
  originalContent: string,
  platforms: string[],
  settings?: any
): Promise<ContentAdaptResponse> {
  const request: ContentAdaptRequest = {
    originalContent,
    targetPlatforms: platforms,
    platformSettings: settings || PLATFORM_CONFIGS,
    globalSettings: {
      preserveOriginalMeaning: true,
      addHashtags: true,
      optimizeTitle: true,
      generateMultipleVersions: false,
      versionCount: 1
    }
  };
  
  return adaptContent(request);
}

/**
 * 重新生成平台内容
 * @param platform 平台名称
 * @param originalContent 原始内容
 * @param settings 设置
 * @returns Promise with 适配结果
 */
export async function regeneratePlatformContent(
  platform: string,
  originalContent: string,
  settings?: any
): Promise<ContentAdaptResponse> {
  return generateAdaptedContent(originalContent, [platform], settings);
}

/**
 * 检查API可用性
 * @returns Promise with API状态
 */
export async function checkApiAvailability(): Promise<AIApiResponse> {
  try {
    const testMessage = [{ role: 'user', content: 'Hello' }];
    
    switch (currentApiProvider) {
      case 'openai':
        return await callOpenAIDevProxy(testMessage, currentModel);
      case 'deepseek':
        return await callDeepSeekProxy(testMessage, currentModel);
      case 'gemini':
        return await callGeminiProxy('Hello');
      default:
        return { success: false, error: '不支持的API提供商' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'API检查失败'
    };
  }
}

/**
 * 获取API状态
 * @returns API状态信息
 */
export function getApiStatus(): { provider: string; model: string; available: boolean } {
  return {
    provider: currentApiProvider,
            model: currentModel, 
    available: true // 简化实现
  };
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
        const messages = [{ role: 'user', content: prompt }];
        
        let response: AIApiResponse;
        
        switch (currentApiProvider) {
          case 'openai':
            // 优先使用开发环境代理
            response = await callOpenAIDevProxy(messages, currentModel);
            break;
          case 'deepseek':
            response = await callDeepSeekProxy(messages, currentModel);
            break;
          case 'gemini':
            response = await callGeminiProxy(prompt);
            break;
          default:
            response = { success: false, error: '不支持的API提供商' };
        }

        if (response.success && response.data) {
          // 提取实际的AI响应内容
          let actualContent = response.data;
          
          // 处理不同API响应格式
          if (typeof response.data === 'object') {
            // OpenAI格式：data.choices[0].message.content
            if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
              actualContent = response.data.choices[0].message.content;
            }
            // Gemini格式：data.candidates[0].content.parts[0].text
            else if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
              actualContent = response.data.candidates[0].content.parts[0].text;
            }
            // DeepSeek格式：data.choices[0].message.content
            else if (response.data.message) {
              actualContent = response.data.message.content || response.data.message;
            }
            // 如果有content字段直接使用
            else if (response.data.content) {
              actualContent = response.data.content;
            }
            // 如果data是对象但没有预期字段，转为字符串
            else {
              actualContent = JSON.stringify(response.data);
            }
          }
          
          // 确保内容不为空
          if (!actualContent || actualContent.trim() === '') {
            console.error(`Platform ${platform} - API返回空内容`, response);
            results.push({
              platform,
              content: `生成失败：API返回空内容`,
              error: 'API返回的内容为空'
            });
          } else {
            console.log(`Platform ${platform} - 生成成功:`, actualContent.substring(0, 100) + '...');
            results.push({
              platform,
              content: actualContent.trim(),
              title: settings.name,
              hashtags: [],
              suggestions: [],
              source: 'ai'
            });
          }
        } else {
          console.error(`Platform ${platform} - API调用失败:`, response);
          
          // 如果API调用失败，提供模拟内容作为回退
          const mockContent = generateMockContent(platform, originalContent, settings);
          results.push({
            platform,
            content: mockContent,
            title: settings.name,
            hashtags: [],
            suggestions: [],
            source: 'mock',
            error: response.error || 'API调用失败，使用模拟内容'
          });
        }
      } catch (error) {
        results.push({
          platform,
          content: `处理失败：${error instanceof Error ? error.message : '未知错误'}`,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
        }
        
        return {
      success: results.some(r => !r.error),
      results,
      error: results.every(r => r.error) ? '所有平台处理失败' : undefined
    };
    } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '内容适配失败'
    };
  }
}

/**
 * 批量内容适配
 * @param requests 适配请求数组
 * @returns Promise with 适配结果数组
 */
export async function batchAdaptContent(requests: ContentAdaptRequest[]): Promise<ContentAdaptResponse[]> {
  const results = [];
  for (const request of requests) {
    results.push(await adaptContent(request));
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
 * @returns 是否有效
 */
export function validatePlatformSettings(settings: PlatformSettings): boolean {
  return !!(settings.name && settings.description && settings.style);
}