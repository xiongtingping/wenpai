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
export const PermissionLockedButton: React.FC<PermissionLockedButtonProps> = ({
  children,
  requiredTier,
  featureName,
  onClick,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false
}) => {
  const { user, isAuthenticated } = useAuth();
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
            ? 'text-white bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg'
            : requiredTier === 'pro'
            ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg'
            : 'text-white bg-gradient-to-r from-gray-600 to-gray-700 shadow-lg'
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
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : requiredTier === 'pro'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-600 hover:bg-gray-700 text-white'
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
};

/**
 * 权限锁定图标按钮组件
 */
export const PermissionLockedIconButton: React.FC<PermissionLockedButtonProps> = ({
  children,
  requiredTier,
  featureName,
  onClick,
  variant = 'outline',
  size = 'icon',
  className = '',
  disabled = false
}) => {
  const { user, isAuthenticated } = useAuth();
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
};

export default PermissionLockedButton;
