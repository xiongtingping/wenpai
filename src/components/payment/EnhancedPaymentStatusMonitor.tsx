/**
 * 增强版支付状态监控组件
 * 提供智能轮询、状态持久化、实时通知等高级功能
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle, RefreshCw, Bell, BellOff, Settings } from 'lucide-react';
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

interface EnhancedPaymentStatusMonitorProps {
  checkoutId: string;
  apiKey: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentFailed?: (error: string) => void;
  onPaymentExpired?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxRetries?: number;
  enableNotifications?: boolean;
  enableSound?: boolean;
  showAdvancedInfo?: boolean;
}

interface PollingConfig {
  initialInterval: number;
  maxInterval: number;
  backoffMultiplier: number;
  successInterval: number;
}

export const EnhancedPaymentStatusMonitor: React.FC<EnhancedPaymentStatusMonitorProps> = ({
  checkoutId,
  apiKey,
  onPaymentSuccess,
  onPaymentFailed,
  onPaymentExpired,
  autoRefresh = true,
  refreshInterval = 3000,
  maxRetries = 10,
  enableNotifications = true,
  enableSound = true,
  showAdvancedInfo = false,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'pending',
    message: '等待支付...',
    progress: 0,
    retryCount: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pollingConfig, setPollingConfig] = useState<PollingConfig>({
    initialInterval: refreshInterval,
    maxInterval: 30000, // 最大30秒
    backoffMultiplier: 1.5,
    successInterval: 5000, // 成功后5秒检查一次
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastStatusRef = useRef<string>('');
  const { toast } = useToast();

  // 智能轮询策略
  const getNextInterval = useCallback((currentStatus: string, retryCount: number): number => {
    if (currentStatus === 'paid') {
      return pollingConfig.successInterval;
    }
    
    if (currentStatus === 'failed' || currentStatus === 'expired') {
      return pollingConfig.maxInterval;
    }
    
    // 指数退避策略
    const interval = Math.min(
      pollingConfig.initialInterval * Math.pow(pollingConfig.backoffMultiplier, retryCount),
      pollingConfig.maxInterval
    );
    
    return interval;
  }, [pollingConfig]);

  // 获取支付状态
  const fetchPaymentStatus = useCallback(async (isManualRefresh = false) => {
    if (!checkoutId || isPaused) return;

    setIsRefreshing(true);
    try {
      const creem = new Creem();
      const checkout = await creem.getCheckout(checkoutId);
      
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
        retryCount: retryCountRef.current,
        estimatedTime,
      };

      setPaymentStatus(updatedStatus);

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
        retryCountRef.current = 0;
      }

    } catch (error: any) {
      console.error('获取支付状态失败:', error);
      retryCountRef.current++;
      
      setPaymentStatus(prev => ({
        ...prev,
        status: retryCountRef.current >= maxRetries ? 'failed' : 'pending',
        message: retryCountRef.current >= maxRetries ? '获取支付状态失败' : '网络异常，正在重试...',
        progress: 0,
        error: error.message,
        lastChecked: new Date().toISOString(),
        retryCount: retryCountRef.current,
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [checkoutId, isPaused, enableNotifications, enableSound, onPaymentSuccess, onPaymentFailed, onPaymentExpired, maxRetries, toast]);

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

    // 设置智能轮询
    const startPolling = () => {
      const interval = getNextInterval(paymentStatus.status, retryCountRef.current);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        fetchPaymentStatus();
      }, interval);
    };

    startPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkoutId, autoRefresh, isPaused, paymentStatus.status, fetchPaymentStatus, getNextInterval]);

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
        audio.src = '/sounds/success.mp3'; // 成功音效
      } else if (status === 'failed' || status === 'expired') {
        audio.src = '/sounds/error.mp3'; // 错误音效
      }
      audio.play().catch(() => {
        // 忽略音频播放错误
      });
    } catch (error) {
      // 忽略音频错误
    }
  };

  // 手动刷新
  const handleManualRefresh = () => {
    fetchPaymentStatus(true);
  };

  // 暂停/恢复监控
  const togglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "恢复监控" : "暂停监控",
      description: isPaused ? "已恢复自动检测" : "已暂停自动检测",
    });
  };

  // 获取状态图标
  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'paid':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    return date.toLocaleTimeString();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            支付状态监控
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePause}
              title={isPaused ? "恢复监控" : "暂停监控"}
            >
              {isPaused ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="设置"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 状态徽章 */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor()}>
            {paymentStatus.message}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isPaused}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>支付进度</span>
            <span>{paymentStatus.progress}%</span>
          </div>
          <Progress value={paymentStatus.progress} className="h-2" />
          {paymentStatus.estimatedTime && (
            <p className="text-xs text-gray-500">{paymentStatus.estimatedTime}</p>
          )}
        </div>

        {/* 支付详情 */}
        {paymentStatus.amount && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">支付金额</div>
            <div className="text-lg font-semibold">
              ¥{(paymentStatus.amount / 100).toFixed(2)}
            </div>
          </div>
        )}

        {/* 支付时间 */}
        {paymentStatus.paidAt && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600">支付时间</div>
            <div className="text-sm font-medium">
              {new Date(paymentStatus.paidAt).toLocaleString()}
            </div>
          </div>
        )}

        {/* 高级信息 */}
        {showAdvancedInfo && (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              最后检查: {paymentStatus.lastChecked ? formatTime(paymentStatus.lastChecked) : '未知'}
            </div>
            <div className="text-xs text-gray-500">
              重试次数: {paymentStatus.retryCount || 0}
            </div>
            <div className="text-xs text-gray-500">
              监控状态: {isPaused ? '已暂停' : '运行中'}
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {paymentStatus.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{paymentStatus.error}</AlertDescription>
          </Alert>
        )}

        {/* 操作按钮 */}
        {paymentStatus.status === 'paid' && (
          <Button className="w-full" onClick={() => window.location.href = '/profile'}>
            前往个人中心
          </Button>
        )}

        {paymentStatus.status === 'failed' && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.reload()}
          >
            重新支付
          </Button>
        )}

        {paymentStatus.status === 'expired' && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.reload()}
          >
            重新发起支付
          </Button>
        )}
      </CardContent>
    </Card>
  );
}; 