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

// 移除静态导入以避免TDZ循环依赖
// import i18n from '@/i18n'; // 改为动态导入
import { callAI, generateImage as directGenerateImage } from './ai';
import { callOpenAIProxy, callDeepSeekProxy, callGeminiProxy } from './apiProxy';
import { generateImage as proxyGenerateImage } from './imageGenerationService';
import type { AICallParams, AIResponse, ImageGenerationParams } from './types';
import { logger } from '@/utils/logger';
import { cleanAIContent, isValidAIContent } from '@/utils/contentCleaner';
import { getModelInfo, getModelProvider, isModelAvailableForTier } from '@/config/aiModels';
// import { useAuth } from '@/hooks/useAuth'; // 移除Hook的模块顶层导入
// import { createDeepSeekProvider } from './providers/deepseek'; // 改为动态导入

/**
 * 环境检测
 * ✅ FIXED: 支持强制生产模式 - 不再使用模拟和本地模式
 */
const forceProductionMode = import.meta.env.VITE_FORCE_PRODUCTION_MODE === 'true';
const isDevelopment = !forceProductionMode && import.meta.env.DEV;
const isProduction = forceProductionMode || import.meta.env.PROD;

/**
 * AIMLAPI调用函数 - 使用统一管理器
 */
async function callAIMLAPI(params: AICallParams): Promise<AIResponse> {
  // 🔧 已迁移到统一AI管理器，此函数保留用于兼容性
  const { aiManager } = await import('./unifiedAIManager');
  const result = await aiManager.callAI(params);
  
  // 转换为原有接口格式
  return {
    content: result.content,
    model: result.model,
    usage: result.usage,
    responseTime: result.responseTime,
    success: result.success,
    error: result.error
  };
}

/**
 * DeepSeek原生API调用函数 - 使用统一管理器
 */
async function callDeepSeekNative(params: AICallParams): Promise<AIResponse> {
  // 🔧 已迁移到统一AI管理器，此函数保留用于兼容性
  const { aiManager } = await import('./unifiedAIManager');
  const result = await aiManager.callAI(params);
  
  // 转换为原有接口格式
  return {
    content: result.content,
    model: result.model,
    usage: result.usage,
    responseTime: result.responseTime,
    success: result.success,
    error: result.error
  };
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
    console.warn('gettinguserinfofailed，使用defaulttier:', error);
    return 'trial';
  }
}

/**
 * 统一的AI调用服务 - 完全使用新的统一管理器
 * 🔧 已迁移到统一AI管理器，消除所有硬编码问题
 */
export async function callUnifiedAI(params: AICallParams): Promise<AIResponse> {
  console.log('🔧 统一AIservice调用 - 使用new的统一manager');
  
  try {
    // 导入并使用统一AI管理器
    const { aiManager } = await import('./unifiedAIManager');
    const result = await aiManager.callAI(params);
    
    // 转换为原有接口格式，保持兼容性
    return {
      content: result.content,
      model: result.model,
      usage: result.usage,
      responseTime: result.responseTime,
      success: result.success,
      error: result.error
    };
  } catch (error) {
    console.error('❌ 统一AIservice调用failed:', error);
    return {
      content: '',
      model: params.model || 'unknown',
      usage: undefined,
      responseTime: 0,
      success: false,
      error: error instanceof Error ? error.message : '统一AI服务调用失败'
    };
  }
}

/**
 * 统一的图像生成服务 - 使用新的统一管理器
 * 🔧 已迁移到统一AI管理器，消除硬编码问题
 */
export async function generateUnifiedImage(params: ImageGenerationParams): Promise<any> {
  console.log('🖼️ 统一graph像生成service - 使用new的统一manager');
  
  try {
    // 导入并使用统一AI管理器
    const { aiManager } = await import('./unifiedAIManager');
    return await aiManager.generateImage(params);
  } catch (error) {
    console.error('❌ 统一graph像生成failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '统一图像生成失败' // 使用降级方案避免i18n依赖
    };
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
  
  console.log(`🔍 checking统一AIservicestate - 环境: ${environment}, 方式: ${method}`);
  
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

// 🔧 FIXED: 移除模块顶层立即执行的logger调用，避免TDZ错误
// 这些调用会在模块加载时立即执行，而此时logger可能还未定义
// 如果需要环境信息调试，可以在具体的函数中调用

/**
 * 获取并输出环境信息（按需调用）
 */
export function logEnvironmentInfo() {
  const envInfo = getUnifiedEnvironmentInfo();
  logger.debug('🔧 统一AI服务已加载:', envInfo);
  logger.debug(`📍 当前使用: ${envInfo.apiMethod} (${envInfo.description})`);
}
