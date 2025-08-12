/**
 * 用户头像组件
 * 使用统一认证系统显示用户信息和操作
 */

import React from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName, getUserAvatarFallback, getUserAvatar } from '@/utils/userDisplayUtils';

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
  const { user, isAuthenticated, login } = useUnifiedAuth();
  const navigate = useNavigate();

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
      <Button variant="ghost" className="relative h-auto p-0" onClick={handleProfileClick}>
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
    </div>
  );
};

export default UserAvatar; 