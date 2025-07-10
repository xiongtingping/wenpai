/**
 * 开发环境API代理服务
 * 直接调用OpenAI API，用于开发和测试
 */

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
 * OpenAI API配置
 */
const OPENAI_CONFIG = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'sk-proj-your-api-key-here', // 支持环境变量
  model: 'gpt-4o'
};

/**
 * 调用OpenAI API（开发环境）
 * @param messages 消息数组
 * @param model 模型名称
 * @param temperature 温度参数
 * @param maxTokens 最大token数
 * @returns Promise with response data
 */
export async function callOpenAIDevProxy(
  messages: any[],
  model: string = 'gpt-4o',
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<DevProxyResponse> {
  try {
    console.log('callOpenAIDevProxy 开始调用...');
    console.log('请求参数:', { messages, model, temperature, maxTokens });
    
    // 检查API Key
    if (!OPENAI_CONFIG.apiKey || OPENAI_CONFIG.apiKey === 'sk-proj-your-api-key-here') {
      throw new Error('OpenAI API Key未配置，请在devApiProxy.ts中配置正确的API Key');
    }
    
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
      })
    });

    console.log('OpenAI API响应状态:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API错误:', errorData);
      throw new Error(`OpenAI API调用失败: ${errorData.error?.message || `HTTP ${response.status}`}`);
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
    const response = await callOpenAIDevProxy(testMessages, 'gpt-4o', 0.7, 50);
    
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