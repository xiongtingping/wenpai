import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext"
import { Crown, Sparkles, Check, X, Star, TrendingUp, Zap } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans"
import { SubscriptionPeriod } from "@/types/subscription"
import {
  isInPromoPeriod,
  calculateRemainingTime,
  formatTimeLeft,
  getPaymentCenterAccessTime
} from "@/utils/paymentTimer";

export function PricingSection() {
  const [billing, setBilling] = useState<SubscriptionPeriod>("monthly")
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(0); // 添加毫秒级倒计时
  const { toast } = useToast()
  const { user: currentUser, isAuthenticated } = useUnifiedAuth();

  // 使用统一认证状态
  const inPromo = isInPromoPeriod(currentUser?.id);
  const formattedTime = formatTimeLeft(timeLeft);
  const navigate = useNavigate()

  // 限时优惠倒计时逻辑（包含毫秒，与支付中心保持一致）
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

  // 页面访问时记录时间（用于限时优惠）
  useEffect(() => {
    if (currentUser?.id) {
      // 获取或创建支付中心访问时间
      const accessTime = getPaymentCenterAccessTime(currentUser.id);
      console.log('首页访问支付中心时间:', accessTime?.toLocaleString());

      // 立即更新倒计时
      const remainingMs = calculateRemainingTime(currentUser.id);
      const remainingSeconds = Math.floor(remainingMs / 1000);
      setTimeLeft(remainingSeconds);

      console.log('首页剩余优惠时间:', remainingSeconds, '秒');
    }
  }, [currentUser?.id]);

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
        // 解析功能标记
        let originalFeature = feature;
        let badgeType = null;

        if (feature.includes('|new')) {
          originalFeature = feature.replace('|new', '');
          badgeType = 'new';
        } else if (feature.includes('|up')) {
          originalFeature = feature.replace('|up', '');
          badgeType = 'up';
        }

        const text = originalFeature
          .replace(/创意工作室/g, '创意魔方') // 替换
          .replace(/九宫格创意魔方/g, '九宫格创意魔方法') // 替换
          .replace(/专业功能/g, '更多功能') // 替换
          .replace(/专业版/g, '') // 去除专业版
          .replace(/热点话题/g, m => m.replace('免费', '')) // 去除热点话题下免费
          .replace(/\s+/g, ' ') // 清理多余空格
          .trim();

        return (
          <li key={index} className="flex items-start space-x-3">
            <Check className={`w-5 h-5 mt-0.5 text-foreground`} />
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium">{text}</span>
              {badgeType === 'new' && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                  NEW
                </span>
              )}
              {badgeType === 'up' && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  UP
                </span>
              )}
            </div>
          </li>
        );
      });
  }

  return (
    <section id="pricing" className="py-12 relative overflow-hidden">
      
      <div className="container mx-auto px-4 md:px-12 relative z-10">
        {/* 🎯 标题区域优化 */}
        <div className="text-center max-w-4xl mx-auto py-12">
          {/* 主标题 */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground leading-snug">
            选择适合您的方案
          </h2>
          
          {/* 副标题 */}
          <p className="text-base text-muted-foreground text-center mt-2 leading-relaxed">
            从免费体验到高级版，全方位赋能新媒体创意工作者
          </p>
          

          {/* 限时优惠倒计时 - 完全照搬支付中心设计 */}
          {currentUser?.id && isInPromoPeriod(currentUser.id) && timeLeft > 0 && (
            <div className="text-center mt-6 mb-8">
              <div className="promo-banner text-white px-8 py-6 rounded-2xl shadow-xl max-w-lg mx-auto">
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
          
          <div className="mt-8 flex justify-center items-center space-x-4">
            <Button
              onClick={() => setBilling("monthly")}
              style={{
                background: billing === "monthly" ? "#2563eb" : "#e5e7eb",
                color: billing === "monthly" ? "white !important" : "#374151 !important",
                border: billing === "monthly" ? "none" : "1px solid #d1d5db",
                padding: "12px 24px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                borderRadius: "6px"
              }}
            >
              按月支付
            </Button>
            <Switch
              checked={billing === "yearly"}
              onCheckedChange={(checked) => setBilling(checked ? "yearly" : "monthly")}
              className="mx-4"
            />
            <Button
              onClick={() => setBilling("yearly")}
              style={{
                background: billing === "yearly"
                  ? "linear-gradient(to right, #f97316, #ef4444, #ec4899)"
                  : "linear-gradient(to right, #fbbf24, #f97316, #ef4444)",
                color: "white !important",
                border: billing === "yearly" ? "none" : "2px solid #f59e0b",
                boxShadow: billing === "yearly"
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transform: billing === "yearly" ? "scale(1.1)" : "scale(1.08)",
                padding: "12px 24px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                borderRadius: "6px"
              }}
            >
              <span className="relative z-10 drop-shadow-sm">
                按年订阅 <span className="text-xs ml-1 font-extrabold text-yellow-200">(立省17%)</span>
              </span>
              {billing === "yearly" && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse"></div>
              )}
            </Button>
          </div>

        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const pricing = billing === 'monthly' ? plan.monthly : plan.yearly;
            const isRecommended = plan.recommended;
            const isPremium = plan.premiumLabel;
            const isTrial = plan.tier === 'trial';

            return (
              <Card
                key={plan.id}
                className="border-2 border-border p-8 flex flex-col relative transition-all duration-300 hover:shadow-lg hover:border-border-strong dark:bg-card/50 backdrop-blur-sm"
              >
                {isRecommended && (
                  <span className="absolute top-0 -translate-y-1/2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-primary/20">
                    <Star className="w-3 h-3 mr-1 inline fill-current" />
                    推荐
                  </span>
                )}
                {isPremium && (
                  <span className="absolute top-0 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-purple/20">
                    <Crown className="w-3 h-3 mr-1 inline fill-current" />
                    {billing === 'yearly' ? '更省' : '全部功能'}
                  </span>
                )}
                
                <div className="flex items-center gap-2 mb-4">
                  {plan.tier === 'premium' ? (
                    <Crown className="w-6 h-6 text-foreground" />
                  ) : plan.tier === 'pro' ? (
                    <Crown className="w-6 h-6 text-foreground" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-foreground" />
                  )}
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                </div>
                
                <p className="mt-2 text-muted-foreground">{plan.description}</p>
                
                <div className="mt-6 pricing-container">
                  {isTrial ? (
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-2">
                        <div className="text-5xl font-extrabold text-foreground pricing-price">
                          <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>¥0</span>
                        </div>
                        <span className="text-lg text-muted-foreground">永久免费</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      {isAuthenticated && inPromo ? (
                        <div className="flex items-baseline justify-center gap-2">
                          <div className="text-5xl font-extrabold pricing-price text-foreground">
                            <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>¥{pricing.discountPrice}</span>
                          </div>
                          <span className="text-lg text-muted-foreground">/{billing === "monthly" ? "月" : "年"}</span>
                          <div className="flex flex-col items-start ml-2">
                            <span className="text-xs text-destructive font-semibold">限时特惠</span>
                            <span className="text-xs text-muted-foreground line-through">¥{pricing.originalPrice}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-center gap-2">
                          <div className="text-5xl font-extrabold pricing-price text-foreground">
                            <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>¥{pricing.originalPrice}</span>
                          </div>
                          <span className="text-lg text-muted-foreground">/{billing === "monthly" ? "月" : "年"}</span>
                        </div>
                      )}
                      {isAuthenticated && inPromo && (
                        <p className="text-xs text-destructive mt-1">省¥{pricing.savedAmount}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <ul className="mt-8 space-y-4 text-muted-foreground flex-grow">
                  {renderFeatures(plan.features, plan)}
                </ul>
                
                <Button
                  variant={isRecommended ? "gradient" : "default"}
                  size="lg"
                  className={`mt-8 w-full font-semibold transition-all duration-300 ${
                    isRecommended
                      ? 'shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'shadow-md hover:shadow-lg hover:-translate-y-0.5'
                  } ${
                    isTrial
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-0'
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
            <h3 className="text-2xl font-bold text-foreground">功能详细对比</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="max-w-6xl mx-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-accent">
                  <tr>
                    <th className="border border-border px-6 py-3 text-left font-semibold text-foreground">功能</th>
                    <th className="border border-border px-4 py-3 text-center font-semibold text-foreground w-32">体验版</th>
                    <th className="border border-border px-4 py-3 text-center font-semibold text-foreground w-32">专业版</th>
                    <th className="border border-border px-4 py-3 text-center font-semibold text-foreground w-32">高级版</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">AI内容适配器</td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="inline-block bg-accent text-foreground text-xs px-2 py-1 rounded-full">10次/月</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="inline-block bg-accent text-foreground text-xs px-2 py-1 rounded-full">30次/月</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="inline-block bg-accent text-foreground text-xs px-2 py-1 rounded-full">不限量</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">全网雷达</td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium">✅</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium">✅</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium">✅</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">创意魔方</td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-destructive font-medium">❌</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium">✅</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium">✅</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">我的资料库</td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium">✅</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium">✅</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium">✅</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">品牌库</td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-destructive font-medium">❌</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-destructive font-medium">❌</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium">✅</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">AI模型</td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-muted-foreground pricing-table-text">基础模型</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium pricing-table-text">高级模型</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <div className="text-foreground font-medium text-xs leading-tight pricing-table-cell">
                        <div className="pricing-table-text">高级及</div>
                        <div className="pricing-table-text">最新模型</div>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">Token限制</td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-muted-foreground pricing-table-number">100,000</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground pricing-table-number">200,000</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground pricing-table-number">500,000</span>
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