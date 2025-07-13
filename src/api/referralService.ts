/**
 * 推荐奖励API服务
 * @description 处理推荐人和被推荐人的奖励逻辑
 */

/**
 * 推荐奖励请求接口
 */
interface ReferralRewardRequest {
  /** 推荐人ID */
  referrerId: string;
  /** 被推荐人ID */
  referredUserId: string;
  /** 奖励数量 */
  rewardAmount: number;
  /** 奖励类型 */
  rewardType: 'usage_count' | 'premium_days' | 'feature_access';
  /** 时间戳 */
  timestamp: string;
}

/**
 * 推荐奖励响应接口
 */
interface ReferralRewardResponse {
  /** 是否成功 */
  success: boolean;
  /** 消息 */
  message: string;
  /** 推荐人奖励结果 */
  referrerReward?: {
    referrerId: string;
    rewardAmount: number;
    newUsageCount: number;
  };
  /** 被推荐人奖励结果 */
  referredUserReward?: {
    referredUserId: string;
    rewardAmount: number;
    newUsageCount: number;
  };
}

/**
 * 推荐统计接口
 */
interface ReferralStats {
  /** 推荐人ID */
  referrerId: string;
  /** 总推荐人数 */
  totalReferrals: number;
  /** 总奖励次数 */
  totalRewards: number;
  /** 本月推荐人数 */
  monthlyReferrals: number;
  /** 本月奖励次数 */
  monthlyRewards: number;
}

/**
 * 发送推荐奖励请求
 * @param request 推荐奖励请求
 * @returns 推荐奖励响应
 */
export async function sendReferralReward(request: ReferralRewardRequest): Promise<ReferralRewardResponse> {
  try {
    const response = await fetch('/api/referral/reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`推荐奖励请求失败: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('推荐奖励请求错误:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '推荐奖励请求失败'
    };
  }
}

/**
 * 获取推荐统计
 * @param referrerId 推荐人ID
 * @returns 推荐统计
 */
export async function getReferralStats(referrerId: string): Promise<ReferralStats | null> {
  try {
    const response = await fetch(`/api/referral/stats?referrerId=${encodeURIComponent(referrerId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`获取推荐统计失败: ${response.status}`);
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('获取推荐统计错误:', error);
    return null;
  }
}

/**
 * 验证推荐人ID是否有效
 * @param referrerId 推荐人ID
 * @returns 是否有效
 */
export async function validateReferrerId(referrerId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/referral/validate?referrerId=${encodeURIComponent(referrerId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.success && result.isValid;
  } catch (error) {
    console.error('验证推荐人ID错误:', error);
    return false;
  }
}

/**
 * 获取推荐链接
 * @param referrerId 推荐人ID
 * @returns 推荐链接
 */
export function generateReferralLink(referrerId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/register?ref=${encodeURIComponent(referrerId)}`;
}

/**
 * 复制推荐链接到剪贴板
 * @param referrerId 推荐人ID
 * @returns 是否成功
 */
export async function copyReferralLink(referrerId: string): Promise<boolean> {
  try {
    const link = generateReferralLink(referrerId);
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('复制推荐链接失败:', error);
    return false;
  }
} 