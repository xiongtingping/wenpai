/**
 * 标准支付结果页面
 * 基于标准支付流程：查询数据库获取订单状态
 * 不依赖前端状态，完全基于服务器端数据
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StandardOrderService, type StandardOrder } from '@/services/standardOrderService';
import { logger } from '@/utils/logger';

export function StandardPaymentResultPage() { const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser  } = useAuth() as any;
  
  const [order, setOrder] = useState<StandardOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setError(t('pages.errors.缺少订单号'));
      setLoading(false);
      return;
    }

    checkOrderStatus();
  }, [orderId]);

  const checkOrderStatus = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await StandardOrderService.checkPaymentStatus(orderId);
      
      if (!result.order) {
        setError(t('pages.errors.订单不存在'));
        return;
      }

      setOrder(result.order);

      // 如果订单还在处理中，开始轮询
      if (result.order.status === 'pending') {
        startPolling();
      } else if (result.order.status === 'paid') {
        // 支付成功，刷新用户状态
        await handlePaymentSuccess();
      }
    } catch (error) {
      logger.error('检查订单状态失败:', error);
      setError(error instanceof Error ? error.message : t('pages.errors.查询订单失败'));
    } finally {
      setLoading(false);
    }
  };

  const startPolling = async () => {
    if (!orderId || polling) return;

    try {
      setPolling(true);
      logger.info('开始轮询订单状态:', orderId);

      // 轮询最多60秒，每2秒查询一次
      const updatedOrder = await StandardOrderService.pollOrderStatus(orderId, 30, 2000);
      
      setOrder(updatedOrder);

      if (updatedOrder.status === 'paid') {
        await handlePaymentSuccess();
      }
    } catch (error) {
      logger.error('轮询订单状态失败:', error);
      setError('查询支付状态超时，请手动刷新页面');
    } finally {
      setPolling(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // 刷新用户状态以获取最新的订阅信息
      if (user && refreshUser) {
        await refreshUser();
        logger.info(t('pages.messages.支付成功后用户状态刷新完成'));
      }
    } catch (error) {
      logger.warn('刷新用户状态失败:', error);
    }
  };

  const getStatusInfo = () => {
    if (!order) return null;

    switch (order.status) {
      case 'paid':
        return {
          icon: <CheckCircle className="h-16 w-16 text-success" />,
          title: t('pages.labels.支付成功'),
          description: '您的订阅已激活，可以开始使用高级功能了！',
          color: 'text-success',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'failed':
        return {
          icon: <XCircle className="h-16 w-16 text-destructive" />,
          title: t('pages.labels.支付失败'),
          description: '支付过程中出现问题，请重试或联系客服',
          color: 'text-destructive',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'pending':
        return {
          icon: polling ? 
            <Loader2 className="h-16 w-16 text-primary animate-spin" /> :
            <Clock className="h-16 w-16 text-primary" />,
          title: t('pages.labels.支付处理中'),
          description: polling ? '正在确认支付状态，请稍候...' : '支付正在处理中，请稍候',
          color: 'text-primary',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'cancelled':
        return {
          icon: <XCircle className="h-16 w-16 text-muted-foreground" />,
          title: t('pages.labels.订单已取消'),
          description: '订单已被取消，如有疑问请联系客服',
          color: 'text-muted-foreground',
          bgColor: 'bg-gray-50',
          borderColor: 'border-border'
        };
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-warning" />,
          title: t('pages.labels.状态未知'),
          description: '订单状态异常，请联系客服处理',
          color: 'text-warning',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
    }
  };

  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  const formatProductName = (productType: string, durationType: string) => {
    const tierName = productType === 'professional' ? t('pages.messages.专业版') : t('pages.messages.高级版');
    const durationName = durationType === 'yearly' ? t('pages.messages.年付') : t('pages.messages.月付');
    return `${tierName} (${durationName})`;
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">正在查询订单状态...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">查询失败</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={checkOrderStatus} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新查询
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className={`${statusInfo?.borderColor} ${statusInfo?.bgColor}`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {statusInfo?.icon}
            </div>
            <CardTitle className={`text-2xl ${statusInfo?.color}`}>
              {statusInfo?.title}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {statusInfo?.description}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 订单信息 */}
            {order && (
              <div className="bg-background rounded-lg p-4 border">
                <h3 className="font-semibold mb-3">订单详情</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单号：</span>
                    <span className="font-mono">{order.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">商品：</span>
                    <span>{formatProductName(order.product_type, order.duration_type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">金额：</span>
                    <span className="font-semibold">¥{formatAmount(order.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">状态：</span>
                    <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                      {order.status === 'paid' ? t('pages.messages.已支付') : 
                       order.status === 'pending' ? t('pages.messages.处理中') :
                       order.status === 'failed' ? t('pages.messages.失败') : t('pages.messages.已取消')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">创建时间：</span>
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  {order.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">支付时间：</span>
                      <span>{new Date(order.paid_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {order?.status === 'pending' && (
                <Button 
                  onClick={checkOrderStatus} 
                  disabled={polling}
                  className="flex-1"
                >
                  {polling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  刷新状态
                </Button>
              )}
              
              {order?.status === 'paid' && (
                <Button onClick={() => navigate('/')} className="flex-1">
                  开始使用
                </Button>
              )}
              
              {order?.status === 'failed' && (
                <Button onClick={() => navigate('/payment')} className="flex-1">
                  重新支付
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StandardPaymentResultPage;
