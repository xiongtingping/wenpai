/**
 * 认证系统诊断工具
 * 用于检测和修复认证相关的问题
 */

import { getAuthingConfig } from '@/config/authing';
import AuthService from '@/services/authService';

/**
 * 认证诊断结果
 */
export interface AuthDiagnosticResult {
  /** 检查项目 */
  check: string;
  /** 是否通过 */
  passed: boolean;
  /** 错误信息 */
  error?: string;
  /** 建议修复方案 */
  suggestion?: string;
  /** 详细信息 */
  details?: any;
}

/**
 * 认证系统诊断器
 */
export class AuthDiagnostics {
  private authService = AuthService.getInstance();
  private config = getAuthingConfig();

  /**
   * 运行完整诊断
   */
  async runFullDiagnostics(): Promise<AuthDiagnosticResult[]> {
    const results: AuthDiagnosticResult[] = [];

    // 基础配置检查
    results.push(...await this.checkBasicConfig());
    
    // 网络连接检查
    results.push(...await this.checkNetworkConnectivity());
    
    // 认证服务检查
    results.push(...await this.checkAuthService());
    
    // 本地存储检查
    results.push(...await this.checkLocalStorage());
    
    // 环境变量检查
    results.push(...await this.checkEnvironmentVariables());

    return results;
  }

  /**
   * 检查基础配置
   */
  private async checkBasicConfig(): Promise<AuthDiagnosticResult[]> {
    const results: AuthDiagnosticResult[] = [];

    // 检查 App ID
    if (!this.config.appId) {
      results.push({
        check: 'Authing App ID',
        passed: false,
        error: 'App ID 未配置',
        suggestion: '请在环境变量中设置 VITE_AUTHING_APP_ID'
      });
    } else {
      results.push({
        check: 'Authing App ID',
        passed: true,
        details: { appId: this.config.appId }
      });
    }

    // 检查 Host
    if (!this.config.host) {
      results.push({
        check: 'Authing Host',
        passed: false,
        error: 'Host 未配置',
        suggestion: '请在环境变量中设置 VITE_AUTHING_HOST'
      });
    } else {
      results.push({
        check: 'Authing Host',
        passed: true,
        details: { host: this.config.host }
      });
    }

    // 检查重定向 URI
    if (!this.config.redirectUri) {
      results.push({
        check: 'Redirect URI',
        passed: false,
        error: '重定向 URI 未配置',
        suggestion: '请在环境变量中设置 VITE_AUTHING_REDIRECT_URI'
      });
    } else {
      results.push({
        check: 'Redirect URI',
        passed: true,
        details: { redirectUri: this.config.redirectUri }
      });
    }

    return results;
  }

  /**
   * 检查网络连接
   */
  private async checkNetworkConnectivity(): Promise<AuthDiagnosticResult[]> {
    const results: AuthDiagnosticResult[] = [];

    try {
      // 检查 Authing 服务连通性
      const response = await fetch(`https://${this.config.host}/oidc/.well-known/openid_configuration`);
      
      if (response.ok) {
        results.push({
          check: 'Authing 服务连通性',
          passed: true,
          details: { status: response.status }
        });
      } else {
        results.push({
          check: 'Authing 服务连通性',
          passed: false,
          error: `HTTP ${response.status}`,
          suggestion: '检查网络连接或 Authing 服务状态'
        });
      }
    } catch (error) {
      results.push({
        check: 'Authing 服务连通性',
        passed: false,
        error: error instanceof Error ? error.message : '网络错误',
        suggestion: '检查网络连接或 Authing 服务状态'
      });
    }

    return results;
  }

  /**
   * 检查认证服务
   */
  private async checkAuthService(): Promise<AuthDiagnosticResult[]> {
    const results: AuthDiagnosticResult[] = [];

    try {
      // 检查认证服务实例
      if (this.authService) {
        results.push({
          check: '认证服务实例',
          passed: true,
          details: { serviceType: 'AuthService' }
        });
      } else {
        results.push({
          check: '认证服务实例',
          passed: false,
          error: '认证服务未初始化',
          suggestion: '重新初始化认证服务'
        });
      }
    } catch (error) {
      results.push({
        check: '认证服务实例',
        passed: false,
        error: error instanceof Error ? error.message : '服务错误',
        suggestion: '检查认证服务配置'
      });
    }

    return results;
  }

  /**
   * 检查本地存储
   */
  private async checkLocalStorage(): Promise<AuthDiagnosticResult[]> {
    const results: AuthDiagnosticResult[] = [];

    try {
      // 检查 localStorage 可用性
      const testKey = 'auth_diagnostic_test';
      localStorage.setItem(testKey, 'test');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (testValue === 'test') {
        results.push({
          check: '本地存储可用性',
          passed: true,
          details: { storageType: 'localStorage' }
        });
      } else {
        results.push({
          check: '本地存储可用性',
          passed: false,
          error: 'localStorage 不可用',
          suggestion: '检查浏览器设置或隐私模式'
        });
      }

      // 检查存储空间
      const storageKeys = Object.keys(localStorage);
      const storageSize = storageKeys.reduce((size, key) => {
        return size + (localStorage.getItem(key)?.length || 0);
      }, 0);

      if (storageSize < 5 * 1024 * 1024) { // 5MB
        results.push({
          check: '存储空间',
          passed: true,
          details: { size: `${(storageSize / 1024).toFixed(2)} KB` }
        });
      } else {
        results.push({
          check: '存储空间',
          passed: false,
          error: '存储空间不足',
          suggestion: '清理浏览器缓存或本地存储'
        });
      }

    } catch (error) {
      results.push({
        check: '本地存储',
        passed: false,
        error: error instanceof Error ? error.message : '存储错误',
        suggestion: '检查浏览器设置'
      });
    }

    return results;
  }

  /**
   * 检查环境变量
   */
  private async checkEnvironmentVariables(): Promise<AuthDiagnosticResult[]> {
    const results: AuthDiagnosticResult[] = [];

    const requiredVars = [
      'VITE_AUTHING_APP_ID',
      'VITE_AUTHING_HOST',
      'VITE_AUTHING_REDIRECT_URI'
    ];

    for (const varName of requiredVars) {
      const value = import.meta.env[varName];
      if (value) {
        results.push({
          check: `环境变量 ${varName}`,
          passed: true,
          details: { value: value.substring(0, 10) + '...' }
        });
      } else {
        results.push({
          check: `环境变量 ${varName}`,
          passed: false,
          error: '未设置',
          suggestion: `请在 .env 文件中设置 ${varName}`
        });
      }
    }

    return results;
  }

  /**
   * 生成诊断报告
   */
  generateReport(results: AuthDiagnosticResult[]): string {
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const failed = total - passed;

    let report = `# 认证系统诊断报告\n\n`;
    report += `**总体状态**: ${failed === 0 ? '✅ 正常' : '❌ 发现问题'}\n`;
    report += `**通过检查**: ${passed}/${total}\n\n`;

    // 按状态分组
    const passedChecks = results.filter(r => r.passed);
    const failedChecks = results.filter(r => !r.passed);

    if (failedChecks.length > 0) {
      report += `## ❌ 发现的问题\n\n`;
      failedChecks.forEach(check => {
        report += `### ${check.check}\n`;
        report += `- **错误**: ${check.error}\n`;
        if (check.suggestion) {
          report += `- **建议**: ${check.suggestion}\n`;
        }
        if (check.details) {
          report += `- **详情**: ${JSON.stringify(check.details)}\n`;
        }
        report += `\n`;
      });
    }

    if (passedChecks.length > 0) {
      report += `## ✅ 正常项目\n\n`;
      passedChecks.forEach(check => {
        report += `- ${check.check}`;
        if (check.details) {
          report += ` (${JSON.stringify(check.details)})`;
        }
        report += `\n`;
      });
    }

    return report;
  }

  /**
   * 自动修复建议
   */
  getAutoFixSuggestions(results: AuthDiagnosticResult[]): string[] {
    const suggestions: string[] = [];

    results.forEach(result => {
      if (!result.passed && result.suggestion) {
        suggestions.push(`${result.check}: ${result.suggestion}`);
      }
    });

    return suggestions;
  }
}

/**
 * 创建诊断器实例
 */
export const authDiagnostics = new AuthDiagnostics(); 