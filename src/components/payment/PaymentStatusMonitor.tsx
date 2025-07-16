/**
 * 支付状态监控组件
 * 实时监控支付状态，显示支付进度和结果
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Creem } from 'creem';

export interface PaymentStatus {
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'expired';
  message: string;
  progress: number;
  checkoutId?: string;
  amount?: number;
  currency?: string;
  paidAt?: string;
  error?: string;
}

interface PaymentStatusMonitorProps {
  checkoutId: string;
  apiKey: string;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentFailed?: (error: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const PaymentStatusMonitor: React.FC<PaymentStatusMonitorProps> = ({
  checkoutId,
  apiKey,
  onPaymentSuccess,
  onPaymentFailed,
  autoRefresh = true,
  refreshInterval = 3000,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'pending',
    message: '等待支付...',
    progress: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // 获取支付状态
  const fetchPaymentStatus = async () => {
    if (!checkoutId) return;

    setIsRefreshing(true);
    try {
      const creem = new Creem();
      const checkout = await creem.getCheckout(checkoutId);
      
      const status = checkout.status?.toLowerCase();
      let newStatus: PaymentStatus['status'] = 'pending';
      let message = '等待支付...';
      let progress = 0;

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
          break;
        case 'processing':
          newStatus = 'processing';
          message = '支付处理中...';
          progress = 50;
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
      };

      setPaymentStatus(updatedStatus);

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
      }

    } catch (error: any) {
      console.error('获取支付状态失败:', error);
      setPaymentStatus({
        status: 'failed',
        message: '获取支付状态失败',
        progress: 0,
        error: error.message,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // 自动刷新支付状态
  useEffect(() => {
    if (!autoRefresh || !checkoutId) return;

    fetchPaymentStatus(); // 立即执行一次

    const interval = setInterval(fetchPaymentStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [checkoutId, autoRefresh, refreshInterval]);

  // 手动刷新
  const handleManualRefresh = () => {
    fetchPaymentStatus();
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
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          支付状态
        </CardTitle>
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
            disabled={isRefreshing}
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

        {/* 错误信息 */}
        {paymentStatus.error && (
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm text-red-600">错误信息</div>
            <div className="text-sm">{paymentStatus.error}</div>
          </div>
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
      </CardContent>
    </Card>
  );
}; 