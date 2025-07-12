/**
 * 内容适配器
 * 用于将内容适配到不同平台
 */

import aiService from './aiService';

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
 * @returns Promise<BatchAdaptResult>
 */
export async function adaptContentToPlatforms(request: ContentAdaptRequest): Promise<BatchAdaptResult> {
  const { originalContent, targetPlatforms, brandProfile, customSettings } = request;
  
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
      
      if (response.success && response.data?.data?.choices?.[0]?.message?.content) {
        const adaptedContent = response.data.data.choices[0].message.content;
        
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