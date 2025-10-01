/**
 * AI内容适配服务层
 * 统一封装所有AI调用逻辑，替代分散的调用方式
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
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

/**
 * 平台特定的超时配置
 */
function getPlatformTimeoutConfig(platformId: string) {
  const isLongContentPlatform = ['wechat', 'zhihu'].includes(platformId);
  return {
    isLongContent: isLongContentPlatform,
    initialTimeout: isLongContentPlatform ? 90000 : 30000, // 90秒 vs 30秒
    retryDelay: isLongContentPlatform ? 3000 : 1000, // 3秒 vs 1秒
    maxRetries: isLongContentPlatform ? 4 : 3,
    patientMessage: isLongContentPlatform ? '正在生成长篇内容，请耐心等待...' : '正在生成内容...'
  };
}

/**
 * 改进的AI调用重试机制 - 针对WeChat和Zhihu优化，使用Token统计
 * 从原版AdaptPage.tsx完整迁移，保持100%逻辑一致
 */
async function callAIWithRetry(params: any, versionName: string, platformId?: string): Promise<any> {
  let lastError: any = null;
  const originalModel = params.model;
  const timeoutConfig = getPlatformTimeoutConfig(platformId || '');
  const maxRetries = timeoutConfig.maxRetries;

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 ${versionName} - the${attempt}times尝试调用AI (模型: ${params.model})`);

        // 为WeChat和Zhihu使用优化的参数
        const adjustedParams = { ...params };
        if (timeoutConfig.isLongContent) {
          adjustedParams.temperature = Math.min(adjustedParams.temperature || 0.7, 0.5);
          adjustedParams.maxTokens = Math.max(adjustedParams.maxTokens || 2000, 2500);

          // 添加平台特定的系统提示
          if (platformId === 'wechat') {
            adjustedParams.systemPrompt += '\n重要：生成微信公众号专业长文，内容要深入、有价值、结构清晰。';
          } else if (platformId === 'zhihu') {
            adjustedParams.systemPrompt += '\n重要：生成知乎深度回答，要有专业见解、逻辑清晰、内容丰富。';
          }
        }

        const result = await callAIWithTokenTracking({
          ...adjustedParams,
          feature: 'AI内容适配',
          taskType: AITaskType.CONTENT_ADAPTATION
        });

        if (result.success && result.content && result.content.trim().length > 100) {
          console.log(`✅ ${versionName} - the${attempt}times尝试success`);
          return result;
        } else {
          const errorMsg = result.error || i18n.t('common.errors.生成内容为空或过短');
          lastError = new Error(errorMsg);
          console.log(`❌ ${versionName} - the${attempt}times尝试failed: ${errorMsg}`);
        }
      } catch (error) {
        lastError = error;
        console.error(`🚨 ${versionName} - the${attempt}times尝试abnormal:`, error);

        // 智能模型切换策略
        if (attempt <= 3) {
          const errorMessage = error instanceof Error ? error.message : String(error);

          // 检测402错误（账户余额不足）
          if (errorMessage.includes('402') || errorMessage.includes('Payment Required')) {
            console.log(`🚨 ${versionName} - detecting到402error，starting智能降级`);

            if (params.model.includes('deepseek')) {
              console.log(`🔄 ${versionName} - DeepSeekbalance不足，切换到GPT-4o-mini`);
              params.model = 'gpt-4o-mini';
            } else if (params.model.includes('gpt-4o-mini')) {
              console.log(`🔄 ${versionName} - GPT-4o-minifailed，切换到GPT-3.5-turbo`);
              params.model = 'gpt-3.5-turbo';
            } else if (params.model.includes('gpt-3.5-turbo')) {
              console.log(`🔄 ${versionName} - GPT-3.5-turbofailed，尝试使用Gemini`);
              params.model = 'gemini-pro';
            }
          } else {
            // 其他错误类型的模型切换策略
            if (params.model.includes('deepseek')) {
              console.log(`🔄 ${versionName} - DeepSeekfailed，切换到GPT-4o-mini`);
              params.model = 'gpt-4o-mini';
            } else if (params.model.includes('gpt-4o-mini')) {
              console.log(`🔄 ${versionName} - GPT-4o-minifailed，切换到GPT-3.5-turbo`);
              params.model = 'gpt-3.5-turbo';
            }
          }
        }
      }

      // 如果不是最后一次尝试，等待一段时间再重试
      if (attempt < maxRetries) {
        const delay = Math.min(timeoutConfig.retryDelay * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ ${versionName} - waiting${delay}msnextretrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  } finally {
    // 恢复原始模型设置
    params.model = originalModel;
  }

  const errorMessage = lastError ? lastError.message : `${versionName} - 所有重试都失败了`;
  return {
    success: false,
    error: errorMessage,
    content: null
  };
}

/**
 * 内容版本接口
 */
export interface ContentVersion {
  id: string;
  content: string;
  style: 'standard' | 'creative';
  title: string;
  charCount: number;
  tags?: string[]; // 新增：提取的标签
  validation?: {
    isValid: boolean;
    actualCount: number;
    targetRange: { min: number; max: number };
    warning?: string;
  };
}

/**
 * 提取和清理内容中的标签和配图建议 - 从原版AdaptPage.tsx完整迁移
 */
function extractAndCleanContent(content: string): { cleanContent: string; extractedTags: string[] } {
  if (!content) return { cleanContent: '', extractedTags: [] };

  let cleanContent = content;
  const extractedTags: string[] = [];

  // 1. 提取所有话题标签（#标签名格式）
  const hashtagRegex = /#[\u4e00-\u9fa5a-zA-Z0-9_]+/g;
  const hashtags = content.match(hashtagRegex) || [];

  // 去掉#号，只保留标签名
  hashtags.forEach(tag => {
    const tagName = tag.substring(1); // 去掉#号
    if (tagName && !extractedTags.includes(tagName)) {
      extractedTags.push(tagName);
    }
  });

  // 从内容中移除所有话题标签
  cleanContent = cleanContent.replace(hashtagRegex, '').trim();

  // 2. 移除配图建议文案（多种格式）
  const imagePatterns = [
    /（配图建议：[^）]*）/g,
    /\(配图建议：[^)]*\)/g,
    /【配图建议：[^】]*】/g,
    /\[配图建议：[^\]]*\]/g,
    /配图建议：[^\n]*/g,
    /图片建议：[^\n]*/g,
    /建议配图：[^\n]*/g,
    /\n\s*配图：[^\n]*/g,
    /\n\s*图片：[^\n]*/g
  ];

  imagePatterns.forEach(pattern => {
    cleanContent = cleanContent.replace(pattern, '');
  });

  // 3. 清理多余的空行和空格
  cleanContent = cleanContent
    .replace(/\n\s*\n\s*\n/g, '\n\n') // 多个连续空行变为两个
    .replace(/^\s+|\s+$/g, '') // 去掉首尾空格
    .trim();

  console.log('🧹 contentcleaningcompleted:', {
    原始长度: content.length,
    清理后长度: cleanContent.length,
    提取标签: extractedTags
  });

  return { cleanContent, extractedTags };
}

/**
 * 生成多个版本的内容 - 从原版AdaptPage.tsx完整迁移
 * 保持100%逻辑一致，包括版本A（标准）和版本B（创意）
 */
async function generateMultipleVersions(
  basePrompt: string,
  platformId: string,
  selectedModel: string,
  globalSettings: GlobalSettings,
  platformSettings: Record<string, any>
): Promise<ContentVersion[]> {
  const versions: ContentVersion[] = [];

  // 版本A：标准风格，结构化表达
  const standardPrompt = `${basePrompt}\n\n【版本要求】请生成标准风格的内容，要求：\n- 结构清晰，逻辑严谨\n- 表达准确，用词规范\n- 重点突出，层次分明`;

  // 版本B：创新风格，灵活化表达
  const creativePrompt = `${basePrompt}\n\n【版本要求】请生成创新风格的内容，要求：\n- 表达生动，富有创意\n- 语言灵活，贴近用户\n- 情感丰富，引人入胜`;

  try {
    console.log(`starts为平台 ${platformId} 生成多versioncontent`);
    console.log('使用模型:', selectedModel);
    console.log('hint词length:', basePrompt.length);

    // 使用统一字符数控制系统获取最终限制
    const charCountControl = getUnifiedCharCountLimit(
      platformId,
      globalSettings.charCountPreset,
      platformSettings[platformId]?.charCount
    );
    const platformAdvice = getPlatformCharCountAdvice(platformId);

    // 计算token数，确保有足够空间生成目标字符数的内容
    let maxTokens: number;
    const targetChars = charCountControl.finalLimit;

    if (globalSettings.charCountPreset === 'detailed') {
      const minTokensFor800Chars = 800;
      const targetTokens = Math.max(minTokensFor800Chars, Math.floor(targetChars / 0.8));
      maxTokens = Math.min(targetTokens, 6000);
    } else if (globalSettings.charCountPreset === 'standard') {
      maxTokens = Math.min(Math.floor(targetChars / 1.0), 4000);
    } else if (globalSettings.charCountPreset === 'mini') {
      maxTokens = Math.min(Math.floor(targetChars / 1.2), 2000);
    } else {
      maxTokens = Math.min(Math.floor(targetChars / 1.0), 3000);
    }

    const charCountInstruction = `【内容生成要求】
平台特性：${platformAdvice}
重要要求：
1. 生成的内容要完整、有价值，符合平台特性
2. 内容要自然流畅，不要为了凑字数而添加无意义内容
3. 如果内容自然长度不够，请增加具体细节、案例或深入分析
4. 确保内容质量优先，字数适中即可`;

    // 构建包含全局设置的系统提示词
    const buildSystemPrompt = (basePrompt: string): string => {
      let systemPrompt = basePrompt;

      // 添加全局格式化设置到系统提示词
      const globalFormatInstructions = [];

      if (globalSettings.globalEmoji) {
        globalFormatInstructions.push('🎯 必须在内容中适当添加相关的emoji表情符号，增强视觉效果和情感表达');
      }

      if (globalSettings.globalMd) {
        globalFormatInstructions.push('📝 必须使用Markdown语法格式化内容，包括标题(#)、加粗(**文字**)、列表(-)、引用(>)等');
      }

      if (globalSettings.globalAutoFormat) {
        globalFormatInstructions.push('🎨 必须自动优化段落结构、换行、缩进，确保内容排版美观易读');
      }

      if (globalFormatInstructions.length > 0) {
        systemPrompt += `\n\n【全局格式化要求 - 最高优先级】\n${globalFormatInstructions.join('\n')}`;
      }

      return systemPrompt;
    };

    // 生成标准版本
    const standardResult = await callAIWithRetry({
      prompt: standardPrompt,
      model: selectedModel,
      systemPrompt: buildSystemPrompt(`你是一个专业的内容创作专家，擅长生成结构化、标准化的内容。${charCountInstruction}`),
      maxTokens: maxTokens,
      temperature: 0.7
    }, i18n.t('common.labels.标准版本'), platformId);

    // 生成创意版本
    const creativeResult = await callAIWithRetry({
      prompt: creativePrompt,
      model: selectedModel,
      systemPrompt: buildSystemPrompt(`你是一个富有创意的内容创作专家，擅长生成生动、有趣的内容。${charCountInstruction}`),
      maxTokens: maxTokens,
      temperature: 0.9
    }, i18n.t('common.labels.创意版本'), platformId);

    // 处理标准版本结果
    if (standardResult.success && standardResult.content) {
      const { cleanContent, extractedTags } = extractAndCleanContent(standardResult.content);
      const actualCharCount = cleanContent.length;

      versions.push({
        id: 'version-a',
        content: cleanContent,
        style: 'standard',
        title: i18n.t('common.labels.标准版本'),
        charCount: actualCharCount,
        tags: extractedTags
      });
    }

    // 处理创意版本结果
    if (creativeResult.success && creativeResult.content) {
      const { cleanContent, extractedTags } = extractAndCleanContent(creativeResult.content);
      const actualCharCount = cleanContent.length;

      versions.push({
        id: 'version-b',
        content: cleanContent,
        style: 'creative',
        title: i18n.t('common.labels.创意版本'),
        charCount: actualCharCount,
        tags: extractedTags
      });
    }

    // 如果两个版本都失败了，尝试生成一个基础版本
    if (versions.length === 0) {
      console.log('两unitsversion都failed，尝试生成基础version');
      const fallbackResult = await callAIWithRetry({
        prompt: basePrompt,
        model: selectedModel,
        systemPrompt: '你是一个内容创作专家，请生成高质量的内容。',
        maxTokens: 2000,
        temperature: 0.8
      }, '基础版本', platformId);

      if (fallbackResult.success && fallbackResult.content) {
        versions.push({
          id: 'version-fallback',
          content: fallbackResult.content,
          style: 'standard',
          title: i18n.t('common.labels.生成版本'),
          charCount: fallbackResult.content.length
        });
      }
    }

    console.log(`平台 ${platformId} 最终生成了 ${versions.length} unitsversion`);
    return versions;
  } catch (error) {
    console.error('生成多versioncontentfailed:', error);
    return [];
  }
}

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
 * AI内容适配服务类
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
        error: error instanceof Error ? error.message : i18n.t('common.errors.生成失败')
      };
    }
  }

  /**
   * 生成多版本内容 - 新增方法，支持版本A和版本B
   */
  async generateMultipleVersions(request: ContentGenerationRequest): Promise<{
    success: boolean;
    versions: ContentVersion[];
    error?: string;
  }> {
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

      // 调用多版本生成函数
      const versions = await generateMultipleVersions(
        matrixPrompt,
        request.platform,
        request.model || 'deepseek-chat',
        this.globalSettings,
        this.platformSettings
      );

      return {
        success: versions.length > 0,
        versions,
        error: versions.length === 0 ? '生成失败，请重试' : undefined
      };
    } catch (error) {
      console.error('生成多versioncontentfailed:', error);
      return {
        success: false,
        versions: [],
        error: error instanceof Error ? error.message : '未知错误'
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
        error: result.error || i18n.t('common.errors.标题生成失败')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : i18n.t('common.errors.标题生成失败')
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
