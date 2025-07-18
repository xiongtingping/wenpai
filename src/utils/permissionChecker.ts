/**
 * 全局功能权限检查系统
 * 用于检查用户对不同功能的访问权限
 */

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getAPIConfig } from '@/config/apiConfig';

/**
 * 功能权限配置
 */
export interface FeaturePermission {
  id: string;
  name: string;
  description: string;
  requiredPlan: 'trial' | 'pro' | 'premium';
  requiredConfig?: string[];
  enabled: boolean;
}

/**
 * 权限检查结果
 */
export interface PermissionResult {
  hasPermission: boolean;
  requiredPlan?: string;
  missingConfigs?: string[];
  message?: string;
  suggestions?: string[];
}

/**
 * 权限配置接口
 */
export interface PermissionConfig {
  requiredRole: string;
  description: string;
  enabled: boolean;
}

/**
 * 功能权限配置表
 */
export const FEATURE_PERMISSIONS: Record<string, FeaturePermission> = {
  // AI内容适配器
  'content-adaptation': {
    id: 'content-adaptation',
    name: 'AI内容适配器',
    description: '智能分析内容，一键适配多平台格式',
    requiredPlan: 'trial',
    requiredConfig: ['openai', 'authing'],
    enabled: true
  },

  // 品牌库功能
  'brand-library': {
    id: 'brand-library',
    name: '品牌库功能',
    description: '上传品牌资料，AI自动分析品牌调性',
    requiredPlan: 'premium',
    requiredConfig: ['openai', 'authing'],
    enabled: true
  },

  // 创意工作室
  'creative-studio': {
    id: 'creative-studio',
    name: '创意工作室',
    description: 'AI驱动的创意内容生成工具',
    requiredPlan: 'pro',
    requiredConfig: ['openai', 'authing'],
    enabled: true
  },

  // 热点话题
  'hot-topics': {
    id: 'hot-topics',
    name: '热点话题',
    description: '实时获取各平台热点话题',
    requiredPlan: 'trial',
    requiredConfig: ['authing'],
    enabled: true
  },

  // 内容提取器
  'content-extractor': {
    id: 'content-extractor',
    name: '内容提取器',
    description: '智能提取网页内容并生成摘要',
    requiredPlan: 'pro',
    requiredConfig: ['openai', 'authing'],
    enabled: true
  },

  // 支付功能
  'payment': {
    id: 'payment',
    name: '支付功能',
    description: '订阅管理和支付处理',
    requiredPlan: 'trial',
    requiredConfig: ['authing'],
    enabled: true
  },

  // 高级AI模型
  'advanced-ai-models': {
    id: 'advanced-ai-models',
    name: '高级AI模型',
    description: '使用GPT-4o等高级AI模型',
    requiredPlan: 'pro',
    requiredConfig: ['openai'],
    enabled: true
  },

  // 批量处理
  'batch-processing': {
    id: 'batch-processing',
    name: '批量处理',
    description: '批量处理多个文件或内容',
    requiredPlan: 'premium',
    requiredConfig: ['openai', 'authing'],
    enabled: true
  },

  // 品牌语气分析
  'brand-tone-analysis': {
    id: 'brand-tone-analysis',
    name: '品牌语气分析',
    description: '深度分析品牌语气和调性',
    requiredPlan: 'premium',
    requiredConfig: ['openai', 'authing'],
    enabled: true
  },

  // 内容质量检查
  'content-quality-check': {
    id: 'content-quality-check',
    name: '内容质量检查',
    description: 'AI检查内容质量和品牌一致性',
    requiredPlan: 'pro',
    requiredConfig: ['openai', 'authing'],
    enabled: true
  }
};

/**
 * 检查功能权限
 * @param featureId 功能ID
 * @param userPlan 用户计划
 * @returns 权限检查结果
 */
export function checkFeaturePermission(featureId: string, userPlan: string = 'trial'): PermissionResult {
  const feature = FEATURE_PERMISSIONS[featureId];
  
  if (!feature) {
    return {
      hasPermission: false,
      message: '功能不存在',
      suggestions: ['请检查功能ID是否正确']
    };
  }

  if (!feature.enabled) {
    return {
      hasPermission: false,
      message: '功能暂时不可用',
      suggestions: ['该功能正在维护中，请稍后重试']
    };
  }

  // 检查用户计划权限
  const planHierarchy = { trial: 0, pro: 1, premium: 2 };
  const userPlanLevel = planHierarchy[userPlan as keyof typeof planHierarchy] || 0;
  const requiredPlanLevel = planHierarchy[feature.requiredPlan];

  if (userPlanLevel < requiredPlanLevel) {
    return {
      hasPermission: false,
      requiredPlan: feature.requiredPlan,
      message: `需要${feature.requiredPlan === 'pro' ? '专业版' : feature.requiredPlan === 'premium' ? '高级版' : '试用版'}权限`,
      suggestions: [
        `升级到${feature.requiredPlan === 'pro' ? '专业版' : '高级版'}以使用此功能`,
        '访问支付页面进行升级'
      ]
    };
  }

  // 检查必需的配置
  if (feature.requiredConfig) {
    const config = getAPIConfig();
    const missingConfigs: string[] = [];

    for (const configKey of feature.requiredConfig) {
      switch (configKey) {
        case 'openai':
          if (!config.openai.apiKey) {
            missingConfigs.push('OpenAI API Key');
          }
          break;
        case 'authing':
          if (!config.authing.appId || !config.authing.host) {
            missingConfigs.push('Authing配置');
          }
          break;
        case 'creem':
          if (!config.creem.apiKey) {
            missingConfigs.push('Creem支付配置');
          }
          break;
      }
    }

    if (missingConfigs.length > 0) {
      return {
        hasPermission: false,
        missingConfigs,
        message: '缺少必需的配置',
        suggestions: [
          '请检查环境变量配置',
          '联系管理员配置相关服务'
        ]
      };
    }
  }

  return {
    hasPermission: true,
    message: '权限验证通过'
  };
}

/**
 * 检查单个权限（简化版本）
 * @param permissionKey 权限键
 * @returns 是否有权限
 */
export function checkPermission(permissionKey: string): boolean {
  const result = checkFeaturePermission(permissionKey);
  return result.hasPermission;
}

/**
 * 检查所有权限
 * @returns 权限检查结果
 */
export function checkAllPermissions(): { allValid: boolean; results: PermissionResult[] } {
  const results: PermissionResult[] = [];
  let allValid = true;

  for (const featureId of Object.keys(FEATURE_PERMISSIONS)) {
    const result = checkFeaturePermission(featureId);
    results.push(result);
    if (!result.hasPermission) {
      allValid = false;
    }
  }

  return { allValid, results };
}

/**
 * 获取权限配置
 * @returns 权限配置对象
 */
export function getPermissionConfig(): Record<string, PermissionConfig> {
  const config: Record<string, PermissionConfig> = {};
  
  for (const [key, feature] of Object.entries(FEATURE_PERMISSIONS)) {
    config[key] = {
      requiredRole: feature.requiredPlan,
      description: feature.description,
      enabled: feature.enabled
    };
  }
  
  return config;
}

/**
 * 检查多个功能权限
 * @param featureIds 功能ID数组
 * @param userPlan 用户计划
 * @returns 权限检查结果数组
 */
export function checkMultipleFeaturePermissions(featureIds: string[], userPlan: string = 'trial'): PermissionResult[] {
  return featureIds.map(featureId => checkFeaturePermission(featureId, userPlan));
}

/**
 * 获取可用功能列表
 * @param userPlan 用户计划
 * @returns 可用功能列表
 */
export function getAvailableFeatures(userPlan: string = 'trial'): FeaturePermission[] {
  return Object.values(FEATURE_PERMISSIONS).filter(feature => {
    const result = checkFeaturePermission(feature.id, userPlan);
    return result.hasPermission;
  });
}

/**
 * 获取不可用功能列表
 * @param userPlan 用户计划
 * @returns 不可用功能列表
 */
export function getUnavailableFeatures(userPlan: string = 'trial'): Array<FeaturePermission & { reason: string }> {
  return Object.values(FEATURE_PERMISSIONS)
    .filter(feature => {
      const result = checkFeaturePermission(feature.id, userPlan);
      return !result.hasPermission;
    })
    .map(feature => {
      const result = checkFeaturePermission(feature.id, userPlan);
      return {
        ...feature,
        reason: result.message || '未知原因'
      };
    });
}

/**
 * 权限检查Hook
 * @param featureId 功能ID
 * @returns 权限检查结果
 */
export function useFeaturePermission(featureId: string): PermissionResult {
  const { user } = useUnifiedAuth();
  const userPlan = user?.plan || 'trial';
  
  return checkFeaturePermission(featureId, userPlan);
}

/**
 * 多权限检查Hook
 * @param featureIds 功能ID数组
 * @returns 权限检查结果数组
 */
export function useMultipleFeaturePermissions(featureIds: string[]): PermissionResult[] {
  const { user } = useUnifiedAuth();
  const userPlan = user?.plan || 'trial';
  
  return checkMultipleFeaturePermissions(featureIds, userPlan);
}

/**
 * 设置全局权限检查函数
 */
export function setupGlobalPermissionCheck(): void {
  if (typeof window !== 'undefined') {
    (window as any).__checkPermission__ = checkPermission;
    (window as any).__checkAllPermissions__ = checkAllPermissions;
    (window as any).__checkFeaturePermission__ = checkFeaturePermission;
  }
} 