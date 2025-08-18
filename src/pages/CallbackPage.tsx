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
        console.log('🔄 CallbackPage 组件已加载并开始处理回调');
        
        // 获取授权码和状态
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 🔍 详细诊断信息
        logger.debug('🌐 当前页面信息:', {
          url: window.location.href,
          origin: window.location.origin,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        });

        logger.debug('📋 回调参数:', { code, state, error, errorDescription });

        // 🔍 检查是否在弹窗中
        logger.debug('🪟 窗口信息:', {
          hasOpener: !!window.opener,
          isOpenerClosed: window.opener?.closed,
          windowName: window.name
        });

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

        logger.debug('✅ 收到授权码，准备交换 token (PKCE)...');

        const codeVerifier = sessionStorage.getItem('auth_pkce_verifier');
        if (!codeVerifier) {
          throw new Error('missing code_verifier');
        }

        // 使用 Netlify Function 与 Authing 后端交换 token（PKCE，无 client_secret）
        const resp = await fetch('/.netlify/functions/authing-token-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, code_verifier: codeVerifier })
        });

        if (!resp.ok) {
          const detail = await resp.json().catch(() => ({}));
          throw new Error('token exchange failed: ' + JSON.stringify(detail));
        }

        const data = await resp.json();
        const token = data?.tokens?.access_token;
        const userInfo = data?.userInfo || {};

        if (!token) {
          throw new Error('no access_token received');
        }

        const mergedUser = {
          id: userInfo?.sub || userInfo?.userId || 'user_' + Date.now(),
          username: userInfo?.username,
          email: userInfo?.email,
          nickname: userInfo?.nickname || userInfo?.name,
          avatar: userInfo?.photo || userInfo?.avatar,
          token
        };

        // 处理两种模式
        if (window.opener && !window.opener.closed) {
          // 弹窗模式：通知父窗口登录成功
          logger.debug('📤 弹窗模式：通知父窗口登录成功');
          window.opener.postMessage({
            type: 'AUTHING_LOGIN_SUCCESS',
            userInfo: mergedUser
          }, window.location.origin);
          window.close();
          return;
        } else {
          // 同窗口模式：直接处理登录状态
          logger.debug('🔄 同窗口模式：直接处理登录状态');
          localStorage.setItem('auth_token', token);
          localStorage.setItem('authing_user', JSON.stringify(mergedUser));
          window.dispatchEvent(new CustomEvent('auth-login-success', { detail: mergedUser }));

          // 解析 state 中的 redirectTo 并跳转
          let finalRedirect = '/';
          try {
            if (state) {
              const stateObj = JSON.parse(state);
              if (stateObj.redirectTo) {
                const redirectTo = stateObj.redirectTo;
                logger.debug('📍 从 state 解析到跳转目标:', redirectTo);

                // 如果是完整 URL，提取路径部分；如果是相对路径，直接使用
                if (redirectTo.startsWith('http')) {
                  try {
                    const url = new URL(redirectTo);
                    finalRedirect = url.pathname + url.search + url.hash;
                  } catch (e) {
                    logger.warn('⚠️ 解析 redirectTo URL 失败，使用默认跳转:', e);
                  }
                } else {
                  finalRedirect = redirectTo;
                }
              }
            }
          } catch (e) {
            logger.warn('⚠️ 解析 state 失败，使用默认跳转:', e);
          }

          logger.debug('🎯 最终跳转到:', finalRedirect);
          navigate(finalRedirect);
        }

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

  // 渲染时也输出调试信息
  console.log('🎨 CallbackPage 正在渲染，当前 URL:', window.location.href);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground mb-2">正在处理登录...</h2>
        <p className="text-muted-foreground">请稍候，我们正在验证您的登录信息</p>
        <p className="text-xs text-muted-foreground mt-2">调试: {window.location.href}</p>
      </div>
    </div>
  );
};

export default CallbackPage;
