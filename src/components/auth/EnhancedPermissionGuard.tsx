/**
 * 增强权限守卫组件
 * 在所有权限遮罩处添加明显的"升级"按钮
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getUserTier } from '@/utils/subscriptionUtils';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface EnhancedPermissionGuardProps {
  children: React.ReactNode;
  requiredTier: 'trial' | 'pro' | 'premium';
  featureName: string;
  description?: string;
  className?: string;
  /** 显示模式：overlay(遮罩) | replace(替换) */
  mode?: 'overlay' | 'replace';
  /** 遮罩透明度 */
  overlayOpacity?: number;
  /** 是否显示升级按钮 */
  showUpgradeButton?: boolean;
}

/**
 * 增强权限守卫组件
 */
export const EnhancedPermissionGuard: React.FC<EnhancedPermissionGuardProps> = ({
  children,
  requiredTier,
  featureName,
  description,
  className = '',
  mode = 'overlay',
  overlayOpacity = 0.3,
  showUpgradeButton = true
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

  // 获取计划信息
  const plan = getSubscriptionPlan(requiredTier);
  
  // 处理升级点击
  const handleUpgradeClick = () => {
    toast({
      title: `需要${plan.name}`,
      description: `${featureName}需要${plan.name}，确定后跳转至支付中心选择${plan.name}`,
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

  // 如果有权限，直接渲染子组件
  if (hasPermission()) {
    return <div className={className}>{children}</div>;
  }

  // 获取图标和颜色
  const getIconAndColor = () => {
    switch (requiredTier) {
      case 'premium':
        return {
          icon: Crown,
          color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
          buttonColor: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'pro':
        return {
          icon: Zap,
          color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          icon: Lock,
          color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
          buttonColor: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const { icon: IconComponent, color, buttonColor } = getIconAndColor();

  // 替换模式：直接显示升级提示
  if (mode === 'replace') {
    return (
      <div className={`${className} flex flex-col items-center justify-center p-8 bg-accent/50 rounded-lg border-2 border-dashed border-border`}>
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${color}`}>
            <IconComponent className="h-8 w-8" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {featureName}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {description || `此功能需要${plan.name}权限`}
            </p>
            
            <Badge variant="outline" className={`${color} font-semibold mb-4`}>
              需要{plan.name}
            </Badge>
          </div>

          {showUpgradeButton && (
            <Button
              onClick={handleUpgradeClick}
              className={`${buttonColor} text-white font-medium`}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              升级到{plan.name}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 遮罩模式：在原内容上显示遮罩
  return (
    <div className={`relative group ${className}`}>
      {/* 原始内容 */}
      <div
        className="relative pointer-events-none select-none"
        style={{
          opacity: 1 - overlayOpacity + 0.2,
          filter: 'blur(1px) saturate(80%)',
          WebkitFilter: 'blur(1px) saturate(80%)'
        }}
      >
        {children}
      </div>

      {/* 权限遮罩 */}
      <div
        className="absolute inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${overlayOpacity + 0.1})`,
          backdropFilter: 'blur(4px) saturate(150%)',
          WebkitBackdropFilter: 'blur(4px) saturate(150%)'
        }}
      >
        <div className="text-center space-y-4 max-w-sm">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${color}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              {featureName}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {description || `此功能需要${plan.name}权限`}
            </p>
            
            <Badge variant="outline" className={`${color} font-semibold mb-4`}>
              需要{plan.name}
            </Badge>
          </div>

          {showUpgradeButton && (
            <Button
              onClick={handleUpgradeClick}
              size="sm"
              className={`${buttonColor} text-white font-medium shadow-lg`}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              升级到{plan.name}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* 悬浮升级按钮 */}
      {showUpgradeButton && (
        <Button
          size="sm"
          className={`absolute top-2 right-2 z-60 ${buttonColor} text-white font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
          onClick={handleUpgradeClick}
        >
          升级
        </Button>
      )}
    </div>
  );
};

export default EnhancedPermissionGuard;
