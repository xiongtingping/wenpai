// import i18n from '@/i18n'; // 改为动态导入避免TDZ
/**
 * 🔒 输入验证和安全过滤系统
 * 
 * 功能特性：
 * - XSS攻击防护
 * - SQL注入检测
 * - HTML标签过滤
 * - 恶意脚本检测
 * - 敏感信息过滤
 * - 内容长度限制
 * - 特殊字符处理
 * - 多层验证机制
 */

export interface ValidationRule {
  name: string;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  customValidator?: (value: string) => boolean | string;
  sanitizer?: (value: string) => string;
  allowedChars?: RegExp;
  blockedWords?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  warnings: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedThreats: string[];
}

export interface InputValidatorConfig {
  enableXSSProtection: boolean;
  enableSQLInjectionDetection: boolean;
  enableHTMLSanitization: boolean;
  enableMalwareDetection: boolean;
  strictMode: boolean;
  logSuspiciousActivity: boolean;
  maxInputLength: number;
}

const DEFAULT_CONFIG: InputValidatorConfig = {
  enableXSSProtection: true,
  enableSQLInjectionDetection: true,
  enableHTMLSanitization: true,
  enableMalwareDetection: true,
  strictMode: false,
  logSuspiciousActivity: true,
  maxInputLength: 10000,
};

// 危险的HTML标签和属性
const DANGEROUS_HTML_TAGS = [
  'script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'textarea',
  'select', 'button', 'link', 'meta', 'base', 'style', 'title', 'head', 'html'
];

const DANGEROUS_HTML_ATTRIBUTES = [
  'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur',
  'onchange', 'onsubmit', 'onerror', 'onkeyup', 'onkeydown', 'onkeypress',
  'onmousedown', 'onmouseup', 'onmousemove', 'ondblclick', 'oncontextmenu',
  'onwheel', 'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel',
  'javascript:', 'vbscript:', 'data:', 'expression('
];

// XSS攻击模式
const XSS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /on\w+\s*=/gi,
  /<\s*\w+[^>]*on\w+[^>]*>/gi,
  /expression\s*\(/gi,
  /<\s*\/?\s*\w+[^>]*>/g,
  /<!--[\s\S]*?-->/g
];

// SQL注入模式
const SQL_INJECTION_PATTERNS = [
  /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
  /'[\s]*(\bOR\b|\bAND\b)[\s]*'?[\d]/gi,
  /'[\s]*(\bOR\b|\bAND\b)[\s]*[\w]/gi,
  /'\s*;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER)/gi,
  /(--|\#|\/\*|\*\/)/g,
  /\b(exec|execute|sp_executesql|xp_cmdshell)\b/gi,
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi
];

// 恶意文件扩展名
const MALICIOUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
  'msi', 'dll', 'sys', 'hta', 'scf', 'lnk', 'inf', 'reg'
];

// 敏感信息模式
const SENSITIVE_INFO_PATTERNS = [
  // 信用卡号
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  // 身份证号
  /\b\d{15}|\d{18}\b/g,
  // 手机号
  /\b1[3-9]\d{9}\b/g,
  // 邮箱
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // IP地址
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  // API密钥模式
  /[a-zA-Z0-9]{32,}/g
];

export class InputValidator {
  private config: InputValidatorConfig;
  private suspiciousActivityLog: Array<{
    timestamp: number;
    input: string;
    threats: string[];
    riskLevel: string;
  }> = [];

  constructor(config?: Partial<InputValidatorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 主要验证方法
   */
  public validate(input: string, rules?: ValidationRule[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      sanitizedValue: input,
      errors: [],
      warnings: [],
      riskLevel: 'low',
      detectedThreats: []
    };

    try {
      // 基础验证
      this.validateBasicRules(input, rules, result);

      // 安全检查
      if (this.config.enableXSSProtection) {
        this.detectXSS(input, result);
      }

      if (this.config.enableSQLInjectionDetection) {
        this.detectSQLInjection(input, result);
      }

      if (this.config.enableMalwareDetection) {
        this.detectMaliciousContent(input, result);
      }

      // HTML清理
      if (this.config.enableHTMLSanitization) {
        result.sanitizedValue = this.sanitizeHTML(result.sanitizedValue);
      }

      // 敏感信息检测
      this.detectSensitiveInfo(input, result);

      // 最终风险评估
      this.assessRiskLevel(result);

      // 记录可疑活动
      if (this.config.logSuspiciousActivity && result.detectedThreats.length > 0) {
        this.logSuspiciousActivity(input, result);
      }

      // 严格模式检查
      if (this.config.strictMode && result.riskLevel === 'high') {
        result.isValid = false;
        result.errors.push('输入内容风险等级过高，已被拒绝');
      }

    } catch (error) {
      console.error('inputvalidating过程middle出错:', error);
      result.isValid = false;
      result.errors.push('u64cdu4f5cu5931u8d25');
      result.riskLevel = 'critical';
    }

    return result;
  }

  /**
   * 基础规则验证
   */
  private validateBasicRules(input: string, rules: ValidationRule[] = [], result: ValidationResult): void {
    // 长度检查
    if (input.length > this.config.maxInputLength) {
      result.isValid = false;
      result.errors.push(`输入长度超过限制 (${this.config.maxInputLength})`);
    }

    // 应用自定义规则
    for (const rule of rules) {
      // 必填检查
      if (rule.required && !input.trim()) {
        result.isValid = false;
        result.errors.push(`${rule.name} 不能为空`);
        continue;
      }

      // 长度检查
      if (rule.minLength && input.length < rule.minLength) {
        result.isValid = false;
        result.errors.push(`${rule.name} 长度不能少于 ${rule.minLength} 个字符`);
      }

      if (rule.maxLength && input.length > rule.maxLength) {
        result.isValid = false;
        result.errors.push(`${rule.name} 长度不能超过 ${rule.maxLength} 个字符`);
      }

      // 模式匹配
      if (rule.pattern && !rule.pattern.test(input)) {
        result.isValid = false;
        result.errors.push(`${rule.name} 格式不正确`);
      }

      // 允许字符检查
      if (rule.allowedChars && !rule.allowedChars.test(input)) {
        result.isValid = false;
        result.errors.push(`${rule.name} 包含不允许的字符`);
      }

      // 禁用词汇检查
      if (rule.blockedWords) {
        const foundBlockedWords = rule.blockedWords.filter(word =>
          input.toLowerCase().includes(word.toLowerCase())
        );
        if (foundBlockedWords.length > 0) {
          result.isValid = false;
          result.errors.push(`${rule.name} 包含禁用词汇: ${foundBlockedWords.join(', ')}`);
        }
      }

      // 自定义验证器
      if (rule.customValidator) {
        const customResult = rule.customValidator(input);
        if (customResult !== true) {
          result.isValid = false;
          result.errors.push(typeof customResult === 'string' ? customResult : `${rule.name} 验证失败`);
        }
      }

      // 应用清理器
      if (rule.sanitizer) {
        result.sanitizedValue = rule.sanitizer(result.sanitizedValue);
      }
    }
  }

  /**
   * XSS攻击检测
   */
  private detectXSS(input: string, result: ValidationResult): void {
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(input)) {
        result.detectedThreats.push('XSS攻击');
        result.warnings.push('检测到可能的XSS攻击代码');
        break;
      }
    }

    // 检测危险标签和属性
    const lowerInput = input.toLowerCase();
    
    for (const tag of DANGEROUS_HTML_TAGS) {
      if (lowerInput.includes(`<${tag}`) || lowerInput.includes(`</${tag}`)) {
        result.detectedThreats.push(`危险HTML标签: ${tag}`);
        result.warnings.push(`包含危险的HTML标签: ${tag}`);
      }
    }

    for (const attr of DANGEROUS_HTML_ATTRIBUTES) {
      if (lowerInput.includes(attr)) {
        result.detectedThreats.push(`危险HTML属性: ${attr}`);
        result.warnings.push(`包含危险的HTML属性: ${attr}`);
      }
    }
  }

  /**
   * SQL注入检测
   */
  private detectSQLInjection(input: string, result: ValidationResult): void {
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        result.detectedThreats.push('SQL注入');
        result.warnings.push('检测到可能的SQL注入攻击');
        break;
      }
    }
  }

  /**
   * 恶意内容检测
   */
  private detectMaliciousContent(input: string, result: ValidationResult): void {
    const lowerInput = input.toLowerCase();

    // 检测恶意文件扩展名
    for (const ext of MALICIOUS_EXTENSIONS) {
      if (lowerInput.includes(`.${ext}`)) {
        result.detectedThreats.push(`恶意文件扩展名: .${ext}`);
        result.warnings.push(`包含可执行文件扩展名: .${ext}`);
      }
    }

    // 检测恶意URL模式
    const maliciousUrlPatterns = [
      /https?:\/\/[^\s]+\.(exe|bat|com|scr|pif)/gi,
      /ftp:\/\/[^\s]+/gi,
      /file:\/\/[^\s]+/gi
    ];

    for (const pattern of maliciousUrlPatterns) {
      if (pattern.test(input)) {
        result.detectedThreats.push('恶意URL');
        result.warnings.push('包含可疑的URL地址');
        break;
      }
    }
  }

  /**
   * 敏感信息检测
   */
  private detectSensitiveInfo(input: string, result: ValidationResult): void {
    for (const pattern of SENSITIVE_INFO_PATTERNS) {
      if (pattern.test(input)) {
        result.warnings.push('u64cdu4f5cu5931u8d25');
        break;
      }
    }
  }

  /**
   * HTML清理
   */
  private sanitizeHTML(input: string): string {
    let sanitized = input;

    // 移除脚本标签
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // 移除危险属性
    for (const attr of DANGEROUS_HTML_ATTRIBUTES) {
      const attrRegex = new RegExp(`\\b${attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*["\'][^"\']*["\']`, 'gi');
      sanitized = sanitized.replace(attrRegex, '');
    }

    // 转义特殊字符
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/&/g, '&amp;');

    return sanitized;
  }

  /**
   * 风险等级评估
   */
  private assessRiskLevel(result: ValidationResult): void {
    const threatCount = result.detectedThreats.length;
    const errorCount = result.errors.length;

    if (threatCount === 0 && errorCount === 0) {
      result.riskLevel = 'low';
    } else if (threatCount <= 2 && errorCount <= 1) {
      result.riskLevel = 'medium';
    } else if (threatCount <= 5 || errorCount <= 3) {
      result.riskLevel = 'high';
    } else {
      result.riskLevel = 'critical';
    }

    // 特殊威胁提升风险等级
    const highRiskThreats = ['XSS攻击', 'SQL注入', '恶意URL'];
    const hasHighRiskThreat = result.detectedThreats.some(threat =>
      highRiskThreats.some(highRisk => threat.includes(highRisk))
    );

    if (hasHighRiskThreat) {
      result.riskLevel = result.riskLevel === 'low' ? 'medium' :
                        result.riskLevel === 'medium' ? 'high' : 'critical';
    }
  }

  /**
   * 记录可疑活动
   */
  private logSuspiciousActivity(input: string, result: ValidationResult): void {
    this.suspiciousActivityLog.push({
      timestamp: Date.now(),
      input: input.length > 100 ? input.substring(0, 100) + '...' : input,
      threats: result.detectedThreats,
      riskLevel: result.riskLevel
    });

    // 保持日志大小
    if (this.suspiciousActivityLog.length > 100) {
      this.suspiciousActivityLog = this.suspiciousActivityLog.slice(-50);
    }

    console.warn('🔒 detecting到可疑input:', {
      threats: result.detectedThreats,
      riskLevel: result.riskLevel,
      inputPreview: input.substring(0, 50) + (input.length > 50 ? '...' : '')
    });
  }

  /**
   * 获取可疑活动日志
   */
  public getSuspiciousActivityLog(): typeof this.suspiciousActivityLog {
    return [...this.suspiciousActivityLog];
  }

  /**
   * 清除日志
   */
  public clearLog(): void {
    this.suspiciousActivityLog = [];
  }

  /**
   * 获取安全统计
   */
  public getSecurityStats(): {
    totalInputsValidated: number;
    suspiciousInputsDetected: number;
    mostCommonThreats: Array<{ threat: string; count: number }>;
  } {
    const threatCounts = new Map<string, number>();
    
    this.suspiciousActivityLog.forEach(log => {
      log.threats.forEach(threat => {
        threatCounts.set(threat, (threatCounts.get(threat) || 0) + 1);
      });
    });

    const mostCommonThreats = Array.from(threatCounts.entries())
      .map(([threat, count]) => ({ threat, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalInputsValidated: this.suspiciousActivityLog.length,
      suspiciousInputsDetected: this.suspiciousActivityLog.filter(log => log.threats.length > 0).length,
      mostCommonThreats
    };
  }
}

// 全局验证器实例
let globalValidator: InputValidator | null = null;

/**
 * 获取全局输入验证器
 */
export function getInputValidator(): InputValidator {
  if (!globalValidator) {
    globalValidator = new InputValidator();
  }
  return globalValidator;
}

/**
 * 常用验证规则定义
 */
export const ValidationRules = {
  // 用户名规则
  username: {
    name: '用户名',
    pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/,
    minLength: 2,
    maxLength: 20,
    required: true,
    blockedWords: ['admin', 'root', 'system', '管理员']
  } as ValidationRule,

  // 邮箱规则
  email: {
    name: 'u64cdu4f5cu5931u8d25',
    pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/,
    maxLength: 100,
    required: true,
    sanitizer: (value: string) => value.trim().toLowerCase()
  } as ValidationRule,

  // 密码规则
  password: {
    name: '密码',
    minLength: 8,
    maxLength: 128,
    required: true,
    customValidator: (value: string) => {
      if (!/[a-z]/.test(value)) return '密码必须包含小写字母';
      if (!/[A-Z]/.test(value)) return '密码必须包含大写字母';
      if (!/\d/.test(value)) return '密码必须包含数字';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return '密码必须包含特殊字符';
      return true;
    }
  } as ValidationRule,

  // 手机号规则
  phone: {
    name: 'u64cdu4f5cu5931u8d25',
    pattern: /^1[3-9]\d{9}$/,
    required: true,
    sanitizer: (value: string) => value.replace(/\D/g, '')
  } as ValidationRule,

  // 文本内容规则
  textContent: {
    name: '文本内容',
    maxLength: 5000,
    blockedWords: ['spam', '广告', '色情', '赌博'],
    sanitizer: (value: string) => value.trim()
  } as ValidationRule,

  // URL规则
  url: {
    name: 'URL',
    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    maxLength: 2000,
    customValidator: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return 'URL格式不正确';
      }
    }
  } as ValidationRule
};

/**
 * 输入验证便捷函数
 */
export const InputValidation = {
  validate: (input: string, rules?: ValidationRule[]) => getInputValidator().validate(input, rules),
  sanitizeHTML: (input: string) => getInputValidator()['sanitizeHTML'](input),
  getStats: () => getInputValidator().getSecurityStats(),
  clearLog: () => getInputValidator().clearLog()
};