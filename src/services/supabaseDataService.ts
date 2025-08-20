/**
 * 🗄️ Supabase 数据服务
 * 实现用户数据隔离的数据库操作
 * 
 * 安全原则：
 * - 所有数据库操作必须包含 userId 过滤
 * - 敏感数据操作需要额外权限验证
 * - 统一的错误处理和日志记录
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { configManager, getSupabaseConfig } from '@/config/configManager';
import { logger } from '@/utils/logger';

// 全局 Supabase 客户端实例
let supabase: SupabaseClient | null = null;
let isInitialized = false;

/**
 * 初始化 Supabase 客户端
 */
async function initializeSupabase(): Promise<SupabaseClient> {
  if (supabase && isInitialized) {
    return supabase;
  }

  try {
    const config = await getSupabaseConfig();

    // 检查配置完整性
    if (!config.url || !config.anonKey) {
      throw new Error('Supabase 配置不完整：缺少 URL 或 API 密钥');
    }

    supabase = createClient(config.url, config.anonKey);
    isInitialized = true;

    logger.debug('✅ Supabase 客户端初始化成功:', {
      url: config.url,
      projectId: config.projectId
    });

    return supabase;
  } catch (error) {
    console.error('Supabase 初始化失败:', error);
    throw new Error(`Supabase 初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 获取 Supabase 客户端实例
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  return await initializeSupabase();
}

/**
 * 获取带认证的 Supabase 客户端实例
 */
export async function getAuthenticatedSupabaseClient(token?: string): Promise<SupabaseClient> {
  const client = await initializeSupabase();

  if (token) {
    // 设置用户认证token
    await client.auth.setSession({
      access_token: token,
      refresh_token: ''
    });
  }

  return client;
}

export interface DatabaseRecord {
  id?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface QueryResult<T> {
  data: T[];
  count?: number;
  error?: string;
}

/**
 * Supabase 数据服务类
 */
export class SupabaseDataService {
  private userId: string;
  private tableName: string;

  constructor(userId: string, tableName: string) {
    if (!userId || userId === 'undefined') {
      throw new Error('用户ID不能为空');
    }
    this.userId = userId;
    this.tableName = tableName;
  }

  /**
   * 验证用户权限
   */
  private validateUserId(recordUserId?: string): void {
    if (recordUserId && recordUserId !== this.userId) {
      throw new Error('无权访问其他用户的数据');
    }
  }

  /**
   * 添加用户ID和时间戳
   */
  private addMetadata(data: Partial<DatabaseRecord>): DatabaseRecord {
    const now = new Date().toISOString();
    return {
      ...data,
      userId: this.userId,
      createdAt: data.createdAt || now,
      updatedAt: now
    } as DatabaseRecord;
  }

  /**
   * 创建记录
   */
  async create<T extends DatabaseRecord>(data: Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const recordData = this.addMetadata(data);
      const client = await getSupabaseClient();

      const { data: result, error } = await client
        .from(this.tableName)
        .insert(recordData)
        .select()
        .single();

      if (error) {
        console.error(`创建${this.tableName}记录失败:`, error);
        throw new Error(`创建记录失败: ${error.message}`);
      }

      logger.debug('✅ 创建${this.tableName}记录成功:', result.id);
      return result as T;
    } catch (error) {
      console.error(`创建${this.tableName}记录异常:`, error);
      throw error;
    }
  }

  /**
   * 查询记录列表
   */
  async findMany<T extends DatabaseRecord>(options: QueryOptions = {}): Promise<QueryResult<T>> {
    try {
      const client = await getSupabaseClient();
      let query = client
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('userId', this.userId);

      // 应用过滤条件
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // 应用排序
      if (options.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.orderDirection === 'asc'
        });
      }

      // 应用分页
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error(`查询${this.tableName}记录失败:`, error);
        throw new Error(`查询记录失败: ${error.message}`);
      }

      logger.debug('✅ 查询${this.tableName}记录成功: ${data?.length || 0} 条');
      return {
        data: (data || []) as T[],
        count: count || 0
      };
    } catch (error) {
      console.error(`查询${this.tableName}记录异常:`, error);
      return {
        data: [],
        error: error instanceof Error ? error.message : '查询失败'
      };
    }
  }

  /**
   * 根据ID查询单条记录
   */
  async findById<T extends DatabaseRecord>(id: string): Promise<T | null> {
    try {
      const client = await getSupabaseClient();
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('userId', this.userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 记录不存在
          return null;
        }
        console.error(`查询${this.tableName}记录失败:`, error);
        throw new Error(`查询记录失败: ${error.message}`);
      }

      logger.debug('✅ 查询${this.tableName}记录成功:', id);
      return data as T;
    } catch (error) {
      console.error(`查询${this.tableName}记录异常:`, error);
      throw error;
    }
  }

  /**
   * 更新记录
   */
  async update<T extends DatabaseRecord>(id: string, data: Partial<Omit<T, 'id' | 'userId' | 'createdAt'>>): Promise<T> {
    try {
      // 先验证记录是否属于当前用户
      const existingRecord = await this.findById(id);
      if (!existingRecord) {
        throw new Error('记录不存在或无权访问');
      }

      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      const client = await getSupabaseClient();
      const { data: result, error } = await client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .eq('userId', this.userId)
        .select()
        .single();

      if (error) {
        console.error(`更新${this.tableName}记录失败:`, error);
        throw new Error(`更新记录失败: ${error.message}`);
      }

      logger.debug('✅ 更新${this.tableName}记录成功:', id);
      return result as T;
    } catch (error) {
      console.error(`更新${this.tableName}记录异常:`, error);
      throw error;
    }
  }

  /**
   * 删除记录
   */
  async delete(id: string): Promise<void> {
    try {
      // 先验证记录是否属于当前用户
      const existingRecord = await this.findById(id);
      if (!existingRecord) {
        throw new Error('记录不存在或无权访问');
      }

      const client = await getSupabaseClient();
      const { error } = await client
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('userId', this.userId);

      if (error) {
        console.error(`删除${this.tableName}记录失败:`, error);
        throw new Error(`删除记录失败: ${error.message}`);
      }

      logger.debug('✅ 删除${this.tableName}记录成功:', id);
    } catch (error) {
      console.error(`删除${this.tableName}记录异常:`, error);
      throw error;
    }
  }

  /**
   * 批量删除记录
   */
  async deleteMany(ids: string[]): Promise<void> {
    try {
      const client = await getSupabaseClient();
      const { error } = await client
        .from(this.tableName)
        .delete()
        .in('id', ids)
        .eq('userId', this.userId);

      if (error) {
        console.error(`批量删除${this.tableName}记录失败:`, error);
        throw new Error(`批量删除记录失败: ${error.message}`);
      }

      logger.debug('✅ 批量删除${this.tableName}记录成功: ${ids.length} 条');
    } catch (error) {
      console.error(`批量删除${this.tableName}记录异常:`, error);
      throw error;
    }
  }

  /**
   * 统计记录数量
   */
  async count(filters?: Record<string, any>): Promise<number> {
    try {
      const client = await getSupabaseClient();
      let query = client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('userId', this.userId);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { count, error } = await query;

      if (error) {
        console.error(`统计${this.tableName}记录失败:`, error);
        throw new Error(`统计记录失败: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error(`统计${this.tableName}记录异常:`, error);
      throw error;
    }
  }

  /**
   * 检查记录是否存在
   */
  async exists(id: string): Promise<boolean> {
    try {
      const record = await this.findById(id);
      return record !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清理用户所有数据（谨慎使用）
   */
  async clearAllUserData(): Promise<void> {
    try {
      const client = await getSupabaseClient();
      const { error } = await client
        .from(this.tableName)
        .delete()
        .eq('userId', this.userId);

      if (error) {
        console.error(`清理${this.tableName}用户数据失败:`, error);
        throw new Error(`清理用户数据失败: ${error.message}`);
      }

      logger.debug('✅ 清理${this.tableName}用户数据成功');
    } catch (error) {
      console.error(`清理${this.tableName}用户数据异常:`, error);
      throw error;
    }
  }
}

/**
 * 创建数据服务实例
 */
export function createDataService(userId: string, tableName: string): SupabaseDataService {
  return new SupabaseDataService(userId, tableName);
}

/**
 * 数据表名称常量
 */
export const TABLE_NAMES = {
  USER_PROFILES: 'user_profiles',
  USER_SUBSCRIPTIONS: 'user_subscriptions',
  USER_ORDERS: 'user_orders',
  USER_NOTES: 'user_notes',
  USER_FILES: 'user_files',
  USER_USAGE_LOGS: 'cdk_usage_logs', // 🔧 修复：使用实际存在的表名
  USER_LIBRARY_ITEMS: 'user_library_items',
  USER_CHAT_HISTORY: 'user_chat_history',
  USER_BRAND_CORPUS: 'user_brand_corpus'
} as const;

export { supabase };
export default SupabaseDataService;
