/**
 * 统一使用量统计Hook
 * @description 统一获取Token使用量和使用次数数据，确保数据的实时同步和一致性显示
 */

import { useState, useEffect, useCallback } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useTokenUsageStore } from '@/stores/tokenUsageStore';
import { unifiedUsageService } from '@/services/unifiedUsageService';
import { enhancedPermissionService } from '@/services/enhancedPermissionService';
import type { SubscriptionTier } from '@/types/subscription';
import type { TokenUsageStats } from '@/services/tokenUsageService';
import type { UnifiedUsageStats } from '@/services/unifiedUsageService';

/**
 * 使用次数统计接口
 */
export interface UsageCountStats {
  /** 已使用次数 */
  usedCount: number;
  /** 可用总次数 */
  availableUses: number;
  /** 使用百分比 */
  usagePercentage: number;
  /** 剩余次数 */
  remainingUses: number;
}

/**
 * 扩展统计信息接口
 */
export interface ExtendedStats {
  /** 节省时间（分钟） */
  timeSaved: number;
  /** 生成内容数量 */
  contentGenerated: number;
  /** 注册日期 */
  registrationDate: string;
}

/**
 * 统一使用量统计接口（扩展版）
 */
export interface EnhancedUnifiedUsageStats {
  /** Token使用统计 */
  tokenStats: TokenUsageStats | null;
  /** 使用次数统计 */
  usageCountStats: UsageCountStats;
  /** 扩展统计信息 */
  extendedStats: ExtendedStats;
  /** 用户套餐类型 */
  userTier: SubscriptionTier;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 最后更新时间 */
  lastUpdated: string | null;
  /** 权限检查结果 */
  permissionStatus?: Record<string, boolean>;
  /** 套餐到期信息 */
  subscriptionExpiry?: {
    isExpired: boolean;
    daysRemaining: number;
    expiryDate: string;
  };
}

/**
 * 获取使用次数限额的函数
 */
function getUsageCountLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case 'trial':
      return 10;
    case 'pro':
      return 30;
    case 'premium':
      return -1; // 不限量
    default:
      return 10;
  }
}

/**
 * 模拟获取使用次数数据（后续可替换为真实API）
 */
async function fetchUsageCountStats(userId: string, userTier: SubscriptionTier): Promise<UsageCountStats> {
  // 这里可以调用后端API获取真实的使用次数数据
  // 目前使用模拟数据
  const availableUses = getUsageCountLimit(userTier);
  const usedCount = 3; // 模拟已使用次数
  const remainingUses = availableUses === -1 ? -1 : Math.max(0, availableUses - usedCount);
  const usagePercentage = availableUses === -1 ? 0 : (usedCount / availableUses) * 100;

  return {
    usedCount,
    availableUses,
    usagePercentage,
    remainingUses
  };
}

/**
 * 模拟获取扩展统计数据
 */
async function fetchExtendedStats(userId: string): Promise<ExtendedStats> {
  // 这里可以调用后端API获取真实的扩展统计数据
  // 目前使用模拟数据
  return {
    timeSaved: 45, // 节省时间（分钟）
    contentGenerated: 3, // 生成内容数量
    registrationDate: '2025/7/12' // 注册日期
  };
}

/**
 * 统一使用量统计Hook（增强版）
 */
export function useUnifiedUsageStats(): EnhancedUnifiedUsageStats & {
  refreshStats: () => Promise<void>;
  refreshTokenStats: () => Promise<void>;
  refreshUsageCountStats: () => Promise<void>;
  refreshExtendedStats: () => Promise<void>;
  checkPermission: (featureId: string) => Promise<boolean>;
  consumeUsage: (amount?: number) => Promise<boolean>;
} {
  const { user } = useUnifiedAuth();
  const { currentStats: tokenStats, refreshStats: refreshTokenStatsStore } = useTokenUsageStore();
  
  const [usageCountStats, setUsageCountStats] = useState<UsageCountStats>({
    usedCount: 0,
    availableUses: 10,
    usagePercentage: 0,
    remainingUses: 10
  });

  const [extendedStats, setExtendedStats] = useState<ExtendedStats>({
    timeSaved: 0,
    contentGenerated: 0,
    registrationDate: new Date().toLocaleDateString('zh-CN')
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Record<string, boolean>>({});
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<{
    isExpired: boolean;
    daysRemaining: number;
    expiryDate: string;
  } | undefined>();

  // 获取用户套餐类型
  const getUserTier = useCallback((): SubscriptionTier => {
    return user?.subscription?.tier || 'trial';
  }, [user]);

  const userTier = getUserTier();

  /**
   * 刷新Token统计
   */
  const refreshTokenStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      await refreshTokenStatsStore(user.id, userTier);
    } catch (error) {
      console.error('刷新Token统计失败:', error);
      setError(error instanceof Error ? error.message : '刷新Token统计失败');
    }
  }, [user?.id, userTier, refreshTokenStatsStore]);

  /**
   * 检查功能权限
   */
  const checkPermission = useCallback(async (featureId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const result = await enhancedPermissionService.checkFeaturePermission(
        user.id,
        featureId,
        userTier,
        user.permissions || []
      );

      // 更新权限状态缓存
      setPermissionStatus(prev => ({
        ...prev,
        [featureId]: result.hasPermission
      }));

      return result.hasPermission;
    } catch (error) {
      console.error('检查功能权限失败:', error);
      return false;
    }
  }, [user?.id, user?.permissions, userTier]);

  /**
   * 消费使用次数
   */
  const consumeUsage = useCallback(async (amount: number = 1): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const success = await unifiedUsageService.consumeUsageCount(user.id, userTier, amount);

      if (success) {
        // 刷新使用次数统计
        await refreshUsageCountStats();
      }

      return success;
    } catch (error) {
      console.error('消费使用次数失败:', error);
      return false;
    }
  }, [user?.id, userTier]);

  /**
   * 刷新使用次数统计
   */
  const refreshUsageCountStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const stats = await unifiedUsageService.getUserUsageCountStats(user.id, userTier);
      setUsageCountStats(stats);
    } catch (error) {
      console.error('刷新使用次数统计失败:', error);
      setError(error instanceof Error ? error.message : '刷新使用次数统计失败');
    }
  }, [user?.id, userTier]);

  /**
   * 刷新扩展统计
   */
  const refreshExtendedStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const stats = await fetchExtendedStats(user.id);
      setExtendedStats(stats);
    } catch (error) {
      console.error('刷新扩展统计失败:', error);
      setError(error instanceof Error ? error.message : '刷新扩展统计失败');
    }
  }, [user?.id]);

  /**
   * 刷新所有统计数据
   */
  const refreshStats = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // 1. 刷新基础统计数据
      await Promise.all([
        refreshTokenStats(),
        refreshUsageCountStats(),
        refreshExtendedStats()
      ]);

      // 2. 检查套餐到期状态
      try {
        const expiryCheck = await enhancedPermissionService.checkSubscriptionExpiry(user.id);
        setSubscriptionExpiry({
          isExpired: expiryCheck.isExpired,
          daysRemaining: expiryCheck.daysRemaining,
          expiryDate: expiryCheck.expiryDate
        });

        // 3. 自动处理套餐到期
        if (expiryCheck.isExpired) {
          await enhancedPermissionService.autoHandleSubscriptionExpiry(user.id, userTier);
        }
      } catch (error) {
        console.warn('检查套餐到期状态失败:', error);
      }

      // 4. 刷新关键功能权限状态
      try {
        const keyFeatures = ['ai-content-adapter', 'creative-studio', 'brand-library'];
        const permissionResults = await Promise.all(
          keyFeatures.map(async (featureId) => {
            const hasPermission = await checkPermission(featureId);
            return [featureId, hasPermission];
          })
        );

        setPermissionStatus(Object.fromEntries(permissionResults));
      } catch (error) {
        console.warn('刷新权限状态失败:', error);
      }

      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('刷新统计数据失败:', error);
      setError(error instanceof Error ? error.message : '刷新统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [user?.id, userTier, refreshTokenStats, refreshUsageCountStats, refreshExtendedStats, checkPermission]);

  // 自动加载数据
  useEffect(() => {
    if (user?.id) {
      refreshStats();
    }
  }, [user?.id, refreshStats]);

  return {
    tokenStats,
    usageCountStats,
    extendedStats,
    userTier,
    loading,
    error,
    lastUpdated,
    permissionStatus,
    subscriptionExpiry,
    refreshStats,
    refreshTokenStats,
    refreshUsageCountStats,
    refreshExtendedStats,
    checkPermission,
    consumeUsage
  };
}

export default useUnifiedUsageStats;
