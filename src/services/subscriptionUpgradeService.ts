/**
 * 订阅升级服务
 * 支持差价升级（按剩余天数折算）和 prorate（按比例）结算
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { supabase } from '@/config/supabase';
import { getSubscriptionPlans } from '@/config/subscriptionPlans';
import { logger } from '@/utils/logger';
import type { SubscriptionTier, SubscriptionPeriod } from '@/types/subscription';

export interface UpgradeCalculation {
  // 当前订阅信息
  currentSubscription: {
    tier: SubscriptionTier;
    period: SubscriptionPeriod;
    expiresAt: string;
    remainingDays: number;
    originalPrice: number;
    paidAmount: number;
  };
  
  // 目标订阅信息
  targetSubscription: {
    tier: SubscriptionTier;
    period: SubscriptionPeriod;
    price: number;
  };
  
  // 升级计算结果
  calculation: {
    // 剩余价值（已支付但未使用的部分）
    remainingValue: number;
    // 目标订阅价格
    targetPrice: number;
    // 需要补缴的差价
    upgradeAmount: number;
    // 折扣比例
    discountPercentage: number;
    // 节省金额
    savedAmount: number;
  };
  
  // 升级详情
  details: {
    description: string;
    breakdown: Array<{
      item: string;
      amount: number;
      description: string;
    }>;
  };
}

export class SubscriptionUpgradeService {
  /**
   * 计算升级差价
   */
  static async calculateUpgrade(
    userId: string,
    targetTier: SubscriptionTier,
    targetPeriod: SubscriptionPeriod
  ): Promise<UpgradeCalculation> {
    try {
      // 1. 获取用户当前订阅
      const currentSubscription = await this.getCurrentSubscription(userId);
      if (!currentSubscription) {
        throw new Error('未找到当前订阅');
      }

      // 2. 检查是否为升级(不支持降级)
      if (!this.isUpgrade(currentSubscription.subscription_type as SubscriptionTier, targetTier)) {
        throw new Error('不支持降级,仅支持升级到更高套餐');
      }

      // 3. 计算剩余天数
      const remainingDays = this.calculateRemainingDays(currentSubscription.expires_at);
      if (remainingDays <= 0) {
        throw new Error('订阅已过期,请先续费');
      }

      // 4. 获取订阅计划价格
      const subscriptionPlans = getSubscriptionPlans();
      const currentPlan = subscriptionPlans.find(p => p.tier === currentSubscription.subscription_type);
      const targetPlan = subscriptionPlans.find(p => p.tier === targetTier);

      if (!currentPlan || !targetPlan) {
        throw new Error('套餐配置不存在');
      }

      // 5. 计算当前订阅的原始价格和已支付金额（使用原价，不含优惠）
      const currentPeriod = this.inferSubscriptionPeriod(currentSubscription);
      const currentPrice = currentPeriod === 'yearly' 
        ? currentPlan.yearly.originalPrice 
        : currentPlan.monthly.originalPrice;
      
      const targetPrice = targetPeriod === 'yearly' 
        ? targetPlan.yearly.originalPrice 
        : targetPlan.monthly.originalPrice;

      // 6. 计算剩余价值（按比例）
      const totalDays = currentPeriod === 'yearly' ? 365 : 30;
      const usedDays = totalDays - remainingDays;
      const remainingValue = (currentPrice * remainingDays) / totalDays;

      // 7. 计算升级差价
      const upgradeAmount = Math.max(0, targetPrice - remainingValue);
      const savedAmount = remainingValue;
      const discountPercentage = remainingValue > 0 ? Math.round((savedAmount / targetPrice) * 100) : 0;

      // 8. 构建升级计算结果
      const calculation: UpgradeCalculation = {
        currentSubscription: {
          tier: currentSubscription.subscription_type as SubscriptionTier,
          period: currentPeriod,
          expiresAt: currentSubscription.expires_at,
          remainingDays,
          originalPrice: currentPrice,
          paidAmount: currentPrice
        },
        targetSubscription: {
          tier: targetTier,
          period: targetPeriod,
          price: targetPrice
        },
        calculation: {
          remainingValue: Math.round(remainingValue * 100) / 100,
          targetPrice,
          upgradeAmount: Math.round(upgradeAmount * 100) / 100,
          discountPercentage,
          savedAmount: Math.round(savedAmount * 100) / 100
        },
        details: {
          description: this.generateUpgradeDescription(
            currentSubscription.subscription_type as SubscriptionTier,
            targetTier,
            remainingDays,
            upgradeAmount
          ),
          breakdown: [
            {
              item: '目标套餐价格',
              amount: targetPrice,
              description: `${targetTier === 'pro' ? '专业版' : '高级版'} ${targetPeriod === 'yearly' ? '年付' : '月付'}`
            },
            {
              item: '当前订阅剩余价值',
              amount: -Math.round(remainingValue * 100) / 100,
              description: `剩余 ${remainingDays} 天，按比例折算`
            },
            {
              item: '需要补缴差价',
              amount: Math.round(upgradeAmount * 100) / 100,
              description: '升级所需支付金额'
            }
          ]
        }
      };

      logger.info('升级差价计算完成:', {
        userId,
        currentTier: currentSubscription.subscription_type,
        targetTier,
        remainingDays,
        upgradeAmount
      });

      return calculation;
    } catch (error) {
      logger.error('计算升级差价失败:', error);
      throw error;
    }
  }

  /**
   * 执行升级
   */
  static async executeUpgrade(
    userId: string,
    upgradeCalculation: UpgradeCalculation,
    paymentData?: {
      orderId: string;
      paymentMethod: 'alipay' | 'wechat';
    }
  ): Promise<{
    success: boolean;
    newSubscription?: any;
    message: string;
  }> {
    try {
      // 1. 如果需要支付差价，验证支付
      if (upgradeCalculation.calculation.upgradeAmount > 0 && !paymentData) {
        throw new Error('升级需要支付差价，请先完成支付');
      }

      // 2. 获取当前订阅
      const currentSubscription = await this.getCurrentSubscription(userId);
      if (!currentSubscription) {
        throw new Error('未找到当前订阅');
      }

      // 3. 计算新的到期时间
      const newExpiresAt = this.calculateNewExpiresAt(
        upgradeCalculation.targetSubscription.period,
        upgradeCalculation.currentSubscription.remainingDays
      );

      // 4. 更新订阅
      const { data: newSubscription, error } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_type: upgradeCalculation.targetSubscription.tier,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
          upgrade_from: currentSubscription.subscription_type,
          upgrade_at: new Date().toISOString(),
          upgrade_amount: upgradeCalculation.calculation.upgradeAmount,
          order_id: paymentData?.orderId || null
        })
        .eq('id', currentSubscription.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 5. 记录升级历史
      await this.recordUpgradeHistory(userId, upgradeCalculation, paymentData);

      logger.info('订阅升级成功:', {
        userId,
        fromTier: upgradeCalculation.currentSubscription.tier,
        toTier: upgradeCalculation.targetSubscription.tier,
        upgradeAmount: upgradeCalculation.calculation.upgradeAmount
      });

      return {
        success: true,
        newSubscription,
        message: '升级成功！您的新权限已生效'
      };
    } catch (error) {
      logger.error('执行升级失败:', error);
      return {
        success: false,
        message: `升级失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 获取用户当前订阅
   */
  private static async getCurrentSubscription(userId: string) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * 判断是否为升级
   */
  private static isUpgrade(currentTier: SubscriptionTier, targetTier: SubscriptionTier): boolean {
    const tierLevels = { trial: 0, pro: 1, premium: 2 };
    return tierLevels[targetTier] > tierLevels[currentTier];
  }

  /**
   * 计算剩余天数
   */
  private static calculateRemainingDays(expiresAt: string): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  /**
   * 推断订阅周期
   */
  private static inferSubscriptionPeriod(subscription: any): SubscriptionPeriod {
    // 可以从订阅记录中获取，或者根据创建时间和到期时间推断
    const startDate = new Date(subscription.started_at || subscription.created_at);
    const endDate = new Date(subscription.expires_at);
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 如果接近365天，认为是年付；接近30天，认为是月付
    return diffDays > 300 ? 'yearly' : 'monthly';
  }

  /**
   * 计算新的到期时间
   */
  private static calculateNewExpiresAt(targetPeriod: SubscriptionPeriod, remainingDays: number): string {
    const now = new Date();
    
    if (targetPeriod === 'yearly') {
      // 年付：当前时间 + 365天
      now.setDate(now.getDate() + 365);
    } else {
      // 月付：当前时间 + 30天
      now.setDate(now.getDate() + 30);
    }
    
    return now.toISOString();
  }

  /**
   * 生成升级描述
   */
  private static generateUpgradeDescription(
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier,
    remainingDays: number,
    upgradeAmount: number
  ): string {
    const currentTierName = currentTier === 'pro' ? '专业版' : '高级版';
    const targetTierName = targetTier === 'pro' ? '专业版' : '高级版';
    
    if (upgradeAmount === 0) {
      return `您的${currentTierName}还有${remainingDays}天有效期，升级到${targetTierName}无需额外付费！`;
    }
    
    return `您的${currentTierName}还有${remainingDays}天有效期，升级到${targetTierName}只需补缴差价 ¥${upgradeAmount}`;
  }

  /**
   * 记录升级历史
   */
  private static async recordUpgradeHistory(
    userId: string,
    upgradeCalculation: UpgradeCalculation,
    paymentData?: any
  ) {
    try {
      await supabase
        .from('subscription_upgrade_history')
        .insert({
          user_id: userId,
          from_tier: upgradeCalculation.currentSubscription.tier,
          to_tier: upgradeCalculation.targetSubscription.tier,
          from_period: upgradeCalculation.currentSubscription.period,
          to_period: upgradeCalculation.targetSubscription.period,
          remaining_days: upgradeCalculation.currentSubscription.remainingDays,
          remaining_value: upgradeCalculation.calculation.remainingValue,
          upgrade_amount: upgradeCalculation.calculation.upgradeAmount,
          payment_order_id: paymentData?.orderId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      logger.warn('记录升级历史失败:', error);
      // 不抛出错误，因为这不影响升级本身
    }
  }

  /**
   * 获取升级历史
   */
  static async getUpgradeHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscription_upgrade_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('获取升级历史失败:', error);
      return [];
    }
  }
}

export default SubscriptionUpgradeService;
