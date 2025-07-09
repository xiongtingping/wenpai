import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { Crown, Sparkles, Check, X, Star } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans"
import { SubscriptionPeriod } from "@/types/subscription"

export function PricingSection() {
  const [billing, setBilling] = useState<SubscriptionPeriod>("monthly")
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

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
      navigate("/register");
    
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
    if (feature.includes('全网雷达') && planTier !== 'premium') return { disabled: true, label: '高级版专属' };
    if (feature.includes('品牌库') && planTier !== 'premium') return { disabled: true, label: '高级版专属' };
    if (feature.includes('高级模型') && planTier === 'trial') return { disabled: true, label: '专业版专属' };
    if (feature.includes('最新模型') && planTier !== 'premium') return { disabled: true, label: '高级版专属' };
    // 其他功能默认可用
    return { disabled: false, label: '' };
  }

  // 渲染features时去重次数文案
  function renderFeatures(features: string[], plan: any) {
    const seen = new Set();
    return features.filter(f => {
      // 只保留第一个出现的“xx次/月”
      if (/\d+次\/月/.test(f)) {
        if (seen.has('usage')) return false;
        seen.add('usage');
        return true;
      }
      return true;
    }).map((feature, index) => {
      const { disabled, label } = getFeatureStatus(feature, plan.tier);
      return (
        <li key={index} className={`flex items-start space-x-3 ${disabled ? 'opacity-50 pointer-events-none select-none' : ''}`}>
          <Check className={`w-5 h-5 mt-0.5 ${plan.recommended ? 'text-purple-500' : 'text-green-500'}`} />
          <div className="flex items-center gap-2">
            <span className="font-medium">{feature}</span>
            {feature.includes('次/月') && (
              <Badge variant="outline" className={`ml-2 text-xs ${plan.recommended ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {plan.limits.adaptUsageLimit > 0 ? `${plan.limits.adaptUsageLimit}次/月` : '不限量'}
              </Badge>
            )}
            {feature.includes('tokens') && (
              <Badge variant="outline" className={`ml-2 text-xs ${plan.recommended ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                {plan.limits.tokenLimit.toLocaleString()} tokens
              </Badge>
            )}
            {disabled && label && (
              <Badge variant="outline" className="ml-2 text-xs bg-gray-100 text-gray-500 border-gray-300">{label}</Badge>
            )}
          </div>
        </li>
      );
    });
  }

  return (
    <section id="pricing" className="py-20 opacity-0 animate-fadeIn">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">选择适合您的方案</h2>
          <p className="mt-4 text-lg text-gray-600">从免费体验到高级版，全方位赋能新媒体创意工作者</p>
          
          <div className="mt-8 flex justify-center items-center space-x-4">
            <span className={billing === "monthly" ? "text-blue-600 font-semibold" : ""}>
              按月支付
            </span>
            <Switch
              checked={billing === "yearly"}
              onCheckedChange={(checked) => setBilling(checked ? "yearly" : "monthly")}
            />
            <span className={billing === "yearly" ? "text-blue-600 font-semibold" : ""}>
              按年支付 <span className="text-sm text-green-500">(更优惠)</span>
            </span>
          </div>
          {billing === "yearly" && (
            <div className="mt-2 text-center text-sm text-green-600">
              <p>专业版：年付省120元</p>
              <p>高级版：年付省300元</p>
            </div>
          )}
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
                
                <div className="mt-6">
                  {isTrial ? (
                    <div className="text-center">
                      <p className="text-5xl font-extrabold text-green-600">¥0</p>
                      <p className="text-gray-500">永久免费</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <p className={`text-5xl font-extrabold ${
                          isRecommended ? 'text-purple-600' : 'text-gray-900'
                        }`}>
                          ¥{pricing.discountPrice}
                        </p>
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-red-500 font-semibold">限时特惠</span>
                          <span className="text-xs text-gray-500 line-through">¥{pricing.originalPrice}</span>
                        </div>
                      </div>
                      <p className="text-gray-500">/{billing === "monthly" ? "月" : "年"}</p>
                      <p className="text-xs text-red-500 mt-1">省¥{pricing.savedAmount}</p>
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
                  onClick={() => isTrial ? window.location.href = '/login' : handlePlanClick(plan.id)}
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
          <h3 className="text-2xl font-bold text-center mb-8">功能详细对比</h3>
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
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">Token限制</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-gray-600">100,000</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="text-purple-600">200,000</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <span className="text-yellow-600">500,000</span>
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
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">全网雷达</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-red-500 font-medium">❌</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="text-red-500 font-medium">❌</span>
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
                      <span className="text-red-500 font-medium">❌</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <span className="text-green-600 font-medium">✅</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="border border-gray-200 px-6 py-3 font-medium text-gray-900">AI模型</td>
                    <td className="border border-gray-200 px-4 py-3 text-center">
                      <span className="text-gray-600">基础模型</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-purple-50">
                      <span className="text-purple-600 font-medium">高级模型</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center bg-yellow-50">
                      <span className="text-yellow-600 font-medium">最新模型</span>
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