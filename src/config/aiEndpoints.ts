/**
 * 🔧 AI API端点统一配置管理器
 * 
 * 🎯 目标：
 * - 彻底消除硬编码API端点
 * - 统一管理所有AI服务API配置
 * - 支持环境变量配置和动态切换
 * - 提供类型安全的端点管理
 * 
 * 📌 遵循CLAUDE.md规则：严禁硬编码，统一管理
 */

/**
 * AI服务端点配置接口
 */
export interface AIEndpointConfig {
  name: string;
  displayName: string;
  baseURL: string;
  chatEndpoint: string;
  imageEndpoint?: string;
  modelsEndpoint: string;
  headers: {
    authType: 'bearer' | 'api-key' | 'custom';
    authHeader: string;
    contentType: string;
    userAgent?: string;
  };
  limits: {
    maxTokens: number;
    maxPromptLength: number;
    requestsPerMinute?: number;
  };
  features: {
    chat: boolean;
    image: boolean;
    streaming: boolean;
  };
}

/**
 * 环境配置获取函数
 * 🔒 强制要求环境变量,无后备值 - 遵循CLAUDE.md禁止硬编码原则
 * @param key 环境变量键名
 * @param required 是否为必需配置
 * @returns 环境变量值,如果required=true且未配置则抛出异常
 */
function getEnvConfig(key: string, required: boolean = true): string {
  const value = import.meta.env[key];

  if (required && !value) {
    throw new Error(
      `❌ 必需的环境变量 ${key} 未配置\n` +
      `请在 .env 文件中添加: ${key}=your_value_here\n` +
      `参考文档: docs/setup/environment-variables.md`
    );
  }

  return value || '';
}

/**
 * 统一AI端点配置
 * 🔒 所有API端点通过环境变量配置，严禁硬编码
 */
export const AI_ENDPOINTS: Record<string, AIEndpointConfig> = {
  // OpenAI服务端点配置 - 通过AIMLAPI调用
  openai: {
    name: 'aimlapi',  // 🔧 统一使用AIMLAPI
    displayName: 'OpenAI (via AIMLAPI)',
    baseURL: getEnvConfig('VITE_AIMLAPI_BASE_URL', true),
    chatEndpoint: '/chat/completions',
    imageEndpoint: '/images/generations',
    modelsEndpoint: '/models',
    headers: {
      authType: 'bearer',
      authHeader: 'Authorization',
      contentType: 'application/json',
      userAgent: 'Wenpai-AI/1.0'
    },
    limits: {
      maxTokens: 4096,
      maxPromptLength: 32000,
      requestsPerMinute: 60
    },
    features: {
      chat: true,
      image: true,
      streaming: false  // AIMLAPI不支持流式
    }
  },

  // DeepSeek服务端点配置
  deepseek: {
    name: 'deepseek',
    displayName: 'DeepSeek',
    baseURL: getEnvConfig('VITE_DEEPSEEK_BASE_URL', false), // 可选配置
    chatEndpoint: '/v1/chat/completions',
    modelsEndpoint: '/v1/models',
    headers: {
      authType: 'bearer',
      authHeader: 'Authorization',
      contentType: 'application/json',
      userAgent: 'Wenpai-AI/1.0'
    },
    limits: {
      maxTokens: 32768,
      maxPromptLength: 64000,
      requestsPerMinute: 100
    },
    features: {
      chat: true,
      image: false,
      streaming: true
    }
  },

  // AIMLAPI服务端点配置
  aimlapi: {
    name: 'aimlapi',
    displayName: 'AIML API',
    baseURL: getEnvConfig('VITE_AIMLAPI_BASE_URL', true),
    chatEndpoint: '/chat/completions',
    modelsEndpoint: '/models',
    headers: {
      authType: 'bearer',
      authHeader: 'Authorization',
      contentType: 'application/json',
      userAgent: 'Wenpai-AI/1.0'
    },
    limits: {
      maxTokens: 4096,
      maxPromptLength: 32000,
      requestsPerMinute: 60
    },
    features: {
      chat: true,
      image: false,
      streaming: false
    }
  },

  // Anthropic Claude服务端点配置 - 通过AIMLAPI调用
  anthropic: {
    name: 'aimlapi',  // 🔧 统一使用AIMLAPI
    displayName: 'Anthropic Claude (via AIMLAPI)',
    baseURL: getEnvConfig('VITE_AIMLAPI_BASE_URL', true),
    chatEndpoint: '/chat/completions',
    modelsEndpoint: '/models',
    headers: {
      authType: 'bearer',  // 🔧 统一使用bearer认证
      authHeader: 'Authorization',
      contentType: 'application/json',
      userAgent: 'Wenpai-AI/1.0'
    },
    limits: {
      maxTokens: 200000,
      maxPromptLength: 200000,
      requestsPerMinute: 50
    },
    features: {
      chat: true,
      image: false,
      streaming: false  // AIMLAPI不支持流式
    }
  },

  // Google Gemini服务端点配置 - 通过AIMLAPI调用
  gemini: {
    name: 'aimlapi',  // 🔧 统一使用AIMLAPI
    displayName: 'Google Gemini (via AIMLAPI)',
    baseURL: getEnvConfig('VITE_AIMLAPI_BASE_URL', true),
    chatEndpoint: '/chat/completions',
    modelsEndpoint: '/models',
    headers: {
      authType: 'bearer',  // 🔧 统一使用bearer认证
      authHeader: 'Authorization',
      contentType: 'application/json',
      userAgent: 'Wenpai-AI/1.0'
    },
    limits: {
      maxTokens: 32768,
      maxPromptLength: 128000,
      requestsPerMinute: 60
    },
    features: {
      chat: true,
      image: false,
      streaming: false  // AIMLAPI不支持流式
    }
  }
};

/**
 * 获取AI服务端点配置
 * @param provider AI服务提供商名称
 * @returns 端点配置对象
 */
export function getAIEndpoint(provider: string): AIEndpointConfig | null {
  return AI_ENDPOINTS[provider.toLowerCase()] || null;
}

/**
 * 构建完整的API URL
 * @param provider AI服务提供商名称
 * @param endpoint 具体端点路径
 * @param pathParams 路径参数（如模型名称）
 * @returns 完整的API URL
 *
 * 🔧 FIX: 在生产环境下，DeepSeek等需要CORS代理的provider使用Netlify Functions代理
 */
export function buildAPIURL(
  provider: string,
  endpoint: 'chat' | 'image' | 'models',
  pathParams?: Record<string, string>
): string {
  const config = getAIEndpoint(provider);
  if (!config) {
    throw new Error(`不支持的AI服务提供商: ${provider}`);
  }

  let endpointPath = '';
  switch (endpoint) {
    case 'chat':
      endpointPath = config.chatEndpoint;
      break;
    case 'image':
      if (!config.imageEndpoint) {
        throw new Error(`${provider} 不支持图像生成`);
      }
      endpointPath = config.imageEndpoint;
      break;
    case 'models':
      endpointPath = config.modelsEndpoint;
      break;
  }

  // 替换路径参数
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      endpointPath = endpointPath.replace(`{${key}}`, value);
    });
  }

  // 🔧 FIX: 检查是否需要使用代理
  // AIMLAPI不需要代理（已经是统一API）
  // DeepSeek、OpenAI、Gemini等需要通过Netlify Functions代理避免CORS
  const needsProxy = !['aimlapi'].includes(provider.toLowerCase());
  const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');

  if (needsProxy && isProduction) {
    // 使用Netlify Functions代理
    // 格式: /.netlify/functions/ai-proxy?provider={provider}&path={endpointPath}
    const encodedPath = encodeURIComponent(endpointPath);
    return `/.netlify/functions/ai-proxy?provider=${provider}&path=${encodedPath}`;
  }

  return `${config.baseURL}${endpointPath}`;
}

/**
 * 获取API请求头
 * @param provider AI服务提供商名称
 * @param apiKey API密钥
 * @param customHeaders 自定义请求头
 * @returns 完整的请求头对象
 */
export function getAPIHeaders(
  provider: string, 
  apiKey: string, 
  customHeaders?: Record<string, string>
): Record<string, string> {
  const config = getAIEndpoint(provider);
  if (!config) {
    throw new Error(`不支持的AI服务提供商: ${provider}`);
  }

  const headers: Record<string, string> = {
    'Content-Type': config.headers.contentType
  };

  // 设置认证头
  switch (config.headers.authType) {
    case 'bearer':
      headers[config.headers.authHeader] = `Bearer ${apiKey}`;
      break;
    case 'api-key':
      headers[config.headers.authHeader] = apiKey;
      break;
  }

  // 设置User-Agent
  if (config.headers.userAgent) {
    headers['User-Agent'] = config.headers.userAgent;
  }

  // 合并自定义请求头
  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  return headers;
}

/**
 * 检查AI服务是否支持特定功能
 * @param provider AI服务提供商名称
 * @param feature 功能类型
 * @returns 是否支持该功能
 */
export function supportsFeature(
  provider: string, 
  feature: 'chat' | 'image' | 'streaming'
): boolean {
  const config = getAIEndpoint(provider);
  return config?.features[feature] || false;
}

/**
 * 获取所有已配置的AI服务提供商列表
 * @returns 提供商名称数组
 */
export function getAvailableProviders(): string[] {
  return Object.keys(AI_ENDPOINTS);
}

/**
 * 验证AI服务配置完整性
 * @param provider AI服务提供商名称
 * @returns 配置验证结果
 */
export function validateEndpointConfig(provider: string): {
  valid: boolean;
  errors: string[];
} {
  const config = getAIEndpoint(provider);
  const errors: string[] = [];

  if (!config) {
    errors.push(`配置不存在: ${provider}`);
    return { valid: false, errors };
  }

  // 检查必需字段
  if (!config.baseURL) {
    errors.push(`缺少baseURL配置`);
  }
  if (!config.chatEndpoint && config.features.chat) {
    errors.push(`启用了聊天功能但缺少chatEndpoint`);
  }
  if (!config.imageEndpoint && config.features.image) {
    errors.push(`启用了图像功能但缺少imageEndpoint`);
  }

  // 检查URL有效性
  try {
    new URL(config.baseURL);
  } catch (error) {
    errors.push(`无效的baseURL: ${config.baseURL}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 配置管理器类
 * 提供运行时配置更新功能
 */
export class AIEndpointManager {
  private static instance: AIEndpointManager;
  private configurations: Map<string, AIEndpointConfig> = new Map();

  private constructor() {
    // 初始化配置
    Object.entries(AI_ENDPOINTS).forEach(([key, config]) => {
      this.configurations.set(key, config);
    });
  }

  /**
   * 获取单例实例
   */
  static getInstance(): AIEndpointManager {
    if (!AIEndpointManager.instance) {
      AIEndpointManager.instance = new AIEndpointManager();
    }
    return AIEndpointManager.instance;
  }

  /**
   * 更新服务端点配置
   * @param provider 提供商名称
   * @param config 新的配置
   */
  updateEndpoint(provider: string, config: Partial<AIEndpointConfig>): void {
    const existingConfig = this.configurations.get(provider);
    if (existingConfig) {
      const updatedConfig = { ...existingConfig, ...config };
      this.configurations.set(provider, updatedConfig);
    }
  }

  /**
   * 获取配置
   * @param provider 提供商名称
   */
  getEndpoint(provider: string): AIEndpointConfig | null {
    return this.configurations.get(provider) || null;
  }

  /**
   * 重新加载环境配置
   */
  reloadConfigurations(): void {
    Object.entries(AI_ENDPOINTS).forEach(([key, config]) => {
      this.configurations.set(key, config);
    });
  }
}

// 导出单例实例
export const endpointManager = AIEndpointManager.getInstance();

console.log('🔧 AI端点configurationmanageralreadyloading');
console.log(`📊 支持的AIservice: ${getAvailableProviders().join(', ')}`);