import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar, ArrowLeft, Check, Crown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  SUBSCRIPTION_PLANS, 
  calculateDiscountCountdown, 
  isInDiscountPeriod 
} from "@/config/subscriptionPlans";
import { SubscriptionPlan, SubscriptionPeriod } from "@/types/subscription";

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>('monthly');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 获取用户注册时间，如果没有则使用当前时间
  const registrationDate = user?.createdAt ? new Date(user.createdAt as string) : new Date();

  // 计算限时优惠倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateDiscountCountdown(registrationDate);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [registrationDate]);

  // 格式化倒计时
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 处理计划选择
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowQRCode(false);
  };

  // 处理周期选择
  const handlePeriodSelect = (period: SubscriptionPeriod) => {
    setSelectedPeriod(period);
    setShowQRCode(false);
  };

  // 获取当前价格
  const getCurrentPrice = () => {
    if (!selectedPlan) return 0;
    
    const pricing = selectedPeriod === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly;
    const isInDiscount = isInDiscountPeriod(registrationDate);
    
    return isInDiscount ? pricing.discountPrice : pricing.originalPrice;
  };

  // 获取原价
  const getOriginalPrice = () => {
    if (!selectedPlan) return 0;
    const pricing = selectedPeriod === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly;
    return pricing.originalPrice;
  };

  // 获取节省金额
  const getSavedAmount = () => {
    if (!selectedPlan) return 0;
    const pricing = selectedPeriod === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly;
    return pricing.savedAmount;
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
    <div className="container mx-auto py-16 px-4 max-w-6xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>
      </div>

      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">选择订阅计划</h1>
        <p className="text-muted-foreground">选择最适合您的计划，开始享受AI创作之旅</p>
      </div>

      {/* 限时优惠倒计时 */}
      {timeLeft > 0 && (
        <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <Clock className="h-5 w-5" />
            <span className="font-medium">限时优惠倒计时：{formatTimeLeft()}</span>
          </div>
          <p className="text-center text-sm text-red-600 mt-1">
            注册后30分钟内享受25%折扣优惠，倒计时结束后恢复原价
          </p>
        </div>
      )}

      {/* 订阅周期选择 */}
      <div className="mb-8">
        <div className="flex justify-center gap-4">
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
            <Badge variant="secondary" className="ml-2">更优惠</Badge>
          </Button>
          <div className="text-center mt-2 text-sm text-green-600">
            <p>专业版：年付省120元</p>
            <p>高级版：年付省300元</p>
          </div>
        </div>
      </div>

      {/* 订阅计划选择 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const pricing = selectedPeriod === 'monthly' ? plan.monthly : plan.yearly;
          const isInDiscount = isInDiscountPeriod(registrationDate);
          const currentPrice = isInDiscount ? pricing.discountPrice : pricing.originalPrice;
          const isSelected = selectedPlan?.id === plan.id;

          return (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all relative ${
                isSelected ? "border-blue-500 shadow-lg" : "hover:shadow-md"
              } ${plan.recommended ? "ring-2 ring-blue-200" : ""}`}
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    推荐
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  {plan.tier === 'premium' && <Crown className="h-5 w-5 text-yellow-500" />}
                  {plan.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* 价格显示 */}
                <div className="text-center">
                  {plan.tier === 'trial' ? (
                    <div className="text-3xl font-bold text-green-600">免费</div>
                  ) : (
                    <div className="space-y-2">
                      {isInDiscount && timeLeft > 0 ? (
                        <div className="space-y-1">
                          <div className="text-3xl font-bold text-red-600">
                            ¥{currentPrice}
                          </div>
                          <div className="text-sm text-red-500">
                            限时特惠价 省¥{pricing.savedAmount}
                          </div>
                          <div className="text-sm text-gray-400 line-through">
                            ¥{pricing.originalPrice} 原价
                          </div>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-gray-900">
                          ¥{currentPrice}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        /{selectedPeriod === 'monthly' ? '月' : '年'}
                      </div>
                    </div>
                  )}
                </div>

                {/* 功能列表 */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* 选择按钮 */}
                <Button 
                  variant={isSelected ? "default" : "outline"}
                  className="w-full"
                  disabled={plan.tier === 'trial'}
                >
                  {plan.tier === 'trial' ? '当前版本' : isSelected ? '已选择' : '选择此计划'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 选中计划详情 */}
      {selectedPlan && selectedPlan.tier !== 'trial' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
            <p className="text-muted-foreground text-sm">
              您选择的是{selectedPlan.name} - {selectedPeriod === 'monthly' ? '按月订阅' : '按年订阅'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center py-4 border-b">
              <div>
                <p className="font-medium">{selectedPlan.name}</p>
                <p className="text-muted-foreground text-sm">
                  {selectedPeriod === 'monthly' ? '按月订阅' : '按年订阅'}
                </p>
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xl font-bold text-red-600">
                    ¥{getCurrentPrice()}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{selectedPeriod === 'monthly' ? '月' : '年'}
                    </span>
                  </div>
                  {isInDiscountPeriod(registrationDate) && timeLeft > 0 && (
                    <>
                      <div className="text-xs text-red-500">
                        限时特惠价 省¥{getSavedAmount()}
                      </div>
                      <div className="text-xs text-gray-500 line-through">
                        ¥{getOriginalPrice()} 原价
                      </div>
                      <div className="text-xs text-red-500 mt-1">
                        倒计时：{formatTimeLeft()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-2">您将获得：</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 支付二维码 */}
      {showQRCode && selectedPlan && selectedPlan.tier !== 'trial' && (
        <Card>
          <CardHeader>
            <CardTitle>支付方式</CardTitle>
            <p className="text-muted-foreground text-sm">选择您喜欢的支付方式</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 支付宝二维码 */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">支付宝支付</h3>
                  <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-lg">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📱</div>
                        <div className="text-sm text-gray-600">支付宝二维码</div>
                        <div className="text-xs text-gray-500 mt-1">请使用支付宝扫码</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-2">¥{getCurrentPrice()}</div>
                    <p className="text-sm text-gray-600">扫码完成支付</p>
                  </div>
                </div>

                {/* 微信支付二维码 */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-green-600">微信支付</h3>
                  <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-lg">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📱</div>
                        <div className="text-sm text-gray-600">微信二维码</div>
                        <div className="text-xs text-gray-500 mt-1">请使用微信扫码</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-2">¥{getCurrentPrice()}</div>
                    <p className="text-sm text-gray-600">扫码完成支付</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  支付二维码已显示，请使用手机扫码完成支付
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "支付说明",
                        description: "请使用手机支付宝或微信扫码完成支付",
                      });
                    }}
                  >
                    支付说明
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "联系客服",
                        description: "如有支付问题，请联系客服",
                      });
                    }}
                  >
                    联系客服
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 支付按钮 */}
      {selectedPlan && selectedPlan.tier !== 'trial' && !showQRCode && (
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600" 
            onClick={handlePayment}
          >
            立即支付
          </Button>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="text-green-600 font-medium mb-2">💡 随时可取消</p>
        <p>订阅会在期满后自动续费，您可以随时取消</p>
        <p className="mt-2">
          点击"立即支付"，表示您同意我们的
          <a href="#" className="text-blue-500 hover:underline mx-1">
            服务条款
          </a>
          和
          <a href="#" className="text-blue-500 hover:underline mx-1">
            隐私政策
          </a>
        </p>
      </div>
    </div>
  );
}