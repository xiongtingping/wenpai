/**
 * 基于用户角色的升级提示组件
 * 根据用户角色渲染不同的UI状态
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from '@/hooks/useAuth';
import { getUserTier } from '@/utils/subscriptionUtils';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import { useToast } from '@/hooks/use-toast';

interface RoleBasedUpgradePromptProps {
  /** 所需版本等级 */
  requiredTier: 'pro' | 'premium';
  /** 功能区域名称 */
  featureName: string;
  /** 功能描述 */
  description?: string;
  /** 显示模式 */
  mode?: 'compact' | 'normal';
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 基于用户角色的升级提示组件
 */
export const RoleBasedUpgradePrompt: React.FC<any> = ({ 
  requiredTier,
  featureName,
  description,
  mode = 'compact',
  className = '' 
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 获取用户当前等级
  const userTier = getUserTier(user);
  const plan = getSubscriptionPlan(requiredTier);

  // 检查权限
  const hasPermission = () => {
    if (!isAuthenticated) return false;
    
    const tierLevels = { trial: 0, pro: 1, premium: 2 };
    return tierLevels[userTier] >= tierLevels[requiredTier];
  };

  // 如果用户已有权限，不显示升级提示
  if (hasPermission()) {
    return null;
  }

  // 处理升级点击 - 直接跳转到支付中心
  const handleUpgradeClick = () => {
    // 保存选中的计划到localStorage
    localStorage.setItem("selectedPlan", requiredTier);

    // 直接跳转到支付页面
    navigate('/payment');
  };

  // 根据版本获取主题配置 - 使用设计令牌
  const getThemeConfig = () => {
    if (requiredTier === 'premium') {
      return {
        icon: Crown,
        primaryColor: 'bg-gradient-to-r from-permission-premium to-permission-premium/80',
        textColor: 'text-permission-premium-foreground',
        badgeColor: 'bg-permission-premium/10 text-permission-premium border-permission-premium/30',
        buttonColor: 'bg-permission-premium hover:bg-permission-premium/90 shadow-e1',
        borderColor: 'border-permission-premium/30',
        lockColor: 'text-permission-premium'
      };
    } else {
      return {
        icon: Zap,
        primaryColor: 'bg-gradient-to-r from-permission-pro to-permission-pro/80',
        textColor: 'text-permission-pro-foreground',
        badgeColor: 'bg-permission-pro/10 text-permission-pro border-permission-pro/30',
        buttonColor: 'bg-permission-pro hover:bg-permission-pro/90 shadow-e1',
        borderColor: 'border-permission-pro/30',
        lockColor: 'text-permission-pro'
      };
    }
  };

  const theme = getThemeConfig();
  const IconComponent = theme.icon;

  // 紧凑模式 - 适合放在页面标题右侧
  if (mode === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* 版本徽章 */}
        <Badge 
          variant="outline" 
          className={`${theme.badgeColor} font-medium border-dashed`}
        >
          <Lock className={`h-3 w-3 mr-1 ${theme.lockColor}`} />
{requiredTier === 'pro' ? '专业版/高级版专属' : t('components.messages.高级版专属')}
        </Badge>

        {/* 升级按钮 */}
        <Button
          onClick={handleUpgradeClick}
          size="sm"
          className={`
            ${theme.buttonColor} 
            text-permission-premium-foreground font-medium
            transition-all var(--transition-smooth) hover:scale-105
          `}
        >
          <IconComponent className="h-4 w-4 mr-2" />
          升级解锁
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  // 普通模式 - 更详细的升级提示
  return (
    <div className={`
      ${className} 
      p-4 rounded-lg border ${theme.borderColor} 
      bg-gradient-to-r ${theme.primaryColor} bg-opacity-5
      transition-all duration-300 hover:shadow-md
    `}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-full bg-gradient-to-br ${theme.primaryColor} bg-opacity-10`}>
              <IconComponent className={`h-4 w-4 ${theme.textColor}`} />
            </div>
            <h3 className={`font-semibold text-sm ${theme.textColor}`}>
              {featureName}
            </h3>
            <Badge variant="outline" className={`${theme.badgeColor} text-xs`}>
    {requiredTier === 'pro' ? '专业版/高级版专属' : t('components.messages.高级版专属')}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {description || `该功能区为${plan.name}专属，解锁后可享受完整的专业级功能体验。`}
          </p>
        </div>

        <Button
          onClick={handleUpgradeClick}
          size="sm"
          className={`
            ${theme.buttonColor} 
            text-permission-premium-foreground font-medium text-xs px-3 py-1.5
            transition-all var(--transition-smooth) hover:scale-105
            flex-shrink-0
          `}
        >
          <IconComponent className="h-3 w-3 mr-1" />
          升级
        </Button>
      </div>

      {/* 价格信息 */}
      <div className="mt-2 pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          {plan.monthly?.discountPrice ?? plan.yearly?.discountPrice ?? ''} • 随时可取消
        </span>
      </div>
    </div>
  );
};

export default RoleBasedUpgradePrompt;
