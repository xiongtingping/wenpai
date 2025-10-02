/**
 * 优化版统一权限守卫
 * @description 使用简洁的升级提示替代完整定价方案
 * @created 2025-10-02
 */

import React, { useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CompactPermissionCard } from './CompactPermissionCard';
import { usePermissionInteraction } from '@/utils/permissionInteractionUtils';
import type { SubscriptionTier } from '@/types/subscription';
import type { PermissionType } from './UnifiedPermissionGuard';

/**
 * 权限配置映射 (从 UnifiedPermissionGuard 复用)
 */
const PERMISSION_CONFIGS = {
  'auth:required': {
    name: '登录权限',
    description: '需要登录才能访问此功能',
    requiredTier: 'trial' as SubscriptionTier,
    check: (user: any) => !!user?.id,
  },
  'tier:trial': {
    name: '体验版',
    description: '体验版用户权限',
    requiredTier: 'trial' as SubscriptionTier,
    check: () => true,
  },
  'tier:pro': {
    name: '专业版',
    description: '专业版用户权限',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const tier = getUserTier(user);
      return tier === 'pro' || tier === 'premium';
    },
  },
  'tier:premium': {
    name: '高级版',
    description: '高级版用户权限',
    requiredTier: 'premium' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      return getUserTier(user) === 'premium';
    },
  },
  'feature:creative-studio': {
    name: '创意魔方',
    description: 'AI驱动的创意内容生成工具',
    requiredTier: 'pro' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      const tier = getUserTier(user);
      return tier === 'pro' || tier === 'premium';
    },
  },
  'feature:brand-library': {
    name: '品牌库',
    description: '企业级品牌资产管理系统',
    requiredTier: 'premium' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      return getUserTier(user) === 'premium';
    },
  },
  'feature:unlimited-usage': {
    name: '无限使用',
    description: '无限制使用所有功能',
    requiredTier: 'premium' as SubscriptionTier,
    check: (user: any) => {
      if (!user) return false;
      return getUserTier(user) === 'premium';
    },
  },
  // ... 可以从 UnifiedPermissionGuard 导入更多配置
};

/**
 * 获取用户订阅等级
 */
const getUserTier = (user: any): SubscriptionTier => {
  if (!user) return 'trial';

  // 优先从订阅信息获取
  if (user.subscription?.tier) {
    return user.subscription.tier;
  }

  // 从VIP等级推断
  if (user.vipLevel === 'premium') return 'premium';
  if (user.vipLevel === 'pro') return 'pro';
  if (user.isVip) return 'pro';

  // 从权限数组推断
  if (user.permissions?.includes('tier:premium')) return 'premium';
  if (user.permissions?.includes('tier:pro')) return 'pro';

  return 'trial';
};

/**
 * 优化版权限守卫属性
 */
interface OptimizedPermissionGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 所需权限 */
  requiredPermission: PermissionType;
  /** 功能名称 */
  featureName?: string;
  /** 功能描述 */
  description?: string;
  /** 是否显示遮罩 */
  showOverlay?: boolean;
  /** 遮罩不透明度 (0-1) */
  overlayOpacity?: number;
  /** 自定义样式 */
  className?: string;
  /** 无权限时的回退组件 */
  fallback?: React.ReactNode;
  /** 是否禁用交互 */
  disableInteraction?: boolean;
  /** 自定义升级URL */
  upgradeUrl?: string;
}

/**
 * 优化版统一权限守卫组件
 */
export const OptimizedPermissionGuard: React.FC<OptimizedPermissionGuardProps> = ({
  children,
  requiredPermission,
  featureName,
  description,
  showOverlay = true,
  overlayOpacity = 0.75,
  className = '',
  fallback,
  disableInteraction = true,
  upgradeUrl
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  // 获取权限配置
  const permissionConfig = PERMISSION_CONFIGS[requiredPermission as keyof typeof PERMISSION_CONFIGS];

  if (!permissionConfig) {
    console.warn(`未找到权限配置: ${requiredPermission}`);
    return <>{children}</>;
  }

  // 检查权限
  const hasPermission = useMemo(() => {
    return permissionConfig.check(user);
  }, [user, permissionConfig]);

  // 获取用户当前等级
  const userTier = useMemo(() => {
    if (!isAuthenticated || !user) return 'trial';
    return getUserTier(user);
  }, [user, isAuthenticated]);

  // 使用交互禁用控制
  usePermissionInteraction(hasPermission, contentRef);

  // 处理升级
  const handleUpgrade = () => {
    if (upgradeUrl) {
      navigate(upgradeUrl);
    } else {
      // 保存目标等级到 localStorage
      localStorage.setItem('selectedPlan', permissionConfig.requiredTier);
      navigate('/payment-center');
    }
  };

  // 如果有权限,直接渲染
  if (hasPermission) {
    return <div className={className}>{children}</div>;
  }

  // 如果不显示遮罩,使用回退组件
  if (!showOverlay) {
    return <>{fallback || <div className="text-center text-muted-foreground">需要 {permissionConfig.name} 权限</div>}</>;
  }

  // 渲染带遮罩的权限守卫
  return (
    <div className={`relative ${className}`}>
      {/* 原始内容 - 模糊显示 */}
      <div
        ref={contentRef}
        className={`relative ${disableInteraction ? 'permission-disabled' : ''}`}
        style={{
          filter: 'blur(4px)',
          opacity: 0.5,
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        {children}
      </div>

      {/* 遮罩层 + 升级提示 */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4 z-10"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          backdropFilter: 'blur(12px) saturate(150%)',
          WebkitBackdropFilter: 'blur(12px) saturate(150%)'
        }}
      >
        {/* 简洁版升级卡片 */}
        <CompactPermissionCard
          featureName={featureName || permissionConfig.name}
          description={description || permissionConfig.description}
          requiredTier={permissionConfig.requiredTier}
          onUpgrade={handleUpgrade}
          showDiscount={!!user?.registrationDate}
          discountCountdown={0} // TODO: 计算限时优惠倒计时
        />
      </div>
    </div>
  );
};

/**
 * React Hook: 优化版权限检查
 */
export const useOptimizedPermission = (requiredPermission: PermissionType) => {
  const { user, isAuthenticated } = useAuth();

  return useMemo(() => {
    const permissionConfig = PERMISSION_CONFIGS[requiredPermission as keyof typeof PERMISSION_CONFIGS];

    if (!permissionConfig) {
      return {
        hasPermission: false,
        userTier: 'trial' as SubscriptionTier,
        requiredTier: 'trial' as SubscriptionTier,
        needsUpgrade: true,
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

export default OptimizedPermissionGuard;
