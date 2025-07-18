import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LoginButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  redirectTo?: string;
  showIcon?: boolean;
}

interface SimpleLoginButtonProps {
  className?: string;
  redirectTo?: string;
}

/**
 * 登录按钮组件
 */
export function LoginButton({ 
  variant = "default", 
  size = "default", 
  className = "",
  redirectTo = "/dashboard",
  showIcon = true,
  children = "登录"
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, loading, login } = useUnifiedAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    setIsLoading(true);
    try {
      await login();
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      navigate(redirectTo);
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        加载中...
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          登录中...
        </>
      ) : (
        <>
          {showIcon && <LogIn className="w-4 h-4" />}
          {children}
        </>
      )}
    </Button>
  );
}

/**
 * 简化版登录按钮
 */
export function SimpleLoginButton({ 
  className = "",
  redirectTo = "/dashboard"
}: SimpleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, loading, login } = useUnifiedAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    setIsLoading(true);
    try {
      await login();
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      navigate(redirectTo);
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" className={className} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        加载中...
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={className}
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          登录中...
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          登录
        </>
      )}
    </Button>
  );
} 