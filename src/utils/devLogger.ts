/**
 * 🔇 开发环境日志级别控制
 * 根据CLAUDE.md规范，从源头解决日志爆炸问题
 */

// 开发环境日志级别
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'silent';

// 当前日志级别 - 可以通过环境变量控制
const CURRENT_LOG_LEVEL: LogLevel = (process.env.VITE_LOG_LEVEL as LogLevel) || 'warn';

const LOG_LEVELS = {
  error: 0,
  warn: 1, 
  info: 2,
  debug: 3,
  silent: 4
};

function shouldLog(level: LogLevel): boolean {
  if (CURRENT_LOG_LEVEL === 'silent') return false;
  return LOG_LEVELS[level] <= LOG_LEVELS[CURRENT_LOG_LEVEL];
}

// 开发环境专用日志函数
export const devLog = {
  error: (...args: any[]) => {
    if (shouldLog('error')) {
      console.error(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (shouldLog('info')) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (shouldLog('debug')) {
      console.log(...args);
    }
  }
};

// 生产环境自动静默
if (process.env.NODE_ENV === 'production') {
  Object.keys(devLog).forEach(key => {
    (devLog as any)[key] = () => {}; // 生产环境完全静默
  });
}