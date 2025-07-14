/**
 * 登录按钮组件
 * 提供登录/注册功能的按钮组件
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
import { securityUtils } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showLogin } = useAuthing();
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * 处理登录点击
   */
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // 安全日志记录
      securityUtils.secureLog('用户点击登录按钮', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        redirectTo
      });

      // 调用Authing登录
      showLogin();

      toast({
        title: "正在跳转到登录页面",
        description: "请完成登录以继续使用",
      });

    } catch (error) {
      console.error('登录失败:', error);
      
      // 安全日志记录错误
      securityUtils.secureLog('登录按钮点击失败', {
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      }, 'error');

      toast({
        title: "登录失败",
        description: "请稍后重试或联系客服",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理用户中心点击
   */
  const handleUserCenter = () => {
    navigate('/user-profile');
  };

  // 如果用户已登录且显示用户状态
  if (isAuthenticated && showUserStatus) {
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
          {user?.nickname || user?.username || '用户中心'}
        </Button>
      </div>
    );
  }

  // 登录按钮
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogin}
      disabled={isLoading}
      className={`flex items-center gap-2 ${className}`}
    >
      {isLoading && showLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      {children || (isLoading ? '跳转中...' : '登录 / 注册')}
    </Button>
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
  const { showLogin } = useAuthing();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = async () => {
    if (isAuthenticated) return;
    
    try {
      setIsLoading(true);
      showLogin();
    } catch (error) {
      console.error('快速登录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null; // 已登录时不显示
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleQuickLogin}
      disabled={isLoading}
      className={`text-sm ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin mr-1" />
      ) : (
        <LogIn className="w-3 h-3 mr-1" />
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
  redirectTo = '/register'
}: {
  className?: string;
  redirectTo?: string;
}) {
  const { isAuthenticated } = useAuth();
  const { showLogin } = useAuthing();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (isAuthenticated) return;
    
    try {
      setIsLoading(true);
      
      // 安全日志记录
      securityUtils.secureLog('用户点击注册按钮', {
        timestamp: new Date().toISOString(),
        redirectTo
      });

      showLogin();
    } catch (error) {
      console.error('注册失败:', error);
      
      securityUtils.secureLog('注册按钮点击失败', {
        error: error instanceof Error ? error.message : '未知错误'
      }, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return null; // 已登录时不显示
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegister}
      disabled={isLoading}
      className={`flex items-center gap-1 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <UserPlus className="w-3 h-3" />
      )}
      注册
    </Button>
  );
} 