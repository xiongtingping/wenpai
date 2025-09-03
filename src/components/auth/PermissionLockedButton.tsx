/**
 * 权限锁定按钮组件
 * 根据用户权限显示正常按钮或锁定状态的按钮
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Zap } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getUserTier } from "@/utils/subscriptionUtils";
import { getSubscriptionPlan } from "@/config/subscriptionPlans";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from '@/components/ui/toast';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

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
 * 权限锁定按钮组件
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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { primaryStatus, hasActiveSubscription } = useSubscriptionStatus();

  // 获取用户当前等级 - 结合订阅状态和用户数据
  const userTier = (() => {
    // 优先使用订阅状态中的等级信息
    if (hasActiveSubscription && primaryStatus?.status === 'active' && primaryStatus.tier) {
      return primaryStatus.tier;
    }

    // 如果订阅状态中没有等级信息，但有活跃订阅，根据状态标签推断等级
    if (hasActiveSubscription && primaryStatus?.status === 'active') {
      const statusLabel = primaryStatus.statusLabel?.toLowerCase() || '';
      if (statusLabel.includes('高级版') || statusLabel.includes('premium')) {
        return 'premium';
      } else if (statusLabel.includes('专业版') || statusLabel.includes('pro')) {
        return 'pro';
      }
    }

    // 最后使用用户数据中的等级信息
    return getUserTier(user);
  })();
  
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
      title: `需要${plan.name}`,
      description: `${featureName || '此功能'}需要${plan.name}，确定后跳转至支付中心选择${plan.name}`,
      action: (
        <ToastAction
          altText="确定"
          onClick={() => {
            // 保存选中的计划到localStorage
            localStorage.setItem("selectedPlan", requiredTier);
            // 跳转到支付页面
            navigate('/payment');
          }}
        >
          确定
        </ToastAction>
      )
    });
  };

  // 如果有权限，显示正常按钮
  if (hasPermission()) {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    );
  }

  // 没有权限，显示锁定按钮
  const plan = getSubscriptionPlan(requiredTier);
  const lockIcon = requiredTier === 'premium' ? Crown : requiredTier === 'pro' ? Zap : Lock;
  const LockIcon = lockIcon;

  return (
    <div className="relative group">
      <Button
        ref={ref}
        variant="outline"
        size={size}
        className={`${className} permission-locked-button opacity-60 cursor-pointer border-dashed transition-all duration-200 hover:opacity-80`}
        onClick={handleUpgradeClick}
        disabled={disabled}
      >
        <LockIcon className="h-4 w-4 mr-2" />
        {children}
        <span className={`ml-2 text-xs font-bold ${
          requiredTier === 'premium'
            ? 'text-white bg-gradient-to-r from-permission-premium to-permission-premium/90 shadow-lg'
            : requiredTier === 'pro'
            ? 'text-white bg-gradient-to-r from-permission-pro to-permission-pro/90 shadow-lg'
            : 'text-white bg-gradient-to-r from-permission-locked to-permission-locked/90 shadow-lg'
        } px-3 py-1 rounded-full border-0`}>
          需要{plan.name}
        </span>
      </Button>

      {/* 升级按钮 */}
      <Button
        size="sm"
        variant="default"
        className={`absolute -top-2 -right-2 h-6 px-2 text-xs font-medium shadow-lg ${
          requiredTier === 'premium'
            ? 'bg-permission-premium hover:bg-permission-premium/90 text-permission-premium-foreground'
            : requiredTier === 'pro'
            ? 'bg-permission-pro hover:bg-permission-pro/90 text-permission-pro-foreground'
            : 'bg-permission-locked hover:bg-permission-locked/90 text-permission-locked-foreground'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
        onClick={(e) => {
          e.stopPropagation();
          // 直接跳转到支付页面
          localStorage.setItem("selectedPlan", requiredTier);
          navigate('/payment');
        }}
      >
        升级
      </Button>
    </div>
  );
});

PermissionLockedButton.displayName = 'PermissionLockedButton';

/**
 * 权限锁定图标按钮组件
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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { primaryStatus, hasActiveSubscription } = useSubscriptionStatus();

  // 获取用户当前等级 - 结合订阅状态和用户数据
  const userTier = (() => {
    // 优先使用订阅状态中的等级信息
    if (hasActiveSubscription && primaryStatus?.status === 'active' && primaryStatus.tier) {
      return primaryStatus.tier;
    }

    // 如果订阅状态中没有等级信息，但有活跃订阅，根据状态标签推断等级
    if (hasActiveSubscription && primaryStatus?.status === 'active') {
      const statusLabel = primaryStatus.statusLabel?.toLowerCase() || '';
      if (statusLabel.includes('高级版') || statusLabel.includes('premium')) {
        return 'premium';
      } else if (statusLabel.includes('专业版') || statusLabel.includes('pro')) {
        return 'pro';
      }
    }

    // 最后使用用户数据中的等级信息
    return getUserTier(user);
  })();
  
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
      title: `需要${plan.name}`,
      description: `${featureName || '此功能'}需要${plan.name}，确定后跳转至支付中心选择${plan.name}`,
      action: (
        <ToastAction
          altText="确定"
          onClick={() => {
            // 保存选中的计划到localStorage
            localStorage.setItem("selectedPlan", requiredTier);
            // 跳转到支付页面
            navigate('/payment');
          }}
        >
          确定
        </ToastAction>
      )
    });
  };

  // 如果有权限，显示正常按钮
  if (hasPermission()) {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={className}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    );
  }

  // 没有权限，显示锁定图标按钮
  const lockIcon = requiredTier === 'premium' ? Crown : requiredTier === 'pro' ? Zap : Lock;
  const LockIcon = lockIcon;

  return (
    <Button
      ref={ref}
      variant="outline"
      size={size}
      className={`${className} permission-locked-button opacity-60 cursor-pointer border-dashed transition-all duration-200 relative`}
      onClick={handleUpgradeClick}
      disabled={disabled}
      title={`需要${getSubscriptionPlan(requiredTier).name} - ${featureName || '此功能'}`}
    >
      <LockIcon className="h-4 w-4" />
    </Button>
  );
});

PermissionLockedIconButton.displayName = 'PermissionLockedIconButton';

export default PermissionLockedButton;
