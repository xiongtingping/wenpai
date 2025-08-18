import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
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
  const fixObserverRef = useRef<MutationObserver | null>(null);

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

  // 已统一使用 Authing 官方 modal，移除内嵌容器与文本清理需求
  const stopUndefinedSanitizer = () => {
    try {
      fixObserverRef.current?.disconnect();
      fixObserverRef.current = null;
    } catch {}
  };

  const ensureGuard = async () => {
    // 兼容不同打包导出形态
    let GuardClass: any;
    try {
      const mod = await import('@authing/guard');
      GuardClass = (mod as any).Guard
        || (mod as any).default?.Guard
        || (mod as any).GuardFactory?.Guard
        || (mod as any).default?.GuardFactory?.Guard
        || (mod as any).default;
      if (typeof GuardClass !== 'function') {
        // 回退到具体 ESM 路径再解析
        const mod2 = await import('@authing/guard/dist/esm/guard.min.js');
        GuardClass = (mod2 as any).Guard
          || (mod2 as any).default?.Guard
          || (mod2 as any).GuardFactory?.Guard
          || (mod2 as any).default?.GuardFactory?.Guard
          || (mod2 as any).default;
      }
    } catch (e) {
      logger.error('动态加载 Guard 失败:', e);
      throw e;
    }
    if (typeof GuardClass !== 'function') {
      throw new Error('无法解析 Authing Guard 构造函数');
    }

    // 若已有实例但不具备 modal 能力（无 show 方法），则丢弃重建
    if (guardRef.current && typeof (guardRef.current as any).show !== 'function') {
      try { (guardRef.current as any).hide?.(); } catch {}
      // 部分版本无 destroy，直接置空以强制重建
      guardRef.current = null;
    }

    if (!guardRef.current) {
      // 确保使用完整的HTTPS URL
      const cleanHost = cfg.host.startsWith('http') ? cfg.host : `https://${cfg.host}`;

      logger.debug('Guard配置:', {
        appId: cfg.appId,
        host: cleanHost,
        redirectUri: cfg.redirectUri,
        mode: 'modal'
      });

      const instance = new GuardClass({
        appId: cfg.appId,
        host: cleanHost,
        redirectUri: cfg.redirectUri,
        // 统一使用官方 modal 弹窗，避免双模态焦点冲突
        mode: 'modal',
        autoFocus: true,
        lang: 'zh-CN',
        defaultScene: 'login',
        autoRegister: false,
        closeable: true,
        // 登录/注册方式
        loginMethodList: ['password', 'phone-code', 'email-code'],
        registerMethodList: ['phone', 'email'],
        // UI
        logo: 'https://files.authing.co/authing-console/default-app-logo.png',
        title: '文派'
      });

      // 事件监听器
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
      });

      instance.on('register', (userInfo: any) => {
        logger.debug('注册成功:', userInfo);
        instance?.emit('login', userInfo);
      });

      instance.on('login-error', (error: any) => {
        logger.error('登录失败:', error);
        setError(error?.message || '登录失败');
      });

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

      if (guard && typeof (guard as any).show === 'function') {
        (guard as any).show();
      } else if (guard && typeof (guard as any).start === 'function') {
        // 兼容无 show 的版本：创建临时容器以嵌入方式展示，但不再使用自有 Radix Dialog
        const hostId = 'authing_modal_fallback_host';
        let host = document.getElementById(hostId) as HTMLElement | null;
        if (!host) {
          host = document.createElement('div');
          host.id = hostId;
          Object.assign(host.style, {
            position: 'fixed', inset: '0', zIndex: '2147483646',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)'
          } as CSSStyleDeclaration);
          document.body.appendChild(host);
          const panel = document.createElement('div');
          Object.assign(panel.style, {
            width: '90vw', maxWidth: '420px', minHeight: '520px',
            background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.35)'
          } as CSSStyleDeclaration);
          panel.id = 'authing_container_fallback';
          host.appendChild(panel);
        }
        await (guard as any).start('#authing_container_fallback');
      } else {
        throw new Error('Guard 实例无可用展示方法(show/start)');
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
