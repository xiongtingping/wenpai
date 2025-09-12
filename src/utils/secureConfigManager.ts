/**
 * 🔐 安全配置管理器
 * 对敏感配置进行加密存储和安全访问
 * 
 * 安全特性：
 * - AES-256-GCM 加密 (Web Crypto API)
 * - 动态密钥生成
 * - 配置项分级保护
 * - 访问审计日志
 * - 防暴力破解
 */

export interface SecureConfig {
  id: string;
  encrypted: string;
  iv: string;
  level: 'public' | 'internal' | 'secret' | 'top-secret';
  createdAt: number;
  expiresAt?: number;
  accessCount: number;
  lastAccess?: number;
}

export interface ConfigAccess {
  configId: string;
  timestamp: number;
  userAgent?: string;
  source: string;
  success: boolean;
  error?: string;
}

export interface SecuritySettings {
  maxAccessAttempts: number;
  lockoutDuration: number; // 毫秒
  auditRetentionPeriod: number; // 毫秒
}

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  maxAccessAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15分钟
  auditRetentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30天
};

export class SecureConfigManager {
  private cryptoKey: CryptoKey | null = null;
  private configs: Map<string, SecureConfig> = new Map();
  private accessLog: ConfigAccess[] = [];
  private lockouts: Map<string, number> = new Map();
  private settings: SecuritySettings;

  constructor(settings?: Partial<SecuritySettings>) {
    this.settings = { ...DEFAULT_SECURITY_SETTINGS, ...settings };
    this.initializeCrypto();
    this.loadFromStorage();
  }

  /**
   * 初始化加密密钥
   */
  private async initializeCrypto(): Promise<void> {
    try {
      // 尝试从存储中恢复密钥，如果没有则生成新密钥
      const storedKey = localStorage.getItem('secure_config_key');
      
      if (storedKey) {
        // 从存储中恢复密钥
        const keyData = JSON.parse(storedKey);
        this.cryptoKey = await crypto.subtle.importKey(
          'jwk',
          keyData,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
        );
      } else {
        // 生成新密钥
        this.cryptoKey = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        
        // 存储密钥
        const keyData = await crypto.subtle.exportKey('jwk', this.cryptoKey);
        localStorage.setItem('secure_config_key', JSON.stringify(keyData));
      }
      
      console.log('🔐 Secure config manager initialized');
    } catch (error) {
      console.error('Failed to initialize crypto:', error);
      // 降级到简单编码（不推荐生产环境）
      this.cryptoKey = null;
    }
  }

  /**
   * 简单编码（降级方案）
   */
  private simpleEncode(text: string): string {
    return btoa(encodeURIComponent(text));
  }

  /**
   * 简单解码（降级方案）
   */
  private simpleDecode(encoded: string): string {
    return decodeURIComponent(atob(encoded));
  }

  /**
   * 检查访问是否被锁定
   */
  private isLocked(configId: string): boolean {
    const lockoutTime = this.lockouts.get(configId);
    if (!lockoutTime) return false;
    
    if (Date.now() - lockoutTime > this.settings.lockoutDuration) {
      this.lockouts.delete(configId);
      return false;
    }
    
    return true;
  }

  /**
   * 记录访问尝试
   */
  private logAccess(configId: string, success: boolean, error?: string, source = 'unknown'): void {
    const access: ConfigAccess = {
      configId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      source,
      success,
      error,
    };

    this.accessLog.push(access);

    // 清理过期日志
    const cutoff = Date.now() - this.settings.auditRetentionPeriod;
    this.accessLog = this.accessLog.filter(log => log.timestamp > cutoff);

    // 检查失败尝试
    if (!success) {
      const recentFailures = this.accessLog.filter(
        log => log.configId === configId && 
               !log.success && 
               log.timestamp > Date.now() - this.settings.lockoutDuration
      ).length;

      if (recentFailures >= this.settings.maxAccessAttempts) {
        this.lockouts.set(configId, Date.now());
        console.warn(`🚨 Security: Config ${configId} locked due to excessive failed attempts`);
      }
    }
  }

  /**
   * 加密配置值
   */
  private async encryptValue(value: string, level: SecureConfig['level'], id: string): Promise<SecureConfig> {
    try {
      if (!this.cryptoKey) {
        // 降级到简单编码
        return {
          id,
          encrypted: this.simpleEncode(value),
          iv: '',
          level,
          createdAt: Date.now(),
          accessCount: 0,
        };
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(value);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.cryptoKey,
        data
      );

      return {
        id,
        encrypted: Array.from(new Uint8Array(encryptedData)).map(b => b.toString(16).padStart(2, '0')).join(''),
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
        level,
        createdAt: Date.now(),
        accessCount: 0,
      };
    } catch (error) {
      console.warn('Encryption failed, using simple encoding:', error);
      return {
        id,
        encrypted: this.simpleEncode(value),
        iv: '',
        level,
        createdAt: Date.now(),
        accessCount: 0,
      };
    }
  }

  /**
   * 解密配置值
   */
  private async decryptValue(config: SecureConfig): Promise<string> {
    try {
      if (!this.cryptoKey || !config.iv) {
        // 使用简单解码
        return this.simpleDecode(config.encrypted);
      }

      const iv = new Uint8Array(config.iv.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      const encryptedData = new Uint8Array(config.encrypted.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.cryptoKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      // 尝试简单解码作为后备
      try {
        return this.simpleDecode(config.encrypted);
      } catch (fallbackError) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }
    }
  }

  /**
   * 存储加密配置
   */
  public async setConfig(id: string, value: string, level: SecureConfig['level'] = 'internal', expiresIn?: number): Promise<void> {
    const config = await this.encryptValue(value, level, id);
    
    if (expiresIn) {
      config.expiresAt = Date.now() + expiresIn;
    }

    this.configs.set(id, config);
    await this.saveToStorage();
    
    console.log(`🔐 Config '${id}' stored securely (level: ${level})`);
  }

  /**
   * 获取解密配置
   */
  public async getConfig(id: string, source = 'direct'): Promise<string | null> {
    try {
      if (this.isLocked(id)) {
        this.logAccess(id, false, 'Access locked due to excessive failures', source);
        throw new Error('Access temporarily locked');
      }

      const config = this.configs.get(id);
      if (!config) {
        this.logAccess(id, false, 'Config not found', source);
        return null;
      }

      // 检查过期
      if (config.expiresAt && Date.now() > config.expiresAt) {
        this.configs.delete(id);
        await this.saveToStorage();
        this.logAccess(id, false, 'Config expired', source);
        return null;
      }

      const value = await this.decryptValue(config);
      
      // 更新访问统计
      config.accessCount++;
      config.lastAccess = Date.now();
      this.configs.set(id, config);
      
      this.logAccess(id, true, undefined, source);
      return value;
    } catch (error) {
      this.logAccess(id, false, (error as Error).message, source);
      return null;
    }
  }

  /**
   * 删除配置
   */
  public async deleteConfig(id: string): Promise<boolean> {
    const deleted = this.configs.delete(id);
    if (deleted) {
      await this.saveToStorage();
      console.log(`🗑️ Config '${id}' deleted`);
    }
    return deleted;
  }

  /**
   * 列出所有配置（不包含值）
   */
  public listConfigs(): Array<{ id: string; level: string; createdAt: number; accessCount: number }> {
    return Array.from(this.configs.entries()).map(([id, config]) => ({
      id,
      level: config.level,
      createdAt: config.createdAt,
      accessCount: config.accessCount,
    }));
  }

  /**
   * 获取安全统计
   */
  public getSecurityStats(): {
    totalConfigs: number;
    configsByLevel: Record<string, number>;
    totalAccesses: number;
    failedAccesses: number;
    lockedConfigs: number;
    encryptionEnabled: boolean;
  } {
    const configsByLevel: Record<string, number> = {};
    this.configs.forEach(config => {
      configsByLevel[config.level] = (configsByLevel[config.level] || 0) + 1;
    });

    return {
      totalConfigs: this.configs.size,
      configsByLevel,
      totalAccesses: this.accessLog.length,
      failedAccesses: this.accessLog.filter(log => !log.success).length,
      lockedConfigs: this.lockouts.size,
      encryptionEnabled: !!this.cryptoKey,
    };
  }

  /**
   * 获取访问审计日志
   */
  public getAuditLog(configId?: string): ConfigAccess[] {
    if (configId) {
      return this.accessLog.filter(log => log.configId === configId);
    }
    return [...this.accessLog];
  }

  /**
   * 保存到本地存储
   */
  private async saveToStorage(): Promise<void> {
    try {
      const data = {
        configs: Array.from(this.configs.entries()),
        accessLog: this.accessLog.slice(-1000), // 保留最近1000条日志
        settings: this.settings,
      };
      
      // 简单编码存储
      const encoded = this.simpleEncode(JSON.stringify(data));
      localStorage.setItem('secure_config_store', encoded);
    } catch (error) {
      console.warn('Failed to save secure config to storage:', error);
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage(): void {
    try {
      const encoded = localStorage.getItem('secure_config_store');
      if (!encoded) return;

      const decoded = this.simpleDecode(encoded);
      const data = JSON.parse(decoded);

      this.configs = new Map(data.configs);
      this.accessLog = data.accessLog || [];
      this.settings = { ...this.settings, ...data.settings };
    } catch (error) {
      console.warn('Failed to load secure config from storage:', error);
      // 如果加载失败，使用默认配置
      this.configs.clear();
      this.accessLog = [];
    }
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    this.configs.clear();
    this.accessLog = [];
    this.lockouts.clear();
    this.cryptoKey = null;
  }
}

// 全局实例（单例模式）
let globalSecureConfig: SecureConfigManager | null = null;

/**
 * 获取全局安全配置管理器实例
 */
export function getSecureConfigManager(): SecureConfigManager {
  if (!globalSecureConfig) {
    globalSecureConfig = new SecureConfigManager();
  }
  
  return globalSecureConfig;
}

/**
 * 安全配置存储辅助函数
 */
export const SecureConfig = {
  set: async (key: string, value: string, level?: SecureConfig['level']) => 
    await getSecureConfigManager().setConfig(key, value, level),
  
  get: async (key: string, source?: string) => 
    await getSecureConfigManager().getConfig(key, source),
  
  delete: async (key: string) => 
    await getSecureConfigManager().deleteConfig(key),
  
  list: () => 
    getSecureConfigManager().listConfigs(),
  
  stats: () => 
    getSecureConfigManager().getSecurityStats(),
  
  audit: (configId?: string) => 
    getSecureConfigManager().getAuditLog(configId),
};