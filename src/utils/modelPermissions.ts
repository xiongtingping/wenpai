/**
 * AI模型权限检查工具
 * @description 提供统一的AI模型权限验证功能
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { getModelInfo, isModelAvailableForTier } from '@/config/aiModels';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 获取用户订阅层级
 * 🔧 FIX: 支持多个存储位置，优先级：wenpai-unified-store > unified-user-state > wenpai_auth_state
 */
export function getUserTier(): SubscriptionTier {
  try {
    // 🔧 FIX: 按优先级尝试多个存储位置
    const storageKeys = [
      'wenpai-unified-store',    // 优先级1：统一Store
      'unified-user-state',      // 优先级2：统一用户状态
      'wenpai_auth_state',       // 优先级3：旧版认证状态
      '_authing_user'            // 优先级4：Authing原始数据
    ];

    for (const key of storageKeys) {
      const data = localStorage.getItem(key);
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);

        // 尝试从不同的数据结构中提取用户信息
        let user = null;

        // Zustand store格式：{ state: { user: {...} } }
        if (parsed.state?.user?.id) {
          user = parsed.state.user;
        }
        // 直接用户对象格式：{ user: {...} }
        else if (parsed.user?.id) {
          user = parsed.user;
        }
        // Authing原始格式：{ id: '...', ... }
        else if (parsed.id) {
          user = parsed;
        }

        if (user?.id) {
          // 🔧 FIX: 正确提取用户套餐信息
          let userTier: SubscriptionTier = 'trial';

          // 尝试多种可能的数据结构
          if (user.subscription) {
            if (typeof user.subscription === 'string') {
              // subscription 直接是字符串: "pro"
              userTier = user.subscription as SubscriptionTier;
            } else if (user.subscription.tier) {
              // subscription 是对象: { tier: "pro", ... }
              userTier = user.subscription.tier as SubscriptionTier;
            } else if (user.subscription.plan) {
              // subscription 是对象: { plan: "pro", ... }
              userTier = user.subscription.plan as SubscriptionTier;
            }
          }

          // 也检查顶层的 tier 或 plan 字段
          if (!userTier || userTier === 'trial') {
            if (user.tier) {
              userTier = user.tier as SubscriptionTier;
            } else if (user.plan) {
              userTier = user.plan as SubscriptionTier;
            }
          }

          console.log('📊 模型权限检查 - 用户信息:', {
            userId: user.id,
            userTier,
            source: key,
            subscriptionRaw: user.subscription,
            tierRaw: user.tier,
            planRaw: user.plan
          });

          return userTier;
        }
      } catch (parseError) {
        // 解析失败，继续尝试下一个key
        continue;
      }
    }

    // 所有存储位置都没有找到用户信息
    console.warn('⚠️ 模型权限检查 - 未找到用户信息，使用默认tier: trial');
    return 'trial';

  } catch (error) {
    console.error('❌ 获取用户订阅层级失败:', error);
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