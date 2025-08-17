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

  const login = async (): Promise<void> => {
    if (!isAuthConfigValid(cfg)) {
      setError('Auth 配置无效');
      logger.error('Auth 配置无效:', cfg);
      return;
    }

    try {
      logger.debug('开始初始化 Authing Guard...');
      setError(null);

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
          mode: 'modal', // 使用弹窗模式
          autoFocus: true,
          escCloseable: true,
          clickCloseable: true,
          maskCloseable: true,
          lang: 'zh-CN',
          // 添加更多配置选项
          defaultScene: 'login',
          autoRegister: false,
          skipComplateFileds: false,
          skipComplateFiledsPlace: 'modal',
          closeable: true,
          clickCloseableMask: true,
          // 登录配置
          loginMethodList: ['password', 'phone-code', 'email-code'],
          // 注册配置
          registerMethodList: ['phone', 'email'],
          // 界面配置
          logo: 'https://files.authing.co/authing-console/default-app-logo.png',
          title: '文派'
        });

        // 添加事件监听器
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

          // 保存用户信息
          setUser(user);
          localStorage.setItem('auth_token', user.token || '');
          localStorage.setItem('authing_user', JSON.stringify(user));

          // 关闭弹窗
          guardRef.current?.hide();

          // 处理登录后跳转
          const redirectTo = localStorage.getItem('login_redirect_to');
          if (redirectTo) {
            localStorage.removeItem('login_redirect_to');
            // 使用setTimeout确保状态更新完成后再跳转
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 100);
          }
        });

        guardRef.current.on('register', (userInfo: any) => {
          logger.debug('注册成功:', userInfo);
          // 注册成功后的处理逻辑与登录相同
          guardRef.current?.emit('login', userInfo);
        });

        guardRef.current.on('login-error', (error: any) => {
          logger.error('登录失败:', error);
          setError(error?.message || '登录失败');
        });

        guardRef.current.on('close', () => {
          logger.debug('Guard弹窗已关闭');
        });
      }

      // 显示登录弹窗
      logger.debug('显示 Authing Guard 弹窗...');

      // 仅使用 modal.show，避免与 start(container) 混用导致的焦点与 aria-hidden 冲突
      try {
        if (typeof guardRef.current.show === 'function') {
          await guardRef.current.show();
        } else {
          throw new Error('Guard.show 不可用（当前为 modal 模式仅支持 show）');
        }
      } catch (showError) {
        logger.error('显示Guard弹窗失败:', showError);
        throw new Error('无法显示登录弹窗');
      }

    } catch (e: any) {
      logger.error('Guard初始化失败:', e);
      setError(e?.message || '登录系统初始化失败');
    }
  };

  const register = async (): Promise<void> => {
    // 与 login 保持一致，由 Guard 处理注册
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
      {/* Guard 容器 - 移除 display: none，让弹窗正常显示 */}
      <div id="authing_container" />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

