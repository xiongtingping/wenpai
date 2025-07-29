/**
 * ✅ FIXED: 2025-07-25 AI服务商提供者模板
 * 
 * 🎯 用途：
 * - 新增AI服务商的标准模板
 * - 统一接口规范和实现方式
 * - 快速扩展新的AI服务商
 * 
 * 📌 使用方法：
 * 1. 复制此文件为新的服务商名称（如 moonshot.ts）
 * 2. 替换所有 TEMPLATE 为实际服务商名称
 * 3. 实现具体的API调用逻辑
 * 4. 在 ai.ts 中注册新的提供者
 * 
 * 🔓 UNLOCKED: AI 禁止对此模板做任何修改
 */

import request from '../request';
import type { AICallParams, AIResponse, ImageGenerationParams } from '../types';

/**
 * TEMPLATE AI服务商配置
 * 🔓 UNLOCKED: AI 禁止修改此配置结构
 */
export const TEMPLATE_CONFIG = {
  name: 'template',
  displayName: 'Template AI',
  baseURL: 'https://api.template.com',
  models: {
    chat: ['template-chat', 'template-pro'],
    image: ['template-image-1', 'template-image-2']
  },
  limits: {
    maxTokens: 4000,
    maxPromptLength: 8000
  }
};

/**
 * TEMPLATE AI服务商实现类
 * 🔓 UNLOCKED: AI 禁止修改此类结构
 */
export class TemplateProvider {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = TEMPLATE_CONFIG.baseURL;
  }

  /**
   * 检查API密钥是否有效
   * 🔓 UNLOCKED: AI 禁止修改此方法签名
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your_template_key_here');
  }

  /**
   * 获取支持的模型列表
   * 🔓 UNLOCKED: AI 禁止修改此方法签名
   */
  getSupportedModels(): string[] {
    return [...TEMPLATE_CONFIG.models.chat, ...TEMPLATE_CONFIG.models.image];
  }

  /**
   * 检查模型是否支持
   * 🔓 UNLOCKED: AI 禁止修改此方法签名
   */
  isModelSupported(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }

  /**
   * 调用TEMPLATE AI聊天接口
   * 🔓 UNLOCKED: AI 禁止修改此方法签名
   */
  async callChat(params: AICallParams): Promise<AIResponse> {
    try {
      console.log('🤖 调用Template AI聊天接口:', params);

      // TODO: 实现具体的API调用逻辑
      // 以下是示例实现，需要根据实际API文档修改

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
        model: params.model || TEMPLATE_CONFIG.models.chat[0],
        messages,
        max_tokens: params.maxTokens || TEMPLATE_CONFIG.limits.maxTokens,
        temperature: params.temperature || 0.7,
        stream: params.stream || false
      };

      const response = await request.post(`${this.baseURL}/v1/chat/completions`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // 解析响应
      const content = response.choices?.[0]?.message?.content || '';
      
      return {
        content,
        model: params.model || TEMPLATE_CONFIG.models.chat[0],
        usage: response.usage,
        responseTime: 0,
        success: true
      };

    } catch (error) {
      console.error('Template AI调用失败:', error);
      
      return {
        content: '',
        model: params.model || TEMPLATE_CONFIG.models.chat[0],
        usage: undefined,
        responseTime: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Template AI调用失败'
      };
    }
  }

  /**
   * 调用TEMPLATE AI图像生成接口
   * 🔓 UNLOCKED: AI 禁止修改此方法签名
   */
  async generateImage(params: ImageGenerationParams): Promise<any> {
    try {
      console.log('🖼️ 调用Template AI图像生成接口:', params);

      // TODO: 实现具体的图像生成API调用逻辑
      // 以下是示例实现，需要根据实际API文档修改

      const requestData = {
        model: params.model || TEMPLATE_CONFIG.models.image[0],
        prompt: params.prompt,
        n: params.n || 1,
        size: params.size || '512x512',
        response_format: params.response_format || 'url'
      };

      const response = await request.post(`${this.baseURL}/v1/images/generations`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data,
        model: params.model || TEMPLATE_CONFIG.models.image[0]
      };

    } catch (error) {
      console.error('Template AI图像生成失败:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Template AI图像生成失败'
      };
    }
  }

  /**
   * 获取提供者信息
   * 🔓 UNLOCKED: AI 禁止修改此方法签名
   */
  getProviderInfo() {
    return {
      name: TEMPLATE_CONFIG.name,
      displayName: TEMPLATE_CONFIG.displayName,
      configured: this.isConfigured(),
      models: TEMPLATE_CONFIG.models,
      limits: TEMPLATE_CONFIG.limits
    };
  }
}

/**
 * 创建Template AI提供者实例
 * 🔓 UNLOCKED: AI 禁止修改此函数签名
 */
export function createTemplateProvider(apiKey: string): TemplateProvider {
  return new TemplateProvider(apiKey);
}

/**
 * 导出默认配置
 * 🔓 UNLOCKED: AI 禁止修改此导出
 */
export default {
  config: TEMPLATE_CONFIG,
  provider: TemplateProvider,
  create: createTemplateProvider
};

console.log('🔧 Template AI提供者模板已加载');
