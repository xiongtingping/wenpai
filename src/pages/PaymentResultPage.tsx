/**
 * 支付结果页面
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Clock, Home, RefreshCw } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { useAuth } from '@/hooks/useAuth';
import { BufPayService } from '@/services/bufpayService';
import { logger } from '@/utils/logger';
import PaymentDataCleanupService from '@/services/paymentDataCleanupService';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'success' | 'failed' | 'pending'>('checking');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(null);

  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status');

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    // 检查是否需要清理数据
    if (PaymentDataCleanupService.shouldCleanupData()) {
      logger.info('检测到需要清理的数据，执行清理...');
      PaymentDataCleanupService.performCompleteCleanup(user?.id);
    }

    checkPaymentResult();
  }, [orderId, user?.id]);

  const checkPaymentResult = async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      logger.info('检查支付结果:', { orderId });

      // 检查订单状态
      const result = await BufPayService.checkOrderStatus(orderId);

      setOrderInfo(result.order);

      if (result.isPaid) {
        setPaymentStatus('success');
        setSubscriptionInfo(result.subscription);

        // 强制刷新用户信息和页面状态
        if (user && refreshUser) {
          try {
            // 执行完整的数据清理
            PaymentDataCleanupService.performCompleteCleanup(user.id);

            // 等待数据清理完成
            await new Promise(resolve => setTimeout(resolve, 300));

            // 多次尝试刷新用户状态
            let refreshSuccess = false;
            for (let i = 0; i < 3; i++) {
              try {
                await refreshUser();
                refreshSuccess = true;
                logger.info(`支付成功后用户状态刷新完成 (尝试 ${i + 1})`);
                break;
              } catch (error) {
                logger.warn(`用户状态刷新失败 (尝试 ${i + 1}):`, error);
                if (i < 2) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            }

            // 如果刷新成功，额外等待确保状态更新完成
            if (refreshSuccess) {
              await new Promise(resolve => setTimeout(resolve, 500));

              // 触发全局状态更新事件
              window.dispatchEvent(new CustomEvent('userSubscriptionUpdated', {
                detail: {
                  userId: user.id,
                  subscription: result.subscription,
                  timestamp: Date.now()
                }
              }));
            } else {
              // 如果多次刷新都失败，强制重新加载页面
              logger.error('多次刷新用户状态失败，将重新加载页面');
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } catch (refreshError) {
            logger.error('支付成功后状态刷新过程出错:', refreshError);

            // 最后的保险措施：重新加载页面
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }

        logger.info('支付成功:', {
          orderId,
          userId: result.order.user_id,
          subscriptionType: result.subscription?.subscription_type
        });

        // 支付成功后5秒自动跳转首页
        setAutoRedirectCountdown(5);
        
        const countdownInterval = setInterval(() => {
          setAutoRedirectCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              navigate('/', { replace: true });
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // 检查订单状态
        if (result.order.status === 'pending') {
          setPaymentStatus('pending');
        } else if (result.order.status === 'expired') {
          setPaymentStatus('failed');
          setError('订单已过期');
        } else {
          setPaymentStatus('failed');
          setError('支付失败');
        }
      }
    } catch (error) {
      logger.error('检查支付结果失败:', error);
      setPaymentStatus('failed');
      setError(error instanceof Error ? error.message : '查询支付状态失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    checkPaymentResult();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToPricing = () => {
    navigate('/pricing');
  };

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <h3 className="text-lg font-semibold">正在查询支付结果...</h3>
                  <p className="text-muted-foreground">请稍候，正在确认您的支付状态</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* 支付成功 */}
          {paymentStatus === 'success' && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-green-800 dark:text-green-200">支付成功！</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-green-700 dark:text-green-300">
                  恭喜您！订单支付成功，会员权限已开通
                </p>
                
                {orderInfo && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">订单号</span>
                      <span className="font-mono">{orderInfo.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">产品</span>
                      <span>{orderInfo.product_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">金额</span>
                      <span className="font-semibold">¥{orderInfo.amount}</span>
                    </div>
                    {subscriptionInfo && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">到期时间</span>
                        <span>{formatExpiryDate(subscriptionInfo.expires_at)}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-3">
                  {autoRedirectCountdown && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {autoRedirectCountdown} 秒后自动跳转到首页
                    </p>
                  )}
                  <Button onClick={handleGoHome} className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    立即返回首页
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 支付等待中 */}
          {paymentStatus === 'pending' && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-yellow-800 dark:text-yellow-200">等待支付</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-yellow-700 dark:text-yellow-300">
                  订单尚未支付，请完成支付后再次查询
                </p>
                
                {orderInfo && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">订单号</span>
                      <span className="font-mono">{orderInfo.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">产品</span>
                      <span>{orderInfo.product_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">金额</span>
                      <span className="font-semibold">¥{orderInfo.amount}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Button onClick={handleRetry} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新状态
                  </Button>
                  <Button variant="outline" onClick={handleGoToPricing} className="w-full">
                    重新下单
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 支付失败 */}
          {paymentStatus === 'failed' && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-red-800 dark:text-red-200">支付失败</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-red-700 dark:text-red-300">
                  {error || '支付未成功，请重新尝试'}
                </p>
                
                <div className="space-y-2">
                  <Button onClick={handleGoToPricing} className="w-full">
                    重新下单
                  </Button>
                  <Button variant="outline" onClick={handleGoHome} className="w-full">
                    返回首页
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 支付说明 */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground space-y-2">
                <h4 className="font-medium text-foreground mb-3">温馨提示</h4>
                <p>• 支付成功后会员权限会立即生效</p>
                <p>• 如有支付问题，请联系客服：support@wenpai.xyz</p>
                <p>• 支付成功但未到账，请点击支付页面的"支付反馈"按钮</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
