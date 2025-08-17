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
  const modalFallbackTriggeredRef = useRef<boolean>(false);

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

      const triggerModalFallback = async (reason: string) => {
        if (modalFallbackTriggeredRef.current) return;
        modalFallbackTriggeredRef.current = true;
        logger.warn(`[Authing兜底] 启用独立 modal 实例，原因: ${reason}`);
        try {
          stopUndefinedSanitizer();
          setAuthDialogOpen(false); // 关闭自有对话框，避免双模态冲突
          const mod = await import('@authing/guard');
          const { Guard } = mod as any;
          const cleanHost = cfg.host.startsWith('http') ? cfg.host : `https://${cfg.host}`;
          const modalGuard = new Guard({
            appId: cfg.appId,
            host: cleanHost,
            redirectUri: cfg.redirectUri,
            mode: 'modal',
            lang: 'zh-CN',
            defaultScene: 'login',
            autoRegister: false,
            closeable: true
          });
          modalGuard.on('login', (userInfo: any) => {
            try {
              guardRef.current?.emit?.('login', userInfo);
            } catch {
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
            }
          });
          modalGuard.show();
        } catch (e) {
          logger.error('Guard 弹窗兜底失败:', e);
        }
      };

      // 延迟到对话框内容挂载后再启动
      setTimeout(() => {
        try {
          const container = document.getElementById('authing_container') as HTMLElement | null;
          if (container && typeof guard.start === 'function') {
            guard.start('#authing_container');
            startUndefinedSanitizer();

            // 兜底策略 1：300ms 内无子元素或无 iframe/高度太小，触发 modal
            setTimeout(() => {
              try {
                const el = document.getElementById('authing_container') as HTMLElement | null;
                const hasChild = !!el?.childElementCount;
                const iframe = el?.querySelector('iframe');
                const tooSmall = (el?.offsetHeight || 0) < 80;
                if (!hasChild || !iframe || tooSmall) {
                  triggerModalFallback(`embed-check-300ms hasChild=${hasChild} iframe=${!!iframe} h=${el?.offsetHeight}`);
                }
              } catch (e) {
                logger.error('Guard 弹窗兜底检测失败(300ms):', e);
              }
            }, 300);

            // 兜底策略 2：1200ms 再次校验，仍异常则强制 modal
            setTimeout(() => {
              try {
                const el = document.getElementById('authing_container') as HTMLElement | null;
                const hasChild = !!el?.childElementCount;
                const iframe = el?.querySelector('iframe');
                const tooSmall = (el?.offsetHeight || 0) < 80;
                if (!hasChild || !iframe || tooSmall) {
                  triggerModalFallback(`embed-check-1200ms hasChild=${hasChild} iframe=${!!iframe} h=${el?.offsetHeight}`);
                }
              } catch (e) {
                logger.error('Guard 弹窗兜底检测失败(1200ms):', e);
              }
            }, 1200);
          } else {
            triggerModalFallback('no-container-or-start-missing');
          }
        } catch (err) {
          logger.error('启动 Guard 失败，将尝试使用独立 modal 实例:', err);
          triggerModalFallback('start-exception');
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
          <div id="authing_container" className="min-h-[520px] w-full" />
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
