/**
 * Token跟踪系统配置
 * @description 集中管理所有配置常量
 */

import type { TokenTrackingConfig } from './types';

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: TokenTrackingConfig = {
  // 缓存TTL (毫秒)
  cacheTTL: 30 * 1000, // 30秒

  // 离线队列最大长度
  maxQueueSize: 1000,

  // 最大重试次数
  maxRetries: 3,

  // 是否启用调试日志
  enableDebugLog: import.meta.env.DEV,

  // 数据库批量操作大小
  batchSize: 10
};

/**
 * localStorage键名
 */
export const STORAGE_KEYS = {
  /** 离线队列 */
  OFFLINE_QUEUE: 'wenpai:token:offline_queue',

  /** 统计缓存 (已废弃,使用内存缓存) */
  STATS_CACHE: 'wenpai:token:stats_cache_deprecated'
};

/**
 * 缓存TTL配置 (毫秒)
 */
export const CACHE_TTL = {
  /** Token统计 */
  TOKEN_STATS: 30 * 1000, // 30秒

  /** Token历史记录 */
  TOKEN_HISTORY: 5 * 60 * 1000, // 5分钟

  /** 功能统计 */
  FEATURE_STATS: 2 * 60 * 1000, // 2分钟

  /** 限额检查 (不缓存) */
  LIMIT_CHECK: 0
};

/**
 * 离线队列配置
 */
export const OFFLINE_QUEUE_CONFIG = {
  /** 最大队列长度 */
  MAX_SIZE: 1000,

  /** 最大重试次数 */
  MAX_RETRIES: 3,

  /** 最大保留时间 (7天) */
  MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,

  /** 重试延迟 (指数退避) */
  RETRY_DELAYS: [1000, 5000, 15000] // 1秒, 5秒, 15秒
};

/**
 * Token估算配置
 */
export const TOKEN_ESTIMATION = {
  /** 中文字符系数 */
  CHINESE_CHAR_RATIO: 1.5,

  /** 英文单词系数 */
  ENGLISH_WORD_RATIO: 1.0,

  /** 数字/符号系数 */
  NUMBER_SYMBOL_RATIO: 0.5,

  /** 代码系数 */
  CODE_RATIO: 1.2,

  /** JSON系数 */
  JSON_RATIO: 0.8
};

/**
 * 数据库表名 (引用自supabaseDataService)
 */
export const TABLE_NAME = 'user_usage_logs';

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  // 验证错误
  INVALID_USER_ID: 'userId is required and must be a string',
  INVALID_FEATURE: 'feature is required and must be a string',
  INVALID_TASK_TYPE: 'taskType is required and must be a string',
  INVALID_MODEL: 'model is required and must be a string',
  INVALID_TOKENS: 'inputTokens and outputTokens must be non-negative numbers',
  TOKENS_TOO_LARGE: 'estimatedTokens is unreasonably large (>1M)',

  // 数据库错误
  DB_QUERY_FAILED: 'Database query failed',
  DB_INSERT_FAILED: 'Failed to insert token usage record',
  DB_CONNECTION_FAILED: 'Failed to connect to database',

  // 限额错误
  LIMIT_EXCEEDED: 'Token limit exceeded',
  LIMIT_CHECK_FAILED: 'Token limit check failed',

  // 队列错误
  QUEUE_FULL: 'Offline queue is full',
  QUEUE_PROCESS_FAILED: 'Failed to process offline queue',

  // 网络错误
  OFFLINE: 'Offline, record added to queue',
  NETWORK_ERROR: 'Network error occurred'
};

/**
 * 日志前缀
 */
export const LOG_PREFIXES = {
  RECORDER: '[TokenRecorder]',
  STATS_QUERY: '[TokenStatsQuery]',
  LIMIT_CHECKER: '[TokenLimitChecker]',
  CACHE_MANAGER: '[TokenCacheManager]',
  QUEUE_MANAGER: '[OfflineQueueManager]'
};

/**
 * 套餐Token限额 (备份,优先使用subscriptionPlans配置)
 */
export const TIER_LIMITS = {
  free: 10000,
  trial: 100000,
  pro: 200000,
  premium: 500000
};

/**
 * 性能监控配置
 */
export const PERFORMANCE_CONFIG = {
  /** 是否启用性能监控 */
  ENABLE_MONITORING: import.meta.env.DEV,

  /** 慢查询阈值 (毫秒) */
  SLOW_QUERY_THRESHOLD: 1000,

  /** 慢操作阈值 (毫秒) */
  SLOW_OPERATION_THRESHOLD: 500
};

/**
 * 数据验证规则
 */
export const VALIDATION_RULES = {
  /** 最大内容摘要长度 */
  MAX_CONTENT_SUMMARY_LENGTH: 200,

  /** 最大错误消息长度 */
  MAX_ERROR_MESSAGE_LENGTH: 500,

  /** 最大Token数量 */
  MAX_TOKEN_COUNT: 1000000,

  /** 最小Token数量 */
  MIN_TOKEN_COUNT: 0
};

/**
 * 获取环境相关配置
 */
export function getEnvironmentConfig(): {
  isDevelopment: boolean;
  isProduction: boolean;
  enableDebugLog: boolean;
  enablePerformanceMonitoring: boolean;
} {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  return {
    isDevelopment,
    isProduction,
    enableDebugLog: isDevelopment,
    enablePerformanceMonitoring: isDevelopment
  };
}
