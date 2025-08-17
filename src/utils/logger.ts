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

// 检查是否启用调试模式
const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV;

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
 */
const currentLogLevel = isProduction 
  ? LogLevel.WARN  // 生产环境只显示警告和错误
  : isDebugEnabled 
    ? LogLevel.DEBUG  // 开发环境显示所有日志
    : LogLevel.INFO;  // 默认显示信息级别以上

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
   * 系统启动信息 - 生产环境静默
   */
  system: (...args: any[]) => {
    if (!isProduction && currentLogLevel <= LogLevel.INFO) {
      console.log(...args);
    }
  },

  /**
   * 模块锁定信息 - 生产环境静默
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
 * 模块锁定日志 - 统一格式
 */
export const logModuleLock = (moduleName: string, signature: string) => {
  logger.lock(`🔒 ${moduleName} 已锁定 [${signature}]`);
};

export default logger;
