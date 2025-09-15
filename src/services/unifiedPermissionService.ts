/**
 * 统一权限检查服务
 * @description 整合所有权限守卫组件的权限检查逻辑，提供统一的权限管理服务
 * @author 权限系统团队
 * @created 2025-01-15
 */

import type { SubscriptionTier } from '@/types/subscription';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';

/**
 * 扩展的权限类型定义
 */
export type ExtendedPermissionType =
  | 'auth:required'           // 需要登录
  | 'tier:trial'             // 体验版权限
  | 'tier:pro'               // 专业版权限
  | 'tier:premium'           // 高级版权限
  | 'feature:creative-studio' // 创意魔方功能
  | 'feature:creative-cube'    // 创意魔方-九宫格
  | 'feature:marketing-calendar' // 营销日历
  | 'feature:wechat-templates' // 微信朋友圈文案模板
  | 'feature:emoji-generator'  // Emoji生成功能
  | 'feature:brand-library'    // 品牌库功能
  | 'feature:unlimited-usage'  // 无限使用功能
  | 'feature:advanced-models'  // 高级模型功能
  | 'model:trial'            // 体验版AI模型权限
  | 'model:pro'              // 专业版AI模型权限
  | 'model:premium'          // 高级版AI模型权限
  | 'theme:basic'            // 基础主题
  | 'theme:advanced'         // 高级主题
  | 'theme:premium';         // 专业主题

/**
 * 权限检查结果接口
 */
export interface PermissionCheckResult {
  /** 是否有权限 */
  hasPermission: boolean;
  /** 用户当前等级 */
  userTier: SubscriptionTier;
  /** 所需等级 */
  requiredTier: SubscriptionTier;
  /** 缺失的权限列表 */
  missingPermissions: string[];
  /** 建议操作 */
  suggestedAction: 'upgrade' | 'login' | 'none';
  /** 升级目标等级 */
  upgradeTarget?: 'pro' | 'premium';
  /** 权限配置信息 */
  permissionConfig: PermissionConfig;
}

/**
 * 权限配置接口
 */
export interface PermissionConfig {
  name: string;
  description: string;
  requiredTier: SubscriptionTier;
  check: (user: any) => boolean;
  redirectUrl: string;
  category: 'auth' | 'tier' | 'feature' | 'model' | 'theme';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * 用户信息接口（扩展）
 */
export interface SessionUserInfo {
  id?: string;
  email?: string;
  subscription?: {
    tier: SubscriptionTier;
    status: string;
    expiresAt?: string;
  };
  vipLevel?: string;
  isVip?: boolean;
  permissions?: string[];
  registrationDate?: string;
}

/**
 * 获取用户当前订阅等级
 */
export const getUserTier = (user: SessionUserInfo | null): SubscriptionTier => {
  if (!user) return 'trial';

  // 优先从用户订阅信息获取
  if (user.subscription?.tier) {
    return user.subscription.tier;
  }

  // 从用户VIP等级推断
  if (user.vipLevel === 'premium') return 'premium';
  if (user.vipLevel === 'pro') return 'pro';
  if (user.isVip) return 'pro';

  // 从权限推断
  if (user.permissions?.includes('tier:premium')) return 'premium';
  if (user.permissions?.includes('tier:pro')) return 'pro';

  // 默认为体验版
  return 'trial';
};

/**
 * 完整的权限配置映射
 * 整合了所有权限守卫组件的配置
 */
export const UNIFIED_PERMISSION_CONFIGS: Record<ExtendedPermissionType, PermissionConfig> = {
  // 认证权限
  'auth:required': {
    name: '登录权限',
    description: '需要登录才能访问',
    requiredTier: 'trial',
    check: (user: SessionUserInfo | null) => !!user?.id,
    redirectUrl: '/login',
    category: 'auth',
    priority: 'critical'
  },

  // 订阅等级权限
  'tier:trial': {
    name: '体验版',
    description: '体验版用户权限',
    requiredTier: 'trial',
    check: () => true,
    redirectUrl: '/payment',
    category: 'tier',
    priority: 'low'
  },
  'tier:pro': {
    name: '专业版',
    description: '专业版用户权限',
    requiredTier: 'pro',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'tier',
    priority: 'medium'
  },
  'tier:premium': {
    name: '高级版',
    description: '高级版用户权限',
    requiredTier: 'premium',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'tier',
    priority: 'high'
  },

  // 功能权限
  'feature:creative-studio': {
    name: '创意魔方',
    description: 'AI驱动的创意内容生成工具',
    requiredTier: 'pro',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'high'
  },
  'feature:creative-cube': {
    name: '九宫格创意魔方',
    description: '快速生成多维度创意内容',
    requiredTier: 'pro',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'high'
  },
  'feature:marketing-calendar': {
    name: '营销日历',
    description: '节日热点和营销节点智能提醒',
    requiredTier: 'pro',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'medium'
  },
  'feature:wechat-templates': {
    name: '微信朋友圈文案模板',
    description: '专业设计的社交媒体文案模板库',
    requiredTier: 'pro',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'medium'
  },
  'feature:emoji-generator': {
    name: 'Emoji生成器',
    description: 'AI生成专属表情符号',
    requiredTier: 'pro',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'low'
  },
  'feature:brand-library': {
    name: '品牌库',
    description: '企业级品牌资产管理系统',
    requiredTier: 'premium',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'high'
  },
  'feature:unlimited-usage': {
    name: '无限使用',
    description: '无限制使用所有功能',
    requiredTier: 'premium',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'critical'
  },
  'feature:advanced-models': {
    name: '高级AI模型',
    description: '访问最新的AI模型',
    requiredTier: 'pro',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'feature',
    priority: 'high'
  },

  // 模型权限
  'model:trial': {
    name: '体验版AI模型',
    description: '基础AI模型，包括Google Gemini 2.5 Flash Lite Preview、Meta Llama 4 Scout、OpenAI GPT-4o Mini、Alibaba Qwen Turbo',
    requiredTier: 'trial',
    check: () => true, // 体验版模型对所有用户开放
    redirectUrl: '/payment',
    category: 'model',
    priority: 'low'
  },
  'model:pro': {
    name: '专业版AI模型',
    description: '专业AI模型，包括DeepSeek Chat系列、OpenAI GPT-5 Mini、Google Gemini 2.5 Flash、Alibaba Qwen Plus',
    requiredTier: 'pro',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'model',
    priority: 'high'
  },
  'model:premium': {
    name: '高级版AI模型',
    description: '顶级AI模型，包括OpenAI GPT-5 Chat Latest、Anthropic Claude Sonnet 4、Google Gemini 2.5 Pro、Alibaba Qwen Max',
    requiredTier: 'premium',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'model',
    priority: 'critical'
  },

  // 主题权限
  'theme:basic': {
    name: '基础主题',
    description: '浅色主题',
    requiredTier: 'trial',
    check: () => true,
    redirectUrl: '/payment',
    category: 'theme',
    priority: 'low'
  },
  'theme:advanced': {
    name: '高级主题',
    description: '深色主题和其他高级主题',
    requiredTier: 'pro',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'pro' || userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'theme',
    priority: 'low'
  },
  'theme:premium': {
    name: '专业主题',
    description: '专业版专属主题',
    requiredTier: 'premium',
    check: (user: SessionUserInfo | null) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return userTier === 'premium';
    },
    redirectUrl: '/payment',
    category: 'theme',
    priority: 'low'
  }
};

/**
 * 统一权限检查服务类
 */
export class UnifiedPermissionService {
  /**
   * 检查单个权限
   */
  static checkPermission(
    user: SessionUserInfo | null,
    permissionType: ExtendedPermissionType
  ): PermissionCheckResult {
    const config = UNIFIED_PERMISSION_CONFIGS[permissionType];
    
    if (!config) {
      throw new Error(`未找到权限配置: ${permissionType}`);
    }

    const userTier = getUserTier(user);
    const hasPermission = config.check(user);
    const missingPermissions = hasPermission ? [] : [permissionType];
    
    let suggestedAction: 'upgrade' | 'login' | 'none' = 'none';
    let upgradeTarget: 'pro' | 'premium' | undefined;

    if (!hasPermission) {
      if (!user?.id) {
        suggestedAction = 'login';
      } else if (config.requiredTier !== 'trial') {
        suggestedAction = 'upgrade';
        upgradeTarget = config.requiredTier === 'premium' ? 'premium' : 'pro';
      }
    }

    return {
      hasPermission,
      userTier,
      requiredTier: config.requiredTier,
      missingPermissions,
      suggestedAction,
      upgradeTarget,
      permissionConfig: config
    };
  }

  /**
   * 检查多个权限
   */
  static checkMultiplePermissions(
    user: SessionUserInfo | null,
    permissionTypes: ExtendedPermissionType[]
  ): PermissionCheckResult[] {
    return permissionTypes.map(permissionType => 
      this.checkPermission(user, permissionType)
    );
  }

  /**
   * 检查用户是否满足所有权限要求
   */
  static checkAllPermissions(
    user: SessionUserInfo | null,
    permissionTypes: ExtendedPermissionType[]
  ): boolean {
    return permissionTypes.every(permissionType => 
      this.checkPermission(user, permissionType).hasPermission
    );
  }

  /**
   * 检查用户是否满足任意权限要求
   */
  static checkAnyPermission(
    user: SessionUserInfo | null,
    permissionTypes: ExtendedPermissionType[]
  ): boolean {
    return permissionTypes.some(permissionType => 
      this.checkPermission(user, permissionType).hasPermission
    );
  }

  /**
   * 获取用户缺失的权限列表
   */
  static getMissingPermissions(
    user: SessionUserInfo | null,
    permissionTypes: ExtendedPermissionType[]
  ): PermissionCheckResult[] {
    return this.checkMultiplePermissions(user, permissionTypes)
      .filter(result => !result.hasPermission);
  }

  /**
   * 获取权限配置
   */
  static getPermissionConfig(permissionType: ExtendedPermissionType): PermissionConfig {
    const config = UNIFIED_PERMISSION_CONFIGS[permissionType];
    if (!config) {
      throw new Error(`未找到权限配置: ${permissionType}`);
    }
    return config;
  }

  /**
   * 获取所有权限配置
   */
  static getAllPermissionConfigs(): Record<ExtendedPermissionType, PermissionConfig> {
    return UNIFIED_PERMISSION_CONFIGS;
  }

  /**
   * 根据分类获取权限配置
   */
  static getPermissionsByCategory(category: PermissionConfig['category']): Record<string, PermissionConfig> {
    const result: Record<string, PermissionConfig> = {};
    
    Object.entries(UNIFIED_PERMISSION_CONFIGS).forEach(([key, config]) => {
      if (config.category === category) {
        result[key] = config;
      }
    });
    
    return result;
  }

  /**
   * 根据优先级获取权限配置
   */
  static getPermissionsByPriority(priority: PermissionConfig['priority']): Record<string, PermissionConfig> {
    const result: Record<string, PermissionConfig> = {};
    
    Object.entries(UNIFIED_PERMISSION_CONFIGS).forEach(([key, config]) => {
      if (config.priority === priority) {
        result[key] = config;
      }
    });
    
    return result;
  }
}

/**
 * React Hook：统一权限检查
 */
export const useUnifiedPermissionCheck = (
  user: SessionUserInfo | null,
  permissionType: ExtendedPermissionType
): PermissionCheckResult => {
  return React.useMemo(() => {
    return UnifiedPermissionService.checkPermission(user, permissionType);
  }, [user, permissionType]);
};

// React导入
import React from 'react';

// 导出类型和常量
export type { SessionUserInfo, PermissionCheckResult, PermissionConfig };
export { getUserTier, UNIFIED_PERMISSION_CONFIGS };
export default UnifiedPermissionService;