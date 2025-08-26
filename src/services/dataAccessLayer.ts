/**
 * 🛡️ 数据访问层 (DAL)
 * 统一的权限守卫和数据访问控制
 * 
 * 功能：
 * - 统一的用户权限验证
 * - 自动的 userId 过滤
 * - 数据访问日志记录
 * - 错误处理和重试机制
 */

import { createDataService, TABLE_NAMES, type DatabaseRecord, type QueryOptions, type QueryResult } from './supabaseDataService';
import { useAuth } from '@/hooks/useAuth';

export interface DataAccessOptions extends QueryOptions {
  /** 是否跳过权限检查（仅限系统管理员） */
  skipPermissionCheck?: boolean;
  /** 是否记录访问日志 */
  logAccess?: boolean;
  /** 重试次数 */
  retryCount?: number;
}

export interface AccessLog {
  userId: string;
  tableName: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  recordId?: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

/**
 * 数据访问层类
 */
export class DataAccessLayer {
  private userId: string;
  private isAdmin: boolean;
  private accessLogs: AccessLog[] = [];

  constructor(userId: string, isAdmin = false) {
    if (!userId || userId === 'undefined') {
      throw new Error('数据访问层需要有效的用户ID');
    }
    this.userId = userId;
    this.isAdmin = isAdmin;
  }

  /**
   * 记录访问日志
   */
  private logAccess(
    tableName: string,
    operation: 'create' | 'read' | 'update' | 'delete',
    success: boolean,
    recordId?: string,
    error?: string
  ): void {
    const log: AccessLog = {
      userId: this.userId,
      tableName,
      operation,
      recordId,
      timestamp: new Date().toISOString(),
      success,
      error
    };

    this.accessLogs.push(log);
    
    // 保持日志数量在合理范围内
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-500);
    }

    // 输出日志到控制台
    const logLevel = success ? 'log' : 'error';
    console[logLevel](`🛡️ DAL [${operation.toUpperCase()}] ${tableName}:`, {
      userId: this.userId,
      recordId,
      success,
      error
    });
  }

  /**
   * 验证表访问权限
   */
  private validateTableAccess(tableName: string): void {
    // 检查表名是否在允许的列表中
    const allowedTables = Object.values(TABLE_NAMES);
    if (!allowedTables.includes(tableName as any)) {
      throw new Error(`不允许访问表: ${tableName}`);
    }

    // 管理员可以访问所有表
    if (this.isAdmin) {
      return;
    }

    // 普通用户只能访问自己的数据
    // 这里可以添加更细粒度的权限控制
  }

  /**
   * 执行带重试的操作
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount = 3
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= retryCount; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // 如果是权限错误或数据不存在，不重试
        if (error instanceof Error && (
          error.message.includes('无权访问') ||
          error.message.includes('不存在') ||
          error.message.includes('PGRST116')
        )) {
          throw error;
        }

        // 最后一次尝试失败，抛出错误
        if (i === retryCount) {
          throw lastError;
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    throw lastError!;
  }

  /**
   * 创建记录
   */
  async create<T extends DatabaseRecord>(
    tableName: string,
    data: Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    options: DataAccessOptions = {}
  ): Promise<T> {
    try {
      this.validateTableAccess(tableName);
      
      const service = createDataService(this.userId, tableName);
      const result = await this.executeWithRetry(
        () => service.create<T>(data),
        options.retryCount
      );

      if (options.logAccess !== false) {
        this.logAccess(tableName, 'create', true, result.id);
      }

      return result;
    } catch (error) {
      if (options.logAccess !== false) {
        this.logAccess(tableName, 'create', false, undefined, (error as Error).message);
      }
      throw error;
    }
  }

  /**
   * 查询记录列表
   */
  async findMany<T extends DatabaseRecord>(
    tableName: string,
    options: DataAccessOptions = {}
  ): Promise<QueryResult<T>> {
    try {
      this.validateTableAccess(tableName);
      
      const service = createDataService(this.userId, tableName);
      const result = await this.executeWithRetry(
        () => service.findMany<T>(options),
        options.retryCount
      );

      if (options.logAccess !== false) {
        this.logAccess(tableName, 'read', true);
      }

      return result;
    } catch (error) {
      if (options.logAccess !== false) {
        this.logAccess(tableName, 'read', false, undefined, (error as Error).message);
      }
      throw error;
    }
  }

  /**
   * 根据ID查询记录
   */
  async findById<T extends DatabaseRecord>(
    tableName: string,
    id: string,
    options: DataAccessOptions = {}
  ): Promise<T | null> {
    try {
      this.validateTableAccess(tableName);
      
      const service = createDataService(this.userId, tableName);
      const result = await this.executeWithRetry(
        () => service.findById<T>(id),
        options.retryCount
      );

      if (options.logAccess !== false) {
        this.logAccess(tableName, 'read', true, id);
      }

      return result;
    } catch (error) {
      if (options.logAccess !== false) {
        this.logAccess(tableName, 'read', false, id, (error as Error).message);
      }
      throw error;
    }
  }

  /**
   * 更新记录
   */
  async update<T extends DatabaseRecord>(
    tableName: string,
    id: string,
    data: Partial<Omit<T, 'id' | 'userId' | 'createdAt'>>,
    options: DataAccessOptions = {}
  ): Promise<T> {
    try {
      this.validateTableAccess(tableName);
      
      const service = createDataService(this.userId, tableName);
      const result = await this.executeWithRetry(
        () => service.update<T>(id, data),
        options.retryCount
      );

      if (options.logAccess !== false) {
        this.logAccess(tableName, 'update', true, id);
      }

      return result;
    } catch (error) {
      if (options.logAccess !== false) {
        this.logAccess(tableName, 'update', false, id, (error as Error).message);
      }
      throw error;
    }
  }

  /**
   * 删除记录
   */
  async delete(
    tableName: string,
    id: string,
    options: DataAccessOptions = {}
  ): Promise<void> {
    try {
      this.validateTableAccess(tableName);
      
      const service = createDataService(this.userId, tableName);
      await this.executeWithRetry(
        () => service.delete(id),
        options.retryCount
      );

      if (options.logAccess !== false) {
        this.logAccess(tableName, 'delete', true, id);
      }
    } catch (error) {
      if (options.logAccess !== false) {
        this.logAccess(tableName, 'delete', false, id, (error as Error).message);
      }
      throw error;
    }
  }

  /**
   * 批量删除记录
   */
  async deleteMany(
    tableName: string,
    ids: string[],
    options: DataAccessOptions = {}
  ): Promise<void> {
    try {
      this.validateTableAccess(tableName);
      
      const service = createDataService(this.userId, tableName);
      await this.executeWithRetry(
        () => service.deleteMany(ids),
        options.retryCount
      );

      if (options.logAccess !== false) {
        this.logAccess(tableName, 'delete', true, `batch:${ids.length}`);
      }
    } catch (error) {
      if (options.logAccess !== false) {
        this.logAccess(tableName, 'delete', false, `batch:${ids.length}`, (error as Error).message);
      }
      throw error;
    }
  }

  /**
   * 统计记录数量
   */
  async count(
    tableName: string,
    filters?: Record<string, any>,
    options: DataAccessOptions = {}
  ): Promise<number> {
    try {
      this.validateTableAccess(tableName);
      
      const service = createDataService(this.userId, tableName);
      const result = await this.executeWithRetry(
        () => service.count(filters),
        options.retryCount
      );

      if (options.logAccess !== false) {
        this.logAccess(tableName, 'read', true, 'count');
      }

      return result;
    } catch (error) {
      if (options.logAccess !== false) {
        this.logAccess(tableName, 'read', false, 'count', (error as Error).message);
      }
      throw error;
    }
  }

  /**
   * 获取访问日志
   */
  getAccessLogs(limit = 100): AccessLog[] {
    return this.accessLogs.slice(-limit);
  }

  /**
   * 清除访问日志
   */
  clearAccessLogs(): void {
    this.accessLogs = [];
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    try {
      for (const tableName of Object.values(TABLE_NAMES)) {
        try {
          stats[tableName] = await this.count(tableName, undefined, { logAccess: false });
        } catch (error) {
          stats[tableName] = 0;
        }
      }
    } catch (error) {
      console.error('获取用户统计信息失败:', error);
    }

    return stats;
  }
}

/**
 * React Hook: 数据访问层
 */
export function useDataAccessLayer() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user?.id) {
    throw new Error('数据访问层需要用户登录');
  }

  const dal = new DataAccessLayer(user.id, user.isAdmin || false);
  
  return {
    create: <T extends DatabaseRecord>(tableName: string, data: Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, options?: DataAccessOptions) =>
      dal.create<T>(tableName, data, options),
    findMany: <T extends DatabaseRecord>(tableName: string, options?: DataAccessOptions) =>
      dal.findMany<T>(tableName, options),
    findById: <T extends DatabaseRecord>(tableName: string, id: string, options?: DataAccessOptions) =>
      dal.findById<T>(tableName, id, options),
    update: <T extends DatabaseRecord>(tableName: string, id: string, data: Partial<Omit<T, 'id' | 'userId' | 'createdAt'>>, options?: DataAccessOptions) =>
      dal.update<T>(tableName, id, data, options),
    delete: (tableName: string, id: string, options?: DataAccessOptions) =>
      dal.delete(tableName, id, options),
    deleteMany: (tableName: string, ids: string[], options?: DataAccessOptions) =>
      dal.deleteMany(tableName, ids, options),
    count: (tableName: string, filters?: Record<string, any>, options?: DataAccessOptions) =>
      dal.count(tableName, filters, options),
    getAccessLogs: (limit?: number) => dal.getAccessLogs(limit),
    clearAccessLogs: () => dal.clearAccessLogs(),
    getUserStats: () => dal.getUserStats(),
    user,
    isAuthenticated
  };
}

export default DataAccessLayer;
