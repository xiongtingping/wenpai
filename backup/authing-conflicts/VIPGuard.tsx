/**
 * VIP权限保护组件
 * 用于保护需要VIP权限的页面和功能
 * @module VIPGuard
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useAuthing } from '../../hooks/useAuthing';

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
function VIPGuard({
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
  const { user, isAuthenticated } = useUnifiedAuth();
  const { showLogin } = useAuthing();
  
  // 简化的角色检查逻辑
  const isVip = user && (user as any).roles?.includes(vipRoleCode);
  const isAdmin = user && (user as any).roles?.includes('admin');
  const loading = false;
  const error = null;

  const [accessGranted, setAccessGranted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // VIP权限检查
  useEffect(() => {
    const checkVIPAccess = async () => {
      try {
        setCheckingAccess(true);

        if (enableSecurityLog) {
          // securityUtils.secureLog('开始VIP权限检查', {
          //   userId: user?.id,
          //   isAuthenticated
          // });
        }

        // 检查用户是否已登录
        if (!isAuthenticated || !user) {
          if (enableSecurityLog) {
            // securityUtils.secureLog('用户未登录，重定向到登录页面');
          }
          
          console.log('需要登录，请先登录后再访问此功能');
          showLogin();
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
            // securityUtils.secureLog('非VIP用户尝试访问VIP功能', {
            //   userId: user.id,
            //   roles: (user as any).roles || [],
            //   isVip,
            //   isAdmin
            // }, 'error');
          }

          // 调用权限被拒绝回调
          onAccessDenied?.();

          if (showUpgradePrompt) {
            console.log('需要VIP权限，此功能仅限VIP用户使用，请升级您的账户');

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
          // securityUtils.secureLog('VIP权限检查通过', {
          //   userId: user.id,
          //   roles: (user as any).roles || [],
          //   isVip,
          //   isAdmin
          // });
        }

        // 调用权限通过回调
        onAccessGranted?.();

      } catch (error) {
        console.error('VIP权限检查失败:', error);
        
        if (enableSecurityLog) {
          // securityUtils.secureLog('VIP权限检查失败', {
          //   error: error instanceof Error ? error.message : '未知错误',
          //   userId: user?.id
          // }, 'error');
        }
        
        console.log('权限检查失败，请稍后重试或联系客服');
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
    loading, 
    navigate, 
    redirectTo, 
    showUpgradePrompt, 
    customCheck, 
    onAccessDenied, 
    onAccessGranted, 
    enableSecurityLog,
    showLogin
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

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">权限检查失败</h3>
          <p className="text-gray-600 mb-4">请稍后重试或联系客服</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // 权限验证通过，渲染子组件
  if (accessGranted) {
    return <>{children}</>;
  }

  // 默认显示加载状态
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在验证权限...</p>
      </div>
    </div>
  );
}

// 导出组件，确保HMR兼容
export { VIPGuard };

/**
 * VIP权限Hook
 * @param vipRoleCode VIP角色代码
 * @returns VIP权限状态
 */
function useVIPAccess(vipRoleCode: string = 'vip') {
  const { user, isAuthenticated } = useUnifiedAuth();
  
  const isVip = user && (user as any).roles?.includes(vipRoleCode);
  const isAdmin = user && (user as any).roles?.includes('admin');
  const hasAccess = isVip || isAdmin;
  
  return {
    isVip,
    isAdmin,
    hasAccess,
    isAuthenticated,
    user
  };
}

// 导出Hook
export { useVIPAccess };

/**
 * 检查VIP权限
 * @param roles 用户角色列表
 * @param vipRoleCode VIP角色代码
 * @returns 是否有VIP权限
 */
function checkVIPAccess(roles: string[], vipRoleCode: string = 'vip'): boolean {
  return roles.includes(vipRoleCode) || roles.includes('admin');
}

// 导出函数
export { checkVIPAccess };

/**
 * 简化版VIP保护组件
 */
function SimpleVIPGuard({ children, redirectTo = '/payment' }: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <VIPGuard redirectTo={redirectTo} showUpgradePrompt={false}>
      {children}
    </VIPGuard>
  );
}

// 导出简化组件
export { SimpleVIPGuard }; 