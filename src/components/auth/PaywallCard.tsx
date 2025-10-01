/**
 * 🔐 付费墙卡片组件
 * 统一的卡片加锁UI，适用于功能卡片、内容区域等
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Crown, Zap, Star, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePaywallGuard, SubscriptionTier } from '@/hooks/usePaywallGuard';

export interface PaywallCardProps {
  children: React.ReactNode;
  /** 所需的最低订阅等级 */
  requiredTier: SubscriptionTier;
  /** 功能名称 */
  featureName: string;
  /** 功能描述 */
  description?: string;
  /** 卡片标题 */
  title?: string;
  /** 卡片描述 */
  cardDescription?: string;
  /** 是否允许预览模式 */
  allowPreview?: boolean;
  /** 显示模式 */
  mode?: 'overlay' | 'badge' | 'blur' | 'disabled';
  /** 自定义样式类名 */
  className?: string;
  /** 自定义升级按钮文本 */
  upgradeButtonText?: string;
}

/**
 * 获取等级配置
 */
const getTierConfig = (tier: SubscriptionTier) => { const configs = {
    trial: {
      name: '体验版',
      icon: <Star className="h-4 w-4" />,
      color: 'bg-muted text-gray-800 dark:bg-foreground dark:text-gray-200'
     },
    pro: {
      name: '专业版',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    premium: {
      name: '高级版',
      icon: <Crown className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
  };
  return configs[tier];
};

/**
 * 付费墙卡片组件
 */
export const PaywallCard: React.FC<PaywallCardProps> = ({
  children,
  requiredTier,
  featureName,
  description,
  title,
  cardDescription,
  allowPreview = true,
  mode = 'overlay',
  className = '',
  upgradeButtonText = t('components.actions.立即升级')
}) => {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { 
    hasAccess, 
    userTier, 
    userTierName, 
    requiredTierName, 
    navigateToUpgrade 
  } = usePaywallGuard(requiredTier);

  const requiredTierConfig = getTierConfig(requiredTier);
  const userTierConfig = getTierConfig(userTier);

  // 处理升级点击
  const handleUpgradeClick = () => {
    setShowUpgradeDialog(true);
  };

  // 处理升级确认
  const handleUpgradeConfirm = () => {
    setShowUpgradeDialog(false);
    navigateToUpgrade();
  };

  // 如果有权限，直接渲染
  if (hasAccess) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          {children}
        </CardContent>
      </Card>
    );
  }

  // 渲染不同模式的付费墙卡片
  const renderLockedCard = () => {
    const baseCardClass = `relative ${className}`;
    
    switch (mode) {
      case 'overlay':
        return (
          <Card className={baseCardClass}>
            {title && (
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {title}
                  <Badge variant="secondary" className={requiredTierConfig.color}>
                    <Lock className="h-3 w-3 mr-1" />
                    {requiredTierConfig.name}
                  </Badge>
                </CardTitle>
                {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
              </CardHeader>
            )}
            <CardContent>
              <div className="opacity-60 pointer-events-none">
                {children}
              </div>
              
              {/* 升级覆盖层 */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center p-6 bg-card rounded-lg shadow-lg border max-w-sm">
                  <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{featureName}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    需要 {requiredTierConfig.name} 解锁此功能
                  </p>
                  <Button onClick={handleUpgradeClick} className="w-full">
                    <Crown className="h-4 w-4 mr-2" />
                    {upgradeButtonText}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'badge':
        return (
          <Card className={baseCardClass}>
            {title && (
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
              </CardHeader>
            )}
            <CardContent>
              <div className="opacity-75">
                {children}
              </div>
              
              {/* 右上角徽章 */}
              <div className="absolute top-4 right-4">
                <Badge 
                  variant="secondary" 
                  className="bg-background/90 backdrop-blur-sm border-dashed cursor-pointer hover:bg-background"
                  onClick={handleUpgradeClick}
                >
                  <Lock className="h-3 w-3 mr-1" />
                  {requiredTierConfig.name}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );

      case 'blur':
        return (
          <Card className={baseCardClass}>
            {title && (
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {title}
                  {allowPreview && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={previewMode}
                        onCheckedChange={setPreviewMode}
                      />
                      <span className="text-sm text-muted-foreground">
                        {previewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </span>
                    </div>
                  )}
                </CardTitle>
                {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
              </CardHeader>
            )}
            <CardContent>
              <div className={`transition-all duration-300 ${previewMode ? 'blur-sm opacity-60' : 'blur-none opacity-100'}`}>
                {children}
              </div>
              
              {previewMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                  <Button onClick={handleUpgradeClick} variant="soft">
                    <Lock className="h-4 w-4 mr-2" />
                    升级解锁完整功能
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'disabled':
        return (
          <Card className={`${baseCardClass} opacity-60`}>
            {title && (
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {title}
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    已锁定
                  </Badge>
                </CardTitle>
                {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
              </CardHeader>
            )}
            <CardContent>
              <div className="pointer-events-none select-none grayscale">
                {children}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button onClick={handleUpgradeClick} variant="outline" size="sm" className="w-full">
                  <Crown className="h-4 w-4 mr-2" />
                  升级到 {requiredTierConfig.name}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className={className}>
            <CardContent>
              {children}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <>
      {renderLockedCard()}

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
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">当前版本</div>
                <Badge variant="outline" className={userTierConfig.color}>
                  {userTierConfig.icon}
                  <span className="ml-1">{userTierName}</span>
                </Badge>
              </div>
              
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1">所需版本</div>
                <Badge className={requiredTierConfig.color}>
                  {requiredTierConfig.icon}
                  <span className="ml-1">{requiredTierName}</span>
                </Badge>
              </div>
            </div>

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

export default PaywallCard;
