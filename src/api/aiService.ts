/**
 * 统一AI服务层
 * 整合所有AI调用逻辑，提供统一的接口
 */

// API端点配置
const API_ENDPOINTS = {
  NETLIFY: '/.netlify/functions/api',
  DEV: 'https://api.openai.com/v1/chat/completions'
};

// 默认配置
const DEFAULT_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000
};

/**
 * AI服务响应接口
 */
export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  provider?: string;
  timestamp?: string;
}

/**
 * 文本生成请求接口
 */
export interface TextGenerationRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: 'openai' | 'deepseek' | 'gemini';
}

/**
 * 图像生成请求接口
 */
export interface ImageGenerationRequest {
  prompt: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  response_format?: 'url' | 'b64_json';
  reference_image?: string; // base64格式
}

/**
 * 图像生成响应接口
 */
export interface ImageGenerationResponse {
  success: boolean;
  data?: {
    images: Array<{
      url: string;
      revised_prompt?: string;
    }>;
    created?: number;
  };
  error?: string;
  message?: string;
}

/**
 * AI服务状态接口
 */
export interface AIStatusResponse {
  success: boolean;
  available: boolean;
  provider: string;
  message?: string;
  error?: string;
}

/**
 * 统一AI服务类
 */
class AIService {
  private apiKey: string;
  private useDevProxy: boolean;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.useDevProxy = import.meta.env.DEV === true;
  }

  /**
   * 检查AI服务状态
   * @param provider AI提供商
   * @returns Promise<AIStatusResponse>
   */
  async checkStatus(provider: string = 'openai'): Promise<AIStatusResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.NETLIFY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          action: 'status'
        })
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        available: data.available || false,
        provider,
        message: data.message,
        error: data.error
      };
    } catch (error) {
      return {
        success: false,
        available: false,
        provider,
        error: error instanceof Error ? error.message : '网络连接失败'
      };
    }
  }

  /**
   * 生成文本内容（带重试机制）
   * @param request 文本生成请求
   * @returns Promise<AIResponse>
   */
  async generateText(request: TextGenerationRequest): Promise<AIResponse> {
    const { messages, model = DEFAULT_CONFIG.model, temperature = DEFAULT_CONFIG.temperature, maxTokens = DEFAULT_CONFIG.maxTokens, provider = 'openai' } = request;

    for (let attempt = 1; attempt <= DEFAULT_CONFIG.maxRetries; attempt++) {
      try {
        if (this.useDevProxy && provider === 'openai') {
          // 开发环境直接调用OpenAI API
          return await this.callOpenAIDevProxy({
            messages,
            model,
            temperature,
            maxTokens
          });
        } else {
          // 生产环境通过Netlify函数代理
          return await this.callNetlifyProxy({
            provider,
            action: 'generate',
            messages,
            model,
            temperature,
            maxTokens
          });
        }
      } catch (error) {
        console.error(`AI文本生成失败 (尝试 ${attempt}/${DEFAULT_CONFIG.maxRetries}):`, error);
        
        if (attempt === DEFAULT_CONFIG.maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : '文本生成失败',
            message: `经过${DEFAULT_CONFIG.maxRetries}次尝试后仍然失败`
          };
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.retryDelay * attempt));
      }
    }

    return {
      success: false,
      error: '文本生成失败'
    };
  }

  /**
   * 生成图像（带重试机制）
   * @param request 图像生成请求
   * @returns Promise<ImageGenerationResponse>
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const { prompt, n = 1, size = '512x512', response_format = 'url', reference_image } = request;

    for (let attempt = 1; attempt <= DEFAULT_CONFIG.maxRetries; attempt++) {
      try {
        const response = await fetch(API_ENDPOINTS.NETLIFY, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: 'openai',
            action: 'generate-image',
            prompt,
            n,
            size,
            response_format,
            reference_image
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`AI图像生成失败 (尝试 ${attempt}/${DEFAULT_CONFIG.maxRetries}):`, error);
        
        if (attempt === DEFAULT_CONFIG.maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : '图像生成失败',
            message: `经过${DEFAULT_CONFIG.maxRetries}次尝试后仍然失败`
          };
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.retryDelay * attempt));
      }
    }

    return {
      success: false,
      error: '图像生成失败'
    };
  }

  /**
   * 批量生成图像
   * @param prompts 提示词数组
   * @param options 生成选项
   * @returns Promise<ImageGenerationResponse[]>
   */
  async generateImagesBatch(
    prompts: string[], 
    options: Omit<ImageGenerationRequest, 'prompt'> = {}
  ): Promise<ImageGenerationResponse[]> {
    const results: ImageGenerationResponse[] = [];
    
    for (const prompt of prompts) {
      try {
        const result = await this.generateImage({ ...options, prompt });
        results.push(result);
        
        // 添加延迟避免API限制
        if (prompts.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : '批量图像生成失败'
        });
      }
    }
    
    return results;
  }

  /**
   * 调用开发环境OpenAI代理
   * @param options 请求选项
   * @returns Promise<AIResponse>
   */
  private async callOpenAIDevProxy(options: {
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIResponse> {
    const { messages, model = 'gpt-4o', temperature = 0.7, maxTokens = 1000 } = options;
    
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API Key未配置，请在.env.local中设置VITE_OPENAI_API_KEY');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_CONFIG.timeout);
      
      const response = await fetch(API_ENDPOINTS.DEV, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API调用失败: ${errorData.error?.message || `HTTP ${response.status}`}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          data: data
        },
        provider: 'openai',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI API请求超时，请检查网络连接或稍后重试');
      }
      throw new Error(`OpenAI API连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 调用Netlify代理
   * @param request 请求参数
   * @returns Promise<AIResponse>
   */
  private async callNetlifyProxy(request: Record<string, unknown>): Promise<AIResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_CONFIG.timeout);
      
      const response = await fetch(API_ENDPOINTS.NETLIFY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        provider: request.provider as string,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Netlify代理请求超时，请检查网络连接');
      }
      throw new Error(`Netlify代理调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 内容适配
   * @param originalContent 原始内容
   * @param targetPlatforms 目标平台
   * @param settings 设置
   * @returns Promise<AIResponse>
   */
  async adaptContent(
    originalContent: string,
    targetPlatforms: string[],
    settings?: Record<string, unknown>
  ): Promise<AIResponse> {
    try {
      const messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }> = [
        {
          role: 'system',
          content: '你是一个专业的内容适配专家，能够将内容适配到不同的平台。'
        },
        {
          role: 'user',
          content: `请将以下内容适配到平台：${targetPlatforms.join(', ')}\n\n内容：${originalContent}`
        }
      ];

      return await this.generateText({
        messages,
        provider: 'openai'
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '内容适配失败'
      };
    }
  }

  /**
   * 内容总结
   * @param content 内容
   * @returns Promise<AIResponse>
   */
  async summarizeContent(content: string): Promise<AIResponse> {
    try {
      const messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }> = [
        {
          role: 'system',
          content: '你是一个专业的内容总结专家，能够生成简洁有用的总结。'
        },
        {
          role: 'user',
          content: `请为以下内容生成AI智能总结：\n\n${content}`
        }
      ];

      return await this.generateText({
        messages,
        provider: 'openai'
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '内容总结失败'
      };
    }
  }

  /**
   * 品牌内容分析
   * @param content 内容
   * @returns Promise<AIResponse>
   */
  async analyzeBrandContent(content: string): Promise<AIResponse> {
    try {
      const messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }> = [
        {
          role: 'system',
          content: '你是一个专业的品牌分析专家，能够分析品牌调性、关键词和建议。请以JSON格式返回结果。'
        },
        {
          role: 'user',
          content: `请分析以下品牌内容：\n\n${content}\n\n请返回JSON格式的分析结果，包含：keywords（关键词数组）、tone（语气分析）、suggestions（建议数组）`
        }
      ];

      return await this.generateText({
        messages,
        provider: 'openai'
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '品牌内容分析失败'
      };
    }
  }

  /**
   * 检查内容调性
   * @param content 内容
   * @param brandProfile 品牌档案
   * @returns Promise<AIResponse>
   */
  async checkContentTone(content: string, brandProfile: Record<string, unknown>): Promise<AIResponse> {
    try {
      const messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }> = [
        {
          role: 'system',
          content: '你是一个专业的品牌调性检查专家，能够评估内容是否符合品牌调性。'
        },
        {
          role: 'user',
          content: `请检查以下内容是否符合品牌调性：\n\n内容：${content}\n\n品牌档案：${JSON.stringify(brandProfile)}`
        }
      ];

      return await this.generateText({
        messages,
        provider: 'openai'
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '内容调性检查失败'
      };
    }
  }

  /**
   * Emoji推荐
   * @param contentContext 内容上下文
   * @returns Promise<AIResponse>
   */
  async recommendEmojis(contentContext: string): Promise<AIResponse> {
    try {
      const messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }> = [
        {
          role: 'system',
          content: '你是一个专业的Emoji推荐专家，能够为内容推荐合适的Emoji。'
        },
        {
          role: 'user',
          content: `请为以下内容推荐合适的Emoji：\n\n${contentContext}`
        }
      ];

      return await this.generateText({
        messages,
        provider: 'openai'
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Emoji推荐失败'
      };
    }
  }

  /**
   * 生成创意内容
   * @param prompt 提示词
   * @param contentType 内容类型
   * @returns Promise<AIResponse>
   */
  async generateCreativeContent(prompt: string, contentType: 'text' | 'video' = 'text'): Promise<AIResponse> {
    try {
      const systemPrompt = contentType === 'video' 
        ? '你是一个专业的视频脚本创作专家，能够生成结构化的视频脚本。'
        : '你是一个专业的创意内容创作专家，能够生成有创意的文本内容。';

      const messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }> = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      return await this.generateText({
        messages,
        provider: 'openai'
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创意内容生成失败'
      };
    }
  }
}

// 创建单例实例
const aiService = new AIService();

// 导出实例和类
export default aiService;
export { AIService }; 