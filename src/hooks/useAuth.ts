/**
 * 🔧 [UNIFIED_AUTH_ENTRY_v2025.08.15]
 * 统一认证入口Hook - 系统性架构优化
 *
 * 这是整个应用的唯一认证入口，提供：
 * 1. 统一的认证状态管理
 * 2. 清晰的职责分工
 * 3. 向后兼容支持
 * 4. 类型安全保障
 */

import { useUnifiedAuth } from '@/auth/UnifiedAuthProvider';

/**
 * 统一认证Hook - 应用的唯一认证入口
 *
 * 职责分工：
 * - UnifiedAuthContext: 核心认证逻辑和状态管理
 * - useAuth: 统一入口和接口标准化
 * - @authing/guard: 登录弹窗UI
 * - @authing/web: OAuth2回调处理
 */
export const useAuth = () => {
  const auth = useUnifiedAuth();

  // 统一接口，确保类型安全和一致性
  return {
    // 核心状态
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoggedIn: auth.isAuthenticated, // 兼容旧接口
    loading: auth.loading,
    error: auth.error,

    // 核心认证方法
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    checkAuth: auth.checkAuth,

    // 用户管理方法
    updateUser: auth.updateUser,
    refreshToken: auth.refreshToken,
    handleAuthingLogin: auth.handleAuthingLogin,

    // 权限检查方法
    hasPermission: auth.hasPermission,
    hasRole: auth.hasRole,

    // 扩展认证方法
    loginWithPassword: auth.loginWithPassword,
    loginWithEmailCode: auth.loginWithEmailCode,
    loginWithPhoneCode: auth.loginWithPhoneCode,
    sendVerificationCode: auth.sendVerificationCode,
    registerUser: auth.registerUser,
    resetPassword: auth.resetPassword,

    // Guard实例（高级用法）
    guard: auth.guard
  };
};

export default useAuth; 