import { useMemo } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * 权限判断结果
 */
export interface PermissionResult {
  /** 是否通过权限检查 */
  pass: boolean;
  /** 权限检查失败的原因 */
  reason?: string;
  /** 重定向地址 */
  redirect?: string;
  /** 权限检查的详细信息 */
  details?: {
    /** 检查的权限键 */
    key: string;
    /** 用户当前权限 */
    userPermissions: string[];
    /** 用户当前角色 */
    userRoles: string[];
    /** 用户VIP状态 */
    isVip: boolean;
    /** 用户登录状态 */
    isLoggedIn: boolean;
  };
}

/**
 * 权限配置
 */
interface PermissionConfig {
  /** 权限键 */
  key: string;
  /** 权限描述 */
  description: string;
  /** 检查函数 */
  check: (user: any) => boolean;
  /** 失败时的重定向地址 */
  redirect?: string;
  /** 失败时的提示信息 */
  message?: string;
}

/**
 * 权限配置映射
 */
const PERMISSION_CONFIGS: Record<string, PermissionConfig> = {
  // 基础认证权限
  'auth:required': {
    key: 'auth:required',
    description: '需要登录',
    check: (user) => !!user && user.id,
    redirect: '/login',
    message: '请先登录'
  },

  // VIP权限
  'vip:required': {
    key: 'vip:required',
    description: '需要VIP权限',
    check: (user) => !!user && (user.isVip || user.vipLevel || user.roles?.includes('vip')),
    redirect: '/payment',
    message: '需要VIP权限，请升级'
  },

  // 功能权限
  'feature:creative-studio': {
    key: 'feature:creative-studio',
    description: '创意魔方功能',
    check: (user) => !!user && (user.isVip || user.vipLevel || user.permissions?.includes('feature:creative-studio')),
    redirect: '/payment',
    message: '创意魔方功能需要VIP权限'
  },

  'feature:brand-library': {
    key: 'feature:brand-library',
    description: '品牌库功能',
    check: (user) => !!user && (user.isVip || user.vipLevel || user.permissions?.includes('feature:brand-library')),
    redirect: '/payment',
    message: '品牌库功能需要VIP权限'
  },

  'feature:content-extractor': {
    key: 'feature:content-extractor',
    description: '内容提取功能',
    check: (user) => !!user && (user.isVip || user.vipLevel || user.permissions?.includes('feature:content-extractor')),
    redirect: '/payment',
    message: '内容提取功能需要VIP权限'
  },

  // 内测权限
  'preview:creative-studio': {
    key: 'preview:creative-studio',
    description: '创意魔方内测',
    check: (user) => !!user && (user.isVip || user.vipLevel || user.permissions?.includes('preview:creative-studio')),
    redirect: '/payment',
    message: '创意魔方功能正在内测中'
  },

  // 后端配置权限
  'cms:edit': {
    key: 'cms:edit',
    description: 'CMS编辑权限',
    check: (user) => !!user && user.permissions?.includes('cms:edit'),
    redirect: '/',
    message: '没有CMS编辑权限'
  },

  'user:view': {
    key: 'user:view',
    description: '用户查看权限',
    check: (user) => !!user && user.permissions?.includes('user:view'),
    redirect: '/',
    message: '没有用户查看权限'
  }
};

/**
 * 统一的权限判断 Hook
 * @param permissionKey 权限键或权限键数组
 * @returns 权限判断结果
 */
export const usePermission = (permissionKey: string | string[]): PermissionResult => {
  const { user, isAuthenticated } = useUnifiedAuth();

  return useMemo(() => {
    const keys = Array.isArray(permissionKey) ? permissionKey : [permissionKey];
    
    // 如果没有用户且需要登录权限，直接返回失败
    if (!isAuthenticated && keys.some(key => key === 'auth:required')) {
      return {
        pass: false,
        reason: '需要登录',
        redirect: '/login',
        details: {
          key: 'auth:required',
          userPermissions: [],
          userRoles: [],
          isVip: false,
          isLoggedIn: false
        }
      };
    }

    // 检查每个权限键
    for (const key of keys) {
      const config = PERMISSION_CONFIGS[key];
      
      if (!config) {
        console.warn(`🔒 未找到权限配置: ${key}`);
        continue;
      }

      const hasPermission = config.check(user);
      
      // 打印权限检查日志
      console.log(`🔒 权限检查: ${key}`, {
        user: user ? { id: user.id, isVip: user.isVip, permissions: user.permissions, roles: user.roles } : null,
        hasPermission,
        config: config.description
      });

      if (!hasPermission) {
        return {
          pass: false,
          reason: config.message || `缺少权限: ${config.description}`,
          redirect: config.redirect,
          details: {
            key,
            userPermissions: user?.permissions || [],
            userRoles: user?.roles || [],
            isVip: !!user?.isVip,
            isLoggedIn: isAuthenticated
          }
        };
      }
    }

    // 所有权限检查通过
    return {
      pass: true,
      details: {
        key: keys.join(','),
        userPermissions: user?.permissions || [],
        userRoles: user?.roles || [],
        isVip: !!user?.isVip,
        isLoggedIn: isAuthenticated
      }
    };
  }, [user, isAuthenticated, permissionKey]);
};

/**
 * VIP权限判断 Hook (向后兼容)
 * @deprecated 使用 usePermission('vip:required') 替代
 */
export const useVipPermission = () => {
  return usePermission('vip:required');
};

/**
 * 功能权限判断 Hook (向后兼容)
 * @deprecated 使用 usePermission('feature:{name}') 替代
 */
export const useFeaturePermission = (featureId: string) => {
  return usePermission(`feature:${featureId}`);
}; 