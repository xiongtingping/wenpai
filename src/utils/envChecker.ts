/**
 * 环境变量配置检查工具
 * 用于验证所有必需的API密钥和配置是否正确设置
 */

/**
 * 环境变量检查结果
 */
export interface EnvCheckResult {
  name: string;
  value: string;
  isValid: boolean;
  message: string;
  required: boolean;
}

/**
 * 环境变量配置检查器
 */
export class EnvChecker {
  private static checkCache: {
    results: EnvCheckResult[];
    timestamp: number;
    isValid: boolean;
  } | null = null;
  
  private static readonly CACHE_DURATION = 30000; // 30秒缓存

  /**
   * 检查所有环境变量配置
   */
  static checkAllConfigs(): EnvCheckResult[] {
    // 检查缓存是否有效
    if (this.checkCache && (Date.now() - this.checkCache.timestamp) < this.CACHE_DURATION) {
      return this.checkCache.results;
    }

    const results: EnvCheckResult[] = [];

    // 检查OpenAI API密钥
    results.push(this.checkOpenAIKey());
    
    // 检查Creem支付API密钥
    results.push(this.checkCreemKey());
    
    // 检查Authing配置
    results.push(this.checkAuthingAppId());
    results.push(this.checkAuthingHost());
    
    // 检查其他配置
    results.push(this.checkDevMode());
    results.push(this.checkApiTimeout());
    results.push(this.checkEncryptionKey());

    // 更新缓存
    this.checkCache = {
      results,
      timestamp: Date.now(),
      isValid: !this.hasCriticalErrors(results)
    };

    return results;
  }

  /**
   * 检查OpenAI API密钥
   */
  static checkOpenAIKey(): EnvCheckResult {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    const isValid = key && key !== 'sk-your-openai-api-key-here' && key.startsWith('sk-');
    
    return {
      name: 'VITE_OPENAI_API_KEY',
      value: key ? `${key.substring(0, 10)}...` : '未设置',
      isValid,
      message: isValid ? 'OpenAI API密钥配置正确' : '请设置有效的OpenAI API密钥',
      required: true
    };
  }

  /**
   * 检查Creem支付API密钥
   */
  static checkCreemKey(): EnvCheckResult {
    const key = import.meta.env.VITE_CREEM_API_KEY;
    const isValid = key && key.startsWith('creem_');
    
    return {
      name: 'VITE_CREEM_API_KEY',
      value: key ? `${key.substring(0, 10)}...` : '未设置',
      isValid,
      message: isValid ? 'Creem支付API密钥配置正确' : '请设置有效的Creem支付API密钥',
      required: true
    };
  }

  /**
   * 检查Authing应用ID
   */
  static checkAuthingAppId(): EnvCheckResult {
    const appId = import.meta.env.VITE_AUTHING_APP_ID;
    const isValid = appId && appId.length > 0;
    
    return {
      name: 'VITE_AUTHING_APP_ID',
      value: appId || '未设置',
      isValid,
      message: isValid ? 'Authing应用ID配置正确' : '请设置Authing应用ID',
      required: true
    };
  }

  /**
   * 检查Authing域名
   */
  static checkAuthingHost(): EnvCheckResult {
    const host = import.meta.env.VITE_AUTHING_HOST;
    const isValid = host && host.startsWith('https://');
    
    return {
      name: 'VITE_AUTHING_HOST',
      value: host || '未设置',
      isValid,
      message: isValid ? 'Authing域名配置正确' : '请设置有效的Authing域名',
      required: true
    };
  }

  /**
   * 检查开发模式
   */
  static checkDevMode(): EnvCheckResult {
    const devMode = import.meta.env.VITE_DEV_MODE;
    const isValid = devMode === 'true' || devMode === 'false';
    
    return {
      name: 'VITE_DEV_MODE',
      value: devMode || '未设置',
      isValid,
      message: isValid ? '开发模式配置正确' : '请设置开发模式（true/false）',
      required: false
    };
  }

  /**
   * 检查API超时配置
   */
  static checkApiTimeout(): EnvCheckResult {
    const timeout = import.meta.env.VITE_API_TIMEOUT;
    const isValid = timeout && !isNaN(Number(timeout)) && Number(timeout) > 0;
    
    return {
      name: 'VITE_API_TIMEOUT',
      value: timeout || '未设置',
      isValid,
      message: isValid ? 'API超时配置正确' : '请设置有效的API超时时间（毫秒）',
      required: false
    };
  }

  /**
   * 检查加密密钥
   */
  static checkEncryptionKey(): EnvCheckResult {
    const key = import.meta.env.VITE_ENCRYPTION_KEY;
    const isValid = key && key.length >= 32;
    
    return {
      name: 'VITE_ENCRYPTION_KEY',
      value: key ? `${key.substring(0, 10)}...` : '未设置',
      isValid,
      message: isValid ? '加密密钥配置正确' : '请设置至少32位的加密密钥',
      required: false
    };
  }

  /**
   * 获取配置摘要
   */
  static getConfigSummary(): {
    total: number;
    valid: number;
    invalid: number;
    required: number;
    requiredValid: number;
  } {
    const results = this.checkAllConfigs();
    const total = results.length;
    const valid = results.filter(r => r.isValid).length;
    const invalid = total - valid;
    const required = results.filter(r => r.required).length;
    const requiredValid = results.filter(r => r.required && r.isValid).length;

    return {
      total,
      valid,
      invalid,
      required,
      requiredValid
    };
  }

  /**
   * 检查是否有严重配置错误
   */
  static hasCriticalErrors(results?: EnvCheckResult[]): boolean {
    const configResults = results || this.checkAllConfigs();
    return configResults.some(r => r.required && !r.isValid);
  }

  /**
   * 清除缓存，强制重新检查
   */
  static clearCache(): void {
    this.checkCache = null;
  }

  /**
   * 获取缓存状态
   */
  static getCacheStatus(): { hasCache: boolean; age: number } {
    if (!this.checkCache) {
      return { hasCache: false, age: 0 };
    }
    return {
      hasCache: true,
      age: Date.now() - this.checkCache.timestamp
    };
  }

  /**
   * 生成配置报告
   */
  static generateReport(): string {
    const results = this.checkAllConfigs();
    const summary = this.getConfigSummary();
    
    let report = '=== 环境变量配置检查报告 ===\n\n';
    
    // 配置摘要
    report += `配置总数: ${summary.total}\n`;
    report += `有效配置: ${summary.valid}\n`;
    report += `无效配置: ${summary.invalid}\n`;
    report += `必需配置: ${summary.required}\n`;
    report += `必需配置有效: ${summary.requiredValid}\n\n`;
    
    // 详细结果
    report += '详细检查结果:\n';
    results.forEach(result => {
      const status = result.isValid ? '✅' : '❌';
      const required = result.required ? '[必需]' : '[可选]';
      report += `${status} ${required} ${result.name}: ${result.value}\n`;
      report += `    ${result.message}\n\n`;
    });
    
    // 建议
    if (summary.requiredValid < summary.required) {
      report += '⚠️  警告: 存在必需的配置错误，请修复后重新启动应用\n';
    }
    
    return report;
  }
}

/**
 * 在控制台输出配置检查结果
 */
export function logEnvCheckResults(): void {
  // 检查是否已经输出过
  if ((window as any).__envCheckLogged) {
    return;
  }
  
  console.log('🔍 开始检查环境变量配置...');
  console.log(EnvChecker.generateReport());
  
  if (EnvChecker.hasCriticalErrors()) {
    console.error('❌ 发现严重配置错误，请检查.env.local文件');
  } else {
    console.log('✅ 环境变量配置检查完成');
  }
  
  // 标记已输出
  (window as any).__envCheckLogged = true;
}

/**
 * 在开发环境下自动检查配置（仅执行一次）
 */
if (import.meta.env.DEV && !(window as any).__envCheckInitialized) {
  // 延迟执行，确保环境变量已加载
  setTimeout(() => {
    logEnvCheckResults();
  }, 1000);
  
  // 标记已初始化
  (window as any).__envCheckInitialized = true;
} 