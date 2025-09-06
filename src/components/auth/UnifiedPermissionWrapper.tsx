/**
 * 统一权限包装器组件
 * @description 基于统一权限配置系统的权限守卫组件，替代分散的权限检查逻辑
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, Zap, Star, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUnifiedPermission } from '@/hooks/useUnifiedPermission';

interface UnifiedPermissionWrapperProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 权限键值 */
  permissionKey: string;
  /** 功能名称 */
  featureName?: string;
  /** 功能描述 */
  description?: string;
  /** 显示模式 */
  mode?: 'wrapper' | 'button' | 'card' | 'overlay';
  /** 自定义样式类名 */
  className?: string;
  /** 无权限时的回退组件 */
  fallback?: React.ReactNode;
  /** 是否禁用交互 */
  disableInteraction?: boolean;
  /** 点击回调 */
  onClick?: () => void;
}

/**
 * 获取等级图标
 */
const getTierIcon = (tier?: string) => {
  switch (tier) {
    case 'premium':
      return <Crown className="w-4 h-4 text-purple-500" />;
    case 'pro':
      return <Zap className="w-4 h-4 text-blue-500" />;
    default:
      return <Star className="w-4 h-4 text-gray-500" />;
  }
};

/**
 * 获取等级颜色
 */
const getTierColor = (tier?: string) => {
  switch (tier) {
    case 'premium':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'pro':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * 统一权限包装器组件
 */
export function UnifiedPermissionWrapper({
  children,
  permissionKey,
  featureName,
  description,
  mode = 'wrapper',
  className = '',
  fallback,
  disableInteraction = false,
  onClick
}: UnifiedPermissionWrapperProps) {
  const navigate = useNavigate();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const {
    hasPermission,
    canUpgrade,
    upgradeUrl,
    requiredLevel,
    currentLevel,
    reason
  } = useUnifiedPermission(permissionKey);

  // 如果有权限，直接渲染子组件
  if (hasPermission) {
    return <>{children}</>;
  }

  // 处理升级点击
  const handleUpgradeClick = () => {
    if (disableInteraction) return;
    
    if (upgradeUrl) {
      navigate(upgradeUrl);
    } else {
      setShowUpgradeDialog(true);
    }
  };

  // 处理包装器点击
  const handleWrapperClick = () => {
    if (onClick) {
      onClick();
    } else if (!disableInteraction) {
      handleUpgradeClick();
    }
  };

  // 如果有自定义回退组件，使用它
  if (fallback) {
    return <>{fallback}</>;
  }

  // 根据模式渲染不同的UI
  switch (mode) {
    case 'button':
      return (
        <>
          <Button
            variant="outline"
            className={`relative ${className}`}
            onClick={handleWrapperClick}
            disabled={disableInteraction}
          >
            <Lock className="w-4 h-4 mr-2" />
            {featureName || '升级解锁'}
            {canUpgrade && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {requiredLevel}
              </Badge>
            )}
          </Button>

          <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  功能升级
                </DialogTitle>
                <DialogDescription>
                  {reason || `需要升级到${requiredLevel}版本才能使用此功能`}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => navigate('/payment')} className="flex-1">
                  立即升级
                </Button>
                <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                  稍后再说
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );

    case 'card':
      return (
        <Card className={`relative ${className}`}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className={`p-3 rounded-full ${getTierColor(requiredLevel)}`}>
                {getTierIcon(requiredLevel)}
              </div>
            </div>
            <CardTitle className="text-lg">{featureName || '功能锁定'}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {description || reason || `需要升级到${requiredLevel}版本`}
            </p>
            {canUpgrade && (
              <Button onClick={handleUpgradeClick} className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                升级解锁
              </Button>
            )}
          </CardContent>
        </Card>
      );

    case 'overlay':
      return (
        <div className={`relative ${className}`}>
          {/* 原内容 - 禁用状态 */}
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
          
          {/* 覆盖层 */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <div className="flex items-center justify-center mb-2">
                <div className={`p-2 rounded-full ${getTierColor(requiredLevel)}`}>
                  {getTierIcon(requiredLevel)}
                </div>
              </div>
              <p className="text-sm font-medium mb-2">{featureName}</p>
              <p className="text-xs text-muted-foreground mb-3">
                {reason || `需要${requiredLevel}版本`}
              </p>
              {canUpgrade && (
                <Button size="sm" onClick={handleUpgradeClick}>
                  升级解锁
                </Button>
              )}
            </div>
          </div>
        </div>
      );

    default: // wrapper 模式
      return (
        <div 
          className={`relative cursor-pointer ${className}`}
          onClick={handleWrapperClick}
        >
          {/* 原内容 - 禁用状态 */}
          <div className="opacity-60 pointer-events-none">
            {children}
          </div>
          
          {/* 权限提示 */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 text-xs"
            >
              <Lock className="w-3 h-3" />
              {requiredLevel}
            </Badge>
          </div>

          {/* 升级提示 - 悬停显示 */}
          {canUpgrade && (
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white text-xs text-center">
                点击升级到{requiredLevel}版本
              </p>
            </div>
          )}
        </div>
      );
  }
}

export default UnifiedPermissionWrapper;