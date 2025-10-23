/**
 * AI调用Token统计包装器
 * @description 在不修改锁定的aiService.ts的前提下，为AI调用添加Token统计功能
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { callUnifiedAI } from '@/api/unifiedAIService';
import { AITaskType } from '@/api/aiService';
import { tokenUsageService } from '@/services/tokenUsageService';
import { getEffectiveUserTier, getEffectiveUserId } from '@/utils/effectiveUserTier';
import type { SubscriptionTier } from '@/types/subscription';
import type { AICallParams, AIResponse } from '@/api/types';
import { getModelInfo, isModelAvailableForTier, getAvailableModelsForTier } from '@/config/aiModels';

import { logger } from '@/utils/logger';

// 统一模型ID归一化（别名 → canonical ID）
const MODEL_ALIASES: Record<string, string> = {
  'gpt-5-mini': 'openai/gpt-5-mini-2025-08-07',
  'gpt-5-chat': 'openai/gpt-5-chat-latest',
};
function normalizeModelId(id: string | undefined | null): string | undefined {
  if (!id) return id ?? undefined;
  const trimmed = id.trim();
  const normalized = MODEL_ALIASES[trimmed] || trimmed;
  if (normalized !== trimmed) {
    logger.info('🔁 已归一化模型ID', { from: trimmed, to: normalized });
  }
  return normalized;
}

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
    const userId = getEffectiveUserId();
    const userTier = getEffectiveUserTier();
    if (userId || userTier) {
      return { userId: userId ?? 'anonymous', userTier };
    }
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
  let actualUserTier = userInfo?.userTier || userTier;
  let tierSource: string | undefined;

  // 估算输入Token数量（安全处理空值）
  const estimatedInputTokens = estimateTokens((params.prompt || '') + (params.systemPrompt || ''));

  try {
    // 0. 订阅等级纠偏：🔧 FIX: 总是从订阅服务验证tier，避免使用过期的cached tier
    //    之前只在tier='trial'时验证，导致premium用户被误判为trial
    if (!skipLimitCheck && userId && userId !== 'anonymous') {
      try {
        const { unifiedSubscriptionService } = await import('@/services/unifiedSubscriptionService');
        const status = await unifiedSubscriptionService.getUserSubscriptionStatus(userId);
        if (status?.tier) {
          const oldTier = actualUserTier;
          tierSource = status.source;
          // 避免将 premium/pro 降级为 fallback trial
          if (
            status.source === 'fallback' &&
            (oldTier === 'premium' || oldTier === 'pro') &&
            status.tier === 'trial'
          ) {
            logger.warn('⚠️ 订阅服务返回 fallback trial，保持原等级', {
              userId,
              oldTier,
              fallbackTier: status.tier
            });
          } else {
            actualUserTier = status.tier;
            if (oldTier !== actualUserTier) {
              logger.info('🔄 订阅等级已更新', {
                userId,
                oldTier,
                newTier: actualUserTier,
                source: status.source
              });
            }
          }
        } else {
          tierSource = 'unknown';
        }
      } catch (error) {
        // 忽略订阅查询失败，维持原 tier
        logger.warn('⚠️ 订阅等级查询失败，使用缓存tier', { userId, tier: actualUserTier, error });
      }
    }

    // 1. 检查模型权限（使用已纠偏的 actualUserTier，避免初始化阶段误判）
    const normalizedModel = normalizeModelId(params.model);
    if (normalizedModel && !skipLimitCheck) {
      const allowed = isModelAvailableForTier(normalizedModel, actualUserTier);
      if (!allowed) {
        const model = getModelInfo(normalizedModel);
        const modelTierMap = { low: 'trial', mid: 'pro', high: 'premium' } as const;
        const tierNames: Record<'trial' | 'pro' | 'premium', string> = {
          trial: '体验版',
          pro: '专业版',
          premium: '高级版'
        };
        const requiredTier = model ? modelTierMap[model.tier] : 'pro';
        const message = `需要${tierNames[requiredTier]}权限才能使用 ${model?.name || normalizedModel}`;

        // 监控埋点：权限失败（含归一化前后ID与层级）
        try {
          const { getEffectiveUserTier } = await import('@/utils/effectiveUserTier');
          const effTier = getEffectiveUserTier();
          logger.warn('MODEL_PERMISSION_DENIED', {
            originalModel: params.model,
            normalizedModel,
            requiredTier,
            actualUserTier,
            effectiveUserTier: effTier,
          });
        } catch {}

        const response: AIResponseWithUsage = {
          content: '',
          model: normalizedModel,
          responseTime: Date.now() - startTime,
          success: false,
          error: message,
          errorType: 'model_permission',
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
      if (actualUserTier === 'premium') {
        logger.debug('💎 Premium 用户跳过 Token 限额检查', { userId, tierSource });
      } else {
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
    }

    // 3. 调用统一AI服务（确保必需参数完备）
    // 若未显式指定模型，则按用户订阅层级选择“可用模型”的首选项，避免默认使用受限模型
    const explicitModel = (params.model && params.model.trim()) ? params.model.trim() : '';
    let finalModel = explicitModel;
    if (!finalModel) {
      const fallbackList = getAvailableModelsForTier(actualUserTier);
      finalModel = fallbackList[0]?.id || 'gpt-4o-mini';
    }
    const normalizedFinalModel = normalizeModelId(finalModel) || finalModel;
    const finalPrompt = typeof params.prompt === 'string' ? params.prompt : '';

    // 关键字段防御式校验（避免下游抛出“缺少必需参数: model 和 prompt”）
    logger.debug('🧪 调用统一AI服务前参数校验', {
      hasPrompt: !!finalPrompt,
      promptLength: finalPrompt.length,
      model: finalModel
    });
    if (!finalPrompt) {
      throw new Error('缺少必需参数: prompt');
    }

    const aiResponse = await callUnifiedAI({
      ...aiParams,
      // 显式传递必需字段，覆盖潜在的丢失
      prompt: finalPrompt,
      model: normalizedFinalModel,
      taskType,
      userId,
      userTier: actualUserTier // 传递纠偏后的订阅层级，避免初次进入误判
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
          contentSummary: (finalPrompt || (params.prompt || '')).substring(0, 100) + (((finalPrompt || params.prompt || '').length > 100) ? '...' : ''),
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
      // 注意：recordTokenUsage 已在上文完成保存，stats 已包含本次使用，避免重复加总
      tokenUsage = {
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        totalTokens: actualTotalTokens,
        userMonthlyUsed: stats.monthlyUsed,
        userMonthlyLimit: stats.monthlyLimit,
        userMonthlyRemaining: stats.monthlyRemaining,
        usagePercentage: stats.usagePercentage,
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
          contentSummary: (params.prompt || '').substring(0, 100) + (((params.prompt || '').length > 100) ? '...' : ''),
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
