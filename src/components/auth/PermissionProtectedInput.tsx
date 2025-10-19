/**
 * 权限保护输入组件
 * 统一的输入框权限保护实现，替代复杂的透明遮罩层方式
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import { ToastAction } from '@/components/ui/toast';

interface PermissionProtectedInputProps {
  requiredTier: 'trial' | 'pro' | 'premium';
  featureName: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 权限保护输入容器组件
 */
export const PermissionProtectedInput: React.FC<any> = ({ requiredTier,
  featureName,
  children,
  className = '' }) => { 
  const { t } = useTranslation();
  const { user, isAuthenticated  } = useAuth();
  const { primaryStatus } = useSubscriptionStatus();
  const { tier: subscriptionTier } = useSubscriptionTier(user?.id ?? null, {
    userProfile: user,
    enableAutoRefresh: false
  });
  const userTier: 'trial' | 'pro' | 'premium' = subscriptionTier === 'premium'
    ? 'premium'
    : subscriptionTier === 'pro'
    ? 'pro'
    : 'trial';
  const navigate = useNavigate();
  const { toast } = useToast();

  
  // 检查权限 - 增强版本，确保premium用户有所有权限
  const hasPermission = () => {
    if (!isAuthenticated) return false;

    if (userTier === 'premium' || primaryStatus?.tier === 'premium') {
      return true;
    }

    const tierLevels: Record<'trial' | 'pro' | 'premium', number> = {
      trial: 0,
      pro: 1,
      premium: 2
    };

    return tierLevels[userTier] >= tierLevels[requiredTier];
  };

  // 处理升级点击
  const handleUpgradeClick = () => {
    const plan = getSubscriptionPlan(requiredTier);

    toast({
      title: `需要${plan.name}`,
      description: `${featureName}需要${plan.name}，确定后跳转至支付中心选择${plan.name}`,
      action: (
        <ToastAction
          altText="确定"
          onClick={() => {
            localStorage.setItem("selectedPlan", requiredTier);
            navigate('/payment-center');
          }}
        >
          确定
        </ToastAction>
      )
    });
  };

  // 如果有权限，显示正常内容
  if (hasPermission()) {
    return <div className={className}>{children}</div>;
  }

  // 没有权限，显示锁定状态
  const plan = getSubscriptionPlan(requiredTier);
  const lockIcon = requiredTier === 'premium' ? Crown : requiredTier === 'pro' ? Zap : Lock;
  const LockIcon = lockIcon;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 显示锁定的输入框 */}
      <div className="opacity-60 pointer-events-none">
        {children}
      </div>
      
      {/* 权限提示按钮 - 不使用遮罩，而是显示在下方 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleUpgradeClick}
        className="w-full border-dashed opacity-80 hover:opacity-100 transition-all var(--transition-smooth)"
      >
        <LockIcon className="h-4 w-4 mr-2" />
        <span className="text-sm">需要{plan.name}</span>
      </Button>
    </div>
  );
};

/**
 * 权限保护输入框组件
 */
interface PermissionProtectedInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  requiredTier: 'trial' | 'pro' | 'premium';
  featureName: string;
  className?: string;
}

export const PermissionProtectedInputField: React.FC<PermissionProtectedInputFieldProps> = ({
  requiredTier,
  featureName,
  className = '',
  ...inputProps
}) => {
  return (
    <PermissionProtectedInput
      requiredTier={requiredTier}
      featureName={featureName}
      className={className}
    >
      <Input {...(inputProps as any)} />
    </PermissionProtectedInput>
  );
};

/**
 * 权限保护选择框组件
 */
interface PermissionProtectedSelectProps {
  requiredTier: 'trial' | 'pro' | 'premium';
  featureName: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

export const PermissionProtectedSelect: React.FC<PermissionProtectedSelectProps> = ({
  requiredTier,
  featureName,
  value,
  onValueChange,
  placeholder,
  children,
  className = ''
}) => {
  return (
    <PermissionProtectedInput
      requiredTier={requiredTier}
      featureName={featureName}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </PermissionProtectedInput>
  );
};

export default PermissionProtectedInput;
