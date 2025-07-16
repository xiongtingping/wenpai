/**
 * 支付状态恢复组件
 * 用于在页面加载时恢复之前的支付状态
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, Clock, CheckCircle, X } from 'lucide-react';
import { paymentStatusService, PaymentStatusData } from '@/services/paymentStatusService';
import { EnhancedPaymentStatusMonitor } from './EnhancedPaymentStatusMonitor';

interface PaymentStatusRecoveryProps {
  onRecoveryComplete?: () => void;
  onNoActivePayments?: () => void;
}

export const PaymentStatusRecovery: React.FC<PaymentStatusRecoveryProps> = ({
  onRecoveryComplete,
  onNoActivePayments,
}) => {
  const [activePayments, setActivePayments] = useState<PaymentStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recoveredPayments, setRecoveredPayments] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadActivePayments();
  }, []);

  /**
   * 加载活跃的支付状态
   */
  const loadActivePayments = () => {
    try {
      setIsLoading(true);
      const payments = paymentStatusService.getActivePaymentStatuses();
      setActivePayments(payments);
      
      if (payments.length === 0) {
        onNoActivePayments?.();
      }
    } catch (error) {
      console.error('加载活跃支付状态失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载支付状态",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 恢复支付状态监控
   */
  const recoverPayment = (checkoutId: string) => {
    setRecoveredPayments(prev => [...prev, checkoutId]);
    toast({
      title: "支付状态已恢复",
      description: "正在监控支付状态",
    });
  };

  /**
   * 删除支付状态
   */
  const removePayment = (checkoutId: string) => {
    paymentStatusService.removePaymentStatus(checkoutId);
    setActivePayments(prev => prev.filter(p => p.checkoutId !== checkoutId));
    setRecoveredPayments(prev => prev.filter(id => id !== checkoutId));
    
    toast({
      title: "支付状态已删除",
      description: "已清理该支付记录",
    });
  };

  /**
   * 处理支付成功
   */
  const handlePaymentSuccess = (checkoutId: string, paymentData: any) => {
    // 支付成功后删除状态
    paymentStatusService.removePaymentStatus(checkoutId);
    setActivePayments(prev => prev.filter(p => p.checkoutId !== checkoutId));
    setRecoveredPayments(prev => prev.filter(id => id !== checkoutId));
    
    toast({
      title: "支付成功！",
      description: "您的会员已自动升级",
      duration: 5000,
    });
    
    onRecoveryComplete?.();
  };

  /**
   * 处理支付失败
   */
  const handlePaymentFailed = (checkoutId: string, error: string) => {
    toast({
      title: "支付失败",
      description: error,
      variant: "destructive",
    });
  };

  /**
   * 处理支付过期
   */
  const handlePaymentExpired = (checkoutId: string) => {
    paymentStatusService.removePaymentStatus(checkoutId);
    setActivePayments(prev => prev.filter(p => p.checkoutId !== checkoutId));
    setRecoveredPayments(prev => prev.filter(id => id !== checkoutId));
    
    toast({
      title: "支付已过期",
      description: "请重新发起支付",
      variant: "destructive",
    });
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">正在检查支付状态...</p>
        </CardContent>
      </Card>
    );
  }

  if (activePayments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            发现未完成的支付
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            检测到 {activePayments.length} 个未完成的支付，是否恢复监控？
          </p>
          
          {activePayments.map((payment) => (
            <div key={payment.checkoutId} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.message}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {recoveredPayments.includes(payment.checkoutId) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePayment(payment.checkoutId)}
                      title="删除"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => recoverPayment(payment.checkoutId)}
                    >
                      恢复监控
                    </Button>
                  )}
                </div>
              </div>
              
              {payment.amount && (
                <div className="text-sm text-gray-600">
                  金额: ¥{(payment.amount / 100).toFixed(2)}
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                创建时间: {formatTime(payment.createdAt)}
              </div>
              
              {payment.lastChecked && (
                <div className="text-xs text-gray-500">
                  最后检查: {formatTime(payment.lastChecked)}
                </div>
              )}
            </div>
          ))}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadActivePayments}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                activePayments.forEach(p => paymentStatusService.removePaymentStatus(p.checkoutId));
                setActivePayments([]);
                setRecoveredPayments([]);
                onNoActivePayments?.();
              }}
              className="flex-1"
            >
              全部清除
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 恢复的支付状态监控 */}
      {recoveredPayments.map((checkoutId) => {
        const payment = activePayments.find(p => p.checkoutId === checkoutId);
        if (!payment) return null;

        return (
          <EnhancedPaymentStatusMonitor
            key={checkoutId}
            checkoutId={checkoutId}
            apiKey={import.meta.env.VITE_CREEM_API_KEY || ''}
            onPaymentSuccess={(paymentData) => handlePaymentSuccess(checkoutId, paymentData)}
            onPaymentFailed={(error) => handlePaymentFailed(checkoutId, error)}
            onPaymentExpired={() => handlePaymentExpired(checkoutId)}
            autoRefresh={true}
            refreshInterval={3000}
            maxRetries={10}
            enableNotifications={true}
            enableSound={true}
            showAdvancedInfo={true}
          />
        );
      })}
    </div>
  );
}; 