/**
 * 支付状态检测Hook
 * 提供支付状态监控的便捷接口
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { paymentStatusService, PaymentStatusData } from '@/services/paymentStatusService';
import { Creem } from 'creem';

export interface PaymentStatus {
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'expired' | 'cancelled';
  message: string;
  progress: number;
  checkoutId?: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
  error?: string;
  lastChecked?: string;
  retryCount?: number;
  estimatedTime?: string;
}

interface UsePaymentStatusOptions {
  checkoutId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxRetries?: number;
  enableNotifications?: boolean;
  enableSound?: boolean;
  onStatusChange?: (status: PaymentStatus) => void;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentFailed?: (error: string) => void;
  onPaymentExpired?: () => void;
}

interface UsePaymentStatusReturn {
  paymentStatus: PaymentStatus;
  isRefreshing: boolean;
  isPaused: boolean;
  retryCount: number;
  startMonitoring: (checkoutId: string) => void;
  stopMonitoring: () => void;
  pauseMonitoring: () => void;
  resumeMonitoring: () => void;
  refreshStatus: () => Promise<void>;
  clearStatus: () => void;
}

export function usePaymentStatus(options: UsePaymentStatusOptions = {}): UsePaymentStatusReturn {
  const {
    checkoutId,
    autoRefresh = true,
    refreshInterval = 3000,
    maxRetries = 10,
    enableNotifications = true,
    enableSound = true,
    onStatusChange,
    onPaymentSuccess,
    onPaymentFailed,
    onPaymentExpired,
  } = options;

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'pending',
    message: '等待支付...',
    progress: 0,
    retryCount: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusRef = useRef<string>('');
  const { toast } = useToast();

  // 获取支付状态
  const fetchPaymentStatus = useCallback(async (targetCheckoutId?: string) => {
    const id = targetCheckoutId || checkoutId;
    if (!id || isPaused) return;

    setIsRefreshing(true);
    try {
      const creem = new Creem();
      const checkout = await creem.getCheckout(id);
      
      const status = checkout.status?.toLowerCase();
      let newStatus: PaymentStatus['status'] = 'pending';
      let message = '等待支付...';
      let progress = 0;
      let estimatedTime = '';

      switch (status) {
        case 'paid':
        case 'completed':
          newStatus = 'paid';
          message = '支付成功！';
          progress = 100;
          break;
        case 'pending':
          newStatus = 'pending';
          message = '等待支付...';
          progress = 25;
          estimatedTime = '预计2-5分钟';
          break;
        case 'processing':
          newStatus = 'processing';
          message = '支付处理中...';
          progress = 50;
          estimatedTime = '预计1-3分钟';
          break;
        case 'failed':
        case 'cancelled':
          newStatus = 'failed';
          message = '支付失败';
          progress = 0;
          break;
        case 'expired':
          newStatus = 'expired';
          message = '支付已过期';
          progress = 0;
          break;
        default:
          newStatus = 'pending';
          message = '等待支付...';
          progress = 25;
      }

      const updatedStatus: PaymentStatus = {
        status: newStatus,
        message,
        progress,
        checkoutId: checkout.id,
        amount: typeof checkout.amount === 'number' ? checkout.amount : parseFloat(String(checkout.amount)),
        currency: checkout.currency,
        paidAt: checkout.status === 'paid' ? new Date().toISOString() : undefined,
        lastChecked: new Date().toISOString(),
        retryCount,
        estimatedTime,
      };

      setPaymentStatus(updatedStatus);

      // 保存到本地存储
      paymentStatusService.savePaymentStatus(id, updatedStatus);

      // 状态变化检测
      if (lastStatusRef.current !== newStatus) {
        console.log(`支付状态变化: ${lastStatusRef.current} -> ${newStatus}`);
        lastStatusRef.current = newStatus;
        
        // 发送通知
        if (enableNotifications) {
          sendNotification(newStatus, message);
        }
        
        // 播放提示音
        if (enableSound) {
          playNotificationSound(newStatus);
        }

        // 触发状态变化回调
        onStatusChange?.(updatedStatus);
      }

      // 触发回调
      if (newStatus === 'paid' && onPaymentSuccess) {
        onPaymentSuccess(checkout);
        toast({
          title: "支付成功！",
          description: "您的会员已自动升级",
          duration: 5000,
        });
      } else if (newStatus === 'failed' && onPaymentFailed) {
        onPaymentFailed(message);
        toast({
          title: "支付失败",
          description: message,
          variant: "destructive",
        });
      } else if (newStatus === 'expired' && onPaymentExpired) {
        onPaymentExpired();
        toast({
          title: "支付已过期",
          description: "请重新发起支付",
          variant: "destructive",
        });
      }

      // 重置重试计数
      if (newStatus !== 'failed' && newStatus !== 'expired') {
        setRetryCount(0);
      }

    } catch (error: any) {
      console.error('获取支付状态失败:', error);
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      setPaymentStatus(prev => ({
        ...prev,
        status: newRetryCount >= maxRetries ? 'failed' : 'pending',
        message: newRetryCount >= maxRetries ? '获取支付状态失败' : '网络异常，正在重试...',
        progress: 0,
        error: error.message,
        lastChecked: new Date().toISOString(),
        retryCount: newRetryCount,
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [checkoutId, isPaused, enableNotifications, enableSound, onStatusChange, onPaymentSuccess, onPaymentFailed, onPaymentExpired, maxRetries, retryCount, toast]);

  // 智能轮询
  useEffect(() => {
    if (!autoRefresh || !checkoutId || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 立即执行一次
    fetchPaymentStatus();

    // 设置轮询间隔
    const interval = Math.min(
      refreshInterval * Math.pow(1.5, retryCount),
      30000 // 最大30秒
    );

    intervalRef.current = setInterval(() => {
      fetchPaymentStatus();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkoutId, autoRefresh, isPaused, refreshInterval, retryCount, fetchPaymentStatus]);

  // 发送通知
  const sendNotification = (status: string, message: string) => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification('文派支付', {
        body: message,
        icon: '/favicon.ico',
        tag: 'payment-status',
      });
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('文派支付', {
            body: message,
            icon: '/favicon.ico',
            tag: 'payment-status',
          });
        }
      });
    }
  };

  // 播放提示音
  const playNotificationSound = (status: string) => {
    try {
      const audio = new Audio();
      if (status === 'paid') {
        audio.src = '/sounds/success.mp3';
      } else if (status === 'failed' || status === 'expired') {
        audio.src = '/sounds/error.mp3';
      }
      audio.play().catch(() => {
        // 忽略音频播放错误
      });
    } catch (error) {
      // 忽略音频错误
    }
  };

  // 开始监控
  const startMonitoring = useCallback((targetCheckoutId: string) => {
    if (targetCheckoutId) {
      fetchPaymentStatus(targetCheckoutId);
    }
  }, [fetchPaymentStatus]);

  // 停止监控
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
  }, []);

  // 暂停监控
  const pauseMonitoring = useCallback(() => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 恢复监控
  const resumeMonitoring = useCallback(() => {
    setIsPaused(false);
    if (checkoutId && autoRefresh) {
      fetchPaymentStatus();
    }
  }, [checkoutId, autoRefresh, fetchPaymentStatus]);

  // 手动刷新
  const refreshStatus = useCallback(async () => {
    await fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  // 清除状态
  const clearStatus = useCallback(() => {
    if (checkoutId) {
      paymentStatusService.removePaymentStatus(checkoutId);
    }
    setPaymentStatus({
      status: 'pending',
      message: '等待支付...',
      progress: 0,
      retryCount: 0,
    });
    setRetryCount(0);
    lastStatusRef.current = '';
  }, [checkoutId]);

  return {
    paymentStatus,
    isRefreshing,
    isPaused,
    retryCount,
    startMonitoring,
    stopMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    refreshStatus,
    clearStatus,
  };
} 