import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermission, PermissionResult } from '@/hooks/usePermission';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Star, AlertTriangle } from 'lucide-react';

/**
 * 权限守卫组件属性
 */
interface PermissionGuardProps {
  /** 需要的权限键或权限键数组 */
  required: string | string[];
  /** 权限检查失败时显示的内容 */
  fallback?: React.ReactNode;
  /** 是否自动重定向 */
  autoRedirect?: boolean;
  /** 重定向延迟（毫秒） */
  redirectDelay?: number;
  /** 子组件 */
  children: React.ReactNode;
}

/**
 * 默认的权限失败提示组件
 */
const DefaultFallback: React.FC<{ permission: PermissionResult }> = ({ permission }) => {
  const navigate = useNavigate();
  
  const getIcon = () => {
    if (permission.details?.key.includes('auth:required')) return <Lock className="h-8 w-8" />;
    if (permission.details?.key.includes('vip:required')) return <Crown className="h-8 w-8" />;
    if (permission.details?.key.includes('preview:')) return <Star className="h-8 w-8" />;
    return <AlertTriangle className="h-8 w-8" />;
  };

  const getTitle = () => {
    if (permission.details?.key.includes('auth:required')) return '需要登录';
    if (permission.details?.key.includes('vip:required')) return '需要VIP权限';
    if (permission.details?.key.includes('preview:')) return '功能内测中';
    return '权限不足';
  };

  const getDescription = () => {
    return permission.reason || '您没有访问此功能的权限';
  };

  const handleAction = () => {
    if (permission.redirect) {
      navigate(permission.redirect);
    }
  };

  const getActionText = () => {
    if (permission.details?.key.includes('auth:required')) return '去登录';
    if (permission.details?.key.includes('vip:required')) return '升级VIP';
    if (permission.details?.key.includes('preview:')) return '申请内测';
    return '返回首页';
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-xl">{getTitle()}</CardTitle>
          <CardDescription className="text-base">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAction} className="w-full">
            {getActionText()}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * 统一的权限守卫组件
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  required,
  fallback,
  autoRedirect = true,
  redirectDelay = 2000,
  children
}) => {
  const navigate = useNavigate();
  const permission = usePermission(required);

  // 自动重定向逻辑
  useEffect(() => {
    if (!permission.pass && autoRedirect && permission.redirect) {
      const timer = setTimeout(() => {
        console.log(`🔒 权限检查失败，自动重定向到: ${permission.redirect}`);
        navigate(permission.redirect!);
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [permission.pass, permission.redirect, autoRedirect, redirectDelay, navigate]);

  // 权限检查通过，渲染子组件
  if (permission.pass) {
    return <>{children}</>;
  }

  // 权限检查失败，渲染 fallback 或默认提示
  return (
    <>
      {fallback || <DefaultFallback permission={permission} />}
    </>
  );
};

export default PermissionGuard; 