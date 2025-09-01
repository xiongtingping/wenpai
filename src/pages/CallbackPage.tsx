import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuard, User, JwtTokenStatus } from '@authing/guard-react18';

/**
 * 🔐 认证回调页面 - 按照官方示例实现
 */
const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const guard = useGuard();
  const [processingStep, setProcessingStep] = useState('处理登录回调...');

  const handleCallback = async () => {
    try {
      console.log('🔄 开始处理登录回调...');
      console.log('🔍 当前URL:', window.location.href);
      
      // 处理重复拼接的URL问题
      const currentUrl = window.location.href;
      if (currentUrl.includes('callbackhttp://localhost') || currentUrl.includes('callbackhttp://') || currentUrl.includes('www.wenpai.xyz/callbackhttp://')) {
        // 如果是重复拼接的URL，直接跳转回首页并且携带授权参数
        console.log('🔧 检测到URL重复拼接，尝试解析授权码...');
        
        const codeMatch = currentUrl.match(/code=([^&]+)/);
        const stateMatch = currentUrl.match(/state=([^&]+)/);
        
        if (codeMatch && stateMatch) {
          const code = codeMatch[1];
          const state = stateMatch[1];
          console.log('✅ 从重复URL中解析到授权码:', { code: code.substring(0, 10) + '...', state });
          
          // 重新构造正确的回调URL - 根据当前域名决定
          const isProduction = currentUrl.includes('www.wenpai.xyz');
          const correctOrigin = isProduction ? 'https://www.wenpai.xyz' : 'http://localhost:5173';
          const correctCallbackUrl = `${correctOrigin}/callback?code=${code}&state=${state}`;
          console.log('🔄 重定向到正确的回调URL:', correctCallbackUrl);
          window.location.href = correctCallbackUrl;
          return;
        }
      }
      
      // 正常回调处理
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      console.log('📋 回调参数:', { code: code?.substring(0, 10) + '...', state });
      
      if (!code) {
        console.log('⚠️ 未找到授权码，可能是使用模态框登录模式，直接跳转首页');
        setTimeout(() => navigate('/', { replace: true }), 500);
        return;
      }
      
      setProcessingStep('验证登录状态...');
      
      // 1. 触发 guard.handleRedirectCallback() 方法完成登录认证
      await guard.handleRedirectCallback();
      
      setProcessingStep('检查用户状态...');
      
      // 2. 检查用户登录态是否正常
      const loginStatus: JwtTokenStatus | undefined = await guard.checkLoginStatus();
      
      if (!loginStatus) {
        console.error('Guard is not get login status');
        setProcessingStep('登录状态验证失败');
        return;
      }
      
      setProcessingStep('获取用户信息...');
      
      // 3. 获取登录用户的用户信息
      const userInfo: User | null = await guard.trackSession();
      console.log('✅ 用户信息:', userInfo);
      
      setProcessingStep('登录成功，正在跳转...');
      
      // 跳转到指定页面
      const redirectTo = localStorage.getItem('login_redirect_to') || '/';
      localStorage.removeItem('login_redirect_to');
      navigate(redirectTo, { replace: true });
      
    } catch (e) {
      console.error('❌ Guard handleAuthingLoginCallback error: ', e);
      setProcessingStep('登录处理失败，请重试');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }
  };

  useEffect(() => {
    console.log('📍 CallbackPage mounted, current URL:', window.location.href);
    console.log('🔍 URL分析:', {
      href: window.location.href,
      hasCallbackHttp: window.location.href.includes('callbackhttp://'),
      hasWenpaiCallback: window.location.href.includes('www.wenpai.xyz/callbackhttp://'),
      pathname: window.location.pathname,
      search: window.location.search
    });
    
    // 直接执行回调处理，让handleCallback内部的逻辑来判断
    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">{processingStep}</h2>
        <p className="text-muted-foreground">
          {processingStep || '正在处理登录回调...'}
        </p>
      </div>
    </div>
  );
};

export default CallbackPage;
