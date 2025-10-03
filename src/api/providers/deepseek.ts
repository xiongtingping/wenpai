/**
 * ✅ DeepSeek服务商提供者 - 完全基于统一配置,零硬编码
 *
 * 🎯 用途：
 * - DeepSeek API的统一封装
 * - 支持聊天功能（暂不支持图像生成）
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
 * DeepSeek服务商实现类
 * 🔧 完全基于统一端点配置,无硬编码,无重复配置
 */
export class DeepSeekProvider {
  private apiKey: string;
  private config: AIEndpointConfig;

  constructor(apiKey: string) {
    this.apiKey = apiKey;

    // 🔒 从统一端点配置获取,无后备值
    const config = getAIEndpoint('deepseek');
    if (!config) {
      throw new Error(
        'DeepSeek端点配置未找到\n' +
        '请检查环境变量 VITE_DEEPSEEK_BASE_URL 是否正确配置\n' +
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
      this.apiKey !== 'your_deepseek_key_here' &&
      this.apiKey.startsWith('sk-')
    );
  }

  /**
   * 获取服务配置
   */
  getConfig(): AIEndpointConfig {
    return this.config;
  }

  /**
   * 调用DeepSeek聊天接口
   * 🔧 使用统一配置系统构建请求
   */
  async callChat(params: AICallParams): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      logger.debug('🤖 调用DeepSeek聊天接口', {
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
        model: params.model || 'deepseek-chat',
        messages,
        max_tokens: params.maxTokens || this.config.limits.maxTokens,
        temperature: params.temperature || 0.7,
        stream: params.stream || false
      };

      // 🔒 使用统一配置系统构建URL和请求头
      const url = buildAPIURL('deepseek', 'chat');
      const headers = getAPIHeaders('deepseek', this.apiKey);

      const response = await request.post(url, requestData, { headers });

      const responseTime = Date.now() - startTime;
      const content = response.choices?.[0]?.message?.content || '';

      logger.debug('✅ DeepSeek调用成功', {
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
      logger.error('❌ DeepSeek调用失败', error);

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
   * 图像生成接口 - DeepSeek暂不支持
   */
  async generateImage(params: ImageGenerationParams): Promise<any> {
    logger.warn('⚠️ DeepSeek暂不支持图像生成功能');

    return {
      success: false,
      error: 'DeepSeek暂不支持图像生成功能'
    };
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
 * 创建DeepSeek提供者实例
 */
export function createDeepSeekProvider(apiKey: string): DeepSeekProvider {
  return new DeepSeekProvider(apiKey);
}

/**
 * 导出默认配置
 */
export default {
  provider: DeepSeekProvider,
  create: createDeepSeekProvider
};
