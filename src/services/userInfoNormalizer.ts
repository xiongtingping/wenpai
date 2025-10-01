/**
 * 🔧 用户信息标准化服务
 * 🎯 目标：统一处理不同登录方式的用户信息，避免数据不一致
 * 📌 核心功能：
 * 1. 统一字段映射规则
 * 2. 数据验证和清洗
 * 3. 多源数据合并
 * 4. 一致性检查和修复
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { logger } from '@/utils/logger';

/**
 * 标准化的用户信息接口
 */
export interface StandardUserInfo {
  /** 用户唯一标识 */
  id: string;
  /** 用户名 */
  username: string | null;
  /** 昵称 */
  nickname: string | null;
  /** 邮箱 */
  email: string | null;
  /** 手机号 */
  phone: string | null;
  /** 头像URL */
  avatar: string | null;
  /** 登录方式 */
  loginMethod: 'authing' | 'password' | 'oauth' | 'phone' | 'email';
  /** 登录时间 */
  loginTime: string;
  /** 最后更新时间 */
  lastUpdated: string;
  /** 数据来源 */
  dataSource: string;
  /** 原始数据（用于调试） */
  rawData?: any;
}

/**
 * 原始用户数据类型（支持各种登录方式）
 */
export interface RawUserData {
  // 通用字段
  id?: string;
  userId?: string;
  sub?: string;
  
  // 用户名相关
  username?: string;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  
  // 昵称相关
  nickname?: string;
  display_name?: string;
  
  // 邮箱相关
  email?: string;
  emailAddress?: string;
  email_verified?: boolean;
  
  // 手机号相关
  phone?: string;
  phoneNumber?: string;
  phone_number?: string;
  phone_verified?: boolean;
  
  // 头像相关
  avatar?: string;
  photo?: string;
  picture?: string;
  profile_picture?: string;
  
  // 其他字段
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  roles?: string[];
  permissions?: string[];
  
  [key: string]: any;
}

/**
 * 字段映射配置
 */
interface FieldMappingConfig {
  /** ID字段候选列表（按优先级排序） */
  idFields: string[];
  /** 用户名字段候选列表 */
  usernameFields: string[];
  /** 昵称字段候选列表 */
  nicknameFields: string[];
  /** 邮箱字段候选列表 */
  emailFields: string[];
  /** 手机号字段候选列表 */
  phoneFields: string[];
  /** 头像字段候选列表 */
  avatarFields: string[];
}

/**
 * 默认字段映射配置
 */
const DEFAULT_FIELD_MAPPING: FieldMappingConfig = {
  idFields: ['id', 'userId', 'sub', 'user_id'],
  usernameFields: ['username', 'preferred_username', 'name', 'given_name'],
  nicknameFields: ['nickname', 'display_name', 'name', 'username'],
  emailFields: ['email', 'emailAddress', 'email_address'],
  phoneFields: ['phone', 'phoneNumber', 'phone_number'],
  avatarFields: ['avatar', 'photo', 'picture', 'profile_picture']
};

/**
 * 用户信息标准化服务类
 */
export class UserInfoNormalizer {
  private fieldMapping: FieldMappingConfig;

  constructor(customMapping?: Partial<FieldMappingConfig>) {
    this.fieldMapping = { ...DEFAULT_FIELD_MAPPING, ...customMapping };
  }

  /**
   * 标准化用户信息
   * @param rawData 原始用户数据
   * @param loginMethod 登录方式
   * @param dataSource 数据来源
   * @returns 标准化的用户信息
   */
  normalize(
    rawData: RawUserData, 
    loginMethod: StandardUserInfo['loginMethod'] = 'authing',
    dataSource: string = 'unknown'
  ): StandardUserInfo {
    logger.debug('🔄 开始标准化用户信息:', { rawData, loginMethod, dataSource });

    // 提取和验证ID
    const id = this.extractId(rawData);
    if (!id) {
      throw new Error('用户ID不能为空');
    }

    // 提取各字段
    const username = this.extractField(rawData, this.fieldMapping.usernameFields);
    const nickname = this.extractField(rawData, this.fieldMapping.nicknameFields);
    const email = this.extractField(rawData, this.fieldMapping.emailFields);
    const phone = this.extractField(rawData, this.fieldMapping.phoneFields);
    const avatar = this.extractField(rawData, this.fieldMapping.avatarFields);

    // 构建标准化用户信息
    const standardUserInfo: StandardUserInfo = {
      id,
      username,
      nickname,
      email,
      phone,
      avatar,
      loginMethod,
      loginTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      dataSource,
      rawData: import.meta.env.DEV ? rawData : undefined // 开发环境保留原始数据
    };

    // 数据验证和清洗
    this.validateAndClean(standardUserInfo);

    logger.debug('✅ 用户信息标准化完成:', standardUserInfo);
    return standardUserInfo;
  }

  /**
   * 提取ID字段
   */
  private extractId(rawData: RawUserData): string {
    for (const field of this.fieldMapping.idFields) {
      const value = rawData[field];
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    
    // 如果没有找到有效ID，生成临时ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.warn('⚠️ 未找到有效用户ID，生成临时ID:', tempId);
    return tempId;
  }

  /**
   * 提取指定字段的值
   */
  private extractField(rawData: RawUserData, fieldCandidates: string[]): string | null {
    for (const field of fieldCandidates) {
      const value = rawData[field];
      if (value && typeof value === 'string' && value.trim() && 
          value !== 'undefined' && value !== 'null') {
        return value.trim();
      }
    }
    return null;
  }

  /**
   * 数据验证和清洗
   */
  private validateAndClean(userInfo: StandardUserInfo): void {
    // 邮箱格式验证
    if (userInfo.email && !this.isValidEmail(userInfo.email)) {
      logger.warn('⚠️ 邮箱格式无效，清除邮箱字段:', userInfo.email);
      userInfo.email = null;
    }

    // 手机号格式验证
    if (userInfo.phone && !this.isValidPhone(userInfo.phone)) {
      logger.warn('⚠️ 手机号格式无效，清除手机号字段:', userInfo.phone);
      userInfo.phone = null;
    }

    // 头像URL验证
    if (userInfo.avatar && !this.isValidUrl(userInfo.avatar)) {
      logger.warn('⚠️ 头像URL无效，清除头像字段:', userInfo.avatar);
      userInfo.avatar = null;
    }

    // 确保至少有一个显示名称
    if (!userInfo.nickname && !userInfo.username) {
      if (userInfo.email) {
        userInfo.nickname = userInfo.email.split('@')[0];
        logger.debug('🔧 从邮箱生成昵称:', userInfo.nickname);
      } else {
        userInfo.nickname = `用户${userInfo.id.slice(-6)}`;
        logger.debug('🔧 生成默认昵称:', userInfo.nickname);
      }
    }
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
    // 更新：支持所有有效的中国手机号段（13x, 14x, 15x, 16x, 17x, 18x, 19x）
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    // 🔧 修复Unicode引号和特殊字符问题：清理所有非数字字符和Unicode引号
    let cleanPhone = phone;
    
    // 移除所有类型的引号字符（包括Unicode引号）
    cleanPhone = cleanPhone.replace(/["""'']/g, '');
    
    // 清除所有非数字字符
    cleanPhone = cleanPhone.replace(/\D/g, '');
    
    const isValid = phoneRegex.test(cleanPhone);
    
    // 如果原始phone包含引号但数字有效，记录警告
    if (!isValid && /["""'']/.test(phone)) {
      console.warn(`📱 phone号containsabnormal字符，already尝试cleaning: "${phone}" -> "${cleanPhone}"`);
    }
    
    return isValid;
  }

  /**
   * 验证URL格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 合并多个用户信息源
   * @param sources 多个用户信息源
   * @returns 合并后的用户信息
   */
  merge(...sources: StandardUserInfo[]): StandardUserInfo {
    if (sources.length === 0) {
      throw new Error('u64cdu4f5cu5931u8d25');
    }

    if (sources.length === 1) {
      return sources[0];
    }

    logger.debug('🔄 开始合并用户信息:', sources.length);

    // 以第一个为基础
    const merged = { ...sources[0] };

    // 合并其他源的非空字段
    for (let i = 1; i < sources.length; i++) {
      const source = sources[i];
      
      // 只合并非空字段
      if (source.username && !merged.username) merged.username = source.username;
      if (source.nickname && !merged.nickname) merged.nickname = source.nickname;
      if (source.email && !merged.email) merged.email = source.email;
      if (source.phone && !merged.phone) merged.phone = source.phone;
      if (source.avatar && !merged.avatar) merged.avatar = source.avatar;
      
      // 更新时间使用最新的
      if (source.lastUpdated > merged.lastUpdated) {
        merged.lastUpdated = source.lastUpdated;
      }
    }

    merged.dataSource = sources.map(s => s.dataSource).join('+');
    logger.debug('✅ 用户信息合并完成:', merged);

    return merged;
  }
}

// 导出默认实例
export const userInfoNormalizer = new UserInfoNormalizer();

// 导出便捷函数
export function normalizeUserInfo(
  rawData: RawUserData, 
  loginMethod?: StandardUserInfo['loginMethod'],
  dataSource?: string
): StandardUserInfo {
  return userInfoNormalizer.normalize(rawData, loginMethod, dataSource);
}

export function mergeUserInfo(...sources: StandardUserInfo[]): StandardUserInfo {
  return userInfoNormalizer.merge(...sources);
}
