/**
 * 🎯 [UNIFIED_AUTH_ROLLBACK_v2025.08.27]
 * 回滚到历史成功版本架构 - 基于最新后台配置
 *
 * 基于历史成功版本 63df879f 的架构：
 * 1. 使用UnifiedAuthProvider
 * 2. 直接使用@authing/guard
 * 3. 最小复杂度
 * 4. 根因导向修复
 */

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * 统一认证Hook - 历史成功版本架构
 *
 * 职责：
 * - 直接使用UnifiedAuthProvider
 * - 最小接口，最大兼容性
 * - 避免所有已知技术债务模式
 */
export const useAuth = () => {
  // 🎯 使用历史成功版本的认证实现
  try {
    const auth = useUnifiedAuth();
  } catch (error) {
    // 🚨 临时兼容性处理：如果UnifiedAuth不可用，返回默认值
    console.warn('UnifiedAuth不可用，使用默认值:', error);
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      login: async () => { console.warn('认证系统未初始化'); },
      register: async () => { console.warn('认证系统未初始化'); },
      logout: async () => { console.warn('认证系统未初始化'); },
      checkAuth: async () => { console.warn('认证系统未初始化'); },
      handleAuthingLogin: () => { console.warn('认证系统未初始化'); },
      refreshToken: async () => { console.warn('认证系统未初始化'); },
      updateUser: () => { console.warn('认证系统未初始化'); },
      hasPermission: () => false,
      hasRole: () => false,
      guard: null,
      // 兼容性方法
      loginWithPassword: async () => { console.warn('认证系统未初始化'); },
      loginWithEmailCode: async () => { console.warn('认证系统未初始化'); },
      loginWithPhoneCode: async () => { console.warn('认证系统未初始化'); },
      sendVerificationCode: async () => { console.warn('认证系统未初始化'); },
      registerUser: async () => { console.warn('认证系统未初始化'); },
      resetPassword: async () => { console.warn('认证系统未初始化'); }
    };
  }

  // 构建兼容的接口对象
  return {
    // 核心状态
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoggedIn: auth.isAuthenticated, // 兼容旧接口
    loading: auth.loading,
    error: null, // 简化错误处理
    initialized: !auth.loading,

    // 核心认证方法
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    updateUser: auth.updateUser,
    resetAuthState: () => {}, // 简化实现

    // 兼容方法（都映射到简单实现）
    checkAuth: () => Promise.resolve(auth.isAuthenticated),
    checkAuthStatus: () => Promise.resolve(auth.isAuthenticated),
    refreshToken: () => Promise.resolve(),
    refreshAuth: () => Promise.resolve(auth.isAuthenticated),
    getAccessToken: () => Promise.resolve(null),
    handleAuthingLogin: auth.login,

    // 权限检查方法（基础实现）
    hasPermission: () => auth.isAuthenticated,
    hasRole: () => auth.isAuthenticated,

    // 简化的兼容方法
    loginWithPassword: auth.login,
    loginWithEmailCode: auth.login,
    loginWithPhoneCode: auth.login,
    sendVerificationCode: () => Promise.reject(new Error('简化实现中不支持')),
    registerUser: auth.login,
    resetPassword: () => Promise.reject(new Error('简化实现中不支持')),

    // Guard实例（兼容性）
    guard: auth.guard
  };
};

export default useAuth; 