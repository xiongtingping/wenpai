/**
 * API配置检查工具
 * 用于验证所有API配置是否正确设置
 */

import { getAPIConfig, isValidAPIKey } from '@/config/apiConfig';

/**
 * 配置检查结果接口
 */
export interface ConfigCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: {
    openai: { configured: boolean; valid: boolean };
    deepseek: { configured: boolean; valid: boolean };
    gemini: { configured: boolean; valid: boolean };
    authing: { configured: boolean; valid: boolean };
    backend: { configured: boolean; valid: boolean };
    payment: { configured: boolean; valid: boolean };
  };
}

/**
 * 检查API配置
 * @returns 配置检查结果
 */
export function checkAPIConfig(): ConfigCheckResult {
  const config = getAPIConfig();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 检查OpenAI配置
  const openaiConfigured = !!config.openai.apiKey;
  const openaiValid = isValidAPIKey(config.openai.apiKey, 'openai');
  
  if (!openaiConfigured && config.features.enableAI) {
    errors.push('OpenAI API密钥未配置 (VITE_OPENAI_API_KEY)');
  } else if (openaiConfigured && !openaiValid) {
    errors.push('OpenAI API密钥格式无效');
  }
  
  // 检查DeepSeek配置
  const deepseekConfigured = !!config.deepseek.apiKey;
  const deepseekValid = isValidAPIKey(config.deepseek.apiKey, 'deepseek');
  
  if (deepseekConfigured && !deepseekValid) {
    warnings.push('DeepSeek API密钥格式可能无效');
  }
  
  // 检查Gemini配置
  const geminiConfigured = !!config.gemini.apiKey;
  const geminiValid = isValidAPIKey(config.gemini.apiKey, 'gemini');
  
  if (geminiConfigured && !geminiValid) {
    warnings.push('Gemini API密钥格式可能无效');
  }
  
  // 检查Authing配置
  const authingConfigured = !!(config.authing.appId && config.authing.host);
  const authingValid = authingConfigured && !!config.authing.redirectUri;
  
  if (!authingConfigured) {
    errors.push('Authing配置不完整 (需要VITE_AUTHING_APP_ID和VITE_AUTHING_HOST)');
  } else if (!authingValid) {
    errors.push('Authing回调地址未配置');
  }
  
  // 检查后端API配置
  const backendConfigured = !!config.backend.baseUrl;
  const backendValid = backendConfigured && config.backend.baseUrl.startsWith('http');
  
  if (!backendConfigured) {
    errors.push('后端API基础URL未配置 (VITE_API_BASE_URL)');
  } else if (!backendValid) {
    errors.push('后端API基础URL格式无效');
  }
  
  // 检查支付配置
  const alipayConfigured = !!(config.payment.alipay.appId && config.payment.alipay.publicKey);
  const wechatConfigured = !!(config.payment.wechat.appId && config.payment.wechat.mchId);
  const paymentConfigured = alipayConfigured || wechatConfigured;
  
  if (!paymentConfigured) {
    warnings.push('支付配置未设置 (支付宝或微信支付)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config: {
      openai: { configured: openaiConfigured, valid: openaiValid },
      deepseek: { configured: deepseekConfigured, valid: deepseekValid },
      gemini: { configured: geminiConfigured, valid: geminiValid },
      authing: { configured: authingConfigured, valid: authingValid },
      backend: { configured: backendConfigured, valid: backendValid },
      payment: { configured: paymentConfigured, valid: paymentConfigured }
    }
  };
}

/**
 * 获取配置状态摘要
 * @returns 配置状态摘要
 */
export function getConfigSummary(): string {
  const result = checkAPIConfig();
  const config = getAPIConfig();
  
  let summary = '🔧 API配置状态:\n';
  
  // 环境信息
  summary += `\n🌍 环境: ${config.environment.isDev ? '开发' : '生产'}`;
  summary += `\n🔍 调试模式: ${config.environment.debugMode ? '开启' : '关闭'}`;
  
  // AI服务状态
  summary += '\n\n🤖 AI服务:';
  summary += `\n  OpenAI: ${result.config.openai.configured ? (result.config.openai.valid ? '✅ 已配置' : '⚠️ 格式错误') : '❌ 未配置'}`;
  summary += `\n  DeepSeek: ${result.config.deepseek.configured ? (result.config.deepseek.valid ? '✅ 已配置' : '⚠️ 格式错误') : '❌ 未配置'}`;
  summary += `\n  Gemini: ${result.config.gemini.configured ? (result.config.gemini.valid ? '✅ 已配置' : '⚠️ 格式错误') : '❌ 未配置'}`;
  
  // 认证服务状态
  summary += '\n\n🔐 认证服务:';
  summary += `\n  Authing: ${result.config.authing.configured ? (result.config.authing.valid ? '✅ 已配置' : '⚠️ 回调地址缺失') : '❌ 未配置'}`;
  
  // 后端服务状态
  summary += '\n\n🔧 后端服务:';
  summary += `\n  API: ${result.config.backend.configured ? (result.config.backend.valid ? '✅ 已配置' : '⚠️ 格式错误') : '❌ 未配置'}`;
  
  // 支付服务状态
  summary += '\n\n💳 支付服务:';
  summary += `\n  支付: ${result.config.payment.configured ? '✅ 已配置' : '❌ 未配置'}`;
  
  // 错误和警告
  if (result.errors.length > 0) {
    summary += '\n\n❌ 错误:';
    result.errors.forEach(error => {
      summary += `\n  - ${error}`;
    });
  }
  
  if (result.warnings.length > 0) {
    summary += '\n\n⚠️ 警告:';
    result.warnings.forEach(warning => {
      summary += `\n  - ${warning}`;
    });
  }
  
  return summary;
}

/**
 * 验证特定API配置
 * @param provider API提供商
 * @returns 验证结果
 */
export function validateAPIProvider(provider: 'openai' | 'deepseek' | 'gemini'): {
  configured: boolean;
  valid: boolean;
  message: string;
} {
  const config = getAPIConfig();
  
  switch (provider) {
    case 'openai':
      const openaiConfigured = !!config.openai.apiKey;
      const openaiValid = isValidAPIKey(config.openai.apiKey, 'openai');
      return {
        configured: openaiConfigured,
        valid: openaiValid,
        message: openaiConfigured 
          ? (openaiValid ? 'OpenAI API已正确配置' : 'OpenAI API密钥格式无效')
          : 'OpenAI API密钥未配置'
      };
      
    case 'deepseek':
      const deepseekConfigured = !!config.deepseek.apiKey;
      const deepseekValid = isValidAPIKey(config.deepseek.apiKey, 'deepseek');
      return {
        configured: deepseekConfigured,
        valid: deepseekValid,
        message: deepseekConfigured 
          ? (deepseekValid ? 'DeepSeek API已正确配置' : 'DeepSeek API密钥格式无效')
          : 'DeepSeek API密钥未配置'
      };
      
    case 'gemini':
      const geminiConfigured = !!config.gemini.apiKey;
      const geminiValid = isValidAPIKey(config.gemini.apiKey, 'gemini');
      return {
        configured: geminiConfigured,
        valid: geminiValid,
        message: geminiConfigured 
          ? (geminiValid ? 'Gemini API已正确配置' : 'Gemini API密钥格式无效')
          : 'Gemini API密钥未配置'
      };
      
    default:
      return {
        configured: false,
        valid: false,
        message: '未知的API提供商'
      };
  }
}

/**
 * 获取配置建议
 * @returns 配置建议列表
 */
export function getConfigSuggestions(): string[] {
  const result = checkAPIConfig();
  const suggestions: string[] = [];
  
  if (!result.config.openai.configured) {
    suggestions.push('配置OpenAI API密钥以启用AI功能');
  }
  
  if (!result.config.authing.configured) {
    suggestions.push('配置Authing认证服务以启用用户登录');
  }
  
  if (!result.config.backend.configured) {
    suggestions.push('配置后端API地址以启用完整功能');
  }
  
  if (!result.config.payment.configured) {
    suggestions.push('配置支付服务以启用付费功能');
  }
  
  if (result.config.openai.configured && !result.config.deepseek.configured) {
    suggestions.push('考虑配置DeepSeek API作为备用AI服务');
  }
  
  return suggestions;
}

/**
 * 导出默认检查函数
 */
export default checkAPIConfig; 