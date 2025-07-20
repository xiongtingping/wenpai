/**
 * ✅ 认证回调页面 - 使用 Authing 官方认证系统
 * 
 * 本页面处理 Authing 认证完成后的回调逻辑
 * 获取 token 并写入全局用户信息，不包含任何本地模拟逻辑
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * 认证回调页面组件
 * @returns React 组件
 */
const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理认证回调...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('loading');
        setMessage('正在验证认证信息...');

        // 创建 Authing 实例
        const config = getAuthingConfig();
        const authing = new AuthenticationClient({
          appId: config.appId,
          appHost: config.host,
        });

        // 处理重定向回调
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // 检查是否有错误
        if (error) {
          throw new Error(errorDescription || error);
        }
        
        if (!code) {
          throw new Error('未找到授权码');
        }
        
        setMessage('正在获取访问令牌...');
        
        // 获取访问令牌
        const tokenSet = await authing.getAccessTokenByCode(code, {
          codeVerifier: undefined
        });
        
        if (!tokenSet || !tokenSet.access_token) {
          throw new Error('获取访问令牌失败');
        }
        
        setMessage('正在获取用户信息...');
        
        // 获取用户信息
        const userInfo = await authing.getCurrentUser();
        
        if (userInfo) {
          console.log("✅ Authing 登录成功，用户信息：", userInfo);
          
          setStatus('success');
          setMessage('认证成功！正在获取用户信息...');
          
          // 转换用户信息格式
          const user = {
            id: userInfo.id || (userInfo as any).userId || `user_${Date.now()}`,
            username: userInfo.username || userInfo.nickname || '用户',
            email: userInfo.email || '',
            phone: userInfo.phone || '',
            nickname: userInfo.nickname || userInfo.username || '用户',
            avatar: (userInfo as any).avatar || (userInfo as any).photo || '',
            loginTime: new Date().toISOString(),
            roles: (userInfo as any).roles || [],
            permissions: (userInfo as any).permissions || []
          };
          
          // 保存用户信息到本地存储
          localStorage.setItem('authing_user', JSON.stringify(user));
          localStorage.setItem('authing_token', tokenSet.access_token);
          
          setMessage('用户信息获取成功！正在跳转...');
          
          // 检查是否有保存的跳转目标
          const redirectTo = localStorage.getItem('login_redirect_to');
          
          // 延迟跳转
          setTimeout(() => {
            if (redirectTo) {
              console.log('🎯 跳转到保存的目标:', redirectTo);
              localStorage.removeItem('login_redirect_to');
              navigate(redirectTo, { replace: true });
            } else {
              console.log('🏠 跳转到首页');
              navigate('/', { replace: true });
            }
          }, 1500);

        } else {
          setStatus('error');
          setMessage('获取用户信息失败');
        }

      } catch (error) {
        console.error('❌ 处理认证回调失败:', error);
        setStatus('error');
        setMessage(`处理认证回调失败: ${error instanceof Error ? error.message : '未知错误'}`);
        
        // 3秒后跳转到登录页面
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>认证处理中</CardTitle>
          <CardDescription>
            正在处理 Authing 认证回调
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 状态指示器 */}
          <div className="text-center">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            )}
          </div>
          
          {/* 状态消息 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          
          {/* 错误提示 */}
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                认证失败，请重新尝试登录
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Callback; 