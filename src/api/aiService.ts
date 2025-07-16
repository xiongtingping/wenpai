/**
 * 统一AI服务层
 * 整合所有AI调用逻辑，提供统一的接口
 */

import { getAPIConfig, getAPIEndpoint, isValidAPIKey } from '@/config/apiConfig';

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
  provider?: string;
  timestamp?: string;
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
  private config: ReturnType<typeof getAPIConfig>;

  constructor() {
    this.config = getAPIConfig();
    
    // 检查API密钥配置
    if (!isValidAPIKey(this.config.openai.apiKey, 'openai')) {
      console.warn('⚠️ OpenAI API密钥未正确配置，请在.env.local文件中设置VITE_OPENAI_API_KEY');
    }
  }

  /**
   * 检查AI服务状态
   * @param provider AI提供商
   * @returns Promise<AIStatusResponse>
   */
  async checkStatus(provider: string = 'openai'): Promise<AIStatusResponse> {
    try {
      const response = await fetch(getAPIEndpoint('netlify'), {
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
        // 优先使用真实API调用，确保不使用模拟服务
        if (provider === 'openai' && isValidAPIKey(this.config.openai.apiKey, 'openai')) {
          // 直接调用OpenAI API
          return await this.callOpenAIDevProxy({
            messages,
            model,
            temperature,
            maxTokens
          });
        } else {
          // 通过Netlify函数代理调用
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

    // 检查API密钥配置
    if (!isValidAPIKey(this.config.openai.apiKey, 'openai')) {
      return {
        success: false,
        error: 'OpenAI API密钥未配置，请在.env.local文件中设置VITE_OPENAI_API_KEY'
      };
    }

    for (let attempt = 1; attempt <= DEFAULT_CONFIG.maxRetries; attempt++) {
      try {
        // 优先使用真实API调用
        if (isValidAPIKey(this.config.openai.apiKey, 'openai')) {
          // 直接调用OpenAI DALL-E API
          return await this.callOpenAIImageAPI({
            prompt,
            n,
            size,
            response_format,
            reference_image
          });
        } else {
          // 通过Netlify函数代理调用
          const response = await fetch(getAPIEndpoint('netlify'), {
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
        }
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
      if (!isValidAPIKey(this.config.openai.apiKey, 'openai')) {
        throw new Error('OpenAI API Key未配置，请在.env.local中设置VITE_OPENAI_API_KEY');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_CONFIG.timeout);
      
      const response = await fetch(getAPIEndpoint('openai'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.openai.apiKey}`
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
   * 直接调用OpenAI图像生成API
   * @param options 图像生成选项
   * @returns Promise<ImageGenerationResponse>
   */
  private async callOpenAIImageAPI(options: {
    prompt: string;
    n?: number;
    size?: string;
    response_format?: string;
    reference_image?: string;
  }): Promise<ImageGenerationResponse> {
    const { prompt, n = 1, size = '512x512', response_format = 'url', reference_image } = options;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_CONFIG.timeout);
      
      const requestBody: any = {
        model: 'dall-e-3',
        prompt,
        n,
        size,
        response_format
      };

      // 如果有参考图像，使用DALL-E 3的变体功能
      if (reference_image) {
        requestBody.image = reference_image;
        requestBody.model = 'dall-e-3';
      }
      
      const response = await fetch(getAPIEndpoint('openai').replace('/chat/completions', '/images/generations'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.openai.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI图像生成API调用失败: ${errorData.error?.message || `HTTP ${response.status}`}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          images: data.data.map((item: any) => ({
            url: item.url,
            revised_prompt: item.revised_prompt
          })),
          created: data.created
        },
        provider: 'openai',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI图像生成API请求超时，请检查网络连接或稍后重试');
      }
      throw new Error(`OpenAI图像生成API连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      
      const response = await fetch(getAPIEndpoint('netlify'), {
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
   * @param options 生成选项
   * @returns Promise<AIResponse>
   */
  async generateCreativeContent(options: {
    prompt: string;
    context?: Record<string, unknown>;
    style?: string;
    maxTokens?: number;
    contentType?: 'text' | 'video' | 'social_media' | 'brand_consistent';
  }): Promise<AIResponse> {
    try {
      const {
        prompt,
        context = {},
        style = 'creative',
        maxTokens = DEFAULT_CONFIG.maxTokens,
        contentType = 'text'
      } = options;

      let systemPrompt = '你是一个专业的创意内容创作专家，能够生成有创意的文本内容。';
      
      // 根据内容类型调整系统提示词
      switch (contentType) {
        case 'video':
          systemPrompt = '你是一个专业的视频脚本创作专家，能够生成结构化的视频脚本。';
          break;
        case 'social_media':
          systemPrompt = '你是一个专业的社交媒体内容创作专家，能够生成适合各平台的内容。';
          break;
        case 'brand_consistent':
          systemPrompt = '你是一个专业的品牌内容创作专家，能够生成符合品牌调性的内容。';
          break;
        default:
          systemPrompt = '你是一个专业的创意内容创作专家，能够生成有创意的文本内容。';
      }

      // 构建上下文信息
      let contextInfo = '';
      if (Object.keys(context).length > 0) {
        contextInfo = `\n\n上下文信息：${JSON.stringify(context, null, 2)}`;
      }

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
          content: `${prompt}${contextInfo}\n\n请以${style}的风格生成内容。`
        }
      ];

      return await this.generateText({
        messages,
        maxTokens,
        provider: 'openai'
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创意内容生成失败'
      };
    }
  }

  /**
   * 提取内容
   * @param options 提取选项
   * @returns Promise<AIResponse>
   */
  async extractContent(options: {
    url?: string;
    text?: string;
    contentType: 'markdown' | 'json' | 'html' | 'image' | 'webpage';
    options?: {
      includeMetadata?: boolean;
      extractKeywords?: boolean;
      summarize?: boolean;
    };
  }): Promise<AIResponse> {
    try {
      const { url, text, contentType, options: extractOptions = {} } = options;

      if (!url && !text) {
        return {
          success: false,
          error: '请提供URL或文本内容'
        };
      }

      // 构建提取请求
      const extractRequest: any = {
        provider: 'openai',
        action: 'extract-content',
        contentType,
        options: extractOptions
      };

      if (url) {
        extractRequest.url = url;
      }

      if (text) {
        extractRequest.text = text;
      }

      // 调用Netlify函数
      const response = await fetch('/.netlify/functions/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.error || '内容提取失败'
        };
      }
    } catch (error) {
      console.error('内容提取失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败'
      };
    }
  }
}

// 创建单例实例
const aiService = new AIService();

// 导出实例和类
export default aiService;
export { AIService }; 