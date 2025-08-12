/**
 * 权限升级卡片组件
 * 替换原有的权限遮罩弹窗，采用清晰的版本对比界面
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';
import { 
  Crown, 
  Star, 
  Check, 
  Lock, 
  Zap, 
  Sparkles,
  ArrowRight 
} from 'lucide-react';

interface PermissionUpgradeCardProps {
  /** 功能名称 */
  featureName: string;
  /** 所需权限等级 */
  requiredTier: 'pro' | 'premium';
  /** 功能描述 */
  description?: string;
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示当前版本对比 */
  showComparison?: boolean;
}

export const PermissionUpgradeCard: React.FC<PermissionUpgradeCardProps> = ({
  featureName,
  requiredTier,
  description,
  className = '',
  showComparison = true
}) => {
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();

  // 获取用户当前等级
  const getCurrentTier = (): 'trial' | 'pro' | 'premium' => {
    if (!user) return 'trial';
    // 这里应该根据实际的用户数据判断等级
    // 暂时返回 trial，实际应该从用户数据中获取
    return 'trial';
  };

  const currentTier = getCurrentTier();
  
  // 获取相关的订阅计划
  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.tier === currentTier);
  const requiredPlan = SUBSCRIPTION_PLANS.find(plan => plan.tier === requiredTier);
  const allPlans = SUBSCRIPTION_PLANS.filter(plan => plan.tier !== 'trial');

  // 处理升级点击
  const handleUpgrade = (planId: string) => {
    localStorage.setItem('selectedPlan', planId);
    navigate('/payment');
  };

  // 获取计划图标
  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'trial':
        return <Sparkles className="h-5 w-5 text-gray-500" />;
      case 'pro':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'premium':
        return <Crown className="h-5 w-5 text-purple-500" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  // 获取计划颜色主题
  const getPlanTheme = (tier: string, isSelected: boolean = false) => {
    const themes = {
      trial: {
        border: isSelected ? 'border-gray-400' : 'border-gray-200',
        bg: isSelected ? 'bg-gray-50' : 'bg-white',
        badge: 'bg-gray-100 text-gray-800',
        button: 'bg-gray-600 hover:bg-gray-700'
      },
      pro: {
        border: isSelected ? 'border-blue-400' : 'border-blue-200',
        bg: isSelected ? 'bg-blue-50' : 'bg-white',
        badge: 'bg-blue-100 text-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      premium: {
        border: isSelected ? 'border-purple-400' : 'border-purple-200',
        bg: isSelected ? 'bg-purple-50' : 'bg-white',
        badge: 'bg-purple-100 text-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700'
      }
    };
    return themes[tier as keyof typeof themes] || themes.trial;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 功能说明头部 */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold">解锁 {featureName}</h2>
          <Badge className={getPlanTheme(requiredTier).badge}>
            需要 {requiredPlan?.name}
          </Badge>
        </div>
        
        {description && (
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        )}
      </div>

      {/* 版本对比卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {/* 当前版本 */}
        <Card className={`relative ${getPlanTheme(currentTier, true).border} ${getPlanTheme(currentTier, true).bg}`}>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getPlanIcon(currentTier)}
              <CardTitle className="text-lg">{currentPlan?.name}</CardTitle>
            </div>
            <Badge variant="outline" className="mx-auto">
              当前版本
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ¥{currentPlan?.monthly.discountPrice || 0}
              </div>
              <div className="text-sm text-muted-foreground">/月</div>
            </div>
            
            {/* 功能列表 */}
            <div className="space-y-2">
              {currentPlan?.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
              
              {/* 受限功能 */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 flex-shrink-0" />
                <span className="line-through">{featureName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 升级箭头 */}
        <div className="hidden md:flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium text-primary">升级解锁</span>
          </div>
        </div>

        {/* 目标版本 */}
        {allPlans.map((plan) => {
          const isTargetPlan = plan.tier === requiredTier;
          const isRecommended = plan.recommended;
          const theme = getPlanTheme(plan.tier, isTargetPlan);

          if (!isTargetPlan && allPlans.length > 1) return null; // 只显示目标版本

          return (
            <Card
              key={plan.id}
              className={`relative ${theme.border} ${theme.bg} ${isTargetPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    推荐
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getPlanIcon(plan.tier)}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <Badge className={theme.badge}>
                  所需版本
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ¥{plan.monthly.discountPrice}
                  </div>
                  <div className="text-sm text-muted-foreground">/月</div>
                  {plan.monthly.originalPrice > plan.monthly.discountPrice && (
                    <div className="text-xs text-muted-foreground line-through">
                      原价 ¥{plan.monthly.originalPrice}
                    </div>
                  )}
                </div>

                {/* 功能列表 */}
                <div className="space-y-2">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}

                  {/* 解锁的功能 */}
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Star className="h-4 w-4 flex-shrink-0" />
                    <span>✨ {featureName}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full ${theme.button} text-white`}
                  size="lg"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  立即升级到 {plan.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 底部说明 */}
      <div className="text-center text-sm text-muted-foreground">
        <p>升级后立即解锁 {featureName} 功能，享受更多专业特性</p>
        <p className="mt-1">随时可取消，支持月付和年付</p>
      </div>
    </div>
  );
};
