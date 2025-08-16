/**
 * AI 服务抽象层
 * 统一管理 AI 模型调用，支持降级策略
 */

import { callAI, callAIWithRetry } from '@/api/ai';
import type { AICallParams } from '@/api/ai';
import { TitleGenerationConfig } from '../config/titleGeneration.config';
import { concurrencyManager } from './ConcurrencyManager';
import type {
  IAIService,
  AICallOptions,
  AIResponse
} from '../types/titleGeneration.types';
import { TitleGenerationError } from '../types/titleGeneration.types';

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
        '没有可用的AI模型',
        'NO_AVAILABLE_MODELS',
        { requestedModels: this.availableModels }
      );
    }

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        console.log(`🤖 尝试使用模型: ${model}`);

        const startTime = performance.now();
        const response = await this.callSingleModel(model, prompt, options);
        const duration = performance.now() - startTime;

        console.log(`✅ 模型 ${model} 调用成功，耗时: ${duration.toFixed(2)}ms`);

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
        console.warn(`❌ 模型 ${model} 调用失败:`, error);

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
      return await callAI(callParams);
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
    return `你是一个专业的标题生成专家，擅长为不同平台创作吸引人的标题。

请遵循以下原则：
1. 标题要与内容高度相关，准确概括核心信息
2. 根据平台特点调整风格和长度
3. 避免使用"undefined"、"null"等无效内容
4. 确保语义完整，避免残词和未闭合表达
5. 适当使用情感词汇增强吸引力
6. 保持结构多样性，避免重复句式

返回格式必须是有效的JSON，包含titles数组，每个标题对象包含：
- title: 标题文本
- style: 风格类型
- length: 字符长度
- semanticFit: 语义贴合度(0-1)
- reasoning: 生成理由`;
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
    return `请为以下内容生成${count}个${platform}平台的标题：

内容：${content}

要求：
- 风格偏好：${styles.join('、')}
- 数量：${count}个
- 平台：${platform}
- 确保标题多样性和高质量

请严格按照以下JSON格式返回结果：

\`\`\`json
{
  "titles": [
    {
      "title": "标题内容",
      "style": "informative",
      "length": 15,
      "semanticFit": 0.85,
      "reasoning": "生成理由"
    }
  ]
}
\`\`\`

注意：
1. 必须返回有效的JSON格式
2. titles数组必须包含${count}个标题对象
3. 每个标题对象必须包含title、style、length、semanticFit、reasoning字段
4. title字段不能为空
5. semanticFit值应在0.7-1.0之间`;
  }
}

// 创建单例实例
export const aiService = new AIService();
export default aiService;
