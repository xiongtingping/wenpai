import React, { useEffect, useRef } from 'react';
import { Guard } from '@authing/guard';
import '@authing/guard/dist/esm/guard.min.css';
import { getAuthingConfig } from '@/config/authing';

const LoginPage: React.FC = () => {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const cfg = getAuthingConfig();
    const guard = new Guard({
      appId: cfg.appId,
      host: cfg.host,
      redirectUri: cfg.redirectUri,
      mode: 'normal',
      lang: 'zh-CN',
    });

    try {
      // 仅使用嵌入式渲染，避免 modal DOM
      // @ts-ignore
      if (typeof guard.start === 'function') {
        // @ts-ignore
        guard.start('#guard-embed');
      }

      // 登录成功后跳转
      // @ts-ignore
      guard.on && guard.on('login', async () => {
        const to = window.localStorage.getItem('login_redirect_to') || '/';
        window.localStorage.removeItem('login_redirect_to');
        window.location.href = to;
      });

      // 关闭时回退
      // @ts-ignore
      guard.on && guard.on('close', () => {
        const to = window.localStorage.getItem('login_redirect_to') || '/';
        window.location.href = to;
      });
    } catch (e) {
      console.error('Authing Guard start failed:', e);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-4">
        <div id="guard-embed" />
      </div>
    </div>
  );
};

export default LoginPage;

