import React from 'react';
import { useAuth } from './AuthProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, login } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      // 触发 Guard 登录弹窗
      login();
    }
  }, [isAuthenticated, login]);

  if (!isAuthenticated) {
    // 未登录时不渲染受保护内容
    return null;
  }
  return <>{children}</>;
};

export default AuthGuard;

