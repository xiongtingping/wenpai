/**
 * AI模型降级策略配置
 * 
 * 🎯 目标：
 * - 消除硬编码的模型切换逻辑
 * - 提供灵活的模型降级策略
 * - 支持不同错误类型的降级路径
 * - 易于维护和扩展
 * 
 * 📌 遵循CLAUDE.md规则：禁止硬编码、配置化管理
 */

import { logger } from '@/utils/logger';

/**
 * 降级原因类型
 */
export type FallbackReason = 
  | 'quota_exceeded'      // 配额用尽 (402错误)
  | 'rate_limit'          // 速率限制 (429错误)
  | 'api_error'           // API错误 (5xx错误)
  | 'timeout'             // 超时
  | 'model_unavailable'   // 模型不可用
  | 'general_error';      // 通用错误

/**
 * 模型降级配置接口
 */
export interface ModelFallbackConfig {
  model: string;
  fallbacks: string[];
  reason?: FallbackReason;
  description?: string;
}

/**
 * 模型降级链配置
 * 
 * 每个模型都有一个降级链，当该模型失败时，按顺序尝试降级链中的模型
 */
export const MODEL_FALLBACK_CHAINS: Record<string, string[]> = {
  // DeepSeek系列
  'deepseek-chat': [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'google/gemini-2.5-flash-lite-preview'
  ],
  'deepseek-reasoner': [
    'deepseek-chat',
    'gpt-4o-mini',
    'gpt-3.5-turbo'
  ],

  // OpenAI GPT-4系列
  'gpt-4o': [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'deepseek-chat'
  ],
  'openai/gpt-5-chat-latest': [
    'openai/gpt-5-mini-2025-08-07',
    'gpt-4o-mini',
    'deepseek-chat'
  ],
  'openai/gpt-5-mini-2025-08-07': [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'deepseek-chat'
  ],

  // OpenAI GPT-4o系列
  'gpt-4o-mini': [
    'gpt-3.5-turbo',
    'deepseek-chat',
    'google/gemini-2.5-flash-lite-preview'
  ],
  'gpt-3.5-turbo': [
    'deepseek-chat',
    'google/gemini-2.5-flash-lite-preview',
    'meta-llama/llama-4-scout'
  ],

  // Google Gemini系列
  'google/gemini-2.5-pro': [
    'google/gemini-2.5-flash',
    'google/gemini-2.5-flash-lite-preview',
    'deepseek-chat'
  ],
  'google/gemini-2.5-flash': [
    'google/gemini-2.5-flash-lite-preview',
    'deepseek-chat',
    'gpt-4o-mini'
  ],
  'google/gemini-2.5-flash-lite-preview': [
    'deepseek-chat',
    'gpt-4o-mini',
    'gpt-3.5-turbo'
  ],

  // Anthropic Claude系列
  'anthropic/claude-sonnet-4': [
    'anthropic/claude-haiku-4',
    'gpt-4o-mini',
    'deepseek-chat'
  ],
  'anthropic/claude-haiku-4': [
    'gpt-4o-mini',
    'deepseek-chat',
    'gpt-3.5-turbo'
  ],

  // Meta Llama系列
  'meta-llama/llama-4-scout': [
    'deepseek-chat',
    'gpt-4o-mini',
    'google/gemini-2.5-flash-lite-preview'
  ],

  // 阿里通义千问系列
  'qwen-max': [
    'qwen-plus',
    'qwen-turbo',
    'deepseek-chat'
  ],
  'qwen-plus': [
    'qwen-turbo',
    'deepseek-chat',
    'gpt-4o-mini'
  ],
  'qwen-turbo': [
    'deepseek-chat',
    'gpt-4o-mini',
    'google/gemini-2.5-flash-lite-preview'
  ],
};

/**
 * 根据错误类型的特殊降级策略
 * 
 * 某些错误类型可能需要特殊的降级路径
 */
export const ERROR_SPECIFIC_FALLBACKS: Record<FallbackReason, Record<string, string[]>> = {
  // 配额用尽：优先切换到免费或低成本模型
  quota_exceeded: {
    'deepseek-chat': ['google/gemini-2.5-flash-lite-preview', 'gpt-3.5-turbo'],
    'gpt-4o': ['gpt-4o-mini', 'gpt-3.5-turbo', 'google/gemini-2.5-flash-lite-preview'],
    'gpt-4o-mini': ['gpt-3.5-turbo', 'google/gemini-2.5-flash-lite-preview'],
  },

  // 速率限制：切换到不同提供商的模型
  rate_limit: {
    'deepseek-chat': ['gpt-4o-mini', 'google/gemini-2.5-flash-lite-preview'],
    'gpt-4o-mini': ['deepseek-chat', 'google/gemini-2.5-flash-lite-preview'],
    'google/gemini-2.5-flash-lite-preview': ['deepseek-chat', 'gpt-4o-mini'],
  },

  // API错误：使用默认降级链
  api_error: {},

  // 超时：切换到更快的模型
  timeout: {
    'gpt-4o': ['gpt-4o-mini', 'gpt-3.5-turbo'],
    'google/gemini-2.5-pro': ['google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite-preview'],
  },

  // 模型不可用：使用默认降级链
  model_unavailable: {},

  // 通用错误：使用默认降级链
  general_error: {},
};

/**
 * 获取下一个降级模型
 * 
 * @param currentModel 当前模型
 * @param attemptIndex 尝试索引（从0开始）
 * @param reason 降级原因
 * @returns 下一个降级模型，如果没有则返回null
 */
export function getNextFallbackModel(
  currentModel: string,
  attemptIndex: number,
  reason: FallbackReason = 'general_error'
): string | null {
  // 1. 首先尝试错误特定的降级策略
  const errorSpecificFallbacks = ERROR_SPECIFIC_FALLBACKS[reason]?.[currentModel];
  if (errorSpecificFallbacks && attemptIndex < errorSpecificFallbacks.length) {
    const nextModel = errorSpecificFallbacks[attemptIndex];
    logger.info(`使用${reason}特定降级策略`, { 
      from: currentModel, 
      to: nextModel, 
      attempt: attemptIndex + 1 
    });
    return nextModel;
  }

  // 2. 使用默认降级链
  const fallbacks = MODEL_FALLBACK_CHAINS[currentModel];
  if (!fallbacks || attemptIndex >= fallbacks.length) {
    logger.warn('没有更多降级模型', { 
      model: currentModel, 
      attempt: attemptIndex + 1 
    });
    return null;
  }

  const nextModel = fallbacks[attemptIndex];
  logger.info('使用默认降级策略', { 
    from: currentModel, 
    to: nextModel, 
    attempt: attemptIndex + 1 
  });
  return nextModel;
}

/**
 * 获取完整的降级链
 * 
 * @param model 模型名称
 * @param reason 降级原因
 * @returns 降级链数组
 */
export function getFallbackChain(
  model: string,
  reason: FallbackReason = 'general_error'
): string[] {
  // 优先返回错误特定的降级链
  const errorSpecificChain = ERROR_SPECIFIC_FALLBACKS[reason]?.[model];
  if (errorSpecificChain && errorSpecificChain.length > 0) {
    return errorSpecificChain;
  }

  // 返回默认降级链
  return MODEL_FALLBACK_CHAINS[model] || [];
}

/**
 * 检查模型是否有降级选项
 * 
 * @param model 模型名称
 * @returns 是否有降级选项
 */
export function hasFallbackOptions(model: string): boolean {
  return (MODEL_FALLBACK_CHAINS[model]?.length || 0) > 0;
}

/**
 * 根据HTTP状态码判断降级原因
 *
 * @param statusCode HTTP状态码
 * @returns 降级原因
 */
export function getFallbackReasonFromStatusCode(statusCode: number): FallbackReason {
  switch (statusCode) {
    case 402:
      return 'quota_exceeded';
    case 403: // 🔧 FIX: 添加403错误处理（AIMLAPI配额限制）
      return 'quota_exceeded';
    case 429:
      return 'rate_limit';
    case 503:
    case 504:
      return 'timeout';
    case 500:
    case 502:
      return 'api_error';
    default:
      return 'general_error';
  }
}

/**
 * 根据错误消息判断降级原因
 * 
 * @param errorMessage 错误消息
 * @returns 降级原因
 */
export function getFallbackReasonFromError(errorMessage: string): FallbackReason {
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('quota') || lowerMessage.includes('402')) {
    return 'quota_exceeded';
  }
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('429')) {
    return 'rate_limit';
  }
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return 'timeout';
  }
  if (lowerMessage.includes('unavailable') || lowerMessage.includes('not found')) {
    return 'model_unavailable';
  }
  if (lowerMessage.includes('500') || lowerMessage.includes('502') || lowerMessage.includes('503')) {
    return 'api_error';
  }

  return 'general_error';
}

/**
 * 获取降级原因的描述
 * 
 * @param reason 降级原因
 * @returns 描述文本
 */
export function getFallbackReasonDescription(reason: FallbackReason): string {
  const descriptions: Record<FallbackReason, string> = {
    quota_exceeded: '模型配额已用尽',
    rate_limit: '请求速率超限',
    api_error: 'API服务错误',
    timeout: '请求超时',
    model_unavailable: '模型不可用',
    general_error: '通用错误',
  };

  return descriptions[reason];
}

