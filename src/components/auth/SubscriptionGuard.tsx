/**
 * 订阅权限守卫组件
 * @description 基于用户订阅等级控制功能访问，支持透明遮罩模式
 * @author 权限系统团队
 * @created 2025-08-12
 */

import React, { useMemo } from 'react';
import { Lock, Crown, Zap, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import type { SubscriptionTier } from '@/types/subscription';

interface SubscriptionGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 所需的最低订阅等级 */
  requiredTier: SubscriptionTier;
  /** 功能名称 */
  featureName: string;
  /** 功能描述 */
  description?: string;
  /** 是否显示透明遮罩（允许查看但不能使用） */
  showOverlay?: boolean;
  /** 遮罩透明度 */
  overlayOpacity?: number;
  /** 自定义样式类名 */
  className?: string;
  /** 无权限时的回退组件 */
  fallback?: React.ReactNode;
  /** 是否禁用点击事件 */
  disableInteraction?: boolean;
}

/**
 * 获取用户当前订阅等级
 */
const getUserTier = (user: any): SubscriptionTier => {
  // 优先从用户订阅信息获取
  if (user?.subscription?.tier) {
    return user.subscription.tier;
  }
  
  // 从用户VIP等级推断
  if (user?.vipLevel === 'premium') return 'premium';
  if (user?.vipLevel === 'pro') return 'pro';
  if (user?.isVip) return 'pro';
  
  // 从权限推断
  if (user?.permissions?.includes('tier:premium')) return 'premium';
  if (user?.permissions?.includes('tier:pro')) return 'pro';
  
  // 默认为体验版
  return 'trial';
};

/**
 * 检查订阅等级是否满足要求
 */
const checkTierPermission = (userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean => {
  const tierLevels = { trial: 0, pro: 1, premium: 2 };
  return tierLevels[userTier] >= tierLevels[requiredTier];
};

/**
 * 获取等级信息
 */
const getTierInfo = (tier: SubscriptionTier) => {
  // 从订阅计划配置中获取真实数据
  const subscriptionPlan = getSubscriptionPlan(tier);

  // ✅ FIXED: 2025-08-30 遵循 api_prohibit_local_mock_error 规则  
  // 如果找不到订阅计划，抛出错误而非使用降级配置
  if (!subscriptionPlan) {
    throw new Error(`无法获取订阅计划配置: ${tier}，请检查API连接状态`);
  }

  const usageText = subscriptionPlan.limits.adaptUsageLimit === -1
    ? '不限次数'
    : `${subscriptionPlan.limits.adaptUsageLimit}次/月`;

  const tokenText = subscriptionPlan.limits.tokenLimit === -1
    ? '不限Token'
    : `${(subscriptionPlan.limits.tokenLimit / 10000).toFixed(0)}万Token/月`;

  return {
    name: subscriptionPlan.name,
    price: tier === 'trial' ? '免费' : `¥${subscriptionPlan.monthly.discountPrice}/月`,
    icon: tier === 'trial' ? <Star className="h-4 w-4" /> :
          tier === 'pro' ? <Zap className="h-4 w-4" /> :
          <Crown className="h-4 w-4" />,
    color: tier === 'trial' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
           tier === 'pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
           'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    features: [
      usageText,
      tokenText,
      ...subscriptionPlan.limits.availableFeatures
    ]
  };
};

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredTier,
  featureName,
  description,
  showOverlay = true,
  overlayOpacity = 0.85,
  className = '',
  fallback,
  disableInteraction = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 获取用户当前等级
  const userTier = useMemo(() => {
    if (!isAuthenticated || !user) return 'trial';
    return getUserTier(user);
  }, [user, isAuthenticated]);

  // 检查权限
  const hasPermission = useMemo(() => {
    return checkTierPermission(userTier, requiredTier);
  }, [userTier, requiredTier]);

  // 获取所需等级信息
  const requiredTierInfo = getTierInfo(requiredTier);
  const currentTierInfo = getTierInfo(userTier);

  // 处理升级
  const handleUpgrade = () => {
    navigate('/payment');
  };

  // 如果有权限，直接渲染子组件
  if (hasPermission) {
    return <>{children}</>;
  }

  // 如果不显示遮罩，使用回退组件
  if (!showOverlay) {
    return <>{fallback || <div className="text-center text-muted-foreground">需要 {requiredTierInfo.name} 权限</div>}</>;
  }

  // 渲染带遮罩的组件
  return (
    <div className={`relative ${className}`}>
      {/* 原始内容 - 半透明显示 */}
      <div 
        className={`relative ${disableInteraction ? 'pointer-events-none select-none' : ''}`}
        style={{ 
          opacity: 1 - overlayOpacity + 0.3,
          filter: 'blur(0.5px)'
        }}
      >
        {children}
      </div>

      {/* 权限遮罩 */}
      <div 
        className="absolute inset-0 z-50 flex items-center justify-center p-4"
        style={{ 
          backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})`,
          backdropFilter: 'blur(2px)'
        }}
      >
        <Card className="w-full max-w-md shadow-2xl border-2">
          <CardContent className="p-6 text-center">
            {/* 锁定图标和标题 */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 mr-3">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-foreground">
                  解锁 {featureName}
                </h3>
                <Badge className={`text-xs px-2 py-1 ${requiredTierInfo.color}`}>
                  需要 {requiredTierInfo.name}
                </Badge>
              </div>
            </div>

            {/* 功能描述 */}
            {description && (
              <p className="text-sm text-muted-foreground mb-4">
                {description}
              </p>
            )}

            {/* 当前等级 vs 所需等级 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">当前版本</div>
                <Badge className={`${currentTierInfo.color} flex items-center gap-1`}>
                  {currentTierInfo.icon}
                  {currentTierInfo.name}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">所需版本</div>
                <Badge className={`${requiredTierInfo.color} flex items-center gap-1`}>
                  {requiredTierInfo.icon}
                  {requiredTierInfo.name}
                </Badge>
              </div>
            </div>

            {/* 升级后功能 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center justify-center gap-2">
                {requiredTierInfo.icon}
                升级到 {requiredTierInfo.name}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {requiredTierInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm justify-center">
                    <Star className="h-3 w-3 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 升级按钮 */}
            <Button 
              onClick={handleUpgrade} 
              className="w-full flex items-center gap-2"
              size="lg"
            >
              <Crown className="h-4 w-4" />
              立即升级到 {requiredTierInfo.name}
              <ArrowRight className="h-4 w-4" />
            </Button>

            {/* 价格信息 */}
            <div className="mt-4 text-xs text-muted-foreground">
              {requiredTierInfo.price} • 随时可取消
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * 订阅权限检查Hook
 */
export const useSubscriptionGuard = (requiredTier: SubscriptionTier) => {
  const { user, isAuthenticated } = useAuth();

  return useMemo(() => {
    const userTier = getUserTier(user);
    const hasPermission = checkTierPermission(userTier, requiredTier);
    
    return {
      hasPermission,
      userTier,
      requiredTier,
      needsUpgrade: !hasPermission
    };
  }, [user, isAuthenticated, requiredTier]);
};

export default SubscriptionGuard;
