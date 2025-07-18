/**
 * 统一的功能权限检查Hook
 * 替代分散的权限检查方法，提供一致的权限检查接口
 */

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { checkFeaturePermission } from '@/utils/permissionChecker';
import { PermissionResult } from '@/utils/permissionChecker';

/**
 * 功能权限检查Hook
 * @param featureId 功能ID
 * @returns 权限检查结果
 */
export function useFeaturePermission(featureId: string): PermissionResult {
  const { user } = useUnifiedAuth();
  const userPlan = user?.subscription?.tier || user?.plan || 'trial';
  
  return checkFeaturePermission(featureId, userPlan);
}

/**
 * 多功能权限检查Hook
 * @param featureIds 功能ID数组
 * @returns 权限检查结果数组
 */
export function useMultipleFeaturePermissions(featureIds: string[]): PermissionResult[] {
  const { user } = useUnifiedAuth();
  const userPlan = user?.subscription?.tier || user?.plan || 'trial';
  
  return featureIds.map(featureId => checkFeaturePermission(featureId, userPlan));
}

/**
 * 权限检查结果Hook
 * @param featureId 功能ID
 * @returns 简化的权限检查结果
 */
export function usePermission(featureId: string): {
  hasPermission: boolean;
  requiredPlan?: string;
  message: string;
} {
  const result = useFeaturePermission(featureId);
  
  return {
    hasPermission: result.hasPermission,
    requiredPlan: result.requiredPlan,
    message: result.message
  };
}

/**
 * 批量权限检查Hook
 * @param featureIds 功能ID数组
 * @returns 批量权限检查结果
 */
export function useBatchPermissions(featureIds: string[]): {
  allGranted: boolean;
  anyGranted: boolean;
  results: Record<string, boolean>;
  missingFeatures: string[];
} {
  const results = useMultipleFeaturePermissions(featureIds);
  
  const permissionMap: Record<string, boolean> = {};
  const missingFeatures: string[] = [];
  
  featureIds.forEach((featureId, index) => {
    const hasPermission = results[index].hasPermission;
    permissionMap[featureId] = hasPermission;
    
    if (!hasPermission) {
      missingFeatures.push(featureId);
    }
  });
  
  return {
    allGranted: missingFeatures.length === 0,
    anyGranted: missingFeatures.length < featureIds.length,
    results: permissionMap,
    missingFeatures
  };
} 