/**
 * 控制台警告过滤器
 * 过滤掉已知的无害警告，保持控制台清洁
 */

// 保存原始的 console 方法
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// 需要过滤的警告模式
const FILTERED_WARNINGS = [
  // Authing Guard 无障碍访问警告
  /Blocked aria-hidden on an element because its descendant retained focus/,
  /The focus must not be hidden from assistive technology users/,
  /Avoid using aria-hidden on a focused element or its ancestor/,
  /Consider using the inert attribute instead/,
  /aria-hidden section of the WAI-ARIA specification/,

  // React DevTools 提示（开发环境常见）
  /Download the React DevTools for a better development experience/,

  // 🔧 FIX: Chrome扩展通信错误（浏览器扩展导致，非项目代码问题）
  /Could not establish connection\. Receiving end does not exist/,
  /The message port closed before a response was received/,
  /Extension context invalidated/,

  // 其他已知的无害警告
  /Warning: React does not recognize the/,
  /Warning: Failed prop type/
];

/**
 * 检查消息是否应该被过滤
 */
function shouldFilterMessage(message: string): boolean {
  return FILTERED_WARNINGS.some(pattern => pattern.test(message));
}

/**
 * 过滤后的 console.warn
 */
function filteredConsoleWarn(...args: any[]) {
  const message = args.join(' ');
  
  // 如果不是需要过滤的警告，正常输出
  if (!shouldFilterMessage(message)) {
    originalConsoleWarn.apply(console, args);
  }
  // 否则静默忽略
}

/**
 * 过滤后的 console.error
 */
function filteredConsoleError(...args: any[]) {
  const message = args.join(' ');
  
  // 如果不是需要过滤的错误，正常输出
  if (!shouldFilterMessage(message)) {
    originalConsoleError.apply(console, args);
  }
  // 否则静默忽略
}

/**
 * 启用控制台警告过滤
 */
export function enableConsoleWarningFilter() {
  if (import.meta.env.DEV) {
    console.warn = filteredConsoleWarn;
    console.error = filteredConsoleError;
    
    // 输出一次性提示
    originalConsoleWarn('🔇 控制台警告过滤器已启用，已知无害警告将被静默处理');
  }
}

/**
 * 禁用控制台警告过滤
 */
export function disableConsoleWarningFilter() {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  
  originalConsoleWarn('🔊 控制台警告过滤器已禁用');
}

/**
 * 添加自定义过滤规则
 */
export function addWarningFilter(pattern: RegExp) {
  FILTERED_WARNINGS.push(pattern);
}

/**
 * 移除过滤规则
 */
export function removeWarningFilter(pattern: RegExp) {
  const index = FILTERED_WARNINGS.indexOf(pattern);
  if (index > -1) {
    FILTERED_WARNINGS.splice(index, 1);
  }
}

// 在开发环境中自动启用
if (import.meta.env.DEV) {
  enableConsoleWarningFilter();
}
