/**
 * API代理服务
 * 提供统一的API调用接口，支持多种AI提供商
 */

import request from './request';
import { getAIConfig } from '@/config/configManager';

// API端点配置
const API_ENDPOINTS = {
  API: '/.netlify/functions/api'
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
 * ✅ FIXED: 消除硬编码，从配置管理器获取参数
 * @param messages 消息数组
 * @param model 模型名称（可选，从配置获取默认值）
 * @param temperature 温度参数（可选，从配置获取默认值）
 * @param maxTokens 最大token数（可选，从配置获取默认值）
 * @returns Promise with response data
 */
export async function callOpenAIProxy(;
  messages: any[],
  model?: string,
  temperature?: number,
  maxTokens?: number
): Promise<ProxyResponse> {
  try {
    // ✅ FIXED: 从配置管理器获取默认值，消除硬编码
    const aiConfig = await getAIConfig();

    const requestData = {
      provider: 'openai',
      action: 'generate',
      messages,
      model: model || aiConfig.openai?.defaultModel || 'gpt-4o',
      temperature: temperature || aiConfig.openai?.defaultTemperature || 0.7,
      maxTokens: maxTokens || aiConfig.openai?.defaultMaxTokens || 1000
    };

    const data = await request.post(API_ENDPOINTS.API, requestData);

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
 * ✅ FIXED: 消除硬编码，从配置管理器获取参数
 * @param messages 消息数组
 * @param model 模型名称（可选，从配置获取默认值）
 * @param temperature 温度参数（可选，从配置获取默认值）
 * @returns Promise with response data
 */
export async function callDeepSeekProxy(;
  messages: any[],
  model?: string,
  temperature?: number
): Promise<ProxyResponse> {
  try {
    // ✅ FIXED: 从配置管理器获取默认值，消除硬编码
    const aiConfig = await getAIConfig();

    const requestData = {
      provider: 'deepseek',
      action: 'generate',
      messages,
      model: model || aiConfig.deepseek?.defaultModel || 'deepseek-chat',
      temperature: temperature || aiConfig.deepseek?.defaultTemperature || 0.7
    };

    const data = await request.post(API_ENDPOINTS.API, requestData);

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
    const data = await request.post(API_ENDPOINTS.API, {
      provider: 'gemini',
      action: 'generate',
      prompt
    });

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
    const data = await request.post(API_ENDPOINTS.API, {});

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
    const data = await request.post(API_ENDPOINTS.API, {
      provider: 'openai',
      action: 'status'
    });

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
    const data = await request.post(API_ENDPOINTS.API, {
      provider: 'gemini',
      action: 'status'
    });

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
    const data = await request.post(API_ENDPOINTS.API, {
      provider: 'deepseek',
      action: 'status'
    });

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