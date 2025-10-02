/**
 * 订阅过期处理服务
 * @description 自动检查并处理过期订阅
 * @created 2025-10-02
 */

import { createClient } from '@supabase/supabase-js';
import type { SubscriptionTier } from '@/types/subscription';
import { permissionCache } from './permissionCacheService';

/**
 * 过期检查结果接口
 */
interface ExpiryCheckResult {
  totalChecked: number;
  expiredCount: number;
  expiringSoonCount: number;
  processedIds: string[];
  errors: Array<{ userId: string; error: string }>;
}

/**
 * 订阅过期服务类
 */
export class SubscriptionExpiryService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  /**
   * 检查并处理过期订阅
   * @param dryRun 是否只检查不处理 (用于测试)
   */
  async checkExpiredSubscriptions(dryRun: boolean = false): Promise<ExpiryCheckResult> {
    console.log('[SubscriptionExpiry] Starting expiry check...', { dryRun });

    const result: ExpiryCheckResult = {
      totalChecked: 0,
      expiredCount: 0,
      expiringSoonCount: 0,
      processedIds: [],
      errors: []
    };

    try {
      // 1. 查询所有活跃订阅
      const { data: subscriptions, error } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('[SubscriptionExpiry] Query error:', error);
        throw error;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('[SubscriptionExpiry] No active subscriptions found');
        return result;
      }

      result.totalChecked = subscriptions.length;
      console.log(`[SubscriptionExpiry] Found ${result.totalChecked} active subscriptions`);

      const now = new Date();

      // 2. 处理每个订阅
      for (const subscription of subscriptions) {
        const expiresAt = new Date(subscription.expires_at);
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // 已过期
        if (expiresAt < now) {
          result.expiredCount++;
          console.log(`[SubscriptionExpiry] Expired: ${subscription.user_id}`, {
            tier: subscription.tier,
            expiredDays: -daysRemaining
          });

          if (!dryRun) {
            try {
              await this.handleExpiredSubscription(subscription);
              result.processedIds.push(subscription.user_id);
            } catch (error) {
              console.error(`[SubscriptionExpiry] Failed to handle expired: ${subscription.user_id}`, error);
              result.errors.push({
                userId: subscription.user_id,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
        }
        // 即将过期 (7天内)
        else if (daysRemaining <= 7) {
          result.expiringSoonCount++;
          console.log(`[SubscriptionExpiry] Expiring soon: ${subscription.user_id}`, {
            tier: subscription.tier,
            daysRemaining
          });

          if (!dryRun) {
            try {
              await this.notifyExpiringSubscription(subscription, daysRemaining);
            } catch (error) {
              console.warn(`[SubscriptionExpiry] Failed to notify: ${subscription.user_id}`, error);
            }
          }
        }
      }

      console.log('[SubscriptionExpiry] Check complete', result);
      return result;

    } catch (error) {
      console.error('[SubscriptionExpiry] Fatal error:', error);
      throw error;
    }
  }

  /**
   * 处理过期订阅
   */
  private async handleExpiredSubscription(subscription: any): Promise<void> {
    const userId = subscription.user_id;

    console.log(`[SubscriptionExpiry] Processing expired subscription: ${userId}`);

    // 1. 更新订阅状态为过期
    const { error: updateError } = await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw updateError;
    }

    // 2. 如果不是自动续费,降级到试用版
    if (!subscription.auto_renew) {
      const { error: downgradeError } = await this.supabase
        .from('user_subscriptions')
        .update({
          tier: 'trial' as SubscriptionTier,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (downgradeError) {
        throw downgradeError;
      }

      console.log(`[SubscriptionExpiry] Downgraded to trial: ${userId}`);
    }

    // 3. 清除权限缓存
    permissionCache.clearUserCache(userId);

    // 4. 发送过期通知 (TODO: 集成邮件/站内信服务)
    console.log(`[SubscriptionExpiry] Sending expiry notification: ${userId}`);

    // 5. 记录到历史
    await this.supabase
      .from('subscription_history')
      .insert({
        subscription_id: subscription.id,
        user_id: userId,
        action: 'expired',
        from_tier: subscription.tier,
        to_tier: subscription.auto_renew ? subscription.tier : 'trial',
        from_status: 'active',
        to_status: subscription.auto_renew ? 'expired' : 'active',
        reason: 'Subscription expired',
        created_by: 'system'
      });
  }

  /**
   * 通知即将过期的订阅
   */
  private async notifyExpiringSubscription(subscription: any, daysRemaining: number): Promise<void> {
    console.log(`[SubscriptionExpiry] Notifying expiring subscription: ${subscription.user_id}`, {
      daysRemaining
    });

    // TODO: 集成通知服务
    // - 邮件通知
    // - 站内消息
    // - 推送通知

    // 暂时只记录日志
    console.log(`[SubscriptionExpiry] Notification sent to: ${subscription.user_id}`);
  }

  /**
   * 处理自动续费
   */
  async processAutoRenewals(): Promise<{
    totalProcessed: number;
    successCount: number;
    failedCount: number;
    errors: Array<{ userId: string; error: string }>;
  }> {
    console.log('[SubscriptionExpiry] Processing auto-renewals...');

    const result = {
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0,
      errors: [] as Array<{ userId: string; error: string }>
    };

    try {
      // 查询需要续费的订阅 (未来3天内到期 + 开启自动续费)
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);

      const { data: subscriptions, error } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active')
        .eq('auto_renew', true)
        .lte('next_billing_date', threeDaysLater.toISOString());

      if (error) {
        throw error;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('[SubscriptionExpiry] No subscriptions to renew');
        return result;
      }

      result.totalProcessed = subscriptions.length;

      for (const subscription of subscriptions) {
        try {
          await this.renewSubscription(subscription);
          result.successCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push({
            userId: subscription.user_id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log('[SubscriptionExpiry] Auto-renewal complete', result);
      return result;

    } catch (error) {
      console.error('[SubscriptionExpiry] Auto-renewal error:', error);
      throw error;
    }
  }

  /**
   * 续费订阅
   */
  private async renewSubscription(subscription: any): Promise<void> {
    console.log(`[SubscriptionExpiry] Renewing subscription: ${subscription.user_id}`);

    // TODO: 调用支付服务进行扣款
    // - 从用户绑定的支付方式扣款
    // - 创建新的支付记录
    // - 更新订阅时间

    // 暂时模拟续费成功
    const now = new Date();
    const newExpiresAt = new Date(subscription.expires_at);

    if (subscription.period === 'monthly') {
      newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
    } else {
      newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1);
    }

    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({
        expires_at: newExpiresAt.toISOString(),
        next_billing_date: newExpiresAt.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', subscription.id);

    if (error) {
      throw error;
    }

    // 记录续费历史
    await this.supabase
      .from('subscription_history')
      .insert({
        subscription_id: subscription.id,
        user_id: subscription.user_id,
        action: 'renewed',
        from_tier: subscription.tier,
        to_tier: subscription.tier,
        from_status: subscription.status,
        to_status: 'active',
        reason: 'Auto-renewal',
        created_by: 'system'
      });

    console.log(`[SubscriptionExpiry] Renewal successful: ${subscription.user_id}`);
  }

  /**
   * 获取过期统计
   */
  async getExpiryStats(): Promise<{
    expiredCount: number;
    expiringIn7Days: number;
    expiringIn30Days: number;
    autoRenewCount: number;
  }> {
    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);

    const [expired, expiring7, expiring30, autoRenew] = await Promise.all([
      // 已过期
      this.supabase
        .from('user_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'expired'),

      // 7天内过期
      this.supabase
        .from('user_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .lte('expires_at', in7Days.toISOString())
        .gte('expires_at', now.toISOString()),

      // 30天内过期
      this.supabase
        .from('user_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .lte('expires_at', in30Days.toISOString())
        .gte('expires_at', now.toISOString()),

      // 自动续费订阅
      this.supabase
        .from('user_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('auto_renew', true)
    ]);

    return {
      expiredCount: expired.count || 0,
      expiringIn7Days: expiring7.count || 0,
      expiringIn30Days: expiring30.count || 0,
      autoRenewCount: autoRenew.count || 0
    };
  }
}

// 导出单例
export const subscriptionExpiryService = new SubscriptionExpiryService();

export default subscriptionExpiryService;
