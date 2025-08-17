/**
 * 🔒 路由守卫组件
 * 
 * 功能：
 * - 保护需要认证的路由
 * - 检查用户权限等级
 * - 重定向未授权用户
 * - 提供权限提示
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Crown, AlertCircle } from 'lucide-react';

export interface RouteGuardProps {
  children: React.ReactNode;
  /** 是否需要登录 */
  requireAuth?: boolean;
  /** 需要的最低权限等级 */
  requiredTier?: 'free' | 'pro' | 'premium';
  /** 重定向路径 */
  redirectTo?: string;
  /** 自定义权限检查函数 */
  customCheck?: (user: any) => boolean;
}

/**
 * 路由守卫组件
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = false,
  requiredTier,
  redirectTo = '/',
  customCheck
}) => {
  const { user, isAuthenticated, loading: isLoading } = useUnifiedAuth();
  const location = useLocation();

  // 加载中状态
  if (isLoading) {
    return <LoadingSpinner text="验证用户权限..." />;
  }

  // 检查登录状态
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查权限等级
  if (requiredTier && user) {
    const userTier = user.tier || 'free';
    const tierLevels = { free: 0, pro: 1, premium: 2 };
    
    if (tierLevels[userTier as keyof typeof tierLevels] < tierLevels[requiredTier as keyof typeof tierLevels]) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">需要升级权限</CardTitle>
              <CardDescription>
                此功能需要 {requiredTier === 'pro' ? 'Pro' : 'Premium'} 会员权限
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                您当前是 {userTier === 'free' ? '免费' : userTier === 'pro' ? 'Pro' : 'Premium'} 用户
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.history.back()}
                >
                  返回
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => window.location.href = '/upgrade'}
                >
                  立即升级
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // 自定义权限检查
  if (customCheck && !customCheck(user)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * 需要登录的路由守卫
 */
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard requireAuth={true}>
      {children}
    </RouteGuard>
  );
};

/**
 * Pro会员路由守卫
 */
export const ProGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard requireAuth={true} requiredTier="pro">
      {children}
    </RouteGuard>
  );
};

/**
 * Premium会员路由守卫
 */
export const PremiumGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard requireAuth={true} requiredTier="premium">
      {children}
    </RouteGuard>
  );
};

/**
 * 管理员路由守卫
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RouteGuard 
      requireAuth={true} 
      customCheck={(user) => user?.role === 'admin'}
      redirectTo="/403"
    >
      {children}
    </RouteGuard>
  );
};

export default RouteGuard;
