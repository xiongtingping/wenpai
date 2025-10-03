/**
 * 🔄 数据字段适配器
 *
 * 目的: 统一不同数据管理器对Supabase字段的访问
 * 解决: unifiedDataManager 和 robustUnifiedDataManager 字段名不一致问题
 *
 * 表结构 (user_brand_corpus):
 * - id: UUID
 * - user_id: VARCHAR(100)  ← 核心隔离字段
 * - brand_name: VARCHAR(100) ← 用作数据key
 * - brand_description: TEXT ← 用作数据内容
 * - metadata: JSONB
 * - created_at, updated_at
 */

export interface UnifiedDataRecord {
  id?: string;
  userId: string;
  dataKey: string;
  dataContent: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 数据字段适配器
 * 在统一的业务模型和实际数据库字段之间转换
 */
export class DataFieldAdapter {
  /**
   * 将业务模型转换为数据库记录
   */
  static toDatabase(record: UnifiedDataRecord): Record<string, any> {
    return {
      // id 保持原样 (新建时为undefined)
      ...(record.id && { id: record.id }),

      // 用户ID: 核心隔离字段
      user_id: record.userId,

      // 数据键: 使用 brand_name 存储 (格式: user_{userId}_{key})
      brand_name: this.formatDataKey(record.userId, record.dataKey),

      // 数据内容: 使用 brand_description 存储
      brand_description: record.dataContent,

      // 元数据: 存储额外信息
      metadata: {
        ...record.metadata,
        dataKey: record.dataKey, // 保存原始key便于反向解析
        lastUpdated: new Date().toISOString(),
        adapterVersion: '1.0'
      },

      // 时间戳
      created_at: record.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * 将数据库记录转换为业务模型
   */
  static fromDatabase(dbRecord: Record<string, any>): UnifiedDataRecord {
    const userId = dbRecord.user_id;
    const brandName = dbRecord.brand_name;

    // 从 brand_name 解析出原始 dataKey
    // 格式: user_{userId}_{key} → {key}
    const dataKey = this.parseDataKey(userId, brandName);

    return {
      id: dbRecord.id,
      userId: userId,
      dataKey: dataKey,
      dataContent: dbRecord.brand_description || '{}',
      metadata: dbRecord.metadata || {},
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at
    };
  }

  /**
   * 格式化数据键 (带用户隔离)
   * @param userId 用户ID
   * @param key 数据键
   * @returns 格式化后的键: user_{userId}_{key}
   */
  static formatDataKey(userId: string, key: string): string {
    // 移除可能的旧前缀,避免重复
    const cleanKey = key.replace(/^user_[^_]+_/, '');
    return `user_${userId}_${cleanKey}`;
  }

  /**
   * 解析数据键 (提取原始key)
   * @param userId 用户ID
   * @param formattedKey 格式化的键
   * @returns 原始键
   */
  static parseDataKey(userId: string, formattedKey: string): string {
    const prefix = `user_${userId}_`;
    if (formattedKey.startsWith(prefix)) {
      return formattedKey.substring(prefix.length);
    }

    // 兼容旧格式 user_{key} (无userId)
    if (formattedKey.startsWith('user_')) {
      return formattedKey.substring(5);
    }

    return formattedKey;
  }

  /**
   * 构建安全的查询过滤器 (带用户隔离)
   */
  static buildSecureFilter(userId: string, key: string): Record<string, any> {
    return {
      user_id: userId,  // 第一层隔离: RLS策略
      brand_name: this.formatDataKey(userId, key)  // 第二层隔离: 数据键前缀
    };
  }

  /**
   * 构建用户范围查询过滤器
   */
  static buildUserScopeFilter(userId: string): Record<string, any> {
    return {
      user_id: userId
    };
  }
}

export default DataFieldAdapter;
