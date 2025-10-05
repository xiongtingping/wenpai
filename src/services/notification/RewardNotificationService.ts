/**
 * 奖励通知服务
 * @description 发送邀请奖励相关的通知
 */

import { logger } from '@/utils/logger';
import { UserIdValidator } from '@/utils/userIdValidator';
import { REWARD_NOTIFICATION_CONFIG, RewardType, formatRewardDescription } from '@/config/inviteRewardConfig';
import type { RewardRecord } from '@/services/invite/InviteRewardService';

/**
 * 通知类型枚举
 */
export enum NotificationType {
  /** 邀请成功通知 */
  INVITE_SUCCESS = 'invite_success',
  /** 获得奖励通知 */
  REWARD_GRANTED = 'reward_granted',
  /** 奖励即将过期通知 */
  REWARD_EXPIRING = 'reward_expiring',
  /** 被邀请成功通知 */
  INVITED_SUCCESS = 'invited_success'
}

/**
 * 通知消息接口
 */
export interface NotificationMessage {
  /** 通知类型 */
  type: NotificationType;
  /** 标题 */
  title: string;
  /** 内容 */
  content: string;
  /** 图标 */
  icon?: string;
  /** 链接 */
  link?: string;
  /** 额外数据 */
  data?: Record<string, any>;
}

/**
 * 奖励通知服务类
 */
export class RewardNotificationService {
  /**
   * 发送邀请成功通知（给邀请人）
   */
  static async sendInviteSuccessNotification(
    inviterId: string,
    inviteeName: string,
    rewards: RewardRecord[]
  ): Promise<boolean> {
    try {
      if (!REWARD_NOTIFICATION_CONFIG.enabled ||
          !REWARD_NOTIFICATION_CONFIG.notificationTypes.inviteSuccess) {
        return false;
      }

      UserIdValidator.validate(inviterId, 'RewardNotificationService.sendInviteSuccessNotification');

      // 构建奖励描述
      const rewardDescriptions = rewards.map(reward => {
        const typeNames = {
          [RewardType.USAGE_COUNT]: '次使用次数',
          [RewardType.TOKEN_BONUS]: ' Token',
          [RewardType.MEMBER_DAYS]: '天会员'
        };
        return `${reward.rewardAmount}${typeNames[reward.rewardType]}`;
      }).join('、');

      const message: NotificationMessage = {
        type: NotificationType.INVITE_SUCCESS,
        title: '🎉 邀请成功！',
        content: `恭喜！${inviteeName} 已成功注册，您获得了 ${rewardDescriptions} 奖励！`,
        icon: '🎁',
        link: '/rewards',
        data: {
          inviterId,
          inviteeName,
          rewards
        }
      };

      await this.sendNotification(inviterId, message);

      logger.info('✅ 邀请成功通知已发送', {
        inviterId: UserIdValidator.formatForLog(inviterId),
        inviteeName
      });

      return true;
    } catch (error) {
      logger.error('发送邀请成功通知失败:', error);
      return false;
    }
  }

  /**
   * 发送获得奖励通知（给被邀请人）
   */
  static async sendRewardGrantedNotification(
    userId: string,
    rewards: RewardRecord[]
  ): Promise<boolean> {
    try {
      if (!REWARD_NOTIFICATION_CONFIG.enabled ||
          !REWARD_NOTIFICATION_CONFIG.notificationTypes.rewardGranted) {
        return false;
      }

      UserIdValidator.validate(userId, 'RewardNotificationService.sendRewardGrantedNotification');

      // 构建奖励描述
      const rewardDescriptions = rewards.map(reward => {
        const typeNames = {
          [RewardType.USAGE_COUNT]: '次使用次数',
          [RewardType.TOKEN_BONUS]: ' Token',
          [RewardType.MEMBER_DAYS]: '天会员'
        };
        return `${reward.rewardAmount}${typeNames[reward.rewardType]}`;
      }).join('、');

      const message: NotificationMessage = {
        type: NotificationType.REWARD_GRANTED,
        title: '🎁 欢迎加入！',
        content: `注册成功！您获得了 ${rewardDescriptions} 新人奖励，快去体验吧！`,
        icon: '🎉',
        link: '/dashboard',
        data: {
          userId,
          rewards
        }
      };

      await this.sendNotification(userId, message);

      logger.info('✅ 获得奖励通知已发送', {
        userId: UserIdValidator.formatForLog(userId)
      });

      return true;
    } catch (error) {
      logger.error('发送获得奖励通知失败:', error);
      return false;
    }
  }

  /**
   * 发送奖励即将过期通知
   */
  static async sendRewardExpiringNotification(
    userId: string,
    reward: RewardRecord
  ): Promise<boolean> {
    try {
      if (!REWARD_NOTIFICATION_CONFIG.enabled ||
          !REWARD_NOTIFICATION_CONFIG.notificationTypes.rewardExpiring) {
        return false;
      }

      UserIdValidator.validate(userId, 'RewardNotificationService.sendRewardExpiringNotification');

      if (!reward.expiresAt) {
        return false;  // 永不过期的奖励不需要通知
      }

      const daysLeft = Math.ceil(
        (reward.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      const typeNames = {
        [RewardType.USAGE_COUNT]: '次使用次数',
        [RewardType.TOKEN_BONUS]: ' Token',
        [RewardType.MEMBER_DAYS]: '天会员'
      };

      const message: NotificationMessage = {
        type: NotificationType.REWARD_EXPIRING,
        title: '⏰ 奖励即将过期',
        content: `您的 ${reward.rewardAmount}${typeNames[reward.rewardType]} 奖励将在 ${daysLeft} 天后过期，请尽快使用！`,
        icon: '⚠️',
        link: '/rewards',
        data: {
          userId,
          reward,
          daysLeft
        }
      };

      await this.sendNotification(userId, message);

      logger.info('✅ 奖励即将过期通知已发送', {
        userId: UserIdValidator.formatForLog(userId),
        daysLeft
      });

      return true;
    } catch (error) {
      logger.error('发送奖励即将过期通知失败:', error);
      return false;
    }
  }

  /**
   * 发送被邀请成功通知
   */
  static async sendInvitedSuccessNotification(
    inviteeId: string,
    inviterName: string,
    rewards: RewardRecord[]
  ): Promise<boolean> {
    try {
      if (!REWARD_NOTIFICATION_CONFIG.enabled) {
        return false;
      }

      UserIdValidator.validate(inviteeId, 'RewardNotificationService.sendInvitedSuccessNotification');

      // 构建奖励描述
      const rewardDescriptions = rewards.map(reward => {
        const typeNames = {
          [RewardType.USAGE_COUNT]: '次使用次数',
          [RewardType.TOKEN_BONUS]: ' Token',
          [RewardType.MEMBER_DAYS]: '天会员'
        };
        return `${reward.rewardAmount}${typeNames[reward.rewardType]}`;
      }).join('、');

      const message: NotificationMessage = {
        type: NotificationType.INVITED_SUCCESS,
        title: '🎉 欢迎加入！',
        content: `感谢 ${inviterName} 的邀请！您获得了 ${rewardDescriptions} 新人奖励！`,
        icon: '🎁',
        link: '/dashboard',
        data: {
          inviteeId,
          inviterName,
          rewards
        }
      };

      await this.sendNotification(inviteeId, message);

      logger.info('✅ 被邀请成功通知已发送', {
        inviteeId: UserIdValidator.formatForLog(inviteeId),
        inviterName
      });

      return true;
    } catch (error) {
      logger.error('发送被邀请成功通知失败:', error);
      return false;
    }
  }

  /**
   * 实际发送通知（集成现有的通知服务）
   */
  private static async sendNotification(
    userId: string,
    message: NotificationMessage
  ): Promise<void> {
    try {
      // TODO: 集成现有的通知服务
      // 可能的实现方式：
      // 1. 浏览器通知 (Web Notification API)
      // 2. 应用内通知 (存储到数据库，前端轮询或WebSocket推送)
      // 3. 邮件通知
      // 4. 短信通知

      // 临时实现：触发自定义事件
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('rewardNotification', {
          detail: {
            userId,
            message
          }
        });
        window.dispatchEvent(event);
      }

      logger.info('通知已发送', {
        userId: UserIdValidator.formatForLog(userId),
        type: message.type,
        title: message.title
      });
    } catch (error) {
      logger.error('发送通知失败:', error);
      throw error;
    }
  }

  /**
   * 批量检查并发送即将过期的奖励通知
   */
  static async checkAndNotifyExpiringRewards(): Promise<number> {
    try {
      // TODO: 实现批量检查逻辑
      // 1. 查询即将过期的奖励（expiryReminderDays天内）
      // 2. 对每个奖励发送通知
      
      logger.info('批量检查即将过期的奖励通知（待实现）');
      return 0;
    } catch (error) {
      logger.error('批量检查即将过期的奖励通知失败:', error);
      return 0;
    }
  }
}

/**
 * 导出便捷函数
 */
export const sendInviteSuccessNotification = RewardNotificationService.sendInviteSuccessNotification.bind(RewardNotificationService);
export const sendRewardGrantedNotification = RewardNotificationService.sendRewardGrantedNotification.bind(RewardNotificationService);
export const sendRewardExpiringNotification = RewardNotificationService.sendRewardExpiringNotification.bind(RewardNotificationService);
export const sendInvitedSuccessNotification = RewardNotificationService.sendInvitedSuccessNotification.bind(RewardNotificationService);

