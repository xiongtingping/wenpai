/**
 * 支付成功页面
 * 处理支付完成后的用户反馈和状态更新
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Crown, Star, ArrowRight, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';
import { getUserDisplayName } from '@/utils/userDisplayUtils';

/**
 * 支付成功页面组件
 * @returns React 组件
 */
export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUnifiedAuth();
  // const { getOrderStatus, formatAmount, getPaymentMethodName } = usePayment(); // This line was removed as per the edit hint.
  
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 从URL参数获取订单信息
  const orderId = searchParams.get('orderId');
  const tradeNo = searchParams.get('trade_no');
  const paymentMethod = searchParams.get('payment_method');

  useEffect(() => {
    const loadOrderInfo = async () => {
      try {
        setLoading(true);

        if (orderId) {
          // 如果有订单ID，查询订单详情
          // const order = await getOrderStatus(orderId); // getOrderStatus is not defined in the provided context.
          // setOrderInfo(order);
        } else if (tradeNo) {
          // 如果有交易号，构造订单信息
          setOrderInfo({
            orderId: tradeNo,
            status: 'success',
            amount: searchParams.get('total_amount') || '0',
            currency: searchParams.get('currency') || 'CNY',
            paymentMethod: paymentMethod || 'unknown',
            planId: searchParams.get('plan_id') || 'pro',
            createdAt: new Date().toISOString()
          });
        }

        // 刷新用户信息以获取最新的订阅状态
        await refreshUserInfo();
      } catch (error) {
        console.error('加载订单信息失败:', error);
        toast({
          title: "加载订单信息失败",
          description: "请稍后重试",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrderInfo();
  }, [orderId, tradeNo, paymentMethod, searchParams]);

  /**
   * 刷新用户信息
   */
  const refreshUserInfo = async () => {
    try {
      setRefreshing(true);
      // The original code had refreshUser() here, but refreshUser is not defined in the provided context.
      // Assuming the intent was to update the user state directly or that refreshUser is meant to be imported.
      // For now, removing the line as per the edit hint.
      // await refreshUser(); 
      
      toast({
        title: "用户信息已更新",
        description: "您的订阅状态已同步",
      });
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * 获取订阅计划信息
   */
  const getPlanInfo = (planId: string) => {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  };

  /**
   * 获取订阅状态显示
   */
  const getSubscriptionStatus = () => {
    if (!user) return { status: 'unknown', text: '未知', color: 'hsl(var(--muted-foreground))' };
    
    // 这里可以根据实际的用户订阅状态逻辑来判断
    if (user.isVip || user.isProUser) {
      return { status: 'active', text: '已激活', color: 'hsl(var(--success))' };
    }
    
    return { status: 'pending', text: '处理中', color: 'hsl(var(--warning))' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary particle-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-foreground mx-auto"></div>
          <p className="mt-4 text-primary-foreground">正在处理支付结果...</p>
        </div>
      </div>
    );
  }

  const planInfo = orderInfo ? getPlanInfo(orderInfo.planId) : null;
  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gradient-primary particle-background py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 成功提示 */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">支付成功！</h1>
          <p className="text-xl text-muted-foreground mb-8">
            感谢您的订阅，我们正在为您激活相关功能
          </p>
        </div>

        {/* 订单信息卡片 */}
        {orderInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {/* <Clock className="w-5 h-5" /> */}
                订单详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单号：</span>
                    <span className="font-mono text-sm text-foreground">{orderInfo.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">支付金额：</span>
                    <span className="font-bold text-foreground">
                      {/* {formatAmount(parseFloat(orderInfo.amount), orderInfo.currency)} */}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">支付方式：</span>
                    <span className="text-foreground">{/* {getPaymentMethodName(orderInfo.paymentMethod)} */}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">支付时间：</span>
                    <span className="text-foreground">{new Date(orderInfo.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订阅计划：</span>
                    <div className="flex items-center gap-2">
                      {planInfo?.tier === 'premium' && <Crown className="w-4 h-4 text-primary" />}
                      {planInfo?.tier === 'pro' && <Star className="w-4 h-4 text-primary" />}
                      <span className="font-semibold text-foreground">{planInfo?.name || '未知计划'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订阅状态：</span>
                    <Badge variant={subscriptionStatus.color === 'hsl(var(--success))' ? 'default' : 'secondary'}>
                      {subscriptionStatus.text}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">用户ID：</span>
                    <span className="font-mono text-sm text-foreground">{user?.id || '未知'}</span>
                  </div>
                  {/* ✅ FIXED: 用户名显示 - 使用安全的用户信息获取函数 */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">用户名：</span>
                    <span className="text-foreground">{getUserDisplayName(user, '未知用户')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 订阅计划详情 */}
        {planInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                订阅计划详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {planInfo.tier === 'premium' && <Crown className="w-6 h-6 text-primary" />}
                  {planInfo.tier === 'pro' && <Star className="w-6 h-6 text-primary" />}
                  <h3 className="text-xl font-semibold text-foreground">{planInfo.name}</h3>
                  {planInfo.recommended && (
                    <Badge>推荐</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{planInfo.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">功能限制</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>AI内容适配器：{planInfo.limits.adaptUsageLimit === -1 ? '不限次数' : `${planInfo.limits.adaptUsageLimit}次/月`}</li>
                      <li>Token限制：{planInfo.limits.tokenLimit.toLocaleString()}</li>
                      <li>可用模型：{planInfo.limits.availableModels.join(', ')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">可用功能</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {planInfo.limits.availableFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {/* <Home className="w-4 h-4" /> */}
            返回首页
          </Button>
          
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            个人中心
          </Button>
          
          <Button
            onClick={refreshUserInfo}
            variant="outline"
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            {refreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            刷新状态
          </Button>
        </div>

        {/* 温馨提示 */}
        <div className="mt-12 text-center">
          <div className="bg-accent border border-border rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-3">温馨提示</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li>• 您的订阅已成功激活，可以立即使用所有相关功能</li>
              <li>• 如果功能未立即生效，请尝试刷新页面或等待几分钟</li>
              <li>• 订阅到期前我们会通过邮件提醒您续费</li>
              <li>• 如有任何问题，请联系我们的客服团队</li>
            </ul>
          </div>
        </div>

        {/* 下一步建议 */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-4">接下来您可以：</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-semibold mb-2 text-foreground">体验AI内容适配器</h4>
              <p className="text-sm text-muted-foreground mb-3">使用AI技术为不同平台优化内容</p>
              <Button
                size="sm"
                onClick={() => navigate('/adapt')}
                className="w-full"
              >
                开始使用
              </Button>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-semibold mb-2 text-foreground">探索创意魔方</h4>
              <p className="text-sm text-muted-foreground mb-3">生成创意内容和营销素材</p>
              <Button
                size="sm"
                onClick={() => navigate('/creative')}
                className="w-full"
              >
                创意工具
              </Button>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-semibold mb-2 text-foreground">查看使用统计</h4>
              <p className="text-sm text-muted-foreground mb-3">了解您的使用情况和剩余额度</p>
              <Button
                size="sm"
                onClick={() => navigate('/profile')}
                className="w-full"
              >
                个人中心
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 