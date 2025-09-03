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
  const [isInitialized, setIsInitialized] = useState(false); // 防止重复初始化
  const [primaryStatus, setPrimaryStatus] = useState<SubscriptionStatus>(() => {
    // 如果用户已登录，尝试从缓存获取状态，避免闪烁
    if (user?.id) {
      try {
        const cached = localStorage.getItem(`subscription_status_${user.id}`);
        if (cached) {
          const cachedStatus = JSON.parse(cached);
          logger.info('🚀 使用缓存订阅状态，避免闪烁:', cachedStatus);
          return cachedStatus;
        }
      } catch (e) {
        logger.warn('缓存订阅状态解析失败:', e);
      }
    }
    
    // 默认状态
    return {
      status: 'inactive',
      expiresAt: null,
      daysRemaining: 0,
      needsAlert: false,
      alertLevel: 'info',
      alertMessage: '',
      statusLabel: '未订阅',
      statusColor: 'gray'
    };
  });
  const [allSubscriptions, setAllSubscriptions] = useState<Array<SubscriptionStatus & { 
    subscriptionType: string;
    subscriptionId: string;
  }>>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(() => {
    // 如果用户已登录，尝试从缓存推断活跃订阅状态
    if (user?.id) {
      try {
        const cached = localStorage.getItem(`subscription_status_${user.id}`);
        if (cached) {
          const cachedStatus = JSON.parse(cached);
          const isActive = cachedStatus.status === 'active';
          logger.info('🚀 从缓存推断活跃订阅状态:', { isActive, status: cachedStatus.status });
          return isActive;
        }
      } catch (e) {
        logger.warn('缓存订阅状态解析失败:', e);
      }
    }
    return false;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // 🔧 FIX: 添加初始加载状态

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

      // 缓存订阅状态，避免下次闪烁
      try {
        localStorage.setItem(`subscription_status_${user.id}`, JSON.stringify(data.primaryStatus));
        logger.info('✅ 订阅状态已缓存');
      } catch (e) {
        logger.warn('缓存订阅状态失败:', e);
      }

      logger.info('订阅状态获取成功:', {
        userId: user.id,
        status: data.primaryStatus.status,
        needsAlert: data.primaryStatus.needsAlert,
        daysRemaining: data.primaryStatus.daysRemaining
      });

    } catch (error) {
      logger.error('获取订阅状态失败:', error);
      setError(error instanceof Error ? error.message : '获取订阅状态失败');
      
      // 🔧 FIX: 避免设置默认状态，保持loading状态直到获取到真实数据
      // 这样可以避免页面先显示"免费版"再变成"专业版"的闪烁问题
      if (!loading) {
        // 只有在非loading状态下才设置默认状态
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
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新订阅状态
   */
  const refresh = useCallback(async () => {
    await fetchSubscriptionStatus();
  }, []);

  // 用户登录后自动获取订阅状态 - 防止重复调用
  useEffect(() => {
    if (user?.id && !isInitialized) {
      setIsInitialized(true);
      fetchSubscriptionStatus();
    }
  }, [user?.id, isInitialized]); // 添加初始化状态检查

  // 🔧 FIX: 监听支付成功事件，自动刷新订阅状态
  useEffect(() => {
    const handlePaymentSuccess = () => {
      logger.info('收到支付成功事件，刷新订阅状态');
      refresh();
    };

    const handleSubscriptionUpdated = (event: CustomEvent) => {
      logger.info('收到订阅更新事件，刷新订阅状态', event.detail);
      refresh();
    };

    // 监听支付成功事件
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    window.addEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);

    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
      window.removeEventListener('userSubscriptionUpdated', handleSubscriptionUpdated as EventListener);
    };
  }, [refresh]);

  // 🔧 FIX: 同步primaryStatus变化到hasActiveSubscription - 避免循环依赖
  useEffect(() => {
    const isActive = primaryStatus.status === 'active';
    setHasActiveSubscription(isActive);
    logger.info('🔄 同步活跃订阅状态:', { 
      to: isActive, 
      status: primaryStatus.status 
    });
  }, [primaryStatus.status]); // 移除hasActiveSubscription依赖，避免循环

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
    refresh,
    initialLoading // 🔧 FIX: 导出初始加载状态
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