/**
 * 🛡️ 安全字符串处理工具函数
 * 
 * 🎯 目标：防止undefined拼接问题的增强版工具集
 * 📋 涵盖范围：模板字符串、URL构建、API参数、JSX属性等
 */

export interface SafeUser {
  id?: string;
  nickname?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  [key: string]: any;
}

/**
 * 安全的模板字符串构建器
 * 防止模板字符串中的undefined拼接
 */
export function safeTemplate(template: string, values: Record<string, any>, fallback = 'unknown'): string {
  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    return String(value);
  });
}

/**
 * 安全的URL构建器
 * 防止URL中出现undefined段
 */
export function safeUrl(baseUrl: string, ...segments: (string | undefined)[]): string {
  const safeSegments = segments
    .filter(segment => segment !== undefined && segment !== null && segment !== '')
    .map(segment => String(segment));
  
  return [baseUrl.replace(/\/$/, ''), ...safeSegments].join('/');
}

/**
 * 安全的API参数构建器
 */
export function safeApiParams(params: Record<string, any>): Record<string, string> {
  const safeParams: Record<string, string> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      safeParams[key] = String(value);
    }
  });
  
  return safeParams;
}

/**
 * 安全的用户属性获取器
 * 支持深层属性访问和多个fallback
 */
export function safeUserProperty(
  user: SafeUser | null | undefined, 
  path: string, 
  fallback = ''
): string {
  if (!user) return fallback;
  
  const keys = path.split('.');
  let current: any = user;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return fallback;
    }
    current = current[key];
  }
  
  if (current === undefined || current === null || current === '') {
    return fallback;
  }
  
  return String(current);
}

/**
 * 安全的用户显示名称（增强版）
 * 支持多种fallback策略
 */
export function safeUserDisplayName(
  user: SafeUser | null | undefined,
  options: {
    fallback?: string;
    preferNickname?: boolean;
    includeId?: boolean;
    maxLength?: number;
  } = {}
): string {
  const {
    fallback = '匿名用户',
    preferNickname = true,
    includeId = false,
    maxLength
  } = options;
  
  if (!user) return fallback;
  
  let displayName = '';
  
  if (preferNickname) {
    displayName = user.nickname || user.username || user.email || '';
  } else {
    displayName = user.username || user.nickname || user.email || '';
  }
  
  if (!displayName) {
    displayName = fallback;
  }
  
  // 包含ID
  if (includeId && user.id && user.id !== 'undefined') {
    displayName += ` (${user.id})`;
  }
  
  // 长度限制
  if (maxLength && displayName.length > maxLength) {
    displayName = displayName.substring(0, maxLength - 3) + '...';
  }
  
  return displayName;
}

/**
 * 安全的JSX属性值生成器
 */
export function safeJsxProp(value: any, fallback = ''): string {
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value);
}

/**
 * 安全的alt文本生成器
 */
export function safeAltText(
  user: SafeUser | null | undefined,
  context: string,
  fallback = '用户头像'
): string {
  if (!user) return fallback;
  
  const userName = safeUserDisplayName(user, { fallback: '用户' });
  return `${userName}的${context}`;
}

/**
 * 批量安全处理对象属性
 */
export function safeObjectProps<T extends Record<string, any>>(
  obj: T | null | undefined,
  fallbacks: Partial<Record<keyof T, any>> = {}
): Record<keyof T, string> {
  const result = {} as Record<keyof T, string>;
  
  if (!obj) {
    Object.keys(fallbacks).forEach(key => {
      result[key] = String(fallbacks[key] || '');
    });
    return result;
  }
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const fallback = fallbacks[key];
    
    if (value === undefined || value === null || value === '') {
      result[key] = String(fallback || '');
    } else {
      result[key] = String(value);
    }
  });
  
  return result;
}

/**
 * 运行时undefined检测器
 * 在开发环境中检测可能的undefined拼接
 */
export function detectUndefinedConcat(value: any, context = ''): string {
  const stringValue = String(value);
  
  if (import.meta.env.DEV && stringValue.includes('undefined')) {
    console.warn(`🚨 检测到undefined拼接: "${stringValue}" in ${context}`);
    console.trace('调用栈:');
  }
  
  return stringValue;
}

/**
 * 安全的数组join操作
 */
export function safeArrayJoin(
  arr: (string | undefined | null)[],
  separator = ', ',
  fallback = ''
): string {
  if (!Array.isArray(arr) || arr.length === 0) {
    return fallback;
  }
  
  const safeItems = arr
    .filter(item => item !== undefined && item !== null && item !== '')
    .map(item => String(item));
  
  return safeItems.length > 0 ? safeItems.join(separator) : fallback;
}

// 导出类型
export type SafeStringOptions = {
  fallback?: string;
  maxLength?: number;
  trim?: boolean;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
};

/**
 * 通用安全字符串处理器
 */
export function safeString(
  value: any,
  options: SafeStringOptions = {}
): string {
  const {
    fallback = '',
    maxLength,
    trim = false,
    toLowerCase = false,
    toUpperCase = false
  } = options;
  
  if (value === undefined || value === null) {
    return fallback;
  }
  
  let result = String(value);
  
  if (trim) {
    result = result.trim();
  }
  
  if (toLowerCase) {
    result = result.toLowerCase();
  }
  
  if (toUpperCase) {
    result = result.toUpperCase();
  }
  
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength - 3) + '...';
  }
  
  return result;
}
