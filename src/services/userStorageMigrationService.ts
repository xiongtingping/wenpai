/**
 * 用户存储迁移服务
 * 
 * 🎯 目的：统一localStorage中的用户数据存储
 */

import { UserIdValidator } from '@/utils/userIdValidator';
import { logger } from '@/utils/logger';

interface UserData {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  loginTime?: string;
  [key: string]: any;
}

interface MigrationResult {
  success: boolean;
  migratedFrom?: string;
  userData?: UserData;
  error?: string;
  cleanedKeys?: string[];
}

export class UserStorageMigrationService {
  private static readonly PRIMARY_KEY = 'wenpai-unified-store';
  private static readonly LEGACY_KEYS = ['authing_user', '_authing_user', 'auth-storage'];
  private static readonly MIGRATION_FLAG_KEY = 'wenpai_storage_migrated';

  static migrate(): MigrationResult {
    try {
      logger.info('🔄 开始用户存储迁移...');

      if (this.hasMigrated()) {
        logger.info('✅ 用户存储已经迁移过，跳过');
        return { success: true };
      }

      const existingData = this.getFromPrimaryKey();
      if (existingData) {
        logger.info('✅ 主存储键已有数据，标记为已迁移');
        this.markAsMigrated();
        return { success: true, userData: existingData };
      }

      const { userData, sourceKey } = this.findUserDataFromLegacyKeys();
      
      if (!userData) {
        logger.info('ℹ️ 未找到需要迁移的用户数据');
        this.markAsMigrated();
        return { success: true };
      }

      if (!UserIdValidator.isValid(userData.id)) {
        logger.error('❌ 迁移失败：用户ID无效', { userId: userData.id });
        return { success: false, error: '用户ID无效' };
      }

      this.saveToPrimaryKey(userData);
      logger.info('✅ 用户数据已迁移到主存储键', {
        from: sourceKey,
        userId: UserIdValidator.formatForLog(userData.id)
      });

      const cleanedKeys = this.cleanLegacyKeys();
      logger.info('🧹 已清理旧存储键', { keys: cleanedKeys });

      this.markAsMigrated();

      return { success: true, migratedFrom: sourceKey, userData, cleanedKeys };
    } catch (error) {
      logger.error('❌ 用户存储迁移失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  private static hasMigrated(): boolean {
    return localStorage.getItem(this.MIGRATION_FLAG_KEY) === 'true';
  }

  private static markAsMigrated(): void {
    localStorage.setItem(this.MIGRATION_FLAG_KEY, 'true');
  }

  private static getFromPrimaryKey(): UserData | null {
    try {
      const data = localStorage.getItem(this.PRIMARY_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      if (parsed.state && parsed.state.user) {
        return parsed.state.user;
      }

      if (parsed.id) {
        return parsed;
      }

      return null;
    } catch (error) {
      logger.error('解析主存储键数据失败:', error);
      return null;
    }
  }

  private static findUserDataFromLegacyKeys(): { userData: UserData | null; sourceKey?: string } {
    for (const key of this.LEGACY_KEYS) {
      try {
        const data = localStorage.getItem(key);
        if (!data) continue;

        const parsed = JSON.parse(data);
        
        let userData: UserData | null = null;

        if (parsed.id) {
          userData = parsed;
        } else if (parsed.user && parsed.user.id) {
          userData = parsed.user;
        } else if (parsed.state && parsed.state.user && parsed.state.user.id) {
          userData = parsed.state.user;
        }

        if (userData && UserIdValidator.isValid(userData.id)) {
          logger.info(`📦 从旧键找到用户数据: ${key}`, {
            userId: UserIdValidator.formatForLog(userData.id)
          });
          return { userData, sourceKey: key };
        }
      } catch (error) {
        logger.warn(`解析旧键 ${key} 失败:`, error);
        continue;
      }
    }

    return { userData: null };
  }

  private static saveToPrimaryKey(userData: UserData): void {
    try {
      const existingStore = localStorage.getItem(this.PRIMARY_KEY);
      let storeData: any = {};

      if (existingStore) {
        try {
          storeData = JSON.parse(existingStore);
        } catch (error) {
          logger.warn('解析现有store数据失败，将创建新的');
        }
      }

      if (!storeData.state) {
        storeData.state = {};
      }

      storeData.state.user = userData;
      storeData.state.isAuthenticated = true;
      storeData.version = storeData.version || 0;

      localStorage.setItem(this.PRIMARY_KEY, JSON.stringify(storeData));
      logger.info('✅ 用户数据已保存到主存储键');
    } catch (error) {
      logger.error('保存到主存储键失败:', error);
      throw error;
    }
  }

  private static cleanLegacyKeys(): string[] {
    const cleanedKeys: string[] = [];

    for (const key of this.LEGACY_KEYS) {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          cleanedKeys.push(key);
        }
      } catch (error) {
        logger.warn(`清理旧键 ${key} 失败:`, error);
      }
    }

    return cleanedKeys;
  }

  static forceMigrate(): MigrationResult {
    localStorage.removeItem(this.MIGRATION_FLAG_KEY);
    return this.migrate();
  }

  static getMigrationStatus(): {
    migrated: boolean;
    primaryKeyExists: boolean;
    legacyKeysFound: string[];
  } {
    const legacyKeysFound: string[] = [];

    for (const key of this.LEGACY_KEYS) {
      if (localStorage.getItem(key)) {
        legacyKeysFound.push(key);
      }
    }

    return {
      migrated: this.hasMigrated(),
      primaryKeyExists: !!localStorage.getItem(this.PRIMARY_KEY),
      legacyKeysFound
    };
  }
}

export const autoMigrateUserStorage = (): MigrationResult => {
  return UserStorageMigrationService.migrate();
};
