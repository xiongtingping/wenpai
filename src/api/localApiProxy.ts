/**
 * 本地API代理服务
 * 当Netlify Functions不可用时提供备用方案
 */

// API端点配置
const API_ENDPOINTS = {
  NETLIFY: '/.netlify/functions/api',
  LOCAL: '/api/local' // 本地备用端点
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
 */
export async function callOpenAIProxy(
  messages: any[],
  model: string = 'gpt-4o',
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<ProxyResponse> {
  try {
    console.log('callOpenAIProxy 开始调用...');
    console.log('API端点:', API_ENDPOINTS.NETLIFY);
    console.log('请求参数:', { provider: 'openai', action: 'generate', messages, model });
    
    // 首先尝试Netlify Functions
    const response = await fetch(API_ENDPOINTS.NETLIFY, {
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
      throw new Error('Netlify Functions不可用，请确保已正确部署到生产环境');
    }

    const data = await response.json();
    console.log('API响应数据:', data);

    if (!response.ok) {
      console.error('API错误响应:', data);
      throw new Error(`AI服务调用失败: ${data.error || data.message || `HTTP ${response.status}`}`);
    }

    console.log('API调用成功');
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('callOpenAIProxy 异常:', error);
    throw new Error(`AI服务连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 测试API连接性
 */
export async function testApiConnectivity(): Promise<ProxyResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.NETLIFY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        action: 'status'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: {
          netlify: true,
          ...data
        }
      };
    } else {
      return {
        success: false,
        data: {
          netlify: false,
          error: `HTTP ${response.status}`
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      data: {
        netlify: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * 检查OpenAI可用性
 */
export async function checkOpenAIAvailability(): Promise<ProxyResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.NETLIFY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        action: 'status'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: {
          available: data.available || false,
          responseTime: data.responseTime,
          lastChecked: data.lastChecked
        }
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.status}`,
        data: {
          available: false,
          error: `API不可用: ${response.status}`
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        available: false,
        error: '网络连接失败'
      }
    };
  }
} 