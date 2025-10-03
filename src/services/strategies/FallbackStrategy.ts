/**
 * 🔄 降级策略系统
 *
 * 设计原则:
 * - 只读降级: 网络故障时读取过期缓存(仅供参考)
 * - 写入降级: 云端失败时暂存本地,网络恢复后重试
 * - 用户提示: 明确告知数据状态(最新/过期/本地)
 */

import { logger } from '@/utils/logger';

export enum DataFreshness {
  FRESH = 'fresh',           // 最新数据(来自云端)
  STALE = 'stale',           // 过期数据(本地缓存)
  LOCAL_ONLY = 'local_only'  // 仅本地(未同步)
}

export interface FallbackDataWrapper<T> {
  data: T;
  freshness: DataFreshness;
  timestamp: number;
  source: 'cloud' | 'cache' | 'state';
  message?: string;  // 给用户的提示信息
}

export class FallbackStrategy {
  private readonly STALE_DATA_WARNING_AGE = 60 * 60 * 1000; // 1小时

  /**
   * 读取降级策略
   * Cloud失败 → Cache(标记为stale) → null
   */
  async readWithFallback<T>(
    cloudReader: () => Promise<T | null>,
    cacheReader: () => T | null,
    cacheTimestamp?: number
  ): Promise<FallbackDataWrapper<T> | null> {
    // 1. 尝试云端读取
    try {
      const cloudData = await cloudReader();
      if (cloudData !== null) {
        return {
          data: cloudData,
          freshness: DataFreshness.FRESH,
          timestamp: Date.now(),
          source: 'cloud'
        };
      }
    } catch (error) {
      logger.warn('⚠️ 云端读取失败,尝试降级到缓存:', error);
    }

    // 2. 降级到缓存
    const cacheData = cacheReader();
    if (cacheData !== null) {
      const age = cacheTimestamp ? Date.now() - cacheTimestamp : Infinity;
      const isStale = age > this.STALE_DATA_WARNING_AGE;

      return {
        data: cacheData,
        freshness: isStale ? DataFreshness.STALE : DataFreshness.FRESH,
        timestamp: cacheTimestamp || Date.now(),
        source: 'cache',
        message: isStale
          ? `数据可能已过期(${this.formatAge(age)}前),仅供参考`
          : '使用本地缓存'
      };
    }

    // 3. 完全无数据
    return null;
  }

  /**
   * 写入降级策略
   * Cloud失败 → 暂存Cache → 后台重试
   */
  async writeWithFallback<T>(
    data: T,
    cloudWriter: () => Promise<boolean>,
    cacheWriter: () => boolean,
    key: string
  ): Promise<{
    success: boolean;
    synced: boolean;
    message: string;
  }> {
    // 1. 尝试云端写入
    try {
      const cloudSuccess = await cloudWriter();
      if (cloudSuccess) {
        // 同时更新缓存
        cacheWriter();
        return {
          success: true,
          synced: true,
          message: '数据已同步到云端'
        };
      }
    } catch (error) {
      logger.warn('⚠️ 云端写入失败,降级到本地:', error);
    }

    // 2. 降级到本地缓存
    const cacheSuccess = cacheWriter();
    if (cacheSuccess) {
      // 标记为待同步
      this.markPendingSync(key, data);

      return {
        success: true,
        synced: false,
        message: '数据已保存到本地,网络恢复后将自动同步'
      };
    }

    // 3. 完全失败
    return {
      success: false,
      synced: false,
      message: '数据保存失败,请稍后重试'
    };
  }

  /**
   * 标记待同步项
   */
  private markPendingSync<T>(key: string, data: T): void {
    try {
      const pending = JSON.parse(localStorage.getItem('pending_sync') || '[]');
      pending.push({
        key,
        data,
        timestamp: Date.now()
      });
      localStorage.setItem('pending_sync', JSON.stringify(pending));
      logger.info(`📝 已标记待同步: ${key}`);
    } catch (error) {
      logger.error('标记待同步失败:', error);
    }
  }

  /**
   * 获取待同步项
   */
  getPendingSyncItems(): Array<{ key: string; data: any; timestamp: number }> {
    try {
      return JSON.parse(localStorage.getItem('pending_sync') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * 重试待同步项
   */
  async retrySyncItems(
    syncFunction: (key: string, data: any) => Promise<boolean>
  ): Promise<{ synced: number; failed: number }> {
    const pending = this.getPendingSyncItems();
    let synced = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        const success = await syncFunction(item.key, item.data);
        if (success) {
          synced++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        logger.error(`重试同步失败 ${item.key}:`, error);
      }
    }

    // 清除已同步的项
    if (synced > 0) {
      const remaining = pending.slice(synced);
      localStorage.setItem('pending_sync', JSON.stringify(remaining));
      logger.info(`✅ 同步完成: ${synced}/${pending.length}`);
    }

    return { synced, failed };
  }

  /**
   * 格式化时间差
   */
  private formatAge(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时`;
    const days = Math.floor(hours / 24);
    return `${days}天`;
  }
}

// 导出单例
export const fallbackStrategy = new FallbackStrategy();

// 网络恢复时自动重试 (监听online事件)
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    logger.info('🌐 网络已恢复,开始重试待同步项...');
    const result = await fallbackStrategy.retrySyncItems(async (key, data) => {
      // 这里需要实际的同步逻辑,暂时返回false
      logger.info(`尝试同步: ${key}`);
      return false; // TODO: 集成实际的同步方法
    });
    logger.info(`📊 同步结果:`, result);
  });
}
