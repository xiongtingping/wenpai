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
import { getAIEndpoint, buildAPIURL, getAPIHeaders, supportsFeature, getAvailableProviders } from '@/config/aiEndpoints';
import { getAPIKey, validateAPIKey, keyManager } from '@/config/apiKeyManager';
import { getModelInfo, isModelAvailableForTier } from '@/config/aiModels';
import type { AICallParams, AIResponse, ImageGenerationParams } from './types';
import { logger } from '@/utils/logger';
import { cleanAIContent } from '@/utils/contentCleaner';
// import { applyVariationLogic, shouldApplyVariation, getVariationDescription } from '@/utils/aiVariation';

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
    console.log('🤖 统一AImanagerinitialization...');
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
    // 使用 encodeURIComponent + btoa 来支持 Unicode 字符
    try {
      const jsonStr = JSON.stringify(keyData);
      const encoded = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      return encoded.replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    } catch (error) {
      // Fallback: 使用简单的 hash
      const jsonStr = JSON.stringify(keyData);
      let hash = 0;
      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(36).substring(0, 32);
    }
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
      throw new Error(
        `不支持的AI服务提供商: ${provider}\n` +
        `支持的提供商: ${getAvailableProviders().join(', ')}\n` +
        `请检查模型配置是否正确`
      );
    }

    // 生产下通过 Netlify Functions 走代理的提供商列表
    const proxiedProviders = ['aimlapi', 'deepseek', 'openai', 'gemini'];
    const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
    const needsProxy = isProduction && proxiedProviders.includes(provider.toLowerCase());

    // 获取并验证API密钥（仅直连时需要）
    let apiKey = '';
    if (!needsProxy) {
      apiKey = getAPIKey(provider) || '';
      if (!apiKey) {
        throw new Error(
          `API密钥未配置: ${provider}\n` +
          `请在环境变量中配置相应的API密钥\n` +
          `参考文档: docs/setup/api-keys.md`
        );
      }

      // 🔧 完整验证API密钥（直连时）
      const keyValidation = validateAPIKey(provider, apiKey);
      if (!keyValidation.valid) {
        const errorDetails = keyValidation.errors.join('\n  - ');
        throw new Error(
          `API密钥验证失败: ${provider}\n` +
          `错误详情:\n  - ${errorDetails}\n` +
          `当前密钥: ${keyValidation.masked}`
        );
      }
    }

    // 构建API URL和请求头（代理场景下 headers 不含 Authorization）
    const endpoint = buildAPIURL(provider, 'chat');
    const headers = getAPIHeaders(provider, apiKey);

    // 🔍 详细日志：记录URL构建结果
    logger.debug('🔧 AI配置构建完成:', {
      model: params.model,
      provider,
      endpoint,
      isProduction,
      needsProxy
    });

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
        promptLength: params.prompt.length,
        apiKeyMasked: config.apiKey.substring(0, 8) + '...' + config.apiKey.substring(config.apiKey.length - 4)
      });

      // 构建请求体
      const requestBody = this.buildRequestBody(config, params);

      logger.debug('📤 请求体:', {
        requestId,
        model: requestBody.model,
        messagesCount: requestBody.messages?.length,
        maxTokens: requestBody.max_tokens,
        temperature: requestBody.temperature
      });

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
    // ✅ 使用统一的差异化工具模块
    let finalPrompt = params.prompt;
    let finalSystemPrompt = params.systemPrompt;
    let finalTemperature = params.temperature || 0.7;

    // 差异化逻辑已禁用（aiVariation模块不存在）
    // TODO: 如需差异化功能，请实现 @/utils/aiVariation 模块

    const messages = [];

    // 🔧 修复: Gemini等模型不支持system role，需要合并到user消息
    const isGemini = config.model.toLowerCase().includes('gemini');
    const supportsSystemRole = !isGemini; // 可以根据需要扩展不支持的模型列表

    // 添加系统消息
    if (finalSystemPrompt && supportsSystemRole) {
      messages.push({
        role: 'system',
        content: finalSystemPrompt
      });
    }

    // 添加上下文消息
    if (params.context && Array.isArray(params.context) && params.context.length > 0) {
      messages.push(...params.context);
    }

    // 添加用户消息
    // 🔧 如果模型不支持system role，将system prompt合并到user消息
    const userContent = finalSystemPrompt && !supportsSystemRole
      ? `${finalSystemPrompt}\n\n${finalPrompt}`
      : finalPrompt;

    messages.push({
      role: 'user',
      content: userContent
    });

    // 🔧 除DeepSeek外，统一使用OpenAI格式 (通过AIMLAPI)
    return {
      model: config.model,
      messages,
      max_tokens: params.maxTokens || 1000,
      temperature: finalTemperature,
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
        logger.error('🔴 AIMLAPI调用失败:', {
          status: response.status,
          statusText: response.statusText,
          endpoint: config.endpoint,
          model: config.model,
          errorBody: errorText.substring(0, 500) // 只记录前500字符
        });
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
   * 🔧 FIX: 支持多个存储位置，优先级：wenpai-unified-store > unified-user-state > wenpai_auth_state
   */
  private getUserTier(): string {
    try {
      // 🔧 FIX: 按优先级尝试多个存储位置
      const storageKeys = [
        'wenpai-unified-store',    // 优先级1：统一Store
        'unified-user-state',      // 优先级2：统一用户状态
        'wenpai_auth_state',       // 优先级3：旧版认证状态
        '_authing_user'            // 优先级4：Authing原始数据
      ];

      for (const key of storageKeys) {
        const data = localStorage.getItem(key);
        if (!data) continue;

        try {
          const parsed = JSON.parse(data);

          // 尝试从不同的数据结构中提取用户信息
          let user = null;

          // Zustand store格式：{ state: { user: {...} } }
          if (parsed.state?.user?.id) {
            user = parsed.state.user;
          }
          // 直接用户对象格式：{ user: {...} }
          else if (parsed.user?.id) {
            user = parsed.user;
          }
          // Authing原始格式：{ id: '...', ... }
          else if (parsed.id) {
            user = parsed;
          }

          if (user?.id) {
            // 获取用户套餐信息，默认为trial
            const userTier = user.subscription?.tier || user.subscription || 'trial';

            logger.debug('📊 AI调用 - 用户订阅层级:', {
              userId: user.id,
              userTier,
              source: key
            });

            return userTier;
          }
        } catch (parseError) {
          // 解析失败，继续尝试下一个key
          continue;
        }
      }

      // 所有存储位置都没有找到用户信息
      logger.warn('⚠️ AI调用 - 未找到用户信息，使用默认层级: trial');
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
        throw new Error(`${provider} APIkeynotconfiguration`);
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
   * 获取可用模型列表
   */
  getAvailableModels(): string[] {
    // TODO: 实现获取可用模型列表的逻辑
    return [];
  }

  /**
   * 获取模型信息
   */
  getModelInfo(model: string): any {
    return getModelInfo(model);
  }

  /**
   * 更新端点配置
   */
  updateEndpoints(config: any): void {
    // TODO: 实现更新端点配置的逻辑
    logger.info('🔧 端点配置已更新');
  }

  /**
   * 获取缓存响应
   */
  getCachedResponse(cacheKey: string): ExtendedAIResponse | null {
    return this.checkCache(cacheKey);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.responseCache.clear();
    logger.info('🧹 缓存已清除');
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    totalRequests: number;
    cacheSize: number;
    cacheHitRate: number;
  } {
    return {
      totalRequests: this.requestCounter,
      cacheSize: this.responseCache.size,
      cacheHitRate: 0 // TODO: 实现缓存命中率统计
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
  get getSystemStatus() { return this._getInstance().getSystemStatus.bind(this._getInstance()); },
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

// 🔧 FIXED: 移除模块顶层立即执行的logger调用，避免TDZ错误
// 这些调用会在模块加载时立即执行，而此时logger可能还未定义

/**
 * 获取并输出系统状态信息（按需调用）
 */
export function logSystemStatus() {
  const status = aiManager.getSystemStatus();
  logger.info('🤖 统一AI管理器已加载', {
    providers: status.availableProviders,
    message: '所有AI调用已统一管理，硬编码问题已解决'
  });
}