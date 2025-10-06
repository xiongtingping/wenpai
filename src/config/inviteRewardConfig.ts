/**
 * 邀请奖励配置
 * @description 定义邀请系统的奖励规则和配置
 */

/**
 * 奖励类型枚举
 */
export enum RewardType {
  /** 使用次数 */
  USAGE_COUNT = 'usage_count',
  /** Token奖励 */
  TOKEN_BONUS = 'token_bonus',
  /** 会员天数 */
  MEMBER_DAYS = 'member_days'
}

/**
 * 奖励来源类型枚举
 */
export enum RewardSourceType {
  /** 邀请人 */
  INVITER = 'inviter',
  /** 被邀请人 */
  INVITEE = 'invitee',
  /** 系统赠送 */
  SYSTEM = 'system'
}

/**
 * 奖励状态枚举
 */
export enum RewardStatus {
  /** 已发放 */
  GRANTED = 'granted',
  /** 已过期 */
  EXPIRED = 'expired',
  /** 已撤销 */
  REVOKED = 'revoked'
}

/**
 * 单个奖励配置接口
 */
export interface RewardConfig {
  /** 奖励类型 */
  type: RewardType;
  /** 奖励数量 */
  amount: number;
  /** 过期天数（0表示永不过期） */
  expiryDays: number;
  /** 奖励描述 */
  description: string;
}

/**
 * 邀请奖励配置接口
 */
export interface InviteRewardConfig {
  /** 邀请人奖励 */
  inviter: RewardConfig[];
  /** 被邀请人奖励 */
  invitee: RewardConfig[];
}

/**
 * 邀请奖励配置
 *
 * 邀请人奖励：
 * - 20次使用次数（永不过期）
 *
 * 被邀请人奖励：
 * - 20次使用次数（永不过期）
 */
export const INVITE_REWARDS: InviteRewardConfig = {
  inviter: [
    {
      type: RewardType.USAGE_COUNT,
      amount: 20,
      expiryDays: 0,  // 永不过期
      description: '邀请好友成功，获得20次AI使用次数'
    }
  ],
  invitee: [
    {
      type: RewardType.USAGE_COUNT,
      amount: 20,
      expiryDays: 0,  // 永不过期
      description: '注册成功，获得20次AI使用次数'
    }
  ]
};

/**
 * 使用次数配置
 */
export const USAGE_COUNT_CONFIG = {
  /** 套餐基础次数 */
  baseCounts: {
    trial: 10,      // 试用版：10次/月
    pro: 100,       // 专业版：100次/月
    premium: 500    // 高级版：500次/月
  },
  
  /** 重置周期 */
  resetPeriod: 'monthly' as const,  // monthly, daily, never
  
  /** 单次AI调用消耗次数 */
  costPerCall: 1,
  
  /** 是否启用使用次数限制 */
  enableLimit: true,
  
  /** 使用次数不足时的提示消息 */
  insufficientMessage: '使用次数不足，请升级套餐或邀请好友获取更多次数'
};

/**
 * 邀请链接配置
 */
export const INVITE_LINK_CONFIG = {
  /** 邀请码长度 */
  codeLength: 8,
  
  /** 邀请码字符集 */
  codeCharset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',  // 排除易混淆字符
  
  /** 邀请链接有效期（天）0表示永久有效 */
  linkExpiryDays: 0,
  
  /** 邀请注册链接（绝对地址，自动附加 code 参数） */
  linkPrefix: 'https://www.wenpai.xyz/custom-login?tab=register',
  
  /** 单个邀请码最大使用次数（0表示无限制） */
  maxUsesPerCode: 0
};

/**
 * 邀请统计配置
 */
export const INVITE_STATS_CONFIG = {
  /** 是否启用邀请排行榜 */
  enableLeaderboard: true,
  
  /** 排行榜显示数量 */
  leaderboardLimit: 10,
  
  /** 是否启用邀请统计缓存 */
  enableCache: true,
  
  /** 缓存过期时间（秒） */
  cacheExpirySeconds: 300  // 5分钟
};

/**
 * 奖励通知配置
 */
export const REWARD_NOTIFICATION_CONFIG = {
  /** 是否启用奖励通知 */
  enabled: true,
  
  /** 通知类型 */
  notificationTypes: {
    /** 邀请成功通知 */
    inviteSuccess: true,
    /** 获得奖励通知 */
    rewardGranted: true,
    /** 奖励即将过期通知 */
    rewardExpiring: true
  },
  
  /** 奖励即将过期提醒天数 */
  expiryReminderDays: 3
};

/**
 * 获取邀请人奖励配置
 */
export function getInviterRewards(): RewardConfig[] {
  return INVITE_REWARDS.inviter;
}

/**
 * 获取被邀请人奖励配置
 */
export function getInviteeRewards(): RewardConfig[] {
  return INVITE_REWARDS.invitee;
}

/**
 * 获取套餐基础使用次数
 */
export function getBaseUsageCount(tier: string): number {
  return USAGE_COUNT_CONFIG.baseCounts[tier as keyof typeof USAGE_COUNT_CONFIG.baseCounts] || 10;
}

/**
 * 计算奖励过期时间
 */
export function calculateExpiryDate(expiryDays: number): Date | null {
  if (expiryDays === 0) {
    return null;  // 永不过期
  }
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  return expiryDate;
}

/**
 * 生成奖励ID
 */
export function generateRewardId(userId: string, rewardType: RewardType): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 8);
  return `reward_${rewardType}_${userId.substr(-6)}_${timestamp}_${random}`;
}

/**
 * 验证奖励配置
 */
export function validateRewardConfig(config: RewardConfig): boolean {
  return (
    config.amount > 0 &&
    config.expiryDays >= 0 &&
    Object.values(RewardType).includes(config.type)
  );
}

/**
 * 格式化奖励描述
 */
export function formatRewardDescription(reward: RewardConfig): string {
  const typeNames = {
    [RewardType.USAGE_COUNT]: '次使用次数',
    [RewardType.TOKEN_BONUS]: ' Token',
    [RewardType.MEMBER_DAYS]: '天会员'
  };
  
  return `${reward.amount}${typeNames[reward.type]}`;
}

/**
 * 导出所有配置
 */
export default {
  INVITE_REWARDS,
  USAGE_COUNT_CONFIG,
  INVITE_LINK_CONFIG,
  INVITE_STATS_CONFIG,
  REWARD_NOTIFICATION_CONFIG,
  RewardType,
  RewardSourceType,
  RewardStatus,
  getInviterRewards,
  getInviteeRewards,
  getBaseUsageCount,
  calculateExpiryDate,
  generateRewardId,
  validateRewardConfig,
  formatRewardDescription
};

