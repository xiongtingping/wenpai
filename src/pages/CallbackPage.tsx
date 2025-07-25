/**
 * ✅ FIXED: 2025-01-05 更新 Authing 认证回调处理页面
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, Home, RefreshCw } from 'lucide-react';

/**
 * Authing 认证回调处理页面
 */
const CallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthingLogin, checkAuth } = useUnifiedAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('正在处理认证回调...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 CallbackPage: 开始处理认证回调...');
        
        // 获取 URL 参数
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        console.log('📋 CallbackPage: URL 参数:', { code, state, error, errorDescription });
        
        // 检查是否有错误
        if (error) {
          console.error('❌ CallbackPage: 认证错误:', error, errorDescription);
          setStatus('error');
          setMessage('认证失败');
          setError(errorDescription || error);
          return;
        }
        
        // 检查是否有授权码
        if (!code) {
          console.error('❌ CallbackPage: 缺少授权码');
          setStatus('error');
          setMessage('缺少授权码');
          setError('未收到有效的授权码');
          return;
        }
        
        // 重新检查认证状态（这会触发 UnifiedAuthContext 中的回调处理）
        console.log('🔐 CallbackPage: 重新检查认证状态...');
        await checkAuth();
        
        // 等待一段时间让认证处理完成
        setTimeout(() => {
          console.log('✅ CallbackPage: 认证处理完成');
          setStatus('success');
          setMessage('认证成功！正在跳转...');
          
          // 跳转到首页或指定页面
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }, 1000);
        
      } catch (error) {
        console.error('❌ CallbackPage: 处理回调失败:', error);
        setStatus('error');
        setMessage('处理认证回调失败');
        setError(error instanceof Error ? error.message : '未知错误');
      }
    };

    handleCallback();
  }, [searchParams, navigate, handleAuthingLogin, checkAuth]);

  const handleRetry = () => {
    setStatus('loading');
    setMessage('正在重新处理认证回调...');
    setError(null);
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-xl font-semibold">
            {status === 'loading' && '认证处理中'}
            {status === 'success' && '认证成功'}
            {status === 'error' && '认证失败'}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center space-y-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                登录成功
              </Badge>
              <p className="text-sm text-gray-600">
                您已成功登录，正在跳转到首页...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">认证失败</p>
                    {error && (
                      <p className="text-red-600 mt-1">{error}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重试
                </Button>
                <Button 
                  onClick={handleGoHome}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </div>
            </div>
          )}
          
          {/* 调试信息 */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-mono text-gray-600">
                <strong>调试信息:</strong><br />
                Code: {searchParams.get('code') || '无'}<br />
                State: {searchParams.get('state') || '无'}<br />
                Error: {searchParams.get('error') || '无'}<br />
                Error Description: {searchParams.get('error_description') || '无'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallbackPage; 