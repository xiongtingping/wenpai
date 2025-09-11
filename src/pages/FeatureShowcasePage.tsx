/**
 * 功能展示页面
 * 展示所有最新功能和30分钟优惠倒计时
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedPermissionGuard } from '@/components/auth/UnifiedPermissionGuard';
import { useAuth } from '@/hooks/useAuth';
import { SUBSCRIPTION_PLANS, calculateDiscountCountdown, isInDiscountPeriod } from '@/config/subscriptionPlans';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  Smile, 
  TrendingUp, 
  BookOpen, 
  Palette, 
  Crown,
  Zap,
  Star,
  Clock,
  AlertTriangle,
  Gift
} from 'lucide-react';

const FeatureShowcasePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [discountCountdown, setDiscountCountdown] = useState(0);

  // 模拟新用户注册（用于演示）
  const simulateNewUser = () => {
    const now = new Date();
    updateUser({
      registrationDate: now.toISOString()
    });
  };

  // 计算倒计时
  useEffect(() => {
    if (user?.registrationDate) {
      const countdown = calculateDiscountCountdown(new Date(user.registrationDate));
      setDiscountCountdown(countdown);
      
      const timer = setInterval(() => {
        const newCountdown = calculateDiscountCountdown(new Date(user.registrationDate));
        setDiscountCountdown(newCountdown);
        if (newCountdown <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user?.registrationDate]);

  const features = [
    {
      id: 'hot-topics',
      name: '全网雷达',
      description: '实时热点话题追踪和分析',
      icon: <TrendingUp className="h-6 w-6" />,
      permission: 'auth:required' as const,
      tier: 'trial',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'creative-studio',
      name: '创意魔方',
      description: 'AI驱动的创意内容生成工具',
      icon: <Sparkles className="h-6 w-6" />,
      permission: 'feature:creative-studio' as const,
      tier: 'pro',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'brand-library',
      name: '品牌库',
      description: '企业级品牌资产管理系统',
      icon: <Palette className="h-6 w-6" />,
      permission: 'feature:brand-library' as const,
      tier: 'premium',
      color: 'bg-pink-100 text-pink-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground dark:text-background mb-4">
            🚀 文派全功能展示
          </h1>
          <p className="text-lg text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            体验最新的AI内容创作工具，解锁营销创意的无限可能
          </p>
        </div>

        {/* 限时优惠横幅 */}
        {user?.registrationDate && isInDiscountPeriod(new Date(user.registrationDate)) && discountCountdown > 0 && (
          <div className="mb-8">
            <Card className="promo-banner border-0 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-background/20 rounded-full">
                      <Gift className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">🔥 新用户限时优惠</h3>
                      <p className="text-background/90">专业版立享74折，高级版立享80折优惠</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="text-sm">剩余时间</span>
                    </div>
                    <CountdownTimer
                      initialSeconds={discountCountdown}
                      variant="compact"
                      showIcon={false}
                      className="promo-countdown-time text-2xl font-bold px-4 py-2 rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 演示按钮 */}
        {!user?.registrationDate && (
          <div className="text-center mb-8">
            <Button 
              onClick={simulateNewUser}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-background px-8 py-3 text-lg"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              模拟新用户注册（查看限时优惠）
            </Button>
          </div>
        )}

        {/* 订阅计划对比 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">选择适合您的计划</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${plan.recommended ? 'border-2 border-primary shadow-lg scale-105' : 'border'}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      推荐
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {plan.tier === 'premium' ? (
                      <Crown className="h-6 w-6 text-purple-600" />
                    ) : plan.tier === 'pro' ? (
                      <Zap className="h-6 w-6 text-primary" />
                    ) : (
                      <Star className="h-6 w-6 text-muted-foreground" />
                    )}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  
                  {/* 价格显示 */}
                  <div className="mt-4">
                    {plan.tier !== 'trial' && user?.registrationDate && isInDiscountPeriod(new Date(user.registrationDate)) ? (
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-lg text-muted-foreground line-through">
                            ¥{plan.monthly.originalPrice}
                          </span>
                          <Badge className="bg-destructive text-background text-xs">
                            -{plan.monthly.discountPercentage}%
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-destructive">
                          ¥{plan.monthly.discountPrice}
                        </div>
                        <div className="text-sm text-muted-foreground">每月</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold">
                          {plan.tier === 'trial' ? '免费' : `¥${plan.monthly.originalPrice}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {plan.tier === 'trial' ? '永久免费' : '每月'}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 6 && (
                      <li className="text-muted-foreground text-xs">
                        +{plan.features.length - 6} 更多功能...
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 功能展示区域 */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center mb-8">体验强大功能</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <UnifiedPermissionGuard
                key={feature.id}
                requiredPermission={feature.permission}
                featureName={feature.name}
                description={feature.description}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${feature.color}`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.tier === 'pro' ? '专业版功能' : '高级版功能'}
                    </Badge>
                  </CardContent>
                </Card>
              </UnifiedPermissionGuard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcasePage;
