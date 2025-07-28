/**
 * 🔧 用户数据标准化工具
 * 
 * 🎯 目标：在数据源头就解决undefined问题
 * 📋 功能：
 * 1. 统一不同来源的用户数据格式
 * 2. 标准化字段命名和类型
 * 3. 提供安全的默认值
 * 4. 验证数据完整性
 */

/**
 * 标准化后的安全用户类型
 */
export interface SafeUser {
  /** 用户唯一标识，永远不为空 */
  id: string;
  /** 昵称，可能为null但不会是undefined */
  nickname: string | null;
  /** 用户名，可能为null但不会是undefined */
  username: string | null;
  /** 邮箱，可能为null但不会是undefined */
  email: string | null;
  /** 手机号，可能为null但不会是undefined */
  phone: string | null;
  /** 头像URL，可能为null但不会是undefined */
  avatar: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 最后更新时间 */
  updatedAt: string;
}

/**
 * 原始用户数据类型（来自各种API）
 */
export interface RawUserData {
  id?: string | number;
  userId?: string | number;
  nickname?: string;
  username?: string;
  name?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  avatar?: string;
  photo?: string;
  picture?: string;
  avatarUrl?: string;
  [key: string]: any;
}

/**
 * 数据标准化配置
 */
interface NormalizationConfig {
  /** ID字段映射优先级 */
  idFields: string[];
  /** 昵称字段映射优先级 */
  nicknameFields: string[];
  /** 用户名字段映射优先级 */
  usernameFields: string[];
  /** 邮箱字段映射优先级 */
  emailFields: string[];
  /** 手机号字段映射优先级 */
  phoneFields: string[];
  /** 头像字段映射优先级 */
  avatarFields: string[];
  /** 是否生成临时ID */
  generateTempId: boolean;
  /** 是否验证邮箱格式 */
  validateEmail: boolean;
  /** 是否验证手机号格式 */
  validatePhone: boolean;
}

/**
 * 默认标准化配置
 */
const DEFAULT_CONFIG: NormalizationConfig = {
  idFields: ['id', 'userId', 'user_id', 'uid'],
  nicknameFields: ['nickname', 'displayName', 'display_name', 'name'],
  usernameFields: ['username', 'user_name', 'loginName', 'login_name'],
  emailFields: ['email', 'emailAddress', 'email_address', 'mail'],
  phoneFields: ['phone', 'mobile', 'phoneNumber', 'phone_number', 'cellphone'],
  avatarFields: ['avatar', 'photo', 'picture', 'avatarUrl', 'avatar_url', 'profilePicture'],
  generateTempId: true,
  validateEmail: true,
  validatePhone: true
};

/**
 * 用户数据标准化器
 */
export class UserDataNormalizer {
  private config: NormalizationConfig;
  
  constructor(config: Partial<NormalizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * 标准化用户数据
   */
  normalize(rawData: RawUserData): SafeUser {
    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Invalid user data: must be an object');
    }
    
    const normalized: SafeUser = {
      id: this.extractId(rawData),
      nickname: this.extractField(rawData, this.config.nicknameFields),
      username: this.extractField(rawData, this.config.usernameFields),
      email: this.extractEmail(rawData),
      phone: this.extractPhone(rawData),
      avatar: this.extractField(rawData, this.config.avatarFields),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.validateNormalizedData(normalized);
    return normalized;
  }
  
  /**
   * 批量标准化用户数据
   */
  normalizeMany(rawDataArray: RawUserData[]): SafeUser[] {
    if (!Array.isArray(rawDataArray)) {
      throw new Error('Invalid input: must be an array');
    }
    
    return rawDataArray.map((rawData, index) => {
      try {
        return this.normalize(rawData);
      } catch (error) {
        console.error(`Failed to normalize user data at index ${index}:`, error);
        throw error;
      }
    });
  }
  
  /**
   * 提取用户ID
   */
  private extractId(rawData: RawUserData): string {
    for (const field of this.config.idFields) {
      const value = rawData[field];
      if (value !== undefined && value !== null && value !== '') {
        return String(value);
      }
    }
    
    if (this.config.generateTempId) {
      return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    throw new Error('No valid ID found in user data');
  }
  
  /**
   * 提取字段值
   */
  private extractField(rawData: RawUserData, fieldNames: string[]): string | null {
    for (const field of fieldNames) {
      const value = rawData[field];
      if (value !== undefined && value !== null && value !== '') {
        const stringValue = String(value).trim();
        return stringValue || null;
      }
    }
    return null;
  }
  
  /**
   * 提取邮箱
   */
  private extractEmail(rawData: RawUserData): string | null {
    const email = this.extractField(rawData, this.config.emailFields);
    
    if (!email) return null;
    
    if (this.config.validateEmail && !this.isValidEmail(email)) {
      console.warn(`Invalid email format: ${email}`);
      return null;
    }
    
    return email;
  }
  
  /**
   * 提取手机号
   */
  private extractPhone(rawData: RawUserData): string | null {
    const phone = this.extractField(rawData, this.config.phoneFields);
    
    if (!phone) return null;
    
    if (this.config.validatePhone && !this.isValidPhone(phone)) {
      console.warn(`Invalid phone format: ${phone}`);
      return null;
    }
    
    return phone;
  }
  
  /**
   * 验证邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * 验证手机号格式
   */
  private isValidPhone(phone: string): boolean {
    // 简单的手机号验证（支持中国手机号）
    const phoneRegex = /^1[3-9]\d{9}$/;
    const cleanPhone = phone.replace(/\D/g, '');
    return phoneRegex.test(cleanPhone);
  }
  
  /**
   * 验证标准化后的数据
   */
  private validateNormalizedData(data: SafeUser): void {
    if (!data.id) {
      throw new Error('Normalized user data must have an ID');
    }
    
    // 确保所有字段都不是undefined
    const undefinedFields = Object.entries(data)
      .filter(([key, value]) => value === undefined)
      .map(([key]) => key);
    
    if (undefinedFields.length > 0) {
      throw new Error(`Normalized data contains undefined fields: ${undefinedFields.join(', ')}`);
    }
  }
}

/**
 * 默认标准化器实例
 */
export const defaultNormalizer = new UserDataNormalizer();

/**
 * 快捷标准化函数
 */
export function normalizeUser(rawData: RawUserData): SafeUser {
  return defaultNormalizer.normalize(rawData);
}

/**
 * 快捷批量标准化函数
 */
export function normalizeUsers(rawDataArray: RawUserData[]): SafeUser[] {
  return defaultNormalizer.normalizeMany(rawDataArray);
}

/**
 * 使用示例：
 * 
 * ```typescript
 * // 单个用户标准化
 * const authingUser = {
 *   id: '123',
 *   nickname: '张三',
 *   email: 'zhang@example.com',
 *   photo: 'https://example.com/avatar.jpg'
 * };
 * 
 * const safeUser = normalizeUser(authingUser);
 * // 结果: { id: '123', nickname: '张三', username: null, email: 'zhang@example.com', ... }
 * 
 * // 批量标准化
 * const users = normalizeUsers([authingUser, localUser, apiUser]);
 * 
 * // 自定义配置
 * const customNormalizer = new UserDataNormalizer({
 *   generateTempId: false,
 *   validateEmail: false
 * });
 * ```
 */
