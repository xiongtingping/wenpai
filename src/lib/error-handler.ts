import { logger } from '@/utils/logger';

/**
 * 全局错误处理器
 */

/**
 * 设置全局错误处理
 */
export const setupGlobalErrorHandler = () => {
  // 处理未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    console.error('notprocessing的 Promise error:', event.reason);
    event.preventDefault();
  });

  // 处理全局 JavaScript 错误
  window.addEventListener('error', (event) => {
    console.error('全局 JavaScript error:', event.error);
  });

  // 处理 React 错误边界
  if (process.env.NODE_ENV === 'development') {
    logger.debug('🔧 全局错误处理器已设置');
  }
};
