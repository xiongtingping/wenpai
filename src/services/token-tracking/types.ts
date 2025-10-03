/**
 * Token跟踪系统 - 核心类型定义
 * @description 统一所有Token相关的类型接口
 *
 * 设计原则:
 * - 类型严格,禁止any
 * - 字段语义明确
 * - 支持未来扩展
 */

import type { SubscriptionTier } from '@/types/subscription';

/**
 * Token使用记录 (数据库模型)
 */
export interface TokenUsageRecord {
  /** 记录ID - 格式: token_{timestamp}_{userId_hash}_{random} */
  id: string;

  /** 用户ID */
  userId: string;

  /** 功能模块 (如: content-adapter, brand-corpus, chat) */
  feature: string;

  /** 任务类型 (如: generate, analyze, translate) */
  taskType: string;

  /** 输入Token数 */
  inputTokens: number;

  /** 输出Token数 */
  outputTokens: number;

  /** 总Token数 (inputTokens + outputTokens) */
  totalTokens: number;

  /** 使用的AI模型 */
  model: string;

  /** 内容摘要 (最多200字符) */
  contentSummary: string | null;

  /** 调用是否成功 */
  success: boolean;

  /** 错误信息 (仅success=false时有值) */
  errorMessage: string | null;

  /** 记录时间 (ISO 8601格式) */
  timestamp: string;

  /** 元数据 (JSON格式,可扩展) */
  metadata?: Record<string, any>;
}

/**
 * Token统计数据
 */
export interface TokenStats {
  /** 用户ID */
  userId: string;

  /** 用户订阅层级 */
  userTier: SubscriptionTier;

  /** 本月Token限额 */
  monthlyLimit: number;

  /** 本月已使用Token */
  monthlyUsed: number;

  /** 本月剩余Token */
  monthlyRemaining: number;

  /** 今日已使用Token */
  dailyUsed: number;

  /** 使用百分比 (0-100) */
  usagePercentage: number;

  /** 是否需要升级 (超过80%) */
  needUpgrade: boolean;

  /** 统计时间 */
  statsTime: string;

  /** 数据来源 */
  source: 'database' | 'cache';
}

/**
 * Token限额检查结果
 */
export interface TokenLimitCheckResult {
  /** 是否允许使用 */
  allowed: boolean;

  /** 拒绝原因 (仅allowed=false时有值) */
  reason?: string;

  /** 建议动作 */
  suggestedAction?: 'upgrade' | 'wait' | 'reduce_usage';

  /** 当前统计 */
  currentStats: TokenStats;

  /** 预估使用后的统计 */
  projectedStats: {
    monthlyUsed: number;
    monthlyRemaining: number;
    usagePercentage: number;
  };
}

/**
 * Token记录请求 (写入参数)
 */
export interface TokenRecordRequest {
  userId: string;
  feature: string;
  taskType: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  contentSummary?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Token统计查询参数
 */
export interface TokenStatsQuery {
  userId: string;
  userTier: SubscriptionTier;
  /** 是否强制从数据库刷新 (默认false,使用缓存) */
  forceRefresh?: boolean;
  /** 统计时间范围 */
  timeRange?: {
    startDate: string;
    endDate: string;
  };
}

/**
 * Token历史查询参数
 */
export interface TokenHistoryQuery {
  userId: string;
  /** 返回条数 (默认20) */
  limit?: number;
  /** 偏移量 (分页用) */
  offset?: number;
  /** 功能筛选 */
  feature?: string;
  /** 时间范围 */
  timeRange?: {
    startDate: string;
    endDate: string;
  };
}

/**
 * 缓存条目
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

/**
 * 离线队列项
 */
export interface OfflineQueueItem {
  id: string;
  userId: string;
  request: TokenRecordRequest;
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

/**
 * 服务配置
 */
export interface TokenTrackingConfig {
  /** 缓存TTL (毫秒) */
  cacheTTL: number;

  /** 离线队列最大长度 */
  maxQueueSize: number;

  /** 最大重试次数 */
  maxRetries: number;

  /** 是否启用调试日志 */
  enableDebugLog: boolean;

  /** 数据库批量操作大小 */
  batchSize: number;
}

/**
 * 错误类型
 */
export enum TokenTrackingErrorType {
  /** 数据库错误 */
  DATABASE_ERROR = 'DATABASE_ERROR',

  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /** 验证错误 */
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  /** 限额超出 */
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',

  /** 权限不足 */
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 自定义错误类
 */
export class TokenTrackingError extends Error {
  constructor(
    public type: TokenTrackingErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TokenTrackingError';
  }
}

/**
 * 数据库记录格式 (snake_case)
 */
export interface DBTokenUsageRecord {
  id: string;
  user_id: string;
  feature: string;
  task_type: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  model: string;
  content_summary: string | null;
  success: boolean;
  error_message: string | null;
  timestamp: string;
  metadata: Record<string, any> | null;
}
