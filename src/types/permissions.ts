/**
 * 权限系统类型定义
 * 🔧 P1-1: 解决循环依赖 - 将权限类型提取到独立文件
 * 
 * @description 统一权限类型定义，避免服务间循环依赖
 * @author 权限系统团队
 * @created 2025-01-15
 */

import type { SubscriptionTier } from './subscription';

/**
 * 扩展的权限类型定义
 * 🔧 从unifiedPermissionService.ts迁移至此，解决循环依赖
 */
export type ExtendedPermissionType =
  | 'auth:required'           // 需要登录
  | 'tier:trial'             // 体验版权限
  | 'tier:pro'               // 专业版权限
  | 'tier:premium'           // 高级版权限
  | 'feature:creative-studio' // 创意魔方功能
  | 'feature:creative-cube'    // 创意魔方-九宫格
  | 'feature:marketing-calendar' // 营销日历
  | 'feature:wechat-templates' // 微信朋友圈文案模板
  | 'feature:emoji-generator'  // Emoji生成功能
  | 'feature:brand-library'    // 品牌库功能
  | 'feature:unlimited-usage'  // 无限使用功能
  | 'feature:advanced-models'  // 高级模型功能
  | 'model:trial'            // 体验版AI模型权限
  | 'model:pro'              // 专业版AI模型权限
  | 'model:premium'          // 高级版AI模型权限
  | 'theme:basic'            // 基础主题
  | 'theme:advanced'         // 高级主题
  | 'theme:premium';         // 专业版专属主题

/**
 * 权限检查结果接口
 */
export interface PermissionCheckResult {
  hasPermission: boolean;
  userTier: SubscriptionTier | string;
  requiredTier: SubscriptionTier | string;
  missingPermissions: ExtendedPermissionType[];
  reason?: string;
  suggestedAction?: 'login' | 'upgrade' | 'contact' | 'none';
  upgradeTarget?: SubscriptionTier;
  redirectUrl?: string;
  permissionConfig?: PermissionConfig;
  serverVerified?: boolean;
  verificationError?: string;
  metadata?: {
    timestamp?: string;
    source?: string;
    [key: string]: any;
  };
}

/**
 * 用户会话信息接口
 */
export interface SessionUserInfo {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  loginTime?: string;
  registrationDate?: string | Date;
  roles?: string[];
  permissions?: string[];
  subscription?: {
    tier?: SubscriptionTier;
    [key: string]: any;
  };
  vipLevel?: SubscriptionTier | string;
  isVip?: boolean;
  // 兼容旧字段
  subscription_tier?: SubscriptionTier;
  is_vip?: boolean;
  [key: string]: any;
}

/**
 * 权限配置接口
 */
export interface PermissionConfig {
  name: string;
  description: string;
  requiredTier: SubscriptionTier;
  check: (user: SessionUserInfo | null) => boolean;
  redirectUrl?: string;
  category: 'auth' | 'tier' | 'feature' | 'model' | 'theme';
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    [key: string]: any;
  };
}

/**
 * 权限服务接口 - 定义权限服务的标准接口
 * 🔧 用于解耦具体实现，支持依赖注入
 */
export interface IPermissionService {
  /**
   * 检查用户权限
   */
  checkPermission(user: SessionUserInfo | null, permission: ExtendedPermissionType): PermissionCheckResult;
  
  /**
   * 批量检查权限
   */
  checkPermissions(user: SessionUserInfo | null, permissions: ExtendedPermissionType[]): PermissionCheckResult[];
  
  /**
   * 获取用户订阅等级
   */
  getUserTier(user: SessionUserInfo | null): SubscriptionTier;
  
  /**
   * 检查是否需要升级
   */
  requiresUpgrade(user: SessionUserInfo | null, targetPermission: ExtendedPermissionType): {
    required: boolean;
    currentTier: SubscriptionTier;
    targetTier: SubscriptionTier;
  };
}

/**
 * 服务器端权限验证接口
 */
export interface IServerPermissionService {
  /**
   * 验证单个权限
   */
  verifyPermission(permission: ExtendedPermissionType, forceRefresh?: boolean): Promise<PermissionCheckResult>;
  
  /**
   * 批量验证权限
   */
  verifyPermissions(permissions: ExtendedPermissionType[]): Promise<{
    allGranted: boolean;
    results: Array<{
      permission: ExtendedPermissionType;
      result: PermissionCheckResult;
    }>;
  }>;
  
  /**
   * 清除权限缓存
   */
  clearCache(): void;
}

/**
 * 权限守卫组件属性接口
 */
export interface PermissionGuardProps {
  requiredPermission: ExtendedPermissionType | ExtendedPermissionType[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: 'block' | 'overlay' | 'preview';
  overlayIntensity?: 'light' | 'medium' | 'heavy';
  showUpgradePrompt?: boolean;
  onPermissionDenied?: (result: PermissionCheckResult) => void;
}

/**
 * 权限等级映射
 */
export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, number> = {
  trial: 0,
  pro: 1,
  premium: 2
} as const;

/**
 * 权限类别枚举
 */
export const PERMISSION_CATEGORIES = {
  AUTH: 'auth',
  TIER: 'tier',
  FEATURE: 'feature',
  MODEL: 'model',
  THEME: 'theme'
} as const;

/**
 * 建议操作类型
 */
export const SUGGESTED_ACTIONS = {
  LOGIN: 'login',
  UPGRADE: 'upgrade',
  CONTACT: 'contact'
} as const;