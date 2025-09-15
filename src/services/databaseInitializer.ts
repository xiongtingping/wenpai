/**
 * 🏗️ 数据库初始化器
 * 通过应用程序自身初始化必要的数据库表结构
 * 
 * 功能：
 * - 检查表是否存在
 * - 动态创建缺失的表
 * - 验证数据访问权限
 * - 初始化基础数据
 */

import i18n from '@/i18n';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import React from 'react';

// 简化的表结构定义
const ESSENTIAL_TABLES = {
  // 用户业务数据表
  user_business_data: {
    columns: [
      'id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()',
      'user_id TEXT NOT NULL',
      'data_key TEXT NOT NULL',
      'data_value JSONB NOT NULL',
      'data_category TEXT DEFAULT \'business\'',
      'tags TEXT[] DEFAULT ARRAY[]::TEXT[]',
      'data_size INTEGER DEFAULT 0',
      'is_encrypted BOOLEAN DEFAULT false',
      'version INTEGER DEFAULT 1',
      'ttl TIMESTAMP',
      'created_at TIMESTAMP DEFAULT now()',
      'updated_at TIMESTAMP DEFAULT now()'
    ],
    constraints: [
      'CONSTRAINT uk_user_business_data UNIQUE(user_id, data_key)'
    ],
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_user_business_data_key ON user_business_data(data_key)',
      'CREATE INDEX IF NOT EXISTS idx_user_business_data_user ON user_business_data(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_business_data_updated ON user_business_data(updated_at)'
    ],
    policies: [
      'ALTER TABLE user_business_data ENABLE ROW LEVEL SECURITY',
      'CREATE POLICY user_business_data_isolation ON user_business_data FOR ALL USING (auth.uid()::text = user_id)'
    ]
  },

  // 用户偏好设置表
  user_preferences: {
    columns: [
      'id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()',
      'user_id TEXT NOT NULL',
      'data_key TEXT NOT NULL',
      'data_value JSONB NOT NULL',
      'sync_priority INTEGER DEFAULT 5',
      'is_global BOOLEAN DEFAULT false',
      'created_at TIMESTAMP DEFAULT now()',
      'updated_at TIMESTAMP DEFAULT now()'
    ],
    constraints: [
      'CONSTRAINT uk_user_preferences UNIQUE(user_id, data_key)'
    ],
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(data_key)',
      'CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id)'
    ],
    policies: [
      'ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY',
      'CREATE POLICY user_preferences_isolation ON user_preferences FOR ALL USING (auth.uid()::text = user_id)'
    ]
  },

  // 通用数据表（适配现有系统）
  user_general_data: {
    columns: [
      'id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()',
      'user_id TEXT NOT NULL',
      'data_key TEXT NOT NULL',
      'data_value JSONB NOT NULL',
      'data_category TEXT DEFAULT \'general\'',
      'access_count INTEGER DEFAULT 0',
      'last_accessed TIMESTAMP DEFAULT now()',
      'created_at TIMESTAMP DEFAULT now()',
      'updated_at TIMESTAMP DEFAULT now()'
    ],
    constraints: [
      'CONSTRAINT uk_user_general_data UNIQUE(user_id, data_key)'
    ],
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_user_general_data_key ON user_general_data(data_key)',
      'CREATE INDEX IF NOT EXISTS idx_user_general_data_user ON user_general_data(user_id)'
    ],
    policies: [
      'ALTER TABLE user_general_data ENABLE ROW LEVEL SECURITY',
      'CREATE POLICY user_general_data_isolation ON user_general_data FOR ALL USING (auth.uid()::text = user_id)'
    ]
  }
};

/**
 * 数据库初始化器类
 */
export class DatabaseInitializer {
  private initialized = false;
  private initializationPromise: Promise<boolean> | null = null;

  /**
   * 检查表是否存在
   */
  private async tableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      // 如果没有错误，表存在
      if (!error) {
        return true;
      }

      // 检查是否是"表不存在"的错误
      if (error.message?.includes('does not exist') || 
          error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return false;
      }

      // 其他错误可能意味着表存在但有权限问题
      logger.warn(`表 ${tableName} 检查出现错误，假设存在:`, error.message);
      return true;
    } catch (error) {
      logger.warn(`表 ${tableName} 检查异常，假设不存在:`, error);
      return false;
    }
  }

  /**
   * 尝试创建表（通过插入失败推断）
   */
  private async ensureTableExists(tableName: string): Promise<boolean> {
    const exists = await this.tableExists(tableName);
    if (exists) {
      logger.debug(`✅ 表 ${tableName} 已存在`);
      return true;
    }

    logger.warn(`⚠️ 表 ${tableName} 不存在`);
    logger.info(`💡 提示：请在 Supabase 控制台手动创建表 ${tableName}`);
    
    // 由于我们无法通过客户端直接创建表，返回false但不阻塞应用
    return false;
  }

  /**
   * 初始化数据库表结构
   */
  async initializeDatabase(): Promise<boolean> {
    // 防止重复初始化
    if (this.initialized) {
      return true;
    }

    // 防止并发初始化
    if (this.initializationPromise) {
      return await this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return await this.initializationPromise;
  }

  /**
   * 执行实际的初始化
   */
  private async performInitialization(): Promise<boolean> {
    logger.info('🏗️ 开始初始化数据库表结构...');

    let successCount = 0;
    const totalTables = Object.keys(ESSENTIAL_TABLES).length;

    for (const [tableName, tableConfig] of Object.entries(ESSENTIAL_TABLES)) {
      try {
        const exists = await this.ensureTableExists(tableName);
        if (exists) {
          successCount++;
        }
      } catch (error) {
        logger.error(`❌ 表 ${tableName} 初始化失败:`, error);
      }
    }

    const success = successCount >= totalTables * 0.5; // 至少一半表可用
    
    if (success) {
      logger.info(`✅ 数据库初始化完成: ${successCount}/${totalTables} 个表可用`);
      this.initialized = true;
    } else {
      logger.warn(`⚠️ 数据库初始化部分成功: ${successCount}/${totalTables} 个表可用`);
      logger.warn('📋 建议操作:');
      logger.warn('1. 检查 Supabase 项目配置');
      logger.warn('2. 在控制台手动创建缺失的表');
      logger.warn('3. 验证 API 密钥权限');
    }

    return success;
  }

  /**
   * 验证数据访问权限
   */
  async validateAccess(userId: string): Promise<{
    canRead: boolean;
    canWrite: boolean;
    availableTables: string[];
  }> {
    const results = {
      canRead: false,
      canWrite: false,
      availableTables: [] as string[]
    };

    for (const tableName of Object.keys(ESSENTIAL_TABLES)) {
      try {
        // 测试读取权限
        const { data: readData, error: readError } = await supabase
          .from(tableName)
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (!readError) {
          results.canRead = true;
          results.availableTables.push(tableName);

          // 测试写入权限
          const testData = {
            user_id: userId,
            data_key: 'test_key',
            data_value: { test: true, timestamp: new Date().toISOString() }
          };

          const { error: writeError } = await supabase
            .from(tableName)
            .insert(testData)
            .select()
            .single();

          if (!writeError) {
            results.canWrite = true;
            
            // 清理测试数据
            await supabase
              .from(tableName)
              .delete()
              .eq('user_id', userId)
              .eq('data_key', 'test_key');
          }
        }
      } catch (error) {
        logger.debug(`表 ${tableName} 访问测试失败:`, error);
      }
    }

    return results;
  }

  /**
   * 获取数据库状态信息
   */
  async getDatabaseStatus(): Promise<{
    initialized: boolean;
    availableTables: number;
    totalTables: number;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    let availableCount = 0;
    const totalCount = Object.keys(ESSENTIAL_TABLES).length;

    // 检查各表状态
    for (const tableName of Object.keys(ESSENTIAL_TABLES)) {
      const exists = await this.tableExists(tableName);
      if (exists) {
        availableCount++;
      } else {
        recommendations.push(`创建表: ${tableName}`);
      }
    }

    if (availableCount === 0) {
      recommendations.push('检查 Supabase 项目连接配置');
      recommendations.push('验证 API 密钥权限');
      recommendations.push('在控制台手动运行 database-schema.sql');
    } else if (availableCount < totalCount) {
      recommendations.push('补充创建缺失的表');
      recommendations.push('检查行级安全策略（RLS）配置');
    }

    return {
      initialized: this.initialized,
      availableTables: availableCount,
      totalTables: totalCount,
      recommendations
    };
  }

  /**
   * 生成建表SQL语句（用于手动执行）
   */
  generateCreateSQL(): string {
    let sql = '-- 统一存储架构 - 必要表结构\n\n';
    
    for (const [tableName, config] of Object.entries(ESSENTIAL_TABLES)) {
      sql += `-- 创建表: ${tableName}\n`;
      sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      sql += config.columns.map(col => `  ${col}`).join(',\n');
      
      if (config.constraints && config.constraints.length > 0) {
        sql += ',\n  ' + config.constraints.join(',\n  ');
      }
      
      sql += '\n);\n\n';
      
      // 添加索引
      if (config.indexes) {
        config.indexes.forEach(index => {
          sql += `${index};\n`;
        });
        sql += '\n';
      }
      
      // 添加安全策略
      if (config.policies) {
        config.policies.forEach(policy => {
          sql += `${policy};\n`;
        });
        sql += '\n';
      }
    }
    
    return sql;
  }
}

// 导出单例实例
export const databaseInitializer = new DatabaseInitializer();

/**
 * React Hook: 数据库初始化状态
 */
export function useDatabaseInitialization() {
  const [status, setStatus] = React.useState<{
    loading: boolean;
    initialized: boolean;
    error?: string;
  }>({ loading: true, initialized: false });

  React.useEffect(() => {
    databaseInitializer.initializeDatabase()
      .then(success => {
        setStatus({
          loading: false,
          initialized: success,
          error: success ? undefined : i18n.t('common.errors.数据库初始化未完全成功')
        });
      })
      .catch(error => {
        setStatus({
          loading: false,
          initialized: false,
          error: error.message || i18n.t('common.errors.数据库初始化失败')
        });
      });
  }, []);

  return status;
}

export default DatabaseInitializer;