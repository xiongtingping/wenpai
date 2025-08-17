/**
 * 统一AI API调用模块
 * 
 * ⚠️ 全项目中禁止重复写 fetch / axios 调用 OpenAI / Gemini / Deepseek 等接口。
 * 所有AI API调用必须通过此模块进行，确保统一管理和错误处理。
 * 
 * ✅ 使用统一API请求模块，禁止直接使用fetch/axios
 * 📌 所有API地址从环境变量获取，严禁硬编码
 */

import request from './request';
import { getAPIConfig } from './request';
import { logger } from '@/utils/logger';

/**
 * AI模型类型定义
 */
export type AIModel =
  | 'gpt-4' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'gpt-4o-mini'
  | 'gemini-pro' | 'gemini-pro-vision'
  | 'deepseek-chat' | 'deepseek-coder' | 'deepseek-v3'
  | 'qwen' | 'llama' | 'mistral'
  | 'claude-3' | 'claude-3-sonnet' | 'claude-3-haiku';

/**
 * 图像生成模型类型定义
 */
export type ImageModel = 
  | 'dall-e-3' | 'dall-e-2' | 'midjourney'
  | 'stable-diffusion' | 'deepfloyd';

/**
 * AI调用参数接口
 */
export interface AICallParams {
  /** 提示词 */
  prompt: string;
  /** 模型名称，默认使用gpt-4 */
  model?: AIModel;
  /** 最大token数 */
  maxTokens?: number;
  /** 温度参数，控制随机性 */
  temperature?: number;
  /** 系统提示词 */
  systemPrompt?: string;
  /** 是否流式响应 */
  stream?: boolean;
  /** 用户ID，用于权限控制 */
  userId?: string;
  /** 额外参数 */
  extraParams?: Record<string, any>;
  /** 重新生成种子值，确保每次生成不同 */
  regenerationSeed?: string;
  /** 变化程度：轻微/中等/显著 */
  variationLevel?: 'slight' | 'moderate' | 'significant';
  /** 风格变化选项 */
  styleVariation?: 'tone' | 'structure' | 'vocabulary' | 'approach';
}

/**
 * 图像生成参数接口
 */
export interface ImageGenerationParams {
  /** 图像描述提示词 */
  prompt: string;
  /** 图像生成模型 */
  model?: ImageModel;
  /** 生成图像数量 */
  n?: number;
  /** 图像尺寸 */
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  /** 响应格式 */
  responseFormat?: 'url' | 'b64_json';
  /** 参考图像（base64格式） */
  referenceImage?: string;
  /** 用户ID，用于权限控制 */
  userId?: string;
}

/**
 * AI响应接口
 */
export interface AIResponse {
  /** 响应内容 */
  content: string;
  /** 使用的模型 */
  model: string;
  /** 消耗的token数 */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 图像生成响应接口
 */
export interface ImageGenerationResponse {
  /** 生成的图像列表 */
  images: Array<{
    url: string;
    revisedPrompt?: string;
  }>;
  /** 使用的模型 */
  model: string;
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
  /** 创建时间戳 */
  created?: number;
}

/**
 * 统一的AI API调用函数
 * 
 * @param params AI调用参数
 * @returns AI响应结果
 * 
 * @example
 * ```typescript
 * // 基础对话
 * const result = await callAI({
 *   prompt: "你好，请介绍一下人工智能",
 *   model: "gpt-4"
 * });
 * 
 * // 带系统提示词的对话
 * const result = await callAI({
 *   prompt: "分析这段代码的性能问题",
 *   model: "gpt-4",
 *   systemPrompt: "你是一个专业的代码审查专家",
 *   temperature: 0.3
 * });
 * ```
 */
export async function callAI(params: AICallParams): Promise<AIResponse> {
  const startTime = Date.now();
  const {
    prompt = '', // ✅ FIXED: 添加默认值防止undefined错误
    model = 'gpt-4o', // ✅ FIXED: 默认使用OpenAI GPT-4o，已验证有效
    maxTokens = 1000,
    temperature = 0.7,
    systemPrompt,
    stream = false,
    userId,
    extraParams = {},
    regenerationSeed,
    variationLevel,
    styleVariation
  } = params;

  // ✅ FIXED: 验证prompt参数
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('prompt参数不能为空且必须是字符串');
  }

  // 声明变量在函数顶层，确保在catch块中可访问
  let selectedConfig: { baseURL: string; apiKey: string } = { baseURL: '', apiKey: '' };
  let apiProvider: string = 'Unknown';

  try {
    // 获取API配置
    const apiConfig = getAPIConfig();

    // ✅ FIXED: 2025-08-02 真正的API解决方案 - 优先使用OpenAI
    // 🐛 问题原因：DeepSeek API账户余额不足，导致402错误
    // 🔧 修复方案：优先使用OpenAI API，DeepSeek作为备选
    // 📌 已封装：API选择逻辑已验证稳定，请勿修改
    // 🔒 LOCKED: AI 禁止对此函数做任何修改
    
    // 优先使用OpenAI（已验证有效）
    if (model.includes('gpt') || model.includes('openai') || !model.includes('deepseek')) {
      selectedConfig = apiConfig.openai;
      apiProvider = 'OpenAI';
      if (!selectedConfig.apiKey || selectedConfig.apiKey.includes('{{') || selectedConfig.apiKey.includes('your-')) {
        throw new Error('OpenAI API密钥未正确配置，请在.env.local文件中设置VITE_OPENAI_API_KEY');
      }
      // ✅ FIXED: 2025-08-03 更新API密钥格式验证以支持新的密钥格式
      // 🐛 问题原因：API密钥格式验证过于严格，不支持新的密钥格式
      // 🔧 修复方案：支持多种OpenAI API密钥格式
      // 📌 已封装：API密钥验证逻辑已验证稳定，请勿修改
      // 🔒 LOCKED: AI 禁止对此函数做任何修改
      if (!selectedConfig.apiKey.startsWith('sk-')) {
        throw new Error('OpenAI API密钥格式不正确，应以sk-开头');
      }
      // 支持标准格式（51字符）和新的长格式密钥
      if (selectedConfig.apiKey.length < 20) {
        throw new Error('OpenAI API密钥长度过短，请检查密钥格式');
      }
    } else if (model.includes('deepseek')) {
      // DeepSeek作为备选，但需要检查余额
      selectedConfig = apiConfig.deepseek;
      apiProvider = 'DeepSeek';
      if (!selectedConfig.apiKey || selectedConfig.apiKey.includes('your-')) {
        throw new Error('DeepSeek API密钥未正确配置，请在.env.local文件中设置VITE_DEEPSEEK_API_KEY');
      }
      // 检查DeepSeek余额状态
      console.warn('⚠️ DeepSeek API余额可能不足，建议使用OpenAI API');
    } else if (model.includes('gemini')) {
      selectedConfig = apiConfig.gemini;
      apiProvider = 'Gemini';
      if (!selectedConfig.apiKey || selectedConfig.apiKey.includes('your-')) {
        throw new Error('Gemini API密钥未正确配置，请在.env.local文件中设置VITE_GEMINI_API_KEY');
      }
    } else {
      // 默认使用OpenAI
      selectedConfig = apiConfig.openai;
      apiProvider = 'OpenAI';
      if (!selectedConfig.apiKey || selectedConfig.apiKey.includes('{{') || selectedConfig.apiKey.includes('your-')) {
        throw new Error('OpenAI API密钥未正确配置，请在.env.local文件中设置VITE_OPENAI_API_KEY');
      }
      // 验证API密钥格式
      if (!selectedConfig.apiKey.startsWith('sk-')) {
        throw new Error('OpenAI API密钥格式不正确，应以sk-开头');
      }
      // 支持标准格式（51字符）和新的长格式密钥
      if (selectedConfig.apiKey.length < 20) {
        throw new Error('OpenAI API密钥长度过短，请检查密钥格式');
      }
    }

    console.log(`🤖 使用${apiProvider} API: ${selectedConfig.baseURL}`);

    // 处理差异化参数，生成变化的提示词
    let enhancedPrompt = prompt;
    let enhancedSystemPrompt = systemPrompt;
    let adjustedTemperature = temperature;

    if (regenerationSeed || variationLevel || styleVariation) {
      const { prompt: newPrompt, systemPrompt: newSystemPrompt, temperature: newTemperature } =
        generateVariationPrompt(prompt, systemPrompt, {
          regenerationSeed,
          variationLevel,
          styleVariation,
          baseTemperature: temperature
        });

      enhancedPrompt = newPrompt;
      enhancedSystemPrompt = newSystemPrompt;
      adjustedTemperature = newTemperature;

      console.log(`🔄 应用差异化策略: ${variationLevel || 'default'}, 风格变化: ${styleVariation || 'none'}`);
    }

    // 构建请求体
    const requestBody: any = {
      model: getModelMapping(model),
      messages: [
        ...(enhancedSystemPrompt ? [{ role: 'system', content: enhancedSystemPrompt }] : []),
        { role: 'user', content: enhancedPrompt }
      ],
      max_tokens: maxTokens,
      temperature: adjustedTemperature,
      stream,
      ...extraParams
    };

    // 添加用户信息（如果提供）
    if (userId) {
      requestBody.user = userId;
    }

    // 检查是否为长内容生成请求
    const isLongContentRequest = systemPrompt?.includes('微信公众号') ||
                                systemPrompt?.includes('知乎') ||
                                maxTokens > 2000;

    logger.debug('🔧 API请求:', {
      url: selectedConfig.baseURL,
      model: model,
      promptLength: prompt.length,
      maxTokens,
      temperature,
      isLongContent: isLongContentRequest
    });

    // 使用统一请求模块发送请求
    const data = await request.request({
      method: 'POST',
      url: `${selectedConfig.baseURL}/chat/completions`,
      data: requestBody,
      headers: {
        'Authorization': `Bearer ${selectedConfig.apiKey}`,
        'Content-Type': 'application/json',
        ...(userId && { 'X-User-ID': userId })
      },
      timeout: isLongContentRequest ? 180000 : 150000 // 长内容3分钟，普通内容2.5分钟
    });

    // 处理流式响应
    if (stream) {
      return handleStreamResponse(data, model, startTime);
    }

    // ✅ FIXED: 2025-08-02 修复响应处理逻辑
    // 处理普通响应
    const content = data?.choices?.[0]?.message?.content || '';
    const usage = data?.usage;

    return {
      content,
      model,
      usage,
      responseTime: Date.now() - startTime,
      success: true
    };

  } catch (error) {
    console.error('AI API调用失败:', error);
    console.log(`🔍 callAI catch块调试: error=${error}, type=${typeof error}, message=${error instanceof Error ? error.message : 'N/A'}`);

    // ✅ FIXED: 2025-08-02 增强浏览器网络错误处理
    // 导入浏览器网络诊断模块
    // 已删除浏览器网络修复功能

    // 详细的错误分析和用户友好提示
    let userFriendlyError = '未知错误';
    const technicalError = error instanceof Error ? error.message : String(error);

    if (technicalError.includes('404')) {
      userFriendlyError = `${apiProvider || 'AI'} API端点不存在，请检查配置`;
      console.error(`🚨 API端点错误: ${selectedConfig?.baseURL || 'unknown'}/chat/completions`);
    } else if (technicalError.includes('401') || technicalError.includes('403')) {
      userFriendlyError = `${apiProvider || 'AI'} API密钥无效或权限不足`;
      console.error(`🚨 认证错误: API密钥可能无效`);
    } else if (technicalError.includes('402')) {
      userFriendlyError = `${apiProvider || 'AI'} API账户余额不足或需要付费升级，建议切换到其他AI模型`;
      console.error(`🚨 402错误: ${apiProvider || 'AI'} API账户余额不足或需要付费升级`);
    } else if (technicalError.includes('429')) {
      userFriendlyError = `${apiProvider || 'AI'} API调用频率超限（429错误），请稍后重试`;
    } else if (technicalError.includes('500') || technicalError.includes('502') || technicalError.includes('503')) {
      userFriendlyError = `${apiProvider || 'AI'} 服务暂时不可用，请稍后重试`;
    } else if (technicalError.includes('timeout') || technicalError.includes('TIMEOUT')) {
      userFriendlyError = `${apiProvider || 'AI'} API调用超时（超过150秒），可能是网络问题或请求过于复杂，建议简化内容或稍后重试`;
    } else if (technicalError.includes('network') || technicalError.includes('NETWORK') || technicalError.includes('ERR_PROXY_CONNECTION_FAILED')) {
      userFriendlyError = '网络连接失败，请检查网络设置或代理配置，建议禁用浏览器代理后重试';
    } else if (technicalError.includes('content_filter') || technicalError.includes('content_policy')) {
      userFriendlyError = '内容被AI安全策略拦截，请调整内容后重试';
    }

    // 记录详细错误信息用于调试
    console.error(`🔍 详细错误信息:`, {
      provider: apiProvider,
      model,
      endpoint: selectedConfig?.baseURL,
      error: technicalError,
      timestamp: new Date().toISOString()
    });

    return {
      content: '',
      model,
      responseTime: Date.now() - startTime,
      success: false,
      error: userFriendlyError
    };
  }
}

/**
 * 处理流式响应
 */
async function handleStreamResponse(
  data: any, 
  model: string, 
  startTime: number
): Promise<AIResponse> {
  let content = '';

  try {
    for (const chunk of data.choices) {
      if (chunk.delta?.content) {
        content += chunk.delta.content;
      }
    }

    return {
      content,
      model,
      responseTime: Date.now() - startTime,
      success: true
    };

  } catch (e) {
    console.error('流式响应处理失败:', e);
    return {
      content,
      model,
      responseTime: Date.now() - startTime,
      success: false,
      error: '流式响应处理失败'
    };
  }
}

/**
 * 模型名称映射
 */
function getModelMapping(model: AIModel): string {
  const modelMap: Record<AIModel, string> = {
    'gpt-4': 'gpt-4',
    'gpt-4o': 'gpt-4o', // ✅ FIXED: 添加GPT-4o支持
    'gpt-4-turbo': 'gpt-4-1106-preview',
    'gpt-4o-mini': 'gpt-4o-mini',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    'gemini-pro': 'gemini-pro',
    'gemini-pro-vision': 'gemini-pro-vision',
    'deepseek-chat': 'deepseek-chat',
    'deepseek-coder': 'deepseek-coder',
    'deepseek-v3': 'deepseek-chat', // deepseek-v3 映射到 deepseek-chat
    'qwen': 'qwen-turbo',
    'llama': 'llama-2-70b-chat',
    'mistral': 'mistral-7b-instruct',
    'claude-3': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
    'claude-3-haiku': 'claude-3-haiku-20240307'
  };

  return modelMap[model] || model;
}

/**
 * 统一的图像生成API调用函数
 * 
 * @param params 图像生成参数
 * @returns 图像生成响应结果
 * 
 * @example
 * ```typescript
 * // 基础图像生成
 * const result = await generateImage({
 *   prompt: "一只可爱的小猫坐在花园里",
 *   model: "dall-e-3",
 *   size: "1024x1024"
 * });
 * 
 * // 带参考图像的变体生成
 * const result = await generateImage({
 *   prompt: "将这个图像变成水彩画风格",
 *   model: "dall-e-3",
 *   referenceImage: "data:image/jpeg;base64,..."
 * });
 * ```
 */
export async function generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
  const startTime = Date.now();
  const {
    prompt,
    model = 'dall-e-3',
    n = 1,
    size = '1024x1024',
    responseFormat = 'url',
    referenceImage,
    userId
  } = params;

  try {
    // 获取API配置
    const apiConfig = getAPIConfig();

    // 验证配置
    if (!apiConfig.openai.apiKey || apiConfig.openai.apiKey.includes('{{') || apiConfig.openai.apiKey.includes('your-')) {
      throw new Error('OpenAI API密钥未正确配置，请在.env.local文件中设置VITE_OPENAI_API_KEY');
    }

    // 构建请求体
    const requestBody: any = {
      model: getImageModelMapping(model),
      prompt,
      n,
      size,
      response_format: responseFormat
    };

    // 如果有参考图像，使用DALL-E 3的变体功能
    if (referenceImage) {
      requestBody.image = referenceImage;
      requestBody.model = 'dall-e-3';
    }

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiConfig.openai.apiKey}`
    };

    // 添加用户信息（如果提供）
    if (userId) {
      headers['X-User-ID'] = userId;
    }

    // 使用统一请求模块发送请求
    const data = await request.post('/v1/images/generations', requestBody, {
      baseURL: apiConfig.openai.baseURL,
      headers
    });

    const images = data.data.map((item: any) => ({
      url: item.url,
      revisedPrompt: item.revised_prompt
    }));
    
    return {
      images,
      model,
      responseTime: Date.now() - startTime,
      success: true,
      created: data.created
    };

  } catch (error) {
    console.error('图像生成API调用失败:', error);
    
    return {
      images: [],
      model,
      responseTime: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 图像模型名称映射
 */
function getImageModelMapping(model: ImageModel): string {
  const modelMap: Record<ImageModel, string> = {
    'dall-e-3': 'dall-e-3',
    'dall-e-2': 'dall-e-2',
    'midjourney': 'midjourney',
    'stable-diffusion': 'stable-diffusion-xl',
    'deepfloyd': 'deepfloyd-if'
  };

  return modelMap[model] || model;
}

/**
 * 批量AI调用
 * 
 * @param prompts 提示词数组
 * @param params 通用参数
 * @returns 响应结果数组
 */
export async function callAIBatch(
  prompts: string[], 
  params: Omit<AICallParams, 'prompt'> = {}
): Promise<AIResponse[]> {
  const results: AIResponse[] = [];
  
  for (const prompt of prompts) {
    const result = await callAI({ ...params, prompt });
    results.push(result);
  }
  
  return results;
}

/**
 * 带重试的AI调用
 * 
 * @param params AI调用参数
 * @param maxRetries 最大重试次数
 * @returns AI响应结果
 */
export async function callAIWithRetry(
  params: AICallParams, 
  maxRetries: number = 8
): Promise<AIResponse> {
  let lastError: Error | null = null;

  logger.system('🚀 callAIWithRetry 开始: 最大重试次数=${maxRetries}');

  for (let i = 0; i < maxRetries; i++) {
    console.log(`🔄 第${i + 1}次尝试调用AI...`);
    try {
      const result = await callAI(params);
      
      if (result.success) {
        return result;
      }
      
      // ✅ FIXED: 处理非异常错误（如429）
      lastError = new Error(result.error || '调用失败');
      
      // 检查是否是429错误
      const is429Error = result.error && result.error.includes('429');
      
      // 调试日志
      console.log(`🔍 重试机制调试: result.error="${result.error}", is429Error=${is429Error}, 重试次数=${i+1}/${maxRetries}`);
      
      // 等待一段时间后重试 - 使用指数退避策略，针对429错误增加延迟
      if (i < maxRetries - 1) {
        let delay = Math.min(Math.pow(2, i) * 1000, 10000); // 基础延迟
        
        // 如果是429错误，增加更长的延迟
        if (is429Error) {
          delay = Math.min(Math.pow(2, i) * 3000, 60000); // 429错误延迟更长，最大60秒
          console.log(`🔄 第${i + 1}次重试失败（429错误），${delay/1000}秒后进行第${i + 2}次重试...`);
        } else {
          console.log(`🔄 第${i + 1}次重试失败，${delay/1000}秒后进行第${i + 2}次重试...`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      // 确保429错误能正确传递
      if (error instanceof Error) {
        lastError = error;
      } else if (typeof error === 'string') {
        lastError = new Error(error);
      } else {
        lastError = new Error('未知错误');
      }
      
      // 等待一段时间后重试
      if (i < maxRetries - 1) {
        let delay = Math.min(Math.pow(2, i) * 1000, 10000); // 基础延迟
        
        // 如果是429错误，增加更长的延迟
        if (lastError && lastError.message.includes('429')) {
          delay = Math.min(Math.pow(2, i) * 3000, 60000); // 429错误延迟更长，最大60秒
          console.log(`🔄 第${i + 1}次重试失败（429错误），${delay/1000}秒后进行第${i + 2}次重试...`);
        } else {
          console.log(`🔄 第${i + 1}次重试失败，${delay/1000}秒后进行第${i + 2}次重试...`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('所有重试都失败了');
}

/**
 * 检查AI服务状态
 * 
 * @returns 服务状态信息
 */
export async function checkAIStatus(): Promise<{
  openai: boolean;
  gemini: boolean;
  deepseek: boolean;
  message: string;
}> {
  const status = {
    openai: false,
    gemini: false,
    deepseek: false,
    message: ''
  };

  try {
    // 测试 OpenAI
    try {
      const openaiResult = await callAI({
        prompt: 'Hello',
        model: 'gpt-3.5-turbo',
        maxTokens: 10
      });
      status.openai = openaiResult.success;
    } catch (error) {
      console.warn('OpenAI 服务检查失败:', error);
    }

    // 测试 DeepSeek
    try {
      const deepseekResult = await callAI({
        prompt: 'Hello',
        model: 'deepseek-chat',
        maxTokens: 10
      });
      status.deepseek = deepseekResult.success;
    } catch (error) {
      console.warn('DeepSeek 服务检查失败:', error);
    }

    // 测试 Gemini
    try {
      const geminiResult = await callAI({
        prompt: 'Hello',
        model: 'gemini-pro',
        maxTokens: 10
      });
      status.gemini = geminiResult.success;
    } catch (error) {
      console.warn('Gemini 服务检查失败:', error);
    }

    // 生成状态消息
    const workingServices = [];
    if (status.openai) workingServices.push('OpenAI');
    if (status.deepseek) workingServices.push('DeepSeek');
    if (status.gemini) workingServices.push('Gemini');

    if (workingServices.length > 0) {
      status.message = `AI服务正常: ${workingServices.join(', ')}`;
    } else {
      status.message = '所有AI服务均不可用，请检查API配置';
    }

    return status;
  } catch (error) {
    return {
      openai: false,
      gemini: false,
      deepseek: false,
      message: `AI服务检查失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 获取AI模型列表
 * 
 * @returns 可用模型列表
 */
export function getAvailableModels(): AIModel[] {
  return [
    'gpt-4o', // ✅ FIXED: 优先推荐GPT-4o（已验证有效）
    'gpt-4',
    'gpt-4-turbo',
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gemini-pro',
    'deepseek-chat',
    'deepseek-v3',
    'claude-3',
    'qwen',
    'llama',
    'mistral'
  ];
}

/**
 * 估算AI调用成本
 * 
 * @param prompt 提示词
 * @param model 模型
 * @returns 估算成本（美元）
 */
export function estimateAICost(prompt: string, model: AIModel = 'gpt-4'): number {
  const promptTokens = Math.ceil(prompt.length / 4); // 粗略估算
  const completionTokens = Math.ceil(promptTokens * 0.5); // 假设回复长度是提示的一半
  
  const costPer1kTokens = {
    'gpt-4': 0.03,
    'gpt-4o': 0.005, // ✅ FIXED: GPT-4o的实际价格
    'gpt-4-turbo': 0.01,
    'gpt-4o-mini': 0.00015, // GPT-4o-mini 的实际价格
    'gpt-3.5-turbo': 0.002,
    'gemini-pro': 0.001,
    'gemini-pro-vision': 0.001,
    'deepseek-chat': 0.002,
    'deepseek-coder': 0.002,
    'deepseek-v3': 0.00014, // DeepSeek V3的实际价格
    'claude-3': 0.015,
    'claude-3-sonnet': 0.015,
    'claude-3-haiku': 0.015,
    'qwen': 0.001,
    'llama': 0.001,
    'mistral': 0.001
  };
  
  const cost = costPer1kTokens[model] || 0.01;
  return (promptTokens + completionTokens) * cost / 1000;
}

/**
 * 生成差异化提示词
 * 确保重新生成的内容与之前的内容有明显差异
 */
function generateVariationPrompt(
  originalPrompt: string,
  originalSystemPrompt?: string,
  options: {
    regenerationSeed?: string;
    variationLevel?: 'slight' | 'moderate' | 'significant';
    styleVariation?: 'tone' | 'structure' | 'vocabulary' | 'approach';
    baseTemperature?: number;
  } = {}
): { prompt: string; systemPrompt?: string; temperature: number } {
  const {
    regenerationSeed,
    variationLevel = 'moderate',
    styleVariation = 'tone',
    baseTemperature = 0.7
  } = options;

  // 根据变化程度调整温度
  const temperatureAdjustments = {
    slight: 0.1,
    moderate: 0.2,
    significant: 0.3
  };

  const adjustedTemperature = Math.min(1.0, baseTemperature + temperatureAdjustments[variationLevel]);

  // 生成差异化指令
  const variationInstructions = generateVariationInstructions(variationLevel, styleVariation);

  // 添加随机种子以确保差异
  const seedInstruction = regenerationSeed
    ? `\n\n【差异化要求】这是第${regenerationSeed}次生成，请确保与之前的版本有明显差异。`
    : `\n\n【差异化要求】请生成与常规版本不同的内容变体。`;

  // 构建增强的提示词
  const enhancedPrompt = `${originalPrompt}${seedInstruction}\n\n${variationInstructions}`;

  // 构建增强的系统提示词
  const systemVariationPrompt = getSystemVariationPrompt(styleVariation);
  const enhancedSystemPrompt = originalSystemPrompt
    ? `${originalSystemPrompt}\n\n${systemVariationPrompt}`
    : systemVariationPrompt;

  return {
    prompt: enhancedPrompt,
    systemPrompt: enhancedSystemPrompt,
    temperature: adjustedTemperature
  };
}

/**
 * 生成变化指令
 */
function generateVariationInstructions(
  variationLevel: 'slight' | 'moderate' | 'significant',
  styleVariation: 'tone' | 'structure' | 'vocabulary' | 'approach'
): string {
  const instructions = {
    slight: {
      tone: '请在保持核心内容不变的基础上，微调语气和表达方式。',
      structure: '请保持主要结构，但调整段落顺序或小标题表述。',
      vocabulary: '请使用同义词替换部分词汇，保持语义一致。',
      approach: '请从稍微不同的角度阐述相同观点。'
    },
    moderate: {
      tone: '请采用不同的语气风格（如更正式/更轻松/更专业），重新表达内容。',
      structure: '请重新组织内容结构，采用不同的逻辑顺序或分段方式。',
      vocabulary: '请使用更丰富的词汇表达，避免重复用词。',
      approach: '请从不同的角度或层面来阐述主题。'
    },
    significant: {
      tone: '请完全改变表达风格和语气，如从学术风格改为通俗风格，或反之。',
      structure: '请采用全新的内容组织方式，如从列表改为叙述，或从问答改为分析。',
      vocabulary: '请使用完全不同的词汇体系和表达方式。',
      approach: '请从全新的视角和方法来处理这个主题。'
    }
  };

  return `【变化要求】${instructions[variationLevel][styleVariation]}`;
}

/**
 * 获取系统级变化提示
 */
function getSystemVariationPrompt(styleVariation: 'tone' | 'structure' | 'vocabulary' | 'approach'): string {
  const systemPrompts = {
    tone: '注意：请特别关注语气和情感色彩的变化，确保与之前的版本有明显的风格差异。',
    structure: '注意：请重点关注内容的组织结构和逻辑顺序，采用不同的表述框架。',
    vocabulary: '注意：请注重词汇选择的多样性，使用丰富的同义词和表达方式。',
    approach: '注意：请从不同的思维角度和方法论来处理内容，提供新的视角。'
  };

  return systemPrompts[styleVariation];
}