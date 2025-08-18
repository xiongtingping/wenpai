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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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




  // 🔧 修复：回退到 NPM 包版本，避免 CDN 加载问题
  const ensureGuard = async () => {
    logger.debug('[Authing] 开始初始化 Guard...');

    try {
      // 清理旧实例
      if (guardRef.current) {
        try {
          (guardRef.current as any).hide?.();
          (guardRef.current as any).destroy?.();
        } catch {}
        guardRef.current = null;
      }

      // 🔧 修复：直接使用 NPM 包，避免 CDN 问题
      const { Guard } = await import('@authing/guard');
      logger.debug('[Authing] ✅ NPM Guard 模块加载成功');

      // 创建新实例
      const cleanHost = cfg.host.startsWith('http') ? cfg.host : `https://${cfg.host}`;

      const options = {
        appId: cfg.appId,
        host: cleanHost,
        redirectUri: cfg.redirectUri,
        mode: 'modal' as const,
        lang: 'zh-CN' as const,
        defaultScene: 'login' as const,
        autoRegister: true,
        clickCloseable: true,
        escCloseable: true,
        title: '登录 - 文派'
      };

      logger.debug('[Authing] 创建 Guard 实例，配置:', options);
      const instance = new Guard(options);

      // 绑定事件
      instance.on('login', (user: any) => {
        logger.debug('[Authing] 登录成功:', user);
        setUser(user);
        setIsAuthenticated(true);
      });

      instance.on('register', (user: any) => {
        logger.debug('[Authing] 注册成功:', user);
        setUser(user);
        setIsAuthenticated(true);
      });

      instance.on('close', () => {
        logger.debug('[Authing] Guard 弹窗关闭');
      });

      guardRef.current = instance;
      logger.debug('[Authing] ✅ Guard 实例创建成功');

      return instance;
    } catch (error) {
      logger.error('[Authing] Guard 初始化失败:', error);
      throw error;
    }
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

      // 🔧 关键修复：直接使用 guardRef.current 而不是 ensureGuard 的返回值
      const actualGuard = guardRef.current;

      const canShow = actualGuard && typeof (actualGuard as any).show === 'function';
      const canStart = actualGuard && typeof (actualGuard as any).start === 'function';
      const canRedirect = actualGuard && typeof (actualGuard as any).startWithRedirect === 'function';

      // 🔍 详细调试：检查 Guard 实例的所有方法和属性
      logger.debug('[Authing] guard capability:', { canShow, canStart, canRedirect });
      logger.debug('[Authing] guard instance type:', typeof actualGuard);
      logger.debug('[Authing] guard constructor:', actualGuard?.constructor?.name);
      logger.debug('[Authing] guard methods:', Object.getOwnPropertyNames(actualGuard || {}).filter(name => typeof (actualGuard as any)?.[name] === 'function'));
      logger.debug('[Authing] guard prototype methods:', actualGuard ? Object.getOwnPropertyNames(Object.getPrototypeOf(actualGuard)).filter(name => typeof (actualGuard as any)?.[name] === 'function') : []);

      // 🔍 比较两个实例是否相同
      logger.debug('[Authing] 实例比较:', {
        guardFromEnsure: guard === actualGuard,
        guardFromEnsureType: typeof guard,
        actualGuardType: typeof actualGuard,
        guardFromEnsureHasShow: guard && typeof (guard as any).show === 'function',
        actualGuardHasShow: actualGuard && typeof (actualGuard as any).show === 'function'
      });

      if (canShow) {
        logger.debug('[Authing] 调用 show 方法');
        (actualGuard as any).show();
      } else if (canStart) {
        logger.debug('[Authing] 调用 start 方法');
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
        await (actualGuard as any).start('#authing_container_fallback');
      } else if (canRedirect) {
        logger.debug('[Authing] 调用 startWithRedirect 方法');
        await (actualGuard as any).startWithRedirect();
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
