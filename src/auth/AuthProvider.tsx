import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

import { Guard as GuardStatic } from '@authing/guard';

import { getAuthConfig, isAuthConfigValid } from './config';
import { setAuthTokenGetter } from '@/api/request';
import { logger } from '@/utils/logger';


export interface AuthUser {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  token?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cfg = getAuthConfig();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guardRef = useRef<any>(null);

  // 初始化时从 localStorage 恢复用户状态
  React.useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('authing_user');
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
        logger.debug('🔄 从本地存储恢复用户状态:', parsedUser);
      }
    } catch (error) {
      logger.error('恢复用户状态失败:', error);
    }
  }, []);

  // 令牌注入到 API 请求
  React.useEffect(() => {
    try {
      setAuthTokenGetter(() => user?.token || null);
    } catch (error) {
      logger.error('设置令牌获取器失败:', error);
    }
  }, [user?.token]);
  // --- Guard 解析与加载工具（兼容 NPM 构建 & CDN） ---
  const resolveGuardCtorFromNpm = async (): Promise<any | null> => {
    try {
      const mod = await import('@authing/guard');
      const ctor = (mod as any).Guard
        || (mod as any).default?.Guard
        || (mod as any).GuardFactory?.Guard
        || (mod as any).default?.GuardFactory?.Guard
        || (mod as any).default;
      logger.debug('[Authing] NPM Guard 解析结果:', {
        from: '@authing/guard',
        hasGuard: !!(mod as any).Guard,
        hasDefault: !!(mod as any).default,
        hasFactory: !!(mod as any).GuardFactory || !!(mod as any).default?.GuardFactory
      });
      return typeof ctor === 'function' ? ctor : null;
    } catch (e) {
      logger.warn('NPM Guard 解析失败:', e);
      return null;
    }
  };

  const loadGuardCtorFromCDN = async (): Promise<any> => {
    const JS_URL = 'https://cdn.authing.co/packages/guard@5.3.9/guard.min.js';
    const CSS_URL = 'https://cdn.authing.co/packages/guard@5.3.9/guard.min.css';

    const ensureCss = () => new Promise<void>((resolve) => {
      if (document.querySelector(`link[href="${CSS_URL}"]`)) return resolve();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CSS_URL;
      link.onload = () => resolve();
      link.onerror = () => resolve(); // CSS 失败不阻断
      document.head.appendChild(link);
    });

    const ensureJs = () => new Promise<void>((resolve, reject) => {
      if ((window as any).GuardFactory?.Guard) return resolve();
      if (document.querySelector(`script[src="${JS_URL}"]`)) {
        // 已在加载，等待一小段时间
        const timer = setInterval(() => {
          if ((window as any).GuardFactory?.Guard) { clearInterval(timer); resolve(); }
        }, 50);
        setTimeout(() => { clearInterval(timer); resolve(); }, 3000);
        return;
      }
      const s = document.createElement('script');
      s.src = JS_URL; s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Authing Guard CDN 加载失败'));
      document.head.appendChild(s);
    });

    await ensureCss();
    await ensureJs();
    const ctor = (window as any).GuardFactory?.Guard;
    if (typeof ctor !== 'function') throw new Error('CDN GuardFactory.Guard 不可用');
    return ctor;
  };

  const isUsableInstance = (inst: any) => !!inst && (typeof inst.show === 'function' || typeof inst.start === 'function');




  const ensureGuard = async () => {
    // 首选：静态导入的 Guard 构造，避免运行时解析不一致
    let GuardClass: any = GuardStatic;
    // 运行时保护：静态构造竟然不是函数，才尝试 NPM/CDN 动态回退
    if (typeof GuardClass !== 'function') {
      GuardClass = await resolveGuardCtorFromNpm();
      if (!GuardClass) {
        logger.warn('回退到 CDN 加载 Authing Guard');
        GuardClass = await loadGuardCtorFromCDN();
      }
    }

    if (guardRef.current && !isUsableInstance(guardRef.current)) {
      try { (guardRef.current as any).hide?.(); } catch {}
      guardRef.current = null;
    }

    if (!guardRef.current) {
      const cleanHost = cfg.host.startsWith('http') ? cfg.host : `https://${cfg.host}`;

      logger.debug('Guard配置:', { appId: cfg.appId, host: cleanHost, redirectUri: cfg.redirectUri, mode: 'modal' });

      const options: any = {
        appId: cfg.appId,
        host: cleanHost,
        redirectUri: cfg.redirectUri,
        mode: 'modal',
        autoFocus: true,
        lang: 'zh-CN',
        defaultScene: 'login',
        autoRegister: false,
        closeable: true,
        loginMethodList: ['password', 'phone-code', 'email-code'],
        registerMethodList: ['phone', 'email'],
        logo: 'https://files.authing.co/authing-console/default-app-logo.png',
        title: '文派'
      };

      let instance: any;
      try { instance = new GuardClass(options); } catch (e) { logger.warn('静态 Guard 构造失败，尝试 CDN:', e); }
      if (!isUsableInstance(instance)) { const CDNGuard = await loadGuardCtorFromCDN(); instance = new CDNGuard(options); }
      if (!isUsableInstance(instance)) { throw new Error('Guard 实例构造成功但不具备 show/start 能力'); }

      instance.on('login', (userInfo: any) => {
        logger.debug('登录成功:', userInfo);
        const user = {
          id: userInfo.id || userInfo.sub,
          username: userInfo.username,
          email: userInfo.email,
          phone: userInfo.phone,
          nickname: userInfo.nickname || userInfo.name,
          avatar: userInfo.avatar || userInfo.picture,
          token: userInfo.token || userInfo.access_token
        };
        setUser(user);
        localStorage.setItem('auth_token', user.token || '');
        localStorage.setItem('authing_user', JSON.stringify(user));
        try { document.getElementById('authing_modal_fallback_host')?.remove(); } catch {}
      });
      instance.on('register', (userInfo: any) => { logger.debug('注册成功:', userInfo); instance?.emit('login', userInfo); });
      instance.on('login-error', (error: any) => { logger.error('登录失败:', error); setError(error?.message || '登录失败'); });

      guardRef.current = instance;
    }

    return guardRef.current;
  };

  const login = async (): Promise<void> => {
    if (!isAuthConfigValid(cfg)) {
      setError('Auth 配置无效');
      logger.error('Auth 配置无效:', cfg);
      return;
    }

    try {
      logger.debug('开始初始化 Authing Guard...');
      setError(null);

      const guard = await ensureGuard();
      try { (document.activeElement as HTMLElement | null)?.blur(); } catch {}

      const canShow = guard && typeof (guard as any).show === 'function';
      const canStart = guard && typeof (guard as any).start === 'function';
      const canRedirect = guard && typeof (guard as any).startWithRedirect === 'function';
      logger.debug('[Authing] guard capability:', { canShow, canStart, canRedirect });

      if (canShow) {
        (guard as any).show();
      } else if (canStart) {
        const hostId = 'authing_modal_fallback_host';
        let host = document.getElementById(hostId) as HTMLElement | null;
        if (!host) {
          host = document.createElement('div');
          host.id = hostId;
          Object.assign(host.style, { position: 'fixed', inset: '0', zIndex: '2147483646', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)' } as CSSStyleDeclaration);
          document.body.appendChild(host);
          const panel = document.createElement('div');
          Object.assign(panel.style, { width: '90vw', maxWidth: '420px', minHeight: '520px', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' } as CSSStyleDeclaration);
          panel.id = 'authing_container_fallback';
          host.appendChild(panel);
        }
        await (guard as any).start('#authing_container_fallback');
      } else if (canRedirect) {
        await (guard as any).startWithRedirect();
      } else {
        throw new Error('Guard 实例无可用展示方法(show/start/redirect)');
      }
    } catch (e: any) {
      logger.error('Guard初始化失败:', e);
      setError(e?.message || '登录系统初始化失败');
    }
  };

  const register = async (): Promise<void> => {
    return login();
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const api = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user?.token,
    loading,
    error,
    login,
    register,
    logout
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={api}>
      {children}


    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
