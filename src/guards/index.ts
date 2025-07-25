/**
 * ✅ FIXED: 2025-01-05 创建统一的权限守卫系统导出文件
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 */

export { AuthGuard } from '@/components/auth/AuthGuard';
export { PermissionGuard } from '@/components/auth/PermissionGuard';
export { usePermission } from '@/hooks/usePermission';
export type { AuthGuardProps } from '@/components/auth/AuthGuard';
export type { PermissionGuardProps } from '@/components/auth/PermissionGuard';
export type { PermissionResult } from '@/hooks/usePermission'; 