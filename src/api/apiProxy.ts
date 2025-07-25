/**
 * ✅ FIXED: 2025-07-25 API代理服务 - 解决本地开发环境API调用问题
 *
 * 🐛 问题原因：
 * - 硬编码Netlify Functions端点，本地开发环境无法访问
 * - 缺少环境感知的API端点切换
 * - 没有开发环境的降级处理
 *
 * 🔧 修复方案：
 * - 使用环境感知的API端点配置
 * - 开发环境返回模拟响应
 * - 生产环境使用真实API
 *
 * 📌 已封装：此服务已验证可用，请勿修改
 * 🔒 LOCKED: AI 禁止对此文件做任何修改
 */

import { getAPIEndpoints, isDev, createMockAPIResponse } from '@/config/apiConfig';

// ✅ FIXED: 使用环境感知的API端点配置
// 🔒 LOCKED: AI 禁止修改此配置获取方式
const API_ENDPOINTS = getAPIEndpoints();

/**
 * 代理响应接口
 */
export interface ProxyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
  message?: string;
}

/**
 * 调用OpenAI API代理
 * @param messages 消息数组
 * @param model 模型名称
 * @param temperature 温度参数
 * @param maxTokens 最大token数
 * @returns Promise with response data
 */
export async function callOpenAIProxy(
  messages: any[],
  model: string = 'gpt-4o',
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<ProxyResponse> {
  try {
    console.log('callOpenAIProxy 开始调用...');
    console.log('API端点:', API_ENDPOINTS.api);
    console.log('环境:', isDev() ? 'development' : 'production');
    console.log('请求参数:', { provider: 'openai', action: 'generate', messages, model });

    // ✅ FIXED: 开发环境返回模拟响应
    // 🔒 LOCKED: AI 禁止修改此开发环境处理逻辑
    if (isDev()) {
      console.log('🔧 开发环境：返回模拟API响应');
      const mockResponse = createMockAPIResponse('generate', 'openai');
      return {
        success: false,
        error: mockResponse.error,
        message: mockResponse.message
      };
    }

    const response = await fetch(API_ENDPOINTS.api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        action: 'generate',
        messages,
        model,
        temperature,
        maxTokens
      })
    });

    console.log('API响应状态:', response.status);
    console.log('API响应头:', Object.fromEntries(response.headers.entries()));

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      console.error('非JSON响应:', textBody);
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();
    console.log('API响应数据:', data);

    if (!response.ok) {
      console.error('API错误响应:', data);
      return {
        success: false,
        error: data.error || data.message || `API error: ${response.status}`,
        detail: data.detail
      };
    }

    console.log('API调用成功');
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('callOpenAIProxy 异常:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling OpenAI API proxy'
    };
  }
}

/**
 * 调用DeepSeek API代理
 * @param messages 消息数组
 * @param model 模型名称
 * @returns Promise with response data
 */
export async function callDeepSeekProxy(
  messages: any[],
  model: string = 'deepseek-chat'
): Promise<ProxyResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'deepseek',
        action: 'generate',
        messages,
        model,
        temperature: 0.7
      })
    });

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `API error: ${response.status}`,
        detail: data.detail
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling DeepSeek API proxy'
    };
  }
}

/**
 * 调用Google Gemini API代理
 * @param prompt 提示文本
 * @returns Promise with response data
 */
export async function callGeminiProxy(prompt: string): Promise<ProxyResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'gemini',
        action: 'generate',
        prompt
      })
    });

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `API error: ${response.status}`,
        detail: data.detail
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error calling Gemini API proxy'
    };
  }
}

/**
 * 测试API连接性
 * @returns Promise with API status
 */
export async function testApiConnectivity(): Promise<ProxyResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `API error: ${response.status}`,
        detail: data.detail
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error testing API connectivity'
    };
  }
}

/**
 * 检查OpenAI API可用性
 * @returns Promise with availability status
 */
export async function checkOpenAIAvailability(): Promise<ProxyResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        action: 'status'
      })
    });

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `API error: ${response.status}`,
        detail: data.detail
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking OpenAI API availability'
    };
  }
}

/**
 * 检查Gemini API可用性
 * @returns Promise with availability status
 */
export async function checkGeminiAvailability(): Promise<ProxyResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'gemini',
        action: 'status'
      })
    });

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `API error: ${response.status}`,
        detail: data.detail
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking Gemini API availability'
    };
  }
}

/**
 * 检查DeepSeek API可用性
 * @returns Promise with availability status
 */
export async function checkDeepSeekAvailability(): Promise<ProxyResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'deepseek',
        action: 'status'
      })
    });

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textBody = await response.text();
      return {
        success: false,
        error: `Unexpected non-JSON response: ${textBody.substring(0, 100)}...`
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `API error: ${response.status}`,
        detail: data.detail
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking DeepSeek API availability'
    };
  }
}