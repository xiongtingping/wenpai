/**
 * 退出登录按钮组件
 * 提供安全可靠的退出登录功能
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { securityUtils } from '@/lib/security';
import { LogOut, Shield, AlertTriangle } from 'lucide-react';

/**
 * 退出登录按钮属性
 */
interface LogoutButtonProps {
  /** 按钮样式变体 */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** 按钮大小 */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** 按钮文本 */
  children?: React.ReactNode;
  /** 退出后跳转路径 */
  redirectUri?: string;
  /** 是否显示确认对话框 */
  showConfirm?: boolean;
  /** 确认对话框标题 */
  confirmTitle?: string;
  /** 确认对话框描述 */
  confirmDescription?: string;
  /** 是否启用安全日志 */
  enableSecurityLog?: boolean;
  /** 自定义样式类 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击回调 */
  onLogout?: () => void;
  /** 退出前回调 */
  onBeforeLogout?: () => boolean | Promise<boolean>;
}

/**
 * 退出登录按钮组件
 * @param props 组件属性
 * @returns React 组件
 */
export function LogoutButton({
  variant = 'destructive',
  size = 'default',
  children = '退出登录',
  redirectUri = '/',
  showConfirm = true,
  confirmTitle = '确认退出登录',
  confirmDescription = '您确定要退出登录吗？退出后需要重新登录才能访问受保护的功能。',
  enableSecurityLog = true,
  className = '',
  disabled = false,
  onLogout,
  onBeforeLogout
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useUnifiedAuth();
  const { toast } = useToast();

  /**
   * 安全日志记录
   */
  const logSecurity = (message: string, data?: any, level: 'info' | 'error' = 'info') => {
    if (enableSecurityLog) {
      securityUtils.secureLog(message, data, level);
    }
  };

  /**
   * 执行退出登录
   */
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // 记录退出操作
      logSecurity('用户点击退出登录', {
        redirectUri,
        timestamp: new Date().toISOString()
      });

      // 执行退出前回调
      if (onBeforeLogout) {
        const shouldContinue = await onBeforeLogout();
        if (!shouldContinue) {
          logSecurity('退出登录被取消', { reason: 'onBeforeLogout returned false' });
          return;
        }
      }

      // 执行退出登录
      await logout();

      // 记录退出成功
      logSecurity('用户退出登录成功', {
        redirectUri,
        timestamp: new Date().toISOString()
      });

      // 执行退出后回调
      if (onLogout) {
        onLogout();
      }

      // 显示成功提示
      toast({
        title: "退出成功",
        description: "您已安全退出登录，正在跳转...",
      });

    } catch (error) {
      console.error('退出登录失败:', error);
      
      const errorMessage = error instanceof Error ? error.message : '退出登录失败';
      
      // 记录错误日志
      logSecurity('退出登录失败', {
        error: errorMessage,
        redirectUri,
        timestamp: new Date().toISOString()
      }, 'error');

      // 显示错误提示
      toast({
        title: "退出失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * 直接退出（无确认）
   */
  const handleDirectLogout = () => {
    handleLogout();
  };

  // 按钮内容
  const buttonContent = (
    <>
      {isLoggingOut ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          退出中...
        </div>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          {children}
        </>
      )}
    </>
  );

  // 如果需要确认对话框
  if (showConfirm) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={disabled || isLoggingOut}
          >
            {buttonContent}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              {confirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoggingOut ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  退出中...
                </div>
              ) : (
                '确认退出'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // 直接退出按钮
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled || isLoggingOut}
      onClick={handleDirectLogout}
    >
      {buttonContent}
    </Button>
  );
}

/**
 * 简化的退出登录按钮
 * 基于用户提供的代码逻辑
 */
export function SimpleLogoutButton({
  redirectUri = '/',
  children = '退出登录',
  className = '',
  ...props
}: Omit<LogoutButtonProps, 'showConfirm'>) {
  return (
    <LogoutButton
      showConfirm={false}
      redirectUri={redirectUri}
      className={className}
      {...props}
    >
      {children}
    </LogoutButton>
  );
}

/**
 * 带确认的退出登录按钮
 */
export function ConfirmLogoutButton({
  redirectUri = '/',
  children = '退出登录',
  className = '',
  ...props
}: Omit<LogoutButtonProps, 'showConfirm'>) {
  return (
    <LogoutButton
      showConfirm={true}
      redirectUri={redirectUri}
      className={className}
      {...props}
    >
      {children}
    </LogoutButton>
  );
} 