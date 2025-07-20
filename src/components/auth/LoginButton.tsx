/**
 * ✅ 登录按钮组件 - 使用 Authing 官方认证系统
 * 
 * 本组件通过 useUnifiedAuth 调用 Authing 官方认证链路
 * 不包含任何本地模拟或备用登录逻辑
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react';

/**
 * 登录按钮属性
 */
interface LoginButtonProps {
  /** 按钮样式变体 */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** 按钮尺寸 */
  size?: "default" | "sm" | "lg" | "icon";
  /** 自定义样式类 */
  className?: string;
  /** 登录成功后跳转的目标页面 */
  redirectTo?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 按钮文本 */
  children?: React.ReactNode;
}

/**
 * 登录按钮组件
 * 使用 Authing 官方认证系统进行登录
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
  const { isAuthenticated, loading, login, error } = useUnifiedAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    setIsLoading(true);
    try {
      await login(redirectTo);
      toast({
        title: "正在登录",
        description: "请在弹出的 Authing 窗口中完成登录",
      });
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