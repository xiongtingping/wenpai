/**
 * 用户头像组件
 * 显示用户头像和基本信息
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { User } from '@/types/user';

/**
 * 检查是否为开发环境
 */
const isDevelopment = () => {
  return import.meta.env.DEV || process.env.NODE_ENV === 'development';
};

/**
 * 用户头像组件属性
 */
interface UserAvatarProps {
  /** 用户信息 */
  user?: User | null;
  /** 是否显示下拉菜单 */
  showDropdown?: boolean;
  /** 头像大小 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 用户头像组件
 * @param props 组件属性
 * @returns React 组件
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  user: userProp,
  showDropdown = true,
  size = 'md'
}) => {
  const { user, logout } = useUnifiedAuthContext();
  const { hasRole } = usePermissions();

  // 优先使用传入的user，如果没有则使用context中的user
  const displayUser = userProp || user;

  if (!displayUser) {
    return (
      <Avatar className={`${size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'}`}>
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    );
  }

  // 获取用户显示名称
  const displayName = displayUser.nickname || displayUser.username || displayUser.email || '用户';
  
  // 获取头像首字母
  const initials = displayName.slice(0, 2).toUpperCase();
  
  // 开发环境下跳过权限检查
  const isPro = isDevelopment() || hasRole('premium') || hasRole('pro') || hasRole('admin');

  const avatarContent = (
    <Avatar className={`${size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'}`}>
      <AvatarImage src={displayUser.avatar} alt={displayName} />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (!showDropdown) {
    return avatarContent;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-auto w-auto p-0">
          {avatarContent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayUser.email}
            </p>
            {isPro && (
              <p className="text-xs leading-none text-primary font-medium">
                {isDevelopment() ? '⭐ 开发模式' : '⭐ 专业用户'}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile">个人中心</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 