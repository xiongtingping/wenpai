import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, CreditCard } from "lucide-react";
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { calculateDiscountCountdown, isInDiscountPeriod } from "@/config/subscriptionPlans";
import AlipayQRCode from "@/components/payment/AlipayQRCode";

/**
 * 支付测试页面 - 验证限时优惠和支付二维码联动
 */
export default function PaymentTestPage() {
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated: currentIsAuthenticated } = useUnifiedAuth();
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedPlan] = useState({ name: "Pro月付", tier: "pro" });
  const [selectedPeriod] = useState("monthly");

  // 获取用户注册时间
  const getUserRegistrationTime = (): Date | undefined => {
    if (!currentUser) return undefined;
    
    const registrationTime = localStorage.getItem('user_registration_time');
    if (registrationTime) {
      return new Date(parseInt(registrationTime, 10));
    }
    
    const now = new Date();
    localStorage.setItem('user_registration_time', now.getTime().toString());
    return now;
  };

  // 格式化倒计时显示
  const formatTimeLeft = () => {
    if (timeLeft <= 0) return '已结束';
    
    const seconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟${seconds % 60}秒`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  // 检查是否在优惠期内
  const isInPromoPeriod = () => {
    if (!currentIsAuthenticated) return false;
    
    const registrationTime = getUserRegistrationTime();
    if (!registrationTime) return false;
    
    return isInDiscountPeriod(registrationTime);
  };

  // 更新倒计时
  useEffect(() => {
    if (!currentIsAuthenticated) return;

    const registrationTime = getUserRegistrationTime();
    if (!registrationTime) return;

    const updateCountdown = () => {
      const remaining = calculateDiscountCountdown(registrationTime);
      setTimeLeft(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [currentIsAuthenticated]);

  // 获取价格信息
  const getPriceInfo = () => {
    const originalPrice = 99;
    const discountPrice = 69;
    
    if (isInPromoPeriod() && timeLeft > 0) {
      return {
        currentPrice: discountPrice,
        originalPrice: originalPrice,
        savedAmount: originalPrice - discountPrice,
        isDiscount: true
      };
    }
    
    return {
      currentPrice: originalPrice,
      originalPrice: originalPrice,
      savedAmount: 0,
      isDiscount: false
    };
  };

  const priceInfo = getPriceInfo();

  // 处理支付
  const handlePayment = () => {
    setShowQRCode(true);
    toast({
      title: "支付二维码已显示",
      description: "请使用手机扫码完成支付",
    });
  };

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">支付测试页面</h1>
        <p className="text-muted-foreground">验证限时优惠和支付二维码联动</p>
      </div>

      {/* 优惠倒计时 */}
      {timeLeft > 0 && (
        <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg shadow-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="text-lg font-bold text-red-600">
              新用户限时优惠：30分钟
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-red-600">优惠倒计时：</span>
              <span className="text-2xl font-bold bg-red-100 px-4 py-2 rounded-lg border-2 border-red-300">
                {formatTimeLeft()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：价格信息 */}
        <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              价格信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-green-900">{selectedPlan.name}</span>
                <span className="text-sm text-green-700">
                  {selectedPeriod === 'monthly' ? '月付' : '年付'}
                </span>
              </div>
              
              {priceInfo.isDiscount ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">限时优惠价</span>
                    <span className="text-2xl font-bold text-red-600">¥{priceInfo.currentPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">原价</span>
                    <span className="text-lg text-gray-400 line-through">¥{priceInfo.originalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">节省金额</span>
                    <span className="text-lg font-bold text-green-600">¥{priceInfo.savedAmount}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">支付金额</span>
                  <span className="text-2xl font-bold text-green-600">¥{priceInfo.currentPrice}</span>
                </div>
              )}
            </div>
            
            {!showQRCode && (
              <Button 
                onClick={handlePayment}
                className="w-full bg-green-500 hover:bg-green-600"
                size="lg"
              >
                立即支付
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 右侧：支付二维码 */}
        {showQRCode && (
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
                        {selectedPeriod === 'monthly' ? '月付' : '年付'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">¥{priceInfo.currentPrice}</div>
                    {priceInfo.isDiscount && (
                      <div className="text-sm text-green-600">限时优惠中</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 支付宝二维码组件 */}
              <AlipayQRCode 
                priceId="prod_3nJOuQeVStqkp6JaDcrKHf"
                title={`${selectedPlan.name} - 扫码支付`}
                showPrice={true}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* 测试信息 */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-2">测试信息</h3>
        <div className="text-sm space-y-1">
          <p>用户认证状态: {currentIsAuthenticated ? '已登录' : '未登录'}</p>
          <p>优惠期状态: {isInPromoPeriod() ? '在优惠期内' : '不在优惠期内'}</p>
          <p>倒计时剩余: {formatTimeLeft()}</p>
          <p>当前价格: ¥{priceInfo.currentPrice}</p>
          <p>原价: ¥{priceInfo.originalPrice}</p>
          <p>节省金额: ¥{priceInfo.savedAmount}</p>
        </div>
      </div>
    </div>
  );
} 