/**
 * API密钥验证器
 * 严格遵循CLAUDE.md规则 - 禁止本地模拟，必须使用真实API验证
 */

import { logger } from '@/utils/logger';

/**
 * API密钥验证结果接口
 */
export interface ApiKeyValidationResult {
  isValid: boolean;
  provider?: 'openai' | 'deepseek' | 'anthropic' | 'zhipu' | 'baidu' | 'aliyun' | 'unknown';
  message: string;
  quotaInfo?: {
    total?: number;
    used?: number;
    remaining?: number;
  };
  model?: string;
  rateLimit?: {
    requestsPerMinute?: number;
    tokensPerMinute?: number;
  };
}

/**
 * API提供商配置
 */
const API_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    keyPattern: /^sk-[a-zA-Z0-9]{48,}$/,
    testEndpoint: 'https://api.openai.com/v1/models',
    testModel: 'gpt-3.5-turbo'
  },
  deepseek: {
    name: 'DeepSeek',
    keyPattern: /^sk-[a-zA-Z0-9]{48,}$/,
    testEndpoint: 'https://api.deepseek.com/v1/models',
    testModel: 'deepseek-chat'
  },
  anthropic: {
    name: 'Anthropic',
    keyPattern: /^sk-ant-[a-zA-Z0-9-_]{95,}$/,
    testEndpoint: 'https://api.anthropic.com/v1/models',
    testModel: 'claude-3-haiku-20240307'
  },
  zhipu: {
    name: '智谱AI',
    keyPattern: /^[a-zA-Z0-9]{32}\.[\\w-]+$/,
    testEndpoint: 'https://open.bigmodel.cn/api/paas/v4/models',
    testModel: 'glm-4'
  }
};

/**
 * API密钥验证器类
 */
export class ApiKeyValidator {
  private static readonly VALIDATION_TIMEOUT = 10000; // 10秒超时
  
  /**
   * 检测API密钥提供商
   */
  static detectProvider(apiKey: string): keyof typeof API_PROVIDERS | 'unknown' {
    if (!apiKey || typeof apiKey !== 'string') return 'unknown';
    
    for (const [provider, config] of Object.entries(API_PROVIDERS)) {
      if (config.keyPattern.test(apiKey.trim())) {
        return provider as keyof typeof API_PROVIDERS;
      }
    }
    return 'unknown';
  }

  /**
   * 验证API密钥格式
   */
  static validateFormat(apiKey: string): { isValid: boolean; message: string; provider?: string } {
    if (!apiKey || typeof apiKey !== 'string') {
      return { isValid: false, message: 'API密钥不能为空' };
    }

    const trimmedKey = apiKey.trim();
    if (trimmedKey.length < 10) {
      return { isValid: false, message: 'API密钥长度过短' };
    }

    const provider = this.detectProvider(trimmedKey);
    if (provider === 'unknown') {
      return { isValid: false, message: 'API密钥格式不符合任何已知提供商规范' };
    }

    return {
      isValid: true,
      message: '格式验证通过',
      provider: API_PROVIDERS[provider].name
    };
  }

  /**
   * 验证OpenAI API密钥（真实API调用）
   */
  static async validateOpenAIKey(apiKey: string): Promise<ApiKeyValidationResult> {
    const provider = 'openai';
    const config = API_PROVIDERS[provider];

    try {
      logger.info('开始验证OpenAI API密钥...');

      const response = await Promise.race([
        fetch(config.testEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json'
          }
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('验证超时')), this.VALIDATION_TIMEOUT)
        )
      ]);

      if (response.ok) {
        const data = await response.json();
        logger.info('OpenAI API密钥验证成功', { modelsCount: data.data?.length });
        
        return {
          isValid: true,
          provider: 'openai',
          message: 'OpenAI API密钥有效',
          model: config.testModel
        };
      } else {
        const errorText = await response.text();
        logger.warn('OpenAI API密钥验证失败', { status: response.status, error: errorText });
        
        return {
          isValid: false,
          provider: 'openai',
          message: response.status === 401 ? 'API密钥无效或已过期' : `验证失败: ${response.statusText}`
        };
      }
    } catch (error) {
      logger.error('OpenAI API密钥验证异常', error);
      
      return {
        isValid: false,
        provider: 'openai',
        message: error instanceof Error ? error.message : '验证过程中发生错误'
      };
    }
  }

  /**
   * 通用API密钥验证（自动检测提供商并验证）
   */
  static async validateApiKey(apiKey: string, forceProvider?: keyof typeof API_PROVIDERS): Promise<ApiKeyValidationResult> {
    if (!apiKey || typeof apiKey !== 'string') {
      return {
        isValid: false,
        message: 'API密钥不能为空'
      };
    }

    const trimmedKey = apiKey.trim();
    const formatValidation = this.validateFormat(trimmedKey);
    
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        message: formatValidation.message
      };
    }

    // 检测提供商
    const detectedProvider = forceProvider || this.detectProvider(trimmedKey);
    
    if (detectedProvider === 'unknown') {
      return {
        isValid: false,
        message: '无法识别API密钥提供商'
      };
    }

    logger.info(`开始验证${API_PROVIDERS[detectedProvider].name} API密钥...`);

    // 根据提供商选择验证方法
    switch (detectedProvider) {
      case 'openai':
        return await this.validateOpenAIKey(trimmedKey);
      
      default:
        return {
          isValid: false,
          provider: detectedProvider,
          message: `暂不支持${API_PROVIDERS[detectedProvider].name}密钥的实时验证`
        };
    }
  }
}

// 导出便捷方法
export const validateApiKey = ApiKeyValidator.validateApiKey.bind(ApiKeyValidator);
export const detectApiProvider = ApiKeyValidator.detectProvider.bind(ApiKeyValidator);
export const validateApiKeyFormat = ApiKeyValidator.validateFormat.bind(ApiKeyValidator);

export default ApiKeyValidator;