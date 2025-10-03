/**
 * 数据库字段转换工具
 * @description 处理camelCase和snake_case之间的转换
 *
 * 用途:
 * - Supabase数据库使用snake_case
 * - TypeScript代码使用camelCase
 * - 自动转换,避免手动映射
 */

import type { TokenUsageRecord, DBTokenUsageRecord } from '../types';

/**
 * 将camelCase转换为snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 将snake_case转换为camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 将对象的所有键从camelCase转换为snake_case
 */
export function objectKeysToSnake<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);

    // 递归处理嵌套对象
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[snakeKey] = objectKeysToSnake(value);
    } else {
      result[snakeKey] = value;
    }
  }

  return result;
}

/**
 * 将对象的所有键从snake_case转换为camelCase
 */
export function objectKeysToCamel<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);

    // 递归处理嵌套对象
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[camelKey] = objectKeysToCamel(value);
    } else {
      result[camelKey] = value;
    }
  }

  return result;
}

/**
 * 将TokenUsageRecord转换为DBTokenUsageRecord (camelCase → snake_case)
 */
export function recordToDBRecord(record: TokenUsageRecord): DBTokenUsageRecord {
  return {
    id: record.id,
    user_id: record.userId,
    feature: record.feature,
    task_type: record.taskType,
    input_tokens: record.inputTokens,
    output_tokens: record.outputTokens,
    total_tokens: record.totalTokens,
    model: record.model,
    content_summary: record.contentSummary,
    success: record.success,
    error_message: record.errorMessage,
    timestamp: record.timestamp,
    metadata: record.metadata || null
  };
}

/**
 * 将DBTokenUsageRecord转换为TokenUsageRecord (snake_case → camelCase)
 */
export function dbRecordToRecord(dbRecord: DBTokenUsageRecord): TokenUsageRecord {
  return {
    id: dbRecord.id,
    userId: dbRecord.user_id,
    feature: dbRecord.feature,
    taskType: dbRecord.task_type,
    inputTokens: dbRecord.input_tokens,
    outputTokens: dbRecord.output_tokens,
    totalTokens: dbRecord.total_tokens,
    model: dbRecord.model,
    contentSummary: dbRecord.content_summary,
    success: dbRecord.success,
    errorMessage: dbRecord.error_message,
    timestamp: dbRecord.timestamp,
    metadata: dbRecord.metadata || undefined
  };
}

/**
 * 批量转换数据库记录
 */
export function batchDBRecordsToRecords(
  dbRecords: DBTokenUsageRecord[]
): TokenUsageRecord[] {
  return dbRecords.map(dbRecordToRecord);
}

/**
 * 批量转换业务记录
 */
export function batchRecordsToDBRecords(
  records: TokenUsageRecord[]
): DBTokenUsageRecord[] {
  return records.map(recordToDBRecord);
}

/**
 * 验证数据库记录的必需字段
 */
export function validateDBRecord(record: any): record is DBTokenUsageRecord {
  const requiredFields = [
    'id',
    'user_id',
    'feature',
    'task_type',
    'input_tokens',
    'output_tokens',
    'total_tokens',
    'model',
    'success',
    'timestamp'
  ];

  for (const field of requiredFields) {
    if (!(field in record)) {
      return false;
    }
  }

  // 类型检查
  if (typeof record.id !== 'string') return false;
  if (typeof record.user_id !== 'string') return false;
  if (typeof record.feature !== 'string') return false;
  if (typeof record.task_type !== 'string') return false;
  if (typeof record.input_tokens !== 'number') return false;
  if (typeof record.output_tokens !== 'number') return false;
  if (typeof record.total_tokens !== 'number') return false;
  if (typeof record.model !== 'string') return false;
  if (typeof record.success !== 'boolean') return false;
  if (typeof record.timestamp !== 'string') return false;

  return true;
}

/**
 * 验证业务记录的必需字段
 */
export function validateRecord(record: any): record is TokenUsageRecord {
  const requiredFields = [
    'id',
    'userId',
    'feature',
    'taskType',
    'inputTokens',
    'outputTokens',
    'totalTokens',
    'model',
    'success',
    'timestamp'
  ];

  for (const field of requiredFields) {
    if (!(field in record)) {
      return false;
    }
  }

  // 类型检查
  if (typeof record.id !== 'string') return false;
  if (typeof record.userId !== 'string') return false;
  if (typeof record.feature !== 'string') return false;
  if (typeof record.taskType !== 'string') return false;
  if (typeof record.inputTokens !== 'number') return false;
  if (typeof record.outputTokens !== 'number') return false;
  if (typeof record.totalTokens !== 'number') return false;
  if (typeof record.model !== 'string') return false;
  if (typeof record.success !== 'boolean') return false;
  if (typeof record.timestamp !== 'string') return false;

  return true;
}

/**
 * 安全地转换数据库记录 (带验证)
 */
export function safeDBRecordToRecord(
  dbRecord: any
): { success: true; data: TokenUsageRecord } | { success: false; error: string } {
  if (!validateDBRecord(dbRecord)) {
    return {
      success: false,
      error: 'Invalid database record structure'
    };
  }

  try {
    const record = dbRecordToRecord(dbRecord);
    return { success: true, data: record };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed'
    };
  }
}

/**
 * 安全地转换业务记录 (带验证)
 */
export function safeRecordToDBRecord(
  record: any
): { success: true; data: DBTokenUsageRecord } | { success: false; error: string } {
  if (!validateRecord(record)) {
    return {
      success: false,
      error: 'Invalid record structure'
    };
  }

  try {
    const dbRecord = recordToDBRecord(record);
    return { success: true, data: dbRecord };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed'
    };
  }
}
