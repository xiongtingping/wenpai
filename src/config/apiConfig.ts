/**
 * 统一API配置管理
 * 所有API配置都从环境变量中读取，支持开发和生产环境
 * 确保没有硬编码的API密钥
 */

/**
 * API配置接口
 */
export interface APIConfig {
  // OpenAI配置
  openai: {
    apiKey: string;
    baseURL: string;
    model: string;
    timeout: number;
  };
  
  // DeepSeek配置
  deepseek: {
    apiKey: string;
    baseURL: string;
    model: string;
    timeout: number;
  };
  
  // Gemini配置
  gemini: {
    apiKey: string;
    baseURL: string;
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
  
  // Creem支付配置
  creem: {
    apiKey: string;
    baseURL: string;
    timeout: number;
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
    nodeEnv: string;
  };
  
  // 功能开关
  features: {
    enableAI: boolean;
    enableImageGeneration: boolean;
    enableContentAdaptation: boolean;
    enableSecurityLogging: boolean;
    enablePayment: boolean;
  };
}

/**
 * 获取API配置
 * @returns {APIConfig} API配置对象
 */
export const getAPIConfig = (): APIConfig => {
  const config: APIConfig = {
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    },
    deepseek: {
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
      baseURL: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    },
    gemini: {
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-pro',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    },
    authing: {
      appId: import.meta.env.VITE_AUTHING_APP_ID || '',
      secret: import.meta.env.VITE_AUTHING_SECRET || '',
      host: import.meta.env.VITE_AUTHING_HOST || '',
      redirectUri: import.meta.env.DEV 
        ? (import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5174/callback')
        : (import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback'),
    },
    creem: {
      apiKey: import.meta.env.VITE_CREEM_API_KEY || '',
      baseURL: 'https://api.creem.com',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    },
    backend: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || '',
      port: parseInt(import.meta.env.BACKEND_PORT || '3001'),
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    },
    payment: {
      alipay: {
        appId: import.meta.env.VITE_ALIPAY_APP_ID || '',
        publicKey: import.meta.env.VITE_ALIPAY_PUBLIC_KEY || '',
        privateKey: import.meta.env.VITE_ALIPAY_PRIVATE_KEY || '',
      },
      wechat: {
        appId: import.meta.env.VITE_WECHAT_APP_ID || '',
        mchId: import.meta.env.VITE_WECHAT_MCH_ID || '',
        apiKey: import.meta.env.VITE_WECHAT_API_KEY || '',
      },
    },
    environment: {
      isDev: import.meta.env.DEV || false,
      isProd: import.meta.env.PROD || false,
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
      logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
      nodeEnv: import.meta.env.MODE || 'development',
    },
    features: {
      enableAI: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false',
      enableImageGeneration: import.meta.env.VITE_ENABLE_IMAGE_GENERATION !== 'false',
      enableContentAdaptation: import.meta.env.VITE_ENABLE_CONTENT_ADAPTATION !== 'false',
      enableSecurityLogging: import.meta.env.VITE_ENABLE_SECURITY_LOGGING === 'true',
      enablePayment: import.meta.env.VITE_ENABLE_PAYMENT !== 'false',
    },
  };

  // 简化验证，只在开发模式下显示警告
  if (import.meta.env.DEV) {
    const invalidConfigs = Object.entries(config).filter(([key, value]) => {
      if (key === 'authing') {
        return !value.appId || !value.host;
      }
      if (key === 'creem' || key === 'openai' || key === 'deepseek' || key === 'gemini') {
        return !value.apiKey || value.apiKey === 'your-' + key + '-api-key';
      }
      return false;
    });
    
    if (invalidConfigs.length > 0) {
      console.log(`⚠️ 部分API配置未设置: ${invalidConfigs.map(([key]) => key).join(', ')}`);
    }
  }

  return config;
};

/**
 * 重新加载API配置
 */
export function reloadAPIConfig(): APIConfig {
  return getAPIConfig();
}

// 便捷的配置获取函数
export const getOpenAIConfig = () => getAPIConfig().openai;
export const getDeepSeekConfig = () => getAPIConfig().deepseek;
export const getGeminiConfig = () => getAPIConfig().gemini;
export const getAuthingConfig = () => getAPIConfig().authing;
export const getCreemConfig = () => getAPIConfig().creem;
export const getBackendConfig = () => getAPIConfig().backend;
export const getPaymentConfig = () => getAPIConfig().payment;
export const getEnvironmentConfig = () => getAPIConfig().environment;
export const getFeaturesConfig = () => getAPIConfig().features;

/**
 * 验证API密钥格式
 */
export function isValidAPIKey(apiKey: string, provider: 'openai' | 'deepseek' | 'gemini' | 'creem'): boolean {
  if (!apiKey || apiKey === 'sk-your-openai-api-key-here' || apiKey === 'your-gemini-api-key-here') {
    return false;
  }
  
  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length >= 20;
    case 'deepseek':
      return apiKey.startsWith('sk-') && apiKey.length >= 30;
    case 'gemini':
      return apiKey.length >= 20;
    case 'creem':
      return apiKey.startsWith('creem_') && apiKey.length >= 10;
    default:
      return false;
  }
}

/**
 * 获取API端点
 */
export function getAPIEndpoint(type: 'netlify' | 'dev' | 'openai' | 'deepseek' | 'gemini' | 'creem'): string {
  const config = getAPIConfig();
  
  switch (type) {
    case 'netlify':
      return '/.netlify/functions/api';
    case 'dev':
      return 'http://localhost:8888/.netlify/functions/api';
    case 'openai':
      return config.openai.baseURL;
    case 'deepseek':
      return config.deepseek.baseURL;
    case 'gemini':
      return config.gemini.baseURL;
    case 'creem':
      return config.creem.baseURL;
    default:
      return '';
  }
}

/**
 * 获取配置摘要
 */
export function getConfigSummary(): {
  totalConfigs: number;
  validConfigs: number;
  requiredConfigs: number;
  requiredValid: number;
  details: Array<{
    name: string;
    status: 'valid' | 'invalid' | 'missing' | 'optional';
    description: string;
  }>;
} {
  const config = getAPIConfig();
  const details = [];
  
  // OpenAI配置
  details.push({
    name: 'OpenAI API',
    status: config.openai.apiKey && isValidAPIKey(config.openai.apiKey, 'openai') ? 'valid' : 'missing',
    description: '用于AI内容生成和分析'
  });
  
  // DeepSeek配置
  details.push({
    name: 'DeepSeek API',
    status: config.deepseek.apiKey && isValidAPIKey(config.deepseek.apiKey, 'deepseek') ? 'valid' : 'optional',
    description: 'AI内容生成的备选方案'
  });
  
  // Gemini配置
  details.push({
    name: 'Gemini API',
    status: config.gemini.apiKey && isValidAPIKey(config.gemini.apiKey, 'gemini') ? 'valid' : 'optional',
    description: 'Google AI服务'
  });
  
  // Authing配置
  details.push({
    name: 'Authing认证',
    status: config.authing.appId && config.authing.host ? 'valid' : 'missing',
    description: '用户认证和授权'
  });
  
  // Creem配置
  details.push({
    name: 'Creem支付',
    status: config.creem.apiKey && isValidAPIKey(config.creem.apiKey, 'creem') ? 'valid' : 'optional',
    description: '支付处理服务'
  });
  
  // 后端API配置
  details.push({
    name: '后端API',
    status: config.backend.baseUrl ? 'valid' : 'optional',
    description: '后端服务接口'
  });
  
  const validConfigs = details.filter(d => d.status === 'valid').length;
  const requiredConfigs = details.filter(d => d.status === 'missing' || d.status === 'valid').length;
  const requiredValid = details.filter(d => d.status === 'valid').length;
  
  return {
    totalConfigs: details.length,
    validConfigs,
    requiredConfigs,
    requiredValid,
    details
  };
} 