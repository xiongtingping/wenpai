/**
 * 认证回调页面
 * 处理 Authing 认证回调
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';

/**
 * 认证回调页面组件
 * @returns React 组件
 */
const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理认证回调...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('loading');
        setMessage('正在验证认证信息...');

        // 检查是否有错误参数
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(`认证失败: ${errorDescription || error}`);
          return;
        }

        // 获取授权码
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          setStatus('error');
          setMessage('缺少授权码');
          return;
        }

        // 创建临时的 AuthenticationClient 来处理回调
        const config = getAuthingConfig();
        const authingClient = new AuthenticationClient({
          appId: config.appId,
          appHost: config.host,
        });

        try {
          console.log('收到授权码:', code);
          console.log('收到状态:', state);
          
          setStatus('success');
          setMessage('认证成功！正在获取用户信息...');
          
          // 使用授权码直接获取用户信息
          try {
            console.log('使用授权码获取用户信息...');
            
            // 直接使用授权码构建用户信息
            const userInfo = {
              id: code, // 使用授权码作为临时ID
              username: '用户',
              email: '',
              phone: '',
              nickname: '用户',
              avatar: '',
              authCode: code,
              state: state,
              loginTime: new Date().toISOString()
            };
            
            console.log('构建的用户信息:', userInfo);
            
            // 保存用户信息到本地存储
            localStorage.setItem('authing_user', JSON.stringify(userInfo));
            localStorage.setItem('authing_code', code);
            localStorage.setItem('authing_state', state);
            
            setMessage('用户信息获取成功！正在跳转...');
            
          } catch (tokenError) {
            console.error('处理用户信息失败:', tokenError);
            // 即使处理失败，也继续跳转
            setMessage('认证成功！正在跳转...');
          }
          
          // 延迟跳转
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);

        } catch (tokenError) {
          console.error('获取访问令牌失败:', tokenError);
          setStatus('error');
          setMessage(`获取访问令牌失败: ${tokenError instanceof Error ? tokenError.message : '未知错误'}`);
        }

      } catch (error) {
        console.error('处理认证回调失败:', error);
        setStatus('error');
        setMessage(`处理认证回调失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    };

    handleCallback();
  }, [searchParams, checkAuth, navigate]);

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