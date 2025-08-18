import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Guard, User, GuardMode } from '@authing/react-ui-components';
import '@authing/react-ui-components/lib/index.min.css';

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
  const handleLogin = (userInfo: User) => {
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

  // 登录方法
  const login = async (redirectTo?: string) => {
    logger.debug('🔐 开始登录流程...');

    if (!isAuthConfigValid(cfg)) {
      const errorMsg = 'Authing 配置无效，请检查环境变量';
      logger.error(errorMsg);
      setError(errorMsg);
      return;
    }

    logger.debug('🔧 Auth配置:', cfg);
    setShowGuard(true);
  };

  // 注册方法
  const register = async (redirectTo?: string) => {
    logger.debug('📝 开始注册流程...');

    if (!isAuthConfigValid(cfg)) {
      const errorMsg = 'Authing 配置无效，请检查环境变量';
      logger.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setShowGuard(true);
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}

      {/* 🔧 修复：根据正确的 Guard API 使用 */}
      {showGuard && isAuthConfigValid(cfg) && (
        <Guard
          appId={cfg.appId}
          config={{
            host: cfg.host,
            mode: GuardMode.Modal,
            lang: 'zh-CN',
            title: '登录 - 文派',
            logo: 'https://www.wenpai.xyz/logo.png',
            clickCloseable: true,
            escCloseable: true,
          }}
          onLogin={handleLogin}
          onClose={handleClose}
          onLoad={(authClient) => {
            logger.debug('🔧 Guard 组件加载成功', authClient);
          }}
          onLoadError={(error) => {
            logger.error('❌ Guard 组件加载失败', error);
          }}
        />
      )}
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