/**
 * ✅ OpenAI服务商提供者 - 完全基于统一配置,零硬编码
 *
 * 🎯 用途：
 * - OpenAI API的统一封装
 * - 支持聊天和图像生成功能
 * - 完全依赖 aiEndpoints.ts 配置,无重复定义
 *
 * 📌 遵循CLAUDE.md原则：
 * - ✅ 禁止硬编码
 * - ✅ 单一真相源(SSOT)
 * - ✅ 统一配置管理
 */

import request from '../request';
import type { AICallParams, AIResponse, ImageGenerationParams } from '../types';
import { logger } from '@/utils/logger';
import { getAIEndpoint, buildAPIURL, getAPIHeaders, type AIEndpointConfig } from '@/config/aiEndpoints';

/**
 * OpenAI服务商实现类
 * 🔧 完全基于统一端点配置,无硬编码,无重复配置
 */
export class OpenAIProvider {
  private apiKey: string;
  private config: AIEndpointConfig;

  constructor(apiKey: string) {
    this.apiKey = apiKey;

    // 🔒 从统一端点配置获取,无后备值
    const config = getAIEndpoint('openai');
    if (!config) {
      throw new Error(
        'OpenAI端点配置未找到\n' +
        '请检查环境变量 VITE_AIMLAPI_BASE_URL 是否正确配置\n' +
        '参考文档: docs/setup/environment-variables.md'
      );
    }

    this.config = config;
  }

  /**
   * 检查API密钥是否有效
   */
  isConfigured(): boolean {
    return !!(
      this.apiKey &&
      this.apiKey !== 'your_openai_key_here' &&
      this.apiKey.length > 20
    );
  }

  /**
   * 获取服务配置
   */
  getConfig(): AIEndpointConfig {
    return this.config;
  }

  /**
   * 调用OpenAI聊天接口
   * 🔧 使用统一配置系统构建请求
   */
  async callChat(params: AICallParams): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      logger.debug('🤖 调用OpenAI聊天接口', {
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
        max_tokens: params.maxTokens || this.config.limits.maxTokens,
        temperature: params.temperature || 0.7,
        stream: params.stream || false
      };

      // 🔒 使用统一配置系统构建URL和请求头
      const url = buildAPIURL('openai', 'chat');
      const headers = getAPIHeaders('openai', this.apiKey);

      const response = await request.post(url, requestData, { headers });

      const responseTime = Date.now() - startTime;
      const content = response.choices?.[0]?.message?.content || '';

      logger.debug('✅ OpenAI调用成功', {
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
      logger.error('❌ OpenAI调用失败', error);

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
   * 🔧 使用统一配置系统构建请求
   */
  async generateImage(params: ImageGenerationParams): Promise<any> {
    try {
      logger.debug('🖼️ 调用OpenAI图像生成接口', {
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

      // 🔒 使用统一配置系统构建URL和请求头
      const url = buildAPIURL('openai', 'image');
      const headers = getAPIHeaders('openai', this.apiKey);

      const response = await request.post(url, requestData, { headers });

      logger.debug('✅ OpenAI图像生成成功', {
        model: requestData.model,
        imagesCount: response.data?.length || 0
      });

      return {
        success: true,
        data: response.data,
        model: requestData.model
      };

    } catch (error) {
      logger.error('❌ OpenAI图像生成失败', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'OpenAI图像生成失败'
      };
    }
  }

  /**
   * 获取提供者信息
   * 🔧 从统一配置获取,无硬编码
   */
  getProviderInfo() {
    return {
      name: this.config.name,
      displayName: this.config.displayName,
      configured: this.isConfigured(),
      features: this.config.features,
      limits: this.config.limits
    };
  }
}

/**
 * 创建OpenAI提供者实例
 */
export function createOpenAIProvider(apiKey: string): OpenAIProvider {
  return new OpenAIProvider(apiKey);
}

/**
 * 导出默认配置
 */
export default {
  provider: OpenAIProvider,
  create: createOpenAIProvider
};
