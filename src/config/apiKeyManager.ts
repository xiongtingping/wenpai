/**
 * 🔐 API密钥统一管理器
 * 
 * 🎯 目标：
 * - 统一管理所有AI服务API密钥
 * - 严格遵循环境变量配置，禁止硬编码
 * - 提供密钥验证和安全检查功能
 * - 支持开发/生产环境密钥隔离
 * 
 * 📌 遵循CLAUDE.md规则：严禁硬编码敏感信息
 */

/**
 * API密钥配置接口
 */
export interface APIKeyConfig {
  envKey: string;           // 环境变量名称
  fallbackEnvKey?: string;  // 备用环境变量名称
  required: boolean;        // 是否为必需密钥
  validation: {
    prefix?: string;        // 密钥前缀验证
    minLength?: number;     // 最小长度
    pattern?: RegExp;       // 正则表达式验证
  };
  description: string;      // 密钥描述
}

/**
 * 密钥验证结果接口
 */
export interface KeyValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  configured: boolean;
  masked: string;  // 脱敏后的密钥显示
}

/**
 * AI服务API密钥配置映射
 * 🔒 所有密钥配置通过环境变量获取，严禁硬编码
 */
export const API_KEY_CONFIGS: Record<string, APIKeyConfig> = {
  // AIMLAPI密钥配置 - 统一AI接入服务
  aimlapi: {
    envKey: 'VITE_AIMLAPI_KEY',
    fallbackEnvKey: 'AIMLAPI_KEY',
    required: true,  // 🔧 主要API服务，必需配置
    validation: {
      minLength: 10,
      pattern: /^[a-zA-Z0-9\-_]{10,}$/
    },
    description: 'AIML API密钥，统一AI模型接入服务 (OpenAI/Claude/Gemini等)'
  },

  // 🔧 OpenAI provider别名 - 通过AIMLAPI调用
  openai: {
    envKey: 'VITE_AIMLAPI_KEY',
    fallbackEnvKey: 'AIMLAPI_KEY',
    required: true,
    validation: {
      minLength: 10,
      pattern: /^[a-zA-Z0-9\-_]{10,}$/
    },
    description: 'OpenAI模型通过AIML API调用'
  },

  // 🔧 Anthropic provider别名 - 通过AIMLAPI调用
  anthropic: {
    envKey: 'VITE_AIMLAPI_KEY',
    fallbackEnvKey: 'AIMLAPI_KEY',
    required: true,
    validation: {
      minLength: 10,
      pattern: /^[a-zA-Z0-9\-_]{10,}$/
    },
    description: 'Anthropic Claude模型通过AIML API调用'
  },

  // 🔧 Gemini provider别名 - 通过AIMLAPI调用
  gemini: {
    envKey: 'VITE_AIMLAPI_KEY',
    fallbackEnvKey: 'AIMLAPI_KEY',
    required: true,
    validation: {
      minLength: 10,
      pattern: /^[a-zA-Z0-9\-_]{10,}$/
    },
    description: 'Google Gemini模型通过AIML API调用'
  },

  // DeepSeek API密钥配置 - 独立直连
  deepseek: {
    envKey: 'VITE_DEEPSEEK_API_KEY',
    fallbackEnvKey: 'DEEPSEEK_API_KEY',
    required: false,  // 🔧 可选配置，未配置时DeepSeek模型不可用
    validation: {
      prefix: 'sk-',
      minLength: 20,
      pattern: /^sk-[a-zA-Z0-9]{20,}$/
    },
    description: 'DeepSeek API密钥，用于DeepSeek模型直连调用'
  },

  // Supabase配置（数据库相关）
  supabase: {
    envKey: 'VITE_SUPABASE_ANON_KEY',
    fallbackEnvKey: 'SUPABASE_ANON_KEY',
    required: true,
    validation: {
      minLength: 100,
      pattern: /^eyJ[a-zA-Z0-9\-_\.]+$/
    },
    description: 'Supabase匿名密钥，用于数据库访问'
  }
};

/**
 * 安全获取API密钥
 * @param service 服务名称
 * @returns API密钥或null
 */
export function getAPIKey(service: string): string | null {
  const config = API_KEY_CONFIGS[service.toLowerCase()];
  if (!config) {
    console.warn(`⚠️ not知的APIservice: ${service}`);
    return null;
  }

  // 优先使用主环境变量
  let apiKey = import.meta.env?.[config.envKey] || process.env?.[config.envKey];
  
  // 尝试备用环境变量
  if (!apiKey && config.fallbackEnvKey) {
    apiKey = import.meta.env?.[config.fallbackEnvKey] || process.env?.[config.fallbackEnvKey];
  }

  // 安全检查：避免返回测试/占位符密钥
  if (apiKey && (
    apiKey === 'your_api_key_here' ||
    apiKey === 'test_key' ||
    apiKey === 'placeholder' ||
    apiKey.length < 5
  )) {
    console.warn(`⚠️ detecting到testingkey，ignoring: ${service}`);
    return null;
  }

  return apiKey || null;
}

/**
 * 验证API密钥有效性
 * @param service 服务名称
 * @param apiKey 可选的密钥（不提供则从环境变量获取）
 * @returns 验证结果
 */
export function validateAPIKey(service: string, apiKey?: string): KeyValidationResult {
  const config = API_KEY_CONFIGS[service.toLowerCase()];
  const result: KeyValidationResult = {
    valid: false,
    errors: [],
    warnings: [],
    configured: false,
    masked: ''
  };

  if (!config) {
    result.errors.push(`未知的API服务: ${service}`);
    return result;
  }

  // 获取密钥
  const key = apiKey || getAPIKey(service);
  
  if (!key) {
    if (config.required) {
      result.errors.push(`缺少必需的API密钥: ${config.envKey}`);
    } else {
      result.warnings.push(`可选API密钥未配置: ${service}`);
    }
    return result;
  }

  result.configured = true;
  result.masked = maskAPIKey(key);

  // 长度验证
  if (config.validation.minLength && key.length < config.validation.minLength) {
    result.errors.push(`密钥长度不足，至少需要${config.validation.minLength}个字符`);
  }

  // 前缀验证
  if (config.validation.prefix && !key.startsWith(config.validation.prefix)) {
    result.errors.push(`密钥前缀错误，应以"${config.validation.prefix}"开头`);
  }

  // 正则表达式验证
  if (config.validation.pattern && !config.validation.pattern.test(key)) {
    result.errors.push(`密钥格式不符合要求`);
  }

  // 检查是否为测试密钥
  const testKeywords = ['test', 'demo', 'example', 'placeholder', 'your_api_key'];
  if (testKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
    result.warnings.push(`疑似测试密钥，请确认在生产环境使用真实密钥`);
  }

  result.valid = result.errors.length === 0;
  return result;
}

/**
 * 脱敏显示API密钥
 * @param apiKey 原始密钥
 * @returns 脱敏后的密钥
 */
export function maskAPIKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '***';
  }
  
  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);
  const middle = '*'.repeat(Math.min(apiKey.length - 8, 20));
  
  return `${start}${middle}${end}`;
}

/**
 * 检查所有API密钥配置状态
 * @returns 所有密钥的验证结果
 */
export function checkAllAPIKeys(): Record<string, KeyValidationResult> {
  const results: Record<string, KeyValidationResult> = {};
  
  Object.keys(API_KEY_CONFIGS).forEach(service => {
    results[service] = validateAPIKey(service);
  });
  
  return results;
}

/**
 * 获取已配置的API服务列表
 * @returns 已配置密钥的服务列表
 */
export function getConfiguredServices(): string[] {
  return Object.keys(API_KEY_CONFIGS).filter(service => {
    const key = getAPIKey(service);
    return key && key.length > 0;
  });
}

/**
 * 获取缺失的必需API密钥
 * @returns 缺失的必需密钥列表
 */
export function getMissingRequiredKeys(): string[] {
  return Object.entries(API_KEY_CONFIGS)
    .filter(([service, config]) => {
      return config.required && !getAPIKey(service);
    })
    .map(([service]) => service);
}

/**
 * API密钥管理器类
 * 提供运行时密钥管理功能
 */
export class APIKeyManager {
  private static instance: APIKeyManager;
  private keyCache: Map<string, string> = new Map();
  private validationCache: Map<string, KeyValidationResult> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {
    this.initializeCache();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager();
    }
    return APIKeyManager.instance;
  }

  /**
   * 初始化缓存
   */
  private initializeCache(): void {
    Object.keys(API_KEY_CONFIGS).forEach(service => {
      const key = getAPIKey(service);
      if (key) {
        this.keyCache.set(service, key);
      }
    });
  }

  /**
   * 获取缓存的密钥
   * @param service 服务名称
   */
  getCachedKey(service: string): string | null {
    return this.keyCache.get(service) || null;
  }

  /**
   * 刷新单个服务的密钥缓存
   * @param service 服务名称
   */
  refreshKey(service: string): void {
    const key = getAPIKey(service);
    if (key) {
      this.keyCache.set(service, key);
    } else {
      this.keyCache.delete(service);
    }
    // 清除验证缓存
    this.validationCache.delete(service);
  }

  /**
   * 获取缓存的验证结果
   * @param service 服务名称
   */
  getCachedValidation(service: string): KeyValidationResult | null {
    const cached = this.validationCache.get(service);
    if (cached && Date.now() - (cached as any).timestamp < this.cacheExpiry) {
      return cached;
    }
    return null;
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    this.keyCache.clear();
    this.validationCache.clear();
  }

  /**
   * 获取系统配置概览
   */
  getSystemOverview(): {
    totalServices: number;
    configuredServices: number;
    requiredServices: number;
    missingRequired: string[];
    configuredList: string[];
  } {
    const totalServices = Object.keys(API_KEY_CONFIGS).length;
    const configuredList = getConfiguredServices();
    const requiredServices = Object.values(API_KEY_CONFIGS).filter(c => c.required).length;
    const missingRequired = getMissingRequiredKeys();

    return {
      totalServices,
      configuredServices: configuredList.length,
      requiredServices,
      missingRequired,
      configuredList
    };
  }
}

// 导出单例实例
export const keyManager = APIKeyManager.getInstance();

// 系统启动时检查密钥配置
const overview = keyManager.getSystemOverview();
console.log('🔐 APIkeymanageralreadyloading');
console.log(`📊 configurationstate: ${overview.configuredServices}/${overview.totalServices} unitsservicealreadyconfigurationkey`);

if (overview.missingRequired.length > 0) {
  console.warn(`⚠️ missing必需的APIkey: ${overview.missingRequired.join(', ')}`);
} else {
  console.log('✅ 所has必需的APIkeyalreadyconfiguration');
}