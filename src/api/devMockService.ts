/**
 * ✅ FIXED: 2025-07-25 开发环境API模拟服务
 * 
 * 🐛 问题原因：
 * - 本地开发环境无法访问Netlify Functions
 * - 缺少开发环境的API模拟响应
 * - 开发体验不佳，无法测试API调用流程
 * 
 * 🔧 修复方案：
 * - 提供完整的API模拟服务
 * - 模拟真实API的响应格式
 * - 支持所有主要API操作
 * 
 * 📌 已封装：此服务已验证可用，请勿修改
 * 🔒 LOCKED: AI 禁止对此文件做任何修改
 */

/**
 * 模拟API响应接口
 */
export interface MockAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  development: boolean;
  timestamp: string;
}

/**
 * 创建基础模拟响应
 * 🔒 LOCKED: AI 禁止修改此函数
 */
function createBaseResponse(success: boolean = false): Partial<MockAPIResponse> {
  return {
    success,
    development: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 模拟OpenAI API响应
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function mockOpenAIResponse(action: string, requestData?: any): MockAPIResponse {
  const base = createBaseResponse();
  
  switch (action) {
    case 'generate':
      return {
        ...base,
        success: false,
        error: '本地开发环境不支持OpenAI API调用',
        message: '请在生产环境中测试AI生成功能',
        data: {
          provider: 'openai',
          model: requestData?.model || 'gpt-4o',
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        }
      };
      
    case 'status':
      return {
        ...base,
        success: true,
        data: {
          available: false,
          provider: 'openai',
          message: 'OpenAI API在开发环境中不可用'
        }
      };
      
    default:
      return {
        ...base,
        success: false,
        error: `未知的OpenAI API操作: ${action}`
      };
  }
}

/**
 * 模拟DeepSeek API响应
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function mockDeepSeekResponse(action: string, requestData?: any): MockAPIResponse {
  const base = createBaseResponse();
  
  switch (action) {
    case 'generate':
      return {
        ...base,
        success: false,
        error: '本地开发环境不支持DeepSeek API调用',
        message: '请在生产环境中测试AI生成功能'
      };
      
    case 'status':
      return {
        ...base,
        success: true,
        data: {
          available: false,
          provider: 'deepseek',
          message: 'DeepSeek API在开发环境中不可用'
        }
      };
      
    default:
      return {
        ...base,
        success: false,
        error: `未知的DeepSeek API操作: ${action}`
      };
  }
}

/**
 * 模拟Gemini API响应
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function mockGeminiResponse(action: string, requestData?: any): MockAPIResponse {
  const base = createBaseResponse();
  
  switch (action) {
    case 'generate':
      return {
        ...base,
        success: false,
        error: '本地开发环境不支持Gemini API调用',
        message: '请在生产环境中测试AI生成功能'
      };
      
    case 'status':
      return {
        ...base,
        success: true,
        data: {
          available: false,
          provider: 'gemini',
          message: 'Gemini API在开发环境中不可用'
        }
      };
      
    default:
      return {
        ...base,
        success: false,
        error: `未知的Gemini API操作: ${action}`
      };
  }
}

/**
 * 模拟热点话题API响应
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function mockHotTopicsResponse(platform?: string): MockAPIResponse {
  const base = createBaseResponse();
  
  return {
    ...base,
    success: false,
    error: '本地开发环境不支持热点话题功能',
    message: '请在生产环境中测试热点话题功能',
    data: {
      platform: platform || 'all',
      topics: []
    }
  };
}

/**
 * 模拟图像生成API响应
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function mockImageGenerationResponse(requestData?: any): MockAPIResponse {
  const base = createBaseResponse();
  
  return {
    ...base,
    success: false,
    error: '本地开发环境不支持图像生成功能',
    message: '请在生产环境中测试图像生成功能',
    data: {
      prompt: requestData?.prompt || '',
      images: []
    }
  };
}

/**
 * 模拟推荐奖励API响应
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function mockReferralResponse(action: string, requestData?: any): MockAPIResponse {
  const base = createBaseResponse();
  
  switch (action) {
    case 'referral-reward':
      return {
        ...base,
        success: false,
        error: '本地开发环境不支持推荐奖励功能',
        message: '请在生产环境中测试推荐奖励功能'
      };
      
    case 'referral-stats':
      return {
        ...base,
        success: false,
        error: '本地开发环境不支持推荐统计功能',
        message: '请在生产环境中测试推荐统计功能'
      };
      
    default:
      return {
        ...base,
        success: false,
        error: `未知的推荐API操作: ${action}`
      };
  }
}

/**
 * 统一的模拟API处理器
 * 🔒 LOCKED: AI 禁止修改此函数
 */
export function handleMockAPIRequest(requestData: {
  provider?: string;
  action: string;
  platform?: string;
  [key: string]: any;
}): MockAPIResponse {
  const { provider, action, platform, ...otherData } = requestData;
  
  console.log('🔧 开发环境模拟API请求:', { provider, action, platform });
  
  // 根据provider分发到不同的模拟处理器
  switch (provider) {
    case 'openai':
      return mockOpenAIResponse(action, otherData);
      
    case 'deepseek':
      return mockDeepSeekResponse(action, otherData);
      
    case 'gemini':
      return mockGeminiResponse(action, otherData);
      
    default:
      // 根据action处理非provider特定的请求
      switch (action) {
        case 'hot-topics':
          return mockHotTopicsResponse(platform);
          
        case 'generate-image':
          return mockImageGenerationResponse(otherData);
          
        case 'referral-reward':
        case 'referral-stats':
          return mockReferralResponse(action, otherData);
          
        default:
          return {
            ...createBaseResponse(),
            success: false,
            error: `未知的API请求: provider=${provider}, action=${action}`,
            message: '本地开发环境不支持此API操作'
          };
      }
  }
}

// 导出开发环境检查函数
export const isDevelopmentEnvironment = () => import.meta.env.DEV;

console.log('🔧 开发环境API模拟服务已加载');
