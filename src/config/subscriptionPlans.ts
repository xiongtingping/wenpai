import { SubscriptionPlan } from '@/types/subscription';

/**
 * 订阅计划配置
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: '体验版',
    tier: 'trial',
    description: '免费体验基础功能',
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
      availableFeatures: ['我的资料库', '基础模型', '全网雷达']
    },
    features: [
      'AI内容适配器（10次/月）',
      '全网雷达',
      '我的资料库',
      'Token额度：10万/月',
      '基础模型'
    ]
  },
  {
    id: 'pro',
    name: '专业版',
    tier: 'pro',
    description: '适合个人创作者和中小企业',
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
      availableFeatures: ['创意魔方', '我的资料库', '高级模型', '全网雷达']
    },
    recommended: true,
    features: [
      'AI内容适配器（30次/月）',
      '创意魔方',
      '全网雷达',
      '我的资料库',
      '品牌库',
      'Token额度：20万/月',
      '高级模型'
    ]
  },
  {
    id: 'premium',
    name: '高级版',
    tier: 'premium',
    description: '适合专业团队和企业用户',
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
      availableFeatures: ['创意魔方', '我的资料库', '品牌库', '高级模型及最新模型', '全网雷达']
    },
    features: [
      'AI内容适配器（不限次数）',
      '创意魔方',
      '全网雷达',
      '我的资料库',
      '品牌库',
      'Token额度：50万/月',
      '高级及最新模型'
    ]
  }
];

/**
 * 获取订阅计划
 * @param tier 计划类型
 * @returns 订阅计划
 */
export function getSubscriptionPlan(tier: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.tier === tier);
}

/**
 * 获取所有订阅计划
 * @returns 所有订阅计划
 */
export function getAllSubscriptionPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS;
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