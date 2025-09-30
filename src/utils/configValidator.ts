// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { logger } from '@/utils/logger';
// 动态导入避免TDZ错误
// import { getRequestClient } from './requestClientRegistry';
/**
 * 全局配置验证器
 * 用于验证应用运行所需的配置和环境
 */

/**
 * 配置验证结果接口
 */
interface ConfigValidationResult {
  isValid: boolean;
  missingConfigs: string[];
  warnings: string[];
  errors: string[];
  networkStatus: {
    online: boolean;
    apiEndpoint: string;
    canConnect: boolean;
  };
}

/**
 * 验证所有必需的配置
 * @returns {ConfigValidationResult} 验证结果
 */
export async function validateAllConfigs(): Promise<ConfigValidationResult> {
  const result: ConfigValidationResult = {
    isValid: true,
    missingConfigs: [],
    warnings: [],
    errors: [],
    networkStatus: {
      online: navigator.onLine,
      apiEndpoint: '',
      canConnect: false
    }
  };

  // 检查网络连接
  if (!navigator.onLine) {
    result.errors.push(i18n.t('utils.errors.网络连接不可用'));
    result.isValid = false;
  }

  // 检查OpenAI配置
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!openaiKey) {
    result.missingConfigs.push('OpenAI API Key');
    result.warnings.push('AI功能将不可用');
  }

  // 检查Authing配置
  const authingAppId = import.meta.env.VITE_AUTHING_APP_ID;
  if (!authingAppId) {
    result.missingConfigs.push('Authing App ID');
    result.warnings.push(i18n.t('utils.errors.用户认证功能将不可用'));
  }

  // 检查Creem支付配置
  const creemApiKey = import.meta.env.VITE_CREEM_API_KEY;
  if (!creemApiKey) {
    result.missingConfigs.push('Creem API Key');
    result.warnings.push(i18n.t('utils.errors.支付功能将不可用'));
  }

  // 测试支付API连接
  try {
    const apiEndpoint = getPaymentAPIEndpoint();
    result.networkStatus.apiEndpoint = apiEndpoint;

    // 测试API连接
    try {
      // 动态导入避免TDZ错误
      const { getRequestClient } = await import('./requestClientRegistry');
      const client = getRequestClient();
      await client.request({ url: apiEndpoint, method: 'OPTIONS', validateStatus: () => true });
      result.networkStatus.canConnect = true;
    } catch {
      result.networkStatus.canConnect = false;
    }

    // 统一 request 已尝试连接（validateStatus 委托总是返回 true），此处不再依赖 response
    // 如果需要更细日志，可在后端记录
    // 连接失败的情况已在 catch 中处理
  } catch (error: any) {
    result.networkStatus.canConnect = false;
    result.errors.push(`支付API连接错误: ${error.message}`);
    result.isValid = false;
  }

  // 如果有缺失的配置，标记为无效
  if (result.missingConfigs.length > 0) {
    result.isValid = false;
  }

  return result;
}

/**
 * 获取支付API端点
 * @returns {string} API端点URL
 */
function getPaymentAPIEndpoint(): string {
  if (import.meta.env.PROD) {
    return '/.netlify/functions/checkout';
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5173/.netlify/functions/checkout';
  }

  return '/.netlify/functions/checkout';
}

/**
 * 验证特定配置
 * @param configName 配置名称
 * @returns {boolean} 是否有效
 */
export function validateConfig(configName: string): boolean {
  const configMap: Record<string, string> = {
    'openai': import.meta.env.VITE_OPENAI_API_KEY,
    'authing': import.meta.env.VITE_AUTHING_APP_ID,
    'creem': import.meta.env.VITE_CREEM_API_KEY,
  };

  return !!configMap[configName];
}

/**
 * 获取配置状态摘要
 * @returns {string} 配置状态摘要
 */
export function getConfigSummary(): string {
  const openaiValid = validateConfig('openai');
  const authingValid = validateConfig('authing');
  const creemValid = validateConfig('creem');
  const networkValid = navigator.onLine;

  const status = {
    'AI服务': openaiValid ? '✅' : '❌',
    '用户认证': authingValid ? '✅' : '❌',
    '支付服务': creemValid ? '✅' : '❌',
    '网络连接': networkValid ? '✅' : '❌',
  };

  return Object.entries(status)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ');
}

/**
 * 初始化配置验证
 * 在应用启动时自动运行
 */
export function initializeConfigValidation(): void {
  logger.debug('🔧 开始验证应用配置...');

  validateAllConfigs().then(result => {
    console.log('📋 配置验证结果:', result);

    if (!result.isValid) {
      console.warn('⚠️ 配置验证失败:', {
        missing: result.missingConfigs,
        warnings: result.warnings,
        errors: result.errors
      });
    } else {
      logger.debug('✅ 配置验证通过');
    }

    console.log('🌐 网络状态:', result.networkStatus);
  }).catch(error => {
    console.error('❌ 配置验证过程出错:', error);
  });
}

// 在浏览器控制台暴露验证函数
if (typeof window !== 'undefined') {
  (window as any).__validateConfig__ = validateAllConfigs;
  (window as any).__validateSpecificConfig__ = validateConfig;
  (window as any).__getConfigSummary__ = getConfigSummary;
}
