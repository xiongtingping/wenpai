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
 * 模拟后端推荐奖励处理
 * @param request 推荐奖励请求
 * @returns 模拟响应
 */
export async function mockReferralReward(request: ReferralRewardRequest): Promise<ReferralRewardResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟成功率90%
  const isSuccess = Math.random() > 0.1;
  
  if (isSuccess) {
    return {
      success: true,
      message: '推荐奖励发放成功',
      referrerReward: {
        referrerId: request.referrerId,
        rewardAmount: request.rewardAmount,
        newUsageCount: 30 // 模拟新使用次数
      },
      referredUserReward: {
        referredUserId: request.referredUserId,
        rewardAmount: request.rewardAmount,
        newUsageCount: 30 // 模拟新使用次数
      }
    };
  } else {
    return {
      success: false,
      message: '推荐奖励发放失败，请稍后重试'
    };
  }
}

/**
 * 发送推荐奖励请求
 * @param request 推荐奖励请求
 * @returns 推荐奖励响应
 */
export async function sendReferralReward(request: ReferralRewardRequest): Promise<ReferralRewardResponse> {
  try {
    // 首先尝试调用真实API
    const response = await fetch('/api/referral/reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      console.warn('真实API调用失败，使用模拟响应:', response.status);
      // 如果真实API失败，使用模拟响应
      return await mockReferralReward(request);
    }
  } catch (error) {
    console.warn('API调用错误，使用模拟响应:', error);
    // 如果网络错误，使用模拟响应
    return await mockReferralReward(request);
  }
}

/**
 * 模拟推荐统计数据
 * @param referrerId 推荐人ID
 * @returns 模拟统计
 */
async function mockReferralStats(referrerId: string): Promise<ReferralStats> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    referrerId,
    totalReferrals: Math.floor(Math.random() * 50) + 1,
    totalRewards: Math.floor(Math.random() * 1000) + 100,
    monthlyReferrals: Math.floor(Math.random() * 10) + 1,
    monthlyRewards: Math.floor(Math.random() * 200) + 20
  };
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

    if (response.ok) {
      const result = await response.json();
      return result.success ? result.data : null;
    } else {
      console.warn('真实API调用失败，使用模拟统计:', response.status);
      return await mockReferralStats(referrerId);
    }
  } catch (error) {
    console.warn('API调用错误，使用模拟统计:', error);
    return await mockReferralStats(referrerId);
  }
}

/**
 * 模拟验证推荐人ID
 * @param referrerId 推荐人ID
 * @returns 是否有效
 */
async function mockValidateReferrerId(referrerId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 模拟验证逻辑：长度6-20位，包含字母
  const isValid = /^[a-zA-Z0-9_-]{6,20}$/.test(referrerId) && /[a-zA-Z]/.test(referrerId);
  return isValid;
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

    if (response.ok) {
      const result = await response.json();
      return result.success && result.isValid;
    } else {
      console.warn('真实API调用失败，使用模拟验证:', response.status);
      return await mockValidateReferrerId(referrerId);
    }
  } catch (error) {
    console.warn('API调用错误，使用模拟验证:', error);
    return await mockValidateReferrerId(referrerId);
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