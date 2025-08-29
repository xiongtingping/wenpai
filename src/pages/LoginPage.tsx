import React, { useEffect, useRef } from 'react';
import '@authing/guard/dist/esm/guard.min.css';
import { Guard } from '@authing/guard';
import { getAuthingConfig } from '@/config/authing';
import { resolveAuthingGuardConfig } from '@/authing/configResolver';

const LoginPage: React.FC = () => {
  const cfg = getAuthingConfig();
  const guardRef = useRef<any>(null);



  useEffect(() => {
    (async () => {
      try {
        // 以 Authing public-config 为单一事实源，系统性校准 host 与 redirectUri
        const resolved = await resolveAuthingGuardConfig({
          appId: cfg.appId,
          host: cfg.host,
          redirectUri: cfg.redirectUri
        });

        const g = new Guard({
          appId: resolved.appId,
          host: resolved.host,
          redirectUri: resolved.redirectUri,
          mode: 'normal',
          lang: 'zh-CN'
        });
        guardRef.current = g;

        if (typeof g.startWithRedirect === 'function') {
          g.startWithRedirect();
        } else {
          console.error('Guard.startWithRedirect 不可用');
        }
      } catch (e) {
        console.error('Authing Guard start failed:', e);
      }
    })();
  }, [cfg.appId, cfg.host, cfg.redirectUri]);

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">正在跳转到认证页面…</p>
      </div>
    </div>
  );
};

export default LoginPage;

