/**
 * 🛡️ 存储系统健壮性增强模块
 * 实现关键的健壮性改进，解决审查中发现的薄弱点
 * 
 * 核心功能：
 * - 并发控制和写入锁机制
 * - 细粒度错误分类和处理
 * - 指数退避重试算法
 * - 数据验证和完整性检查
 * - 内存管理和清理策略
 * - 操作队列和顺序控制
 */

import i18n from '@/i18n';
import { logger } from '@/utils/logger';

// 存储错误类型枚举
export enum StorageError {
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',  
  DATA_CORRUPTION = 'DATA_CORRUPTION',
  INVALID_FORMAT = 'INVALID_FORMAT',
  CONCURRENT_WRITE = 'CONCURRENT_WRITE',
  DATABASE_UNAVAILABLE = 'DATABASE_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 操作结果类型
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: StorageError;
  errorMessage?: string;
  retries?: number;
  duration?: number;
}

// 重试配置
export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: StorageError[];
}

// 数据验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
}

// 锁信息
interface LockInfo {
  key: string;
  timestamp: number;
  operation: string;
  timeout: number;
}

/**
 * 数据锁管理器 - 解决并发写入问题
 */
export class DataLockManager {
  private locks = new Map<string, LockInfo>();
  private readonly DEFAULT_TIMEOUT = 30000; // 30秒超时
  
  /**
   * 尝试获取锁
   */
  async acquireLock(
    key: string, 
    operation: string, 
    timeoutMs: number = this.DEFAULT_TIMEOUT
  ): Promise<boolean> {
    const now = Date.now();
    const existing = this.locks.get(key);
    
    // 检查是否已被锁定且未超时
    if (existing && (now - existing.timestamp) < existing.timeout) {
      logger.debug(`🔒 获取锁失败: ${key} 已被 ${existing.operation} 锁定`);
      return false;
    }
    
    // 清理过期锁
    if (existing) {
      this.locks.delete(key);
    }
    
    // 获取新锁
    this.locks.set(key, {
      key,
      timestamp: now,
      operation,
      timeout: timeoutMs
    });
    
    logger.debug(`🔐 获取锁成功: ${key} -> ${operation}`);
    return true;
  }
  
  /**
   * 释放锁
   */
  releaseLock(key: string, operation: string) {
    const existing = this.locks.get(key);
    
    if (existing && existing.operation === operation) {
      this.locks.delete(key);
      logger.debug(`🔓 释放锁: ${key} <- ${operation}`);
    } else {
      logger.warn(`⚠️ 锁释放失败: ${key}, 操作不匹配或锁不存在`);
    }
  }
  
  /**
   * 强制释放锁（用于异常情况）
   */
  forceReleaseLock(key: string) {
    this.locks.delete(key);
    logger.warn(`💥 强制释放锁: ${key}`);
  }
  
  /**
   * 清理过期锁
   */
  cleanupExpiredLocks() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, lock] of this.locks.entries()) {
      if (now - lock.timestamp > lock.timeout) {
        this.locks.delete(key);
        cleanedCount++;
        logger.debug(`🧹 清理过期锁: ${key}`);
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`🧹 清理了 ${cleanedCount} 个过期锁`);
    }
  }
  
  /**
   * 获取锁状态
   */
  getLockStatus(): Array<{key: string; operation: string; age: number}> {
    const now = Date.now();
    return Array.from(this.locks.values()).map(lock => ({
      key: lock.key,
      operation: lock.operation,
      age: now - lock.timestamp
    }));
  }
}

/**
 * 错误分类器 - 精确识别和分类错误
 */
export class ErrorClassifier {
  /**
   * 分类错误类型
   */
  classifyError(error: any): { type: StorageError; isRetryable: boolean } {
    const errorMsg = error?.message?.toLowerCase() || '';
    const errorCode = error?.code;
    
    // 网络相关错误
    if (errorMsg.includes('network') || errorMsg.includes('fetch') || 
        errorMsg.includes('timeout') || errorCode === 'NETWORK_ERROR') {
      return { type: StorageError.NETWORK_TIMEOUT, isRetryable: true };
    }
    
    // 权限相关错误
    if (errorMsg.includes('permission') || errorMsg.includes('unauthorized') ||
        errorMsg.includes('forbidden') || errorCode === 'INSUFFICIENT_PRIVILEGE') {
      return { type: StorageError.PERMISSION_DENIED, isRetryable: false };
    }
    
    // 存储配额错误
    if (errorMsg.includes('quota') || errorMsg.includes('storage full') ||
        errorMsg.includes('exceeded') || errorCode === 'QUOTA_EXCEEDED') {
      return { type: StorageError.QUOTA_EXCEEDED, isRetryable: false };
    }
    
    // 数据格式错误
    if (errorMsg.includes('json') || errorMsg.includes('parse') ||
        errorMsg.includes('invalid') || errorCode === 'INVALID_REQUEST') {
      return { type: StorageError.INVALID_FORMAT, isRetryable: false };
    }
    
    // 数据库不可用
    if (errorMsg.includes('database') || errorMsg.includes('connection') ||
        errorMsg.includes('unavailable') || errorCode === 'CONNECTION_ERROR') {
      return { type: StorageError.DATABASE_UNAVAILABLE, isRetryable: true };
    }
    
    // 限流错误
    if (errorMsg.includes('rate limit') || errorMsg.includes('too many') ||
        errorCode === 'RATE_LIMITED') {
      return { type: StorageError.RATE_LIMITED, isRetryable: true };
    }
    
    // 数据损坏
    if (errorMsg.includes('corrupt') || errorMsg.includes('checksum') ||
        errorMsg.includes('integrity')) {
      return { type: StorageError.DATA_CORRUPTION, isRetryable: false };
    }
    
    // 默认未知错误
    return { type: StorageError.UNKNOWN_ERROR, isRetryable: true };
  }
  
  /**
   * 判断错误是否可重试
   */
  isRetryableError(errorType: StorageError): boolean {
    const retryableErrors = [
      StorageError.NETWORK_TIMEOUT,
      StorageError.DATABASE_UNAVAILABLE,
      StorageError.RATE_LIMITED,
      StorageError.UNKNOWN_ERROR
    ];
    
    return retryableErrors.includes(errorType);
  }
}

/**
 * 重试管理器 - 智能重试算法
 */
export class RetryManager {
  private defaultConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    retryableErrors: [
      StorageError.NETWORK_TIMEOUT,
      StorageError.DATABASE_UNAVAILABLE,
      StorageError.RATE_LIMITED,
      StorageError.UNKNOWN_ERROR
    ]
  };
  
  /**
   * 执行带重试的操作
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context: string = 'unknown'
  ): Promise<OperationResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const classifier = new ErrorClassifier();
    
    let lastError: any = null;
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
      try {
        logger.debug(`🔄 执行操作 ${context} (尝试 ${attempt}/${finalConfig.maxRetries + 1})`);
        
        const result = await operation();
        const duration = Date.now() - startTime;
        
        if (attempt > 1) {
          logger.info(`✅ ${context} 重试成功 (尝试 ${attempt}, 耗时 ${duration}ms)`);
        }
        
        return {
          success: true,
          data: result,
          retries: attempt - 1,
          duration
        };
        
      } catch (error) {
        lastError = error;
        
        // 如果是最后一次尝试，直接失败
        if (attempt > finalConfig.maxRetries) {
          break;
        }
        
        // 分类错误
        const { type: errorType, isRetryable } = classifier.classifyError(error);
        
        // 不可重试的错误直接失败
        if (!isRetryable || !finalConfig.retryableErrors.includes(errorType)) {
          logger.warn(`❌ ${context} 错误不可重试: ${errorType}`, error);
          return {
            success: false,
            error: errorType,
            errorMessage: (error as Error)?.message,
            retries: attempt - 1,
            duration: Date.now() - startTime
          };
        }
        
        // 计算重试延迟（指数退避）
        const delay = Math.min(
          finalConfig.baseDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
          finalConfig.maxDelayMs
        );
        
        logger.warn(`⚠️ ${context} 失败，${delay}ms后重试 (尝试 ${attempt}): ${errorType}`, error);
        
        // 等待后重试
        await this.delay(delay);
      }
    }
    
    // 所有重试都失败
    const { type: finalErrorType } = classifier.classifyError(lastError);
    const duration = Date.now() - startTime;
    
    logger.error(`💥 ${context} 最终失败 (${finalConfig.maxRetries} 次重试, 耗时 ${duration}ms)`, lastError);
    
    return {
      success: false,
      error: finalErrorType,
      errorMessage: lastError?.message,
      retries: finalConfig.maxRetries,
      duration
    };
  }
  
  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 数据验证器 - 确保数据完整性
 */
export class DataValidator {
  private readonly MAX_JSON_SIZE = 4.5 * 1024 * 1024; // 4.5MB (留出一些空间)
  private readonly MAX_KEY_LENGTH = 200;
  private readonly MAX_NESTING_DEPTH = 20;
  
  /**
   * 验证数据
   */
  validate<T>(key: string, data: T): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitizedData = data;
    
    try {
      // 1. 验证key
      if (!key || typeof key !== 'string') {
        errors.push('Key必须是非空字符串');
      } else if (key.length > this.MAX_KEY_LENGTH) {
        errors.push(`Key长度不能超过${this.MAX_KEY_LENGTH}字符`);
      } else if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
        warnings.push('Key包含特殊字符，建议使用字母、数字、下划线和短横线');
      }
      
      // 2. 验证数据不为undefined
      if (data === undefined) {
        errors.push('数据不能为undefined，请使用null');
      }
      
      // 3. 验证JSON序列化
      let jsonString: string;
      try {
        jsonString = JSON.stringify(data);
      } catch (error) {
        errors.push('数据无法序列化为JSON');
        return { isValid: false, errors, warnings };
      }
      
      // 4. 验证大小限制
      const sizeBytes = new Blob([jsonString]).size;
      if (sizeBytes > this.MAX_JSON_SIZE) {
        errors.push(`数据大小(${(sizeBytes / 1024 / 1024).toFixed(2)}MB)超出限制(4.5MB)`);
      } else if (sizeBytes > this.MAX_JSON_SIZE * 0.8) {
        warnings.push(`数据大小较大(${(sizeBytes / 1024 / 1024).toFixed(2)}MB)，建议优化`);
      }
      
      // 5. 验证嵌套深度
      const depth = this.calculateNestingDepth(data);
      if (depth > this.MAX_NESTING_DEPTH) {
        errors.push(`数据嵌套层级(${depth})超出限制(${this.MAX_NESTING_DEPTH})`);
      } else if (depth > this.MAX_NESTING_DEPTH * 0.8) {
        warnings.push(`数据嵌套较深(${depth}层)，可能影响性能`);
      }
      
      // 6. 验证循环引用
      if (this.hasCircularReference(data)) {
        errors.push(i18n.t('common.errors.数据存在循环引用'));
      }
      
      // 7. 数据清理
      sanitizedData = this.sanitizeData(data);
      
    } catch (error) {
      errors.push(`验证过程异常: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    };
  }
  
  /**
   * 计算嵌套深度
   */
  private calculateNestingDepth(obj: any, currentDepth = 0): number {
    if (currentDepth > this.MAX_NESTING_DEPTH) {
      return currentDepth; // 提前停止，避免无限递归
    }
    
    if (obj === null || typeof obj !== 'object') {
      return currentDepth;
    }
    
    let maxDepth = currentDepth;
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const depth = this.calculateNestingDepth(item, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    } else {
      for (const value of Object.values(obj)) {
        const depth = this.calculateNestingDepth(value, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }
    
    return maxDepth;
  }
  
  /**
   * 检查循环引用
   */
  private hasCircularReference(obj: any, seen = new WeakSet()): boolean {
    if (obj === null || typeof obj !== 'object') {
      return false;
    }
    
    if (seen.has(obj)) {
      return true;
    }
    
    seen.add(obj);
    
    try {
      if (Array.isArray(obj)) {
        return obj.some(item => this.hasCircularReference(item, seen));
      } else {
        return Object.values(obj).some(value => this.hasCircularReference(value, seen));
      }
    } finally {
      seen.delete(obj);
    }
  }
  
  /**
   * 数据清理
   */
  private sanitizeData<T>(data: T): T {
    if (data === null || typeof data !== 'object') {
      return data;
    }
    
    // 移除函数类型的属性
    // 移除undefined值
    // 处理Date对象
    
    try {
      return JSON.parse(JSON.stringify(data, (key, value) => {
        // 过滤函数
        if (typeof value === 'function') {
          return undefined;
        }
        
        // 转换Date为ISO字符串
        if (value instanceof Date) {
          return value.toISOString();
        }
        
        return value;
      }));
    } catch (error) {
      logger.warn('数据清理失败，返回原始数据', error);
      return data;
    }
  }
}

/**
 * 内存管理器 - 优化缓存使用
 */
export class MemoryManager {
  private readonly MAX_CACHE_SIZE = 100;
  private readonly MAX_MEMORY_MB = 50;
  private cacheAccessOrder = new Map<string, number>();
  
  /**
   * 检查内存使用情况
   */
  getMemoryUsage(): { used: number; total: number; percentage: number } {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      };
    }
    
    // 浏览器不支持memory API
    return { used: 0, total: 0, percentage: 0 };
  }
  
  /**
   * LRU清理策略
   */
  cleanupLRU<T>(cache: Map<string, T>, targetSize: number): string[] {
    if (cache.size <= targetSize) {
      return [];
    }
    
    // 获取访问顺序
    const accessOrder = Array.from(this.cacheAccessOrder.entries())
      .filter(([key]) => cache.has(key))
      .sort(([, a], [, b]) => a - b); // 按访问时间升序
    
    const toRemove = accessOrder.slice(0, cache.size - targetSize);
    const removedKeys: string[] = [];
    
    for (const [key] of toRemove) {
      cache.delete(key);
      this.cacheAccessOrder.delete(key);
      removedKeys.push(key);
    }
    
    logger.debug(`🧹 LRU清理: 移除了 ${removedKeys.length} 个缓存项`);
    return removedKeys;
  }
  
  /**
   * 记录缓存访问
   */
  recordAccess(key: string) {
    this.cacheAccessOrder.set(key, Date.now());
  }
  
  /**
   * 内存压力检查
   */
  isMemoryPressureHigh(): boolean {
    const usage = this.getMemoryUsage();
    return usage.percentage > 80 || usage.used > this.MAX_MEMORY_MB;
  }
}

// 导出单例实例
export const dataLockManager = new DataLockManager();
export const errorClassifier = new ErrorClassifier();
export const retryManager = new RetryManager();
export const dataValidator = new DataValidator();
export const memoryManager = new MemoryManager();

// 定期清理任务
setInterval(() => {
  dataLockManager.cleanupExpiredLocks();
}, 60000); // 每分钟清理一次过期锁

export default {
  DataLockManager,
  ErrorClassifier,
  RetryManager,
  DataValidator,
  MemoryManager,
  StorageError
};