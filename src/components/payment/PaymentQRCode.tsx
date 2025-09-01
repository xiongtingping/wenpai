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
  onPaymentError?: (error: string) => void;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  paymentInfo,
  orderId,
  onPaymentSuccess,
  onPaymentTimeout,
  onPaymentError
}) => {
  const [timeLeft, setTimeLeft] = useState(paymentInfo.expires_in || 900); // 默认15分钟
  const [isPolling, setIsPolling] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'timeout'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

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
        const response = await fetch(`/.netlify/functions/bufpay-proxy?query=${paymentInfo.aoid}`);
        const result = await response.json();

        // 根据BufPay文档处理所有支付状态
        switch (result.status) {
          case 'success':
            // 订单已支付已经回调成功
            console.log('🎉 支付成功检测到 (已回调):', result);
            setPaymentStatus('success');
            setIsPolling(false);
            setTimeout(() => {
              onPaymentSuccess?.();
            }, 500);
            break;
            
          case 'payed':
            // 订单已支付未回调 - 继续轮询直到回调成功
            console.log('💰 已支付但未回调:', result);
            // 继续轮询，等待回调完成
            break;
            
          case 'new':
            // 新订单 - 继续等待支付
            console.log('🔄 订单等待支付中:', result);
            break;
            
          case 'expire':
            // 订单已过期
            console.log('⏰ 支付超时:', result);
            setPaymentStatus('timeout');
            setIsPolling(false);
            onPaymentTimeout?.();
            break;
            
          case 'fee_error':
            // 账户余额不足扣除手续费失败，订单未回调
            console.log('💸 手续费扣除失败:', result);
            setPaymentStatus('failed');
            setErrorMessage('支付平台手续费扣除失败，请联系客服');
            setIsPolling(false);
            onPaymentError?.('支付平台手续费扣除失败，请联系客服');
            break;
            
          case 'not_exist':
            // 订单不存在
            console.error('❌ 订单不存在:', result);
            setPaymentStatus('failed');
            setErrorMessage('订单不存在，请重新创建订单');
            setIsPolling(false);
            onPaymentError?.('订单不存在，请重新创建订单');
            break;
            
          default:
            console.log('🔄 未知状态，继续轮询:', result);
            break;
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
      <Card className="w-full max-w-md mx-auto border-green-200 bg-green-50/50 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-green-600 text-2xl font-bold">🎉 支付成功！</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-4xl">✅</div>
          </div>
          <div className="space-y-2">
            <p className="text-green-700 font-semibold text-lg">
              订单支付完成！
            </p>
            <p className="text-green-600 text-sm">
              您的权限正在开通中，请稍候...
            </p>
          </div>
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-3">
              页面将在几秒后自动跳转到结果页面
            </p>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full bg-green-600 hover:bg-green-700"
              variant="default"
            >
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'timeout') {
    return (
      <Card className="w-full max-w-md mx-auto border-orange-200 bg-orange-50/50">
        <CardHeader className="text-center">
          <CardTitle className="text-orange-600">支付超时</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <div className="text-4xl">⏰</div>
          </div>
          <p className="text-orange-700 font-medium">
            支付二维码已过期，请重新下单
          </p>
          <div className="space-y-2">
            <Button onClick={handleRefresh} className="w-full bg-orange-600 hover:bg-orange-700">
              重新下单
            </Button>
            <Button variant="outline" onClick={handleFeedback} className="w-full border-orange-300">
              支付遇到问题？
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200 bg-red-50/50">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">支付失败</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <div className="text-4xl">❌</div>
          </div>
          <div className="space-y-2">
            <p className="text-red-700 font-medium">
              支付处理失败
            </p>
            {errorMessage && (
              <p className="text-red-600 text-sm">
                {errorMessage}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Button onClick={handleRefresh} className="w-full bg-red-600 hover:bg-red-700">
              重新下单
            </Button>
            <Button variant="outline" onClick={handleFeedback} className="w-full border-red-300">
              联系客服
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
                sandbox="allow-scripts allow-forms allow-popups allow-top-navigation"
                onError={(e) => {
                  console.log('🔇 已忽略iframe加载错误（可能是X-Frame-Options限制）');
                }}
                onLoad={() => {
                  console.log('✅ BufPay支付页面加载完成');
                }}
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
