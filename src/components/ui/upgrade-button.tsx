/**
 * 升级专业版按钮组件
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from '@/hooks/useAuth';
import { useUserTier } from '@/hooks/useUserTier';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

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
export const UpgradeButton: React.FC<any> = ({
  variant = 'default',
  size = 'sm',
  showIcon = true,
  text = '立即解锁高级功能',
  className = ''
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tier: hookTier } = useUserTier();
  const { primaryStatus } = useSubscriptionStatus();

  /**
   * 检查是否应该显示升级按钮
   * 只有高级版用户（且在有效期内）不显示，其他用户都显示
   */
  const shouldShowUpgradeButton = () => {
    // 未登录用户显示
    if (!user || typeof user !== 'object') return true;

    // 使用已获取的Hook数据
    const isPremiumUser = hookTier === 'premium';

    // 高级版且处于有效期内：不显示升级按钮
    if (isPremiumUser && primaryStatus?.status === 'active') {
      return false;
    }

    // 其他情况都显示升级按钮：trial/pro/已过期premium
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
      className={className}
      onClick={() => window.location.href = '/payment'}
    >
      {showIcon && <Crown className="w-4 h-4 mr-2" />}
      {text}
    </Button>
  );
};
