/**
 * 用户头像组件
 * 使用统一认证系统显示用户信息和操作
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogIn, User, LogOut, Shield, Settings, Crown, Zap, HelpCircle, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName, getUserAvatarFallback, getUserAvatar } from '@/utils/userDisplayUtils';
// 简化权限管理 - 移除复杂的权限管理器
import { logger } from '@/utils/logger';
import { getUserTier } from '@/utils/subscriptionUtils';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

/**
 * 用户头像组件属性
 */
interface UserAvatarProps {
  /** 自定义样式类 */
  className?: string;
  /** 是否显示用户名 */
  showUsername?: boolean;
  /** 头像大小 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 用户头像组件
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  className = '',
  showUsername = true,
  size = 'md'
}) => {
  const { user, isAuthenticated, login, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [unlockLoading, setUnlockLoading] = useState(false);
  const { t } = useTranslation();

  // 简单的主题切换功能
  const toggleTheme = () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('wenpai-theme', newTheme);
  };

  // 头像大小配置
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  // ✅ FIXED: 使用安全的用户信息获取函数
  // 📌 修复问题：防止 "undefinedundefined" 字符串拼接
  // 

  // 处理跳转到个人资料
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // 
  const handleUnlockMaxPermissions = async () => {
    logger.warn('🚫 权限解锁功能已被安全策略禁用');
    return;
  };

  // 获取用户等级和订阅状态
  const { primaryStatus } = useSubscriptionStatus();
  
  const getUserTierDisplay = () => {
    if (!user) return t('auth.user');
    
    // 使用订阅状态的标签和颜色
    return primaryStatus.statusLabel || t('auth.user');
  };
  
  const getTierBadgeClasses = () => {
    const userTier = getUserTier(user);
    
    if (userTier === 'trial') {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    } else if (userTier === 'pro') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    } else if (userTier === 'premium') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };
  
  const getTierIconColor = () => {
    const userTier = getUserTier(user);
    
    if (userTier === 'trial') {
      return 'text-gray-500';
    } else if (userTier === 'pro') {
      return 'text-blue-500';
    } else if (userTier === 'premium') {
      return 'text-purple-500';
    }
    
    return 'text-gray-500';
  };

  // 
  const shouldShowUnlockButton = false;

  // 未登录状态
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* 生产环境下显示解锁权限按钮 */}
        {shouldShowUnlockButton && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50"
              >
                <Zap className="h-4 w-4" />
                {t('auth.unlockTestPermissions')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 z-[9999]" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{t('auth.testMode')}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {t('auth.testModeDescription')}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleUnlockMaxPermissions}
                disabled={unlockLoading}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 focus:text-orange-700 focus:bg-orange-50"
              >
                <Zap className="mr-2 h-4 w-4" />
                <span>
                  {unlockLoading ? t('auth.unlocking') : t('auth.activateMaxPermissions')}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button
          onClick={() => login()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          {t('auth.login')}
        </Button>
      </div>
    );
  }

  // 已登录状态
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-auto p-0 z-[100]"
            onClick={(e) => {
              // 🔧 FIX: 确保点击事件正确处理
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Avatar className={sizeClasses[size]}>
              <AvatarImage
                src={getUserAvatar(user)}
                alt={getUserDisplayName(user, '用户头像')}
              />
              <AvatarFallback className="bg-accent text-primary">
                {getUserAvatarFallback(user)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 z-[99999]" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {getUserDisplayName(user, t('auth.user'))}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ''}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={`text-xs font-semibold ${getTierBadgeClasses()}`}
                >
                  <Crown className={`w-3 h-3 mr-1 ${getTierIconColor()}`} />
                  {getUserTierDisplay()}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleProfileClick();
            }}
          >
            <User className="mr-2 h-4 w-4" />
            <span>{t('nav.profile')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => window.open('https://docs.wenpai.ai', '_blank')}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>{t('nav.help')}</span>
          </DropdownMenuItem>
          
          {/* 生产环境下显示解锁权限按钮，无论用户等级 */}
          {shouldShowUnlockButton && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleUnlockMaxPermissions}
                disabled={unlockLoading}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 focus:text-orange-700 focus:bg-orange-50"
              >
                <Zap className="mr-2 h-4 w-4" />
                <span>
                  {unlockLoading ? t('auth.unlocking') : t('auth.unlockMaxPermissions')}
                </span>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('auth.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserAvatar;
