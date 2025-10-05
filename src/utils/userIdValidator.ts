/**
 * 用户ID验证工具
 * 
 * 提供统一的用户ID验证逻辑，确保所有地方使用相同的验证标准
 */

/**
 * 用户ID验证结果
 */
export interface UserIdValidationResult {
  valid: boolean;
  error?: string;
  userId?: string;
}

/**
 * 用户ID验证器
 */
export class UserIdValidator {
  /**
   * 最小ID长度
   */
  private static readonly MIN_LENGTH = 10;

  /**
   * 最大ID长度
   */
  private static readonly MAX_LENGTH = 100;

  /**
   * 验证用户ID是否有效
   */
  static isValid(userId: any): boolean {
    return (
      userId !== null &&
      userId !== undefined &&
      userId !== 'undefined' &&
      userId !== 'null' &&
      typeof userId === 'string' &&
      userId.trim().length >= this.MIN_LENGTH &&
      userId.trim().length <= this.MAX_LENGTH
    );
  }

  /**
   * 验证用户ID，返回详细结果
   */
  static validateDetailed(userId: any): UserIdValidationResult {
    if (userId === null || userId === undefined) {
      return { valid: false, error: '用户ID不能为空' };
    }

    if (userId === 'undefined' || userId === 'null') {
      return { valid: false, error: '用户ID不能为字符串"undefined"或"null"' };
    }

    if (typeof userId !== 'string') {
      return { valid: false, error: `用户ID必须是字符串类型，当前类型：${typeof userId}` };
    }

    const trimmedId = userId.trim();

    if (trimmedId.length < this.MIN_LENGTH) {
      return { valid: false, error: `用户ID长度不能少于${this.MIN_LENGTH}个字符，当前长度：${trimmedId.length}` };
    }

    if (trimmedId.length > this.MAX_LENGTH) {
      return { valid: false, error: `用户ID长度不能超过${this.MAX_LENGTH}个字符，当前长度：${trimmedId.length}` };
    }

    return { valid: true, userId: trimmedId };
  }

  /**
   * 验证用户ID，无效则抛出错误
   */
  static validate(userId: any, context: string = '操作'): string {
    const result = this.validateDetailed(userId);
    
    if (!result.valid) {
      throw new Error(`${context}失败：${result.error}`);
    }

    return result.userId!;
  }

  /**
   * 安全地获取用户ID（不抛出错误）
   */
  static getSafe(userId: any, defaultValue: string | null = null): string | null {
    const result = this.validateDetailed(userId);
    return result.valid ? result.userId! : defaultValue;
  }

  /**
   * 格式化用户ID用于日志（隐藏部分内容）
   */
  static formatForLog(userId: any, visibleChars: number = 8): string {
    if (!this.isValid(userId)) {
      return '[INVALID_USER_ID]';
    }

    const id = userId as string;
    if (id.length <= visibleChars) {
      return id;
    }

    return `${id.substring(0, visibleChars)}***`;
  }

  /**
   * 检查两个用户ID是否相同
   */
  static isSame(userId1: any, userId2: any): boolean {
    if (!this.isValid(userId1) || !this.isValid(userId2)) {
      return false;
    }

    return (userId1 as string).trim() === (userId2 as string).trim();
  }
}

/**
 * 快捷验证函数（向后兼容）
 */
export const validateUserId = (userId: any, context?: string): string => {
  return UserIdValidator.validate(userId, context);
};

/**
 * 快捷检查函数（向后兼容）
 */
export const isValidUserId = (userId: any): boolean => {
  return UserIdValidator.isValid(userId);
};
