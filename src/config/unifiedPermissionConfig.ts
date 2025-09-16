/**
 * 🔐 统一权限配置中心
 * 整合所有权限相关配置，提供统一的权限管理接口
 * 
 * 设计原则：
 * 1. 单一数据源 - 所有权限配置都在这里定义
 * 2. 类型安全 - 使用TypeScript确保类型正确
 * 3. 易于维护 - 集中管理，便于修改和扩展
 * 4. 性能优化 - 预计算权限映射，避免运行时计算
 */

import i18n from '@/i18n';
import { SystemRole, Permission, SubscriptionTier, PermissionChecker } from './rolePermissionMatrix';
import { logger } from '@/utils/logger';

// 安全的角色转换函数
function safeRoleToString(role: any): string {
  if (role === null || role === undefined) {
    return '';
  }
  try {
    return role.toString();
  } catch (error) {
    console.warn('🛠️ safeRoleToString error:', error);
    return '';
  }
}

/**
 * 权限检查结果
 */
export interface UnifiedPermissionResult {
  pass: boolean;
  reason?: string;
  redirect?: string;
  requiredLevel?: string;
  currentLevel?: string;
  canUpgrade?: boolean;
  upgradeUrl?: string;
  details?: {
    key: string;
    userPermissions: string[];
    userRoles: string[];
    userTier?: string;
    isVip: boolean;
    isLoggedIn: boolean;
  };
}

/**
 * 用户权限上下文
 */
export interface UserPermissionContext {
  id?: string;
  isAuthenticated: boolean;
  roles?: SystemRole[];
  tier?: SubscriptionTier;
  isVip?: boolean;
  vipLevel?: string;
  subscription?: {
    tier?: string;
    status?: string;
    isActive?: boolean;
  };
  permissions?: string[];
  customPermissions?: Permission[];
}

/**
 * 权限配置项
 * 🔒 安全修复：移除 allowInDev 属性，确保所有环境都执行相同的权限检查
 */
interface PermissionConfigItem {
  key: string;
  description: string;
  requiredPermissions: Permission[];
  requiredRoles?: SystemRole[];
  requiredTier?: SubscriptionTier;
  customCheck?: (user: UserPermissionContext) => boolean;
  redirect?: string;
  message?: string;
  upgradeUrl?: string;
}

/**
 * 统一权限配置映射
 * 整合原有的 PERMISSION_CONFIGS 并扩展
 */
export const UNIFIED_PERMISSION_CONFIGS: Record<string, PermissionConfigItem> = {
  // 基础认证权限
  'auth:required': {
    key: 'auth:required',
    description: '需要登录',
    requiredPermissions: [Permission.AUTH_REQUIRED],
    redirect: '/login',
    message: i18n.t('common.messages.请先登录')
  },

  // VIP权限
  'vip:required': {
    key: 'vip:required',
    description: '需要VIP权限',
    requiredPermissions: [Permission.VIP_REQUIRED],
    redirect: '/payment',
    message: '需要VIP权限，请升级',
    upgradeUrl: '/payment'
  },

  // 功能权限
  'feature:creative-studio': {
    key: 'feature:creative-studio',
    description: '创意魔方功能',
    requiredPermissions: [Permission.FEATURE_CREATIVE_STUDIO],
    requiredTier: SubscriptionTier.PRO,
    redirect: '/payment',
    message: i18n.t('common.messages.创意魔方功能需要专业版权限'),
    upgradeUrl: '/payment',
    customCheck: (user) => {
      if (!user.isAuthenticated) return false;
      
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      if (user.tier === SubscriptionTier.PRO || user.tier === SubscriptionTier.PREMIUM) return true;
      
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      
      // 检查权限
      if (user.permissions?.includes('feature:creative-studio') || user.permissions?.includes('tier:pro')) return true;
      
      // 检查旧的VIP标识
      if (user.isVip) return true;
      
      return false;
    }
  },

  'feature:brand-library': {
    key: 'feature:brand-library',
    description: '品牌库功能',
    requiredPermissions: [Permission.FEATURE_BRAND_LIBRARY],
    requiredTier: SubscriptionTier.PREMIUM,
    redirect: '/payment',
    message: i18n.t('common.messages.品牌库功能需要高级版权限'),
    upgradeUrl: '/payment',
    customCheck: (user) => {
      if (!user.isAuthenticated) return false;
      
      // 检查订阅等级
      if (user.subscription?.tier === 'premium') return true;
      if (user.tier === SubscriptionTier.PREMIUM) return true;
      
      // 检查VIP等级
      if (user.vipLevel === 'premium') return true;
      
      // 检查权限
      if (user.permissions?.includes('feature:brand-library') || user.permissions?.includes('tier:premium')) return true;
      
      return false;
    }
  },

  'feature:unlimited-usage': {
    key: 'feature:unlimited-usage',
    description: '无限使用功能',
    requiredPermissions: [Permission.FEATURE_UNLIMITED_USAGE],
    requiredTier: SubscriptionTier.PREMIUM,
    redirect: '/payment',
    message: i18n.t('common.messages.无限使用功能需要高级版权限'),
    upgradeUrl: '/payment'
  },

  'feature:advanced-models': {
    key: 'feature:advanced-models',
    description: '高级AI模型功能',
    requiredPermissions: [Permission.FEATURE_ADVANCED_MODELS],
    requiredTier: SubscriptionTier.PRO,
    redirect: '/payment',
    message: '高级AI模型功能需要专业版权限',
    upgradeUrl: '/payment',
    customCheck: (user) => {
      if (!user.isAuthenticated) return false;
      
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      if (user.tier === SubscriptionTier.PRO || user.tier === SubscriptionTier.PREMIUM) return true;
      
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      
      // 检查权限
      if (user.permissions?.includes('feature:advanced-models') || user.permissions?.includes('tier:pro')) return true;
      
      // 检查旧的VIP标识
      if (user.isVip) return true;
      
      return false;
    }
  },

  // 订阅等级权限
  'tier:trial': {
    key: 'tier:trial',
    description: i18n.t('common.messages.体验版权限'),
    requiredPermissions: [Permission.TIER_TRIAL],
    message: i18n.t('common.messages.体验版权限'),
    customCheck: () => true // 所有用户都有体验版权限
  },

  'tier:pro': {
    key: 'tier:pro',
    description: '专业版权限',
    requiredPermissions: [Permission.TIER_PRO],
    requiredTier: SubscriptionTier.PRO,
    redirect: '/payment',
    message: i18n.t('common.messages.需要专业版或更高版本'),
    upgradeUrl: '/payment',
    customCheck: (user) => {
      if (!user.isAuthenticated) return false;
      
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      if (user.tier === SubscriptionTier.PRO || user.tier === SubscriptionTier.PREMIUM) return true;
      
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      
      // 检查权限
      if (user.permissions?.includes('tier:pro') || user.permissions?.includes('tier:premium')) return true;
      
      // 检查旧的VIP标识
      if (user.isVip) return true;
      
      return false;
    }
  },

  'tier:premium': {
    key: 'tier:premium',
    description: '高级版权限',
    requiredPermissions: [Permission.TIER_PREMIUM],
    requiredTier: SubscriptionTier.PREMIUM,
    redirect: '/payment',
    message: i18n.t('common.messages.需要高级版'),
    upgradeUrl: '/payment',
    customCheck: (user) => {
      if (!user.isAuthenticated) return false;
      
      // 检查订阅等级
      if (user.subscription?.tier === 'premium') return true;
      if (user.tier === SubscriptionTier.PREMIUM) return true;
      
      // 检查VIP等级
      if (user.vipLevel === 'premium') return true;
      
      // 检查权限
      if (user.permissions?.includes('tier:premium')) return true;
      
      return false;
    }
  },

  // 主题权限
  'theme:basic': {
    key: 'theme:basic',
    description: '基础主题切换权限',
    requiredPermissions: [Permission.THEME_BASIC],
    message: i18n.t('common.messages.基础主题权限'),
    customCheck: () => true // 所有用户都有基础主题权限
  },

  'theme:advanced': {
    key: 'theme:advanced',
    description: '高级主题切换权限',
    requiredPermissions: [Permission.THEME_ADVANCED],
    requiredTier: SubscriptionTier.PRO,
    redirect: '/payment',
    message: i18n.t('common.messages.高级主题需要专业版或更高版本'),
    upgradeUrl: '/payment'
  },

  'theme:premium': {
    key: 'theme:premium',
    description: '专业主题切换权限',
    requiredPermissions: [Permission.THEME_PREMIUM],
    requiredTier: SubscriptionTier.PREMIUM,
    redirect: '/payment',
    message: i18n.t('common.messages.专业主题需要高级版'),
    upgradeUrl: '/payment'
  },

  // 管理权限
  'cms:edit': {
    key: 'cms:edit',
    description: 'CMS编辑权限',
    requiredPermissions: [Permission.CMS_EDIT],
    requiredRoles: [SystemRole.MODERATOR, SystemRole.ADMIN, SystemRole.SUPER_ADMIN],
    redirect: '/',
    message: '没有CMS编辑权限'
  },

  'user:view': {
    key: 'user:view',
    description: '用户查看权限',
    requiredPermissions: [Permission.USER_VIEW],
    requiredRoles: [SystemRole.MODERATOR, SystemRole.ADMIN, SystemRole.SUPER_ADMIN],
    redirect: '/',
    message: i18n.t('common.messages.没有用户查看权限')
  },

  // API权限
  'api:basic': {
    key: 'api:basic',
    description: '基础API访问权限',
    requiredPermissions: [Permission.API_ACCESS_BASIC],
    redirect: '/login',
    message: '需要登录才能访问API'
  },

  'api:advanced': {
    key: 'api:advanced',
    description: '高级API访问权限',
    requiredPermissions: [Permission.API_ACCESS_ADVANCED],
    requiredTier: SubscriptionTier.PRO,
    redirect: '/payment',
    message: '高级API访问需要专业版权限',
    upgradeUrl: '/payment'
  },

  'api:key-manage': {
    key: 'api:key-manage',
    description: 'API密钥管理权限',
    requiredPermissions: [Permission.API_KEY_MANAGE],
    requiredTier: SubscriptionTier.PREMIUM,
    redirect: '/payment',
    message: 'API密钥管理需要高级版权限',
    upgradeUrl: '/payment'
  }
};

/**
 * 统一权限管理器
 */
export class UnifiedPermissionManager {
  private static instance: UnifiedPermissionManager;
  
  private constructor() {}
  
  static getInstance(): UnifiedPermissionManager {
    if (!UnifiedPermissionManager.instance) {
      UnifiedPermissionManager.instance = new UnifiedPermissionManager();
    }
    return UnifiedPermissionManager.instance;
  }

  /**
   * 检查单个权限
   */
  checkPermission(permissionKey: string, user: UserPermissionContext): UnifiedPermissionResult {
    const config = UNIFIED_PERMISSION_CONFIGS[permissionKey];
    
    if (!config) {
      logger.warn(i18n.t('config.text.权限配置未找到_c0x'), permissionKey);
      return {
        pass: false,
        reason: '权限配置未找到: ' + permissionKey,
        details: {
          key: permissionKey,
          userPermissions: user.permissions || [],
          userRoles: (user.roles || []).map(role => safeRoleToString(role)),
          userTier: user.tier,
          isVip: !!user.isVip,
          isLoggedIn: user.isAuthenticated
        }
      };
    }

    // 🔒 安全修复：移除开发环境权限绕过，所有环境都必须遵循相同的权限检查规则
    // 开发环境也必须进行正常的权限验证，确保安全性一致

    // 自定义检查函数优先
    if (config.customCheck) {
      const hasPermission = config.customCheck(user);
      
      if (!hasPermission) {
        return {
          pass: false,
          reason: config.message || ('缺少权限: ' + config.description),
          redirect: config.redirect,
          requiredLevel: config.requiredTier || 'unknown',
          currentLevel: user.tier || 'trial',
          canUpgrade: !!config.upgradeUrl,
          upgradeUrl: config.upgradeUrl,
          details: {
            key: permissionKey,
            userPermissions: user.permissions || [],
            userRoles: (user.roles || []).map(role => safeRoleToString(role)),
            userTier: user.tier,
            isVip: !!user.isVip,
            isLoggedIn: user.isAuthenticated
          }
        };
      }
      
      return {
        pass: true,
        details: {
          key: permissionKey,
          userPermissions: user.permissions || [],
          userRoles: (user.roles || []).map(role => safeRoleToString(role)),
          userTier: user.tier,
          isVip: !!user.isVip,
          isLoggedIn: user.isAuthenticated
        }
      };
    }

    // 基于角色的权限检查
    if (config.requiredRoles && user.roles) {
      const hasRequiredRole = config.requiredRoles.some(requiredRole => 
        user.roles!.includes(requiredRole)
      );
      
      if (hasRequiredRole) {
        return {
          pass: true,
          details: {
            key: permissionKey,
            userPermissions: user.permissions || [],
            userRoles: (user.roles || []).map(role => safeRoleToString(role)),
            userTier: user.tier,
            isVip: !!user.isVip,
            isLoggedIn: user.isAuthenticated
          }
        };
      }
    }

    // 基于订阅级别的权限检查
    if (config.requiredTier && user.tier) {
      const hasTierPermission = PermissionChecker.checkUserPermission(
        user.roles || [],
        user.tier,
        config.requiredPermissions[0] // 使用第一个权限作为检查依据
      );
      
      if (hasTierPermission) {
        return {
          pass: true,
          details: {
            key: permissionKey,
            userPermissions: user.permissions || [],
            userRoles: (user.roles || []).map(role => safeRoleToString(role)),
            userTier: user.tier,
            isVip: !!user.isVip,
            isLoggedIn: user.isAuthenticated
          }
        };
      }
    }

    // 基于权限列表的检查
    if (config.requiredPermissions && user.permissions) {
      const hasAllPermissions = config.requiredPermissions.every(permission =>
        user.permissions!.includes(safeRoleToString(permission))
      );
      
      if (hasAllPermissions) {
        return {
          pass: true,
          details: {
            key: permissionKey,
            userPermissions: user.permissions || [],
            userRoles: (user.roles || []).map(role => safeRoleToString(role)),
            userTier: user.tier,
            isVip: !!user.isVip,
            isLoggedIn: user.isAuthenticated
          }
        };
      }
    }

    // 权限检查失败
    return {
      pass: false,
      reason: config.message || ('缺少权限: ' + config.description),
      redirect: config.redirect,
      requiredLevel: config.requiredTier || 'unknown',
      currentLevel: user.tier || 'trial',
      canUpgrade: !!config.upgradeUrl,
      upgradeUrl: config.upgradeUrl,
      details: {
        key: permissionKey,
        userPermissions: user.permissions || [],
        userRoles: (user.roles || []).map(role => safeRoleToString(role)),
        userTier: user.tier,
        isVip: !!user.isVip,
        isLoggedIn: user.isAuthenticated
      }
    };
  }

  /**
   * 检查多个权限（AND逻辑）
   */
  checkMultiplePermissions(permissionKeys: string[], user: UserPermissionContext): UnifiedPermissionResult {
    for (const key of permissionKeys) {
      const result = this.checkPermission(key, user);
      if (!result.pass) {
        return result;
      }
    }
    
    return {
      pass: true,
      details: {
        key: permissionKeys.join(','),
        userPermissions: user.permissions || [],
        userRoles: (user.roles || []).map(role => safeRoleToString(role)),
        userTier: user.tier,
        isVip: !!user.isVip,
        isLoggedIn: user.isAuthenticated
      }
    };
  }

  /**
   * 检查任一权限（OR逻辑）
   */
  checkAnyPermission(permissionKeys: string[], user: UserPermissionContext): UnifiedPermissionResult {
    const results = permissionKeys.map(key => this.checkPermission(key, user));
    const hasAnyPermission = results.some(result => result.pass);
    
    if (hasAnyPermission) {
      return {
        pass: true,
        details: {
          key: permissionKeys.join(' OR '),
          userPermissions: user.permissions || [],
          userRoles: (user.roles || []).map(role => safeRoleToString(role)),
          userTier: user.tier,
          isVip: !!user.isVip,
          isLoggedIn: user.isAuthenticated
        }
      };
    }
    
    // 返回第一个失败的结果
    return results[0];
  }

  /**
   * 获取用户所有可用权限
   */
  getUserAvailablePermissions(user: UserPermissionContext): string[] {
    const availablePermissions: string[] = [];
    
    Object.keys(UNIFIED_PERMISSION_CONFIGS).forEach(key => {
      const result = this.checkPermission(key, user);
      if (result.pass) {
        availablePermissions.push(key);
      }
    });
    
    return availablePermissions;
  }

  /**
   * 获取权限升级建议
   */
  getUpgradeSuggestion(permissionKey: string, _user: UserPermissionContext): {
    canUpgrade: boolean;
    requiredTier?: SubscriptionTier;
    upgradeUrl?: string;
    message?: string;
  } {
    const config = UNIFIED_PERMISSION_CONFIGS[permissionKey];
    
    if (!config) {
      return { canUpgrade: false };
    }
    
    return {
      canUpgrade: !!config.upgradeUrl,
      requiredTier: config.requiredTier,
      upgradeUrl: config.upgradeUrl,
      message: config.message
    };
  }
}

// 🔧 修复循环依赖问题 - 延迟初始化，避免模块加载时的循环依赖
let _unifiedPermissionManager: UnifiedPermissionManager | null = null;

// 导出单例实例的获取函数 - 延迟创建实例
export const getUnifiedPermissionManager = (): UnifiedPermissionManager => {
  if (!_unifiedPermissionManager) {
    // 延迟创建实例，避免在模块加载时立即初始化
    _unifiedPermissionManager = UnifiedPermissionManager.getInstance();
  }
  return _unifiedPermissionManager;
};

// 导出便捷函数 - 使用延迟初始化的单例
export const checkPermission = (permissionKey: string, user: UserPermissionContext) => 
  getUnifiedPermissionManager().checkPermission(permissionKey, user);

export const checkMultiplePermissions = (permissionKeys: string[], user: UserPermissionContext) =>
  getUnifiedPermissionManager().checkMultiplePermissions(permissionKeys, user);

export const checkAnyPermission = (permissionKeys: string[], user: UserPermissionContext) =>
  getUnifiedPermissionManager().checkAnyPermission(permissionKeys, user);

// 🔧 FIX: 移除模块加载时的立即初始化，改为运行时延迟初始化
// 这个导出会在模块首次被调用时才创建实例，而不是在模块加载时
export const unifiedPermissionManager = {
  get instance(): UnifiedPermissionManager {
    return getUnifiedPermissionManager();
  }
};


// 🔧 FIX TDZ: 延迟初始化防护
let _moduleInitialized = false;
const initializeModule = () => {
  if (_moduleInitialized) return;
  _moduleInitialized = true;
  // 模块已初始化标记
};

// 在模块首次使用时初始化
const safeGetUnifiedPermissionManager = () => {
  initializeModule();
  return getUnifiedPermissionManager();
};

// 导出安全的获取函数
export { safeGetUnifiedPermissionManager as getUnifiedPermissionManagerSafe };

// 🔧 FIXED: 添加命名导出以支持serviceRegistry
export const unifiedPermissionConfig = {
  UNIFIED_PERMISSION_CONFIGS,
  UnifiedPermissionManager,
  unifiedPermissionManager,
  checkPermission,
  checkMultiplePermissions,
  checkAnyPermission
};

export default {
  UNIFIED_PERMISSION_CONFIGS,
  UnifiedPermissionManager,
  unifiedPermissionManager,
  checkPermission,
  checkMultiplePermissions,
  checkAnyPermission
};