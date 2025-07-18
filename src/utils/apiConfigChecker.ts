/**
 * API配置检查工具
 * 用于验证部署环境的API配置是否正确
 */

import { getAPIConfig, getConfigSummary, isValidAPIKey } from '@/config/apiConfig';

/**
 * API配置检查结果
 */
export interface APIConfigCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalConfigs: number;
    validConfigs: number;
    requiredConfigs: number;
    requiredValid: number;
  };
  details: Array<{
    name: string;
    status: 'valid' | 'invalid' | 'missing' | 'optional';
    description: string;
    value?: string;
  }>;
  recommendations: string[];
}

/**
 * 检查API配置
 */
export function checkAPIConfig(): APIConfigCheckResult {
  const config = getAPIConfig();
  const summary = getConfigSummary();
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 检查环境变量
  const envVars = {
    'VITE_OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY,
    'VITE_DEEPSEEK_API_KEY': import.meta.env.VITE_DEEPSEEK_API_KEY,
    'VITE_GEMINI_API_KEY': import.meta.env.VITE_GEMINI_API_KEY,
    'VITE_AUTHING_APP_ID': import.meta.env.VITE_AUTHING_APP_ID,
    'VITE_AUTHING_HOST': import.meta.env.VITE_AUTHING_HOST,
    'VITE_CREEM_API_KEY': import.meta.env.VITE_CREEM_API_KEY,
    'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
  };

  // 检查必需的环境变量
  if (!envVars['VITE_OPENAI_API_KEY']) {
    errors.push('VITE_OPENAI_API_KEY 未设置');
    recommendations.push('请在部署环境变量中设置 VITE_OPENAI_API_KEY');
  }

  if (!envVars['VITE_AUTHING_APP_ID']) {
    errors.push('VITE_AUTHING_APP_ID 未设置');
    recommendations.push('请在部署环境变量中设置 VITE_AUTHING_APP_ID');
  }

  if (!envVars['VITE_AUTHING_HOST']) {
    errors.push('VITE_AUTHING_HOST 未设置');
    recommendations.push('请在部署环境变量中设置 VITE_AUTHING_HOST');
  }

  // 检查可选的环境变量
  if (!envVars['VITE_DEEPSEEK_API_KEY']) {
    warnings.push('VITE_DEEPSEEK_API_KEY 未设置 - 将仅使用OpenAI');
    recommendations.push('建议设置 VITE_DEEPSEEK_API_KEY 作为备选AI服务');
  }

  if (!envVars['VITE_GEMINI_API_KEY']) {
    warnings.push('VITE_GEMINI_API_KEY 未设置 - 将仅使用OpenAI');
    recommendations.push('建议设置 VITE_GEMINI_API_KEY 作为备选AI服务');
  }

  if (!envVars['VITE_CREEM_API_KEY']) {
    warnings.push('VITE_CREEM_API_KEY 未设置 - 支付功能将不可用');
    recommendations.push('如需支付功能，请设置 VITE_CREEM_API_KEY');
  }

  if (!envVars['VITE_API_BASE_URL']) {
    warnings.push('VITE_API_BASE_URL 未设置 - 某些功能可能不可用');
    recommendations.push('建议设置 VITE_API_BASE_URL 指向后端API服务');
  }

  // 检查API密钥格式
  if (envVars['VITE_OPENAI_API_KEY'] && !isValidAPIKey(envVars['VITE_OPENAI_API_KEY'], 'openai')) {
    errors.push('VITE_OPENAI_API_KEY 格式无效');
    recommendations.push('OpenAI API密钥应以 sk- 开头，长度至少20个字符');
  }

  if (envVars['VITE_DEEPSEEK_API_KEY'] && !isValidAPIKey(envVars['VITE_DEEPSEEK_API_KEY'], 'deepseek')) {
    errors.push('VITE_DEEPSEEK_API_KEY 格式无效');
    recommendations.push('DeepSeek API密钥应以 sk- 开头，长度至少30个字符');
  }

  if (envVars['VITE_GEMINI_API_KEY'] && !isValidAPIKey(envVars['VITE_GEMINI_API_KEY'], 'gemini')) {
    errors.push('VITE_GEMINI_API_KEY 格式无效');
    recommendations.push('Gemini API密钥长度至少20个字符');
  }

  if (envVars['VITE_CREEM_API_KEY'] && !isValidAPIKey(envVars['VITE_CREEM_API_KEY'], 'creem')) {
    errors.push('VITE_CREEM_API_KEY 格式无效');
    recommendations.push('Creem API密钥应以 creem_ 开头');
  }

  // 检查环境配置
  if (config.environment.isProd && !config.backend.baseUrl) {
    warnings.push('生产环境缺少后端API配置');
    recommendations.push('生产环境建议配置完整的后端API服务');
  }

  // 生成详细配置信息
  const details = summary.details.map(detail => ({
    ...detail,
    value: getConfigValue(detail.name, config)
  }));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary,
    details,
    recommendations
  };
}

/**
 * 获取配置值（隐藏敏感信息）
 */
function getConfigValue(name: string, config: any): string {
  switch (name) {
    case 'OpenAI API':
      return config.openai.apiKey ? `${config.openai.apiKey.substring(0, 8)}...` : '未设置';
    case 'DeepSeek API':
      return config.deepseek.apiKey ? `${config.deepseek.apiKey.substring(0, 8)}...` : '未设置';
    case 'Gemini API':
      return config.gemini.apiKey ? `${config.gemini.apiKey.substring(0, 8)}...` : '未设置';
    case 'Authing认证':
      return config.authing.appId ? `${config.authing.appId.substring(0, 8)}...` : '未设置';
    case 'Creem支付':
      return config.creem.apiKey ? `${config.creem.apiKey.substring(0, 8)}...` : '未设置';
    case '后端API':
      return config.backend.baseUrl || '未设置';
    default:
      return '未知';
  }
}

/**
 * 生成配置状态摘要
 */
export function getConfigStatusSummary(): {
  status: 'success' | 'warning' | 'error';
  message: string;
  details: string[];
} {
  const result = checkAPIConfig();
  
  if (result.isValid && result.warnings.length === 0) {
    return {
      status: 'success',
      message: '✅ 所有API配置正确',
      details: ['所有必需的API配置已正确设置', '系统可以正常运行']
    };
  } else if (result.isValid && result.warnings.length > 0) {
    return {
      status: 'warning',
      message: '⚠️ API配置基本正确，但有一些警告',
      details: [
        '必需的API配置已设置',
        '系统可以正常运行',
        `但有 ${result.warnings.length} 个警告需要注意`
      ]
    };
  } else {
    return {
      status: 'error',
      message: '❌ API配置存在问题',
      details: [
        `发现 ${result.errors.length} 个错误`,
        `发现 ${result.warnings.length} 个警告`,
        '请修复配置问题后重新部署'
      ]
    };
  }
}

/**
 * 生成部署环境配置建议
 */
export function getDeploymentRecommendations(): {
  platform: string;
  variables: Array<{
    name: string;
    value: string;
    required: boolean;
    description: string;
  }>;
  instructions: string[];
}[] {
  return [
    {
      platform: 'Netlify',
      variables: [
        {
          name: 'VITE_OPENAI_API_KEY',
          value: 'sk-your-actual-openai-api-key',
          required: true,
          description: 'OpenAI API密钥'
        },
        {
          name: 'VITE_AUTHING_APP_ID',
          value: 'your-actual-authing-app-id',
          required: true,
          description: 'Authing应用ID'
        },
        {
          name: 'VITE_AUTHING_HOST',
          value: 'your-actual-authing-host',
          required: true,
          description: 'Authing域名'
        },
        {
          name: 'VITE_DEEPSEEK_API_KEY',
          value: 'sk-your-actual-deepseek-api-key',
          required: false,
          description: 'DeepSeek API密钥（可选）'
        },
        {
          name: 'VITE_GEMINI_API_KEY',
          value: 'your-actual-gemini-api-key',
          required: false,
          description: 'Gemini API密钥（可选）'
        },
        {
          name: 'VITE_CREEM_API_KEY',
          value: 'creem_your-actual-creem-api-key',
          required: false,
          description: 'Creem支付API密钥（可选）'
        },
        {
          name: 'VITE_API_BASE_URL',
          value: 'https://your-domain.com/api',
          required: false,
          description: '后端API基础URL（可选）'
        }
      ],
      instructions: [
        '1. 登录Netlify控制台',
        '2. 进入项目设置 → Environment variables',
        '3. 添加上述环境变量',
        '4. 重新部署项目'
      ]
    },
    {
      platform: 'Vercel',
      variables: [
        {
          name: 'VITE_OPENAI_API_KEY',
          value: 'sk-your-actual-openai-api-key',
          required: true,
          description: 'OpenAI API密钥'
        },
        {
          name: 'VITE_AUTHING_APP_ID',
          value: 'your-actual-authing-app-id',
          required: true,
          description: 'Authing应用ID'
        },
        {
          name: 'VITE_AUTHING_HOST',
          value: 'your-actual-authing-host',
          required: true,
          description: 'Authing域名'
        }
      ],
      instructions: [
        '1. 登录Vercel控制台',
        '2. 进入项目设置 → Environment Variables',
        '3. 添加上述环境变量',
        '4. 重新部署项目'
      ]
    }
  ];
}

/**
 * 验证单个API密钥
 */
export function validateAPIKey(apiKey: string, provider: 'openai' | 'deepseek' | 'gemini' | 'creem'): {
  isValid: boolean;
  error?: string;
} {
  if (!apiKey) {
    return {
      isValid: false,
      error: 'API密钥不能为空'
    };
  }

  if (!isValidAPIKey(apiKey, provider)) {
    switch (provider) {
      case 'openai':
        return {
          isValid: false,
          error: 'OpenAI API密钥应以 sk- 开头，长度至少20个字符'
        };
      case 'deepseek':
        return {
          isValid: false,
          error: 'DeepSeek API密钥应以 sk- 开头，长度至少30个字符'
        };
      case 'gemini':
        return {
          isValid: false,
          error: 'Gemini API密钥长度至少20个字符'
        };
      case 'creem':
        return {
          isValid: false,
          error: 'Creem API密钥应以 creem_ 开头'
        };
      default:
        return {
          isValid: false,
          error: 'API密钥格式无效'
        };
    }
  }

  return { isValid: true };
} 