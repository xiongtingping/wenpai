/**
 * VIP权限保护组件
 * 用于保护需要VIP权限的页面和功能
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { securityUtils } from '@/lib/security';
import { Crown, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * VIP权限保护组件属性
 */
interface VIPGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 重定向路径 */
  redirectTo?: string;
  /** 是否显示升级提示 */
  showUpgradePrompt?: boolean;
  /** 自定义权限检查逻辑 */
  customCheck?: (isVip: boolean, isAdmin: boolean) => boolean;
  /** 权限检查失败时的回调 */
  onAccessDenied?: () => void;
  /** 权限检查成功时的回调 */
  onAccessGranted?: () => void;
  /** 是否启用安全日志 */
  enableSecurityLog?: boolean;
  /** VIP角色代码 */
  vipRoleCode?: string;
}

/**
 * VIP权限保护组件
 * @param props 组件属性
 * @returns React 组件
 */
export function VIPGuard({
  children,
  redirectTo = '/payment',
  showUpgradePrompt = true,
  customCheck,
  onAccessDenied,
  onAccessGranted,
  enableSecurityLog = true,
  vipRoleCode = 'vip'
}: VIPGuardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { isVip, isAdmin, roles, loading, error } = useUserRoles({
    autoCheck: true,
    enableSecurityLog,
    vipRoleCode
  });

  const [accessGranted, setAccessGranted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // VIP权限检查
  useEffect(() => {
    const checkVIPAccess = async () => {
      try {
        setCheckingAccess(true);

        if (enableSecurityLog) {
          securityUtils.secureLog('开始VIP权限检查', {
            userId: user?.id,
            isAuthenticated
          });
        }

        // 检查用户是否已登录
        if (!isAuthenticated || !user) {
          if (enableSecurityLog) {
            securityUtils.secureLog('用户未登录，重定向到登录页面');
          }
          
          toast({
            title: "需要登录",
            description: "请先登录后再访问此功能",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        // 等待角色检查完成
        if (loading) {
          return;
        }

        // 使用自定义检查逻辑或默认逻辑
        const hasAccess = customCheck 
          ? customCheck(isVip, isAdmin)
          : (isVip || isAdmin);

        if (!hasAccess) {
          if (enableSecurityLog) {
            securityUtils.secureLog('非VIP用户尝试访问VIP功能', {
              userId: user.id,
              roles: roles,
              isVip,
              isAdmin
            }, 'error');
          }

          // 调用权限被拒绝回调
          onAccessDenied?.();

          if (showUpgradePrompt) {
            toast({
              title: "需要VIP权限",
              description: "此功能仅限VIP用户使用，请升级您的账户",
              variant: "destructive"
            });

            // 延迟跳转，让用户看到提示
            setTimeout(() => {
              navigate(redirectTo);
            }, 2000);
          } else {
            navigate(redirectTo);
          }
          return;
        }

        // 权限验证通过
        setAccessGranted(true);
        
        if (enableSecurityLog) {
          securityUtils.secureLog('VIP权限检查通过', {
            userId: user.id,
            roles: roles,
            isVip,
            isAdmin
          });
        }

        // 调用权限通过回调
        onAccessGranted?.();

      } catch (error) {
        console.error('VIP权限检查失败:', error);
        
        if (enableSecurityLog) {
          securityUtils.secureLog('VIP权限检查失败', {
            error: error instanceof Error ? error.message : '未知错误',
            userId: user?.id
          }, 'error');
        }
        
        toast({
          title: "权限检查失败",
          description: "请稍后重试或联系客服",
          variant: "destructive"
        });
      } finally {
        setCheckingAccess(false);
      }
    };

    checkVIPAccess();
  }, [
    isAuthenticated, 
    user, 
    isVip, 
    isAdmin, 
    roles, 
    loading, 
    navigate, 
    toast, 
    redirectTo, 
    showUpgradePrompt, 
    customCheck, 
    onAccessDenied, 
    onAccessGranted, 
    enableSecurityLog
  ]);

  // 加载状态
  if (checkingAccess || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在验证VIP权限...</p>
        </div>
      </div>
    );
  }

  // 权限被拒绝且显示升级提示
  if (!accessGranted && showUpgradePrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">需要VIP权限</h1>
          <p className="text-gray-600 mb-6">
            此功能仅限VIP用户使用，请升级您的账户以享受专属功能。
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(redirectTo)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
            >
              <Crown className="w-4 h-4 mr-2" />
              立即升级VIP
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              返回首页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 权限验证通过，显示子组件
  if (accessGranted) {
    return <>{children}</>;
  }

  // 权限被拒绝且不显示升级提示，返回null
  return null;
}

/**
 * 简化的VIP权限检查Hook
 * @param vipRoleCode VIP角色代码
 * @returns VIP权限状态
 */
export function useVIPAccess(vipRoleCode: string = 'vip') {
  const { isVip, isAdmin, loading } = useUserRoles({
    autoCheck: true,
    enableSecurityLog: true,
    vipRoleCode
  });

  return {
    hasVIPAccess: isVip || isAdmin,
    isVip,
    isAdmin,
    loading
  };
}

/**
 * VIP权限检查函数
 * @param roles 用户角色列表
 * @param vipRoleCode VIP角色代码
 * @returns 是否有VIP权限
 */
export function checkVIPAccess(roles: string[], vipRoleCode: string = 'vip'): boolean {
  return roles.includes(vipRoleCode) || roles.includes('admin');
}

/**
 * VIP权限检查组件（简化版）
 * @param props 组件属性
 * @returns React 组件
 */
export function SimpleVIPGuard({ children, redirectTo = '/payment' }: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { hasVIPAccess, loading } = useVIPAccess();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !hasVIPAccess) {
      navigate(redirectTo);
    }
  }, [hasVIPAccess, loading, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return hasVIPAccess ? <>{children}</> : null;
} 