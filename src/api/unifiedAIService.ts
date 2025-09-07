/**
 * ✅ FIXED: 2025-07-25 统一AI服务 - 环境感知的API调用切换
 * 
 * 🎯 架构设计：
 * - 开发环境：使用 ai.ts 直连各AI服务商API（快速调试，API Key可暴露）
 * - 生产环境：使用 apiProxy.ts 走Netlify Functions代理（保护API Key，统一控制）
 * 
 * 🔧 解决方案：
 * - 根据环境自动切换API调用方式
 * - 开发环境直接调用AI服务商API
 * - 生产环境通过后端代理调用
 * 
 * 📌 已封装：此服务已验证可用，请勿修改
 * 
 */

import { callAI, generateImage as directGenerateImage } from './ai';
import { callOpenAIProxy, callDeepSeekProxy, callGeminiProxy } from './apiProxy';
import { generateImage as proxyGenerateImage } from './imageGenerationService';
import type { AICallParams, AIResponse, ImageGenerationParams } from './types';
import { logger } from '@/utils/logger';
import { cleanAIContent, isValidAIContent } from '@/utils/contentCleaner';
import { getModelInfo, getModelProvider, isModelAvailableForTier } from '@/config/aiModels';
import { useAuth } from '@/hooks/useAuth';
import { createDeepSeekProvider } from './providers/deepseek';

/**
 * 环境检测
 * ✅ FIXED: 支持强制生产模式 - 不再使用模拟和本地模式
 */
const forceProductionMode = import.meta.env.VITE_FORCE_PRODUCTION_MODE === 'true';
const isDevelopment = !forceProductionMode && import.meta.env.DEV;
const isProduction = forceProductionMode || import.meta.env.PROD;

/**
 * AIMLAPI调用函数
 */
async function callAIMLAPI(params: AICallParams): Promise<AIResponse> {
  const startTime = Date.now();
  const apiKey = import.meta.env.VITE_AIMLAPI_KEY;
  
  if (!apiKey) {
    throw new Error('AIMLAPI密钥未配置');
  }

  try {
    const requestBody = {
      model: params.model,
      messages: [
        ...(params.systemPrompt ? [{ role: 'system', content: params.systemPrompt }] : []),
        { role: 'user', content: params.prompt }
      ],
      max_tokens: params.maxTokens || 1000,
      temperature: params.temperature || 0.7,
      stream: false
    };

    const response = await fetch('https://api.aimlapi.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`AIMLAPI调用失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    return {
      content: cleanAIContent(content),
      model: params.model || 'unknown',
      usage: data.usage,
      responseTime: Date.now() - startTime,
      success: !!content,
      error: content ? undefined : 'AIMLAPI返回空内容'
    };
  } catch (error) {
    return {
      content: '',
      model: params.model || 'unknown',
      usage: undefined,
      responseTime: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : 'AIMLAPI调用失败'
    };
  }
}

/**
 * DeepSeek原生API调用函数
 */
async function callDeepSeekNative(params: AICallParams): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DeepSeek API密钥未配置');
  }

  try {
    const deepseekProvider = createDeepSeekProvider(apiKey);
    console.log('🚀 调用DeepSeek原生接口:', params.model);
    
    return await deepseekProvider.callChat(params);
  } catch (error) {
    console.error('❌ DeepSeek原生接口调用失败:', error);
    return {
      content: '',
      model: params.model || 'unknown',
      usage: undefined,
      responseTime: 0,
      success: false,
      error: error instanceof Error ? error.message : 'DeepSeek原生接口调用失败'
    };
  }
}

/**
 * 获取用户订阅层级 - 安全获取用户信息
 */
function getUserTier(): string {
  try {
    const authData = localStorage.getItem('wenpai_auth_state');
    if (authData) {
      const { user } = JSON.parse(authData);
      return user?.subscription?.tier || 'trial';
    }
    return 'trial';
  } catch (error) {
    console.warn('获取用户信息失败，使用默认层级:', error);
    return 'trial';
  }
}

/**
 * 统一的AI调用服务
 * 根据环境、模型配置和用户权限自动路由调用
 * 
 */
export async function callUnifiedAI(params: AICallParams): Promise<AIResponse> {
  console.log(`🔧 统一AI服务调用 - 环境: ${isDevelopment ? '开发' : '生产'}`);
  
  // 获取模型信息和用户权限
  const modelInfo = getModelInfo(params.model || '');
  const userTier = getUserTier();
  
  // 检查模型是否存在
  if (!modelInfo) {
    return {
      content: '',
      model: params.model || 'unknown',
      usage: undefined,
      responseTime: 0,
      success: false,
      error: `模型 ${params.model} 不存在或未配置`
    };
  }
  
  // 检查用户权限
  if (!isModelAvailableForTier(params.model || '', userTier)) {
    return {
      content: '',
      model: params.model || 'unknown',
      usage: undefined,
      responseTime: 0,
      success: false,
      error: `当前订阅计划 ${userTier} 无权限使用模型 ${modelInfo.name}`
    };
  }
  
  console.log(`🎯 模型路由: ${modelInfo.name} (${modelInfo.company}) -> ${modelInfo.provider}`);
  
  // 根据模型提供商选择调用方式
  if (modelInfo.provider === 'deepseek') {
    // DeepSeek模型使用官方原生接口
    console.log(`🔗 DeepSeek模型使用官方原生接口: ${params.model}`);
    return await callDeepSeekNative({
      ...params,
      model: modelInfo.id // 使用标准化的模型ID
    });
  } else {
    // 其他模型通过AIMLAPI调用
    console.log(`🚀 通过AIMLAPI调用模型: ${params.model}`);
    return await callAIMLAPI(params);
  }
}

/**
 * 统一的图像生成服务
 * 根据环境自动选择直连API或代理API
 * 
 */
export async function generateUnifiedImage(params: ImageGenerationParams): Promise<any> {
  console.log(`🖼️ 统一图像生成服务 - 环境: ${isDevelopment ? '开发' : '生产'}`);
  
  if (isDevelopment) {
    // 开发环境：直连OpenAI图像API
    console.log('🔗 开发环境：使用直连图像API (ai.ts)');
    return await directGenerateImage(params as any);
  } else {
    // 生产环境：通过后端代理调用
    console.log('🛡️ 生产环境：使用后端代理 (imageGenerationService.ts)');
    return await proxyGenerateImage({
      prompt: params.prompt,
      n: params.n,
      size: params.size,
      response_format: params.response_format
    });
  }
}

/**
 * 检查统一AI服务状态
 * 
 */
export async function checkUnifiedAIStatus(): Promise<{
  environment: string;
  method: string;
  available: boolean;
  services: Record<string, any>;
}> {
  const environment = isDevelopment ? 'development' : 'production';
  const method = isDevelopment ? 'direct-api' : 'proxy-api';
  
  console.log(`🔍 检查统一AI服务状态 - 环境: ${environment}, 方式: ${method}`);
  
  if (isDevelopment) {
    // 开发环境：检查直连API状态
    try {
      const testResult = await callAI({
        prompt: 'Hello',
        model: 'gpt-4',
        maxTokens: 10
      });
      
      return {
        environment,
        method,
        available: testResult.success,
        services: {
          openai: testResult.success,
          development: true,
          message: '开发环境：直连AI服务商API'
        }
      };
    } catch (error) {
      return {
        environment,
        method,
        available: false,
        services: {
          openai: false,
          development: true,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: '开发环境：直连API测试失败'
        }
      };
    }
  } else {
    // 生产环境：检查代理API状态
    try {
      const testResult = await callOpenAIProxy([{ role: 'user', content: 'Hello' }], 'gpt-4', 0.7, 10);
      
      return {
        environment,
        method,
        available: testResult.success,
        services: {
          proxy: testResult.success,
          production: true,
          message: '生产环境：通过后端代理调用'
        }
      };
    } catch (error) {
      return {
        environment,
        method,
        available: false,
        services: {
          proxy: false,
          production: true,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: '生产环境：代理API测试失败'
        }
      };
    }
  }
}

/**
 * 获取当前环境信息
 * 
 */
export function getUnifiedEnvironmentInfo(): {
  isDevelopment: boolean;
  isProduction: boolean;
  apiMethod: string;
  description: string;
  advantages: string[];
} {
  if (isDevelopment) {
    return {
      isDevelopment,
      isProduction,
      apiMethod: 'direct-api',
      description: '开发环境：直连AI服务商API，快速调试',
      advantages: [
        '快速开发和测试',
        '直接调试模型参数',
        '无需后端代理',
        '实时错误反馈'
      ]
    };
  } else {
    return {
      isDevelopment,
      isProduction,
      apiMethod: 'proxy-api',
      description: '生产环境：通过后端代理调用，保护API Key',
      advantages: [
        '保护API Key不暴露',
        '统一权限控制',
        '频率限制管理',
        '解决CORS问题'
      ]
    };
  }
}

/**
 * 简化的导出接口
 * 
 */
export {
  callUnifiedAI as callAI,
  generateUnifiedImage as generateImage,
  checkUnifiedAIStatus as checkAIStatus,
  getUnifiedEnvironmentInfo as getEnvironmentInfo
};

// 输出环境信息
const envInfo = getUnifiedEnvironmentInfo();
logger.debug('🔧 统一AI服务已加载:', envInfo);
logger.debug(`📍 当前使用: ${envInfo.apiMethod} (${envInfo.description})`);
