/**
 * 动态价格计算服务
 * @description 根据用户状态、优惠活动、升级类型等计算真实应付金额
 */

import { getSubscriptionPlans } from '@/config/subscriptionPlans';
import { isInPromoPeriod } from '@/utils/paymentTimer';
import { calculateProratedUpgrade } from '@/utils/proratedUpgradeUtils';
import type { SubscriptionTier, SubscriptionPeriod } from '@/types/subscription';

export interface PricingContext {
  /** 用户ID */
  userId: string;
  /** 操作类型 */
  action: 'new' | 'renew' | 'upgrade' | 'prorated_upgrade';
  /** 目标订阅等级 */
  targetTier: SubscriptionTier;
  /** 目标订阅周期 */
  targetPeriod: SubscriptionPeriod;
  /** 当前订阅信息（升级时需要） */
  currentSubscription?: {
    subscription_type: string;
    expires_at: string;
    started_at: string;
    id: string;
  };
  /** 是否允许手动金额 */
  allowManualAmount?: boolean;
}

export interface PricingResult {
  /** 最终应付金额 */
  finalAmount: number;
  /** 原价 */
  originalPrice: number;
  /** 优惠金额 */
  discountAmount: number;
  /** 价格类型 */
  priceType: 'original' | 'promo' | 'prorated' | 'manual';
  /** 价格说明 */
  priceDescription: string;
  /** 是否支持手动输入 */
  allowManualInput: boolean;
  /** 建议金额范围 */
  suggestedRange?: {
    min: number;
    max: number;
  };
  /** 详细计算过程 */
  calculation?: {
    basePrice: number;
    promoDiscount?: number;
    proratedDiscount?: number;
    remainingValue?: number;
    upgradeAmount?: number;
  };
}

export class DynamicPricingService {
  /**
   * 计算动态价格
   */
  static async calculatePrice(context: PricingContext): Promise<PricingResult> {
    const plans = getSubscriptionPlans();
    const targetPlan = plans.find(p => p.tier === context.targetTier);
    
    if (!targetPlan) {
      throw new Error(`找不到目标订阅计划: ${context.targetTier}`);
    }

    const pricing = context.targetPeriod === 'monthly' 
      ? targetPlan.monthly 
      : targetPlan.yearly;

    const originalPrice = pricing.originalPrice;

    // 根据操作类型计算价格
    switch (context.action) {
      case 'new':
        return this.calculateNewSubscriptionPrice(context, pricing, originalPrice);
        
      case 'renew':
        return this.calculateRenewalPrice(context, pricing, originalPrice);
        
      case 'upgrade':
        return this.calculateUpgradePrice(context, pricing, originalPrice);
        
      case 'prorated_upgrade':
        return this.calculateProratedUpgradePrice(context, pricing, originalPrice);
        
      default:
        throw new Error(`不支持的操作类型: ${context.action}`);
    }
  }

  /**
   * 计算新订阅价格
   */
  private static calculateNewSubscriptionPrice(
    context: PricingContext, 
    pricing: any, 
    originalPrice: number
  ): PricingResult {
    // 检查是否在限时优惠期
    const isInPromo = isInPromoPeriod(context.userId);
    const promoPrice = pricing.discountPrice;
    
    if (isInPromo && promoPrice && promoPrice < originalPrice) {
      return {
        finalAmount: promoPrice,
        originalPrice,
        discountAmount: originalPrice - promoPrice,
        priceType: 'promo',
        priceDescription: `限时优惠价 (原价¥${originalPrice})`,
        allowManualInput: false,
        calculation: {
          basePrice: originalPrice,
          promoDiscount: originalPrice - promoPrice
        }
      };
    }

    return {
      finalAmount: originalPrice,
      originalPrice,
      discountAmount: 0,
      priceType: 'original',
      priceDescription: '标准价格',
      allowManualInput: context.allowManualAmount || false,
      suggestedRange: {
        min: Math.round(originalPrice * 0.5), // 最低5折
        max: originalPrice
      },
      calculation: {
        basePrice: originalPrice
      }
    };
  }

  /**
   * 计算续费价格
   */
  private static calculateRenewalPrice(
    context: PricingContext, 
    pricing: any, 
    originalPrice: number
  ): PricingResult {
    // 续费按原价计算，但可能有续费优惠
    const hasRenewalDiscount = pricing.discountPrice && pricing.discountPrice < originalPrice;
    
    if (hasRenewalDiscount) {
      return {
        finalAmount: pricing.discountPrice,
        originalPrice,
        discountAmount: originalPrice - pricing.discountPrice,
        priceType: 'promo',
        priceDescription: `续费优惠价 (原价¥${originalPrice})`,
        allowManualInput: false,
        calculation: {
          basePrice: originalPrice,
          promoDiscount: originalPrice - pricing.discountPrice
        }
      };
    }

    return {
      finalAmount: originalPrice,
      originalPrice,
      discountAmount: 0,
      priceType: 'original',
      priceDescription: '续费标准价格',
      allowManualInput: context.allowManualAmount || false,
      suggestedRange: {
        min: Math.round(originalPrice * 0.7), // 续费最低7折
        max: originalPrice
      },
      calculation: {
        basePrice: originalPrice
      }
    };
  }

  /**
   * 计算普通升级价格
   */
  private static calculateUpgradePrice(
    context: PricingContext, 
    pricing: any, 
    originalPrice: number
  ): PricingResult {
    // 如果有当前订阅信息，计算补差价；否则按全价
    if (context.currentSubscription) {
      // 使用补差价计算工具
      const proratedCalc = calculateProratedUpgrade(
        { ...context.currentSubscription, order_id: context.currentSubscription?.id || '' } as any,
        context.targetTier as any,
        context.targetPeriod
      );

      if (proratedCalc.canUpgrade) {
        return {
          finalAmount: proratedCalc.upgradeAmount,
          originalPrice: proratedCalc.targetPrice,
          discountAmount: proratedCalc.remainingValue,
          priceType: 'prorated',
          priceDescription: `升级补差价 (节省¥${proratedCalc.remainingValue.toFixed(2)})`,
          allowManualInput: context.allowManualAmount || false,
          calculation: {
            basePrice: proratedCalc.targetPrice,
            proratedDiscount: proratedCalc.remainingValue,
            remainingValue: proratedCalc.remainingValue,
            upgradeAmount: proratedCalc.upgradeAmount
          }
        };
      }
    }

    // 没有当前订阅或不支持补差价，按全价计算
    return {
      finalAmount: originalPrice,
      originalPrice,
      discountAmount: 0,
      priceType: 'original',
      priceDescription: `升级到${context.targetTier}版全价`,
      allowManualInput: context.allowManualAmount || false,
      suggestedRange: {
        min: Math.round(originalPrice * 0.8), // 升级最低8折
        max: originalPrice
      },
      calculation: {
        basePrice: originalPrice
      }
    };
  }

  /**
   * 计算补差价升级价格
   */
  private static calculateProratedUpgradePrice(
    context: PricingContext, 
    pricing: any, 
    originalPrice: number
  ): PricingResult {
    if (!context.currentSubscription) {
      throw new Error('补差价升级需要当前订阅信息');
    }

    // 使用补差价计算工具
    const proratedCalc = calculateProratedUpgrade(
      { ...context.currentSubscription, order_id: context.currentSubscription?.id || '' } as any,
      context.targetTier as any,
      context.targetPeriod
    );

    if (!proratedCalc.canUpgrade) {
      throw new Error('当前订阅不支持补差价升级');
    }

    return {
      finalAmount: proratedCalc.upgradeAmount,
      originalPrice: proratedCalc.targetPrice,
      discountAmount: proratedCalc.remainingValue,
      priceType: 'prorated',
      priceDescription: `补差价升级 (节省¥${proratedCalc.remainingValue})`,
      allowManualInput: false, // 补差价通常不允许手动修改
      calculation: {
        basePrice: proratedCalc.targetPrice,
        proratedDiscount: proratedCalc.remainingValue,
        remainingValue: proratedCalc.remainingValue,
        upgradeAmount: proratedCalc.upgradeAmount
      }
    };
  }

  /**
   * 验证手动输入的金额
   */
  static validateManualAmount(amount: number, context: PricingContext): {
    valid: boolean;
    message?: string;
  } {
    if (amount <= 0) {
      return { valid: false, message: '金额必须大于0' };
    }

    if (amount > 9999) {
      return { valid: false, message: '金额不能超过9999元' };
    }

    // 获取建议范围
    const originalPrice = this.getOriginalPrice(context.targetTier, context.targetPeriod);
    const minAmount = Math.round(originalPrice * 0.1); // 最低1折
    const maxAmount = originalPrice * 2; // 最高2倍

    if (amount < minAmount) {
      return { valid: false, message: `金额不能低于¥${minAmount}` };
    }

    if (amount > maxAmount) {
      return { valid: false, message: `金额不能超过¥${maxAmount}` };
    }

    return { valid: true };
  }

  /**
   * 获取原价
   */
  private static getOriginalPrice(tier: SubscriptionTier, period: SubscriptionPeriod): number {
    const plans = getSubscriptionPlans();
    const plan = plans.find(p => p.tier === tier);
    if (!plan) return 0;
    
    return period === 'monthly' ? plan.monthly.originalPrice : plan.yearly.originalPrice;
  }

  /**
   * 格式化价格显示
   */
  static formatPriceDisplay(result: PricingResult): string {
    const { finalAmount, originalPrice, discountAmount, priceType } = result;

    if (priceType === 'original') {
      return `¥${finalAmount}`;
    }

    if (priceType === 'promo') {
      return `¥${finalAmount} (原价¥${originalPrice})`;
    }

    if (priceType === 'prorated') {
      return `¥${finalAmount} (节省¥${discountAmount})`;
    }

    return `¥${finalAmount}`;
  }
}