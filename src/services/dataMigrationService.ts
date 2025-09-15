/**
 * 📦 数据迁移和同步服务
 * 
 * 功能：
 * 1. localStorage到Supabase的数据迁移
 * 2. 版本兼容性管理
 * 3. 数据完整性验证
 * 4. 批量迁移和增量同步
 * 5. 冲突检测和解决
 */

import i18n from '@/i18n';
import { unifiedStorage, STORAGE_CONFIG, DataCategory, StorageLayer } from './unifiedStorageStrategy';
import { safeSaveToLocalStorage, safeLoadFromLocalStorage } from '@/utils/safeDataStorage';
import { logger } from '@/utils/logger';

// 迁移状态枚举
export enum MigrationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// 迁移记录接口
export interface MigrationRecord {
  key: string;
  dataType: string;
  status: MigrationStatus;
  sourceSize: number;
  targetSize: number;
  startTime: string;
  endTime?: string;
  error?: string;
  checksum: string;
}

// 迁移计划接口
export interface MigrationPlan {
  totalItems: number;
  estimatedTime: number; // 秒
  dataSize: number; // 字节
  migrations: Array<{
    key: string;
    priority: number;
    dependencies: string[];
    estimatedSize: number;
  }>;
}

// 同步冲突接口
export interface SyncConflict {
  key: string;
  localData: any;
  remoteData: any;
  localTimestamp: string;
  remoteTimestamp: string;
  conflictType: 'timestamp' | 'structure' | 'content';
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge';
}

/**
 * 数据迁移服务
 */
export class DataMigrationService {
  private userId?: string;
  private migrationHistory: MigrationRecord[] = [];
  private syncConflicts: SyncConflict[] = [];

  constructor(userId?: string) {
    this.userId = userId;
    this.loadMigrationHistory();
  }

  /**
   * 设置用户ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
    unifiedStorage.setUserId(userId);
    this.loadMigrationHistory();
  }

  /**
   * 分析现有数据并生成迁移计划
   */
  async analyzeMigrationPlan(): Promise<MigrationPlan> {
    const localStorageData = this.scanLocalStorageData();
    const migrations: MigrationPlan['migrations'] = [];
    
    let totalSize = 0;
    let totalItems = 0;

    for (const [key, data] of Object.entries(localStorageData)) {
      const config = STORAGE_CONFIG[key];
      if (!config) {
        continue; // 跳过未配置的数据
      }

      // 只迁移需要数据库存储的数据
      if (config.layer === StorageLayer.DATABASE || config.layer === StorageLayer.HYBRID) {
        const dataSize = new Blob([JSON.stringify(data)]).size;
        
        migrations.push({
          key,
          priority: this.calculateMigrationPriority(config),
          dependencies: this.findDataDependencies(key),
          estimatedSize: dataSize
        });

        totalSize += dataSize;
        totalItems++;
      }
    }

    // 按优先级排序
    migrations.sort((a, b) => b.priority - a.priority);

    return {
      totalItems,
      estimatedTime: Math.max(totalItems * 2, 30), // 每项至少2秒，最少30秒
      dataSize: totalSize,
      migrations
    };
  }

  /**
   * 执行数据迁移
   */
  async executeMigration(plan: MigrationPlan, onProgress?: (progress: number, currentItem: string) => void): Promise<{
    success: boolean;
    migratedCount: number;
    failedCount: number;
    errors: string[];
  }> {
    let migratedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    logger.info('开始数据迁移', { totalItems: plan.totalItems, dataSize: plan.dataSize });

    for (let i = 0; i < plan.migrations.length; i++) {
      const migration = plan.migrations[i];
      const progress = (i / plan.migrations.length) * 100;
      
      onProgress?.(progress, migration.key);

      try {
        const result = await this.migrateSingleItem(migration.key);
        
        if (result.success) {
          migratedCount++;
          logger.debug(`迁移成功: ${migration.key}`);
        } else {
          failedCount++;
          errors.push(`${migration.key}: ${result.error}`);
          logger.error(`迁移失败: ${migration.key}`, result.error);
        }

      } catch (error) {
        failedCount++;
        const errorMsg = error instanceof Error ? error.message : i18n.t('common.errors.未知错误');
        errors.push(`${migration.key}: ${errorMsg}`);
        logger.error(`迁移异常: ${migration.key}`, error);
      }
    }

    onProgress?.(100, '迁移完成');

    const migrationSummary = {
      success: failedCount === 0,
      migratedCount,
      failedCount,
      errors
    };

    // 保存迁移记录
    await this.saveMigrationHistory();

    logger.info('数据迁移完成', migrationSummary);
    
    return migrationSummary;
  }

  /**
   * 增量同步数据
   */
  async incrementalSync(keys?: string[]): Promise<{
    syncedCount: number;
    conflictCount: number;
    conflicts: SyncConflict[];
  }> {
    const targetKeys = keys || Object.keys(STORAGE_CONFIG).filter(key => 
      STORAGE_CONFIG[key].syncEnabled
    );

    let syncedCount = 0;
    let conflictCount = 0;
    const conflicts: SyncConflict[] = [];

    for (const key of targetKeys) {
      try {
        const syncResult = await this.syncSingleKey(key);
        
        if (syncResult.conflict) {
          conflictCount++;
          conflicts.push(syncResult.conflict);
          this.syncConflicts.push(syncResult.conflict);
        } else {
          syncedCount++;
        }

      } catch (error) {
        logger.error(`同步失败: ${key}`, error);
      }
    }

    return {
      syncedCount,
      conflictCount,
      conflicts
    };
  }

  /**
   * 解决同步冲突
   */
  async resolveConflicts(
    conflicts: SyncConflict[], 
    resolver: (conflict: SyncConflict) => 'local' | 'remote' | 'merge'
  ): Promise<{
    resolvedCount: number;
    failedCount: number;
  }> {
    let resolvedCount = 0;
    let failedCount = 0;

    for (const conflict of conflicts) {
      try {
        const resolution = resolver(conflict);
        const success = await this.applyConflictResolution(conflict, resolution);
        
        if (success) {
          conflict.resolved = true;
          conflict.resolution = resolution;
          resolvedCount++;
        } else {
          failedCount++;
        }

      } catch (error) {
        logger.error(`冲突解决失败: ${conflict.key}`, error);
        failedCount++;
      }
    }

    // 更新冲突列表
    this.syncConflicts = this.syncConflicts.filter(c => !c.resolved);

    return { resolvedCount, failedCount };
  }

  /**
   * 数据完整性验证
   */
  async validateDataIntegrity(): Promise<{
    isValid: boolean;
    issues: Array<{
      key: string;
      issue: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }> {
    const issues: Array<{ key: string; issue: string; severity: 'low' | 'medium' | 'high' }> = [];

    for (const key of Object.keys(STORAGE_CONFIG)) {
      const config = STORAGE_CONFIG[key];
      
      try {
        // 检查本地数据
        const localResult = await unifiedStorage.load(key);
        
        // 检查数据库数据（如果应该存在的话）
        if (config.layer === StorageLayer.DATABASE || config.layer === StorageLayer.HYBRID) {
          const dbResult = await this.loadFromDatabase(key);
          
          if (localResult.success && dbResult.success) {
            // 比较数据一致性
            if (!this.compareData(localResult.data, dbResult.data)) {
              issues.push({
                key,
                issue: '本地数据与数据库数据不一致',
                severity: 'medium'
              });
            }
          } else if (localResult.success && !dbResult.success) {
            issues.push({
              key,
              issue: '本地有数据但数据库中不存在',
              severity: 'low'
            });
          } else if (!localResult.success && dbResult.success) {
            issues.push({
              key,
              issue: '数据库有数据但本地不存在',
              severity: 'low'
            });
          }
        }

        // 检查敏感数据的安全性
        if (config.category === DataCategory.SENSITIVE && config.encrypted) {
          if (!this.validateEncryption(localResult.data)) {
            issues.push({
              key,
              issue: '敏感数据未正确加密',
              severity: 'high'
            });
          }
        }

      } catch (error) {
        issues.push({
          key,
          issue: `数据验证失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`,
          severity: 'medium'
        });
      }
    }

    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      issues
    };
  }

  /**
   * 清理过期和无效数据
   */
  async cleanupData(): Promise<{
    removedCount: number;
    freedSpace: number;
  }> {
    let removedCount = 0;
    let freedSpace = 0;

    // 清理localStorage中的过期数据
    const allKeys = Object.keys(localStorage);
    
    for (const storageKey of allKeys) {
      try {
        const data = localStorage.getItem(storageKey);
        if (!data) continue;

        const parsed = JSON.parse(data);
        
        // 检查TTL
        if (parsed.ttl && parsed.timestamp) {
          const expired = Date.now() - parsed.timestamp > parsed.ttl * 1000;
          if (expired) {
            const dataSize = new Blob([data]).size;
            localStorage.removeItem(storageKey);
            removedCount++;
            freedSpace += dataSize;
            logger.debug(`清理过期数据: ${storageKey}`);
          }
        }

        // 检查用户权限（清理其他用户的数据）
        if (parsed.userId && parsed.userId !== this.userId) {
          const dataSize = new Blob([data]).size;
          localStorage.removeItem(storageKey);
          removedCount++;
          freedSpace += dataSize;
          logger.debug(`清理其他用户数据: ${storageKey}`);
        }

      } catch (error) {
        // 数据格式错误，也清理掉
        const data = localStorage.getItem(storageKey);
        if (data) {
          const dataSize = new Blob([data]).size;
          localStorage.removeItem(storageKey);
          removedCount++;
          freedSpace += dataSize;
          logger.debug(`清理损坏数据: ${storageKey}`);
        }
      }
    }

    logger.info('数据清理完成', { removedCount, freedSpace });
    
    return { removedCount, freedSpace };
  }

  /**
   * 获取迁移历史记录
   */
  getMigrationHistory(): MigrationRecord[] {
    return [...this.migrationHistory];
  }

  /**
   * 获取同步冲突列表
   */
  getSyncConflicts(): SyncConflict[] {
    return [...this.syncConflicts];
  }

  // ============ 私有方法实现 ============

  private scanLocalStorageData(): Record<string, any> {
    const data: Record<string, any> = {};
    
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            // 提取实际的数据key
            const dataKey = this.extractDataKey(key);
            if (dataKey && STORAGE_CONFIG[dataKey]) {
              data[dataKey] = parsed.data || parsed;
            }
          }
        } catch (error) {
          // 忽略无法解析的数据
        }
      }
    }

    return data;
  }

  private extractDataKey(storageKey: string): string | null {
    // 从localStorage key中提取数据key
    // 例如: "library_items_user123" -> "library_items"
    for (const configKey of Object.keys(STORAGE_CONFIG)) {
      if (storageKey.startsWith(configKey)) {
        return configKey;
      }
    }
    return null;
  }

  private calculateMigrationPriority(config: any): number {
    let priority = 0;
    
    // 敏感数据优先级最高
    if (config.category === DataCategory.SENSITIVE) {
      priority += 100;
    }
    
    // 业务数据次之
    if (config.category === DataCategory.BUSINESS) {
      priority += 80;
    }
    
    // 用户偏好数据
    if (config.category === DataCategory.PREFERENCE) {
      priority += 60;
    }
    
    // 需要版本控制的数据
    if (config.versionControl) {
      priority += 20;
    }
    
    // 启用同步的数据
    if (config.syncEnabled) {
      priority += 10;
    }

    return priority;
  }

  private findDataDependencies(key: string): string[] {
    // 找出数据依赖关系
    const dependencies: string[] = [];
    
    // 基于业务逻辑定义依赖关系
    const dependencyMap: Record<string, string[]> = {
      'library_items': ['favorites', 'share_history'],
      'brand_corpus': ['library_items'],
      'chat_history': ['user_profile'],
      // 更多依赖关系...
    };

    return dependencyMap[key] || [];
  }

  private async migrateSingleItem(key: string): Promise<{ success: boolean; error?: string }> {
    const startTime = new Date().toISOString();
    let migrationRecord: MigrationRecord;

    try {
      // 从localStorage加载数据
      const localResult = await unifiedStorage.load(key);
      
      if (!localResult.success || !localResult.data) {
        return { success: true }; // 没有数据需要迁移
      }

      const sourceSize = new Blob([JSON.stringify(localResult.data)]).size;
      
      // 创建迁移记录
      migrationRecord = {
        key,
        dataType: STORAGE_CONFIG[key]?.category || 'unknown',
        status: MigrationStatus.IN_PROGRESS,
        sourceSize,
        targetSize: 0,
        startTime,
        checksum: this.calculateChecksum(localResult.data)
      };

      this.migrationHistory.push(migrationRecord);

      // 保存到数据库
      const saveResult = await unifiedStorage.save(key, localResult.data);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || i18n.t('common.errors.保存失败'));
      }

      // 验证迁移结果
      const verifyResult = await this.verifyMigration(key, localResult.data);
      
      if (!verifyResult) {
        throw new Error(i18n.t('common.errors.迁移验证失败'));
      }

      // 更新迁移记录
      migrationRecord.status = MigrationStatus.COMPLETED;
      migrationRecord.endTime = new Date().toISOString();
      migrationRecord.targetSize = sourceSize; // 假设大小相同

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : i18n.t('common.errors.未知错误');
      
      if (migrationRecord!) {
        migrationRecord.status = MigrationStatus.FAILED;
        migrationRecord.endTime = new Date().toISOString();
        migrationRecord.error = errorMessage;
      }

      return { success: false, error: errorMessage };
    }
  }

  private async syncSingleKey(key: string): Promise<{
    success: boolean;
    conflict?: SyncConflict;
  }> {
    try {
      // 加载本地和远程数据
      const localResult = await this.loadFromLocal(key);
      const remoteResult = await this.loadFromDatabase(key);

      // 如果只有一边有数据，直接同步
      if (localResult.success && !remoteResult.success) {
        await unifiedStorage.save(key, localResult.data);
        return { success: true };
      }

      if (!localResult.success && remoteResult.success) {
        await this.saveToLocal(key, remoteResult.data);
        return { success: true };
      }

      // 两边都有数据，检查冲突
      if (localResult.success && remoteResult.success) {
        const conflict = this.detectConflict(key, localResult.data, remoteResult.data);
        
        if (conflict) {
          return { success: false, conflict };
        } else {
          // 无冲突，数据相同
          return { success: true };
        }
      }

      // 两边都没有数据
      return { success: true };

    } catch (error) {
      logger.error(`同步失败: ${key}`, error);
      return { success: false };
    }
  }

  private detectConflict(key: string, localData: any, remoteData: any): SyncConflict | null {
    // 检查数据结构
    if (typeof localData !== typeof remoteData) {
      return {
        key,
        localData,
        remoteData,
        localTimestamp: new Date().toISOString(),
        remoteTimestamp: new Date().toISOString(),
        conflictType: 'structure',
        resolved: false
      };
    }

    // 检查内容差异
    if (!this.compareData(localData, remoteData)) {
      return {
        key,
        localData,
        remoteData,
        localTimestamp: localData.updatedAt || new Date().toISOString(),
        remoteTimestamp: remoteData.updatedAt || new Date().toISOString(),
        conflictType: 'content',
        resolved: false
      };
    }

    return null;
  }

  private async applyConflictResolution(conflict: SyncConflict, resolution: 'local' | 'remote' | 'merge'): Promise<boolean> {
    try {
      let resolvedData: any;

      switch (resolution) {
        case 'local':
          resolvedData = conflict.localData;
          break;
        case 'remote':
          resolvedData = conflict.remoteData;
          break;
        case 'merge':
          resolvedData = this.mergeData(conflict.localData, conflict.remoteData);
          break;
      }

      // 保存解决后的数据
      const saveResult = await unifiedStorage.save(conflict.key, resolvedData);
      return saveResult.success;

    } catch (error) {
      logger.error(`应用冲突解决方案失败: ${conflict.key}`, error);
      return false;
    }
  }

  private compareData(data1: any, data2: any): boolean {
    return JSON.stringify(data1) === JSON.stringify(data2);
  }

  private mergeData(localData: any, remoteData: any): any {
    // 简单合并策略：优先使用最新的时间戳
    if (localData.updatedAt && remoteData.updatedAt) {
      return new Date(localData.updatedAt) > new Date(remoteData.updatedAt) 
        ? localData 
        : remoteData;
    }
    
    // 默认使用本地数据
    return localData;
  }

  private calculateChecksum(data: any): string {
    // 简单校验和实现
    return btoa(JSON.stringify(data)).slice(0, 8);
  }

  private async verifyMigration(key: string, originalData: any): Promise<boolean> {
    try {
      const verifyResult = await unifiedStorage.load(key);
      return verifyResult.success && this.compareData(originalData, verifyResult.data);
    } catch (error) {
      return false;
    }
  }

  private validateEncryption(data: any): boolean {
    // 简单的加密验证
    return typeof data === 'string' && data.length > 10;
  }

  private loadMigrationHistory(): void {
    const historyKey = `migration_history_${this.userId}`;
    const result = safeLoadFromLocalStorage<MigrationRecord[]>(historyKey, []);
    this.migrationHistory = result.data || [];
  }

  private async saveMigrationHistory(): Promise<void> {
    const historyKey = `migration_history_${this.userId}`;
    safeSaveToLocalStorage(historyKey, this.migrationHistory);
  }

  // 辅助方法
  private async loadFromLocal(key: string): Promise<{ success: boolean; data?: any }> {
    return await unifiedStorage.load(key);
  }

  private async loadFromDatabase(key: string): Promise<{ success: boolean; data?: any }> {
    // 直接从数据库加载的实现
    return await unifiedStorage.load(key);
  }

  private async saveToLocal(key: string, data: any): Promise<void> {
    await unifiedStorage.save(key, data);
  }
}

// 创建全局实例
export const dataMigrationService = new DataMigrationService();

// 便捷方法
export const analyzeMigration = () => dataMigrationService.analyzeMigrationPlan();
export const executeMigration = (plan: MigrationPlan, onProgress?: (progress: number, currentItem: string) => void) => 
  dataMigrationService.executeMigration(plan, onProgress);
export const syncData = (keys?: string[]) => dataMigrationService.incrementalSync(keys);
export const validateData = () => dataMigrationService.validateDataIntegrity();
export const cleanupData = () => dataMigrationService.cleanupData();