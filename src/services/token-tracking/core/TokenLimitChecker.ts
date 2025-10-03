/**
 * Token限额检查器 - 核心限额控制服务
 * @description 负责检查Token使用限额,防止超额使用
 *
 * 职责:
 * 1. 检查预估Token是否超过限额
 * 2. 计算预测使用后的状态
 * 3. 提供升级建议
 * 4. 安全优先 (Fail-Closed)
 *
 * 安全原则:
 * - 数据库查询失败时拒绝请求 (Fail-Closed)
 * - 不允许静默降级
 * - 所有限额检查必须基于实时数据
 */

import { logger } from '@/utils/logger';
import type { SubscriptionTier } from '@/types/subscription';
import {
  type TokenLimitCheckResult,
  type TokenStats,
  TokenTrackingError,
  TokenTrackingErrorType
} from '../types';
import { tokenStatsQuery } from './TokenStatsQuery';

export class TokenLimitChecker {
  private static instance: TokenLimitChecker;

  private constructor() {}

  static getInstance(): TokenLimitChecker {
    if (!TokenLimitChecker.instance) {
      TokenLimitChecker.instance = new TokenLimitChecker();
    }
    return TokenLimitChecker.instance;
  }

  /**
   * 🎯 核心方法: 检查Token限额
   *
   * @throws {TokenTrackingError} 数据库错误时抛出异常 (Fail-Closed)
   */
  async checkLimit(
    userId: string,
    userTier: SubscriptionTier,
    estimatedTokens: number
  ): Promise<TokenLimitCheckResult> {
    // 1. 验证输入
    this.validateInput(userId, estimatedTokens);

    try {
      // 2. 获取当前统计 (从数据库,不使用缓存)
      const currentStats = await tokenStatsQuery.getStats({
        userId,
        userTier,
        forceRefresh: true // 限额检查必须使用最新数据
      });

      logger.debug('🔍 Token限额检查', {
        userId,
        currentUsed: currentStats.monthlyUsed,
        limit: currentStats.monthlyLimit,
        estimated: estimatedTokens
      });

      // 3. 计算预估使用后的状态
      const projectedUsed = currentStats.monthlyUsed + estimatedTokens;
      const projectedRemaining = Math.max(0, currentStats.monthlyLimit - projectedUsed);
      const projectedPercentage =
        currentStats.monthlyLimit > 0
          ? (projectedUsed / currentStats.monthlyLimit) * 100
          : 0;

      const projectedStats = {
        monthlyUsed: projectedUsed,
        monthlyRemaining: projectedRemaining,
        usagePercentage: projectedPercentage
      };

      // 4. 判断是否超过限额
      if (projectedUsed > currentStats.monthlyLimit) {
        logger.warn('❌ Token限额不足', {
          userId,
          currentUsed: currentStats.monthlyUsed,
          limit: currentStats.monthlyLimit,
          estimated: estimatedTokens,
          shortfall: projectedUsed - currentStats.monthlyLimit
        });

        return {
          allowed: false,
          reason: `Token不足: 当前已使用 ${currentStats.monthlyUsed.toLocaleString()}/${currentStats.monthlyLimit.toLocaleString()}, 本次预估需要 ${estimatedTokens.toLocaleString()}, 将超出 ${(projectedUsed - currentStats.monthlyLimit).toLocaleString()}`,
          suggestedAction: userTier === 'premium' ? 'wait' : 'upgrade',
          currentStats,
          projectedStats
        };
      }

      // 5. 警告接近限额 (90%以上)
      if (projectedPercentage >= 90) {
        logger.warn('⚠️  Token接近限额', {
          userId,
          usagePercentage: projectedPercentage.toFixed(2) + '%'
        });

        return {
          allowed: true,
          reason: `Token使用量接近限额 (${projectedPercentage.toFixed(1)}%), 建议升级套餐`,
          suggestedAction: 'upgrade',
          currentStats,
          projectedStats
        };
      }

      // 6. 通知高使用率 (75%以上)
      if (projectedPercentage >= 75) {
        return {
          allowed: true,
          reason: `Token使用量较高 (${projectedPercentage.toFixed(1)}%), 请注意剩余配额`,
          suggestedAction: 'reduce_usage',
          currentStats,
          projectedStats
        };
      }

      // 7. 正常使用
      logger.debug('✅ Token限额检查通过', {
        userId,
        usagePercentage: projectedPercentage.toFixed(2) + '%'
      });

      return {
        allowed: true,
        currentStats,
        projectedStats
      };
    } catch (error) {
      logger.error('❌ Token限额检查失败 (Fail-Closed)', {
        userId,
        userTier,
        estimatedTokens,
        error
      });

      // 🎯 安全原则: 数据库查询失败时拒绝请求
      throw new TokenTrackingError(
        TokenTrackingErrorType.DATABASE_ERROR,
        'Token限额检查失败,为安全起见拒绝请求',
        {
          userId,
          userTier,
          estimatedTokens,
          originalError: error
        }
      );
    }
  }

  /**
   * 批量检查 (用于批量AI调用)
   */
  async checkBatchLimit(
    userId: string,
    userTier: SubscriptionTier,
    requests: { estimatedTokens: number; taskId: string }[]
  ): Promise<
    {
      taskId: string;
      allowed: boolean;
      reason?: string;
    }[]
  > {
    if (requests.length === 0) {
      return [];
    }

    logger.info(`🔍 批量Token限额检查 (${requests.length}个任务)`);

    try {
      // 1. 获取当前统计
      const currentStats = await tokenStatsQuery.getStats({
        userId,
        userTier,
        forceRefresh: true
      });

      // 2. 计算总预估Token
      const totalEstimated = requests.reduce((sum, req) => sum + req.estimatedTokens, 0);

      // 3. 检查总量是否超限
      const projectedUsed = currentStats.monthlyUsed + totalEstimated;
      if (projectedUsed > currentStats.monthlyLimit) {
        // 全部拒绝
        return requests.map(req => ({
          taskId: req.taskId,
          allowed: false,
          reason: `批量操作总Token不足 (预估总量: ${totalEstimated.toLocaleString()})`
        }));
      }

      // 4. 逐个检查 (累积计算)
      const results: { taskId: string; allowed: boolean; reason?: string }[] = [];
      let accumulatedTokens = currentStats.monthlyUsed;

      for (const req of requests) {
        accumulatedTokens += req.estimatedTokens;

        if (accumulatedTokens > currentStats.monthlyLimit) {
          results.push({
            taskId: req.taskId,
            allowed: false,
            reason: `累积Token超限 (当前累积: ${accumulatedTokens.toLocaleString()}/${currentStats.monthlyLimit.toLocaleString()})`
          });
        } else {
          results.push({
            taskId: req.taskId,
            allowed: true
          });
        }
      }

      const allowedCount = results.filter(r => r.allowed).length;
      logger.info(`✅ 批量限额检查完成 (允许: ${allowedCount}/${requests.length})`);

      return results;
    } catch (error) {
      logger.error('❌ 批量限额检查失败', { userId, requestCount: requests.length, error });

      // Fail-Closed: 全部拒绝
      return requests.map(req => ({
        taskId: req.taskId,
        allowed: false,
        reason: '限额检查服务暂时不可用,请稍后重试'
      }));
    }
  }

  /**
   * 获取升级建议
   */
  getUpgradeRecommendation(
    currentStats: TokenStats,
    estimatedMonthlyUsage: number
  ): {
    shouldUpgrade: boolean;
    recommendedTier?: SubscriptionTier;
    reason: string;
  } {
    const { userTier, monthlyLimit, monthlyUsed } = currentStats;

    // 计算预估月度使用量
    const projectedMonthlyUsage = estimatedMonthlyUsage || monthlyUsed * 2; // 默认按当前的2倍估算

    // 套餐限额表
    const tierLimits: Record<SubscriptionTier, number> = {
      free: 10000,
      trial: 100000,
      pro: 200000,
      premium: 500000
    };

    // 如果当前已经是Premium,不建议升级
    if (userTier === 'premium') {
      return {
        shouldUpgrade: false,
        reason: '您已经是Premium套餐,享受最高配额'
      };
    }

    // 如果预估使用量超过当前限额的80%
    if (projectedMonthlyUsage > monthlyLimit * 0.8) {
      // 查找合适的套餐
      const tiers: SubscriptionTier[] = ['trial', 'pro', 'premium'];
      const currentTierIndex = tiers.indexOf(userTier);

      for (let i = currentTierIndex + 1; i < tiers.length; i++) {
        const tier = tiers[i];
        const limit = tierLimits[tier];

        if (projectedMonthlyUsage <= limit * 0.7) {
          // 找到合适的套餐 (预留30%余量)
          return {
            shouldUpgrade: true,
            recommendedTier: tier,
            reason: `根据您的使用量 (${projectedMonthlyUsage.toLocaleString()} tokens/月), 建议升级到 ${tier.toUpperCase()} 套餐 (${limit.toLocaleString()} tokens/月)`
          };
        }
      }

      // 即使Premium也不够,建议升级到Premium
      return {
        shouldUpgrade: true,
        recommendedTier: 'premium',
        reason: `您的使用量较高 (${projectedMonthlyUsage.toLocaleString()} tokens/月), 建议升级到 PREMIUM 套餐 (${tierLimits.premium.toLocaleString()} tokens/月)`
      };
    }

    return {
      shouldUpgrade: false,
      reason: '当前套餐配额充足'
    };
  }

  /**
   * 验证输入参数
   */
  private validateInput(userId: string, estimatedTokens: number): void {
    const errors: string[] = [];

    if (!userId || typeof userId !== 'string') {
      errors.push('userId is required and must be a string');
    }

    if (typeof estimatedTokens !== 'number' || estimatedTokens < 0) {
      errors.push('estimatedTokens must be a non-negative number');
    }

    if (estimatedTokens > 1000000) {
      errors.push('estimatedTokens is unreasonably large (>1M), please check your calculation');
    }

    if (errors.length > 0) {
      throw new TokenTrackingError(
        TokenTrackingErrorType.VALIDATION_ERROR,
        'Invalid limit check request',
        { errors }
      );
    }
  }
}

/**
 * 导出单例实例
 */
export const tokenLimitChecker = TokenLimitChecker.getInstance();
