/**
 * 🏗️ 基础数据管理器抽象类
 *
 * 目的: 消除 unifiedDataManager 和 robustUnifiedDataManager 的重复代码
 * 提供: 统一的Supabase、localStorage、State层访问接口
 *
 * 设计原则:
 * - 单一职责: 仅处理数据CRUD
 * - 安全隔离: 强制用户ID验证
 * - 可扩展: 子类可覆盖特定方法
 */

import { DataFieldAdapter, UnifiedDataRecord } from './DataFieldAdapter';
import { logger } from '@/utils/logger';

export interface BaseDataManagerConfig {
  userId?: string;
  supabaseService?: any;
  enableLogging?: boolean;
}

/**
 * 基础数据管理器抽象类
 */
export abstract class BaseDataManager {
  protected userId: string | null = null;
  protected supabaseService: any = null;
  protected enableLogging: boolean = true;

  constructor(config: BaseDataManagerConfig = {}) {
    if (config.userId) {
      this.setUserId(config.userId);
    }
    if (config.supabaseService) {
      this.supabaseService = config.supabaseService;
    }
    this.enableLogging = config.enableLogging ?? true;
  }

  /**
   * 设置用户ID (触发服务初始化)
   */
  setUserId(userId: string): void {
    if (!userId || userId === 'undefined') {
      throw new Error('用户ID不能为空');
    }
    this.userId = userId;
    this.onUserIdSet(userId);
  }

  /**
   * 用户ID设置后的钩子 (子类可覆盖)
   */
  protected abstract onUserIdSet(userId: string): void;

  // ============================================================================
  // 🌩️ 云端存储操作 (Supabase)
  // ============================================================================

  /**
   * 从云端获取数据
   * @param key 数据键
   * @returns 数据内容或null
   */
  protected async getCloudData<T>(key: string): Promise<T | null> {
    if (!this.supabaseService || !this.userId) {
      this.log('warn', '云端服务不可用，无法获取数据:', key);
      return null;
    }

    try {
      // 使用适配器构建安全过滤器
      const filters = DataFieldAdapter.buildSecureFilter(this.userId, key);

      const result = await this.supabaseService.findMany({
        filters,
        limit: 1,
        orderBy: 'updated_at',
        orderDirection: 'desc'
      });

      if (result.data && result.data.length > 0) {
        const record = DataFieldAdapter.fromDatabase(result.data[0]);
        const data = JSON.parse(record.dataContent);
        this.log('info', `✅ 云端数据获取成功: ${key}`);
        return data;
      }

      this.log('debug', `云端数据不存在: ${key}`);
      return null;
    } catch (error) {
      this.log('error', `❌ 云端获取数据失败 ${key}:`, error);
      return null;
    }
  }

  /**
   * 保存数据到云端
   * @param key 数据键
   * @param data 数据内容
   * @returns 是否成功
   */
  protected async setCloudData<T>(key: string, data: T): Promise<boolean> {
    if (!this.supabaseService || !this.userId) {
      this.log('warn', '云端服务不可用，无法保存数据:', key);
      return false;
    }

    try {
      // 检查是否已存在
      const filters = DataFieldAdapter.buildSecureFilter(this.userId, key);
      const existing = await this.supabaseService.findMany({
        filters,
        limit: 1
      });

      // 构建业务记录
      const record: UnifiedDataRecord = {
        userId: this.userId,
        dataKey: key,
        dataContent: JSON.stringify(data),
        metadata: {
          dataType: typeof data,
          size: JSON.stringify(data).length
        }
      };

      // 转换为数据库记录
      const dbRecord = DataFieldAdapter.toDatabase(record);

      if (existing.data && existing.data.length > 0) {
        // 更新现有记录
        await this.supabaseService.update(existing.data[0].id, dbRecord);
        this.log('info', `✅ 云端数据更新成功: ${key}`);
      } else {
        // 创建新记录
        await this.supabaseService.create(dbRecord);
        this.log('info', `✅ 云端数据创建成功: ${key}`);
      }

      return true;
    } catch (error) {
      this.log('error', `❌ 云端保存数据失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 从云端删除数据
   * @param key 数据键
   * @returns 是否成功
   */
  protected async deleteCloudData(key: string): Promise<boolean> {
    if (!this.supabaseService || !this.userId) {
      this.log('warn', '云端服务不可用，无法删除数据:', key);
      return false;
    }

    try {
      const filters = DataFieldAdapter.buildSecureFilter(this.userId, key);
      const existing = await this.supabaseService.findMany({
        filters,
        limit: 1
      });

      if (existing.data && existing.data.length > 0) {
        await this.supabaseService.delete(existing.data[0].id);
        this.log('info', `✅ 云端数据删除成功: ${key}`);
        return true;
      }

      this.log('debug', `云端数据不存在，无需删除: ${key}`);
      return true;
    } catch (error) {
      this.log('error', `❌ 云端删除数据失败 ${key}:`, error);
      return false;
    }
  }

  // ============================================================================
  // 💾 本地缓存操作 (localStorage)
  // ============================================================================

  /**
   * 从缓存获取数据
   */
  protected getCacheData<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.log('error', `❌ 缓存读取失败 ${key}:`, error);
      return null;
    }
  }

  /**
   * 保存数据到缓存
   */
  protected setCacheData<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.log('debug', `✅ 缓存保存成功: ${key}`);
      return true;
    } catch (error) {
      this.log('error', `❌ 缓存保存失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 从缓存删除数据
   */
  protected deleteCacheData(key: string): boolean {
    try {
      localStorage.removeItem(key);
      this.log('debug', `✅ 缓存删除成功: ${key}`);
      return true;
    } catch (error) {
      this.log('error', `❌ 缓存删除失败 ${key}:`, error);
      return false;
    }
  }

  // ============================================================================
  // 🛠️ 工具方法
  // ============================================================================

  /**
   * 统一日志方法
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (!this.enableLogging && level === 'debug') return;

    switch (level) {
      case 'debug':
        logger.debug(message, ...args);
        break;
      case 'info':
        logger.info(message, ...args);
        break;
      case 'warn':
        logger.warn(message, ...args);
        break;
      case 'error':
        logger.error(message, ...args);
        break;
    }
  }

  /**
   * 验证用户ID是否已设置
   */
  protected ensureUserId(): string {
    if (!this.userId) {
      throw new Error('用户ID未设置，请先调用 setUserId()');
    }
    return this.userId;
  }
}

export default BaseDataManager;
