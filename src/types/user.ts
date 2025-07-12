/**
 * 用户信息接口
 */
export interface User {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username?: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
  /** 昵称 */
  nickname?: string;
  /** 头像 */
  avatar?: string;
  /** 用户计划 */
  plan?: string;
  /** 是否为专业用户 */
  isProUser?: boolean;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 其他属性 */
  [key: string]: unknown;
} 