/**
 * 订阅状态管理Hook
 * @description 提供订阅状态查询和临期提醒功能
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { calculateSubscriptionStatus, type SubscriptionStatus } from '@/utils/subscriptionStatusUtils';
import { logger } from '@/utils/logger';

interface UseSubscriptionStatusReturn {
  /** 主要订阅状态 */
  primaryStatus: SubscriptionStatus;
  /** 所有订阅状态 */
  allSubscriptions: Array<SubscriptionStatus & { 
    subscriptionType: string;
    subscriptionId: string;
  }>;
  /** 是否有活跃订阅 */
  hasActiveSubscription: boolean;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 刷新订阅状态 */
  refresh: () => Promise<void>;
}

/**
 * 订阅状态管理Hook
 */
export function useSubscriptionStatus(): UseSubscriptionStatusReturn {
  const { user } = useAuth();
  const [primaryStatus, setPrimaryStatus] = useState<SubscriptionStatus>({
    status: 'inactive',
    expiresAt: null,
    daysRemaining: 0,
    needsAlert: false,
    alertLevel: 'info',
    alertMessage: '',
    statusLabel: '未订阅',
    statusColor: 'gray'
  });
  const [allSubscriptions, setAllSubscriptions] = useState<Array<SubscriptionStatus & { 
    subscriptionType: string;
    subscriptionId: string;
  }>>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取订阅状态
   */
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info('开始获取订阅状态:', { userId: user.id });
      
      const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:8888' : '';
      const response = await fetch(`${apiBaseUrl}/.netlify/functions/subscription-status/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        logger.error('订阅状态API返回非JSON响应:', { contentType, textPreview: text.substring(0, 100) });
        throw new Error('订阅状态API返回格式错误');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch subscription status');
      }

      setPrimaryStatus(data.primaryStatus);
      setAllSubscriptions(data.allSubscriptions || []);
      setHasActiveSubscription(data.hasActiveSubscription);

      logger.info('订阅状态获取成功:', {
        userId: user.id,
        status: data.primaryStatus.status,
        needsAlert: data.primaryStatus.needsAlert,
        daysRemaining: data.primaryStatus.daysRemaining
      });

    } catch (error) {
      logger.error('获取订阅状态失败:', error);
      setError(error instanceof Error ? error.message : '获取订阅状态失败');
      
      // 设置默认状态
      setPrimaryStatus({
        status: 'inactive',
        expiresAt: null,
        daysRemaining: 0,
        needsAlert: false,
        alertLevel: 'info',
        alertMessage: '',
        statusLabel: '未订阅',
        statusColor: 'gray'
      });
      setAllSubscriptions([]);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * 刷新订阅状态
   */
  const refresh = useCallback(async () => {
    await fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // 用户登录后自动获取订阅状态
  useEffect(() => {
    if (user?.id) {
      fetchSubscriptionStatus();
    }
  }, [user?.id, fetchSubscriptionStatus]);

  // 定期刷新状态（每5分钟）
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchSubscriptionStatus();
    }, 5 * 60 * 1000); // 5分钟

    return () => clearInterval(interval);
  }, [user?.id, fetchSubscriptionStatus]);

  return {
    primaryStatus,
    allSubscriptions,
    hasActiveSubscription,
    loading,
    error,
    refresh
  };
}

/**
 * 简化版订阅状态Hook（仅返回基本状态）
 */
export function useSubscriptionAlert() {
  const { primaryStatus } = useSubscriptionStatus();
  
  return {
    needsAlert: primaryStatus.needsAlert,
    alertLevel: primaryStatus.alertLevel,
    alertMessage: primaryStatus.alertMessage,
    statusLabel: primaryStatus.statusLabel,
    statusColor: primaryStatus.statusColor,
    daysRemaining: primaryStatus.daysRemaining
  };
}