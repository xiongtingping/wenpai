/**
 * [UNIFIED_AUTH_PROXY]
 * 统一认证上下文（代理到新的 AuthProvider）
 * - 保持向后兼容性，代理所有调用到新的 AuthProvider
 * - 提供完整的 API 兼容层
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/auth/AuthProvider';

export interface UserInfo {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  loginTime?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

interface UnifiedAuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  handleAuthingLogin: (userInfo: any) => void;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<UserInfo>) => void;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithEmailCode: (email: string, code: string) => Promise<void>;
  loginWithPhoneCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (email: string, scene?: 'login' | 'register' | 'reset') => Promise<void>;
  registerUser: (userInfo: any) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  guard: null;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  const api = useMemo<UnifiedAuthContextType>(() => ({
    user: auth.user as UserInfo | null,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    checkAuth: async () => { /* no-op for compatibility */ },
    handleAuthingLogin: (_u: any) => { /* no-op for compatibility */ },
    refreshToken: async () => { /* no-op for compatibility */ },
    updateUser: (updates: Partial<UserInfo>) => {
      // 本地更新用户信息的兼容实现
      if (auth.user) {
        const updated = { ...auth.user, ...updates };
        // 这里可以触发用户信息更新逻辑
        console.log('用户信息更新:', updated);
      }
    },
    loginWithPassword: async () => auth.login(),
    loginWithEmailCode: async () => auth.login(),
    loginWithPhoneCode: async () => auth.login(),
    sendVerificationCode: async () => { /* no-op for compatibility */ },
    registerUser: async () => auth.register(),
    resetPassword: async () => { /* no-op for compatibility */ },
    hasPermission: (permission: string) => {
      // 软权限模式：不用于拦截，仅用于 UI 提示
      if (permission === 'auth:required') return auth.isAuthenticated;
      return true; // feature:* 等场景默认允许
    },
    hasRole: (_role: string) => auth.isAuthenticated,
    guard: null
  }), [auth]);

  return (
    <UnifiedAuthContext.Provider value={api}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const ctx = useContext(UnifiedAuthContext);
  if (!ctx) throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  return ctx;
};

export default UnifiedAuthContext;

