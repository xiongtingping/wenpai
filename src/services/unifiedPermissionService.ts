/**
 * 统一权限检查服务
 * @description 整合所有权限守卫组件的权限检查逻辑，提供统一的权限管理服务
 * @author 权限系统团队
 * @created 2025-01-15
 */

import type { SubscriptionTier } from '@/types/subscription';
import type { 
  ExtendedPermissionType, 
  PermissionCheckResult, 
  PermissionConfig, 
  SessionUserInfo,
  IPermissionService
} from '@/types/permissions';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';

/**
 * 订阅等级权重映射
 */
const SUBSCRIPTION_TIERS: Record<SubscriptionTier, number> = {
  trial: 0,
  pro: 1,
  premium: 2
} as const;

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
 * 🔒 安全修复：整合服务器端验证逻辑
 */
export class UnifiedPermissionService {
  /**
   * 检查单个权限 - 本地检查（仅用于UI显示）
   */
  static checkPermission(
    user: SessionUserInfo | null,
    permissionType: ExtendedPermissionType
  ): PermissionCheckResult {
    const config = UNIFIED_PERMISSION_CONFIGS[permissionType];
    
    if (!config) {
      throw new Error(`not foundpermissionconfiguration: ${permissionType}`);
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
   * 检查权限并同时验证服务器端 - 用于关键操作
   * 🔒 安全修复：强制服务器端验证
   */
  static async checkPermissionSecure(
    user: SessionUserInfo | null,
    permissionType: ExtendedPermissionType
  ): Promise<PermissionCheckResult> {
    // 首先进行本地检查
    const localResult = this.checkPermission(user, permissionType);
    
    // 如果用户已登录，进行服务器端验证
    if (user?.id) {
      try {
        const { ServerPermissionService } = await import('./serverPermissionService');
        const serverResult = await ServerPermissionService.verifyPermission(permissionType);
        
        if (serverResult) {
          // 以服务器端结果为准
          return {
            ...localResult,
            hasPermission: serverResult.hasPermission,
            userTier: serverResult.userTier as any,
            requiredTier: serverResult.requiredTier as any,
            serverVerified: true
          };
        }
      } catch (error) {
        console.warn('server端permissionvalidatingfailed，使用localresult:', error);
        // 如果服务器验证失败，降级到本地验证但标记为未验证
        return {
          ...localResult,
          serverVerified: false,
          verificationError: error instanceof Error ? error.message : '服务器验证失败'
        };
      }
    }
    
    return {
      ...localResult,
      serverVerified: false
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
      throw new Error(`not foundpermissionconfiguration: ${permissionType}`);
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

// 🔒 安全修复：导入服务器端权限验证服务
// 🔧 P1-1: 移除循环依赖 - 使用依赖注入替代直接导入
// import { ServerPermissionService } from './serverPermissionService';

/**
 * 🔧 P1-1: 依赖注入容器 - 解决循环依赖
 * 允许在运行时注入ServerPermissionService
 */
class ServiceContainer {
  private static serverPermissionService: any = null;
  
  static setServerPermissionService(service: any) {
    this.serverPermissionService = service;
  }
  
  static getServerPermissionService() {
    return this.serverPermissionService;
  }
}

export { ServiceContainer };

/**
 * 增强的权限检查结果（包含服务器验证）
 */
export interface EnhancedPermissionCheckResult extends PermissionCheckResult {
  serverVerified?: boolean;
  serverResult?: any;
  verificationTimestamp?: string;
}

/**
 * 增强的统一权限服务类（集成服务器端验证）
 */
export class EnhancedUnifiedPermissionService extends UnifiedPermissionService {
  /**
   * 🔒 安全检查：结合前端和服务器端验证
   */
  static async checkPermissionSecure(
    user: SessionUserInfo | null,
    permissionType: ExtendedPermissionType
  ): Promise<EnhancedPermissionCheckResult> {
    // 先进行前端检查
    const frontendResult = this.checkPermission(user, permissionType);
    
    // 如果前端检查失败，直接返回
    if (!frontendResult.hasPermission) {
      return {
        ...frontendResult,
        serverVerified: false
      };
    }

    try {
      // 进行服务器端验证（通过依赖注入）
      const serverPermissionService = ServiceContainer.getServerPermissionService();
      if (!serverPermissionService) {
        console.warn('⚠️ ServerPermissionServicenot注入，skippingserver端validating');
        return {
          ...frontendResult,
          serverVerified: false
        };
      }
      
      const serverResult = await serverPermissionService.verifyPermission(permissionType);
      
      if (serverResult) {
        return {
          ...frontendResult,
          hasPermission: serverResult.hasPermission, // 以服务器结果为准
          serverVerified: true,
          serverResult: serverResult,
          verificationTimestamp: new Date().toISOString(),
          missingPermissions: serverResult.hasPermission ? [] : [permissionType]
        };
      } else {
        // 服务器验证失败，使用前端结果但标记未验证
        console.warn('⚠️ server端permissionvalidatingfailed，使用frontendresult');
        return {
          ...frontendResult,
          serverVerified: false
        };
      }
    } catch (error) {
      console.error('❌ server端permissionvalidatingerror:', error);
      return {
        ...frontendResult,
        serverVerified: false
      };
    }
  }

  /**
   * 🔒 关键操作权限检查（必须通过服务器验证）
   */
  static async checkSecurePermissions(
    user: SessionUserInfo | null,
    permissionTypes: ExtendedPermissionType[]
  ): Promise<{ success: boolean; error?: string; results?: any }> {
    try {
      // 先进行前端批量检查
      const frontendResults = this.checkMultiplePermissions(user, permissionTypes);
      const frontendAllPass = frontendResults.every(result => result.hasPermission);
      
      if (!frontendAllPass) {
        const failedPermissions = frontendResults
          .filter(result => !result.hasPermission)
          .map(result => result.missingPermissions)
          .flat();
          
        return {
          success: false,
          error: `前端权限检查失败，缺少权限: ${failedPermissions.join(', ')}`
        };
      }

      // 进行服务器端安全验证（通过依赖注入）
      const serverPermissionService = ServiceContainer.getServerPermissionService();
      if (!serverPermissionService) {
        return {
          success: false,
          error: 'ServerPermissionService未注入，无法进行安全验证'
        };
      }
      
      const serverResult = await serverPermissionService.verifySecurePermissions(permissionTypes);
      
      return serverResult;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '权限验证失败'
      };
    }
  }
}

/**
 * React Hook：增强的权限检查（包含服务器验证）
 */
export const useEnhancedPermissionCheck = (
  user: SessionUserInfo | null,
  permissionType: ExtendedPermissionType,
  enableServerVerification: boolean = false
): EnhancedPermissionCheckResult => {
  const [result, setResult] = React.useState<EnhancedPermissionCheckResult>(() => 
    UnifiedPermissionService.checkPermission(user, permissionType)
  );

  React.useEffect(() => {
    if (enableServerVerification) {
      EnhancedUnifiedPermissionService.checkPermissionSecure(user, permissionType)
        .then(setResult)
        .catch(error => {
          console.error('❌ 增强permissioncheckingfailed:', error);
          setResult(prev => ({ ...prev, serverVerified: false }));
        });
    } else {
      setResult(UnifiedPermissionService.checkPermission(user, permissionType));
    }
  }, [user, permissionType, enableServerVerification]);

  return result;
};

// 导出增强功能
export { ServerPermissionService };
export type { EnhancedPermissionCheckResult };
export default UnifiedPermissionService;