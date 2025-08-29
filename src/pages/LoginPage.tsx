import React, { useEffect } from 'react';
import '@authing/guard-react/dist/esm/guard.min.css';
import { GuardProvider, useGuard } from '@authing/guard-react';
import { getAuthingConfig } from '@/config/authing';

const GuardEmbed: React.FC = () => {
  const guard = useGuard();
  useEffect(() => {
    if (!guard) return;
    try {
      console.log('🧪 LoginPage: guard instance', guard);
      // 优先尝试嵌入式渲染
      if (typeof (guard as any).start === 'function') {
        (guard as any).start('#guard-embed');
      }

      // 设置安全兜底：若 1.5s 内仍未出现有效内容，则切换到重定向登录（托管登录页）
      const t = setTimeout(() => {
        const el = document.getElementById('guard-embed');
        const hasChild = !!el && el.childElementCount > 0;
        const rect = el?.getBoundingClientRect();
        const visible = !!rect && rect.height > 50 && rect.width > 200;
        if (!hasChild || !visible) {
          console.warn('⚠️ Guard 嵌入式渲染疑似失败，触发 startWithRedirect 兜底');
          if (typeof (guard as any).startWithRedirect === 'function') {
            (guard as any).startWithRedirect();
          }
        }
      }, 1500);

      // 登录成功后跳转
      if (typeof (guard as any).on === 'function') {
        (guard as any).on('login', async () => {
          const to = window.localStorage.getItem('login_redirect_to') || '/';
          window.localStorage.removeItem('login_redirect_to');
          window.location.href = to;
        });
        // 关闭时回退
        (guard as any).on('close', () => {
          const to = window.localStorage.getItem('login_redirect_to') || '/';
          window.location.href = to;
        });
      }

      return () => clearTimeout(t);
    } catch (e) {
      console.error('Authing Guard start failed:', e);
    }
  }, [guard]);
  return <div id="guard-embed" />;
};

const LoginPage: React.FC = () => {
  const cfg = getAuthingConfig();
  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-4">
        <GuardProvider appId={cfg.appId} host={cfg.host} redirectUri={cfg.redirectUri} mode="normal">
          <GuardEmbed />
        </GuardProvider>
      </div>
    </div>
  );
};

export default LoginPage;

