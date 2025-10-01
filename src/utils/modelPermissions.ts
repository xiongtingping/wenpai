/**
 * AI模型权限检查工具
 * @description 提供统一的AI模型权限验证功能
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { getModelInfo, isModelAvailableForTier } from '@/config/aiModels';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 获取用户订阅层级
 */
export function getUserTier(): SubscriptionTier {
  try {
    const authData = localStorage.getItem('wenpai_auth_state');
    if (authData) {
      const { user } = JSON.parse(authData);
      return user?.subscription?.tier || 'trial';
    }
    return 'trial';
  } catch (error) {
    console.warn('gettinguserinfofailed，使用defaulttier:', error);
    return 'trial';
  }
}

/**
 * 检查用户是否有权限使用指定模型
 * @param modelId 模型ID
 * @returns 是否有权限
 */
export function hasModelPermission(modelId: string): boolean {
  const userTier = getUserTier();
  return isModelAvailableForTier(modelId, userTier);
}

/**
 * 获取模型权限信息
 * @param modelId 模型ID
 * @returns 权限信息
 */
export function getModelPermissionInfo(modelId: string) {
  const model = getModelInfo(modelId);
  const userTier = getUserTier();
  const hasPermission = hasModelPermission(modelId);
  
  if (!model) {
    return {
      hasPermission: false,
      requiredTier: 'premium' as SubscriptionTier,
      currentTier: userTier,
      needsUpgrade: true,
      message: '模型不存在'
    };
  }

  const tierOrder = { 'trial': 1, 'pro': 2, 'premium': 3 };
  const modelTierMap = { 'low': 'trial', 'mid': 'pro', 'high': 'premium' } as const;
  const requiredTier = modelTierMap[model.tier];
  const needsUpgrade = tierOrder[userTier] < tierOrder[requiredTier];

  // 订阅等级名称映射
  const tierNames = {
    'trial': '体验版',
    'pro': '专业版',
    'premium': '高级版'
  };

  return {
    hasPermission,
    requiredTier,
    currentTier: userTier,
    needsUpgrade,
    message: hasPermission
      ? `有权限使用 ${model.name}`
      : `需要${tierNames[requiredTier]}权限才能使用 ${model.name}`
  };
}

/**
 * 获取所有可用模型列表（基于用户权限）
 * @returns 可用模型ID列表
 */
export function getAvailableModelIds(): string[] {
  const userTier = getUserTier();
  // 从 aiModels 配置中获取该层级的所有模型
  const { SUBSCRIPTION_MODELS } = require('@/config/aiModels');
  return SUBSCRIPTION_MODELS[userTier] || SUBSCRIPTION_MODELS['trial'] || [];
}

/**
 * 检查是否需要升级以使用某个模型
 * @param modelId 模型ID
 * @returns 升级建议信息
 */
export function getUpgradeRecommendation(modelId: string) {
  const permissionInfo = getModelPermissionInfo(modelId);
  
  if (permissionInfo.hasPermission) {
    return null;
  }

  const { requiredTier, currentTier } = permissionInfo;

  // 订阅等级名称映射
  const tierNames = {
    'trial': '体验版',
    'pro': '专业版',
    'premium': '高级版'
  };

  return {
    from: currentTier,
    to: requiredTier,
    message: `升级到${tierNames[requiredTier]}以解锁更多AI模型`,
    benefits: requiredTier === 'pro'
      ? ['专业版AI模型', '更多创意功能', '更高Token限额']
      : ['所有顶级AI模型', '无限制使用', '品牌库功能', '所有高级功能']
  };
}

/**
 * 检查特定模型类型权限
 * @param tier AI模型等级 ('low' | 'mid' | 'high')
 * @returns 是否有权限
 */
export function hasModelTierPermission(tier: 'low' | 'mid' | 'high'): boolean {
  const userTier = getUserTier();
  const tierOrder = { 'trial': 1, 'pro': 2, 'premium': 3 };
  const modelTierMap = { 'low': 'trial', 'mid': 'pro', 'high': 'premium' } as const;
  
  const requiredTier = modelTierMap[tier];
  return tierOrder[userTier] >= tierOrder[requiredTier];
}

/**
 * 批量检查模型权限
 * @param modelIds 模型ID列表
 * @returns 权限结果映射
 */
export function batchCheckModelPermissions(modelIds: string[]): Record<string, boolean> {
  const results: Record<string, boolean> = {};
  
  for (const modelId of modelIds) {
    results[modelId] = hasModelPermission(modelId);
  }
  
  return results;
}