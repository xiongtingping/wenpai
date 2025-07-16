import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LogIn, 
  Loader2,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
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
  const { user, isAuthenticated, loading, login } = useUnifiedAuthContext();
  const navigate = useNavigate();

  /**
   * 处理用户中心点击
   */
  const handleUserCenter = () => {
    navigate('/user-profile');
  };

  /**
   * 处理登录点击
   */
  const handleLogin = () => {
    login();
    // 登录成功后跳转
    if (redirectTo) {
      // 延迟跳转，等待登录完成
      setTimeout(() => {
        navigate(redirectTo);
      }, 1000);
    }
  };

  // 如果用户已登录且显示用户状态
  if (isAuthenticated && showUserStatus && user) {
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

  // 显示登录按钮
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogin}
      disabled={loading}
      className={`flex items-center gap-2 ${className}`}
    >
      {loading && showLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      {children || '登录 / 注册'}
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
  const { isAuthenticated, loading, login } = useUnifiedAuthContext();
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
  const { isAuthenticated, loading, login } = useUnifiedAuthContext();
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