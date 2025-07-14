/**
 * 数据安全保护工具库
 * 提供加密、脱敏、验证等安全功能
 */

import CryptoJS from 'crypto-js';

/**
 * 安全配置
 */
const SECURITY_CONFIG = {
  // 加密密钥（生产环境应从环境变量获取）
  ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || 'wenpai-security-key-2024',
  // 敏感数据字段
  SENSITIVE_FIELDS: ['password', 'apiKey', 'token', 'secret', 'key'],
  // 脱敏规则
  MASK_RULES: {
    email: (email: string) => {
      const [username, domain] = email.split('@');
      return `${username.substring(0, 2)}***@${domain}`;
    },
    phone: (phone: string) => {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    },
    id: (id: string) => {
      return id.length > 8 ? `${id.substring(0, 4)}****${id.substring(id.length - 4)}` : '****';
    }
  }
};

/**
 * 数据加密类
 */
export class DataEncryption {
  private key: string;

  constructor(key?: string) {
    this.key = key || SECURITY_CONFIG.ENCRYPTION_KEY;
  }

  /**
   * 加密数据
   * @param data 要加密的数据
   * @returns 加密后的字符串
   */
  encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.key).toString();
    } catch (error) {
      console.error('数据加密失败:', error);
      throw new Error('数据加密失败');
    }
  }

  /**
   * 解密数据
   * @param encryptedData 加密的数据
   * @returns 解密后的字符串
   */
  decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('数据解密失败:', error);
      throw new Error('数据解密失败');
    }
  }

  /**
   * 加密对象
   * @param obj 要加密的对象
   * @returns 加密后的字符串
   */
  encryptObject(obj: Record<string, unknown>): string {
    return this.encrypt(JSON.stringify(obj));
  }

  /**
   * 解密对象
   * @param encryptedData 加密的数据
   * @returns 解密后的对象
   */
  decryptObject<T = Record<string, unknown>>(encryptedData: string): T {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted) as T;
  }
}

/**
 * 数据脱敏类
 */
export class DataMasking {
  /**
   * 脱敏单个值
   * @param value 原始值
   * @param type 数据类型
   * @returns 脱敏后的值
   */
  static maskValue(value: string, type: 'email' | 'phone' | 'id' | 'default' = 'default'): string {
    if (!value) return value;

    const maskRule = SECURITY_CONFIG.MASK_RULES[type];
    if (maskRule) {
      return maskRule(value);
    }

    // 默认脱敏规则
    if (value.length <= 2) return '***';
    return `${value.substring(0, 1)}***${value.substring(value.length - 1)}`;
  }

  /**
   * 脱敏对象中的敏感字段
   * @param obj 原始对象
   * @returns 脱敏后的对象
   */
  static maskObject(obj: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...obj };

    for (const [key, value] of Object.entries(masked)) {
      if (typeof value === 'string' && value) {
        // 检查是否为敏感字段
        const isSensitive = SECURITY_CONFIG.SENSITIVE_FIELDS.some(field => 
          key.toLowerCase().includes(field.toLowerCase())
        );

        if (isSensitive) {
          masked[key] = '***';
          continue;
        }

        // 根据字段名判断类型
        if (key.toLowerCase().includes('email')) {
          masked[key] = this.maskValue(value as string, 'email');
        } else if (key.toLowerCase().includes('phone')) {
          masked[key] = this.maskValue(value as string, 'phone');
        } else if (key.toLowerCase().includes('id')) {
          masked[key] = this.maskValue(value as string, 'id');
        }
      }
    }

    return masked;
  }

  /**
   * 脱敏数组中的对象
   * @param array 原始数组
   * @returns 脱敏后的数组
   */
  static maskArray(array: Record<string, unknown>[]): Record<string, unknown>[] {
    return array.map(item => this.maskObject(item));
  }
}

/**
 * 数据验证类
 */
export class DataValidation {
  /**
   * 验证邮箱格式
   * @param email 邮箱地址
   * @returns 是否有效
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证手机号格式
   * @param phone 手机号
   * @returns 是否有效
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证密码强度
   * @param password 密码
   * @returns 强度等级
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 0;

    // 长度检查
    if (password.length >= 8) score += 1;
    else suggestions.push('密码长度至少8位');

    // 包含数字
    if (/\d/.test(password)) score += 1;
    else suggestions.push('包含数字');

    // 包含小写字母
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('包含小写字母');

    // 包含大写字母
    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('包含大写字母');

    // 包含特殊字符
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else suggestions.push('包含特殊字符');

    const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
    const isValid = score >= 3;

    return { isValid, strength, score, suggestions };
  }

  /**
   * 验证API密钥格式
   * @param apiKey API密钥
   * @returns 是否有效
   */
  static isValidApiKey(apiKey: string): boolean {
    // OpenAI API密钥格式
    if (apiKey.startsWith('sk-') && apiKey.length >= 20) return true;
    // DeepSeek API密钥格式
    if (apiKey.startsWith('sk-') && apiKey.length >= 30) return true;
    // 其他格式
    if (apiKey.length >= 10) return true;
    return false;
  }

  /**
   * 验证URL格式
   * @param url URL地址
   * @returns 是否有效
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 安全存储类
 */
export class SecureStorage {
  private encryption: DataEncryption;

  constructor() {
    this.encryption = new DataEncryption();
  }

  /**
   * 安全存储数据
   * @param key 键名
   * @param value 值
   * @param encrypt 是否加密
   */
  setItem(key: string, value: unknown, encrypt: boolean = true): void {
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      const finalData = encrypt ? this.encryption.encrypt(data) : data;
      localStorage.setItem(key, finalData);
    } catch (error) {
      console.error('安全存储失败:', error);
      throw new Error('数据存储失败');
    }
  }

  /**
   * 安全获取数据
   * @param key 键名
   * @param decrypt 是否解密
   * @returns 存储的值
   */
  getItem<T = unknown>(key: string, decrypt: boolean = true): T | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      if (decrypt) {
        const decrypted = this.encryption.decrypt(data);
        try {
          return JSON.parse(decrypted) as T;
        } catch {
          return decrypted as T;
        }
      }

      try {
        return JSON.parse(data) as T;
      } catch {
        return data as T;
      }
    } catch (error) {
      console.error('安全获取数据失败:', error);
      return null;
    }
  }

  /**
   * 安全删除数据
   * @param key 键名
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('删除数据失败:', error);
    }
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  }
}

/**
 * 安全工具函数
 */
export class SecurityUtils {
  /**
   * 生成随机字符串
   * @param length 长度
   * @returns 随机字符串
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成安全的临时ID
   * @returns 临时ID
   */
  static generateTempId(): string {
    const timestamp = Date.now();
    const random = this.generateRandomString(8);
    return `temp_${timestamp}_${random}`;
  }

  /**
   * 清理敏感数据
   * @param data 原始数据
   * @returns 清理后的数据
   */
  static sanitizeData(data: unknown): unknown {
    if (typeof data === 'string') {
      // 检查是否包含敏感信息
      const sensitivePatterns = [
        /sk-[a-zA-Z0-9]{20,}/g, // API密钥
        /password["\s]*[:=]["\s]*["']?[^"'\s]+["']?/gi, // 密码
        /token["\s]*[:=]["\s]*["']?[^"'\s]+["']?/gi, // 令牌
      ];

      let sanitized = data;
      sensitivePatterns.forEach(pattern => {
        sanitized = (sanitized as string).replace(pattern, '***');
      });

      return sanitized;
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item));
      }

      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * 检查是否为开发环境
   * @returns 是否为开发环境
   */
  static isDevelopment(): boolean {
    return import.meta.env.DEV || process.env.NODE_ENV === 'development';
  }

  /**
   * 安全日志记录
   * @param message 日志消息
   * @param data 日志数据
   * @param level 日志级别
   */
  static secureLog(message: string, data?: unknown, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (this.isDevelopment()) {
      const sanitizedData = data ? this.sanitizeData(data) : undefined;
      console[level](`[Security] ${message}`, sanitizedData);
    }
  }
}

// 导出默认实例
export const secureStorage = new SecureStorage();
export const dataEncryption = new DataEncryption();
export const dataMasking = DataMasking;
export const dataValidation = DataValidation;
export const securityUtils = SecurityUtils;

// 导出类型
export type { DataEncryption, DataMasking, DataValidation, SecureStorage, SecurityUtils }; 