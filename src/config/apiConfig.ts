/**
 * API配置文件
 * 
 * ✅ 重要原则：
 * 1. 所有API地址与密钥必须从环境变量读取，严禁硬编码
 * 2. 支持开发、测试、生产多环境配置
 * 3. 提供配置验证和默认值
 * 
 * 📌 环境变量命名规范：
 * - VITE_OPENAI_API_KEY: OpenAI API密钥
 * - VITE_OPENAI_BASE_URL: OpenAI API地址
 * - VITE_GEMINI_API_KEY: Gemini API密钥
 * - VITE_GEMINI_BASE_URL: Gemini API地址
 * - VITE_DEEPSEEK_API_KEY: Deepseek API密钥
 * - VITE_DEEPSEEK_BASE_URL: Deepseek API地址
 * - VITE_CREEM_API_KEY: Creem API密钥
 * - VITE_CREEM_BASE_URL: Creem API地址
 * - VITE_AUTHING_API_KEY: Authing API密钥
 * - VITE_AUTHING_BASE_URL: Authing API地址
 * - VITE_HOT_TOPICS_BASE_URL: 热点话题API地址
 */

/**
 * API配置接口
 */
export interface APIConfig {
  /** OpenAI配置 */
  openai: {
    apiKey: string;
    baseURL: string;
  };
  /** Gemini配置 */
  gemini: {
    apiKey: string;
    baseURL: string;
  };
  /** Deepseek配置 */
  deepseek: {
    apiKey: string;
    baseURL: string;
  };
  /** Creem配置 */
  creem: {
    apiKey: string;
    baseURL: string;
  };
  /** Authing配置 */
  authing: {
    apiKey: string;
    baseURL: string;
  };
  /** 热点话题API配置 */
  hotTopics: {
    baseURL: string;
  };
  /** 其他API配置 */
  [key: string]: {
    apiKey?: string;
    baseURL: string;
  };
}

/**
 * 从环境变量获取API配置
 * 严禁硬编码任何API地址或密钥
 */
export const getAPIConfig = (): APIConfig => {
  // 优先使用全局环境变量，回退到import.meta.env
  const globalEnv = typeof window !== 'undefined' ? (window as any).__ENV__ : {};
  
  const getEnvVar = (key: string, defaultValue?: string): string => {
    return globalEnv[key] || import.meta.env[key] || defaultValue || '';
  };

  const config: APIConfig = {
    openai: {
      apiKey: getEnvVar('VITE_OPENAI_API_KEY', ''),
      baseURL: getEnvVar('VITE_OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    },
    gemini: {
      apiKey: getEnvVar('VITE_GEMINI_API_KEY', ''),
      baseURL: getEnvVar('VITE_GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com'),
    },
    deepseek: {
      apiKey: getEnvVar('VITE_DEEPSEEK_API_KEY', ''),
      baseURL: getEnvVar('VITE_DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
    },
    creem: {
      apiKey: getEnvVar('VITE_CREEM_API_KEY', ''),
      baseURL: getEnvVar('VITE_CREEM_BASE_URL', 'https://api.creem.com'),
    },
    authing: {
      apiKey: getEnvVar('VITE_AUTHING_API_KEY', ''),
      baseURL: getEnvVar('VITE_AUTHING_BASE_URL', 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644'),
    },
    hotTopics: {
      baseURL: getEnvVar('VITE_HOT_TOPICS_BASE_URL', 'https://api-hot.imsyy.top'),
    },
  };

  // 开发环境日志
  if (import.meta.env.DEV) {
    console.log('🔧 API配置加载:', {
      openai: { hasKey: !!config.openai.apiKey, baseURL: config.openai.baseURL },
      gemini: { hasKey: !!config.gemini.apiKey, baseURL: config.gemini.baseURL },
      deepseek: { hasKey: !!config.deepseek.apiKey, baseURL: config.deepseek.baseURL },
      creem: { hasKey: !!config.creem.apiKey, baseURL: config.creem.baseURL },
      authing: { hasKey: !!config.authing.apiKey, baseURL: config.authing.baseURL },
      hotTopics: { baseURL: config.hotTopics.baseURL },
    });
  }

  return config;
};

/**
 * 验证API配置是否完整
 */
export const validateAPIConfig = (): {
  isValid: boolean;
  missingKeys: string[];
  warnings: string[];
} => {
  const config = getAPIConfig();
  const missingKeys: string[] = [];
  const warnings: string[] = [];

  // 检查必需的API密钥
  const requiredConfigs = [
    { name: 'OpenAI', key: config.openai.apiKey, baseURL: config.openai.baseURL },
    { name: 'Gemini', key: config.gemini.apiKey, baseURL: config.gemini.baseURL },
    { name: 'Deepseek', key: config.deepseek.apiKey, baseURL: config.deepseek.baseURL },
  ];

  for (const { name, key, baseURL } of requiredConfigs) {
    if (!key) {
      missingKeys.push(`${name} API密钥`);
    } else if (key.includes('{{') || key.includes('your-') || key.includes('placeholder')) {
      warnings.push(`${name} API密钥似乎是占位符`);
    }
    
    if (!baseURL) {
      missingKeys.push(`${name} API地址`);
    }
  }

  // 检查可选配置
  if (!config.creem.apiKey) {
    warnings.push('Creem API密钥未配置（支付功能可能不可用）');
  }

  if (!config.authing.apiKey) {
    warnings.push('Authing API密钥未配置（认证功能可能受限）');
  }

  const isValid = missingKeys.length === 0;

  if (import.meta.env.DEV) {
    if (isValid) {
      console.log('✅ API配置验证通过');
    } else {
      console.warn('⚠️ API配置验证失败:', { missingKeys, warnings });
    }
  }

  return { isValid, missingKeys, warnings };
};

/**
 * 获取特定API的配置
 */
export const getSpecificAPIConfig = (apiName: keyof APIConfig) => {
  const config = getAPIConfig();
  return config[apiName];
};

/**
 * 检查特定API是否可用
 */
export const isAPIAvailable = (apiName: keyof APIConfig): boolean => {
  const config = getSpecificAPIConfig(apiName);
  return !!(config.apiKey && config.baseURL);
};

export default getAPIConfig; 