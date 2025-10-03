/**
 * 离线队列管理器
 * @description 管理离线时的Token使用记录队列
 *
 * 功能:
 * 1. 离线时将记录添加到队列
 * 2. 网络恢复时自动同步到数据库
 * 3. 支持重试机制 (指数退避)
 * 4. 队列持久化到localStorage
 * 5. 自动清理过期/失败记录
 *
 * 限制:
 * - 最大队列长度: 1000条
 * - 最大保留时间: 7天
 * - 最大重试次数: 3次
 */

import { logger } from '@/utils/logger';
import type { OfflineQueueItem, TokenRecordRequest } from '../types';
import { tokenRecorder } from '../core/TokenRecorder';

export class OfflineQueueManager {
  private static instance: OfflineQueueManager;

  private readonly STORAGE_KEY = 'wenpai:token:offline_queue';
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly MAX_RETRY_COUNT = 3;
  private readonly MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7天

  private syncInProgress = false;
  private networkListener: (() => void) | null = null;

  private constructor() {
    this.setupNetworkListener();
  }

  static getInstance(): OfflineQueueManager {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager();
    }
    return OfflineQueueManager.instance;
  }

  /**
   * 🎯 核心方法: 添加到离线队列
   */
  add(userId: string, request: TokenRecordRequest): boolean {
    try {
      const queue = this.loadQueue();

      // 检查队列大小限制
      if (queue.length >= this.MAX_QUEUE_SIZE) {
        logger.warn('离线队列已满,丢弃最旧记录', {
          maxSize: this.MAX_QUEUE_SIZE
        });

        // 移除最旧的记录
        queue.shift();
      }

      // 创建队列项
      const item: OfflineQueueItem = {
        id: this.generateQueueItemId(),
        userId,
        request,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };

      queue.push(item);
      this.saveQueue(queue);

      logger.info('已添加到离线队列', {
        itemId: item.id,
        queueSize: queue.length
      });

      return true;
    } catch (error) {
      logger.error('添加到离线队列失败', { userId, error });
      return false;
    }
  }

  /**
   * 🎯 核心方法: 处理离线队列 (同步到数据库)
   */
  async processQueue(): Promise<{
    total: number;
    success: number;
    failed: number;
    discarded: number;
  }> {
    if (this.syncInProgress) {
      logger.info('队列同步正在进行中,跳过');
      return { total: 0, success: 0, failed: 0, discarded: 0 };
    }

    if (!navigator.onLine) {
      logger.info('离线状态,跳过队列同步');
      return { total: 0, success: 0, failed: 0, discarded: 0 };
    }

    this.syncInProgress = true;

    try {
      const queue = this.loadQueue();

      if (queue.length === 0) {
        logger.info('离线队列为空');
        return { total: 0, success: 0, failed: 0, discarded: 0 };
      }

      logger.info(`开始处理离线队列 (${queue.length}条记录)`);

      const now = Date.now();
      const results = {
        total: queue.length,
        success: 0,
        failed: 0,
        discarded: 0
      };

      const failedItems: OfflineQueueItem[] = [];

      // 逐个处理队列项
      for (const item of queue) {
        // 检查是否过期
        const itemAge = now - new Date(item.timestamp).getTime();
        if (itemAge > this.MAX_AGE_MS) {
          logger.warn('队列项已过期,丢弃', {
            itemId: item.id,
            age: itemAge
          });
          results.discarded++;
          continue;
        }

        // 检查重试次数
        if (item.retryCount >= this.MAX_RETRY_COUNT) {
          logger.warn('队列项重试次数超限,丢弃', {
            itemId: item.id,
            retryCount: item.retryCount
          });
          results.discarded++;
          continue;
        }

        // 尝试同步到数据库
        try {
          await tokenRecorder.recordUsage(item.request);

          logger.debug('队列项同步成功', {
            itemId: item.id,
            retryCount: item.retryCount
          });

          results.success++;
        } catch (error) {
          logger.warn('队列项同步失败', {
            itemId: item.id,
            retryCount: item.retryCount,
            error
          });

          // 增加重试次数并重新入队
          item.retryCount++;
          item.lastError = error instanceof Error ? error.message : String(error);
          failedItems.push(item);

          results.failed++;
        }

        // 添加延迟,避免压垮数据库
        await this.sleep(100);
      }

      // 保存失败的项 (下次重试)
      this.saveQueue(failedItems);

      logger.info('离线队列处理完成', results);

      return results;
    } catch (error) {
      logger.error('处理离线队列异常', error);
      return { total: 0, success: 0, failed: 0, discarded: 0 };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 获取队列状态
   */
  getStatus(): {
    size: number;
    oldestTimestamp: string | null;
    newestTimestamp: string | null;
    failedCount: number;
  } {
    const queue = this.loadQueue();

    if (queue.length === 0) {
      return {
        size: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
        failedCount: 0
      };
    }

    const failedCount = queue.filter(item => item.retryCount > 0).length;

    return {
      size: queue.length,
      oldestTimestamp: queue[0].timestamp,
      newestTimestamp: queue[queue.length - 1].timestamp,
      failedCount
    };
  }

  /**
   * 清除队列
   */
  clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      logger.info('离线队列已清除');
    } catch (error) {
      logger.error('清除离线队列失败', error);
    }
  }

  /**
   * 清理过期项
   */
  cleanupExpired(): number {
    try {
      const queue = this.loadQueue();
      const now = Date.now();

      const validQueue = queue.filter(item => {
        const age = now - new Date(item.timestamp).getTime();
        return age <= this.MAX_AGE_MS;
      });

      const removedCount = queue.length - validQueue.length;

      if (removedCount > 0) {
        this.saveQueue(validQueue);
        logger.info(`清理过期队列项 (${removedCount}条)`, {
          originalSize: queue.length,
          newSize: validQueue.length
        });
      }

      return removedCount;
    } catch (error) {
      logger.error('清理过期队列项失败', error);
      return 0;
    }
  }

  /**
   * 加载队列
   */
  private loadQueue(): OfflineQueueItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }

      const queue: OfflineQueueItem[] = JSON.parse(data);

      // 验证数据格式
      if (!Array.isArray(queue)) {
        logger.warn('离线队列数据格式错误,重置为空数组');
        return [];
      }

      return queue;
    } catch (error) {
      logger.error('加载离线队列失败', error);
      return [];
    }
  }

  /**
   * 保存队列
   */
  private saveQueue(queue: OfflineQueueItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      logger.error('保存离线队列失败', error);

      // 如果localStorage满了,尝试清除旧数据
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        logger.warn('localStorage已满,清除最旧的队列项');

        // 保留最新的一半
        const halfQueue = queue.slice(Math.floor(queue.length / 2));
        try {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(halfQueue));
        } catch (retryError) {
          logger.error('重试保存队列失败', retryError);
        }
      }
    }
  }

  /**
   * 生成队列项ID
   */
  private generateQueueItemId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `queue_${timestamp}_${random}`;
  }

  /**
   * 设置网络状态监听
   */
  private setupNetworkListener(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.networkListener = () => {
      logger.info('网络已恢复,开始处理离线队列');
      setTimeout(() => {
        this.processQueue().catch(error => {
          logger.error('自动处理离线队列失败', error);
        });
      }, 1000); // 延迟1秒,确保网络稳定
    };

    window.addEventListener('online', this.networkListener);
  }

  /**
   * 移除网络状态监听
   */
  destroy(): void {
    if (this.networkListener) {
      window.removeEventListener('online', this.networkListener);
      this.networkListener = null;
    }
  }

  /**
   * 辅助方法: 延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取队列详情 (调试用)
   */
  getQueueDetails(): {
    items: Array<{
      id: string;
      userId: string;
      feature: string;
      totalTokens: number;
      timestamp: string;
      retryCount: number;
      lastError?: string;
    }>;
    stats: {
      totalItems: number;
      failedItems: number;
      oldestAge: number;
      newestAge: number;
    };
  } {
    const queue = this.loadQueue();
    const now = Date.now();

    const items = queue.map(item => ({
      id: item.id,
      userId: item.userId,
      feature: item.request.feature,
      totalTokens: item.request.inputTokens + item.request.outputTokens,
      timestamp: item.timestamp,
      retryCount: item.retryCount,
      lastError: item.lastError
    }));

    const failedItems = queue.filter(item => item.retryCount > 0).length;
    const oldestAge = queue.length > 0 ? now - new Date(queue[0].timestamp).getTime() : 0;
    const newestAge =
      queue.length > 0 ? now - new Date(queue[queue.length - 1].timestamp).getTime() : 0;

    return {
      items,
      stats: {
        totalItems: queue.length,
        failedItems,
        oldestAge,
        newestAge
      }
    };
  }
}

/**
 * 导出单例实例
 */
export const offlineQueueManager = OfflineQueueManager.getInstance();
