/**
 * 🔍 数据类型验证系统
 * 确保localStorage存储和读取数据的类型安全，防止XSS和数据污染
 */

import { SecurityUtils } from '@/lib/security';

/**
 * 数据模式定义
 */
export interface DataSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  properties?: Record<string, DataSchema>;
  items?: DataSchema;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: unknown[];
  sanitize?: boolean;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: unknown;
}

/**
 * 预定义的数据模式
 */
export const DATA_SCHEMAS: Record<string, DataSchema> = {
  // 用户信息模式
  USER_INFO: {
    type: 'object',
    required: false, // 改为非必需，避免验证失败
    properties: {
      id: { type: 'string', required: false, minLength: 1 },
      username: { type: 'string', required: false, sanitize: true },
      email: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      nickname: { type: 'string', required: false, sanitize: true },
      avatar: { type: 'string', required: false },
      loginTime: { type: 'string', required: false }
    }
  },

  // 品牌资产模式
  BRAND_ASSET: {
    type: 'object',
    required: true,
    properties: {
      id: { type: 'string', required: true },
      name: { type: 'string', required: true, sanitize: true },
      type: { type: 'string', enum: ['document', 'image', 'video', 'audio', 'other'] },
      size: { type: 'string' },
      uploadDate: { type: 'string' },
      status: { type: 'string', enum: ['uploading', 'uploaded', 'processing', 'analyzed', 'error'] },
      category: { type: 'string', sanitize: true }
    }
  },

  // 支付状态模式
  PAYMENT_STATUS: {
    type: 'object',
    required: true,
    properties: {
      checkoutId: { type: 'string', required: true },
      status: { type: 'string', enum: ['pending', 'processing', 'paid', 'failed', 'expired', 'cancelled'] },
      message: { type: 'string', sanitize: true },
      progress: { type: 'number' },
      amount: { type: 'number' },
      currency: { type: 'string' },
      createdAt: { type: 'string', required: true },
      updatedAt: { type: 'string', required: true }
    }
  },

  // UI偏好模式
  UI_PREFERENCES: {
    type: 'object',
    properties: {
      theme: { type: 'string', enum: ['light', 'dark', 'system'] },
      language: { type: 'string', enum: ['zh-CN', 'en-US'] },
      fontSize: { type: 'string', enum: ['small', 'medium', 'large'] },
      sidebarCollapsed: { type: 'boolean' }
    }
  },

  // 临时表单数据模式
  FORM_DRAFT: {
    type: 'object',
    properties: {
      content: { type: 'string', sanitize: true },
      timestamp: { type: 'string', required: true },
      formId: { type: 'string', required: true }
    }
  },

  // Amplitude分析数据模式
  AMP_UNSENT: {
    type: 'object',
    properties: {
      events: { type: 'array', items: { type: 'object' } },
      lastSent: { type: 'string' }
    }
  },

  // 访客会话信息模式
  GUEST_SESSION_INFO: {
    type: 'object',
    properties: {
      sessionId: { type: 'string', required: true },
      createdAt: { type: 'string', required: true },
      lastActive: { type: 'string', required: false },
      dataCount: { type: 'number', required: false }
    }
  },

  // 全局设置模式
  GLOBAL_SETTINGS: {
    type: 'object',
    properties: {
      version: { type: 'string' },
      features: { type: 'object' },
      cache: { type: 'object' }
    }
  },

  // 认证守卫模式
  AUTH_GUARD: {
    type: 'object',
    properties: {
      attempts: { type: 'number' },
      lastAttempt: { type: 'string' },
      blocked: { type: 'boolean' }
    }
  },

  // 认证存储模式
  AUTH_STORAGE: {
    type: 'object',
    properties: {
      tokens: { type: 'object', required: false },
      refreshToken: { type: 'string', required: false },
      expiry: { type: 'string', required: false }
    }
  },

  // 支付中心访问时间模式
  PAYMENT_ACCESS_TIME: {
    type: 'object',
    properties: {
      firstAccess: { type: 'string', required: true },
      lastAccess: { type: 'string' },
      offerExpiry: { type: 'string' }
    }
  },

  // Token使用统计模式
  TOKEN_USAGE_STORE: {
    type: 'object',
    properties: {
      usage: { type: 'object', required: false },
      limits: { type: 'object', required: false },
      period: { type: 'string', required: false }
    }
  },

  // 营销日历任务模式
  MARKETING_CALENDAR_TASKS: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', required: true },
        title: { type: 'string', required: true, sanitize: true },
        date: { type: 'string', required: true },
        completed: { type: 'boolean' }
      }
    }
  },

  // 简单字符串值模式（用于主题、语言等）
  SIMPLE_STRING: {
    type: 'string',
    sanitize: true
  }
};

/**
 * 数据类型验证器
 */
export class DataTypeValidator {
  private static instance: DataTypeValidator;

  private constructor() {}

  static getInstance(): DataTypeValidator {
    if (!DataTypeValidator.instance) {
      DataTypeValidator.instance = new DataTypeValidator();
    }
    return DataTypeValidator.instance;
  }

  /**
   * 验证数据是否符合模式
   */
  validate(data: unknown, schema: DataSchema): ValidationResult {
    const errors: string[] = [];
    let sanitizedData = data;

    try {
      // 必填检查
      if (schema.required && (data === null || data === undefined)) {
        errors.push('数据不能为空');
        return { isValid: false, errors };
      }

      // 类型检查
      if (!this.validateType(data, schema.type)) {
        errors.push(`数据类型错误，期望 ${schema.type}，实际 ${typeof data}`);
      }

      // 字符串验证
      if (schema.type === 'string' && typeof data === 'string') {
        const stringValidation = this.validateString(data, schema);
        errors.push(...stringValidation.errors);
        if (stringValidation.sanitized !== undefined) {
          sanitizedData = stringValidation.sanitized;
        }
      }

      // 对象验证
      if (schema.type === 'object' && typeof data === 'object' && data !== null) {
        const objectValidation = this.validateObject(data as Record<string, unknown>, schema);
        errors.push(...objectValidation.errors);
        if (objectValidation.sanitized !== undefined) {
          sanitizedData = objectValidation.sanitized;
        }
      }

      // 数组验证
      if (schema.type === 'array' && Array.isArray(data)) {
        const arrayValidation = this.validateArray(data, schema);
        errors.push(...arrayValidation.errors);
        if (arrayValidation.sanitized !== undefined) {
          sanitizedData = arrayValidation.sanitized;
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? sanitizedData : undefined
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`验证过程出错: ${error instanceof Error ? error.message : '未知错误'}`]
      };
    }
  }

  /**
   * 验证类型
   */
  private validateType(data: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof data === 'string';
      case 'number':
        return typeof data === 'number' && !isNaN(data);
      case 'boolean':
        return typeof data === 'boolean';
      case 'object':
        return typeof data === 'object' && data !== null && !Array.isArray(data);
      case 'array':
        return Array.isArray(data);
      default:
        return false;
    }
  }

  /**
   * 验证字符串
   */
  private validateString(data: string, schema: DataSchema): { 
    errors: string[]; 
    sanitized?: string 
  } {
    const errors: string[] = [];
    let sanitized = data;

    // 长度检查
    if (schema.minLength && data.length < schema.minLength) {
      errors.push(`字符串长度不能少于 ${schema.minLength}`);
    }
    if (schema.maxLength && data.length > schema.maxLength) {
      errors.push(`字符串长度不能超过 ${schema.maxLength}`);
    }

    // 正则验证
    if (schema.pattern && !schema.pattern.test(data)) {
      errors.push('字符串格式不符合要求');
    }

    // 枚举检查
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push(`值必须是以下之一: ${schema.enum.join(', ')}`);
    }

    // 数据清理
    if (schema.sanitize) {
      sanitized = this.sanitizeString(data);
    }

    return { errors, sanitized: sanitized !== data ? sanitized : undefined };
  }

  /**
   * 验证对象
   */
  private validateObject(data: Record<string, unknown>, schema: DataSchema): {
    errors: string[];
    sanitized?: Record<string, unknown>;
  } {
    const errors: string[] = [];
    const sanitized: Record<string, unknown> = { ...data };

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, propSchema]) => {
        const value = data[key];
        const result = this.validate(value, propSchema);
        
        if (!result.isValid) {
          errors.push(...result.errors.map(err => `${key}: ${err}`));
        } else if (result.sanitizedData !== undefined) {
          sanitized[key] = result.sanitizedData;
        }
      });
    }

    return { 
      errors, 
      sanitized: JSON.stringify(sanitized) !== JSON.stringify(data) ? sanitized : undefined 
    };
  }

  /**
   * 验证数组
   */
  private validateArray(data: unknown[], schema: DataSchema): {
    errors: string[];
    sanitized?: unknown[];
  } {
    const errors: string[] = [];
    const sanitized: unknown[] = [];

    if (schema.items) {
      data.forEach((item, index) => {
        const result = this.validate(item, schema.items!);
        if (!result.isValid) {
          errors.push(...result.errors.map(err => `[${index}]: ${err}`));
        }
        sanitized.push(result.sanitizedData !== undefined ? result.sanitizedData : item);
      });
    }

    return { 
      errors, 
      sanitized: sanitized.length > 0 ? sanitized : undefined 
    };
  }

  /**
   * 清理字符串中的潜在危险内容
   */
  private sanitizeString(input: string): string {
    return SecurityUtils.sanitizeData(input) as string;
  }

  /**
   * 验证并清理localStorage数据
   */
  validateAndSanitizeStorageData(key: string, data: unknown, schemaName?: string): {
    isValid: boolean;
    sanitizedData?: unknown;
    errors: string[];
  } {
    // 自动推断数据模式
    const schema = schemaName ? DATA_SCHEMAS[schemaName] : this.inferSchema(key);
    
    if (!schema) {
      console.warn(`未找到数据模式: ${schemaName || key}`);
      return {
        isValid: true,
        sanitizedData: data,
        errors: []
      };
    }

    const result = this.validate(data, schema);
    
    if (!result.isValid) {
      console.error(`数据验证失败 [${key}]:`, result.errors);
    }

    return {
      isValid: result.isValid,
      sanitizedData: result.sanitizedData,
      errors: result.errors
    };
  }

  /**
   * 根据存储键推断数据模式
   */
  private inferSchema(key: string): DataSchema | null {
    // Amplitude分析数据
    if (key.includes('AMP_unsent')) {
      return DATA_SCHEMAS.AMP_UNSENT;
    }
    
    // 访客会话信息
    if (key.includes('wenpai:guest:session_info')) {
      return DATA_SCHEMAS.GUEST_SESSION_INFO;
    }
    
    // 全局设置
    if (key.includes('globalSettings')) {
      return DATA_SCHEMAS.GLOBAL_SETTINGS;
    }
    
    // 认证守卫
    if (key.includes('auth_retry_guard') || key.includes('auth_code_guard')) {
      return DATA_SCHEMAS.AUTH_GUARD;
    }
    
    // 认证存储
    if (key.includes('auth-storage')) {
      return DATA_SCHEMAS.AUTH_STORAGE;
    }
    
    // 支付中心访问时间
    if (key.includes('payment_center_access_time')) {
      return DATA_SCHEMAS.PAYMENT_ACCESS_TIME;
    }
    
    // Token使用统计
    if (key.includes('wenpai-token-usage-store')) {
      return DATA_SCHEMAS.TOKEN_USAGE_STORE;
    }
    
    // 营销日历任务
    if (key.includes('marketing-calendar-tasks')) {
      return DATA_SCHEMAS.MARKETING_CALENDAR_TASKS;
    }
    
    // 简单字符串值（主题、语言等）
    if (key.includes('wenpai-language') || key.includes('wenpai-theme')) {
      return DATA_SCHEMAS.SIMPLE_STRING;
    }
    
    // 数据验证运行时间
    if (key === 'data_validation_last_run') {
      return { type: 'string', required: false };
    }
    
    // 通知数据
    if (key === 'notifications') {
      return { type: 'array', required: false };
    }
    
    // Authing用户信息 - 使用宽松验证
    if (key === '_authing_user') {
      return { type: 'object', required: false }; // 宽松验证
    }
    
    // 用户信息
    if (key.includes('user') && key.includes('auth')) {
      return DATA_SCHEMAS.USER_INFO;
    }
    
    // 品牌资产
    if (key.includes('brand') && key.includes('assets')) {
      return { type: 'array', items: DATA_SCHEMAS.BRAND_ASSET };
    }
    
    // 支付状态
    if (key.includes('payment') && !key.includes('access_time')) {
      return DATA_SCHEMAS.PAYMENT_STATUS;
    }
    
    // UI偏好
    if (key.includes('ui')) {
      return DATA_SCHEMAS.UI_PREFERENCES;
    }
    
    // 表单草稿
    if (key.includes('form') || key.includes('draft')) {
      return DATA_SCHEMAS.FORM_DRAFT;
    }
    
    return null;
  }

  /**
   * 批量验证所有localStorage数据
   */
  validateAllStorageData(): {
    totalItems: number;
    validItems: number;
    invalidItems: { key: string; errors: string[] }[];
    sanitizedItems: { key: string; originalSize: number; newSize: number }[];
  } {
    const allKeys = Object.keys(localStorage);
    const invalidItems: { key: string; errors: string[] }[] = [];
    const sanitizedItems: { key: string; originalSize: number; newSize: number }[] = [];
    let validItems = 0;

    allKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (!data) return;

        const originalSize = data.length;
        const parsed = JSON.parse(data);
        const result = this.validateAndSanitizeStorageData(key, parsed);

        if (result.isValid) {
          validItems++;
          
          if (result.sanitizedData !== undefined) {
            const sanitizedJson = JSON.stringify(result.sanitizedData);
            const newSize = sanitizedJson.length;
            
            // 更新localStorage中的数据
            localStorage.setItem(key, sanitizedJson);
            
            sanitizedItems.push({
              key,
              originalSize,
              newSize
            });
          }
        } else {
          invalidItems.push({
            key,
            errors: result.errors
          });
        }
      } catch (error) {
        invalidItems.push({
          key,
          errors: [`JSON解析失败: ${error instanceof Error ? error.message : '未知错误'}`]
        });
      }
    });

    return {
      totalItems: allKeys.length,
      validItems,
      invalidItems,
      sanitizedItems
    };
  }
}

/**
 * 安全的localStorage操作包装器
 */
export class SafeLocalStorage {
  private validator: DataTypeValidator;

  constructor() {
    this.validator = DataTypeValidator.getInstance();
  }

  /**
   * 安全存储数据
   */
  setItem<T>(key: string, value: T, schemaName?: string): boolean {
    try {
      // 验证数据
      const result = this.validator.validateAndSanitizeStorageData(key, value, schemaName);
      
      if (!result.isValid) {
        console.error(`数据验证失败，拒绝存储 [${key}]:`, result.errors);
        return false;
      }

      // 存储清理后的数据
      const dataToStore = result.sanitizedData !== undefined ? result.sanitizedData : value;
      localStorage.setItem(key, JSON.stringify(dataToStore));
      
      return true;
    } catch (error) {
      console.error(`安全存储失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 安全获取数据
   */
  getItem<T>(key: string, schemaName?: string): T | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      // 验证读取的数据
      const result = this.validator.validateAndSanitizeStorageData(key, parsed, schemaName);
      
      if (!result.isValid) {
        console.warn(`读取的数据验证失败 [${key}]:`, result.errors);
        // 清理无效数据
        localStorage.removeItem(key);
        return null;
      }

      return (result.sanitizedData !== undefined ? result.sanitizedData : parsed) as T;
    } catch (error) {
      console.error(`安全读取失败 [${key}]:`, error);
      // 清理损坏的数据
      localStorage.removeItem(key);
      return null;
    }
  }

  /**
   * 安全删除数据
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`删除数据失败 [${key}]:`, error);
    }
  }

  /**
   * 批量验证并清理无效数据
   */
  cleanupInvalidData(): {
    clearedCount: number;
    sanitizedCount: number;
  } {
    const result = this.validator.validateAllStorageData();
    
    // 清理无效数据
    result.invalidItems.forEach(item => {
      console.warn(`🗑️ 清理无效数据: ${item.key}`, item.errors);
      localStorage.removeItem(item.key);
    });

    console.log(`✅ 数据清理完成: 清理 ${result.invalidItems.length} 项无效数据，清理 ${result.sanitizedItems.length} 项数据`);

    return {
      clearedCount: result.invalidItems.length,
      sanitizedCount: result.sanitizedItems.length
    };
  }
}

/**
 * React Hook: 安全localStorage操作
 */
export function useSafeLocalStorage() {
  const safeStorage = new SafeLocalStorage();
  
  return {
    setItem: <T>(key: string, value: T, schemaName?: string) => 
      safeStorage.setItem(key, value, schemaName),
    getItem: <T>(key: string, schemaName?: string) => 
      safeStorage.getItem<T>(key, schemaName),
    removeItem: (key: string) => safeStorage.removeItem(key),
    cleanupInvalidData: () => safeStorage.cleanupInvalidData()
  };
}

export const dataTypeValidator = DataTypeValidator.getInstance();
export const safeLocalStorage = new SafeLocalStorage();