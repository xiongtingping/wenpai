/**
 * 🚨 认证系统统一错误处理
 * 遵循CLAUDE.md规范，建立标准化错误处理机制
 * 
 * 功能特性：
 * - 错误分类和标准化
 * - 用户友好的错误信息
 * - 错误监控和统计
 * - 自动重试机制
 * - 错误恢复策略
 */

import i18n from '@/i18n';
import { logger } from '@/utils/logger';

/**
 * 认证错误类型枚举
 */
export enum AuthErrorType {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_CODE = 'INVALID_CODE',
  
  // 认证错误
  AUTH_FAILED = 'AUTH_FAILED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // 账户错误
  ACCOUNT_NOT_EXISTS = 'ACCOUNT_NOT_EXISTS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  
  // 验证码错误
  CODE_EXPIRED = 'CODE_EXPIRED',
  CODE_INVALID = 'CODE_INVALID',
  CODE_SEND_FAILED = 'CODE_SEND_FAILED',
  CODE_RATE_LIMITED = 'CODE_RATE_LIMITED',
  
  // 配置错误
  CONFIG_ERROR = 'CONFIG_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  LOW = 'low',          // 用户可自行解决
  MEDIUM = 'medium',    // 需要用户采取行动
  HIGH = 'high',        // 系统问题，需要重试
  CRITICAL = 'critical' // 严重系统错误
}

/**
 * 统一错误接口
 */
export interface AuthError {
  type: AuthErrorType;
  code: string;
  message: string;
  userMessage: string;
  severity: ErrorSeverity;
  timestamp: number;
  context?: Record<string, any>;
  originalError?: any;
  recoveryActions?: RecoveryAction[];
  shouldRetry?: boolean;
  retryAfter?: number;
  details?: string;
}

/**
 * 恢复操作接口
 */
export interface RecoveryAction {
  type: 'retry' | 'refresh' | 'navigate' | 'clear' | 'contact';
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

/**
 * 错误处理结果
 */
export interface ErrorHandlingResult {
  handled: boolean;
  showToUser: boolean;
  userMessage: string;
  recoveryActions: RecoveryAction[];
  shouldRetry: boolean;
  retryDelay: number;
}

/**
 * 错误统计信息
 */
interface ErrorStats {
  total: number;
  byType: Record<AuthErrorType, number>;
  bySeverity: Record<ErrorSeverity, number>;
  lastOccurrence: number;
}

/**
 * 认证错误处理器类
 */
export class AuthErrorHandler {
  private static instance: AuthErrorHandler;
  private errorStats: ErrorStats;
  private errorHistory: AuthError[] = [];
  private readonly MAX_HISTORY = 100;

  private constructor() {
    this.initializeStats();
  }

  public static getInstance(): AuthErrorHandler {
    if (!AuthErrorHandler.instance) {
      AuthErrorHandler.instance = new AuthErrorHandler();
    }
    return AuthErrorHandler.instance;
  }

  /**
   * 初始化错误统计
   */
  private initializeStats(): void {
    this.errorStats = {
      total: 0,
      byType: Object.values(AuthErrorType).reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<AuthErrorType, number>),
      bySeverity: Object.values(ErrorSeverity).reduce((acc, severity) => {
        acc[severity] = 0;
        return acc;
      }, {} as Record<ErrorSeverity, number>),
      lastOccurrence: 0
    };
  }

  /**
   * 处理错误（主要入口）
   */
  handleError(error: any, context?: Record<string, any>): ErrorHandlingResult {
    // 标准化错误
    const authError = this.normalizeError(error, context);
    
    // 记录错误
    this.recordError(authError);
    
    // 生成处理结果
    const result = this.generateHandlingResult(authError);
    
    // 记录日志
    this.logError(authError, result);
    
    return result;
  }

  /**
   * 标准化错误为AuthError格式
   */
  private normalizeError(error: any, context?: Record<string, any>): AuthError {
    const timestamp = Date.now();
    
    // 如果已经是AuthError，直接返回
    if (error && typeof error === 'object' && error.type && error.code) {
      return { ...error, timestamp, context: { ...error.context, ...context } };
    }

    // 根据错误特征判断类型
    const errorType = this.classifyError(error);
    const { code, userMessage, severity, shouldRetry, retryAfter } = this.getErrorMetadata(errorType, error);

    return {
      type: errorType,
      code,
      message: error?.message || String(error),
      userMessage,
      severity,
      timestamp,
      context,
      originalError: error,
      shouldRetry,
      retryAfter,
      recoveryActions: this.generateRecoveryActions(errorType, error)
    };
  }

  /**
   * 分类错误类型
   */
  private classifyError(error: any): AuthErrorType {
    const message = error?.message?.toLowerCase() || '';
    const code = error?.code;
    
    // 网络相关错误
    if (message.includes('timeout') || code === 'TIMEOUT') {
      return AuthErrorType.TIMEOUT_ERROR;
    }
    if (message.includes('network') || message.includes('fetch') || code === 'NETWORK_ERROR') {
      return AuthErrorType.NETWORK_ERROR;
    }
    if (message.includes('connection') || code === 'CONNECTION_ERROR') {
      return AuthErrorType.CONNECTION_ERROR;
    }
    
    // Authing错误码
    switch (code) {
      case 2000:
        return AuthErrorType.INVALID_CREDENTIALS;
      case 2001:
        return AuthErrorType.ACCOUNT_NOT_EXISTS;
      case 2004:
        return AuthErrorType.ACCOUNT_LOCKED;
      case 2020:
        return AuthErrorType.CODE_INVALID;
      case 2021:
        return AuthErrorType.CODE_EXPIRED;
      case 2100:
      case 2101:
        return AuthErrorType.VALIDATION_ERROR;
    }
    
    // 验证码相关错误
    if (message.includes('code') && (message.includes('invalid') || message.includes('expired'))) {
      return message.includes('expired') ? AuthErrorType.CODE_EXPIRED : AuthErrorType.CODE_INVALID;
    }
    if (message.includes('rate limit')) {
      return AuthErrorType.CODE_RATE_LIMITED;
    }
    
    // Token相关错误
    if (message.includes('token')) {
      if (message.includes('expired')) return AuthErrorType.TOKEN_EXPIRED;
      if (message.includes('invalid')) return AuthErrorType.TOKEN_INVALID;
    }
    
    // 权限错误
    if (message.includes('permission') || message.includes('forbidden') || code === 403) {
      return AuthErrorType.PERMISSION_DENIED;
    }
    
    // 配置错误
    if (message.includes('config') || message.includes('initialization')) {
      return AuthErrorType.CONFIG_ERROR;
    }
    
    // 服务不可用
    if (code >= 500 && code < 600) {
      return AuthErrorType.SERVICE_UNAVAILABLE;
    }
    
    return AuthErrorType.UNKNOWN_ERROR;
  }

  /**
   * 获取错误元数据
   */
  private getErrorMetadata(type: AuthErrorType, error: any) {
    const metadata = {
      [AuthErrorType.NETWORK_ERROR]: {
        code: 'AUTH_NETWORK_001',
        userMessage: i18n.t('auth.errors.networkError'),
        severity: ErrorSeverity.HIGH,
        shouldRetry: true,
        retryAfter: 3000
      },
      [AuthErrorType.TIMEOUT_ERROR]: {
        code: 'AUTH_TIMEOUT_001',
        userMessage: i18n.t('auth.errors.timeoutError'),
        severity: ErrorSeverity.HIGH,
        shouldRetry: true,
        retryAfter: 5000
      },
      [AuthErrorType.INVALID_CREDENTIALS]: {
        code: 'AUTH_CRED_001',
        userMessage: i18n.t('auth.errors.invalidCredentials'),
        severity: ErrorSeverity.MEDIUM,
        shouldRetry: false
      },
      [AuthErrorType.CODE_INVALID]: {
        code: 'AUTH_CODE_001',
        userMessage: i18n.t('auth.errors.invalidCode'),
        severity: ErrorSeverity.MEDIUM,
        shouldRetry: false
      },
      [AuthErrorType.CODE_EXPIRED]: {
        code: 'AUTH_CODE_002',
        userMessage: i18n.t('auth.errors.codeExpired'),
        severity: ErrorSeverity.MEDIUM,
        shouldRetry: false
      },
      [AuthErrorType.ACCOUNT_NOT_EXISTS]: {
        code: 'AUTH_ACCOUNT_001',
        userMessage: i18n.t('auth.errors.accountNotExists'),
        severity: ErrorSeverity.MEDIUM,
        shouldRetry: false
      },
      [AuthErrorType.ACCOUNT_LOCKED]: {
        code: 'AUTH_ACCOUNT_002',
        userMessage: i18n.t('auth.errors.accountLocked'),
        severity: ErrorSeverity.HIGH,
        shouldRetry: false
      },
      [AuthErrorType.TOKEN_EXPIRED]: {
        code: 'AUTH_TOKEN_001',
        userMessage: i18n.t('auth.errors.tokenExpired'),
        severity: ErrorSeverity.MEDIUM,
        shouldRetry: true,
        retryAfter: 1000
      },
      [AuthErrorType.CONFIG_ERROR]: {
        code: 'AUTH_CONFIG_001',
        userMessage: i18n.t('auth.errors.configError'),
        severity: ErrorSeverity.CRITICAL,
        shouldRetry: false
      },
      [AuthErrorType.UNKNOWN_ERROR]: {
        code: 'AUTH_UNKNOWN_001',
        userMessage: i18n.t('auth.errors.unknownError'),
        severity: ErrorSeverity.MEDIUM,
        shouldRetry: true,
        retryAfter: 2000
      }
    };

    return metadata[type] || metadata[AuthErrorType.UNKNOWN_ERROR];
  }

  /**
   * 生成恢复操作
   */
  private generateRecoveryActions(type: AuthErrorType, error: any): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    switch (type) {
      case AuthErrorType.NETWORK_ERROR:
      case AuthErrorType.TIMEOUT_ERROR:
        actions.push({
          type: 'retry',
          label: i18n.t('auth.actions.retry'),
          action: () => this.performRetry(error),
          primary: true
        });
        break;
        
      case AuthErrorType.CODE_EXPIRED:
        actions.push({
          type: 'refresh',
          label: i18n.t('auth.actions.resendCode'),
          action: () => this.resendVerificationCode(),
          primary: true
        });
        break;
        
      case AuthErrorType.TOKEN_EXPIRED:
        actions.push({
          type: 'refresh',
          label: i18n.t('auth.actions.refreshToken'),
          action: () => this.refreshToken(),
          primary: true
        });
        break;
        
      case AuthErrorType.ACCOUNT_LOCKED:
        actions.push({
          type: 'contact',
          label: i18n.t('auth.actions.contactSupport'),
          action: () => this.contactSupport()
        });
        break;
        
      case AuthErrorType.CONFIG_ERROR:
        actions.push({
          type: 'refresh',
          label: i18n.t('auth.actions.refreshPage'),
          action: () => window.location.reload(),
          primary: true
        });
        break;
    }

    return actions;
  }

  /**
   * 记录错误统计
   */
  private recordError(error: AuthError): void {
    // 更新统计
    this.errorStats.total++;
    this.errorStats.byType[error.type]++;
    this.errorStats.bySeverity[error.severity]++;
    this.errorStats.lastOccurrence = error.timestamp;

    // 添加到历史记录
    this.errorHistory.push(error);
    
    // 限制历史记录数量
    if (this.errorHistory.length > this.MAX_HISTORY) {
      this.errorHistory = this.errorHistory.slice(-this.MAX_HISTORY);
    }

    // 严重错误立即上报
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.reportCriticalError(error);
    }
  }

  /**
   * 生成处理结果
   */
  private generateHandlingResult(error: AuthError): ErrorHandlingResult {
    return {
      handled: true,
      showToUser: error.severity !== ErrorSeverity.LOW,
      userMessage: error.userMessage,
      recoveryActions: error.recoveryActions || [],
      shouldRetry: error.shouldRetry || false,
      retryDelay: error.retryAfter || 1000
    };
  }

  /**
   * 记录错误日志
   */
  private logError(error: AuthError, result: ErrorHandlingResult): void {
    const logData = {
      type: error.type,
      code: error.code,
      message: error.message,
      severity: error.severity,
      context: error.context,
      handled: result.handled,
      timestamp: new Date(error.timestamp).toISOString()
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error('🚨 Critical auth error:', logData);
        break;
      case ErrorSeverity.HIGH:
        logger.error('❌ High severity auth error:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn('⚠️ Medium severity auth error:', logData);
        break;
      case ErrorSeverity.LOW:
        logger.info('ℹ️ Low severity auth error:', logData);
        break;
    }
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): ErrorStats {
    return { ...this.errorStats };
  }

  /**
   * 获取最近错误
   */
  getRecentErrors(limit: number = 10): AuthError[] {
    return this.errorHistory.slice(-limit);
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.initializeStats();
    console.log('🗑️ 错误历史已清除');
  }

  /**
   * 恢复操作实现
   */
  private async performRetry(error: any): Promise<void> {
    console.log('🔄 执行重试操作');
    // 具体重试逻辑由调用方实现
  }

  private async resendVerificationCode(): Promise<void> {
    console.log('📱 重新发送验证码');
    // 由调用方实现
  }

  private async refreshToken(): Promise<void> {
    console.log('🔄 刷新Token');
    // 由调用方实现
  }

  private contactSupport(): void {
    console.log('📞 联系客服');
    // 跳转到客服页面或显示联系信息
  }

  private reportCriticalError(error: AuthError): void {
    console.log('🚨 上报严重错误:', error);
    // 发送到监控系统
  }
}

// 导出单例实例
export const authErrorHandler = AuthErrorHandler.getInstance();

/**
 * 便捷的错误处理函数
 */
export function handleAuthError(error: any, context?: Record<string, any>): ErrorHandlingResult {
  return authErrorHandler.handleError(error, context);
}

/**
 * 创建标准化AuthError
 */
export function createAuthError(
  type: AuthErrorType,
  message: string,
  options: Partial<AuthError> = {}
): AuthError {
  const handler = AuthErrorHandler.getInstance();
  return handler['normalizeError']({ type, message, ...options });
}

/**
 * 错误重试装饰器
 */
export function withErrorRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) {
  return async (...args: T): Promise<R> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        const result = handleAuthError(error, { attempt, maxRetries });
        
        if (!result.shouldRetry || attempt === maxRetries) {
          throw error;
        }
        
        console.log(`⏳ 重试 ${attempt}/${maxRetries}，${result.retryDelay}ms 后重试`);
        await new Promise(resolve => setTimeout(resolve, result.retryDelay));
      }
    }
    
    throw lastError;
  };
}