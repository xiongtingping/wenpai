/**
 * 统一API配置管理
 * 所有API配置都从环境变量中读取，支持开发和生产环境
 */

/**
 * API配置接口
 */
export interface APIConfig {
  // OpenAI配置
  openai: {
    apiKey: string;
    endpoint: string;
    model: string;
    timeout: number;
  };
  
  // DeepSeek配置
  deepseek: {
    apiKey: string;
    endpoint: string;
    model: string;
    timeout: number;
  };
  
  // Gemini配置
  gemini: {
    apiKey: string;
    endpoint: string;
    model: string;
    timeout: number;
  };
  
  // Authing配置
  authing: {
    appId: string;
    secret: string;
    host: string;
    redirectUri: string;
  };
  
  // 后端API配置
  backend: {
    baseUrl: string;
    port: number;
    timeout: number;
  };
  
  // 支付配置
  payment: {
    alipay: {
      appId: string;
      publicKey: string;
      privateKey: string;
    };
    wechat: {
      appId: string;
      mchId: string;
      apiKey: string;
    };
  };
  
  // 环境配置
  environment: {
    isDev: boolean;
    isProd: boolean;
    debugMode: boolean;
    logLevel: string;
  };
  
  // 功能开关
  features: {
    enableAI: boolean;
    enableImageGeneration: boolean;
    enableContentAdaptation: boolean;
    enableSecurityLogging: boolean;
  };
}

/**
 * 默认API配置
 */
const DEFAULT_CONFIG: APIConfig = {
  openai: {
    apiKey: '',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    timeout: 30000
  },
  deepseek: {
    apiKey: '',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    timeout: 30000
  },
  gemini: {
    apiKey: '',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro',
    timeout: 30000
  },
  authing: {
    appId: '',
    secret: '',
    host: '',
    redirectUri: ''
  },
  backend: {
    baseUrl: '',
    port: 3001,
    timeout: 30000
  },
  payment: {
    alipay: {
      appId: '',
      publicKey: '',
      privateKey: ''
    },
    wechat: {
      appId: '',
      mchId: '',
      apiKey: ''
    }
  },
  environment: {
    isDev: import.meta.env.DEV || false,
    isProd: import.meta.env.PROD || false,
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info'
  },
  features: {
    enableAI: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false',
    enableImageGeneration: import.meta.env.VITE_ENABLE_IMAGE_GENERATION !== 'false',
    enableContentAdaptation: import.meta.env.VITE_ENABLE_CONTENT_ADAPTATION !== 'false',
    enableSecurityLogging: import.meta.env.VITE_ENABLE_SECURITY_LOGGING === 'true'
  }
};

/**
 * 从环境变量加载API配置
 */
function loadConfigFromEnv(): APIConfig {
  const config = { ...DEFAULT_CONFIG };
  
  // OpenAI配置
  config.openai.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  config.openai.endpoint = import.meta.env.VITE_OPENAI_ENDPOINT || config.openai.endpoint;
  config.openai.model = import.meta.env.VITE_OPENAI_MODEL || config.openai.model;
  config.openai.timeout = parseInt(import.meta.env.VITE_OPENAI_TIMEOUT || '30000');
  
  // DeepSeek配置
  config.deepseek.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  config.deepseek.endpoint = import.meta.env.VITE_DEEPSEEK_ENDPOINT || config.deepseek.endpoint;
  config.deepseek.model = import.meta.env.VITE_DEEPSEEK_MODEL || config.deepseek.model;
  config.deepseek.timeout = parseInt(import.meta.env.VITE_DEEPSEEK_TIMEOUT || '30000');
  
  // Gemini配置
  config.gemini.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  config.gemini.endpoint = import.meta.env.VITE_GEMINI_ENDPOINT || config.gemini.endpoint;
  config.gemini.model = import.meta.env.VITE_GEMINI_MODEL || config.gemini.model;
  config.gemini.timeout = parseInt(import.meta.env.VITE_GEMINI_TIMEOUT || '30000');
  
  // Authing配置
  config.authing.appId = import.meta.env.VITE_AUTHING_APP_ID || '';
  config.authing.secret = import.meta.env.VITE_AUTHING_SECRET || '';
  config.authing.host = import.meta.env.VITE_AUTHING_HOST || '';
  
  // 根据环境设置回调地址
  if (config.environment.isDev) {
    config.authing.redirectUri = import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback';
  } else {
    config.authing.redirectUri = import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback';
  }
  
  // 后端API配置
  config.backend.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  config.backend.port = parseInt(import.meta.env.BACKEND_PORT || '3001');
  config.backend.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
  
  // 支付配置
  config.payment.alipay.appId = import.meta.env.VITE_ALIPAY_APP_ID || '';
  config.payment.alipay.publicKey = import.meta.env.VITE_ALIPAY_PUBLIC_KEY || '';
  config.payment.alipay.privateKey = import.meta.env.VITE_ALIPAY_PRIVATE_KEY || '';
  
  config.payment.wechat.appId = import.meta.env.VITE_WECHAT_APP_ID || '';
  config.payment.wechat.mchId = import.meta.env.VITE_WECHAT_MCH_ID || '';
  config.payment.wechat.apiKey = import.meta.env.VITE_WECHAT_API_KEY || '';
  
  return config;
}

/**
 * 验证API配置
 */
function validateConfig(config: APIConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 检查必需的配置
  if (!config.openai.apiKey && config.features.enableAI) {
    errors.push('OpenAI API密钥未配置 (VITE_OPENAI_API_KEY)');
  }
  
  if (!config.authing.appId) {
    errors.push('Authing应用ID未配置 (VITE_AUTHING_APP_ID)');
  }
  
  if (!config.authing.host) {
    errors.push('Authing域名未配置 (VITE_AUTHING_HOST)');
  }
  
  if (!config.backend.baseUrl) {
    errors.push('后端API基础URL未配置 (VITE_API_BASE_URL)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 获取API配置实例
 */
let configInstance: APIConfig | null = null;

export function getAPIConfig(): APIConfig {
  if (!configInstance) {
    configInstance = loadConfigFromEnv();
    
    // 验证配置
    const validation = validateConfig(configInstance);
    if (!validation.isValid) {
      console.warn('⚠️ API配置验证失败:', validation.errors);
    }
    
    // 开发环境输出配置信息
    if (configInstance.environment.isDev && configInstance.environment.debugMode) {
      console.log('🔧 API配置已加载:', {
        openai: { ...configInstance.openai, apiKey: configInstance.openai.apiKey ? '已设置' : '未设置' },
        authing: { ...configInstance.authing, secret: configInstance.authing.secret ? '已设置' : '未设置' },
        backend: configInstance.backend,
        environment: configInstance.environment,
        features: configInstance.features
      });
    }
  }
  
  return configInstance;
}

/**
 * 重新加载配置（用于热重载）
 */
export function reloadAPIConfig(): APIConfig {
  configInstance = null;
  return getAPIConfig();
}

/**
 * 获取特定API配置的辅助函数
 */
export const getOpenAIConfig = () => getAPIConfig().openai;
export const getDeepSeekConfig = () => getAPIConfig().deepseek;
export const getGeminiConfig = () => getAPIConfig().gemini;
export const getAuthingConfig = () => getAPIConfig().authing;
export const getBackendConfig = () => getAPIConfig().backend;
export const getPaymentConfig = () => getAPIConfig().payment;
export const getEnvironmentConfig = () => getAPIConfig().environment;
export const getFeaturesConfig = () => getAPIConfig().features;

/**
 * 检查API密钥是否有效
 */
export function isValidAPIKey(apiKey: string, provider: 'openai' | 'deepseek' | 'gemini'): boolean {
  if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
    return false;
  }
  
  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length >= 20;
    case 'deepseek':
      return apiKey.startsWith('sk-') && apiKey.length >= 30;
    case 'gemini':
      return apiKey.length >= 20; // Gemini API密钥没有特定前缀
    default:
      return false;
  }
}

/**
 * 获取API端点URL
 */
export function getAPIEndpoint(type: 'netlify' | 'dev' | 'openai' | 'deepseek' | 'gemini'): string {
  const config = getAPIConfig();
  
  switch (type) {
    case 'netlify':
      return '/.netlify/functions/api';
    case 'dev':
      return config.openai.endpoint;
    case 'openai':
      return config.openai.endpoint;
    case 'deepseek':
      return config.deepseek.endpoint;
    case 'gemini':
      return config.gemini.endpoint;
    default:
      return '/.netlify/functions/api';
  }
}

/**
 * 导出默认配置实例
 */
export default getAPIConfig(); 