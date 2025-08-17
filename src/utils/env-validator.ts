import { logger } from '@/utils/logger';
/**
 * 环境变量验证工具
 * 确保必需的环境变量在运行时存在
 */

/**
 * 必需的环境变量列表
 */
const REQUIRED_ENV_VARS = [
  'VITE_AUTHING_APP_ID',
  'VITE_AUTHING_HOST',
  'VITE_OPENAI_API_KEY'
] as const;

/**
 * 可选的环境变量列表
 */
const OPTIONAL_ENV_VARS = [
  'VITE_DEEPSEEK_API_KEY',
  'VITE_GEMINI_API_KEY',
  'VITE_CREEM_API_KEY',
  'VITE_API_BASE_URL',
  'VITE_DEBUG_MODE',
  'VITE_LOG_LEVEL'
] as const;

/**
 * 环境变量验证结果
 */
interface EnvValidationResult {
  /** 是否验证通过 */
  isValid: boolean;
  /** 缺失的必需变量 */
  missing: string[];
  /** 警告信息 */
  warnings: string[];
  /** 环境信息 */
  environment: {
    mode: string;
    isProduction: boolean;
    isDevelopment: boolean;
  };
}

/**
 * 验证环境变量
 */
export const validateEnvironmentVariables = (): EnvValidationResult => {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // 检查必需的环境变量
  REQUIRED_ENV_VARS.forEach(key => {
    const value = import.meta.env[key];
    if (!value || value === '') {
      missing.push(key);
    }
  });
  
  // 检查可选的环境变量
  OPTIONAL_ENV_VARS.forEach(key => {
    const value = import.meta.env[key];
    if (!value || value === '') {
      warnings.push(`可选环境变量 ${key} 未设置`);
    }
  });
  
  // 检查开发环境特定变量
  if (import.meta.env.DEV) {
    if (!import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV) {
      warnings.push('开发环境缺少 VITE_AUTHING_REDIRECT_URI_DEV');
    }
  }
  
  // 检查生产环境特定变量
  if (import.meta.env.PROD) {
    if (!import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD) {
      warnings.push('生产环境缺少 VITE_AUTHING_REDIRECT_URI_PROD');
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    environment: {
      mode: import.meta.env.MODE,
      isProduction: import.meta.env.PROD,
      isDevelopment: import.meta.env.DEV
    }
  };
};

/**
 * 验证并打印环境变量状态
 */
export const validateAndLogEnvironment = (): boolean => {
  const result = validateEnvironmentVariables();
  
  console.group('🔧 环境变量验证');
  console.log('环境模式:', result.environment.mode);
  console.log('是否生产环境:', result.environment.isProduction);
  console.log('是否开发环境:', result.environment.isDevelopment);
  
  if (result.isValid) {
    logger.debug('✅ 所有必需的环境变量都已设置');
  } else {
    console.error('❌ 缺少必需的环境变量:', result.missing);
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️ 警告:', result.warnings);
  }
  
  console.groupEnd();
  
  return result.isValid;
};

/**
 * 获取环境变量值（带类型安全）
 */
export const getEnvVar = <T extends string = string>(
  key: string, 
  defaultValue?: T
): T => {
  const value = import.meta.env[key];
  return (value || defaultValue) as T;
};

/**
 * 获取必需的环境变量值
 */
export const getRequiredEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`必需的环境变量 ${key} 未设置`);
  }
  return value;
};

/**
 * 检查是否为开发环境
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * 检查是否为生产环境
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

/**
 * 检查是否为预览环境
 */
export const isPreview = (): boolean => {
  return import.meta.env.MODE === 'preview';
};