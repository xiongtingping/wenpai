/**
 * 🔐 高级权限守卫Hook
 * @description 提供高级权限管理功能，包括缓存、批量检查、权限预测等
 * @author 权限系统团队
 * @created 2025-01-16
 */

import { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  UnifiedPermissionService, 
  type ExtendedPermissionType, 
  type PermissionCheckResult,
  type SessionUserInfo 
} from '@/services/unifiedPermissionService';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 权限缓存条目
 */
interface PermissionCacheEntry {
  result: PermissionCheckResult;
  timestamp: number;
  expiry: number;
}

/**
 * 批量权限检查结果
 */
interface BatchPermissionResult {
  permissions: Record<ExtendedPermissionType, PermissionCheckResult>;
  hasAllPermissions: boolean;
  hasAnyPermission: boolean;
  missingPermissions: ExtendedPermissionType[];
  suggestedUpgrade?: 'pro' | 'premium';
}

/**
 * 权限预测结果
 */
interface PermissionPrediction {
  willHavePermission: boolean;
  estimatedUpgradeTime: Date | null;
  requiredActions: string[];
  confidence: number;
}

/**
 * Hook配置选项
 */
interface UseAdvancedPermissionGuardOptions {
  /** 缓存过期时间（毫秒） */
  cacheExpiry?: number;
  /** 是否启用预加载 */
  enablePreload?: boolean;
  /** 是否启用权限预测 */
  enablePrediction?: boolean;
  /** 是否启用调试日志 */
  enableDebug?: boolean;
  /** 性能监控回调 */
  onPerformanceMetric?: (metric: PerformanceMetric) => void;
}

/**
 * 性能指标
 */
interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  cacheHit?: boolean;
}

// ============================================================================
// 权限缓存管理器
// ============================================================================

class PermissionCacheManager {
  private static instance: PermissionCacheManager;
  private cache = new Map<string, PermissionCacheEntry>();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5分钟

  static getInstance(): PermissionCacheManager {
    if (!this.instance) {
      this.instance = new PermissionCacheManager();
    }
    return this.instance;
  }

  /**
   * 生成缓存键
   */
  private generateKey(userId: string | null, permission: ExtendedPermissionType): string {
    return `${userId || 'anonymous'}:${permission}`;
  }

  /**
   * 获取缓存的权限结果
   */
  get(
    userId: string | null, 
    permission: ExtendedPermissionType
  ): PermissionCheckResult | null {
    const key = this.generateKey(userId, permission);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  /**
   * 设置权限结果到缓存
   */
  set(
    userId: string | null,
    permission: ExtendedPermissionType,
    result: PermissionCheckResult,
    expiry: number = this.DEFAULT_EXPIRY
  ): void {
    const key = this.generateKey(userId, permission);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      expiry: Date.now() + expiry
    });
  }

  /**
   * 清除用户的所有缓存
   */
  clearUserCache(userId: string | null): void {
    const userPrefix = `${userId || 'anonymous'}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(userPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    totalEntries: number;
    expiredEntries: number;
    hitRate: number;
  } {
    const totalEntries = this.cache.size;
    const now = Date.now();
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiry) {
        expiredEntries++;
      }
    }

    return {
      totalEntries,
      expiredEntries,
      hitRate: totalEntries > 0 ? (totalEntries - expiredEntries) / totalEntries : 0
    };
  }
}

// ============================================================================
// 高级权限守卫Hook
// ============================================================================

/**
 * 高级权限守卫Hook
 * 提供缓存、批量检查、性能监控等高级功能
 */
export function useAdvancedPermissionGuard(
  permissions: ExtendedPermissionType | ExtendedPermissionType[],
  options: UseAdvancedPermissionGuardOptions = {}
) {
  const {
    cacheExpiry = 5 * 60 * 1000, // 5分钟
    enablePreload = true,
    enablePrediction = false,
    enableDebug = false,
    onPerformanceMetric
  } = options;

  const { user } = useAuth();
  const cacheManager = useRef(PermissionCacheManager.getInstance());
  const [batchResult, setBatchResult] = useState<BatchPermissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const performanceStartTime = useRef<number>(0);

  // 标准化权限数组
  const permissionArray = useMemo(() => 
    Array.isArray(permissions) ? permissions : [permissions],
    [permissions]
  );

  /**
   * 记录性能指标
   */
  const recordPerformance = useCallback((
    operation: string,
    cacheHit: boolean = false
  ) => {
    if (onPerformanceMetric && performanceStartTime.current > 0) {
      const duration = performance.now() - performanceStartTime.current;
      onPerformanceMetric({
        operation,
        duration,
        timestamp: Date.now(),
        cacheHit
      });
    }
  }, [onPerformanceMetric]);

  /**
   * 检查单个权限（带缓存）
   */
  const checkSinglePermission = useCallback((
    permission: ExtendedPermissionType,
    useCache: boolean = true
  ): PermissionCheckResult => {
    performanceStartTime.current = performance.now();

    // 尝试从缓存获取
    if (useCache) {
      const cached = cacheManager.current.get(user?.id || null, permission);
      if (cached) {
        recordPerformance(`check:${permission}`, true);
        return cached;
      }
    }

    // 执行权限检查
    const result = UnifiedPermissionService.checkPermission(user as SessionUserInfo, permission);

    // 缓存结果
    if (useCache) {
      cacheManager.current.set(user?.id || null, permission, result, cacheExpiry);
    }

    recordPerformance(`check:${permission}`, false);
    return result;
  }, [user, cacheExpiry, recordPerformance]);

  /**
   * 批量检查权限
   */
  const checkBatchPermissions = useCallback(async (
    targetPermissions: ExtendedPermissionType[] = permissionArray,
    useCache: boolean = true
  ): Promise<BatchPermissionResult> => {
    setIsLoading(true);
    performanceStartTime.current = performance.now();

    try {
      const results: Record<ExtendedPermissionType, PermissionCheckResult> = {} as any;
      const missingPermissions: ExtendedPermissionType[] = [];
      
      for (const permission of targetPermissions) {
        const result = checkSinglePermission(permission, useCache);
        results[permission] = result;
        
        if (!result.hasPermission) {
          missingPermissions.push(permission);
        }
      }

      const hasAllPermissions = missingPermissions.length === 0;
      const hasAnyPermission = targetPermissions.some(p => results[p].hasPermission);
      
      // 确定建议的升级目标
      let suggestedUpgrade: 'pro' | 'premium' | undefined;
      if (missingPermissions.length > 0) {
        const requiredTiers = missingPermissions.map(p => results[p].requiredTier);
        if (requiredTiers.includes('premium')) {
          suggestedUpgrade = 'premium';
        } else if (requiredTiers.includes('pro')) {
          suggestedUpgrade = 'pro';
        }
      }

      const batchResult: BatchPermissionResult = {
        permissions: results,
        hasAllPermissions,
        hasAnyPermission,
        missingPermissions,
        suggestedUpgrade
      };

      setBatchResult(batchResult);
      recordPerformance('batch-check', false);
      
      if (enableDebug) {
        console.log('🔐 批量权限检查结果:', batchResult);
      }

      return batchResult;
    } finally {
      setIsLoading(false);
    }
  }, [permissionArray, checkSinglePermission, recordPerformance, enableDebug]);

  /**
   * 预测权限变化
   */
  const predictPermissionChange = useCallback((
    permission: ExtendedPermissionType,
    targetTier: 'pro' | 'premium'
  ): PermissionPrediction => {
    const currentResult = checkSinglePermission(permission, true);
    
    if (currentResult.hasPermission) {
      return {
        willHavePermission: true,
        estimatedUpgradeTime: null,
        requiredActions: [],
        confidence: 1.0
      };
    }

    const config = UnifiedPermissionService.getPermissionConfig(permission);
    const willHavePermission = config.requiredTier === targetTier || 
      (config.requiredTier === 'pro' && targetTier === 'premium');

    return {
      willHavePermission,
      estimatedUpgradeTime: willHavePermission ? new Date() : null,
      requiredActions: willHavePermission ? [`升级到${targetTier}`] : [`需要${config.requiredTier}权限`],
      confidence: 0.95
    };
  }, [checkSinglePermission]);

  /**
   * 预加载权限检查
   */
  const preloadPermissions = useCallback(async (
    targetPermissions: ExtendedPermissionType[]
  ) => {
    if (!enablePreload) return;

    try {
      for (const permission of targetPermissions) {
        // 在后台预加载权限检查结果
        setTimeout(() => {
          checkSinglePermission(permission, true);
        }, 0);
      }
    } catch (error) {
      if (enableDebug) {
        console.warn('⚠️ 权限预加载失败:', error);
      }
    }
  }, [enablePreload, checkSinglePermission, enableDebug]);

  /**
   * 清除权限缓存
   */
  const clearCache = useCallback(() => {
    cacheManager.current.clearUserCache(user?.id || null);
    if (enableDebug) {
      console.log('🗑️ 已清除权限缓存');
    }
  }, [user?.id, enableDebug]);

  /**
   * 获取缓存统计
   */
  const getCacheStats = useCallback(() => {
    return cacheManager.current.getStats();
  }, []);

  // 用户变化时清除缓存
  useEffect(() => {
    const previousUserId = useRef(user?.id);
    
    if (previousUserId.current !== user?.id) {
      clearCache();
      previousUserId.current = user?.id;
    }
  }, [user?.id, clearCache]);

  // 初始批量检查
  useEffect(() => {
    checkBatchPermissions();
  }, [permissionArray, user, checkBatchPermissions]);

  // 预加载相关权限
  useEffect(() => {
    if (enablePreload && permissionArray.length > 0) {
      // 预加载相关的权限类型
      const relatedPermissions: ExtendedPermissionType[] = [];
      
      permissionArray.forEach(permission => {
        if (permission.startsWith('tier:')) {
          relatedPermissions.push('tier:trial', 'tier:pro', 'tier:premium');
        } else if (permission.startsWith('feature:')) {
          relatedPermissions.push('tier:pro', 'tier:premium');
        }
      });

      preloadPermissions(relatedPermissions);
    }
  }, [permissionArray, enablePreload, preloadPermissions]);

  // 单个权限结果（向后兼容）
  const singlePermissionResult = useMemo(() => {
    if (permissionArray.length === 1) {
      return checkSinglePermission(permissionArray[0]);
    }
    return null;
  }, [permissionArray, checkSinglePermission]);

  return {
    // 基础权限检查
    hasPermission: singlePermissionResult?.hasPermission ?? batchResult?.hasAllPermissions ?? false,
    permissionResult: singlePermissionResult,
    
    // 批量权限管理
    batchResult,
    isLoading,
    checkBatchPermissions,
    
    // 高级功能
    checkSinglePermission,
    predictPermissionChange: enablePrediction ? predictPermissionChange : undefined,
    preloadPermissions,
    
    // 缓存管理
    clearCache,
    getCacheStats,
    
    // 便捷方法
    hasAllPermissions: batchResult?.hasAllPermissions ?? false,
    hasAnyPermission: batchResult?.hasAnyPermission ?? false,
    missingPermissions: batchResult?.missingPermissions ?? [],
    suggestedUpgrade: batchResult?.suggestedUpgrade,
    
    // 权限检查快捷方法
    canAccessTier: (tier: 'trial' | 'pro' | 'premium') => 
      checkSinglePermission(`tier:${tier}`).hasPermission,
    canAccessFeature: (feature: string) => 
      checkSinglePermission(`feature:${feature}` as ExtendedPermissionType).hasPermission,
    canAccessModel: (model: 'trial' | 'pro' | 'premium') => 
      checkSinglePermission(`model:${model}`).hasPermission,
  };
}

// ============================================================================
// 专用Hook
// ============================================================================

/**
 * 权限预加载Hook
 */
export function usePermissionPreloader() {
  const cacheManager = useRef(PermissionCacheManager.getInstance());
  const { user } = useAuth();

  const preloadCommonPermissions = useCallback(async () => {
    const commonPermissions: ExtendedPermissionType[] = [
      'tier:trial',
      'tier:pro', 
      'tier:premium',
      'feature:creative-studio',
      'feature:brand-library',
      'model:pro',
      'model:premium'
    ];

    for (const permission of commonPermissions) {
      try {
        const result = UnifiedPermissionService.checkPermission(user as SessionUserInfo, permission);
        cacheManager.current.set(user?.id || null, permission, result);
      } catch (error) {
        console.warn(`预加载权限 ${permission} 失败:`, error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      preloadCommonPermissions();
    }
  }, [user, preloadCommonPermissions]);

  return { preloadCommonPermissions };
}

/**
 * 权限监控Hook
 */
export function usePermissionMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const cacheManager = useRef(PermissionCacheManager.getInstance());

  const recordMetric = useCallback((metric: PerformanceMetric) => {
    setMetrics(prev => [...prev.slice(-99), metric]); // 保留最近100条记录
  }, []);

  const getPerformanceReport = useCallback(() => {
    const cacheStats = cacheManager.current.getStats();
    const averageResponseTime = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length 
      : 0;

    return {
      totalChecks: metrics.length,
      averageResponseTime,
      cacheStats,
      recentMetrics: metrics.slice(-10)
    };
  }, [metrics]);

  return {
    recordMetric,
    getPerformanceReport,
    metrics
  };
}

export default useAdvancedPermissionGuard;