/**
 * 🔄 认证数据同步Hook
 * 监听用户认证状态变化，自动处理数据迁移和同步
 */

import i18n from '@/i18n';
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dataMigrationManager } from '@/lib/dataSync';
import { unifiedDataPersistenceManager } from '@/lib/unifiedDataPersistenceManager';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

/**
 * 认证数据同步Hook
 * 自动处理用户登录登出时的数据迁移和同步
 */
export function useAuthDataSync() {
  const { user } = useAuth();
  const { toast } = useToast();
  const previousUserIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const currentUserId = user?.id || null;
    const previousUserId = previousUserIdRef.current;

    // 跳过初始化时的空状态
    if (!isInitializedRef.current && !currentUserId) {
      isInitializedRef.current = true;
      return;
    }

    // 用户状态发生变化
    if (currentUserId !== previousUserId) {
      handleUserStateChange(currentUserId, previousUserId);
      previousUserIdRef.current = currentUserId;
    }

    isInitializedRef.current = true;
  }, [user?.id, toast]);

  /**
   * 处理用户状态变化
   */
  const handleUserStateChange = async (currentUserId: string | null, previousUserId: string | null) => {
    try {
      if (currentUserId && !previousUserId) {
        // 用户登录
        await handleUserLogin(currentUserId);
      } else if (!currentUserId && previousUserId) {
        // 用户登出
        await handleUserLogout(previousUserId);
      } else if (currentUserId && previousUserId && currentUserId !== previousUserId) {
        // 用户切换
        await handleUserSwitch(currentUserId, previousUserId);
      }
    } catch (error) {
      logger.error('❌ 处理用户状态变化失败:', error);
    }
  };

  /**
   * 处理用户登录
   */
  const handleUserLogin = async (userId: string) => {
    try {
      logger.info(`🔄 处理用户登录: ${userId}`);
      
      // 设置用户ID到统一数据持久化管理器
      unifiedDataPersistenceManager.setUserId(userId);
      
      // 执行数据迁移
      const migrationResult = await dataMigrationManager.performLoginMigration(userId);
      
      if (migrationResult.success) {
        if (migrationResult.totalMigratedItems > 0) {
          toast({
            title: i18n.t('common.labels.数据同步成功'),
            description: `已将 ${migrationResult.totalMigratedItems} 项数据同步到云端，您的数据现在更安全了！`,
            duration: 5000
          });
          logger.info(`✅ 数据迁移成功: ${migrationResult.totalMigratedItems} 项`);
        } else {
          logger.info('✅ 用户登录处理完成，无需迁移数据');
        }
      } else {
        // 部分迁移失败，但不影响用户使用
        if (migrationResult.errors.length > 0) {
          logger.warn('⚠️ 数据迁移部分失败:', migrationResult.errors);
          
          // 只在有严重错误时才显示警告
          const hasSeriesErrors = migrationResult.errors.some(error => 
            error.includes(i18n.t('common.errors.异常')) || error.includes(i18n.t('common.errors.失败'))
          );
          
          if (hasSeriesErrors) {
            toast({
              title: i18n.t('common.labels.数据同步部分失败'),
              description: "部分数据同步失败，但不影响正常使用。您的数据仍然安全。",
              variant: "destructive",
              duration: 6000
            });
          }
        }
      }
    } catch (error) {
      logger.error('❌ 处理用户登录失败:', error);
      
      // 登录数据处理失败不应该阻止用户使用
      toast({
        title: i18n.t('common.labels.数据同步失败'),
        description: "登录时数据同步失败，但不影响正常使用。您可以稍后手动同步。",
        variant: "destructive",
        duration: 6000
      });
    }
  };

  /**
   * 处理用户登出
   */
  const handleUserLogout = async (userId: string) => {
    try {
      logger.info(`🔄 处理用户登出: ${userId}`);
      
      // 执行登出清理
      await dataMigrationManager.performLogoutCleanup(userId);
      
      // 清理统一数据持久化管理器的用户状态
      unifiedDataPersistenceManager.setUserId(null);
      
      logger.info('✅ 用户登出处理完成');
    } catch (error) {
      logger.error('❌ 处理用户登出失败:', error);
      
      // 登出清理失败不应该阻止用户登出
      // 静默处理，不显示错误提示
    }
  };

  /**
   * 处理用户切换
   */
  const handleUserSwitch = async (newUserId: string, oldUserId: string) => {
    try {
      logger.info(`🔄 处理用户切换: ${oldUserId} -> ${newUserId}`);
      
      // 先处理旧用户登出
      await handleUserLogout(oldUserId);
      
      // 再处理新用户登录
      await handleUserLogin(newUserId);
      
      logger.info('✅ 用户切换处理完成');
    } catch (error) {
      logger.error('❌ 处理用户切换失败:', error);
      
      toast({
        title: i18n.t('common.labels.用户切换数据处理失败'),
        description: "用户切换时数据处理失败，可能需要重新登录。",
        variant: "destructive"
      });
    }
  };

  return {
    currentUserId: user?.id || null,
    isInitialized: isInitializedRef.current
  };
}

/**
 * 自动认证数据同步组件
 * 在应用根部使用，自动处理认证状态变化时的数据同步
 */
export function AuthDataSyncProvider({ children }: { children: React.ReactNode }) {
  useAuthDataSync();
  return children;
}

/**
 * 手动数据同步Hook
 * 提供手动触发数据同步的功能
 */
export function useManualDataSync() {
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * 手动触发数据迁移
   */
  const triggerDataMigration = async (): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: i18n.t('common.labels.无法同步'),
        description: "请先登录后再尝试同步数据",
        variant: "destructive"
      });
      return false;
    }

    try {
      logger.info('🔄 手动触发数据迁移...');
      
      const migrationResult = await dataMigrationManager.performLoginMigration(user.id);
      
      if (migrationResult.success) {
        if (migrationResult.totalMigratedItems > 0) {
          toast({
            title: i18n.t('common.labels.数据同步成功'),
            description: `已同步 ${migrationResult.totalMigratedItems} 项数据到云端`,
          });
        } else {
          toast({
            title: i18n.t('common.labels.数据已是最新'),
            description: "您的数据已经是最新的，无需同步",
          });
        }
        return true;
      } else {
        toast({
          title: i18n.t('common.labels.数据同步失败'),
          description: `同步失败: ${migrationResult.errors.join(', ')}`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      logger.error('❌ 手动数据迁移失败:', error);
      toast({
        title: i18n.t('common.labels.同步异常'),
        description: "数据同步时发生异常，请稍后重试",
        variant: "destructive"
      });
      return false;
    }
  };

  /**
   * 重置数据持久化状态
   */
  const resetDataPersistence = async (): Promise<boolean> => {
    try {
      logger.info('🔄 重置数据持久化状态...');
      
      // 清理当前用户状态
      unifiedDataPersistenceManager.setUserId(null);
      
      // 如果用户已登录，重新设置
      if (user?.id) {
        unifiedDataPersistenceManager.setUserId(user.id);
      }
      
      toast({
        title: i18n.t('common.labels.重置成功'),
        description: "数据持久化状态已重置",
      });
      
      return true;
    } catch (error) {
      logger.error('❌ 重置数据持久化状态失败:', error);
      toast({
        title: i18n.t('common.labels.重置失败'),
        description: "重置时发生异常，请刷新页面重试",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    triggerDataMigration,
    resetDataPersistence,
    canSync: !!user?.id
  };
}
