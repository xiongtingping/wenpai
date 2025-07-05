/**
 * 用户类型定义
 */
export interface User {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  phone: string;
  /** 昵称 */
  nickname: string;
  /** 头像 */
  avatar: string;
  /** 用户ID（兼容Authing SDK） */
  userId?: string;
  /** 头像（兼容Authing SDK） */
  photo?: string;
  /** 角色列表 */
  roles?: string[];
  /** 权限列表 */
  permissions?: string[];
  /** 元数据 */
  metadata?: Record<string, unknown>;
  /** 索引签名，兼容Record<string, unknown>类型 */
  [key: string]: unknown;
} 