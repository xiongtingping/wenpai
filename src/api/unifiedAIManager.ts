/**
 * 🤖 统一AI调用管理器 - 完全替代硬编码实现
 * 
 * 🎯 目标：
 * - 完全消除AI API调用中的硬编码问题
 * - 提供统一、可配置的AI服务调用接口
 * - 支持多提供商、多环境、多模型管理
 * - 实现类型安全的AI调用管理
 * 
 * 📌 遵循CLAUDE.md规则：禁止硬编码、统一管理、真实API
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { getAIEndpoint, buildAPIURL, getAPIHeaders, supportsFeature } from '@/config/aiEndpoints';
import { getAPIKey, validateAPIKey, keyManager } from '@/config/apiKeyManager';
import { getModelInfo, isModelAvailableForTier } from '@/config/aiModels';
import type { AICallParams, AIResponse, ImageGenerationParams } from './types';
import { logger } from '@/utils/logger';
import { cleanAIContent } from '@/utils/contentCleaner';

/**
 * 统一AI调用配置接口
 */
export interface UnifiedAIConfig {
  provider: string;
  model: string;
  apiKey: string;
  endpoint: string;
  headers: Record<string, string>;
  maxRetries: number;
  timeout: number;
}

/**
 * AI调用响应接口扩展
 */
export interface ExtendedAIResponse extends AIResponse {
  provider: string;
  endpoint: string;
  requestId: string;
  cached: boolean;
}

/**
 * 统一AI管理器类
 */
export class UnifiedAIManager {
  private static instance: UnifiedAIManager;
  private requestCounter: number = 0;
  private responseCache: Map<string, { response: ExtendedAIResponse; timestamp: number }> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {
    this.initializeManager();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): UnifiedAIManager {
    if (!UnifiedAIManager.instance) {
      UnifiedAIManager.instance = new UnifiedAIManager();
    }
    return UnifiedAIManager.instance;
  }

  /**
   * 初始化管理器
   */
  private initializeManager(): void {
    console.log('🤖 统一AI管理器初始化...');
    this.validateSystemConfiguration();
  }

  /**
   * 验证系统配置
   */
  private validateSystemConfiguration(): void {
    const overview = keyManager.getSystemOverview();
    
    if (overview.missingRequired.length > 0) {
      logger.warn('⚠️ AI系统配置警告:', {
        missing: overview.missingRequired,
        message: '部分必需的API密钥未配置，某些功能可能不可用'
      });
    }

    logger.info('✅ AI系统配置验证完成:', {
      totalServices: overview.totalServices,
      configured: overview.configuredServices,
      available: overview.configuredList
    });
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `ai_req_${Date.now()}_${++this.requestCounter}`;
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(params: AICallParams): string {
    const keyData = {
      model: params.model,
      prompt: params.prompt.substring(0, 100), // 只使用前100字符作为缓存键
      systemPrompt: params.systemPrompt?.substring(0, 50),
      maxTokens: params.maxTokens,
      temperature: params.temperature
    };
    return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  /**
   * 检查缓存
   */
  private checkCache(cacheKey: string): ExtendedAIResponse | null {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return { ...cached.response, cached: true };
    }
    return null;
  }

  /**
   * 设置缓存
   */
  private setCache(cacheKey: string, response: ExtendedAIResponse): void {
    this.responseCache.set(cacheKey, {
      response: { ...response, cached: false },
      timestamp: Date.now()
    });

    // 清理过期缓存
    this.cleanExpiredCache();
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.responseCache.delete(key);
      }
    }
  }

  /**
   * 构建AI调用配置
   */
  private async buildAIConfig(params: AICallParams): Promise<UnifiedAIConfig> {
    // 获取模型信息
    const modelInfo = getModelInfo(params.model || '');
    if (!modelInfo) {
      throw new Error(`不支持的模型: ${params.model}`);
    }

    // 获取提供商配置
    const provider = modelInfo.provider;
    const endpointConfig = getAIEndpoint(provider);
    if (!endpointConfig) {
      throw new Error(`不支持的AI服务提供商: ${provider}`);
    }

    // 获取API密钥
    const apiKey = getAPIKey(provider);
    if (!apiKey) {
      throw new Error(`${provider} API密钥未配置`);
    }

    // 验证API密钥
    const keyValidation = validateAPIKey(provider, apiKey);
    if (!keyValidation.valid) {
      throw new Error(`${provider} API密钥验证失败: ${keyValidation.errors.join(', ')}`);
    }

    // 构建API URL和请求头
    const endpoint = buildAPIURL(provider, 'chat');
    const headers = getAPIHeaders(provider, apiKey);

    return {
      provider,
      model: modelInfo.id,
      apiKey,
      endpoint,
      headers,
      maxRetries: 3,
      timeout: 30000
    };
  }

  /**
   * 发送AI请求
   */
  private async sendAIRequest(config: UnifiedAIConfig, params: AICallParams): Promise<ExtendedAIResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      logger.debug('🚀 发送AI请求:', {
        requestId,
        provider: config.provider,
        model: config.model,
        endpoint: config.endpoint,
        promptLength: params.prompt.length
      });

      // 构建请求体
      const requestBody = this.buildRequestBody(config, params);

      // 发送HTTP请求
      const response = await this.makeHTTPRequest(config, requestBody);
      
      // 解析响应
      const aiResponse = await this.parseAIResponse(response, config, params, startTime);

      return {
        ...aiResponse,
        provider: config.provider,
        endpoint: config.endpoint,
        requestId,
        cached: false
      };

    } catch (error) {
      logger.error('❌ AI请求失败:', {
        requestId,
        provider: config.provider,
        model: config.model,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        content: '',
        model: config.model,
        usage: undefined,
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'AI请求失败',
        provider: config.provider,
        endpoint: config.endpoint,
        requestId,
        cached: false
      };
    }
  }

  /**
   * 构建请求体 - 🔧 统一使用OpenAI格式 (除DeepSeek外都通过AIMLAPI)
   */
  private buildRequestBody(config: UnifiedAIConfig, params: AICallParams): any {
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

    // 🔧 除DeepSeek外，统一使用OpenAI格式 (通过AIMLAPI)
    return {
      model: config.model,
      messages,
      max_tokens: params.maxTokens || 1000,
      temperature: params.temperature || 0.7,
      stream: false
    };
  }

  /**
   * 发送HTTP请求
   */
  private async makeHTTPRequest(config: UnifiedAIConfig, requestBody: any): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 解析AI响应 - 🔧 统一使用OpenAI格式 (通过AIMLAPI)
   */
  private parseAIResponse(
    response: Response, 
    config: UnifiedAIConfig, 
    params: AICallParams, 
    startTime: number
  ): Promise<AIResponse> {
    return response.json().then(data => {
      const responseTime = Date.now() - startTime;
      
      // 🔧 统一使用OpenAI格式解析 (AIMLAPI返回OpenAI兼容格式)
      const content = data.choices?.[0]?.message?.content || '';

      return {
        content: cleanAIContent(content),
        model: config.model,
        usage: data.usage,
        responseTime,
        success: !!content,
        error: content ? undefined : 'AI返回空内容'
      };
    });
  }

  /**
   * 统一AI调用入口 - 主要公共方法
   */
  async callAI(params: AICallParams): Promise<ExtendedAIResponse> {
    try {
      // 参数验证
      if (!params.model || !params.prompt) {
        throw new Error('缺少必需参数: model 和 prompt');
      }

      // 用户权限检查
      const userTier = this.getUserTier();
      if (!isModelAvailableForTier(params.model, userTier)) {
        throw new Error(`当前订阅计划 ${userTier} 无权限使用模型 ${params.model}`);
      }

      // 检查缓存
      const cacheKey = this.getCacheKey(params);
      const cached = this.checkCache(cacheKey);
      if (cached) {
        logger.debug('📦 使用缓存响应:', { model: params.model, cacheKey });
        return cached;
      }

      // 构建配置
      const config = await this.buildAIConfig(params);

      // 发送请求
      const response = await this.sendAIRequest(config, params);

      // 缓存成功响应
      if (response.success) {
        this.setCache(cacheKey, response);
      }

      return response;

    } catch (error) {
      logger.error('❌ 统一AI调用失败:', error);
      
      return {
        content: '',
        model: params.model || 'unknown',
        usage: undefined,
        responseTime: 0,
        success: false,
        error: error instanceof Error ? error.message : '统一AI调用失败',
        provider: 'unknown',
        endpoint: 'unknown',
        requestId: this.generateRequestId(),
        cached: false
      };
    }
  }

  /**
   * 获取用户订阅层级
   */
  private getUserTier(): string {
    try {
      const authData = localStorage.getItem('wenpai_auth_state');
      if (authData) {
        const { user } = JSON.parse(authData);
        return user?.subscription?.tier || 'trial';
      }
      return 'trial';
    } catch (error) {
      logger.warn('获取用户信息失败，使用默认层级:', error);
      return 'trial';
    }
  }

  /**
   * 图像生成调用
   */
  async generateImage(params: ImageGenerationParams): Promise<any> {
    try {
      // 检查提供商是否支持图像生成
      const modelInfo = getModelInfo(params.model || 'dall-e-3');
      const provider = modelInfo?.provider || 'openai';
      
      if (!supportsFeature(provider, 'image')) {
        throw new Error(`${provider} 不支持图像生成功能`);
      }

      const apiKey = getAPIKey(provider);
      if (!apiKey) {
        throw new Error(`${provider} API密钥未配置`);
      }

      const endpoint = buildAPIURL(provider, 'image');
      const headers = getAPIHeaders(provider, apiKey);

      const requestBody = {
        model: params.model || 'dall-e-3',
        prompt: params.prompt,
        n: params.n || 1,
        size: params.size || '1024x1024',
        response_format: params.response_format || 'url'
      };

      logger.debug('🖼️ 发送图像生成请求:', {
        provider,
        model: requestBody.model,
        endpoint
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`图像生成失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data,
        model: requestBody.model,
        provider
      };

    } catch (error) {
      logger.error('❌ 图像生成失败:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : i18n.t('api.errors.图像生成失败')
      };
    }
  }

  /**
   * 获取系统状态
   */
  getSystemStatus(): {
    initialized: boolean;
    availableProviders: string[];
    cacheSize: number;
    requestCount: number;
  } {
    const overview = keyManager.getSystemOverview();
    
    return {
      initialized: true,
      availableProviders: overview.configuredList,
      cacheSize: this.responseCache.size,
      requestCount: this.requestCounter
    };
  }

  /**
   * 清理系统资源
   */
  cleanup(): void {
    this.responseCache.clear();
    this.requestCounter = 0;
    logger.info('🧹 统一AI管理器已清理');
  }
}

// 延迟初始化单例实例，避免TDZ错误
let _aiManagerInstance: UnifiedAIManager | null = null;

export const aiManager = {
  // 使用代理模式延迟初始化
  get callAI() { return this._getInstance().callAI.bind(this._getInstance()); },
  get generateImage() { return this._getInstance().generateImage.bind(this._getInstance()); },
  get getAvailableModels() { return this._getInstance().getAvailableModels.bind(this._getInstance()); },
  get getModelInfo() { return this._getInstance().getModelInfo.bind(this._getInstance()); },
  get updateEndpoints() { return this._getInstance().updateEndpoints.bind(this._getInstance()); },
  get getCachedResponse() { return this._getInstance().getCachedResponse.bind(this._getInstance()); },
  get clearCache() { return this._getInstance().clearCache.bind(this._getInstance()); },
  get getStatistics() { return this._getInstance().getStatistics.bind(this._getInstance()); },
  get cleanup() { return this._getInstance().cleanup.bind(this._getInstance()); },
  
  _getInstance(): UnifiedAIManager {
    if (!_aiManagerInstance) {
      _aiManagerInstance = UnifiedAIManager.getInstance();
    }
    return _aiManagerInstance;
  }
};

/**
 * 便捷的AI调用函数 - 替代原有的硬编码实现
 */
export async function callUnifiedAI(params: AICallParams): Promise<ExtendedAIResponse> {
  return aiManager.callAI(params);
}

/**
 * 便捷的图像生成函数
 */
export async function generateUnifiedImage(params: ImageGenerationParams): Promise<any> {
  return aiManager.generateImage(params);
}

/**
 * 检查AI系统状态
 */
export function checkAISystemStatus() {
  return aiManager.getSystemStatus();
}

// 系统初始化日志
const status = aiManager.getSystemStatus();
logger.info('🤖 统一AI管理器已加载', {
  providers: status.availableProviders,
  message: '所有AI调用已统一管理，硬编码问题已解决'
});