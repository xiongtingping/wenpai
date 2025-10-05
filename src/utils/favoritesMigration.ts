/**
 * 收藏数据迁移工具
 * 将localStorage中的收藏数据迁移到云端(UnifiedDataManager)
 * 
 * @version 1.0
 * @date 2025-10-05
 */

import { globalDataManager } from '@/services/unifiedDataManager';
import { logger } from '@/utils/logger';
import type { FavoriteItem } from '@/services/favoritesService';

/**
 * 迁移结果接口
 */
export interface FavoritesMigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  skippedCount: number;
}

/**
 * 从localStorage迁移收藏到云端
 * @param userId 用户ID
 * @returns 迁移结果
 */
export async function migrateFavoritesToCloud(userId: string): Promise<FavoritesMigrationResult> {
  const result: FavoritesMigrationResult = {
    success: false,
    migratedCount: 0,
    errors: [],
    skippedCount: 0
  };

  try {
    logger.info('🚀 开始迁移收藏数据到云端', { userId });

    // 1. 读取localStorage中的收藏数据
    const localKey = `favorites_${userId}`;
    const localData = localStorage.getItem(localKey);

    if (!localData) {
      logger.info('📭 没有找到本地收藏数据', { localKey });
      result.success = true;
      return result;
    }

    let localFavorites: FavoriteItem[] = [];
    try {
      localFavorites = JSON.parse(localData);
    } catch (parseError) {
      result.errors.push(`解析本地数据失败: ${parseError}`);
      logger.error('❌ 解析本地收藏数据失败', parseError);
      return result;
    }

    if (!Array.isArray(localFavorites) || localFavorites.length === 0) {
      logger.info('📭 本地收藏数据为空');
      result.success = true;
      return result;
    }

    logger.info(`📦 找到 ${localFavorites.length} 条本地收藏`);

    // 2. 读取云端现有收藏
    const cloudFavorites = await globalDataManager.getData<FavoriteItem[]>('favorites') || [];
    logger.info(`☁️ 云端现有 ${cloudFavorites.length} 条收藏`);

    // 3. 合并数据(去重 - 基于ID)
    const cloudIds = new Set(cloudFavorites.map(item => item.id));
    const newItems: FavoriteItem[] = [];

    for (const item of localFavorites) {
      if (!cloudIds.has(item.id)) {
        newItems.push(item);
      } else {
        result.skippedCount++;
      }
    }

    if (newItems.length === 0) {
      logger.info('✅ 所有本地收藏已存在于云端,无需迁移');
      result.success = true;
      return result;
    }

    logger.info(`🔄 准备迁移 ${newItems.length} 条新收藏`);

    // 4. 合并并保存到云端
    const mergedFavorites = [...newItems, ...cloudFavorites];
    await globalDataManager.setData('favorites', mergedFavorites);

    result.migratedCount = newItems.length;
    result.success = true;

    logger.info('✅ 收藏数据迁移成功', {
      migratedCount: result.migratedCount,
      skippedCount: result.skippedCount,
      totalInCloud: mergedFavorites.length
    });

    // 5. 备份本地数据后删除
    const backupKey = `${localKey}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, localData);
    localStorage.removeItem(localKey);
    logger.info('🗑️ 已删除本地收藏数据并创建备份', { backupKey });

  } catch (error) {
    result.errors.push(`迁移失败: ${error}`);
    logger.error('❌ 收藏数据迁移失败', error);
  }

  return result;
}

/**
 * 迁移访客收藏到用户账户
 * @param userId 用户ID
 * @returns 迁移结果
 */
export async function migrateGuestFavoritesToUser(userId: string): Promise<FavoritesMigrationResult> {
  const result: FavoritesMigrationResult = {
    success: false,
    migratedCount: 0,
    errors: [],
    skippedCount: 0
  };

  try {
    logger.info('🚀 开始迁移访客收藏数据', { userId });

    // 1. 读取访客收藏数据
    const guestKey = 'favorites_guest';
    const guestData = localStorage.getItem(guestKey);

    if (!guestData) {
      logger.info('📭 没有找到访客收藏数据');
      result.success = true;
      return result;
    }

    let guestFavorites: FavoriteItem[] = [];
    try {
      guestFavorites = JSON.parse(guestData);
    } catch (parseError) {
      result.errors.push(`解析访客数据失败: ${parseError}`);
      logger.error('❌ 解析访客收藏数据失败', parseError);
      return result;
    }

    if (!Array.isArray(guestFavorites) || guestFavorites.length === 0) {
      logger.info('📭 访客收藏数据为空');
      result.success = true;
      return result;
    }

    logger.info(`📦 找到 ${guestFavorites.length} 条访客收藏`);

    // 2. 读取用户云端收藏
    const userFavorites = await globalDataManager.getData<FavoriteItem[]>('favorites') || [];
    logger.info(`☁️ 用户云端现有 ${userFavorites.length} 条收藏`);

    // 3. 合并数据(去重 - 基于ID)
    const userIds = new Set(userFavorites.map(item => item.id));
    const newItems: FavoriteItem[] = [];

    for (const item of guestFavorites) {
      if (!userIds.has(item.id)) {
        newItems.push(item);
      } else {
        result.skippedCount++;
      }
    }

    if (newItems.length === 0) {
      logger.info('✅ 所有访客收藏已存在于用户账户,无需迁移');
      result.success = true;
      // 清理访客数据
      localStorage.removeItem(guestKey);
      return result;
    }

    logger.info(`🔄 准备迁移 ${newItems.length} 条访客收藏`);

    // 4. 合并并保存到云端
    const mergedFavorites = [...newItems, ...userFavorites];
    await globalDataManager.setData('favorites', mergedFavorites);

    result.migratedCount = newItems.length;
    result.success = true;

    logger.info('✅ 访客收藏数据迁移成功', {
      migratedCount: result.migratedCount,
      skippedCount: result.skippedCount,
      totalInCloud: mergedFavorites.length
    });

    // 5. 清理访客数据
    localStorage.removeItem(guestKey);
    logger.info('🗑️ 已清理访客收藏数据');

  } catch (error) {
    result.errors.push(`迁移失败: ${error}`);
    logger.error('❌ 访客收藏数据迁移失败', error);
  }

  return result;
}

/**
 * 自动迁移收藏数据
 * 在用户登录时自动调用
 * @param userId 用户ID
 * @param wasGuest 之前是否为访客
 * @returns 迁移结果
 */
export async function autoMigrateFavorites(userId: string, wasGuest: boolean = false): Promise<FavoritesMigrationResult> {
  const combinedResult: FavoritesMigrationResult = {
    success: true,
    migratedCount: 0,
    errors: [],
    skippedCount: 0
  };

  try {
    // 1. 迁移localStorage中的用户收藏
    const userMigration = await migrateFavoritesToCloud(userId);
    combinedResult.migratedCount += userMigration.migratedCount;
    combinedResult.skippedCount += userMigration.skippedCount;
    combinedResult.errors.push(...userMigration.errors);
    if (!userMigration.success) {
      combinedResult.success = false;
    }

    // 2. 如果之前是访客,迁移访客数据
    if (wasGuest) {
      const guestMigration = await migrateGuestFavoritesToUser(userId);
      combinedResult.migratedCount += guestMigration.migratedCount;
      combinedResult.skippedCount += guestMigration.skippedCount;
      combinedResult.errors.push(...guestMigration.errors);
      if (!guestMigration.success) {
        combinedResult.success = false;
      }
    }

    logger.info('✅ 收藏自动迁移完成', combinedResult);
  } catch (error) {
    combinedResult.success = false;
    combinedResult.errors.push(`自动迁移失败: ${error}`);
    logger.error('❌ 收藏自动迁移失败', error);
  }

  return combinedResult;
}

