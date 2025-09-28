import { SubscriptionPlan } from '@/types/subscription';

/**
 * 获取本地化的订阅计划配置
 * 注意：这个函数需要在组件中使用useI18n hook来获取正确的翻译
 */
export const getSubscriptionPlans = (t?: (key: string) => string): SubscriptionPlan[] => [
  {
    id: 'trial',
    name: t ? t('payment.plans.trial.name') : '体验版',
    tier: 'trial',
    description: t ? t('payment.plans.trial.description') : '免费使用，有使用次数限制',
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
      availableModels: ['Google Gemini 2.5 Flash Lite', 'Meta Llama 4 Scout', 'OpenAI GPT-4o Mini', 'Alibaba Qwen Turbo'],
      availableFeatures: ['全网雷达', '我的资料库', '基础AI模型']
    },
    features: [
      t ? `${t('payment.plans.features.aiContentAdapter')}（10${t('payment.plans.features.timesPerMonth')}）` : 'AI内容适配（10次/月）',
      t ? t('payment.plans.features.hotRadar') : '全网雷达',
      t ? t('payment.plans.features.myLibrary') : '我的资料库',
      t ? `${t('payment.plans.features.tokenQuota')}：10${t('payment.plans.features.thousandTokens')}${t('payment.plans.features.perMonth')}` : 'Token配额：10万/月',
      t ? t('payment.plans.features.basicModels') : '基础AI模型',
      t ? t('payment.plans.features.lightTheme') : '浅色主题'
    ]
  },
  {
    id: 'pro',
    name: t ? t('payment.plans.pro.name') : '专业版',
    tier: 'pro',
    description: t ? t('payment.plans.pro.description') : '适合个人创作者和专业用户',
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
      availableModels: ['体验版全部模型', 'DeepSeek Chat系列', 'OpenAI GPT-5 Mini', 'Google Gemini 2.5 Flash', 'Alibaba Qwen Plus'],
      availableFeatures: ['全网雷达', '创意魔方', '我的资料库', '专业AI模型']
    },
    recommended: true,
    features: [
      t ? `${t('payment.plans.features.aiContentAdapter')}（30${t('payment.plans.features.timesPerMonth')}）|up` : 'AI内容适配（30次/月）|up',
      t ? t('payment.plans.features.hotRadar') : '全网雷达',
      t ? `${t('payment.plans.features.creativeCube')}|new` : '创意魔方|new',
      t ? t('payment.plans.features.myLibrary') : '我的资料库',
      t ? `${t('payment.plans.features.tokenQuota')}：20${t('payment.plans.features.thousandTokens')}${t('payment.plans.features.perMonth')}|up` : 'Token配额：20万/月|up',
      t ? `${t('payment.plans.features.advancedModels')}|up` : '高级AI模型|up',
      t ? `${t('payment.plans.features.darkLightTheme')}|up` : '深色/浅色主题|up'
    ]
  },
  {
    id: 'premium',
    name: t ? t('payment.plans.premium.name') : '高级版',
    tier: 'premium',
    description: t ? t('payment.plans.premium.description') : '适合团队和企业用户',
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
      adaptUsageLimit: -1, // 使用次数无限制
      tokenLimit: 500000, // 🔧 FIX: Premium用户token有限制(50万/月)，使用次数无限制
      availableModels: ['专业版全部模型', 'OpenAI GPT-5 Chat Latest', 'Anthropic Claude Sonnet 4', 'Google Gemini 2.5 Pro', 'Alibaba Qwen Max'],
      availableFeatures: ['全网雷达', '创意魔方', '我的资料库', '品牌库', '顶级AI模型']
    },
    features: [
      t ? `${t('payment.plans.features.aiContentAdapter')}（${t('payment.plans.features.unlimited')}）|up` : 'AI内容适配（无限制）|up',
      t ? t('payment.plans.features.hotRadar') : '全网雷达',
      t ? t('payment.plans.features.creativeCube') : '创意魔方',
      t ? t('payment.plans.features.myLibrary') : '我的资料库',
      t ? `${t('payment.plans.features.brandLibrary')}|new` : '品牌库|new',
      t ? `${t('payment.plans.features.tokenQuota')}：50${t('payment.plans.features.thousandTokens')}${t('payment.plans.features.perMonth')}|up` : 'Token配额：50万/月|up',
      t ? `${t('payment.plans.features.advancedLatestModels')}|up` : '高级&最新模型|up',
      t ? `${t('payment.plans.features.allThemes')}|up` : '全部主题|up'
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
