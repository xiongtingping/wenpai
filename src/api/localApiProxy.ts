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
 * 模拟OpenAI API调用（用于开发测试）
 */
async function simulateOpenAIResponse(
  messages: any[],
  model: string = 'gpt-4o',
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<ProxyResponse> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // 从消息中提取用户内容
  const userMessage = messages.find(msg => msg.role === 'user');
  const content = userMessage?.content || '';
  
  // 根据内容生成模拟响应
  let responseContent = '';
  
  if (content.includes('品牌') || content.includes('分析')) {
    responseContent = JSON.stringify({
      keywords: ['品牌建设', '市场定位', '用户价值', '创新驱动', '品质保证'],
      tone: '专业、可靠、创新',
      suggestions: [
        '加强品牌故事传播',
        '突出产品差异化优势',
        '建立用户情感连接',
        '持续创新产品功能'
      ]
    });
  } else {
    responseContent = JSON.stringify({
      keywords: ['内容营销', '用户增长', '品牌推广'],
      tone: '友好、专业、可信',
      suggestions: [
        '优化内容质量',
        '增加用户互动',
        '提升品牌知名度'
      ]
    });
  }
  
  return {
    success: true,
    data: {
      choices: [
        {
          message: {
            content: responseContent
          }
        }
      ],
      usage: {
        prompt_tokens: content.length,
        completion_tokens: responseContent.length,
        total_tokens: content.length + responseContent.length
      },
      model: model
    }
  };
}

/**
 * 调用OpenAI API代理（带备用方案）
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
      
      // 如果Netlify Functions失败，使用模拟响应
      console.log('Netlify Functions不可用，使用模拟响应');
      return await simulateOpenAIResponse(messages, model, temperature, maxTokens);
    }

    const data = await response.json();
    console.log('API响应数据:', data);

    if (!response.ok) {
      console.error('API错误响应:', data);
      
      // 如果Netlify Functions返回错误，使用模拟响应
      console.log('Netlify Functions返回错误，使用模拟响应');
      return await simulateOpenAIResponse(messages, model, temperature, maxTokens);
    }

    console.log('API调用成功');
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('callOpenAIProxy 异常:', error);
    
    // 如果出现网络错误，使用模拟响应
    console.log('网络错误，使用模拟响应');
    return await simulateOpenAIResponse(messages, model, temperature, maxTokens);
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