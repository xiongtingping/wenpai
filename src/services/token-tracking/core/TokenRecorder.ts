/**
 * Token记录器 - 核心写入服务
 * @description 负责将Token使用记录写入Supabase数据库
 *
 * 职责:
 * 1. 生成唯一ID
 * 2. 验证数据完整性
 * 3. 写入数据库 (原子操作)
 * 4. 处理重复键冲突
 *
 * 不负责:
 * - 缓存管理 (由TokenCacheManager负责)
 * - 统计计算 (由TokenStatsQuery负责)
 * - 限额检查 (由TokenLimitChecker负责)
 */

import { logger } from '@/utils/logger';
import { getSupabaseClient, TABLE_NAMES } from '@/services/supabaseDataService';
import {
  type TokenRecordRequest,
  type TokenUsageRecord,
  type DBTokenUsageRecord,
  TokenTrackingError,
  TokenTrackingErrorType
} from '../types';

export class TokenRecorder {
  private static instance: TokenRecorder;

  private constructor() {}

  static getInstance(): TokenRecorder {
    if (!TokenRecorder.instance) {
      TokenRecorder.instance = new TokenRecorder();
    }
    return TokenRecorder.instance;
  }

  /**
   * 🎯 核心方法: 记录Token使用
   *
   * @throws {TokenTrackingError} 数据库错误/验证错误
   */
  async recordUsage(request: TokenRecordRequest): Promise<TokenUsageRecord> {
    // 1. 验证请求数据
    this.validateRequest(request);

    // 2. 生成唯一ID
    const recordId = this.generateRecordId(request.userId, request.feature);

    // 3. 构建完整记录
    const record: TokenUsageRecord = {
      id: recordId,
      userId: request.userId,
      feature: request.feature,
      taskType: request.taskType,
      inputTokens: request.inputTokens,
      outputTokens: request.outputTokens,
      totalTokens: request.inputTokens + request.outputTokens,
      model: request.model,
      contentSummary: request.contentSummary?.substring(0, 200) || null,
      success: request.success,
      errorMessage: request.errorMessage || null,
      timestamp: new Date().toISOString(),
      metadata: request.metadata || null
    };

    // 4. 写入数据库
    try {
      await this.insertToDatabase(record);
      logger.info('✅ Token使用记录成功', {
        recordId,
        userId: request.userId,
        feature: request.feature,
        totalTokens: record.totalTokens
      });

      return record;
    } catch (error) {
      logger.error('❌ Token使用记录失败', {
        recordId,
        error
      });

      throw new TokenTrackingError(
        TokenTrackingErrorType.DATABASE_ERROR,
        'Failed to record token usage',
        { recordId, originalError: error }
      );
    }
  }

  /**
   * 验证请求数据
   */
  private validateRequest(request: TokenRecordRequest): void {
    const errors: string[] = [];

    if (!request.userId || typeof request.userId !== 'string') {
      errors.push('userId is required and must be a string');
    }

    if (!request.feature || typeof request.feature !== 'string') {
      errors.push('feature is required and must be a string');
    }

    if (!request.taskType || typeof request.taskType !== 'string') {
      errors.push('taskType is required and must be a string');
    }

    if (typeof request.inputTokens !== 'number' || request.inputTokens < 0) {
      errors.push('inputTokens must be a non-negative number');
    }

    if (typeof request.outputTokens !== 'number' || request.outputTokens < 0) {
      errors.push('outputTokens must be a non-negative number');
    }

    if (!request.model || typeof request.model !== 'string') {
      errors.push('model is required and must be a string');
    }

    if (errors.length > 0) {
      throw new TokenTrackingError(
        TokenTrackingErrorType.VALIDATION_ERROR,
        'Invalid token record request',
        { errors }
      );
    }
  }

  /**
   * 生成唯一记录ID
   *
   * 格式: token_{timestamp}_{userHash}_{featureHash}_{micro}_{random}
   * 示例: token_1704067200000_a3f8_cont_123_x9k2
   */
  private generateRecordId(userId: string, feature: string): string {
    const timestamp = Date.now();
    const microPart = Math.floor((performance.now() % 1) * 1000)
      .toString()
      .padStart(3, '0');
    const randomPart = Math.random().toString(36).substring(2, 6);

    // 用户ID哈希 (取最后4位,移除特殊字符)
    const userHash = userId
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(userId.length - 4)
      .toLowerCase();

    // 功能名哈希 (取前4位,移除特殊字符)
    const featureHash = feature
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toLowerCase();

    return `token_${timestamp}_${userHash}_${featureHash}_${microPart}_${randomPart}`;
  }

  /**
   * 插入数据库 (带重复检查)
   */
  private async insertToDatabase(record: TokenUsageRecord): Promise<void> {
    const client = await getSupabaseClient();

    // 1. 检查记录是否已存在
    const { data: existing, error: checkError } = await client
      .from(TABLE_NAMES.USER_USAGE_LOGS)
      .select('id')
      .eq('id', record.id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      logger.warn('⚠️  记录已存在,跳过插入', { recordId: record.id });
      return; // 幂等性: 记录已存在视为成功
    }

    // 2. 转换为数据库格式 (snake_case)
    const dbRecord: DBTokenUsageRecord = {
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
      metadata: record.metadata
    };

    // 3. 插入记录
    const { error: insertError } = await client
      .from(TABLE_NAMES.USER_USAGE_LOGS)
      .insert(dbRecord);

    if (insertError) {
      // 特殊处理主键重复错误 (23505 = unique_violation)
      if (insertError.code === '23505') {
        logger.warn('⚠️  主键重复,记录可能已存在', { recordId: record.id });
        return; // 幂等性: 主键重复视为成功
      }

      // 其他错误抛出
      throw insertError;
    }

    logger.debug('📝 数据库插入成功', { recordId: record.id });
  }

  /**
   * 批量记录Token使用 (性能优化)
   *
   * @param requests 请求列表
   * @returns 成功数量
   */
  async recordBatch(requests: TokenRecordRequest[]): Promise<number> {
    if (requests.length === 0) {
      return 0;
    }

    logger.info(`📦 批量记录Token使用 (${requests.length}条)`);

    let successCount = 0;
    const errors: any[] = [];

    // 并发写入,但限制并发数避免压垮数据库
    const BATCH_SIZE = 10;
    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(req => this.recordUsage(req))
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          errors.push({
            index: i + index,
            error: result.reason
          });
        }
      });
    }

    if (errors.length > 0) {
      logger.warn(`⚠️  批量记录部分失败`, {
        total: requests.length,
        success: successCount,
        failed: errors.length,
        errors: errors.slice(0, 5) // 只记录前5个错误
      });
    } else {
      logger.info(`✅ 批量记录全部成功 (${successCount}/${requests.length})`);
    }

    return successCount;
  }
}

/**
 * 导出单例实例
 */
export const tokenRecorder = TokenRecorder.getInstance();
