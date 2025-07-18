/**
 * 统一AI服务层
 * 整合所有AI调用逻辑，提供统一的接口
 */

import { getAPIConfig, getAPIEndpoint, isValidAPIKey } from '@/config/apiConfig';
import { callAI, callAIWithRetry, generateImage, AIModel, ImageModel } from './ai';

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
   * 生成文本内容（使用统一AI API）
   * @param request 文本生成请求
   * @returns Promise<AIResponse>
   */
  async generateText(request: TextGenerationRequest): Promise<AIResponse> {
    const { messages, model = DEFAULT_CONFIG.model, temperature = DEFAULT_CONFIG.temperature, maxTokens = DEFAULT_CONFIG.maxTokens, provider = 'openai' } = request;

    try {
      // 构建提示词
      const prompt = messages
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n\n');

      // 获取系统提示词
      const systemPrompt = messages
        .find(msg => msg.role === 'system')?.content;

      // 使用统一的AI API调用
      const result = await callAIWithRetry({
        prompt,
        model: model as AIModel,
        temperature,
        maxTokens,
        systemPrompt
      }, DEFAULT_CONFIG.maxRetries);

      if (result.success) {
        return {
          success: true,
          data: {
            data: {
              choices: [{
                message: {
                  content: result.content
                }
              }],
              usage: result.usage
            }
          },
          provider,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: result.error || '文本生成失败',
          provider,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('AI文本生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '文本生成失败',
        provider,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 生成图像（使用统一AI API）
   * @param request 图像生成请求
   * @returns Promise<ImageGenerationResponse>
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const { prompt, n = 1, size = '512x512', response_format = 'url', reference_image } = request;

    try {
      // 使用统一的图像生成API
      const result = await generateImage({
        prompt,
        model: 'dall-e-3' as ImageModel,
        n,
        size,
        responseFormat: response_format,
        referenceImage: reference_image
      });

      if (result.success) {
        return {
          success: true,
          data: {
            images: result.images,
            created: result.created
          },
          provider: 'openai',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: result.error || '图像生成失败',
          provider: 'openai',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('AI图像生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '图像生成失败',
        provider: 'openai',
        timestamp: new Date().toISOString()
      };
    }
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
          content: `请将以下内容分别适配到${targetPlatforms.length}个平台：${targetPlatforms.join('、')}

原始内容：${originalContent}

请为每个平台生成独立的内容，格式如下：

### ${targetPlatforms[0]}适配
标题：[平台标题]
内容：[适配后的内容]

### ${targetPlatforms[1]}适配
标题：[平台标题]
内容：[适配后的内容]

...（其他平台）

请确保每个平台的内容风格符合该平台的特点，内容要简洁明了，适合该平台的用户群体。`
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