/**
 * 订阅状态同步服务
 * 从 user_subscriptions 表查询真实的订阅等级并同步到用户状态
 */

import { getSupabaseClient, TABLE_NAMES } from './supabaseDataService';
import type { SubscriptionTier } from '@/types/subscription';

export interface UserSubscription {
  tier: SubscriptionTier;
  status: string;
  expiresAt: string;
  hasActiveSubscription: boolean;
}

/**
 * 获取用户的真实订阅等级
 * @param userId 用户ID
 * @returns 订阅信息
 */
export async function getUserSubscriptionTier(userId: string): Promise<UserSubscription> {
  try {
    console.log('🔍 查询用户订阅状态:', { userId });

    const client = await getSupabaseClient();

    // 查询用户的有效订阅（status='active' 且未过期）
    const { data, error } = await client
      .from('user_subscriptions')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ 查询订阅失败:', error);
      // 查询失败时返回免费版
      return {
        tier: 'free',
        status: 'none',
        expiresAt: '',
        hasActiveSubscription: false
      };
    }

    // 如果有有效订阅，返回订阅等级
    if (data && data.length > 0) {
      const subscription = data[0];
      console.log('✅ 找到有效订阅:', subscription);

      return {
        tier: subscription.tier as SubscriptionTier,
        status: subscription.status,
        expiresAt: subscription.expires_at,
        hasActiveSubscription: true
      };
    }

    // 没有有效订阅，返回免费版
    console.log('ℹ️ 未找到有效订阅，使用免费版');
    return {
      tier: 'free',
      status: 'none',
      expiresAt: '',
      hasActiveSubscription: false
    };

  } catch (error) {
    console.error('❌ 获取订阅状态异常:', error);
    // 异常时返回免费版
    return {
      tier: 'free',
      status: 'error',
      expiresAt: '',
      hasActiveSubscription: false
    };
  }
}

/**
 * 同步用户订阅状态到Store
 * @param userId 用户ID
 * @param updateUserFn 更新用户信息的函数
 */
export async function syncUserSubscription(
  userId: string,
  updateUserFn: (updates: { subscription: SubscriptionTier }) => void
): Promise<UserSubscription> {
  console.log('🔄 开始同步用户订阅状态:', { userId });

  const subscription = await getUserSubscriptionTier(userId);

  // 更新用户的subscription字段
  updateUserFn({ subscription: subscription.tier });

  console.log('✅ 订阅状态已同步:', {
    userId,
    tier: subscription.tier,
    hasActiveSubscription: subscription.hasActiveSubscription
  });

  return subscription;
}

