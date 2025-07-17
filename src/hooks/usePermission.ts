/**
 * usePermission - 统一的权限判断Hook
 *
 * ✅ 推荐全局权限判断统一使用本Hook。
 *
 * @example
 *   const canEdit = usePermission('edit');
 *   if (canEdit) { ... }
 *
 *   // 多权限判断
 *   const canManage = usePermission(['admin', 'manage']);
 *   if (canManage) { ... }
 *
 * @param required 需要判断的权限（单个或数组）
 * @returns 是否拥有全部指定权限
 */
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

export function usePermission(required: string | string[]): boolean {
  const { user } = useUnifiedAuth();
  const userPermissions = user?.permissions || [];
  const has = Array.isArray(required)
    ? required.every(p => userPermissions.includes(p))
    : userPermissions.includes(required);

  return has;
} 