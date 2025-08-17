import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { getAuthConfig, isAuthConfigValid } from './config';
import { setAuthTokenGetter } from '@/api/request';
import { logger } from '@/utils/logger';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
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

  // 针对 Authing 容器的 undefinedundefined 文案清理（仅在弹窗打开时启用）
  const startUndefinedSanitizer = () => {
    try {
      const container = document.getElementById('authing_container');
      if (!container) return;
      // 先进行一次同步清理
      const scan = (root: HTMLElement) => {
        const re = /undefined\s*undefined/gi;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let n: Node | null;
        while ((n = walker.nextNode())) {
          const t = n as Text;
          if (t.nodeValue && re.test(t.nodeValue)) {
            t.nodeValue = t.nodeValue.replace(re, '');
          }
        }
      };
      scan(container);
      // 观察后续变更
      stopUndefinedSanitizer();
      const mo = new MutationObserver(() => scan(container));
      mo.observe(container, { subtree: true, childList: true, characterData: true });
      fixObserverRef.current = mo;
    } catch (e) {
      // 忽略清理失败
    }
  };

  const stopUndefinedSanitizer = () => {
    try {
      fixObserverRef.current?.disconnect();
      fixObserverRef.current = null;
    } catch {}
  };

  const ensureGuard = async () => {
    const mod = await import('@authing/guard');
    const { Guard } = mod as any;

    if (!guardRef.current) {
      // 确保使用完整的HTTPS URL
      const cleanHost = cfg.host.startsWith('http') ? cfg.host : `https://${cfg.host}`;

      logger.debug('Guard配置:', {
        appId: cfg.appId,
        host: cleanHost,
        redirectUri: cfg.redirectUri
      });

      guardRef.current = new Guard({
        appId: cfg.appId,
        host: cleanHost,
        redirectUri: cfg.redirectUri,
        // 以嵌入模式运行，由我们自己的 Dialog 管理可见性与焦点
        mode: 'normal',
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
      guardRef.current.on('login', (userInfo: any) => {
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
        setAuthDialogOpen(false);
      });

      guardRef.current.on('register', (userInfo: any) => {
        logger.debug('注册成功:', userInfo);
        guardRef.current?.emit('login', userInfo);
      });

      guardRef.current.on('login-error', (error: any) => {
        logger.error('登录失败:', error);
        setError(error?.message || '登录失败');
      });
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

      // 打开对话框并在容器中启动 Guard（优先嵌入，失败则兜底为官方弹窗）
      setAuthDialogOpen(true);
      const guard = await ensureGuard();
      // 延迟到对话框内容挂载后再启动
      setTimeout(() => {
        try {
          const container = document.getElementById('authing_container');
          if (container && typeof guard.start === 'function') {
            guard.start('#authing_container');
            startUndefinedSanitizer();

            // 兜底策略：若嵌入容器在短时间内仍为空，则自动切换为 Guard 自带弹窗模式
            setTimeout(() => {
              try {
                const rendered = !!document.getElementById('authing_container')?.childElementCount;
                if (!rendered && typeof guard.show === 'function') {
                  logger.warn('Authing Guard 未成功嵌入容器，自动切换为弹窗模式');
                  stopUndefinedSanitizer();
                  setAuthDialogOpen(false); // 关闭自有对话框，避免双模态冲突
                  guard.show();
                }
              } catch (e) {
                logger.error('Guard 弹窗兜底失败:', e);
              }
            }, 300);
          }
        } catch (err) {
          logger.error('启动 Guard 失败，将尝试直接显示官方弹窗:', err);
          try {
            stopUndefinedSanitizer();
            setAuthDialogOpen(false);
            typeof guard.show === 'function' && guard.show();
          } catch (e) {
            setError('无法启动登录组件');
          }
        }
      }, 0);
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

      {/* 统一由 Radix Dialog 承载 Authing Guard，避免第三方弹窗与 Radix 双模态冲突 */}
      <Dialog open={authDialogOpen} onOpenChange={(open) => {
        setAuthDialogOpen(open);
        if (!open) stopUndefinedSanitizer();
      }}>
        <DialogContent className="sm:max-w-lg min-h-[520px]">
          <DialogHeader>
            <DialogTitle>登录文派</DialogTitle>
            <DialogDescription>请使用手机号/邮箱登录或注册，信息仅用于身份验证。</DialogDescription>
          </DialogHeader>
          <div id="authing_container" />
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
