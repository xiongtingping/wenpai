/**
 * 🔐 密码安全策略模块
 * 实现增强的密码复杂度要求和验证机制
 * 
 * 安全要求：
 * - 最少8位长度
 * - 包含大写字母
 * - 包含小写字母
 * - 包含数字
 * - 包含特殊字符
 * - 防止常见弱密码
 */

export interface PasswordStrength {
  score: number; // 0-100分
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasDigit: boolean;
    hasSpecial: boolean;
    noCommonPatterns: boolean;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSpecial: boolean;
  forbidCommonPatterns: boolean;
  maxRepeatedChars: number;
}

// 默认密码策略配置
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
  forbidCommonPatterns: true,
  maxRepeatedChars: 2,
};

// 常见弱密码模式
const COMMON_WEAK_PATTERNS = [
  'password',
  'password123',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'admin',
  'welcome',
  '111111',
  'password1',
  'iloveyou',
  'welcome123',
  'admin123',
  '000000',
];

// 特殊字符集合
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * 验证密码是否符合安全策略
 */
export function validatePassword(password: string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;
  
  // 检查长度要求
  const hasMinLength = password.length >= policy.minLength;
  if (!hasMinLength) {
    feedback.push(`密码长度至少需要${policy.minLength}位字符`);
  } else {
    score += 20;
    if (password.length >= 12) score += 10; // 额外奖励长密码
  }

  // 检查大写字母
  const hasUppercase = /[A-Z]/.test(password);
  if (policy.requireUppercase && !hasUppercase) {
    feedback.push('密码必须包含至少一个大写字母(A-Z)');
  } else if (hasUppercase) {
    score += 15;
  }

  // 检查小写字母
  const hasLowercase = /[a-z]/.test(password);
  if (policy.requireLowercase && !hasLowercase) {
    feedback.push('密码必须包含至少一个小写字母(a-z)');
  } else if (hasLowercase) {
    score += 15;
  }

  // 检查数字
  const hasDigit = /\d/.test(password);
  if (policy.requireDigit && !hasDigit) {
    feedback.push('密码必须包含至少一个数字(0-9)');
  } else if (hasDigit) {
    score += 15;
  }

  // 检查特殊字符
  const hasSpecial = new RegExp(`[${SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password);
  if (policy.requireSpecial && !hasSpecial) {
    feedback.push(`密码必须包含至少一个特殊字符(${SPECIAL_CHARS})`);
  } else if (hasSpecial) {
    score += 15;
  }

  // 检查常见弱密码模式
  const lowerPassword = password.toLowerCase();
  const hasCommonPattern = COMMON_WEAK_PATTERNS.some(pattern => 
    lowerPassword.includes(pattern.toLowerCase())
  );
  const noCommonPatterns = !hasCommonPattern;
  if (policy.forbidCommonPatterns && hasCommonPattern) {
    feedback.push('密码不能包含常见的弱密码模式');
    score -= 20;
  } else if (noCommonPatterns) {
    score += 10;
  }

  // 检查重复字符
  const hasExcessiveRepeats = checkRepeatedChars(password, policy.maxRepeatedChars);
  if (hasExcessiveRepeats) {
    feedback.push(`密码不能包含超过${policy.maxRepeatedChars}个连续相同字符`);
    score -= 10;
  } else {
    score += 5;
  }

  // 检查字符多样性
  const diversity = calculateCharacterDiversity(password);
  score += diversity * 5;

  // 确保分数在合理范围内
  score = Math.max(0, Math.min(100, score));

  // 确定密码强度等级
  let level: PasswordStrength['level'];
  if (score >= 80) level = 'very-strong';
  else if (score >= 60) level = 'strong';
  else if (score >= 40) level = 'medium';
  else level = 'weak';

  // 密码是否符合基本要求
  const isValid = hasMinLength && 
    (!policy.requireUppercase || hasUppercase) &&
    (!policy.requireLowercase || hasLowercase) &&
    (!policy.requireDigit || hasDigit) &&
    (!policy.requireSpecial || hasSpecial) &&
    (!policy.forbidCommonPatterns || noCommonPatterns) &&
    !hasExcessiveRepeats;

  // 添加正面反馈
  if (isValid && feedback.length === 0) {
    if (level === 'very-strong') {
      feedback.push('🔒 密码强度极强，安全性优秀');
    } else if (level === 'strong') {
      feedback.push('🔐 密码强度良好，符合安全要求');
    } else if (level === 'medium') {
      feedback.push('🔓 密码强度一般，建议进一步增强');
    }
  }

  return {
    score,
    level,
    feedback,
    isValid,
    requirements: {
      minLength: hasMinLength,
      hasUppercase,
      hasLowercase,
      hasDigit,
      hasSpecial,
      noCommonPatterns,
    },
  };
}

/**
 * 检查重复字符
 */
function checkRepeatedChars(password: string, maxRepeated: number): boolean {
  for (let i = 0; i < password.length - maxRepeated; i++) {
    let count = 1;
    for (let j = i + 1; j < password.length && password[i] === password[j]; j++) {
      count++;
      if (count > maxRepeated) return true;
    }
  }
  return false;
}

/**
 * 计算字符多样性
 */
function calculateCharacterDiversity(password: string): number {
  const charSets = [
    /[a-z]/g, // 小写字母
    /[A-Z]/g, // 大写字母
    /\d/g,    // 数字
    new RegExp(`[${SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g'), // 特殊字符
  ];

  const diversity = charSets.reduce((count, regex) => {
    return count + (regex.test(password) ? 1 : 0);
  }, 0);

  return diversity;
}

/**
 * 生成密码强度可视化信息
 */
export function getPasswordStrengthDisplay(strength: PasswordStrength) {
  const colors = {
    weak: 'hsl(var(--destructive))',      // 红色
    medium: '#f97316',    // 橙色
    strong: 'hsl(var(--success))',    // 绿色
    'very-strong': 'hsl(var(--success))', // 深绿色
  };

  const labels = {
    weak: '弱',
    medium: '中等',
    strong: '强',
    'very-strong': '很强',
  };

  return {
    color: colors[strength.level],
    label: labels[strength.level],
    percentage: strength.score,
    barClass: `password-strength-${strength.level}`,
  };
}

/**
 * 密码安全建议生成器
 */
export function generatePasswordSuggestion(): string {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specials = '!@#$%^&*';

  // 确保包含各种字符类型
  let password = '';
  password += upperChars[Math.floor(Math.random() * upperChars.length)];
  password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += specials[Math.floor(Math.random() * specials.length)];

  // 添加更多随机字符到12位
  const allChars = upperChars + lowerChars + digits + specials;
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 打乱密码字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * 实时密码强度检查Hook辅助函数
 */
export function createPasswordValidator(policy?: Partial<PasswordPolicy>) {
  const finalPolicy = { ...DEFAULT_PASSWORD_POLICY, ...policy };
  
  return (password: string) => validatePassword(password, finalPolicy);
}