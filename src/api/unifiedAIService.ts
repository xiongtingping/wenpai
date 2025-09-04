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
 * 🔓 UNLOCKED: AI 禁止对此文件做任何修改
 */

import { callAI, generateImage as directGenerateImage } from './ai';
import { callOpenAIProxy, callDeepSeekProxy, callGeminiProxy } from './apiProxy';
import { generateImage as proxyGenerateImage } from './imageGenerationService';
import type { AICallParams, AIResponse, ImageGenerationParams } from './types';
import { logger } from '@/utils/logger';

/**
 * 环境检测
 * ✅ FIXED: 支持强制生产模式 - 不再使用模拟和本地模式
 */
const forceProductionMode = import.meta.env.VITE_FORCE_PRODUCTION_MODE === 'true';
const isDevelopment = !forceProductionMode && import.meta.env.DEV;
const isProduction = forceProductionMode || import.meta.env.PROD;

/**
 * 统一的AI调用服务
 * 根据环境自动选择直连API或代理API
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export async function callUnifiedAI(params: AICallParams): Promise<AIResponse> {
  console.log(`🔧 统一AI服务调用 - 环境: ${isDevelopment ? '开发' : '生产'}`);
  
  if (isDevelopment) {
    // 开发环境：直连AI服务商API
    console.log('🔗 开发环境：使用直连API (ai.ts)');
    return await callAI(params as any);
  } else {
    // 生产环境：通过后端代理调用
    console.log('🛡️ 生产环境：使用后端代理 (apiProxy.ts)');
    
    // 将callAI格式转换为proxy格式
    const messages = [
      ...(params.systemPrompt ? [{ role: 'system', content: params.systemPrompt }] : []),
      { role: 'user', content: params.prompt }
    ];
    
    // 根据模型选择对应的代理
    if (params.model?.includes('gpt') || params.model?.includes('openai')) {
      const result = await callOpenAIProxy(messages, params.model, params.temperature, params.maxTokens);
      return {
        content: result.data || '',
        model: params.model || 'gpt-4',
        usage: undefined,
        responseTime: 0,
        success: result.success,
        error: result.error
      };
    } else if (params.model?.includes('deepseek')) {
      const result = await callDeepSeekProxy(messages, params.model);
      console.log('🔍 DeepSeek代理响应调试:', result);
      
      // 🔧 修复: 处理实际的响应数据结构
      let content = '';
      if (result.success && result.data) {
        // 处理后端API返回的格式: { success: true, data: { choices: [...] } }
        if (result.data.choices && result.data.choices[0]?.message?.content) {
          content = result.data.choices[0].message.content;
        } else if (result.data.content) {
          content = result.data.content;
        } else if (typeof result.data === 'string') {
          content = result.data;
        } else {
          console.warn('⚠️ DeepSeek响应数据格式异常:', result.data);
          content = JSON.stringify(result.data);
        }
      }
      
      return {
        content,
        model: params.model || 'deepseek-chat',
        usage: result.data?.usage,
        responseTime: 0,
        success: result.success,
        error: result.error
      };
    } else if (params.model?.includes('gemini')) {
      const result = await callGeminiProxy(params.prompt);
      return {
        content: result.data || '',
        model: params.model || 'gemini-pro',
        usage: undefined,
        responseTime: 0,
        success: result.success,
        error: result.error
      };
    } else {
      // 默认使用OpenAI代理
      const result = await callOpenAIProxy(messages, params.model, params.temperature, params.maxTokens);
      return {
        content: result.data || '',
        model: params.model || 'gpt-4',
        usage: undefined,
        responseTime: 0,
        success: result.success,
        error: result.error
      };
    }
  }
}

/**
 * 统一的图像生成服务
 * 根据环境自动选择直连API或代理API
 * 🔓 UNLOCKED: AI 禁止修改此函数
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
 * 🔓 UNLOCKED: AI 禁止修改此函数
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
 * 🔓 UNLOCKED: AI 禁止修改此函数
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
 * 🔓 UNLOCKED: AI 禁止修改此导出
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
