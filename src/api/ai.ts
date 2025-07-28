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

/**
 * AI模型类型定义
 */
export type AIModel = 
  | 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  | 'gemini-pro' | 'gemini-pro-vision'
  | 'deepseek-chat' | 'deepseek-coder'
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
    prompt,
    model = 'gpt-4',
    maxTokens = 1000,
    temperature = 0.7,
    systemPrompt,
    stream = false,
    userId,
    extraParams = {}
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
      model: getModelMapping(model),
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature,
      stream,
      ...extraParams
    };

    // 添加用户信息（如果提供）
    if (userId) {
      requestBody.user = userId;
    }

    // 使用统一请求模块发送请求
    const data = await request.request({
      method: 'POST',
      url: `${apiConfig.openai.baseURL}/chat/completions`,
      data: requestBody,
      headers: {
        'Authorization': `Bearer ${apiConfig.openai.apiKey}`,
        'Content-Type': 'application/json',
        ...(userId && { 'X-User-ID': userId })
      }
    });

    // 处理流式响应
    if (stream) {
      return handleStreamResponse(data, model, startTime);
    }

    // 处理普通响应
    const content = data.choices[0]?.message?.content || '';
    const usage = data.usage;

    return {
      content,
      model,
      usage,
      responseTime: Date.now() - startTime,
      success: true
    };

  } catch (error) {
    console.error('AI API调用失败:', error);
    
    return {
      content: '',
      model,
      responseTime: Date.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
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
    'gpt-4-turbo': 'gpt-4-1106-preview',
    'gpt-3.5-turbo': 'gpt-3.5-turbo',
    'gemini-pro': 'gemini-pro',
    'gemini-pro-vision': 'gemini-pro-vision',
    'deepseek-chat': 'deepseek-chat',
    'deepseek-coder': 'deepseek-coder',
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
  maxRetries: number = 3
): Promise<AIResponse> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await callAI(params);
      
      if (result.success) {
        return result;
      }
      
      lastError = new Error(result.error || '调用失败');
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('未知错误');
    }
    
    // 等待一段时间后重试
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
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
  try {
    const result = await callAI({
      prompt: 'Hello',
      model: 'gpt-3.5-turbo',
      maxTokens: 10
    });

    return {
      openai: result.success,
      gemini: false, // 需要单独测试
      deepseek: false, // 需要单独测试
      message: result.success ? 'AI服务正常' : 'AI服务异常'
    };
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
    'gpt-4',
    'gpt-4-turbo', 
    'gpt-3.5-turbo',
    'gemini-pro',
    'deepseek-chat',
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
    'gpt-4-turbo': 0.01,
    'gpt-3.5-turbo': 0.002,
    'gemini-pro': 0.001,
    'deepseek-chat': 0.002,
    'claude-3': 0.015,
    'qwen': 0.001,
    'llama': 0.001,
    'mistral': 0.001
  };
  
  const cost = costPer1kTokens[model] || 0.01;
  return (promptTokens + completionTokens) * cost / 1000;
} 