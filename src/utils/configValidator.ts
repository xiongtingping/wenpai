/**
 * 配置验证工具
 * 用于检查和修复API配置问题
 */

import { getAPIConfig, isValidAPIKey } from '@/config/apiConfig';

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  isValid: boolean;
  missingConfigs: string[];
  invalidConfigs: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * 验证所有API配置
 */
export function validateAllConfigs(): ConfigValidationResult {
  const config = getAPIConfig();
  const result: ConfigValidationResult = {
    isValid: true,
    missingConfigs: [],
    invalidConfigs: [],
    warnings: [],
    suggestions: []
  };

  // 检查OpenAI配置
  if (!config.openai.apiKey) {
    result.missingConfigs.push('OpenAI API Key');
    result.isValid = false;
  } else if (!isValidAPIKey(config.openai.apiKey, 'openai')) {
    result.invalidConfigs.push('OpenAI API Key');
    result.isValid = false;
  }

  // 检查Authing配置
  if (!config.authing.appId) {
    result.missingConfigs.push('Authing App ID');
    result.isValid = false;
  }

  if (!config.authing.host) {
    result.missingConfigs.push('Authing Host');
    result.isValid = false;
  }

  // 检查Creem配置（可选）
  if (!config.creem.apiKey) {
    result.warnings.push('Creem API Key未配置，支付功能可能不可用');
  } else if (!isValidAPIKey(config.creem.apiKey, 'creem')) {
    result.invalidConfigs.push('Creem API Key');
  }

  // 检查DeepSeek配置（可选）
  if (!config.deepseek.apiKey) {
    result.warnings.push('DeepSeek API Key未配置，将使用OpenAI作为备选');
  } else if (!isValidAPIKey(config.deepseek.apiKey, 'deepseek')) {
    result.invalidConfigs.push('DeepSeek API Key');
  }

  // 生成建议
  if (result.missingConfigs.length > 0) {
    result.suggestions.push('请在.env.local文件中配置缺失的API密钥');
  }

  if (result.invalidConfigs.length > 0) {
    result.suggestions.push('请检查API密钥格式是否正确');
  }

  if (!result.isValid) {
    result.suggestions.push('建议访问 https://platform.openai.com/api-keys 获取OpenAI API密钥');
    result.suggestions.push('建议检查Authing控制台配置是否正确');
  }

  return result;
}

/**
 * 显示配置验证结果
 */
export function displayConfigValidation(): void {
  const result = validateAllConfigs();
  
  console.group('🔧 API配置验证结果');
  
  if (result.isValid) {
    console.log('✅ 所有必需配置已正确设置');
  } else {
    console.error('❌ 发现配置问题：');
    if (result.missingConfigs.length > 0) {
      console.error('  缺失配置:', result.missingConfigs.join(', '));
    }
    if (result.invalidConfigs.length > 0) {
      console.error('  无效配置:', result.invalidConfigs.join(', '));
    }
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  警告:', result.warnings.join(', '));
  }

  if (result.suggestions.length > 0) {
    console.log('💡 建议:', result.suggestions.join(', '));
  }

  console.groupEnd();
}

/**
 * 全局配置验证函数
 * 在window对象上暴露，供浏览器控制台调用
 */
export function setupGlobalConfigValidation(): void {
  if (typeof window !== 'undefined') {
    (window as any).__validateConfig__ = () => {
      const result = validateAllConfigs();
      
      if (!result.isValid) {
        console.error('⚠️ 缺少必需的配置:', result.missingConfigs.join(', '));
        console.error('请确保在生产环境中正确设置了环境变量');
        return false;
      }
      
      console.log('✅ 配置验证通过');
      return true;
    };

    // 自动验证
    if (import.meta.env.DEV) {
      displayConfigValidation();
    }
  }
}

/**
 * 获取配置状态摘要
 */
export function getConfigStatus(): {
  openai: boolean;
  authing: boolean;
  creem: boolean;
  deepseek: boolean;
  overall: boolean;
} {
  const config = getAPIConfig();
  
  return {
    openai: !!(config.openai.apiKey && isValidAPIKey(config.openai.apiKey, 'openai')),
    authing: !!(config.authing.appId && config.authing.host),
    creem: !!(config.creem.apiKey && isValidAPIKey(config.creem.apiKey, 'creem')),
    deepseek: !!(config.deepseek.apiKey && isValidAPIKey(config.deepseek.apiKey, 'deepseek')),
    overall: !!(config.openai.apiKey && config.authing.appId && config.authing.host)
  };
} 