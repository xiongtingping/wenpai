import React, { useEffect, useRef } from 'react';
import '@authing/guard/dist/esm/guard.min.css';
import { Guard } from '@authing/guard';
import { getAuthingConfig } from '@/config/authing';

const LoginPage: React.FC = () => {
  const cfg = getAuthingConfig();
  const guardRef = useRef<any>(null);

  useEffect(() => {
    try {
      const g = new Guard({
        appId: cfg.appId,
        host: cfg.host,
        redirectUri: cfg.redirectUri,
        mode: 'normal',
        lang: 'zh-CN'
      });
      guardRef.current = g;

      if (typeof g.start === 'function') {
        g.start('#guard-embed');
      }

      const t = setTimeout(() => {
        const el = document.getElementById('guard-embed');
        const hasChild = !!el && el.childElementCount > 0;
        const rect = el?.getBoundingClientRect();
        const visible = !!rect && rect.height > 50 && rect.width > 200;
        if (!hasChild || !visible) {
          console.warn('⚠️ Guard 嵌入式渲染疑似失败，触发 startWithRedirect 兜底');
          if (typeof g.startWithRedirect === 'function') {
            g.startWithRedirect();
          }
        }
      }, 1500);

      if (typeof g.on === 'function') {
        g.on('login', async () => {
          const to = window.localStorage.getItem('login_redirect_to') || '/';
          window.localStorage.removeItem('login_redirect_to');
          window.location.href = to;
        });
        g.on('close', () => {
          const to = window.localStorage.getItem('login_redirect_to') || '/';
          window.location.href = to;
        });
      }

      return () => clearTimeout(t);
    } catch (e) {
      console.error('Authing Guard start failed:', e);
    }
  }, [cfg.appId, cfg.host, cfg.redirectUri]);

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-4">
        <div id="guard-embed" />
      </div>
    </div>
  );
};

export default LoginPage;

