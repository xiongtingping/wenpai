import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar, ArrowLeft, Check, Crown, Star, CreditCard, Percent, Zap, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { 
  SUBSCRIPTION_PLANS
} from "@/config/subscriptionPlans";
import { SubscriptionPlan, SubscriptionPeriod } from "@/types/subscription";
import { getAlipayQRCode } from "@/api/creemClientService";
import AlipayQRCode from "@/components/payment/AlipayQRCode";
import { 
  getPaymentCenterAccessTime, 
  isInPromoPeriod, 
  calculateRemainingTime, 
  formatTimeLeft as formatTimeLeftUtil 
} from "@/utils/paymentTimer";

/**
 * Creem 支付宝二维码组件
 * @param priceId Creem价格ID
 * @param planName 计划名称
 * @param price 支付金额
 */
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

/**
 * 获取Creem价格ID
 * @param plan 订阅计划
 * @param period 订阅周期
 * @returns Creem价格ID
 */
function getCreemPriceId(plan: SubscriptionPlan, period: SubscriptionPeriod): string {
  if (plan.tier === "pro" && period === "monthly") return "prod_3nJOuQeVStqkp6JaDcrKHf";
  if (plan.tier === "pro" && period === "yearly") return "prod_5qBlDTLpD3h9gvOZFd4Rgu";
  if (plan.tier === "premium" && period === "monthly") return "prod_4HYBfvrcbXYnbxjlswMj28";
  if (plan.tier === "premium" && period === "yearly") return "prod_6OfIoVnRg2pXsuYceVKOYk";
  return "";
}

/**
 * 支付中心页面
 * 1. 套餐选择在上，卡片高亮、推荐角标更明显，内容更紧凑
 * 2. 支付信息区块金额、优惠、倒计时更聚焦，按钮更突出
 * 3. 二维码区块更大，扫码指引更明显，支付摘要更简洁
 * 4. 优惠倒计时样式更醒目，移动端适配
 * 5. 套餐/周期切换后自动滚动到支付信息区
 * 6. 增强优惠信息展示：折扣标签、节省金额、年付优惠等
 * 7. 新用户限时优惠：从点击到支付中心页面开始计时30分钟
 * @returns {JSX.Element}
 */
export default function PaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser, isAuthenticated: currentIsAuthenticated } = useUnifiedAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>('monthly');
  const [showQRCode, setShowQRCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const paymentInfoRef = useRef<HTMLDivElement>(null);

  /**
   * 格式化倒计时显示
   * @returns {string} 格式化的倒计时字符串
   */
  const formatTimeLeft = () => {
    return formatTimeLeftUtil(timeLeft);
  };

  /**
   * 更新倒计时
   */
  useEffect(() => {
    if (!currentIsAuthenticated) return;

    const updateCountdown = () => {
      const remaining = calculateRemainingTime(currentUser?.id);
      const previousTimeLeft = timeLeft;
      setTimeLeft(remaining);
      
      // 如果优惠期结束，显示提示
      if (remaining <= 0 && previousTimeLeft > 0) {
        toast({
          title: "限时优惠已结束",
          description: "优惠期已结束，价格已恢复原价",
          variant: "destructive"
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [currentIsAuthenticated, currentUser?.id, toast]);

  // 处理计划选择
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowQRCode(false);
    // 移除自动滚动逻辑，让用户自己控制页面滚动
  };

  // 处理周期选择
  const handlePeriodSelect = (period: SubscriptionPeriod) => {
    setSelectedPeriod(period);
    setShowQRCode(false);
    // 移除自动滚动逻辑，让用户自己控制页面滚动
  };

  // 获取当前价格
  const getCurrentPrice = () => {
    if (!selectedPlan) return 0;
    
    const pricing = selectedPeriod === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly;
    const originalPrice = pricing.originalPrice;
    
    // 如果在优惠期内，应用折扣
    if (isInPromoPeriod(currentUser?.id)) {
      return pricing.discountPrice || originalPrice;
    }
    
    return originalPrice;
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

  // 处理支付
  const handlePayment = () => {
    if (!selectedPlan) {
      toast({
        title: "请选择订阅计划",
        description: "请先选择要订阅的计划",
        variant: "destructive"
      });
      return;
    }

    setShowQRCode(true);
    toast({
      title: "支付二维码已显示",
      description: "请使用手机扫码完成支付",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="border-b border-border shadow-sm bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <h1 className="text-lg font-semibold text-foreground">支付中心</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {currentIsAuthenticated ? '已登录' : '未登录'}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-6xl md:py-16 md:px-6">
      {/* 标题区 */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">选择订阅计划</h1>
        <p className="text-muted-foreground">选择最适合您的计划，开启AI创作之旅</p>
      </div>

      {/* 优惠倒计时 */}
      {timeLeft > 0 && (
        <div className="mb-8 p-4 rounded-xl border bg-accent border-border shadow flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-lg md:text-xl font-bold text-foreground">新用户限时优惠</span>
          </div>
          <span className="flex items-center gap-2 text-xl md:text-2xl font-bold bg-card px-4 py-2 rounded-lg border border-border">
            <Clock className="w-5 h-5 text-muted-foreground" />
            {formatTimeLeft()}
          </span>
        </div>
      )}

      {/* 订阅周期选择 */}
      <div className="mb-8 flex justify-center gap-4">
        <Button
          variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
          onClick={() => handlePeriodSelect('monthly')}
          className="min-w-[120px]"
        >
          按月订阅
        </Button>
        <Button
          variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
          onClick={() => handlePeriodSelect('yearly')}
          className="min-w-[120px]"
        >
          按年订阅
          <Badge variant="secondary" className="ml-2">年付更省</Badge>
        </Button>
      </div>

      {/* 订阅计划选择 - 上方 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 max-w-6xl mx-auto justify-items-center">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const pricing = selectedPeriod === 'monthly' ? plan.monthly : plan.yearly;
          const originalPrice = pricing.originalPrice;
          const isInDiscount = isInPromoPeriod(currentUser?.id);
          // 修复：为每个计划计算正确的价格
          const currentPrice = plan.tier === 'trial' ? 0 : (isInDiscount ? pricing.discountPrice : originalPrice);
          const savedAmount = plan.tier === 'trial' ? 0 : (originalPrice - currentPrice);
          const isSelected = selectedPlan?.id === plan.id;
          const yearlySavings = getYearlySavings(plan);

          return (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all relative group ${isSelected ? "border-4 border-blue-500 shadow-2xl scale-105" : "hover:shadow-lg hover:scale-105"} ${plan.recommended ? "ring-2 ring-blue-200" : ""}`}
              onClick={() => handlePlanSelect(plan)}
            >
              {/* 推荐标签 */}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg px-4 py-1 text-base">
                    <Star className="h-4 w-4 mr-1" />
                    推荐
                  </Badge>
                </div>
              )}

              {/* 限时优惠标签 */}
              {isInDiscount && timeLeft > 0 && plan.tier !== 'trial' && (
                <div className="absolute -top-4 -right-2 z-10">
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg px-3 py-1 text-sm animate-pulse">
                    <Zap className="h-3 w-3 mr-1" />
                    限时
                  </Badge>
                </div>
              )}

              {/* 年付优惠标签 */}
              {selectedPeriod === 'yearly' && (plan.tier === 'pro' || plan.tier === 'premium') && (
                <div className="absolute -top-4 -left-2 z-10">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg px-3 py-1 text-sm">
                    <Percent className="h-3 w-3 mr-1" />
                    年付省¥{yearlySavings}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  {plan.tier === 'premium' && <Crown className="h-5 w-5 text-yellow-500" />}
                  {plan.name}
                </CardTitle>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-3 pb-4 px-6">
                {/* 价格显示 */}
                <div className="text-center pricing-container">
                  {plan.tier === 'trial' ? (
                    <div className="text-3xl font-bold text-primary">免费</div>
                  ) : (
                    <div className="space-y-2">
                      {isInDiscount && timeLeft > 0 ? (
                        <div className="space-y-2">
                          <div className="text-3xl font-bold text-foreground pricing-price">
                            <span className="pricing-price-symbol">¥</span>{currentPrice}
                          </div>
                          <div className="text-sm text-primary font-semibold">
                            <Zap className="h-3 w-3 inline mr-1" />
                            限时特惠价 省¥{savedAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground line-through">¥{originalPrice} 原价</div>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-foreground pricing-price">
                          <span className="pricing-price-symbol">¥</span>{currentPrice}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">/{selectedPeriod === 'monthly' ? '月' : '年'}</div>

                      {/* 年付月均价格显示 */}
                      {selectedPeriod === 'yearly' && (plan.tier === 'pro' || plan.tier === 'premium') && (
                        <div className="text-xs text-primary bg-accent px-2 py-1 rounded">
                          月均¥{(currentPrice / 12).toFixed(1)}，比月付省¥{yearlySavings}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* 功能列表 */}
                <div className="space-y-1.5 mt-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {/* 选择按钮 */}
                <Button 
                  variant={isSelected ? "default" : "outline"}
                  className="w-full mt-3 text-base py-2.5"
                  disabled={plan.tier === 'trial'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(plan);
                  }}
                >
                  {plan.tier === 'trial' ? '当前版本' : isSelected ? '已选择' : '选择此计划'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 支付信息和二维码 - 下方 */}
      <div ref={paymentInfoRef} className="space-y-4 max-w-3xl mx-auto">
        {/* 支付按钮 */}
        {selectedPlan && selectedPlan.tier !== 'trial' && !showQRCode && (
          <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white shadow-lg">
            <CardContent className="p-6">
              {/* 标题和支付信息行 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <CreditCard className="h-3 w-3 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900">支付信息</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">¥{getCurrentPrice()}</div>
                  <div className="text-xs text-green-600">{selectedPeriod === 'monthly' ? '月付' : '年付'}</div>
                </div>
              </div>
              
              {/* 套餐信息 */}
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-green-900">{selectedPlan.name}</span>
                    <span className="text-xs text-green-700 ml-2">{selectedPlan.description}</span>
                  </div>
                </div>
              </div>
              
              {/* 优惠信息行 */}
              {(isInPromoPeriod(currentUser?.id) && timeLeft > 0) || selectedPeriod === 'yearly' ? (
                <div className="flex gap-2 mb-4">
                  {isInPromoPeriod(currentUser?.id) && timeLeft > 0 && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      <Zap className="h-3 w-3 inline mr-1" />
                      限时优惠中，节省 ¥{getSavedAmount().toFixed(2)}
                    </span>
                  )}
                  {selectedPeriod === 'yearly' && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      <Percent className="h-3 w-3 inline mr-1" />
                      年付优惠，比月付省 ¥{getYearlySavings(selectedPlan)}
                    </span>
                  )}
                </div>
              ) : null}
              
              <Button 
                onClick={handlePayment}
                className="w-full bg-green-500 hover:bg-green-600 text-base py-2"
              >
                立即支付
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 支付二维码 */}
        {showQRCode && selectedPlan && selectedPlan.tier !== 'trial' && (
          <Card data-qr-code className="border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-xl">
            <CardContent className="p-6">
              {/* 标题和支付信息行 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">支</span>
                  </div>
                  <h3 className="font-semibold text-foreground">支付宝扫码支付</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">¥{getCurrentPrice()}</div>
                  <div className="text-xs text-muted-foreground">{selectedPeriod === 'monthly' ? '月付' : '年付'}</div>
                </div>
              </div>
              
              {/* 优惠信息行 */}
              {(isInPromoPeriod(currentUser?.id) && timeLeft > 0) || selectedPeriod === 'yearly' ? (
                <div className="flex gap-2 mb-4">
                  {isInPromoPeriod(currentUser?.id) && timeLeft > 0 && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      <Zap className="h-3 w-3 inline mr-1" />
                      限时优惠中
                    </span>
                  )}
                  {selectedPeriod === 'yearly' && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      <Percent className="h-3 w-3 inline mr-1" />
                      年付优惠
                    </span>
                  )}
                </div>
              ) : null}
              
              {/* 支付宝二维码组件 */}
              <div className="flex justify-center items-center py-2">
                {(() => {
                  const pid = getCreemPriceId(selectedPlan, selectedPeriod);
                  return pid ? (
                    <CreemAlipayQRCode
                      priceId={pid}
                      planName={selectedPlan.name}
                      price={getCurrentPrice()}
                    />
                  ) : (
                    <div style={{ color: 'red' }}>请先选择有效的套餐和周期</div>
                  );
                })()}
              </div>
              
              <div className="text-center text-blue-700 text-sm mt-2">请使用支付宝App扫码完成支付</div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 text-center text-xs md:text-sm text-muted-foreground">
        <p className="text-green-600 font-medium mb-2">💡 随时可取消</p>
        <p>订阅会在期满后自动续费，您可以随时取消</p>
        <p className="mt-2">
          点击立即支付即表示您同意我们的
          <a href="/terms" className="text-blue-500 hover:underline mx-1">服务条款</a>
          和
          <a href="/privacy" className="text-blue-500 hover:underline mx-1">隐私政策</a>
        </p>
      </div>
    </div>
    </div>
  );
}