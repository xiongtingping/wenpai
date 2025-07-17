/**
 * 开发环境API代理服务
 * 使用统一的 AI API 调用方式，禁止直接使用 fetch
 */

import { callAI, callAIWithRetry, AIModel } from './ai';

// 调试环境变量
console.log('环境变量调试:', {
  VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? '已设置' : '未设置',
  DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE
});

/**
 * API响应接口
 */
export interface DevProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
  message?: string;
}

/**
 * 调用OpenAI API（开发环境，使用统一AI接口）
 * @param options 请求选项
 * @returns Promise with response data
 */
export async function callOpenAIDevProxy(options: {
  messages: any[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<DevProxyResponse> {
  const { messages, model = 'gpt-4', temperature = 0.7, maxTokens = 1000 } = options;
  
  try {
    console.log('callOpenAIDevProxy 开始调用...');
    console.log('请求参数:', { messages, model, temperature, maxTokens });
    
    // 构建提示词
    const prompt = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n\n');

    // 获取系统提示词
    const systemPrompt = messages
      .find(msg => msg.role === 'system')?.content;

    // 使用统一的AI API调用
    const result = await callAIWithRetry({
      prompt,
      model: model as AIModel,
      temperature,
      maxTokens,
      systemPrompt
    }, 3); // 最多重试3次

    console.log('OpenAI API调用成功');

    if (result.success) {
      return {
        success: true,
        data: {
          data: {
            choices: [{
              message: {
                content: result.content
              }
            }],
            usage: result.usage
          }
        }
      };
    } else {
      throw new Error(result.error || 'AI调用失败');
    }
  } catch (error) {
    console.error('callOpenAIDevProxy 异常:', error);
    
    // 处理网络错误
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      throw new Error('网络连接失败，请检查网络设置或配置代理');
    }
    
    throw new Error(`OpenAI API连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 测试API连接性
 * @returns Promise with API status
 */
export async function testDevApiConnectivity(): Promise<DevProxyResponse> {
  try {
    // 简单的连接测试
    const testMessages = [{ role: 'user', content: 'Hello' }];
    const response = await callOpenAIDevProxy({
      messages: testMessages,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 50
    });
    
    return {
      success: true,
      data: { status: 'connected', response }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    };
  }
} 