/**
 * 🔐 统一认证Hook v2.0
 *
 * 简化设计:
 * ✅ 直接使用UnifiedAuthContext
 * ✅ 无额外封装层
 * ✅ 类型安全
 * ✅ 清晰的接口
 *
 * 之前的问题 (v1):
 * ❌ 多层封装
 * ❌ try-catch降级逻辑
 * ❌ 类型不一致
 *
 * 现在 (v2):
 * ✅ 直接透传Context
 * ✅ 统一类型
 * ✅ 简洁明了
 */

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext.v2';

/**
 * 统一认证Hook
 *
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated } = useAuth();
 * ```
 */
export const useAuth = () => {
  return useUnifiedAuth();
};

export default useAuth;
