/**
 * 🛡️ 健壮统一数据管理器 (重构版)
 * 继承RobustDataManager基类,整合所有健壮性改进
 *
 * ✅ 重构改进:
 * - 继承RobustDataManager,消除重复代码
 * - 使用DataFieldAdapter,统一字段映射
 * - 保留原有的健壮性特性
 * - 向后兼容原有API
 *
 * @version 2.0
 * @date 2025-10-03
 */

import { RobustDataManager, OperationResult, GetDataOptions, SetDataOptions } from './base/RobustDataManager';
import { createDataService, TABLE_NAMES } from './supabaseDataService';

/**
 * 健壮统一数据管理器类 (重构版)
 */
export class RobustUnifiedDataManager extends RobustDataManager {
  constructor(config: any = {}) {
    super({
      ...config,
      enableLocking: config.enableLocking ?? true,
      enableRetry: config.enableRetry ?? true,
      enableValidation: config.enableValidation ?? true,
      enableChecksum: config.enableChecksum ?? true,
      maxCacheSize: config.maxCacheSize ?? 100,
      maxCacheAgeMs: config.maxCacheAgeMs ?? 30 * 60 * 1000
    });
  }

  /**
   * 用户ID设置后的钩子 - 初始化Supabase服务
   */
  protected onUserIdSet(userId: string): void {
    try {
      this.supabaseService = createDataService(userId, TABLE_NAMES.USER_BRAND_CORPUS);
      this.log('info', '✅ 健壮数据管理器已初始化，用户:', userId);
    } catch (error) {
      this.log('error', '❌ SupabaseService初始化失败:', error);
    }
  }

  /**
   * 向后兼容: 健壮的数据获取
   */
  async getData<T>(key: string, options: GetDataOptions = {}): Promise<OperationResult<T>> {
    return await this.getRobustData<T>(key, options);
  }

  /**
   * 向后兼容: 健壮的数据保存
   */
  async setData<T>(key: string, data: T, options: SetDataOptions = {}): Promise<OperationResult> {
    return await this.setRobustData<T>(key, data, options);
  }

  /**
   * 数据存在性检查
   */
  async dataExists(key: string): Promise<OperationResult<boolean>> {
    try {
      // 先检查增强缓存
      const cached = this.enhancedCache.get(key);
      if (cached) {
        return { success: true, data: true };
      }

      // 检查localStorage
      const localData = this.getCacheData(key);
      if (localData !== null) {
        return { success: true, data: true };
      }

      // 检查云端
      if (this.supabaseService && this.userId) {
        const cloudData = await this.getCloudData(key);
        return { success: true, data: cloudData !== null };
      }

      return { success: true, data: false };

    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : '操作失败'
      };
    }
  }

  /**
   * 批量数据获取
   */
  async getBatchData<T>(keys: string[]): Promise<Record<string, OperationResult<T>>> {
    const results: Record<string, OperationResult<T>> = {};

    // 控制并发数
    const maxConcurrent = this.robustnessConfig.maxCacheSize || 5;
    const chunks = this.chunkArray(keys, maxConcurrent);

    for (const chunk of chunks) {
      const promises = chunk.map(async key => ({
        key,
        result: await this.getData<T>(key)
      }));

      const chunkResults = await Promise.allSettled(promises);

      chunkResults.forEach((result, index) => {
        const key = chunk[index];
        if (result.status === 'fulfilled') {
          results[key] = result.value.result;
        } else {
          results[key] = {
            success: false,
            errorMessage: result.reason?.message || '操作失败'
          };
        }
      });
    }

    return results;
  }

  /**
   * 数组分块工具
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// 导出单例实例
export const robustDataManager = new RobustUnifiedDataManager();

export default RobustUnifiedDataManager;
