/**
 * AI内容适配服务层
 * 统一封装所有AI调用逻辑，替代分散的调用方式
 */

import i18n from '@/i18n';
import { callAIWithTokenTracking, type AICallParamsWithTracking } from '@/services/aiWithTokenTracking';
import { AITaskType } from '@/api/aiService';
import { generateMatrixPrompt } from '../utils/promptBuilders';
import {
  createMatrixPromptGenerator,
  createFormatDimensionGenerator
} from '../utils/promptBuilders.stateful';
import { getUnifiedCharCountLimit, getPlatformCharCountAdvice } from '@/config/platformLimits';
import { type StyleType } from '@/config/contentSchemes';
import {
  getNextFallbackModel,
  getFallbackReasonFromError,
  getFallbackReasonDescription
} from '@/config/modelFallback';
import { logger } from '@/utils/logger';
import { fixTruncatedTitle } from '@/utils/safeTrimTitle';


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
        logger.info(`${versionName} - 第${attempt}次尝试调用AI`, {
          model: params.model,
          attempt,
          maxRetries
        });

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

        // 🚫 检查是否为Token限额错误，如果是则立即停止重试
        if (!result.success && result.errorType === 'token_limit') {
          logger.error(`${versionName} - Token限额超限，停止重试`, {
            error: result.error,
            monthlyUsed: result.tokenUsage?.userMonthlyUsed,
            monthlyLimit: result.tokenUsage?.userMonthlyLimit
          });
          throw new Error(result.error || 'Token限额已超过');
        }

        // 🔧 详细日志：输出 AI 响应的完整信息
        logger.info(`${versionName} - 第${attempt}次尝试 AI 响应:`, {
          success: result.success,
          hasContent: !!result.content,
          contentLength: result.content?.length || 0,
          contentPreview: result.content?.substring(0, 200) || '(空)',
          error: result.error,
          model: result.model,
          usage: result.usage,
          responseTime: result.responseTime
        });

        if (result.success && result.content && result.content.trim().length > 100) {
          logger.info(`${versionName} - 第${attempt}次尝试成功`, {
            contentLength: result.content.length,
            model: params.model
          });
          return result;
        } else {
          const errorMsg = result.error || i18n.t('common.errors.生成内容为空或过短');
          lastError = new Error(errorMsg);

          // 🔧 FIX: 输出完整的 AI 响应用于调试
          logger.error(`${versionName} - 第${attempt}次尝试失败 - 详细原因:`, {
            error: errorMsg,
            attempt,
            检查项: {
              success: result.success,
              hasContent: !!result.content,
              contentLength: result.content?.length || 0,
              contentTooShort: result.content ? result.content.trim().length <= 100 : true,
              actualContent: result.content || '(null)',
              errorFromAI: result.error || '(无)'
            },
            完整响应: result
          });
        }
      } catch (error) {
        lastError = error;

        // 🔧 FIX: 输出详细的错误信息
        logger.error(`${versionName} - 第${attempt}次尝试异常 - 详细信息:`, {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorStack: error instanceof Error ? error.stack : undefined,
          model: params.model,
          attempt,
          platformId
        });

        // ✅ 使用配置化的智能模型降级策略
        if (attempt <= 3) {
          const errorMessage = error instanceof Error ? error.message : String(error);

          // 判断降级原因
          const fallbackReason = getFallbackReasonFromError(errorMessage);
          const reasonDesc = getFallbackReasonDescription(fallbackReason);

          // 获取下一个降级模型（attempt-1因为索引从0开始）
          const nextModel = getNextFallbackModel(params.model, attempt - 1, fallbackReason);

          if (nextModel) {
            logger.info(`${versionName} - 智能降级`, {
              reason: reasonDesc,
              from: params.model,
              to: nextModel,
              attempt
            });
            params.model = nextModel;
          } else {
            logger.warn(`${versionName} - 没有更多降级选项`, {
              currentModel: params.model,
              attempt
            });
          }
        }
      }

      // 如果不是最后一次尝试，等待一段时间再重试
      if (attempt < maxRetries) {
        const delay = Math.min(timeoutConfig.retryDelay * Math.pow(2, attempt - 1), 10000);
        logger.info(`${versionName} - 等待${delay}ms后重试`, { attempt, delay });
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

  logger.debug('内容清理完成', {
    originalLength: content.length,
    cleanedLength: cleanContent.length,
    extractedTags
  });

  const filteredTags = extractedTags.filter(tag => !/^#?u[0-9a-f]{4,}$/i.test(tag));
  return { cleanContent, extractedTags: filteredTags };
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

  // 版本A：标准风格，结构化、专业性强
  const standardPrompt = `${basePrompt}\n\n【版本A - 标准专业风格】
请生成一份专业、严谨的内容，具体要求：
- 采用正式、规范的表达方式
- 结构清晰，层次分明，使用小标题和要点
- 提供数据、案例、专业术语支撑观点
- 语言客观中立，注重逻辑性和可信度
- 适合商务场景、行业分析、专业解读`;

  // 版本B：创意风格，生动活泼、情感丰富
  const creativePrompt = `${basePrompt}\n\n【版本B - 创意活泼风格】
请生成一份生动、有趣的内容，具体要求：
- 采用口语化、轻松的表达方式
- 加入比喻、故事、场景化描述
- 使用问句、感叹句增强互动感
- 融入情感共鸣，拉近与读者距离
- 语言灵活多变，富有感染力和趣味性
- 适合社交媒体、个人分享、情感共鸣场景`;

  try {
    logger.info(`开始为平台 ${platformId} 生成多版本内容`, {
      platform: platformId,
      model: selectedModel,
      promptLength: basePrompt.length
    });

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

    // 🔧 FIX: 顺序生成版本A和B，确保内容差异化
    // 先生成标准版本A
    const standardResult = await callAIWithRetry({
      prompt: standardPrompt,
      model: selectedModel,
      systemPrompt: buildSystemPrompt(`你是一个专业的内容创作专家，擅长生成结构化、标准化的内容。${charCountInstruction}`),
      maxTokens: maxTokens,
      temperature: 0.5, // 🔧 降低temperature使版本A更稳定、专业
      // ✅ 添加差异化参数确保版本A的唯一性
      regenerationSeed: `version-a-${Date.now()}`, // 添加时间戳确保唯一性
      variationLevel: 'moderate',
      styleVariation: 'structure'
    }, '标准版本(版本A)', platformId);

    // 🔧 FIX: 延迟2000ms后再生成创意版本B，避免API缓存（从500ms增加到2000ms）
    logger.info('⏱️ 等待2秒后生成版本B，避免API缓存...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 再生成创意版本B，使用更高的temperature和显著差异化参数
    const creativeResult = await callAIWithRetry({
      prompt: creativePrompt,
      model: selectedModel,
      systemPrompt: buildSystemPrompt(`你是一个富有创意的内容创作专家，擅长生成生动、有趣的内容。🚨 重要：必须与标准版本风格完全不同，更加口语化和生动，严禁重复版本A的内容。${charCountInstruction}`),
      maxTokens: maxTokens,
      temperature: 1.0, // 🔧 提高temperature到最大值增加创意性和随机性（从0.95提高到1.0）
      // ✅ 添加显著差异化参数确保版本B与版本A完全不同
      regenerationSeed: `version-b-${Date.now()}`, // 添加时间戳确保唯一性
      variationLevel: 'significant',
      styleVariation: 'tone'
    }, '创意版本(版本B)', platformId);

    // 处理标准版本结果
    if (standardResult.success && standardResult.content) {
      const { cleanContent, extractedTags } = extractAndCleanContent(standardResult.content);
      const actualCharCount = (cleanContent || '').length;

      versions.push({
        id: 'version-a',
        content: cleanContent,
        style: 'standard',
        title: '版本A',
        charCount: actualCharCount,
        tags: extractedTags
      });

      logger.info('✅ 版本A生成成功', {
        platform: platformId,
        charCount: actualCharCount,
        contentPreview: cleanContent.substring(0, 100)
      });
    } else {
      logger.error('❌ 版本A生成失败', {
        platform: platformId,
        success: standardResult.success,
        hasContent: !!standardResult.content,
        error: standardResult.error,
        result: standardResult
      });
    }

    // 处理创意版本结果
    if (creativeResult.success && creativeResult.content) {
      const { cleanContent, extractedTags } = extractAndCleanContent(creativeResult.content);
      const actualCharCount = (cleanContent || '').length;

      versions.push({
        id: 'version-b',
        content: cleanContent,
        style: 'creative',
        title: '版本B',
        charCount: actualCharCount,
        tags: extractedTags
      });

      logger.info('✅ 版本B生成成功', {
        platform: platformId,
        charCount: actualCharCount,
        contentPreview: cleanContent.substring(0, 100)
      });
    } else {
      logger.error('❌ 版本B生成失败', {
        platform: platformId,
        success: creativeResult.success,
        hasContent: !!creativeResult.content,
        error: creativeResult.error,
        result: creativeResult
      });
    }

    // 如果两个版本都失败了，尝试生成一个基础版本
    if (versions.length === 0) {
      logger.warn('两个版本都失败，尝试生成基础版本', { platform: platformId });
      const fallbackResult = await callAIWithRetry({
        prompt: basePrompt,
        model: selectedModel,
        systemPrompt: '你是一个内容创作专家，请生成高质量的内容。',
        maxTokens: 2000,
        temperature: 0.8
      }, '基础版本', platformId);

      if (fallbackResult.success && fallbackResult.content) {
        const fallbackContent = fallbackResult.content || '';
        versions.push({
          id: 'version-fallback',
          content: fallbackContent,
          style: 'standard',
          title: '基础版本',
          charCount: fallbackContent.length
        });
      }
    }

    logger.info(`平台 ${platformId} 最终生成了 ${versions.length} 个版本`, {
      platform: platformId,
      versionCount: versions.length
    });
    return versions;
  } catch (error) {
    logger.error('生成多版本内容失败', { error, platform: platformId });
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
  candidates?: string[]; // 新增：可选的多候选标题，用于UI展示

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

      // ✅ 调用多版本生成函数
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
      logger.error('生成多版本内容失败', { error });
      return {
        success: false,
        versions: [],
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
  /**
   * 生成版本内容(标准版/创意版)
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
   * 生成标题 - 增强版
   * 集成5种标题风格、多维度评分体系和质量过滤
   */
  async generateTitle(
    content: string,
    platform: string = 'default',
    model?: string,
    stylePreference?: string[]
  ): Promise<ContentGenerationResponse> {
    try {
      // 限制内容长度，避免token过多
      const truncatedContent = content.length > 500 ? content.substring(0, 500) + '...' : content;

      // 构建增强的提示词，包含5种风格
      const stylePrompts = stylePreference && stylePreference.length > 0
        ? `请生成以下风格的标题：${stylePreference.join('、')}`
        : `请生成多样化的标题，包含以下风格：
1. 结果+情绪型：强调使用结果 + 情感评价
2. 提问钩子型：用好奇心驱动点击
3. 原因+行动型：讲述为什么用 + 得到了什么
4. 体验+反差型：从"以前"到"现在"的转变
5. 工具+明确价值型：工具名称 + 功能/收益`;

      const aiParams: AICallParamsWithTracking = {
        prompt: `请基于以下内容生成5个吸引人的标题（必须使用简体中文输出）。

【内容】
${truncatedContent}

【风格要求】
${stylePrompts}

【质量要求 - 必须严格遵守】
1. 标题要准确概括核心内容（语义相关性 ≥ 60%）
2. 具有情绪吸引力（冲突感、对比感、转变、情绪词）
3. 结构多样化，避免重复句式
4. **语义完整性要求**：
   - 必须有自然的结尾，避免在半个词上截断
   - 好的结尾：了、的、！、？、。、吧、呢、啊、哦
   - 禁止的结尾：、是、和、让、要、在、文、工、台
   - 避免语序异常如"让我小红书"、"工具帮我小"
5. 充分利用字符空间，但不要为了凑字数而牺牲语义完整性
6. 长度在8-30字之间

【截断预防要求】
- 如果接近字符限制，优先在自然边界处结束（句号、感叹号、逗号等）
- 不要在词组中间强行截断
- 确保标题即使被截断也能保持基本语义

【输出格式】
请以JSON格式返回，包含以下字段：
{
  "titles": [
    {
      "title": "标题内容",
      "style": "风格类型",
      "reasoning": "生成理由"
    }
  ]
}

请直接返回JSON，不要其他说明文字：`,
        systemPrompt: `你是一个专业的标题生成专家，擅长生成高质量、多样化的标题。\n\n【语言要求】\n- 必须使用简体中文输出所有标题\n- 专有名词如需保留英文，请在首次出现时使用括号提供中文释义

【核心原则】
1. 与原文内容高度相关
2. 具有强烈的吸引力和传播性
3. **语义完整闭合** - 这是最重要的原则
4. 风格多样，避免模板化

【语义闭合要求】
- 每个标题必须是完整的句子或短语
- 避免在词组中间截断
- 确保最后一个字是自然的结尾
- 如果接近字数限制，优先缩短而不是强行填满

【禁止行为】
- 禁止生成未闭合的标题（如"发现宝藏AI工具让我小红书台、内容创作…"）
- 禁止在关键词中间截断（如"...文…"、"...工…"）
- 禁止出现语序异常（如"让我小红书优化"）

请严格按照JSON格式返回结果。`,
        model: model || 'deepseek-chat', // ✅ FIX: 兜底模型改为DeepSeek，确保稳定性
        maxTokens: 500,
        temperature: 0.8,
        feature: '标题生成',
        taskType: AITaskType.TITLE_GENERATION
      };

      // 标题生成采用两次尝试：当前模型 → 回退模型；并注入上下文用于请求去重隔离
      let currentModel = model || 'deepseek-chat';
      let result = await callAIWithTokenTracking({ ...aiParams, model: currentModel, context: ['title', platform] });
      if (!(result.success && result.content)) {
        currentModel = getNextFallbackModel(currentModel);
        result = await callAIWithTokenTracking({ ...aiParams, model: currentModel, context: ['title', platform] });
      }

      if (result.success && result.content) {
        // 解析AI返回的JSON
        let parsedTitles: any[] = [];
        try {
          let jsonContent = result.content.trim();
          // 移除markdown代码块标记
          if (jsonContent.startsWith('```json')) {
            jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (jsonContent.startsWith('```')) {
            jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          const parsed = JSON.parse(jsonContent);
          parsedTitles = parsed.titles || [];
        } catch (parseError) {
          logger.warn('解析标题JSON失败，使用简单清理逻辑', { parseError });
          // 如果JSON解析失败，尝试简单提取
          const lines = result.content.split('\n').filter(line => line.trim().length > 0);
          parsedTitles = lines.slice(0, 5).map(line => ({
            title: line.replace(/^[\d\.、\-\*]+\s*/, '').trim(),
            style: 'unknown',
            reasoning: '自动提取'
          }));
        }

        // 对每个标题进行质量评分和过滤
        const scoredTitles = parsedTitles.map(item => {
          let title = this.cleanTitle(item.title || item);

          // 应用截断修复（如果需要）
          const platformLimit = this.getPlatformLimit(platform);
          if (title.length > platformLimit) {
            // 使用安全截断修复（ESM导入）
            title = fixTruncatedTitle(title, platformLimit);
          }

          // 计算综合评分（这里简化实现，实际应调用QualityScoreService）
          const semanticFit = this.estimateSemanticFit(title, content);
          const emotionalAppeal = this.estimateEmotionalAppeal(title);
          const semanticCompleteness = this.estimateSemanticCompleteness(title);
          const utilizationScore = Math.min(title.length / platformLimit, 1.0);

          const overallScore =
            semanticFit * 0.50 +           // 语义相关性 50%
            emotionalAppeal * 0.20 +       // 情绪吸引力 20%
            0.15 +                          // 结构多样性 15% (简化)
            semanticCompleteness * 0.10 +  // 语义完整性 10%
            utilizationScore * 0.05;       // 字符利用率 5%

          return {
            title,
            style: item.style || 'unknown',
            reasoning: item.reasoning || '生成的标题',
            overallScore
          };
        });

        // 过滤和排序
        const qualifiedTitles = scoredTitles
          .filter(item =>
            item.overallScore >= 0.6 &&
            item.title.length >= 5 &&

        //                   //         

            item.title.length <= 50 &&
            !item.title.includes('undefined') &&
            !item.title.includes('null')
          )
          .sort((a, b) => b.overallScore - a.overallScore);

        // 非空保障：如过滤后为空，保留一个安全标题，避免“缺失标题”情况
        if (qualifiedTitles.length === 0) {
          const safeTitle = this.cleanTitle(parsedTitles?.[0]?.title || result.content || '标题');
          qualifiedTitles = [{ title: safeTitle, style: 'fallback', reasoning: 'safe-guard', overallScore: 0.6 } as any];
        }

        // 返回最佳标题与候选集
        const bestTitle = qualifiedTitles[0]?.title || this.cleanTitle(result.content);
        const candidates = qualifiedTitles.slice(0, 3).map(item => item.title);


        return {
          success: true,
          content: bestTitle,
          candidates,
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
   * 清理标题
   */
  private cleanTitle(title: string): string {
    let cleaned = title.trim();

    // 统一移除 Markdown 级别标题、章节序号、奇怪标点
    cleaned = cleaned
      // 去除Markdown标题#
      .replace(/^#{1,6}\s*/, '')
      // 去除常见中文章节前缀（如 一、 二、 第三章 等）
      .replace(/^(第[一二三四五六七八九十百千]+[章节篇]\s*)/, '')
      .replace(/^[一二三四五六七八九十百千两零]+、\s*/, '')
      // 去除数字式章节如 1. 或 1.1. 或 1）等
      .replace(/^\d+(?:\.\d+)*[\)\.]?\s*/, '')
      // 移除常见的“标题是/如下”等前缀
      .replace(/^(好的|标题[:：]|以下是标题[:：]|这里是标题[:：]|标题如下[:：]|标题是[:：])/i, '')
      // 移除开头/结尾引号和括号
      .replace(/^["'“”‘’「」『』【】\(\)\[\]]+/g, '')
      .replace(/["'“”‘’「」『』【】\(\)\[\]]+$/g, '')
      // 移除结尾多余的顿号/无意义标点
      .replace(/[，、：:；;—\-~\s]+$/g, '')
      .trim();

    return cleaned;
  }

  /**
   * 估算语义相关性（简化版）
   */
  private estimateSemanticFit(title: string, content: string): number {
    const titleWords = new Set(title.split(''));
    const contentWords = new Set(content.substring(0, 200).split(''));

    let commonCount = 0;
    titleWords.forEach(word => {
      if (contentWords.has(word)) commonCount++;
    });

    return Math.min(commonCount / Math.max(titleWords.size, 1), 1.0);
  }

  /**
   * 估算情绪吸引力（简化版）
   */
  private estimateEmotionalAppeal(title: string): number {
    const emotionalWords = ['惊艳', '震撼', '没想到', '竟然', '真的', '太', '提升', '改善', '优化'];
    const matches = emotionalWords.filter(word => title.includes(word));
    return Math.min(0.5 + matches.length * 0.15, 1.0);
  }

  /**
   * 估算语义完整性（简化版）
   */
  private estimateSemanticCompleteness(title: string): number {
    const goodEndings = ['了', '的', '！', '？', '。', '吧', '呢'];
    const badEndings = ['、', '是', '和', '让', '要'];

    const lastChar = title[title.length - 1];
    if (goodEndings.includes(lastChar)) return 0.9;
    if (badEndings.includes(lastChar)) return 0.3;
    return 0.6;
  }

  /**
   * 获取平台字符限制
   */
  private getPlatformLimit(platform: string): number {
    const limits: Record<string, number> = {
      'xiaohongshu': 20,
      'wechat': 64,
      'douyin': 2200,
      'weibo': 2000,
      'zhihu': 10000,
      'bilibili': 80,
      'toutiao': 30,
      'default': 30
    };

    return limits[platform] || limits['default'];
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(platform: string): string {
    // 统一语言要求：根据当前i18n语言强制输出简体中文（默认）
    const lang = (i18n?.language || 'zh-CN').toLowerCase();
    const languageDirective = lang.startsWith('zh')
      ? '【语言要求】全部使用简体中文输出，包括标题、正文与话题标签；如需使用英文专有名词，请在首次出现时提供中文括注。严禁输出英文版正文。'
      : '【Language Requirement】Output in natural English unless the original content is explicitly Chinese; keep terminology consistent. When using Chinese proper nouns, provide the English transliteration in parentheses on first mention.';

    return `你是一个专业的多维度内容创作专家，擅长为${platform}平台生成高质量内容。请严格按照多维矩阵要求生成内容。
${languageDirective}`;
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
