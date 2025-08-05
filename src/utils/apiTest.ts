/**
 * API连接测试工具
 * 用于诊断DeepSeek API连接问题
 */

import { getAPIConfig } from '@/config/apiConfig';

export interface APITestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

/**
 * 测试DeepSeek API连接
 */
export async function testDeepSeekAPI(): Promise<APITestResult> {
  try {
    console.log('🔍 开始测试DeepSeek API连接...');
    
    const config = getAPIConfig();
    
    // 检查API密钥
    if (!config.deepseek.apiKey || config.deepseek.apiKey === 'your_deepseek_key_here') {
      return {
        success: false,
        message: 'API密钥未配置或使用默认占位符',
        error: 'INVALID_API_KEY'
      };
    }

    // 测试API连接
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.deepseek.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a connection test.'
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      })
    });

    console.log('📡 API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API响应错误:', errorText);
      
      return {
        success: false,
        message: `API调用失败: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        },
        error: 'API_ERROR'
      };
    }

    const data = await response.json();
    console.log('✅ API测试成功:', data);

    return {
      success: true,
      message: 'DeepSeek API连接正常',
      details: {
        model: data.model,
        usage: data.usage,
        response: data.choices?.[0]?.message?.content
      }
    };

  } catch (error) {
    console.error('❌ API测试失败:', error);
    
    let errorMessage = 'API连接测试失败';
    let errorType = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = '网络连接失败，无法访问DeepSeek API';
        errorType = 'NETWORK_ERROR';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS错误，可能需要代理';
        errorType = 'CORS_ERROR';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
      error: errorType,
      details: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    };
  }
}

/**
 * 测试网络连接
 */
export async function testNetworkConnection(): Promise<APITestResult> {
  try {
    console.log('🌐 测试网络连接...');
    
    // 测试基本网络连接
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      timeout: 5000
    } as any);

    if (response.ok) {
      return {
        success: true,
        message: '网络连接正常'
      };
    } else {
      return {
        success: false,
        message: '网络连接异常',
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      message: '网络连接失败',
      error: 'NETWORK_ERROR',
      details: error instanceof Error ? error.message : error
    };
  }
}

/**
 * 综合API诊断
 */
export async function diagnoseAPIIssues(): Promise<{
  network: APITestResult;
  deepseek: APITestResult;
  recommendations: string[];
}> {
  console.log('🔍 开始API诊断...');
  
  const network = await testNetworkConnection();
  const deepseek = await testDeepSeekAPI();
  
  const recommendations: string[] = [];
  
  if (!network.success) {
    recommendations.push('检查网络连接');
    recommendations.push('检查防火墙设置');
    recommendations.push('尝试使用VPN或代理');
  }
  
  if (!deepseek.success) {
    if (deepseek.error === 'INVALID_API_KEY') {
      recommendations.push('检查DeepSeek API密钥是否正确');
      recommendations.push('确认API密钥有足够余额');
      recommendations.push('检查API密钥权限设置');
    } else if (deepseek.error === 'NETWORK_ERROR') {
      recommendations.push('网络无法访问DeepSeek API');
      recommendations.push('考虑使用代理服务');
      recommendations.push('联系网络管理员检查防火墙');
    } else if (deepseek.error === 'API_ERROR') {
      recommendations.push('API调用被拒绝，检查密钥和参数');
      recommendations.push('查看DeepSeek控制台的使用情况');
    }
  }
  
  if (network.success && deepseek.success) {
    recommendations.push('API连接正常，可以正常使用');
  }
  
  return {
    network,
    deepseek,
    recommendations
  };
}
