/**
 * 使用次数管理服务
 * @description 管理用户的AI使用次数，包括查询、扣减、增加、重置等功能
 */

import { getSupabaseClient, TABLE_NAMES } from '@/services/supabaseDataService';
import { logger } from '@/utils/logger';
import { UserIdValidator } from '@/utils/userIdValidator';
import { USAGE_COUNT_CONFIG, getBaseUsageCount } from '@/config/inviteRewardConfig';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 使用次数查询结果接口
 */
export interface UsageCountResult {
  /** 是否成功 */
  success: boolean;
  /** 总使用次数 */
  totalCount: number;
  /** 已使用次数 */
  usedCount: number;
  /** 剩余使用次数 */
  remainingCount: number;
  /** 套餐基础次数 */
  baseCount: number;
  /** 奖励次数 */
  bonusCount: number;
  /** 错误信息 */
  error?: string;
}

/**
 * 使用次数扣减结果接口
 */
export interface DecrementResult {
  /** 是否成功 */
  success: boolean;
  /** 扣减后剩余次数 */
  remainingCount: number;
  /** 错误信息 */
  error?: string;
}

/**
 * 使用次数限制检查结果接口
 */
export interface UsageLimitCheckResult {
  /** 是否允许使用 */
  allowed: boolean;
  /** 剩余次数 */
  remainingCount: number;
  /** 拒绝原因 */
  reason?: string;
  /** 建议操作 */
  suggestedAction?: 'upgrade' | 'invite' | 'wait';
}

/**
 * 使用次数管理服务类
 */
export class UsageCountService {
  /**
   * 获取用户剩余使用次数
   */
  static async getRemainingCount(
    userId: string,
    feature: string = 'ai_generation'
  ): Promise<UsageCountResult> {
    try {
      // 验证用户ID
      UserIdValidator.validate(userId, 'UsageCountService.getRemainingCount');

      const supabase = await getSupabaseClient();

      // 1. 获取用户使用次数余额
      const { data: balance, error: balanceError } = await supabase
        .from('user_usage_balance')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (balanceError && balanceError.code !== 'PGRST116') {
        logger.error('查询使用次数余额失败:', balanceError);
        throw balanceError;
      }

      // 2. 如果没有余额记录，初始化
      if (!balance) {
        const initialized = await this.initializeUserBalance(userId);
        return initialized;
      }

      // 3. 检查是否需要重置
      const needReset = await this.checkNeedReset(balance);
      if (needReset) {
        const reset = await this.resetUserBalance(userId);
        return reset;
      }

      // 4. 返回结果
      return {
        success: true,
        totalCount: balance.total_count || 0,
        usedCount: balance.used_count || 0,
        remainingCount: balance.remaining_count || 0,
        baseCount: balance.base_count || 0,
        bonusCount: balance.bonus_count || 0
      };
    } catch (error) {
      logger.error('获取剩余使用次数失败:', error);
      return {
        success: false,
        totalCount: 0,
        usedCount: 0,
        remainingCount: 0,
        baseCount: 0,
        bonusCount: 0,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 扣减使用次数
   */
  static async decrementUsageCount(
    userId: string,
    feature: string = 'ai_generation',
    count: number = 1
  ): Promise<DecrementResult> {
    try {
      // 验证用户ID
      UserIdValidator.validate(userId, 'UsageCountService.decrementUsageCount');

      if (count <= 0) {
        return {
          success: false,
          remainingCount: 0,
          error: '扣减次数必须大于0'
        };
      }

      const supabase = await getSupabaseClient();

      // 1. 获取当前余额
      const currentBalance = await this.getRemainingCount(userId, feature);
      
      if (!currentBalance.success) {
        return {
          success: false,
          remainingCount: 0,
          error: currentBalance.error
        };
      }

      // 2. 检查余额是否足够
      if (currentBalance.remainingCount < count) {
        return {
          success: false,
          remainingCount: currentBalance.remainingCount,
          error: USAGE_COUNT_CONFIG.insufficientMessage
        };
      }

      // 3. 扣减次数
      const newUsedCount = currentBalance.usedCount + count;
      const newRemainingCount = currentBalance.remainingCount - count;

      const { error: updateError } = await supabase
        .from('user_usage_balance')
        .update({
          used_count: newUsedCount,
          remaining_count: newRemainingCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        logger.error('扣减使用次数失败:', updateError);
        throw updateError;
      }

      // 4. 记录使用日志
      await this.recordUsageLog(userId, feature, -count);

      logger.info('✅ 使用次数扣减成功', {
        userId: UserIdValidator.formatForLog(userId),
        feature,
        count,
        remainingCount: newRemainingCount
      });

      return {
        success: true,
        remainingCount: newRemainingCount
      };
    } catch (error) {
      logger.error('扣减使用次数异常:', error);
      return {
        success: false,
        remainingCount: 0,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 增加使用次数（奖励）
   */
  static async incrementUsageCount(
    userId: string,
    count: number,
    source: string = 'reward'
  ): Promise<DecrementResult> {
    try {
      // 验证用户ID
      UserIdValidator.validate(userId, 'UsageCountService.incrementUsageCount');

      if (count <= 0) {
        return {
          success: false,
          remainingCount: 0,
          error: '增加次数必须大于0'
        };
      }

      const supabase = await getSupabaseClient();

      // 1. 获取当前余额
      const currentBalance = await this.getRemainingCount(userId);
      
      if (!currentBalance.success) {
        return {
          success: false,
          remainingCount: 0,
          error: currentBalance.error
        };
      }

      // 2. 增加次数
      const newBonusCount = currentBalance.bonusCount + count;
      const newTotalCount = currentBalance.totalCount + count;
      const newRemainingCount = currentBalance.remainingCount + count;

      const { error: updateError } = await supabase
        .from('user_usage_balance')
        .update({
          bonus_count: newBonusCount,
          total_count: newTotalCount,
          remaining_count: newRemainingCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        logger.error('增加使用次数失败:', updateError);
        throw updateError;
      }

      // 3. 记录使用日志
      await this.recordUsageLog(userId, source, count);

      logger.info('✅ 使用次数增加成功', {
        userId: UserIdValidator.formatForLog(userId),
        count,
        source,
        remainingCount: newRemainingCount
      });

      return {
        success: true,
        remainingCount: newRemainingCount
      };
    } catch (error) {
      logger.error('增加使用次数异常:', error);
      return {
        success: false,
        remainingCount: 0,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 检查使用次数限制
   */
  static async checkUsageLimit(
    userId: string,
    feature: string = 'ai_generation',
    requiredCount: number = 1
  ): Promise<UsageLimitCheckResult> {
    try {
      // 如果未启用限制，直接允许
      if (!USAGE_COUNT_CONFIG.enableLimit) {
        return {
          allowed: true,
          remainingCount: 999999
        };
      }

      // 验证用户ID
      UserIdValidator.validate(userId, 'UsageCountService.checkUsageLimit');

      // 获取剩余次数
      const balance = await this.getRemainingCount(userId, feature);

      if (!balance.success) {
        return {
          allowed: false,
          remainingCount: 0,
          reason: balance.error,
          suggestedAction: 'upgrade'
        };
      }

      // 检查是否足够
      if (balance.remainingCount < requiredCount) {
        return {
          allowed: false,
          remainingCount: balance.remainingCount,
          reason: USAGE_COUNT_CONFIG.insufficientMessage,
          suggestedAction: balance.bonusCount > 0 ? 'wait' : 'invite'
        };
      }

      return {
        allowed: true,
        remainingCount: balance.remainingCount
      };
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
   * 初始化用户余额
   */
  private static async initializeUserBalance(userId: string): Promise<UsageCountResult> {
    try {
      const supabase = await getSupabaseClient();

      // 获取用户套餐
      const userTier = await this.getUserTier(userId);
      const baseCount = getBaseUsageCount(userTier);

      // 创建余额记录
      const { error: insertError } = await supabase
        .from('user_usage_balance')
        .insert({
          user_id: userId,
          total_count: baseCount,
          used_count: 0,
          remaining_count: baseCount,
          base_count: baseCount,
          bonus_count: 0,
          last_reset_at: new Date().toISOString(),
          reset_period: USAGE_COUNT_CONFIG.resetPeriod
        });

      if (insertError) {
        logger.error('初始化用户余额失败:', insertError);
        throw insertError;
      }

      logger.info('✅ 用户余额初始化成功', {
        userId: UserIdValidator.formatForLog(userId),
        baseCount
      });

      return {
        success: true,
        totalCount: baseCount,
        usedCount: 0,
        remainingCount: baseCount,
        baseCount: baseCount,
        bonusCount: 0
      };
    } catch (error) {
      logger.error('初始化用户余额异常:', error);
      throw error;
    }
  }

  /**
   * 重置用户余额
   */
  private static async resetUserBalance(userId: string): Promise<UsageCountResult> {
    try {
      const supabase = await getSupabaseClient();

      // 获取用户套餐
      const userTier = await this.getUserTier(userId);
      const baseCount = getBaseUsageCount(userTier);

      // 获取当前奖励次数
      const { data: currentBalance } = await supabase
        .from('user_usage_balance')
        .select('bonus_count')
        .eq('user_id', userId)
        .single();

      const bonusCount = currentBalance?.bonus_count || 0;
      const totalCount = baseCount + bonusCount;

      // 重置余额
      const { error: updateError } = await supabase
        .from('user_usage_balance')
        .update({
          total_count: totalCount,
          used_count: 0,
          remaining_count: totalCount,
          base_count: baseCount,
          last_reset_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        logger.error('重置用户余额失败:', updateError);
        throw updateError;
      }

      logger.info('✅ 用户余额重置成功', {
        userId: UserIdValidator.formatForLog(userId),
        totalCount
      });

      return {
        success: true,
        totalCount,
        usedCount: 0,
        remainingCount: totalCount,
        baseCount,
        bonusCount
      };
    } catch (error) {
      logger.error('重置用户余额异常:', error);
      throw error;
    }
  }

  /**
   * 检查是否需要重置
   */
  private static async checkNeedReset(balance: any): Promise<boolean> {
    if (balance.reset_period === 'never') {
      return false;
    }

    const lastReset = new Date(balance.last_reset_at);
    const now = new Date();

    if (balance.reset_period === 'monthly') {
      // 检查是否跨月
      return lastReset.getMonth() !== now.getMonth() ||
             lastReset.getFullYear() !== now.getFullYear();
    }

    if (balance.reset_period === 'daily') {
      // 检查是否跨天
      return lastReset.getDate() !== now.getDate() ||
             lastReset.getMonth() !== now.getMonth() ||
             lastReset.getFullYear() !== now.getFullYear();
    }

    return false;
  }

  /**
   * 获取用户套餐
   */
  private static async getUserTier(userId: string): Promise<SubscriptionTier> {
    try {
      const supabase = await getSupabaseClient();

      const { data: subscription } = await supabase
        .from(TABLE_NAMES.USER_SUBSCRIPTIONS)
        .select('tier')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return (subscription?.tier as SubscriptionTier) || 'trial';
    } catch (error) {
      logger.warn('获取用户套餐失败，使用默认套餐:', error);
      return 'trial';
    }
  }

  /**
   * 记录使用日志
   */
  private static async recordUsageLog(
    userId: string,
    feature: string,
    count: number
  ): Promise<void> {
    try {
      const supabase = await getSupabaseClient();

      await supabase
        .from('usage_count_records')
        .insert({
          user_id: userId,
          feature: feature,
          count: count,
          used_at: new Date().toISOString()
        });
    } catch (error) {
      // 日志记录失败不影响主流程
      logger.warn('记录使用日志失败:', error);
    }
  }

  /**
   * 批量重置用户余额（定时任务使用）
   */
  static async batchResetUserBalances(): Promise<{ success: number; failed: number }> {
    try {
      const supabase = await getSupabaseClient();

      // 获取所有需要重置的用户
      const { data: balances, error } = await supabase
        .from('user_usage_balance')
        .select('user_id, reset_period, last_reset_at');

      if (error) {
        logger.error('获取用户余额列表失败:', error);
        throw error;
      }

      let successCount = 0;
      let failedCount = 0;

      for (const balance of balances || []) {
        try {
          const needReset = await this.checkNeedReset(balance);
          if (needReset) {
            await this.resetUserBalance(balance.user_id);
            successCount++;
          }
        } catch (error) {
          logger.error(`重置用户 ${balance.user_id} 余额失败:`, error);
          failedCount++;
        }
      }

      logger.info('✅ 批量重置用户余额完成', { successCount, failedCount });

      return { success: successCount, failed: failedCount };
    } catch (error) {
      logger.error('批量重置用户余额异常:', error);
      return { success: 0, failed: 0 };
    }
  }
}

/**
 * 导出便捷函数
 */
export const getRemainingCount = UsageCountService.getRemainingCount.bind(UsageCountService);
export const decrementUsageCount = UsageCountService.decrementUsageCount.bind(UsageCountService);
export const incrementUsageCount = UsageCountService.incrementUsageCount.bind(UsageCountService);
export const checkUsageLimit = UsageCountService.checkUsageLimit.bind(UsageCountService);


