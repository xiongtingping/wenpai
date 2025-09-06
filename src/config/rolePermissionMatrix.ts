/**
 * 🔐 角色权限映射表
 * 中央化管理所有角色、权限和订阅级别的映射关系
 */

/**
 * 系统角色定义
 */
export enum SystemRole {
  // 基础角色
  GUEST = 'guest',
  USER = 'user',
  VIP = 'vip',
  
  // 订阅角色
  TRIAL_USER = 'trial_user',
  PRO_USER = 'pro_user',
  PREMIUM_USER = 'premium_user',
  
  // 管理角色
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

/**
 * 权限标识定义
 */
export enum Permission {
  // 基础权限
  READ_BASIC_CONTENT = 'read:basic_content',
  CREATE_BASIC_CONTENT = 'create:basic_content',
  EDIT_OWN_CONTENT = 'edit:own_content',
  DELETE_OWN_CONTENT = 'delete:own_content',
  
  // 认证权限
  AUTH_REQUIRED = 'auth:required',
  
  // VIP权限
  VIP_REQUIRED = 'vip:required',
  
  // 功能权限
  FEATURE_CREATIVE_STUDIO = 'feature:creative_studio',
  FEATURE_BRAND_LIBRARY = 'feature:brand_library',
  FEATURE_UNLIMITED_USAGE = 'feature:unlimited_usage',
  FEATURE_ADVANCED_MODELS = 'feature:advanced_models',
  FEATURE_EMOJI_GENERATOR = 'feature:emoji_generator',
  FEATURE_MARKETING_CALENDAR = 'feature:marketing_calendar',
  FEATURE_WECHAT_TEMPLATES = 'feature:wechat_templates',
  FEATURE_CONTENT_EXTRACTOR = 'feature:content_extractor',
  
  // 内测权限
  PREVIEW_CREATIVE_STUDIO = 'preview:creative_studio',
  
  // 订阅等级权限
  TIER_TRIAL = 'tier:trial',
  TIER_PRO = 'tier:pro',
  TIER_PREMIUM = 'tier:premium',
  
  // 主题权限
  THEME_BASIC = 'theme:basic',
  THEME_ADVANCED = 'theme:advanced',
  THEME_PREMIUM = 'theme:premium',
  
  // 创意权限
  CREATIVE_BASIC = 'creative:basic',
  
  // 品牌权限
  BRAND_LIBRARY = 'brand:library',
  
  // 管理权限
  CMS_EDIT = 'cms:edit',
  USER_VIEW = 'user:view',
  USER_EDIT = 'user:edit',
  USER_DELETE = 'user:delete',
  SYSTEM_CONFIG = 'system:config',
  
  // API权限
  API_ACCESS_BASIC = 'api:access_basic',
  API_ACCESS_ADVANCED = 'api:access_advanced',
  API_KEY_MANAGE = 'api:key_manage',
  
  // 数据权限
  DATA_EXPORT = 'data:export',
  DATA_IMPORT = 'data:import',
  DATA_BACKUP = 'data:backup',
  DATA_RESTORE = 'data:restore'
}

/**
 * 订阅级别定义
 */
export enum SubscriptionTier {
  TRIAL = 'trial',
  PRO = 'pro',
  PREMIUM = 'premium'
}

/**
 * 角色权限映射配置
 */
export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  [SystemRole.GUEST]: [
    Permission.READ_BASIC_CONTENT,
    Permission.TIER_TRIAL,
    Permission.THEME_BASIC
  ],
  
  [SystemRole.USER]: [
    Permission.READ_BASIC_CONTENT,
    Permission.CREATE_BASIC_CONTENT,
    Permission.EDIT_OWN_CONTENT,
    Permission.DELETE_OWN_CONTENT,
    Permission.AUTH_REQUIRED,
    Permission.TIER_TRIAL,
    Permission.THEME_BASIC,
    Permission.API_ACCESS_BASIC
  ],
  
  [SystemRole.VIP]: [
    Permission.READ_BASIC_CONTENT,
    Permission.CREATE_BASIC_CONTENT,
    Permission.EDIT_OWN_CONTENT,
    Permission.DELETE_OWN_CONTENT,
    Permission.AUTH_REQUIRED,
    Permission.VIP_REQUIRED,
    Permission.TIER_PRO,
    Permission.THEME_ADVANCED,
    Permission.FEATURE_CREATIVE_STUDIO,
    Permission.FEATURE_ADVANCED_MODELS,
    Permission.FEATURE_EMOJI_GENERATOR,
    Permission.FEATURE_MARKETING_CALENDAR,
    Permission.FEATURE_WECHAT_TEMPLATES,
    Permission.FEATURE_CONTENT_EXTRACTOR,
    Permission.CREATIVE_BASIC,
    Permission.API_ACCESS_BASIC,
    Permission.DATA_EXPORT
  ],
  
  [SystemRole.TRIAL_USER]: [
    Permission.READ_BASIC_CONTENT,
    Permission.CREATE_BASIC_CONTENT,
    Permission.EDIT_OWN_CONTENT,
    Permission.AUTH_REQUIRED,
    Permission.TIER_TRIAL,
    Permission.THEME_BASIC,
    Permission.API_ACCESS_BASIC
  ],
  
  [SystemRole.PRO_USER]: [
    Permission.READ_BASIC_CONTENT,
    Permission.CREATE_BASIC_CONTENT,
    Permission.EDIT_OWN_CONTENT,
    Permission.DELETE_OWN_CONTENT,
    Permission.AUTH_REQUIRED,
    Permission.VIP_REQUIRED,
    Permission.TIER_PRO,
    Permission.THEME_ADVANCED,
    Permission.FEATURE_CREATIVE_STUDIO,
    Permission.FEATURE_ADVANCED_MODELS,
    Permission.FEATURE_EMOJI_GENERATOR,
    Permission.FEATURE_MARKETING_CALENDAR,
    Permission.FEATURE_WECHAT_TEMPLATES,
    Permission.FEATURE_CONTENT_EXTRACTOR,
    Permission.CREATIVE_BASIC,
    Permission.PREVIEW_CREATIVE_STUDIO,
    Permission.API_ACCESS_BASIC,
    Permission.API_ACCESS_ADVANCED,
    Permission.DATA_EXPORT
  ],
  
  [SystemRole.PREMIUM_USER]: [
    Permission.READ_BASIC_CONTENT,
    Permission.CREATE_BASIC_CONTENT,
    Permission.EDIT_OWN_CONTENT,
    Permission.DELETE_OWN_CONTENT,
    Permission.AUTH_REQUIRED,
    Permission.VIP_REQUIRED,
    Permission.TIER_PREMIUM,
    Permission.THEME_PREMIUM,
    Permission.FEATURE_CREATIVE_STUDIO,
    Permission.FEATURE_BRAND_LIBRARY,
    Permission.FEATURE_UNLIMITED_USAGE,
    Permission.FEATURE_ADVANCED_MODELS,
    Permission.FEATURE_EMOJI_GENERATOR,
    Permission.FEATURE_MARKETING_CALENDAR,
    Permission.FEATURE_WECHAT_TEMPLATES,
    Permission.FEATURE_CONTENT_EXTRACTOR,
    Permission.CREATIVE_BASIC,
    Permission.BRAND_LIBRARY,
    Permission.PREVIEW_CREATIVE_STUDIO,
    Permission.API_ACCESS_BASIC,
    Permission.API_ACCESS_ADVANCED,
    Permission.API_KEY_MANAGE,
    Permission.DATA_EXPORT,
    Permission.DATA_IMPORT
  ],
  
  [SystemRole.MODERATOR]: [
    // 包含所有用户权限
    ...ROLE_PERMISSIONS[SystemRole.PREMIUM_USER] || [],
    Permission.USER_VIEW,
    Permission.CMS_EDIT
  ],
  
  [SystemRole.ADMIN]: [
    // 包含所有moderator权限
    ...ROLE_PERMISSIONS[SystemRole.MODERATOR] || [],
    Permission.USER_EDIT,
    Permission.USER_DELETE,
    Permission.SYSTEM_CONFIG,
    Permission.DATA_BACKUP,
    Permission.DATA_RESTORE
  ],
  
  [SystemRole.SUPER_ADMIN]: [
    // 包含所有admin权限
    ...ROLE_PERMISSIONS[SystemRole.ADMIN] || [],
    // 超级管理员拥有所有权限
    ...Object.values(Permission)
  ]
};

/**
 * 订阅级别权限映射
 */
export const TIER_PERMISSIONS: Record<SubscriptionTier, Permission[]> = {
  [SubscriptionTier.TRIAL]: [
    Permission.READ_BASIC_CONTENT,
    Permission.CREATE_BASIC_CONTENT,
    Permission.TIER_TRIAL,
    Permission.THEME_BASIC,
    Permission.API_ACCESS_BASIC
  ],
  
  [SubscriptionTier.PRO]: [
    Permission.READ_BASIC_CONTENT,
    Permission.CREATE_BASIC_CONTENT,
    Permission.EDIT_OWN_CONTENT,
    Permission.DELETE_OWN_CONTENT,
    Permission.TIER_PRO,
    Permission.THEME_ADVANCED,
    Permission.FEATURE_CREATIVE_STUDIO,
    Permission.FEATURE_ADVANCED_MODELS,
    Permission.FEATURE_EMOJI_GENERATOR,
    Permission.FEATURE_MARKETING_CALENDAR,
    Permission.FEATURE_WECHAT_TEMPLATES,
    Permission.FEATURE_CONTENT_EXTRACTOR,
    Permission.CREATIVE_BASIC,
    Permission.API_ACCESS_BASIC,
    Permission.API_ACCESS_ADVANCED,
    Permission.DATA_EXPORT
  ],
  
  [SubscriptionTier.PREMIUM]: [
    // 包含所有Pro权限
    ...TIER_PERMISSIONS[SubscriptionTier.PRO] || [],
    Permission.TIER_PREMIUM,
    Permission.THEME_PREMIUM,
    Permission.FEATURE_BRAND_LIBRARY,
    Permission.FEATURE_UNLIMITED_USAGE,
    Permission.BRAND_LIBRARY,
    Permission.API_KEY_MANAGE,
    Permission.DATA_IMPORT
  ]
};

/**
 * 权限继承规则
 * 高级权限自动包含低级权限
 */
export const PERMISSION_INHERITANCE = {
  [Permission.TIER_PREMIUM]: [Permission.TIER_PRO, Permission.TIER_TRIAL],
  [Permission.TIER_PRO]: [Permission.TIER_TRIAL],
  [Permission.VIP_REQUIRED]: [Permission.AUTH_REQUIRED],
  [Permission.THEME_PREMIUM]: [Permission.THEME_ADVANCED, Permission.THEME_BASIC],
  [Permission.THEME_ADVANCED]: [Permission.THEME_BASIC],
  [Permission.API_ACCESS_ADVANCED]: [Permission.API_ACCESS_BASIC],
  [Permission.USER_DELETE]: [Permission.USER_EDIT, Permission.USER_VIEW],
  [Permission.USER_EDIT]: [Permission.USER_VIEW],
  [Permission.DATA_RESTORE]: [Permission.DATA_BACKUP],
  [Permission.DATA_BACKUP]: [Permission.DATA_EXPORT]
};

/**
 * 权限分组定义
 */
export const PERMISSION_GROUPS = {
  AUTHENTICATION: [
    Permission.AUTH_REQUIRED,
    Permission.VIP_REQUIRED
  ],
  
  SUBSCRIPTION_TIERS: [
    Permission.TIER_TRIAL,
    Permission.TIER_PRO,
    Permission.TIER_PREMIUM
  ],
  
  FEATURES: [
    Permission.FEATURE_CREATIVE_STUDIO,
    Permission.FEATURE_BRAND_LIBRARY,
    Permission.FEATURE_UNLIMITED_USAGE,
    Permission.FEATURE_ADVANCED_MODELS,
    Permission.FEATURE_EMOJI_GENERATOR,
    Permission.FEATURE_MARKETING_CALENDAR,
    Permission.FEATURE_WECHAT_TEMPLATES,
    Permission.FEATURE_CONTENT_EXTRACTOR
  ],
  
  THEMES: [
    Permission.THEME_BASIC,
    Permission.THEME_ADVANCED,
    Permission.THEME_PREMIUM
  ],
  
  API_ACCESS: [
    Permission.API_ACCESS_BASIC,
    Permission.API_ACCESS_ADVANCED,
    Permission.API_KEY_MANAGE
  ],
  
  DATA_MANAGEMENT: [
    Permission.DATA_EXPORT,
    Permission.DATA_IMPORT,
    Permission.DATA_BACKUP,
    Permission.DATA_RESTORE
  ],
  
  USER_MANAGEMENT: [
    Permission.USER_VIEW,
    Permission.USER_EDIT,
    Permission.USER_DELETE
  ],
  
  CONTENT_MANAGEMENT: [
    Permission.READ_BASIC_CONTENT,
    Permission.CREATE_BASIC_CONTENT,
    Permission.EDIT_OWN_CONTENT,
    Permission.DELETE_OWN_CONTENT,
    Permission.CMS_EDIT
  ]
};

/**
 * 权限检查工具类
 */
export class PermissionChecker {
  /**
   * 检查角色是否有指定权限
   */
  static hasRolePermission(role: SystemRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    
    // 直接权限检查
    if (rolePermissions.includes(permission)) {
      return true;
    }
    
    // 继承权限检查
    const inheritedPermissions = this.getInheritedPermissions(rolePermissions);
    return inheritedPermissions.includes(permission);
  }
  
  /**
   * 检查订阅级别是否有指定权限
   */
  static hasTierPermission(tier: SubscriptionTier, permission: Permission): boolean {
    const tierPermissions = TIER_PERMISSIONS[tier] || [];
    
    // 直接权限检查
    if (tierPermissions.includes(permission)) {
      return true;
    }
    
    // 继承权限检查
    const inheritedPermissions = this.getInheritedPermissions(tierPermissions);
    return inheritedPermissions.includes(permission);
  }
  
  /**
   * 获取继承的权限列表
   */
  static getInheritedPermissions(basePermissions: Permission[]): Permission[] {
    const inherited = new Set(basePermissions);
    
    basePermissions.forEach(permission => {
      const inheritedPerms = PERMISSION_INHERITANCE[permission] || [];
      inheritedPerms.forEach(perm => inherited.add(perm));
    });
    
    return Array.from(inherited);
  }
  
  /**
   * 获取角色的所有权限（包括继承）
   */
  static getAllRolePermissions(role: SystemRole): Permission[] {
    const basePermissions = ROLE_PERMISSIONS[role] || [];
    return this.getInheritedPermissions(basePermissions);
  }
  
  /**
   * 获取订阅级别的所有权限（包括继承）
   */
  static getAllTierPermissions(tier: SubscriptionTier): Permission[] {
    const basePermissions = TIER_PERMISSIONS[tier] || [];
    return this.getInheritedPermissions(basePermissions);
  }
  
  /**
   * 检查用户是否有权限（综合角色和订阅级别）
   */
  static checkUserPermission(
    userRoles: SystemRole[],
    userTier: SubscriptionTier,
    requiredPermission: Permission
  ): boolean {
    // 检查角色权限
    const hasRolePermission = userRoles.some(role => 
      this.hasRolePermission(role, requiredPermission)
    );
    
    // 检查订阅级别权限
    const hasTierPermission = this.hasTierPermission(userTier, requiredPermission);
    
    // 任一条件满足即可
    return hasRolePermission || hasTierPermission;
  }
  
  /**
   * 获取权限的显示名称
   */
  static getPermissionDisplayName(permission: Permission): string {
    const displayNames: Record<Permission, string> = {
      [Permission.READ_BASIC_CONTENT]: '阅读基础内容',
      [Permission.CREATE_BASIC_CONTENT]: '创建基础内容',
      [Permission.EDIT_OWN_CONTENT]: '编辑自己的内容',
      [Permission.DELETE_OWN_CONTENT]: '删除自己的内容',
      [Permission.AUTH_REQUIRED]: '需要登录',
      [Permission.VIP_REQUIRED]: '需要VIP权限',
      [Permission.FEATURE_CREATIVE_STUDIO]: '创意魔方功能',
      [Permission.FEATURE_BRAND_LIBRARY]: '品牌库功能',
      [Permission.FEATURE_UNLIMITED_USAGE]: '无限使用功能',
      [Permission.FEATURE_ADVANCED_MODELS]: '高级AI模型功能',
      [Permission.FEATURE_EMOJI_GENERATOR]: 'Emoji生成器功能',
      [Permission.FEATURE_MARKETING_CALENDAR]: '营销日历功能',
      [Permission.FEATURE_WECHAT_TEMPLATES]: '微信朋友圈文案模板功能',
      [Permission.FEATURE_CONTENT_EXTRACTOR]: '内容提取功能',
      [Permission.PREVIEW_CREATIVE_STUDIO]: '创意魔方内测',
      [Permission.TIER_TRIAL]: '体验版权限',
      [Permission.TIER_PRO]: '专业版权限',
      [Permission.TIER_PREMIUM]: '高级版权限',
      [Permission.THEME_BASIC]: '基础主题切换权限',
      [Permission.THEME_ADVANCED]: '高级主题切换权限',
      [Permission.THEME_PREMIUM]: '专业主题切换权限',
      [Permission.CREATIVE_BASIC]: '创意魔方基础权限',
      [Permission.BRAND_LIBRARY]: '品牌库访问权限',
      [Permission.CMS_EDIT]: 'CMS编辑权限',
      [Permission.USER_VIEW]: '用户查看权限',
      [Permission.USER_EDIT]: '用户编辑权限',
      [Permission.USER_DELETE]: '用户删除权限',
      [Permission.SYSTEM_CONFIG]: '系统配置权限',
      [Permission.API_ACCESS_BASIC]: '基础API访问',
      [Permission.API_ACCESS_ADVANCED]: '高级API访问',
      [Permission.API_KEY_MANAGE]: 'API密钥管理',
      [Permission.DATA_EXPORT]: '数据导出',
      [Permission.DATA_IMPORT]: '数据导入',
      [Permission.DATA_BACKUP]: '数据备份',
      [Permission.DATA_RESTORE]: '数据恢复'
    };
    
    return displayNames[permission] || permission;
  }
}

export default {
  SystemRole,
  Permission,
  SubscriptionTier,
  ROLE_PERMISSIONS,
  TIER_PERMISSIONS,
  PERMISSION_INHERITANCE,
  PERMISSION_GROUPS,
  PermissionChecker
};