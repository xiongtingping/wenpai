/**
 * 🔄 数据同步和迁移服务
 * 负责在用户登录状态变化时处理数据的同步和迁移
 */

import i18n from '@/i18n';
import { unifiedDataPersistenceManager } from '@/lib/unifiedDataPersistenceManager';
import { logger } from '@/utils/logger';

// 数据同步状态
export interface DataSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingSyncCount: number;
  syncErrors: string[];
}

// 数据迁移结果
export interface DataMigrationResult {
  success: boolean;
  migratedDataTypes: string[];
  totalMigratedItems: number;
  errors: string[];
  details: Record<string, {
    success: boolean;
    itemCount: number;
    error?: string;
  }>;
}

/**
 * 数据同步管理器
 */
export class DataSyncManager {
  private static instance: DataSyncManager;
  private syncStatus: DataSyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    pendingSyncCount: 0,
    syncErrors: []
  };
  private syncListeners: Array<(status: DataSyncStatus) => void> = [];

  private constructor() {
    this.initializeNetworkListeners();
  }

  static getInstance(): DataSyncManager {
    if (!DataSyncManager.instance) {
      DataSyncManager.instance = new DataSyncManager();
    }
    return DataSyncManager.instance;
  }

  /**
   * 初始化网络状态监听
   */
  private initializeNetworkListeners() {
    window.addEventListener('online', () => {
      this.updateSyncStatus({ isOnline: true });
      this.triggerAutoSync();
    });

    window.addEventListener('offline', () => {
      this.updateSyncStatus({ isOnline: false });
    });
  }

  /**
   * 更新同步状态
   */
  private updateSyncStatus(updates: Partial<DataSyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.notifyListeners();
  }

  /**
   * 通知监听器
   */
  private notifyListeners() {
    this.syncListeners.forEach(listener => {
      try {
        listener(this.syncStatus);
      } catch (error) {
        logger.error('❌ 同步状态监听器错误:', error);
      }
    });
  }

  /**
   * 添加同步状态监听器
   */
  addSyncListener(listener: (status: DataSyncStatus) => void) {
    this.syncListeners.push(listener);
    // 立即通知当前状态
    listener(this.syncStatus);
  }

  /**
   * 移除同步状态监听器
   */
  removeSyncListener(listener: (status: DataSyncStatus) => void) {
    const index = this.syncListeners.indexOf(listener);
    if (index > -1) {
      this.syncListeners.splice(index, 1);
    }
  }

  /**
   * 获取当前同步状态
   */
  getSyncStatus(): DataSyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * 触发自动同步
   */
  private async triggerAutoSync() {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing) {
      return;
    }

    try {
      this.updateSyncStatus({ isSyncing: true });
      
      // 这里可以添加自动同步逻辑
      // 例如：检查待同步的数据并上传到云端
      
      this.updateSyncStatus({ 
        isSyncing: false, 
        lastSyncTime: Date.now(),
        syncErrors: []
      });
      
      logger.info('✅ 自动同步完成');
    } catch (error) {
      logger.error('❌ 自动同步失败:', error);
      this.updateSyncStatus({ 
        isSyncing: false,
        syncErrors: [String(error)]
      });
    }
  }

  /**
   * 手动触发同步
   */
  async manualSync(): Promise<boolean> {
    if (!this.syncStatus.isOnline) {
      throw new Error('网络不可用，无法同步');
    }

    if (this.syncStatus.isSyncing) {
      throw new Error(i18n.t('common.errors.同步正在进行中'));
    }

    try {
      this.updateSyncStatus({ isSyncing: true });
      
      // 执行同步逻辑
      await this.performSync();
      
      this.updateSyncStatus({ 
        isSyncing: false, 
        lastSyncTime: Date.now(),
        syncErrors: []
      });
      
      logger.info('✅ 手动同步完成');
      return true;
    } catch (error) {
      logger.error('❌ 手动同步失败:', error);
      this.updateSyncStatus({ 
        isSyncing: false,
        syncErrors: [String(error)]
      });
      return false;
    }
  }

  /**
   * 执行同步逻辑
   */
  private async performSync(): Promise<void> {
    // 这里实现具体的同步逻辑
    // 例如：上传本地待同步数据到云端
    logger.info('🔄 执行数据同步...');
  }
}

/**
 * 数据迁移管理器
 */
export class DataMigrationManager {
  private static instance: DataMigrationManager;

  private constructor() {}

  static getInstance(): DataMigrationManager {
    if (!DataMigrationManager.instance) {
      DataMigrationManager.instance = new DataMigrationManager();
    }
    return DataMigrationManager.instance;
  }

  /**
   * 执行用户登录时的数据迁移
   */
  async performLoginMigration(userId: string): Promise<DataMigrationResult> {
    logger.info(`🔄 开始用户登录数据迁移: ${userId}`);
    
    const result: DataMigrationResult = {
      success: true,
      migratedDataTypes: [],
      totalMigratedItems: 0,
      errors: [],
      details: {}
    };

    try {
      // 设置用户ID到统一数据持久化管理器
      unifiedDataPersistenceManager.setUserId(userId);

      // 迁移各种数据类型
      const dataTypesToMigrate = [
        'brand_assets',
        'brand_dimensions',
        'user_history',
        'favorites',
        'adapt_history'
      ];

      for (const dataType of dataTypesToMigrate) {
        try {
          const migrationResult = await this.migrateDataType(dataType, userId);
          
          result.details[dataType] = migrationResult;
          
          if (migrationResult.success) {
            result.migratedDataTypes.push(dataType);
            result.totalMigratedItems += migrationResult.itemCount;
          } else {
            result.errors.push(`${dataType}: ${migrationResult.error}`);
          }
        } catch (error) {
          const errorMessage = `${dataType} 迁移异常: ${error}`;
          result.errors.push(errorMessage);
          result.details[dataType] = {
            success: false,
            itemCount: 0,
            error: errorMessage
          };
          logger.error(`❌ ${errorMessage}`);
        }
      }

      // 判断整体迁移是否成功
      result.success = result.errors.length === 0;

      logger.info(`✅ 用户登录数据迁移完成: 成功 ${result.success}, 迁移 ${result.totalMigratedItems} 项数据`);
      
      return result;
    } catch (error) {
      logger.error('❌ 用户登录数据迁移失败:', error);
      result.success = false;
      result.errors.push(String(error));
      return result;
    }
  }

  /**
   * 迁移特定数据类型
   */
  private async migrateDataType(dataType: string, userId: string): Promise<{
    success: boolean;
    itemCount: number;
    error?: string;
  }> {
    try {
      // 检查是否有旧格式的数据需要迁移
      const legacyData = this.getLegacyData(dataType, userId);
      
      if (!legacyData || legacyData.length === 0) {
        return { success: true, itemCount: 0 };
      }

      // 检查新系统是否已有数据
      const existingData = await unifiedDataPersistenceManager.loadData(dataType);
      
      if (existingData.success && existingData.data && Array.isArray(existingData.data) && existingData.data.length > 0) {
        // 新系统已有数据，跳过迁移
        logger.info(`⏭️ ${dataType} 新系统已有数据，跳过迁移`);
        return { success: true, itemCount: 0 };
      }

      // 执行迁移
      const saveResult = await unifiedDataPersistenceManager.saveData(dataType, legacyData);
      
      if (saveResult.success) {
        // 迁移成功，清理旧数据
        this.cleanupLegacyData(dataType, userId);
        logger.info(`✅ ${dataType} 迁移成功: ${legacyData.length} 项`);
        return { success: true, itemCount: legacyData.length };
      } else {
        return { 
          success: false, 
          itemCount: 0, 
          error: saveResult.error || i18n.t('common.errors.保存失败') 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        itemCount: 0, 
        error: String(error) 
      };
    }
  }

  /**
   * 获取旧格式的数据
   */
  private getLegacyData(dataType: string, userId: string): any[] | null {
    try {
      // 尝试多种旧格式的键名
      const possibleKeys = [
        `${dataType}_${userId}`,
        `${dataType}_user_${userId}`,
        `wenpai:user:${userId}:${dataType}`,
        `${dataType}_guest` // 访客数据
      ];

      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              logger.info(`📦 找到旧数据: ${key} (${parsed.length} 项)`);
              return parsed;
            }
          } catch (parseError) {
            logger.warn(`⚠️ 解析旧数据失败: ${key}`, parseError);
          }
        }
      }

      return null;
    } catch (error) {
      logger.error(`❌ 获取旧数据失败: ${dataType}`, error);
      return null;
    }
  }

  /**
   * 清理旧数据
   */
  private cleanupLegacyData(dataType: string, userId: string) {
    const possibleKeys = [
      `${dataType}_${userId}`,
      `${dataType}_user_${userId}`,
      `${dataType}_guest`
    ];

    possibleKeys.forEach(key => {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          logger.info(`🗑️ 清理旧数据: ${key}`);
        }
      } catch (error) {
        logger.warn(`⚠️ 清理旧数据失败: ${key}`, error);
      }
    });
  }

  /**
   * 执行用户登出时的数据清理
   */
  async performLogoutCleanup(userId: string): Promise<boolean> {
    try {
      logger.info(`🔄 开始用户登出数据清理: ${userId}`);
      
      // 清理统一数据持久化管理器的用户状态
      unifiedDataPersistenceManager.setUserId(null);
      
      logger.info('✅ 用户登出数据清理完成');
      return true;
    } catch (error) {
      logger.error('❌ 用户登出数据清理失败:', error);
      return false;
    }
  }
}

// 创建全局实例
export const dataSyncManager = DataSyncManager.getInstance();
export const dataMigrationManager = DataMigrationManager.getInstance();
