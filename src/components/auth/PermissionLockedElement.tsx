/**
 * 权限锁定元素组件
 * 为按钮、链接等可操作元素提供权限控制
 * 根据用户角色显示不同的UI状态：正常/灰色+锁图标/升级提示
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import { useToast } from '@/hooks/use-toast';

interface PermissionLockedElementProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 需要的权限等级 */
  requiredRole: 'trial' | 'pro' | 'premium';
  /** 功能名称 */
  featureName: string;
  /** 元素类型 */
  elementType?: 'button' | 'link' | 'div' | 'span';
  /** 锁定时的显示模式 */
  lockedMode?: 'disabled' | 'locked' | 'hidden';
  /** 自定义类名 */
  className?: string;
  /** 点击事件 */
  onClick?: () => void;
  /** 是否显示升级提示 */
  showUpgradeTooltip?: boolean;
  /** 自定义锁定提示文字 */
  lockedTooltip?: string;
}

/**
 * 权限锁定元素组件
 */
export const PermissionLockedElement: React.FC<PermissionLockedElementProps> = ({
  children,
  requiredRole,
  featureName,
  elementType = 'button',
  lockedMode = 'locked',
  className = '',
  onClick,
  showUpgradeTooltip = true,
  lockedTooltip
}) => {
  const { hasPermission, role } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 检查是否有权限
  const allowed = hasPermission(requiredRole);

  // 处理升级点击
  const handleUpgradeClick = () => {
    const plan = getSubscriptionPlan(requiredRole);
    
    toast({
      title: "需要升级",
      description: `${featureName}需要${plan.name}，请升级后使用`,
    });
    
    navigate('/payment');
  };

  // 如果有权限，正常渲染
  if (allowed) {
    const Element = elementType as keyof JSX.IntrinsicElements;
    return (
      <Element className={className} onClick={onClick}>
        {children}
      </Element>
    );
  }

  // 隐藏模式：不渲染任何内容
  if (lockedMode === 'hidden') {
    return null;
  }

  // 获取锁图标
  const LockIcon = requiredRole === 'premium' ? Crown : requiredRole === 'pro' ? Zap : Lock;
  const plan = getSubscriptionPlan(requiredRole);

  // 构建锁定状态的提示文字
  const tooltipText = lockedTooltip || `${featureName}需要${plan.name}，点击升级`;

  // 禁用模式：显示禁用状态
  if (lockedMode === 'disabled') {
    const Element = elementType as keyof JSX.IntrinsicElements;
    
    const disabledElement = (
      <Element 
        className={`${className} opacity-50 cursor-not-allowed pointer-events-none`}
        onClick={undefined}
      >
        <div className="flex items-center gap-2">
          {children}
          <LockIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </Element>
    );

    if (!showUpgradeTooltip) {
      return disabledElement;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {disabledElement}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 锁定模式：显示灰色+锁图标，可点击升级
  const lockedElement = (
    <div 
      className={`${className} relative cursor-pointer group`}
      onClick={handleUpgradeClick}
    >
      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
        {children}
        <LockIcon className="h-4 w-4" />
      </div>
      
      {/* 升级提示徽章 */}
      <Badge 
        variant="secondary" 
        className="absolute -top-2 -right-2 text-xs px-1 py-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        升级
      </Badge>
    </div>
  );

  if (!showUpgradeTooltip) {
    return lockedElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {lockedElement}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * 权限锁定按钮组件（Button的特化版本）
 */
interface PermissionLockedButtonProps extends Omit<PermissionLockedElementProps, 'elementType'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

export const PermissionLockedButton: React.FC<PermissionLockedButtonProps> = ({
  children,
  requiredRole,
  featureName,
  lockedMode = 'locked',
  className = '',
  onClick,
  showUpgradeTooltip = true,
  lockedTooltip,
  variant = 'default',
  size = 'default',
  disabled = false
}) => {
  const { hasPermission } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 检查是否有权限
  const allowed = hasPermission(requiredRole);

  // 处理升级点击
  const handleUpgradeClick = () => {
    const plan = getSubscriptionPlan(requiredRole);
    
    toast({
      title: "需要升级",
      description: `${featureName}需要${plan.name}，请升级后使用`,
    });
    
    navigate('/payment');
  };

  // 如果有权限，正常渲染按钮
  if (allowed) {
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

  // 隐藏模式
  if (lockedMode === 'hidden') {
    return null;
  }

  // 获取锁图标和计划信息
  const LockIcon = requiredRole === 'premium' ? Crown : requiredRole === 'pro' ? Zap : Lock;
  const plan = getSubscriptionPlan(requiredRole);
  const tooltipText = lockedTooltip || `${featureName}需要${plan.name}，点击升级`;

  // 禁用模式
  if (lockedMode === 'disabled') {
    const disabledButton = (
      <Button 
        variant={variant}
        size={size}
        className={`${className} opacity-50`}
        disabled={true}
      >
        <div className="flex items-center gap-2">
          {children}
          <LockIcon className="h-4 w-4" />
        </div>
      </Button>
    );

    if (!showUpgradeTooltip) {
      return disabledButton;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {disabledButton}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 锁定模式：灰色按钮+锁图标，可点击升级
  const lockedButton = (
    <Button 
      variant="outline"
      size={size}
      className={`${className} text-muted-foreground hover:text-foreground border-dashed`}
      onClick={handleUpgradeClick}
    >
      <div className="flex items-center gap-2">
        {children}
        <LockIcon className="h-4 w-4" />
      </div>
    </Button>
  );

  if (!showUpgradeTooltip) {
    return lockedButton;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {lockedButton}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PermissionLockedElement;
