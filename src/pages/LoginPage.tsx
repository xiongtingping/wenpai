import React, { useEffect, useRef } from 'react';
import '@authing/guard/dist/esm/guard.min.css';
import { Guard } from '@authing/guard';
import { getAuthingConfig } from '@/config/authing';

const LoginPage: React.FC = () => {
  const cfg = getAuthingConfig();
  const guardRef = useRef<any>(null);

  // 统一规范 redirect_uri，避免使用 Netlify 预览子域导致的白名单不匹配
  const normalizeRedirectUri = (fallback: string) => {
    try {
      const sanitize = (uri: string) => {
        try {
          const u = new URL(uri);
          const hn = u.hostname;
          if (hn.includes('localhost')) return 'http://localhost:5173/callback';
          if (hn.endsWith('netlify.app')) {
            // 预览子域（形如 <hash>--wenpai.netlify.app）与正式子域统一回落到主站点域
            return 'https://wenpai.netlify.app/callback';
          }
          if (hn.endsWith('wenpai.xyz')) return 'https://www.wenpai.xyz/callback';
          return uri;
        } catch {
          return uri;
        }
      };

      // 优先使用显式环境变量，但若为预览子域则进行标准化
      const env = (import.meta as any)?.env;
      const envUri = (env?.VITE_AUTHING_REDIRECT_URI_PROD || env?.VITE_AUTHING_REDIRECT_URI) as string | undefined;
      if (envUri) return sanitize(envUri);

      if (typeof window === 'undefined') return sanitize(fallback);
      const { hostname } = window.location;

      // 本地开发
      if (hostname.includes('localhost')) return 'http://localhost:5173/callback';
      // Netlify：包含预览与正式域
      if (hostname.endsWith('netlify.app')) return 'https://wenpai.netlify.app/callback';
      // 主站域
      if (hostname.endsWith('wenpai.xyz')) return 'https://www.wenpai.xyz/callback';

      return sanitize(fallback);
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    try {
      const makeGuardHost = (host: string, appId: string) => {
        try {
          const u = new URL(host);
          // 若路径为空或'/'，补上应用路径 /{appId}
          if (!u.pathname || u.pathname === '/' || u.pathname === '') {
            u.pathname = `/${appId}`;
          } else if (!u.pathname.includes(appId)) {
            // 若已有路径但不含appId，强制改为应用路径
            u.pathname = `/${appId}`;
          }
          return u.toString().replace(/\/$/, '');
        } catch {
          return `${host.replace(/\/$/, '')}/${appId}`;
        }
      };

      const g = new Guard({
        appId: cfg.appId,
        host: makeGuardHost(cfg.host, cfg.appId),
        redirectUri: normalizeRedirectUri(cfg.redirectUri),
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

