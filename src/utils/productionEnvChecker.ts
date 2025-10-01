import { logger } from '@/utils/logger';
/**
 * 🚨 生产环境配置检查器
 * 专门检查生产环境中可能导致 undefinedundefined 问题的配置差异
 */

interface EnvCheckResult {
  key: string;
  value: string;
  isValid: boolean;
  issue?: string;
  suggestion?: string;
}

class ProductionEnvChecker {
  private isProduction: boolean;
  private checkResults: EnvCheckResult[] = [];

  constructor() {
    this.isProduction = !!(import.meta as any).env?.PROD ||
                       window.location.hostname !== 'localhost';

    if (this.isProduction) {
      this.performCheck();
    }
  }

  /**
   * 执行生产环境检查
   */
  private performCheck(): void {
    console.log('🔍 startsproducing环境configurationchecking...');

    // 检查 Authing 配置
    this.checkAuthingConfig();

    // 检查 API 配置
    this.checkApiConfig();

    // 检查环境变量
    this.checkEnvironmentVariables();

    // 输出检查结果
    this.reportResults();
  }

  /**
   * 检查 Authing 配置
   */
  private checkAuthingConfig(): void {
    const authingChecks = [
      {
        key: 'VITE_AUTHING_APP_ID',
        value: import.meta.env.VITE_AUTHING_APP_ID,
        validator: (val: string) => val && val.length > 10 && !val.includes('undefined')
      },
      {
        key: 'VITE_AUTHING_DOMAIN',
        value: import.meta.env.VITE_AUTHING_DOMAIN,
        validator: (val: string) => val && val.includes('.authing.cn') && !val.includes('undefined')
      },
      {
        key: 'VITE_AUTHING_HOST',
        value: import.meta.env.VITE_AUTHING_HOST,
        validator: (val: string) => val && val.startsWith('https://') && !val.includes('undefined')
      }
    ];

    authingChecks.forEach(check => {
      const isValid = !!check.validator((check.value as string) || '');
      this.checkResults.push({
        key: check.key,
        value: (check.value as string) || 'undefined',
        isValid: !!isValid,
        issue: !isValid ? '配置无效或包含 undefined' : undefined,
        suggestion: !isValid ? '检查 Netlify 环境变量配置' : undefined
      });
    });
  }

  /**
   * 检查 API 配置
   */
  private checkApiConfig(): void {
    const apiChecks = [
      {
        key: 'VITE_OPENAI_API_KEY',
        value: import.meta.env.VITE_OPENAI_API_KEY,
        validator: (val: string) => !val || val.startsWith('sk-') && !val.includes('undefined')
      },
      {
        key: 'VITE_DEEPSEEK_API_KEY',
        value: import.meta.env.VITE_DEEPSEEK_API_KEY,
        validator: (val: string) => !val || val.startsWith('sk-') && !val.includes('undefined')
      }
    ];

    apiChecks.forEach(check => {
      const isValid = check.validator(check.value || '');
      this.checkResults.push({
        key: check.key,
        value: check.value ? '***已设置***' : 'undefined',
        isValid,
        issue: !isValid ? 'API 密钥格式错误或包含 undefined' : undefined,
        suggestion: !isValid ? '检查 API 密钥格式' : undefined
      });
    });
  }

  /**
   * 检查环境变量
   */
  private checkEnvironmentVariables(): void {
    // 检查是否有环境变量包含 undefined 字符串
    const envVars = import.meta.env;
    
    Object.keys(envVars).forEach(key => {
      const value = envVars[key];
      
      if (typeof value === 'string' && value.includes('undefined')) {
        this.checkResults.push({
          key,
          value: value,
          isValid: false,
          issue: '环境变量包含 undefined 字符串',
          suggestion: '检查环境变量配置，移除 undefined 值'
        });
      }
    });
  }

  /**
   * 输出检查结果
   */
  private reportResults(): void {
    const errors = this.checkResults.filter(r => !r.isValid);
    
    if (errors.length > 0) {
      console.group('🚨 生产环境配置问题');
      console.warn('发现以downconfiguration问题，可能导致 undefinedundefined 问题：');
      
      errors.forEach(error => {
        console.warn(`❌ ${error.key}:`, {
          value: error.value,
          issue: error.issue,
          suggestion: error.suggestion
        });
      });
      
      console.groupEnd();
      
      // 在页面上显示警告（仅生产环境的开发者工具）
      this.showProductionWarning(errors);
    } else {
      logger.debug('✅ 生产环境配置检查通过');
    }
  }

  /**
   * 在页面上显示生产环境警告
   */
  private showProductionWarning(errors: EnvCheckResult[]): void {
    // 只在控制台显示，不在页面上显示（避免影响用户体验）
    console.warn('🔧 producing环境configuration建议：');
    errors.forEach(error => {
      console.warn(`- fixing ${error.key}: ${error.suggestion}`);
    });
  }

  /**
   * 获取检查结果
   */
  public getResults(): EnvCheckResult[] {
    return this.checkResults;
  }

  /**
   * 检查是否有错误
   */
  public hasErrors(): boolean {
    return this.checkResults.some(r => !r.isValid);
  }

  /**
   * 获取错误数量
   */
  public getErrorCount(): number {
    return this.checkResults.filter(r => !r.isValid).length;
  }
}

/**
 * 生产环境安全字符串处理函数
 */
export function safeProductionString(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  const str = String(value);
  
  // 生产环境特殊处理
  if (import.meta.env.PROD) {
    // 移除所有 undefined 字符串
    const cleaned = str.replace(/undefined/g, '').replace(/null/g, '').trim();
    return cleaned || fallback;
  }

  return str;
}

/**
 * 生产环境安全对象属性访问
 */
export function safeProductionAccess<T>(obj: any, path: string, fallback: T): T {
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return fallback;
      }
      current = current[key];
    }
    
    // 生产环境额外检查
    if (import.meta.env.PROD && typeof current === 'string') {
      if (current.includes('undefined')) {
        return fallback;
      }
    }
    
    return current !== undefined ? current : fallback;
  } catch {
    return fallback;
  }
}

/**
 * 生产环境用户信息安全处理
 */
export function safeProductionUserInfo(user: any): any {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const safeUser = { ...user };

  // 清理可能的 undefined 字符串
  ['nickname', 'username', 'email', 'avatar', 'photo'].forEach(key => {
    if (typeof safeUser[key] === 'string') {
      safeUser[key] = safeUser[key].replace(/undefined/g, '').trim() || null;
    }
  });

  return safeUser;
}

// 全局实例
declare global {
  interface Window {
    productionEnvChecker?: ProductionEnvChecker;
  }
}

// 自动启动（仅在生产环境）
if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
  window.productionEnvChecker = new ProductionEnvChecker();
}

export default ProductionEnvChecker;
