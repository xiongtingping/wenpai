/**
 * ✅ FIXED: 用户信息显示工具函数
 * 🎯 用途：统一处理用户信息显示，防止 "undefinedundefined" 字符串拼接问题
 * 📌 已封装：此工具集已验证可用，请勿修改
 * 🔒 LOCKED: AI 禁止对此文件做任何修改
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
  
  return user.nickname || user.username || user.email || fallback;
}

/**
 * 获取用户头像URL
 * 优先级：avatar > photo > 空字符串
 * 
 * @param user 用户对象
 * @returns 安全的头像URL
 */
export function getUserAvatar(user?: UserInfo | null): string {
  if (!user) return '';
  
  return user.avatar || user.photo || '';
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
export function getUserAriaLabel(user?: UserInfo | null, element: string, action: string): string {
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
