import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';
import { SubscriptionPlan, SubscriptionPeriod } from '@/types/subscription';
import AlipayQRCode from '@/components/payment/AlipayQRCode';
import { EnhancedPaymentStatusMonitor } from '@/components/payment/EnhancedPaymentStatusMonitor';
import { PaymentSuccessHandler } from '@/components/payment/PaymentSuccessHandler';
import { PaymentStatusRecovery } from '@/components/payment/PaymentStatusRecovery';
import { PageNavigation } from '@/components/layout/PageNavigation';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Star,
  Crown,
  Zap,
  Percent,
  Home,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import {
  getPaymentCenterAccessTime,
  isInPromoPeriod,
  calculateRemainingTime,
  formatTimeLeft as formatTimeLeftUtil
} from "@/utils/paymentTimer";
import { paymentStatusService } from '@/services/paymentStatusService';
import { creemOptimizer } from '@/utils/creemOptimizer';

const CreemAlipayQRCode: React.FC<{ 
  priceId: string;
  planName: string;
  price: number;
}> = ({
  priceId,
  planName,
  price,
}) => {
  return (
    <AlipayQRCode 
      priceId={priceId}
      title={`${planName} - 扫码支付`}
      showPrice={true}
    />
  );
};

function getCreemPriceId(plan: SubscriptionPlan, period: SubscriptionPeriod): string {
  if (plan.tier === "pro" && period === "monthly") return "prod_3nJOuQeVStqkp6JaDcrKHf";
  if (plan.tier === "pro" && period === "yearly") return "prod_5qBlDTLpD3h9gvOZFd4Rgu";
  if (plan.tier === "premium" && period === "monthly") return "prod_4HYBfvrcbXYnbxjlswMj28";
  if (plan.tier === "premium" && period === "yearly") return "prod_6OfIoVnRg2pXsuYceVKOYk";
  return "";
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated: currentIsAuthenticated } = useUnifiedAuth();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>('monthly');
  const [showQRCode, setShowQRCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const paymentInfoRef = useRef<HTMLDivElement>(null);

  // 支付状态管理
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'paid' | 'failed'>('idle');
  const [currentCheckout, setCurrentCheckout] = useState<any>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // 倒计时效果（包含毫秒）
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) return;

    const updateTimer = () => {
      const remainingMs = calculateRemainingTime(currentUser.id);
      setTimeLeftMs(remainingMs);
      setTimeLeft(Math.floor(remainingMs / 1000)); // 保持秒数用于其他逻辑
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100); // 100ms更新一次以显示毫秒

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // 支付状态恢复
  useEffect(() => {
    const activePayments = paymentStatusService.getActivePaymentStatuses();
    if (activePayments.length > 0) {
      setShowRecovery(true);
    }
  }, []);

  // 页面访问时记录时间（用于限时优惠）
  useEffect(() => {
    if (currentUser?.id) {
      // 获取或创建支付中心访问时间
      const accessTime = getPaymentCenterAccessTime(currentUser.id);
      console.log('支付中心访问时间:', accessTime?.toLocaleString());

      // 立即更新倒计时
      const remainingMs = calculateRemainingTime(currentUser.id);
      const remainingSeconds = Math.floor(remainingMs / 1000);
      setTimeLeft(remainingSeconds);

      console.log('剩余优惠时间:', remainingSeconds, '秒');
    }
  }, [currentUser?.id]);

  // 处理计划选择
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowQRCode(false);
  };

  // 处理支付
  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      setIsCreatingCheckout(true);
      setCheckoutError(null);

      // 创建支付订单
      const priceId = getCreemPriceId(selectedPlan, selectedPeriod);
      if (!priceId) {
        throw new Error('无效的套餐配置');
      }

      const apiKey = import.meta.env.VITE_CREEM_API_KEY;
      if (!apiKey) {
        throw new Error('支付配置错误');
      }

      const checkout = await creemOptimizer.smartCreateCheckout(priceId, apiKey);

      setCurrentCheckout(checkout);
      setPaymentStatus('pending');
      setShowQRCode(true);

      // 保存支付状态
      paymentStatusService.savePaymentStatus(checkout.id, {
        status: 'pending',
        message: '等待支付...',
        progress: 0,
        amount: checkout.amount,
        currency: checkout.currency,
        checkoutId: checkout.id,
      });

      setTimeout(() => {
        paymentInfoRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

      toast({
        title: "支付订单已创建",
        description: "请使用支付宝扫码完成支付",
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      setCheckoutError(error.message || '创建支付订单失败');
      toast({
        title: "支付失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  // 获取当前价格
  const getCurrentPrice = () => {
    if (!selectedPlan) return 0;
    
    const pricing = selectedPeriod === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly;
    const originalPrice = pricing.originalPrice;
    
    const isInDiscount = isInPromoPeriod(currentUser?.id) && timeLeft > 0;
    
    return isInDiscount ? (pricing.discountPrice || originalPrice) : originalPrice;
  };

  // 获取原价
  const getOriginalPrice = () => {
    if (!selectedPlan) return 0;
    
    const pricing = selectedPeriod === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly;
    return pricing.originalPrice;
  };

  // 获取节省金额
  const getSavedAmount = () => {
    const originalPrice = getOriginalPrice();
    const currentPrice = getCurrentPrice();
    return originalPrice - currentPrice;
  };

  // 获取年付节省金额（相比月付）
  const getYearlySavings = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.monthly.originalPrice * 12;
    const yearlyPrice = plan.yearly.originalPrice;
    return monthlyTotal - yearlyPrice;
  };

  // 处理支付成功
  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentStatus('paid');
    setCurrentCheckout(paymentData);

    // 更新支付状态
    paymentStatusService.savePaymentStatus(paymentData.id, {
      status: 'paid',
      message: '支付成功！',
      progress: 100,
      amount: paymentData.amount,
      currency: paymentData.currency,
      paidAt: new Date().toISOString(),
    });

    toast({
      title: "支付成功！",
      description: "正在为您升级会员...",
      duration: 3000,
    });
  };

  // 处理支付失败
  const handlePaymentFailed = (error: string) => {
    setPaymentStatus('failed');

    if (currentCheckout) {
      paymentStatusService.savePaymentStatus(currentCheckout.id, {
        status: 'failed',
        message: error,
        progress: 0,
        error: error,
      });
    }

    toast({
      title: "支付失败",
      description: error,
      variant: "destructive",
    });
  };

  // 处理支付过期
  const handlePaymentExpired = () => {
    if (currentCheckout) {
      paymentStatusService.savePaymentStatus(currentCheckout.id, {
        status: 'expired',
        message: '支付已过期',
        progress: 0,
      });
    }

    toast({
      title: "支付已过期",
      description: "请重新创建支付订单",
      variant: "destructive",
    });
  };

  // 如果支付成功，显示成功处理页面
  if (paymentStatus === 'paid' && currentCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="container mx-auto max-w-4xl">
          <PaymentSuccessHandler
            paymentData={currentCheckout}
            onComplete={() => navigate('/profile')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 页面导航 */}
      <PageNavigation
        currentPath="/payment"
        title="订阅中心"
        description="选择适合您的订阅计划，解锁更多强大功能"
        showAdaptButton={false}
        showUpgradeButton={false}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 支付状态恢复 */}
        {showRecovery && (
          <div className="mb-8">
            <PaymentStatusRecovery
              onRecoveryComplete={() => {
                setShowRecovery(false);
                navigate('/profile');
              }}
              onNoActivePayments={() => setShowRecovery(false)}
            />
          </div>
        )}

        {/* 订阅周期切换 - 优化版本 */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-gray-200 max-w-4xl">
            {/* 按月订阅 */}
            <Button
              onClick={() => setSelectedPeriod('monthly')}
              style={{
                background: selectedPeriod === 'monthly' ? "#2563eb" : "#f3f4f6",
                color: selectedPeriod === 'monthly' ? "white" : "#374151",
                border: selectedPeriod === 'monthly' ? "none" : "1px solid #d1d5db",
                padding: "14px 28px",
                fontWeight: "600",
                fontSize: "16px",
                transition: "all 0.3s ease",
                borderRadius: "12px",
                minWidth: "120px"
              }}
            >
              按月订阅
            </Button>

            {/* 切换按钮 - 使用 Switch 组件 */}
            <Switch
              checked={selectedPeriod === "yearly"}
              onCheckedChange={(checked) => setSelectedPeriod(checked ? "yearly" : "monthly")}
              className="mx-4"
            />

            {/* 按年订阅 */}
            <div className="relative">
              {/* 推荐标签 */}
              <div className="absolute -top-4 -right-3 z-20">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl px-3 py-1 text-xs font-bold rounded-full border-2 border-white animate-bounce">
                  💰 省钱
                </Badge>
              </div>

              <Button
                onClick={() => setSelectedPeriod('yearly')}
                style={{
                  background: selectedPeriod === 'yearly'
                    ? "linear-gradient(to right, #f97316, #ef4444, #ec4899)"
                    : "linear-gradient(to right, #fbbf24, #f97316, #ef4444)",
                  color: "white",
                  border: selectedPeriod === 'yearly' ? "none" : "2px solid #f59e0b",
                  boxShadow: selectedPeriod === 'yearly'
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                    : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transform: selectedPeriod === 'yearly' ? "scale(1.05)" : "scale(1.02)",
                  padding: "14px 28px",
                  fontWeight: "600",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "12px",
                  minWidth: "140px"
                }}
              >
                <span className="relative z-10 drop-shadow-sm">
                  按年订阅 <span className="text-xs ml-1 font-extrabold text-yellow-200">(立省40%)</span>
                </span>
                {selectedPeriod === 'yearly' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse"></div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 限时优惠倒计时 */}
        {currentUser?.id && isInPromoPeriod(currentUser.id) && timeLeft > 0 && (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-6 rounded-2xl shadow-xl max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">限时优惠进行中</span>
              </div>

              {/* 突出显示的倒计时（包含毫秒） */}
              <div className="text-4xl md:text-5xl font-mono font-black tracking-wider mb-3">
                <span className="inline-block min-w-[2ch]">{Math.floor(timeLeftMs / 3600000).toString().padStart(2, '0')}</span>
                <span className="text-2xl md:text-3xl mx-1 opacity-80">:</span>
                <span className="inline-block min-w-[2ch]">{Math.floor((timeLeftMs % 3600000) / 60000).toString().padStart(2, '0')}</span>
                <span className="text-2xl md:text-3xl mx-1 opacity-80">:</span>
                <span className="inline-block min-w-[2ch]">{Math.floor((timeLeftMs % 60000) / 1000).toString().padStart(2, '0')}</span>
                <span className="text-2xl md:text-3xl mx-1 opacity-80">.</span>
                <span className="inline-block min-w-[3ch] text-3xl md:text-4xl">{Math.floor((timeLeftMs % 1000) / 10).toString().padStart(2, '0')}</span>
              </div>

              <div className="text-xs opacity-90">优惠即将结束，立即享受特价！</div>
            </div>
          </div>
        )}

        {/* 订阅计划选择 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 max-w-6xl mx-auto pt-6">
          {SUBSCRIPTION_PLANS?.map((plan, index) => {
            const pricing = selectedPeriod === 'monthly' ? plan.monthly : plan.yearly;
            const originalPrice = pricing.originalPrice;
            const isInDiscount = isInPromoPeriod(currentUser?.id) && timeLeft > 0;
            const currentPrice = plan.tier === 'trial' ? 0 : (isInDiscount ? pricing.discountPrice || originalPrice : originalPrice);
            const savedAmount = isInDiscount ? (originalPrice - currentPrice) : 0;
            const isSelected = selectedPlan?.id === plan.id;
            const yearlySavings = getYearlySavings(plan);

            return (
              <div key={plan.id} className="relative pt-4">
                <Card
                  className={`cursor-pointer transition-all duration-300 relative group w-full flex flex-col rounded-lg min-h-[600px] ${
                    isSelected
                      ? 'border-primary shadow-lg scale-105 bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:shadow-md hover:scale-102'
                  }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {/* 标签容器 */}
                  <div className="absolute top-3 left-0 right-0 z-20">
                    <div className="flex justify-between items-start px-4">
                      {/* 左侧标签组 */}
                      <div className="flex flex-wrap gap-1">
                        {/* 推荐标签 */}
                        {plan.recommended && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl px-3 py-1 text-xs font-bold rounded-full border border-white flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            推荐
                          </Badge>
                        )}

                        {/* 高级版标签 */}
                        {plan.premiumLabel && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl px-3 py-1 text-xs font-bold rounded-full border border-white flex items-center gap-1">
                            <Crown className="h-3 w-3 fill-current" />
                            {selectedPeriod === 'yearly' ? '更省' : '全部功能'}
                          </Badge>
                        )}


                      </div>

                      {/* 右侧标签组 */}
                      <div className="flex flex-wrap gap-1">
                        {/* 限时优惠标签 */}
                        {isInDiscount && timeLeft > 0 && plan.tier !== 'trial' && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg px-3 py-1 text-xs animate-pulse rounded-full border border-white flex items-center gap-1">
                            <Zap className="h-3 w-3 fill-current" />
                            限时
                          </Badge>
                        )}

                        {/* 年付优惠标签 */}
                        {selectedPeriod === 'yearly' && (plan.tier === 'pro' || plan.tier === 'premium') && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg px-3 py-1 text-xs rounded-full border border-white">
                            比月付省¥{getYearlySavings(plan)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardHeader className="text-center pb-2 pt-4">
                    <CardTitle className="text-2xl md:text-3xl font-bold mb-1 h-10 flex items-center justify-center">
                      <div className="flex items-center justify-center gap-3">
                        {plan.tier === 'premium' && <Crown className="h-6 w-6 text-yellow-500" />}
                        <span className="text-gray-900">{plan.name}</span>
                      </div>
                    </CardTitle>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed h-8 flex items-center justify-center">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-3 pb-3 px-4">
                    <div className="text-center pricing-container min-h-[80px] flex flex-col justify-center">
                      <div className="space-y-3">
                        <div className="text-4xl md:text-5xl font-bold text-gray-900">
                          <span className="text-2xl md:text-3xl align-top">¥</span>{currentPrice}
                        </div>
                        {isInDiscount && timeLeft > 0 && plan.tier !== 'trial' && (
                          <>
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                              <Zap className="h-4 w-4" />
                              限时特惠 省¥{savedAmount.toFixed(2)}
                            </div>
                            <div className="text-lg text-gray-500 line-through">原价 ¥{originalPrice}</div>
                          </>
                        )}
                        <div className="text-lg text-gray-600 font-medium">
                          /{selectedPeriod === 'monthly' ? '月' : '年'}
                        </div>

                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5 mt-3 min-h-[280px]">
                      {plan.features.map((feature, index) => {
                        // 解析功能标记
                        let featureText = feature;
                        let badgeType = null;

                        if (feature.includes('|new')) {
                          featureText = feature.replace('|new', '');
                          badgeType = 'new';
                        } else if (feature.includes('|up')) {
                          featureText = feature.replace('|up', '');
                          badgeType = 'up';
                        }

                        return (
                          <div key={index} className="flex items-start gap-2 text-sm md:text-base">
                            <div className="mt-0.5">
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            </div>
                            <span className="text-gray-700 leading-relaxed flex items-center gap-2">
                              {featureText}
                              {badgeType === 'new' && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                                  NEW
                                </Badge>
                              )}
                              {badgeType === 'up' && (
                                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  UP
                                </Badge>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6">
                      <Button
                        variant={plan.recommended ? "gradient" : "default"}
                        size="lg"
                        className={`w-full font-semibold transition-all duration-300 ${
                          plan.recommended
                            ? 'shadow-lg hover:shadow-xl hover:-translate-y-1'
                            : 'shadow-md hover:shadow-lg hover:-translate-y-0.5'
                        } ${
                          plan.tier === 'trial'
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-0'
                            : ''
                        }`}
                        disabled={plan.tier === 'trial'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlanSelect(plan);
                        }}
                      >
                        {plan.tier === 'trial' ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            当前版本
                          </>
                        ) : isSelected ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            已选择
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            选择此计划
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* 支付信息和二维码 */}
        <div ref={paymentInfoRef} className="space-y-6 max-w-4xl mx-auto">
          {/* 支付按钮 */}
          {selectedPlan && selectedPlan.tier !== 'trial' && !showQRCode && (
            <Card className="border border-border bg-card shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">支付信息</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">¥{getCurrentPrice()}</div>
                    <div className="text-sm text-muted-foreground font-medium">{selectedPeriod === 'monthly' ? '月付' : '年付'}</div>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-muted/30 border border-border rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-foreground">{selectedPlan.name}</span>
                      <span className="text-sm text-muted-foreground ml-3">{selectedPlan.description}</span>
                    </div>
                  </div>
                </div>

                {/* 优惠信息行 */}
                {(isInPromoPeriod(currentUser?.id) && timeLeft > 0) || selectedPeriod === 'yearly' ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {isInPromoPeriod(currentUser?.id) && timeLeft > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        限时优惠中，节省 ¥{getSavedAmount().toFixed(2)}
                      </span>
                    )}
                    {selectedPeriod === 'yearly' && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        年付优惠，比月付省 ¥{getYearlySavings(selectedPlan)}
                      </span>
                    )}
                  </div>
                ) : null}

                <Button
                  onClick={handlePayment}
                  disabled={isCreatingCheckout}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xl font-bold py-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50"
                >
                  {isCreatingCheckout ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      创建订单中...
                    </div>
                  ) : (
                    `立即支付 ¥${getCurrentPrice()}`
                  )}
                </Button>

                {/* 支付错误提示 */}
                {checkoutError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">支付订单创建失败</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{checkoutError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCheckoutError(null)}
                      className="mt-2"
                    >
                      重试
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 支付二维码 */}
          {showQRCode && selectedPlan && selectedPlan.tier !== 'trial' && (
            <Card className="border border-green-200 bg-green-50/50 shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg font-bold">支</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">支付宝扫码支付</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">¥{getCurrentPrice()}</div>
                    <div className="text-sm text-muted-foreground font-medium">{selectedPeriod === 'monthly' ? '月付' : '年付'}</div>
                  </div>
                </div>

                {/* 优惠信息行 */}
                {(isInPromoPeriod(currentUser?.id) && timeLeft > 0) || selectedPeriod === 'yearly' ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {isInPromoPeriod(currentUser?.id) && timeLeft > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        限时优惠中
                      </span>
                    )}
                    {selectedPeriod === 'yearly' && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        年付优惠
                      </span>
                    )}
                  </div>
                ) : null}

                <div className="flex justify-center items-center py-6 bg-white rounded-xl border-2 border-green-100 shadow-sm">
                  {(() => {
                    const pid = getCreemPriceId(selectedPlan, selectedPeriod);
                    return pid ? (
                      <CreemAlipayQRCode
                        priceId={pid}
                        planName={selectedPlan.name}
                        price={getCurrentPrice()}
                      />
                    ) : (
                      <div className="text-red-600 font-semibold">请先选择有效的套餐和周期</div>
                    );
                  })()}
                </div>

                <div className="text-center text-muted-foreground text-lg font-medium mt-4">
                  📱 请使用支付宝App扫码完成支付
                </div>
              </CardContent>
            </Card>
          )}

          {/* 支付状态监控 */}
          {currentCheckout && paymentStatus === 'pending' && (
            <div className="mt-6">
              <EnhancedPaymentStatusMonitor
                checkoutId={currentCheckout.id}
                apiKey={import.meta.env.VITE_CREEM_API_KEY || ''}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
                onPaymentExpired={handlePaymentExpired}
                autoRefresh={true}
                refreshInterval={3000}
                maxRetries={10}
                enableNotifications={true}
                enableSound={true}
                showAdvancedInfo={false}
              />
            </div>
          )}

          {/* 支付帮助和说明 */}
          <div className="mt-12 space-y-6 max-w-4xl mx-auto">
            {/* 支付安全保障 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">安全支付</h3>
                <p className="text-sm text-gray-600">采用银行级加密技术，保障您的支付安全</p>
              </div>

              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">即时生效</h3>
                <p className="text-sm text-muted-foreground">支付成功后立即升级，无需等待</p>
              </div>

              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">会员特权</h3>
                <p className="text-sm text-muted-foreground">解锁全部功能，享受专属服务</p>
              </div>
            </div>

            {/* 支付说明 */}
            <div className="bg-muted/30 p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-900 font-semibold mb-3 text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    支付流程
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      选择订阅计划和付费周期
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      点击"立即支付"生成二维码
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      使用支付宝扫码完成支付
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                      自动升级会员，立即享受服务
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-gray-900 font-semibold mb-3 text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    注意事项
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 支付二维码有效期为30分钟</li>
                    <li>• 支付成功后会自动升级会员</li>
                    <li>• 订阅会在期满后自动续费</li>
                    <li>• 您可以随时在个人中心取消订阅</li>
                    <li>• 如有问题请联系客服支持</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm leading-relaxed text-gray-600">
                  点击立即支付即表示您同意我们的
                  <a href="/terms" className="text-blue-600 hover:text-blue-800 hover:underline mx-1 font-medium">服务条款</a>
                  和
                  <a href="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline mx-1 font-medium">隐私政策</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ FIXED: JSX语法错误已修复，背景颜色优化已完成
