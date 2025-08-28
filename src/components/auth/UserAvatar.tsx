/**
 * 用户头像组件
 * 使用统一认证系统显示用户信息和操作
 */

import React, { useState } from 'react';
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
import { LogIn, User, LogOut, Shield, Settings, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName, getUserAvatarFallback, getUserAvatar } from '@/utils/userDisplayUtils';
// 简化权限管理 - 移除复杂的权限管理器
import { logger } from '@/utils/logger';

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

  // 头像大小配置
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  // ✅ FIXED: 使用安全的用户信息获取函数
  // 📌 修复问题：防止 "undefinedundefined" 字符串拼接
  // 🔓 UNLOCKED: 已封装稳定，请勿改动

  // 处理跳转到个人资料
  const handleProfileClick = () => {
    navigate('/profile');
  };

  // 🔒 SECURITY: 最高权限解锁功能已禁用 - 防止权限绕过攻击
  const handleUnlockMaxPermissions = async () => {
    logger.warn('🚫 权限解锁功能已被安全策略禁用');
    return;
  };

  // 简化用户等级显示
  const getUserTierDisplay = () => {
    if (!user) return '';
    return '用户'; // 简化显示
  };

  // 🔒 SECURITY: 解锁按钮已完全禁用 - 防止权限绕过攻击
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
                🔓 解锁测试权限
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">测试模式</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    一键获取所有权限进行功能测试
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
                  {unlockLoading ? '解锁中...' : '🚀 激活最高权限'}
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
          登录
        </Button>
      </div>
    );
  }

  // 已登录状态
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-auto p-0">
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
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {getUserDisplayName(user, '用户')}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ''}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {getUserTierDisplay()}
                </Badge>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>个人中心</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
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
                  {unlockLoading ? '解锁中...' : '🔓 最高解锁权限'}
                </span>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>退出登录</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserAvatar; 