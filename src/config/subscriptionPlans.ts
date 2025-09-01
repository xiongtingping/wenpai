import { SubscriptionPlan } from '@/types/subscription';
import i18n from '@/i18n';

/**
 * 获取本地化的订阅计划配置
 */
export const getSubscriptionPlans = (): SubscriptionPlan[] => [
  {
    id: 'trial',
    name: i18n.t('payment.plans.trial.name'),
    tier: 'trial',
    description: i18n.t('payment.plans.trial.description'),
    monthly: {
      originalPrice: 0,
      discountPrice: 0,
      discountPercentage: 0,
      savedAmount: 0
    },
    yearly: {
      originalPrice: 0,
      discountPrice: 0,
      discountPercentage: 0,
      savedAmount: 0
    },
    limits: {
      adaptUsageLimit: 10,
      tokenLimit: 100000,
      availableModels: ['GPT-4o mini', 'DeepSeek v3'],
      availableFeatures: ['全网雷达', '我的资料库', '基础AI模型']
    },
    features: [
      `${i18n.t('payment.plans.features.aiContentAdapter')}（10${i18n.t('payment.plans.features.timesPerMonth')}）`,
      i18n.t('payment.plans.features.hotRadar'),
      i18n.t('payment.plans.features.myLibrary'),
      `${i18n.t('payment.plans.features.tokenQuota')}：10${i18n.t('payment.plans.features.thousandTokens')}${i18n.t('payment.plans.features.perMonth')}`,
      i18n.t('payment.plans.features.basicModels'),
      i18n.t('payment.plans.features.lightTheme')
    ]
  },
  {
    id: 'pro',
    name: i18n.t('payment.plans.pro.name'),
    tier: 'pro',
    description: i18n.t('payment.plans.pro.description'),
    monthly: {
      originalPrice: 39,
      discountPrice: 29,
      discountPercentage: 74,
      savedAmount: 10
    },
    yearly: {
      originalPrice: 388,
      discountPrice: 288,
      discountPercentage: 74,
      savedAmount: 100
    },
    limits: {
      adaptUsageLimit: 30,
      tokenLimit: 200000,
      availableModels: ['GPT-4o', 'GPT-4o mini', 'DeepSeek v3'],
      availableFeatures: ['全网雷达', '创意魔方', '我的资料库', '高级AI模型']
    },
    recommended: true,
    features: [
      `${i18n.t('payment.plans.features.aiContentAdapter')}（30${i18n.t('payment.plans.features.timesPerMonth')}）|up`,
      i18n.t('payment.plans.features.hotRadar'),
      `${i18n.t('payment.plans.features.creativeCube')}|new`,
      i18n.t('payment.plans.features.myLibrary'),
      `${i18n.t('payment.plans.features.tokenQuota')}：20${i18n.t('payment.plans.features.thousandTokens')}${i18n.t('payment.plans.features.perMonth')}|up`,
      `${i18n.t('payment.plans.features.advancedModels')}|up`,
      `${i18n.t('payment.plans.features.darkLightTheme')}|up`
    ]
  },
  {
    id: 'premium',
    name: i18n.t('payment.plans.premium.name'),
    tier: 'premium',
    description: i18n.t('payment.plans.premium.description'),
    premiumLabel: true, // 标识为高级版，用于显示特殊标签
    monthly: {
      originalPrice: 99,
      discountPrice: 79,
      discountPercentage: 80,
      savedAmount: 20
    },
    yearly: {
      originalPrice: 986,
      discountPrice: 788,
      discountPercentage: 80,
      savedAmount: 198
    },
    limits: {
      adaptUsageLimit: -1, // 不限量
      tokenLimit: 500000,
      availableModels: ['GPT-4o', 'GPT-4o mini', 'DeepSeek v3'],
      availableFeatures: ['全网雷达', '创意魔方', '我的资料库', '品牌库', '高级及最新AI模型']
    },
    features: [
      `${i18n.t('payment.plans.features.aiContentAdapter')}（${i18n.t('payment.plans.features.unlimited')}）|up`,
      i18n.t('payment.plans.features.hotRadar'),
      i18n.t('payment.plans.features.creativeCube'),
      i18n.t('payment.plans.features.myLibrary'),
      `${i18n.t('payment.plans.features.brandLibrary')}|new`,
      `${i18n.t('payment.plans.features.tokenQuota')}：50${i18n.t('payment.plans.features.thousandTokens')}${i18n.t('payment.plans.features.perMonth')}|up`,
      `${i18n.t('payment.plans.features.advancedLatestModels')}|up`,
      `${i18n.t('payment.plans.features.allThemes')}|up`
    ]
  }
];

// 保持向后兼容的导出
export const SUBSCRIPTION_PLANS = getSubscriptionPlans();

/**
 * 获取订阅计划
 * @param tier 计划类型
 * @returns 订阅计划
 */
export function getSubscriptionPlan(tier: string): SubscriptionPlan {
  const plans = getSubscriptionPlans();
  return plans.find(plan => plan.tier === tier) || plans[0];
}

/**
 * 获取所有订阅计划
 * @returns 所有订阅计划
 */
export function getAllSubscriptionPlans(): SubscriptionPlan[] {
  return getSubscriptionPlans();
}

/**
 * 计算限时优惠倒计时
 * @param registrationDate 注册时间
 * @returns 剩余秒数
 */
export function calculateDiscountCountdown(registrationDate: Date): number {
  const now = new Date();
  const discountEndTime = new Date(registrationDate.getTime() + 30 * 60 * 1000); // 30分钟
  const remaining = Math.max(0, Math.floor((discountEndTime.getTime() - now.getTime()) / 1000));
  return remaining;
}

/**
 * 检查是否在限时优惠期内
 * @param registrationDate 注册时间
 * @returns 是否在优惠期内
 */
export function isInDiscountPeriod(registrationDate: Date): boolean {
  return calculateDiscountCountdown(registrationDate) > 0;
} 