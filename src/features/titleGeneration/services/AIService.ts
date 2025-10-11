/**
 * AI 服务抽象层
 * 统一管理 AI 模型调用，支持降级策略
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { callAIWithTokenTracking, AITaskType } from '@/services/aiWithTokenTracking';
import { callAIWithRetry } from '@/api/ai';
import type { AICallParams } from '@/api/ai';
import { TitleGenerationConfig } from '../config/titleGeneration.config';
import { concurrencyManager } from './ConcurrencyManager';
import { logger } from '@/utils/logger';
import type {
  IAIService,
  AICallOptions,
  AIResponse
} from '../types/titleGeneration.types';
import { TitleGenerationError } from '../types/titleGeneration.types';

//   i18n 
const tr = (key: string, fallback: string): string => {
  try {
    // @ts-expect-error  i18n 
    const gi = (globalThis as any)?.i18n;
    if (gi && typeof gi.t === 'function') return gi.t(key) as string;
  } catch {}
  return fallback;
};

export class AIService implements IAIService {
  private availableModels: string[] = [];
  private modelStatus: Map<string, boolean> = new Map();
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 5 * 60 * 1000; // 5分钟

  constructor() {
    this.initializeModels();
  }

  /**
   * 初始化可用模型列表
   */
  private initializeModels(): void {
    const config = TitleGenerationConfig.aiService;
    this.availableModels = [config.primaryModel, ...config.fallbackModels];

    // 初始化模型状态
    this.availableModels.forEach(model => {
      this.modelStatus.set(model, true);
    });
  }

  /**
   * 使用降级策略调用 AI (支持并发)
   */
  async callWithFallback(prompt: string, options: AICallOptions = {}): Promise<AIResponse> {
    return concurrencyManager.submit(
      () => this.executeCallWithFallback(prompt, options),
      {
        priority: options.priority || 0,
        maxRetries: 1, // AI服务内部已有重试，这里减少重试
        timeout: options.timeout || TitleGenerationConfig.aiService.timeout,
        tags: {
          operation: 'ai_call',
          model: options.model || 'auto'
        }
      }
    );
  }

  /**
   * 批量调用AI (并发优化)
   */
  async callBatch(
    prompts: string[],
    options: AICallOptions = {}
  ): Promise<AIResponse[]> {
    const executors = prompts.map(prompt =>
      () => this.executeCallWithFallback(prompt, options)
    );

    return concurrencyManager.submitBatch(executors, {
      priority: options.priority || 0,
      maxRetries: 1,
      timeout: options.timeout || TitleGenerationConfig.aiService.timeout,
      tags: {
        operation: 'ai_batch_call',
        batch_size: prompts.length.toString()
      }
    });
  }

  /**
   * 流式调用AI (支持实时响应)
   */
  async *callStream(
    prompts: string[],
    options: AICallOptions & { concurrency?: number } = {}
  ): AsyncGenerator<{ index: number; result: AIResponse; error?: Error }, void, unknown> {
    const { concurrency = 2, ...aiOptions } = options;

    const executors = prompts.map(prompt =>
      () => this.executeCallWithFallback(prompt, aiOptions)
    );

    yield* concurrencyManager.submitStream(executors, {
      concurrency,
      priority: aiOptions.priority || 0,
      maxRetries: 1,
      timeout: aiOptions.timeout || TitleGenerationConfig.aiService.timeout
    });
  }

  /**
   * 实际执行AI调用的方法
   */
  private async executeCallWithFallback(prompt: string, options: AICallOptions = {}): Promise<AIResponse> {
    const config = TitleGenerationConfig.aiService;
    const modelsToTry = this.getAvailableModels();

    if (modelsToTry.length === 0) {
      throw new TitleGenerationError(
        tr('titleGen.errors.noAvailableModels', '没有可用的AI模型'),
        'NO_AVAILABLE_MODELS',
        { requestedModels: this.availableModels }
      );
    }

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        logger.debug(`🤖 尝试使用模型: ${model}`);

        const startTime = performance.now();
        const response = await this.callSingleModel(model, prompt, options);
        const duration = performance.now() - startTime;

        logger.debug(`✅ 模型 ${model} 调用成功，耗时: ${duration.toFixed(2)}ms`);

        // 标记模型为可用
        this.modelStatus.set(model, true);

        return {
          content: response.content,
          model: model,
          usage: response.usage || {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
          },
          finishReason: response.finishReason || 'stop'
        };

      } catch (error) {
        logger.warn(`❌ 模型 ${model} 调用failed:`, error);

        // 标记模型为不可用
        this.modelStatus.set(model, false);
        lastError = error instanceof Error ? error : new Error(String(error));

        // 如果不是最后一个模型，继续尝试下一个
        continue;
      }
    }

    // 所有模型都失败了
    throw new TitleGenerationError(
      `所有AI模型调用失败: ${lastError?.message}`,
      'ALL_MODELS_FAILED',
      {
        triedModels: modelsToTry,
        lastError: lastError?.message
      }
    );
  }

  /**
   * 调用单个模型
   */
  private async callSingleModel(
    model: string,
    prompt: string,
    options: AICallOptions
  ): Promise<any> {
    const config = TitleGenerationConfig.aiService;

    const callParams: AICallParams = {
      prompt,
      model: model as any,
      temperature: options.temperature ?? config.temperature,
      maxTokens: options.maxTokens ?? config.maxTokens
    };

    // 根据模型选择调用方式
    if (config.retries > 0) {
      return await callAIWithRetry(callParams, config.retries);
    } else {
      return await callAIWithTokenTracking({
        ...callParams,
        taskType: AITaskType.TITLE_GENERATION,
        feature: '标题生成'
      });
    }
  }

  /**
   * 检查模型是否可用
   */
  async isAvailable(model: string): Promise<boolean> {
    // 如果最近检查过，直接返回缓存结果
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.modelStatus.get(model) ?? false;
    }

    try {
      // 发送简单的测试请求
      await this.callSingleModel(model, '测试', {
        maxTokens: 10,
        timeout: 5000
      });

      this.modelStatus.set(model, true);
      return true;
    } catch (error) {
      this.modelStatus.set(model, false);
      return false;
    } finally {
      this.lastHealthCheck = now;
    }
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): string[] {
    return this.availableModels.filter(model =>
      this.modelStatus.get(model) !== false
    );
  }

  /**
   * 重置模型状态
   */
  resetModelStatus(): void {
    this.availableModels.forEach(model => {
      this.modelStatus.set(model, true);
    });
    this.lastHealthCheck = 0;
  }

  /**
   * 获取模型统计信息
   */
  getModelStats(): Record<string, { available: boolean; lastUsed?: number }> {
    const stats: Record<string, { available: boolean; lastUsed?: number }> = {};

    this.availableModels.forEach(model => {
      stats[model] = {
        available: this.modelStatus.get(model) ?? false
      };
    });

    return stats;
  }

  /**
   * 构建标题生成提示词
   */
  buildTitleGenerationPrompt(
    content: string,
    platform: string,
    styles: string[],
    count: number
  ): string {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt(content, platform, styles, count);

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  /**
   * 获取系统提示词
   */
  private getSystemPrompt(): string {
    const i18nInstance = (globalThis as any)?.i18n;
    if (i18nInstance && typeof i18nInstance.t === 'function') {
      return i18nInstance.t('aiPrompts.titleGeneration.systemPrompt');
    }
    // Fallback
    return `You are a professional title generation expert, skilled at creating attractive titles for different platforms.

Please follow these principles:
1. Titles should be concise and powerful, highlighting core selling points
2. Adjust style and length according to platform characteristics
3. Use appropriate emotional vocabulary and rhetorical techniques
4. Ensure titles are highly relevant to content
5. Avoid clickbait and false exaggeration

Output format requirements (JSON array):
[
  {
    "title": "Title text",
    "style": "Title style",
    "length": Character length,
    "semanticFit": Semantic fit (0-1),
    "reasoning": "Generation reasoning"
  }
]`;
  }

  /**
   * 获取用户提示词
   */
  private getUserPrompt(
    content: string,
    platform: string,
    styles: string[],
    count: number
  ): string {
    const i18nInstance = (globalThis as any)?.i18n;
    if (i18nInstance && typeof i18nInstance.t === 'function') {
      return i18nInstance.t('aiPrompts.titleGeneration.userPromptTemplate', {
        count,
        platform,
        content,
        requirements: `- ${i18nInstance.t('common.style')}: ${styles.join('、')}\n- ${i18nInstance.t('common.count')}: ${count}\n- ${i18nInstance.t('common.platform')}: ${platform}`
      });
    }
    // Fallback
    return `Please generate ${count} titles for ${platform} platform for the following content:

Content: ${content}

Requirements:
- Style preferences: ${styles.join(', ')}
- Count: ${count}
- Platform: ${platform}
- Ensure title diversity and quality

Please output strictly in JSON format:

\`\`\`json
{
  "titles": [
    {
      "title": "Example Title",
      "style": "informative",
      "length": 15,
      "semanticFit": 0.85,
      "reasoning": "Generation reasoning"
    }
  ]
}
\`\`\`

Note:
1. Must return valid JSON format
2. titles array must contain ${count} title objects
3. 每个标题对象必须包含title、style、length、semanticFit、reasoning字段
4. title字段不能为空
5. semanticFit值应在0.7-1.0之间`;
  }
}

// 创建单例实例
export const aiService = new AIService();
export default aiService;
