/**
 * 统一登录页面
 * 使用 Authing Guard 提供完整的登录体验
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 登录页面组件
 * @returns React 组件
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, showLogin } = useAuth();

  // 获取重定向路径
  const from = location.state?.from?.pathname || '/';

  // 如果已登录，直接跳转
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // 未登录时显示登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      // 延迟显示登录弹窗，确保页面已渲染
      const timer = setTimeout(() => {
        showLogin();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, showLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">欢迎使用文派AI</CardTitle>
          <CardDescription>
            请登录您的账户以继续使用内容适配工具
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              正在为您打开登录窗口...
            </p>
            <Button 
              onClick={showLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
            >
              重新打开登录窗口
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage; 