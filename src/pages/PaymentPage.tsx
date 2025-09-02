import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';
import { SubscriptionPlan, SubscriptionPeriod } from '@/types/subscription';
import AlipayQRCode from '@/components/payment/AlipayQRCode';
import { EnhancedPaymentStatusMonitor } from '@/components/payment/EnhancedPaymentStatusMonitor';
import request from '@/api/request';
import { PaymentSuccessHandler } from '@/components/payment/PaymentSuccessHandler';
import { PaymentStatusRecovery } from '@/components/payment/PaymentStatusRecovery';
import { Header } from '@/components/landing/Header';
import { BufPayService } from '@/services/bufpayService';
import { SubscriptionUpgradeService } from '@/services/subscriptionUpgradeService';
import SubscriptionUpgradeDialog from '@/components/subscription/SubscriptionUpgradeDialog';
import { PaymentResponse } from '@/types/payment';
import { PaymentQRCode } from '@/components/payment/PaymentQRCode';
import { logger } from '@/utils/logger';
import { DynamicPricingService, PricingContext } from '@/services/dynamicPricingService';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Star,
  Crown,
  Zap,
  Percent,
  Home,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  getPaymentCenterAccessTime,
  isInPromoPeriod,
  calculateRemainingTime,
  formatTimeLeft as formatTimeLeftUtil,
  shouldShowPromoOffer
} from "@/utils/paymentTimer";
import { paymentStatusService } from '@/services/paymentStatusService';
// 已删除creemOptimizer导入，直接使用Creem API

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
      title={`${planName} - ${t('payment.qrCodeTitle')}`}
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
  const location = useLocation();
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated: currentIsAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { primaryStatus, hasActiveSubscription, refresh: refreshSubscriptionStatus } = useSubscriptionStatus();

  // 获取来源操作（续费/升级）
  const locationState = location.state as { 
    action?: 'renew' | 'upgrade';
    currentSubscription?: any;
  } | null;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>('monthly');
  const [showQRCode, setShowQRCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPromoOffer, setShowPromoOffer] = useState(false);
  const paymentInfoRef = useRef<HTMLDivElement>(null);

  // 支付状态管理
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'paid' | 'failed'>('idle');
  const [currentCheckout, setCurrentCheckout] = useState<any>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // BufPay 支付状态
  const [bufpayPaymentInfo, setBufpayPaymentInfo] = useState<PaymentResponse | null>(null);
  const [bufpayOrderId, setBufpayOrderId] = useState<string | null>(null);

  // 倒计时效果（包含毫秒）
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  // 升级相关状态
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [currentSubscriptionTier, setCurrentSubscriptionTier] = useState<string | null>(null);
  
  // 动态价格状态
  const [dynamicPricing, setDynamicPricing] = useState<any>(null);
  const [pricingContext, setPricingContext] = useState<PricingContext | null>(null);

  // 检查是否应该显示限时优惠
  useEffect(() => {
    const checkPromoOffer = async () => {
      if (currentUser?.id) {
        const shouldShow = await shouldShowPromoOffer(currentUser.id);
        setShowPromoOffer(shouldShow);
      } else {
        setShowPromoOffer(false);
      }
    };
    
    checkPromoOffer();
  }, [currentUser?.id]);

  // 从localStorage读取预选的计划
  useEffect(() => {
    const savedPlanTier = localStorage.getItem('selectedPlan');
    if (savedPlanTier) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.tier === savedPlanTier);
      if (plan) {
        setSelectedPlan(plan);
        console.log(t('payment.console.autoSelectPlan'), plan.name);
      }
      // 清除localStorage中的选择，避免重复使用
      localStorage.removeItem('selectedPlan');
    }
  }, []);

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

  // 检查用户订阅状态并计算动态价格
  useEffect(() => {
    const calculateDynamicPricing = async () => {
      if (!currentUser?.id || !selectedPlan) return;

      try {
        // 设置当前订阅状态
        if (currentUser.subscription && currentUser.subscription.status === 'active') {
          setCurrentSubscriptionTier(currentUser.subscription.tier || currentUser.vipLevel);
        } else {
          setCurrentSubscriptionTier(null);
        }

        // 确定操作类型
        let action: 'new' | 'renew' | 'upgrade' | 'prorated_upgrade' = 'new';
        let currentSubscription = null;

        if (hasActiveSubscription && currentUser.subscription) {
          currentSubscription = currentUser.subscription;
          
          // 检查是否是升级
          const tierLevels = { trial: 0, pro: 1, premium: 2 };
          const currentLevel = tierLevels[currentSubscriptionTier as keyof typeof tierLevels] || 0;
          const targetLevel = tierLevels[selectedPlan.tier as keyof typeof tierLevels] || 0;
          
          if (targetLevel > currentLevel) {
            // 如果是补差价升级（来自升级页面）
            if (locationState?.action === 'upgrade') {
              action = 'prorated_upgrade';
            } else {
              action = 'upgrade';
            }
          } else {
            action = 'renew';
          }
        }

        const context: PricingContext = {
          userId: currentUser.id,
          action,
          targetTier: selectedPlan.tier,
          targetPeriod: selectedPeriod,
          currentSubscription,
          allowManualAmount: false // 默认不允许手动输入
        };

        const pricing = await DynamicPricingService.calculatePrice(context);
        setDynamicPricing(pricing);
        setPricingContext(context);

      } catch (error) {
        logger.error('计算动态价格失败:', error);
      }
    };

    calculateDynamicPricing();
  }, [currentUser, selectedPlan, selectedPeriod, hasActiveSubscription, currentSubscriptionTier, locationState]);

  // 页面访问时记录时间（用于限时优惠）
  useEffect(() => {
    if (currentUser?.id) {
      // 获取或创建支付中心访问时间
      const accessTime = getPaymentCenterAccessTime(currentUser.id);
      console.log(t('payment.console.accessTime'), accessTime?.toLocaleString());

      // 立即更新倒计时
      const remainingMs = calculateRemainingTime(currentUser.id);
      const remainingSeconds = Math.floor(remainingMs / 1000);
      setTimeLeft(remainingSeconds);

      console.log(t('payment.console.remainingTime'), remainingSeconds, t('payment.console.seconds'));
    }
  }, [currentUser?.id]);

  // 处理计划选择
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowQRCode(false);

    // 自动滚动到支付信息区域
    setTimeout(() => {
      const paymentSection = document.getElementById('payment-section');
      if (paymentSection) {
        paymentSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 300); // 延迟一点时间确保状态更新完成
  };

  // 处理支付
  const handlePayment = async () => {
    if (!selectedPlan || !currentUser) return;

    // 检查是否为升级操作
    if (hasActiveSubscription && currentSubscriptionTier) {
      const tierLevels = { trial: 0, pro: 1, premium: 2 };
      const currentLevel = tierLevels[currentSubscriptionTier as keyof typeof tierLevels] || 0;
      const targetLevel = tierLevels[selectedPlan.tier as keyof typeof tierLevels] || 0;

      if (targetLevel > currentLevel) {
        // 这是升级操作，显示升级对话框
        setShowUpgradeDialog(true);
        return;
      }
    }

    try {
      setIsCreatingCheckout(true);
      setCheckoutError(null);

      // 使用 BufPay 创建支付订单
      const paymentRequest = {
        userId: currentUser.id,
        userEmail: currentUser.email || '',
        productName: selectedPlan.name,
        productType: selectedPlan.tier === 'pro' ? 'professional' : selectedPlan.tier as 'professional' | 'premium',
        durationType: selectedPeriod,
        amount: getCurrentPrice(),
        payType: 'alipay' as const,
        // 传递价格上下文用于服务端验证
        pricingContext
      };

      const { orderId, paymentInfo } = await BufPayService.createPayment(paymentRequest);

      setBufpayOrderId(orderId);
      setBufpayPaymentInfo(paymentInfo);
      setPaymentStatus('pending');
      setShowQRCode(true);

      setTimeout(() => {
        paymentInfoRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

      toast({
        title: t('payment.messages.orderCreated'),
        description: t('payment.messages.useAlipay'),
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      setCheckoutError(error.message || t('payment.messages.orderCreateFailed'));
      toast({
        title: t('payment.messages.paymentFailed'),
        description: error.message || t('payment.messages.tryAgainLater'),
        variant: "destructive",
      });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  // 获取当前价格（使用动态价格服务）
  const getCurrentPrice = () => {
    if (dynamicPricing) {
      return dynamicPricing.finalAmount;
    }
    
    // 兜底逻辑
    if (!selectedPlan) return 0;
    
    const pricing = selectedPeriod === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly;
    const originalPrice = pricing.originalPrice;
    
    const isInDiscount = showPromoOffer && timeLeft > 0;
    
    return isInDiscount ? (pricing.discountPrice || originalPrice) : originalPrice;
  };

  // 获取原价
  const getOriginalPrice = () => {
    if (dynamicPricing) {
      return dynamicPricing.originalPrice;
    }
    
    if (!selectedPlan) return 0;
    
    const pricing = selectedPeriod === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly;
    return pricing.originalPrice;
  };

  // 获取节省金额
  const getSavedAmount = () => {
    if (dynamicPricing) {
      return dynamicPricing.discountAmount;
    }
    
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
      message: t('payment.messages.paymentSuccess'),
      progress: 100,
      amount: paymentData.amount,
      currency: paymentData.currency,
      paidAt: new Date().toISOString(),
    });

    toast({
      title: t('payment.messages.paymentSuccess'),
      description: t('payment.messages.upgrading'),
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
      title: t('payment.messages.paymentFailed'),
      description: error,
      variant: "destructive",
    });
  };

  // 处理支付过期
  const handlePaymentExpired = () => {
    if (currentCheckout) {
      paymentStatusService.savePaymentStatus(currentCheckout.id, {
        status: 'expired',
        message: t('payment.messages.paymentExpired'),
        progress: 0,
      });
    }

    toast({
      title: t('payment.messages.paymentExpired'),
      description: t('payment.messages.recreateOrder'),
      variant: "destructive",
    });
  };

  // BufPay 支付成功处理
  const handleBufpaySuccess = async () => {
    logger.info('BufPay支付成功', { orderId: bufpayOrderId });
    setPaymentStatus('paid');

    // 立即显示成功提示
    toast({
      title: t('payment.messages.paymentSuccess'),
      description: t('payment.messages.upgrading'),
      duration: 5000,
    });

    // 清理支付状态
    setShowQRCode(false);
    setBufpayPaymentInfo(null);

    // 立即执行数据清理和状态刷新
    try {
      if (currentUser) {
        // 先清理可能导致验证失败的数据
        const { PaymentDataCleanupService } = await import('@/services/paymentDataCleanupService');
        PaymentDataCleanupService.performCompleteCleanup(currentUser.id);

        // 等待清理完成
        await new Promise(resolve => setTimeout(resolve, 300));

        logger.info('支付成功后数据清理完成');
        
        // 刷新订阅状态
        logger.info('刷新订阅状态...');
        await refreshSubscriptionStatus();
        logger.info('订阅状态刷新完成');
      }
    } catch (error) {
      logger.warn('数据清理或状态刷新失败:', error);
    }

    // 稍后跳转到结果页面
    setTimeout(() => {
      // 使用window.location.href确保完整页面刷新
      window.location.href = `/payment/result?order_id=${bufpayOrderId}&status=success`;
    }, 2000);
  };

  // BufPay 支付超时处理
  const handleBufpayTimeout = () => {
    setPaymentStatus('failed');
    setBufpayPaymentInfo(null);
    setBufpayOrderId(null);
    setShowQRCode(false);

    toast({
      title: t('payment.messages.paymentTimeout'),
      description: t('payment.messages.recreateOrder'),
      variant: "destructive",
    });
  };

  // BufPay 支付错误处理
  const handleBufpayError = (error: string) => {
    logger.error('BufPay支付错误', { error, orderId: bufpayOrderId });
    setPaymentStatus('failed');
    
    toast({
      title: t('payment.messages.paymentFailed'),
      description: error,
      variant: "destructive",
      duration: 8000,
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
      {/* 统一Header */}
      <Header />

      {/* 页面内容 */}
      <div className="pt-[var(--header-height)] container mx-auto px-4 py-20 space-y-12">
        {/* 页面标题 */}
        <div className="text-center mb-8 mt-8">
          <div className="mb-6 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-foreground mb-4 block">{t('payment.title')}</h1>
            <p className="text-lg text-muted-foreground block">{t('payment.description')}</p>
          </div>
        </div>
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
        <div className="flex justify-center mb-4">
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
              {t('payment.billing.monthly')}
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
                  💰 {t('payment.billing.yearlySavings')}
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
                  {t('payment.billing.yearly')} <span className="text-xs ml-1 font-extrabold text-yellow-200">({t('payment.billing.savingsPercent')})</span>
                </span>
                {selectedPeriod === 'yearly' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse"></div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 限时优惠倒计时 */}
        {currentUser?.id && showPromoOffer && timeLeft > 0 && (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-6 rounded-2xl shadow-xl max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">{t('payment.promotion.title')}</span>
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

              <div className="text-xs opacity-90">{t('payment.promotion.endingSoon')}</div>
            </div>
          </div>
        )}

        {/* 订阅计划选择 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 max-w-5xl mx-auto pt-2">
          {SUBSCRIPTION_PLANS?.map((plan, index) => {
            const pricing = selectedPeriod === 'monthly' ? plan.monthly : plan.yearly;
            const originalPrice = pricing.originalPrice;
            const isInDiscount = showPromoOffer && timeLeft > 0;
            const currentPrice = plan.tier === 'trial' ? 0 : (isInDiscount ? pricing.discountPrice || originalPrice : originalPrice);
            const savedAmount = isInDiscount ? (originalPrice - currentPrice) : 0;
            const isSelected = selectedPlan?.id === plan.id;
            const yearlySavings = getYearlySavings(plan);

            return (
              <div key={plan.id} className="relative pt-4">
                <Card
                  className={`cursor-pointer transition-all duration-300 relative group w-full flex flex-col rounded-lg min-h-[520px] ${
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
                            {t('payment.labels.recommended')}
                          </Badge>
                        )}

                        {/* 高级版标签 */}
                        {plan.premiumLabel && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl px-3 py-1 text-xs font-bold rounded-full border border-white flex items-center gap-1">
                            <Crown className="h-3 w-3 fill-current" />
                            {selectedPeriod === 'yearly' ? t('payment.labels.savings') : t('payment.labels.premium')}
                          </Badge>
                        )}


                      </div>

                      {/* 右侧标签组 */}
                      <div className="flex flex-wrap gap-1">
                        {/* 限时优惠标签 */}
                        {showPromoOffer && timeLeft > 0 && plan.tier !== 'trial' && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg px-3 py-1 text-xs animate-pulse rounded-full border border-white flex items-center gap-1">
                            <Zap className="h-3 w-3 fill-current" />
                            {t('payment.labels.limited')}
                          </Badge>
                        )}

                        {/* 年付优惠标签 */}
                        {selectedPeriod === 'yearly' && (plan.tier === 'pro' || plan.tier === 'premium') && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg px-3 py-1 text-xs rounded-full border border-white">
                            {t('payment.billing.compareMonthly', { amount: getYearlySavings(plan) })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardHeader className="text-center pb-2 pt-4">
                    <CardTitle className="text-xl md:text-2xl font-bold mb-1 h-8 flex items-center justify-center">
                      <div className="flex items-center justify-center gap-2">
                        {plan.tier === 'premium' && <Crown className="h-5 w-5 text-yellow-500" />}
                        <span className="text-gray-900">{plan.name}</span>
                      </div>
                    </CardTitle>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed h-6 flex items-center justify-center">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-3 pb-3 px-4">
                    <div className="text-center pricing-container min-h-[70px] flex flex-col justify-center">
                      <div className="space-y-2">
                        <div className="text-3xl md:text-4xl font-bold text-gray-900 flex items-baseline justify-center gap-1">
                          <span className="text-xl md:text-2xl">¥</span>
                          <span>{currentPrice}</span>
                          <span className="text-base text-gray-600 font-medium">/{selectedPeriod === 'monthly' ? t('payment.billing.month') : t('payment.billing.year')}</span>
                        </div>
                        {showPromoOffer && timeLeft > 0 && plan.tier !== 'trial' && (
                          <>
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                              <Zap className="h-4 w-4" />
                              {t('payment.promotion.specialOffer', { amount: savedAmount.toFixed(2) })}
                            </div>
                            <div className="text-lg text-gray-500 line-through">{t('payment.promotion.originalPrice', { price: originalPrice })}</div>
                          </>
                        )}

                      </div>
                    </div>
                    <div className="flex-1 space-y-1 mt-2 min-h-[240px]">
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
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="mt-0.5">
                              <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                            </div>
                            <span className="text-gray-700 leading-snug flex items-center gap-1.5 flex-wrap">
                              {featureText}
                              {badgeType === 'new' && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                  NEW
                                </Badge>
                              )}
                              {badgeType === 'up' && (
                                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-0.5">
                                  <TrendingUp className="h-2.5 w-2.5" />
                                  UP
                                </Badge>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3">
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
                            {t('payment.labels.currentPlan')}
                          </>
                        ) : isSelected ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            {t('payment.labels.selected')}
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            {t('payment.labels.selectPlan')}
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
        <div id="payment-section" ref={paymentInfoRef} className="space-y-6 max-w-4xl mx-auto">
          {/* 支付按钮 */}
          {selectedPlan && selectedPlan.tier !== 'trial' && !showQRCode && (
            <Card className="border border-border bg-card shadow-sm rounded-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{t('payment.paymentInfo.title')}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">¥{getCurrentPrice()}</div>
                    <div className="text-sm text-muted-foreground font-medium">{selectedPeriod === 'monthly' ? t('payment.billing.monthlyShort') : t('payment.billing.yearlyShort')}</div>
                    {dynamicPricing && (
                      <div className="text-xs text-blue-600 mt-1">{dynamicPricing.priceDescription}</div>
                    )}
                  </div>
                </div>

                {/* 金额提醒区域 - 当价格与原价相差超过1元时显示 */}
                {dynamicPricing && Math.abs(dynamicPricing.finalAmount - dynamicPricing.originalPrice) > 1 && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">支付金额提醒</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-1">
                      请在支付宝中手动输入金额：<span className="font-bold text-lg text-blue-900">¥{dynamicPricing.finalAmount}</span>
                    </p>
                    {dynamicPricing.priceType === 'prorated' && (
                      <p className="text-xs text-blue-600">
                        补差价计算：根据您的剩余订阅时间计算的升级费用
                      </p>
                    )}
                    {dynamicPricing.discountAmount > 0 && (
                      <p className="text-xs text-blue-600">
                        已为您节省：¥{dynamicPricing.discountAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                <div className="mb-6 p-4 bg-muted/30 border border-border rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-foreground">{selectedPlan.name}</span>
                      <span className="text-sm text-muted-foreground ml-3">{selectedPlan.description}</span>
                    </div>
                  </div>
                </div>

                {/* 按年支付引导 */}
                {selectedPeriod === 'monthly' && selectedPlan.tier !== 'trial' && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                          <Percent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-orange-800">{t('payment.yearlyPromotion.title')}</div>
                          <div className="text-sm text-orange-600">
                            {t('payment.yearlyPromotion.description', { savings: getYearlySavings(selectedPlan), months: Math.round(getYearlySavings(selectedPlan) / (selectedPlan.monthly.originalPrice || 0)) })}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPeriod('yearly')}
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-none hover:from-orange-600 hover:to-yellow-600 font-semibold"
                      >
                        {t('payment.billing.switchToYearly')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 动态价格信息显示 */}
                {dynamicPricing && dynamicPricing.discountAmount > 0 && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {dynamicPricing.priceType === 'promo' && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        限时优惠：节省¥{dynamicPricing.discountAmount.toFixed(2)}
                      </span>
                    )}
                    {dynamicPricing.priceType === 'prorated' && (
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        补差价升级：节省¥{dynamicPricing.discountAmount.toFixed(2)}
                      </span>
                    )}
                    {selectedPeriod === 'yearly' && dynamicPricing.priceType === 'original' && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        年付优惠：节省¥{getYearlySavings(selectedPlan)}
                      </span>
                    )}
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={isCreatingCheckout}
                  className="w-full !flex !items-center !justify-center !bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !text-white text-xl font-bold py-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 !border-none !text-center"
                >
                  {isCreatingCheckout ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      {t('payment.actions.creating')}
                    </div>
                  ) : (
                    t('payment.actions.payNow', { amount: getCurrentPrice() })
                  )}
                </Button>

                {/* 支付错误提示 */}
                {checkoutError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">{t('payment.messages.orderCreateError')}</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{checkoutError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCheckoutError(null)}
                      className="mt-2"
                    >
                      {t('payment.actions.retry')}
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
                    <h3 className="text-xl font-bold text-foreground">{t('payment.paymentInfo.alipayQr')}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">¥{getCurrentPrice()}</div>
                    <div className="text-sm text-muted-foreground font-medium">{selectedPeriod === 'monthly' ? t('payment.billing.monthlyShort') : t('payment.billing.yearlyShort')}</div>
                    {dynamicPricing && (
                      <div className="text-xs text-blue-600 mt-1">{dynamicPricing.priceDescription}</div>
                    )}
                  </div>
                </div>

                {/* 支付金额提醒（在二维码上方） */}
                {dynamicPricing && Math.abs(dynamicPricing.finalAmount - dynamicPricing.originalPrice) > 1 && (
                  <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">重要提醒</span>
                    </div>
                    <p className="text-sm text-orange-700 mb-1">
                      请在支付宝中手动输入金额：<span className="font-bold text-xl text-orange-900">¥{dynamicPricing.finalAmount}</span>
                    </p>
                    {dynamicPricing.priceType === 'prorated' && (
                      <p className="text-xs text-orange-600">
                        补差价升级：基于您的剩余订阅时间计算
                      </p>
                    )}
                    {dynamicPricing.discountAmount > 0 && (
                      <p className="text-xs text-orange-600">
                        为您节省了 ¥{dynamicPricing.discountAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                {/* 优惠信息行 */}
                {(showPromoOffer && timeLeft > 0) || selectedPeriod === 'yearly' ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {showPromoOffer && timeLeft > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        {t('payment.labels.limited')}时优惠中
                      </span>
                    )}
                    {selectedPeriod === 'yearly' && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        {t('payment.billing.yearlyShort')}优惠
                      </span>
                    )}
                  </div>
                ) : null}

                <div className="flex justify-center items-center py-6 bg-white rounded-xl border-2 border-green-100 shadow-sm">
                  {bufpayPaymentInfo && bufpayOrderId ? (
                    <PaymentQRCode
                      paymentInfo={bufpayPaymentInfo}
                      orderId={bufpayOrderId}
                      onPaymentSuccess={handleBufpaySuccess}
                      onPaymentTimeout={handleBufpayTimeout}
                      onPaymentError={handleBufpayError}
                    />
                  ) : (
                    <div className="text-red-600 font-semibold">{t('payment.paymentInfo.generatingQr')}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* BufPay 支付状态会通过 PaymentQRCode 组件内部轮询处理 */}


        </div>
      </div>

      {/* 升级对话框 */}
      {selectedPlan && (
        <SubscriptionUpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          targetTier={selectedPlan.tier}
          targetPeriod={selectedPeriod}
          onUpgradeSuccess={() => {
            toast({
              title: '升级成功',
              description: '您的订阅已成功升级！',
            });
            // 刷新页面或重新获取用户信息
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// ✅ FIXED: JSX语法错误已修复，背景颜色优化已完成
