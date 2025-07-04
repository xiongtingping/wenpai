import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * 受保护路由组件的属性接口
 */
interface ProtectedRouteProps {
  /** 子组件 */
  children: ReactNode;
  /** 重定向路径，默认为登录页面 */
  redirectTo?: string;
}

/**
 * 受保护的路由组件
 * 检查用户是否已登录，如果未登录则重定向到登录页面
 * @param props - 组件属性
 * @returns 受保护的组件或重定向
 */
const ProtectedRoute = ({ children, redirectTo = '/authing-login' }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 如果正在加载认证状态，显示加载指示器
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 如果已认证，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute; 