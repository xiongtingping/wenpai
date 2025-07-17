/**
 * 增强版支付页面
 * 集成支付状态监控、成功处理和用户体验优化
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, ArrowLeft, RefreshCw, QrCode, Smartphone, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { 
  SUBSCRIPTION_PLANS, 
  calculateDiscountCountdown, 
  isInDiscountPeriod 
} from "@/config/subscriptionPlans";
import { SubscriptionPlan, SubscriptionPeriod } from "@/types/subscription";
import { Creem } from "creem";
import { creemOptimizer } from '@/utils/creemOptimizer';
import { EnhancedPaymentStatusMonitor } from './EnhancedPaymentStatusMonitor';
import { PaymentStatusRecovery } from './PaymentStatusRecovery';
import { paymentStatusService } from '@/services/paymentStatusService';
import { PaymentSuccessHandler } from './PaymentSuccessHandler';

/**
 * 增强版支付宝二维码组件
 */
const EnhancedCreemAlipayQRCode: React.FC<{ 
  productId: string; 
  apiKey: string;
  onCheckoutCreated?: (checkout: any) => void;
}> = ({ productId, apiKey, onCheckoutCreated }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchCheckout();
  }, [productId, apiKey]);

  const fetchCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const checkout = await creemOptimizer.smartCreateCheckout(
        String(productId), 
        String(apiKey)
      );
      
      console.log('支付订单创建成功:', checkout);
      
      const alipayQr =
        checkout.alipayQrCodeUrl ||
        checkout.alipay_qr_code_url ||
        (checkout.qrCodes && checkout.qrCodes.alipay) ||
        null;
        
      if (!alipayQr) {
        setError('该产品未配置支付宝二维码支付');
        setQrUrl(null);
        setPrice(null);
        setLoading(false);
        return;
      }
      
      setQrUrl(alipayQr);
      setCheckoutId(checkout.id);
      
      let amount = checkout.amount;
      if (typeof amount === "number") {
        setPrice(amount / 100);
      } else if (typeof amount === "string") {
        setPrice(parseFloat(amount) / 100);
      } else {
        setPrice(null);
      }

      // 通知父组件订单已创建
      if (onCheckoutCreated) {
        onCheckoutCreated(checkout);
      }
      
    } catch (err: any) {
      console.error('创建支付订单失败:', err);
      setError(err?.message || "二维码获取失败");
      setQrUrl(null);
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchCheckout();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">正在生成支付二维码...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <QrCode className="h-16 w-16 mx-auto mb-2" />
          <p className="text-lg font-medium">二维码获取失败</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          重新生成
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {price !== null && (
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">¥{price.toFixed(2)}</div>
          <Badge variant="secondary">支付宝扫码支付</Badge>
        </div>
      )}
      
      {qrUrl && (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img 
              src={qrUrl} 
              alt="支付宝二维码" 
              className="w-48 h-48 border-2 border-gray-200 rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
              <div className="text-center">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">请使用支付宝扫码</p>
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              扫码后会跳转到Creem安全支付页，请放心支付
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 增强版支付页面主组件
 */
export default function EnhancedPaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>('monthly');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [currentCheckout, setCurrentCheckout] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [showRecovery, setShowRecovery] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();

  // 限时优惠倒计时逻辑
  useEffect(() => {
    const promoStart = localStorage.getItem('promo_start');
    if (!promoStart) return;
    
    const startTime = parseInt(promoStart, 10);
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, 30 * 60 * 1000 - (now - startTime));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 页面加载时自动选中第一个套餐
  useEffect(() => {
    if (!selectedPlan && SUBSCRIPTION_PLANS.length > 0) {
      setSelectedPlan(SUBSCRIPTION_PLANS[0]);
    }
  }, [selectedPlan]);

  // 格式化倒计时
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 检查是否在限时优惠期内
  const isInPromoPeriod = () => {
    const promoStart = localStorage.getItem('promo_start');
    if (!promoStart) return false;
    
    const startTime = parseInt(promoStart, 10);
    const now = Date.now();
    return (now - startTime) < 30 * 60 * 1000;
  };

  // 处理计划选择
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    if (plan.tier !== 'trial') {
      setShowQRCode(true);
      setPaymentStatus('pending');
      toast({
        title: "支付二维码已显示",
        description: "请使用手机扫码完成支付",
      });
      
      // 自动滚动到二维码区域
      setTimeout(() => {
        const qrCodeElement = document.querySelector('[data-qr-code]');
        if (qrCodeElement) {
          qrCodeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  // 处理周期选择
  const handlePeriodSelect = (period: SubscriptionPeriod) => {
    setSelectedPeriod(period);
  };

  // 获取当前价格
  const getCurrentPrice = () => {
    if (!selectedPlan) return 0;
    const basePrice = (selectedPlan as any).price?.[selectedPeriod] || 0;
    return isInPromoPeriod() ? basePrice * 0.8 : basePrice;
  };

  // 获取原价
  const getOriginalPrice = () => {
    if (!selectedPlan) return 0;
    return (selectedPlan as any).price?.[selectedPeriod] || 0;
  };

  // 获取节省金额
  const getSavedAmount = () => {
    return getOriginalPrice() - getCurrentPrice();
  };

  // 处理支付成功
  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentStatus('paid');
    setCurrentCheckout(paymentData);
    // 保存支付状态到本地存储
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
    // 保存支付失败状态
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

  // 处理订单创建
  const handleCheckoutCreated = (checkout: any) => {
    setCurrentCheckout(checkout);
    // 保存初始支付状态
    paymentStatusService.savePaymentStatus(checkout.id, {
      status: 'pending',
      message: '等待支付...',
      progress: 0,
      amount: checkout.amount,
      currency: checkout.currency,
    });
  };

  // 获取Creem产品ID
  const getCreemProductId = (plan: SubscriptionPlan, period: SubscriptionPeriod) => {
    if (!plan || !period) return "";
    if (plan.tier === "pro" && period === "monthly") return "prod_3nJOuQeVStqkp6JaDcrKHf";
    if (plan.tier === "pro" && period === "yearly") return "prod_5qBlDTLpD3h9gvOZFd4Rgu";
    if (plan.tier === "premium" && period === "monthly") return "prod_4HYBfvrcbXYnbxjlswMj28";
    if (plan.tier === "premium" && period === "yearly") return "prod_6OfIoVnRg2pXsuYceVKOYk";
    return "";
  };

  // 如果支付成功，显示成功处理页面
  if (paymentStatus === 'paid' && currentCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
        </div>

        {/* 支付状态恢复 */}
        <PaymentStatusRecovery
          onRecoveryComplete={() => {
            setShowRecovery(false);
            navigate('/profile');
          }}
          onNoActivePayments={() => setShowRecovery(false)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：套餐选择 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">选择套餐</CardTitle>
                {isInPromoPeriod() && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      限时优惠倒计时: {formatTimeLeft()}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div
                    key={plan.tier}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPlan?.tier === plan.tier
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <p className="text-gray-600 text-sm">{plan.description}</p>
                      </div>
                      <Badge variant={plan.tier === 'premium' ? 'default' : 'secondary'}>
                        {plan.tier === 'premium' ? '推荐' : plan.tier}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-blue-600">
                        ¥{getCurrentPrice()}
                      </div>
                      {isInPromoPeriod() && (
                        <div className="text-sm text-gray-500 line-through">
                          ¥{getOriginalPrice()}
                        </div>
                      )}
                    </div>
                    
                    {isInPromoPeriod() && getSavedAmount() > 0 && (
                      <div className="text-sm text-green-600 mt-1">
                        节省 ¥{getSavedAmount().toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 周期选择 */}
            <Card>
              <CardHeader>
                <CardTitle>选择周期</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                    onClick={() => handlePeriodSelect('monthly')}
                    className="h-16"
                  >
                    <div className="text-center">
                      <div className="font-semibold">月付</div>
                      <div className="text-sm text-gray-600">
                        ¥{selectedPlan ? getCurrentPrice() : 0}/月
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
                    onClick={() => handlePeriodSelect('yearly')}
                    className="h-16"
                  >
                    <div className="text-center">
                      <div className="font-semibold">年付</div>
                      <div className="text-sm text-gray-600">
                        ¥{selectedPlan ? getCurrentPrice() : 0}/年
                      </div>
                      <Badge variant="secondary" className="mt-1">更优惠</Badge>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：支付区域 */}
          <div className="space-y-6">
            {showQRCode && selectedPlan ? (
              <Card data-qr-code className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-bold">支</span>
                    </div>
                    支付宝扫码支付
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 支付信息摘要 */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">{selectedPlan.name}</h4>
                          <p className="text-sm text-blue-700">
                            {selectedPeriod === 'monthly' ? '月付' : '年付'} · {selectedPlan.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">¥{getCurrentPrice()}</div>
                        {isInPromoPeriod() && (
                          <div className="text-sm text-red-600">限时特惠</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <EnhancedCreemAlipayQRCode
                    productId={getCreemProductId(selectedPlan, selectedPeriod)}
                    apiKey={import.meta.env.VITE_CREEM_API_KEY || ''}
                    onCheckoutCreated={handleCheckoutCreated}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>支付信息</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">请先选择套餐</p>
                </CardContent>
              </Card>
            )}

            {/* 支付状态监控 */}
            {currentCheckout && (
              <EnhancedPaymentStatusMonitor
                checkoutId={currentCheckout.id}
                apiKey={import.meta.env.VITE_CREEM_API_KEY || ''}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
                onPaymentExpired={() => {
                  if (currentCheckout) {
                    paymentStatusService.savePaymentStatus(currentCheckout.id, {
                      status: 'expired',
                      message: '支付已过期',
                      progress: 0,
                    });
                  }
                }}
                autoRefresh={true}
                refreshInterval={3000}
                maxRetries={10}
                enableNotifications={true}
                enableSound={true}
                showAdvancedInfo={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 