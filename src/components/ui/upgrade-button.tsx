/**
 * 升级专业版按钮组件
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useDirectAuth } from '@/contexts/DirectAuthContext';

/**
 * 升级专业版按钮属性
 */
interface UpgradeButtonProps {
  /** 按钮样式 */
  variant?: 'default' | 'outline' | 'ghost';
  /** 按钮大小 */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 按钮文字 */
  text?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 升级专业版按钮组件
 */
export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  variant = 'default',
  size = 'sm',
  showIcon = true,
  text = '立即解锁高级功能',
  className = '',
}) => {
  const { user } = useDirectAuth();

  /**
   * 检查是否应该显示升级按钮
   * 只有高级版用户（且在有效期内）不显示，其他用户都显示
   */
  const shouldShowUpgradeButton = () => {
    // 未登录用户显示
    if (!user || typeof user !== 'object') return true;

    const userObj = user as Record<string, unknown>;

    // 检查是否是高级版用户
    const isPremiumUser = userObj.tier === 'premium' ||
                         userObj.plan === 'premium' ||
                         userObj.subscriptionTier === 'premium' ||
                         userObj.userPlan === 'premium';

    // 如果是高级版用户，检查是否在有效期内
    if (isPremiumUser) {
      const subscriptionEndDate = userObj.subscriptionEndDate || userObj.endDate || userObj.expireDate;

      if (subscriptionEndDate) {
        const endDate = new Date(subscriptionEndDate as string);
        const now = new Date();

        // 如果在有效期内，不显示升级按钮
        if (endDate > now) {
          return false;
        }
      }
    }

    // 其他情况都显示升级按钮：
    // - 未登录用户
    // - 体验版用户 (trial)
    // - 专业版用户 (pro)
    // - 高级版用户但已过期
    return true;
  };

  // 只在需要时显示升级按钮
  if (!shouldShowUpgradeButton()) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`bg-primary text-primary-foreground hover:bg-primary/90 border-0 ${className}`}
      onClick={() => window.location.href = '/payment'}
    >
      {showIcon && <Crown className="w-4 h-4 mr-2" />}
      {text}
    </Button>
  );
}; 