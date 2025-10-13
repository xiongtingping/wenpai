/**
 * 邀请统计更新服务
 * @description 管理和更新用户的邀请统计数据
 */

import { getSupabaseClient } from '@/services/supabaseDataService';
import { logger } from '@/utils/logger';
import { UserIdValidator } from '@/utils/userIdValidator';
import { INVITE_STATS_CONFIG } from '@/config/inviteRewardConfig';

/**
 * 邀请统计接口
 */
export interface InviteStats {
  /** 用户ID */
  userId: string;
  /** 总邀请数 */
  totalInvites: number;
  /** 成功邀请数 */
  successfulInvites: number;
  /** 待处理邀请数 */
  pendingInvites: number;
  /** 总使用次数奖励 */
  totalUsageCountRewards: number;
  /** 总Token奖励 */
  totalTokenRewards: number;
  /** 总会员天数奖励 */
  totalMemberDaysRewards: number;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 排行榜条目接口
 */
export interface LeaderboardEntry {
  /** 用户ID */
  userId: string;
  /** 成功邀请数 */
  successfulInvites: number;
  /** 排名 */
  rank: number;
}

/**
 * 缓存条目接口
 */
interface CacheEntry {
  data: InviteStats;
  timestamp: number;
}

/**
 * 邀请统计更新服务类
 */
export class InviteStatsService {
  /** 统计数据缓存 */
  private static statsCache = new Map<string, CacheEntry>();
  /**
   * 更新用户邀请统计
   */
  static async updateInviteStats(userId: string): Promise<boolean> {
    try {
      // 验证用户ID
      UserIdValidator.validate(userId, 'InviteStatsService.updateInviteStats');

      const supabase = await getSupabaseClient();

      // 1. 统计作为邀请人的数据
      const { data: inviterData, error: inviterError } = await supabase
        .from('user_invite_relations')
        .select('status')
        .eq('inviter_id', userId);

      if (inviterError) {
        logger.error('查询邀请人数据失败:', inviterError);
        throw inviterError;
      }

      // 2. 统计作为被邀请人的数据
      const { data: inviteeData, error: inviteeError } = await supabase
        .from('user_invite_relations')
        .select('status')
        .eq('invitee_id', userId);

      if (inviteeError) {
        logger.error('查询被邀请人数据失败:', inviteeError);
        throw inviteeError;
      }

      // 3. 计算统计数据
      const totalInvites = inviterData?.length || 0;
      const successfulInvites = inviterData?.filter(r => r.status === 'completed').length || 0;
      const pendingInvites = inviterData?.filter(r => r.status === 'pending').length || 0;

      // 4. 查询总奖励数（分类统计）
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('invite_rewards')
        .select('reward_type, reward_amount')
        .eq('user_id', userId)
        .eq('status', 'granted');

      // 分类统计奖励
      const totalUsageCountRewards = rewardsData
        ?.filter(r => r.reward_type === 'usage_count')
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0;

      const totalTokenRewards = rewardsData
        ?.filter(r => r.reward_type === 'token_bonus')
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0;

      const totalMemberDaysRewards = rewardsData
        ?.filter(r => r.reward_type === 'member_days')
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0;

      // 5. 更新或插入统计记录
      const { error: upsertError } = await supabase
        .from('user_invite_stats')
        .upsert({
          user_id: userId,
          total_invites: totalInvites,
          successful_invites: successfulInvites,
          pending_invites: pendingInvites,
          total_usage_count_rewards: totalUsageCountRewards,
          total_token_rewards: totalTokenRewards,
          total_member_days_rewards: totalMemberDaysRewards,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        logger.error('更新邀请统计失败:', upsertError);
        throw upsertError;
      }

      logger.info('✅ 邀请统计更新成功', {
        userId: UserIdValidator.formatForLog(userId),
        totalInvites,
        successfulInvites
      });

      return true;
    } catch (error) {
      logger.error('更新邀请统计异常:', error);
      return false;
    }
  }

  /**
   * 获取用户邀请统计
   * @param userId 用户ID
   * @param depth 递归深度（内部使用，防止无限递归）
   */
  static async getInviteStats(userId: string, depth: number = 0): Promise<InviteStats | null> {
    try {
      UserIdValidator.validate(userId, 'InviteStatsService.getInviteStats');

      // 检查缓存
      if (INVITE_STATS_CONFIG.enableCache) {
        const cached = this.statsCache.get(userId);
        if (cached && Date.now() - cached.timestamp < INVITE_STATS_CONFIG.cacheExpirySeconds * 1000) {
          logger.debug('使用缓存的邀请统计', {
            userId: UserIdValidator.formatForLog(userId)
          });
          return cached.data;
        }
      }

      const supabase = await getSupabaseClient();

      const { data, error } = await supabase
        .from('user_invite_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        logger.error('查询邀请统计失败:', error);
        throw error;
      }

      if (!data) {
        // 防止无限递归：只在第一次调用时尝试创建统计
        if (depth > 0) {
          logger.warn('邀请统计不存在且已尝试创建，返回默认值', {
            userId: UserIdValidator.formatForLog(userId)
          });
          return {
            userId,
            totalInvites: 0,
            successfulInvites: 0,
            pendingInvites: 0,
            totalUsageCountRewards: 0,
            totalTokenRewards: 0,
            totalMemberDaysRewards: 0,
            updatedAt: new Date()
          };
        }

        // 如果没有统计记录，尝试创建
        logger.info('邀请统计不存在，尝试创建', {
          userId: UserIdValidator.formatForLog(userId)
        });
        await this.updateInviteStats(userId);
        return this.getInviteStats(userId, depth + 1);
      }

      const stats: InviteStats = {
        userId: data.user_id,
        totalInvites: data.total_invites || 0,
        successfulInvites: data.successful_invites || 0,
        pendingInvites: data.pending_invites || 0,
        totalUsageCountRewards: data.total_usage_count_rewards || 0,
        totalTokenRewards: data.total_token_rewards || 0,
        totalMemberDaysRewards: data.total_member_days_rewards || 0,
        updatedAt: new Date(data.updated_at)
      };

      // 更新缓存
      if (INVITE_STATS_CONFIG.enableCache) {
        this.statsCache.set(userId, {
          data: stats,
          timestamp: Date.now()
        });
      }

      return stats;
    } catch (error) {
      logger.error('获取邀请统计异常:', error);
      return null;
    }
  }

  /**
   * 获取邀请排行榜
   */
  static async getInviteLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
    try {
      if (!INVITE_STATS_CONFIG.enableLeaderboard) {
        return [];
      }

      const supabase = await getSupabaseClient();
      const leaderboardLimit = limit || INVITE_STATS_CONFIG.leaderboardLimit;

      const { data, error } = await supabase
        .from('user_invite_stats')
        .select('user_id, successful_invites')
        .order('successful_invites', { ascending: false })
        .limit(leaderboardLimit);

      if (error) {
        logger.error('查询邀请排行榜失败:', error);
        throw error;
      }

      return (data || []).map((entry, index) => ({
        userId: entry.user_id,
        successfulInvites: entry.successful_invites || 0,
        rank: index + 1
      }));
    } catch (error) {
      logger.error('获取邀请排行榜异常:', error);
      return [];
    }
  }

  /**
   * 获取用户在排行榜中的排名
   * 使用高效的数据库查询而不是获取整个排行榜
   */
  static async getUserRank(userId: string): Promise<number | null> {
    try {
      UserIdValidator.validate(userId, 'InviteStatsService.getUserRank');

      const supabase = await getSupabaseClient();

      // 获取用户的成功邀请数
      const { data: userStats, error: userError } = await supabase
        .from('user_invite_stats')
        .select('successful_invites')
        .eq('user_id', userId)
        .maybeSingle();

      if (userError || !userStats) {
        logger.error('查询用户统计失败:', userError);
        return null;
      }

      const userInvites = userStats.successful_invites || 0;

      // 计算排名：统计成功邀请数大于当前用户的用户数量 + 1
      const { count, error: countError } = await supabase
        .from('user_invite_stats')
        .select('*', { count: 'exact', head: true })
        .gt('successful_invites', userInvites);

      if (countError) {
        logger.error('计算排名失败:', countError);
        return null;
      }

      return (count || 0) + 1;
    } catch (error) {
      logger.error('获取用户排名异常:', error);
      return null;
    }
  }

  /**
   * 批量更新所有用户的邀请统计
   */
  static async batchUpdateAllStats(): Promise<{ success: number; failed: number }> {
    try {
      const supabase = await getSupabaseClient();

      // 获取所有有邀请关系的用户ID
      const { data: inviterIds } = await supabase
        .from('user_invite_relations')
        .select('inviter_id')
        .order('inviter_id');

      const { data: inviteeIds } = await supabase
        .from('user_invite_relations')
        .select('invitee_id')
        .order('invitee_id');

      // 合并并去重
      const allUserIds = new Set([
        ...(inviterIds?.map(r => r.inviter_id) || []),
        ...(inviteeIds?.map(r => r.invitee_id) || [])
      ]);

      let successCount = 0;
      let failedCount = 0;

      for (const userId of allUserIds) {
        try {
          await this.updateInviteStats(userId);
          successCount++;
        } catch (error) {
          logger.error(`更新用户 ${userId} 统计失败:`, error);
          failedCount++;
        }
      }

      logger.info('✅ 批量更新邀请统计完成', { successCount, failedCount });

      return { success: successCount, failed: failedCount };
    } catch (error) {
      logger.error('批量更新邀请统计异常:', error);
      return { success: 0, failed: 0 };
    }
  }

  /**
   * 清除统计缓存（如果启用了缓存）
   */
  static async clearStatsCache(userId: string): Promise<void> {
    if (!INVITE_STATS_CONFIG.enableCache) {
      return;
    }

    try {
      this.statsCache.delete(userId);
      logger.info('清除邀请统计缓存', {
        userId: UserIdValidator.formatForLog(userId)
      });
    } catch (error) {
      logger.error('清除统计缓存失败:', error);
    }
  }

  /**
   * 清除所有缓存
   */
  static clearAllCache(): void {
    this.statsCache.clear();
    logger.info('清除所有邀请统计缓存');
  }
}

/**
 * 导出便捷函数
 */
export const updateInviteStats = InviteStatsService.updateInviteStats.bind(InviteStatsService);
export const getInviteStats = InviteStatsService.getInviteStats.bind(InviteStatsService);
export const getInviteLeaderboard = InviteStatsService.getInviteLeaderboard.bind(InviteStatsService);
export const getUserRank = InviteStatsService.getUserRank.bind(InviteStatsService);

