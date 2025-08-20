import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { getAuthConfig, isAuthConfigValid } from './config';
import { setAuthTokenGetter } from '@/api/request';
import { logger } from '@/utils/logger';
import { getRegisterUrlFast, isRealLogin, getLoginStatus } from '@/utils/authingRegisterHelper';
import { normalizeUserInfo, StandardUserInfo } from '@/services/userInfoNormalizer';
import { userInfoSyncService } from '@/services/userInfoSyncService';

export interface AuthUser extends StandardUserInfo {
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
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
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

  // 🔧 应用启动时检查用户信息一致性
  useEffect(() => {
    const checkUserInfoConsistency = async () => {
      try {
        // 从localStorage获取用户信息
        const storedUserData = localStorage.getItem('authing_user');
        if (storedUserData) {
          const parsedUser = JSON.parse(storedUserData);

          logger.debug('🔍 检查存储的用户信息一致性:', parsedUser.id);

          // 检查数据一致性
          const consistencyCheck = await userInfoSyncService.checkConsistency(parsedUser.id);

          // 🔧 关键修复：应用启动时主动从Authing服务器拉取最新用户信息
          try {
            const { authingService } = await import('@/services/authingService');
            const latestUserInfo = await authingService.getCurrentUser();

            if (latestUserInfo) {
              // 使用服务器最新数据覆盖本地数据
              const refreshedUserData = {
                ...parsedUser,
                nickname: latestUserInfo.nickname || parsedUser.nickname,
                email: latestUserInfo.email || parsedUser.email,
                phone: latestUserInfo.phone || parsedUser.phone,
                avatar: latestUserInfo.photo || latestUserInfo.avatar || parsedUser.avatar,
                lastUpdated: new Date().toISOString(),
                syncStatus: 'synced'
              };

              // 更新本地存储
              localStorage.setItem('authing_user', JSON.stringify(refreshedUserData));
              sessionStorage.setItem('user_profile_backup', JSON.stringify(refreshedUserData));

              // 设置用户状态
              setUser(refreshedUserData);
              setIsAuthenticated(true);

              // 设置token
              const storedToken = localStorage.getItem('auth_token');
              if (storedToken) {
                setAuthTokenGetter(() => storedToken);
              }

              logger.debug('✅ 从服务器刷新用户信息成功', { userId: refreshedUserData.id });
              return;
            }
          } catch (serverError) {
            logger.warn('⚠️ 服务器同步失败，使用本地缓存:', serverError);
          }

          // 如果服务器同步失败，进行本地一致性检查
          if (!consistencyCheck.isConsistent) {
            logger.warn('⚠️ 检测到用户信息不一致，自动修复中...', consistencyCheck.conflicts);

            // 自动修复
            const repairResult = await userInfoSyncService.autoRepair(parsedUser.id);

            if (repairResult.success) {
              logger.debug('✅ 用户信息一致性修复成功:', repairResult.repairedFields);

              // 重新加载修复后的用户信息
              const repairedUserData = localStorage.getItem('authing_user');
              if (repairedUserData) {
                const repairedUser = JSON.parse(repairedUserData);
                setUser(repairedUser);
                setIsAuthenticated(true);
              }
            } else {
              logger.error('❌ 用户信息一致性修复失败:', repairResult.errors);
            }
          } else {
            logger.debug('✅ 用户信息一致性检查通过');
            // 标记为需要同步（因为服务器同步失败）
            const cachedUserData = {
              ...parsedUser,
              syncStatus: 'pending'
            };
            setUser(cachedUserData);
            setIsAuthenticated(true);

            // 设置token
            const storedToken = localStorage.getItem('auth_token');
            if (storedToken) {
              setAuthTokenGetter(() => storedToken);
            }
          }
        }
      } catch (error) {
        logger.error('❌ 用户信息一致性检查失败:', error);
      }
    };

    checkUserInfoConsistency();
  }, []);

  // 🔧 页面焦点时刷新用户信息
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // 当页面重新获得焦点且用户已登录时，刷新用户信息
      if (!document.hidden && isAuthenticated && user) {
        try {
          const { authingService } = await import('@/services/authingService');
          const latestUserInfo = await authingService.getCurrentUser();

          if (latestUserInfo) {
            const refreshedUserData = {
              ...user,
              nickname: latestUserInfo.nickname || user.nickname,
              email: latestUserInfo.email || user.email,
              phone: latestUserInfo.phone || user.phone,
              avatar: latestUserInfo.photo || latestUserInfo.avatar || user.avatar,
              lastUpdated: new Date().toISOString(),
              syncStatus: 'synced'
            };

            // 只有数据真正发生变化时才更新
            const hasChanges =
              refreshedUserData.nickname !== user.nickname ||
              refreshedUserData.email !== user.email ||
              refreshedUserData.phone !== user.phone ||
              refreshedUserData.avatar !== user.avatar;

            if (hasChanges) {
              localStorage.setItem('authing_user', JSON.stringify(refreshedUserData));
              sessionStorage.setItem('user_profile_backup', JSON.stringify(refreshedUserData));
              setUser(refreshedUserData);

              logger.debug('✅ 页面焦点时刷新用户信息成功', {
                userId: refreshedUserData.id,
                changes: { hasChanges }
              });
            }
          }
        } catch (error) {
          logger.warn('⚠️ 页面焦点时刷新用户信息失败:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user]);

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
  const handleLogin = async (userInfo: any) => {
    logger.debug('[Authing] 登录成功:', userInfo);

    try {
      // 🔧 使用统一的用户信息标准化服务
      console.log('🔍 AuthProvider收到的原始用户信息:', {
        userInfo,
        availableFields: Object.keys(userInfo || {}),
        nickname: userInfo?.nickname,
        name: userInfo?.name,
        username: userInfo?.username,
        preferred_username: userInfo?.preferred_username,
        given_name: userInfo?.given_name,
        email: userInfo?.email
      });

      // 检测登录方式
      let loginMethod: StandardUserInfo['loginMethod'] = 'authing';
      if (userInfo.loginMethod) {
        loginMethod = userInfo.loginMethod;
      } else if (userInfo.provider) {
        loginMethod = 'oauth';
      } else if (userInfo.phone && !userInfo.email) {
        loginMethod = 'phone';
      } else if (userInfo.email && !userInfo.phone) {
        loginMethod = 'email';
      }

      // 标准化用户信息
      const standardUserInfo = normalizeUserInfo(
        userInfo,
        loginMethod,
        'AuthProvider'
      );

      console.log('🔧 标准化后的用户信息:', standardUserInfo);

      // 转换为AuthUser格式（保持向后兼容）
      let authUser: AuthUser = {
        ...standardUserInfo,
        token: userInfo.token || undefined,
      };

      console.log('🔧 AuthProvider最终用户信息:', authUser);

      // 🔧 同步用户信息到所有存储位置
      userInfoSyncService.setGlobalStateUpdater((updatedUserInfo) => {
        setUser(updatedUserInfo as AuthUser);
        setIsAuthenticated(true);
      });

      const syncResult = await userInfoSyncService.syncUserInfo(standardUserInfo);
      console.log('🔄 用户信息同步结果:', syncResult);

      if (!syncResult.success) {
        console.warn('⚠️ 用户信息同步部分失败:', syncResult.errors);
      }

      // 🔧 检查用户信息完整性，如果不完整则尝试补全
      const isIncompleteUserInfo = !authUser.nickname && userInfo.token;
      if (isIncompleteUserInfo) {
        console.log('🔍 检测到用户信息不完整，尝试重新获取...');

        // 🔧 使用真实的Authing API获取完整用户信息
        try {
          const { authingService } = await import('@/services/authingService');
          const fullUserInfo = await authingService.getCurrentUser();

          if (fullUserInfo) {
            // 合并服务器返回的用户信息
            const completeNickname = [
              fullUserInfo.nickname,
              fullUserInfo.name,
              fullUserInfo.preferred_username,
              fullUserInfo.username,
              fullUserInfo.given_name
            ].filter(val => val && val !== 'undefined' && val !== 'null' && typeof val === 'string' && val.trim())[0];

            if (completeNickname) {
              authUser.nickname = completeNickname.trim();
              authUser.email = fullUserInfo.email || authUser.email;
              authUser.phone = fullUserInfo.phone || authUser.phone;
              authUser.avatar = fullUserInfo.photo || fullUserInfo.avatar || authUser.avatar;
              authUser.lastUpdated = new Date().toISOString();
            }
          }
        } catch (error) {
          console.warn('⚠️ 从Authing服务器获取用户信息失败:', error);
        }
      }

      // 🔧 登录成功后，强制从Authing服务器获取最新用户信息
      try {
        const { authingService } = await import('@/services/authingService');
        const serverUserInfo = await authingService.getCurrentUser();

        if (serverUserInfo) {
          // 使用服务器最新数据覆盖本地数据
          const updatedAuthUser = {
            ...authUser,
            nickname: serverUserInfo.nickname || authUser.nickname,
            email: serverUserInfo.email || authUser.email,
            phone: serverUserInfo.phone || authUser.phone,
            avatar: serverUserInfo.photo || serverUserInfo.avatar || authUser.avatar,
            lastUpdated: new Date().toISOString(),
            syncStatus: 'synced'
          };
          authUser = updatedAuthUser;
        }
      } catch (error) {
        console.warn('⚠️ 登录后获取服务器用户信息失败，使用本地数据:', error);
      }

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



  // 注册方法（根因修复：正确处理已登录用户的注册请求）
  const register = async (redirectTo?: string) => {
    logger.debug('📝 开始注册流程...', { method: 'SMART_REGISTER', redirectTo });

    if (!isAuthConfigValid(cfg)) {
      const errorMsg = 'Authing 配置无效，请检查环境变量';
      logger.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // 🔧 根因修复：检查用户登录状态，给出正确的提示
    if (isAuthenticated && user) {
      console.log('🔧 用户已登录，无需注册。用户信息:', {
        nickname: user.nickname,
        id: user.id
      });

      // 提示用户已经登录
      alert(`您已经登录为 ${user.nickname || user.id}，无需重复注册。\n\n如需注册新账户，请先登出当前账户。`);

      // 可选：跳转到个人中心
      // window.location.href = '/profile';
      return;
    }

    // 域源 Guard：非本地且非生产域，一律先跳转到生产域再发起注册
    const h = window.location.hostname;
    const isLocal = h === 'localhost' || h === '127.0.0.1';
    const isProd = h === 'www.wenpai.xyz';

    if (!isLocal && !isProd) {
      const nextUrl = redirectTo || window.location.href;
      const u = new URL('https://www.wenpai.xyz/');
      u.searchParams.set('authstart', '1');
      u.searchParams.set('authmode', 'register');
      u.searchParams.set('next', nextUrl);
      logger.debug('🌐 非生产域发起注册，先跳转到生产域:', { from: window.location.href, to: u.toString() });
      window.location.href = u.toString();
      return;
    }

    // 🔧 只有未登录用户才执行注册流程
    console.log('🔧 用户未登录，开始正常注册流程...');

    // 🔧 生成PKCE验证器（与登录方法相同的逻辑）
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

    // 保存PKCE验证器（与登录方法相同）
    sessionStorage.setItem('auth_pkce_verifier', verifier);
    localStorage.setItem('auth_pkce_verifier_backup', verifier);

    // 生成state参数
    const timestamp = Date.now();
    const state = JSON.stringify({ ts: timestamp, mode: 'register', redirectTo: redirectTo || window.location.href });

    // 🔧 修复：使用Authing专用注册端点，而不是OIDC端点
    const CORRECT_APP_ID = '68823897631e1ef8ff3720b2';

    // 使用Authing专用注册端点
    const authEndpoint = `${cfg.host.replace(/\/$/, '')}/${CORRECT_APP_ID}/register`;
    const registerParams = new URLSearchParams({
      redirect_uri: cfg.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: encodeURIComponent(state),
      code_challenge: challenge,
      code_challenge_method: 'S256',
      response_mode: 'query',
      ui_locales: 'zh-CN'
    });

    const finalRegisterUrl = `${authEndpoint}?${registerParams.toString()}`;

    logger.debug('📝 跳转到Authing专用注册端点:', {
      registerUrl: finalRegisterUrl,
      redirectUri: cfg.redirectUri,
      mode: 'authing_register_dedicated',
      endpoint: 'register_endpoint',
      verifierSaved: !!sessionStorage.getItem('auth_pkce_verifier'),
      state: state
    });

    // 🔧 强制调试：确保使用正确的URL
    console.log('🔧 REGISTER DEBUG - 最终URL检查:', {
      finalRegisterUrl,
      containsCorrectAppId: finalRegisterUrl.includes('68823897631e1ef8ff3720b2'),
      containsWrongAppId: finalRegisterUrl.includes('68823897631e1ef8ff3720b2'),
      urlPath: new URL(finalRegisterUrl).pathname,
      timestamp: Date.now()
    });

    // 跳转到注册页面
    window.location.href = finalRegisterUrl;
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
      localStorage.removeItem('authing_access_token');
      localStorage.removeItem('authing_id_token');

      // 清除 API token
      setAuthTokenGetter(() => null);

      // 🔧 尝试调用Authing登出API（可选，忽略错误）
      try {
        const logoutUrl = `${cfg.host}/api/v2/logout?app_id=${cfg.appId}`;
        logger.debug('🌐 尝试调用Authing登出API:', logoutUrl);

        const response = await fetch(logoutUrl, {
          method: 'GET',
          credentials: 'include',
          mode: 'cors'
        });

        if (response.ok) {
          logger.debug('✅ Authing登出API调用成功');
        } else {
          logger.debug('⚠️ Authing登出API返回非200状态:', response.status);
        }
      } catch (apiError: any) {
        // 静默处理API错误，不影响本地登出
        if (apiError?.status === 404 || apiError?.message?.includes('404')) {
          logger.debug('ℹ️ Authing登出API不存在（404），这是正常的');
        } else {
          logger.debug('ℹ️ Authing登出API调用失败，但不影响本地登出:', apiError?.message);
        }
      }

      logger.debug('✅ 登出成功');

    } catch (error) {
      logger.error('登出失败:', error);
      setError('登出失败');
    }
  };

  // 🔧 统一的用户信息更新函数
  const updateUser = async (updates: Partial<AuthUser>) => {
    if (!user) {
      logger.warn('⚠️ 尝试更新用户信息，但用户未登录');
      return;
    }

    try {
      logger.debug('🔄 开始更新用户信息:', updates);

      // 合并更新
      const updatedUserInfo = { ...user, ...updates, lastUpdated: new Date().toISOString() };

      // 更新本地状态
      setUser(updatedUserInfo);

      // 使用同步服务更新所有存储位置
      const syncResult = await userInfoSyncService.syncUserInfo(updatedUserInfo);

      if (syncResult.success) {
        logger.debug('✅ 用户信息更新成功');
      } else {
        logger.warn('⚠️ 用户信息更新部分失败:', syncResult.errors);
      }

      // 检查数据一致性
      const consistencyCheck = await userInfoSyncService.checkConsistency(user.id);
      if (!consistencyCheck.isConsistent) {
        logger.warn('⚠️ 检测到数据不一致，尝试自动修复');
        await userInfoSyncService.autoRepair(user.id);
      }

    } catch (error) {
      logger.error('❌ 更新用户信息失败:', error);
      setError('更新用户信息失败');
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
    updateUser,
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
    } catch (e) {
      // 忽略URL解析错误
    }

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