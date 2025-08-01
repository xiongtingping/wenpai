/**
 * 🛡️ undefined 拼接预防体系
 * 
 * 建立完整的预防机制，防止 undefined 拼接问题在整个应用中发生
 * 
 * 🔒 LOCKED: 2025-01-28 核心预防逻辑已锁定
 * 📌 请勿修改此预防体系，如需扩展请创建新模块
 */

// ==================== 类型定义 ====================

interface SafeStringOptions {
  fallback?: string;
  allowEmpty?: boolean;
  maxLength?: number;
}

interface ValidationRule {
  field: string;
  required: boolean;
  fallback: string;
  validator?: (value: any) => boolean;
}

// ==================== 核心预防函数 ====================

/**
 * 安全字符串转换 - 防止 undefined 拼接的核心函数
 */
export function safeString(
  value: any, 
  options: SafeStringOptions = {}
): string {
  const { fallback = '', allowEmpty = true, maxLength } = options;
  
  // 处理 null、undefined、'undefined'、'null' 等危险值
  if (
    value === null || 
    value === undefined || 
    value === 'undefined' || 
    value === 'null' ||
    value === 'NaN' ||
    (typeof value === 'number' && isNaN(value))
  ) {
    return fallback;
  }
  
  // 转换为字符串
  let result = String(value).trim();
  
  // 处理空字符串
  if (!allowEmpty && result === '') {
    result = fallback;
  }
  
  // 长度限制
  if (maxLength && result.length > maxLength) {
    result = result.substring(0, maxLength) + '...';
  }
  
  return result;
}

/**
 * 安全用户显示名称生成
 */
export function getUserDisplayName(user: any): string {
  if (!user || typeof user !== 'object') {
    return '用户';
  }

  // 🚨 FIXED: 强制修复 undefinedundefined 问题
  const nickname = safeString(user.nickname);
  const username = safeString(user.username);
  const email = safeString(user.email);

  // 额外检查：确保没有 undefined 字符串
  if (nickname && nickname !== 'undefined') return nickname;
  if (username && username !== 'undefined') return username;
  if (email && email !== 'undefined' && email.includes('@')) {
    return email.split('@')[0];
  }

  return '用户';
}

/**
 * 对象安全化处理
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  rules: ValidationRule[]
): T {
  if (!obj || typeof obj !== 'object') {
    return {} as T;
  }
  
  const result = { ...obj };
  
  rules.forEach(rule => {
    const value = result[rule.field];
    
    // 检查是否为危险值
    const isDangerous = 
      value === null ||
      value === undefined ||
      value === 'undefined' ||
      value === 'null' ||
      (rule.validator && !rule.validator(value));
    
    if (isDangerous) {
      if (rule.required) {
        result[rule.field] = rule.fallback;
      } else {
        delete result[rule.field];
      }
    } else {
      // 确保字符串字段安全
      if (typeof value === 'string') {
        result[rule.field] = safeString(value);
      }
    }
  });
  
  return result;
}

// ==================== 模板字符串安全包装 ====================

/**
 * 安全模板字符串标签函数
 * 使用方式：safe`Hello ${username}!`
 */
export function safe(strings: TemplateStringsArray, ...values: any[]): string {
  let result = '';
  
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    
    if (i < values.length) {
      result += safeString(values[i]);
    }
  }
  
  return result;
}

/**
 * 安全字符串拼接函数
 */
export function safeConcat(...values: any[]): string {
  return values
    .map(value => safeString(value))
    .filter(str => str.length > 0)
    .join('');
}

// ==================== React 组件安全包装 ====================

/**
 * 安全文本显示组件包装器
 */
export function SafeText({ 
  children, 
  fallback = '', 
  className = '' 
}: { 
  children: any; 
  fallback?: string; 
  className?: string; 
}) {
  const safeContent = safeString(children, { fallback });
  
  return React.createElement('span', { 
    className,
    'data-safe-text': 'true'
  }, safeContent);
}

// ==================== 第三方组件安全封装标准 ====================

/**
 * 第三方组件安全配置生成器
 */
export function createSafeThirdPartyConfig<T extends Record<string, any>>(
  originalConfig: T,
  safetyRules: {
    stringFields?: string[];
    objectFields?: string[];
    customSanitizers?: Record<string, (value: any) => any>;
  } = {}
): T {
  const { stringFields = [], objectFields = [], customSanitizers = {} } = safetyRules;
  
  const safeConfig = { ...originalConfig };
  
  // 处理字符串字段
  stringFields.forEach(field => {
    if (field in safeConfig) {
      safeConfig[field] = safeString(safeConfig[field]);
    }
  });
  
  // 处理对象字段
  objectFields.forEach(field => {
    if (field in safeConfig && typeof safeConfig[field] === 'object') {
      safeConfig[field] = sanitizeObject(safeConfig[field], []);
    }
  });
  
  // 应用自定义清理器
  Object.entries(customSanitizers).forEach(([field, sanitizer]) => {
    if (field in safeConfig) {
      safeConfig[field] = sanitizer(safeConfig[field]);
    }
  });
  
  return safeConfig;
}

// ==================== 运行时检测器 ====================

/**
 * 全局 undefined 拼接检测器
 */
export class UndefinedConcatDetector {
  private observer: MutationObserver | null = null;
  private isActive = false;
  
  start() {
    if (this.isActive) return;
    
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.scanElement(node as Element);
            }
          });
        }
      });
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    this.isActive = true;
    console.log('🛡️ undefined 拼接检测器已启动');
  }
  
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isActive = false;
    console.log('🛡️ undefined 拼接检测器已停止');
  }
  
  private scanElement(element: Element) {
    // 检测文本内容
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.includes('undefinedundefined')) {
        console.warn('🚨 检测到 undefined 拼接:', {
          element: node.parentElement,
          content: node.textContent
        });
        
        // 自动修复
        node.textContent = node.textContent.replace(/undefinedundefined/g, '用户');
      }
    }
  }
}

// ==================== 导出全局实例 ====================

export const globalUndefinedDetector = new UndefinedConcatDetector();

// 🔒 LOCKED: 预防体系核心逻辑已锁定，请勿修改
