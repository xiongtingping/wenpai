/**
 * 统一权限守卫导出文件
 * 
 * 提供统一的权限守卫组件接口，简化权限管理
 * 支持嵌套使用，实现细粒度的权限控制
 */

// 基础认证守卫
export { default as AuthGuard } from './AuthGuard'

// 路由保护守卫
export { default as ProtectedRoute } from './ProtectedRoute'

// 权限检查守卫
export { default as PermissionGuard } from './PermissionGuard'

// 功能预览守卫
export { default as PreviewGuard } from './PreviewGuard'

// VIP功能守卫
export { default as VIPGuard } from './VIPGuard'

// 功能访问守卫
export { default as FeatureGuard } from './FeatureGuard'

// 统一权限守卫类型
export type {
  AuthGuardProps,
  ProtectedRouteProps,
  PermissionGuardProps,
  PreviewGuardProps,
  VIPGuardProps,
  FeatureGuardProps
} from './types'

// 权限检查结果类型
export type {
  PermissionCheckResult,
  FeaturePermissionResult
} from './types' 