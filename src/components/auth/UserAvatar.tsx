/**
 * 用户头像组件
 * 使用统一认证系统显示用户信息和操作
 */

import React, { useState } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User, Settings, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const { user, isAuthenticated, login, logout } = useUnifiedAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 头像大小配置
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  // 获取用户头像
  const getAvatarFallback = () => {
    if (!user) return '?';
    return user.nickname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U';
  };

  // 获取用户显示名称
  const getDisplayName = () => {
    if (!user) return '';
    return user.nickname || user.username || '用户';
  };

  // 处理登出
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 处理跳转到个人资料
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // 处理跳转到设置
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // 未登录状态
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          onClick={() => login()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          登录
        </Button>
      </div>
    );
  }

  // 已登录状态
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showUsername && (
        <span className="text-sm text-gray-700 hidden sm:block">
          {getDisplayName()}
        </span>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-auto p-0">
            <Avatar className={sizeClasses[size]}>
              <AvatarImage 
                src={user?.avatar} 
                alt={getDisplayName()}
              />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getAvatarFallback()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {getDisplayName()}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
          </DropdownMenuItem>
          
          {/* VIP 标识 */}
          {user?.roles?.includes('vip') && (
            <DropdownMenuItem disabled>
              <Crown className="mr-2 h-4 w-4 text-yellow-500" />
              <span className="text-yellow-600">VIP 用户</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? '登出中...' : '登出'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserAvatar; 