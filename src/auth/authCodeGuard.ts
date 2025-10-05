/**
 * 🛡️ 授权码使用防护器 (Round #2深度修复)
 * 防止OAuth2授权码被重复使用，解决400 Bad Request问题
 */

import { logger } from '@/utils/logger';

interface AuthCodeUsage {
  code: string;
  timestamp: number;
  url: string;
  used: boolean;
  result?: 'success' | 'failed';
  error?: string;
}

export class AuthCodeGuard {
  private readonly STORAGE_KEY = 'auth_code_guard';
  private readonly CODE_LIFETIME = 10 * 60 * 1000; // 10分钟过期
  private usedCodes: Map<string, AuthCodeUsage> = new Map();

  constructor() {
    this.loadFromStorage();
    this.cleanExpiredCodes();
  }

  /**
   * 从localStorage加载已使用的授权码
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.usedCodes = new Map(data.usedCodes || []);
      }
    } catch (e) {
      logger.error('加载授权码使用记录失败:', e);
      this.usedCodes.clear();
    }
  }

  /**
   * 保存到localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        usedCodes: Array.from(this.usedCodes.entries()),
        lastCleanup: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      logger.error('保存授权码使用记录失败:', e);
    }
  }

  /**
   * 清理过期的授权码记录
   */
  private cleanExpiredCodes(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [code, usage] of this.usedCodes.entries()) {
      if (now - usage.timestamp > this.CODE_LIFETIME) {
        this.usedCodes.delete(code);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`清理了${cleaned}个过期的授权码记录`);
      this.saveToStorage();
    }
  }

  /**
   * 检查授权码是否可以使用
   */
  public canUseCode(code: string, currentUrl: string): {
    allowed: boolean;
    reason?: string;
    previousUsage?: AuthCodeUsage;
  } {
    if (!code) {
      return { allowed: false, reason: '授权码为空' };
    }

    // 清理过期记录
    this.cleanExpiredCodes();

    const existing = this.usedCodes.get(code);
    
    if (existing) {
      logger.warn('🚫 检测到重复使用的授权码:', {
        code: code.substring(0, 10) + '...',
        firstUsed: new Date(existing.timestamp).toLocaleString(),
        firstUrl: existing.url,
        currentUrl,
        result: existing.result,
        error: existing.error
      });

      return {
        allowed: false,
        reason: `授权码已被使用 (${new Date(existing.timestamp).toLocaleString()})`,
        previousUsage: existing
      };
    }

    return { allowed: true };
  }

  /**
   * 标记授权码开始使用
   */
  public markCodeInUse(code: string, currentUrl: string): void {
    const usage: AuthCodeUsage = {
      code,
      timestamp: Date.now(),
      url: currentUrl,
      used: true
    };

    this.usedCodes.set(code, usage);
    this.saveToStorage();

    logger.info('🔐 标记授权码开始使用:', {
      code: code.substring(0, 10) + '...',
      url: currentUrl,
      timestamp: new Date().toLocaleString()
    });
  }

  /**
   * 标记授权码使用成功
   */
  public markCodeSuccess(code: string): void {
    const usage = this.usedCodes.get(code);
    if (usage) {
      usage.result = 'success';
      this.usedCodes.set(code, usage);
      this.saveToStorage();
      logger.info('✅ 授权码使用成功');
    }
  }

  /**
   * 标记授权码使用失败
   */
  public markCodeFailed(code: string, error: string): void {
    const usage = this.usedCodes.get(code);
    if (usage) {
      usage.result = 'failed';
      usage.error = error;
      this.usedCodes.set(code, usage);
      this.saveToStorage();
      logger.error('❌ 授权码使用失败:', { error });
    }
  }

  /**
   * 检查当前URL是否有授权码重复使用问题
   */
  public checkCurrentUrl(): {
    hasCodeIssue: boolean;
    shouldRedirect: boolean;
    recommendedAction: string;
  } {
    const url = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      return {
        hasCodeIssue: false,
        shouldRedirect: false,
        recommendedAction: '无授权码，无需处理'
      };
    }

    const canUse = this.canUseCode(code, url);
    
    if (!canUse.allowed) {
      return {
        hasCodeIssue: true,
        shouldRedirect: true,
        recommendedAction: '检测到重复授权码，应清理URL并重新认证'
      };
    }

    return {
      hasCodeIssue: false,
      shouldRedirect: false,
      recommendedAction: '授权码可用，可以继续处理'
    };
  }

  /**
   * 获取授权码使用统计
   */
  public getUsageStats(): {
    totalCodes: number;
    successfulCodes: number;
    failedCodes: number;
    recentActivity: AuthCodeUsage[];
  } {
    const now = Date.now();
    const recent = Array.from(this.usedCodes.values())
      .filter(usage => now - usage.timestamp < 60 * 60 * 1000) // 最近1小时
      .sort((a, b) => b.timestamp - a.timestamp);

    const successful = recent.filter(u => u.result === 'success').length;
    const failed = recent.filter(u => u.result === 'failed').length;

    return {
      totalCodes: this.usedCodes.size,
      successfulCodes: successful,
      failedCodes: failed,
      recentActivity: recent.slice(0, 10) // 最近10条
    };
  }

  /**
   * 重置所有授权码记录（调试用）
   */
  public reset(): void {
    this.usedCodes.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    logger.info('🔄 授权码使用记录已重置');
  }

  /**
   * 检查授权码是否已被使用
   */
  public isCodeUsed(code: string): boolean {
    this.cleanExpiredCodes();
    return this.usedCodes.has(code);
  }

  /**
   * 检查授权码（向后兼容方法）
   */
  public checkCode(code: string): boolean {
    return this.isCodeUsed(code);
  }

  /**
   * 验证授权码（向后兼容方法）
   */
  public validateCode(code: string): boolean {
    return !this.isCodeUsed(code);
  }

  /**
   * 检查授权码是否有效（向后兼容方法）
   */
  public isValidCode(code: string): boolean {
    return !this.isCodeUsed(code);
  }
}

// 延迟创建实例，避免TDZ错误
let authCodeGuardInstance: AuthCodeGuard | null = null;

export function getAuthCodeGuard(): AuthCodeGuard {
  if (!authCodeGuardInstance) {
    authCodeGuardInstance = new AuthCodeGuard();
  }
  return authCodeGuardInstance;
}

// 保持向后兼容的导出
export const authCodeGuard = {
  checkCode: (code: string) => getAuthCodeGuard().checkCode(code),
  validateCode: (code: string) => getAuthCodeGuard().validateCode(code),
  isValidCode: (code: string) => getAuthCodeGuard().isValidCode(code)
};