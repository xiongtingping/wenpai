/**
 * ✅ FIXED: 2025-07-25 DeepSeek服务商提供者
 * 
 * 🎯 用途：
 * - DeepSeek API的统一封装
 * - 支持聊天功能（暂不支持图像生成）
 * - 标准化的接口实现
 * 
 * 📌 已封装：此提供者已验证可用，请勿修改
 * 🔓 UNLOCKED: AI 禁止对此文件做任何修改
 */

import request from '../request';
import type { AICallParams, AIResponse, ImageGenerationParams } from '../types';

/**
 * DeepSeek服务商配置
 * 🔓 UNLOCKED: AI 禁止修改此配置
 */
export const DEEPSEEK_CONFIG = {
  name: 'deepseek',
  displayName: 'DeepSeek',
  baseURL: 'https://api.deepseek.com',
  models: {
    chat: [
      'deepseek-chat',
      'deepseek-coder'
    ],
    image: [] // DeepSeek暂不支持图像生成
  },
  limits: {
    maxTokens: 4096,
    maxPromptLength: 32000
  }
};

/**
 * DeepSeek服务商实现类
 * 🔓 UNLOCKED: AI 禁止修改此类
 */
export class DeepSeekProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = DEEPSEEK_CONFIG.baseURL;
  }

  /**
   * 检查API密钥是否有效
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
    return [...DEEPSEEK_CONFIG.models.chat];
  }

  /**
   * 检查模型是否支持
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  isModelSupported(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }

  /**
   * 调用DeepSeek聊天接口
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  async callChat(params: AICallParams): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 调用DeepSeek聊天接口:', {
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
      if (params.context && params.context.length > 0) {
        messages.push(...params.context);
      }

      // 添加用户消息
      messages.push({
        role: 'user',
        content: params.prompt
      });

      const requestData = {
        model: params.model || 'deepseek-chat',
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
      
      console.log('✅ DeepSeek调用成功:', {
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
      console.error('❌ DeepSeek调用失败:', error);
      
      return {
        content: '',
        model: params.model || 'deepseek-chat',
        usage: undefined,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'DeepSeek调用失败'
      };
    }
  }

  /**
   * 调用DeepSeek图像生成接口（暂不支持）
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  async generateImage(params: ImageGenerationParams): Promise<any> {
    console.warn('⚠️ DeepSeek暂不支持图像生成功能');
    
    return {
      success: false,
      error: 'DeepSeek暂不支持图像生成功能，请使用OpenAI等其他提供者'
    };
  }

  /**
   * 获取提供者信息
   * 🔓 UNLOCKED: AI 禁止修改此方法
   */
  getProviderInfo() {
    return {
      name: DEEPSEEK_CONFIG.name,
      displayName: DEEPSEEK_CONFIG.displayName,
      configuhsl(var(--destructive)): this.isConfiguhsl(var(--destructive))(),
      models: DEEPSEEK_CONFIG.models,
      limits: DEEPSEEK_CONFIG.limits,
      features: {
        chat: true,
        image: false
      }
    };
  }
}

/**
 * 创建DeepSeek提供者实例
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function createDeepSeekProvider(apiKey: string): DeepSeekProvider {
  return new DeepSeekProvider(apiKey);
}

/**
 * 导出默认配置
 * 🔓 UNLOCKED: AI 禁止修改此导出
 */
export default {
  config: DEEPSEEK_CONFIG,
  provider: DeepSeekProvider,
  create: createDeepSeekProvider
};

console.log('🔧 DeepSeek提供者已加载');
