/**
 * 🔧 [OFFICIAL_AUTH_ENTRY_v2025.08.26]
 * 官方认证入口Hook - 架构重构完成
 *
 * 这是整个应用的唯一认证入口，基于@authing/browser官方SDK：
 * 1. 统一的认证状态管理
 * 2. 官方SDK标准实现
 * 3. 向后兼容支持
 * 4. 类型安全保障
 */

import { useAuth as useOfficialAuth } from '@/auth/OfficialAuthProvider';

/**
 * 官方认证Hook - 应用的唯一认证入口
 *
 * 职责分工：
 * - OfficialAuthProvider: 核心认证逻辑和状态管理
 * - useAuth: 统一入口和接口标准化
 * - @authing/browser: 官方SDK处理所有认证流程
 */
export const useAuth = () => {
  // 🎯 使用基于官方SDK的认证实现
  const auth = useOfficialAuth();

  // 统一接口，确保类型安全和一致性
  return {
    // 核心状态
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoggedIn: auth.isAuthenticated, // 兼容旧接口
    loading: auth.loading,
    error: auth.error,
    initialized: auth.initialized,

    // 核心认证方法
    login: auth.login,
    logout: auth.logout,
    checkAuth: auth.checkAuthStatus,
    refreshToken: auth.refreshToken,
    refreshAuth: auth.checkAuthStatus, // 刷新认证状态
    updateUser: auth.updateUser,
    getAccessToken: auth.getAccessToken,

    // 兼容旧接口的方法（映射到新实现）
    register: auth.login, // 注册也使用登录流程
    checkAuthStatus: auth.checkAuthStatus,
    handleAuthingLogin: auth.login,

    // 权限检查方法（基础实现）
    hasPermission: () => auth.isAuthenticated,
    hasRole: () => auth.isAuthenticated,

    // 旧的扩展方法（暂时保持兼容）
    loginWithPassword: auth.login,
    loginWithEmailCode: auth.login,
    loginWithPhoneCode: auth.login,
    sendVerificationCode: async () => { throw new Error('官方SDK实现中暂不支持此功能'); },
    registerUser: auth.login,
    resetPassword: async () => { throw new Error('官方SDK实现中暂不支持此功能'); },

    // Guard实例（兼容性）
    guard: null
  };
};

export default useAuth; 