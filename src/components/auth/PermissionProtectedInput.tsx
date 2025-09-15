/**
 * 权限保护输入组件
 * 统一的输入框权限保护实现，替代复杂的透明遮罩层方式
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { getUserTier } from '@/utils/subscriptionUtils';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
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
  className = '' }) => { const { user, isAuthenticated  } = useAuth();
  const { primaryStatus } = useSubscriptionStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 获取用户当前等级 - 优先使用订阅状态
  const getCurrentTier = () => {
    // 1. 优先使用订阅状态中的等级信息
    if (primaryStatus?.status === 'active' && primaryStatus.tier) {
      return primaryStatus.tier;
    }
    
    // 2. 从订阅状态标签推断
    if (primaryStatus?.status === 'active') {
      const statusLabel = primaryStatus.statusLabel?.toLowerCase() || '';
      if (statusLabel.includes(t('components.labels.高级版')) || statusLabel.includes('premium')) {
        return 'premium';
      } else if (statusLabel.includes(t('components.labels.专业版')) || statusLabel.includes('pro')) {
        return 'pro';
      }
    }
    
    // 3. 最后使用用户数据
    return getUserTier(user);
  };
  
  const userTier = getCurrentTier();
  
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
      description: `${featureName}需要${plan.name}，确定后跳转至支付中心选择${plan.name}`,
      action: (
        <ToastAction
          altText="确定"
          onClick={() => {
            localStorage.setItem("selectedPlan", requiredTier);
            navigate('/payment');
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
    <div className={`relative ${className}`}>
      {/* 原始内容，设为禁用状态 */}
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* 权限提示遮罩 */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md border border-dashed border-muted-foreground/50 transition-all var(--transition-smooth)">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpgradeClick}
          className="border-dashed opacity-80 hover:opacity-100 transition-all var(--transition-smooth) shadow-e1"
        >
          <LockIcon className="h-4 w-4 mr-2" />
          <span className="text-sm">需要{plan.name}</span>
        </Button>
      </div>
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
