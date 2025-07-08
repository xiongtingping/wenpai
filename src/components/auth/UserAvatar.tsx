/**
 * 用户头像组件
 * 显示用户头像和下拉菜单
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { User, LogOut, Share2, CreditCard, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 用户头像属性
 */
interface UserAvatarProps {
  /** 用户信息 */
  user: unknown;
  /** 是否显示下拉菜单 */
  showDropdown?: boolean;
  /** 头像大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示用户名 */
  showUsername?: boolean;
  /** 登出回调 */
  onLogout?: () => void;
}

/**
 * 用户头像组件
 * @param props 组件属性
 * @returns React 组件
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  showDropdown = true,
  size = 'md',
  showUsername = false,
  onLogout,
}) => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * 检查用户是否是免费版
   */
  const isFreeUser = () => {
    // 简单检查，后续可以根据实际的用户数据来判断
    if (!user || typeof user !== 'object') return true;
    const userObj = user as Record<string, unknown>;
    // 检查用户是否有pro标识，默认为免费版
    return !userObj.isPro && !userObj.isProUser;
  };

  /**
   * 获取头像大小类名
   */
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-10 w-10';
    }
  };

  /**
   * 获取用户名显示文本
   */
  const getDisplayName = () => {
    if (!user || typeof user !== 'object') return '我的';
    const userObj = user as Record<string, unknown>;
    return (userObj.nickname as string) || (userObj.username as string) || (userObj.email as string) || '我的';
  };

  /**
   * 获取头像首字母
   */
  const getInitials = () => {
    const name = getDisplayName();
    // 如果是中文，返回第一个字符；如果是英文，返回第一个字母
    if (/[\u4e00-\u9fa5]/.test(name)) {
      return name.charAt(0);
    } else {
      return name.charAt(0).toUpperCase();
    }
  };

  /**
   * 获取显示文本（用于下拉菜单标签）
   */
  const getDisplayText = () => {
    if (!user || typeof user !== 'object') return '我的';
    const userObj = user as Record<string, unknown>;
    const nickname = userObj.nickname as string;
    const username = userObj.username as string;
    const email = userObj.email as string;
    
    if (nickname) return nickname;
    if (username) return username;
    if (email) return email.split('@')[0]; // 只显示邮箱前缀
    return '我的';
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * 渲染头像
   */
  const renderAvatar = () => {
    const userObj = user as Record<string, unknown> | null;
    return (
      <Avatar className={getSizeClass()}>
        <AvatarImage src={userObj?.avatar as string} alt={getDisplayName()} />
        <AvatarFallback className="bg-blue-500 text-white">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
    );
  };

  /**
   * 渲染简单头像（无下拉菜单）
   */
  if (!showDropdown) {
    return (
      <div className="flex items-center gap-2">
        {renderAvatar()}
        {showUsername && (
          <span className="text-sm font-medium">{getDisplayName()}</span>
        )}
      </div>
    );
  }

  /**
   * 渲染带下拉菜单的头像
   */
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          {renderAvatar()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayText()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {(user as Record<string, unknown>)?.email as string}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>个人中心</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/invite">
            <Share2 className="mr-2 h-4 w-4" />
            <span>邀请好友</span>
          </Link>
        </DropdownMenuItem>
        {isFreeUser() && (
          <DropdownMenuItem asChild>
            <Link to="/payment" className="text-amber-600 hover:text-amber-700">
              <Crown className="mr-2 h-4 w-4" />
              <span>升级专业版</span>
            </Link>
          </DropdownMenuItem>
        )}
        {!isFreeUser() && (
          <DropdownMenuItem asChild>
            <Link to="/payment">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>订阅管理</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? '登出中...' : '退出登录'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar; 