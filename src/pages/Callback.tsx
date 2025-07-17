/**
 * 认证回调页面
 * 使用Authing SDK处理回调
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';

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

        // 创建Authing实例
        const config = getAuthingConfig();
        const authing = new AuthenticationClient({
          appId: config.appId,
          appHost: config.host,
        });

        // 处理重定向回调
        await authing.handleRedirectCallback();
        
        // 获取用户信息
        const userInfo = await authing.getUserInfo();
        
        if (userInfo) {
          console.log("登录成功，用户信息：", userInfo);
          
          setStatus('success');
          setMessage('认证成功！正在获取用户信息...');
          
          // 转换用户信息格式
          const user = {
            id: userInfo.id || userInfo.userId || `user_${Date.now()}`,
            username: userInfo.username || userInfo.nickname || '用户',
            email: userInfo.email || '',
            phone: userInfo.phone || '',
            nickname: userInfo.nickname || userInfo.username || '用户',
            avatar: userInfo.avatar || '',
            loginTime: new Date().toISOString()
          };
          
          // 保存用户信息到本地存储
          localStorage.setItem('authing_user', JSON.stringify(user));
          
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
        console.error('处理认证回调失败:', error);
        setStatus('error');
        setMessage(`处理认证回调失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && '处理中...'}
            {status === 'success' && '认证成功'}
            {status === 'error' && '认证失败'}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>

        {status === 'error' && (
          <div className="mt-8 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    认证回调处理失败
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>请检查以下可能的原因：</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>认证链接已过期</li>
                      <li>网络连接问题</li>
                      <li>认证服务暂时不可用</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                重试
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Callback; 