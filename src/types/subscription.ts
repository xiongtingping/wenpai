/**
 * 订阅计划类型
 */
export type SubscriptionTier = 'free' | 'trial' | 'pro' | 'premium';

/**
 * 订阅周期类型
 */
export type SubscriptionPeriod = 'monthly' | 'yearly';

/**
 * 功能限制接口
 */
export interface FeatureLimits {
  /** AI内容适配使用次数 */
  adaptUsageLimit: number;
  /** Token使用限制 */
  tokenLimit: number;
  /** 可用模型列表 */
  availableModels: string[];
  /** 可用功能列表 */
  availableFeatures: string[];
}

/**
 * 价格信息接口
 */
export interface PricingInfo {
  /** 原价 */
  originalPrice: number;
  /** 特惠价 */
  discountPrice: number;
  /** 折扣百分比 */
  discountPercentage: number;
  /** 节省金额 */
  savedAmount: number;
}

/**
 * 订阅计划接口
 */
export interface SubscriptionPlan {
  /** 计划ID */
  id: string;
  /** 计划名称 */
  name: string;
  /** 计划类型 */
  tier: SubscriptionTier;
  /** 计划描述 */
  description: string;
  /** 月付价格信息 */
  monthly: PricingInfo;
  /** 年付价格信息 */
  yearly: PricingInfo;
  /** 功能限制 */
  limits: FeatureLimits;
  /** 是否推荐 */
  recommended?: boolean;
  /** 是否为高级版（用于显示特殊标签） */
  premiumLabel?: boolean;
  /** 特色标签 */
  features: string[];
}

/**
 * 用户订阅状态接口
 */
export interface UserSubscription {
  /** 当前订阅类型 */
  tier: SubscriptionTier;
  /** 订阅周期 */
  period: SubscriptionPeriod;
  /** 订阅开始时间 */
  startDate: Date;
  /** 订阅结束时间 */
  endDate: Date;
  /** 是否自动续费 */
  autoRenew: boolean;
  /** 注册时间（用于计算限时优惠） */
  registrationDate: Date;
}

/**
 * 使用统计接口
 */
export interface UsageStats {
  /** AI内容适配已使用次数 */
  adaptUsageUsed: number;
  /** Token已使用数量 */
  tokensUsed: number;
  /** Token剩余数量 */
  tokensRemaining: number;
  /** 本月总请求次数 */
  totalRequests: number;
  /** 最后使用时间 */
  lastUsedAt?: string;
}

/**
 * Token使用详情接口
 */
export interface TokenUsageDetail {
  /** 功能名称 */
  feature: string;
  /** 使用的Token数量 */
  tokensUsed: number;
  /** 请求次数 */
  requestCount: number;
  /** 使用百分比 */
  percentage: number;
  /** 最后使用时间 */
  lastUsedAt: string;
}

/**
 * 使用情况统计接口
 */
export interface UsageStats {
  /** AI内容适配已使用次数 */
  adaptUsageUsed: number;
  /** AI内容适配剩余次数 */
  adaptUsageRemaining: number;
  /** Token已使用量 */
  tokensUsed: number;
  /** Token剩余量 */
  tokensRemaining: number;
  /** 使用百分比 */
  usagePercentage: number;
}
