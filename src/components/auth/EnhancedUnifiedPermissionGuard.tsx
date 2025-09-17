/**
 * 增强统一权限守卫系统
 * @description 整合所有权限守卫组件功能的统一实现，支持多种显示模式和交互方式
 * @author 权限系统团队
 * @created 2025-01-15
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Lock, Crown, Zap, Star, ArrowRight, Sparkles, Check, Clock, AlertTriangle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PermissionText, UpgradeText } from '@/components/ui/ThemeAwareText';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getSubscriptionPlan, SUBSCRIPTION_PLANS, calculateDiscountCountdown, isInDiscountPeriod } from '@/config/subscriptionPlans';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { usePermissionInteraction } from '@/utils/permissionInteractionUtils';
import { 
  UnifiedPermissionService, 
  type ExtendedPermissionType, 
  type PermissionCheckResult,
  type SessionUserInfo,
  getUserTier 
} from '@/services/unifiedPermissionService';

/**
 * 显示模式类型
 */
export type DisplayMode = 
  | 'overlay'      // 遮罩模式（默认）
  | 'replace'      // 替换模式  
  | 'button'       // 按钮模式
  | 'card'         // 卡片模式
  | 'badge'        // 标签模式
  | 'disabled'     // 禁用模式
  | 'preview'      // 预览模式
  | 'dialog';      // 对话框模式

/**
 * 遮罩强度类型
 */
export type OverlayIntensity = 'light' | 'medium' | 'heavy';

/**
 * 交互行为类型
 */
export type InteractionBehavior = 'block' | 'prompt' | 'redirect' | 'custom';

/**
 * 增强统一权限守卫属性
 */
export interface EnhancedUnifiedPermissionGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  
  /** 所需权限（支持新的扩展权限类型） */
  requiredPermission: ExtendedPermissionType;
  
  /** 功能名称 */
  featureName?: string;
  
  /** 功能描述 */
  description?: string;
  
  /** 显示模式 */
  mode?: DisplayMode;
  
  /** 遮罩强度 */
  overlayIntensity?: OverlayIntensity;
  
  /** 自定义透明度 (0-1) */
  overlayOpacity?: number;
  
  /** 是否允许预览模式 */
  allowPreview?: boolean;
  
  /** 是否显示升级按钮 */
  showUpgradeButton?: boolean;
  
  /** 自定义升级按钮文本 */
  upgradeButtonText?: string;
  
  /** 交互行为 */
  interactionBehavior?: InteractionBehavior;
  
  /** 是否禁用所有交互 */
  disableInteraction?: boolean;
  
  /** 自定义样式类名 */
  className?: string;
  
  /** 无权限时的回退组件 */
  fallback?: React.ReactNode;
  
  /** 自定义升级URL */
  upgradeUrl?: string;
  
  /** 自定义点击处理函数 */
  onUpgradeClick?: (permissionResult: PermissionCheckResult) => void;
  
  /** 是否显示升级提示 */
  showUpgradeHint?: boolean;
  
  /** 是否自动记录权限检查日志 */
  enableLogging?: boolean;
  
  /** 预览模式下的自定义消息 */
  previewMessage?: string;
}

/**
 * 获取等级信息（统一版本）
 */
const getUnifiedTierInfo = (tier: string) => {
  const subscriptionPlan = getSubscriptionPlan(tier as any);
  
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
    icon: tier === 'trial' ? <Star className="w-4 h-4" /> :
          tier === 'pro' ? <Zap className="w-4 h-4" /> :
          <Crown className="w-4 h-4" />,
    color: tier === 'trial' ? 'tier-badge-trial' :
           tier === 'pro' ? 'tier-badge-pro' :
           'tier-badge-premium',
    iconColor: tier === 'trial' ? 'permission-icon-trial' :
               tier === 'pro' ? 'permission-icon-pro' :
               'permission-icon-premium',
    features: [
      usageText,
      tokenText,
      ...subscriptionPlan.limits.availableFeatures
    ]
  };
};

/**
 * 增强统一权限守卫组件
 */
export const EnhancedUnifiedPermissionGuard: React.FC<EnhancedUnifiedPermissionGuardProps> = ({
  children,
  requiredPermission,
  featureName,
  description,
  mode = 'overlay',
  overlayIntensity = 'medium',
  overlayOpacity,
  allowPreview = false,
  showUpgradeButton = true,
  upgradeButtonText,
  interactionBehavior = 'prompt',
  disableInteraction = true,
  className = '',
  fallback,
  upgradeUrl,
  onUpgradeClick,
  showUpgradeHint = true,
  enableLogging = false,
  previewMessage
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 状态管理
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [discountCountdown, setDiscountCountdown] = useState(0);

  // 权限检查
  const permissionResult = useMemo((): PermissionCheckResult => {
    try {
      const result = UnifiedPermissionService.checkPermission(user as SessionUserInfo, requiredPermission);
      
      if (enableLogging) {
        console.log(`🔐 权限检查 [${requiredPermission}]:`, result);
      }
      
      return result;
    } catch (error) {
      console.error('权限检查失败:', error);
      return {
        hasPermission: false,
        userTier: 'trial',
        requiredTier: 'trial',
        missingPermissions: [requiredPermission],
        suggestedAction: 'login',
        permissionConfig: {
          name: featureName || '功能访问',
          description: description || '需要相应权限',
          requiredTier: 'trial',
          check: () => false,
          redirectUrl: '/payment',
          category: 'feature',
          priority: 'medium'
        }
      };
    }
  }, [user, requiredPermission, featureName, description, enableLogging]);

  // 获取等级信息
  const currentTierInfo = getUnifiedTierInfo(permissionResult.userTier);
  const requiredTierInfo = getUnifiedTierInfo(permissionResult.requiredTier);
  
  // 计算透明度
  const calculatedOpacity = overlayOpacity || 
    (overlayIntensity === 'light' ? 0.5 : 
     overlayIntensity === 'heavy' ? 0.8 : 0.6);

  // 使用增强的交互禁用控制
  usePermissionInteraction(permissionResult.hasPermission, contentRef);

  // 计算限时优惠倒计时
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

  // 处理升级点击
  const handleUpgradeClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (onUpgradeClick) {
      onUpgradeClick(permissionResult);
      return;
    }

    if (interactionBehavior === 'redirect') {
      navigate(upgradeUrl || '/payment');
      return;
    }

    if (interactionBehavior === 'prompt' || mode === 'dialog') {
      setUpgradeDialogOpen(true);
      return;
    }

    // 默认行为：直接跳转到支付页面
    if (upgradeUrl) {
      navigate(upgradeUrl);
    } else {
      localStorage.setItem("selectedPlan", permissionResult.requiredTier);
      navigate("/payment");
    }
  };

  // 如果有权限，直接渲染子组件
  if (permissionResult.hasPermission) {
    return <div className={className}>{children}</div>;
  }

  // 渲染不同模式的权限守卫
  const renderPermissionGuard = () => {
    switch (mode) {
      case 'replace':
        return renderReplaceMode();
      case 'button':
        return renderButtonMode();
      case 'card':
        return renderCardMode();
      case 'badge':
        return renderBadgeMode();
      case 'disabled':
        return renderDisabledMode();
      case 'preview':
        return renderPreviewMode();
      case 'dialog':
        return renderDialogMode();
      case 'overlay':
      default:
        return renderOverlayMode();
    }
  };

  // 替换模式：直接显示升级提示
  const renderReplaceMode = () => (
    <div className={`permission-container permission-mode-card flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="text-center space-y-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${requiredTierInfo.color}`}>
          <div className={requiredTierInfo.iconColor}>{requiredTierInfo.icon}</div>
        </div>
        
        <div>
          <UpgradeText as="h3" type="title" size="lg" className="mb-2">
            {featureName || permissionResult.permissionConfig.name}
          </UpgradeText>
          <PermissionText type="description" size="sm" className="mb-4">
            {description || permissionResult.permissionConfig.description}
          </PermissionText>
          
          <Badge variant="outline" className={`${requiredTierInfo.color} font-semibold mb-4`}>
            需要{requiredTierInfo.name}
          </Badge>
        </div>

        {showUpgradeButton && (
          <Button onClick={handleUpgradeClick} className="w-full">
            <div className={requiredTierInfo.iconColor}>{requiredTierInfo.icon}</div>
            <span className="ml-2">升级到{requiredTierInfo.name}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );

  // 按钮模式：显示灰色锁定按钮
  const renderButtonMode = () => (
    <div className="permission-container permission-mode-button relative">
      <div 
        ref={contentRef}
        className={`permission-content ${disableInteraction ? 'permission-disabled' : ''}`}
      >
        {children}
      </div>
      
      <div className="permission-overlay">
        <Button
          onClick={handleUpgradeClick}
          className="permission-upgrade-button"
          size="sm"
        >
          <Lock className="w-3 h-3 mr-2" />
          {upgradeButtonText || '升级解锁'}
        </Button>
      </div>
    </div>
  );

  // 卡片模式：显示升级卡片
  const renderCardMode = () => (
    <div className={`permission-container ${className}`}>
      <Card className="permission-card">
        <CardContent className="p-6 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${requiredTierInfo.color} mb-4`}>
            <div className={requiredTierInfo.iconColor}>{requiredTierInfo.icon}</div>
          </div>
          
          <UpgradeText as="h3" type="title" size="lg" className="mb-2">
            {featureName || permissionResult.permissionConfig.name}
          </UpgradeText>
          
          <PermissionText type="description" size="sm" className="mb-4">
            {description || `需要 ${requiredTierInfo.name} 解锁`}
          </PermissionText>
          
          {showUpgradeButton && (
            <Button onClick={handleUpgradeClick} className="w-full">
              {upgradeButtonText || `升级到${requiredTierInfo.name}`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // 标签模式：显示角标提示
  const renderBadgeMode = () => (
    <div className="permission-container relative">
      <div className="permission-content opacity-75">
        {children}
      </div>
      
      <div className="absolute top-2 right-2 z-[var(--permission-upgrade-button-z-index)]">
        <Badge 
          variant="secondary" 
          className="permission-upgrade-button cursor-pointer"
          onClick={handleUpgradeClick}
        >
          <Lock className="w-3 h-3 mr-1" />
          {requiredTierInfo.name}
        </Badge>
      </div>
    </div>
  );

  // 禁用模式：显示灰化内容
  const renderDisabledMode = () => (
    <div className="permission-container permission-mode-disabled relative">
      <div className="permission-content grayscale pointer-events-none select-none">
        {children}
      </div>
      
      {showUpgradeHint && (
        <div className="absolute bottom-2 left-2 z-[var(--permission-upgrade-button-z-index)]">
          <Badge 
            variant="outline" 
            className="permission-upgrade-button cursor-pointer text-xs"
            onClick={handleUpgradeClick}
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            需要升级
          </Badge>
        </div>
      )}
    </div>
  );

  // 预览模式：支持预览开关
  const renderPreviewMode = () => (
    <div className="permission-container permission-mode-preview">
      {/* 预览控制栏 */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={requiredTierInfo.iconColor}>{requiredTierInfo.icon}</div>
              <span className="text-sm font-medium">
                {featureName || permissionResult.permissionConfig.name}
              </span>
              <Badge variant="outline" className="text-xs">
                需要 {requiredTierInfo.name}
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
                      <Eye className="w-4 h-4 text-primary" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
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
        <div className="relative">
          <div className="permission-content grayscale opacity-60 pointer-events-none select-none">
            {children}
          </div>
          
          <div className="permission-preview-overlay absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="text-center p-6 permission-card max-w-sm">
              <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">预览模式</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {previewMessage || "您正在预览功能界面"}
              </p>
              <Button size="sm" className="w-full" onClick={handleUpgradeClick}>
                <Crown className="w-4 h-4 mr-2" />
                升级解锁完整功能
              </Button>
            </div>
          </div>
        </div>
      ) : (
        renderOverlayMode()
      )}
    </div>
  );

  // 对话框模式：显示简单的锁定状态
  const renderDialogMode = () => (
    <div className={className}>
      {fallback || (
        <div className="text-center py-8">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <UpgradeText as="h3" type="title" size="lg" className="mb-2">需要升级解锁</UpgradeText>
          <PermissionText type="description" size="sm" className="mb-4">
            {featureName || permissionResult.permissionConfig.name} 需要 {requiredTierInfo.name} 权限
          </PermissionText>
          <Button onClick={handleUpgradeClick}>
            <Crown className="w-4 h-4 mr-2" />
            查看升级方案
          </Button>
        </div>
      )}
    </div>
  );

  // 遮罩模式：默认的遮罩显示
  const renderOverlayMode = () => (
    <div className="permission-container relative">
      <div
        ref={contentRef}
        className={`permission-content ${disableInteraction ? 'permission-disabled' : ''}`}
        style={{ 
          opacity: 1 - calculatedOpacity,
          filter: `blur(${overlayIntensity === 'light' ? '2px' : overlayIntensity === 'heavy' ? '6px' : '4px'})`
        }}
      >
        {children}
      </div>

      <div 
        className="permission-overlay"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${calculatedOpacity})`,
          backdropFilter: `blur(var(--permission-blur-${overlayIntensity})) saturate(var(--permission-backdrop-saturation))`,
          WebkitBackdropFilter: `blur(var(--permission-blur-${overlayIntensity})) saturate(var(--permission-backdrop-saturation))`
        }}
      >
        <div className="max-w-4xl permission-card p-6">
          {/* 限时优惠倒计时 */}
          {user?.registrationDate && isInDiscountPeriod(new Date(user.registrationDate)) && discountCountdown > 0 && (
            <div className="mb-4">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-background p-3 rounded-lg shadow-lg animate-pulse">
                <div className="flex items-center justify-center gap-3">
                  <span className="font-bold text-sm">🔥 限时优惠</span>
                  <CountdownTimer
                    initialSeconds={discountCountdown}
                    variant="compact"
                    showIcon={false}
                    className="text-background font-mono text-lg font-bold"
                  />
                  <span className="text-xs">后恢复原价</span>
                </div>
              </div>
            </div>
          )}

          {/* 权限提示内容 */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Lock className="w-6 h-6 text-primary" />
              <UpgradeText as="h2" type="title" size="xl">
                解锁 {featureName || permissionResult.permissionConfig.name}
              </UpgradeText>
            </div>
            <PermissionText type="description" size="sm" className="mb-3">
              {description || permissionResult.permissionConfig.description}
            </PermissionText>
            <div className="flex flex-col items-center gap-2">
              <Badge className={`text-xs px-3 py-1.5 ${requiredTierInfo.color} font-semibold`}>
                {requiredTierInfo.name}/高级版专属功能
              </Badge>
              <p className="text-xs text-muted-foreground text-center">
                升级解锁，享受更多高级功能
              </p>
            </div>
          </div>

          {/* 定价方案 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isRequired = plan.tier === permissionResult.requiredTier;
              const isRecommended = plan.recommended;
              const pricing = plan.monthly;

              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-lg backdrop-blur-sm ${
                    isRequired
                      ? 'border-4 border-primary shadow-2xl scale-105 bg-background/90 dark:bg-foreground/90'
                      : isRecommended
                      ? 'border-2 border-primary/50 shadow-lg bg-background/85 dark:bg-foreground/85'
                      : 'border-2 border-border hover:border-border-strong bg-background/80 dark:bg-foreground/80'
                  }`}
                >
                  {(isRecommended || isRequired) && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className={`${
                        isRequired
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        <Star className="w-3 h-3 mr-1" />
                        {isRequired ? '所需版本' : '推荐'}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {plan.tier === 'premium' ? (
                          <Crown className="w-5 h-5 text-foreground" />
                        ) : plan.tier === 'pro' ? (
                          <Crown className="w-5 h-5 text-primary" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-foreground" />
                        )}
                        <UpgradeText as="h3" type="title" size="lg">{plan.name}</UpgradeText>
                      </div>
                      <PermissionText type="description" size="xs">{plan.description}</PermissionText>
                    </div>

                    <div className="text-center mb-4">
                      {plan.tier !== 'trial' && user?.registrationDate && isInDiscountPeriod(new Date(user.registrationDate)) ? (
                        <div>
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-lg text-muted-foreground line-through">
                              ¥{pricing.originalPrice}
                            </span>
                            <Badge className="bg-destructive text-background text-xs px-2 py-1">
                              -{pricing.discountPercentage}%
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-destructive">
                            ¥{pricing.discountPrice}
                          </div>
                          <div className="text-xs text-muted-foreground dark:text-muted-foreground">每月</div>
                          <div className="text-xs text-destructive mt-1">
                            限时优惠价，立省¥{pricing.savedAmount}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-2xl font-bold text-foreground">
                            {plan.tier === 'trial' ? '免费' : `¥${pricing.originalPrice}`}
                          </div>
                          <div className="text-xs text-muted-foreground dark:text-muted-foreground">
                            {plan.tier === 'trial' ? '永久免费' : '每月'}
                          </div>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-1.5 mb-4">
                      {plan.features
                        .filter(f => !/免费|专业版/.test(f))
                        .slice(0, 5)
                        .map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                    </ul>

                    <Button
                      onClick={() => {
                        localStorage.setItem("selectedPlan", plan.id);
                        navigate("/payment");
                      }}
                      variant={isRequired ? "default" : isRecommended ? "gradient" : "outline"}
                      size="default"
                      className="w-full font-semibold"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {plan.tier === 'trial'
                        ? '选择体验版'
                        : user?.registrationDate && isInDiscountPeriod(new Date(user.registrationDate))
                        ? `🔥 限时优惠 ¥${pricing.discountPrice}/月`
                        : isRequired
                        ? '立即升级'
                        : `选择${plan.name}`
                      }
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderPermissionGuard()}
      
      {/* 升级对话框 */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              升级解锁 {featureName || permissionResult.permissionConfig.name}
            </DialogTitle>
            <DialogDescription>
              {description || permissionResult.permissionConfig.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">当前版本</div>
                <Badge variant="outline" className={currentTierInfo.color}>
                  <div className={currentTierInfo.iconColor}>{currentTierInfo.icon}</div>
                  <span className="ml-1">{currentTierInfo.name}</span>
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">{currentTierInfo.price}</div>
              </div>
              
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1">所需版本</div>
                <Badge className={requiredTierInfo.color}>
                  <div className={requiredTierInfo.iconColor}>{requiredTierInfo.icon}</div>
                  <span className="ml-1">{requiredTierInfo.name}</span>
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">{requiredTierInfo.price}</div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                升级后立即生效，享受更多高级功能和更大使用额度。
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)} className="flex-1">
                稍后升级
              </Button>
              <Button onClick={handleUpgradeClick} className="flex-1">
                <Crown className="w-4 h-4 mr-2" />
                {upgradeButtonText || '立即升级'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * React Hook：增强权限检查
 */
export const useEnhancedPermissionCheck = (
  requiredPermission: ExtendedPermissionType,
  enableLogging?: boolean
) => {
  const { user } = useAuth();
  
  return useMemo(() => {
    try {
      const result = UnifiedPermissionService.checkPermission(user as SessionUserInfo, requiredPermission);
      
      if (enableLogging) {
        console.log(`🔐 权限检查 [${requiredPermission}]:`, result);
      }
      
      return result;
    } catch (error) {
      console.error('权限检查失败:', error);
      return {
        hasPermission: false,
        userTier: 'trial' as const,
        requiredTier: 'trial' as const,
        missingPermissions: [requiredPermission],
        suggestedAction: 'login' as const,
        permissionConfig: {
          name: '功能访问',
          description: '需要相应权限',
          requiredTier: 'trial' as const,
          check: () => false,
          redirectUrl: '/payment',
          category: 'feature' as const,
          priority: 'medium' as const
        }
      };
    }
  }, [user, requiredPermission, enableLogging]);
};

export default EnhancedUnifiedPermissionGuard;