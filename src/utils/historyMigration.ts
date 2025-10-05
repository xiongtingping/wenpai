/**
 * 历史记录数据迁移工具
 * 将localStorage中的历史记录迁移到云端(UnifiedDataManager)
 * 
 * @version 1.0
 * @date 2025-10-05
 */

import { globalDataManager } from '@/services/unifiedDataManager';
import { logger } from '@/utils/logger';

/**
 * 历史记录项接口
 */
export interface HistoryItem {
  platformId: string;
  content: string;
  timestamp: string;
  title?: string;
}

/**
 * 迁移结果接口
 */
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  skippedCount: number;
}

/**
 * 从localStorage迁移历史记录到云端
 * @param userId 用户ID
 * @returns 迁移结果
 */
export async function migrateHistoryToCloud(userId: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    errors: [],
    skippedCount: 0
  };

  try {
    logger.info('🚀 开始迁移历史记录到云端', { userId });

    // 1. 读取localStorage中的历史记录
    const localKey = `user_history_${userId}`;
    const localData = localStorage.getItem(localKey);

    if (!localData) {
      logger.info('📭 没有找到本地历史记录', { localKey });
      result.success = true;
      return result;
    }

    let localHistory: HistoryItem[] = [];
    try {
      localHistory = JSON.parse(localData);
    } catch (parseError) {
      result.errors.push(`解析本地数据失败: ${parseError}`);
      logger.error('❌ 解析本地历史记录失败', parseError);
      return result;
    }

    if (!Array.isArray(localHistory) || localHistory.length === 0) {
      logger.info('📭 本地历史记录为空');
      result.success = true;
      return result;
    }

    logger.info(`📦 找到 ${localHistory.length} 条本地历史记录`);

    // 2. 读取云端现有历史记录
    const cloudHistory = await globalDataManager.getData<HistoryItem[]>('user_history') || [];
    logger.info(`☁️ 云端现有 ${cloudHistory.length} 条历史记录`);

    // 3. 合并数据(去重)
    const cloudTimestamps = new Set(cloudHistory.map(item => item.timestamp));
    const newItems: HistoryItem[] = [];

    for (const item of localHistory) {
      if (!cloudTimestamps.has(item.timestamp)) {
        newItems.push(item);
      } else {
        result.skippedCount++;
      }
    }

    if (newItems.length === 0) {
      logger.info('✅ 所有本地数据已存在于云端,无需迁移');
      result.success = true;
      return result;
    }

    logger.info(`🔄 准备迁移 ${newItems.length} 条新记录`);

    // 4. 合并并保存到云端(保留最新100条)
    const mergedHistory = [...newItems, ...cloudHistory].slice(0, 100);
    await globalDataManager.setData('user_history', mergedHistory);

    result.migratedCount = newItems.length;
    result.success = true;

    logger.info('✅ 历史记录迁移成功', {
      migratedCount: result.migratedCount,
      skippedCount: result.skippedCount,
      totalInCloud: mergedHistory.length
    });

    // 5. 备份本地数据后删除
    const backupKey = `${localKey}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, localData);
    localStorage.removeItem(localKey);
    logger.info('🗑️ 已删除本地数据并创建备份', { backupKey });

  } catch (error) {
    result.errors.push(`迁移失败: ${error}`);
    logger.error('❌ 历史记录迁移失败', error);
  }

  return result;
}

/**
 * 迁移访客历史记录到用户账户
 * @param userId 用户ID
 * @returns 迁移结果
 */
export async function migrateGuestHistoryToUser(userId: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    errors: [],
    skippedCount: 0
  };

  try {
    logger.info('🚀 开始迁移访客历史记录', { userId });

    // 1. 读取访客历史记录
    const guestKey = 'user_history_guest';
    const guestData = localStorage.getItem(guestKey);

    if (!guestData) {
      logger.info('📭 没有找到访客历史记录');
      result.success = true;
      return result;
    }

    let guestHistory: HistoryItem[] = [];
    try {
      guestHistory = JSON.parse(guestData);
    } catch (parseError) {
      result.errors.push(`解析访客数据失败: ${parseError}`);
      logger.error('❌ 解析访客历史记录失败', parseError);
      return result;
    }

    if (!Array.isArray(guestHistory) || guestHistory.length === 0) {
      logger.info('📭 访客历史记录为空');
      result.success = true;
      return result;
    }

    logger.info(`📦 找到 ${guestHistory.length} 条访客历史记录`);

    // 2. 读取用户云端历史记录
    const userHistory = await globalDataManager.getData<HistoryItem[]>('user_history') || [];
    logger.info(`☁️ 用户云端现有 ${userHistory.length} 条历史记录`);

    // 3. 合并数据(去重)
    const userTimestamps = new Set(userHistory.map(item => item.timestamp));
    const newItems: HistoryItem[] = [];

    for (const item of guestHistory) {
      if (!userTimestamps.has(item.timestamp)) {
        newItems.push(item);
      } else {
        result.skippedCount++;
      }
    }

    if (newItems.length === 0) {
      logger.info('✅ 所有访客数据已存在于用户账户,无需迁移');
      result.success = true;
      // 清理访客数据
      localStorage.removeItem(guestKey);
      return result;
    }

    logger.info(`🔄 准备迁移 ${newItems.length} 条访客记录`);

    // 4. 合并并保存到云端(保留最新100条)
    const mergedHistory = [...newItems, ...userHistory].slice(0, 100);
    await globalDataManager.setData('user_history', mergedHistory);

    result.migratedCount = newItems.length;
    result.success = true;

    logger.info('✅ 访客历史记录迁移成功', {
      migratedCount: result.migratedCount,
      skippedCount: result.skippedCount,
      totalInCloud: mergedHistory.length
    });

    // 5. 清理访客数据
    localStorage.removeItem(guestKey);
    logger.info('🗑️ 已清理访客历史记录');

  } catch (error) {
    result.errors.push(`迁移失败: ${error}`);
    logger.error('❌ 访客历史记录迁移失败', error);
  }

  return result;
}

/**
 * 自动迁移历史记录
 * 在用户登录时自动调用
 * @param userId 用户ID
 * @param wasGuest 之前是否为访客
 * @returns 迁移结果
 */
export async function autoMigrateHistory(userId: string, wasGuest: boolean = false): Promise<MigrationResult> {
  const combinedResult: MigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
    skippedCount: 0
  };

  try {
    // 1. 迁移localStorage中的用户历史记录
    const userMigration = await migrateHistoryToCloud(userId);
    combinedResult.migratedCount += userMigration.migratedCount;
    combinedResult.skippedCount += userMigration.skippedCount;
    combinedResult.errors.push(...userMigration.errors);
    if (!userMigration.success) {
      combinedResult.success = false;
    }

    // 2. 如果之前是访客,迁移访客数据
    if (wasGuest) {
      const guestMigration = await migrateGuestHistoryToUser(userId);
      combinedResult.migratedCount += guestMigration.migratedCount;
      combinedResult.skippedCount += guestMigration.skippedCount;
      combinedResult.errors.push(...guestMigration.errors);
      if (!guestMigration.success) {
        combinedResult.success = false;
      }
    }

    logger.info('✅ 自动迁移完成', combinedResult);
  } catch (error) {
    combinedResult.success = false;
    combinedResult.errors.push(`自动迁移失败: ${error}`);
    logger.error('❌ 自动迁移失败', error);
  }

  return combinedResult;
}

