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

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
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
      handleAuthingLogin: auth.handleAuthingLogin,

      // 权限检查方法（基础实现）
      hasPermission: () => auth.isAuthenticated,
      hasRole: () => auth.isAuthenticated,

      // 简化的兼容方法
      loginWithPassword: auth.login,
      loginWithEmailCode: auth.login,
      loginWithPhoneCode: auth.login,
      sendVerificationCode: () => Promise.reject(new Error('u64cdu4f5cu5931u8d25')),
      registerUser: auth.login,
      resetPassword: () => Promise.reject(new Error('u64cdu4f5cu5931u8d25')),

      // Guard实例（兼容性）
      guard: (auth as any).guard || null
    };
  } catch (error) {
    // 🚨 临时兼容性处理：如果UnifiedAuth不可用，返回默认值
    console.warn('UnifiedAuthunavailable，使用defaultvalue:', error);
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      login: async () => { console.warn('authenticating系统notinitialization'); },
      register: async () => { console.warn('authenticating系统notinitialization'); },
      logout: async () => { console.warn('authenticating系统notinitialization'); },
      checkAuth: async () => { console.warn('authenticating系统notinitialization'); },
      handleAuthingLogin: () => { console.warn('authenticating系统notinitialization'); },
      refreshToken: async () => { console.warn('authenticating系统notinitialization'); },
      updateUser: () => { console.warn('authenticating系统notinitialization'); },
      hasPermission: () => false,
      hasRole: () => false,
      guard: null,
      // 兼容性方法
      loginWithPassword: async () => { console.warn('authenticating系统notinitialization'); },
      loginWithEmailCode: async () => { console.warn('authenticating系统notinitialization'); },
      loginWithPhoneCode: async () => { console.warn('authenticating系统notinitialization'); },
      sendVerificationCode: async () => { console.warn('authenticating系统notinitialization'); },
      registerUser: async () => { console.warn('authenticating系统notinitialization'); },
      resetPassword: async () => { console.warn('authenticating系统notinitialization'); }
    };
  }
};

export default useAuth;
