/**
 * 云端实时同步服务
 * 
 * 功能：
 * 1. 禁用本地缓存，所有数据从Supabase实时查询
 * 2. 自动轮询同步用户订阅、使用统计等关键数据
 * 3. 确保前端显示的数据与云端数据库完全一致
 * 
 * 同步策略：
 * - 订阅信息：每30秒同步一次
 * - 使用统计：每60秒同步一次
 * - 支付状态：支付中每3秒同步一次
 */

import supabase from '@/config/supabase';
import { useUnifiedStore } from '@/stores/unified-state-store';
import { logger } from '@/utils/logger';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 同步配置
 */
const SYNC_INTERVALS = {
  SUBSCRIPTION: 30 * 1000,      // 订阅信息：30秒
  USAGE_STATS: 60 * 1000,       // 使用统计：60秒
  PAYMENT_STATUS: 3 * 1000,     // 支付状态：3秒（仅支付中）
};

/**
 * 云端同步管理器
 */
class CloudSyncService {
  private subscriptionTimer: NodeJS.Timeout | null = null;
  private usageStatsTimer: NodeJS.Timeout | null = null;
  private paymentStatusTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * 启动自动同步
   */
  start(userId: string) {
    if (this.isRunning) {
      logger.warn('云端同步已在运行中');
      return;
    }

    logger.info('🚀 启动云端实时同步服务', { userId });
    this.isRunning = true;

    // 立即执行一次同步
    this.syncSubscription(userId);
    this.syncUsageStats(userId);

    // 启动定时同步
    this.subscriptionTimer = setInterval(() => {
      this.syncSubscription(userId);
    }, SYNC_INTERVALS.SUBSCRIPTION);

    this.usageStatsTimer = setInterval(() => {
      this.syncUsageStats(userId);
    }, SYNC_INTERVALS.USAGE_STATS);

    logger.info('✅ 云端同步服务已启动', {
      订阅同步间隔: `${SYNC_INTERVALS.SUBSCRIPTION / 1000}秒`,
      使用统计同步间隔: `${SYNC_INTERVALS.USAGE_STATS / 1000}秒`
    });
  }

  /**
   * 停止自动同步
   */
  stop() {
    logger.info('🛑 停止云端同步服务');

    if (this.subscriptionTimer) {
      clearInterval(this.subscriptionTimer);
      this.subscriptionTimer = null;
    }

    if (this.usageStatsTimer) {
      clearInterval(this.usageStatsTimer);
      this.usageStatsTimer = null;
    }

    if (this.paymentStatusTimer) {
      clearInterval(this.paymentStatusTimer);
      this.paymentStatusTimer = null;
    }

    this.isRunning = false;
    logger.info('✅ 云端同步服务已停止');
  }

  /**
   * 同步用户订阅信息（从云端）
   */
  private async syncSubscription(userId: string) {
    try {
      logger.info('🔄 同步订阅信息...', { userId });

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('tier, status, expires_at, started_at')
        .eq('user_id', userId)
        .maybeSingle();

      // 🔧 详细日志：输出查询结果
      logger.info('📊 Supabase 订阅查询结果:', {
        userId,
        hasData: !!data,
        data,
        hasError: !!error,
        error
      });

      if (error) {
        logger.error('❌ 同步订阅失败:', error);
        return;
      }

      if (data) {
        const store = useUnifiedStore.getState();

        logger.info('📊 当前 store 中的订阅状态:', {
          currentSubscription: store.user.subscription,
          newSubscription: data.tier,
          needsUpdate: data.tier !== store.user.subscription
        });

        // 更新订阅等级
        if (data.tier !== store.user.subscription) {
          logger.info('📊 检测到订阅变化，开始更新...', {
            旧等级: store.user.subscription,
            新等级: data.tier
          });

          store.updateUserSubscription(data.tier as SubscriptionTier);

          logger.info('✅ updateUserSubscription 调用完成');

          // 订阅变化时重新初始化使用统计
          await store.initializeUsageStats(userId, data.tier as SubscriptionTier);

          logger.info('✅ initializeUsageStats 调用完成');
        } else {
          logger.info('ℹ️ 订阅状态未变化，跳过更新');
        }

        logger.info('✅ 订阅同步完成', {
          tier: data.tier,
          status: data.status,
          expires_at: data.expires_at
        });
      } else {
        logger.warn('⚠️ Supabase 未返回订阅数据（用户可能没有订阅记录）', { userId });
      }
    } catch (error) {
      logger.error('❌ 同步订阅异常:', error);
    }
  }

  /**
   * 同步使用统计（从云端）
   */
  private async syncUsageStats(userId: string) {
    try {
      logger.debug('🔄 同步使用统计...', { userId });

      const store = useUnifiedStore.getState();
      const userTier = store.user.subscription;

      // 强制从云端刷新，不使用缓存
      await store.initializeUsageStats(userId, userTier);

      logger.debug('✅ 使用统计同步完成');
    } catch (error) {
      logger.error('❌ 同步使用统计异常:', error);
    }
  }

  /**
   * 启动支付状态同步（支付中使用）
   */
  startPaymentSync(userId: string, orderId: string, onSuccess: () => void) {
    if (this.paymentStatusTimer) {
      logger.warn('支付状态同步已在运行中');
      return;
    }

    logger.info('🚀 启动支付状态同步', { userId, orderId });

    this.paymentStatusTimer = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('status')
          .eq('order_id', orderId)
          .single();

        if (error) {
          logger.error('❌ 查询支付状态失败:', error);
          return;
        }

        if (data && (data.status === 'paid' || data.status === 'processed')) {
          logger.info('✅ 检测到支付成功', { orderId, status: data.status });
          
          // 停止支付同步
          this.stopPaymentSync();
          
          // 立即同步订阅和使用统计
          await this.syncSubscription(userId);
          await this.syncUsageStats(userId);
          
          // 触发成功回调
          onSuccess();
        }
      } catch (error) {
        logger.error('❌ 支付状态同步异常:', error);
      }
    }, SYNC_INTERVALS.PAYMENT_STATUS);
  }

  /**
   * 停止支付状态同步
   */
  stopPaymentSync() {
    if (this.paymentStatusTimer) {
      clearInterval(this.paymentStatusTimer);
      this.paymentStatusTimer = null;
      logger.info('🛑 支付状态同步已停止');
    }
  }

  /**
   * 手动触发全量同步
   */
  async manualSync(userId: string) {
    logger.info('🔄 手动触发全量同步', { userId });
    
    await Promise.all([
      this.syncSubscription(userId),
      this.syncUsageStats(userId)
    ]);
    
    logger.info('✅ 手动同步完成');
  }

  /**
   * 获取同步状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasSubscriptionSync: !!this.subscriptionTimer,
      hasUsageStatsSync: !!this.usageStatsTimer,
      hasPaymentSync: !!this.paymentStatusTimer
    };
  }
}

// 导出单例
export const cloudSyncService = new CloudSyncService();

/**
 * React Hook：使用云端同步
 */
export function useCloudSync(userId: string | null) {
  const [syncStatus, setSyncStatus] = React.useState(cloudSyncService.getStatus());

  React.useEffect(() => {
    if (userId) {
      // 启动同步
      cloudSyncService.start(userId);

      // 定期更新状态
      const statusInterval = setInterval(() => {
        setSyncStatus(cloudSyncService.getStatus());
      }, 5000);

      return () => {
        clearInterval(statusInterval);
        // 注意：不在这里停止同步，因为可能有多个组件使用
      };
    }
  }, [userId]);

  return {
    syncStatus,
    manualSync: () => userId && cloudSyncService.manualSync(userId),
    stopSync: () => cloudSyncService.stop()
  };
}

// 导入React
import React from 'react';

