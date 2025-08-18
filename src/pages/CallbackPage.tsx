import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from '@/utils/logger';

/**
 * Authing 登录回调页面
 * 处理从 Authing 登录页面返回的授权码
 */
const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        logger.debug('🔄 处理 Authing 登录回调...');
        
        // 获取授权码和状态
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        logger.debug('📋 回调参数:', { code, state, error, errorDescription });

        if (error) {
          logger.error('❌ 登录失败:', error, errorDescription);
          
          // 通知父窗口登录失败
          if (window.opener) {
            window.opener.postMessage({
              type: 'AUTHING_LOGIN_ERROR',
              error: errorDescription || error
            }, window.location.origin);
            window.close();
            return;
          }
          
          // 如果不是弹窗，重定向到首页并显示错误
          navigate('/?error=' + encodeURIComponent(errorDescription || error));
          return;
        }

        if (!code) {
          logger.error('❌ 未收到授权码');
          
          // 通知父窗口登录失败
          if (window.opener) {
            window.opener.postMessage({
              type: 'AUTHING_LOGIN_ERROR',
              error: '未收到授权码'
            }, window.location.origin);
            window.close();
            return;
          }
          
          navigate('/?error=' + encodeURIComponent('登录失败：未收到授权码'));
          return;
        }

        logger.debug('✅ 收到授权码，准备交换 token...');

        // TODO: 这里应该调用后端 API 来交换 access_token
        // 现在先模拟一个成功的用户信息
        const mockUserInfo = {
          id: 'mock_user_' + Date.now(),
          username: 'test_user',
          email: 'test@example.com',
          nickname: '测试用户',
          avatar: '',
          token: 'mock_token_' + code
        };

        logger.debug('🎉 模拟登录成功:', mockUserInfo);

        // 通知父窗口登录成功
        if (window.opener) {
          window.opener.postMessage({
            type: 'AUTHING_LOGIN_SUCCESS',
            userInfo: mockUserInfo
          }, window.location.origin);
          window.close();
          return;
        }

        // 如果不是弹窗，直接在当前窗口处理登录
        // 保存用户信息到 localStorage
        localStorage.setItem('auth_token', mockUserInfo.token);
        localStorage.setItem('authing_user', JSON.stringify(mockUserInfo));
        
        // 重定向到首页
        navigate('/');

      } catch (error) {
        logger.error('❌ 处理登录回调时出错:', error);
        
        // 通知父窗口登录失败
        if (window.opener) {
          window.opener.postMessage({
            type: 'AUTHING_LOGIN_ERROR',
            error: '处理登录回调时出错'
          }, window.location.origin);
          window.close();
          return;
        }
        
        navigate('/?error=' + encodeURIComponent('登录处理失败'));
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground mb-2">正在处理登录...</h2>
        <p className="text-muted-foreground">请稍候，我们正在验证您的登录信息</p>
      </div>
    </div>
  );
};

export default CallbackPage;
