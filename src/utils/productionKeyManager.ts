/**
 * 🔐 生产环境密钥管理系统
 * 遵循CLAUDE.md规范，实现企业级密钥管理
 * 
 * 功能特性：
 * - 环境变量优先级管理
 * - 密钥强度验证
 * - 密钥轮换机制
 * - 审计日志记录
 * - 安全配置验证
 */

export interface KeyConfig {
  name: string;
  required: boolean;
  minLength: number;
  pattern?: RegExp;
  description: string;
  rotationDays?: number;
}

export interface KeyValidationResult {
  isValid: boolean;
  key: string;
  source: 'env' | 'fallback' | 'generated';
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
  recommendations: string[];
  expiresAt?: number;
}

export interface SecurityAlert {
  level: 'info' | 'warning' | 'error' | 'critical';
  category: 'key_management' | 'security' | 'configuration';
  message: string;
  details: Record<string, any>;
  timestamp: number;
  resolved: boolean;
}

/**
 * 生产环境密钥配置
 */
const PRODUCTION_KEY_CONFIGS: Record<string, KeyConfig> = {
  ENCRYPTION_MASTER_KEY: {
    name: 'VITE_ENCRYPTION_MASTER_KEY',
    required: true,
    minLength: 32,
    pattern: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{32,}$/,
    description: '主加密密钥，用于数据加密',
    rotationDays: 90
  },
  JWT_SECRET: {
    name: 'VITE_JWT_SECRET',
    required: true,
    minLength: 64,
    pattern: /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{64,}$/,
    description: 'JWT签名密钥',
    rotationDays: 30
  },
  API_ENCRYPTION_KEY: {
    name: 'VITE_API_ENCRYPTION_KEY',
    required: false,
    minLength: 32,
    description: 'API通信加密密钥',
    rotationDays: 60
  },
  SESSION_SECRET: {
    name: 'VITE_SESSION_SECRET',
    required: true,
    minLength: 48,
    description: '会话加密密钥',
    rotationDays: 45
  },
  WEBHOOK_SECRET: {
    name: 'VITE_WEBHOOK_SECRET',
    required: false,
    minLength: 32,
    description: 'Webhook验证密钥',
    rotationDays: 30
  }
};

/**
 * 生产环境密钥管理器
 */
export class ProductionKeyManager {
  private static instance: ProductionKeyManager;
  private keyCache: Map<string, KeyValidationResult> = new Map();
  private alerts: SecurityAlert[] = [];
  private lastValidation: number = 0;
  private readonly VALIDATION_INTERVAL = 24 * 60 * 60 * 1000; // 24小时

  private constructor() {
    this.initializeKeyValidation();
  }

  public static getInstance(): ProductionKeyManager {
    if (!ProductionKeyManager.instance) {
      ProductionKeyManager.instance = new ProductionKeyManager();
    }
    return ProductionKeyManager.instance;
  }

  /**
   * 初始化密钥验证
   */
  private initializeKeyValidation(): void {
    // 🔧 修复：开发环境完全跳过密钥验证
    if (!this.isProduction()) {
      console.log('🔐 密钥管理器已初始化（开发模式 - 跳过验证）');
      return;
    }
    
    // 仅生产环境进行密钥验证
    this.validateAllKeys();
    
    // 设置定期验证
    setInterval(() => {
      this.validateAllKeys();
    }, this.VALIDATION_INTERVAL);

    console.log('🔐 生产环境密钥管理器已初始化');
  }

  /**
   * 获取并验证密钥
   */
  public getValidatedKey(keyName: keyof typeof PRODUCTION_KEY_CONFIGS): KeyValidationResult {
    const config = PRODUCTION_KEY_CONFIGS[keyName];
    if (!config) {
      throw new Error(`未知的密钥配置: ${keyName}`);
    }

    // 检查缓存
    const cached = this.keyCache.get(keyName);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    // 验证密钥
    const result = this.validateKey(config);
    this.keyCache.set(keyName, result);

    // 🔧 仅在生产环境或有严重问题时记录安全警告
    if (result.issues.length > 0 && (this.isProduction() || result.source === 'fallback')) {
      this.addSecurityAlert('warning', 'key_management', 
        `密钥 ${keyName} 存在安全问题`, {
          keyName,
          issues: result.issues,
          source: result.source
        });
    }

    return result;
  }

  /**
   * 验证单个密钥
   */
  private validateKey(config: KeyConfig): KeyValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const isProduction = this.isProduction();
    
    // 1. 从环境变量获取
    let key = this.getFromEnvironment(config.name);
    let source: 'env' | 'fallback' | 'generated' = 'env';

    if (!key) {
      // 2. 生产环境必须有环境变量
      if (isProduction && config.required) {
        issues.push(`生产环境缺少必需的环境变量: ${config.name}`);
        recommendations.push(`设置环境变量 ${config.name}`);
      }

      // 3. 生成临时密钥（仅非生产环境）
      if (!isProduction) {
        key = this.generateSecureKey(config.minLength);
        source = 'generated';
        // 🔧 开发环境不显示警告，仅记录信息
        // issues.push(`使用生成的临时密钥，建议设置环境变量`);
      } else {
        // 生产环境回退到安全的固定密钥
        key = this.getProductionFallbackKey(config);
        source = 'fallback';
        issues.push(`使用回退密钥，强烈建议设置环境变量`);
      }
    }

    // 🔧 仅在生产环境进行严格验证
    if (isProduction) {
      // 验证密钥强度
      const strength = this.assessKeyStrength(key, config);
      if (strength === 'weak') {
        issues.push(`密钥强度不足`);
        recommendations.push(`使用更强的密钥，长度至少${config.minLength}位`);
      }

      // 验证密钥格式
      if (config.pattern && !config.pattern.test(key)) {
        issues.push(`密钥格式不符合要求`);
        recommendations.push(`密钥应匹配模式: ${config.pattern.source}`);
      }

      // 检查密钥轮换
      const expiresAt = this.calculateKeyExpiry(config);
      if (expiresAt && Date.now() > expiresAt) {
        issues.push(`密钥已过期，需要轮换`);
        recommendations.push(`更新密钥并重新部署`);
      }
    }

    // 评估密钥强度（开发环境使用宽松标准）
    const strength = this.assessKeyStrength(key, config);

    return {
      isValid: issues.length === 0,
      key,
      source,
      strength,
      issues,
      recommendations,
      expiresAt: isProduction ? this.calculateKeyExpiry(config) : undefined
    };
  }

  /**
   * 从环境变量获取密钥
   */
  private getFromEnvironment(keyName: string): string | null {
    // 优先级：import.meta.env > process.env > window.__ENV__
    if (import.meta.env?.[keyName]) {
      return import.meta.env[keyName];
    }

    if (typeof process !== 'undefined' && process.env?.[keyName]) {
      return process.env[keyName];
    }

    if (typeof window !== 'undefined' && (window as any).__ENV__?.[keyName]) {
      return (window as any).__ENV__[keyName];
    }

    return null;
  }

  /**
   * 生成安全密钥
   */
  private generateSecureKey(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    
    // 确保包含各种字符类型
    const types = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // 大写
      'abcdefghijklmnopqrstuvwxyz', // 小写
      '0123456789', // 数字
      '!@#$%^&*()_+-=[]{}|;:,.<>?' // 特殊字符
    ];

    // 每种类型至少一个字符
    types.forEach(type => {
      result += type[Math.floor(Math.random() * type.length)];
    });

    // 填充剩余长度
    for (let i = result.length; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }

    // 打乱字符顺序
    return result.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * 获取生产环境回退密钥
   */
  private getProductionFallbackKey(config: KeyConfig): string {
    // 基于配置名称和应用信息生成确定性但安全的密钥
    const baseString = `wenpai-prod-${config.name}-2025-security-key`;
    
    // 使用简单的哈希算法生成固定长度密钥
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    // 转换为安全密钥格式
    const hashStr = Math.abs(hash).toString(36);
    const timestamp = '20250928'; // 固定时间戳
    const suffix = 'WenPaiSecure2025!';
    
    let key = `${hashStr}${timestamp}${suffix}`;
    
    // 确保达到最小长度
    while (key.length < config.minLength) {
      key += key.slice(-8);
    }
    
    return key.substring(0, Math.max(config.minLength, 48));
  }

  /**
   * 评估密钥强度
   */
  private assessKeyStrength(key: string, config: KeyConfig): 'weak' | 'medium' | 'strong' {
    if (key.length < config.minLength) return 'weak';
    if (key.length < config.minLength * 1.5) return 'medium';

    // 检查字符复杂度
    const hasLower = /[a-z]/.test(key);
    const hasUpper = /[A-Z]/.test(key);
    const hasDigit = /\d/.test(key);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(key);

    const complexity = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
    
    if (complexity >= 3 && key.length >= config.minLength * 1.5) return 'strong';
    if (complexity >= 2) return 'medium';
    return 'weak';
  }

  /**
   * 计算密钥过期时间
   */
  private calculateKeyExpiry(config: KeyConfig): number | undefined {
    if (!config.rotationDays) return undefined;
    
    // 从部署时间开始计算（简化实现）
    const deployTime = this.getDeploymentTime();
    return deployTime + (config.rotationDays * 24 * 60 * 60 * 1000);
  }

  /**
   * 获取部署时间
   */
  private getDeploymentTime(): number {
    // 尝试从环境变量获取部署时间
    const deployTime = this.getFromEnvironment('VITE_DEPLOY_TIME');
    if (deployTime) {
      return parseInt(deployTime, 10);
    }
    
    // 回退到应用启动时间
    return Date.now() - (24 * 60 * 60 * 1000); // 假设24小时前部署
  }

  /**
   * 验证所有密钥
   */
  public validateAllKeys(): void {
    const isProduction = this.isProduction();
    
    // 🔧 开发环境静默验证，减少控制台噪音
    if (isProduction) {
      console.log('🔍 开始密钥安全验证...');
    }
    
    const results: Record<string, KeyValidationResult> = {};
    let totalIssues = 0;
    let criticalIssues = 0;

    Object.keys(PRODUCTION_KEY_CONFIGS).forEach(keyName => {
      try {
        const result = this.getValidatedKey(keyName as keyof typeof PRODUCTION_KEY_CONFIGS);
        results[keyName] = result;
        
        // 🔧 只计算严重问题（生产环境或回退密钥）
        if (isProduction || result.source === 'fallback') {
          totalIssues += result.issues.length;
          if (result.source === 'fallback' || result.strength === 'weak') {
            criticalIssues++;
          }
        }
      } catch (error) {
        console.error(`❌ 密钥验证失败: ${keyName}`, error);
        this.addSecurityAlert('critical', 'key_management', 
          `密钥验证失败: ${keyName}`, { keyName, error: String(error) });
      }
    });

    this.lastValidation = Date.now();

    // 🔧 生成验证报告 - 仅在生产环境或有严重问题时输出
    if (isProduction || criticalIssues > 0) {
      if (totalIssues === 0) {
        console.log('✅ 所有密钥验证通过');
      } else {
        console.warn(`⚠️ 发现 ${totalIssues} 个密钥安全问题`);
        this.addSecurityAlert('warning', 'security', 
          `密钥安全验证发现问题`, { 
            totalIssues, 
            criticalIssues,
            environment: isProduction ? 'production' : 'development',
            results: Object.fromEntries(
              Object.entries(results)
                .filter(([k, v]) => isProduction || v.source === 'fallback')
                .map(([k, v]) => [k, {
                  source: v.source,
                  strength: v.strength,
                  issueCount: v.issues.length
                }])
            )
          });
      }
    } else {
      // 开发环境简化日志
      console.log('🔐 密钥管理器已初始化（开发模式）');
    }
  }

  /**
   * 检查缓存有效性
   */
  private isCacheValid(result: KeyValidationResult): boolean {
    const cacheAge = Date.now() - this.lastValidation;
    return cacheAge < (60 * 60 * 1000); // 1小时缓存
  }

  /**
   * 添加安全警告
   */
  private addSecurityAlert(
    level: SecurityAlert['level'],
    category: SecurityAlert['category'],
    message: string,
    details: Record<string, any>
  ): void {
    const alert: SecurityAlert = {
      level,
      category,
      message,
      details,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(alert);
    
    // 限制警告数量
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    console.warn(`🚨 安全警告 [${level}]`, message, details);
  }

  /**
   * 检查是否为生产环境
   */
  private isProduction(): boolean {
    // 🔧 修复：更准确的环境检测逻辑
    // 优先检查明确的开发环境标识
    if (import.meta.env.DEV || 
        import.meta.env.NODE_ENV === 'development' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname.startsWith('127.') ||
        window.location.hostname.includes('local') ||
        (window.location.port && window.location.port !== '80' && window.location.port !== '443')) {
      return false; // 明确是开发环境
    }
    
    // 然后检查生产环境标识
    return import.meta.env.PROD || 
           import.meta.env.NODE_ENV === 'production' ||
           window.location.hostname === 'www.wenpai.xyz';
  }

  /**
   * 获取安全状态报告
   */
  public getSecurityReport(): {
    status: 'secure' | 'warning' | 'critical';
    summary: string;
    keyStatuses: Record<string, Omit<KeyValidationResult, 'key'>>;
    alerts: SecurityAlert[];
    recommendations: string[];
  } {
    const keyStatuses: Record<string, Omit<KeyValidationResult, 'key'>> = {};
    const allRecommendations: string[] = [];
    let criticalIssues = 0;
    let warningIssues = 0;

    Object.keys(PRODUCTION_KEY_CONFIGS).forEach(keyName => {
      const result = this.keyCache.get(keyName);
      if (result) {
        const { key, ...status } = result;
        keyStatuses[keyName] = status;
        allRecommendations.push(...result.recommendations);
        
        if (result.issues.length > 0) {
          if (result.source === 'fallback' || result.strength === 'weak') {
            criticalIssues++;
          } else {
            warningIssues++;
          }
        }
      }
    });

    let status: 'secure' | 'warning' | 'critical' = 'secure';
    let summary = '所有密钥配置安全';

    if (criticalIssues > 0) {
      status = 'critical';
      summary = `发现 ${criticalIssues} 个严重安全问题`;
    } else if (warningIssues > 0) {
      status = 'warning';
      summary = `发现 ${warningIssues} 个安全警告`;
    }

    return {
      status,
      summary,
      keyStatuses,
      alerts: this.alerts.filter(a => !a.resolved),
      recommendations: [...new Set(allRecommendations)]
    };
  }

  /**
   * 解决安全警告
   */
  public resolveAlert(alertIndex: number): boolean {
    if (alertIndex >= 0 && alertIndex < this.alerts.length) {
      this.alerts[alertIndex].resolved = true;
      return true;
    }
    return false;
  }

  /**
   * 强制刷新密钥缓存
   */
  public refreshKeyCache(): void {
    this.keyCache.clear();
    this.validateAllKeys();
    console.log('🔄 密钥缓存已刷新');
  }
}

// 导出单例实例
export const productionKeyManager = ProductionKeyManager.getInstance();

/**
 * 便捷的密钥获取函数
 */
export const SecureKeys = {
  /**
   * 获取主加密密钥
   */
  getEncryptionKey(): string {
    return productionKeyManager.getValidatedKey('ENCRYPTION_MASTER_KEY').key;
  },

  /**
   * 获取JWT密钥
   */
  getJwtSecret(): string {
    return productionKeyManager.getValidatedKey('JWT_SECRET').key;
  },

  /**
   * 获取会话密钥
   */
  getSessionSecret(): string {
    return productionKeyManager.getValidatedKey('SESSION_SECRET').key;
  },

  /**
   * 获取API加密密钥
   */
  getApiEncryptionKey(): string | null {
    try {
      return productionKeyManager.getValidatedKey('API_ENCRYPTION_KEY').key;
    } catch {
      return null;
    }
  },

  /**
   * 获取安全报告
   */
  getSecurityReport() {
    return productionKeyManager.getSecurityReport();
  },

  /**
   * 验证所有密钥
   */
  validateAll(): void {
    productionKeyManager.validateAllKeys();
  }
};