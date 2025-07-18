/**
 * 全局错误处理工具
 * 用于捕获和处理应用中的各种错误
 */

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
  stack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  errorId: string;
  context?: Record<string, any>;
}

/**
 * 生成错误ID
 */
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
  const errorInfo: ErrorInfo = {
    type: getErrorType(error),
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    errorId: generateErrorId(),
    context
  };

  // 控制台输出
  console.error('🚨 应用错误:', {
    ...errorInfo,
    // 在开发环境中显示更多信息
    ...(import.meta.env.DEV && {
      fullError: error,
      componentStack: context?.componentStack
    })
  });

  // 发送错误报告到服务器（生产环境）
  if (import.meta.env.PROD) {
    reportErrorToServer(errorInfo).catch(() => {
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
    await fetch('/.netlify/functions/error-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...errorInfo,
        buildInfo: {
          version: import.meta.env.VITE_APP_VERSION || 'unknown',
          environment: import.meta.env.MODE,
          buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown'
        }
      })
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

  console.log('✅ 全局错误处理器已设置');
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