/**
 * 🔢 使用次数显示工具
 * 统一处理使用次数的显示格式，特别是无限制的情况
 */

export type SubscriptionTier = 'free' | 'trial' | 'pro' | 'premium';

/**
 * 格式化剩余次数显示
 * @param remainingUses 剩余次数 (-1表示无限制)
 * @param tier 订阅级别
 * @returns 格式化后的显示文本
 */
export function formatRemainingUses(remainingUses: number, tier?: SubscriptionTier): string {
  // 高级版或无限制情况
  if (remainingUses === -1 || (tier === 'premium' && remainingUses <= 0)) {
    return '∞';
  }

  // 普通情况，确保不显示负数
  return Math.max(0, remainingUses).toString();
}

/**
 * 格式化可用次数显示
 * @param availableUses 可用总次数 (-1表示无限制)
 * @param tier 订阅级别
 * @returns 格式化后的显示文本
 */
export function formatAvailableUses(availableUses: number, tier?: SubscriptionTier): string {
  // 高级版或无限制情况
  if (availableUses === -1 || tier === 'premium') {
    return '无限制';
  }

  return availableUses.toString();
}

/**
 * 格式化使用量显示文本
 * @param usedCount 已使用次数
 * @param availableUses 可用总次数 (-1表示无限制)
 * @param tier 订阅级别
 * @returns 格式化后的显示文本，如 "5 / ∞" 或 "5 / 10"
 */
export function formatUsageDisplay(usedCount: number, availableUses: number, tier?: SubscriptionTier): string {
  const usedText = Math.max(0, usedCount).toString();
  const availableText = formatAvailableUses(availableUses, tier);

  return `${usedText} / ${availableText}`;
}

/**
 * 计算使用百分比
 * @param usedCount 已使用次数
 * @param availableUses 可用总次数 (-1表示无限制)
 * @param tier 订阅级别
 * @returns 使用百分比 (0-100)，无限制情况返回0
 */
export function calculateUsagePercentage(usedCount: number, availableUses: number, tier?: SubscriptionTier): number {
  // 高级版或无限制情况
  if (availableUses === -1 || tier === 'premium') {
    return 0; // 无限制时不显示进度条
  }

  if (availableUses <= 0) {
    return 100;
  }

  return Math.min(100, Math.max(0, (usedCount / availableUses) * 100));
}

/**
 * 检查是否应该显示进度条
 * @param availableUses 可用总次数 (-1表示无限制)
 * @param tier 订阅级别
 * @returns 是否显示进度条
 */
export function shouldShowProgressBar(availableUses: number, tier?: SubscriptionTier): boolean {
  return !(availableUses === -1 || tier === 'premium');
}

/**
 * 获取使用状态的颜色类
 * @param usedCount 已使用次数
 * @param availableUses 可用总次数 (-1表示无限制)
 * @param tier 订阅级别
 * @returns CSS颜色类名
 */
export function getUsageStatusColor(usedCount: number, availableUses: number, tier?: SubscriptionTier): string {
  // 高级版或无限制情况
  if (availableUses === -1 || tier === 'premium') {
    return 'text-purple-600'; // 高级版特殊颜色
  }

  const percentage = calculateUsagePercentage(usedCount, availableUses, tier);

  if (percentage >= 90) {
    return 'text-destructive'; // 即将用完
  } else if (percentage >= 70) {
    return 'text-warning'; // 使用较多
  } else {
    return 'text-success'; // 使用正常
  }
}

/**
 * 获取使用状态的进度条颜色
 * @param usedCount 已使用次数
 * @param availableUses 可用总次数 (-1表示无限制)
 * @param tier 订阅级别
 * @returns 进度条颜色类名
 */
export function getProgressBarColor(usedCount: number, availableUses: number, tier?: SubscriptionTier): string {
  // 高级版或无限制情况
  if (availableUses === -1 || tier === 'premium') {
    return 'bg-purple-500'; // 高级版特殊颜色
  }

  const percentage = calculateUsagePercentage(usedCount, availableUses, tier);

  if (percentage >= 90) {
    return 'bg-destructive';
  } else if (percentage >= 70) {
    return 'bg-warning';
  } else {
    return 'bg-success';
  }
}

/**
 * 获取套餐对应的默认限额
 * @param tier 订阅级别
 * @returns 默认使用限额
 * 🔧 FIX: 与subscriptionPlans.ts中的adaptUsageLimit保持一致
 * 使用静态配置避免循环依赖问题
 */
export function getTierDefaultLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case 'free':
      return 10;
    case 'trial':
      return 10;
    case 'pro':
      return 30;
    case 'premium':
      return -1; // 无限制
    default:
      return 10;
  }
}

/**
 * 格式化套餐名称
 * @param tier 订阅级别
 * @returns 中文套餐名称
 */
export function formatTierName(tier: SubscriptionTier): string {
  // 统一显示：免费版 ≡ 体验版
  if (tier === 'free') {
    return '体验版';
  }

  switch (tier) {
  /*
    case 'free':
      return '?';
  */
    case 'trial':
      return '体验版';
    case 'pro':
      return '专业版';
    case 'premium':
      return '高级版';
    default:
      return '未知版本';
  }
}

/**
 * 检查是否需要升级提示
 * @param usedCount 已使用次数
 * @param availableUses 可用总次数 (-1表示无限制)
 * @param tier 订阅级别
 * @returns 是否需要升级提示
 */
export function shouldShowUpgradePrompt(usedCount: number, availableUses: number, tier?: SubscriptionTier): boolean {
  // 高级版或无限制情况不需要升级提示
  if (availableUses === -1 || tier === 'premium') {
    return false;
  }

  const percentage = calculateUsagePercentage(usedCount, availableUses, tier);
  return percentage >= 80; // 使用量达到80%时提示升级
}

export default {
  formatRemainingUses,
  formatAvailableUses,
  formatUsageDisplay,
  calculateUsagePercentage,
  shouldShowProgressBar,
  getUsageStatusColor,
  getProgressBarColor,
  getTierDefaultLimit,
  formatTierName,
  shouldShowUpgradePrompt
};