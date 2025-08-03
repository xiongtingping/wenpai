/**
 * 🔍 运行时undefined拼接检测器
 * 在开发环境中自动检测和警告可能的undefined拼接问题
 */

interface DetectionResult {
  detected: boolean;
  pattern: string;
  location: string;
  suggestion: string;
}

/**
 * 检测字符串中是否包含undefined拼接
 */
export function detectUndefinedConcat(value: any, context?: string): DetectionResult {
  const stringValue = String(value);
  const detected = stringValue.includes('undefined');
  
  return {
    detected,
    pattern: detected ? stringValue : '',
    location: context || 'unknown',
    suggestion: detected ? '请使用 getUserDisplayName() 等安全工具函数' : ''
  };
}

/**
 * 全局undefined拼接监控器
 */
export class UndefinedConcatMonitor {
  private static instance: UndefinedConcatMonitor;
  private detectionCount = 0;
  private maxWarnings = 10; // 最大警告次数，避免控制台刷屏
  
  static getInstance(): UndefinedConcatMonitor {
    if (!UndefinedConcatMonitor.instance) {
      UndefinedConcatMonitor.instance = new UndefinedConcatMonitor();
    }
    return UndefinedConcatMonitor.instance;
  }
  
  /**
   * 检查并报告undefined拼接
   */
  check(value: any, context: string = 'unknown'): boolean {
    if (!import.meta.env.DEV) return false;
    
    const result = detectUndefinedConcat(value, context);
    
    if (result.detected && this.detectionCount < this.maxWarnings) {
      this.detectionCount++;
      
      console.group('🚨 undefined拼接检测警告');
      console.warn('检测到可能的undefined拼接:', {
        value: result.pattern,
        context: result.location,
        suggestion: result.suggestion,
        timestamp: new Date().toISOString()
      });
      console.trace('调用栈:');
      console.groupEnd();
      
      if (this.detectionCount === this.maxWarnings) {
        console.warn('⚠️ 已达到最大警告次数，后续检测将静默进行');
      }
    }
    
    return result.detected;
  }
  
  /**
   * 重置检测计数
   */
  reset(): void {
    this.detectionCount = 0;
  }
  
  /**
   * 获取检测统计
   */
  getStats(): { detectionCount: number; maxWarnings: number } {
    return {
      detectionCount: this.detectionCount,
      maxWarnings: this.maxWarnings
    };
  }
}

/**
 * 便捷的检查函数
 */
export function checkUndefinedConcat(value: any, context?: string): boolean {
  return UndefinedConcatMonitor.getInstance().check(value, context);
}

/**
 * 安全的字符串拼接函数
 * 自动检测并警告undefined拼接
 */
export function safeStringConcat(...parts: any[]): string {
  const result = parts.map(part => String(part || '')).join('');
  
  if (import.meta.env.DEV) {
    checkUndefinedConcat(result, 'safeStringConcat');
  }
  
  return result;
}

/**
 * 安全的模板字符串替换
 */
export function safeTemplate(template: string, values: Record<string, any>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(values)) {
    const safeValue = value || '';
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(safeValue));
  }
  
  if (import.meta.env.DEV) {
    checkUndefinedConcat(result, 'safeTemplate');
  }
  
  return result;
}

// 🚨 DISABLED: 全局监控已禁用，避免与其他修复器冲突
if (import.meta.env.DEV) {
  console.log('🔍 undefined拼接检测器已加载（临时启用全局监控）');

  // 监控所有字符串操作
  const originalToString = Object.prototype.toString;
  Object.prototype.toString = function() {
    const result = originalToString.call(this);
    if (typeof this === 'string' && this.includes('undefinedundefined')) {
      console.group('🚨 检测到 undefinedundefined');
      console.warn('字符串值:', this);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  };

  // 监控模板字符串
  const originalStringConcat = String.prototype.concat;
  String.prototype.concat = function(...args) {
    const result = originalStringConcat.apply(this, args);
    if (result.includes('undefinedundefined')) {
      console.group('🚨 String.concat 检测到 undefinedundefined');
      console.warn('原始字符串:', this);
      console.warn('拼接参数:', args);
      console.warn('结果:', result);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  };
}

export default UndefinedConcatMonitor;
