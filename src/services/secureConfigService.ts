/**
 * 🔐 安全配置服务
 * 从服务端安全获取认证配置，避免敏感信息在客户端暴露
 * 
 * 特性：
 * - 服务端配置获取
 * - 本地配置缓存
 * - 自动重试机制
 * - 配置验证和错误处理
 */

export interface SecureAuthConfig {
  appId: string;
  host: string;
  domain: string;
  redirectUri: string;
  guard: {
    appId: string;
    domain: string;
    redirectUri: string;
    mode: 'modal';
    config: {
      disableAriaHidden: boolean;
      container: string;
      zIndex: number;
      accessibility: {
        disableFocusManagement: boolean;
        preventRootAriaHidden: boolean;
      };
    };
  };
  webSdk: {
    domain: string;
    appId: string;
    redirectUri: string;
    scope: string;
    responseType: string;
    state: string;
    prompt: string;
  };
  environment: string;
  features: {
    httpOnlyCookies: boolean;
    csrfProtection: boolean;
    tokenEncryption: boolean;
  };
}

export interface ConfigResponse {
  success: boolean;
  data?: SecureAuthConfig;
  error?: string;
  message: string;
  timestamp?: string;
  cacheInfo?: {
    cached: boolean;
    age: number;
  };
}

/**
 * 安全配置服务类
 */
export class SecureConfigService {
  private static instance: SecureConfigService;
  private configCache: SecureAuthConfig | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟
  private readonly CONFIG_ENDPOINT = '/.netlify/functions/auth-config';
  private readonly MAX_RETRIES = 3;

  private constructor() {}

  public static getInstance(): SecureConfigService {
    if (!SecureConfigService.instance) {
      SecureConfigService.instance = new SecureConfigService();
    }
    return SecureConfigService.instance;
  }

  /**
   * 获取认证配置（优先使用缓存）
   */
  async getAuthConfig(forceRefresh: boolean = false): Promise<SecureAuthConfig> {
    const now = Date.now();
    
    // 使用缓存（如果可用且未过期）
    if (!forceRefresh && this.configCache && (now - this.cacheTime) < this.CACHE_DURATION) {
      console.log('🚀 使用cache的authenticatingconfiguration');
      return this.configCache;
    }

    try {
      console.log('🌐 从service端gettingauthenticatingconfiguration...');
      const config = await this.fetchConfigFromServer();
      
      // 验证配置完整性
      this.validateConfig(config);
      
      // 更新缓存
      this.configCache = config;
      this.cacheTime = now;
      
      console.log('✅ authenticatingconfigurationgettingsuccess:', {
        appId: config.appId ? '***' + config.appId.slice(-4) : 'missing',
        domain: config.domain,
        redirectUri: config.redirectUri,
        environment: config.environment,
        cached: true
      });
      
      return config;
      
    } catch (error) {
      console.error('❌ service端configurationgettingfailed:', error);
      
      // 尝试使用过期的缓存作为备用
      if (this.configCache) {
        console.warn('⚠️ 使用expiredcacheconfiguration');
        return this.configCache;
      }
      
      // 最后备用：使用客户端环境变量（不推荐但保证可用性）
      console.warn('⚠️ 降级到client环境variableconfiguration');
      return this.getFallbackConfig();
    }
  }

  /**
   * 从服务端获取配置（带重试机制）
   */
  private async fetchConfigFromServer(): Promise<SecureAuthConfig> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 configurationgetting尝试 ${attempt}/${this.MAX_RETRIES}`);
        
        const response = await fetch(this.CONFIG_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          // 超时控制
          signal: AbortSignal.timeout(10000) // 10秒超时
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: ConfigResponse = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error(result.error || 'Invalid response format');
        }

        console.log(`✅ configurationgettingsuccess (尝试 ${attempt})`);
        return result.data;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ configurationgettingfailed (尝试 ${attempt}):`, lastError.message);
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 指数退避，最多5秒
          console.log(`⏳ ${delay}ms nextretrying...`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * 验证配置完整性
   */
  private validateConfig(config: SecureAuthConfig): void {
    const requiredFields = ['appId', 'host', 'domain', 'redirectUri'];
    
    for (const field of requiredFields) {
      if (!config[field as keyof SecureAuthConfig]) {
        throw new Error(`配置验证失败：缺少必需字段 ${field}`);
      }
    }
    
    // 验证URL格式
    try {
      new URL(config.host);
      new URL(config.redirectUri);
    } catch (error) {
      throw new Error('配置验证失败：无效的URL格式');
    }
    
    console.log('✅ configurationvalidating通过');
  }

  /**
   * 获取备用配置（客户端环境变量）
   */
  private getFallbackConfig(): SecureAuthConfig {
    console.warn('🔧 使用client环境variable作为备用configuration');
    
    const appId = import.meta.env.VITE_AUTHING_APP_ID;
    const domain = import.meta.env.VITE_AUTHING_DOMAIN;
    const host = import.meta.env.VITE_AUTHING_HOST || `https://${domain}`;
    
    if (!appId || !domain) {
      throw new Error('备用配置不完整：缺少必需的环境变量');
    }

    // 动态redirect_uri
    let redirectUri = 'https://www.wenpai.xyz/callback';
    
    if (typeof window !== 'undefined') {
      const { hostname, port, origin } = window.location;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '5173') {
        redirectUri = 'http://localhost:5173/callback';
      } else if (hostname.includes('netlify.app')) {
        redirectUri = `${origin}/callback`;
      }
    }

    return {
      appId,
      host,
      domain,
      redirectUri,
      guard: {
        appId,
        domain,
        redirectUri,
        mode: 'modal',
        config: {
          disableAriaHidden: true,
          container: 'authing-guard-container',
          zIndex: 1000,
          accessibility: {
            disableFocusManagement: false,
            preventRootAriaHidden: true
          }
        }
      },
      webSdk: {
        domain,
        appId,
        redirectUri,
        scope: 'openid profile email phone',
        responseType: 'code',
        state: `state_${Date.now()}`,
        prompt: 'login'
      },
      environment: import.meta.env.NODE_ENV || 'production',
      features: {
        httpOnlyCookies: false, // 备用配置安全性较低
        csrfProtection: false,
        tokenEncryption: true
      }
    };
  }

  /**
   * 清除配置缓存
   */
  clearCache(): void {
    this.configCache = null;
    this.cacheTime = 0;
    console.log('🗑️ configurationcachealreadyclearing');
  }

  /**
   * 获取配置摘要信息（不含敏感信息）
   */
  getConfigSummary(): {
    cached: boolean;
    cacheAge: number;
    environment: string;
    features: string[];
  } | null {
    if (!this.configCache) {
      return null;
    }

    return {
      cached: true,
      cacheAge: Date.now() - this.cacheTime,
      environment: this.configCache.environment,
      features: Object.entries(this.configCache.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature, _]) => feature)
    };
  }

  /**
   * 预加载配置（可用于应用启动时）
   */
  async preloadConfig(): Promise<boolean> {
    try {
      await this.getAuthConfig();
      return true;
    } catch (error) {
      console.error('❌ configuration预loadingfailed:', error);
      return false;
    }
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例实例
export const secureConfigService = SecureConfigService.getInstance();

/**
 * 便捷的配置获取函数
 */
export async function getSecureAuthConfig(forceRefresh: boolean = false): Promise<SecureAuthConfig> {
  return secureConfigService.getAuthConfig(forceRefresh);
}

/**
 * 获取Guard配置
 */
export async function getSecureGuardConfig() {
  const config = await getSecureAuthConfig();
  return config.guard;
}

/**
 * 获取Web SDK配置
 */
export async function getSecureWebSdkConfig() {
  const config = await getSecureAuthConfig();
  return config.webSdk;
}