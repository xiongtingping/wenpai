/**
 * 简化权限守卫组件
 * 移除预览模式，专注于权限检查和升级引导
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getUserTier } from '@/utils/subscriptionUtils';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import { useToast } from '@/hooks/use-toast';

interface SimplePermissionGuardProps {
  children: React.ReactNode;
  requiredTier: 'trial' | 'pro' | 'premium';
  featureName: string;
  description?: string;
  className?: string;
  /** 显示模式：overlay(遮罩) | replace(替换) */
  mode?: 'overlay' | 'replace';
  /** 遮罩透明度 */
  overlayOpacity?: number;
  /** 回退组件 */
  fallback?: React.ReactNode;
}

/**
 * 简化权限守卫组件
 */
export const SimplePermissionGuard: React.FC<SimplePermissionGuardProps> = ({
  children,
  requiredTier,
  featureName,
  description,
  className = '',
  mode = 'overlay',
  overlayOpacity = 0.3,
  fallback
}) => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 获取用户当前等级
  const userTier = getUserTier(user);
  
  // 检查权限
  const hasPermission = () => {
    if (!isAuthenticated) return false;
    
    const tierLevels = { trial: 0, pro: 1, premium: 2 };
    return tierLevels[userTier] >= tierLevels[requiredTier];
  };

  // 处理升级点击
  const handleUpgradeClick = () => {
    const plan = getSubscriptionPlan(requiredTier);
    
    toast({
      title: "需要升级",
      description: `${featureName}需要${plan.name}，请升级后使用`,
    });
    
    // 跳转到升级页面
    navigate('/payment');
  };

  // 如果有权限，直接渲染子组件
  if (hasPermission()) {
    return <>{children}</>;
  }

  // 获取计划信息
  const plan = getSubscriptionPlan(requiredTier);
  const lockIcon = requiredTier === 'premium' ? Crown : requiredTier === 'pro' ? Zap : Lock;
  const LockIcon = lockIcon;

  // 升级提示组件
  const UpgradePrompt = () => (
    <div className="text-center bg-card rounded-lg shadow-lg border p-6 max-w-sm mx-auto">
      <LockIcon className="h-12 w-12 text-primary mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2 text-foreground">解锁 {featureName}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
      )}
      
      <div className="space-y-3">
        <Button 
          onClick={handleUpgradeClick}
          className="w-full"
          size="lg"
        >
          <Crown className="h-4 w-4 mr-2" />
          升级到{plan.name}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          立即升级，解锁更多高级功能
        </p>
      </div>
    </div>
  );

  // 替换模式：直接显示升级提示
  if (mode === 'replace') {
    return (
      <div className={className}>
        {fallback || <UpgradePrompt />}
      </div>
    );
  }

  // 遮罩模式：在原内容上显示遮罩
  return (
    <div className={`relative ${className}`}>
      {/* 原始内容 - 禁用交互并降低透明度 */}
      <div 
        className="relative pointer-events-none select-none"
        style={{ 
          opacity: 1 - overlayOpacity + 0.3,
          filter: 'blur(0.5px)'
        }}
      >
        {children}
      </div>

      {/* 权限遮罩 */}
      <div 
        className="absolute inset-0 z-50 flex items-center justify-center p-4"
        style={{ 
          backgroundColor: `rgba(var(--background), ${overlayOpacity})`,
          backdropFilter: 'blur(2px)'
        }}
      >
        <UpgradePrompt />
      </div>
    </div>
  );
};

/**
 * 权限感知的容器组件
 * 为子组件提供权限上下文
 */
interface PermissionAwareContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PermissionAwareContainer: React.FC<PermissionAwareContainerProps> = ({
  children,
  className = ''
}) => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const userTier = getUserTier(user);

  const hasPermission = (requiredTier: 'trial' | 'pro' | 'premium') => {
    if (!isAuthenticated) return false;
    
    const tierLevels = { trial: 0, pro: 1, premium: 2 };
    return tierLevels[userTier] >= tierLevels[requiredTier];
  };

  // 创建权限上下文值
  const permissionContext = {
    userTier,
    isAuthenticated,
    hasPermission
  };

  return (
    <div className={className} data-user-tier={userTier}>
      {children}
    </div>
  );
};

export default SimplePermissionGuard;
