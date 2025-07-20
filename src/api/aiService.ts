/**
 * AI服务模块
 * 提供统一的AI API调用接口
 * 
 * ✅ 使用统一API请求模块，禁止直接使用fetch/axios
 * 📌 所有API地址从环境变量获取，严禁硬编码
 */

import { getAPIConfig } from '@/config/apiConfig';
import request from './request';

/**
 * AI服务配置
 */
interface AIServiceConfig {
  openai: {
    apiKey: string;
    baseURL: string;
  };
  gemini: {
    apiKey: string;
    baseURL: string;
  };
  deepseek: {
    apiKey: string;
    baseURL: string;
  };
}

/**
 * AI调用参数
 */
export interface AICallParams {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
  userId?: string;
}

/**
 * AI响应结果
 */
export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  responseTime: number;
  success: boolean;
  error?: string;
}

/**
 * 调用AI服务
 */
export async function callAI(params: AICallParams): Promise<AIResponse> {
  const startTime = Date.now();
  const {
    prompt,
    model = 'gpt-4',
    maxTokens = 1000,
    temperature = 0.7,
    systemPrompt,
    stream = false,
    userId
  } = params;

  try {
    const config = getAPIConfig();
    
    // 验证配置
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API密钥未配置');
    }

    // 构建请求体
    const requestBody: any = {
      model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature,
      stream
    };

    // 添加用户信息（如果提供）
    if (userId) {
      requestBody.user = userId;
    }

    // 使用统一请求模块发送请求
    const data = await request.post('/chat/completions', requestBody, {
      baseURL: config.openai.baseURL,
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        ...(userId && { 'X-User-ID': userId })
      }
    });

    // 处理响应
    const content = data.choices[0]?.message?.content || '';
    const usage = data.usage;

    return {
      content,
      model,
      usage,
      responseTime: Date.now() - startTime,
      success: true
    };

  } catch (error) {
    console.error('AI服务调用失败:', error);
    
    return {
      content: '',
      model,
      responseTime: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 检查AI服务状态
 */
export async function checkAIStatus(): Promise<{
  openai: boolean;
  gemini: boolean;
  deepseek: boolean;
  message: string;
}> {
  const config = getAPIConfig();
  const status = {
    openai: false,
    gemini: false,
    deepseek: false,
    message: ''
  };

  try {
    // 检查OpenAI
    if (config.openai.apiKey) {
      try {
        await request.get('/models', {
          baseURL: config.openai.baseURL,
          headers: { 'Authorization': `Bearer ${config.openai.apiKey}` }
        });
        status.openai = true;
      } catch (error) {
        console.warn('OpenAI检查失败:', error);
      }
    }

    // 检查Gemini
    if (config.gemini.apiKey) {
      try {
        await request.get('/models', {
          baseURL: config.gemini.baseURL,
          headers: { 'x-goog-api-key': config.gemini.apiKey }
        });
        status.gemini = true;
      } catch (error) {
        console.warn('Gemini检查失败:', error);
      }
    }

    // 检查Deepseek
    if (config.deepseek.apiKey) {
      try {
        await request.get('/models', {
          baseURL: config.deepseek.baseURL,
          headers: { 'Authorization': `Bearer ${config.deepseek.apiKey}` }
        });
        status.deepseek = true;
      } catch (error) {
        console.warn('Deepseek检查失败:', error);
      }
    }

    const availableServices = Object.entries(status)
      .filter(([key, value]) => key !== 'message' && value)
      .map(([key]) => key);

    status.message = availableServices.length > 0 
      ? `可用服务: ${availableServices.join(', ')}`
      : '所有AI服务都不可用';

    return status;
  } catch (error) {
    status.message = '检查AI服务状态失败';
    return status;
  }
} 