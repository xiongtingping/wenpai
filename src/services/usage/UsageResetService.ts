/**
 * 使用次数重置服务
 * @description 定时重置用户的使用次数（每月/每日）
 */

import { logger } from '@/utils/logger';
import { UsageCountService } from '@/services/usage/UsageCountService';

/**
 * 重置结果接口
 */
export interface ResetResult {
  /** 成功数量 */
  successCount: number;
  /** 失败数量 */
  failedCount: number;
  /** 总数量 */
  totalCount: number;
  /** 开始时间 */
  startTime: Date;
  /** 结束时间 */
  endTime: Date;
  /** 耗时（毫秒） */
  duration: number;
}

/**
 * 使用次数重置服务类
 */
export class UsageResetService {
  /**
   * 执行月度重置
   */
  static async executeMonthlyReset(): Promise<ResetResult> {
    const startTime = new Date();
    logger.info('🔄 开始执行月度使用次数重置');

    try {
      const result = await UsageCountService.batchResetUserBalances();

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const resetResult: ResetResult = {
        successCount: result.success,
        failedCount: result.failed,
        totalCount: result.success + result.failed,
        startTime,
        endTime,
        duration
      };

      logger.info('✅ 月度使用次数重置完成', {
        successCount: resetResult.successCount,
        failedCount: resetResult.failedCount,
        duration: `${(duration / 1000).toFixed(2)}s`
      });

      return resetResult;
    } catch (error) {
      logger.error('月度使用次数重置异常:', error);
      
      const endTime = new Date();
      return {
        successCount: 0,
        failedCount: 0,
        totalCount: 0,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime()
      };
    }
  }

  /**
   * 执行每日重置（如果配置为每日重置）
   */
  static async executeDailyReset(): Promise<ResetResult> {
    const startTime = new Date();
    logger.info('🔄 开始执行每日使用次数重置');

    try {
      const result = await UsageCountService.batchResetUserBalances();

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const resetResult: ResetResult = {
        successCount: result.success,
        failedCount: result.failed,
        totalCount: result.success + result.failed,
        startTime,
        endTime,
        duration
      };

      logger.info('✅ 每日使用次数重置完成', {
        successCount: resetResult.successCount,
        failedCount: resetResult.failedCount,
        duration: `${(duration / 1000).toFixed(2)}s`
      });

      return resetResult;
    } catch (error) {
      logger.error('每日使用次数重置异常:', error);
      
      const endTime = new Date();
      return {
        successCount: 0,
        failedCount: 0,
        totalCount: 0,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime()
      };
    }
  }

  /**
   * 检查是否需要执行重置
   */
  static shouldExecuteReset(lastResetTime: Date, period: 'monthly' | 'daily'): boolean {
    const now = new Date();

    if (period === 'monthly') {
      // 检查是否跨月
      return lastResetTime.getMonth() !== now.getMonth() ||
             lastResetTime.getFullYear() !== now.getFullYear();
    }

    if (period === 'daily') {
      // 检查是否跨天
      return lastResetTime.getDate() !== now.getDate() ||
             lastResetTime.getMonth() !== now.getMonth() ||
             lastResetTime.getFullYear() !== now.getFullYear();
    }

    return false;
  }

  /**
   * 获取下次重置时间
   */
  static getNextResetTime(period: 'monthly' | 'daily'): Date {
    const now = new Date();

    if (period === 'monthly') {
      // 下个月1号 00:00:00
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
      return nextMonth;
    }

    if (period === 'daily') {
      // 明天 00:00:00
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      return tomorrow;
    }

    return now;
  }

  /**
   * 格式化重置结果为可读字符串
   */
  static formatResetResult(result: ResetResult): string {
    const successRate = result.totalCount > 0
      ? ((result.successCount / result.totalCount) * 100).toFixed(2)
      : '0.00';

    return `
重置完成报告：
- 总用户数：${result.totalCount}
- 成功重置：${result.successCount}
- 失败重置：${result.failedCount}
- 成功率：${successRate}%
- 开始时间：${result.startTime.toISOString()}
- 结束时间：${result.endTime.toISOString()}
- 总耗时：${(result.duration / 1000).toFixed(2)}秒
    `.trim();
  }
}

/**
 * 导出便捷函数
 */
export const executeMonthlyReset = UsageResetService.executeMonthlyReset.bind(UsageResetService);
export const executeDailyReset = UsageResetService.executeDailyReset.bind(UsageResetService);
export const shouldExecuteReset = UsageResetService.shouldExecuteReset.bind(UsageResetService);
export const getNextResetTime = UsageResetService.getNextResetTime.bind(UsageResetService);

