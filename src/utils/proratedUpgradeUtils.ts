/**
 * 补差价升级计算工具
 * @description 计算订阅升级的补差价金额
 */

export interface ProratedUpgradeCalculation {
  /** 是否支持升级 */
  canUpgrade: boolean;
  /** 补差价金额 */
  upgradeAmount: number;
  /** 剩余天数 */
  daysRemaining: number;
  /** 当前订阅价格 */
  currentPrice: number;
  /** 目标订阅价格 */
  targetPrice: number;
  /** 剩余价值 */
  remainingValue: number;
  /** 升级后到期时间（保持不变） */
  expiresAt: string;
  /** 计算详情 */
  calculation: {
    totalDays: number;
    usedDays: number;
    remainingDays: number;
    priceDifference: number;
    dailyRateTarget: number;
  };
}

/**
 * 订阅计划原价映射（不含优惠）
 * 🔧 FIX: 支持both pro和professional标识，确保数据一致性
 */
const PLAN_PRICES = {
  pro: {
    monthly: 39,  // 原价
    yearly: 388   // 原价
  },
  professional: {
    monthly: 39,  // 原价（与pro相同）
    yearly: 388   // 原价（与pro相同）
  },
  premium: {
    monthly: 99,  // 原价
    yearly: 986   // 原价
  }
} as const;

/**
 * 计算补差价升级
 */
export function calculateProratedUpgrade(
  currentSubscription: {
    subscription_type: 'pro' | 'professional' | 'premium';
    expires_at: string;
    started_at: string;
    order_id: string;
  },
  targetTier: 'pro' | 'professional' | 'premium',
  targetPeriod: 'monthly' | 'yearly'
): ProratedUpgradeCalculation {
  const now = new Date();
  const expiresAt = new Date(currentSubscription.expires_at);
  const startedAt = new Date(currentSubscription.started_at);

  // 计算订阅周期（通过开始和结束时间推断）
  const totalDuration = expiresAt.getTime() - startedAt.getTime();
  const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
  
  // 推断当前订阅周期类型
  const currentPeriod = totalDays > 200 ? 'yearly' : 'monthly';

  // 计算剩余天数
  const remainingTime = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
  const usedDays = totalDays - daysRemaining;

  // 获取价格
  const currentPrice = PLAN_PRICES[currentSubscription.subscription_type][currentPeriod];
  const targetPrice = PLAN_PRICES[targetTier][targetPeriod];

  // 检查是否支持升级
  const canUpgrade = targetTier !== currentSubscription.subscription_type && 
                    daysRemaining > 0 &&
                    getPlanLevel(targetTier) > getPlanLevel(currentSubscription.subscription_type);

  if (!canUpgrade) {
    return {
      canUpgrade: false,
      upgradeAmount: 0,
      daysRemaining,
      currentPrice,
      targetPrice,
      remainingValue: 0,
      expiresAt: currentSubscription.expires_at,
      calculation: {
        totalDays,
        usedDays,
        remainingDays: daysRemaining,
        priceDifference: 0,
        dailyRateTarget: 0
      }
    };
  }

  // 补差价计算公式
  // 如果目标周期与当前周期相同，使用原公式
  if (targetPeriod === currentPeriod) {
    const priceDifference = targetPrice - currentPrice;
    const upgradeAmount = Math.round((priceDifference * daysRemaining / totalDays) * 100) / 100;

    return {
      canUpgrade: true,
      upgradeAmount: Math.max(0.01, upgradeAmount), // 最低0.01元
      daysRemaining,
      currentPrice,
      targetPrice,
      remainingValue: Math.round((currentPrice * daysRemaining / totalDays) * 100) / 100,
      expiresAt: currentSubscription.expires_at,
      calculation: {
        totalDays,
        usedDays,
        remainingDays: daysRemaining,
        priceDifference,
        dailyRateTarget: targetPrice / totalDays
      }
    };
  }

  // 🔧 FIX: 跨周期升级：使用正确的周期长度计算每日单价
  const currentDailyRate = currentPrice / totalDays;
  // 目标每日单价应该基于目标周期的标准长度，而不是固定30天
  const targetCycleDays = targetPeriod === 'yearly' ? 365 : 30;
  const targetDailyRate = targetPrice / targetCycleDays;
  
  // 剩余价值（按当前每日单价）
  const remainingValue = currentDailyRate * daysRemaining;
  
  // 升级费用（按目标每日单价计算剩余天数，减去剩余价值）
  const targetCostForRemainingDays = targetDailyRate * daysRemaining;
  const upgradeAmount = Math.round((targetCostForRemainingDays - remainingValue) * 100) / 100;

  return {
    canUpgrade: true,
    upgradeAmount: Math.max(0.01, upgradeAmount),
    daysRemaining,
    currentPrice,
    targetPrice,
    remainingValue: Math.round(remainingValue * 100) / 100,
    expiresAt: currentSubscription.expires_at,
    calculation: {
      totalDays,
      usedDays,
      remainingDays: daysRemaining,
      priceDifference: targetPrice - currentPrice,
      dailyRateTarget: targetDailyRate
    }
  };
}

/**
 * 获取计划等级（用于比较）
 */
function getPlanLevel(tier: string): number {
  switch (tier) {
    case 'trial':
      return 0;
    case 'professional':
      return 1;
    case 'premium':
      return 2;
    default:
      return -1;
  }
}

/**
 * 格式化升级提示文案
 */
export function formatUpgradeMessage(calculation: ProratedUpgradeCalculation): string {
  if (!calculation.canUpgrade) {
    return '';
  }

  const { upgradeAmount, daysRemaining } = calculation;
  
  return `您的套餐支持补差价升级：本周期只需支付 ¥${upgradeAmount}，即可解锁高级版功能，到期时间保持不变（剩余${daysRemaining}天）。`;
}

/**
 * 验证升级计算结果
 */
export function validateUpgradeCalculation(calculation: ProratedUpgradeCalculation): boolean {
  return calculation.canUpgrade && 
         calculation.upgradeAmount > 0 && 
         calculation.daysRemaining > 0;
}