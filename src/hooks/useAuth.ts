/**
 * 认证 Hook 代理
 * 为了向后兼容，将 useAuth 代理到 useUnifiedAuth
 * 
 * @deprecated 请直接使用 useUnifiedAuth
 */

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * 认证 Hook
 * @deprecated 请直接使用 useUnifiedAuth
 */
export const useAuth = () => {
  const auth = useUnifiedAuth();
  
  // 为了向后兼容，提供相同的接口
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoggedIn: auth.isAuthenticated, // 兼容旧接口
    loading: auth.loading,
    error: auth.error,
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    checkAuth: auth.checkAuth,
    updateUser: auth.updateUser,
    refreshToken: auth.refreshToken,
    handleAuthingLogin: auth.handleAuthingLogin,
    loginWithPassword: auth.loginWithPassword,
    loginWithEmailCode: auth.loginWithEmailCode,
    loginWithPhoneCode: auth.loginWithPhoneCode,
    sendVerificationCode: auth.sendVerificationCode,
    registerUser: auth.registerUser,
    resetPassword: auth.resetPassword
  };
};

export default useAuth; 