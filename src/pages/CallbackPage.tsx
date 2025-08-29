import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';
import { Guard } from '@authing/guard';
import { getAuthingConfig } from '@/config/authing';
import { resolveAuthingGuardConfig } from '@/authing/configResolver';

/**
 * 🔐 官方SDK认证回调页面
 * 官方SDK会自动处理OAuth认证回调
 */
const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const cfg = getAuthingConfig();
  const [processingStep, setProcessingStep] = useState('处理登录回调...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setProcessingStep('处理认证回调...');
        const resolved = await resolveAuthingGuardConfig({ appId: cfg.appId, host: cfg.host, redirectUri: cfg.redirectUri });
        const guard = new Guard({ appId: resolved.appId, host: resolved.host, redirectUri: resolved.redirectUri, mode: 'normal', lang: 'zh-CN' });
        await guard.handleRedirectCallback();
        setProcessingStep('登录成功，正在跳转...');
        const redirectTo = localStorage.getItem('auth_redirect_after_login') || '/';
        localStorage.removeItem('auth_redirect_after_login');
        navigate(redirectTo, { replace: true });
      } catch (err) {
        logger.error('❌ 回调处理失败:', err);
        setProcessingStep('登录失败');
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }
    };
    handleCallback();
  }, [cfg.appId, cfg.host, cfg.redirectUri, navigate]);

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
