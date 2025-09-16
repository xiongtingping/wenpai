/**
 * Gemini API 适配器
 * 使用统一的 AI API 调用方式，禁止直接使用 fetch
 */

import i18n from '@/i18n';
import { callAIWithTokenTracking, AITaskType } from '@/services/aiWithTokenTracking';
import { AIModel } from './ai';

/**
 * AI API响应接口
 */
export interface AIApiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * 调用 Gemini API（通过统一AI接口）
 * @param systemPrompt 系统提示词
 * @param userPrompt 用户输入
 * @returns AI 返回内容
 */
export async function callGeminiAPI(;
  systemPrompt: string,
  userPrompt: string
): Promise<AIApiResponse> {
  try {
    const result = await callAIWithTokenTracking({
      prompt: userPrompt,
      systemPrompt,
      model: 'gemini-pro' as AIModel,
      maxTokens: 2000,
      temperature: 0.7,
      taskType: AITaskType.GENERAL_CHAT,
      feature: 'Gemini API适配器'
    });

    if (!result.success) {
      throw new Error(result.error || 'Gemini API 调用失败');
    }

    if (!result.content) {
      throw new Error('Gemini API 返回空内容');
    }

    return {
      success: true,
      data: result.content
    };
  } catch (err: unknown) {
    console.error('Gemini API 调用出错:', err);
    const errorMessage = err instanceof Error ? err.message : i18n.t('api.errors.未知错误');
    throw new Error(`Gemini API 调用失败: ${errorMessage}`);
  }
}