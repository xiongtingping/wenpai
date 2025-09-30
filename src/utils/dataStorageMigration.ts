/**
 * 🔄 数据存储迁移工具
 * 将localStorage中的用户数据迁移到Supabase云端存储
 * 
 * 解决混合存储架构问题：
 * - 统一数据存储到Supabase
 * - 自动迁移现有localStorage数据
 * - 保持向后兼容性
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { TABLE_NAMES } from '@/config/supabaseTables';
import { getSupabaseService, type CloudDataService } from '@/lib/unifiedDataPersistenceManager';

export interface MigrationResult {
  success: boolean;
  migratedItems: number;
  errors: string[];
  details: {
    [key: string]: {
      success: boolean;
      itemCount: number;
      error?: string;
    }
  };
}

/**
 * 数据迁移器类
 */
export class DataStorageMigration {
  private userId: string;
  private supabaseService: CloudDataService;

  constructor(userId: string) {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }
    this.userId = userId;
    this.supabaseService = getSupabaseService(userId, TABLE_NAMES.USER_BRAND_CORPUS);
  }

  /**
   * 执行完整的数据迁移
   */
  async migrateAllUserData(): Promise<MigrationResult> {
    console.log('🔄 开始完整数据迁移，用户ID:', this.userId);
    
    const result: MigrationResult = {
      success: true,
      migratedItems: 0,
      errors: [],
      details: {}
    };

    // 定义需要迁移的数据类型
    const migrations = [
      { 
        storageKey: `brand_assets_${this.userId}`, 
        corpusType: 'brand_assets',
        description: '品牌资产库'
      },
      { 
        storageKey: `brand_dimensions_${this.userId}`, 
        corpusType: 'brand_dimensions',
        description: '品牌维度数据'
      },
      { 
        storageKey: `user_history_${this.userId}`, 
        corpusType: 'user_history',
        description: '用户历史记录'
      },
      { 
        storageKey: `adapt_history_${this.userId}`, 
        corpusType: 'adapt_history',
        description: '改写历史记录'
      },
      { 
        storageKey: `creative_history_${this.userId}`, 
        corpusType: 'creative_history',
        description: '创意生成历史'
      }
    ];

    // 执行每个迁移任务
    for (const migration of migrations) {
      try {
        const migrationResult = await this.migrateSingleDataType(migration);
        result.details[migration.corpusType] = migrationResult;
        result.migratedItems += migrationResult.itemCount;
        
        if (!migrationResult.success) {
          result.success = false;
          result.errors.push(`${migration.description}迁移失败: ${migrationResult.error}`);
        }
      } catch (error) {
        const errorMsg = `${migration.description}迁移异常: ${error instanceof Error ? error.message : i18n.t('utils.errors.未知错误')}`;
        result.errors.push(errorMsg);
        result.success = false;
        result.details[migration.corpusType] = {
          success: false,
          itemCount: 0,
          error: errorMsg
        };
      }
    }

    // 迁移完成后的清理
    if (result.success) {
      await this.cleanupAfterMigration(migrations.map(m => m.storageKey));
    }

    console.log('✅ 数据迁移完成:', {
      总计: result.migratedItems,
      成功: result.success,
      错误数量: result.errors.length
    });

    return result;
  }

  /**
   * 迁移单个数据类型
   */
  private async migrateSingleDataType(migration: {
    storageKey: string;
    corpusType: string;
    description: string;
  }): Promise<{ success: boolean; itemCount: number; error?: string }> {
    
    try {
      // 从localStorage获取数据
      const localData = localStorage.getItem(migration.storageKey);
      if (!localData) {
        console.log(`📭 ${migration.description}没有本地数据需要迁移`);
        return { success: true, itemCount: 0 };
      }

      const parsedData = JSON.parse(localData);
      if (!parsedData || (Array.isArray(parsedData) && parsedData.length === 0)) {
        console.log(`📭 ${migration.description}本地数据为空`);
        return { success: true, itemCount: 0 };
      }

      // 检查Supabase中是否已存在该类型的数据（使用brand_name字段替代corpusType）
      const uniqueBrandName = `${migration.description}_${this.userId}`;
      const existingData = await this.supabaseService.findMany({
        filters: { brand_name: uniqueBrandName },
        limit: 1
      });

      const dataToSave = {
        brand_name: uniqueBrandName,
        brand_description: `数据迁移: ${migration.description}`,
        content_samples: [JSON.stringify(parsedData)], // 将数据存储在content_samples数组中
        metadata: {
          migratedFromLocalStorage: true,
          migrationDate: new Date().toISOString(),
          originalStorageKey: migration.storageKey,
          itemCount: Array.isArray(parsedData) ? parsedData.length : 1,
          dataType: migration.corpusType,
          corpusType: migration.corpusType // 在metadata中保存原来的corpusType信息
        }
      };

      // 如果已存在数据，更新；否则创建新记录
      if (existingData.data && existingData.data.length > 0) {
        await this.supabaseService.update(existingData.data[0].id, dataToSave);
        console.log(`🔄 更新了${migration.description}数据到Supabase`);
      } else {
        await this.supabaseService.create(dataToSave);
        console.log(`✅ 创建了${migration.description}数据到Supabase`);
      }

      const itemCount = Array.isArray(parsedData) ? parsedData.length : 1;
      console.log(`📦 ${migration.description}迁移成功: ${itemCount} 项`);
      
      return { 
        success: true, 
        itemCount 
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : i18n.t('utils.errors.未知错误');
      console.error(`❌ ${migration.description}迁移失败:`, error);
      return { 
        success: false, 
        itemCount: 0, 
        error: errorMsg 
      };
    }
  }

  /**
   * 迁移后清理localStorage数据（可选）
   */
  private async cleanupAfterMigration(storageKeys: string[]): Promise<void> {
    try {
      console.log('🧹 开始清理已迁移的localStorage数据...');
      
      for (const key of storageKeys) {
        if (localStorage.getItem(key)) {
          // 创建备份键名（以防需要恢复）
          const backupKey = `${key}_migrated_backup_${Date.now()}`;
          const data = localStorage.getItem(key);
          
          if (data) {
            localStorage.setItem(backupKey, data);
            localStorage.removeItem(key);
            console.log(`🗑️ 已清理并备份: ${key} -> ${backupKey}`);
          }
        }
      }

      console.log('✅ localStorage清理完成');
    } catch (error) {
      console.error('❌ localStorage清理失败:', error);
    }
  }

  /**
   * 验证迁移结果
   */
  async validateMigration(): Promise<{
    isValid: boolean;
    issues: string[];
    supabaseDataCount: number;
    localBackupCount: number;
  }> {
    const issues: string[] = [];
    let supabaseDataCount = 0;
    let localBackupCount = 0;

    try {
      // 检查Supabase中的数据
      const allSupabaseData = await this.supabaseService.findMany({});
      supabaseDataCount = allSupabaseData.data?.length || 0;

      if (supabaseDataCount === 0) {
        issues.push('Supabase中没有找到用户数据');
      }

      // 检查localStorage备份
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(key => 
        key.includes(this.userId) && key.includes('_migrated_backup_')
      );
      localBackupCount = backupKeys.length;

      // 检查是否有未清理的原始数据
      const originalKeys = allKeys.filter(key => 
        (key.includes(`brand_assets_${this.userId}`) || 
         key.includes(`brand_dimensions_${this.userId}`) ||
         key.includes(`user_history_${this.userId}`) ||
         key.includes(`adapt_history_${this.userId}`) ||
         key.includes(`creative_history_${this.userId}`)) &&
        !key.includes('_migrated_backup_')
      );

      if (originalKeys.length > 0) {
        issues.push(`仍有 ${originalKeys.length} 个原始localStorage键未清理: ${originalKeys.join(', ')}`);
      }

      console.log('🔍 迁移验证结果:', {
        Supabase数据数量: supabaseDataCount,
        localStorage备份数量: localBackupCount,
        问题数量: issues.length
      });

      return {
        isValid: issues.length === 0,
        issues,
        supabaseDataCount,
        localBackupCount
      };

    } catch (error) {
      issues.push(`验证过程出错: ${error instanceof Error ? error.message : i18n.t('utils.errors.未知错误')}`);
      return {
        isValid: false,
        issues,
        supabaseDataCount,
        localBackupCount
      };
    }
  }

  /**
   * 回滚迁移（从备份恢复到localStorage）
   */
  async rollbackMigration(): Promise<{ success: boolean; restoredItems: number; errors: string[] }> {
    console.log('🔄 开始回滚数据迁移...');
    
    const result = {
      success: true,
      restoredItems: 0,
      errors: [] as string[]
    };

    try {
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(key => 
        key.includes(this.userId) && key.includes('_migrated_backup_')
      );

      for (const backupKey of backupKeys) {
        try {
          const backupData = localStorage.getItem(backupKey);
          if (backupData) {
            // 恢复原始键名
            const originalKey = backupKey.replace(/_migrated_backup_\d+$/, '');
            localStorage.setItem(originalKey, backupData);
            localStorage.removeItem(backupKey);
            result.restoredItems++;
            console.log(`🔄 已恢复: ${backupKey} -> ${originalKey}`);
          }
        } catch (error) {
          const errorMsg = `恢复${backupKey}失败: ${error instanceof Error ? error.message : i18n.t('utils.errors.未知错误')}`;
          result.errors.push(errorMsg);
          result.success = false;
        }
      }

      console.log(`✅ 迁移回滚完成，恢复了 ${result.restoredItems} 项数据`);
      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`回滚过程异常: ${error instanceof Error ? error.message : i18n.t('utils.errors.未知错误')}`);
      return result;
    }
  }
}

/**
 * 快速迁移工具函数
 */
export async function quickMigrateUserData(userId: string): Promise<MigrationResult> {
  try {
    const migrator = new DataStorageMigration(userId);
    return await migrator.migrateAllUserData();
  } catch (error) {
    return {
      success: false,
      migratedItems: 0,
      errors: [error instanceof Error ? error.message : i18n.t('utils.errors.迁移初始化失败')],
      details: {}
    };
  }
}

/**
 * 验证用户数据迁移状态
 */
export async function validateUserDataMigration(userId: string) {
  try {
    const migrator = new DataStorageMigration(userId);
    return await migrator.validateMigration();
  } catch (error) {
    return {
      isValid: false,
      issues: [error instanceof Error ? error.message : i18n.t('utils.errors.验证失败')],
      supabaseDataCount: 0,
      localBackupCount: 0
    };
  }
}

export default DataStorageMigration;
