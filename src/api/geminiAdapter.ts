/**
 * 封装对后端 Gemini Proxy API 的调用逻辑
 * 所有请求均通过 /api/proxy/gemini 发出，避免前端泄露 API 密钥
 */

import { AIApiResponse } from './contentAdapter';

/**
 * 调用后端 Gemini 代理接口
 * @param systemPrompt 系统提示词
 * @param userPrompt 用户输入
 * @returns AI 返回内容
 */
export async function callGeminiAPI(
  systemPrompt: string,
  userPrompt: string
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

    if (!content) {
      throw new Error('Gemini API 返回空内容');
    }

    return {
      content,
      source: 'ai'
    };
  } catch (err: unknown) {
    console.error('Gemini Proxy API 出错:', err);
    const errorMessage = err instanceof Error ? err.message : '未知错误';
    throw new Error(`Gemini API 调用失败: ${errorMessage}`);
  }
}