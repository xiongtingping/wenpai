/**
 * 升级专业版按钮组件
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 升级专业版按钮属性
 */
interface UpgradeButtonProps {
  /** 按钮样式 */
  variant?: 'default' | 'outline' | 'ghost';
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
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
  text = '升级专业版',
  className = '',
}) => {
  const { user } = useAuth();

  /**
   * 检查用户是否是免费版
   */
  const isFreeUser = () => {
    if (!user || typeof user !== 'object') return true;
    const userObj = user as Record<string, unknown>;
    return !userObj.isPro && !userObj.isProUser;
  };

  // 只在免费版用户时显示
  if (!isFreeUser()) {
    return null;
  }

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={`bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 ${className}`}
    >
      <Link to="/payment">
        {showIcon && <Crown className="w-4 h-4 mr-2" />}
        {text}
      </Link>
    </Button>
  );
}; 