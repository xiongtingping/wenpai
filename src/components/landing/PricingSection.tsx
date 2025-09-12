import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from "@/hooks/useAuth"
import { useI18n } from "@/hooks/useI18n"
import { Crown, Sparkles, Check, X, Star, TrendingUp, Zap } from "lucide-react"
import { getSubscriptionPlans } from "@/config/subscriptionPlans"
import { SubscriptionPeriod } from "@/types/subscription"
import {
  isInPromoPeriod,
  calculateRemainingTime,
  formatTimeLeft,
  getPaymentCenterAccessTime,
  shouldShowPromoOffer
} from "@/utils/paymentTimer";

export function PricingSection() {
  const [billing, setBilling] = useState<SubscriptionPeriod>("monthly")
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(0); // 添加毫秒级倒计时
  const [showPromoOffer, setShowPromoOffer] = useState(false);
  const { toast } = useToast()
  const { user: currentUser, isAuthenticated } = useAuth();
  const { t } = useI18n();

  const formattedTime = formatTimeLeft(timeLeft);
  const navigate = useNavigate()

  // 检查是否应该显示限时优惠
  useEffect(() => {
    if (!currentUser?.id) {
      setShowPromoOffer(false);
      return;
    }

    const checkPromoOffer = async () => {
      const shouldShow = await shouldShowPromoOffer(currentUser.id);
      setShowPromoOffer(shouldShow);
    };

    checkPromoOffer();
  }, [currentUser?.id]);

  // 限时优惠倒计时逻辑（包含毫秒，与支付中心保持一致）
  useEffect(() => {
    if (!currentUser?.id || !showPromoOffer) return;

    const updateTimer = () => {
      const remainingMs = calculateRemainingTime(currentUser.id);
      setTimeLeftMs(remainingMs);
      setTimeLeft(Math.floor(remainingMs / 1000)); // 保持秒数用于其他逻辑
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // 🔧 PERF FIX: 优化从100ms到1000ms，避免过度渲染

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
        title: t('home.pricing.redirectingToPayment'),
        description: t('home.pricing.completePaymentMessage'),
      });
    } else {
      // User is not logged in, redirect to login/register choice page
      localStorage.setItem("selectedPlan", planId);
      // login("/payment"); // This line is removed as per the edit hint
    
      toast({
        title: t('home.pricing.redirectingToLogin'),
        description: t('home.pricing.loginFirstMessage'),
      });
    }
  }

  // 判断功能是否为当前套餐专属
  function getFeatureStatus(feature: string, planTier: string) {
    // 这里可根据feature内容和planTier灵活判断
    const creativeCube = t('nav.creative') || '创意魔方';
    const brandLibrary = t('nav.brandLibrary') || '品牌库';
    
    if (feature.includes(creativeCube) || feature.includes('创意魔方') || feature.includes('Creative Cube')) {
      if (planTier === 'trial') return { disabled: true, label: t('home.pricing.comparisonTable.proExclusive') };
    }
    if (feature.includes(brandLibrary) || feature.includes('品牌库') || feature.includes('Brand Library')) {
      if (planTier !== 'premium') return { disabled: true, label: t('home.pricing.comparisonTable.premiumExclusive') };
    }
    if (feature.includes('高级模型') || feature.includes('Advanced')) {
      if (planTier === 'trial') return { disabled: true, label: t('home.pricing.comparisonTable.proExclusive') };
    }
    if (feature.includes('最新模型') || feature.includes('Latest')) {
      if (planTier !== 'premium') return { disabled: true, label: t('home.pricing.comparisonTable.premiumExclusive') };
    }
    // 其他功能默认可用
    return { disabled: false, label: '' };
  }

  // 渲染features时去掉右上角文案标签
  function renderFeatures(features: string[], plan: any) {
    return features
      .filter(f => !/免费|专业版|Free|Pro/.test(f))
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
          .replace(/创意工作室/g, t('nav.creative') || 'Creative Cube')
          .replace(/九宫格创意魔方/g, t('home.features.creative.title') || 'Nine-Grid Creative Cube')
          .replace(/专业功能/g, t('home.pricing.comparisonTable.advancedModels') || 'Advanced Features')
          .replace(/专业版/g, '') 
          .replace(/热点话题/g, m => m.replace('免费', '').replace('Free', ''))
          .replace(/\s+/g, ' ')
          .trim();

        return (
          <li key={index} className="flex items-start space-x-3">
            <Check className={`w-5 h-5 mt-0.5 text-foreground`} />
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium">{text}</span>
              {badgeType === 'new' && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-background text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                  NEW
                </span>
              )}
              {badgeType === 'up' && (
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-background text-xs px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
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
    <section id="pricing" className="py-6 relative overflow-hidden">

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        {/* 🎯 标题区域优化 */}
        <div className="text-center max-w-4xl mx-auto py-4">
          {/* 主标题 */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground leading-snug">
            {t('home.pricing.title')}
          </h2>

          {/* 副标题 */}
          <p className="text-base text-muted-foreground text-center mt-1 leading-relaxed">
            {t('home.pricing.subtitle')}
          </p>

          {/* 限时优惠倒计时 - 完全照搬支付中心设计 */}
          {currentUser?.id && showPromoOffer && timeLeft > 0 && (
            <div className="text-center mt-6 mb-8">
              <div className="promo-banner text-background px-8 py-6 rounded-2xl shadow-xl max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Zap className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">{t('home.pricing.limitedTimeOffer')}</span>
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

                <div className="text-xs opacity-90">{t('home.pricing.offerEndingSoon')}</div>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex justify-center items-center space-x-4">
            <Button
              onClick={() => setBilling("monthly")}
              className={`pricing-button-monthly ${billing === "monthly" ? "active" : "inactive"}`}
            >
              {t('home.pricing.monthlyBilling')}
            </Button>
            <Switch
              checked={billing === "yearly"}
              onCheckedChange={(checked) => setBilling(checked ? "yearly" : "monthly")}
              className="mx-4"
            />
            <Button
              onClick={() => setBilling("yearly")}
              className={`pricing-button-yearly ${billing === "yearly" ? "active" : "inactive"}`}
            >
              <span className="relative z-10 drop-shadow-sm">
                {t('home.pricing.yearlyBilling')} <span className="text-xs ml-1 font-extrabold text-yellow-200">({t('home.pricing.yearlyDiscount')})</span>
              </span>
              {billing === "yearly" && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse"></div>
              )}
            </Button>
          </div>

        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {getSubscriptionPlans().map((plan) => {
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
                    {t('home.pricing.recommended')}
                  </span>
                )}
                {isPremium && (
                  <span className="absolute top-0 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-background text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-purple/20">
                    <Crown className="w-3 h-3 mr-1 inline fill-current" />
                    {billing === 'yearly' ? t('home.pricing.moreSavings') : t('home.pricing.allFeatures')}
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
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>
                
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                
                <div className="mt-6 pricing-container">
                  {isTrial ? (
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-2">
                        <div className="text-5xl font-extrabold text-foreground pricing-price">
                          <span className="pricing-price-text">¥0</span>
                        </div>
                        <span className="text-base text-muted-foreground">{t('home.pricing.permanentFree')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      {isAuthenticated && showPromoOffer ? (
                        <div className="flex items-baseline justify-center gap-2">
                          <div className="text-5xl font-extrabold pricing-price text-foreground">
                            <span className="pricing-price-text">¥{pricing.discountPrice}</span>
                          </div>
                          <span className="text-base text-muted-foreground">/{billing === "monthly" ? t('home.pricing.monthShort') : t('home.pricing.yearShort')}</span>
                          <div className="flex flex-col items-start ml-2">
                            <span className="text-xs text-destructive font-semibold">{t('home.pricing.limitedDiscount')}</span>
                            <span className="text-xs text-muted-foreground line-through">¥{pricing.originalPrice}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-center gap-2">
                          <div className="text-5xl font-extrabold pricing-price text-foreground">
                            <span className="pricing-price-text">¥{pricing.originalPrice}</span>
                          </div>
                          <span className="text-base text-muted-foreground">/{billing === "monthly" ? t('home.pricing.monthShort') : t('home.pricing.yearShort')}</span>
                        </div>
                      )}
                      {isAuthenticated && showPromoOffer && (
                        <p className="text-xs text-destructive mt-1">{t('home.pricing.savedAmount')}{pricing.savedAmount}</p>
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
                  className={`mt-8 w-full font-semibold transition-all duration-300 flex items-center justify-center text-center ${
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
                      <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                      {t('home.pricing.startFreeUse')}
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2 flex-shrink-0" />
                      {t('home.pricing.upgradeToTitle')}{plan.name}
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
            <h3 className="text-xl font-bold text-foreground">{t('home.pricing.comparisonTable.title')}</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="max-w-6xl mx-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-accent">
                  <tr>
                    <th className="border border-border px-6 py-3 text-left font-semibold text-foreground">{t('home.pricing.comparisonTable.feature')}</th>
                    <th className="border border-border px-4 py-3 text-center font-semibold text-foreground w-32">{t('home.pricing.trialVersion')}</th>
                    <th className="border border-border px-4 py-3 text-center font-semibold text-foreground w-32">{t('home.pricing.professionalVersion')}</th>
                    <th className="border border-border px-4 py-3 text-center font-semibold text-foreground w-32">{t('home.pricing.premiumVersion')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">{t('home.pricing.comparisonTable.aiContentAdapter')}</td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="inline-block bg-accent text-foreground text-xs px-2 py-1 rounded-full">10{t('home.pricing.comparisonTable.timesPerMonth')}</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="inline-block bg-accent text-foreground text-xs px-2 py-1 rounded-full">30{t('home.pricing.comparisonTable.timesPerMonth')}</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="inline-block bg-accent text-foreground text-xs px-2 py-1 rounded-full">{t('home.pricing.comparisonTable.unlimited')}</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">{t('home.pricing.comparisonTable.hotRadar')}</td>
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
                    <td className="border border-border px-6 py-3 font-medium text-foreground">{t('home.pricing.comparisonTable.creativeCube')}</td>
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
                    <td className="border border-border px-6 py-3 font-medium text-foreground">{t('home.pricing.comparisonTable.myLibrary')}</td>
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
                    <td className="border border-border px-6 py-3 font-medium text-foreground">{t('home.pricing.comparisonTable.brandLibrary')}</td>
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
                    <td className="border border-border px-6 py-3 font-medium text-foreground">{t('home.pricing.comparisonTable.aiModels')}</td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-muted-foreground pricing-table-text">{t('home.pricing.comparisonTable.basicModels')}</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="text-foreground font-medium pricing-table-text">{t('home.pricing.comparisonTable.advancedModels')}</span>
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <div className="text-foreground font-medium text-xs leading-tight pricing-table-cell">
                        <div className="pricing-table-text">{t('home.pricing.comparisonTable.advancedAndLatest').split(' ')[0]}</div>
                        <div className="pricing-table-text">{t('home.pricing.comparisonTable.advancedAndLatest').split(' ')[1] || ''}</div>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-accent/50 transition-colors">
                    <td className="border border-border px-6 py-3 font-medium text-foreground">{t('home.pricing.comparisonTable.tokenLimit')}</td>
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