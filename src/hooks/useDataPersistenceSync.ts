/**
 * 🔄 数据持久化同步Hook
 * 处理用户登录状态变化时的数据同步和迁移
 */

import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dataMigrationManager, dataSyncManager, DataSyncStatus, DataMigrationResult } from '@/lib/dataSync';
import { unifiedDataPersistenceManager } from '@/lib/unifiedDataPersistenceManager';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

/**
 * 数据持久化同步Hook
 */
export function useDataPersistenceSync() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<DataSyncStatus>(dataSyncManager.getSyncStatus());
  const [migrationResult, setMigrationResult] = useState<DataMigrationResult | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 监听同步状态变化
  useEffect(() => {
    const handleSyncStatusChange = (status: DataSyncStatus) => {
      setSyncStatus(status);
    };

    dataSyncManager.addSyncListener(handleSyncStatusChange);

    return () => {
      dataSyncManager.removeSyncListener(handleSyncStatusChange);
    };
  }, []);

  // 处理用户登录状态变化
  useEffect(() => {
    const handleUserStateChange = async () => {
      if (user?.id) {
        // 用户登录
        await handleUserLogin(user.id);
      } else {
        // 用户登出
        await handleUserLogout();
      }
    };

    handleUserStateChange();
  }, [user?.id]);

  /**
   * 处理用户登录
   */
  const handleUserLogin = useCallback(async (userId: string) => {
    try {
      logger.info(`🔄 处理用户登录: ${userId}`);
      
      // 设置用户ID到统一数据持久化管理器
      unifiedDataPersistenceManager.setUserId(userId);
      
      // 执行数据迁移
      const result = await dataMigrationManager.performLoginMigration(userId);
      setMigrationResult(result);
      
      if (result.success) {
        if (result.totalMigratedItems > 0) {
          toast({
            title: "数据迁移成功",
            description: `已将 ${result.totalMigratedItems} 项数据迁移到云端存储，您的数据现在更安全了！`,
            duration: 5000
          });
          logger.info(`✅ 数据迁移成功: ${result.totalMigratedItems} 项`);
        } else {
          logger.info('✅ 用户登录处理完成，无需迁移数据');
        }
      } else {
        toast({
          title: "数据迁移部分失败",
          description: `部分数据迁移失败，但不影响正常使用。错误: ${result.errors.join(', ')}`,
          variant: "destructive",
          duration: 8000
        });
        logger.warn('⚠️ 数据迁移部分失败:', result.errors);
      }
      
      setIsInitialized(true);
    } catch (error) {
      logger.error('❌ 处理用户登录失败:', error);
      toast({
        title: "登录数据处理失败",
        description: "用户数据处理时发生错误，部分功能可能受影响",
        variant: "destructive"
      });
      setIsInitialized(true);
    }
  }, [toast]);

  /**
   * 处理用户登出
   */
  const handleUserLogout = useCallback(async () => {
    try {
      logger.info('🔄 处理用户登出');
      
      // 清理统一数据持久化管理器的用户状态
      unifiedDataPersistenceManager.setUserId(null);
      
      // 重置状态
      setMigrationResult(null);
      setIsInitialized(false);
      
      logger.info('✅ 用户登出处理完成');
    } catch (error) {
      logger.error('❌ 处理用户登出失败:', error);
    }
  }, []);

  /**
   * 手动触发同步
   */
  const triggerManualSync = useCallback(async () => {
    try {
      const success = await dataSyncManager.manualSync();
      if (success) {
        toast({
          title: "同步成功",
          description: "数据已成功同步到云端",
        });
      } else {
        toast({
          title: "同步失败",
          description: "数据同步失败，请稍后重试",
          variant: "destructive"
        });
      }
      return success;
    } catch (error) {
      toast({
        title: "同步错误",
        description: String(error),
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  /**
   * 获取数据迁移摘要
   */
  const getMigrationSummary = useCallback(() => {
    if (!migrationResult) return null;
    
    return {
      success: migrationResult.success,
      totalItems: migrationResult.totalMigratedItems,
      dataTypes: migrationResult.migratedDataTypes,
      errors: migrationResult.errors,
      hasErrors: migrationResult.errors.length > 0
    };
  }, [migrationResult]);

  /**
   * 检查特定数据类型的迁移状态
   */
  const getDataTypeMigrationStatus = useCallback((dataType: string) => {
    if (!migrationResult || !migrationResult.details[dataType]) {
      return null;
    }
    
    return migrationResult.details[dataType];
  }, [migrationResult]);

  return {
    // 状态
    syncStatus,
    migrationResult,
    isInitialized,
    
    // 方法
    triggerManualSync,
    getMigrationSummary,
    getDataTypeMigrationStatus,
    
    // 计算属性
    isOnline: syncStatus.isOnline,
    isSyncing: syncStatus.isSyncing,
    hasSyncErrors: syncStatus.syncErrors.length > 0,
    lastSyncTime: syncStatus.lastSyncTime,
    
    // 迁移状态
    hasMigrationResult: !!migrationResult,
    migrationSuccess: migrationResult?.success ?? null,
    migratedItemsCount: migrationResult?.totalMigratedItems ?? 0,
    migrationErrors: migrationResult?.errors ?? []
  };
}

/**
 * 简化的数据持久化状态Hook
 */
export function useDataPersistenceStatus() {
  const { 
    isOnline, 
    isSyncing, 
    hasSyncErrors, 
    lastSyncTime,
    migrationSuccess,
    migratedItemsCount 
  } = useDataPersistenceSync();

  return {
    isOnline,
    isSyncing,
    hasSyncErrors,
    lastSyncTime,
    migrationSuccess,
    migratedItemsCount,
    
    // 状态描述
    statusText: isSyncing 
      ? '同步中...' 
      : isOnline 
        ? '已连接' 
        : '离线',
    
    statusColor: hasSyncErrors 
      ? 'red' 
      : isSyncing 
        ? 'yellow' 
        : isOnline 
          ? 'green' 
          : 'gray'
  };
}

/**
 * 数据迁移状态Hook
 */
export function useDataMigrationStatus() {
  const { 
    migrationResult, 
    getMigrationSummary, 
    getDataTypeMigrationStatus 
  } = useDataPersistenceSync();

  return {
    migrationResult,
    getMigrationSummary,
    getDataTypeMigrationStatus,
    
    // 便捷属性
    hasMigrated: !!migrationResult && migrationResult.totalMigratedItems > 0,
    migrationSuccess: migrationResult?.success ?? null,
    totalMigratedItems: migrationResult?.totalMigratedItems ?? 0,
    migrationErrors: migrationResult?.errors ?? []
  };
}
