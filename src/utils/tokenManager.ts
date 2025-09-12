/**
 * 🎫 安全Token管理系统
 * 
 * 功能特性：
 * - JWT Token自动刷新
 * - Token过期检测和处理
 * - 多Token类型管理（访问、刷新、ID令牌）
 * - 安全存储和加密
 * - Token生命周期管理
 * - 并发刷新控制
 * - 失效回调机制
 */

import { SecureConfig } from './secureConfigManager';

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType: 'Bearer' | 'Basic' | 'Custom';
  expiresAt: number;
  issuedAt: number;
  scope?: string[];
  userId?: string;
  source: 'authing' | 'supabase' | 'custom';
  metadata?: Record<string, any>;
}

export interface TokenRefreshResult {
  success: boolean;
  newToken?: TokenInfo;
  error?: string;
  shouldLogout?: boolean;
}

export interface TokenManagerConfig {
  autoRefresh: boolean;
  refreshThreshold: number; // 提前多少毫秒刷新
  maxRefreshRetries: number;
  refreshRetryDelay: number; // 重试延迟
  storagePrefix: string;
  enableEncryption: boolean;
}

export interface RefreshHandler {
  (oldToken: TokenInfo): Promise<TokenRefreshResult>;
}

export interface TokenEventCallback {
  onTokenRefreshed?: (newToken: TokenInfo) => void;
  onTokenExpired?: (expiredToken: TokenInfo) => void;
  onTokenError?: (error: string, token?: TokenInfo) => void;
  onLogoutRequired?: (reason: string) => void;
}

const DEFAULT_CONFIG: TokenManagerConfig = {
  autoRefresh: true,
  refreshThreshold: 5 * 60 * 1000, // 5分钟
  maxRefreshRetries: 3,
  refreshRetryDelay: 2000,
  storagePrefix: 'secure_token_',
  enableEncryption: true,
};

export class TokenManager {
  private config: TokenManagerConfig;
  private tokens: Map<string, TokenInfo> = new Map();
  private refreshHandlers: Map<string, RefreshHandler> = new Map();
  private callbacks: TokenEventCallback = {};
  private refreshPromises: Map<string, Promise<TokenRefreshResult>> = new Map();
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();
  private isDestroyed = false;

  constructor(config?: Partial<TokenManagerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadTokensFromStorage();
    this.startAutoRefreshCheck();
  }

  /**
   * 设置Token事件回调
   */
  public setCallbacks(callbacks: TokenEventCallback): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 注册Token刷新处理器
   */
  public registerRefreshHandler(tokenKey: string, handler: RefreshHandler): void {
    this.refreshHandlers.set(tokenKey, handler);
  }

  /**
   * 存储Token
   */
  public async setToken(key: string, tokenInfo: TokenInfo): Promise<void> {
    if (this.isDestroyed) return;

    // 验证Token格式
    if (!this.validateTokenInfo(tokenInfo)) {
      throw new Error('Invalid token info provided');
    }

    this.tokens.set(key, { ...tokenInfo });
    await this.saveTokenToStorage(key, tokenInfo);
    
    // 设置自动刷新
    if (this.config.autoRefresh && tokenInfo.refreshToken) {
      this.scheduleTokenRefresh(key, tokenInfo);
    }

    console.log(`🎫 Token stored: ${key} (expires: ${new Date(tokenInfo.expiresAt).toISOString()})`);
  }

  /**
   * 获取Token
   */
  public async getToken(key: string, autoRefresh = true): Promise<TokenInfo | null> {
    if (this.isDestroyed) return null;

    let token = this.tokens.get(key);
    if (!token) {
      // 尝试从存储中加载
      const loadedToken = await this.loadTokenFromStorage(key);
      if (loadedToken) {
        this.tokens.set(key, loadedToken);
        token = loadedToken;
      }
    }

    if (!token) return null;

    // 检查Token是否过期
    if (this.isTokenExpired(token)) {
      if (autoRefresh && token.refreshToken && this.refreshHandlers.has(key)) {
        console.log(`🔄 Token expired, attempting refresh: ${key}`);
        const refreshResult = await this.refreshToken(key);
        if (refreshResult.success && refreshResult.newToken) {
          return refreshResult.newToken;
        } else {
          this.handleTokenExpiry(key, token);
          return null;
        }
      } else {
        this.handleTokenExpiry(key, token);
        return null;
      }
    }

    // 检查是否需要预刷新
    if (autoRefresh && this.shouldRefreshToken(token) && token.refreshToken && this.refreshHandlers.has(key)) {
      this.refreshToken(key).catch(error => {
        console.warn(`Background token refresh failed for ${key}:`, error);
        this.callbacks.onTokenError?.(error.message, token);
      });
    }

    return token;
  }

  /**
   * 获取有效的访问令牌字符串
   */
  public async getAccessToken(key: string): Promise<string | null> {
    const token = await this.getToken(key);
    return token ? `${token.tokenType} ${token.accessToken}` : null;
  }

  /**
   * 手动刷新Token
   */
  public async refreshToken(key: string): Promise<TokenRefreshResult> {
    if (this.isDestroyed) {
      return { success: false, error: 'TokenManager destroyed' };
    }

    // 防止并发刷新
    const existingPromise = this.refreshPromises.get(key);
    if (existingPromise) {
      console.log(`🔄 Using existing refresh promise for ${key}`);
      return existingPromise;
    }

    const refreshPromise = this.performTokenRefresh(key);
    this.refreshPromises.set(key, refreshPromise);

    try {
      const result = await refreshPromise;
      return result;
    } finally {
      this.refreshPromises.delete(key);
    }
  }

  /**
   * 执行Token刷新
   */
  private async performTokenRefresh(key: string): Promise<TokenRefreshResult> {
    const token = this.tokens.get(key);
    if (!token) {
      return { success: false, error: 'Token not found' };
    }

    const handler = this.refreshHandlers.get(key);
    if (!handler) {
      return { success: false, error: 'No refresh handler registered' };
    }

    console.log(`🔄 Refreshing token: ${key}`);

    let lastError: string = '';
    
    // 重试刷新
    for (let attempt = 1; attempt <= this.config.maxRefreshRetries; attempt++) {
      try {
        const result = await handler(token);
        
        if (result.success && result.newToken) {
          // 刷新成功
          await this.setToken(key, result.newToken);
          this.callbacks.onTokenRefreshed?.(result.newToken);
          console.log(`✅ Token refreshed successfully: ${key} (attempt ${attempt})`);
          return result;
        } else if (result.shouldLogout) {
          // 需要重新登录
          this.callbacks.onLogoutRequired?.(result.error || 'Token refresh failed');
          return result;
        } else {
          lastError = result.error || 'Refresh failed';
          console.warn(`⚠️ Token refresh attempt ${attempt} failed: ${lastError}`);
        }
        
      } catch (error) {
        lastError = (error as Error).message;
        console.error(`❌ Token refresh attempt ${attempt} error:`, error);
      }

      // 等待后重试
      if (attempt < this.config.maxRefreshRetries) {
        await this.delay(this.config.refreshRetryDelay * attempt);
      }
    }

    // 所有重试都失败了
    const result = { 
      success: false, 
      error: `Token refresh failed after ${this.config.maxRefreshRetries} attempts: ${lastError}` 
    };
    
    this.callbacks.onTokenError?.(result.error, token);
    return result;
  }

  /**
   * 删除Token
   */
  public async removeToken(key: string): Promise<boolean> {
    const removed = this.tokens.delete(key);
    
    if (removed) {
      // 清理定时器
      const timer = this.refreshTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.refreshTimers.delete(key);
      }
      
      // 清理存储
      await this.removeTokenFromStorage(key);
      console.log(`🗑️ Token removed: ${key}`);
    }
    
    return removed;
  }

  /**
   * 清空所有Token
   */
  public async clearAllTokens(): Promise<void> {
    const keys = Array.from(this.tokens.keys());
    
    for (const key of keys) {
      await this.removeToken(key);
    }
    
    console.log('🧹 All tokens cleared');
  }

  /**
   * 获取所有Token的状态信息
   */
  public getTokensStatus(): Array<{
    key: string;
    isValid: boolean;
    expiresAt: string;
    expiresIn: number;
    source: string;
    hasRefreshToken: boolean;
  }> {
    return Array.from(this.tokens.entries()).map(([key, token]) => ({
      key,
      isValid: !this.isTokenExpired(token),
      expiresAt: new Date(token.expiresAt).toISOString(),
      expiresIn: Math.max(0, token.expiresAt - Date.now()),
      source: token.source,
      hasRefreshToken: !!token.refreshToken,
    }));
  }

  /**
   * 验证Token信息格式
   */
  private validateTokenInfo(tokenInfo: TokenInfo): boolean {
    return !!(
      tokenInfo.accessToken &&
      tokenInfo.tokenType &&
      tokenInfo.expiresAt > Date.now() &&
      tokenInfo.issuedAt <= Date.now() &&
      tokenInfo.source
    );
  }

  /**
   * 检查Token是否过期
   */
  private isTokenExpired(token: TokenInfo): boolean {
    return Date.now() >= token.expiresAt;
  }

  /**
   * 检查是否应该刷新Token
   */
  private shouldRefreshToken(token: TokenInfo): boolean {
    return Date.now() >= (token.expiresAt - this.config.refreshThreshold);
  }

  /**
   * 处理Token过期
   */
  private handleTokenExpiry(key: string, token: TokenInfo): void {
    console.warn(`⏰ Token expired: ${key}`);
    this.removeToken(key);
    this.callbacks.onTokenExpired?.(token);
  }

  /**
   * 安排Token自动刷新
   */
  private scheduleTokenRefresh(key: string, token: TokenInfo): void {
    // 清除现有定时器
    const existingTimer = this.refreshTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 计算刷新时间
    const refreshTime = token.expiresAt - this.config.refreshThreshold;
    const delay = Math.max(1000, refreshTime - Date.now()); // 至少1秒后

    const timer = setTimeout(async () => {
      if (!this.isDestroyed && this.tokens.has(key)) {
        console.log(`⏰ Scheduled refresh triggered for: ${key}`);
        await this.refreshToken(key);
      }
    }, delay);

    this.refreshTimers.set(key, timer);
    console.log(`⏰ Scheduled refresh for ${key} in ${Math.round(delay / 1000)}s`);
  }

  /**
   * 启动自动刷新检查
   */
  private startAutoRefreshCheck(): void {
    if (!this.config.autoRefresh) return;

    const checkInterval = setInterval(() => {
      if (this.isDestroyed) {
        clearInterval(checkInterval);
        return;
      }

      this.tokens.forEach(async (token, key) => {
        if (this.shouldRefreshToken(token) && token.refreshToken && this.refreshHandlers.has(key)) {
          await this.refreshToken(key).catch(error => {
            console.warn(`Auto-refresh failed for ${key}:`, error);
          });
        }
      });
    }, 60000); // 每分钟检查一次
  }

  /**
   * 保存Token到存储
   */
  private async saveTokenToStorage(key: string, token: TokenInfo): Promise<void> {
    try {
      const storageKey = `${this.config.storagePrefix}${key}`;
      
      if (this.config.enableEncryption) {
        await SecureConfig.set(storageKey, JSON.stringify(token), 'secret');
      } else {
        localStorage.setItem(storageKey, JSON.stringify(token));
      }
    } catch (error) {
      console.error(`Failed to save token ${key} to storage:`, error);
    }
  }

  /**
   * 从存储加载Token
   */
  private async loadTokenFromStorage(key: string): Promise<TokenInfo | null> {
    try {
      const storageKey = `${this.config.storagePrefix}${key}`;
      let tokenData: string | null;
      
      if (this.config.enableEncryption) {
        tokenData = await SecureConfig.get(storageKey, 'token-manager');
      } else {
        tokenData = localStorage.getItem(storageKey);
      }
      
      if (tokenData) {
        const token = JSON.parse(tokenData) as TokenInfo;
        if (this.validateTokenInfo(token)) {
          return token;
        }
      }
    } catch (error) {
      console.error(`Failed to load token ${key} from storage:`, error);
    }
    
    return null;
  }

  /**
   * 从存储中删除Token
   */
  private async removeTokenFromStorage(key: string): Promise<void> {
    try {
      const storageKey = `${this.config.storagePrefix}${key}`;
      
      if (this.config.enableEncryption) {
        await SecureConfig.delete(storageKey);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error(`Failed to remove token ${key} from storage:`, error);
    }
  }

  /**
   * 从存储加载所有Token
   */
  private async loadTokensFromStorage(): Promise<void> {
    try {
      // 简化实现：遍历localStorage寻找token
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith(this.config.storagePrefix)) {
          const key = storageKey.replace(this.config.storagePrefix, '');
          const token = await this.loadTokenFromStorage(key);
          if (token) {
            this.tokens.set(key, token);
            
            // 恢复自动刷新调度
            if (this.config.autoRefresh && token.refreshToken && !this.isTokenExpired(token)) {
              this.scheduleTokenRefresh(key, token);
            }
          }
        }
      }
      
      console.log(`📥 Loaded ${this.tokens.size} tokens from storage`);
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 销毁TokenManager，清理所有资源
   */
  public destroy(): void {
    this.isDestroyed = true;
    
    // 清理所有定时器
    this.refreshTimers.forEach(timer => clearTimeout(timer));
    this.refreshTimers.clear();
    
    // 清理其他资源
    this.tokens.clear();
    this.refreshHandlers.clear();
    this.refreshPromises.clear();
    
    console.log('🧹 TokenManager destroyed');
  }
}

// 全局Token管理器实例
let globalTokenManager: TokenManager | null = null;

/**
 * 获取全局Token管理器
 */
export function getTokenManager(): TokenManager {
  if (!globalTokenManager) {
    globalTokenManager = new TokenManager();
  }
  return globalTokenManager;
}

/**
 * Token管理便捷函数
 */
export const TokenService = {
  setToken: (key: string, tokenInfo: TokenInfo) => getTokenManager().setToken(key, tokenInfo),
  getToken: (key: string, autoRefresh?: boolean) => getTokenManager().getToken(key, autoRefresh),
  getAccessToken: (key: string) => getTokenManager().getAccessToken(key),
  refreshToken: (key: string) => getTokenManager().refreshToken(key),
  removeToken: (key: string) => getTokenManager().removeToken(key),
  clearAll: () => getTokenManager().clearAllTokens(),
  getStatus: () => getTokenManager().getTokensStatus(),
  registerRefreshHandler: (key: string, handler: RefreshHandler) => getTokenManager().registerRefreshHandler(key, handler),
  setCallbacks: (callbacks: TokenEventCallback) => getTokenManager().setCallbacks(callbacks),
};