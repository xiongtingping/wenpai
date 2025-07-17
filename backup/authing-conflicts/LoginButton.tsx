import React from 'react';
import { Button } from '@/components/ui/button';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

interface LoginButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  redirectUrl?: string;
}

/**
 * 登录按钮组件 - 简化版本
 */
export const LoginButton: React.FC<LoginButtonProps> = ({
  children = '登录',
  className = '',
  variant = 'default',
  size = 'default',
  redirectUrl,
}) => {
  const { login, isAuthenticated } = useUnifiedAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      login(redirectUrl);
    }
  };

  if (isAuthenticated) {
    return null; // 已登录时不显示登录按钮
  }

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
      size={size}
    >
      {children}
    </Button>
  );
};

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
  const { isAuthenticated, loading, login } = useUnifiedAuth();

  if (isAuthenticated) {
    return null; // 已登录时不显示
  }

  const handleLogin = () => {
    login();
    if (redirectTo) {
      setTimeout(() => {
        navigate(redirectTo);
      }, 1000);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogin}
      disabled={loading}
      className={`text-sm ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      登录
    </Button>
  );
}

/**
 * 注册按钮组件
 * 专门用于注册的按钮
 */
export function RegisterButton({ 
  className = '',
  redirectTo = '/'
}: {
  className?: string;
  redirectTo?: string;
}) {
  const { isAuthenticated, loading, login } = useUnifiedAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return null; // 已登录时不显示
  }

  const handleLogin = () => {
    login();
    if (redirectTo) {
      setTimeout(() => {
        navigate(redirectTo);
      }, 1000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogin}
      disabled={loading}
      className={`flex items-center gap-1 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      注册
    </Button>
  );
} 