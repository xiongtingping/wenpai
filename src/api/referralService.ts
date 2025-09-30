/**
 * 推荐奖励API服务
 * @description 处理推荐人和被推荐人的奖励逻辑
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import request from './request';

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

// ❌ REMOVED: 已删除模拟推荐奖励功能 - 违反api_prohibit_local_mock_error规则

/**
 * 发送推荐奖励请求
 * @param request 推荐奖励请求
 * @returns 推荐奖励响应
 */
export async function sendReferralReward(requestBody: ReferralRewardRequest): Promise<ReferralRewardResponse> {
  try {
    const result = await request.post('/api/referral/reward', requestBody);
    return result as ReferralRewardResponse;
  } catch (error) {
    console.error('推荐奖励API调用错误:', error);
    throw new Error(`推荐奖励API调用失败: ${error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'}`);
  }
}

// ❌ REMOVED: 删除模拟推荐统计函数 - 违反api_prohibit_local_mock_error规则

/**
 * 获取推荐统计
 * @param referrerId 推荐人ID
 * @returns 推荐统计
 */
export async function getReferralStats(referrerId: string): Promise<ReferralStats | null> {
  try {
    const result = await request.get(`/api/referral/stats?referrerId=${encodeURIComponent(referrerId)}`);
    return (result as any)?.success ? (result as any).data : null;
  } catch (error) {
    console.error('推荐统计API调用失败:', error);
    throw new Error(`推荐统计API调用失败: ${error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'}`);
  }
}

// ❌ REMOVED: 删除模拟验证推荐人ID函数 - 违反api_prohibit_local_mock_error规则

/**
 * 验证推荐人ID是否有效
 * @param referrerId 推荐人ID
 * @returns 是否有效
 */
export async function validateReferrerId(referrerId: string): Promise<boolean> {
  try {
    const result = await request.get(`/api/referral/validate?referrerId=${encodeURIComponent(referrerId)}`);
    return !!((result as any)?.success && (result as any)?.isValid);
  } catch (error) {
    console.error('推荐人验证API调用失败:', error);
    throw new Error(`推荐人验证API调用失败: ${error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'}`);
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
