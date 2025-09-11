/**
 * 🔐 付费墙按钮组件
 * 统一的按钮加锁UI，支持多种按钮样式和交互
 */

import React, { useState } from 'react';
import { Lock, Crown, Zap, Star } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePaywallGuard, SubscriptionTier } from '@/hooks/usePaywallGuard';

export interface PaywallButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** 所需的最低订阅等级 */
  requiredTier: SubscriptionTier;
  /** 功能名称 */
  featureName: string;
  /** 功能描述 */
  description?: string;
  /** 原始点击事件（有权限时执行） */
  onClick?: () => void;
  /** 是否显示等级徽章 */
  showTierBadge?: boolean;
  /** 锁定时的按钮文本 */
  lockedText?: string;
  /** 自定义升级按钮文本 */
  upgradeButtonText?: string;
}

/**
 * 获取等级图标
 */
const getTierIcon = (tier: SubscriptionTier) => {
  switch (tier) {
    case 'premium':
      return <Crown className="h-4 w-4" />;
    case 'pro':
      return <Zap className="h-4 w-4" />;
    case 'trial':
    default:
      return <Star className="h-4 w-4" />;
  }
};

/**
 * 获取等级颜色
 */
const getTierColor = (tier: SubscriptionTier) => {
  switch (tier) {
    case 'premium':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'pro':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'trial':
    default:
      return 'bg-muted text-gray-800 dark:bg-foreground dark:text-gray-200';
  }
};

/**
 * 付费墙按钮组件
 */
export const PaywallButton: React.FC<PaywallButtonProps> = ({
  requiredTier,
  featureName,
  description,
  onClick,
  showTierBadge = false,
  lockedText,
  upgradeButtonText = '立即升级',
  children,
  disabled,
  className = '',
  ...buttonProps
}) => {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { 
    hasAccess, 
    userTier, 
    userTierName, 
    requiredTierName, 
    navigateToUpgrade 
  } = usePaywallGuard(requiredTier);

  // 处理按钮点击
  const handleClick = () => {
    if (hasAccess && onClick) {
      onClick();
    } else {
      setShowUpgradeDialog(true);
    }
  };

  // 处理升级确认
  const handleUpgradeConfirm = () => {
    setShowUpgradeDialog(false);
    navigateToUpgrade();
  };

  // 确定按钮状态和样式
  const isLocked = !hasAccess;
  const buttonText = isLocked ? (lockedText || children) : children;
  const buttonClassName = `${className} ${isLocked ? 'opacity-75' : ''}`;

  return (
    <>
      <div className="relative inline-flex items-center gap-2">
        <Button
          {...buttonProps}
          onClick={handleClick}
          disabled={disabled}
          className={buttonClassName}
          variant={isLocked ? 'outline' : buttonProps.variant}
        >
          {isLocked && <Lock className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>

        {/* 等级徽章 */}
        {showTierBadge && isLocked && (
          <Badge variant="secondary" className={getTierColor(requiredTier)}>
            {getTierIcon(requiredTier)}
            <span className="ml-1">{requiredTierName}</span>
          </Badge>
        )}
      </div>

      {/* 升级对话框 */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              升级解锁 {featureName}
            </DialogTitle>
            <DialogDescription>
              {description || `${featureName} 需要 ${requiredTierName} 或更高版本才能使用。`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 版本对比 */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">当前版本：</span>
                <Badge variant="outline" className={getTierColor(userTier)}>
                  {getTierIcon(userTier)}
                  <span className="ml-1">{userTierName}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">所需版本：</span>
                <Badge className={getTierColor(requiredTier)}>
                  {getTierIcon(requiredTier)}
                  <span className="ml-1">{requiredTierName}</span>
                </Badge>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1">
                取消
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

export default PaywallButton;
