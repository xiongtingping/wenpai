/**
 * 支付二维码组件
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { PaymentResponse } from '@/types/payment';
import { formatCountdown, needsManualAmount } from '@/utils/paymentUtils';

interface PaymentQRCodeProps {
  paymentInfo: PaymentResponse;
  orderId: string;
  onPaymentSuccess?: () => void;
  onPaymentTimeout?: () => void;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  paymentInfo,
  orderId,
  onPaymentSuccess,
  onPaymentTimeout
}) => {
  const [timeLeft, setTimeLeft] = useState(paymentInfo.expires_in || 900); // 默认15分钟
  const [isPolling, setIsPolling] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'timeout'>('pending');

  // 倒计时
  useEffect(() => {
    if (timeLeft <= 0) {
      setPaymentStatus('timeout');
      setIsPolling(false);
      onPaymentTimeout?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onPaymentTimeout]);

  // 轮询支付状态
  useEffect(() => {
    if (!isPolling || !paymentInfo.aoid) return;

    const pollPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/bufpay/query/${paymentInfo.aoid}`);
        const result = await response.json();

        if (result.status === 'success' || result.status === 'payed') {
          setPaymentStatus('success');
          setIsPolling(false);
          onPaymentSuccess?.();
        } else if (result.status === 'expire') {
          setPaymentStatus('timeout');
          setIsPolling(false);
          onPaymentTimeout?.();
        }
      } catch (error) {
        console.error('查询支付状态失败:', error);
      }
    };

    // 每5秒查询一次
    const interval = setInterval(pollPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [isPolling, paymentInfo.aoid, onPaymentSuccess, onPaymentTimeout]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleFeedback = () => {
    window.open(paymentInfo.feedback_url, '_blank');
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">支付成功！</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-muted-foreground mb-4">
            您的订单已支付成功，权限正在开通中...
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full">
            返回首页
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'timeout') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">支付超时</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <p className="text-muted-foreground mb-4">
            支付二维码已过期，请重新下单
          </p>
          <div className="space-y-2">
            <Button onClick={handleRefresh} className="w-full">
              重新下单
            </Button>
            <Button variant="outline" onClick={handleFeedback} className="w-full">
              支付遇到问题？
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          请扫码支付
        </CardTitle>
        <div className="text-2xl font-mono text-primary">
          {formatCountdown(timeLeft)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 支付内容 */}
        <div className="flex justify-center">
          {paymentInfo.htmlContent ? (
            // BufPay HTML支付页面
            <div className="w-full border rounded-lg overflow-hidden">
              <iframe
                srcDoc={paymentInfo.htmlContent}
                className="w-full h-96 border-0"
                title="BufPay支付页面"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          ) : paymentInfo.qr_img ? (
            // 传统二维码支付
            <img 
              src={paymentInfo.qr_img} 
              alt="支付二维码" 
              className="w-64 h-64 border rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 border rounded-lg flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        {/* 支付金额提示 */}
        {needsManualAmount(paymentInfo.qr_price) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              请在支付时手动输入金额：<strong>¥{paymentInfo.price}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* 支付说明 */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          {paymentInfo.htmlContent ? (
            <>
              <p>在上方页面中完成支付操作</p>
              <p>支付后页面会自动跳转或提示</p>
            </>
          ) : (
            <>
              <p>请使用{paymentInfo.pay_type === 'alipay' ? '支付宝' : '微信'}扫码支付</p>
              <p>支付金额：¥{paymentInfo.price}</p>
            </>
          )}
          <p>订单号：{orderId}</p>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="w-full"
            disabled={isPolling}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
            刷新页面
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleFeedback} 
            className="w-full text-sm"
          >
            支付成功但未到账？点击反馈
          </Button>
        </div>

        {/* 支付状态指示 */}
        {isPolling && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在等待支付...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
