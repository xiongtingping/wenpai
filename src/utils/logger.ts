/**
 * 🔧 统一日志管理工具
 * 
 * 功能：
 * - 根据环境变量控制日志输出
 * - 生产环境自动静默
 * - 开发环境保留调试信息
 * - 支持不同日志级别
 */

// 检查是否为生产环境
const isProduction = import.meta.env.PROD || import.meta.env.NODE_ENV === 'production';

// 检查是否启用调试模式（需要在localStorage中手动开启）
const isDebugEnabled = typeof window !== 'undefined' && localStorage.getItem('wenpai:debug') === 'true';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

/**
 * 当前日志级别
 * 默认只显示警告和错误，减少控制台污染
 */
const currentLogLevel = isDebugEnabled
  ? LogLevel.DEBUG  // 手动启用调试模式时显示所有日志
  : LogLevel.WARN;  // 默认只显示警告和错误

/**
 * 统一日志工具
 */
export const logger = {
  /**
   * 调试信息 - 仅开发环境显示
   */
  debug: (...args: any[]) => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log(...args);
    }
  },

  /**
   * 一般信息
   */
  info: (...args: any[]) => {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(...args);
    }
  },

  /**
   * 警告信息
   */
  warn: (...args: any[]) => {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(...args);
    }
  },

  /**
   * 错误信息 - 始终显示
   */
  error: (...args: any[]) => {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(...args);
    }
  },

  /**
   * 🔧 增强的API错误日志
   * 显示完整的请求和响应信息
   */
  apiError: (context: {
    operation: string;
    endpoint?: string;
    method?: string;
    status?: number;
    statusText?: string;
    requestBody?: any;
    responseBody?: any;
    error?: any;
    model?: string;
    provider?: string;
    headers?: any;
    duration?: number;
  }) => {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.group(`🔴 API错误: ${context.operation}`);

      // 基本信息
      console.error('📍 错误位置:', context.operation);
      if (context.model) console.error('🤖 模型:', context.model);
      if (context.provider) console.error('🏢 提供商:', context.provider);

      // 请求信息
      if (context.endpoint || context.method) {
        console.group('📤 请求信息');
        if (context.method) console.log('方法:', context.method);
        if (context.endpoint) console.log('端点:', context.endpoint);
        if (context.headers) console.log('请求头:', context.headers);
        if (context.requestBody) {
          console.log('请求体:', context.requestBody);
          // 如果有prompt，单独显示
          if (context.requestBody.messages) {
            console.log('💬 Prompt预览:',
              JSON.stringify(context.requestBody.messages).substring(0, 200) + '...'
            );
          }
        }
        console.groupEnd();
      }

      // 响应信息
      if (context.status || context.responseBody) {
        console.group('📥 响应信息');
        if (context.status) {
          console.error('状态码:', context.status, context.statusText || '');
        }
        if (context.duration) {
          console.log('耗时:', context.duration + 'ms');
        }
        if (context.responseBody) {
          console.error('响应体:', context.responseBody);
          // 尝试解析错误信息
          if (typeof context.responseBody === 'string') {
            try {
              const parsed = JSON.parse(context.responseBody);
              if (parsed.error) {
                console.error('❌ 错误详情:', parsed.error);
              }
              if (parsed.message) {
                console.error('💬 错误消息:', parsed.message);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
        console.groupEnd();
      }

      // 错误对象
      if (context.error) {
        console.group('⚠️ 错误详情');
        console.error('错误对象:', context.error);
        if (context.error instanceof Error) {
          console.error('错误消息:', context.error.message);
          if (context.error.stack) {
            console.error('错误堆栈:', context.error.stack);
          }
        }
        console.groupEnd();
      }

      console.groupEnd();
    }
  },

  /**
   * 🔧 增强的模型调用错误日志
   */
  modelError: (context: {
    model: string;
    operation: string;
    prompt?: string;
    systemPrompt?: string;
    params?: any;
    response?: any;
    error?: any;
    attempt?: number;
    maxAttempts?: number;
  }) => {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.group(`🤖 模型调用错误: ${context.model}`);

      console.error('📍 操作:', context.operation);
      console.error('🤖 模型:', context.model);
      if (context.attempt && context.maxAttempts) {
        console.error('🔄 尝试次数:', `${context.attempt}/${context.maxAttempts}`);
      }

      // 参数信息
      if (context.params || context.prompt || context.systemPrompt) {
        console.group('⚙️ 调用参数');
        if (context.prompt) {
          console.log('💬 Prompt预览:', context.prompt.substring(0, 200) + '...');
          console.log('📏 Prompt长度:', context.prompt.length);
        }
        if (context.systemPrompt) {
          console.log('🎯 System Prompt预览:', context.systemPrompt.substring(0, 200) + '...');
        }
        if (context.params) {
          console.log('🔧 其他参数:', {
            temperature: context.params.temperature,
            maxTokens: context.params.maxTokens,
            ...context.params
          });
        }
        console.groupEnd();
      }

      // 响应信息
      if (context.response) {
        console.group('📥 响应信息');
        console.log('响应对象:', context.response);
        if (context.response.content) {
          console.log('✅ 内容长度:', context.response.content.length);
          console.log('📄 内容预览:', context.response.content.substring(0, 200) + '...');
        } else {
          console.error('❌ 无内容返回');
        }
        if (context.response.usage) {
          console.log('📊 Token使用:', context.response.usage);
        }
        console.groupEnd();
      }

      // 错误信息
      if (context.error) {
        console.group('❌ 错误详情');
        console.error('错误:', context.error);
        if (typeof context.error === 'string') {
          console.error('错误消息:', context.error);
        } else if (context.error instanceof Error) {
          console.error('错误消息:', context.error.message);
          console.error('错误堆栈:', context.error.stack);
        }
        console.groupEnd();
      }

      console.groupEnd();
    }
  },

  /**
   * 🔧 增强的Fallback日志
   */
  fallback: (context: {
    from: string;
    to: string;
    reason: string;
    attempt: number;
    error?: any;
    strategy?: string;
  }) => {
    if (currentLogLevel <= LogLevel.WARN) {
      console.group(`🔄 模型降级: ${context.from} → ${context.to}`);

      console.warn('📍 降级原因:', context.reason);
      console.warn('🔢 尝试次数:', context.attempt);
      console.warn('📊 降级策略:', context.strategy || '默认策略');
      console.warn('⬅️ 原模型:', context.from);
      console.warn('➡️ 新模型:', context.to);

      if (context.error) {
        console.warn('⚠️ 触发错误:', context.error);
      }

      console.groupEnd();
    }
  },

  /**
   * 系统启动信息 - 生产环境静默
   */
  system: (...args: any[]) => {
    if (!isProduction && currentLogLevel <= LogLevel.INFO) {
      console.log(...args);
    }
  },

  /**
   * 
   */
  lock: (...args: any[]) => {
    if (!isProduction && currentLogLevel <= LogLevel.DEBUG) {
      console.warn(...args);
    }
  },

  /**
   * 性能监控信息 - 生产环境静默
   */
  perf: (...args: any[]) => {
    if (!isProduction && currentLogLevel <= LogLevel.DEBUG) {
      console.log(...args);
    }
  },

  /**
   * 用户操作日志 - 根据配置决定
   */
  user: (...args: any[]) => {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log(...args);
    }
  }
};

/**
 * 开发环境专用日志 - 生产环境完全静默
 */
export const devLogger = {
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (!isProduction) {
      console.error(...args);
    }
  }
};

/**
 * 生产环境安全日志 - 不包含敏感信息
 */
export const prodLogger = {
  error: (message: string, errorId?: string) => {
    console.error(`[${new Date().toISOString()}] ${message}${errorId ? ` (ID: ${errorId})` : ''}`);
  },
  
  warn: (message: string) => {
    console.warn(`[${new Date().toISOString()}] ${message}`);
  }
};

/**
 * 创建带前缀的日志器
 */
export const createLogger = (prefix: string) => ({
  debug: (...args: any[]) => logger.debug(`[${prefix}]`, ...args),
  info: (...args: any[]) => logger.info(`[${prefix}]`, ...args),
  warn: (...args: any[]) => logger.warn(`[${prefix}]`, ...args),
  error: (...args: any[]) => logger.error(`[${prefix}]`, ...args),
  system: (...args: any[]) => logger.system(`[${prefix}]`, ...args),
});

/**
 * 模块初始化日志 - 统一格式
 */
export const logModuleInit = (moduleName: string, version?: string) => {
  logger.system(`🚀 ${moduleName}${version ? ` v${version}` : ''} 初始化完成`);
};

/**
 * 模块锁定日志
 */
export const logModuleLock = (moduleName: string, signature: string) => {
  logger.lock(`🔒 ${moduleName} 模块已锁定 [${signature}]`);
};

/**
 * 启用调试模式
 * 在浏览器控制台运行: window.enableDebugLogs()
 */
export const enableDebugLogs = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wenpai:debug', 'true');
    console.log('✅ 调试日志已启用，刷新页面生效');
  }
};

/**
 * 禁用调试模式
 * 在浏览器控制台运行: window.disableDebugLogs()
 */
export const disableDebugLogs = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wenpai:debug');
    console.log('✅ 调试日志已禁用，刷新页面生效');
  }
};

// 暴露到全局，方便调试
if (typeof window !== 'undefined') {
  (window as any).enableDebugLogs = enableDebugLogs;
  (window as any).disableDebugLogs = disableDebugLogs;
}

export default logger;
