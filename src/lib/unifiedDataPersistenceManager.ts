/**
 * 🗄️ 统一数据持久化管理器
 * 解决混合存储架构导致的数据不一致问题
 * 
 * 核心功能：
 * 1. 统一localStorage和Supabase数据存储
 * 2. 自动数据同步和迁移
 * 3. 用户登录状态变化时的数据处理
 * 4. 数据备份和恢复机制
 */

import { createDataService, TABLE_NAMES } from '@/services/supabaseDataService';
import { logger } from '@/utils/logger';

// 数据存储策略
export enum DataStorageStrategy {
  CLOUD_FIRST = 'cloud_first',      // 云端优先，本地备份
  LOCAL_FIRST = 'local_first',      // 本地优先，云端同步
  DUAL_WRITE = 'dual_write'         // 双写模式，同时写入
}

// 数据类型配置
export interface DataTypeConfig {
  key: string;
  strategy: DataStorageStrategy;
  syncToCloud: boolean;
  localBackup: boolean;
  encryptLocal?: boolean;
  tableName?: string;
}

// 预定义数据类型配置
export const DATA_TYPE_CONFIGS: Record<string, DataTypeConfig> = {
  // 品牌资产 - 关键数据，云端优先
  brand_assets: {
    key: 'brand_assets',
    strategy: DataStorageStrategy.CLOUD_FIRST,
    syncToCloud: true,
    localBackup: true,
    tableName: TABLE_NAMES.USER_BRAND_CORPUS
  },
  
  // 品牌维度 - 关键数据，云端优先
  brand_dimensions: {
    key: 'brand_dimensions',
    strategy: DataStorageStrategy.CLOUD_FIRST,
    syncToCloud: true,
    localBackup: true,
    tableName: TABLE_NAMES.USER_BRAND_CORPUS
  },
  
  // 用户历史记录 - 本地优先，云端同步
  user_history: {
    key: 'user_history',
    strategy: DataStorageStrategy.LOCAL_FIRST,
    syncToCloud: true,
    localBackup: true,
    tableName: TABLE_NAMES.USER_BRAND_CORPUS
  },
  
  // 收藏数据 - 云端优先
  favorites: {
    key: 'favorites',
    strategy: DataStorageStrategy.CLOUD_FIRST,
    syncToCloud: true,
    localBackup: true,
    tableName: TABLE_NAMES.USER_BRAND_CORPUS
  },
  
  // 适配历史 - 本地优先
  adapt_history: {
    key: 'adapt_history',
    strategy: DataStorageStrategy.LOCAL_FIRST,
    syncToCloud: false,
    localBackup: true
  }
};

// 数据操作结果
export interface DataOperationResult<T = any> {
  success: boolean;
  data?: T;
  source: 'local' | 'cloud' | 'both';
  error?: string;
  timestamp: number;
}

/**
 * 统一数据持久化管理器
 */
export class UnifiedDataPersistenceManager {
  private userId: string | null = null;
  private supabaseServices: Map<string, any> = new Map();
  private syncQueue: Array<{ dataType: string; data: any; operation: 'save' | 'delete' }> = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * 设置当前用户ID
   */
  setUserId(userId: string | null) {
    if (this.userId === userId) return;
    
    const oldUserId = this.userId;
    this.userId = userId;
    
    logger.info(`🔄 数据持久化管理器用户切换: ${oldUserId} -> ${userId}`);
    
    // 初始化Supabase服务
    if (userId) {
      this.initializeSupabaseServices(userId);
      // 执行数据迁移
      this.migrateUserData(userId, oldUserId);
    } else {
      this.supabaseServices.clear();
    }
  }

  /**
   * 初始化Supabase服务
   */
  private initializeSupabaseServices(userId: string) {
    try {
      // 为每个需要云端存储的数据类型创建服务
      Object.values(DATA_TYPE_CONFIGS).forEach(config => {
        if (config.syncToCloud && config.tableName) {
          const service = createDataService(userId, config.tableName);
          this.supabaseServices.set(config.key, service);
        }
      });
      
      logger.info(`✅ Supabase服务初始化完成，用户: ${userId}`);
    } catch (error) {
      logger.error('❌ Supabase服务初始化失败:', error);
    }
  }

  /**
   * 保存数据 - 统一入口
   */
  async saveData<T>(dataType: string, data: T): Promise<DataOperationResult<T>> {
    const config = DATA_TYPE_CONFIGS[dataType];
    if (!config) {
      return {
        success: false,
        error: `未知数据类型: ${dataType}`,
        source: 'local',
        timestamp: Date.now()
      };
    }

    try {
      switch (config.strategy) {
        case DataStorageStrategy.CLOUD_FIRST:
          return await this.saveCloudFirst(dataType, data, config);
        
        case DataStorageStrategy.LOCAL_FIRST:
          return await this.saveLocalFirst(dataType, data, config);
        
        case DataStorageStrategy.DUAL_WRITE:
          return await this.saveDualWrite(dataType, data, config);
        
        default:
          return await this.saveLocalFirst(dataType, data, config);
      }
    } catch (error) {
      logger.error(`❌ 保存数据失败 [${dataType}]:`, error);
      return {
        success: false,
        error: String(error),
        source: 'local',
        timestamp: Date.now()
      };
    }
  }

  /**
   * 加载数据 - 统一入口
   */
  async loadData<T>(dataType: string): Promise<DataOperationResult<T>> {
    const config = DATA_TYPE_CONFIGS[dataType];
    if (!config) {
      return {
        success: false,
        error: `未知数据类型: ${dataType}`,
        source: 'local',
        timestamp: Date.now()
      };
    }

    try {
      switch (config.strategy) {
        case DataStorageStrategy.CLOUD_FIRST:
          return await this.loadCloudFirst<T>(dataType, config);
        
        case DataStorageStrategy.LOCAL_FIRST:
          return await this.loadLocalFirst<T>(dataType, config);
        
        case DataStorageStrategy.DUAL_WRITE:
          return await this.loadCloudFirst<T>(dataType, config);
        
        default:
          return await this.loadLocalFirst<T>(dataType, config);
      }
    } catch (error) {
      logger.error(`❌ 加载数据失败 [${dataType}]:`, error);
      return {
        success: false,
        error: String(error),
        source: 'local',
        timestamp: Date.now()
      };
    }
  }

  /**
   * 云端优先保存策略
   */
  private async saveCloudFirst<T>(dataType: string, data: T, config: DataTypeConfig): Promise<DataOperationResult<T>> {
    // 先尝试保存到云端
    if (this.isOnline && config.syncToCloud) {
      try {
        await this.saveToCloud(dataType, data, config);
        
        // 云端保存成功，同时保存到本地作为备份
        if (config.localBackup) {
          this.saveToLocal(dataType, data);
        }
        
        return {
          success: true,
          data,
          source: 'cloud',
          timestamp: Date.now()
        };
      } catch (error) {
        logger.warn(`⚠️ 云端保存失败，降级到本地: ${dataType}`, error);
      }
    }
    
    // 云端保存失败或离线，保存到本地
    this.saveToLocal(dataType, data);
    
    // 添加到同步队列
    if (config.syncToCloud) {
      this.addToSyncQueue(dataType, data, 'save');
    }
    
    return {
      success: true,
      data,
      source: 'local',
      timestamp: Date.now()
    };
  }

  /**
   * 本地优先保存策略
   */
  private async saveLocalFirst<T>(dataType: string, data: T, config: DataTypeConfig): Promise<DataOperationResult<T>> {
    // 先保存到本地
    this.saveToLocal(dataType, data);
    
    // 如果在线且需要云端同步，异步同步到云端
    if (this.isOnline && config.syncToCloud) {
      try {
        await this.saveToCloud(dataType, data, config);
        return {
          success: true,
          data,
          source: 'both',
          timestamp: Date.now()
        };
      } catch (error) {
        logger.warn(`⚠️ 云端同步失败: ${dataType}`, error);
        // 添加到同步队列
        this.addToSyncQueue(dataType, data, 'save');
      }
    }
    
    return {
      success: true,
      data,
      source: 'local',
      timestamp: Date.now()
    };
  }

  /**
   * 双写保存策略
   */
  private async saveDualWrite<T>(dataType: string, data: T, config: DataTypeConfig): Promise<DataOperationResult<T>> {
    const results: boolean[] = [];
    
    // 同时写入本地和云端
    const localPromise = Promise.resolve(this.saveToLocal(dataType, data));
    const cloudPromise = this.isOnline && config.syncToCloud 
      ? this.saveToCloud(dataType, data, config)
      : Promise.resolve(false);
    
    const [localResult, cloudResult] = await Promise.allSettled([localPromise, cloudPromise]);
    
    const localSuccess = localResult.status === 'fulfilled';
    const cloudSuccess = cloudResult.status === 'fulfilled' && cloudResult.value !== false;
    
    if (!cloudSuccess && config.syncToCloud) {
      this.addToSyncQueue(dataType, data, 'save');
    }
    
    return {
      success: localSuccess || cloudSuccess,
      data,
      source: localSuccess && cloudSuccess ? 'both' : (localSuccess ? 'local' : 'cloud'),
      timestamp: Date.now()
    };
  }

  /**
   * 保存到本地存储
   */
  private saveToLocal<T>(dataType: string, data: T): boolean {
    try {
      const key = this.generateLocalStorageKey(dataType);
      localStorage.setItem(key, JSON.stringify(data));
      logger.info(`💾 本地保存成功: ${dataType}`);
      return true;
    } catch (error) {
      logger.error(`❌ 本地保存失败: ${dataType}`, error);
      return false;
    }
  }

  /**
   * 保存到云端存储
   */
  private async saveToCloud<T>(dataType: string, data: T, config: DataTypeConfig): Promise<boolean> {
    if (!this.userId || !config.syncToCloud) return false;
    
    const service = this.supabaseServices.get(dataType);
    if (!service) {
      throw new Error(`Supabase服务未初始化: ${dataType}`);
    }

    try {
      // 检查是否已存在（使用brand_name字段替代corpusType）
      const brandName = `${dataType}_${this.userId}`;
      const existing = await service.findMany({
        filters: { brand_name: brandName },
        limit: 1
      });

      const recordData = {
        brand_name: brandName,
        brand_description: `统一数据存储: ${dataType}`,
        content_samples: [JSON.stringify(data)],
        metadata: {
          dataType,
          lastUpdated: new Date().toISOString(),
          version: '2.0',
          corpusType: dataType // 在metadata中保存原始类型
        }
      };

      if (existing.data && existing.data.length > 0) {
        await service.update(existing.data[0].id, recordData);
      } else {
        await service.create(recordData);
      }

      logger.info(`☁️ 云端保存成功: ${dataType}`);
      return true;
    } catch (error) {
      logger.error(`❌ 云端保存失败: ${dataType}`, error);
      throw error;
    }
  }

  /**
   * 生成本地存储键
   */
  private generateLocalStorageKey(dataType: string): string {
    if (this.userId) {
      return `wenpai:user:${this.userId}:${dataType}`;
    }
    return `wenpai:guest:${dataType}`;
  }

  /**
   * 添加到同步队列
   */
  private addToSyncQueue(dataType: string, data: any, operation: 'save' | 'delete') {
    this.syncQueue.push({ dataType, data, operation });
    logger.info(`📋 添加到同步队列: ${dataType} (${operation})`);
  }

  /**
   * 处理同步队列
   */
  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;
    
    logger.info(`🔄 处理同步队列，待同步项目: ${this.syncQueue.length}`);
    
    const queue = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const item of queue) {
      try {
        const config = DATA_TYPE_CONFIGS[item.dataType];
        if (config && config.syncToCloud) {
          if (item.operation === 'save') {
            await this.saveToCloud(item.dataType, item.data, config);
          }
          // TODO: 处理删除操作
        }
      } catch (error) {
        logger.error(`❌ 同步失败: ${item.dataType}`, error);
        // 重新添加到队列
        this.syncQueue.push(item);
      }
    }
  }

  /**
   * 数据迁移
   */
  private async migrateUserData(newUserId: string, oldUserId?: string | null) {
    logger.info(`📦 开始数据迁移: ${oldUserId} -> ${newUserId}`);
    
    // 迁移localStorage中的旧格式数据
    const migratedCount = this.migrateLegacyLocalStorageData(newUserId);
    
    if (migratedCount > 0) {
      logger.info(`✅ 迁移了 ${migratedCount} 项本地数据`);
    }
  }

  /**
   * 迁移旧格式的localStorage数据
   */
  private migrateLegacyLocalStorageData(userId: string): number {
    let migratedCount = 0;
    
    // 查找旧格式的数据键
    const allKeys = Object.keys(localStorage);
    const legacyKeys = allKeys.filter(key => {
      // 匹配旧格式：module_userId 或 module_guest
      return key.includes('_') && !key.startsWith('wenpai:');
    });
    
    legacyKeys.forEach(legacyKey => {
      try {
        const data = localStorage.getItem(legacyKey);
        if (!data) return;
        
        // 解析旧键名
        const parts = legacyKey.split('_');
        if (parts.length >= 2) {
          const modulePrefix = parts[0];
          const oldUserId = parts.slice(1).join('_');
          
          // 只迁移当前用户的数据
          if (oldUserId === userId || oldUserId === 'guest') {
            const newKey = this.generateLocalStorageKey(modulePrefix);
            localStorage.setItem(newKey, data);
            localStorage.removeItem(legacyKey);
            migratedCount++;
            
            logger.info(`📦 数据迁移: ${legacyKey} -> ${newKey}`);
          }
        }
      } catch (error) {
        logger.error(`❌ 数据迁移失败: ${legacyKey}`, error);
      }
    });
    
    return migratedCount;
  }

  /**
   * 云端优先加载策略
   */
  private async loadCloudFirst<T>(dataType: string, config: DataTypeConfig): Promise<DataOperationResult<T>> {
    // 先尝试从云端加载
    if (this.isOnline && config.syncToCloud) {
      try {
        const cloudData = await this.loadFromCloud<T>(dataType, config);
        if (cloudData !== null) {
          // 云端加载成功，同时更新本地备份
          if (config.localBackup) {
            this.saveToLocal(dataType, cloudData);
          }

          return {
            success: true,
            data: cloudData,
            source: 'cloud',
            timestamp: Date.now()
          };
        }
      } catch (error) {
        logger.warn(`⚠️ 云端加载失败，降级到本地: ${dataType}`, error);
      }
    }

    // 云端加载失败或离线，从本地加载
    const localData = this.loadFromLocal<T>(dataType);

    return {
      success: localData !== null,
      data: localData || undefined,
      source: 'local',
      timestamp: Date.now()
    };
  }

  /**
   * 本地优先加载策略
   */
  private async loadLocalFirst<T>(dataType: string, config: DataTypeConfig): Promise<DataOperationResult<T>> {
    // 先从本地加载
    const localData = this.loadFromLocal<T>(dataType);

    // 如果本地有数据，直接返回
    if (localData !== null) {
      return {
        success: true,
        data: localData,
        source: 'local',
        timestamp: Date.now()
      };
    }

    // 本地没有数据，尝试从云端加载
    if (this.isOnline && config.syncToCloud) {
      try {
        const cloudData = await this.loadFromCloud<T>(dataType, config);
        if (cloudData !== null) {
          // 云端加载成功，保存到本地
          this.saveToLocal(dataType, cloudData);

          return {
            success: true,
            data: cloudData,
            source: 'cloud',
            timestamp: Date.now()
          };
        }
      } catch (error) {
        logger.warn(`⚠️ 云端加载失败: ${dataType}`, error);
      }
    }

    return {
      success: false,
      data: undefined,
      source: 'local',
      timestamp: Date.now()
    };
  }

  /**
   * 从本地存储加载
   */
  private loadFromLocal<T>(dataType: string): T | null {
    try {
      const key = this.generateLocalStorageKey(dataType);
      const data = localStorage.getItem(key);

      if (data) {
        const parsed = JSON.parse(data);
        logger.info(`💾 本地加载成功: ${dataType}`);
        return parsed;
      }

      return null;
    } catch (error) {
      logger.error(`❌ 本地加载失败: ${dataType}`, error);
      return null;
    }
  }

  /**
   * 从云端存储加载
   */
  private async loadFromCloud<T>(dataType: string, config: DataTypeConfig): Promise<T | null> {
    if (!this.userId || !config.syncToCloud) return null;

    const service = this.supabaseServices.get(dataType);
    if (!service) {
      throw new Error(`Supabase服务未初始化: ${dataType}`);
    }

    try {
      const brandName = `${dataType}_${this.userId}`;
      const result = await service.findMany({
        filters: { brand_name: brandName },
        limit: 1
      });

      if (result.data && result.data.length > 0) {
        const record = result.data[0];
        // 从content_samples数组中获取数据
        const contentData = record.content_samples && record.content_samples.length > 0 
          ? record.content_samples[0] 
          : null;
        
        if (contentData) {
          const data = JSON.parse(contentData);
          logger.info(`☁️ 云端加载成功: ${dataType}`);
          return data;
        }
      }

      return null;
    } catch (error) {
      logger.error(`❌ 云端加载失败: ${dataType}`, error);
      throw error;
    }
  }

  /**
   * 删除数据
   */
  async deleteData(dataType: string): Promise<DataOperationResult<null>> {
    const config = DATA_TYPE_CONFIGS[dataType];
    if (!config) {
      return {
        success: false,
        error: `未知数据类型: ${dataType}`,
        source: 'local',
        timestamp: Date.now()
      };
    }

    try {
      // 删除本地数据
      const key = this.generateLocalStorageKey(dataType);
      localStorage.removeItem(key);

      // 删除云端数据
      if (this.isOnline && config.syncToCloud) {
        try {
          await this.deleteFromCloud(dataType, config);
        } catch (error) {
          logger.warn(`⚠️ 云端删除失败: ${dataType}`, error);
          this.addToSyncQueue(dataType, null, 'delete');
        }
      }

      return {
        success: true,
        data: null,
        source: 'both',
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error(`❌ 删除数据失败 [${dataType}]:`, error);
      return {
        success: false,
        error: String(error),
        source: 'local',
        timestamp: Date.now()
      };
    }
  }

  /**
   * 从云端删除数据
   */
  private async deleteFromCloud(dataType: string, config: DataTypeConfig): Promise<void> {
    if (!this.userId || !config.syncToCloud) return;

    const service = this.supabaseServices.get(dataType);
    if (!service) {
      throw new Error(`Supabase服务未初始化: ${dataType}`);
    }

    try {
      const brandName = `${dataType}_${this.userId}`;
      const result = await service.findMany({
        filters: { brand_name: brandName },
        limit: 1
      });

      if (result.data && result.data.length > 0) {
        await service.delete(result.data[0].id);
        logger.info(`☁️ 云端删除成功: ${dataType}`);
      }
    } catch (error) {
      logger.error(`❌ 云端删除失败: ${dataType}`, error);
      throw error;
    }
  }
}

// 全局实例
export const unifiedDataPersistenceManager = new UnifiedDataPersistenceManager();
