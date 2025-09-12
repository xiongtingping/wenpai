import { logger } from '@/utils/logger';
import request from '@/api/request';
/**
 * 🛡️ 统一错误处理系统
 * 
 * 功能增强：
 * - 统一错误消息格式化
 * - 敏感信息过滤和脱敏
 * - 错误级别分类和处理
 * - 用户友好的错误提示
 * - 错误恢复建议
 * - 安全的错误日志记录
 */

// 敏感信息模式
const SENSITIVE_PATTERNS = [
  // API密钥
  /[a-zA-Z0-9]{32,}/g,
  // Token
  /bearer\s+[a-zA-Z0-9._-]+/gi,
  // 密码
  /password["\']?\s*[:=]\s*["\']?[^"'\s]+/gi,
  // 手机号
  /1[3-9]\d{9}/g,
  // 邮箱
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // IP地址
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  // 文件路径
  /\/[a-zA-Z0-9._/-]+/g,
];

/**
 * 错误类型枚举
 */
export enum ErrorType {
  RUNTIME = 'runtime',
  NETWORK = 'network',
  CONFIG = 'config',
  AUTH = 'auth',
  PAYMENT = 'payment',
  AI = 'ai',
  UNKNOWN = 'unknown'
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  sanitizedMessage: string; // 脱敏后的消息
  stack?: string;
  sanitizedStack?: string; // 脱敏后的堆栈
  timestamp: string;
  url: string;
  userAgent: string;
  errorId: string;
  context?: Record<string, any>;
  userFriendlyMessage: string; // 用户友好消息
  recoverySuggestions: string[]; // 恢复建议
  riskLevel: 'low' | 'medium' | 'high' | 'critical'; // 风险级别
}

/**
 * 生成错误ID
 */
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 清理敏感信息
 */
function sanitizeMessage(message: string): string {
  let sanitized = message;
  
  // 替换敏感信息模式
  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });
  
  // 移除URL参数
  sanitized = sanitized.replace(/[?&][a-zA-Z0-9_]+=([^&\s]+)/g, (match, value) => {
    return match.replace(value, '[PARAM_REDACTED]');
  });
  
  // 移除可能的用户数据
  sanitized = sanitized.replace(/user[_-]?id["\']?\s*[:=]\s*["\']?[^"'\s,}]+/gi, 'user_id: [REDACTED]');
  sanitized = sanitized.replace(/session[_-]?id["\']?\s*[:=]\s*["\']?[^"'\s,}]+/gi, 'session_id: [REDACTED]');
  
  return sanitized;
}

/**
 * 确定风险级别
 */
function determineRiskLevel(errorType: ErrorType, message: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerMessage = message.toLowerCase();
  
  // 严重风险 - 系统级错误或安全相关
  if (errorType === ErrorType.CONFIG || 
      lowerMessage.includes('security') ||
      lowerMessage.includes('critical') ||
      lowerMessage.includes('fatal')) {
    return 'critical';
  }
  
  // 高风险 - 认证或支付相关
  if (errorType === ErrorType.AUTH || 
      errorType === ErrorType.PAYMENT ||
      lowerMessage.includes('unauthorized') ||
      lowerMessage.includes('forbidden')) {
    return 'high';
  }
  
  // 中等风险 - 网络或AI服务
  if (errorType === ErrorType.NETWORK || 
      errorType === ErrorType.AI ||
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('service unavailable')) {
    return 'medium';
  }
  
  // 低风险 - 运行时错误
  return 'low';
}

/**
 * 获取错误类型
 */
function getErrorType(error: Error | string): ErrorType {
  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('http')) {
    return ErrorType.NETWORK;
  }
  if (lowerMessage.includes('config') || lowerMessage.includes('api key') || lowerMessage.includes('environment')) {
    return ErrorType.CONFIG;
  }
  if (lowerMessage.includes('auth') || lowerMessage.includes('login') || lowerMessage.includes('token')) {
    return ErrorType.AUTH;
  }
  if (lowerMessage.includes('payment') || lowerMessage.includes('creem') || lowerMessage.includes('checkout')) {
    return ErrorType.PAYMENT;
  }
  if (lowerMessage.includes('ai') || lowerMessage.includes('openai') || lowerMessage.includes('gpt')) {
    return ErrorType.AI;
  }

  return ErrorType.UNKNOWN;
}

/**
 * 记录错误信息
 */
export function logError(error: Error | string, context?: Record<string, any>): ErrorInfo {
  const originalMessage = typeof error === 'string' ? error : error.message;
  const originalStack = typeof error === 'string' ? undefined : error.stack;
  const errorType = getErrorType(error);
  
  const errorInfo: ErrorInfo = {
    type: errorType,
    message: originalMessage,
    sanitizedMessage: sanitizeMessage(originalMessage),
    stack: originalStack,
    sanitizedStack: originalStack ? sanitizeMessage(originalStack) : undefined,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    errorId: generateErrorId(),
    context,
    userFriendlyMessage: getUserFriendlyMessage(error),
    recoverySuggestions: getErrorRecoverySuggestions(errorType),
    riskLevel: determineRiskLevel(errorType, originalMessage)
  };

  // 控制台输出 - 根据风险级别选择输出方式
  const logMethod = errorInfo.riskLevel === 'critical' ? 'error' :
                   errorInfo.riskLevel === 'high' ? 'error' :
                   errorInfo.riskLevel === 'medium' ? 'warn' : 'log';

  console[logMethod](`🛡️ [${errorInfo.riskLevel.toUpperCase()}] 应用错误:`, {
    id: errorInfo.errorId,
    type: errorInfo.type,
    // 生产环境使用脱敏消息，开发环境显示原始消息
    message: import.meta.env.PROD ? errorInfo.sanitizedMessage : errorInfo.message,
    userMessage: errorInfo.userFriendlyMessage,
    suggestions: errorInfo.recoverySuggestions,
    context: errorInfo.context,
    // 在开发环境中显示更多信息
    ...(import.meta.env.DEV && {
      originalMessage: errorInfo.message,
      stack: errorInfo.stack,
      fullError: error
    })
  });

  // 发送错误报告到服务器（生产环境，仅使用脱敏数据）
  if (import.meta.env.PROD) {
    reportErrorToServer({
      ...errorInfo,
      // 确保上报的是脱敏数据
      message: errorInfo.sanitizedMessage,
      stack: errorInfo.sanitizedStack
    }).catch(() => {
      // 静默处理发送失败
    });
  }

  return errorInfo;
}

/**
 * 发送错误报告到服务器
 */
async function reportErrorToServer(errorInfo: ErrorInfo): Promise<void> {
  try {
    await request.post('/.netlify/functions/error-report', {
      ...errorInfo,
      buildInfo: {
        version: import.meta.env.VITE_APP_VERSION || 'unknown',
        environment: import.meta.env.MODE,
        buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown'
      }
    });

  } catch (error) {
    console.error('错误报告发送失败:', error);
  }
}

/**
 * 设置全局错误处理器
 */
export function setupGlobalErrorHandler(): void {
  // 处理未捕获的JavaScript错误
  window.addEventListener('error', (event) => {
    event.preventDefault();
    logError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // 处理未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    logError(new Error(`Promise rejected: ${event.reason}`), {
      promise: event.promise
    });
  });

  // 处理资源加载错误
  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) {
      const target = event.target as HTMLElement;
      logError(new Error(`Resource load failed: ${target.tagName}`), {
        resourceType: target.tagName,
        resourceUrl: (target as any).src || (target as any).href
      });
    }
  }, true);

  logger.debug('✅ 全局错误处理器已设置');
}

/**
 * 创建用户友好的错误消息
 */
export function getUserFriendlyMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  // 网络错误
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return '网络连接失败，请检查网络设置后重试';
  }

  // 配置错误
  if (lowerMessage.includes('api key') || lowerMessage.includes('config')) {
    return '系统配置错误，请联系管理员';
  }

  // 认证错误
  if (lowerMessage.includes('auth') || lowerMessage.includes('login')) {
    return '登录状态异常，请重新登录';
  }

  // 支付错误
  if (lowerMessage.includes('payment') || lowerMessage.includes('checkout')) {
    return '支付服务暂时不可用，请稍后重试';
  }

  // AI服务错误
  if (lowerMessage.includes('ai') || lowerMessage.includes('openai')) {
    return 'AI服务暂时不可用，请稍后重试';
  }

  // 默认错误消息
  return '应用遇到问题，请刷新页面重试';
}

/**
 * 错误恢复建议
 */
export function getErrorRecoverySuggestions(errorType: ErrorType): string[] {
  switch (errorType) {
    case ErrorType.NETWORK:
      return [
        '检查网络连接是否正常',
        '尝试刷新页面',
        '检查防火墙设置',
        '尝试使用其他网络'
      ];

    case ErrorType.CONFIG:
      return [
        '检查环境变量配置',
        '确认API密钥有效性',
        '联系管理员获取帮助'
      ];

    case ErrorType.AUTH:
      return [
        '重新登录应用',
        '清除浏览器缓存',
        '检查登录状态'
      ];

    case ErrorType.PAYMENT:
      return [
        '稍后重试支付',
        '检查支付宝App状态',
        '联系客服获取帮助'
      ];

    case ErrorType.AI:
      return [
        '稍后重试AI功能',
        '检查网络连接',
        '联系技术支持'
      ];

    default:
      return [
        '刷新页面重试',
        '清除浏览器缓存',
        '联系技术支持'
      ];
  }
}