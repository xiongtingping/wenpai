/**
 * 🔧 [UNIFIED_PERMISSION_HOOK_v2025.08.15]
 * 统一权限管理Hook - 系统性架构优化
 *
 * 这是整个应用的统一权限管理入口，提供：
 * 1. 权限检查的统一接口
 * 2. 角色验证的标准化方法
 * 3. 订阅等级的判断逻辑
 * 4. 开发环境的权限模拟
 */

import i18n from '@/i18n';
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { logger } from '@/utils/logger';

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
    message: i18n.t('common.messages.请先登录')
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
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('feature:creative-studio') || user.permissions?.includes('tier:pro')) return true;
      // 检查旧的VIP标识
      if (user.isVip) return true;
      return false;
    },
    redirect: '/payment',
    message: i18n.t('common.messages.创意魔方功能需要专业版权限')
  },

  'feature:brand-library': {
    key: 'feature:brand-library',
    description: '品牌库功能',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('feature:brand-library') || user.permissions?.includes('tier:premium')) return true;
      return false;
    },
    redirect: '/payment',
    message: i18n.t('common.messages.品牌库功能需要高级版权限')
  },

  'feature:unlimited-usage': {
    key: 'feature:unlimited-usage',
    description: '无限使用功能',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('feature:unlimited-usage') || user.permissions?.includes('tier:premium')) return true;
      return false;
    },
    redirect: '/payment',
    message: i18n.t('common.messages.无限使用功能需要高级版权限')
  },

  'feature:advanced-models': {
    key: 'feature:advanced-models',
    description: '高级AI模型功能',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('feature:advanced-models') || user.permissions?.includes('tier:pro')) return true;
      // 检查旧的VIP标识
      if (user.isVip) return true;
      return false;
    },
    redirect: '/payment',
    message: '高级AI模型功能需要专业版权限'
  },

  'feature:emoji-generator': {
    key: 'feature:emoji-generator',
    description: 'Emoji生成器功能',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('feature:emoji-generator') || user.permissions?.includes('tier:pro')) return true;
      // 检查旧的VIP标识
      if (user.isVip) return true;
      return false;
    },
    redirect: '/payment',
    message: 'Emoji生成器功能需要专业版权限'
  },

  'feature:marketing-calendar': {
    key: 'feature:marketing-calendar',
    description: '营销日历功能',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('feature:marketing-calendar') || user.permissions?.includes('tier:pro')) return true;
      // 检查旧的VIP标识
      if (user.isVip) return true;
      return false;
    },
    redirect: '/payment',
    message: i18n.t('common.messages.营销日历功能需要专业版权限')
  },

  'feature:wechat-templates': {
    key: 'feature:wechat-templates',
    description: '微信朋友圈文案模板功能',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('feature:wechat-templates') || user.permissions?.includes('tier:pro')) return true;
      // 检查旧的VIP标识
      if (user.isVip) return true;
      return false;
    },
    redirect: '/payment',
    message: i18n.t('common.messages.微信朋友圈文案模板功能需要专业版权限')
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
    message: i18n.t('common.messages.创意魔方功能正在内测中')
  },

  // 订阅等级权限
  'tier:trial': {
    key: 'tier:trial',
    description: i18n.t('common.messages.体验版权限'),
    check: (user) => true, // 所有用户都有体验版权限
    message: i18n.t('common.messages.体验版权限')
  },

  'tier:pro': {
    key: 'tier:pro',
    description: '专业版权限',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('tier:pro') || user.permissions?.includes('tier:premium')) return true;
      // 检查旧的VIP标识
      if (user.isVip) return true;
      return false;
    },
    redirect: '/payment',
    message: i18n.t('common.messages.需要专业版或更高版本')
  },

  'tier:premium': {
    key: 'tier:premium',
    description: '高级版权限',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('tier:premium')) return true;
      return false;
    },
    redirect: '/payment',
    message: i18n.t('common.messages.需要高级版')
  },

  // 主题切换权限
  'theme:basic': {
    key: 'theme:basic',
    description: '基础主题切换权限',
    check: (user) => true, // 所有用户都有基础主题权限（浅色主题）
    message: i18n.t('common.messages.基础主题权限')
  },

  'theme:advanced': {
    key: 'theme:advanced',
    description: '高级主题切换权限',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'pro' || user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'pro' || user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('theme:advanced') || user.permissions?.includes('tier:pro')) return true;
      // 检查旧的VIP标识
      if (user.isVip) return true;
      return false;
    },
    redirect: '/payment',
    message: i18n.t('common.messages.高级主题需要专业版或更高版本')
  },

  'theme:premium': {
    key: 'theme:premium',
    description: '专业主题切换权限',
    check: (user) => {
      if (!user) return false;
      // 检查订阅等级
      if (user.subscription?.tier === 'premium') return true;
      // 检查VIP等级
      if (user.vipLevel === 'premium') return true;
      // 检查权限
      if (user.permissions?.includes('theme:premium') || user.permissions?.includes('tier:premium')) return true;
      return false;
    },
    redirect: '/payment',
    message: i18n.t('common.messages.专业主题需要高级版')
  },

  // 创意魔方权限
  'creative:basic': {
    key: 'creative:basic',
    description: '创意魔方基础权限',
    check: (user) => !!user && (user.isVip || user.vipLevel === 'pro' || user.vipLevel === 'premium' || user.permissions?.includes('creative:basic')),
    redirect: '/payment',
    message: i18n.t('common.messages.创意魔方需要专业版或更高版本')
  },

  // 品牌库权限
  'brand:library': {
    key: 'brand:library',
    description: '品牌库访问权限',
    check: (user) => !!user && (user.vipLevel === 'premium' || user.permissions?.includes('brand:library')),
    redirect: '/payment',
    message: i18n.t('common.messages.品牌库需要高级版')
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
    message: i18n.t('common.messages.没有用户查看权限')
  }
};

/**
 * 统一的权限判断 Hook
 * @param permissionKey 权限键或权限键数组
 * @returns 权限判断结果
 */
export const usePermission = (permissionKey: string | string[]): PermissionResult => {
  const { user, isAuthenticated } = useAuth();
  const { primaryStatus, hasActiveSubscription } = useSubscriptionStatus();

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

    // 创建增强的用户对象，包含订阅状态信息
    const enhancedUser = user ? {
      ...user,
      // 如果有活跃订阅，使用订阅状态中的等级信息
      subscription: primaryStatus?.status === 'active' && primaryStatus.tier ? {
        ...user.subscription,
        tier: primaryStatus.tier
      } : user.subscription,
      // 根据订阅状态推断VIP等级
      vipLevel: (() => {
        if (primaryStatus?.status === 'active' && primaryStatus.tier) {
          return primaryStatus.tier;
        }
        if (primaryStatus?.status === 'active') {
          const statusLabel = primaryStatus.statusLabel?.toLowerCase() || '';
          if (statusLabel.includes(i18n.t('common.labels.高级版')) || statusLabel.includes('premium')) {
            return 'premium';
          } else if (statusLabel.includes(i18n.t('common.labels.专业版')) || statusLabel.includes('pro')) {
            return 'pro';
          }
        }
        return user.vipLevel;
      })()
    } : user;

    // 检查每个权限键
    for (const key of keys) {
      const config = PERMISSION_CONFIGS[key];

      if (!config) {
        console.warn('权限配置未找到:', key);
        continue;
      }

      const hasPermission = config.check(enhancedUser);

      // 开发环境调试日志（降低频次）
      if (import.meta.env.DEV && Math.random() < 0.05) { // 只有5%的概率输出日志
        logger.debug('权限检查结果', {
          user: enhancedUser ? {
            id: enhancedUser.id,
            isVip: (enhancedUser as any).isVip,
            vipLevel: enhancedUser.vipLevel
          } : null,
          hasActiveSubscription,
          hasPermission,
          config: config.description
        });
      }

      if (!hasPermission) {
        return {
          pass: false,
          reason: config.message || ('缺少权限: ' + config.description),
          redirect: config.redirect,
          details: {
            key,
            userPermissions: enhancedUser?.permissions || [],
            userRoles: enhancedUser?.roles || [],
            isVip: !!(enhancedUser as any)?.isVip,
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
        userPermissions: enhancedUser?.permissions || [],
        userRoles: enhancedUser?.roles || [],
        isVip: !!(enhancedUser as any)?.isVip,
        isLoggedIn: isAuthenticated
      }
    };
  }, [user, isAuthenticated, permissionKey, primaryStatus, hasActiveSubscription]);
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
  return usePermission('feature:' + featureId);
};
