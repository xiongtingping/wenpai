/**
 * 🔧 数据库健康检查服务
 * 🎯 目标：检查和修复数据库表结构问题，确保应用正常运行
 * 📌 核心功能：
 * 1. 检查必需表是否存在
 * 2. 验证表结构和权限
 * 3. 自动修复常见问题
 * 4. 提供降级方案
 */

import { logger } from '@/utils/logger';
import { getSupabaseClient, TABLE_NAMES } from './supabaseDataService';

/**
 * 表健康状态
 */
export interface TableHealthStatus {
  /** 表名 */
  tableName: string;
  /** 是否存在 */
  exists: boolean;
  /** 是否可访问 */
  accessible: boolean;
  /** 权限状态 */
  permissions: {
    select: boolean;
    insert: boolean;
    update: boolean;
    delete: boolean;
  };
  /** 错误信息 */
  error?: string;
  /** 建议操作 */
  recommendations: string[];
}

/**
 * 数据库健康检查结果
 */
export interface DatabaseHealthReport {
  /** 整体健康状态 */
  isHealthy: boolean;
  /** 检查时间 */
  timestamp: string;
  /** 各表状态 */
  tables: TableHealthStatus[];
  /** 关键问题 */
  criticalIssues: string[];
  /** 修复建议 */
  fixRecommendations: string[];
  /** 降级方案 */
  fallbackOptions: string[];
}

/**
 * 数据库健康检查服务类
 */
export class DatabaseHealthService {
  private supabase: any = null;

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    try {
      this.supabase = await getSupabaseClient();
      logger.debug('✅ 数据库健康检查服务初始化成功');
    } catch (error) {
      logger.error('❌ 数据库健康检查服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 执行完整的数据库健康检查
   */
  async performHealthCheck(): Promise<DatabaseHealthReport> {
    logger.debug('🔍 开始数据库健康检查...');

    const report: DatabaseHealthReport = {
      isHealthy: true,
      timestamp: new Date().toISOString(),
      tables: [],
      criticalIssues: [],
      fixRecommendations: [],
      fallbackOptions: []
    };

    try {
      // 检查所有必需的表
      const tableNames = Object.values(TABLE_NAMES);
      
      for (const tableName of tableNames) {
        const tableStatus = await this.checkTableHealth(tableName);
        report.tables.push(tableStatus);

        // 如果表不可访问，标记为不健康
        if (!tableStatus.accessible) {
          report.isHealthy = false;
          report.criticalIssues.push(`表 ${tableName} 不可访问: ${tableStatus.error}`);
        }
      }

      // 生成修复建议
      this.generateRecommendations(report);

      logger.debug('✅ 数据库健康检查完成:', {
        isHealthy: report.isHealthy,
        criticalIssues: report.criticalIssues.length,
        tablesChecked: report.tables.length
      });

    } catch (error) {
      logger.error('❌ 数据库健康检查失败:', error);
      report.isHealthy = false;
      report.criticalIssues.push(`健康检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    return report;
  }

  /**
   * 检查单个表的健康状态
   */
  private async checkTableHealth(tableName: string): Promise<TableHealthStatus> {
    const status: TableHealthStatus = {
      tableName,
      exists: false,
      accessible: false,
      permissions: {
        select: false,
        insert: false,
        update: false,
        delete: false
      },
      recommendations: []
    };

    try {
      // 尝试查询表结构
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        status.error = error.message;
        
        // 分析错误类型
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          status.exists = false;
          status.recommendations.push(`表 ${tableName} 不存在，需要创建`);
        } else if (error.message.includes('406') || error.message.includes('Not Acceptable')) {
          status.exists = true;
          status.accessible = false;
          status.recommendations.push(`表 ${tableName} 权限不足，需要配置RLS策略`);
        } else {
          status.exists = true;
          status.accessible = false;
          status.recommendations.push(`表 ${tableName} 访问异常: ${error.message}`);
        }
      } else {
        status.exists = true;
        status.accessible = true;
        status.permissions.select = true;
        
        // 测试其他权限
        await this.testTablePermissions(tableName, status);
      }

    } catch (error) {
      status.error = error instanceof Error ? error.message : '未知错误';
      status.recommendations.push(`表 ${tableName} 检查失败，需要手动验证`);
    }

    return status;
  }

  /**
   * 测试表的各种权限
   */
  private async testTablePermissions(tableName: string, status: TableHealthStatus): Promise<void> {
    // 测试插入权限（使用无效数据，只测试权限）
    try {
      await this.supabase
        .from(tableName)
        .insert({ test_permission_check: true })
        .select();
    } catch (error: any) {
      if (error.message?.includes('permission') || error.message?.includes('policy')) {
        status.permissions.insert = false;
      } else {
        // 如果是其他错误（如字段不存在），说明有插入权限
        status.permissions.insert = true;
      }
    }

    // 测试更新权限
    try {
      await this.supabase
        .from(tableName)
        .update({ test_permission_check: true })
        .eq('id', 'non-existent-id');
      status.permissions.update = true;
    } catch (error: any) {
      if (error.message?.includes('permission') || error.message?.includes('policy')) {
        status.permissions.update = false;
      } else {
        status.permissions.update = true;
      }
    }

    // 测试删除权限
    try {
      await this.supabase
        .from(tableName)
        .delete()
        .eq('id', 'non-existent-id');
      status.permissions.delete = true;
    } catch (error: any) {
      if (error.message?.includes('permission') || error.message?.includes('policy')) {
        status.permissions.delete = false;
      } else {
        status.permissions.delete = true;
      }
    }
  }

  /**
   * 生成修复建议
   */
  private generateRecommendations(report: DatabaseHealthReport): void {
    const missingTables = report.tables.filter(t => !t.exists);
    const inaccessibleTables = report.tables.filter(t => t.exists && !t.accessible);

    if (missingTables.length > 0) {
      report.fixRecommendations.push(
        `创建缺失的表: ${missingTables.map(t => t.tableName).join(', ')}`
      );
      report.fallbackOptions.push('使用本地存储作为临时数据存储');
    }

    if (inaccessibleTables.length > 0) {
      report.fixRecommendations.push(
        `配置RLS策略: ${inaccessibleTables.map(t => t.tableName).join(', ')}`
      );
      report.fallbackOptions.push('禁用需要数据库的功能，使用只读模式');
    }

    // 如果所有表都有问题，建议检查配置
    if (report.tables.every(t => !t.accessible)) {
      report.fixRecommendations.unshift('检查Supabase配置和网络连接');
      report.fallbackOptions.unshift('切换到离线模式');
    }
  }

  /**
   * 自动修复常见问题
   */
  async autoFix(): Promise<{
    success: boolean;
    fixedIssues: string[];
    remainingIssues: string[];
  }> {
    logger.debug('🔧 开始自动修复数据库问题...');

    const result = {
      success: true,
      fixedIssues: [] as string[],
      remainingIssues: [] as string[]
    };

    try {
      const healthReport = await this.performHealthCheck();

      // 目前只能修复一些简单的问题，复杂的表结构问题需要手动处理
      for (const table of healthReport.tables) {
        if (!table.accessible && table.exists) {
          // 尝试简单的权限修复（实际上需要数据库管理员权限）
          result.remainingIssues.push(`表 ${table.tableName} 需要手动配置权限`);
        } else if (!table.exists) {
          result.remainingIssues.push(`表 ${table.tableName} 需要手动创建`);
        }
      }

      if (result.remainingIssues.length === 0) {
        result.fixedIssues.push('所有检查的问题都已解决');
      } else {
        result.success = false;
      }

    } catch (error) {
      logger.error('❌ 自动修复失败:', error);
      result.success = false;
      result.remainingIssues.push(`自动修复失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    return result;
  }

  /**
   * 启用降级模式
   */
  enableFallbackMode(): void {
    logger.warn('⚠️ 启用数据库降级模式');
    
    // 设置全局标志，让其他服务知道数据库不可用
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('database_fallback_mode', 'true');
      window.localStorage.setItem('database_fallback_timestamp', new Date().toISOString());
    }
  }

  /**
   * 检查是否处于降级模式
   */
  isFallbackMode(): boolean {
    if (typeof window === 'undefined') return false;
    
    const fallbackMode = window.localStorage.getItem('database_fallback_mode');
    return fallbackMode === 'true';
  }

  /**
   * 禁用降级模式
   */
  disableFallbackMode(): void {
    logger.debug('✅ 禁用数据库降级模式');
    
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('database_fallback_mode');
      window.localStorage.removeItem('database_fallback_timestamp');
    }
  }
}

// 导出默认实例
export const databaseHealthService = new DatabaseHealthService();
