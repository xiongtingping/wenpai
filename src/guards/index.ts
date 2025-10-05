/**
 * ✅ UPDATED: 2025-08-12 统一权限守卫系统导出文件
 * 🔄 整合所有权限守卫组件，提供统一的权限控制接口
 */

// 统一权限守卫系统
export { UnifiedPermissionGuard, useUnifiedPermission } from '@/components/auth/UnifiedPermissionGuard';
export type { PermissionType } from '@/components/auth/UnifiedPermissionGuard';

// 订阅权限守卫系统（已废弃的组件，注释掉避免编译错误）
// export { SubscriptionGuard, useSubscriptionGuard } from '@/components/auth/SubscriptionGuard';
// export { FeatureZoneGuard, SettingItemGuard, ThemeGuard } from '@/components/auth/FeatureZoneGuard';

// 兼容性导出（向后兼容）
export { AuthGuard } from '@/components/auth/AuthGuard';
// export { PermissionGuard } from '@/components/auth/PermissionGuard';
export { usePermission } from '@/hooks/usePermission';
export type { AuthGuardProps } from '@/components/auth/AuthGuard';
// export type { PermissionGuardProps } from '@/components/auth/PermissionGuard';
export type { PermissionResult } from '@/hooks/usePermission';