/**
 * AI调用并发管理器
 * 实现请求队列、批处理、限流、重试等高级并发控制
 */

import { TitleGenerationConfig } from '../config/titleGeneration.config';
import { performanceMonitor } from './PerformanceMonitor';
import { TitleGenerationError } from '../types/titleGeneration.types';
import { logger } from '@/utils/logger';

// 安全 i18n 助手，缺省回退原文案
const tr = (key: string, fallback: string): string => {
  try {
    // @ts-expect-error 全局 i18n 实例（在 main.tsx 注入）
    const gi = (globalThis as any)?.i18n;
    if (gi && typeof gi.t === 'function') return gi.t(key) as string;
  } catch {}
  return fallback;
};

interface ConcurrentRequest<T> {
  id: string;
  priority: number;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  retryCount: number;
  maxRetries: number;
  timeout: number;
  createdAt: number;
  tags?: Record<string, string>;
}

interface BatchRequest {
  requests: ConcurrentRequest<any>[];
  batchId: string;
  createdAt: number;
}

interface ConcurrencyStats {
  activeRequests: number;
  queuedRequests: number;
  completedRequests: number;
  failedRequests: number;
  averageWaitTime: number;
  averageExecutionTime: number;
  throughput: number;
  errorRate: number;
}

export class ConcurrencyManager {
  private requestQueue: ConcurrentRequest<any>[] = [];
  private activeRequests: Map<string, ConcurrentRequest<any>> = new Map();
  private batchQueue: BatchRequest[] = [];
  private stats: ConcurrencyStats = {
    activeRequests: 0,
    queuedRequests: 0,
    completedRequests: 0,
    failedRequests: 0,
    averageWaitTime: 0,
    averageExecutionTime: 0,
    throughput: 0,
    errorRate: 0
  };

  private maxConcurrency: number = 3; // 最大并发数
  private maxQueueSize: number = 100; // 最大队列长度
  private batchSize: number = 5; // 批处理大小
  private batchTimeout: number = 1000; // 批处理超时时间
  private rateLimitWindow: number = 60000; // 限流窗口 (1分钟)
  private rateLimitCount: number = 60; // 限流次数
  private requestCounts: Map<number, number> = new Map(); // 时间窗口请求计数

  private batchTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * 提交并发请求
   */
  async submit<T>(
    executor: () => Promise<T>,
    options: {
      priority?: number;
      maxRetries?: number;
      timeout?: number;
      tags?: Record<string, string>;
      enableBatching?: boolean;
    } = {}
  ): Promise<T> {
    const requestId = this.generateRequestId();
    const {
      priority = 0,
      maxRetries = 2,
      timeout = 30000,
      tags = {},
      enableBatching = false
    } = options;

    // 检查限流
    if (!this.checkRateLimit()) {
      throw new TitleGenerationError(
        tr('titleGen.errors.rateLimitExceeded', '请求频率过高，请稍后重试'),
        'RATE_LIMIT_EXCEEDED',
        { requestId }
      );
    }

    // 检查队列容量
    if (this.requestQueue.length >= this.maxQueueSize) {
      throw new TitleGenerationError(
        tr('titleGen.errors.queueFull', '请求队列已满，请稍后重试'),
        'QUEUE_FULL',
        { queueSize: this.requestQueue.length }
      );
    }

    return new Promise<T>((resolve, reject) => {
      const request: ConcurrentRequest<T> = {
        id: requestId,
        priority,
        execute: executor,
        resolve,
        reject,
        retryCount: 0,
        maxRetries,
        timeout,
        createdAt: Date.now(),
        tags
      };

      if (enableBatching) {
        this.addToBatch(request);
      } else {
        this.addToQueue(request);
      }

      this.processQueue();
    });
  }

  /**
   * 批量提交请求
   */
  async submitBatch<T>(
    executors: Array<() => Promise<T>>,
    options: {
      priority?: number;
      maxRetries?: number;
      timeout?: number;
      tags?: Record<string, string>;
    } = {}
  ): Promise<T[]> {
    const promises = executors.map(executor =>
      this.submit(executor, { ...options, enableBatching: true })
    );

    return Promise.all(promises);
  }

  /**
   * 流式处理请求
   */
  async *submitStream<T>(
    executors: Array<() => Promise<T>>,
    options: {
      concurrency?: number;
      priority?: number;
      maxRetries?: number;
      timeout?: number;
    } = {}
  ): AsyncGenerator<{ index: number; result: T; error?: Error }, void, unknown> {
    const { concurrency = 2 } = options;
    const results: Array<{ index: number; result?: T; error?: Error; completed: boolean }> =
      executors.map((_, index) => ({ index, completed: false }));

    let completedCount = 0;
    let currentIndex = 0;

    // 启动初始并发请求
    const activePromises = new Set<Promise<void>>();

    const processNext = async () => {
      if (currentIndex >= executors.length) return;

      const index = currentIndex++;
      const executor = executors[index];

      const promise = this.submit(executor, options)
        .then(result => {
          results[index] = { index, result, completed: true };
          completedCount++;
        })
        .catch(error => {
          results[index] = { index, error, completed: true };
          completedCount++;
        })
        .finally(() => {
          activePromises.delete(promise);
          // 启动下一个请求
          if (currentIndex < executors.length) {
            const nextPromise = processNext();
            if (nextPromise) {
              activePromises.add(nextPromise);
            }
          }
        });

      activePromises.add(promise);
      return promise;
    };

    // 启动初始并发请求
    for (let i = 0; i < Math.min(concurrency, executors.length); i++) {
      const promise = processNext();
      if (promise) {
        activePromises.add(promise);
      }
    }

    // 流式返回结果
    let yieldedCount = 0;
    while (yieldedCount < executors.length) {
      // 等待至少一个请求完成
      if (activePromises.size > 0) {
        await Promise.race(activePromises);
      }

      // 按顺序yield已完成的结果
      while (yieldedCount < results.length && results[yieldedCount].completed) {
        const result = results[yieldedCount];
        if (result.error) {
          yield { index: result.index, result: undefined as any, error: result.error };
        } else {
          yield { index: result.index, result: result.result! };
        }
        yieldedCount++;
      }

      // 如果没有活跃请求且还有未完成的，等待一下
      if (activePromises.size === 0 && yieldedCount < executors.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  /**
   * 获取并发统计
   */
  getStats(): ConcurrencyStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * 清空队列
   */
  clearQueue(): void {
    // 拒绝所有排队的请求
    this.requestQueue.forEach(request => {
      request.reject(new TitleGenerationError(
        tr('titleGen.errors.queueCleared', '请求队列已清空'),
        'QUEUE_CLEARED',
        { requestId: request.id }
      ));
    });

    this.requestQueue = [];
    this.batchQueue = [];
    this.updateStats();
  }

  /**
   * 设置并发参数
   */
  configure(config: {
    maxConcurrency?: number;
    maxQueueSize?: number;
    batchSize?: number;
    batchTimeout?: number;
    rateLimitCount?: number;
    rateLimitWindow?: number;
  }): void {
    if (config.maxConcurrency) this.maxConcurrency = config.maxConcurrency;
    if (config.maxQueueSize) this.maxQueueSize = config.maxQueueSize;
    if (config.batchSize) this.batchSize = config.batchSize;
    if (config.batchTimeout) this.batchTimeout = config.batchTimeout;
    if (config.rateLimitCount) this.rateLimitCount = config.rateLimitCount;
    if (config.rateLimitWindow) this.rateLimitWindow = config.rateLimitWindow;

    logger.debug('🔧 并发管理器配置已更新:', config);
  }

  /**
   * 添加到队列
   */
  private addToQueue<T>(request: ConcurrentRequest<T>): void {
    // 按优先级插入队列
    const insertIndex = this.requestQueue.findIndex(r => r.priority < request.priority);
    if (insertIndex === -1) {
      this.requestQueue.push(request);
    } else {
      this.requestQueue.splice(insertIndex, 0, request);
    }

    this.updateStats();
  }

  /**
   * 添加到批处理队列
   */
  private addToBatch<T>(request: ConcurrentRequest<T>): void {
    let currentBatch = this.batchQueue[this.batchQueue.length - 1];

    if (!currentBatch || currentBatch.requests.length >= this.batchSize) {
      // 创建新批次
      currentBatch = {
        requests: [],
        batchId: this.generateBatchId(),
        createdAt: Date.now()
      };
      this.batchQueue.push(currentBatch);
    }

    currentBatch.requests.push(request);

    // 设置批处理定时器
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatches();
      }, this.batchTimeout);
    }
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    while (this.activeRequests.size < this.maxConcurrency && this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      this.executeRequest(request);
    }
  }

  /**
   * 处理批次
   */
  private processBatches(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // 将所有批次中的请求移到普通队列
    this.batchQueue.forEach(batch => {
      batch.requests.forEach(request => {
        this.addToQueue(request);
      });
    });

    this.batchQueue = [];
    this.processQueue();
  }

  /**
   * 执行请求
   */
  private async executeRequest<T>(request: ConcurrentRequest<T>): Promise<void> {
    this.activeRequests.set(request.id, request);
    this.updateStats();

    const startTime = Date.now();
    const waitTime = startTime - request.createdAt;

    try {
      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new TitleGenerationError(
            tr('titleGen.errors.requestTimeout', '请求超时'),
            'REQUEST_TIMEOUT',
            { requestId: request.id, timeout: request.timeout }
          ));
        }, request.timeout);
      });

      // 执行请求
      const result = await Promise.race([
        request.execute(),
        timeoutPromise
      ]);

      const executionTime = Date.now() - startTime;

      // 记录性能指标
      performanceMonitor.recordMetric('concurrent_request_wait_time', waitTime, request.tags);
      performanceMonitor.recordMetric('concurrent_request_execution_time', executionTime, request.tags);
      performanceMonitor.recordResponseTime(executionTime, 'concurrent_ai_call', true);

      request.resolve(result);
      this.stats.completedRequests++;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      performanceMonitor.recordResponseTime(executionTime, 'concurrent_ai_call', false);

      // 重试逻辑
      if (request.retryCount < request.maxRetries && this.shouldRetry(error)) {
        request.retryCount++;
        logger.warn(`🔄 requestretrying ${request.id} (${request.retryCount}/${request.maxRetries}):`, error);

        // 延迟重试
        setTimeout(() => {
          this.addToQueue(request);
          this.processQueue();
        }, Math.pow(2, request.retryCount) * 1000); // 指数退避
      } else {
        request.reject(error instanceof Error ? error : new Error(String(error)));
        this.stats.failedRequests++;

        if (error instanceof Error) {
          performanceMonitor.recordError(error, 'concurrent_ai_call');
        }
      }
    } finally {
      this.activeRequests.delete(request.id);
      this.updateStats();
      this.processQueue(); // 处理下一个请求
    }
  }

  /**
   * 检查是否应该重试
   */
  private shouldRetry(error: any): boolean {
    if (error instanceof TitleGenerationError) {
      // 某些错误不应该重试
      const noRetryErrors = ['INVALID_INPUT', 'RATE_LIMIT_EXCEEDED', 'QUEUE_FULL'];
      return !noRetryErrors.includes(error.code);
    }
    return true;
  }

  /**
   * 检查限流
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const windowStart = Math.floor(now / this.rateLimitWindow);

    // 清理旧的计数
    for (const [window] of this.requestCounts) {
      if (window < windowStart - 1) {
        this.requestCounts.delete(window);
      }
    }

    // 检查当前窗口的请求数
    const currentCount = this.requestCounts.get(windowStart) || 0;
    if (currentCount >= this.rateLimitCount) {
      return false;
    }

    // 增加计数
    this.requestCounts.set(windowStart, currentCount + 1);
    return true;
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.activeRequests = this.activeRequests.size;
    this.stats.queuedRequests = this.requestQueue.length;

    const totalRequests = this.stats.completedRequests + this.stats.failedRequests;
    this.stats.errorRate = totalRequests > 0 ? this.stats.failedRequests / totalRequests : 0;
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成批次ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      // 清理过期的批次
      const now = Date.now();
      this.batchQueue = this.batchQueue.filter(batch => {
        if (now - batch.createdAt > this.batchTimeout * 2) {
          // 将过期批次的请求移到普通队列
          batch.requests.forEach(request => this.addToQueue(request));
          return false;
        }
        return true;
      });
    }, 30000); // 每30秒清理一次
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearQueue();

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// 创建全局并发管理器实例
export const concurrencyManager = new ConcurrencyManager();

export default ConcurrencyManager;
