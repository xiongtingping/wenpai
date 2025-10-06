/**
 * 简洁版权限升级卡片
 * @description 替代完整定价方案,提供更清晰的升级提示
 * @created 2025-10-02
 */

import React from 'react';
import { Lock, Crown, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { SubscriptionTier } from '@/types/subscription';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';

interface CompactPermissionCardProps {
  /** 功能名称 */
  featureName: string;
  /** 功能描述 */
  description?: string;
  /** 所需订阅等级 */
  requiredTier: SubscriptionTier;
  /** 升级点击回调 */
  onUpgrade: () => void;
  /** 是否显示限时优惠 */
  showDiscount?: boolean;
  /** 限时优惠倒计时(秒) */
  discountCountdown?: number;
}

/**
 * 获取等级图标
 */
const getTierIcon = (tier: SubscriptionTier) => {
  switch (tier) {
    case 'premium':
      return <Crown className="h-5 w-5 text-purple-500" />;
    case 'pro':
      return <Zap className="h-5 w-5 text-blue-500" />;
    default:
      return <Sparkles className="h-5 w-5 text-gray-500" />;
  }
};

/**
 * 获取等级颜色
 */
const getTierColor = (tier: SubscriptionTier) => {
  switch (tier) {
    case 'premium':
      return 'from-purple-500 to-pink-500';
    case 'pro':
      return 'from-blue-500 to-cyan-500';
    default:
      return 'from-gray-400 to-gray-500';
  }
};

/**
 * 简洁版权限升级卡片组件
 */
export const CompactPermissionCard: React.FC<CompactPermissionCardProps> = ({
  featureName,
  description,
  requiredTier,
  onUpgrade,
  showDiscount = false,
  discountCountdown = 0
}) => {
  const subscriptionPlan = getSubscriptionPlan(requiredTier);
  const tierIcon = getTierIcon(requiredTier);
  const tierColor = getTierColor(requiredTier);

  // 格式化倒计时
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-card border max-w-md mx-auto">
      <CardContent className="p-6">
        {/* 标题区域 */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <Lock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
              功能已锁定
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {featureName}
            </p>
          </div>
        </div>

        {/* 描述 */}
        {description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {description}
          </p>
        )}

        {/* 所需版本信息 */}
        <div className={`bg-gradient-to-r ${tierColor} rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-between text-white mb-2">
            <div className="flex items-center gap-2">
              {tierIcon}
              <span className="font-semibold">{subscriptionPlan.name}</span>
            </div>
            {showDiscount && discountCountdown > 0 ? (
              <Badge className="bg-white/20 text-white border-white/30">
                {formatCountdown(discountCountdown)}
              </Badge>
            ) : (
              <span className="text-lg font-bold">
                {requiredTier === 'trial'
                  ? '免费'
                  : `¥${showDiscount && discountCountdown > 0
                      ? subscriptionPlan.monthly.discountPrice
                      : subscriptionPlan.monthly.originalPrice}/月`
                }
              </span>
            )}
          </div>

          {/* 核心特性 */}
          <div className="space-y-1 text-white/90 text-sm">
            {subscriptionPlan.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-white/60" />
                <span>{feature.replace(/\|.*$/, '').trim()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 限时优惠提示 */}
        {showDiscount && discountCountdown > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                限时优惠 -{subscriptionPlan.monthly.discountPercentage}%
                <span className="ml-2 text-xs">
                  立省¥{subscriptionPlan.monthly.savedAmount}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* 升级按钮 */}
        <Button
          onClick={onUpgrade}
          className={`w-full bg-gradient-to-r ${tierColor} hover:opacity-90 text-white font-semibold shadow-lg`}
          size="lg"
        >
          <Crown className="h-4 w-4 mr-2" />
          立即升级解锁
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* 底部提示 */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
          升级后即可使用所有{subscriptionPlan.name}功能
        </p>
      </CardContent>
    </Card>
  );
};

export default CompactPermissionCard;
