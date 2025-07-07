/**
 * API代理服务
 * 提供统一的API调用接口，支持多种AI提供商
 */

// API端点配置
const API_ENDPOINTS = {
  OPENAI: '/.netlify/functions/api/openai',
  DEEPSEEK: '/.netlify/functions/api/deepseek',
  GEMINI: '/.netlify/functions/api/gemini',
  TEST: '/.netlify/functions/api/test',
  CHECK_OPENAI: '/.netlify/functions/api/check-openai',
  CHECK_GEMINI: '/.netlify/functions/api/check-gemini',
  CHECK_DEEPSEEK: '/.netlify/functions/api/check-deepseek'
};

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
 * @returns Promise with response data
 */
export async function callOpenAIProxy(
  messages: any[],
  model: string = 'gpt-4o'
): Promise<ProxyResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.OPENAI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
    const response = await fetch(API_ENDPOINTS.DEEPSEEK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
    const response = await fetch(API_ENDPOINTS.GEMINI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
    const response = await fetch(API_ENDPOINTS.TEST);

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
    const response = await fetch(API_ENDPOINTS.CHECK_OPENAI);

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
    const response = await fetch(API_ENDPOINTS.CHECK_GEMINI);

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
    const response = await fetch(API_ENDPOINTS.CHECK_DEEPSEEK);

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