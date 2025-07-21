/**
 * 认证回调页面
 * 处理 Authing OIDC 回调
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import AuthingClient from '@/services/authingClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 回调页面组件
 */
export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthingLogin } = useUnifiedAuth();
  const { toast } = useToast();
  const authingClient = AuthingClient.getInstance();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 检查是否有错误
        if (error) {
          setError(errorDescription || error);
          setStatus('error');
          toast({
            title: '认证失败',
            description: errorDescription || error,
            variant: 'destructive'
          });
          return;
        }

        // 检查必要参数
        if (!code) {
          setError('认证参数不完整，缺少 code');
          setStatus('error');
          toast({
            title: '认证失败',
            description: '认证参数不完整，缺少 code',
            variant: 'destructive'
          });
          return;
        }

        // 处理回调
        const callbackData = await authingClient.handleCallback();
        if (!callbackData || !callbackData.user) {
          setError('认证回调处理失败，未获取到用户信息');
          setStatus('error');
          toast({
            title: '认证失败',
            description: '认证回调处理失败，未获取到用户信息',
            variant: 'destructive'
          });
          return;
        }

        handleAuthingLogin(callbackData.user);
        setStatus('success');
        toast({
          title: '认证成功',
          description: '欢迎使用文派！',
        });
        setTimeout(() => {
          // 处理完 code 后跳转到首页或 state 指定页面，replace: true 清理历史记录，防止重复消费
          const redirectTo = callbackData.state ? decodeURIComponent(callbackData.state) : '/';
          navigate(redirectTo, { replace: true });
        }, 1500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '认证失败';
        setError(errorMessage);
        setStatus('error');
        toast({
          title: '认证失败',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    };
    handleCallback();
    // eslint-disable-next-line
  }, [searchParams, handleAuthingLogin, authingClient, navigate, toast]);

  // 加载状态
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">正在处理认证回调...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 成功状态
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">认证成功</h3>
              <p className="text-gray-600">正在跳转到首页...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 错误状态
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">认证失败</CardTitle>
          <CardDescription className="text-center">
            处理认证回调时出现错误
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回登录
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 