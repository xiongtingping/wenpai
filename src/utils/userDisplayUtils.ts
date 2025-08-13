/**
 * ✅ FIXED: 用户信息显示工具函数
 * 🎯 用途：统一处理用户信息显示，防止 "undefinedundefined" 字符串拼接问题
 * 📌 已封装：此工具集已验证可用，请勿修改
 * 🔓 UNLOCKED: AI 禁止对此文件做任何修改
 *
 * 🔍 问题根因：
 * 1. JavaScript隐式类型转换：undefined || undefined = undefined，在字符串上下文中变成 "undefined"
 * 2. 逻辑或运算符陷阱：user?.nickname || user?.username 当两个都是undefined时返回undefined
 * 3. 模板字符串隐式转换：`${undefined}` 变成 "undefined"
 * 4. 缺乏统一的数据处理层和防御性编程
 *
 * 🛡️ 解决策略：
 * 1. 分层防护：数据源头控制 → 工具函数封装 → 组件层防护
 * 2. 类型安全强化：严格类型定义 + 编译时检查
 * 3. 运行时保护：错误边界 + 全局异常处理
 */

/**
 * 用户对象类型定义
 */
export interface UserInfo {
  id?: string;
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  photo?: string; // 兼容 Authing 的 photo 字段
  [key: string]: any;
}

/**
 * 获取用户显示名称
 * 优先级：nickname > username > email > 默认值
 *
 * @param user 用户对象
 * @param fallback 默认值，默认为 '访客'
 * @returns 安全的用户显示名称
 */
export function getUserDisplayName(user?: UserInfo | null, fallback: string = '访客'): string {
  if (!user) return fallback;

  // 🚨 ENHANCED: 2025-08-13 优化undefined检测逻辑
  const safeNickname = sanitizeStringField(user.nickname);
  const safeUsername = sanitizeStringField(user.username);
  const safeEmail = sanitizeStringField(user.email);

  // 优先级处理：nickname > username > email > fallback
  const result = safeNickname || safeUsername || safeEmail || fallback;

  // 🛡️ ENHANCED: 多层安全检查
  const finalResult = validateAndFixResult(result, fallback, 'getUserDisplayName', user);

  return finalResult;
}

/**
 * 🔧 ENHANCED: 字符串字段安全化处理
 * 统一处理所有可能的undefined情况
 */
function sanitizeStringField(value: any): string {
  // 处理各种undefined情况
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return '';
  if (value === 'undefined' || value === 'null') return '';
  if (value.trim() === '') return '';

  // 检查是否包含undefined拼接
  if (value.includes('undefined')) {
    console.warn('🛠️ 检测到字段包含undefined，进行清理:', value);
    return value.replace(/undefined/g, '').trim();
  }

  return value.trim();
}

/**
 * 🔧 ENHANCED: 结果验证和修复
 * 最终的安全检查和修复逻辑
 */
function validateAndFixResult(result: string, fallback: string, functionName: string, user?: any): string {
  // 基础检查
  if (!result || result === 'undefined' || result.includes('undefined')) {
    if (import.meta.env.DEV) {
      console.warn(`🛠️ ${functionName}: 强制修复undefined问题`, {
        originalResult: result,
        fallback,
        user: user ? { id: user.id, nickname: user.nickname, username: user.username } : null
      });
    }
    return fallback;
  }

  // 运行时开发环境检查
  if (import.meta.env.DEV && result.toLowerCase().includes('undefined')) {
    console.warn(`⚠️ ${functionName}: 检测到潜在undefined问题:`, {
      result,
      user,
      stack: new Error().stack?.split('\n').slice(0, 3)
    });
  }

  return result;
}

/**
 * 获取用户头像URL
 * 优先级：avatar > photo > 生成默认头像
 *
 * @param user 用户对象
 * @returns 安全的头像URL
 */
export function getUserAvatar(user?: UserInfo | null): string {
  if (!user) {
    // 未登录用户返回默认头像
    return `https://api.dicebear.com/7.x/initials/svg?seed=Guest`;
  }

  // 🚨 ENHANCED: 使用统一的字段安全化处理
  const safeAvatar = sanitizeStringField(user.avatar);
  const safePhoto = sanitizeStringField(user.photo);
  const safePicture = sanitizeStringField(user.picture);

  // 优先级：avatar > photo > picture > 生成默认头像
  if (safeAvatar) {
    return validateAndFixResult(safeAvatar, '', 'getUserAvatar', user);
  }

  if (safePhoto) {
    return validateAndFixResult(safePhoto, '', 'getUserAvatar', user);
  }

  if (safePicture) {
    return validateAndFixResult(safePicture, '', 'getUserAvatar', user);
  }

  // 最后生成默认随机头像
  const safeName = getUserDisplayName(user, 'User');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(safeName)}`;
}

/**
 * 获取用户头像fallback文字（首字母）
 * 优先级：nickname首字母 > username首字母 > email首字母 > 默认字母
 * 
 * @param user 用户对象
 * @param fallback 默认字母，默认为 'U'
 * @returns 安全的头像fallback文字
 */
export function getUserAvatarFallback(user?: UserInfo | null, fallback: string = 'U'): string {
  if (!user) return fallback;
  
  const displayName = getUserDisplayName(user, fallback);
  return displayName.charAt(0).toUpperCase();
}

/**
 * 获取用户邮箱
 * 
 * @param user 用户对象
 * @param fallback 默认值，默认为空字符串
 * @returns 安全的邮箱地址
 */
export function getUserEmail(user?: UserInfo | null, fallback: string = ''): string {
  if (!user) return fallback;
  
  return user.email || fallback;
}

/**
 * 获取用户手机号
 * 
 * @param user 用户对象
 * @param fallback 默认值，默认为空字符串
 * @returns 安全的手机号
 */
export function getUserPhone(user?: UserInfo | null, fallback: string = ''): string {
  if (!user) return fallback;
  
  return user.phone || fallback;
}

/**
 * 获取用户ID
 * 
 * @param user 用户对象
 * @param fallback 默认值，默认为空字符串
 * @returns 安全的用户ID
 */
export function getUserId(user?: UserInfo | null, fallback: string = ''): string {
  if (!user) return fallback;
  
  return user.id || fallback;
}

/**
 * 获取用户用户名
 * 
 * @param user 用户对象
 * @param fallback 默认值，默认为空字符串
 * @returns 安全的用户名
 */
export function getUserUsername(user?: UserInfo | null, fallback: string = ''): string {
  if (!user) return fallback;
  
  return user.username || fallback;
}

/**
 * 获取安全的alt文本（用于图片）
 * 
 * @param user 用户对象
 * @param context 上下文描述，如 '头像'、'用户照片' 等
 * @returns 安全的alt文本
 */
export function getUserAltText(user?: UserInfo | null, context: string = '头像'): string {
  const displayName = getUserDisplayName(user, '用户');
  return `${displayName}的${context}`;
}

/**
 * 获取安全的placeholder文本
 * 
 * @param fieldName 字段名称，如 'nickname'、'email' 等
 * @returns 安全的placeholder文本
 */
export function getUserPlaceholder(fieldName: string): string {
  const placeholders: Record<string, string> = {
    nickname: '请输入昵称',
    username: '请输入用户名',
    email: '请输入邮箱地址',
    phone: '请输入手机号',
    password: '请输入密码',
    confirmPassword: '请确认密码'
  };
  
  return placeholders[fieldName] || `请输入${fieldName}`;
}

/**
 * 获取安全的title属性文本
 * 
 * @param user 用户对象
 * @param action 操作描述，如 '查看资料'、'编辑信息' 等
 * @returns 安全的title文本
 */
export function getUserTitle(user?: UserInfo | null, action: string = '查看资料'): string {
  const displayName = getUserDisplayName(user, '用户');
  return `${action} - ${displayName}`;
}

/**
 * 检查用户信息是否完整
 * 
 * @param user 用户对象
 * @param requiredFields 必需字段列表
 * @returns 是否完整
 */
export function isUserInfoComplete(user?: UserInfo | null, requiredFields: string[] = ['nickname', 'email']): boolean {
  if (!user) return false;
  
  return requiredFields.every(field => {
    const value = user[field];
    return value && value.trim() !== '';
  });
}

/**
 * 格式化用户信息用于显示
 * 
 * @param user 用户对象
 * @returns 格式化后的用户信息对象
 */
export function formatUserForDisplay(user?: UserInfo | null) {
  return {
    displayName: getUserDisplayName(user),
    avatar: getUserAvatar(user),
    avatarFallback: getUserAvatarFallback(user),
    email: getUserEmail(user),
    phone: getUserPhone(user),
    id: getUserId(user),
    username: getUserUsername(user)
  };
}

/**
 * 生成用户相关的aria-label
 * 
 * @param user 用户对象
 * @param element 元素类型，如 'button'、'link' 等
 * @param action 操作描述
 * @returns 安全的aria-label文本
 */
export function getUserAriaLabel(user: UserInfo | null | undefined, element: string, action: string): string {
  const displayName = getUserDisplayName(user, '用户');
  return `${displayName}的${element}，${action}`;
}

// 导出默认的工具函数集合
export const userDisplayUtils = {
  getUserDisplayName,
  getUserAvatar,
  getUserAvatarFallback,
  getUserEmail,
  getUserPhone,
  getUserId,
  getUserUsername,
  getUserAltText,
  getUserPlaceholder,
  getUserTitle,
  getUserAriaLabel,
  isUserInfoComplete,
  formatUserForDisplay
};

export default userDisplayUtils;
