/**
 * 内容适配器
 * 用于将内容适配到不同平台
 */

import aiService from './aiService';
import { 
  getScheme, 
  getDefaultScheme, 
  AVAILABLE_SCHEMES,
  type ContentScheme, 
  type PlatformScheme 
} from '@/config/contentSchemes';

/**
 * AI API响应接口
 */
export interface AIApiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * 平台适配配置
 */
export interface PlatformConfig {
  name: string;
  description: string;
  maxLength?: number;
  hashtagCount?: number;
  tone?: string;
  features?: string[];
}

/**
 * 支持的平台配置
 */
export const SUPPORTED_PLATFORMS: PlatformConfig[] = [
  {
    name: '微信',
    description: '微信公众号、朋友圈',
    maxLength: 2000,
    hashtagCount: 0,
    tone: '专业、权威',
    features: ['图文并茂', '深度内容', '专业术语']
  },
  {
    name: '微博',
    description: '新浪微博',
    maxLength: 140,
    hashtagCount: 3,
    tone: '简洁、热点',
    features: ['话题标签', '@用户', '转发互动']
  },
  {
    name: '小红书',
    description: '小红书笔记',
    maxLength: 1000,
    hashtagCount: 20,
    tone: '种草、分享',
    features: ['个人体验', '图片展示', '标签丰富']
  },
  {
    name: '抖音',
    description: '抖音短视频',
    maxLength: 300,
    hashtagCount: 5,
    tone: '轻松、有趣',
    features: ['视频脚本', '音乐配合', '互动引导']
  },
  {
    name: '知乎',
    description: '知乎问答',
    maxLength: 5000,
    hashtagCount: 0,
    tone: '专业、深度',
    features: ['详细解答', '专业术语', '引用来源']
  },
  {
    name: 'B站',
    description: 'B站视频',
    maxLength: 500,
    hashtagCount: 10,
    tone: '年轻、活力',
    features: ['弹幕互动', '视频标题', '分区标签']
  }
];

/**
 * 平台样式配置
 */
export const platformStyles: Record<string, PlatformConfig> = {
  wechat: {
    name: '微信',
    description: '微信公众号、朋友圈',
    maxLength: 2000,
    hashtagCount: 0,
    tone: '专业、权威',
    features: ['图文并茂', '深度内容', '专业术语']
  },
  weibo: {
    name: '微博',
    description: '新浪微博',
    maxLength: 140,
    hashtagCount: 3,
    tone: '简洁、热点',
    features: ['话题标签', '@用户', '转发互动']
  },
  xiaohongshu: {
    name: '小红书',
    description: '小红书笔记',
    maxLength: 1000,
    hashtagCount: 20,
    tone: '种草、分享',
    features: ['个人体验', '图片展示', '标签丰富']
  },
  douyin: {
    name: '抖音',
    description: '抖音短视频',
    maxLength: 300,
    hashtagCount: 5,
    tone: '轻松、有趣',
    features: ['视频脚本', '音乐配合', '互动引导']
  },
  zhihu: {
    name: '知乎',
    description: '知乎问答',
    maxLength: 5000,
    hashtagCount: 0,
    tone: '专业、深度',
    features: ['详细解答', '专业术语', '引用来源']
  },
  bilibili: {
    name: 'B站',
    description: 'B站视频',
    maxLength: 500,
    hashtagCount: 10,
    tone: '年轻、活力',
    features: ['弹幕互动', '视频标题', '分区标签']
  }
};

// 当前API提供商
let currentApiProvider = 'openai';

// 当前模型
let currentModel = 'gpt-4o-mini';

/**
 * 内容适配请求接口
 */
export interface ContentAdaptRequest {
  originalContent: string;
  targetPlatforms: string[];
  brandProfile?: {
    name: string;
    tone: string;
    keywords: string[];
    targetAudience: string;
  };
  customSettings?: {
    maxLength?: number;
    hashtagCount?: number;
    tone?: string;
  };
}

/**
 * 适配结果接口
 */
export interface AdaptResult {
  platform: string;
  content: string;
  success: boolean;
  error?: string;
  metadata?: {
    wordCount: number;
    charCount: number;
    hashtagCount: number;
    estimatedReadTime: number;
  };
}

/**
 * 批量适配结果接口
 */
export interface BatchAdaptResult {
  success: boolean;
  results: AdaptResult[];
  summary?: {
    totalPlatforms: number;
    successCount: number;
    failureCount: number;
    averageLength: number;
  };
  error?: string;
}

/**
 * 将内容适配到指定平台
 * @param request 适配请求
 * @param schemeId 方案ID，默认为默认方案
 * @returns Promise<BatchAdaptResult>
 */
export async function adaptContentToPlatforms(
  request: ContentAdaptRequest, 
  schemeId: string = 'default'
): Promise<BatchAdaptResult> {
  const { originalContent, targetPlatforms, brandProfile, customSettings } = request;
  
  // 获取方案配置
  const scheme = getScheme(schemeId) || getDefaultScheme();
  
  if (!originalContent.trim()) {
    return {
      success: false,
      results: [],
      error: '原始内容不能为空'
    };
  }

  if (!targetPlatforms.length) {
    return {
      success: false,
      results: [],
      error: '请选择至少一个目标平台'
    };
  }

  const results: AdaptResult[] = [];
  let successCount = 0;
  let failureCount = 0;
  let totalLength = 0;

  for (const platformName of targetPlatforms) {
    try {
      const platformConfig = SUPPORTED_PLATFORMS.find(p => p.name === platformName);
      if (!platformConfig) {
        results.push({
          platform: platformName,
          content: '',
          success: false,
          error: `不支持的平台: ${platformName}`
        });
        failureCount++;
        continue;
      }

      // 构建适配提示词
      const prompt = buildAdaptPrompt(originalContent, platformConfig, brandProfile, customSettings);
      
      // 调用AI服务进行内容适配
      const response = await aiService.adaptContent(originalContent, [platformName], customSettings);
      
      const responseData = response.data as Record<string, unknown>;
      const choices = responseData?.data as Record<string, unknown>;
      if (response.success && choices?.choices?.[0]?.message?.content) {
        const adaptedContent = choices.choices[0].message.content;
        
        // 计算元数据
        const metadata = calculateContentMetadata(adaptedContent, platformConfig);
        
        results.push({
          platform: platformName,
          content: adaptedContent,
          success: true,
          metadata
        });
        
        successCount++;
        totalLength += adaptedContent.length;
      } else {
        results.push({
          platform: platformName,
          content: '',
          success: false,
          error: response.error || 'AI适配失败'
        });
        failureCount++;
      }
    } catch (error) {
      results.push({
        platform: platformName,
        content: '',
        success: false,
        error: error instanceof Error ? error.message : '适配过程出错'
      });
      failureCount++;
    }
  }

  return {
    success: successCount > 0,
    results,
    summary: {
      totalPlatforms: targetPlatforms.length,
      successCount,
      failureCount,
      averageLength: successCount > 0 ? Math.round(totalLength / successCount) : 0
    }
  };
}

/**
 * 构建适配提示词
 */
function buildAdaptPrompt(
  originalContent: string,
  platformConfig: PlatformConfig,
  brandProfile?: any,
  customSettings?: any
): string {
  let prompt = `请将以下内容适配为${platformConfig.name}平台的内容风格：

原始内容：
${originalContent}

平台要求：
- 平台名称：${platformConfig.name}
- 平台描述：${platformConfig.description}
- 最大长度：${platformConfig.maxLength || '无限制'}字符
- 标签数量：${platformConfig.hashtagCount || 0}个
- 语气风格：${platformConfig.tone || '自然'}
- 特色功能：${platformConfig.features?.join('、') || '无'}`;

  if (brandProfile) {
    prompt += `

品牌要求：
- 品牌名称：${brandProfile.name}
- 品牌语气：${brandProfile.tone}
- 关键词：${brandProfile.keywords?.join('、') || '无'}
- 目标受众：${brandProfile.targetAudience || '无'}`;
  }

  if (customSettings) {
    prompt += `

自定义设置：
- 最大长度：${customSettings.maxLength || '使用平台默认'}
- 标签数量：${customSettings.hashtagCount || '使用平台默认'}
- 语气调整：${customSettings.tone || '使用平台默认'}`;
  }

  prompt += `

请生成符合${platformConfig.name}平台特点的内容，保持原意的同时，让内容更适合该平台的用户群体和传播特点。`;

  return prompt;
}

/**
 * 构建方案提示词
 */
function buildSchemePrompt(
  originalContent: string,
  platformScheme: PlatformScheme,
  scheme: ContentScheme,
  brandProfile?: any,
  customSettings?: any
): string {
  // 替换模板中的占位符
  let prompt = scheme.promptTemplate
    .replace('{originalContent}', originalContent)
    .replace('{platformName}', platformScheme.name)
    .replace('{platformStyle}', platformScheme.style)
    .replace('{wordLimit}', `${platformScheme.wordLimit.min}-${platformScheme.wordLimit.max}字`)
    .replace('{hashtagCount}', platformScheme.hashtagCount.toString())
    .replace('{tone}', platformScheme.tone)
    .replace('{features}', platformScheme.features.join('、'));

  // 添加品牌信息
  if (brandProfile) {
    prompt += `

品牌信息：
- 品牌名称：${brandProfile.name}
- 品牌语气：${brandProfile.tone}
- 关键词：${brandProfile.keywords?.join('、') || '无'}
- 目标受众：${brandProfile.targetAudience || '无'}`;
  }

  // 添加自定义设置
  if (customSettings) {
    prompt += `

自定义设置：
- 最大长度：${customSettings.maxLength || '使用方案默认'}
- 标签数量：${customSettings.hashtagCount || '使用方案默认'}
- 语气调整：${customSettings.tone || '使用方案默认'}`;
  }

  // 添加平台特定的提示词修饰符
  if (platformScheme.promptModifiers.length > 0) {
    prompt += `

平台特定要求：
${platformScheme.promptModifiers.map(modifier => `- ${modifier}`).join('\n')}`;
  }

  return prompt;
}

/**
 * 计算内容元数据
 */
function calculateContentMetadata(content: string, platformConfig: PlatformConfig) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const hashtagCount = (content.match(/#[^\s#]+/g) || []).length;
  const estimatedReadTime = Math.ceil(wordCount / 200); // 假设每分钟阅读200字

  return {
    wordCount,
    charCount,
    hashtagCount,
    estimatedReadTime
  };
}

/**
 * 检查内容是否符合平台要求
 */
export function validateContentForPlatform(content: string, platformConfig: PlatformConfig): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // 检查长度
  if (platformConfig.maxLength && content.length > platformConfig.maxLength) {
    issues.push(`内容长度(${content.length})超过平台限制(${platformConfig.maxLength})`);
    suggestions.push(`建议缩短内容至${platformConfig.maxLength}字符以内`);
  }

  // 检查标签数量
  const hashtagCount = (content.match(/#[^\s#]+/g) || []).length;
  if (platformConfig.hashtagCount && hashtagCount > platformConfig.hashtagCount) {
    issues.push(`标签数量(${hashtagCount})超过平台限制(${platformConfig.hashtagCount})`);
    suggestions.push(`建议减少标签数量至${platformConfig.hashtagCount}个以内`);
  }

  // 检查是否包含必要的功能
  if (platformConfig.features) {
    if (platformConfig.features.includes('话题标签') && hashtagCount === 0) {
      suggestions.push('建议添加相关话题标签以提高曝光度');
    }
    
    if (platformConfig.features.includes('@用户') && !content.includes('@')) {
      suggestions.push('建议@相关用户或账号以增加互动');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * 获取平台配置信息
 */
export function getPlatformConfig(platformName: string): PlatformConfig | null {
  return SUPPORTED_PLATFORMS.find(p => p.name === platformName) || null;
}

/**
 * 获取所有支持的平台
 */
export function getAllSupportedPlatforms(): PlatformConfig[] {
  return [...SUPPORTED_PLATFORMS];
}

/**
 * 生成适配内容
 */
export async function generateAdaptedContent(
  originalContent: string,
  targetPlatforms: string[],
  settings?: Record<string, unknown>,
  schemeId: string = 'default'
): Promise<Record<string, { content: string; source: "ai"; error?: string }>> {
  try {
    // 获取方案配置
    const scheme = getScheme(schemeId) || getDefaultScheme();
    const result: Record<string, { content: string; source: "ai"; error?: string }> = {};
    
    // 为每个平台单独生成内容
    for (const platformId of targetPlatforms) {
      try {
        // 获取方案中的平台配置
        const platformScheme = scheme.platforms.find(p => p.platformId === platformId);
        if (!platformScheme) {
          result[platformId] = {
            content: '',
            source: "ai",
            error: `方案 ${scheme.name} 不支持平台: ${platformId}`
          };
          continue;
        }

        // 构建方案提示词
        const prompt = buildSchemePrompt(originalContent, platformScheme, scheme, undefined, settings);
        const response = await aiService.generateText({
          messages: [
            {
              role: 'system',
              content: '你是一个专业的内容适配专家，能够将内容适配到不同的社交媒体平台。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: getModel(),
          maxTokens: 2000,
          temperature: 0.7
        });
        
        if (response.success && response.data) {
          // 提取平台内容
          let platformContent = '';
          
          // 从响应中提取内容
          if (typeof response.data === 'string') {
            platformContent = response.data;
          } else if (response.data && typeof response.data === 'object') {
            const dataObj = response.data as any;
            if (dataObj.data && dataObj.data.choices && dataObj.data.choices[0] && dataObj.data.choices[0].message) {
              platformContent = dataObj.data.choices[0].message.content;
            } else if (dataObj.choices && dataObj.choices[0] && dataObj.choices[0].message) {
              platformContent = dataObj.choices[0].message.content;
            } else {
              platformContent = JSON.stringify(response.data);
            }
          }
          
          // 尝试从响应中提取特定平台的内容
          const platformPattern = new RegExp(`=== ${platformScheme.name} ===\\s*([\\s\\S]*?)\\s*=== 结束 ===`, 'i');
          const match = platformContent.match(platformPattern);
          
          if (match && match[1]) {
            platformContent = match[1].trim();
          }
          
          result[platformId] = {
            content: platformContent,
            source: "ai"
          };
        } else {
          result[platformId] = {
            content: '',
            source: "ai",
            error: response.error || '生成失败'
          };
        }
      } catch (error) {
        result[platformId] = {
          content: '',
          source: "ai",
          error: error instanceof Error ? error.message : '未知错误'
        };
      }
    }
    
    return result;
  } catch (error) {
    // 如果发生异常，为每个平台返回错误
    const result: Record<string, { content: string; source: "ai"; error?: string }> = {};
    
    for (const platformId of targetPlatforms) {
      result[platformId] = {
        content: '',
        source: "ai",
        error: error instanceof Error ? error.message : '内容适配失败'
      };
    }
    
    return result;
  }
}

/**
 * 重新生成平台内容
 */
export async function regeneratePlatformContent(
  platformId: string,
  originalContent: string,
  settings?: Record<string, unknown>,
  schemeId: string = 'default'
): Promise<AIApiResponse> {
  try {
    // 获取方案配置
    const scheme = getScheme(schemeId) || getDefaultScheme();
    
    // 获取方案中的平台配置
    const platformScheme = scheme.platforms.find(p => p.platformId === platformId);
    if (!platformScheme) {
      return {
        success: false,
        error: `方案 ${scheme.name} 不支持平台: ${platformId}`
      };
    }

    // 构建方案提示词
    const prompt = buildSchemePrompt(originalContent, platformScheme, scheme, undefined, settings);
    const response = await aiService.generateText({
      messages: [
        {
          role: 'system',
          content: '你是一个专业的内容适配专家，能够将内容适配到不同的社交媒体平台。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: getModel(),
      maxTokens: 2000,
      temperature: 0.7
    });
    
    if (response.success && response.data) {
      // 提取平台内容
      let platformContent = '';
      
      // 从响应中提取内容
      if (typeof response.data === 'string') {
        platformContent = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const dataObj = response.data as any;
        if (dataObj.data && dataObj.data.choices && dataObj.data.choices[0] && dataObj.data.choices[0].message) {
          platformContent = dataObj.data.choices[0].message.content;
        } else if (dataObj.choices && dataObj.choices[0] && dataObj.choices[0].message) {
          platformContent = dataObj.choices[0].message.content;
        } else {
          platformContent = JSON.stringify(response.data);
        }
      }
      
      // 尝试从响应中提取特定平台的内容
      const platformPattern = new RegExp(`=== ${platformScheme.name} ===\\s*([\\s\\S]*?)\\s*=== 结束 ===`, 'i');
      const match = platformContent.match(platformPattern);
      
      if (match && match[1]) {
        platformContent = match[1].trim();
      }
      
      return {
        success: true,
        data: platformContent
      };
    } else {
      return {
        success: false,
        error: response.error || '生成失败'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '内容重新生成失败'
    };
  }
}

/**
 * 设置API提供商
 */
export function setApiProvider(provider: string): void {
  currentApiProvider = provider;
}

/**
 * 获取API提供商
 */
export function getApiProvider(): string {
  return currentApiProvider;
}

/**
 * 设置模型
 */
export function setModel(model: string): void {
  currentModel = model;
}

/**
 * 获取模型
 */
export function getModel(): string {
  return currentModel;
}

/**
 * 获取可用模型列表
 */
export function getAvailableModels(): string[] {
  return ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
}

/**
 * 获取所有可用方案
 */
export function getAvailableSchemes() {
  return AVAILABLE_SCHEMES;
}

/**
 * 获取方案配置
 */
export function getSchemeConfig(schemeId: string) {
  return getScheme(schemeId);
}

/**
 * 获取默认方案
 */
export function getDefaultSchemeConfig() {
  return getDefaultScheme();
}