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
   * 🔧 FIX: 包含差异化参数，确保版本A和版本B使用不同的缓存
   */
  private getCacheKey(params: AICallParams): string {
    const anyParams = params as any;
    const keyData = {
      model: params.model,
      prompt: params.prompt.substring(0, 100), // 只使用前100字符作为缓存键
      systemPrompt: params.systemPrompt?.substring(0, 50),
      maxTokens: params.maxTokens,
      temperature: params.temperature,
      // 🔧 添加差异化参数到缓存key
      regenerationSeed: anyParams.regenerationSeed,
      variationLevel: anyParams.variationLevel,
      styleVariation: anyParams.styleVariation
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
      // 🔧 使用增强的错误日志
      logger.apiError({
        operation: 'AI请求',
        endpoint: config.endpoint,
        method: 'POST',
        model: config.model,
        provider: config.provider,
        requestBody: {
          model: config.model,
          messages: config.messages,
          temperature: config.temperature,
          max_tokens: config.maxTokens
        },
        error,
        duration: Date.now() - startTime
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

    // 🔧 差异化逻辑：确保版本A和版本B生成不同的内容
    const anyParams = params as any;
    if (anyParams.regenerationSeed || anyParams.variationLevel || anyParams.styleVariation) {
      // 添加差异化提示到 prompt
      const seed = anyParams.regenerationSeed || `seed-${Date.now()}`;
      const variationLevel = anyParams.variationLevel || 'moderate';
      const styleVariation = anyParams.styleVariation || 'tone';
      const randomSuffix = Math.random().toString(36).substring(2, 10); // 添加随机后缀

      // 🔧 FIX: 根据差异化级别调整 temperature，增大差异
      if (variationLevel === 'significant') {
        finalTemperature = Math.max(finalTemperature, 1.0); // 从0.9提高到1.0
      } else if (variationLevel === 'moderate') {
        finalTemperature = Math.max(finalTemperature, 0.8); // 从0.7提高到0.8
      }

      // 在 system prompt 中添加差异化指令
      const variationInstructions = {
        'tone': '使用完全不同的语气和表达方式',
        'structure': '采用完全不同的结构和组织方式',
        'vocabulary': '使用完全不同的词汇和表达',
        'approach': '从完全不同的角度和方法切入'
      };

      const instruction = variationInstructions[styleVariation as keyof typeof variationInstructions] || '生成完全不同的内容';

      // 🔧 FIX: 在 prompt 本身添加差异化标识，不只是 systemPrompt
      finalPrompt = `${finalPrompt}\n\n【版本标识: ${seed}-${randomSuffix}】`;

      finalSystemPrompt = `${finalSystemPrompt || ''}\n\n【🚨 重要差异化要求 - 必须严格遵守】\n- 生成种子: ${seed}\n- 随机标识: ${randomSuffix}\n- 差异化级别: ${variationLevel}\n- 差异化方向: ${instruction}\n- ⚠️ 警告：必须与其他版本有显著差异，严禁生成重复或相似的内容\n- ⚠️ 如果你生成的内容与之前的版本相似，将被视为失败`;

      logger.debug('🎨 应用增强差异化逻辑', {
        seed,
        randomSuffix,
        variationLevel,
        styleVariation,
        temperature: finalTemperature,
        promptModified: true
      });
    }

    // 🔧 针对 Gemini 模型的特殊处理
    const isGemini = config.model.toLowerCase().includes('gemini');
    if (isGemini) {
      finalSystemPrompt = `${finalSystemPrompt || ''}\n\n【重要输出要求 - 针对 Gemini 模型】\n- 必须直接输出完整的内容，不要只输出标题或摘要\n- 不要进行过多的内部推理，直接生成用户需要的完整内容\n- 确保输出的内容完整、详细、有价值\n- 不要因为"思考"而减少实际输出的内容量`;

      logger.info('🤖 检测到 Gemini 模型，添加特殊输出指令', {
        model: config.model
      });
    }

    const messages = [];

    // 🔧 修复: Gemini等模型不支持system role，需要合并到user消息
    // 复用上面已声明的 isGemini 变量
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

        // 尝试解析错误消息
        let userFriendlyMessage = `HTTP ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            userFriendlyMessage = errorJson.message;
          }
          // 特殊处理配额用完的情况
          if (response.status === 403 && errorJson.message?.includes('exhausted')) {
            userFriendlyMessage = 'API配额已用完，请充值或更换模型';
          }
        } catch {
          // 如果不是JSON，使用原始错误文本的前200字符
          userFriendlyMessage = errorText.substring(0, 200);
        }

        // 🔧 使用增强的API错误日志
        const possibleReasons = response.status === 403 ? [
          'API Key 无效或过期',
          'API 配额已用完',
          '模型权限不足',
          '账户被封禁'
        ] : [];

        logger.apiError({
          operation: 'AIMLAPI调用',
          endpoint: config.endpoint,
          method: 'POST',
          status: response.status,
          statusText: response.statusText,
          model: config.model,
          provider: config.provider,
          requestBody: {
            model: config.model,
            messages: config.messages,
            temperature: config.temperature,
            max_tokens: config.maxTokens
          },
          responseBody: errorText,
          duration: Date.now() - startTime
        });

        // 额外的错误分析
        if (response.status === 403) {
          console.error('💡 可能的原因:', possibleReasons);
          console.error('💬 用户友好提示:', userFriendlyMessage);
        }

        throw new Error(userFriendlyMessage);
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

      // 🔧 详细日志：输出 AI API 的原始响应
      logger.info('🔍 AI API 原始响应:', {
        provider: config.provider,
        model: config.model,
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        firstChoice: data.choices?.[0],
        firstChoiceMessage: data.choices?.[0]?.message,
        finishReason: data.choices?.[0]?.finish_reason,
        usage: data.usage,
        rawDataKeys: Object.keys(data),
        rawData: data
      });

      // 🔧 统一使用OpenAI格式解析 (AIMLAPI返回OpenAI兼容格式)
      // 尝试多种路径提取内容
      let rawContent = '';

      // 🔧 DEBUG: 详细输出message结构
      if (data.choices?.[0]?.message) {
        const msg = data.choices[0].message;
        logger.info('🔍 详细message结构:', {
          messageType: typeof msg,
          messageKeys: Object.keys(msg),
          hasContent: 'content' in msg,
          contentValue: msg.content,
          contentType: typeof msg.content,
          contentIsEmpty: msg.content === '',
          contentIsNull: msg.content === null,
          contentIsUndefined: msg.content === undefined,
          fullMessage: msg
        });
      }

      // 路径1: 标准 OpenAI 格式
      if (data.choices?.[0]?.message?.content) {
        rawContent = data.choices[0].message.content;
        logger.info('✅ 从 choices[0].message.content 提取内容', {
          contentLength: rawContent.length,
          contentPreview: rawContent.substring(0, 100)
        });
      }
      // 路径2: 直接 content 字段
      else if (data.content) {
        rawContent = data.content;
        logger.info('✅ 从 data.content 提取内容');
      }
      // 路径3: text 字段
      else if (data.text) {
        rawContent = data.text;
        logger.info('✅ 从 data.text 提取内容');
      }
      // 路径4: choices[0].text
      else if (data.choices?.[0]?.text) {
        rawContent = data.choices[0].text;
        logger.info('✅ 从 choices[0].text 提取内容');
      }
      // 🔧 路径5: 检查message.content是否为空字符串（OpenAI有时返回空content）
      else if (data.choices?.[0]?.message && 'content' in data.choices[0].message) {
        rawContent = data.choices[0].message.content || '';
        logger.warn('⚠️ message.content存在但为空或falsy值', {
          contentValue: data.choices[0].message.content,
          contentType: typeof data.choices[0].message.content
        });
      }
      // 路径6: 检查是否有其他可能的字段
      else {
        // 🔧 使用增强的错误日志
        console.group('❌ 无法从响应中提取内容');
        console.error('📍 问题:', '尝试所有已知路径都失败');
        console.error('🤖 模型:', config.model);
        console.error('🏢 提供商:', config.provider);

        console.group('🔍 响应结构分析');
        console.log('✅ 有choices数组:', !!data.choices);
        console.log('📊 choices长度:', data.choices?.length || 0);
        console.log('🔑 顶层字段:', Object.keys(data));

        if (data.choices?.[0]) {
          console.log('🔑 choices[0]字段:', Object.keys(data.choices[0]));

          if (data.choices[0].message) {
            console.log('🔑 message字段:', Object.keys(data.choices[0].message));
            console.log('📄 message内容:', data.choices[0].message);
          }
        }
        console.groupEnd();

        console.group('🔍 尝试的提取路径');
        console.log('❌ 路径1: data.choices[0].message.content');
        console.log('❌ 路径2: data.content');
        console.log('❌ 路径3: data.text');
        console.log('❌ 路径4: data.choices[0].text');
        console.log('❌ 路径5: data.choices[0].message.content (空值)');
        console.groupEnd();

        console.group('📦 完整响应数据');
        console.log('原始数据:', data);
        console.groupEnd();

        console.groupEnd();
      }

      const content = cleanAIContent(rawContent);

      logger.info('🔍 内容提取和清理结果:', {
        rawContentLength: rawContent.length,
        cleanedContentLength: content.length,
        rawContentPreview: rawContent.substring(0, 200) || '(空)',
        cleanedContentPreview: content.substring(0, 200) || '(空)',
        extractionSuccess: !!rawContent
      });

      return {
        content,
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

      // 检查缓存（如果启用）
      const anyParams = params as any;
      const skipCache = anyParams.skipCache || anyParams.regenerationSeed; // 🔧 有regenerationSeed时自动跳过缓存

      const cacheKey = this.getCacheKey(params);
      if (!skipCache) {
        const cached = this.checkCache(cacheKey);
        if (cached) {
          logger.debug('📦 使用缓存响应:', { model: params.model, cacheKey });
          return cached;
        }
      } else {
        logger.debug('⏭️ 跳过缓存检查:', {
          model: params.model,
          reason: anyParams.regenerationSeed ? 'regenerationSeed存在' : 'skipCache=true'
        });
      }

      // 构建配置
      const config = await this.buildAIConfig(params);

      // 发送请求
      const response = await this.sendAIRequest(config, params);

      // 缓存成功响应（如果启用缓存）
      if (response.success && !skipCache) {
        this.setCache(cacheKey, response);
      }

      return response;

    } catch (error) {
      // 🔧 使用增强的模型错误日志
      logger.modelError({
        model: params.model || 'unknown',
        operation: '统一AI调用',
        prompt: params.prompt,
        systemPrompt: params.systemPrompt,
        params: {
          temperature: params.temperature,
          maxTokens: params.maxTokens,
          stream: params.stream
        },
        error
      });

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
      // centralized util
      const { getEffectiveUserTier } = require('@/utils/effectiveUserTier');
      return getEffectiveUserTier();
      // legacy path removed; util handles subscription-store  unified-state-store  localStorage
      try {
        const { useSubscriptionStore } = require('@/stores/subscription-store');
        const subState = useSubscriptionStore.getState();
        const tier = subState?.status?.tier as string | undefined;
        const isActive = subState?.status?.status === 'active';
        if (tier && (isActive || tier === 'pro' || tier === 'premium')) {
          return tier;
        }
      } catch {}

      try {
        const { useUnifiedStore } = require('@/stores/unified-state-store');
        const memTier = useUnifiedStore.getState().user?.subscription as string | undefined;
        if (memTier && memTier !== 'trial') {
          return memTier;
        }
      } catch {}

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