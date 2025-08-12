/**
 * 功能区域权限守卫组件
 * @description 为设置页面等功能区域提供权限控制和透明遮罩
 * @author 权限系统团队
 * @created 2025-08-12
 */

import React, { useState } from 'react';
import { Settings, Lock, Eye, EyeOff, Crown, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SubscriptionGuard, useSubscriptionGuard } from './SubscriptionGuard';
import type { SubscriptionTier } from '@/types/subscription';

interface FeatureZoneGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 所需的最低订阅等级 */
  requiredTier: SubscriptionTier;
  /** 功能区域名称 */
  zoneName: string;
  /** 功能描述 */
  description?: string;
  /** 是否允许预览模式 */
  allowPreview?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 功能区域权限守卫
 */
export const FeatureZoneGuard: React.FC<FeatureZoneGuardProps> = ({
  children,
  requiredTier,
  zoneName,
  description,
  allowPreview = true,
  className = ''
}) => {
  const [previewMode, setPreviewMode] = useState(false);
  const { hasPermission, userTier, needsUpgrade } = useSubscriptionGuard(requiredTier);

  // 如果有权限，直接渲染
  if (hasPermission) {
    return <div className={className}>{children}</div>;
  }

  // 如果不允许预览，使用标准订阅守卫
  if (!allowPreview) {
    return (
      <SubscriptionGuard
        requiredTier={requiredTier}
        featureName={zoneName}
        description={description}
        className={className}
      >
        {children}
      </SubscriptionGuard>
    );
  }

  // 预览模式渲染
  return (
    <div className={`relative ${className}`}>
      {/* 预览控制栏 */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{zoneName}</span>
              <Badge variant="outline" className="text-xs">
                需要 {requiredTier === 'pro' ? '专业版' : '高级版'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">预览模式</span>
                    <Switch
                      checked={previewMode}
                      onCheckedChange={setPreviewMode}
                    />
                    {previewMode ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>开启预览模式可以查看功能界面，但无法进行操作</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </div>

      {/* 功能内容 */}
      {previewMode ? (
        // 预览模式：显示内容但禁用交互
        <div className="relative">
          <div 
            className="pointer-events-none select-none"
            style={{ 
              opacity: 0.6,
              filter: 'grayscale(20%)'
            }}
          >
            {children}
          </div>
          
          {/* 预览遮罩提示 */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="text-center p-6 bg-card rounded-lg shadow-lg border max-w-sm">
              <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">预览模式</h3>
              <p className="text-sm text-muted-foreground mb-4">
                您正在预览 {zoneName} 功能界面
              </p>
              <Button size="sm" className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                升级解锁完整功能
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // 非预览模式：显示升级提示
        <SubscriptionGuard
          requiredTier={requiredTier}
          featureName={zoneName}
          description={description}
          showOverlay={true}
          overlayOpacity={0.9}
        >
          {children}
        </SubscriptionGuard>
      )}
    </div>
  );
};

/**
 * 设置项权限守卫组件
 */
interface SettingItemGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 所需的最低订阅等级 */
  requiredTier: SubscriptionTier;
  /** 设置项名称 */
  itemName: string;
  /** 设置项描述 */
  description?: string;
  /** 是否显示为禁用状态 */
  showDisabled?: boolean;
}

export const SettingItemGuard: React.FC<SettingItemGuardProps> = ({
  children,
  requiredTier,
  itemName,
  description,
  showDisabled = true
}) => {
  const { hasPermission, userTier } = useSubscriptionGuard(requiredTier);

  // 如果有权限，直接渲染
  if (hasPermission) {
    return <>{children}</>;
  }

  // 如果要显示禁用状态
  if (showDisabled) {
    return (
      <div className="relative">
        <div 
          className="pointer-events-none select-none opacity-50 grayscale"
          title={`需要 ${requiredTier === 'pro' ? '专业版' : '高级版'} 权限`}
        >
          {children}
        </div>
        
        <div className="absolute top-2 right-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  {requiredTier === 'pro' ? '专业版' : '高级版'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{itemName}</p>
                  {description && <p className="text-xs mt-1">{description}</p>}
                  <p className="text-xs mt-2 text-primary">点击升级解锁</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // 不显示禁用状态，返回空
  return null;
};

/**
 * 主题选择器权限守卫
 */
interface ThemeGuardProps {
  /** 主题名称 */
  themeName: string;
  /** 所需等级 */
  requiredTier: SubscriptionTier;
  /** 是否被选中 */
  isSelected?: boolean;
  /** 点击处理函数 */
  onClick?: () => void;
  /** 主题预览色彩 */
  previewColor?: string;
}

export const ThemeGuard: React.FC<ThemeGuardProps> = ({
  themeName,
  requiredTier,
  isSelected = false,
  onClick,
  previewColor = '#3b82f6'
}) => {
  const { hasPermission } = useSubscriptionGuard(requiredTier);

  const handleClick = () => {
    if (hasPermission && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all
        ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        ${!hasPermission ? 'opacity-60' : ''}
      `}
      onClick={handleClick}
    >
      {/* 主题预览 */}
      <div className="flex items-center gap-3">
        <div 
          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: previewColor }}
        />
        <div className="flex-1">
          <div className="font-medium text-sm">{themeName}</div>
          {!hasPermission && (
            <div className="text-xs text-muted-foreground">
              需要 {requiredTier === 'pro' ? '专业版' : '高级版'}
            </div>
          )}
        </div>
        
        {!hasPermission && (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
        
        {isSelected && hasPermission && (
          <div className="w-2 h-2 bg-primary rounded-full" />
        )}
      </div>
    </div>
  );
};

export default FeatureZoneGuard;
