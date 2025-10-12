/**
 * 支付二维码组件
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { PaymentResponse } from '@/types/payment';
import { formatCountdown, needsManualAmount } from '@/utils/paymentUtils';
import { BufPayService } from '@/services/bufpayService';

interface PaymentQRCodeProps {
  paymentInfo: PaymentResponse;
  orderId: string;
  onPaymentSuccess?: () => void;
  onPaymentTimeout?: () => void;
  onPaymentError?: (error: string) => void;
}

export const PaymentQRCode: React.FC<any> = ({ paymentInfo,
  orderId,
  onPaymentSuccess,
  onPaymentTimeout,
  onPaymentError }) => {
  const { t } = useTranslation(); const [timeLeft, setTimeLeft] = useState(paymentInfo.expires_in || 900); // 默认15分钟
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
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onPaymentTimeout]);

  // 监听iframe内部消息（用于支付成功通知）
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 只接受来自BufPay域名的消息
      if (event.origin !== 'https://bufpay.com' && 
          !event.origin.includes('bufpay')) {
        return;
      }

      console.log('收到BufPay iframemessage:', event.data);

      // 处理支付成功消息
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'payment_success' || 
            event.data.status === 'success' ||
            event.data.status === 'payed') {
          console.log('🎉 iframenotification支付success:', event.data);
          setPaymentStatus('success');
          setIsPolling(false);
          setTimeout(() => {
            onPaymentSuccess?.();
          }, 500);
        } else if (event.data.type === 'payment_failed' || 
                   event.data.status === 'failed') {
          console.log('❌ iframenotification支付failed:', event.data);
          setPaymentStatus('failed');
          setErrorMessage(event.data.message || t('components.errors.支付失败'));
          setIsPolling(false);
          onPaymentError?.(event.data.message || t('components.errors.支付失败'));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onPaymentSuccess, onPaymentError]);

  // 轮询支付状态 - 改为查询我们自己的订单状态
  useEffect(() => {
    if (!isPolling || !orderId) return;

    const pollPaymentStatus = async () => {
      try {
        // 查询我们自己数据库中的订单状态，而不是直接查询BufPay
        const orderStatus = await BufPayService.checkOrderStatus(orderId);
        
        if (orderStatus.isPaid) {
          console.log('🎉 支付success - 订单completed:', orderId);
          setPaymentStatus('success');
          setIsPolling(false);

          // 🔧 FIX: 触发全局支付成功事件
          window.dispatchEvent(new CustomEvent('paymentSuccess', {
            detail: {
              orderId,
              timestamp: Date.now()
            }
          }));

          setTimeout(() => {
            onPaymentSuccess?.();
          }, 500);
          return;
        }

        // 如果有真实aoid，也可以尝试查询BufPay状态作为补充
        if (paymentInfo.aoid && !paymentInfo.aoid.startsWith('bufpay_WP')) {
          const status = await BufPayService.queryBufPayStatus(paymentInfo.aoid);

          // 根据BufPay文档处理所有支付状态
          switch (status) {
            case 'success':
              // 订单已支付已经回调成功
              console.log('🎉 支付successdetecting到 (alreadycallback):', status);
              setPaymentStatus('success');
              setIsPolling(false);
              setTimeout(() => {
                onPaymentSuccess?.();
              }, 500);
              break;
              
            case 'payed':
              // 订单已支付未回调 - 继续轮询直到回调成功
              console.log('💰 already支付但notcallback:', status);
              // 继续轮询，等待回调完成
              break;
              
            case 'new':
              // 新订单 - 继续等待支付
              console.log('🔄 订单waiting支付middle:', status);
              break;
              
            case 'expire':
              // 订单已过期
              console.log('⏰ 支付timeout:', status);
              setPaymentStatus('timeout');
              setIsPolling(false);
              onPaymentTimeout?.();
              break;
              
            case 'fee_error':
              // 账户余额不足扣除手续费失败，订单未回调
              console.log('💸 手续费扣除failed:', status);
              setPaymentStatus('failed');
              setErrorMessage('支付平台手续费扣除失败，请联系客服');
              setIsPolling(false);
              onPaymentError?.('支付平台手续费扣除失败，请联系客服');
              break;
              
            case 'not_exist':
              // 订单不存在 - 这种情况下继续依赖我们的数据库查询
              console.warn('⚠️ BufPay querying订单not exists，resuming依赖databasestate');
              break;
              
            default:
              console.log('🔄 not知state，resuming轮询:', status);
              break;
          }
        }
      } catch (error) {
        console.error('querying支付statefailed:', error);
      }
    };

    // 每3秒查询一次，提高支付成功检测敏感度
    const interval = setInterval(pollPaymentStatus, 3000);

    return () => clearInterval(interval);
  }, [isPolling, orderId, paymentInfo.aoid, onPaymentSuccess, onPaymentTimeout]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleFeedback = () => {
    window.open(paymentInfo.feedback_url, '_blank');
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="max-w-md mx-auto bg-card border">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-success text-2xl font-bold">🎉 支付成功！</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-4xl">✅</div>
          </div>
          <div className="space-y-2">
            <p className="text-green-700 font-semibold text-lg">
              订单支付完成！
            </p>
            <p className="text-success text-sm">
              您的权限正在开通中，请稍候...
            </p>
          </div>
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-3">
              页面将在几秒后自动跳转到结果页面
            </p>
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full bg-success hover:bg-green-700"
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
      <Card className="max-w-md mx-auto border-orange-200 bg-orange-50/50">
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
            <Button onClick={handleRefresh} variant="warning" className="w-full">
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
      <Card className="max-w-md mx-auto border-red-200 bg-red-50/50">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive">支付失败</CardTitle>
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
              <p className="text-destructive text-sm">
                {errorMessage}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Button onClick={handleRefresh} variant="destructive" className="w-full">
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
    <Card className="max-w-md mx-auto">
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
          {paymentInfo.qr_img ? (
            // 优先使用二维码图片，便于统一样式和间距控制
            <div className="flex flex-col items-center">
              <div className="text-sm text-muted-foreground mb-2">
                请使用{paymentInfo.pay_type === 'alipay' ? '支付宝' : '微信'}扫码支付
              </div>
              <img
                src={paymentInfo.qr_img}
                alt="支付二维码"
                className="w-64 h-64 border rounded-lg"
              />
            </div>
          ) : paymentInfo.htmlContent ? (
            // 兜底：BufPay HTML 支付页面
            <div className="w-full border rounded-lg overflow-hidden">
              <iframe
                srcDoc={paymentInfo.htmlContent}
                className="w-full h-96 border-0"
                title="BufPay支付页面"
                sandbox="allow-scripts allow-forms allow-popups allow-top-navigation"
                onError={() => {
                  console.log('🔇 ignore iframe loading error');
                }}
                onLoad={(e) => {
                  const iframe = e.target as HTMLIFrameElement;
                  try {
                    iframe.contentWindow?.postMessage({ type: 'parent_ready', orderId }, '*');
                  } catch {}
                }}
              />
            </div>
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
