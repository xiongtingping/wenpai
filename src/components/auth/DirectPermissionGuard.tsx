/**
 * 🔧 [DIRECT_PERMISSION_GUARD_v2025.08.15]
 * 直接权限守卫组件 - 使用DirectAuthContext
 * 
 * 这个组件专门配合DirectAuthContext使用，不依赖UnifiedAuthContext
 */

import React, { useMemo } from 'react';
import { useDirectAuth } from '@/contexts/DirectAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, LogIn, UserPlus } from 'lucide-react';

export interface DirectPermissionGuardProps {
  children: React.ReactNode;
  required?: string;
  fallback?: React.ReactNode;
  autoRedirect?: boolean;
}

/**
 * 权限检查结果缓存
 */
const permissionCache = new Map<string, boolean>();
const CACHE_TTL = 5000; // 5秒缓存
const cacheTimestamps = new Map<string, number>();

/**
 * 安全的权限检查函数
 */
const checkPermissionSafely = (
  required: string | undefined,
  isAuthenticated: boolean,
  user: any,
  isDevelopment: boolean
): boolean => {
  if (!required) return true;

  console.log('🔒 直接权限检查:', required, { isAuthenticated, user: user?.id });

  // 缓存检查
  const cacheKey = `${required}_${isAuthenticated}_${user?.id || 'anonymous'}`;
  const now = Date.now();
  const cachedTime = cacheTimestamps.get(cacheKey);

  if (cachedTime && (now - cachedTime) < CACHE_TTL && permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey)!;
  }

  // 权限检查逻辑
  let hasPermission = false;

  if (required === 'auth:required') {
    // 需要登录
    hasPermission = isAuthenticated;
  } else if (required.startsWith('role:')) {
    // 角色检查
    const requiredRole = required.replace('role:', '');
    hasPermission = isAuthenticated && user?.roles?.includes(requiredRole);
  } else if (required.startsWith('permission:')) {
    // 权限检查
    const requiredPermission = required.replace('permission:', '');
    hasPermission = isAuthenticated && user?.permissions?.includes(requiredPermission);
  } else if (required.startsWith('feature:')) {
    // 功能检查
    const feature = required.replace('feature:', '');
    hasPermission = isAuthenticated && checkFeatureAccess(feature, user);
  } else if (required.startsWith('theme:')) {
    // 主题权限检查
    const theme = required.replace('theme:', '');
    hasPermission = checkThemeAccess(theme, user, isAuthenticated);
  } else {
    // 默认需要登录
    hasPermission = isAuthenticated;
  }

  // 开发环境特殊处理
  if (isDevelopment) {
    console.log('🔧 开发环境权限检查结果:', { required, hasPermission, user: user?.id });
  }

  // 缓存结果
  permissionCache.set(cacheKey, hasPermission);
  cacheTimestamps.set(cacheKey, now);

  return hasPermission;
};

/**
 * 检查功能访问权限
 */
const checkFeatureAccess = (feature: string, user: any): boolean => {
  // 基础功能，所有登录用户都可以访问
  const basicFeatures = ['emoji-generator', 'bookmark', 'profile'];
  
  if (basicFeatures.includes(feature)) {
    return true;
  }

  // 高级功能需要特定权限
  const advancedFeatures = ['ai-content', 'brand-analysis', 'hot-topics'];
  if (advancedFeatures.includes(feature)) {
    return user?.permissions?.includes('advanced') || user?.roles?.includes('premium');
  }

  return false;
};

/**
 * 检查主题访问权限
 */
const checkThemeAccess = (theme: string, user: any, isAuthenticated: boolean): boolean => {
  if (theme === 'basic') {
    return true; // 基础主题所有人都可以访问
  }
  
  if (theme === 'advanced') {
    return isAuthenticated; // 高级主题需要登录
  }
  
  if (theme === 'premium') {
    return isAuthenticated && (user?.roles?.includes('premium') || user?.permissions?.includes('premium'));
  }

  return false;
};

/**
 * 默认的权限拒绝组件
 */
const DefaultPermissionDenied: React.FC<{
  required: string;
  isAuthenticated: boolean;
  onLogin: () => void;
  onRegister: () => void;
}> = ({ required, isAuthenticated, onLogin, onRegister }) => {
  const getTitle = () => {
    if (!isAuthenticated) return '需要登录';
    if (required.startsWith('role:')) return '权限不足';
    if (required.startsWith('permission:')) return '功能受限';
    return '访问受限';
  };

  const getDescription = () => {
    if (!isAuthenticated) return '请登录后继续使用此功能';
    if (required.startsWith('role:')) return '您的账户角色无法访问此功能';
    if (required.startsWith('permission:')) return '您没有使用此功能的权限';
    return '您无法访问此内容';
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isAuthenticated ? (
            <div className="flex space-x-2">
              <Button onClick={onLogin} className="flex-1">
                <LogIn className="h-4 w-4 mr-2" />
                登录
              </Button>
              <Button onClick={onRegister} variant="outline" className="flex-1">
                <UserPlus className="h-4 w-4 mr-2" />
                注册
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                如需升级权限，请联系管理员或升级您的账户
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/profile'}>
                查看账户信息
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * 直接权限守卫组件
 */
export const DirectPermissionGuard: React.FC<DirectPermissionGuardProps> = React.memo(({
  children,
  required,
  fallback,
  autoRedirect = false
}) => {
  const { user, isAuthenticated, login, register } = useDirectAuth();
  const isDevelopment = import.meta.env.DEV;

  // 使用 useMemo 缓存权限检查结果，避免不必要的重新计算
  const hasPermission = useMemo(() => {
    return checkPermissionSafely(required, isAuthenticated, user, isDevelopment);
  }, [required, isAuthenticated, user?.id, user?.roles, user?.permissions, isDevelopment]);

  // 如果有权限，直接渲染子组件
  if (hasPermission) {
    return <>{children}</>;
  }

  // 如果设置了自动重定向且用户未登录，触发登录
  if (autoRedirect && !isAuthenticated) {
    login();
    return null;
  }

  // 如果提供了自定义fallback，使用它
  if (fallback) {
    return <>{fallback}</>;
  }

  // 使用默认的权限拒绝组件
  return (
    <DefaultPermissionDenied
      required={required || ''}
      isAuthenticated={isAuthenticated}
      onLogin={login}
      onRegister={register}
    />
  );
});

DirectPermissionGuard.displayName = 'DirectPermissionGuard';

export default DirectPermissionGuard;
