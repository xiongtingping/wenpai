/**
 * 🔧 认证网络诊断和重试工具
 * 解决认证超时问题的系统性方案
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { logger } from '@/utils/logger';
import { getAuthingConfig } from '@/config/authing';

export interface NetworkDiagnosticResult {
  success: boolean;
  latency: number;
  error?: string;
  suggestions: string[];
}

export interface AuthRetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  timeoutMs: number;
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG: AuthRetryConfig = {
  maxRetries: 3,
  baseDelay: 2000,
  maxDelay: 10000,
  timeoutMs: 90000
};

/**
 * 网络诊断工具
 */
export class AuthNetworkDiagnostic {
  /**
   * 诊断Authing服务连接性
   */
  static async diagnoseAuthingConnection(): Promise<NetworkDiagnosticResult> {
    const config = getAuthingConfig();
    const startTime = Date.now();
    
    try {
      console.log('🔍 开始诊断Authing连接...');
      
      // 测试基础连接
      const response = await fetch(`${config.host}/api/v2/applications/${config.appId}/public-config`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'User-Agent': 'WenPai-App/1.0.0'
        },
        signal: AbortSignal.timeout(30000) // 30秒超时
      });

      const latency = Date.now() - startTime;
      
      if (response.ok) {
        console.log('✅ Authing连接正常', { latency: `${latency}ms` });
        return {
          success: true,
          latency,
          suggestions: latency > 5000 ? ['网络延迟较高，建议检查网络连接'] : []
        };
      } else {
        console.warn('⚠️ Authing响应异常', { status: response.status, latency: `${latency}ms` });
        return {
          success: false,
          latency,
          error: `HTTP ${response.status}: ${response.statusText}`,
          suggestions: [
            '检查Authing配置是否正确',
            '确认应用ID和域名设置',
            '检查网络防火墙设置'
          ]
        };
      }
    } catch (error: any) {
      const latency = Date.now() - startTime;
      console.error('❌ Authing连接失败', error);
      
      const suggestions = [];
      if (error.name === 'TimeoutError') {
        suggestions.push('网络超时，请检查网络连接');
        suggestions.push('尝试切换网络环境');
      } else if (error.message?.includes('DNS')) {
        suggestions.push('DNS解析失败，请检查网络设置');
        suggestions.push('尝试使用其他DNS服务器');
      } else {
        suggestions.push('网络连接异常，请稍后重试');
        suggestions.push('检查防火墙或代理设置');
      }
      
      return {
        success: false,
        latency,
        error: error.message || 'u64cdu4f5cu5931u8d25',
        suggestions
      };
    }
  }

  /**
   * 获取网络状态信息
   */
  static getNetworkInfo(): any {
    const nav = navigator as any;
    return {
      online: navigator.onLine,
      connection: nav.connection ? {
        effectiveType: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt,
        saveData: nav.connection.saveData
      } : null,
      userAgent: navigator.userAgent,
      language: navigator.language
    };
  }
}

/**
 * 认证重试工具
 */
export class AuthRetryManager {
  private config: AuthRetryConfig;

  constructor(config: Partial<AuthRetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * 带重试的认证请求
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string = '认证操作'
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${operationName} - 第${attempt}次尝试`);
        
        // 执行操作
        const result = await Promise.race([
          operation(),
          this.createTimeoutPromise()
        ]);
        
        console.log(`✅ ${operationName} - 第${attempt}次尝试成功`);
        return result;
        
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ ${operationName} - 第${attempt}次尝试失败:`, error.message);
        
        // 如果是最后一次尝试，直接抛出错误
        if (attempt === this.config.maxRetries) {
          break;
        }
        
        // 计算延迟时间（指数退避）
        const delay = Math.min(
          this.config.baseDelay * Math.pow(2, attempt - 1),
          this.config.maxDelay
        );
        
        console.log(`⏳ ${operationName} - ${delay}ms后重试...`);
        await this.sleep(delay);
      }
    }
    
    // 所有重试都失败了
    console.error(`❌ ${operationName} - 所有重试都失败`);
    throw new Error(`${operationName}失败: ${lastError?.message || 'u64cdu4f5cu5931u8d25'} (已重试${this.config.maxRetries}次)`);
  }

  /**
   * 创建超时Promise
   */
  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`操作超时 (${this.config.timeoutMs}ms)`));
      }, this.config.timeoutMs);
    });
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 认证错误分析器
 */
export class AuthErrorAnalyzer {
  /**
   * 分析认证错误并提供解决建议
   */
  static analyzeError(error: any): {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestions: string[];
    autoRetry: boolean;
  } {
    const message = error.message || error.toString();
    
    // 超时错误
    if (message.includes('timeout') || error.code === 'ECONNABORTED') {
      return {
        category: '网络超时',
        severity: 'medium',
        suggestions: [
          '检查网络连接稳定性',
          '尝试切换网络环境',
          '稍后重试',
          '联系技术支持'
        ],
        autoRetry: true
      };
    }
    
    // 网络连接错误
    if (message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
      return {
        category: '网络连接',
        severity: 'high',
        suggestions: [
          '检查网络连接',
          '确认DNS设置',
          '检查防火墙配置',
          '尝试使用移动网络'
        ],
        autoRetry: true
      };
    }
    
    // 认证配置错误
    if (message.includes('appId') || message.includes('unauthorized')) {
      return {
        category: '配置错误',
        severity: 'critical',
        suggestions: [
          '检查Authing配置',
          '确认应用ID正确',
          '验证域名设置',
          '联系管理员'
        ],
        autoRetry: false
      };
    }
    
    // 服务器错误
    if (message.includes('5') && message.includes('0')) {
      return {
        category: 'u64cdu4f5cu5931u8d25',
        severity: 'high',
        suggestions: [
          'Authing服务暂时不可用',
          '稍后重试',
          '联系技术支持'
        ],
        autoRetry: true
      };
    }
    
    // 默认错误
    return {
      category: 'u64cdu4f5cu5931u8d25',
      severity: 'medium',
      suggestions: [
        '请稍后重试',
        '检查网络连接',
        '联系技术支持'
      ],
      autoRetry: true
    };
  }
}

/**
 * 导出便捷函数
 */
export const authRetryManager = new AuthRetryManager();

export const diagnoseAndRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string = '认证操作'
): Promise<T> => {
  // 先进行网络诊断
  const diagnostic = await AuthNetworkDiagnostic.diagnoseAuthingConnection();
  
  if (!diagnostic.success) {
    console.warn('⚠️ 网络诊断发现问题:', diagnostic);
    // 即使诊断失败，也尝试执行操作（可能是诊断接口问题）
  }
  
  // 执行带重试的操作
  return authRetryManager.executeWithRetry(operation, operationName);
};
