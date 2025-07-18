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
 * 安全获取环境变量
 * 避免在构建时硬编码敏感信息
 * ✅ FIXED: 修复生产环境环境变量获取问题，支持多种获取方式
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此函数做任何修改
 */
function getSecureEnvVar(key: string, defaultValue: string = ''): string {
  // 在开发环境中，直接从环境变量获取
  if (import.meta.env.DEV) {
    return import.meta.env[key] || defaultValue;
  }
  
  // 在生产环境中，尝试多种方式获取环境变量
  if (typeof window !== 'undefined') {
    // 方式1: 尝试从全局变量获取
    const runtimeConfig = (window as any).__RUNTIME_CONFIG__;
    if (runtimeConfig && runtimeConfig[key]) {
      return runtimeConfig[key];
    }
    
    // 方式2: 尝试从meta标签获取（如果配置注入器已注入）
    const metaElement = document.querySelector(`meta[name="${key}"]`);
    if (metaElement && metaElement.getAttribute('content')) {
      return metaElement.getAttribute('content') || defaultValue;
    }
    
    // 方式3: 尝试从全局变量获取（兼容旧版本）
    if ((window as any)[key]) {
      return (window as any)[key];
    }
  }
  
  // 方式4: 尝试从import.meta.env获取（如果构建时已注入）
  if (import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  // 如果所有方式都无法获取，返回默认值
  return defaultValue;
}

/**
 * 获取API配置
 * @returns {APIConfig} API配置对象
 */
export const getAPIConfig = (): APIConfig => {
  const config: APIConfig = {
    openai: {
      apiKey: getSecureEnvVar('VITE_OPENAI_API_KEY', ''),
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      timeout: parseInt(getSecureEnvVar('VITE_API_TIMEOUT', '30000')),
    },
    deepseek: {
      apiKey: getSecureEnvVar('VITE_DEEPSEEK_API_KEY', ''),
      baseURL: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      timeout: parseInt(getSecureEnvVar('VITE_API_TIMEOUT', '30000')),
    },
    gemini: {
      apiKey: getSecureEnvVar('VITE_GEMINI_API_KEY', ''),
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-pro',
      timeout: parseInt(getSecureEnvVar('VITE_API_TIMEOUT', '30000')),
    },
    authing: {
      appId: getSecureEnvVar('VITE_AUTHING_APP_ID', ''),
      secret: getSecureEnvVar('VITE_AUTHING_SECRET', ''),
      host: getSecureEnvVar('VITE_AUTHING_HOST', ''),
      redirectUri: import.meta.env.DEV 
        ? (getSecureEnvVar('VITE_AUTHING_REDIRECT_URI_DEV', 'http://localhost:5174/callback'))
        : (getSecureEnvVar('VITE_AUTHING_REDIRECT_URI_PROD', 'https://www.wenpai.xyz/callback')),
    },
    creem: {
      apiKey: getSecureEnvVar('VITE_CREEM_API_KEY', ''),
      baseURL: 'https://api.creem.com',
      timeout: parseInt(getSecureEnvVar('VITE_API_TIMEOUT', '30000')),
    },
    backend: {
      baseUrl: getSecureEnvVar('VITE_API_BASE_URL', ''),
      port: parseInt(getSecureEnvVar('BACKEND_PORT', '3001')),
      timeout: parseInt(getSecureEnvVar('VITE_API_TIMEOUT', '30000')),
    },
    payment: {
      alipay: {
        appId: getSecureEnvVar('VITE_ALIPAY_APP_ID', ''),
        publicKey: getSecureEnvVar('VITE_ALIPAY_PUBLIC_KEY', ''),
        privateKey: getSecureEnvVar('VITE_ALIPAY_PRIVATE_KEY', ''),
      },
      wechat: {
        appId: getSecureEnvVar('VITE_WECHAT_APP_ID', ''),
        mchId: getSecureEnvVar('VITE_WECHAT_MCH_ID', ''),
        apiKey: getSecureEnvVar('VITE_WECHAT_API_KEY', ''),
      },
    },
    environment: {
      isDev: import.meta.env.DEV || false,
      isProd: import.meta.env.PROD || false,
      debugMode: getSecureEnvVar('VITE_DEBUG_MODE', 'false') === 'true',
      logLevel: getSecureEnvVar('VITE_LOG_LEVEL', 'info'),
      nodeEnv: import.meta.env.MODE || 'development',
    },
    features: {
      enableAI: getSecureEnvVar('VITE_ENABLE_AI_FEATURES', 'true') !== 'false',
      enableImageGeneration: getSecureEnvVar('VITE_ENABLE_IMAGE_GENERATION', 'true') !== 'false',
      enableContentAdaptation: getSecureEnvVar('VITE_ENABLE_CONTENT_ADAPTATION', 'true') !== 'false',
      enableSecurityLogging: getSecureEnvVar('VITE_ENABLE_SECURITY_LOGGING', 'false') === 'true',
      enablePayment: getSecureEnvVar('VITE_ENABLE_PAYMENT', 'true') !== 'false',
    },
  };

  // 配置验证和警告
  const invalidConfigs = Object.entries(config).filter(([key, value]) => {
    if (key === 'authing') {
      return !value.appId || !value.host;
    }
    if (key === 'creem' || key === 'openai' || key === 'deepseek' || key === 'gemini') {
      return !value.apiKey || value.apiKey === 'your-' + key + '-api-key';
    }
    return false;
  });
  
  // 在开发环境中显示详细警告
  if (import.meta.env.DEV && invalidConfigs.length > 0) {
    console.log(`⚠️ 部分API配置未设置: ${invalidConfigs.map(([key]) => key).join(', ')}`);
  }
  
  // 在生产环境中，只对关键配置显示简洁警告
  if (import.meta.env.PROD) {
    const criticalConfigs = invalidConfigs.filter(([key]) => 
      ['openai', 'authing'].includes(key)
    );
    
    if (criticalConfigs.length > 0) {
      console.warn(`⚠️ 关键配置缺失: ${criticalConfigs.map(([key]) => key).join(', ')}`);
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
  
  const validConfigs = details.filter(d => d.status === 'valid').length;
  const requiredConfigs = details.filter(d => d.status === 'missing').length;
  
  return {
    totalConfigs: details.length,
    validConfigs,
    requiredConfigs,
    requiredValid: requiredConfigs,
    details
  };
}

/**
 * 设置运行时配置
 * 用于在生产环境中动态设置API密钥
 */
export function setRuntimeConfig(config: Record<string, string>): void {
  if (typeof window !== 'undefined') {
    (window as any).__RUNTIME_CONFIG__ = {
      ...(window as any).__RUNTIME_CONFIG__,
      ...config
    };
  }
}

/**
 * 获取运行时配置
 */
export function getRuntimeConfig(): Record<string, string> {
  if (typeof window !== 'undefined') {
    return (window as any).__RUNTIME_CONFIG__ || {};
  }
  return {};
} 