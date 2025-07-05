/**
 * Authing 回调页面组件
 * 处理 Authing 授权回调，获取用户信息并跳转到首页
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuthing } from '@/hooks/useAuthing';
import authingService from '@/services/authingService';

/**
 * Callback 页面组件
 * 处理 Authing 重定向回调，获取用户信息并跳转到首页
 * @returns React 组件
 */
const Callback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCurrentUser } = useAuthing();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    /**
     * 处理 Authing 重定向回调
     */
    const handleCallback = async () => {
      try {
        setStatus('loading');
        
        // 处理重定向回调
        const user = await authingService.handleRedirectCallback();
        setUserInfo(user);
        
        // 获取用户信息
        await getCurrentUser();
        
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
  }, [navigate, location, getCurrentUser]);

  /**
   * 重试登录
   */
  const handleRetry = () => {
    setStatus('loading');
    setError('');
    window.location.href = '/authing-login';
  };

  /**
   * 返回首页
   */
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {status === 'loading' && '正在登录...'}
            {status === 'success' && '登录成功'}
            {status === 'error' && '登录失败'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {status === 'loading' && '正在处理您的登录信息，请稍候...'}
            {status === 'success' && '欢迎使用文派AI，正在跳转...'}
            {status === 'error' && '登录过程中遇到问题，请重试'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 加载状态 */}
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">正在验证您的身份...</p>
            </div>
          )}

          {/* 成功状态 */}
          {status === 'success' && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  ✅ 登录成功！正在为您跳转到应用首页...
                </AlertDescription>
              </Alert>
              
              {userInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">用户信息</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    {userInfo.username && (
                      <p>用户名: {userInfo.username}</p>
                    )}
                    {userInfo.email && (
                      <p>邮箱: {userInfo.email}</p>
                    )}
                    {userInfo.nickname && (
                      <p>昵称: {userInfo.nickname}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <Button onClick={handleGoHome} variant="outline">
                  立即跳转
                </Button>
              </div>
            </div>
          )}

          {/* 错误状态 */}
          {status === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  ❌ {error}
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-3">
                <Button onClick={handleRetry} className="w-full">
                  重新登录
                </Button>
                <Button onClick={handleGoHome} variant="outline" className="w-full">
                  返回首页
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>如果问题持续存在，请联系技术支持</p>
              </div>
            </div>
          )}

          {/* 调试信息 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">调试信息</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>当前状态: {status}</p>
                <p>URL: {window.location.href}</p>
                <p>重定向来源: {location.state?.from?.pathname || '无'}</p>
                {userInfo && (
                  <p>用户ID: {userInfo.id}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Callback; 