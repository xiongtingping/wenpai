/**
 * 本地API代理服务
 * 当Netlify Functions不可用时提供备用方案
 */

import request from './request';

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
    const data = await request.post(API_ENDPOINTS.NETLIFY, {
      provider: 'openai',
      action: 'generate',
      messages,
      model,
      temperature,
      maxTokens
    });

    return {
      success: true,
      data
    };
  } catch (error) {
    throw new Error(`AI服务连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 测试API连接性
 */
export async function testApiConnectivity(): Promise<ProxyResponse> {
  try {
    const data = await request.post(API_ENDPOINTS.NETLIFY, {
      provider: 'openai',
      action: 'status'
    });

    return {
      success: true,
      data: {
        netlify: true,
        ...data
      }
    };
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
    const data = await request.post(API_ENDPOINTS.NETLIFY, {
      provider: 'openai',
      action: 'status'
    });

    return {
      success: true,
      data: {
        available: (data as any).available || false,
        responseTime: (data as any).responseTime,
        lastChecked: (data as any).lastChecked
      }
    };
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