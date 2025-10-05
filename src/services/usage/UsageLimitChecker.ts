/**
 * 使用次数限制检查服务
 * @description 在AI调用前检查使用次数限制，在AI调用后扣减使用次数
 */

import { logger } from '@/utils/logger';
import { UserIdValidator } from '@/utils/userIdValidator';
import { UsageCountService } from '@/services/usage/UsageCountService';
import { USAGE_COUNT_CONFIG } from '@/config/inviteRewardConfig';

/**
 * AI调用包装器选项
 */
export interface AICallWrapperOptions {
  /** 用户ID */
  userId: string;
  /** 功能名称 */
  feature: string;
  /** 是否跳过使用次数检查（用于特殊场景） */
  skipUsageCheck?: boolean;
  /** 消耗的使用次数（默认为1） */
  usageCount?: number;
}

/**
 * AI调用函数类型
 */
export type AICallFunction<T> = () => Promise<T>;

/**
 * 使用次数限制检查服务类
 */
export class UsageLimitChecker {
  /**
   * 包装AI调用，自动检查和扣减使用次数
   * 
   * @example
   * ```typescript
   * const result = await UsageLimitChecker.wrapAICall(
   *   {
   *     userId: user.id,
   *     feature: 'content_generation'
   *   },
   *   async () => {
   *     return await aiService.generateContent(...);
   *   }
   * );
   * ```
   */
  static async wrapAICall<T>(
    options: AICallWrapperOptions,
    aiCallFn: AICallFunction<T>
  ): Promise<T> {
    const { userId, feature, skipUsageCheck = false, usageCount = 1 } = options;

    try {
      // 验证用户ID
      UserIdValidator.validate(userId, 'UsageLimitChecker.wrapAICall');

      // 1. 检查使用次数限制（如果未跳过）
      if (!skipUsageCheck && USAGE_COUNT_CONFIG.enableLimit) {
        const limitCheck = await UsageCountService.checkUsageLimit(
          userId,
          feature,
          usageCount
        );

        if (!limitCheck.allowed) {
          logger.warn('使用次数不足', {
            userId: UserIdValidator.formatForLog(userId),
            feature,
            remainingCount: limitCheck.remainingCount,
            reason: limitCheck.reason
          });

          throw new UsageLimitError(
            limitCheck.reason || USAGE_COUNT_CONFIG.insufficientMessage,
            limitCheck.remainingCount,
            limitCheck.suggestedAction
          );
        }

        logger.info('✅ 使用次数检查通过', {
          userId: UserIdValidator.formatForLog(userId),
          feature,
          remainingCount: limitCheck.remainingCount
        });
      }

      // 2. 执行AI调用
      const result = await aiCallFn();

      // 3. 扣减使用次数（如果未跳过）
      if (!skipUsageCheck && USAGE_COUNT_CONFIG.enableLimit) {
        const decrementResult = await UsageCountService.decrementUsageCount(
          userId,
          feature,
          usageCount
        );

        if (decrementResult.success) {
          logger.info('✅ 使用次数扣减成功', {
            userId: UserIdValidator.formatForLog(userId),
            feature,
            remainingCount: decrementResult.remainingCount
          });
        } else {
          // 扣减失败只记录警告，不影响AI调用结果
          logger.warn('⚠️ 使用次数扣减失败:', decrementResult.error);
        }
      }

      return result;
    } catch (error) {
      // 如果是使用次数不足错误，直接抛出
      if (error instanceof UsageLimitError) {
        throw error;
      }

      // 其他错误也抛出
      logger.error('AI调用包装器异常:', error);
      throw error;
    }
  }

  /**
   * 检查用户是否有足够的使用次数
   */
  static async checkLimit(
    userId: string,
    feature: string = 'ai_generation',
    requiredCount: number = 1
  ): Promise<{
    allowed: boolean;
    remainingCount: number;
    reason?: string;
    suggestedAction?: 'upgrade' | 'invite' | 'wait';
  }> {
    try {
      UserIdValidator.validate(userId, 'UsageLimitChecker.checkLimit');

      if (!USAGE_COUNT_CONFIG.enableLimit) {
        return {
          allowed: true,
          remainingCount: 999999
        };
      }

      return await UsageCountService.checkUsageLimit(userId, feature, requiredCount);
    } catch (error) {
      logger.error('检查使用次数限制异常:', error);
      return {
        allowed: false,
        remainingCount: 0,
        reason: error instanceof Error ? error.message : '未知错误',
        suggestedAction: 'upgrade'
      };
    }
  }

  /**
   * 获取用户剩余使用次数
   */
  static async getRemainingCount(
    userId: string,
    feature: string = 'ai_generation'
  ): Promise<number> {
    try {
      UserIdValidator.validate(userId, 'UsageLimitChecker.getRemainingCount');

      const result = await UsageCountService.getRemainingCount(userId, feature);
      return result.success ? result.remainingCount : 0;
    } catch (error) {
      logger.error('获取剩余使用次数异常:', error);
      return 0;
    }
  }

  /**
   * 手动扣减使用次数（用于特殊场景）
   */
  static async decrementCount(
    userId: string,
    feature: string = 'ai_generation',
    count: number = 1
  ): Promise<boolean> {
    try {
      UserIdValidator.validate(userId, 'UsageLimitChecker.decrementCount');

      const result = await UsageCountService.decrementUsageCount(userId, feature, count);
      return result.success;
    } catch (error) {
      logger.error('扣减使用次数异常:', error);
      return false;
    }
  }

  /**
   * 手动增加使用次数（用于奖励发放）
   */
  static async incrementCount(
    userId: string,
    count: number,
    source: string = 'reward'
  ): Promise<boolean> {
    try {
      UserIdValidator.validate(userId, 'UsageLimitChecker.incrementCount');

      const result = await UsageCountService.incrementUsageCount(userId, count, source);
      return result.success;
    } catch (error) {
      logger.error('增加使用次数异常:', error);
      return false;
    }
  }
}

/**
 * 使用次数不足错误类
 */
export class UsageLimitError extends Error {
  public readonly remainingCount: number;
  public readonly suggestedAction?: 'upgrade' | 'invite' | 'wait';

  constructor(
    message: string,
    remainingCount: number,
    suggestedAction?: 'upgrade' | 'invite' | 'wait'
  ) {
    super(message);
    this.name = 'UsageLimitError';
    this.remainingCount = remainingCount;
    this.suggestedAction = suggestedAction;

    // 保持正确的原型链
    Object.setPrototypeOf(this, UsageLimitError.prototype);
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage(): string {
    const messages = {
      upgrade: '使用次数不足，请升级套餐以获取更多使用次数',
      invite: '使用次数不足，邀请好友可获得额外使用次数',
      wait: '使用次数不足，请等待下月重置或邀请好友获取更多次数'
    };

    return this.suggestedAction
      ? messages[this.suggestedAction]
      : this.message;
  }

  /**
   * 转换为JSON格式
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      remainingCount: this.remainingCount,
      suggestedAction: this.suggestedAction,
      userFriendlyMessage: this.getUserFriendlyMessage()
    };
  }
}

/**
 * 导出便捷函数
 */
export const wrapAICall = UsageLimitChecker.wrapAICall.bind(UsageLimitChecker);
export const checkUsageLimit = UsageLimitChecker.checkLimit.bind(UsageLimitChecker);
export const getRemainingUsageCount = UsageLimitChecker.getRemainingCount.bind(UsageLimitChecker);

