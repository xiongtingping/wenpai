/**
 * 邀请奖励发放服务
 * @description 处理邀请奖励的发放、记录和查询
 */

import { getSupabaseClient } from '@/services/supabaseDataService';
import { logger } from '@/utils/logger';
import { UserIdValidator } from '@/utils/userIdValidator';
import {
  INVITE_REWARDS,
  RewardType,
  RewardSourceType,
  RewardStatus,
  calculateExpiryDate,
  generateRewardId,
  type RewardConfig
} from '@/config/inviteRewardConfig';
import { UsageCountService } from '@/services/usage/UsageCountService';
import { RewardNotificationService } from '@/services/notification/RewardNotificationService';

/**
 * 奖励发放结果接口
 */
export interface RewardGrantResult {
  /** 是否成功 */
  success: boolean;
  /** 发放的奖励列表 */
  rewards?: RewardRecord[];
  /** 错误信息 */
  error?: string;
}

/**
 * 奖励记录接口
 */
export interface RewardRecord {
  /** 奖励ID */
  id: string;
  /** 用户ID */
  userId: string;
  /** 奖励类型 */
  rewardType: RewardType;
  /** 奖励数量 */
  rewardAmount: number;
  /** 来源类型 */
  sourceType: RewardSourceType;
  /** 关联的邀请ID */
  relatedInviteId?: string;
  /** 关联的用户ID */
  relatedUserId?: string;
  /** 过期时间 */
  expiresAt?: Date | null;
  /** 状态 */
  status: RewardStatus;
}

/**
 * 邀请奖励发放服务类
 */
export class InviteRewardService {
  /**
   * 发放邀请奖励（主入口）
   * @param inviterId 邀请人ID
   * @param inviteeId 被邀请人ID
   * @param inviteRelationId 邀请关系ID
   */
  static async grantInviteReward(
    inviterId: string,
    inviteeId: string,
    inviteRelationId?: string
  ): Promise<RewardGrantResult> {
    try {
      // 验证用户ID
      UserIdValidator.validate(inviterId, 'InviteRewardService.grantInviteReward.inviterId');
      UserIdValidator.validate(inviteeId, 'InviteRewardService.grantInviteReward.inviteeId');

      logger.info('🎁 开始发放邀请奖励', {
        inviterId: UserIdValidator.formatForLog(inviterId),
        inviteeId: UserIdValidator.formatForLog(inviteeId)
      });

      const allRewards: RewardRecord[] = [];

      // 1. 给邀请人发放奖励
      const inviterResult = await this.grantRewardToInviter(
        inviterId,
        inviteeId,
        inviteRelationId
      );

      if (!inviterResult.success) {
        logger.error('给邀请人发放奖励失败:', inviterResult.error);
        // 继续尝试给被邀请人发放奖励
      } else {
        allRewards.push(...(inviterResult.rewards || []));
      }

      // 2. 给被邀请人发放奖励
      const inviteeResult = await this.grantRewardToInvitee(
        inviteeId,
        inviterId,
        inviteRelationId
      );

      if (!inviteeResult.success) {
        logger.error('给被邀请人发放奖励失败:', inviteeResult.error);
        // 如果邀请人奖励发放成功，但被邀请人失败，仍然返回部分成功
      } else {
        allRewards.push(...(inviteeResult.rewards || []));
      }

      // 3. 检查是否至少有一个成功
      if (allRewards.length === 0) {
        return {
          success: false,
          error: '奖励发放失败'
        };
      }

      logger.info('✅ 邀请奖励发放完成', {
        inviterId: UserIdValidator.formatForLog(inviterId),
        inviteeId: UserIdValidator.formatForLog(inviteeId),
        totalRewards: allRewards.length
      });

      // 4. 发送通知
      try {
        const inviterRewards = allRewards.filter(r => r.sourceType === RewardSourceType.INVITER);
        const inviteeRewards = allRewards.filter(r => r.sourceType === RewardSourceType.INVITEE);

        if (inviterRewards.length > 0) {
          await RewardNotificationService.sendInviteSuccessNotification(
            inviterId,
            '新用户',  // TODO: 获取被邀请人的真实姓名
            inviterRewards
          );
        }

        if (inviteeRewards.length > 0) {
          await RewardNotificationService.sendInvitedSuccessNotification(
            inviteeId,
            '邀请人',  // TODO: 获取邀请人的真实姓名
            inviteeRewards
          );
        }
      } catch (notificationError) {
        // 通知发送失败不影响奖励发放
        logger.error('发送奖励通知失败:', notificationError);
      }

      return {
        success: true,
        rewards: allRewards
      };
    } catch (error) {
      logger.error('发放邀请奖励异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 给邀请人发放奖励
   */
  static async grantRewardToInviter(
    inviterId: string,
    inviteeId: string,
    inviteRelationId?: string
  ): Promise<RewardGrantResult> {
    try {
      const rewards = INVITE_REWARDS.inviter;
      const grantedRewards: RewardRecord[] = [];

      for (const rewardConfig of rewards) {
        const result = await this.grantSingleReward(
          inviterId,
          rewardConfig,
          RewardSourceType.INVITER,
          inviteeId,
          inviteRelationId
        );

        if (result.success && result.rewards) {
          grantedRewards.push(...result.rewards);
        }
      }

      logger.info('✅ 邀请人奖励发放成功', {
        inviterId: UserIdValidator.formatForLog(inviterId),
        rewardCount: grantedRewards.length
      });

      return {
        success: true,
        rewards: grantedRewards
      };
    } catch (error) {
      logger.error('给邀请人发放奖励异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 给被邀请人发放奖励
   */
  static async grantRewardToInvitee(
    inviteeId: string,
    inviterId: string,
    inviteRelationId?: string
  ): Promise<RewardGrantResult> {
    try {
      const rewards = INVITE_REWARDS.invitee;
      const grantedRewards: RewardRecord[] = [];

      for (const rewardConfig of rewards) {
        const result = await this.grantSingleReward(
          inviteeId,
          rewardConfig,
          RewardSourceType.INVITEE,
          inviterId,
          inviteRelationId
        );

        if (result.success && result.rewards) {
          grantedRewards.push(...result.rewards);
        }
      }

      logger.info('✅ 被邀请人奖励发放成功', {
        inviteeId: UserIdValidator.formatForLog(inviteeId),
        rewardCount: grantedRewards.length
      });

      return {
        success: true,
        rewards: grantedRewards
      };
    } catch (error) {
      logger.error('给被邀请人发放奖励异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 发放单个奖励
   */
  private static async grantSingleReward(
    userId: string,
    rewardConfig: RewardConfig,
    sourceType: RewardSourceType,
    relatedUserId: string,
    inviteRelationId?: string
  ): Promise<RewardGrantResult> {
    try {
      const supabase = await getSupabaseClient();

      // 1. 生成奖励ID
      const rewardId = generateRewardId(userId, rewardConfig.type);

      // 2. 计算过期时间
      const expiresAt = calculateExpiryDate(rewardConfig.expiryDays);

      // 3. 创建奖励记录
      const rewardRecord: RewardRecord = {
        id: rewardId,
        userId: userId,
        rewardType: rewardConfig.type,
        rewardAmount: rewardConfig.amount,
        sourceType: sourceType,
        relatedInviteId: inviteRelationId,
        relatedUserId: relatedUserId,
        expiresAt: expiresAt,
        status: RewardStatus.GRANTED
      };

      // 4. 插入数据库
      const { error: insertError } = await supabase
        .from('invite_rewards')
        .insert({
          id: rewardRecord.id,
          user_id: rewardRecord.userId,
          reward_type: rewardRecord.rewardType,
          reward_amount: rewardRecord.rewardAmount,
          source_type: rewardRecord.sourceType,
          related_invite_id: rewardRecord.relatedInviteId,
          related_user_id: rewardRecord.relatedUserId,
          status: rewardRecord.status,
          expires_at: rewardRecord.expiresAt?.toISOString() || null,
          metadata: {
            description: rewardConfig.description,
            granted_at: new Date().toISOString()
          }
        });

      if (insertError) {
        logger.error('插入奖励记录失败:', insertError);
        throw insertError;
      }

      // 5. 根据奖励类型执行相应操作
      await this.applyReward(userId, rewardConfig);

      logger.info('✅ 单个奖励发放成功', {
        userId: UserIdValidator.formatForLog(userId),
        rewardType: rewardConfig.type,
        amount: rewardConfig.amount
      });

      return {
        success: true,
        rewards: [rewardRecord]
      };
    } catch (error) {
      logger.error('发放单个奖励异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 应用奖励（实际增加用户的使用次数、Token等）
   */
  private static async applyReward(
    userId: string,
    rewardConfig: RewardConfig
  ): Promise<void> {
    try {
      switch (rewardConfig.type) {
        case RewardType.USAGE_COUNT:
          // 增加使用次数
          await UsageCountService.incrementUsageCount(
            userId,
            rewardConfig.amount,
            'invite_reward'
          );
          break;

        case RewardType.TOKEN_BONUS:
          // TODO: 增加Token额度（需要集成tokenUsageService）
          logger.info('Token奖励发放（待实现）', {
            userId: UserIdValidator.formatForLog(userId),
            amount: rewardConfig.amount
          });
          break;

        case RewardType.MEMBER_DAYS:
          // TODO: 增加会员天数（需要集成subscriptionService）
          logger.info('会员天数奖励发放（待实现）', {
            userId: UserIdValidator.formatForLog(userId),
            days: rewardConfig.amount
          });
          break;

        default:
          logger.warn('未知的奖励类型:', rewardConfig.type);
      }
    } catch (error) {
      logger.error('应用奖励失败:', error);
      throw error;
    }
  }

  /**
   * 查询用户的奖励记录
   */
  static async getUserRewards(
    userId: string,
    options?: {
      status?: RewardStatus;
      rewardType?: RewardType;
      limit?: number;
    }
  ): Promise<RewardRecord[]> {
    try {
      UserIdValidator.validate(userId, 'InviteRewardService.getUserRewards');

      const supabase = await getSupabaseClient();

      let query = supabase
        .from('invite_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.rewardType) {
        query = query.eq('reward_type', options.rewardType);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('查询用户奖励记录失败:', error);
        throw error;
      }

      return (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        rewardType: record.reward_type as RewardType,
        rewardAmount: record.reward_amount,
        sourceType: record.source_type as RewardSourceType,
        relatedInviteId: record.related_invite_id,
        relatedUserId: record.related_user_id,
        expiresAt: record.expires_at ? new Date(record.expires_at) : null,
        status: record.status as RewardStatus
      }));
    } catch (error) {
      logger.error('查询用户奖励记录异常:', error);
      return [];
    }
  }

  /**
   * 统计用户获得的总奖励
   */
  static async getUserRewardSummary(userId: string): Promise<{
    totalUsageCount: number;
    totalTokenBonus: number;
    totalMemberDays: number;
  }> {
    try {
      UserIdValidator.validate(userId, 'InviteRewardService.getUserRewardSummary');

      const rewards = await this.getUserRewards(userId, {
        status: RewardStatus.GRANTED
      });

      const summary = {
        totalUsageCount: 0,
        totalTokenBonus: 0,
        totalMemberDays: 0
      };

      for (const reward of rewards) {
        switch (reward.rewardType) {
          case RewardType.USAGE_COUNT:
            summary.totalUsageCount += reward.rewardAmount;
            break;
          case RewardType.TOKEN_BONUS:
            summary.totalTokenBonus += reward.rewardAmount;
            break;
          case RewardType.MEMBER_DAYS:
            summary.totalMemberDays += reward.rewardAmount;
            break;
        }
      }

      return summary;
    } catch (error) {
      logger.error('统计用户奖励异常:', error);
      return {
        totalUsageCount: 0,
        totalTokenBonus: 0,
        totalMemberDays: 0
      };
    }
  }

  /**
   * 检查并处理过期奖励
   */
  static async processExpiredRewards(): Promise<{ expired: number; processed: number }> {
    try {
      const supabase = await getSupabaseClient();

      // 查询已过期但状态仍为granted的奖励
      const { data: expiredRewards, error } = await supabase
        .from('invite_rewards')
        .select('*')
        .eq('status', RewardStatus.GRANTED)
        .not('expires_at', 'is', null)
        .lt('expires_at', new Date().toISOString());

      if (error) {
        logger.error('查询过期奖励失败:', error);
        throw error;
      }

      let processedCount = 0;

      for (const reward of expiredRewards || []) {
        try {
          // 更新状态为已过期
          await supabase
            .from('invite_rewards')
            .update({ status: RewardStatus.EXPIRED })
            .eq('id', reward.id);

          processedCount++;
        } catch (error) {
          logger.error(`处理过期奖励 ${reward.id} 失败:`, error);
        }
      }

      logger.info('✅ 过期奖励处理完成', {
        expired: expiredRewards?.length || 0,
        processed: processedCount
      });

      return {
        expired: expiredRewards?.length || 0,
        processed: processedCount
      };
    } catch (error) {
      logger.error('处理过期奖励异常:', error);
      return { expired: 0, processed: 0 };
    }
  }

  /**
   * 撤销奖励
   */
  static async revokeReward(rewardId: string, reason?: string): Promise<boolean> {
    try {
      const supabase = await getSupabaseClient();

      const { error } = await supabase
        .from('invite_rewards')
        .update({
          status: RewardStatus.REVOKED,
          metadata: {
            revoked_at: new Date().toISOString(),
            revoke_reason: reason
          }
        })
        .eq('id', rewardId);

      if (error) {
        logger.error('撤销奖励失败:', error);
        return false;
      }

      logger.info('✅ 奖励撤销成功', { rewardId, reason });
      return true;
    } catch (error) {
      logger.error('撤销奖励异常:', error);
      return false;
    }
  }
}

/**
 * 导出便捷函数
 */
export const grantInviteReward = InviteRewardService.grantInviteReward.bind(InviteRewardService);
export const getUserRewards = InviteRewardService.getUserRewards.bind(InviteRewardService);
export const getUserRewardSummary = InviteRewardService.getUserRewardSummary.bind(InviteRewardService);


