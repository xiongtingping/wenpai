/**
 * 订阅状态管理Hook
 * @description 提供订阅状态查询和临期提醒功能
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { calculateSubscriptionStatus, type SubscriptionStatus } from '@/utils/subscriptionStatusUtils';
import { logger } from '@/utils/logger';

interface UseSubscriptionStatusReturn {
  /** 主要订阅状态 */
  primaryStatus: SubscriptionStatus;
  /** 订阅状态（primaryStatus的别名，保持向后兼容） */
  subscriptionStatus: SubscriptionStatus;
  /** 所有订阅状态 */
  allSubscriptions: Array<SubscriptionStatus & {
    subscriptionType: string;
    subscriptionId: string;
  }>;
  /** 是否有活跃订阅 */
  hasActiveSubscription: boolean;
  /** 是否正在加载 */
  loading: boolean;
  /** 初始加载状态 */
  initialLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 刷新订阅状态 */
  refresh: () => Promise<void>;
  /** 上次更新时间 (ISO 8601 格式) */
  lastUpdated: string | null;
}

/**
 * 订阅状态管理Hook
 * @param userId 可选的用户ID，如果不提供则使用当前登录用户
 */
export function useSubscriptionStatus(userId?: string): UseSubscriptionStatusReturn {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [isInitialized, setIsInitialized] = useState(false); // 防止重复初始化
  const [primaryStatus, setPrimaryStatus] = useState<SubscriptionStatus>(() => {
    // 🔧 CRITICAL FIX: 移除缓存读取，强制从数据库查询
    // 不再从 localStorage 读取缓存数据
    
    // 默认状态
    return {
      status: 'inactive',
      tier: 'trial', // 🔧 FIX: 默认为试用用户
      expiresAt: null,
      daysRemaining: 0,
      needsAlert: false,
      alertLevel: 'info',
      alertMessage: '',
      statusLabel: '试用用户',
      statusColor: 'gray'
    };
  });
  const [allSubscriptions, setAllSubscriptions] = useState<Array<SubscriptionStatus & { 
    subscriptionType: string;
    subscriptionId: string;
  }>>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(() => {
    // 🔧 CRITICAL FIX: 移除缓存读取，默认为 false，等待数据库查询
    return false;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // 🔧 FIX: 添加初始加载状态
  const [lastUpdated, setLastUpdated] = useState<string | null>(null); // 🔧 NEW: 上次更新时间

  /**
   * 获取订阅状态
   */
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!targetUserId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 🔧 CRITICAL FIX: 移除开发环境特殊处理，统一从数据库查询
      // 无论开发还是生产环境，都查询真实数据库

      // API调用逻辑
      const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:5173' : 'https://www.wenpai.xyz';
      let lastError: Error | null = null;
      let response: Response | null = null;

      // 重试机制：最多尝试3次
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          logger.info(`🔄 订阅状态获取尝试 ${attempt}/3...`);

          response = await Promise.race([
            fetch(`${apiBaseUrl}/.netlify/functions/subscription-status/${targetUserId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            }),
            // 30秒超时
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('订阅状态获取超时')), 30000)
            )
          ]);

          if (response.ok) {
            logger.info(`✅ 第 ${attempt} 次尝试成功`);
            break;
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('未知错误');
          logger.warn(`❌ 第 ${attempt} 次尝试失败:`, lastError.message);

          // 如果不是最后一次尝试，等待后重试
          if (attempt < 3) {
            const delay = attempt * 1000; // 递增延迟：1s, 2s
            logger.info(`⏳ 等待 ${delay}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // 如果所有重试都失败了，抛出错误
      if (!response || !response.ok) {
        throw lastError || new Error('订阅状态获取失败');
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

      // 🔧 NEW: 更新最后同步时间
      const now = new Date().toISOString();
      setLastUpdated(now);

      // 🔧 CRITICAL FIX: 移除缓存写入，不再缓存订阅状态
      // 每次都从数据库查询最新数据
      logger.info('✅ 订阅状态已更新（无缓存）:', {
        userId: targetUserId,
        tier: data.primaryStatus.tier,
        status: data.primaryStatus.status,
        hasActive: data.hasActiveSubscription,
        needsAlert: data.primaryStatus.needsAlert,
        daysRemaining: data.primaryStatus.daysRemaining,
        lastUpdated: now
      });

    } catch (error) {
      logger.error('获取订阅状态失败:', error);

      // 提供友好的错误处理
      let errorMessage = '获取订阅状态失败';
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('超时')) {
          errorMessage = '网络连接超时，请检查网络后重试';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('网络')) {
          errorMessage = '网络连接失败，请检查网络设置';
        } else if (error.message.includes('500')) {
          errorMessage = '服务暂时不可用，请稍后重试';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);

      // 不使用任何降级方案，直接抛出错误让上层处理
      throw error;
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  /**
   * 刷新订阅状态
   */
  const refresh = useCallback(async () => {
    await fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // 用户登录后自动获取订阅状态 - 防止重复调用
  useEffect(() => {
    if (targetUserId && !isInitialized) {
      setIsInitialized(true);
      fetchSubscriptionStatus().finally(() => {
        setInitialLoading(false);
      });
    } else if (!targetUserId) {
      // 如果没有用户ID，直接设置初始加载为false
      setInitialLoading(false);
    }
  }, [targetUserId, isInitialized, fetchSubscriptionStatus]); // 添加初始化状态检查

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
    const previousActive = hasActiveSubscription;
    setHasActiveSubscription(isActive);
    
    // 只在状态真正变化时记录日志
    if (previousActive !== isActive) {
      logger.info('🔄 同步活跃订阅状态:', { 
        from: previousActive, 
        to: isActive, 
        status: primaryStatus.status 
      });
    }
  }, [primaryStatus.status]); // 移除hasActiveSubscription依赖，避免循环

  // 🔧 NEW: 每30秒自动从云端同步数据
  useEffect(() => {
    if (!targetUserId) return;

    logger.info('🔄 启动自动同步：每30秒从云端刷新订阅状态');

    const interval = setInterval(() => {
      logger.info('⏰ 自动同步触发：刷新订阅状态');
      fetchSubscriptionStatus();
    }, 30 * 1000); // 30秒

    return () => {
      logger.info('🛑 停止自动同步');
      clearInterval(interval);
    };
  }, [targetUserId, fetchSubscriptionStatus]);

  return {
    primaryStatus,
    subscriptionStatus: primaryStatus, // 🔧 FIX: 添加别名以保持向后兼容
    allSubscriptions,
    hasActiveSubscription,
    loading,
    error,
    refresh,
    initialLoading, // 🔧 FIX: 导出初始加载状态
    lastUpdated // 🔧 NEW: 导出上次更新时间
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