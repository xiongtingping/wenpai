/**
 * AI内容适配器服务层
 * 统一封装所有AI调用逻辑，替代分散的调用方式
 */

import { callAIWithTokenTracking, type AICallParamsWithTracking, type AIResponseWithUsage } from '@/services/aiWithTokenTracking';
import { AITaskType } from '@/api/aiService';
import { generateMatrixPrompt } from '../utils/promptBuilders';
import { 
  generateCharCountDimension, 
  generateFormatDimension,
  createMatrixPromptGenerator,
  createFormatDimensionGenerator
} from '../utils/promptBuilders.stateful';
import { getUnifiedCharCountLimit, getPlatformCharCountAdvice } from '@/config/platformLimits';
import { type StyleType } from '@/config/contentSchemes';

// 类型定义
export interface GlobalSettings {
  charCountPreset: 'auto' | 'mini' | 'standard' | 'detailed';
  globalEmoji: boolean;
  globalMd: boolean;
  globalAutoFormat: boolean;
}

export interface PlatformSettings {
  charCount?: number;
  useEmoji?: boolean;
  useMdFormat?: boolean;
  useAutoFormat?: boolean;
}

export interface ContentGenerationRequest {
  originalContent: string;
  platform: string;
  formId?: string;
  style?: StyleType;
  charCount?: number;
  customPrompt?: string;
  useBrandLibrary?: boolean;
  brandProfile?: any;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ContentGenerationResponse {
  success: boolean;
  content?: string;
  error?: string;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    userMonthlyUsed: number;
    userMonthlyLimit: number;
    userMonthlyRemaining: number;
    usagePercentage: number;
    needUpgrade: boolean;
  };
}

export interface VersionGenerationRequest extends ContentGenerationRequest {
  versionType: 'standard' | 'creative';
}

export interface ComparisonGenerationRequest extends ContentGenerationRequest {
  alternativeFormId?: string;
  alternativeStyle?: StyleType;
}

/**
 * AI内容适配器服务类
 */
export class ContentAdapterService {
  private globalSettings: GlobalSettings;
  private platformSettings: Record<string, PlatformSettings>;

  constructor(
    globalSettings: GlobalSettings,
    platformSettings: Record<string, PlatformSettings>
  ) {
    this.globalSettings = globalSettings;
    this.platformSettings = platformSettings;
  }

  /**
   * 更新设置
   */
  updateSettings(
    globalSettings: GlobalSettings,
    platformSettings: Record<string, PlatformSettings>
  ) {
    this.globalSettings = globalSettings;
    this.platformSettings = platformSettings;
  }

  /**
   * 生成单个内容
   */
  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    try {
      // 创建状态依赖的函数
      const charCountGenerator = createMatrixPromptGenerator(this.globalSettings, this.platformSettings);
      const formatGenerator = createFormatDimensionGenerator(this.globalSettings, this.platformSettings);

      // 生成矩阵提示词
      const matrixPrompt = await generateMatrixPrompt(
        request.originalContent,
        request.platform,
        request.formId,
        request.style,
        request.charCount,
        request.customPrompt,
        request.useBrandLibrary || false,
        request.brandProfile,
        request.charCount ? charCountGenerator : undefined,
        formatGenerator
      );

      // 构建系统提示词
      const systemPrompt = this.buildSystemPrompt(request.platform);

      // 调用AI服务
      const aiParams: AICallParamsWithTracking = {
        prompt: matrixPrompt,
        model: request.model || 'deepseek-chat',
        systemPrompt,
        temperature: request.temperature || 0.7,
        maxTokens: request.maxTokens || 2000,
        feature: 'AI内容适配器',
        taskType: AITaskType.CONTENT_ADAPTATION
      };

      const result = await callAIWithTokenTracking(aiParams);

      return {
        success: result.success,
        content: result.content,
        error: result.error,
        tokenUsage: result.tokenUsage
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成失败'
      };
    }
  }

  /**
   * 生成版本内容（标准版/创意版）
   */
  async generateVersionContent(request: VersionGenerationRequest): Promise<ContentGenerationResponse> {
    const temperature = request.versionType === 'standard' ? 0.7 : 0.9;
    const systemPromptSuffix = request.versionType === 'standard' 
      ? '你是一个专业的内容创作专家，擅长生成结构化、标准化的内容。'
      : '你是一个富有创意的内容创作专家，擅长生成生动、有趣的内容。';

    return this.generateContent({
      ...request,
      temperature,
      maxTokens: request.maxTokens || 2000
    });
  }

  /**
   * 生成对比内容
   */
  async generateComparisonContent(request: ComparisonGenerationRequest): Promise<ContentGenerationResponse> {
    return this.generateContent({
      ...request,
      formId: request.alternativeFormId || request.formId,
      style: request.alternativeStyle || request.style,
      temperature: 0.9, // 增加随机性以获得不同的结果
      maxTokens: 2000
    });
  }

  /**
   * 重新生成内容
   */
  async regenerateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    return this.generateContent({
      ...request,
      temperature: 0.9, // 重新生成时增加更多随机性
      maxTokens: 2000
    });
  }

  /**
   * 生成标题
   */
  async generateTitle(content: string, model?: string): Promise<ContentGenerationResponse> {
    try {
      const aiParams: AICallParamsWithTracking = {
        prompt: `为以下内容生成3个吸引人的标题：\n\n${content}`,
        model: model || 'deepseek-chat',
        maxTokens: 200,
        feature: '标题生成',
        taskType: AITaskType.TITLE_GENERATION
      };

      const result = await callAIWithTokenTracking(aiParams);

      if (result.success && result.content) {
        // 提取第一个标题
        const generatedTitle = result.content.split('\n')[0]?.replace(/^\d+\.\s*/, '') || '生成的标题';
        
        return {
          success: true,
          content: generatedTitle,
          tokenUsage: result.tokenUsage
        };
      }

      return {
        success: false,
        error: result.error || '标题生成失败'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '标题生成失败'
      };
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(platform: string): string {
    return `你是一个专业的多维度内容创作专家，擅长为${platform}平台生成高质量内容。请严格按照多维矩阵要求生成内容。`;
  }

  /**
   * 获取平台优化参数
   */
  private getPlatformOptimizedParams(baseParams: any, platform: string): any {
    // 为长内容平台优化参数
    const longContentPlatforms = ['wechat', 'zhihu'];
    
    if (longContentPlatforms.includes(platform)) {
      return {
        ...baseParams,
        temperature: Math.min(baseParams.temperature || 0.7, 0.5),
        maxTokens: Math.max(baseParams.maxTokens || 2000, 2500)
      };
    }

    return baseParams;
  }

  /**
   * 获取字符数控制信息
   */
  getCharCountControl(platformId: string, charCount?: number) {
    return getUnifiedCharCountLimit(
      platformId,
      this.globalSettings.charCountPreset,
      charCount || this.platformSettings[platformId]?.charCount
    );
  }

  /**
   * 获取平台建议
   */
  getPlatformAdvice(platformId: string): string {
    return getPlatformCharCountAdvice(platformId);
  }
}
