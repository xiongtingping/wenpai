/**
 * 开发环境API代理服务
 * 直接调用OpenAI API，用于开发和测试
 */

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

import { getOpenAIConfig, isValidAPIKey } from '@/config/apiConfig';

/**
 * OpenAI API配置
 */
const OPENAI_CONFIG = getOpenAIConfig();

/**
 * 调用OpenAI API（开发环境）
 * @param options 请求选项
 * @returns Promise with response data
 */
export async function callOpenAIDevProxy(options: {
  messages: any[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<DevProxyResponse> {
  const { messages, model = 'gpt-4o', temperature = 0.7, maxTokens = 1000 } = options;
  try {
    console.log('callOpenAIDevProxy 开始调用...');
    console.log('请求参数:', { messages, model, temperature, maxTokens });
    
    // 检查API Key
    if (!isValidAPIKey(OPENAI_CONFIG.apiKey, 'openai')) {
      throw new Error('OpenAI API Key未配置，请在.env.local中设置VITE_OPENAI_API_KEY');
    }
    
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    const response = await fetch(OPENAI_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('OpenAI API响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API错误:', errorData);
      
      // 根据错误类型提供更具体的错误信息
      if (response.status === 401) {
        throw new Error('OpenAI API密钥无效，请检查VITE_OPENAI_API_KEY配置');
      } else if (response.status === 429) {
        throw new Error('OpenAI API请求频率过高，请稍后重试');
      } else if (response.status === 500) {
        throw new Error('OpenAI服务器内部错误，请稍后重试');
      } else {
        throw new Error(`OpenAI API调用失败: ${errorData.error?.message || `HTTP ${response.status}`}`);
      }
    }

    const data = await response.json();
    console.log('OpenAI API调用成功');

    return {
      success: true,
      data: {
        data: data // 包装成期望的格式
      }
    };
  } catch (error) {
    console.error('callOpenAIDevProxy 异常:', error);
    
    // 处理超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenAI API请求超时，请检查网络连接或稍后重试');
    }
    
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
      model: 'gpt-4o',
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