/**
 * Token限额管理器
 * @description 全局监听Token限额事件，自动显示用户友好的提示
 */

import { logger } from '@/utils/logger';
import type { TokenUsageStats } from './tokenUsageService';
import type { TokenWarningLevel } from './tokenUsageService';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * Token限额事件详情
 */
export interface TokenLimitEventDetail {
  userId: string;
  userTier: SubscriptionTier;
  stats: TokenUsageStats;
  warningLevel: TokenWarningLevel;
  reason?: string;
  suggestedAction?: 'upgrade' | 'wait' | 'reduce_usage';
}

/**
 * Token限额对话框显示函数类型
 */
type ShowTokenLimitDialogFn = (
  stats: TokenUsageStats,
  limitType: 'warning' | 'exceeded' | 'approaching',
  onUpgrade?: () => void,
  onContinue?: () => void
) => void;

/**
 * Token限额管理器类
 */
class TokenLimitManager {
  private showDialogFn: ShowTokenLimitDialogFn | null = null;
  private lastWarningTime: Record<TokenWarningLevel, number> = {
    safe: 0,
    warning: 0,
    approaching: 0,
    exceeded: 0
  };
  private warningCooldown = 5 * 60 * 1000; // 5分钟冷却时间，避免频繁提示
  // 避免对话框/Toast在短时间内重复触发导致闪烁
  private lastDialogAt: number = 0;
  private lastDialogType: 'warning' | 'exceeded' | 'approaching' | null = null;
  private dialogCooldown: number = 15_000; // 15s 内同类型仅显示一次


  /**
   * 初始化Token限额管理器
   */
  initialize(showDialogFn: ShowTokenLimitDialogFn): void {
    this.showDialogFn = showDialogFn;

    // 监听Token限额超限事件
    window.addEventListener('tokenLimitExceeded', this.handleTokenLimitExceeded.bind(this));

    // 监听Token限额警告事件
    window.addEventListener('tokenLimitWarning', this.handleTokenLimitWarning.bind(this));

    logger.info('✅ Token限额管理器已初始化');
  }

  /**
   * 处理Token限额超限事件
   */
  private handleTokenLimitExceeded(event: Event): void {
    const customEvent = event as CustomEvent<TokenLimitEventDetail>;
    const { stats, warningLevel, reason } = customEvent.detail;

    logger.error('🚫 Token限额超限事件触发', {
      warningLevel,
      monthlyUsed: stats.monthlyUsed,
      monthlyLimit: stats.monthlyLimit,
      usagePercentage: stats.usagePercentage
    });

    // 显示错误对话框（带防抖，避免闪烁）
    const now = Date.now();
    if (this.showDialogFn && (now - this.lastDialogAt > this.dialogCooldown || this.lastDialogType !== 'exceeded')) {
      this.showDialogFn(
        stats,
        'exceeded',
        () => {
          // 升级回调
          window.location.href = '/payment';
        }
      );
      this.lastDialogAt = now;
      this.lastDialogType = 'exceeded';
    }


  }

  /**
   * 处理Token限额警告事件
   */
  private handleTokenLimitWarning(event: Event): void {
    const customEvent = event as CustomEvent<TokenLimitEventDetail>;
    const { stats, warningLevel, reason } = customEvent.detail;

    // 检查冷却时间，避免频繁提示
    const now = Date.now();
    if (now - this.lastWarningTime[warningLevel] < this.warningCooldown) {
      logger.debug('⏳ Token警告在冷却期内，跳过提示', { warningLevel });
      return;
    }

    this.lastWarningTime[warningLevel] = now;

    logger.warn(`⚠️ Token限额警告事件触发 [${warningLevel}]`, {
      warningLevel,
      monthlyUsed: stats.monthlyUsed,
      monthlyLimit: stats.monthlyLimit,
      usagePercentage: stats.usagePercentage
    });

    // 根据警告级别决定是否显示对话框
    if (warningLevel === 'approaching' && this.showDialogFn) {
      // 95%以上显示对话框（带防抖）
      const now = Date.now();
      if (now - this.lastDialogAt > this.dialogCooldown || this.lastDialogType !== 'approaching') {
        this.showDialogFn(
          stats,
          'approaching',
          () => {
            // 升级回调
            window.location.href = '/payment';
          },
          () => {
            // 继续使用回调
            logger.info('用户选择继续使用');
          }
        );
        this.lastDialogAt = now;
        this.lastDialogType = 'approaching';
      }
    } else if (warningLevel === 'warning') {
      // 80-95%只显示toast提示
      this.showToast(
        'Token使用量较高',
        reason || `Token使用量已达 ${stats.usagePercentage.toFixed(1)}%，建议关注剩余额度`,
        'warning'
      );
    }
  }

  /**
   * 显示Toast提示
   */
  private showToast(title: string, message: string, type: 'error' | 'warning' | 'info'): void {
    // 动态导入toast避免循环依赖
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title,
        description: message,
        variant: type === 'error' ? 'destructive' : 'default',
        duration: type === 'error' ? 10000 : 5000
      });
    }).catch(error => {
      logger.error('显示Toast失败', error);
    });
  }

  /**
   * 手动触发Token限额检查（用于页面加载时）
   */
  async checkTokenLimitOnLoad(userId: string, userTier: SubscriptionTier): Promise<void> {
    try {
      const { tokenUsageService } = await import('./tokenUsageService');
      const stats = await tokenUsageService.getUserTokenStats(userId, userTier);

      // 如果使用量超过80%，显示提示
      if (stats.usagePercentage >= 100) {
        const event = new CustomEvent('tokenLimitExceeded', {
          detail: {
            userId,
            userTier,
            stats,
            warningLevel: 'exceeded' as TokenWarningLevel,
            reason: `本月Token使用量已超过限额。当前已使用 ${stats.monthlyUsed.toLocaleString()}，限额 ${stats.monthlyLimit.toLocaleString()}`,
            suggestedAction: 'upgrade' as const
          }
        });
        window.dispatchEvent(event);
      } else if (stats.usagePercentage >= 95) {
        const event = new CustomEvent('tokenLimitWarning', {
          detail: {
            userId,
            userTier,
            stats,
            warningLevel: 'approaching' as TokenWarningLevel,
            reason: `Token使用量已达 ${stats.usagePercentage.toFixed(1)}%，即将用完`
          }
        });
        window.dispatchEvent(event);
      } else if (stats.usagePercentage >= 80) {
        const event = new CustomEvent('tokenLimitWarning', {
          detail: {
            userId,
            userTier,
            stats,
            warningLevel: 'warning' as TokenWarningLevel,
            reason: `Token使用量已达 ${stats.usagePercentage.toFixed(1)}%，建议关注剩余额度`
          }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      logger.error('页面加载时Token限额检查失败', error);
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    window.removeEventListener('tokenLimitExceeded', this.handleTokenLimitExceeded.bind(this));
    window.removeEventListener('tokenLimitWarning', this.handleTokenLimitWarning.bind(this));
    logger.info('🧹 Token限额管理器已清理');
  }
}

// 导出单例
export const tokenLimitManager = new TokenLimitManager();

