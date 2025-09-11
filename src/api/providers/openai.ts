/**
 * ✅ FIXED: 2025-07-25 OpenAI服务商提供者
 * 
 * 🎯 用途：
 * - OpenAI API的统一封装
 * - 支持聊天和图像生成功能
 * - 标准化的接口实现
 * 
 * 📌 已封装：此提供者已验证可用，请勿修改
 * 
 */

import request from '../request';
import type { AICallParams, AIResponse, ImageGenerationParams } from '../types';
import { logger } from '@/utils/logger';
import { getAIEndpoint } from '@/config/aiEndpoints';

/**
 * OpenAI服务商配置 - 🔧 已迁移到统一端点管理
 * 
 */
export const OPENAI_CONFIG = {
  name: 'openai',
  displayName: 'OpenAI',
  baseURL: getAIEndpoint('openai')?.baseURL || 'https://api.openai.com', // 备用硬编码
  models: {
    chat: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ],
    image: [
      'dall-e-3',
      'dall-e-2'
    ]
  },
  limits: {
    maxTokens: 4096,
    maxPromptLength: 32000
  }
};

/**
 * OpenAI服务商实现类
 * 
 */
export class OpenAIProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = OPENAI_CONFIG.baseURL;
  }

  /**
   * 检查API密钥是否有效
   * 
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your_openai_key_here' && this.apiKey.startsWith('sk-'));
  }

  /**
   * 获取支持的模型列表
   * 
   */
  getSupportedModels(): string[] {
    return [...OPENAI_CONFIG.models.chat, ...OPENAI_CONFIG.models.image];
  }

  /**
   * 检查模型是否支持
   * 
   */
  isModelSupported(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }

  /**
   * 调用OpenAI聊天接口
   * 
   */
  async callChat(params: AICallParams): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 调用OpenAI聊天接口:', {
        model: params.model,
        promptLength: params.prompt.length,
        hasContext: !!(params.context && params.context.length > 0),
        hasSystem: !!params.systemPrompt
      });

      const messages = [];
      
      // 添加系统消息
      if (params.systemPrompt) {
        messages.push({
          role: 'system',
          content: params.systemPrompt
        });
      }

      // 添加上下文消息
      if (params.context && Array.isArray(params.context) && params.context.length > 0) {
        messages.push(...params.context);
      }

      // 添加用户消息
      messages.push({
        role: 'user',
        content: params.prompt
      });

      const requestData = {
        model: params.model || 'gpt-4o',
        messages,
        max_tokens: params.maxTokens || 1000,
        temperature: params.temperature || 0.7,
        stream: params.stream || false
      };

      const response = await request.post(`${this.baseURL}/v1/chat/completions`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;
      const content = response.choices?.[0]?.message?.content || '';
      
      logger.debug('✅ OpenAI调用成功:', {
        model: requestData.model,
        responseTime: `${responseTime}ms`,
        contentLength: content.length,
        usage: response.usage
      });

      return {
        content,
        model: requestData.model,
        usage: response.usage,
        responseTime,
        success: true
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ OpenAI调用失败:', error);
      
      return {
        content: '',
        model: params.model || 'gpt-4o',
        usage: undefined,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'OpenAI调用失败'
      };
    }
  }

  /**
   * 调用OpenAI图像生成接口
   * 
   */
  async generateImage(params: ImageGenerationParams): Promise<any> {
    try {
      console.log('🖼️ 调用OpenAI图像生成接口:', {
        model: params.model,
        prompt: params.prompt.substring(0, 50) + '...',
        size: params.size,
        n: params.n
      });

      const requestData = {
        model: params.model || 'dall-e-3',
        prompt: params.prompt,
        n: params.n || 1,
        size: params.size || '1024x1024',
        response_format: params.response_format || 'url'
      };

      const response = await request.post(`${this.baseURL}/v1/images/generations`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      logger.debug('✅ OpenAI图像生成成功:', {
        model: requestData.model,
        imagesCount: response.data?.length || 0
      });

      return {
        success: true,
        data: response.data,
        model: requestData.model
      };

    } catch (error) {
      console.error('❌ OpenAI图像生成失败:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OpenAI图像生成失败'
      };
    }
  }

  /**
   * 获取提供者信息
   * 
   */
  getProviderInfo() {
    return {
      name: OPENAI_CONFIG.name,
      displayName: OPENAI_CONFIG.displayName,
      configured: this.isConfigured(),
      models: OPENAI_CONFIG.models,
      limits: OPENAI_CONFIG.limits
    };
  }
}

/**
 * 创建OpenAI提供者实例
 * 
 */
export function createOpenAIProvider(apiKey: string): OpenAIProvider {
  return new OpenAIProvider(apiKey);
}

/**
 * 导出默认配置
 * 
 */
export default {
  config: OPENAI_CONFIG,
  provider: OpenAIProvider,
  create: createOpenAIProvider
};

logger.debug('🔧 OpenAI提供者已加载');
