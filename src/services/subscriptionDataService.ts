/**
 * 订阅数据服务
 * @description 提供统一的订阅数据配置，确保所有组件使用一致的数据
 * @author 权限系统团队
 * @created 2025-08-12
 */

import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 等级显示信息
 */
export interface TierDisplayInfo {
  name: string;
  price: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  limits: {
    adaptUsageLimit: number;
    tokenLimit: number;
    availableModels: string[];
    availableFeatures: string[];
  };
}

/**
 * 用户统计数据
 */
export interface UserStatsData {
  userId: string;
  accountType: string;
  availableUses: number;
  usedCount: number;
  tokenLimit: number;
  usedTokens: number;
  registrationDate: string;
  timeSaved: number;
  contentGenerated: number;
}

/**
 * 订阅数据服务类
 */
class SubscriptionDataService {
  /**
   * 获取用户订阅等级
   */
  getUserTier(user: any): SubscriptionTier {
    // 优先从用户订阅信息获取
    if (user?.subscription?.tier) {
      return user.subscription.tier;
    }
    
    // 从用户VIP等级推断
    if (user?.vipLevel === 'premium') return 'premium';
    if (user?.vipLevel === 'pro') return 'pro';
    if (user?.isVip) return 'pro';
    
    // 从权限推断
    if (user?.permissions?.includes('tier:premium')) return 'premium';
    if (user?.permissions?.includes('tier:pro')) return 'pro';
    
    // 默认为体验版
    return 'trial';
  }

  /**
   * 映射订阅等级到账户类型显示名称
   */
  mapTierToAccountType(tier: SubscriptionTier): string {
    const mapping = {
      trial: '体验版',
      pro: '专业版', 
      premium: '高级版'
    };
    return mapping[tier] || '体验版';
  }

  /**
   * 获取等级显示信息
   */
  getTierDisplayInfo(tier: SubscriptionTier): TierDisplayInfo {
    // 从订阅计划配置中获取真实数据
    const subscriptionPlan = getSubscriptionPlan(tier);
    
    if (subscriptionPlan) {
      const usageText = subscriptionPlan.limits.adaptUsageLimit === -1 
        ? '不限次数' 
        : `${subscriptionPlan.limits.adaptUsageLimit}次/月`;
      
      const tokenText = subscriptionPlan.limits.tokenLimit === -1 
        ? '不限Token' 
        : `${(subscriptionPlan.limits.tokenLimit / 10000).toFixed(0)}万Token/月`;

      return {
        name: subscriptionPlan.name,
        price: tier === 'trial' ? '免费' : `¥${subscriptionPlan.monthly.discountPrice}/月`,
        icon: this.getTierIcon(tier),
        color: this.getTierColor(tier),
        features: [
          usageText,
          tokenText,
          ...subscriptionPlan.limits.availableFeatures
        ],
        limits: subscriptionPlan.limits
      };
    }

    // 降级配置（如果找不到订阅计划）
    return this.getFallbackTierInfo(tier);
  }

  /**
   * 获取等级图标
   */
  private getTierIcon(tier: SubscriptionTier): React.ReactNode {
    // 这里返回图标名称，实际图标由组件渲染
    switch (tier) {
      case 'trial': return 'Star';
      case 'pro': return 'Zap';
      case 'premium': return 'Crown';
      default: return 'Star';
    }
  }

  /**
   * 获取等级颜色
   */
  private getTierColor(tier: SubscriptionTier): string {
    switch (tier) {
      case 'trial': 
        return 'bg-muted text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'pro': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'premium': 
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: 
        return 'bg-muted text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  }

  /**
   * 获取降级配置
   */
  private getFallbackTierInfo(tier: SubscriptionTier): TierDisplayInfo {
    const fallbackConfigs = {
      trial: {
        name: '体验版',
        price: '免费',
        icon: 'Star',
        color: 'bg-muted text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        features: ['基础功能', '10次/月使用', '10万Token/月', '基础模型'],
        limits: {
          adaptUsageLimit: 10,
          tokenLimit: 100000,
          availableModels: ['GPT-4o mini', 'DeepSeek v3'],
          availableFeatures: ['我的资料库', '基础模型', '全网雷达']
        }
      },
      pro: {
        name: '专业版',
        price: '¥29/月',
        icon: 'Zap',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        features: ['创意魔方', '30次/月使用', '20万Token/月', '高级AI模型', '深色主题'],
        limits: {
          adaptUsageLimit: 30,
          tokenLimit: 200000,
          availableModels: ['GPT-4o', 'GPT-4o mini', 'DeepSeek v3'],
          availableFeatures: ['创意魔方', '我的资料库', '高级AI模型', '全网雷达']
        }
      },
      premium: {
        name: '高级版',
        price: '¥79/月',
        icon: 'Crown',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        features: ['品牌库', '不限使用', '50万Token/月', '高级及最新AI模型', '全部主题', '优先支持'],
        limits: {
          adaptUsageLimit: -1,
          tokenLimit: 500000,
          availableModels: ['GPT-4o', 'GPT-4o mini', 'DeepSeek v3'],
          availableFeatures: ['创意魔方', '我的资料库', '品牌库', '高级及最新AI模型', '全网雷达']
        }
      }
    };
    
    return fallbackConfigs[tier];
  }

  /**
   * 生成用户统计数据
   */
  generateUserStats(user: any): UserStatsData {
    const userTier = this.getUserTier(user);
    const accountType = this.mapTierToAccountType(userTier);
    const subscriptionPlan = getSubscriptionPlan(userTier);
    
    // 基础统计数据
    const baseStats = {
      userId: user?.id || 'unknown',
      accountType,
      registrationDate: user?.createdAt ? 
        new Date(user.createdAt).toLocaleDateString('zh-CN').replace(/\//g, '/') : 
        new Date().toLocaleDateString('zh-CN').replace(/\//g, '/'),
      timeSaved: 0, // 可以从实际使用记录计算
      contentGenerated: 0 // 可以从实际创作记录计算
    };

    // 使用订阅计划配置中的真实数据
    if (subscriptionPlan) {
      return {
        ...baseStats,
        availableUses: subscriptionPlan.limits.adaptUsageLimit,
        usedCount: 0, // 可以从实际API调用记录获取
        tokenLimit: subscriptionPlan.limits.tokenLimit,
        usedTokens: 0 // 可以从实际Token使用记录获取
      };
    }

    // 如果没有找到订阅计划，使用默认的体验版配置
    return {
      ...baseStats,
      availableUses: 10,
      usedCount: 0,
      tokenLimit: 100000,
      usedTokens: 0
    };
  }

  /**
   * 检查订阅等级是否满足要求
   */
  checkTierPermission(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
    const tierLevels = { trial: 0, pro: 1, premium: 2 };
    return tierLevels[userTier] >= tierLevels[requiredTier];
  }

  /**
   * 获取升级建议
   */
  getUpgradeSuggestion(currentTier: SubscriptionTier, requiredTier: SubscriptionTier): {
    shouldUpgrade: boolean;
    targetTier: SubscriptionTier;
    benefits: string[];
  } {
    if (this.checkTierPermission(currentTier, requiredTier)) {
      return {
        shouldUpgrade: false,
        targetTier: currentTier,
        benefits: []
      };
    }

    const targetTierInfo = this.getTierDisplayInfo(requiredTier);
    
    return {
      shouldUpgrade: true,
      targetTier: requiredTier,
      benefits: targetTierInfo.features
    };
  }

  /**
   * 格式化使用量显示
   */
  formatUsageDisplay(used: number, limit: number): string {
    if (limit === -1) {
      return `已使用 ${used} 次`;
    }
    return `${used}/${limit}`;
  }

  /**
   * 格式化Token显示
   */
  formatTokenDisplay(used: number, limit: number): string {
    const formatNumber = (num: number): string => {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
      }
      return num.toLocaleString();
    };

    if (limit === -1) {
      return `已使用 ${formatNumber(used)} Token`;
    }
    return `${formatNumber(used)}/${formatNumber(limit)}`;
  }

  /**
   * 计算使用百分比
   */
  calculateUsagePercentage(used: number, limit: number): number {
    if (limit === -1) return 0; // 无限制时返回0%
    if (limit === 0) return 100; // 避免除零错误
    return Math.min(100, (used / limit) * 100);
  }
}

// 导出单例实例
export const subscriptionDataService = new SubscriptionDataService();
export default subscriptionDataService;
