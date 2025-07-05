/**
 * UserAvatar 组件
 * 显示用户头像和用户信息
 */

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthing } from '@/hooks/useAuthing';
import { useNavigate } from 'react-router-dom';

/**
 * UserAvatar 组件属性接口
 */
export interface UserAvatarProps {
  /** 用户信息 */
  user?: any | null;
  /** 是否显示下拉菜单 */
  showDropdown?: boolean;
  /** 头像大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 是否显示用户名 */
  showUsername?: boolean;
  /** 是否显示用户角色 */
  showRoles?: boolean;
  /** 自定义样式类 */
  className?: string;
  /** 点击头像时的回调 */
  onAvatarClick?: () => void;
  /** 登出时的回调 */
  onLogout?: () => void;
  /** 查看资料时的回调 */
  onViewProfile?: () => void;
  /** 设置时的回调 */
  onSettings?: () => void;
}

/**
 * UserAvatar 组件
 * 显示用户头像和相关信息
 * @param props 组件属性
 * @returns React 组件
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  showDropdown = true,
  size = 'md',
  showUsername = true,
  showRoles = false,
  className = '',
  onAvatarClick,
  onLogout,
  onViewProfile,
  onSettings,
}) => {
  const { logout, getCurrentUser, checkLoginStatus } = useAuthing();
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const navigate = useNavigate();

  // 暂时跳过角色获取功能
  React.useEffect(() => {
    if (showRoles && user) {
      // 简化处理：不获取角色信息
      setUserRoles([]);
    }
  }, [user, showRoles]);

  // 处理登出
  const handleLogout = async () => {
    try {
      await logout();
      await getCurrentUser();
      await checkLoginStatus();
      onLogout?.();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 处理查看资料
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
    } else {
      navigate('/profile');
    }
  };

  // 获取头像尺寸类
  const getAvatarSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'md':
        return 'h-10 w-10';
      case 'lg':
        return 'h-12 w-12';
      case 'xl':
        return 'h-16 w-16';
      default:
        return 'h-10 w-10';
    }
  };

  // 获取用户名首字母
  const getInitials = (user: any) => {
    if (user.nickname) {
      return user.nickname.charAt(0).toUpperCase();
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // 获取显示名称
  const getDisplayName = (user: any) => {
    return user.nickname || user.username || user.email || '用户';
  };

  // 如果没有用户信息，显示默认头像
  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Avatar className={getAvatarSizeClass()}>
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        {showUsername && (
          <span className="text-sm text-gray-500">未登录</span>
        )}
      </div>
    );
  }

  // 如果不显示下拉菜单，只显示头像
  if (!showDropdown) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Avatar 
          className={`${getAvatarSizeClass()} cursor-pointer`}
          onClick={onAvatarClick}
        >
          <AvatarImage src={user.avatar} alt={getDisplayName(user)} />
          <AvatarFallback>{getInitials(user)}</AvatarFallback>
        </Avatar>
        {showUsername && (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{getDisplayName(user)}</span>
            {showRoles && userRoles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {userRoles.slice(0, 2).map((role, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {role.name || role.code}
                  </Badge>
                ))}
                {userRoles.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{userRoles.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 显示带下拉菜单的头像
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-auto p-0">
          <div className={`flex items-center space-x-2 ${className}`}>
            <Avatar className={getAvatarSizeClass()}>
              <AvatarImage src={user.avatar} alt={getDisplayName(user)} />
              <AvatarFallback>{getInitials(user)}</AvatarFallback>
            </Avatar>
            {showUsername && (
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{getDisplayName(user)}</span>
                {user.email && (
                  <span className="text-xs text-gray-500">{user.email}</span>
                )}
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName(user)}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {showRoles && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-gray-500">
              角色权限
            </DropdownMenuLabel>
            {isLoadingRoles ? (
              <DropdownMenuItem disabled>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                  <span className="text-xs">加载中...</span>
                </div>
              </DropdownMenuItem>
            ) : userRoles.length > 0 ? (
              userRoles.slice(0, 3).map((role, index) => (
                <DropdownMenuItem key={index} disabled>
                  <Badge variant="secondary" className="text-xs">
                    {role.name || role.code}
                  </Badge>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <span className="text-xs text-gray-500">暂无角色</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={onViewProfile}>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          查看资料
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onSettings}>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          设置
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar; 