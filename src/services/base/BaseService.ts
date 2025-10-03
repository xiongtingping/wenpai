/**
 * 基础服务类
 * @description 提供资源管理和生命周期控制的基础能力
 *
 * 核心功能:
 * - 定时器管理和自动清理
 * - 事件监听器管理和自动清理
 * - 资源生命周期控制
 * - 错误处理和日志记录
 *
 * @created 2025-10-03
 */

import { logger } from '@/utils/logger';

/**
 * 服务状态枚举
 */
export enum ServiceState {
  IDLE = 'idle',           // 空闲状态
  INITIALIZING = 'initializing', // 初始化中
  READY = 'ready',         // 就绪状态
  RUNNING = 'running',     // 运行中
  PAUSED = 'paused',       // 暂停
  CLEANING = 'cleaning',   // 清理中
  DESTROYED = 'destroyed'  // 已销毁
}

/**
 * 资源清理器接口
 */
export interface ResourceCleaner {
  (): void | Promise<void>;
}

/**
 * 基础服务抽象类
 */
export abstract class BaseService {
  protected serviceName: string;
  protected state: ServiceState = ServiceState.IDLE;

  // 资源管理
  private timers: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();
  private eventListeners: Map<EventTarget, Map<string, EventListener>> = new Map();
  private customCleaners: Set<ResourceCleaner> = new Set();

  // 统计信息
  protected stats = {
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
    operationCount: 0,
    errorCount: 0
  };

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    logger.debug(`[${this.serviceName}] Service created`);
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (this.state !== ServiceState.IDLE) {
      logger.warn(`[${this.serviceName}] Service already initialized`);
      return;
    }

    this.state = ServiceState.INITIALIZING;

    try {
      await this.onInitialize();
      this.state = ServiceState.READY;
      logger.info(`[${this.serviceName}] Service initialized successfully`);
    } catch (error) {
      this.state = ServiceState.IDLE;
      logger.error(`[${this.serviceName}] Initialization failed:`, error);
      throw error;
    }
  }

  /**
   * 启动服务
   */
  async start(): Promise<void> {
    if (this.state !== ServiceState.READY && this.state !== ServiceState.PAUSED) {
      throw new Error(`Cannot start service in state: ${this.state}`);
    }

    this.state = ServiceState.RUNNING;

    try {
      await this.onStart();
      logger.info(`[${this.serviceName}] Service started`);
    } catch (error) {
      this.state = ServiceState.READY;
      logger.error(`[${this.serviceName}] Start failed:`, error);
      throw error;
    }
  }

  /**
   * 暂停服务
   */
  async pause(): Promise<void> {
    if (this.state !== ServiceState.RUNNING) {
      logger.warn(`[${this.serviceName}] Cannot pause service in state: ${this.state}`);
      return;
    }

    this.state = ServiceState.PAUSED;
    await this.onPause();
    logger.info(`[${this.serviceName}] Service paused`);
  }

  /**
   * 恢复服务
   */
  async resume(): Promise<void> {
    if (this.state !== ServiceState.PAUSED) {
      logger.warn(`[${this.serviceName}] Cannot resume service in state: ${this.state}`);
      return;
    }

    this.state = ServiceState.RUNNING;
    await this.onResume();
    logger.info(`[${this.serviceName}] Service resumed`);
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.state === ServiceState.DESTROYED) {
      logger.warn(`[${this.serviceName}] Service already destroyed`);
      return;
    }

    const previousState = this.state;
    this.state = ServiceState.CLEANING;

    try {
      logger.info(`[${this.serviceName}] Starting cleanup...`);

      // 1. 执行子类清理逻辑
      await this.onCleanup();

      // 2. 清理所有定时器
      this.clearAllTimers();

      // 3. 清理所有事件监听器
      this.clearAllEventListeners();

      // 4. 执行自定义清理器
      await this.executeCustomCleaners();

      this.state = ServiceState.DESTROYED;
      logger.info(`[${this.serviceName}] Cleanup completed successfully`);
    } catch (error) {
      this.state = previousState;
      logger.error(`[${this.serviceName}] Cleanup failed:`, error);
      throw error;
    }
  }

  /**
   * 注册定时器(setTimeout)
   */
  protected registerTimer(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      this.updateActivity();
      callback();
    }, delay);

    this.timers.add(timer);
    return timer;
  }

  /**
   * 注册间隔定时器(setInterval)
   */
  protected registerInterval(callback: () => void, interval: number): NodeJS.Timeout {
    const timer = setInterval(() => {
      this.updateActivity();
      callback();
    }, interval);

    this.intervals.add(timer);
    return timer;
  }

  /**
   * 取消特定定时器
   */
  protected clearTimer(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  /**
   * 取消特定间隔定时器
   */
  protected clearInterval(timer: NodeJS.Timeout): void {
    clearInterval(timer);
    this.intervals.delete(timer);
  }

  /**
   * 注册事件监听器
   */
  protected registerEventListener(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(event, listener, options);

    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, new Map());
    }

    this.eventListeners.get(target)!.set(event, listener);
  }

  /**
   * 移除事件监听器
   */
  protected removeEventListener(target: EventTarget, event: string): void {
    const listeners = this.eventListeners.get(target);
    if (!listeners) return;

    const listener = listeners.get(event);
    if (listener) {
      target.removeEventListener(event, listener);
      listeners.delete(event);
    }

    if (listeners.size === 0) {
      this.eventListeners.delete(target);
    }
  }

  /**
   * 注册自定义清理器
   */
  protected registerCleaner(cleaner: ResourceCleaner): void {
    this.customCleaners.add(cleaner);
  }

  /**
   * 更新活动时间
   */
  protected updateActivity(): void {
    this.stats.lastActivityAt = Date.now();
    this.stats.operationCount++;
  }

  /**
   * 记录错误
   */
  protected recordError(error: Error): void {
    this.stats.errorCount++;
    logger.error(`[${this.serviceName}] Error:`, error);
  }

  /**
   * 获取服务状态
   */
  getState(): ServiceState {
    return this.state;
  }

  /**
   * 获取服务统计信息
   */
  getStats() {
    return {
      ...this.stats,
      state: this.state,
      uptime: Date.now() - this.stats.createdAt,
      idleTime: Date.now() - this.stats.lastActivityAt,
      activeTimers: this.timers.size,
      activeIntervals: this.intervals.size,
      activeListeners: Array.from(this.eventListeners.values()).reduce(
        (sum, listeners) => sum + listeners.size,
        0
      )
    };
  }

  /**
   * 检查服务是否健康
   */
  isHealthy(): boolean {
    return (
      this.state !== ServiceState.DESTROYED &&
      this.stats.errorCount < 10 // 错误数量阈值
    );
  }

  // ============ 私有方法 ============

  /**
   * 清理所有定时器
   */
  private clearAllTimers(): void {
    let clearedCount = 0;

    // 清理setTimeout定时器
    this.timers.forEach(timer => {
      clearTimeout(timer);
      clearedCount++;
    });
    this.timers.clear();

    // 清理setInterval定时器
    this.intervals.forEach(timer => {
      clearInterval(timer);
      clearedCount++;
    });
    this.intervals.clear();

    if (clearedCount > 0) {
      logger.debug(`[${this.serviceName}] Cleared ${clearedCount} timers`);
    }
  }

  /**
   * 清理所有事件监听器
   */
  private clearAllEventListeners(): void {
    let clearedCount = 0;

    this.eventListeners.forEach((listeners, target) => {
      listeners.forEach((listener, event) => {
        target.removeEventListener(event, listener);
        clearedCount++;
      });
    });
    this.eventListeners.clear();

    if (clearedCount > 0) {
      logger.debug(`[${this.serviceName}] Cleared ${clearedCount} event listeners`);
    }
  }

  /**
   * 执行自定义清理器
   */
  private async executeCustomCleaners(): Promise<void> {
    const cleaners = Array.from(this.customCleaners);

    for (const cleaner of cleaners) {
      try {
        await cleaner();
      } catch (error) {
        logger.error(`[${this.serviceName}] Custom cleaner failed:`, error);
      }
    }

    this.customCleaners.clear();

    if (cleaners.length > 0) {
      logger.debug(`[${this.serviceName}] Executed ${cleaners.length} custom cleaners`);
    }
  }

  // ============ 生命周期钩子 (子类可重写) ============

  /**
   * 初始化钩子
   */
  protected async onInitialize(): Promise<void> {
    // 子类实现
  }

  /**
   * 启动钩子
   */
  protected async onStart(): Promise<void> {
    // 子类实现
  }

  /**
   * 暂停钩子
   */
  protected async onPause(): Promise<void> {
    // 子类实现
  }

  /**
   * 恢复钩子
   */
  protected async onResume(): Promise<void> {
    // 子类实现
  }

  /**
   * 清理钩子
   */
  protected async onCleanup(): Promise<void> {
    // 子类实现
  }
}

export default BaseService;
