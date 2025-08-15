/**
 * 🔧 [DIRECT_CALLBACK_PAGE_v2025.08.15]
 * 直接认证回调处理页面 - 使用DirectAuthContext
 * 
 * 这个页面专门处理直接OAuth2流程的回调，不依赖Authing Guard
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDirectAuth } from '@/contexts/DirectAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, Home, RefreshCw } from 'lucide-react';

/**
 * 直接认证回调处理页面
 */
const DirectCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthCallback, checkAuth } = useDirectAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('正在处理认证回调...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 DirectCallbackPage: 开始处理认证回调...');
        
        // 获取 URL 参数
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        console.log('📋 DirectCallbackPage: URL 参数:', { code, state, error, errorDescription });
        
        // 检查是否有错误
        if (error) {
          console.error('❌ DirectCallbackPage: 认证错误:', error, errorDescription);
          setStatus('error');
          setMessage('认证失败');
          setError(errorDescription || error);
          return;
        }
        
        // 检查是否有授权码
        if (!code) {
          console.error('❌ DirectCallbackPage: 缺少授权码');
          setStatus('error');
          setMessage('认证失败');
          setError('缺少授权码，请重新登录');
          return;
        }
        
        // 更新状态
        setMessage('正在验证授权码...');
        
        // 处理认证回调
        await handleAuthCallback(code, state);
        
        // 成功
        setStatus('success');
        setMessage('认证成功！正在跳转...');
        
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          const redirectTo = localStorage.getItem('login_redirect_to') || '/';
          navigate(redirectTo);
        }, 2000);
        
      } catch (error) {
        console.error('❌ DirectCallbackPage: 处理回调失败:', error);
        setStatus('error');
        setMessage('认证处理失败');
        setError(error.message || '未知错误');
      }
    };

    handleCallback();
  }, [searchParams, handleAuthCallback, navigate]);

  /**
   * 重试认证
   */
  const handleRetry = () => {
    setStatus('loading');
    setMessage('正在重新处理认证回调...');
    setError(null);
    
    // 重新检查认证状态
    checkAuth();
    
    // 如果还是失败，跳转到登录页面
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  /**
   * 返回首页
   */
  const handleGoHome = () => {
    navigate('/');
  };

  /**
   * 渲染状态图标
   */
  const renderStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
    }
  };

  /**
   * 渲染状态徽章
   */
  const renderStatusBadge = () => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">处理中</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">成功</Badge>;
      case 'error':
        return <Badge variant="destructive">失败</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {renderStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">
            认证处理
          </CardTitle>
          <CardDescription>
            正在处理您的登录认证
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 状态信息 */}
          <div className="text-center space-y-2">
            {renderStatusBadge()}
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>
          
          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    错误详情
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* URL 参数信息（开发环境） */}
          {import.meta.env.DEV && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                调试信息
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Code: {searchParams.get('code') ? '✓' : '✗'}</div>
                <div>State: {searchParams.get('state') || 'N/A'}</div>
                <div>Error: {searchParams.get('error') || 'N/A'}</div>
              </div>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="flex space-x-2">
            {status === 'error' && (
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
            )}
            
            <Button 
              onClick={handleGoHome} 
              variant={status === 'error' ? 'default' : 'outline'}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
          
          {/* 帮助信息 */}
          {status === 'error' && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                如果问题持续存在，请联系客服或尝试清除浏览器缓存
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectCallbackPage;
