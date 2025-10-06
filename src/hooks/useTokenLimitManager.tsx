/**
 * Token限额管理器Hook
 * @description 在React组件中使用Token限额管理器
 */

import { useEffect, useState, useCallback } from 'react';
import { tokenLimitManager } from '@/services/TokenLimitManager';
import { TokenLimitDialog } from '@/components/dialogs/TokenLimitDialog';
import type { TokenUsageStats } from '@/services/tokenUsageService';
import type { SubscriptionTier } from '@/types/subscription';
import { logger } from '@/utils/logger';

/**
 * Token限额管理器Hook
 */
export function useTokenLimitManager(userId?: string, userTier?: SubscriptionTier) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStats, setDialogStats] = useState<TokenUsageStats | null>(null);
  const [dialogType, setDialogType] = useState<'warning' | 'exceeded' | 'approaching'>('warning');

  /**
   * 显示Token限额对话框
   */
  const showTokenLimitDialog = useCallback(
    (
      stats: TokenUsageStats,
      limitType: 'warning' | 'exceeded' | 'approaching',
      onUpgrade?: () => void,
      onContinue?: () => void
    ) => {
      setDialogStats(stats);
      setDialogType(limitType);
      setDialogOpen(true);
    },
    []
  );

  /**
   * 关闭对话框
   */
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  /**
   * 升级回调
   */
  const handleUpgrade = useCallback(() => {
    window.location.href = '/payment';
  }, []);

  /**
   * 继续使用回调
   */
  const handleContinue = useCallback(() => {
    logger.info('用户选择继续使用');
    closeDialog();
  }, [closeDialog]);

  /**
   * 初始化Token限额管理器
   */
  useEffect(() => {
    tokenLimitManager.initialize(showTokenLimitDialog);

    // 如果有用户信息，在页面加载时检查Token限额
    if (userId && userTier) {
      tokenLimitManager.checkTokenLimitOnLoad(userId, userTier);
    }

    return () => {
      // 组件卸载时不需要清理，因为是全局单例
    };
  }, [userId, userTier, showTokenLimitDialog]);

  /**
   * 渲染Token限额对话框
   */
  const TokenLimitDialogComponent = useCallback(() => {
    if (!dialogStats) return null;

    return (
      <TokenLimitDialog
        open={dialogOpen}
        onClose={closeDialog}
        stats={dialogStats}
        limitType={dialogType}
        onUpgrade={handleUpgrade}
        onContinue={dialogType !== 'exceeded' ? handleContinue : undefined}
      />
    );
  }, [dialogOpen, dialogStats, dialogType, closeDialog, handleUpgrade, handleContinue]);

  return {
    TokenLimitDialogComponent
  };
}

