/**
 * 认证弹窗组件
 * 使用Dialog包装统一认证入口
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LogIn, 
  UserPlus, 
  Loader2,
  Shield,
  CheckCircle,
  X
} from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAuthing } from '@/hooks/useAuthing';
import { useToast } from '@/hooks/use-toast';
import { securityUtils } from '@/lib/security';
import UnifiedAuthEntry from './UnifiedAuthEntry';

/**
 * 认证弹窗组件属性
 */
interface AuthModalProps {
  /** 是否打开弹窗 */
  open: boolean;
  /** 打开/关闭弹窗的回调 */
  onOpenChange: (open: boolean) => void;
  /** 默认激活的标签页 */
  defaultTab?: 'login' | 'register';
  /** 登录/注册成功后的回调 */
  onSuccess?: (user: any) => void;
  /** 自定义样式类 */
  className?: string;
}

/**
 * 认证弹窗组件
 */
export default function AuthModal({
  open,
  onOpenChange,
  defaultTab = 'login',
  onSuccess,
  className = ''
}: AuthModalProps) {
  const { user, isAuthenticated, loading: authLoading } = useUnifiedAuth();
  const { showLogin } = useAuthing();
  const { toast } = useToast();

  /**
   * 处理关闭弹窗
   */
  const handleClose = () => {
    onOpenChange(false);
  };

  /**
   * 处理Authing登录
   */
  const handleAuthingLogin = () => {
    try {
      securityUtils.secureLog('用户通过弹窗选择Authing登录');
      showLogin();
      handleClose(); // 关闭弹窗，让Authing Guard接管
    } catch (error) {
      console.error('Authing登录失败:', error);
      toast({
        title: "登录失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 处理登录/注册成功
   */
  const handleSuccess = (user: any) => {
    onSuccess?.(user);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              登录 / 注册
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          {/* 如果用户已登录，显示用户信息 */}
          {isAuthenticated && user ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
                <Badge variant="outline" className="text-green-600">
                  已登录
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-medium">欢迎回来！</h3>
                <p className="text-sm text-muted-foreground">
                  {user.nickname || user.username || user.email}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleClose}
              >
                继续使用
              </Button>
            </div>
          ) : (
            <UnifiedAuthEntry
              defaultTab={defaultTab}
              modal={true}
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 快速登录按钮组件
 * 点击后打开认证弹窗
 */
export function QuickAuthButton({
  variant = 'default',
  size = 'default',
  className = '',
  defaultTab = 'login',
  onSuccess,
  children
}: {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  defaultTab?: 'login' | 'register';
  onSuccess?: (user: any) => void;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useUnifiedAuth();

  if (isAuthenticated) {
    return null; // 已登录时不显示
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {children || (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            登录 / 注册
          </>
        )}
      </Button>

      <AuthModal
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultTab={defaultTab}
        onSuccess={onSuccess}
      />
    </>
  );
}

/**
 * 登录按钮组件
 * 专门用于登录的按钮
 */
export function LoginButton({
  variant = 'default',
  size = 'default',
  className = '',
  onSuccess,
  children
}: {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSuccess?: (user: any) => void;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useUnifiedAuth();

  if (isAuthenticated) {
    return null; // 已登录时不显示
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {children || (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            登录
          </>
        )}
      </Button>

      <AuthModal
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultTab="login"
        onSuccess={onSuccess}
      />
    </>
  );
}

/**
 * 注册按钮组件
 * 专门用于注册的按钮
 */
export function RegisterButton({
  variant = 'outline',
  size = 'default',
  className = '',
  onSuccess,
  children
}: {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onSuccess?: (user: any) => void;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useUnifiedAuth();

  if (isAuthenticated) {
    return null; // 已登录时不显示
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {children || (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            注册
          </>
        )}
      </Button>

      <AuthModal
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultTab="register"
        onSuccess={onSuccess}
      />
    </>
  );
} 