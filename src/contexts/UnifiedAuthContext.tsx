/**
 * 🔧 COMPATIBILITY ADAPTER: UnifiedAuthContext兼容性适配器
 * 📌 为了快速迁移，提供向后兼容的接口
 * 🎯 将所有旧的useUnifiedAuth调用重定向到新的useAuthingWeb
 * 
 * 🔒 [COMPATIBILITY_ADAPTER_v2025.08.14]
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthingWeb, AuthingWebContextType, UserInfo } from '@/contexts/AuthingWebContext';

/**
 * 兼容性用户信息接口（保持与旧版本一致）
 */
export interface UnifiedUserInfo extends UserInfo {
  // 保持向后兼容
}

/**
 * 兼容性认证上下文类型（保持与旧版本一致）
 */
export interface UnifiedAuthContextType {
  user: UnifiedUserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // 核心方法
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // 扩展方法（兼容性）
  handleAuthingLogin: (userInfo: any) => void;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<UnifiedUserInfo>) => Promise<void>;
  loginWithPassword: (account: string, password: string) => Promise<void>;
  loginWithEmailCode: (email: string, code: string) => Promise<void>;
  loginWithPhoneCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (target: string, type: 'email' | 'phone') => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  
  // 权限方法
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  
  // 兼容性属性
  guard?: any; // 保持兼容，但实际不使用
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

interface UnifiedAuthProviderProps {
  children: ReactNode;
}

export const UnifiedAuthProvider: React.FC<UnifiedAuthProviderProps> = ({ children }) => {
  const authingWeb = useAuthingWeb();

  // 兼容性方法适配
  const login = async (redirectTo?: string) => {
    if (redirectTo) {
      localStorage.setItem('login_redirect_to', redirectTo);
    }
    await authingWeb.login();
  };

  const register = async (redirectTo?: string) => {
    if (redirectTo) {
      localStorage.setItem('login_redirect_to', redirectTo);
    }
    // 对于注册，我们重定向到登录页面的注册标签
    window.location.href = '/login?tab=register';
  };

  const handleAuthingLogin = (userInfo: any) => {
    // 兼容性方法，实际由AuthingWebContext处理
    console.log('🔄 兼容性适配器: handleAuthingLogin调用', userInfo);
  };

  const refreshToken = async () => {
    // 兼容性方法，实际由AuthingWebContext处理
    await authingWeb.checkAuth();
  };

  const updateUser = async (userData: Partial<UnifiedUserInfo>) => {
    // 兼容性方法，暂时只更新本地状态
    console.log('🔄 兼容性适配器: updateUser调用', userData);
    // 实际的用户更新需要通过Authing API
  };

  const contextValue: UnifiedAuthContextType = {
    user: authingWeb.user,
    isAuthenticated: authingWeb.isAuthenticated,
    loading: authingWeb.loading,
    error: authingWeb.error,
    
    login,
    register,
    logout: authingWeb.logout,
    checkAuth: authingWeb.checkAuth,
    
    handleAuthingLogin,
    refreshToken,
    updateUser,
    loginWithPassword: authingWeb.loginWithPassword,
    loginWithEmailCode: authingWeb.loginWithEmailCode,
    loginWithPhoneCode: authingWeb.loginWithPhoneCode,
    sendVerificationCode: authingWeb.sendVerificationCode,
    registerUser: authingWeb.registerUser,
    resetPassword: authingWeb.resetPassword,
    
    hasPermission: authingWeb.hasPermission,
    hasRole: authingWeb.hasRole,
    
    guard: null // 兼容性属性，不再使用
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// 导出兼容性类型
export type { UserInfo };
export default UnifiedAuthProvider;
