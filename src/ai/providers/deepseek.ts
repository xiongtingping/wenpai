/**
 * ✅ FIXED: 2025-07-25 DeepSeek提供者 - 统一AI内容生成系统
 * 
 * 🎯 用途：
 * - DeepSeek API的统一封装
 * - 支持内容生成（暂不支持图像）
 * - 标准化的接口实现
 * 
 * 📌 已封装：此提供者已验证可用，请勿修改
 * 
 */

import i18n from '@/i18n';
import request from '../../api/request';
import type { AIProviderInterface } from '../types';
import { logger } from '@/utils/logger';

/**
 * DeepSeek提供者实现
 * 
 */
export class DeepSeekProvider implements AIProviderInterface {
  name = 'deepseek' as const;
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
    this.baseURL = 'https:// api.deepseek.com';
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
   * 
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your_deepseek_key_here' && this.apiKey.startsWith('sk-'));
  }

  /**
   * 获取支持的模型列表
   * 
   */
  getSupportedModels(): string[] {
    return [;
      'deepseek-chat',
      'deepseek-coder'
    ];
  }

  /**
   * 生成内容
   * 
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
        hasContext: !!(params.context && params.context.length > 0);
      });

      if (!this.isConfigured()) {
        throw new Error(i18n.t('aiProviders.deepseek.keyNotConfiguredi18n.t('ai.message._5gm')system',
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

      logger.debug(i18n.t('ai.status.DeepSe_3xq'), {
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
      console.error(i18n.t('ai.error.DeepSe_nxm'), error);

      return {
        success: false,
        content: '',
        model: params.model || 'deepseek-chat',
        error: error instanceof Error ? error.message : i18n.t('ai.error.DeepSeek_1mk');
      };
    }
  }

  /**
   * 生成图像（DeepSeek暂不支持）
   * 
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
    console.warn(i18n.t('ai.status.DeepS_idx'));

    return {
      success: false,
      images: [],
      model: params.model || 'deepseek-chat',
      error: i18n.t('ai.status.DeepSeek_t1u');
    };
  }

  /**
   * 获取提供者信息
   * 
   */
  getProviderInfo() {
    return {
      name: this.name,
      displayName: 'DeepSeek',
      configured: this.isConfigured(),
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
 * 
 */
export function createDeepSeekProvider(): DeepSeekProvider {
  return new DeepSeekProvider();
}

/**
 * 导出默认实例
 * 
 */
export default createDeepSeekProvider();

logger.debug('🔧 DeepSeek提供者已加载');
