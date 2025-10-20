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
 * 🎯 策略：DeepSeek作为最终兜底方案
 * - 所有AIMLAPI模型（OpenAI/Google/Anthropic等）最终都fallback到deepseek-chat
 * - deepseek-chat是直连API，不经过AIMLAPI，更稳定可靠
 * - deepseek-chat失败后不再fallback，避免循环
 */
export const MODEL_FALLBACK_CHAINS: Record<string, string[]> = {
  // 🔧 DeepSeek系列 - 作为最终兜底，不再fallback到其他模型
  'deepseek-chat': [],  // 🎯 最终兜底，不再降级
  'deepseek-reasoner': [
    'deepseek-chat'  // 降级到deepseek-chat后停止
  ],

  // OpenAI GPT-5系列 - 最终兜底到deepseek-chat
  'openai/gpt-5-chat-latest': [
    'openai/gpt-5-mini-2025-08-07',
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'deepseek-chat'  // 🎯 最终兜底
  ],
  'openai/gpt-5-mini-2025-08-07': [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'deepseek-chat'  // 🎯 最终兜底
  ],

  // OpenAI GPT-4系列 - 最终兜底到deepseek-chat
  'gpt-4o': [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'deepseek-chat'  // 🎯 最终兜底
  ],
  'gpt-4o-mini': [
    'gpt-3.5-turbo',
    'deepseek-chat'  // 🎯 最终兜底
  ],
  'gpt-3.5-turbo': [
    'deepseek-chat'  // 🎯 最终兜底
  ],

  // Google Gemini系列 - 最终兜底到deepseek-chat
  'google/gemini-2.5-pro': [
    'google/gemini-2.5-flash',
    'google/gemini-2.5-flash-lite-preview',
    'deepseek-chat'  // 🎯 最终兜底
  ],
  'google/gemini-2.5-flash': [
    'google/gemini-2.5-flash-lite-preview',
    'deepseek-chat'  // 🎯 最终兜底
  ],
  'google/gemini-2.5-flash-lite-preview': [
    'deepseek-chat'  // 🎯 最终兜底
  ],

  // Anthropic Claude系列 - 最终兜底到deepseek-chat
  'anthropic/claude-sonnet-4': [
    'anthropic/claude-haiku-4',
    'gpt-4o-mini',
    'deepseek-chat'  // 🎯 最终兜底
  ],
  'anthropic/claude-haiku-4': [
    'gpt-4o-mini',
    'deepseek-chat'  // 🎯 最终兜底
  ],

  // Meta Llama系列 - 最终兜底到deepseek-chat
  'meta-llama/llama-4-scout': [
    'deepseek-chat'  // 🎯 最终兜底
  ],

  // 阿里通义千问系列 - 最终兜底到deepseek-chat
  'qwen-max': [
    'qwen-plus',
    'qwen-turbo',
    'deepseek-chat'  // 🎯 最终兜底
  ],
  'qwen-plus': [
    'qwen-turbo',
    'deepseek-chat'  // 🎯 最终兜底
  ],
  'qwen-turbo': [
    'deepseek-chat'  // 🎯 最终兜底
  ],
};

/**
 * 根据错误类型的特殊降级策略
 *
 * 🎯 策略：所有错误类型最终都兜底到deepseek-chat
 */
export const ERROR_SPECIFIC_FALLBACKS: Record<FallbackReason, Record<string, string[]>> = {
  // 🔧 配额用尽（403/402）：立即切换到deepseek-chat
  quota_exceeded: {
    'openai/gpt-5-chat-latest': ['deepseek-chat'],  // 🎯 AIMLAPI配额用尽，直接切换到DeepSeek
    'openai/gpt-5-mini-2025-08-07': ['deepseek-chat'],  // 🎯 直接切换
    'gpt-4o': ['deepseek-chat'],  // 🎯 直接切换
    'gpt-4o-mini': ['deepseek-chat'],  // 🎯 直接切换
    'gpt-3.5-turbo': ['deepseek-chat'],  // 🎯 直接切换
    'google/gemini-2.5-pro': ['deepseek-chat'],  // 🎯 直接切换
    'google/gemini-2.5-flash': ['deepseek-chat'],  // 🎯 直接切换
    'google/gemini-2.5-flash-lite-preview': ['deepseek-chat'],  // 🎯 直接切换
    'anthropic/claude-sonnet-4': ['deepseek-chat'],  // 🎯 直接切换
    'anthropic/claude-haiku-4': ['deepseek-chat'],  // 🎯 直接切换
    'qwen-max': ['deepseek-chat'],  // 🎯 直接切换
    'qwen-plus': ['deepseek-chat'],  // 🎯 直接切换
    'qwen-turbo': ['deepseek-chat'],  // 🎯 直接切换
    'meta-llama/llama-4-scout': ['deepseek-chat'],  // 🎯 直接切换
    'deepseek-chat': [],  // 🎯 DeepSeek自己不再降级
  },

  // 🔧 速率限制（429）：切换到不同提供商，最终兜底deepseek
  rate_limit: {
    'openai/gpt-5-chat-latest': ['google/gemini-2.5-flash-lite-preview', 'deepseek-chat'],
    'openai/gpt-5-mini-2025-08-07': ['google/gemini-2.5-flash-lite-preview', 'deepseek-chat'],
    'gpt-4o-mini': ['google/gemini-2.5-flash-lite-preview', 'deepseek-chat'],
    'google/gemini-2.5-flash-lite-preview': ['gpt-3.5-turbo', 'deepseek-chat'],
    'deepseek-chat': [],  // 🎯 DeepSeek自己不再降级
  },

  // API错误：使用默认降级链
  api_error: {},

  // 🔧 超时：切换到更快的模型，最终兜底deepseek
  timeout: {
    'gpt-4o': ['gpt-4o-mini', 'deepseek-chat'],
    'google/gemini-2.5-pro': ['google/gemini-2.5-flash', 'deepseek-chat'],
  },

  // 模型不可用：使用默认降级链
  model_unavailable: {},

  // 通用错误：使用默认降级链
  general_error: {},
};

/**
 * 获取下一个降级模型
 *
 * 🎯 策略：
 * 1. 优先使用错误特定的降级策略
 * 2. 其次使用默认降级链
 * 3. 最终兜底到deepseek-chat（如果当前不是deepseek-chat）
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
  if (fallbacks && attemptIndex < fallbacks.length) {
    const nextModel = fallbacks[attemptIndex];
    logger.info('使用默认降级策略', {
      from: currentModel,
      to: nextModel,
      attempt: attemptIndex + 1
    });
    return nextModel;
  }

  // 🎯 3. 最终兜底：如果当前不是deepseek-chat，且没有其他降级选项，则兜底到deepseek-chat
  if (currentModel !== 'deepseek-chat') {
    logger.info('🎯 使用最终兜底策略：切换到deepseek-chat', {
      from: currentModel,
      reason: '所有降级链已用尽',
      attempt: attemptIndex + 1
    });
    return 'deepseek-chat';
  }

  // 4. 如果已经是deepseek-chat，则没有更多降级选项
  logger.warn('没有更多降级模型（已是最终兜底模型）', {
    model: currentModel,
    attempt: attemptIndex + 1
  });
  return null;
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

  // 🔧 FIX: 检测AIMLAPI的403配额错误（包含"exhausted"、"plan_rule"、"tier_"等关键词）
  if (lowerMessage.includes('quota') || lowerMessage.includes('402') ||
      lowerMessage.includes('403') || lowerMessage.includes('exhausted') ||
      lowerMessage.includes('plan_rule') || lowerMessage.includes('tier_')) {
    return 'quota_exceeded';
  }
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('429')) {
    return 'rate_limit';
  }
  if (
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('timed out') ||
    lowerMessage.includes('504')
  ) {
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
