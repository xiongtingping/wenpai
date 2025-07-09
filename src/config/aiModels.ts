/**
 * AI模型配置
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  features: string[];
  maxTokens?: number;
  pricing?: {
    input: number; // 每1K tokens的价格
    output: number; // 每1K tokens的价格
  };
}

/**
 * AI模型配置
 */
export const AI_MODELS: Record<string, AIModel> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    description: '最新最强大的AI模型，性能卓越，创意丰富，支持多模态输入输出',
    features: [
      '超强理解能力',
      '创意内容生成',
      '多模态支持',
      '上下文记忆优秀',
      '代码生成能力强'
    ],
    maxTokens: 128000,
    pricing: {
      input: 0.0025,
      output: 0.01
    }
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o mini',
    provider: 'OpenAI',
    description: 'GPT-4o的轻量版本，性价比极高，适合日常使用',
    features: [
      '性价比极高',
      '响应速度快',
      '理解能力优秀',
      '适合日常对话',
      '成本控制友好'
    ],
    maxTokens: 128000,
    pricing: {
      input: 0.00015,
      output: 0.0006
    }
  },
  'deepseek-v3': {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: '中文优化模型，理解力强，适合本地化内容和中文创作',
    features: [
      '中文理解优秀',
      '本地化内容创作',
      '文化语境理解',
      '中文表达自然',
      '适合中文用户'
    ],
    maxTokens: 128000,
    pricing: {
      input: 0.00014,
      output: 0.00056
    }
  }
};

/**
 * 订阅计划对应的可用模型
 */
export const SUBSCRIPTION_MODELS: Record<string, string[]> = {
  trial: ['gpt-4o-mini', 'deepseek-v3'],
  pro: ['gpt-4o', 'gpt-4o-mini', 'deepseek-v3'],
  premium: ['gpt-4o', 'gpt-4o-mini', 'deepseek-v3']
};

/**
 * 获取订阅计划可用的模型
 * @param tier 订阅计划类型
 * @returns 可用模型列表
 */
export function getAvailableModelsForTier(tier: string): AIModel[] {
  const modelIds = SUBSCRIPTION_MODELS[tier] || [];
  return modelIds.map(id => AI_MODELS[id]).filter(Boolean);
}

/**
 * 获取模型信息
 * @param modelId 模型ID
 * @returns 模型信息
 */
export function getModelInfo(modelId: string): AIModel | undefined {
  return AI_MODELS[modelId];
}

/**
 * 检查模型是否对订阅计划可用
 * @param modelId 模型ID
 * @param tier 订阅计划类型
 * @returns 是否可用
 */
export function isModelAvailableForTier(modelId: string, tier: string): boolean {
  const availableModels = SUBSCRIPTION_MODELS[tier] || [];
  return availableModels.includes(modelId);
}

/**
 * 获取模型提供商
 * @param modelId 模型ID
 * @returns 提供商名称
 */
export function getModelProvider(modelId: string): string {
  return AI_MODELS[modelId]?.provider || 'Unknown';
}

/**
 * 获取所有模型列表
 * @returns 所有模型列表
 */
export function getAllModels(): AIModel[] {
  return Object.values(AI_MODELS);
} 