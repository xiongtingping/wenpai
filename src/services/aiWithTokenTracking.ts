/**
 * AI调用Token统计包装器
 * @description 在不修改锁定的aiService.ts的前提下，为AI调用添加Token统计功能
 */

import { callAI as originalCallAI, AITaskType } from '@/api/aiService';
import { tokenUsageService } from '@/services/tokenUsageService';
import { useAuth } from '@/hooks/useAuth';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import type { SubscriptionTier } from '@/types/subscription';
import type { AICallParams, AIResponse } from '@/api/types';

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
}

/**
 * 获取当前用户信息的辅助函数
 */
function getCurrentUserInfo(): { userId: string; userTier: SubscriptionTier } | null {
  try {
    // 在React组件外部使用，需要从localStorage获取用户信息
    const authData = localStorage.getItem('wenpai_auth_state');
    if (!authData) return null;
    
    const { user } = JSON.parse(authData);
    if (!user?.id) return null;
    
    // 获取用户套餐信息，默认为trial
    const userTier: SubscriptionTier = user.subscription?.tier || 'trial';
    
    return {
      userId: user.id,
      userTier
    };
  } catch (error) {
    console.warn('获取用户信息失败:', error);
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
    console.warn('未找到用户信息，跳过Token统计');
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
    // 1. 检查Token限额（如果有用户信息且未跳过检查）
    if (userInfo && !skipLimitCheck) {
      const limitCheck = await tokenUsageService.checkTokenLimit(
        userId,
        actualUserTier,
        estimatedInputTokens + (params.maxTokens || 1000) // 估算总Token数
      );
      
      if (!limitCheck.allowed) {
        // Token限额不足，返回错误响应
        const response: AIResponseWithUsage = {
          content: '',
          model: params.model || 'unknown',
          responseTime: Date.now() - startTime,
          success: false,
          error: limitCheck.reason,
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
    }
    
    // 2. 调用原始AI服务
    const aiResponse = await originalCallAI({
      ...aiParams,
      taskType,
      userId
    });
    
    // 3. 计算实际Token使用量
    let actualInputTokens = estimatedInputTokens;
    let actualOutputTokens = estimateTokens(aiResponse.content);
    let actualTotalTokens = actualInputTokens + actualOutputTokens;
    
    // 如果AI响应包含usage信息，使用实际数据
    if (aiResponse.usage) {
      actualInputTokens = aiResponse.usage.promptTokens || actualInputTokens;
      actualOutputTokens = aiResponse.usage.completionTokens || actualOutputTokens;
      actualTotalTokens = aiResponse.usage.totalTokens || actualTotalTokens;
    }
    
    // 4. 记录Token使用量（如果调用成功且有用户信息）
    if (aiResponse.success && userInfo) {
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
    }
    
    // 5. 获取用户最新的Token统计
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
    
    // 6. 返回扩展的响应
    const response: AIResponseWithUsage = {
      ...aiResponse,
      tokenUsage
    };
    
    return response;
    
  } catch (error) {
    console.error('AI调用失败:', error);
    
    // 记录失败的调用（如果有用户信息）
    if (userInfo) {
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

// 导出原始的AI调用函数，以便需要时使用
export { callAI as callAIOriginal, AITaskType } from '@/api/aiService';
