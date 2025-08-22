/**
 * 🛡️ 认证重试防护器
 * 防止认证失败后的无限重试循环，实现状态隔离
 */

import { logger } from '@/utils/logger';

export interface AuthAttempt {
  id: string;
  timestamp: number;
  type: 'login' | 'callback' | 'token_exchange';
  status: 'pending' | 'success' | 'failed';
  error?: string;
  url?: string;
}

export class AuthRetryGuard {
  private readonly MAX_ATTEMPTS = 3;
  private readonly COOLDOWN_PERIOD = 30000; // 30秒冷却期
  private readonly STORAGE_KEY = 'auth_retry_guard';

  private attempts: AuthAttempt[] = [];
  private lastFailureTime: number = 0;
  
  constructor() {
    this.loadFromStorage();
  }

  /**
   * 从localStorage加载重试历史
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.attempts = data.attempts || [];
        this.lastFailureTime = data.lastFailureTime || 0;
        
        // 清理过期记录（超过1小时）
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        this.attempts = this.attempts.filter(attempt => attempt.timestamp > oneHourAgo);
      }
    } catch (e) {
      logger.error('加载认证重试记录失败:', e);
      this.attempts = [];
    }
  }

  /**
   * 保存到localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        attempts: this.attempts,
        lastFailureTime: this.lastFailureTime
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      logger.error('保存认证重试记录失败:', e);
    }
  }

  /**
   * 生成唯一的尝试ID
   */
  private generateAttemptId(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 检查是否允许新的认证尝试
   */
  public canAttempt(type: AuthAttempt['type']): { allowed: boolean; reason?: string } {
    const now = Date.now();
    
    // 检查冷却期
    if (this.lastFailureTime > 0 && (now - this.lastFailureTime) < this.COOLDOWN_PERIOD) {
      const remainingTime = Math.ceil((this.COOLDOWN_PERIOD - (now - this.lastFailureTime)) / 1000);
      return {
        allowed: false,
        reason: `认证冷却期中，请等待 ${remainingTime} 秒后重试`
      };
    }

    // 检查最近的失败次数
    const recentAttempts = this.attempts.filter(attempt => 
      attempt.timestamp > (now - this.COOLDOWN_PERIOD) && 
      attempt.status === 'failed'
    );

    if (recentAttempts.length >= this.MAX_ATTEMPTS) {
      return {
        allowed: false,
        reason: `认证失败次数过多，请稍后重试或联系支持`
      };
    }

    return { allowed: true };
  }

  /**
   * 开始新的认证尝试
   */
  public startAttempt(type: AuthAttempt['type'], url?: string): string {
    const attempt: AuthAttempt = {
      id: this.generateAttemptId(),
      timestamp: Date.now(),
      type,
      status: 'pending',
      url
    };

    this.attempts.push(attempt);
    this.saveToStorage();

    logger.info('开始认证尝试:', attempt);
    return attempt.id;
  }

  /**
   * 标记认证尝试为成功
   */
  public markSuccess(attemptId: string): void {
    const attempt = this.attempts.find(a => a.id === attemptId);
    if (attempt) {
      attempt.status = 'success';
      // 成功后清理失败记录
      this.lastFailureTime = 0;
      this.saveToStorage();
      logger.info('认证尝试成功:', attempt);
    }
  }

  /**
   * 标记认证尝试为失败
   */
  public markFailure(attemptId: string, error: string): void {
    const attempt = this.attempts.find(a => a.id === attemptId);
    if (attempt) {
      attempt.status = 'failed';
      attempt.error = error;
      this.lastFailureTime = Date.now();
      this.saveToStorage();
      logger.warn('认证尝试失败:', attempt);
    }
  }

  /**
   * 重置认证状态（用于手动清理）
   */
  public reset(): void {
    this.attempts = [];
    this.lastFailureTime = 0;
    localStorage.removeItem(this.STORAGE_KEY);
    logger.info('认证重试状态已重置');
  }

  /**
   * 获取当前状态信息
   */
  public getStatus(): {
    recentAttempts: number;
    lastFailureTime: number;
    inCooldown: boolean;
    cooldownRemaining: number;
  } {
    const now = Date.now();
    const recentAttempts = this.attempts.filter(attempt => 
      attempt.timestamp > (now - this.COOLDOWN_PERIOD)
    ).length;

    const inCooldown = this.lastFailureTime > 0 && 
      (now - this.lastFailureTime) < this.COOLDOWN_PERIOD;
    
    const cooldownRemaining = inCooldown ? 
      Math.ceil((this.COOLDOWN_PERIOD - (now - this.lastFailureTime)) / 1000) : 0;

    return {
      recentAttempts,
      lastFailureTime: this.lastFailureTime,
      inCooldown,
      cooldownRemaining
    };
  }

  /**
   * 检查特定错误是否应该触发冷却
   */
  public shouldTriggerCooldown(error: string): boolean {
    const cooldownTriggers = [
      'Invalid authorization code',
      'expired or already used',
      'redirect_uri_mismatch',
      '400',
      '401',
      '403'
    ];

    return cooldownTriggers.some(trigger => 
      error.toLowerCase().includes(trigger.toLowerCase())
    );
  }
}

// 导出单例实例
export const authRetryGuard = new AuthRetryGuard();