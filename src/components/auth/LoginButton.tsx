/**
 * 登录按钮组件
 * 提供登录/注册功能的按钮组件
 * 使用统一认证入口，优先使用Authing SDK
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LogIn, 
  UserPlus, 
  Loader2,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthing } from '@/hooks/useAuthing';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { securityUtils } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { QuickAuthButton, LoginButton as AuthLoginButton, RegisterButton as AuthRegisterButton } from './AuthModal';

/**
 * 登录按钮组件属性
 */
interface LoginButtonProps {
  /** 按钮变体 */
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  /** 按钮大小 */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** 自定义样式类 */
  className?: string;
  /** 是否显示加载状态 */
  showLoading?: boolean;
  /** 是否显示用户状态 */
  showUserStatus?: boolean;
  /** 登录后跳转的路径 */
  redirectTo?: string;
  /** 按钮文本 */
  children?: React.ReactNode;
}

/**
 * 登录按钮组件
 * @param props 组件属性
 * @returns React 组件
 */
export default function LoginButton({
  variant = 'default',
  size = 'default',
  className = '',
  showLoading = true,
  showUserStatus = true,
  redirectTo = '/',
  children
}: LoginButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const { user: unifiedUser, isAuthenticated: unifiedIsAuthenticated } = useUnifiedAuth();
  const navigate = useNavigate();

  // 优先使用统一认证状态
  const currentUser = unifiedUser || user;
  const currentIsAuthenticated = unifiedIsAuthenticated || isAuthenticated;

  /**
   * 处理用户中心点击
   */
  const handleUserCenter = () => {
    navigate('/user-profile');
  };

  // 如果用户已登录且显示用户状态
  if (currentIsAuthenticated && showUserStatus && currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-600" />
          已登录
        </Badge>
        <Button
          variant="outline"
          size={size}
          onClick={handleUserCenter}
          className={`flex items-center gap-2 ${className}`}
        >
          <Shield className="w-4 h-4" />
          {currentUser?.nickname || currentUser?.username || '用户中心'}
        </Button>
      </div>
    );
  }

  // 使用新的统一认证按钮
  return (
    <QuickAuthButton
      variant={variant}
      size={size}
      className={className}
      onSuccess={(user) => {
        // 登录成功后的处理
        if (redirectTo) {
          navigate(redirectTo);
        }
      }}
    >
      {children || '登录 / 注册'}
    </QuickAuthButton>
  );
}

/**
 * 快速登录按钮组件
 * 简化版本的登录按钮
 */
export function QuickLoginButton({ 
  className = '',
  redirectTo = '/'
}: {
  className?: string;
  redirectTo?: string;
}) {
  const { isAuthenticated } = useAuth();
  const { isAuthenticated: unifiedIsAuthenticated } = useUnifiedAuth();
  const navigate = useNavigate();

  // 优先使用统一认证状态
  const currentIsAuthenticated = unifiedIsAuthenticated || isAuthenticated;

  if (currentIsAuthenticated) {
    return null; // 已登录时不显示
  }

  return (
    <AuthLoginButton
      variant="ghost"
      size="sm"
      className={`text-sm ${className}`}
      onSuccess={(user) => {
        if (redirectTo) {
          navigate(redirectTo);
        }
      }}
    >
      登录
    </AuthLoginButton>
  );
}

/**
 * 注册按钮组件
 * 专门用于注册的按钮
 */
export function RegisterButton({ 
  className = '',
  redirectTo = '/register'
}: {
  className?: string;
  redirectTo?: string;
}) {
  const { isAuthenticated } = useAuth();
  const { isAuthenticated: unifiedIsAuthenticated } = useUnifiedAuth();
  const navigate = useNavigate();

  // 优先使用统一认证状态
  const currentIsAuthenticated = unifiedIsAuthenticated || isAuthenticated;

  if (currentIsAuthenticated) {
    return null; // 已登录时不显示
  }

  return (
    <AuthRegisterButton
      variant="outline"
      size="sm"
      className={`flex items-center gap-1 ${className}`}
      onSuccess={(user) => {
        if (redirectTo) {
          navigate(redirectTo);
        }
      }}
    >
      注册
    </AuthRegisterButton>
  );
} 