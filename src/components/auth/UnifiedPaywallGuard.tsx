/**
 * 🔐 统一混合付费墙守卫组件
 * 实现统一的按钮加锁提示升级UI，支持多种使用场景
 * 
 * 设计原则：
 * - 所有功能入口对免费用户可见，但不可使用
 * - 按钮灰色或加锁，点击时弹出「升级解锁」提示
 * - 前端权限守卫 + 后端订阅校验的混合模式
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, Zap, Star, AlertCircle } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserTier, hasPermission, getTierDisplayName } from '@/utils/subscriptionUtils';

export type SubscriptionTier = 'trial' | 'pro' | 'premium';

export interface UnifiedPaywallGuardProps {
  children: React.ReactNode;
  /** 所需的最低订阅等级 */
  requiredTier: SubscriptionTier;
  /** 功能名称 */
  featureName: string;
  /** 功能描述 */
  description?: string;
  /** 显示模式 */
  mode?: 'button' | 'overlay' | 'badge' | 'disabled';
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示升级提示 */
  showUpgradeHint?: boolean;
  /** 自定义升级按钮文本 */
  upgradeButtonText?: string;
}

/**
 * 获取等级配置
 */
const getTierConfig = (tier: SubscriptionTier) => {
  const configs = {
    trial: {
      name: '体验版',
      icon: <Star className="h-4 w-4" />,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      price: '免费'
    },
    pro: {
      name: '专业版',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      price: '¥39/月'
    },
    premium: {
      name: '高级版',
      icon: <Crown className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      price: '¥99/月'
    }
  };
  return configs[tier];
};

/**
 * 统一混合付费墙守卫组件
 */
export const UnifiedPaywallGuard: React.FC<UnifiedPaywallGuardProps> = ({
  children,
  requiredTier,
  featureName,
  description,
  mode = 'button',
  className = '',
  showUpgradeHint = true,
  upgradeButtonText = '立即升级'
}) => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const navigate = useNavigate();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // 获取用户当前等级
  const userTier = useMemo(() => {
    if (!isAuthenticated || !user) return 'trial';
    return getUserTier(user);
  }, [user, isAuthenticated]);

  // 检查权限
  const hasAccess = useMemo(() => {
    return hasPermission(user, requiredTier);
  }, [user, requiredTier]);

  // 获取等级配置
  const currentTierConfig = getTierConfig(userTier);
  const requiredTierConfig = getTierConfig(requiredTier);

  // 处理升级点击
  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUpgradeDialog(true);
  };

  // 处理升级确认
  const handleUpgradeConfirm = () => {
    setShowUpgradeDialog(false);
    navigate('/payment');
  };

  // 如果有权限，直接渲染
  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // 渲染不同模式的付费墙
  const renderPaywall = () => {
    switch (mode) {
      case 'button':
        return (
          <div className={`relative ${className}`}>
            <div className="opacity-50 pointer-events-none select-none">
              {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpgradeClick}
                className="bg-background/95 backdrop-blur-sm border-dashed shadow-sm"
              >
                <Lock className="h-3 w-3 mr-2" />
                升级解锁
              </Button>
            </div>
          </div>
        );

      case 'overlay':
        return (
          <div className={`relative ${className}`}>
            <div className="opacity-60">
              {children}
            </div>
            <div 
              className="absolute inset-0 bg-background/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer hover:bg-background/40 transition-colors"
              onClick={handleUpgradeClick}
            >
              <div className="text-center p-4 bg-background/90 rounded-lg shadow-lg border max-w-xs">
                <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">{featureName}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  需要 {requiredTierConfig.name} 解锁
                </p>
                <Button size="sm" className="w-full">
                  {upgradeButtonText}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'badge':
        return (
          <div className={`relative ${className}`}>
            <div className="opacity-75">
              {children}
            </div>
            <div className="absolute top-2 right-2 z-10">
              <Badge 
                variant="secondary" 
                className="bg-background/90 backdrop-blur-sm border-dashed cursor-pointer hover:bg-background"
                onClick={handleUpgradeClick}
              >
                <Lock className="h-3 w-3 mr-1" />
                {requiredTierConfig.name}
              </Badge>
            </div>
          </div>
        );

      case 'disabled':
        return (
          <div className={`relative ${className}`}>
            <div className="opacity-40 pointer-events-none select-none grayscale">
              {children}
            </div>
            {showUpgradeHint && (
              <div className="absolute bottom-2 left-2 z-10">
                <Badge 
                  variant="outline" 
                  className="bg-background/90 backdrop-blur-sm text-xs cursor-pointer"
                  onClick={handleUpgradeClick}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  需要升级
                </Badge>
              </div>
            )}
          </div>
        );

      default:
        return <div className={className}>{children}</div>;
    }
  };

  return (
    <>
      {renderPaywall()}

      {/* 升级对话框 */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              升级解锁 {featureName}
            </DialogTitle>
            <DialogDescription>
              {description || `${featureName} 需要 ${requiredTierConfig.name} 或更高版本才能使用。升级后即可享受完整功能。`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 版本对比 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">当前版本</div>
                <Badge variant="outline" className={currentTierConfig.color}>
                  {currentTierConfig.icon}
                  <span className="ml-1">{currentTierConfig.name}</span>
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">{currentTierConfig.price}</div>
              </div>
              
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1">所需版本</div>
                <Badge className={requiredTierConfig.color}>
                  {requiredTierConfig.icon}
                  <span className="ml-1">{requiredTierConfig.name}</span>
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">{requiredTierConfig.price}</div>
              </div>
            </div>

            {/* 升级提示 */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                升级后立即生效，享受更多高级功能和更大使用额度。
              </AlertDescription>
            </Alert>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1">
                稍后升级
              </Button>
              <Button onClick={handleUpgradeConfirm} className="flex-1">
                <Crown className="h-4 w-4 mr-2" />
                {upgradeButtonText}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UnifiedPaywallGuard;
