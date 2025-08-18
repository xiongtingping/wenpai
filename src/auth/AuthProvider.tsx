import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { getAuthConfig, isAuthConfigValid } from './config';
import { setAuthTokenGetter } from '@/api/request';
import { logger } from '@/utils/logger';
import { getRegisterUrlFast, isRealLogin, getLoginStatus } from '@/utils/authingRegisterHelper';

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
  showGuard: boolean;
  setShowGuard: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const cfg = getAuthConfig();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuard, setShowGuard] = useState(false);

  // 初始化时从 localStorage 恢复用户状态
  React.useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('authing_user');
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
        setIsAuthenticated(true);
        logger.debug('🔄 从本地存储恢复用户状态:', parsedUser);
      }
    } catch (error) {
      logger.error('恢复用户状态失败:', error);
    }
  }, []);



  // 处理登录成功
  const handleLogin = (userInfo: any) => {
    logger.debug('[Authing] 登录成功:', userInfo);

    try {
      // 转换用户数据格式
      const authUser: AuthUser = {
        id: userInfo.id || (userInfo as any).userId || '',
        username: userInfo.username || undefined,
        email: userInfo.email || undefined,
        phone: userInfo.phone || undefined,
        nickname: userInfo.nickname || userInfo.name || undefined,
        avatar: userInfo.photo || userInfo.avatar || undefined,
        token: userInfo.token || undefined,
      };

      // 保存到状态
      setUser(authUser);
      setIsAuthenticated(true);
      setShowGuard(false);

      // 保存到本地存储
      if (userInfo.token) {
        localStorage.setItem('auth_token', userInfo.token);
        localStorage.setItem('authing_user', JSON.stringify(authUser));

        // 设置 API 请求的 token
        setAuthTokenGetter(() => userInfo.token);
      }

      logger.debug('✅ 用户登录状态已保存');
    } catch (error) {
      logger.error('处理登录数据失败:', error);
      setError('登录数据处理失败');
    }
  };



  // 处理关闭
  const handleClose = () => {
    logger.debug('[Authing] Guard 弹窗关闭');
    setShowGuard(false);
  };

  // 登录方法（PKCE + 同窗口跳转）
  const login = async (redirectTo?: string) => {
    logger.debug('🔐 开始登录流程...', { method: 'LOGIN', redirectTo });

    if (!isAuthConfigValid(cfg)) {
      const errorMsg = 'Authing 配置无效，请检查环境变量';
      logger.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // 域源 Guard：非本地且非生产域，一律先跳转到生产域再发起授权
    const h = window.location.hostname;
    const isLocal = h === 'localhost' || h === '127.0.0.1';
    const isProd = h === 'www.wenpai.xyz';
    if (!isLocal && !isProd) {
      const nextUrl = redirectTo || window.location.href;
      const u = new URL('https://www.wenpai.xyz/');
      u.searchParams.set('authstart', '1');
      u.searchParams.set('next', nextUrl);
      logger.debug('🌐 非生产域发起登录，先跳转到生产域再授权:', { from: window.location.href, to: u.toString() });
      window.location.href = u.toString();
      return;
    }

    // 生成 code_verifier 与 code_challenge(S256)
    const genRandom = (length: number) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      let res = '';
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < array.length; i++) {
        res += chars[array[i] % chars.length];
      }
      return res;
    };
    const toBase64Url = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const encoder = new TextEncoder();
    const verifier = genRandom(64);
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(verifier));
    const challenge = toBase64Url(digest);

    // 保存到 sessionStorage，回调时取出
    sessionStorage.setItem('auth_pkce_verifier', verifier);

    const timestamp = Date.now();
    const state = JSON.stringify({ ts: timestamp, redirectTo: redirectTo || window.location.href });
    logger.debug('🔐 LOGIN State生成:', { state, method: 'LOGIN' });
    const params = new URLSearchParams({
      client_id: cfg.appId,
      redirect_uri: cfg.redirectUri,
      response_type: 'code',
      scope: 'openid',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    } as any);

    // 直接使用已知的正确端点，避免探测结果导致的 redirect_uri 异常
    const authEndpoint = `${cfg.host.replace(/\/$/, '')}/${cfg.appId}`;
    const loginParams = new URLSearchParams({
      client_id: cfg.appId,
      redirect_uri: cfg.redirectUri, // 使用配置中的固定回调 URI
      response_type: 'code',
      scope: 'openid',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    } as any);
    const loginUrl = `${authEndpoint}?${loginParams.toString()}`;
    logger.debug('[Authing] authorize URL (direct)', { loginUrl, redirectUri: cfg.redirectUri, client_id: cfg.appId });
    window.location.href = loginUrl;
    return;


  };

  // 注册方法（PKCE + 同窗口跳转）
  const register = async (redirectTo?: string) => {
    logger.debug('📝 开始注册流程...', { method: 'REGISTER', redirectTo });

    // 🔧 强制注册：清除现有会话，确保跳转到注册页面
    logger.debug('[Authing] 清除现有会话以强制显示注册页面');

    // 清除本地存储的认证信息
    localStorage.removeItem('authing_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authing_access_token');
    localStorage.removeItem('authing_id_token');
    sessionStorage.removeItem('auth_pkce_verifier');

    // 重置用户状态
    setUser(null);
    setIsAuthenticated(false);

    if (!isAuthConfigValid(cfg)) {
      const errorMsg = 'Authing 配置无效，请检查环境变量';
      logger.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // 域源 Guard：非本地且非生产域，一律先跳转到生产域再发起授权
    const h = window.location.hostname;
    const isLocal = h === 'localhost' || h === '127.0.0.1';
    const isProd = h === 'www.wenpai.xyz';
    if (!isLocal && !isProd) {
      const nextUrl = redirectTo || window.location.href;
      const u = new URL('https://www.wenpai.xyz/');
      u.searchParams.set('authstart', '1');
      u.searchParams.set('authmode', 'register'); // 标记为注册模式
      u.searchParams.set('next', nextUrl);
      logger.debug('🌐 非生产域发起注册，先跳转到生产域再授权:', { from: window.location.href, to: u.toString() });
      window.location.href = u.toString();
      return;
    }

    const genRandom = (length: number) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
      let res = '';
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < array.length; i++) {
        res += chars[array[i] % chars.length];
      }
      return res;
    };
    const toBase64Url = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const encoder = new TextEncoder();
    const verifier = genRandom(64);
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(verifier));
    const challenge = toBase64Url(digest);
    sessionStorage.setItem('auth_pkce_verifier', verifier);

    const timestamp = Date.now();
    const stateObj = { ts: timestamp, mode: 'register', redirectTo: redirectTo || window.location.href };
    const state = encodeURIComponent(JSON.stringify(stateObj));
    logger.debug('📝 REGISTER State生成:', { stateObj, state, method: 'REGISTER' });
    const params = new URLSearchParams({
      client_id: cfg.appId,
      redirect_uri: cfg.redirectUri,
      response_type: 'code',
      scope: 'openid',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      nonce: genRandom(16),
      response_mode: 'query'
    } as any);
    try {
      // 使用智能注册助手生成最佳注册URL
      const registerUrl = getRegisterUrlFast({
        appId: cfg.appId,
        host: cfg.host.replace(/\/$/, ''),
        redirectUri: cfg.redirectUri,
        state,
        codeChallenge: challenge,
        nonce: genRandom(16)
      });

      logger.debug('[Authing] 智能注册URL', {
        registerUrl,
        redirectUri: cfg.redirectUri,
        mode: 'register'
      });

      window.location.href = registerUrl;
    } catch (e) {
      logger.error('OIDC Discovery failed, fallback to standard endpoint', e);
      const base = `${cfg.host.replace(/\/$/, '')}`;
      const loginUrl = `${base}/oidc/auth?${params.toString()}`;
      window.location.href = loginUrl;
    }
  };

  // 登出方法
  const logout = async () => {
    try {
      logger.debug('🚪 开始登出流程...');

      // 清除本地状态
      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      // 清除本地存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authing_user');

      // 清除 API token
      setAuthTokenGetter(() => null);

      logger.debug('✅ 登出成功');
    } catch (error) {
      logger.error('登出失败:', error);
      setError('登出失败');
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    showGuard,
    setShowGuard,
  };

  // 🔔 全局监听同窗口登录成功事件：无论是否使用弹窗，都能更新状态
  useEffect(() => {
    // 如果在生产域携带 authstart=1，则自动发起登录（只触发一次），并修正回跳地址为生产域
    try {
      const url = new URL(window.location.href);
      if (url.hostname === 'www.wenpai.xyz' && url.searchParams.get('authstart') === '1') {
        const next = url.searchParams.get('next');
        const authMode = url.searchParams.get('authmode'); // 获取认证模式
        // 修正：登录成功后应该跳转到生产域，而不是预览域
        const correctedNext = next ? 'https://www.wenpai.xyz/' : window.location.href;
        url.searchParams.delete('authstart');
        url.searchParams.delete('authmode');
        window.history.replaceState({}, '', url.toString());

        if (authMode === 'register') {
          logger.debug('🚀 生产域自动发起注册（来源于预览域跳转），修正回跳地址为生产域');
          register(correctedNext);
        } else {
          logger.debug('🚀 生产域自动发起登录（来源于预览域跳转），修正回跳地址为生产域');
          login(correctedNext);
        }
      }
    } catch (e) {}

    const handleAuthSuccess = (event: Event) => {
      try {
        const detail = (event as CustomEvent).detail;
        logger.debug('🎉 [Global] 收到登录成功事件:', detail);
        if (detail) handleLogin(detail);
      } catch (e) {
        logger.error('[Global] 处理登录成功事件失败:', e);
      }
    };

    window.addEventListener('auth-login-success', handleAuthSuccess);
    return () => {
      window.removeEventListener('auth-login-success', handleAuthSuccess);
    };
  }, []);

  // 🪟 兼容旧版：当使用弹窗模式时的回调处理
  useEffect(() => {
    if (showGuard && isAuthConfigValid(cfg)) {
      logger.debug('🚀 开始使用 Authing Web SDK 进行登录...');

      // 🎯 最终根因修复：使用 OIDC 标准端点
      const timestamp = Date.now();
      const base = `${cfg.host.replace(/\/$/, '')}`;
      const loginUrl = `${base}/oidc/auth?client_id=${cfg.appId}&redirect_uri=${encodeURIComponent(cfg.redirectUri)}&response_type=code&scope=openid&state=${timestamp}`;

      logger.debug('� 跳转到登录页面:', loginUrl);
      logger.debug('🔍 实际发送的 redirect_uri:', cfg.redirectUri);
      logger.debug('🔍 URL编码后的 redirect_uri:', encodeURIComponent(cfg.redirectUri));

      // 在新窗口中打开登录页面
      const loginWindow = window.open(
        loginUrl,
        'authing_login',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!loginWindow) {
        logger.error('❌ 无法打开登录窗口，可能被浏览器阻止');
        setError('无法打开登录窗口，请允许弹窗并重试');
        return;
      }

      logger.debug('✅ 登录窗口已打开');

      // 监听窗口关闭
      const checkClosed = setInterval(() => {
        if (loginWindow.closed) {
          logger.debug('🔧 登录窗口已关闭');
          clearInterval(checkClosed);
          handleClose();
        }
      }, 1000);

      // 监听来自登录窗口的消息
      const handleMessage = (event: MessageEvent) => {
        // 仅接受来自当前站点回调页面的消息
        if (event.origin !== window.location.origin) {
          return;
        }

        logger.debug('📩 收到登录窗口消息:', event.data);

        if (event.data.type === 'AUTHING_LOGIN_SUCCESS') {
          logger.debug('🎉 登录成功:', event.data.userInfo);
          clearInterval(checkClosed);
          loginWindow.close();
          handleLogin(event.data.userInfo);
        } else if (event.data.type === 'AUTHING_LOGIN_ERROR') {
          logger.error('❌ 登录失败:', event.data.error);
          clearInterval(checkClosed);
          loginWindow.close();
          setError('登录失败: ' + event.data.error);
        }
      };

      window.addEventListener('message', handleMessage);

      return () => {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        if (loginWindow && !loginWindow.closed) {
          loginWindow.close();
        }
      };
    }
  }, [showGuard, cfg]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;