/**
 * ✅ FIXED: 2025-07-25 OpenAI提供者 - 统一AI内容生成系统
 * 
 * 🎯 用途：
 * - OpenAI API的统一封装
 * - 支持内容生成和图像生成
 * - 标准化的接口实现
 * 
 * 📌 已封装：此提供者已验证可用，请勿修改
 * 🔓 UNLOCKED: AI 禁止对此文件做任何修改
 */

import request from '../../api/request';
import type { AIProviderInterface } from '../types';

/**
 * OpenAI提供者实现
 * 🔓 UNLOCKED: AI 禁止修改此类
 */
export class OpenAIProvider implements AIProviderInterface {
  name = 'openai' as const;
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseURL = 'https://api.openai.com';
  }

  /**
   * 生成文本
   */
  async generateText(prompt: string, options?: any): Promise<string> {
    const result = await this.generateContent({
      prompt,
      ...options
    });
    return result.content;
  }

  /**
   * 检查是否可用
   */
  isAvailable(): boolean {
    return this.isConfigured();
  }

  /**
   * 检查是否已配置
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your_openai_key_here' && this.apiKey.startsWith('sk-'));
  }

  /**
   * 获取支持的模型列表
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  getSupportedModels(): string[] {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'dall-e-3',
      'dall-e-2'
    ];
  }

  /**
   * 生成内容
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  async generateContent(params: {
    prompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    systemPrompt?: string;
    context?: Array<{ role: string; content: string }>;
  }): Promise<{
    success: boolean;
    content: string;
    model: string;
    usage?: any;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 OpenAI内容生成开始:', {
        model: params.model || 'gpt-4o',
        promptLength: params.prompt.length,
        hasSystem: !!params.systemPrompt,
        hasContext: !!(params.context && params.context.length > 0)
      });

      if (!this.isConfigured()) {
        throw new Error('OpenAI API密钥未配置');
      }

      const messages = [];
      
      // 添加系统提示词
      if (params.systemPrompt) {
        messages.push({
          role: 'system',
          content: params.systemPrompt
        });
      }

      // 添加上下文
      if (params.context && params.context.length > 0) {
        messages.push(...params.context);
      }

      // 添加用户提示词
      messages.push({
        role: 'user',
        content: params.prompt
      });

      const requestData = {
        model: params.model || 'gpt-4o',
        messages,
        max_tokens: params.maxTokens || 2000,
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
      
      console.log('✅ OpenAI内容生成成功:', {
        model: requestData.model,
        responseTime: `${responseTime}ms`,
        contentLength: content.length,
        usage: response.usage
      });

      return {
        success: true,
        content,
        model: requestData.model,
        usage: response.usage
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ OpenAI内容生成失败:', error);
      
      return {
        success: false,
        content: '',
        model: params.model || 'gpt-4o',
        error: error instanceof Error ? error.message : 'OpenAI调用失败'
      };
    }
  }

  /**
   * 生成图像
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  async generateImage(params: {
    prompt: string;
    model?: string;
    size?: string;
    n?: number;
    quality?: string;
  }): Promise<{
    success: boolean;
    images: string[];
    model: string;
    error?: string;
  }> {
    try {
      console.log('🖼️ OpenAI图像生成开始:', {
        model: params.model || 'dall-e-3',
        prompt: params.prompt.substring(0, 50) + '...',
        size: params.size || '1024x1024',
        n: params.n || 1
      });

      if (!this.isConfigured()) {
        throw new Error('OpenAI API密钥未配置');
      }

      const requestData = {
        model: params.model || 'dall-e-3',
        prompt: params.prompt,
        n: params.n || 1,
        size: params.size || '1024x1024',
        quality: params.quality || 'standard',
        response_format: 'url'
      };

      const response = await request.post(`${this.baseURL}/v1/images/generations`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const images = response.data?.map((item: any) => item.url) || [];
      
      console.log('✅ OpenAI图像生成成功:', {
        model: requestData.model,
        imagesCount: images.length
      });

      return {
        success: true,
        images,
        model: requestData.model
      };

    } catch (error) {
      console.error('❌ OpenAI图像生成失败:', error);
      
      return {
        success: false,
        images: [],
        model: params.model || 'dall-e-3',
        error: error instanceof Error ? error.message : 'OpenAI图像生成失败'
      };
    }
  }

  /**
   * 获取提供者信息
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  getProviderInfo() {
    return {
      name: this.name,
      displayName: 'OpenAI',
      configured: this.isConfigured(),
      models: {
        chat: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
        image: ['dall-e-3', 'dall-e-2']
      },
      capabilities: {
        chat: true,
        image: true,
        stream: true,
        function: true
      },
      limits: {
        maxTokens: 4096,
        maxPromptLength: 32000
      }
    };
  }
}

/**
 * 创建OpenAI提供者实例
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function createOpenAIProvider(): OpenAIProvider {
  return new OpenAIProvider();
}

/**
 * 导出默认实例
 * 🔓 UNLOCKED: AI 禁止修改此导出
 */
export default createOpenAIProvider();

console.log('🔧 OpenAI提供者已加载');
