/**
 * 统一权限守卫系统
 * @description 整合所有权限检查逻辑，提供统一的权限控制接口
 * @author 权限系统团队
 * @created 2025-08-12
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Lock, Crown, Zap, Star, ArrowRight, Sparkles, Check, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PermissionText, UpgradeText } from '@/components/ui/ThemeAwareText';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getSubscriptionPlan, SUBSCRIPTION_PLANS, calculateDiscountCountdown, isInDiscountPeriod } from '@/config/subscriptionPlans';
import type { SubscriptionTier } from '@/types/subscription';
import { PermissionUpgradeDialog } from './PermissionUpgradeDialog';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { usePermissionInteraction } from '@/utils/permissionInteractionUtils';

/**
 * 权限类型
 */
export type PermissionType =
  | 'auth:required'           // 需要登录
  | 'tier:trial'             // 体验版权限
  | 'tier:pro'               // 专业版权限
  | 'tier:premium'           // 高级版权限
  | 'feature:creative-studio' // 创意魔方功能
  | 'feature:creative-cube'    // 创意魔方-九宫格
  | 'feature:marketing-calendar' // 营销日历
  | 'feature:wechat-templates' // 微信朋友圈文案模板
  | 'feature:emoji-generator'  // Emoji生成功能
  | 'feature:brand-library'    // 品牌库功能
  | 'feature:unlimited-usage'  // 无限使用功能
  | 'feature:advanced-models'  // 高级模型功能
  | 'model:trial'            // 体验版AI模型权限
  | 'model:pro'              // 专业版AI模型权限
  | 'model:premium'          // 高级版AI模型权限
  | 'theme:basic'            // 基础主题
  | 'theme:advanced'         // 高级主题
  | 'theme:premium';         // 专业主题

/**
 * 权限守卫属性
 */
interface UnifiedPermissionGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 所需权限 */
  requiredPermission: PermissionType;
  /** 功能名称 */
  featureName?: string;
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
  /** 自定义升级URL */
  upgradeUrl?: string;
  /** 允许预览模式（覆盖层可见但禁用交互） */
  allowPreview?: boolean;
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
 * 权限配置映射
 */
const PERMISSION_CONFIGS = {
  'auth:required': {
    name: '登录权限',
    description: '需要登录才能访问',
    requiredTier: 'trial' as SubscriptionTier,
    check: (user: any) => !!user?.id,
    redirectUrl: '/login'
  },
  'tier:trial': {
    name: '体验版',
    description: '体验版用户权限',
    requiredTier: 'trial' as SubscriptionTier,
    check: (user: any) => true,
    redirectUrl: '/payment'
  },
  'tier:pro': {
    name: '专业版',
    description: '专业版用户权限',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'tier:premium': {
    name: '高级版',
    description: '高级版用户权限',
    requiredTier: 'premium' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'feature:creative-studio': {
    name: '创意魔方',
    description: 'AI驱动的创意内容生成工具',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'feature:creative-cube': {
    name: '九宫格创意魔方',
    description: '快速生成多维度创意内容',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'feature:marketing-calendar': {
    name: '营销日历',
    description: '节日热点和营销节点智能提醒',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'feature:wechat-templates': {
    name: '微信朋友圈文案模板',
    description: '专业设计的社交媒体文案模板库',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'feature:emoji-generator': {
    name: 'Emoji生成器',
    description: 'AI生成专属表情符号',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'feature:brand-library': {
    name: '品牌库',
    description: '企业级品牌资产管理系统',
    requiredTier: 'premium' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'feature:unlimited-usage': {
    name: '无限使用',
    description: '无限制使用所有功能',
    requiredTier: 'premium' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'feature:advanced-models': {
    name: '高级AI模型',
    description: '访问最新的AI模型',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'model:trial': {
    name: '体验版AI模型',
    description: '基础AI模型，包括Google Gemini 2.5 Flash Lite Preview、Meta Llama 4 Scout、OpenAI GPT-4o Mini、Alibaba Qwen Turbo',
    requiredTier: 'trial' as SubscriptionTier,
    check: (user: any) => true, // 体验版模型对所有用户开放
    redirectUrl: '/payment'
  },
  'model:pro': {
    name: '专业版AI模型',
    description: '专业AI模型，包括DeepSeek Chat系列、OpenAI GPT-5 Mini、Google Gemini 2.5 Flash、Alibaba Qwen Plus',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'model:premium': {
    name: '高级版AI模型',
    description: '顶级AI模型，包括OpenAI GPT-5 Chat Latest、Anthropic Claude Sonnet 4、Google Gemini 2.5 Pro、Alibaba Qwen Max',
    requiredTier: 'premium' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment'
  },

  'theme:basic': {
    name: '基础主题',
    description: '浅色主题',
    requiredTier: 'trial' as SubscriptionTier,
    check: (user: any) => true,
    redirectUrl: '/payment'
  },
  'theme:advanced': {
    name: '高级主题',
    description: '深色主题和其他高级主题',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment'
  },
  'theme:premium': {
    name: '专业主题',
    description: '专业版专属主题',
    requiredTier: 'premium' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment'
  }
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
    color: tier === 'trial' ? 'bg-muted text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
           tier === 'pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
           'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    features: [
      usageText,
      tokenText,
      ...subscriptionPlan.limits.availableFeatures
    ]
  };
};

/**
 * 统一权限守卫组件
 */
export const UnifiedPermissionGuard: React.FC<UnifiedPermissionGuardProps> = ({
  children,
  requiredPermission,
  featureName,
  description,
  showOverlay = true,
  overlayOpacity = 0.6,
  className = '',
  fallback,
  disableInteraction = true,
  upgradeUrl
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [discountCountdown, setDiscountCountdown] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // 计算限时优惠倒计时
  useEffect(() => {
    if (user?.registrationDate) {
      const countdown = calculateDiscountCountdown(new Date(user.registrationDate));
      setDiscountCountdown(countdown);

      // 每秒更新倒计时
      const timer = setInterval(() => {
        const newCountdown = calculateDiscountCountdown(new Date(user.registrationDate));
        setDiscountCountdown(newCountdown);
        if (newCountdown <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [user?.registrationDate]);

  // 获取权限配置（提供安全回退以避免条件性Hooks）
  const permissionConfig = PERMISSION_CONFIGS[requiredPermission];
  const effectivePermissionConfig = permissionConfig || {
    name: featureName || '功能访问',
    description: description || '默认允许访问',
    requiredTier: 'trial' as SubscriptionTier,
    check: () => true,
    redirectUrl: '/payment'
  };

  // 检查权限
  const hasPermission = useMemo(() => {
    return effectivePermissionConfig.check(user);
  }, [user, effectivePermissionConfig]);

  // 获取用户当前等级
  const userTier = useMemo(() => {
    if (!isAuthenticated || !user) return 'trial';
    return getUserTier(user);
  }, [user, isAuthenticated]);

  // 获取所需等级信息
  const requiredTierInfo = getTierInfo(effectivePermissionConfig.requiredTier);
  const currentTierInfo = getTierInfo(userTier);
  
  // 使用增强的交互禁用控制
  usePermissionInteraction(hasPermission, contentRef);

  // 处理升级 - 直接跳转到支付页面
  const handleUpgrade = (planId?: string) => {
    // 如果有自定义升级URL，直接跳转
    if (upgradeUrl) {
      navigate(upgradeUrl);
      return;
    }

    // 如果指定了计划ID，保存到localStorage
    if (planId) {
      localStorage.setItem("selectedPlan", planId);
    }

    // 直接跳转到支付页面
    navigate("/payment");
  };

  // 如果有权限，直接渲染子组件
  if (hasPermission) {
    return <div className={className}>{children}</div>;
  }

  // 如果不显示遮罩，使用回退组件
  if (!showOverlay) {
    return <>{fallback || <div className="text-center text-muted-foreground">需要 {requiredTierInfo.name} 权限</div>}</>;
  }

  // 直接渲染升级提示，移除预览模式

  // 渲染升级提示 - 直接显示定价方案对比
  function renderUpgradePrompt() {
    return (
      <div className={`relative ${className}`}>
        {/* 原始内容 - 半透明显示，增强磨砂效果 */}
        <div
          ref={contentRef}
          className={`relative ${disableInteraction ? 'permission-disabled' : ''}`}
        >
          {children}
        </div>

        {/* 定价方案对比 - 直接显示，无弹窗，增强磨砂效果 */}
        <div
          className="absolute inset-0 permission-guard-overlay flex items-center justify-center p-4"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${Math.min(overlayOpacity + 0.1, 0.95)})`,
            backdropFilter: 'blur(var(--spacing-2)) saturate(180%)',
            WebkitBackdropFilter: 'blur(var(--spacing-2)) saturate(180%)'
          }}
        >
          <div
            className="w-full max-w-4xl bg-background/95 dark:bg-foreground/95 rounded-2xl p-6 shadow-2xl border border-white/20"
            style={{
              backdropFilter: 'blur(var(--spacing-5)) saturate(200%)',
              WebkitBackdropFilter: 'blur(var(--spacing-5)) saturate(200%)',
              boxShadow: '0 25px 50px -var(--spacing-3) rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
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

            {/* 标题区域 */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Lock className="h-6 w-6 text-primary" />
                <UpgradeText as="h2" type="title" size="xl">
                  解锁 {featureName || permissionConfig.name}
                </UpgradeText>
              </div>
              <PermissionText type="description" size="sm" className="mb-3">
                {description || permissionConfig.description}
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

            {/* 定价方案卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isRequired = plan.tier === permissionConfig.requiredTier;
                const isRecommended = plan.recommended;
                const pricing = plan.monthly; // 默认显示月付价格

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
                    style={{
                      backdropFilter: 'blur(var(--spacing-3)) saturate(150%)',
                      WebkitBackdropFilter: 'blur(var(--spacing-3)) saturate(150%)'
                    }}
                  >
                    {/* 推荐标签 */}
                    {(isRecommended || isRequired) && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className={`${
                          isRequired
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          <Star className="h-3 w-3 mr-1" />
                          {isRequired ? '所需版本' : '推荐'}
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-4">
                      {/* 计划标题 */}
                      <div className="text-center mb-3">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {plan.tier === 'premium' ? (
                            <Crown className="h-5 w-5 text-foreground" />
                          ) : plan.tier === 'pro' ? (
                            <Crown className="h-5 w-5 text-primary" />
                          ) : (
                            <Sparkles className="h-5 w-5 text-foreground" />
                          )}
                          <UpgradeText as="h3" type="title" size="lg">{plan.name}</UpgradeText>
                        </div>
                        <PermissionText type="description" size="xs">{plan.description}</PermissionText>
                      </div>

                      {/* 价格 */}
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

                      {/* 功能列表 */}
                      <ul className="space-y-1.5 mb-4">
                        {plan.features
                          .filter(f => !/免费|专业版/.test(f)) // 过滤掉标签文案
                          .slice(0, 5) // 只显示前5个核心功能
                          .map((feature, index) => {
                            const text = feature
                              .replace(/创意工作室/g, '创意魔方')
                              .replace(/专业功能/g, '更多功能')
                              .replace(/专业版/g, '')
                              .replace(/\s+/g, ' ')
                              .trim();

                            return (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                <span>{text}</span>
                              </li>
                            );
                          })}
                        {plan.features.length > 5 && (
                          <li className="text-xs text-muted-foreground dark:text-muted-foreground text-center pt-1">
                            +{plan.features.length - 5} 更多功能...
                          </li>
                        )}
                      </ul>

                      {/* 选择按钮 */}
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        variant={isRequired ? "default" : isRecommended ? "gradient" : "outline"}
                        size="default"
                        className={`w-full font-semibold transition-all duration-300 ${
                          isRequired
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
                            : isRecommended
                            ? 'shadow-lg hover:shadow-xl hover:-translate-y-1'
                            : 'shadow-md hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                      >
                        <Crown className="h-4 w-4 mr-2" />
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
  }

  return (
    <>
      {renderUpgradePrompt()}

      {/* 升级对话框 */}
      <PermissionUpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        featureName={featureName || permissionConfig.name}
        requiredTier={permissionConfig.requiredTier as 'pro' | 'premium'}
        description={description}
      />
    </>
  );
};

/**
 * 统一权限检查Hook
 */
export const useUnifiedPermission = (requiredPermission: PermissionType) => {
  const { user, isAuthenticated } = useAuth();

  return useMemo(() => {
    const permissionConfig = PERMISSION_CONFIGS[requiredPermission];

    if (!permissionConfig) {
      console.warn(`未找到权限配置: ${requiredPermission}`);
      return {
        hasPermission: false,
        userTier: 'trial' as SubscriptionTier,
        requiredTier: 'trial' as SubscriptionTier,
        needsUpgrade: true,
        permissionConfig: null
      };
    }

    const userTier = getUserTier(user);
    const hasPermission = permissionConfig.check(user);

    return {
      hasPermission,
      userTier,
      requiredTier: permissionConfig.requiredTier,
      needsUpgrade: !hasPermission,
      permissionConfig
    };
  }, [user, isAuthenticated, requiredPermission]);
};

export default UnifiedPermissionGuard;
