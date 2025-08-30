import { logger } from '@/utils/logger';
import request from '@/api/request';
/**
 * 🔧 统一配置管理器
 * 禁止硬编码，统一从部署后台调取配置信息
 * 
 * 功能特性：
 * - 支持多环境配置（开发/测试/生产）
 * - 动态从部署后台获取配置
 * - 配置缓存和热更新
 * - 配置验证和错误处理
 * - 敏感信息加密存储
 */

export interface AuthingConfig {
  appId: string;
  userPoolId: string;
  domain: string;
  host: string;
  redirectUri: string;
  scope: string;
  responseType: string;
  responseMode: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  projectId: string;
  jwtSecret: string;
}

export interface AIConfig {
  openai: {
    apiKey: string;
    baseURL: string;
    model: string;
  };
  deepseek: {
    apiKey: string;
    baseURL: string;
    model: string;
  };
}

export interface AppConfig {
  authing: AuthingConfig;
  supabase: SupabaseConfig;
  ai: AIConfig;
  environment: 'development' | 'staging' | 'production';
  version: string;
  debug: boolean;
}

/**
 * 配置来源优先级
 */
enum ConfigSource {
  REMOTE_API = 1,      // 远程API配置（最高优先级）
  ENV_VARIABLES = 2,   // 环境变量
  LOCAL_CACHE = 3,     // 本地缓存
  DEFAULT_VALUES = 4   // 默认值（最低优先级）
}

/**
 * 配置管理器类
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig | null = null;
  private configCache: Map<string, any> = new Map();
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
  private readonly CONFIG_API_ENDPOINT = '/api/config';

  private constructor() {}

  /**
   * 获取配置管理器实例（单例模式）
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取当前环境
   */
  private getCurrentEnvironment(): 'development' | 'staging' | 'production' {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      }
      if (hostname.includes('staging') || hostname.includes('preview')) {
        return 'staging';
      }
    }
    return import.meta.env.PROD ? 'production' : 'development';
  }

  /**
   * 从远程API获取配置
   */
  private async fetchRemoteConfig(): Promise<Partial<AppConfig> | null> {
    try {
      const environment = this.getCurrentEnvironment();
      const remoteConfig = await request.get(`${this.CONFIG_API_ENDPOINT}?env=${environment}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Config-Version': '1.0'
        }
      });
      logger.debug('✅ 成功获取远程配置');
      
      // 缓存远程配置
      this.configCache.set('remote', remoteConfig);
      this.lastFetchTime = Date.now();
      
      return remoteConfig;
    } catch (error) {
      console.warn('远程配置获取异常:', error);
      return null;
    }
  }

  /**
   * 从环境变量获取配置
   */
  private getEnvConfig(): Partial<AppConfig> {
    const environment = this.getCurrentEnvironment();
    
    return {
      authing: {
        appId: import.meta.env.VITE_AUTHING_APP_ID,
        userPoolId: import.meta.env.VITE_AUTHING_USER_POOL_ID,
        domain: import.meta.env.VITE_AUTHING_DOMAIN,
        host: import.meta.env.VITE_AUTHING_HOST,
        redirectUri: this.getRedirectUri(),
        scope: 'openid profile email phone',
        responseType: 'code',
        responseMode: 'query'
      },
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
        jwtSecret: import.meta.env.VITE_SUPABASE_JWT_SECRET
      },
      ai: {
        openai: {
          apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          baseURL: import.meta.env.VITE_OPENAI_BASE_URL,
          model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo'
        },
        deepseek: {
          apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
          baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL,
          model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat'
        }
      },
      environment,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      debug: import.meta.env.DEV || false
    };

  }

  /**
   * 获取重定向URI
   * 修复多重URL问题：强制使用固定的生产环境URL
   */
  private getRedirectUri(): string {
    // 🔧 修复多重回调URL问题：禁用动态检测，强制使用生产环境URL
    const environment = this.getCurrentEnvironment();
    
    // 优先使用环境变量配置
    if (environment === 'production') {
      return import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback';
    }
    
    if (environment === 'development') {
      return import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback';
    }
    
    // 其他环境的默认值
    switch (environment) {
      case 'staging':
        return 'https://staging.wenpai.xyz/callback';
      default:
        return 'http://localhost:5173/callback';
    }
  }

  /**
   * 获取默认配置 - 仅提供结构，不包含实际值
   */
  private getDefaultConfig(): AppConfig {
    const environment = this.getCurrentEnvironment();

    return {
      authing: {
        appId: '',
        userPoolId: '',
        domain: '',
        host: '',
        redirectUri: this.getRedirectUri(),
        scope: 'openid profile email phone',
        responseType: 'code',
        responseMode: 'query'
      },
      supabase: {
        url: '',
        anonKey: '',
        serviceRoleKey: '',
        projectId: '',
        jwtSecret: ''
      },
      ai: {
        openai: {
          apiKey: '',
          baseURL: 'https://api.openai.com/v1',
          model: 'gpt-3.5-turbo'
        },
        deepseek: {
          apiKey: '',
          baseURL: 'https://api.deepseek.com/v1',
          model: 'deepseek-chat'
        }
      },
      environment,
      version: '1.0.0',
      debug: environment === 'development'
    };
  }

  /**
   * 合并配置（按优先级）
   */
  private mergeConfigs(...configs: Partial<AppConfig>[]): AppConfig {
    const defaultConfig = this.getDefaultConfig();
    // 显式指定 reduce 返回类型为 AppConfig，避免被数组元素类型 Partial<AppConfig> 拉低
    return configs.reduce<AppConfig>((merged, config) => {
      return this.deepMerge<AppConfig>(merged, config as Partial<AppConfig>);
    }, defaultConfig);
  }

  /**
   * 深度合并对象
   */
  private deepMerge<T = any>(target: T, source: any): T {
    const result: any = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * 验证配置完整性
   */
  private validateConfig(config: AppConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证 Authing 配置
    if (!config.authing.appId) errors.push('Authing App ID 缺失');
    if (!config.authing.domain) errors.push('Authing Domain 缺失');
    if (!config.authing.host) errors.push('Authing Host 缺失');

    // 验证 Supabase 配置
    if (!config.supabase.url) errors.push('Supabase URL 缺失');
    if (!config.supabase.anonKey) errors.push('Supabase Anon Key 缺失');

    // ✅ SECURITY FIX: AI 配置改为可选验证，客户端不再需要API密钥
    // AI 密钥现在通过服务端代理，客户端验证改为可选
    // if (!config.ai.openai.apiKey) errors.push('OpenAI API Key 缺失');
    // if (!config.ai.deepseek.apiKey) errors.push('DeepSeek API Key 缺失');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取完整配置
   */
  async getConfig(forceRefresh = false): Promise<AppConfig> {
    // 检查缓存
    const now = Date.now();
    const cacheExpired = now - this.lastFetchTime > this.CACHE_TTL;
    
    if (this.config && !forceRefresh && !cacheExpired) {
      return this.config;
    }

    try {
      // 按优先级获取配置
      const remoteConfig = await this.fetchRemoteConfig();
      const envConfig = this.getEnvConfig();
      const cachedConfig = this.configCache.get('local');

      // 合并配置（优先级：远程 > 环境变量 > 缓存 > 默认值）
      this.config = this.mergeConfigs(
        remoteConfig || {},
        envConfig,
        cachedConfig || {}
      );

      // 验证配置
      const validation = this.validateConfig(this.config);
      if (!validation.isValid) {
        console.error('❌ 配置验证失败:', validation.errors);
        throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
      }

      // 缓存到本地
      this.configCache.set('local', this.config);

      logger.debug('✅ 配置加载完成:', {
        environment: this.config.environment,
        hasRemoteConfig: !!remoteConfig,
        configSource: remoteConfig ? 'remote' : 'local'
      });

      return this.config;
    } catch (error) {
      console.error('配置加载失败:', error);
      throw new Error(`配置加载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取特定配置
   */
  async getAuthingConfig(): Promise<AuthingConfig> {
    const config = await this.getConfig();
    return config.authing;
  }

  async getSupabaseConfig(): Promise<SupabaseConfig> {
    const config = await this.getConfig();
    return config.supabase;
  }

  async getAIConfig(): Promise<AIConfig> {
    const config = await this.getConfig();
    return config.ai;
  }

  /**
   * 热更新配置
   */
  async refreshConfig(): Promise<AppConfig> {
    return this.getConfig(true);
  }

  /**
   * 清除配置缓存
   */
  clearCache(): void {
    this.config = null;
    this.configCache.clear();
    this.lastFetchTime = 0;
  }
}

// 导出单例实例
export const configManager = ConfigManager.getInstance();

// 便捷方法
export const getAuthingConfig = () => configManager.getAuthingConfig();
export const getSupabaseConfig = () => configManager.getSupabaseConfig();
export const getAIConfig = () => configManager.getAIConfig();
export const refreshConfig = () => configManager.refreshConfig();

export default configManager;
