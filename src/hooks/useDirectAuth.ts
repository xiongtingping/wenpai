/**
 * 🔧 [DIRECT_AUTH_HOOK_v2025.08.15]
 * 直接认证Hook - 使用DirectAuthContext
 * 
 * 这个Hook提供与useAuth相同的接口，但使用DirectAuthContext
 * 用于替代原有的useAuth，避免依赖UnifiedAuthContext
 */

import { useDirectAuth as useDirectAuthContext } from '@/contexts/DirectAuthContext';

/**
 * 直接认证 Hook
 * 提供与原useAuth相同的接口，确保向后兼容
 */
export const useAuth = () => {
  const auth = useDirectAuthContext();
  
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
    
    // 以下方法在DirectAuth中暂不支持，提供空实现
    updateUser: async () => {
      console.warn('updateUser not implemented in DirectAuth');
    },
    refreshToken: async () => {
      console.warn('refreshToken not implemented in DirectAuth');
    },
    handleAuthingLogin: auth.handleAuthCallback,
    loginWithPassword: async () => {
      console.warn('loginWithPassword not implemented in DirectAuth, use login() instead');
      return auth.login();
    },
    loginWithEmailCode: async () => {
      console.warn('loginWithEmailCode not implemented in DirectAuth, use login() instead');
      return auth.login();
    },
    loginWithPhoneCode: async () => {
      console.warn('loginWithPhoneCode not implemented in DirectAuth, use login() instead');
      return auth.login();
    },
    sendVerificationCode: async () => {
      console.warn('sendVerificationCode not implemented in DirectAuth');
    },
    registerUser: async () => {
      console.warn('registerUser not implemented in DirectAuth, use register() instead');
      return auth.register();
    },
    resetPassword: async () => {
      console.warn('resetPassword not implemented in DirectAuth');
    },
    hasPermission: () => {
      console.warn('hasPermission not implemented in DirectAuth');
      return false;
    },
    hasRole: () => {
      console.warn('hasRole not implemented in DirectAuth');
      return false;
    },
    guard: null // DirectAuth不使用Guard
  };
};

export default useAuth;
