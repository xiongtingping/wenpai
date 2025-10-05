/**
 * Token限额检查Hook
 * @description 提供Token限额检查和提醒功能的React Hook
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTokenUsageState } from '@/stores/unified-state-store';
import { checkUserTokenLimit } from '@/services/aiWithTokenTracking';
import type { SubscriptionTier } from '@/types/subscription';
import type { TokenUsageStats } from '@/services/tokenUsageService';

/**
 * Token限额检查结果
 */
export interface TokenLimitCheckResult {
  /** 是否允许继续使用 */
  allowed: boolean;
  /** 限制类型 */
  limitType?: 'warning' | 'approaching' | 'exceeded';
  /** 用户统计信息 */
  stats?: TokenUsageStats;
  /** 拒绝原因 */
  reason?: string;
  /** 建议操作 */
  suggestedAction?: 'upgrade' | 'wait' | 'reduce_usage';
}

/**
 * Token限额检查Hook
 */
export function useTokenLimitCheck() {
  const { user } = useAuth();
  const tokenUsageState = useTokenUsageState();
  const [isChecking, setIsChecking] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitCheckResult, setLimitCheckResult] = useState<TokenLimitCheckResult | null>(null);

  /**
   * 获取用户套餐类型
   */
  const getUserTier = useCallback((): SubscriptionTier => {
    // 从用户信息或本地存储获取套餐类型
    return (user?.subscription as any)?.tier || 'trial';
  }, [user]);

  /**
   * 检查Token限额
   */
  const checkTokenLimit = useCallback(async (
    estimatedTokens: number = 1000,
    showDialog: boolean = true
  ): Promise<TokenLimitCheckResult> => {
    if (!user?.id) {
      return { allowed: true }; // 未登录用户不限制
    }

    setIsChecking(true);

    try {
      const result = await checkUserTokenLimit(estimatedTokens);
      
      let limitType: 'warning' | 'approaching' | 'exceeded' | undefined;
      let allowed = result.allowed;
      
      // 根据使用百分比确定限制类型
      const usagePercentage = result.stats.usagePercentage;
      const projectedUsage = result.stats.monthlyUsed + estimatedTokens;
      const projectedPercentage = (projectedUsage / result.stats.monthlyLimit) * 100;
      
      if (projectedPercentage >= 100) {
        limitType = 'exceeded';
        allowed = false;
      } else if (projectedPercentage >= 90) {
        limitType = 'approaching';
      } else if (projectedPercentage >= 80) {
        limitType = 'warning';
      }
      
      const checkResult: TokenLimitCheckResult = {
        allowed,
        limitType,
        stats: result.stats,
        reason: result.reason,
        suggestedAction: (result as any).suggestedAction
      };
      
      setLimitCheckResult(checkResult);
      
      // 如果需要显示对话框且有限制类型
      if (showDialog && limitType && (!allowed || limitType === 'approaching')) {
        setShowLimitDialog(true);
      }
      
      return checkResult;
      
    } catch (error) {
      console.error('Tokenlimitcheckingfailed:', error);
      
      // 检查失败时默认允许使用
      const fallbackResult: TokenLimitCheckResult = {
        allowed: true,
        reason: '检查失败，默认允许使用'
      };
      
      setLimitCheckResult(fallbackResult);
      return fallbackResult;
      
    } finally {
      setIsChecking(false);
    }
  }, [user?.id, getUserTier]);

  /**
   * 静默检查Token限额（不显示对话框）
   */
  const checkTokenLimitSilent = useCallback(async (
    estimatedTokens: number = 1000
  ): Promise<TokenLimitCheckResult> => {
    return await checkTokenLimit(estimatedTokens, false);
  }, [checkTokenLimit]);

  /**
   * 关闭限额对话框
   */
  const closeLimitDialog = useCallback(() => {
    setShowLimitDialog(false);
  }, []);

  /**
   * 处理升级操作
   */
  const handleUpgrade = useCallback(() => {
    setShowLimitDialog(false);
    // 跳转到升级页面
    window.location.href = '/payment';
  }, []);

  /**
   * 处理继续使用操作
   */
  const handleContinue = useCallback(() => {
    setShowLimitDialog(false);
    // 可以在这里添加额外的逻辑，比如记录用户选择继续使用
  }, []);

  /**
   * 获取当前使用状态的简要信息
   */
  const getUsageStatus = useCallback(() => {
    if (!tokenUsageState.currentStats) {
      return {
        status: 'unknown',
        message: 'u64cdu4f5cu5931u8d25',
        percentage: 0
      };
    }

    const percentage = tokenUsageState.currentStats.usagePercentage;
    
    if (percentage >= 100) {
      return {
        status: 'exceeded',
        message: 'Token额度已用完',
        percentage
      };
    } else if (percentage >= 90) {
      return {
        status: 'approaching',
        message: 'Token额度即将用完',
        percentage
      };
    } else if (percentage >= 80) {
      return {
        status: 'warning',
        message: 'Token使用量较高',
        percentage
      };
    } else if (percentage >= 50) {
      return {
        status: 'normal',
        message: 'Token使用正常',
        percentage
      };
    } else {
      return {
        status: 'low',
        message: 'Token使用量较低',
        percentage
      };
    }
  }, [tokenUsageState.currentStats]);

  /**
   * 预估Token使用量
   */
  const estimateTokenUsage = useCallback((text: string): number => {
    // 简单估算：中文字符按1.5个token计算，英文单词按1个token计算
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const otherChars = text.length - chineseChars - englishWords;
    
    return Math.ceil(chineseChars * 1.5 + englishWords + otherChars * 0.5);
  }, []);

  return {
    // 状态
    isChecking,
    showLimitDialog,
    limitCheckResult,
    currentStats: tokenUsageState.currentStats,

    // 方法
    checkTokenLimit,
    checkTokenLimitSilent,
    closeLimitDialog,
    handleUpgrade,
    handleContinue,
    getUsageStatus,
    estimateTokenUsage,

    // 计算属性
    userTier: getUserTier(),
    usageStatus: getUsageStatus()
  };
}

export default useTokenLimitCheck;
