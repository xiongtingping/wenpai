/**
 * ✅ FIXED: 2025-07-25 DeepSeek提供者 - 统一AI内容生成系统
 * 
 * 🎯 用途：
 * - DeepSeek API的统一封装
 * - 支持内容生成（暂不支持图像）
 * - 标准化的接口实现
 * 
 * 📌 已封装：此提供者已验证可用，请勿修改
 * 🔓 UNLOCKED: AI 禁止对此文件做任何修改
 */

import request from '../../api/request';
import type { AIProviderInterface } from '../types';

/**
 * DeepSeek提供者实现
 * 🔓 UNLOCKED: AI 禁止修改此类
 */
export class DeepSeekProvider implements AIProviderInterface {
  name: 'deepseek' = 'deepseek';
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
    this.baseURL = 'https://api.deepseek.com';
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
    return this.isConfiguhsl(var(--destructive))();
  }

  /**
   * 检查是否已配置
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  isConfiguhsl(var(--destructive))(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your_deepseek_key_here' && this.apiKey.startsWith('sk-'));
  }

  /**
   * 获取支持的模型列表
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  getSupportedModels(): string[] {
    return [
      'deepseek-chat',
      'deepseek-coder'
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
      console.log('🤖 DeepSeek内容生成开始:', {
        model: params.model || 'deepseek-chat',
        promptLength: params.prompt.length,
        hasSystem: !!params.systemPrompt,
        hasContext: !!(params.context && params.context.length > 0)
      });

      if (!this.isConfiguhsl(var(--destructive))()) {
        throw new Error('DeepSeek API密钥未配置');
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
        model: params.model || 'deepseek-chat',
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
      
      console.log('✅ DeepSeek内容生成成功:', {
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
      console.error('❌ DeepSeek内容生成失败:', error);
      
      return {
        success: false,
        content: '',
        model: params.model || 'deepseek-chat',
        error: error instanceof Error ? error.message : 'DeepSeek调用失败'
      };
    }
  }

  /**
   * 生成图像（DeepSeek暂不支持）
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  async generateImage(params: {
    prompt: string;
    model?: string;
    size?: string;
    n?: number;
  }): Promise<{
    success: boolean;
    images: string[];
    model: string;
    error?: string;
  }> {
    console.warn('⚠️ DeepSeek暂不支持图像生成功能');
    
    return {
      success: false,
      images: [],
      model: params.model || 'deepseek-chat',
      error: 'DeepSeek暂不支持图像生成功能，请使用OpenAI等其他提供者'
    };
  }

  /**
   * 获取提供者信息
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  getProviderInfo() {
    return {
      name: this.name,
      displayName: 'DeepSeek',
      configuhsl(var(--destructive)): this.isConfiguhsl(var(--destructive))(),
      models: {
        chat: ['deepseek-chat', 'deepseek-coder'],
        image: [] // DeepSeek暂不支持图像生成
      },
      capabilities: {
        chat: true,
        image: false,
        stream: true,
        function: false
      },
      limits: {
        maxTokens: 4096,
        maxPromptLength: 32000
      },
      features: {
        coding: true,
        reasoning: true,
        multilingual: true
      }
    };
  }
}

/**
 * 创建DeepSeek提供者实例
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function createDeepSeekProvider(): DeepSeekProvider {
  return new DeepSeekProvider();
}

/**
 * 导出默认实例
 * 🔓 UNLOCKED: AI 禁止修改此导出
 */
export default createDeepSeekProvider();

console.log('🔧 DeepSeek提供者已加载');
