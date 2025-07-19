import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext"
import { Crown, Sparkles, Check, X, Star } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans"
import { SubscriptionPeriod } from "@/types/subscription"
import { 
  isInPromoPeriod, 
  calculateRemainingTime, 
  formatTimeLeft 
} from "@/utils/paymentTimer";

export function PricingSection() {
  const [billing, setBilling] = useState<SubscriptionPeriod>("monthly")
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast()
  const { user: currentUser, isAuthenticated } = useUnifiedAuth();
  
  // 使用统一认证状态
  const inPromo = isInPromoPeriod(currentUser?.id);
  const formattedTime = formatTimeLeft(timeLeft);
  const navigate = useNavigate()

  // 限时优惠倒计时逻辑（30分钟）
  useEffect(() => {
    if (!isAuthenticated) return;
    const updateCountdown = () => {
      const remaining = calculateRemainingTime(currentUser?.id);
      setTimeLeft(remaining);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, currentUser?.id]);

  // 格式化倒计时
  // const inPromo = isInPromoPeriod(currentUser?.id); // This line is removed as per the edit hint

  // 检查是否在限时优惠期内
  // const isInPromoPeriod = () => { // This line is removed as per the edit hint
  //   if (!isAuthenticated) return false;
  //   const promoStart = localStorage.getItem('promo_start');
  //   if (!promoStart) return false;
    
  //   const startTime = parseInt(promoStart, 10);
  //   const now = Date.now();
  //   return (now - startTime) < 30 * 60 * 1000; // 30分钟
  // };

  // Handle plan selection
  const handlePlanClick = (planId: string) => {
    if (isAuthenticated) {
      // User is logged in, go directly to payment
      localStorage.setItem("selectedPlan", planId);
      navigate("/payment");
      
      toast({
        title: "正在为您跳转到支付页面",
        description: "请完成支付以开通相应功能",
      });
    } else {
      // User is not logged in, redirect to login/register choice page
      localStorage.setItem("selectedPlan", planId);
      // login("/payment"); // This line is removed as per the edit hint
    
      toast({
        title: "正在为您跳转到登录页面",
        description: "完成登录后将为您导向支付页面",
      });
    }
  }

  // 判断功能是否为当前套餐专属
  function getFeatureStatus(feature: string, planTier: string) {
    // 这里可根据feature内容和planTier灵活判断
    if (feature.includes('创意魔方') && planTier === 'trial') return { disabled: true, label: '专业版专属' };
    if (feature.includes('品牌库') && planTier !== 'premium') return { disabled: true, label: '高级版专属' };
    if (feature.includes('高级模型') && planTier === 'trial') return { disabled: true, label: '专业版专属' };
    if (feature.includes('最新模型') && planTier !== 'premium') return { disabled: true, label: '高级版专属' };
    // 其他功能默认可用
    return { disabled: false, label: '' };
  }

  // 渲染features时去掉右上角文案标签
  function renderFeatures(features: string[], plan: any) {
    return features
      .filter(f => !/免费|专业版/.test(f)) // 只去掉"免费"、"专业版"等文案，保留次数信息
      .map((feature, index) => {
        const text = feature
          .replace(/创意工作室/g, '创意魔方') // 替换
          .replace(/九宫格创意魔方/g, '九宫格创意魔方法') // 替换
          .replace(/专业功能/g, '更多功能') // 替换
          .replace(/专业版/g, '') // 去除专业版
          .replace(/热点话题/g, m => m.replace('免费', '')) // 去除热点话题下免费
          .replace(/\s+/g, ' ') // 清理多余空格
          .trim();
        
        return (
          <li key={index} className="flex items-start space-x-3">
            <Check className={`w-5 h-5 mt-0.5 ${plan.recommended ? 'text-purple-500' : 'text-green-500'}`} />
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium">{text}</span>
            </div>
          </li>
        );
      });
  }

  return (
    <section id="pricing" className="py-12 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* 装饰背景 - 突出定价方案推荐区 */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-50/40 to-transparent"></div>
      
      <div className="container mx-auto px-4 md:px-12 relative z-10">
        {/* 🎯 标题区域优化 */}
        <div className="text-center max-w-4xl mx-auto py-12">
          {/* 主标题 */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 leading-snug">
            选择适合您的方案
          </h2>
          
          {/* 副标题 */}
          <p className="text-base text-gray-500 text-center mt-2 leading-relaxed">
            从免费体验到高级版，全方位赋能新媒体创意工作者
          </p>
          
          {/* CTA 按钮 - 立即试用 */}
          <div className="mt-6">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              立即试用
            </Button>
          </div>
          {/* 登录用户显示倒计时 */}
          {isAuthenticated && inPromo && (
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg shadow-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="text-lg md:text-xl font-bold text-red-600">新用户限时优惠</div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-red-600">限时优惠倒计时：</span>
                  <span className="text-2xl font-bold bg-red-100 px-4 py-2 rounded-lg border-2 border-red-300">
                    {formattedTime}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-center items-center space-x-4">
            <Button
              variant={billing === "monthly" ? "default" : "outline"}
              onClick={() => setBilling("monthly")}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                billing === "monthly" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" 
                  : "text-gray-600 hover:text-gray-800 border-gray-300"
              }`}
            >
              按月支付
            </Button>
            <Switch
              checked={billing === "yearly"}
              onCheckedChange={(checked) => setBilling(checked ? "yearly" : "monthly")}
              className="mx-4"
            />
            <Button
              variant={billing === "yearly" ? "default" : "outline"}
              onClick={() => setBilling("yearly")}
              className={`px-6 py-3 font-semibold transition-all duration-300 ${
                billing === "yearly" 
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white shadow-lg scale-105" 
                  : "bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 border-orange-300 hover:bg-gradient-to-r hover:from-orange-200 hover:to-pink-200"
              }`}
            >
              按年订阅 <span className="text-xs ml-1">(省80-202元)</span>
            </Button>
          </div>

        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const pricing = billing === 'monthly' ? plan.monthly : plan.yearly;
            const isRecommended = plan.recommended;
            const isTrial = plan.tier === 'trial';

            return (
              <Card 
                key={plan.id}
                className={`border-2 p-8 flex flex-col relative ${
                  isRecommended 
                    ? 'border-purple-600 shadow-2xl bg-gradient-to-br from-purple-50 to-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                {isRecommended && (
                  <span className="absolute top-0 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                    <Star className="w-3 h-3 mr-1 inline" />
                    推荐
                  </span>
                )}
                
                <div className="flex items-center gap-2 mb-4">
                  {plan.tier === 'premium' ? (
                    <Crown className="w-6 h-6 text-yellow-600" />
                  ) : plan.tier === 'pro' ? (
                    <Crown className="w-6 h-6 text-purple-600" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-green-600" />
                  )}
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                </div>
                
                <p className="mt-2 text-gray-500">{plan.description}</p>
                
                <div className="mt-6 pricing-container">
                  {isTrial ? (
                    <div className="text-center">
                      <p className="text-5xl font-extrabold text-green-600 pricing-price">¥0</p>
                      <p className="text-gray-500">永久免费</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      {isAuthenticated && inPromo ? (
                        <div className="flex items-center justify-center gap-2">
                          <p className={`text-5xl font-extrabold pricing-price ${
                            isRecommended ? 'text-purple-600' : 'text-gray-900'
                          }`}>
                            <span className="pricing-price-symbol">¥</span>{pricing.discountPrice}
                          </p>
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-red-500 font-semibold">限时特惠</span>
                            <span className="text-xs text-gray-500 line-through">¥{pricing.originalPrice}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <p className={`text-5xl font-extrabold pricing-price ${
                            isRecommended ? 'text-purple-600' : 'text-gray-900'
                          }`}>
                            <span className="pricing-price-symbol">¥</span>{pricing.originalPrice}
                          </p>
                        </div>
                      )}
                      <p className="text-gray-500">/{billing === "monthly" ? "月" : "年"}</p>
                      {isAuthenticated && inPromo && (
                        <p className="text-xs text-red-500 mt-1">省¥{pricing.savedAmount}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
                  {renderFeatures(plan.features, plan)}
                </ul>
                
                <Button 
                  variant={isTrial ? "outline" : "default"}
                  className={`mt-8 w-full ${
                    isRecommended 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90' 
                      : ''
                  }`}
                  onClick={() => isTrial ? handlePlanClick(plan.id) : handlePlanClick(plan.id)}
                >
                  {isTrial ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      开始免费使用
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      立即升级{plan.name}
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* 功能对比表 */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">功能详细对比</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="max-w-6xl mx-auto">
              <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-6 py-3 text-left font-semibold text-gray-900">功能</th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900 w-32">体验版</th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-purple-900 bg-purple-50 w-32">专业版</th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-yellow-900 bg-yellow-50 w-32">高级版</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">AI内容适配器</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">10次/月</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">30次/月</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">不限量</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">全网雷达</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">创意魔方</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-red-500 font-medium">❌</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">我的资料库</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">品牌库</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-red-500 font-medium">❌</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">AI模型</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-gray-600 pricing-table-text">基础模型</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="text-purple-600 font-medium pricing-table-text">高级模型</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <div className="text-yellow-600 font-medium text-xs leading-tight pricing-table-cell">
                        <div className="pricing-table-text">高级及</div>
                        <div className="pricing-table-text">最新模型</div>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">Token限制</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-gray-600 pricing-table-number">100,000</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="text-purple-600 pricing-table-number">200,000</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <span className="text-yellow-600 pricing-table-number">500,000</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}