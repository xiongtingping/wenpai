import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

/**
 * 🔐 官方SDK认证回调页面
 * 官方SDK会自动处理OAuth认证回调
 */
const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useAuth();
  const [processingStep, setProcessingStep] = useState('处理登录回调...');

  useEffect(() => {
    const handleCallback = async () => {
      // 🚨 紧急修复：检测并处理多重回调URL问题
      const currentUrl = window.location.href;
      const hasMultipleUrls = currentUrl.includes('%20%20http') || currentUrl.includes(' http');

      if (hasMultipleUrls) {
        logger.warn('🔧 检测到多重回调URL，正在修复...', currentUrl);

        // 提取查询参数
        const urlObj = new URL(currentUrl);
        const params = new URLSearchParams(urlObj.search);

        // 获取当前正确的回调URL
        const { hostname, protocol, port } = window.location;
        let correctCallbackUrl: string;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          correctCallbackUrl = `${protocol}//${hostname}:${port || '5173'}/callback`;
        } else if (hostname === 'wenpai.netlify.app') {
          correctCallbackUrl = 'https://wenpai.netlify.app/callback';
        } else if (hostname === 'wenpai.xyz') {
          correctCallbackUrl = 'https://wenpai.xyz/callback';
        } else {
          correctCallbackUrl = 'https://www.wenpai.xyz/callback';
        }

        // 重建正确的URL
        const cleanedUrl = correctCallbackUrl + '?' + params.toString();
        logger.info('🔄 重定向到清理后的URL:', cleanedUrl);

        // 使用replace避免在历史记录中留下错误URL
        window.location.replace(cleanedUrl);
        return;
      }

      // 🔧 修复：检查是否是跨域回调（从生产域名回调到localhost）
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const code = urlParams.get('code') || hashParams.get('code');
      const state = urlParams.get('state') || hashParams.get('state');

      if (code && state) {
        setProcessingStep('处理认证回调...');
        logger.info('🔄 检测到认证回调参数:', { code: code.substring(0, 10) + '...', state });

        // 🔧 手动触发认证状态检查，因为可能是跨域回调
        try {
          // 等待一段时间让SDK处理回调
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 检查认证状态
          if (isAuthenticated) {
            setProcessingStep('登录成功，正在跳转...');
            const redirectTo = localStorage.getItem('auth_redirect_after_login') || '/';
            localStorage.removeItem('auth_redirect_after_login');
            logger.info('✅ 认证成功，跳转到:', redirectTo);
            navigate(redirectTo, { replace: true });
            return;
          }
        } catch (callbackError) {
          logger.error('❌ 回调处理失败:', callbackError);
        }
      }

      // 等待认证状态更新
      if (loading) {
        setProcessingStep('验证登录状态...');
        return;
      }

      if (isAuthenticated) {
        setProcessingStep('登录成功，正在跳转...');
        const redirectTo = localStorage.getItem('auth_redirect_after_login') || '/';
        localStorage.removeItem('auth_redirect_after_login');
        logger.info('✅ 认证成功，跳转到:', redirectTo);
        navigate(redirectTo, { replace: true });
      } else if (error) {
        setProcessingStep('登录失败');
        logger.error('❌ 认证失败:', error);
        setTimeout(() => navigate('/', { replace: true }), 2000);
      } else if (!code) {
        // 如果没有回调参数，直接返回首页
        setProcessingStep('无效的回调请求');
        setTimeout(() => navigate('/', { replace: true }), 1000);
      } else {
        // 有回调参数但认证失败
        setProcessingStep('认证处理中...');
        setTimeout(() => {
          if (!isAuthenticated && !loading) {
            logger.warn('⚠️ 回调处理超时，返回首页');
            navigate('/', { replace: true });
          }
        }, 5000);
      }
    };

    handleCallback();
  }, [isAuthenticated, loading, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">{processingStep}</h2>
        <p className="text-muted-foreground">
          {loading ? '正在验证您的登录信息...' :
           error ? '登录过程中出现问题，即将返回首页' :
           isAuthenticated ? '登录成功！正在为您跳转...' :
           '正在处理登录回调...'}
        </p>
      </div>
    </div>
  );
};

export default CallbackPage;
