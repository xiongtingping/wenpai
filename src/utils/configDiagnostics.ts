/**
 * 配置诊断工具
 * 帮助识别和解决配置问题
 */

import { getAPIConfig, getConfigSummary } from '../config/apiConfig';

/**
 * 配置诊断结果
 */
export interface ConfigDiagnostic {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details: string[];
  suggestions: string[];
}

/**
 * 运行配置诊断
 */
export function runConfigDiagnostics(): ConfigDiagnostic[] {
  const diagnostics: ConfigDiagnostic[] = [];
  const config = getAPIConfig();
  const summary = getConfigSummary();

  // 检查OpenAI配置
  if (!config.openai.apiKey) {
    diagnostics.push({
      status: 'warning',
      message: 'OpenAI API密钥未配置',
      details: [
        'AI功能可能无法正常工作',
        '需要在环境变量中设置VITE_OPENAI_API_KEY'
      ],
      suggestions: [
        '在.env.local文件中添加VITE_OPENAI_API_KEY=your-api-key',
        '或在Netlify环境变量中设置',
        '或联系管理员配置API密钥'
      ]
    });
  }

  // 检查Authing配置
  if (!config.authing.appId || !config.authing.host) {
    diagnostics.push({
      status: 'error',
      message: 'Authing认证配置不完整',
      details: [
        '用户登录功能无法正常工作',
        '缺少App ID或Host配置'
      ],
      suggestions: [
        '检查VITE_AUTHING_APP_ID配置',
        '检查VITE_AUTHING_HOST配置',
        '确保Authing控制台配置正确'
      ]
    });
  }

  // 检查支付配置
  if (!config.creem.apiKey) {
    diagnostics.push({
      status: 'warning',
      message: 'Creem支付配置未设置',
      details: [
        '支付功能可能无法正常工作',
        '需要在环境变量中设置VITE_CREEM_API_KEY'
      ],
      suggestions: [
        '在.env.local文件中添加VITE_CREEM_API_KEY=your-api-key',
        '或在Netlify环境变量中设置',
        '或联系管理员配置支付密钥'
      ]
    });
  }

  // 检查环境配置
  if (config.environment.isProd && config.environment.debugMode) {
    diagnostics.push({
      status: 'warning',
      message: '生产环境启用了调试模式',
      details: [
        '可能暴露敏感信息',
        '影响性能'
      ],
      suggestions: [
        '设置VITE_DEBUG_MODE=false',
        '确保生产环境安全配置'
      ]
    });
  }

  // 检查功能开关
  if (!config.features.enableAI) {
    diagnostics.push({
      status: 'warning',
      message: 'AI功能已禁用',
      details: [
        'AI相关功能无法使用',
        'VITE_ENABLE_AI_FEATURES设置为false'
      ],
      suggestions: [
        '设置VITE_ENABLE_AI_FEATURES=true启用AI功能',
        '或联系管理员启用AI功能'
      ]
    });
  }

  return diagnostics;
}

/**
 * 生成配置诊断报告
 */
export function generateConfigReport(): string {
  const diagnostics = runConfigDiagnostics();
  const summary = getConfigSummary();
  
  let report = '📋 配置诊断报告\n';
  report += '='.repeat(50) + '\n\n';
  
  // 配置统计
  report += `📊 配置统计:\n`;
  report += `- 总配置项: ${summary.totalConfigs}\n`;
  report += `- 有效配置: ${summary.validConfigs}\n`;
  report += `- 必需配置: ${summary.requiredConfigs}\n`;
  report += `- 必需有效: ${summary.requiredValid}\n\n`;
  
  // 诊断结果
  if (diagnostics.length === 0) {
    report += '✅ 所有配置正常，无需修复\n';
  } else {
    report += `⚠️ 发现 ${diagnostics.length} 个配置问题:\n\n`;
    
    diagnostics.forEach((diagnostic, index) => {
      const statusIcon = diagnostic.status === 'error' ? '❌' : '⚠️';
      report += `${index + 1}. ${statusIcon} ${diagnostic.message}\n`;
      report += `   详情: ${diagnostic.details.join(', ')}\n`;
      report += `   建议: ${diagnostic.suggestions.join(', ')}\n\n`;
    });
  }
  
  return report;
}

/**
 * 检查特定配置项
 */
export function checkSpecificConfig(configKey: string): ConfigDiagnostic | null {
  const config = getAPIConfig();
  
  switch (configKey) {
    case 'openai':
      if (!config.openai.apiKey) {
        return {
          status: 'warning',
          message: 'OpenAI配置缺失',
          details: ['API密钥未设置'],
          suggestions: ['设置VITE_OPENAI_API_KEY环境变量']
        };
      }
      break;
      
    case 'authing':
      if (!config.authing.appId || !config.authing.host) {
        return {
          status: 'error',
          message: 'Authing配置不完整',
          details: ['App ID或Host未设置'],
          suggestions: ['设置VITE_AUTHING_APP_ID和VITE_AUTHING_HOST']
        };
      }
      break;
      
    case 'creem':
      if (!config.creem.apiKey) {
        return {
          status: 'warning',
          message: 'Creem支付配置缺失',
          details: ['API密钥未设置'],
          suggestions: ['设置VITE_CREEM_API_KEY环境变量']
        };
      }
      break;
  }
  
  return null;
}

/**
 * 获取配置修复建议
 */
export function getConfigFixSuggestions(): string[] {
  const diagnostics = runConfigDiagnostics();
  const suggestions: string[] = [];
  
  diagnostics.forEach(diagnostic => {
    suggestions.push(...diagnostic.suggestions);
  });
  
  return [...new Set(suggestions)]; // 去重
}

/**
 * 验证配置是否可用
 */
export function validateConfig(): boolean {
  const diagnostics = runConfigDiagnostics();
  return !diagnostics.some(d => d.status === 'error');
} 