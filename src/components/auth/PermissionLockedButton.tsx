/**
 * 权限锁定按钮组件 - 使用统一权限系统
 * @description 基于统一权限配置的权限锁定按钮，替代分散的权限检查逻辑
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useUnifiedPermission } from '@/hooks/useUnifiedPermission';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useNavigate } from "react-router-dom";
import type { SubscriptionTier } from '@/types/subscription';

export interface PermissionLockedButtonProps {
  children: React.ReactNode;
  requiredTier: 'trial' | 'pro' | 'premium';
  featureName?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

/**
 * 权限锁定按钮组件 - 基于统一权限系统
 */
export const PermissionLockedButton = React.forwardRef<HTMLButtonElement, PermissionLockedButtonProps>((
  {
    children,
    requiredTier,
    featureName,
    onClick,
    variant = 'default',
    size = 'default',
    className = '',
    disabled = false
  },
  ref
) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  // 使用统一权限检查
  const permissionKey = `tier:${requiredTier}`;
  const { hasPermission: unifiedHasPermission, canUpgrade, upgradeUrl, reason } = useUnifiedPermission(permissionKey);
  
  // 🎯 增强权限检查：确保premium用户有所有权限
  const { user } = useAuth();
  const isPremiumUser = user?.subscription?.tier === 'premium' || 
                       user?.tier === 'premium' || 
                       user?.vipLevel === 'premium' ||
                       (user?.isVip && (user?.vipLevel === 'premium' || user?.subscription?.tier === 'premium'));
  
  const hasPermission = unifiedHasPermission || isPremiumUser;

  // 处理点击事件
  const handleClick = () => {
    if (hasPermission) {
      // 有权限，执行原始点击逻辑
      onClick?.();
    } else {
      // 无权限，跳转到升级页面
      if (upgradeUrl) {
        navigate(upgradeUrl);
      } else {
        navigate('/payment-center');
      }
    }
  };

  return (
    <Button
      ref={ref}
      variant={hasPermission ? variant : 'outline'}
      size={size}
      className={`${className} ${!hasPermission ? 'opacity-70' : ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {!hasPermission && <Lock className="w-4 h-4 mr-1" />}
      {children}
    </Button>
  );
});

PermissionLockedButton.displayName = 'PermissionLockedButton';

/**
 * 权限锁定图标按钮组件 - 基于统一权限系统
 */
export const PermissionLockedIconButton = React.forwardRef<HTMLButtonElement, PermissionLockedButtonProps>((
  {
    children,
    requiredTier,
    featureName,
    onClick,
    variant = 'outline',
    size = 'icon',
    className = '',
    disabled = false
  },
  ref
) => {
  const navigate = useNavigate();

  // 使用统一权限检查
  const permissionKey = `tier:${requiredTier}`;
  const { hasPermission: unifiedHasPermission, upgradeUrl, reason } = useUnifiedPermission(permissionKey);
  
  // 🎯 增强权限检查：确保premium用户有所有权限
  const { user } = useAuth();
  const isPremiumUser = user?.subscription?.tier === 'premium' || 
                       user?.tier === 'premium' || 
                       user?.vipLevel === 'premium' ||
                       (user?.isVip && (user?.vipLevel === 'premium' || user?.subscription?.tier === 'premium'));
  
  const hasPermission = unifiedHasPermission || isPremiumUser;

  // 处理点击事件
  const handleClick = () => {
    if (hasPermission) {
      onClick?.();
    } else {
      if (upgradeUrl) {
        navigate(upgradeUrl);
      } else {
        navigate('/payment-center');
      }
    }
  };

  return (
    <Button
      ref={ref}
      variant={hasPermission ? variant : 'outline'}
      size={size}
      className={`${className} ${!hasPermission ? 'opacity-60 cursor-pointer border-dashed' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      title={!hasPermission ? `${reason || `需要${requiredTier}版本`} - ${featureName || t('components.labels.此功能')}` : undefined}
    >
      {!hasPermission ? <Lock className="h-4 w-4" /> : children}
    </Button>
  );
});

PermissionLockedIconButton.displayName = 'PermissionLockedIconButton';

export default PermissionLockedButton;