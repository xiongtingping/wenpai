/**
 * AI模型配置
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  company: string;
  description: string;
  features: string[];
  maxTokens?: number;
  tier: 'low' | 'mid' | 'high'; // 模型等级
  type?: 'text' | 'image'; // 模型类型：文本或图像
  pricing?: {
    input: number; // 每1K tokens的价格
    output: number; // 每1K tokens的价格
  };
}

/**
 * AI模型配置 - 按用户指定的三层级模型
 */
export const AI_MODELS: Record<string, AIModel> = {
  // ===== 🟢 体验版模型 (TRIAL TIER) - 基础功能 =====
  
  // Google - 体验版
  'google/gemini-2.5-flash-lite-preview': {
    id: 'google/gemini-2.5-flash-lite-preview',
    name: 'Gemini 2.5 Flash Lite Preview',
    provider: 'aimlapi',
    company: 'Google',
    tier: 'low',
    type: 'text',
    description: 'Google轻量级多模态模型预览版',
    features: ['多模态能力', '快速响应', '预览版功能'],
    maxTokens: 32768,
    pricing: { input: 0.1, output: 0.4 }
  },

  // Meta - 体验版
  'meta-llama/llama-4-scout': {
    id: 'meta-llama/llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'aimlapi',
    company: 'Meta',
    tier: 'low',
    type: 'text',
    description: 'Meta最新Llama 4探索版模型',
    features: ['开源架构', '探索功能', '高效推理'],
    maxTokens: 8192,
    pricing: { input: 0.2, output: 0.6 }
  },

  // OpenAI - 体验版
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'aimlapi',
    company: 'OpenAI',
    tier: 'low',
    type: 'text',
    description: 'OpenAI轻量版，性价比高',
    features: ['性价比高', '响应快速', '理解优秀'],
    maxTokens: 16384,
    pricing: { input: 0.15, output: 0.6 }
  },

  // Alibaba Cloud - 体验版
  'qwen-turbo': {
    id: 'qwen-turbo',
    name: 'Qwen Turbo',
    provider: 'aimlapi',
    company: 'Alibaba Cloud',
    tier: 'low',
    type: 'text',
    description: '阿里云通义千问高速版',
    features: ['高速处理', '中英双语', '经济实用'],
    maxTokens: 8192,
    pricing: { input: 0.12, output: 0.5 }
  },

  // ===== 🟡 专业版模型 (PRO TIER) - 专业功能 =====

  // DeepSeek - 专业版 (使用官方原生接口)
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    company: 'DeepSeek',
    tier: 'mid',
    type: 'text',
    description: 'DeepSeek对话模型，专业级性能',
    features: ['深度推理', '专业对话', '高质量输出'],
    maxTokens: 32768,
    pricing: { input: 0.5, output: 1.5 }
  },


  // OpenAI - 专业版
  'openai/gpt-5-mini-2025-08-07': {
    id: 'openai/gpt-5-mini-2025-08-07',
    name: 'GPT-5 Mini (2025-08-07)',
    provider: 'aimlapi',
    company: 'OpenAI',
    tier: 'mid',
    type: 'text',
    description: 'GPT-5轻量版最新版本',
    features: ['GPT-5架构', '最新版本', '性能优化'],
    maxTokens: 128000,
    pricing: { input: 1.0, output: 3.0 }
  },

  // Google - 专业版
  'google/gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'aimlapi',
    company: 'Google',
    tier: 'mid',
    type: 'text',
    description: 'Google快速多模态模型',
    features: ['多模态能力', '快速响应', '专业性能'],
    maxTokens: 32768,
    pricing: { input: 0.8, output: 2.4 }
  },

  // Alibaba Cloud - 专业版
  'qwen-plus': {
    id: 'qwen-plus',
    name: 'Qwen Plus',
    provider: 'aimlapi',
    company: 'Alibaba Cloud',
    tier: 'mid',
    type: 'text',
    description: '阿里云通义千问增强版',
    features: ['专业性能', '中英双语', '高质量输出'],
    maxTokens: 32768,
    pricing: { input: 0.7, output: 2.1 }
  },

  // ===== 🔴 高级版模型 (PREMIUM TIER) - 顶级功能 =====

  // OpenAI - 高级版
  'openai/gpt-5-chat-latest': {
    id: 'openai/gpt-5-chat-latest',
    name: 'GPT-5 Chat Latest',
    provider: 'aimlapi',
    company: 'OpenAI',
    tier: 'high',
    type: 'text',
    description: 'GPT-5最新对话模型',
    features: ['最新架构', '顶级性能', '创意生成'],
    maxTokens: 128000,
    pricing: { input: 5.0, output: 15.0 }
  },

  // Anthropic - 高级版
  'anthropic/claude-sonnet-4': {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'aimlapi',
    company: 'Anthropic',
    tier: 'high',
    type: 'text',
    description: 'Anthropic Claude Sonnet 4顶级模型',
    features: ['顶级推理', '安全可靠', '创意写作'],
    maxTokens: 200000,
    pricing: { input: 8.0, output: 24.0 }
  },

  // Google - 高级版
  'google/gemini-2.5-pro': {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'aimlapi',
    company: 'Google',
    tier: 'high',
    type: 'text',
    description: 'Google专业级多模态模型',
    features: ['顶级多模态', '专业分析', '复杂推理'],
    maxTokens: 128000,
    pricing: { input: 7.0, output: 21.0 }
  },

  // Alibaba Cloud - 高级版
  'qwen-max': {
    id: 'qwen-max',
    name: 'Qwen Max',
    provider: 'aimlapi',
    company: 'Alibaba Cloud',
    tier: 'high',
    type: 'text',
    description: '阿里云通义千问旗舰版',
    features: ['顶级性能', '复杂推理', '多领域专业'],
    maxTokens: 128000,
    pricing: { input: 6.0, output: 18.0 }
  }
};

/**
 * 订阅计划对应的可用模型 - 按用户指定的三层级分配
 */
export const SUBSCRIPTION_MODELS: Record<string, string[]> = {
  // 体验版：基础模型
  trial: [
    'google/gemini-2.5-flash-lite-preview',    // Google
    'meta-llama/llama-4-scout',                // Meta
    'gpt-4o-mini',                             // OpenAI
    'qwen-turbo'                               // Alibaba Cloud
  ],
  
  // 专业版：体验版 + 专业版模型
  pro: [
    // 体验版模型
    'google/gemini-2.5-flash-lite-preview',    // Google
    'meta-llama/llama-4-scout',                // Meta  
    'gpt-4o-mini',                             // OpenAI
    'qwen-turbo',                              // Alibaba Cloud
    // 专业版模型
    'deepseek-chat',                           // DeepSeek
    'openai/gpt-5-mini-2025-08-07',            // OpenAI
    'google/gemini-2.5-flash',                 // Google
    'qwen-plus'                                // Alibaba Cloud
  ],
  
  // 高级版：所有模型（体验版+专业版+高级版）
  premium: [
    // 体验版模型
    'google/gemini-2.5-flash-lite-preview',    // Google
    'meta-llama/llama-4-scout',                // Meta
    'gpt-4o-mini',                             // OpenAI
    'qwen-turbo',                              // Alibaba Cloud
    // 专业版模型
    'deepseek-chat',                           // DeepSeek
    'openai/gpt-5-mini-2025-08-07',            // OpenAI
    'google/gemini-2.5-flash',                 // Google
    'qwen-plus',                               // Alibaba Cloud
    // 高级版模型
    'openai/gpt-5-chat-latest',                // OpenAI
    'anthropic/claude-sonnet-4',               // Anthropic
    'google/gemini-2.5-pro',                   // Google
    'qwen-max'                                 // Alibaba Cloud
  ]
};

/**
 * 获取订阅计划可用的模型
 * @param tier 订阅计划类型
 * @returns 可用模型列表
 */
export function getAvailableModelsForTier(tier: string): AIModel[] {
  // 🔧 FIX: 移除调试日志避免无限循环
  // 标准化tier值
  const normalizedTier = tier?.toLowerCase() || 'trial';
  
  // 如果找不到对应的计划，默认使用体验版
  const modelIds = SUBSCRIPTION_MODELS[normalizedTier] || SUBSCRIPTION_MODELS['trial'] || [];
  const models = modelIds.map(id => AI_MODELS[id]).filter(Boolean);
  
  return models;
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

/**
 * 按公司分组获取模型
 * @param tier 可选的订阅计划过滤
 * @returns 按公司分组的模型
 */
export function getModelsByCompany(tier?: string): Record<string, AIModel[]> {
  const availableModelIds = tier ? SUBSCRIPTION_MODELS[tier] : Object.keys(AI_MODELS);
  const availableModels = availableModelIds.map(id => AI_MODELS[id]).filter(Boolean);
  
  return availableModels.reduce((groups, model) => {
    if (!groups[model.company]) {
      groups[model.company] = [];
    }
    groups[model.company].push(model);
    return groups;
  }, {} as Record<string, AIModel[]>);
}

/**
 * 按等级分组获取模型
 * @param tier 可选的订阅计划过滤
 * @returns 按等级分组的模型
 */
export function getModelsByTier(subscriptionTier?: string): Record<'low' | 'mid' | 'high', AIModel[]> {
  const availableModelIds = subscriptionTier ? SUBSCRIPTION_MODELS[subscriptionTier] : Object.keys(AI_MODELS);
  const availableModels = availableModelIds.map(id => AI_MODELS[id]).filter(Boolean);
  
  return availableModels.reduce((groups, model) => {
    if (!groups[model.tier]) {
      groups[model.tier] = [];
    }
    groups[model.tier].push(model);
    return groups;
  }, { low: [], mid: [], high: [] } as Record<'low' | 'mid' | 'high', AIModel[]>);
}

/**
 * 获取等级颜色配置
 * @param tier 模型等级
 * @returns 颜色配置对象
 */
export function getTierColors(tier: 'low' | 'mid' | 'high') {
  const colors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
    mid: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' }
  };
  return colors[tier];
}

/**
 * 按模型类型分组获取模型
 * @param tier 可选的订阅计划过滤
 * @returns 按模型类型分组的模型
 */
export function getModelsByType(tier?: string): Record<'text' | 'image', AIModel[]> {
  const availableModelIds = tier ? SUBSCRIPTION_MODELS[tier] : Object.keys(AI_MODELS);
  const availableModels = availableModelIds.map(id => AI_MODELS[id]).filter(Boolean);
  
  return availableModels.reduce((groups, model) => {
    const type = model.type || 'text'; // 默认为文本模型
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(model);
    return groups;
  }, { text: [], image: [] } as Record<'text' | 'image', AIModel[]>);
}

/**
 * 获取文本模型列表
 * @param tier 可选的订阅计划过滤
 * @returns 文本模型列表
 */
export function getTextModels(tier?: string): AIModel[] {
  const modelsByType = getModelsByType(tier);
  return modelsByType.text || [];
}

/**
 * 获取图片模型列表
 * @param tier 可选的订阅计划过滤
 * @returns 图片模型列表
 */
export function getImageModels(tier?: string): AIModel[] {
  const modelsByType = getModelsByType(tier);
  return modelsByType.image || [];
}

/**
 * 检查模型是否为图片生成模型
 * @param modelId 模型ID
 * @returns 是否为图片模型
 */
export function isImageModel(modelId: string): boolean {
  const model = AI_MODELS[modelId];
  return model?.type === 'image' || false;
}

/**
 * 检查模型是否为文本生成模型
 * @param modelId 模型ID
 * @returns 是否为文本模型
 */
export function isTextModel(modelId: string): boolean {
  const model = AI_MODELS[modelId];
  return model?.type === 'text' || model?.type === undefined; // 默认为文本模型
}
