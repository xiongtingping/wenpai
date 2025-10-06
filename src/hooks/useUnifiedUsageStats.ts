/**
 * 统一使用量统计Hook
 * @description 通过统一数据管理器获取Token使用量和使用次数数据，确保数据的实时同步和一致性显示
 * 🔧 修复了剩余次数显示问题：高级版无限制显示为 ∞ 而不是 0
 * 🔧 修复了数据闪烁问题：使用统一的缓存机制和数据管理中心
 * 🔧 修复了Supabase同步问题：所有数据变更都通过数据管理中心同步
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTokenUsageState, useUnifiedStore } from '@/stores/unified-state-store';
import { unifiedUsageDataManager } from '@/services/unifiedUsageDataManager';
import type { UsageCountStats as ServiceUsageCountStats } from '@/services/unifiedUsageDataManager';
import { enhancedPermissionService } from '@/services/enhancedPermissionService';
import { 
  formatRemainingUses, 
  calculateUsagePercentage, 
  getTierDefaultLimit 
} from '@/utils/usageDisplayUtils';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import type { SubscriptionTier } from '@/types/subscription';
import type { TokenUsageStats } from '@/services/tokenUsageService';
import { logger } from '@/utils/logger';

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
 * 🔧 修复：使用统一的限额获取逻辑
 */
function getUsageCountLimit(tier: SubscriptionTier): number {
  return getTierDefaultLimit(tier);
}

/**
 * 获取使用次数数据（通过统一数据管理器）
 */
async function fetchUsageCountStats(userId: string, userTier: SubscriptionTier): Promise<UsageCountStats> {
  try {
    // 🔧 FIX: 通过统一数据管理器获取数据，确保缓存一致性
    return await unifiedUsageDataManager.getUserUsageCountStats(userId, userTier);
  } catch (error) {
    logger.error('获取使用次数统计失败:', { userId, userTier, error });

    // 如果获取失败，返回默认值
    const availableUses = getUsageCountLimit(userTier);
    const usedCount = 0;
    
    return {
      usedCount,
      availableUses,
      usagePercentage: calculateUsagePercentage(usedCount, availableUses, userTier),
      remainingUses: availableUses === -1 ? -1 : Math.max(0, availableUses - usedCount),
      // lastUpdated: new Date().toISOString() // 移除不存在的属性
    };
  }
}

/**
 * 获取扩展统计数据（通过统一数据管理器）
 */
async function fetchExtendedStats(userId: string): Promise<ExtendedStats> {
  try {
    // 🔧 FIX: 通过统一数据管理器获取扩展统计
    return await unifiedUsageDataManager.getExtendedStats(userId);
  } catch (error) {
    logger.error('获取扩展统计失败:', { userId, error });
    return {
      timeSaved: 0,
      contentGenerated: 0,
      registrationDate: new Date().toLocaleDateString('zh-CN')
    };
  }
}

/**
 * 统一使用量统计Hook（增强版）
 */
export function useUnifiedUsageStats(externalUserTier?: SubscriptionTier): EnhancedUnifiedUsageStats & {
  refreshStats: () => Promise<void>;
  refreshTokenStats: () => Promise<void>;
  refreshUsageCountStats: () => Promise<void>;
  refreshExtendedStats: () => Promise<void>;
  checkPermission: (featureId: string) => Promise<boolean>;
  consumeUsage: (amount?: number) => Promise<boolean>;
} {
  // console.log('🔍 [useUnifiedUsageStats] Hookinitialization，outer部传入userTier:', externalUserTier);
  const { user } = useAuth();
  const tokenUsageState = useTokenUsageState();
  const unifiedStore = useUnifiedStore();
  const tokenStats = tokenUsageState.currentStats;
  const { subscriptionStatus, hasActiveSubscription } = useSubscriptionStatus(user?.id);
  
  const [usageCountStats, setUsageCountStats] = useState<UsageCountStats>({
    usedCount: 0,
    availableUses: -1, // 🔧 FIX: 默认值设为无限制，避免闪烁
    usagePercentage: 0,
    remainingUses: -1, // 🔧 FIX: 默认值设为无限制，避免闪烁
    // lastUpdated: new Date().toISOString() // 移除不存在的属性
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

  // 获取用户套餐类型 - 优先使用外部传入的等级
  const getUserTier = useCallback((): SubscriptionTier => {
    // console.log('🔍 [useUnifiedUsageStats] getUserTierstartscalculating:', {
    //   externalUserTier,
    //   hasUser: !!user,
    //   userId: user?.id,
    //   subscriptionStatus: subscriptionStatus?.status,
    //   hasActiveSubscription
    // });
    
    // 1. 🔧 FIX: 强制优先使用外部传入的等级，避免不一致
    if (externalUserTier) {
      // console.log('🔍 [useUnifiedUsageStats] 使用outer部userTier:', externalUserTier);
      return externalUserTier;
    }
    
    // 2. 尝试从用户对象获取
    if ((user?.subscription as any)?.tier) {
      console.log('🔎 从userobjectgetting套餐type:', (user?.subscription as any)?.tier);
      return (user?.subscription as any)?.tier;
    }
    
    // 3. 🔧 FIX: 从订阅状态服务获取真实套餐信息
    if (subscriptionStatus && hasActiveSubscription) {
      // 🔧 FIX: 统一套餐类型判断逻辑，避免premium/pro切换
      let tier: SubscriptionTier = 'trial';
      
      // 优先从tier字段获取，但需要验证有效性
      if (subscriptionStatus.tier && ['trial', 'pro', 'premium'].includes(subscriptionStatus.tier)) {
        tier = subscriptionStatus.tier as SubscriptionTier;
        console.log('🔎 从subscribingstatetiergetting套餐type:', tier, subscriptionStatus);
      } else if (subscriptionStatus.status === 'active') {
        // 🔧 FIX: 活跃订阅统一设置为premium，避免来回切换
        tier = 'premium';
        console.log('🔎 活跃subscribingsetting为premium套餐:', { 
          status: subscriptionStatus.status, 
          hasActive: hasActiveSubscription 
        });
      }
      
      return tier;
    }
    
    // 4. 降级方案：从缓存获取
    try {
      const cachedSubStatus = localStorage.getItem('unified-user-state');
      if (cachedSubStatus) {
        const userState = JSON.parse(cachedSubStatus);
        if (userState.subscriptionStatus?.status === 'active') {
          console.log('🔎 从cachegetting套餐type: pro');
          return 'pro';
        }
      }
    } catch (error) {
      console.warn('none法从cachegettingsubscribingstate:', error);
    }
    
    // 5. 默认为体验版
    // console.log('🔎 使用default套餐type: trial');
    return 'trial';
  }, [user, externalUserTier, subscriptionStatus, hasActiveSubscription]);

  // 🔧 FIX: 使用useMemo缓存userTier，避免重复计算导致的闪烁
  // 🔧 CRITICAL FIX: 限制依赖项，只在关键数据变化时重新计算
  const userTier = useMemo(() => {
    return getUserTier();
  }, [
    externalUserTier,
    user?.id,
    subscriptionStatus?.tier,
    subscriptionStatus?.status,
    hasActiveSubscription
  ]);
  
  // 🔎 调试信息
  useEffect(() => {
    // console.log('🔎 useUnifiedUsageStats debugginginfo:', {
    //   userId: user?.id,
    //   userTier,
    //   subscriptionStatus,
    //   hasActiveSubscription,
    //   externalUserTier,
    //   userSubscription: (user as any)?.subscription
    // });
  }, [user?.id, getUserTier, subscriptionStatus, hasActiveSubscription, externalUserTier]); // 🔧 FIX: 避免循环依赖

  /**
   * 刷新Token统计（通过统一数据管理器）
   */
  const refreshTokenStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const currentUserTier = getUserTier();
      console.log('[useUnifiedUsageStats.refreshTokenStats] start', { userId: user.id, userTier: currentUserTier });
      // 强制实时拉取，绕过缓存，避免显示为0的旧值
      const tokenStatsData = await unifiedUsageDataManager.getTokenUsageStatsLive(user.id, currentUserTier);
      console.log('[useUnifiedUsageStats.refreshTokenStats] result', { monthlyUsed: tokenStatsData?.monthlyUsed });

      if (tokenStatsData) {
        unifiedStore.updateTokenStats(tokenStatsData);
      }
    } catch (error) {
      const currentUserTier = getUserTier();
      logger.error('刷新Token统计失败:', { userId: user.id, userTier: currentUserTier, error });
      setError(error instanceof Error ? error.message : '刷新Token统计失败');
    }
  }, [user?.id, getUserTier, unifiedStore]);

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
      console.error('checkingfeaturepermissionfailed:', error);
      return false;
    }
  }, [user?.id, user?.permissions, getUserTier]); // 🔧 FIX: 避免循环依赖

  /**
   * 消费使用次数（通过统一数据管理器）
   */
  const consumeUsage = useCallback(async (amount: number = 1): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // 🔧 FIX: 通过统一数据管理器消费使用次数，确保原子操作和数据一致性
      // 🔧 CRITICAL FIX: 使用实时计算的userTier
      const currentUserTier = getUserTier();
      const success = await unifiedUsageDataManager.consumeUsageCount(user.id, currentUserTier, amount);

      if (success) {
        // 刷新使用次数统计
        await refreshUsageCountStats();
      }

      return success;
    } catch (error) {
      logger.error('消费使用次数失败:', { userId: user.id, amount, error });
      return false;
    }
  }, [user?.id, getUserTier]); // 🔧 FIX: 避免循环依赖

  /**
   * 刷新使用次数统计（通过统一数据管理器）
   */
  const refreshUsageCountStats = useCallback(async () => {
    if (!user?.id) {
      logger.debug('refreshUsageCountStats: 用户未登录，跳过');
      return;
    }

    logger.debug('refreshUsageCountStats: 开始刷新', { userId: user.id, userTier: getUserTier() });

    try {
      // 🔧 FIX: 通过统一数据管理器获取使用次数统计
      // 🔧 CRITICAL FIX: 使用实时计算的userTier，确保与传入参数一致
      const currentUserTier = getUserTier();
      const stats = await unifiedUsageDataManager.getUserUsageCountStats(user.id, currentUserTier);
      logger.debug('refreshUsageCountStats: 获取到统计数据', stats);
      setUsageCountStats(stats);
      logger.debug('refreshUsageCountStats: 统计数据已设置');
    } catch (error) {
      const currentUserTier = getUserTier();
      logger.error('refreshUsageCountStats: 刷新使用次数统计失败:', { userId: user.id, userTier: currentUserTier, error });
      setError(error instanceof Error ? error.message : '刷新使用次数统计失败');
    }
  }, [user?.id, getUserTier]); // 🔧 FIX: 使用getUserTier引用避免循环依赖

  /**
   * 刷新扩展统计
   */
  const refreshExtendedStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const stats = await fetchExtendedStats(user.id);
      setExtendedStats(stats);
    } catch (error) {
      console.error('refreshingextension统计failed:', error);
      setError(error instanceof Error ? error.message : '刷新扩展统计失败');
    }
  }, [user?.id]);

  /**
   * 刷新所有统计数据（通过统一数据管理器）
   */
  const refreshStats = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // 🔧 CRITICAL FIX: 使用实时计算的userTier
      const currentUserTier = getUserTier();
      logger.info('refreshStats: 开始刷新所有统计数据', { userId: user.id, userTier: currentUserTier });
      
      // 🔧 FIX: 通过统一数据管理器刷新所有数据
      const unifiedData = await unifiedUsageDataManager.refreshAllStats(user.id, currentUserTier);
      
      // 更新状态
      if (unifiedData.tokenStats) {
        // Token统计通过统一Store更新
        unifiedStore.updateTokenStats(unifiedData.tokenStats);
      }
      
      // 直接使用统一数据
      setUsageCountStats(unifiedData.usageCountStats);
      setExtendedStats(unifiedData.extendedStats);
      
      logger.info('refreshStats: 统一统计数据刷新完成');

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
          await enhancedPermissionService.autoHandleSubscriptionExpiry(user.id, currentUserTier);
        }
      } catch (error) {
        console.warn('checking套餐到期statefailed:', error);
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
        console.warn('refreshingpermissionstatefailed:', error);
      }

      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('refreshing统计datafailed:', error);
      setError(error instanceof Error ? error.message : '刷新统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [user?.id, getUserTier, refreshUsageCountStats, refreshExtendedStats, checkPermission, unifiedStore]); // 🔧 FIX: 避免循环依赖

  // 🔧 FIX: 在用户套餐类型变化时更新初始统计
  useEffect(() => {
    if (userTier) {
      const newLimit = getTierDefaultLimit(userTier);
      const newRemaining = newLimit === -1 ? -1 : newLimit;
      
      // 如果套餐类型发生变化，更新初始统计值
      setUsageCountStats(prev => {
        if (prev.availableUses !== newLimit) {
          // console.log(`🔄 套餐type变化: ${prev.availableUses} → ${newLimit} (${userTier})`);
          return {
            ...prev,
            availableUses: newLimit,
            remainingUses: newRemaining === -1 ? -1 : Math.max(0, newLimit - prev.usedCount),
            usagePercentage: calculateUsagePercentage(prev.usedCount, newLimit, userTier)
          };
        }
        return prev;
      });
    }
  }, [getUserTier]); // 🔧 FIX: 避免循环依赖
  
  // 🔧 FIX: 初始化统一数据管理器并防抖刷新
  useEffect(() => {
    if (!user?.id) return;

    // 初始化统一数据管理器
    const initializeDataManager = async () => {
      try {
        await unifiedUsageDataManager.initializeUser(user.id);
        logger.info('✅ 统一数据管理器初始化完成', { userId: user.id });
      } catch (error) {
        logger.error('❌ 统一数据管理器初始化失败', { userId: user.id, error });
      }
    };

    // 防抖延迟500ms
    const timeoutId = setTimeout(async () => {
      await initializeDataManager();
      refreshStats();
    }, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user?.id, getUserTier]); // 🔧 FIX: 使用getUserTier函数引用而不是userTier值，避免循环依赖

  // 🔧 FIX: 监听使用统计更新事件，实时刷新UI显示
  // 🔧 CRITICAL FIX: 添加防抖机制，避免快速连续更新导致闪烁
  useEffect(() => {
    if (!user?.id) return;

    let debounceTimer: NodeJS.Timeout | null = null;

    const handleUsageStatsUpdate = (event: CustomEvent) => {
      const { userId, stats } = event.detail;

      // 只处理当前用户的更新事件
      if (userId === user.id && stats) {
        // 🔧 FIX: 防抖处理，避免快速连续更新
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          logger.info('📢 收到使用统计更新事件，刷新UI', { userId, stats });
          setUsageCountStats(stats);
          setLastUpdated(new Date().toISOString());
          debounceTimer = null;
        }, 50); // 50ms防抖延迟
      }
    };

    // 监听自定义事件
    window.addEventListener('usageStatsUpdated', handleUsageStatsUpdate as EventListener);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      window.removeEventListener('usageStatsUpdated', handleUsageStatsUpdate as EventListener);
    };
  }, [user?.id]);

  const returnValue = {
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
  
  // console.log('🔍 [useUnifiedUsageStats] 返回data:', {
  //   externalUserTier,
  //   computedUserTier: userTier,
  //   tokenStats: tokenStats ? {
  //     monthlyUsed: tokenStats.monthlyUsed,
  //     monthlyLimit: tokenStats.monthlyLimit,
  //     monthlyRemaining: tokenStats.monthlyRemaining
  //   } : null,
  //   usageCountStats: {
  //     usedCount: usageCountStats.usedCount,
  //     availableUses: usageCountStats.availableUses,
  //     remainingUses: usageCountStats.remainingUses
  //   },
  //   loading,
  //   error
  // });
  
  return returnValue;
}

export default useUnifiedUsageStats;
