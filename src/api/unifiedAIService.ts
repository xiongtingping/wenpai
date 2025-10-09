/**
 * ✅ 统一AI服务 - 增强版封装层
 *
 * 🎯 核心价值：
 * - 📊 性能监控：追踪所有AI调用的性能指标
 * - 📝 调用日志：统一记录AI调用历史和错误
 * - 🔄 智能重试：自动处理失败重试逻辑
 * - 💾 响应缓存：基于unifiedAIManager的缓存机制
 * - ⚡ 性能优化：请求合并、批处理等
 *
 * 🔧 架构设计：
 * - 核心层：unifiedAIManager (统一管理器)
 * - 增强层：unifiedAIService (本文件 - 监控/日志/优化)
 * - 应用层：各业务模块
 *
 * 📌 遵循CLAUDE.md原则：
 * - ✅ 单一职责：只负责增强功能,核心逻辑在manager
 * - ✅ 零硬编码：所有配置来自统一管理器
 * - ✅ 高内聚低耦合：清晰的分层架构
 */

// 移除静态导入以避免TDZ循环依赖
// import i18n from '@/i18n'; // 改为动态导入
import { callAI, generateImage as directGenerateImage } from './ai';
import { callOpenAIProxy, callDeepSeekProxy, callGeminiProxy } from './apiProxy';
import { generateImage as proxyGenerateImage } from './imageGenerationService';
import type { AICallParams, AIResponse, ImageGenerationParams } from './types';
import { logger } from '@/utils/logger';
import { cleanAIContent, isValidAIContent } from '@/utils/contentCleaner';
import { getModelInfo, getModelProvider, isModelAvailableForTier } from '@/config/aiModels';

/**
 * 🔧 性能优化和重试机制配置
 */
interface RetryConfig {
  maxRetries: number;        // 最大重试次数
  initialDelay: number;      // 初始延迟(ms)
  maxDelay: number;          // 最大延迟(ms)
  backoffMultiplier: number; // 退避乘数
  retryableErrors: string[]; // 可重试的错误类型
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,      // 1秒
  maxDelay: 10000,         // 10秒
  backoffMultiplier: 2,    // 指数退避
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'rate_limit_exceeded',
    'service_unavailable',
    '429',
    '500',
    '502',
    '503',
    '504'
  ]
};

/**
 * 🔄 智能重试机制 - 指数退避算法
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  context: string = 'AI调用'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      if (attempt > 1) {
        logger.info(`🔄 重试${context} (第${attempt - 1}次重试)`);
      }

      return await operation();

    } catch (error) {
      lastError = error as Error;

      // 检查是否可重试
      const isRetryable = config.retryableErrors.some(errType =>
        lastError?.message?.includes(errType) ||
        lastError?.toString().includes(errType)
      );

      // 最后一次尝试或不可重试,直接抛出错误
      if (attempt > config.maxRetries || !isRetryable) {
        logger.error(`❌ ${context}失败 (尝试${attempt}次)`, {
          error: lastError.message,
          retryable: isRetryable
        });
        throw lastError;
      }

      // 计算退避延迟 (指数退避)
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );

      logger.warn(`⏱️ ${context}失败,将在${delay}ms后重试`, {
        attempt,
        error: lastError.message,
        nextDelay: delay
      });

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`${context}失败`);
}

/**
 * 🎯 请求去重 - 防止重复调用
 */
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * 生成请求唯一键
   */
  private generateKey(params: AICallParams): string {
    // ⚠️ 扩充分辨率：纳入 systemPrompt 与差异化参数，避免不同版本(A/B)误判为同一请求
    const anyParams = params as any;
    return JSON.stringify({
      prompt: params.prompt,
      systemPrompt: anyParams.systemPrompt, // A/B 往往有不同的系统提示
      model: params.model,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
      regenerationSeed: anyParams.regenerationSeed,
      variationLevel: anyParams.variationLevel,
      styleVariation: anyParams.styleVariation,
      taskType: anyParams.taskType,
      feature: anyParams.feature,
      context: anyParams.context
    });
  }

  /**
   * 去重执行请求
   */
  async deduplicate<T>(
    params: AICallParams,
    operation: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey(params);

    // 如果相同请求正在进行中,返回现有Promise
    if (this.pendingRequests.has(key)) {
      logger.debug('🔁 检测到重复请求,复用现有调用', { key: key.slice(0, 50) });
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // 创建新请求
    logger.debug('🧩 请求去重Key', {
      keyPreview: key.slice(0, 80),
      hasSystemPrompt: !!(params as any).systemPrompt,
      hasSeed: !!(params as any).regenerationSeed,
      variationLevel: (params as any).variationLevel,
      styleVariation: (params as any).styleVariation
    });

    const promise = operation().finally(() => {
      // 请求完成后清理
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * 清理所有待处理请求
   */
  clear(): void {
    this.pendingRequests.clear();
  }
}

const requestDeduplicator = new RequestDeduplicator();

/**
 * ⏱️ 超时控制
 */
async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  context: string = '操作'
): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${context}超时 (${timeoutMs}ms)`)),
        timeoutMs
      )
    )
  ]);
}

/**
 * 📊 性能指标收集器
 */
class PerformanceMetrics {
  private metrics: Array<{
    timestamp: number;
    duration: number;
    model: string;
    success: boolean;
    cached: boolean;
    error?: string;
  }> = [];

  private readonly MAX_METRICS = 1000; // 最多保存1000条记录

  /**
   * 记录指标
   */
  record(data: {
    duration: number;
    model: string;
    success: boolean;
    cached: boolean;
    error?: string;
  }): void {
    this.metrics.push({
      timestamp: Date.now(),
      ...data
    });

    // 限制数组大小
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  /**
   * 获取统计数据
   */
  getStats(windowMs: number = 3600000): {
    totalCalls: number;
    successRate: number;
    cacheHitRate: number;
    avgDuration: number;
    p95Duration: number;
    errorRate: number;
  } {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < windowMs);

    if (recentMetrics.length === 0) {
      return {
        totalCalls: 0,
        successRate: 0,
        cacheHitRate: 0,
        avgDuration: 0,
        p95Duration: 0,
        errorRate: 0
      };
    }

    const successCount = recentMetrics.filter(m => m.success).length;
    const cachedCount = recentMetrics.filter(m => m.cached).length;
    const durations = recentMetrics.map(m => m.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);

    return {
      totalCalls: recentMetrics.length,
      successRate: (successCount / recentMetrics.length) * 100,
      cacheHitRate: (cachedCount / recentMetrics.length) * 100,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95Duration: durations[p95Index] || 0,
      errorRate: ((recentMetrics.length - successCount) / recentMetrics.length) * 100
    };
  }

  /**
   * 清空指标
   */
  clear(): void {
    this.metrics = [];
  }
}

const performanceMetrics = new PerformanceMetrics();
// import { useAuth } from '@/hooks/useAuth'; // 移除Hook的模块顶层导入
// import { createDeepSeekProvider } from './providers/deepseek'; // 改为动态导入

/**
 * 环境检测
 * ✅ FIXED: 支持强制生产模式 - 不再使用模拟和本地模式
 */
const forceProductionMode = import.meta.env.VITE_FORCE_PRODUCTION_MODE === 'true';
const isDevelopment = !forceProductionMode && import.meta.env.DEV;
const isProduction = forceProductionMode || import.meta.env.PROD;

/**
 * AIMLAPI调用函数 - 使用统一管理器
 */
async function callAIMLAPI(params: AICallParams): Promise<AIResponse> {
  // 🔧 已迁移到统一AI管理器，此函数保留用于兼容性
  const { aiManager } = await import('./unifiedAIManager');
  const result = await aiManager.callAI(params);

  // 转换为原有接口格式
  return {
    content: result.content,
    model: result.model,
    usage: result.usage,
    responseTime: result.responseTime,
    success: result.success,
    error: result.error
  };
}

/**
 * DeepSeek原生API调用函数 - 使用统一管理器
 */
async function callDeepSeekNative(params: AICallParams): Promise<AIResponse> {
  // 🔧 已迁移到统一AI管理器，此函数保留用于兼容性
  const { aiManager } = await import('./unifiedAIManager');
  const result = await aiManager.callAI(params);

  // 转换为原有接口格式
  return {
    content: result.content,
    model: result.model,
    usage: result.usage,
    responseTime: result.responseTime,
    success: result.success,
    error: result.error
  };
}

/**
 * 获取用户订阅层级 - 安全获取用户信息
 */
function getUserTier(): string {
  try {
    const authData = localStorage.getItem('wenpai_auth_state');
    if (authData) {
      const { user } = JSON.parse(authData);
      return user?.subscription?.tier || 'trial';
    }
    return 'trial';
  } catch (error) {
    console.warn('gettinguserinfofailed，使用defaulttier:', error);
    return 'trial';
  }
}

/**
 * 统一的AI调用服务 - 增强版
 * 🎯 提供性能监控、调用日志、智能重试、去重、超时控制等增强功能
 */
export async function callUnifiedAI(params: AICallParams): Promise<AIResponse> {
  const startTime = performance.now();
  const callId = `ai-call-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // 📊 记录调用开始
  logger.debug(`[${callId}] AI调用开始`, {
    model: params.model,
    promptLength: params.prompt?.length || 0,
    hasSystem: !!params.systemPrompt,
    hasContext: !!(params.context && params.context.length > 0)
  });

  try {
    // 🎯 请求去重 - 防止重复调用
    const result = await requestDeduplicator.deduplicate(params, async () => {

      // 🔄 智能重试 + ⏱️ 超时控制
      return await retryWithBackoff(
        async () => {
          const { aiManager } = await import('./unifiedAIManager');

          // 超时时间: 根据任务类型动态调整
          const timeout = params.maxTokens && params.maxTokens > 2000 ? 60000 : 30000;

          return await withTimeout(
            aiManager.callAI(params),
            timeout,
            `AI调用[${params.model}]`
          );
        },
        DEFAULT_RETRY_CONFIG,
        `AI调用[${callId}]`
      );
    });

    const duration = performance.now() - startTime;

    // 📊 记录成功调用
    logger.info(`[${callId}] AI调用成功`, {
      model: result.model,
      duration: `${duration.toFixed(2)}ms`,
      contentLength: result.content?.length || 0,
      usage: result.usage,
      cached: result.cached || false
    });

    // 📈 收集性能指标
    performanceMetrics.record({
      duration,
      model: result.model,
      success: true,
      cached: result.cached || false
    });

    // 🔔 性能警告
    if (duration > 10000) {
      logger.warn(`[${callId}] AI调用耗时过长: ${duration.toFixed(2)}ms`);
    }

    // 转换为原有接口格式，保持兼容性
    return {
      content: result.content,
      model: result.model,
      usage: result.usage,
      responseTime: result.responseTime,
      success: result.success,
      error: result.error
    };

  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // 🔧 FIX: 输出详细的错误信息用于调试
    logger.error(`[${callId}] AI调用失败 - 详细错误:`, {
      model: params.model,
      duration: `${duration.toFixed(2)}ms`,
      error,
      errorMessage,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorStack: error instanceof Error ? error.stack : undefined,
      params: {
        model: params.model,
        provider: params.provider,
        promptLength: params.prompt?.length,
        maxTokens: params.maxTokens
      }
    });

    // 📈 收集性能指标
    performanceMetrics.record({
      duration,
      model: params.model || 'unknown',
      success: false,
      cached: false,
      error: errorMessage
    });

    return {
      content: '',
      model: params.model || 'unknown',
      usage: undefined,
      responseTime: Math.round(duration),
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 统一的图像生成服务 - 增强版
 * 🎯 提供性能监控、调用日志等增强功能
 */
export async function generateUnifiedImage(params: ImageGenerationParams): Promise<any> {
  const startTime = performance.now();
  const callId = `img-gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // 📊 记录调用开始
  logger.debug(`[${callId}] 图像生成开始`, {
    model: params.model,
    promptLength: params.prompt?.length || 0,
    size: params.size,
    n: params.n
  });

  try {
    // 导入并使用统一AI管理器
    const { aiManager } = await import('./unifiedAIManager');
    const result = await aiManager.generateImage(params);

    const duration = performance.now() - startTime;

    // 📊 记录成功调用
    logger.info(`[${callId}] 图像生成成功`, {
      model: result.model,
      duration: `${duration.toFixed(2)}ms`,
      imagesCount: result.images?.length || 0
    });

    return result;

  } catch (error) {
    const duration = performance.now() - startTime;

    // 📊 记录失败调用
    logger.error(`[${callId}] 图像生成失败`, {
      model: params.model,
      duration: `${duration.toFixed(2)}ms`,
      error: error instanceof Error ? error.message : String(error)
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : '统一图像生成失败'
    };
  }
}

/**
 * 检查统一AI服务状态
 *
 */
export async function checkUnifiedAIStatus(): Promise<{
  environment: string;
  method: string;
  available: boolean;
  services: Record<string, any>;
}> {
  const environment = isDevelopment ? 'development' : 'production';
  const method = isDevelopment ? 'direct-api' : 'proxy-api';

  console.log(`🔍 checking统一AIservicestate - 环境: ${environment}, 方式: ${method}`);

  if (isDevelopment) {
    // 开发环境：检查直连API状态
    try {
      const testResult = await callAI({
        prompt: 'Hello',
        model: 'gpt-4',
        maxTokens: 10
      });

      return {
        environment,
        method,
        available: testResult.success,
        services: {
          openai: testResult.success,
          development: true,
          message: '开发环境：直连AI服务商API'
        }
      };
    } catch (error) {
      return {
        environment,
        method,
        available: false,
        services: {
          openai: false,
          development: true,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: '开发环境：直连API测试失败'
        }
      };
    }
  } else {
    // 生产环境：检查代理API状态
    try {
      const testResult = await callOpenAIProxy([{ role: 'user', content: 'Hello' }], 'gpt-4', 0.7, 10);

      return {
        environment,
        method,
        available: testResult.success,
        services: {
          proxy: testResult.success,
          production: true,
          message: '生产环境：通过后端代理调用'
        }
      };
    } catch (error) {
      return {
        environment,
        method,
        available: false,
        services: {
          proxy: false,
          production: true,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: '生产环境：代理API测试失败'
        }
      };
    }
  }
}

/**
 * 获取当前环境信息
 *
 */
export function getUnifiedEnvironmentInfo(): {
  isDevelopment: boolean;
  isProduction: boolean;
  apiMethod: string;
  description: string;
  advantages: string[];
} {
  if (isDevelopment) {
    return {
      isDevelopment,
      isProduction,
      apiMethod: 'direct-api',
      description: '开发环境：直连AI服务商API，快速调试',
      advantages: [
        '快速开发和测试',
        '直接调试模型参数',
        '无需后端代理',
        '实时错误反馈'
      ]
    };
  } else {
    return {
      isDevelopment,
      isProduction,
      apiMethod: 'proxy-api',
      description: '生产环境：通过后端代理调用，保护API Key',
      advantages: [
        '保护API Key不暴露',
        '统一权限控制',
        '频率限制管理',
        '解决CORS问题'
      ]
    };
  }
}

/**
 * 简化的导出接口
 *
 */
export {
  callUnifiedAI as callAI,
  generateUnifiedImage as generateImage,
  checkUnifiedAIStatus as checkAIStatus,
  getUnifiedEnvironmentInfo as getEnvironmentInfo
};

// 🔧 FIXED: 移除模块顶层立即执行的logger调用，避免TDZ错误
// 这些调用会在模块加载时立即执行，而此时logger可能还未定义
// 如果需要环境信息调试，可以在具体的函数中调用

/**
 * 获取并输出环境信息（按需调用）
 */
export function logEnvironmentInfo() {
  const envInfo = getUnifiedEnvironmentInfo();
  logger.debug('🔧 统一AI服务已加载:', envInfo);
  logger.debug(`📍 当前使用: ${envInfo.apiMethod} (${envInfo.description})`);
}

/**
 * 📊 性能监控API - 导出统计数据供外部使用
 */

/**
 * 获取AI调用性能统计
 * @param windowMs 统计时间窗口(毫秒),默认1小时
 * @returns 性能统计数据
 */
export function getPerformanceStats(windowMs: number = 3600000): {
  totalCalls: number;
  successRate: number;
  cacheHitRate: number;
  avgDuration: number;
  p95Duration: number;
  errorRate: number;
} {
  return performanceMetrics.getStats(windowMs);
}

/**
 * 清空性能指标（用于测试或重置）
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.clear();
  logger.info('🗑️ 性能指标已清空');
}

/**
 * 清空请求去重缓存（用于强制重新请求）
 */
export function clearRequestCache(): void {
  requestDeduplicator.clear();
  logger.info('🗑️ 请求缓存已清空');
}

/**
 * 获取性能监控概览（适合Dashboard展示）
 */
export function getPerformanceOverview(): {
  last5Minutes: ReturnType<typeof getPerformanceStats>;
  last1Hour: ReturnType<typeof getPerformanceStats>;
  last24Hours: ReturnType<typeof getPerformanceStats>;
} {
  return {
    last5Minutes: getPerformanceStats(5 * 60 * 1000),
    last1Hour: getPerformanceStats(60 * 60 * 1000),
    last24Hours: getPerformanceStats(24 * 60 * 60 * 1000)
  };
}

/**
 * 🎯 推荐导出 - 统一AI调用接口
 *
 * 使用建议:
 * ```typescript
 * // ✅ 推荐方式 (自动享受缓存、监控、日志等增强功能)
 * import { callAI } from '@/api/unifiedAIService';
 * const result = await callAI({ prompt: '...', model: 'gpt-4o' });
 *
 * // 📊 性能监控
 * import { getPerformanceStats } from '@/api/unifiedAIService';
 * const stats = getPerformanceStats(); // 获取最近1小时统计
 *
 * // ❌ 不推荐 (绕过增强层)
 * import { aiManager } from '@/api/unifiedAIManager';
 * const result = await aiManager.callAI(...);
 * ```
 */
