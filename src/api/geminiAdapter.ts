/**
 * 封装对后端 Gemini Proxy API 的调用逻辑
 * 所有请求均通过 /api/proxy/gemini 发出，避免前端泄露 API 密钥
 */

import { AIApiResponse } from './contentAdapter';

/**
 * 调用后端 Gemini 代理接口
 * @param systemPrompt 系统提示词
 * @param userPrompt 用户输入
 * @param platformId 平台标识（可用于日志或策略）
 * @returns AI 返回内容或模拟内容
 */
export async function callGeminiAPI(
  systemPrompt: string,
  userPrompt: string,
  platformId: string
): Promise<AIApiResponse> {
  const prompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const res = await fetch('/api/proxy/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || 'Gemini API 调用失败');
    }

    const content =
      data?.result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      content,
      source: 'ai'
    };
  } catch (err: any) {
    console.error('Gemini Proxy API 出错:', err);
    return {
      content: generateSimulatedAIResponse(userPrompt, platformId),
      source: 'simulation',
      error: err?.message || '未知错误'
    };
  }
}

/**
 * 生成模拟 AI 返回内容（API 出错备用）
 */
function generateSimulatedAIResponse(prompt: string, platformId: string): string {
  return `[模拟 Gemini 响应] 平台 ${platformId} 的回答：\n\n${prompt}`;
}