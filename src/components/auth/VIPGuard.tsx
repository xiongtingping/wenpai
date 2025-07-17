/**
 * VIP权限守卫组件
 * 检查用户是否具有VIP权限
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * VIP守卫属性
 */
interface VIPGuardProps {
  /** 子组件 */
  children: ReactNode;
  /** 无权限时显示的组件 */
  fallback?: ReactNode;
  /** 是否显示升级提示 */
  showUpgradePrompt?: boolean;
  /** 重定向路径 */
  redirectTo?: string;
}

/**
 * VIP权限守卫组件
 * @param props 组件属性
 * @returns React 组件
 */
const VIPGuard: React.FC<VIPGuardProps> = ({
  children,
  fallback,
  showUpgradePrompt = true,
  redirectTo = '/vip'
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, login } = useUnifiedAuth();
  const { hasRole, loading: permissionLoading } = usePermissions();
  
  const [isVip, setIsVip] = useState(false);
  const [checking, setChecking] = useState(true);

  // 检查VIP权限
  useEffect(() => {
    const checkVIPStatus = async () => {
      try {
        setChecking(true);
        
        if (!isAuthenticated) {
          setIsVip(false);
          return;
        }

        // 检查VIP角色
        const hasVIPRole = hasRole('vip') || hasRole('premium') || hasRole('pro');
        setIsVip(hasVIPRole);
        
        console.log('VIP权限检查结果:', { 
          userId: user?.id, 
          isVip: hasVIPRole,
          roles: user?.roles 
        });
        
      } catch (error) {
        console.error('检查VIP权限失败:', error);
        setIsVip(false);
      } finally {
        setChecking(false);
      }
    };

    checkVIPStatus();
  }, [isAuthenticated, user, hasRole]);

  // 如果正在检查权限，显示加载状态
  if (checking || permissionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查VIP权限中...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>
              请先登录以访问VIP功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => login()} 
              className="w-full"
            >
              立即登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 如果用户有VIP权限，显示子组件
  if (isVip) {
    return <>{children}</>;
  }

  // 如果用户没有VIP权限，显示升级提示或自定义fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // 默认VIP升级提示
  if (showUpgradePrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>VIP专属功能</CardTitle>
            <CardDescription>
              此功能仅对VIP用户开放，升级即可享受
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">当前用户</span>
                <Badge variant="secondary">{user?.nickname || user?.username || '用户'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">会员状态</span>
                <Badge variant="outline">普通用户</Badge>
              </div>
            </div>
            
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">升级VIP享受更多特权</p>
                  <p className="text-blue-600">• 无限制使用所有功能</p>
                  <p className="text-blue-600">• 优先客服支持</p>
                  <p className="text-blue-600">• 专属功能体验</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate(redirectTo)} 
              className="w-full"
            >
              立即升级
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default VIPGuard; 