/**
 * 使用统计重置服务
 * 
 * 用于在订阅升级时自动重置使用统计
 */

import { getSupabaseClient } from '@/services/supabaseDataService';
import { logger } from '@/utils/logger';
import type { SubscriptionTier, SubscriptionPeriod } from '@/types/subscription';

/**
 * 订阅升级类型
 */
export type UpgradeType = 
  | 'tier_upgrade'      // 套餐等级升级 (trial → pro, pro → premium)
  | 'period_upgrade'    // 付费周期升级 (monthly → yearly)
  | 'renewal'           // 续费 (相同套餐和周期)
  | 'new_subscription'; // 新订阅

/**
 * 判断是否为升级（需要重置使用统计）
 */
export function isUpgrade(
  oldTier: SubscriptionTier | null,
  newTier: SubscriptionTier,
  oldPeriod?: SubscriptionPeriod | null,
  newPeriod?: SubscriptionPeriod
): { isUpgrade: boolean; upgradeType: UpgradeType } {
  // 1. 新订阅
  if (!oldTier) {
    return { isUpgrade: true, upgradeType: 'new_subscription' };
  }

  // 2. 套餐等级升级
  const tierLevels: Record<SubscriptionTier, number> = {
    trial: 1,
    pro: 2,
    premium: 3
  };

  if (tierLevels[newTier] > tierLevels[oldTier]) {
    return { isUpgrade: true, upgradeType: 'tier_upgrade' };
  }

  // 3. 付费周期升级 (monthly → yearly)
  if (
    oldTier === newTier &&
    oldPeriod === 'monthly' &&
    newPeriod === 'yearly'
  ) {
    return { isUpgrade: true, upgradeType: 'period_upgrade' };
  }

  // 4. 续费（相同套餐和周期）
  return { isUpgrade: false, upgradeType: 'renewal' };
}

/**
 * 重置用户的使用统计
 * 
 * @param userId 用户ID
 * @param reason 重置原因（用于日志）
 */
export async function resetUsageStats(
  userId: string,
  reason: string = '订阅升级'
): Promise<{
  success: boolean;
  deletedTokenRecords: number;
  deletedUsageRecords: number;
  error?: string;
}> {
  try {
    logger.info('🔄 开始重置使用统计', { userId, reason });

    const client = await getSupabaseClient();

    // 1. 删除 Token 使用记录
    const { data: tokenRecords, error: tokenQueryError } = await client
      .from('token_usage_records')
      .select('id')
      .eq('user_id', userId);

    if (tokenQueryError) {
      throw new Error(`查询Token记录失败: ${tokenQueryError.message}`);
    }

    const tokenCount = tokenRecords?.length || 0;

    if (tokenCount > 0) {
      const { error: tokenDeleteError } = await client
        .from('token_usage_records')
        .delete()
        .eq('user_id', userId);

      if (tokenDeleteError) {
        throw new Error(`删除Token记录失败: ${tokenDeleteError.message}`);
      }

      logger.info(`✅ 已删除 ${tokenCount} 条Token使用记录`, { userId });
    }

    // 2. 删除使用次数记录
    const { data: usageRecords, error: usageQueryError } = await client
      .from('usage_count_records')
      .select('id')
      .eq('user_id', userId);

    if (usageQueryError) {
      throw new Error(`查询使用次数记录失败: ${usageQueryError.message}`);
    }

    const usageCount = usageRecords?.length || 0;

    if (usageCount > 0) {
      const { error: usageDeleteError } = await client
        .from('usage_count_records')
        .delete()
        .eq('user_id', userId);

      if (usageDeleteError) {
        throw new Error(`删除使用次数记录失败: ${usageDeleteError.message}`);
      }

      logger.info(`✅ 已删除 ${usageCount} 条使用次数记录`, { userId });
    }

    logger.info('✅ 使用统计重置成功', {
      userId,
      reason,
      deletedTokenRecords: tokenCount,
      deletedUsageRecords: usageCount
    });

    return {
      success: true,
      deletedTokenRecords: tokenCount,
      deletedUsageRecords: usageCount
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    logger.error('❌ 重置使用统计失败', { userId, reason, error: errorMessage });

    return {
      success: false,
      deletedTokenRecords: 0,
      deletedUsageRecords: 0,
      error: errorMessage
    };
  }
}

/**
 * 在订阅更新时检查并重置使用统计
 * 
 * @param userId 用户ID
 * @param oldTier 旧套餐等级
 * @param newTier 新套餐等级
 * @param oldPeriod 旧付费周期
 * @param newPeriod 新付费周期
 */
export async function checkAndResetOnSubscriptionUpdate(
  userId: string,
  oldTier: SubscriptionTier | null,
  newTier: SubscriptionTier,
  oldPeriod?: SubscriptionPeriod | null,
  newPeriod?: SubscriptionPeriod
): Promise<void> {
  const { isUpgrade: shouldReset, upgradeType } = isUpgrade(
    oldTier,
    newTier,
    oldPeriod,
    newPeriod
  );

  if (shouldReset) {
    logger.info('🔄 检测到订阅升级，准备重置使用统计', {
      userId,
      upgradeType,
      oldTier,
      newTier,
      oldPeriod,
      newPeriod
    });

    const result = await resetUsageStats(userId, `订阅${upgradeType}`);

    if (result.success) {
      logger.info('✅ 订阅升级后使用统计重置成功', {
        userId,
        upgradeType,
        deletedTokenRecords: result.deletedTokenRecords,
        deletedUsageRecords: result.deletedUsageRecords
      });
    } else {
      logger.error('❌ 订阅升级后使用统计重置失败', {
        userId,
        upgradeType,
        error: result.error
      });
    }
  } else {
    logger.info('ℹ️  订阅续费，不重置使用统计', {
      userId,
      upgradeType,
      tier: newTier,
      period: newPeriod
    });
  }
}

