/**
 * AI调用Token统计包装器
 * @description 在不修改锁定的aiService.ts的前提下，为AI调用添加Token统计功能
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { callUnifiedAI } from '@/api/unifiedAIService';
import { AITaskType } from '@/api/aiService';
import { tokenUsageService } from '@/services/tokenUsageService';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import type { SubscriptionTier } from '@/types/subscription';
import type { AICallParams, AIResponse } from '@/api/types';
import { hasModelPermission, getModelPermissionInfo } from '@/utils/modelPermissions';

/**
 * 扩展的AI调用参数，包含Token统计相关信息
 */
export interface AICallParamsWithTracking extends AICallParams {
  /** 功能名称，用于统计分类 */
  feature?: string;
  /** 任务类型 */
  taskType?: AITaskType;
  /** 用户套餐类型 */
  userTier?: SubscriptionTier;
  /** 是否跳过Token限额检查 */
  skipLimitCheck?: boolean;
  /** 重新生成种子值，确保每次生成不同 */
  regenerationSeed?: string;
  /** 变化程度：轻微/中等/显著 */
  variationLevel?: 'slight' | 'moderate' | 'significant';
  /** 风格变化选项 */
  styleVariation?: 'tone' | 'structure' | 'vocabulary' | 'approach';
}

/**
 * 扩展的AI响应，包含Token使用统计
 */
export interface AIResponseWithUsage extends AIResponse {
  /** Token使用统计 */
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    userMonthlyUsed: number;
    userMonthlyLimit: number;
    userMonthlyRemaining: number;
    usagePercentage: number;
    needUpgrade: boolean;
  };
  /** 错误类型标记 */
  errorType?: 'token_limit' | 'model_permission' | 'network' | 'unknown';
}

/**
 * 获取当前用户信息的辅助函数
 * 🔧 FIX: 支持多个存储位置，优先级：wenpai-unified-store > unified-user-state > wenpai_auth_state
 */
function getCurrentUserInfo(): { userId: string; userTier: SubscriptionTier } | null {
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
          console.log(`✅ 从 ${key} 获取用户信息成功`);
        }
        // 直接用户对象格式：{ user: {...} }
        else if (parsed.user?.id) {
          user = parsed.user;
          console.log(`✅ 从 ${key} 获取用户信息成功`);
        }
        // Authing原始格式：{ id: '...', ... }
        else if (parsed.id) {
          user = parsed;
          console.log(`✅ 从 ${key} 获取用户信息成功`);
        }

        if (user?.id) {
          // 🔍 详细日志：记录用户对象结构
          console.log('🔍 用户对象完整结构:', {
            source: key,
            userId: user.id,
            hasSubscription: !!user.subscription,
            subscriptionType: typeof user.subscription,
            subscriptionValue: user.subscription,
            subscriptionTier: user.subscription?.tier,
            userKeys: Object.keys(user),
            fullUser: user
          });

          // 🔧 修复：支持两种数据结构
          // 1. unified-state-store格式：subscription直接是字符串 'trial' | 'pro' | 'premium'
          // 2. 旧格式：subscription是对象 { tier: 'trial' | 'pro' | 'premium' }
          let userTier: SubscriptionTier = 'trial';

          if (typeof user.subscription === 'string') {
            // 新格式：直接是字符串
            userTier = user.subscription as SubscriptionTier;
          } else if (user.subscription?.tier) {
            // 旧格式：对象格式
            userTier = user.subscription.tier;
          }

          console.log('📊 用户信息:', {
            userId: user.id,
            userTier,
            source: key,
            subscriptionType: typeof user.subscription,
            subscriptionValue: user.subscription
          });

          return {
            userId: user.id,
            userTier
          };
        }
      } catch (parseError) {
        // 解析失败，继续尝试下一个key
        continue;
      }
    }

    // 所有存储位置都没有找到用户信息
    console.warn('⚠️ 未找到用户信息，已尝试的存储位置:', storageKeys);
    return null;

  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    return null;
  }
}

/**
 * 估算Token数量的辅助函数
 */
function estimateTokens(text: string): number {
  // 简单估算：中文字符按1.5个token计算，英文单词按1个token计算
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const otherChars = text.length - chineseChars - englishWords;
  
  return Math.ceil(chineseChars * 1.5 + englishWords + otherChars * 0.5);
}

/**
 * 带Token统计的AI调用函数
 * @description 在原有AI调用基础上添加Token使用量统计和限额检查
 */
export async function callAIWithTokenTracking(
  params: AICallParamsWithTracking
): Promise<AIResponseWithUsage> {
  const startTime = Date.now();
  
  // 获取用户信息
  const userInfo = getCurrentUserInfo();
  if (!userInfo && !params.skipLimitCheck) {
    console.warn('not founduserinfo，skippingToken统计');
  }
  
  const {
    feature = 'unknown',
    taskType = AITaskType.GENERAL_CHAT,
    userTier = 'trial',
    skipLimitCheck = false,
    ...aiParams
  } = params;
  
  const userId = userInfo?.userId || params.userId || 'anonymous';
  const actualUserTier = userInfo?.userTier || userTier;
  
  // 估算输入Token数量
  const estimatedInputTokens = estimateTokens(params.prompt + (params.systemPrompt || ''));
  
  try {
    // 1. 检查模型权限
    if (params.model && !skipLimitCheck) {
      const hasPermission = hasModelPermission(params.model);
      if (!hasPermission) {
        const permissionInfo = getModelPermissionInfo(params.model);
        const response: AIResponseWithUsage = {
          content: '',
          model: params.model,
          responseTime: Date.now() - startTime,
          success: false,
          error: permissionInfo.message,
          tokenUsage: userInfo ? {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            userMonthlyUsed: 0,
            userMonthlyLimit: 0,
            userMonthlyRemaining: 0,
            usagePercentage: 0,
            needUpgrade: true
          } : undefined
        };
        return response;
      }
    }
    
    // 2. 检查Token限额（如果有用户信息且未跳过检查）
    if (userInfo && !skipLimitCheck) {
      const limitCheck = await tokenUsageService.checkTokenLimit(
        userId,
        actualUserTier,
        estimatedInputTokens + (params.maxTokens || 1000) // 估算总Token数
      );
      
      if (!limitCheck.allowed) {
        // Token限额不足，触发全局事件并返回错误响应
        const tokenLimitEvent = new CustomEvent('tokenLimitExceeded', {
          detail: {
            userId,
            userTier: actualUserTier,
            stats: limitCheck.stats,
            warningLevel: limitCheck.warningLevel,
            reason: limitCheck.reason,
            suggestedAction: limitCheck.suggestedAction
          }
        });
        window.dispatchEvent(tokenLimitEvent);

        logger.error('🚫 Token限额超限，已触发全局事件', {
          userId,
          warningLevel: limitCheck.warningLevel,
          monthlyUsed: limitCheck.stats.monthlyUsed,
          monthlyLimit: limitCheck.stats.monthlyLimit
        });

        const response: AIResponseWithUsage = {
          content: '',
          model: params.model || 'unknown',
          responseTime: Date.now() - startTime,
          success: false,
          error: limitCheck.reason,
          errorType: 'token_limit',
          tokenUsage: {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            userMonthlyUsed: limitCheck.stats.monthlyUsed,
            userMonthlyLimit: limitCheck.stats.monthlyLimit,
            userMonthlyRemaining: limitCheck.stats.monthlyRemaining,
            usagePercentage: limitCheck.stats.usagePercentage,
            needUpgrade: limitCheck.stats.needUpgrade
          }
        };

        return response;
      }

      // 即使允许使用，也检查是否需要发出警告
      if (limitCheck.warningLevel !== 'safe') {
        const tokenWarningEvent = new CustomEvent('tokenLimitWarning', {
          detail: {
            userId,
            userTier: actualUserTier,
            stats: limitCheck.stats,
            warningLevel: limitCheck.warningLevel,
            reason: limitCheck.reason
          }
        });
        window.dispatchEvent(tokenWarningEvent);

        logger.warn(`⚠️ Token使用量预警 [${limitCheck.warningLevel}]，已触发全局事件`, {
          userId,
          usagePercentage: limitCheck.stats.usagePercentage.toFixed(2) + '%'
        });
      }
    }
    
    // 3. 调用统一AI服务
    const aiResponse = await callUnifiedAI({
      ...aiParams,
      taskType,
      userId
    });
    
    // 4. 计算实际Token使用量
    let actualInputTokens = estimatedInputTokens;
    let actualOutputTokens = estimateTokens(aiResponse.content);
    let actualTotalTokens = actualInputTokens + actualOutputTokens;
    
    // 如果AI响应包含usage信息，使用实际数据
    if (aiResponse.usage) {
      actualInputTokens = aiResponse.usage.promptTokens || actualInputTokens;
      actualOutputTokens = aiResponse.usage.completionTokens || actualOutputTokens;
      actualTotalTokens = aiResponse.usage.totalTokens || actualTotalTokens;
    }
    
    // 5. 记录Token使用量（如果调用成功且有用户信息）
    if (aiResponse.success && userInfo) {
      try {
        await tokenUsageService.recordTokenUsage({
          userId,
          feature,
          taskType,
          inputTokens: actualInputTokens,
          outputTokens: actualOutputTokens,
          totalTokens: actualTotalTokens,
          model: aiResponse.model,
          contentSummary: params.prompt.substring(0, 100) + (params.prompt.length > 100 ? '...' : ''),
          success: true
        });
      } catch (e) {
        console.warn('⚠️ Token usage recording failed (non-blocking):', e);
      }
    }

    // 6. 获取用户最新的Token统计
    let tokenUsage;
    if (userInfo) {
      const stats = await tokenUsageService.getUserTokenStats(userId, actualUserTier);
      tokenUsage = {
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        totalTokens: actualTotalTokens,
        userMonthlyUsed: stats.monthlyUsed + actualTotalTokens, // 包含本次使用
        userMonthlyLimit: stats.monthlyLimit,
        userMonthlyRemaining: Math.max(0, stats.monthlyRemaining - actualTotalTokens),
        usagePercentage: ((stats.monthlyUsed + actualTotalTokens) / stats.monthlyLimit) * 100,
        needUpgrade: stats.needUpgrade
      };
    }
    
    // 7. 返回扩展的响应
    const response: AIResponseWithUsage = {
      ...aiResponse,
      tokenUsage
    };
    
    return response;
    
  } catch (error) {
    console.error('AI调用failed:', error);
    
    // 记录失败的调用（如果有用户信息）
    if (userInfo) {
      try {
        await tokenUsageService.recordTokenUsage({
          userId,
          feature,
          taskType,
          inputTokens: estimatedInputTokens,
          outputTokens: 0,
          totalTokens: estimatedInputTokens,
          model: params.model || 'unknown',
          contentSummary: params.prompt.substring(0, 100) + (params.prompt.length > 100 ? '...' : ''),
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
      } catch (e) {
        console.warn('⚠️ Token usage failure record failed (non-blocking):', e);
      }
    }

    // 返回错误响应
    const response: AIResponseWithUsage = {
      content: '',
      model: params.model || 'unknown',
      responseTime: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
    
    return response;
  }
}

/**
 * 检查用户Token限额的便捷函数
 */
export async function checkUserTokenLimit(
  estimatedTokens: number = 1000
): Promise<{ allowed: boolean; reason?: string; stats?: any }> {
  const userInfo = getCurrentUserInfo();
  if (!userInfo) {
    return { allowed: true }; // 未登录用户不限制
  }
  
  return await tokenUsageService.checkTokenLimit(
    userInfo.userId,
    userInfo.userTier,
    estimatedTokens
  );
}

/**
 * 获取用户Token使用统计的便捷函数
 */
export async function getUserTokenStats() {
  const userInfo = getCurrentUserInfo();
  if (!userInfo) {
    return null;
  }
  
  return await tokenUsageService.getUserTokenStats(
    userInfo.userId,
    userInfo.userTier
  );
}

// 导出统一AI调用函数，以便需要时使用
export { callUnifiedAI as callAIOriginal } from '@/api/unifiedAIService';
export { AITaskType } from '@/api/aiService';
