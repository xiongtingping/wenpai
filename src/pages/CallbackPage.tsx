import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import unifiedAuthService from '@/services/unifiedAuthService';

/**
 * 登录回调页面 - 简化版本
 */
const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理登录回调...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 处理登录回调
        unifiedAuthService.handleLoginCallback();
        
        // 检查是否成功获取到用户信息
        const user = unifiedAuthService.getCurrentUser();
        const isAuth = unifiedAuthService.isAuthenticated();
        
        if (user && isAuth) {
          setStatus('success');
          setMessage('登录成功！正在跳转...');
          
          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setStatus('error');
          setMessage('登录失败，请重试');
        }
      } catch (error) {
        console.error('处理登录回调失败:', error);
        setStatus('error');
        setMessage('登录处理失败，请重试');
      }
    };

    handleCallback();
  }, [navigate]);

  const handleRetry = () => {
    setStatus('loading');
    setMessage('正在重新处理...');
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="w-6 h-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {status === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
            登录处理
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                重试
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                返回首页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallbackPage; 