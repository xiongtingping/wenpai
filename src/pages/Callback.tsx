/**
 * Authing 回调页面组件
 * 处理 Authing 授权回调，获取用户信息并跳转到首页
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Callback 页面组件
 * 处理 Authing 重定向回调，获取用户信息并跳转到首页
 * @returns React 组件
 */
const Callback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    /**
     * 处理 Authing 重定向回调
     */
    const handleCallback = async () => {
      try {
        setStatus('loading');
        
        // 重新检查认证状态
        await checkAuth();
        
        setStatus('success');
        
        // 延迟跳转，让用户看到成功信息
        setTimeout(() => {
          // 获取重定向路径
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }, 1500);
        
      } catch (error: any) {
        console.error('处理回调失败:', error);
        setError(error.message || '登录失败，请重试');
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate, location, checkAuth]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>正在处理登录...</CardTitle>
            <CardDescription>
              请稍候，我们正在验证您的登录信息
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">验证中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">登录失败</CardTitle>
            <CardDescription>
              处理登录时发生错误
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                重试
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">登录成功</CardTitle>
          <CardDescription>
            正在为您跳转...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600">登录验证成功，正在跳转...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Callback; 