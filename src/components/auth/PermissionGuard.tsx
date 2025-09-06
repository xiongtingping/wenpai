/**
 * 🔐 统一混合付费墙权限守卫组件
 * 实现按订阅版本解锁功能，统一UI格式为按钮加锁提示升级
 *
 * 功能特性：
 * - 体验版：能访问功能和页面内容，但是受限（只读/灰色按钮），提示升级
 * - 专业版：解锁专业功能
 * - 高级版：解锁所有功能，无限制
 *
 * 混合付费墙策略：
 * - 前端显示：所有功能入口对免费用户可见，但不可使用
 * - 按钮灰色或加锁，点击时弹出「升级解锁」提示
 * - 后端接口必须进行二次验证，
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, Zap, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getUserTier, hasPermission, getTierDisplayName } from '@/utils/subscriptionUtils';

export type SubscriptionTier = 'trial' | 'pro' | 'premium';

export interface PermissionGuardProps {
  children: React.ReactNode;
  /** 所需的最低订阅等级 */
  requiredTier?: SubscriptionTier;
  /** 功能名称，用于升级提示 */
  featureName?: string;
  /** 功能描述 */
  description?: string;
  /** 是否显示为按钮模式（灰色+锁定） */
  buttonMode?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 无权限时的回退组件 */
  fallback?: React.ReactNode;
  /** 是否禁用交互（点击无效果） */
  disableInteraction?: boolean;
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
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

/**
 * 统一混合付费墙权限守卫组件
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredTier = 'trial',
  featureName = '此功能',
  description,
  buttonMode = false,
  className = '',
  fallback,
  disableInteraction = false
}) => {
  const { user, isAuthenticated } = useAuth();
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

  // 处理升级点击
  const handleUpgradeClick = () => {
    if (disableInteraction) return;
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

  // 按钮模式：显示灰色锁定按钮
  if (buttonMode) {
    return (
      <>
        <div className={`relative ${className}`}>
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpgradeClick}
              className="bg-background/90 backdrop-blur-sm border-dashed"
              disabled={disableInteraction}
            >
              <Lock className="h-3 w-3 mr-1" />
              升级解锁
            </Button>
          </div>
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
                {description || `${featureName} 需要 ${getTierDisplayName(requiredTier)} 或更高版本才能使用。`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">当前版本：</span>
                  <Badge variant="outline" className={getTierColor(userTier)}>
                    {getTierIcon(userTier)}
                    <span className="ml-1">{getTierDisplayName(userTier)}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">所需版本：</span>
                  <Badge className={getTierColor(requiredTier)}>
                    {getTierIcon(requiredTier)}
                    <span className="ml-1">{getTierDisplayName(requiredTier)}</span>
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1">
                  取消
                </Button>
                <Button onClick={handleUpgradeConfirm} className="flex-1">
                  <Crown className="h-4 w-4 mr-2" />
                  立即升级
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // 默认模式：显示内容但添加锁定提示
  return (
    <>
      <div className={`relative ${className}`}>
        <div className="opacity-75">
          {children}
        </div>

        {/* 锁定提示覆盖层 */}
        <div
          className="absolute top-2 right-2 z-10 cursor-pointer"
          onClick={handleUpgradeClick}
        >
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm border-dashed">
            <Lock className="h-3 w-3 mr-1" />
            {getTierDisplayName(requiredTier)}
          </Badge>
        </div>
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
              {description || `${featureName} 需要 ${getTierDisplayName(requiredTier)} 或更高版本才能使用。`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">当前版本：</span>
                <Badge variant="outline" className={getTierColor(userTier)}>
                  {getTierIcon(userTier)}
                  <span className="ml-1">{getTierDisplayName(userTier)}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">所需版本：</span>
                <Badge className={getTierColor(requiredTier)}>
                  {getTierIcon(requiredTier)}
                  <span className="ml-1">{getTierDisplayName(requiredTier)}</span>
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1">
                取消
              </Button>
              <Button onClick={handleUpgradeConfirm} className="flex-1">
                <Crown className="h-4 w-4 mr-2" />
                立即升级
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// 设置displayName以便调试
PermissionGuard.displayName = 'PermissionGuard';