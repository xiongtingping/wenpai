/**
 * 统一的主题权限检查Hook
 * @description 提供主题权限检查、升级提示、自动降级等功能
 */

import { useMemo, useCallback, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 主题类型定义
 */
export type Theme = 'light' | 'dark' | 'rainbow' | 'beige' | 'green';

/**
 * 主题权限级别
 */
export type ThemePermissionLevel = 'basic' | 'advanced' | 'premium';

/**
 * 主题配置映射
 */
const THEME_PERMISSION_MAP: Record<Theme, ThemePermissionLevel> = {
  light: 'basic',
  dark: 'advanced',
  rainbow: 'premium',
  beige: 'premium',
  green: 'premium',
};

/**
 * 权限级别到订阅等级的映射
 */
const PERMISSION_TO_TIER_MAP: Record<ThemePermissionLevel, SubscriptionTier> = {
  basic: 'trial',
  advanced: 'pro',
  premium: 'premium',
};

/**
 * 主题权限检查结果
 */
export interface ThemePermissionResult {
  // 权限状态
  hasPermission: boolean;
  isLoading: boolean;

  // 用户信息
  currentTier: SubscriptionTier;
  isAuthenticated: boolean;

  // 主题信息
  currentTheme: Theme;
  permissionLevel: ThemePermissionLevel;
  requiredTier: SubscriptionTier;
  needsUpgrade: boolean;

  // 操作方法
  checkTheme: (theme: Theme) => boolean;
  requestUpgrade: (theme: Theme) => void;
  getSafeTheme: (theme: Theme) => Theme;
  getAvailableThemes: () => Theme[];
}

/**
 * 使用主题权限检查Hook
 * @param theme 当前主题
 * @returns 权限检查结果和操作方法
 */
export function useThemePermission(theme: Theme = 'light'): ThemePermissionResult {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 获取主题权限
  const basicPermission = usePermission('theme:basic');
  const advancedPermission = usePermission('theme:advanced');
  const premiumPermission = usePermission('theme:premium');

  // 判断权限系统是否加载完成
  const isLoading = !basicPermission || !advancedPermission || !premiumPermission;

  // 获取当前用户订阅层级
  const currentTier = useMemo((): SubscriptionTier => {
    if (isLoading) return 'trial';
    if (premiumPermission.pass) return 'premium';
    if (advancedPermission.pass) return 'pro';
    return 'trial';
  }, [isLoading, premiumPermission.pass, advancedPermission.pass]);

  // 获取当前主题的权限级别
  const permissionLevel = useMemo(() => {
    return THEME_PERMISSION_MAP[theme] || 'basic';
  }, [theme]);

  // 获取所需的订阅等级
  const requiredTier = useMemo(() => {
    return PERMISSION_TO_TIER_MAP[permissionLevel];
  }, [permissionLevel]);

  // 检查是否有当前主题的权限
  const hasPermission = useMemo(() => {
    if (isLoading) return theme === 'light'; // 加载中只允许light主题

    switch (permissionLevel) {
      case 'basic':
        return basicPermission.pass;
      case 'advanced':
        return advancedPermission.pass;
      case 'premium':
        return premiumPermission.pass;
      default:
        return false;
    }
  }, [theme, permissionLevel, isLoading, basicPermission.pass, advancedPermission.pass, premiumPermission.pass]);

  // 检查是否需要升级
  const needsUpgrade = useMemo(() => {
    const tierOrder = { 'free': 0, 'trial': 1, 'pro': 2, 'premium': 3 };
    return tierOrder[currentTier] < tierOrder[requiredTier];
  }, [currentTier, requiredTier]);

  // 检查指定主题的权限
  const checkTheme = useCallback((checkTheme: Theme): boolean => {
    if (isLoading) return checkTheme === 'light';

    const level = THEME_PERMISSION_MAP[checkTheme] || 'basic';
    switch (level) {
      case 'basic':
        return basicPermission.pass;
      case 'advanced':
        return advancedPermission.pass;
      case 'premium':
        return premiumPermission.pass;
      default:
        return false;
    }
  }, [isLoading, basicPermission.pass, advancedPermission.pass, premiumPermission.pass]);

  // 请求升级(显示升级提示)
  const requestUpgrade = useCallback((upgradeTheme: Theme) => {
    const level = THEME_PERMISSION_MAP[upgradeTheme] || 'basic';
    const tier = PERMISSION_TO_TIER_MAP[level];

    const tierNames = {
      'free': '体验版',
      'trial': '体验版',
      'pro': '专业版',
      'premium': '高级版'
    };

    const themeNames: Record<Theme, string> = {
      light: '浅色主题',
      dark: '深色主题',
      rainbow: '彩虹主题',
      beige: '护眼米色主题',
      green: '绿色主题',
    };

    toast({
      title: `🔒 需要 ${tierNames[tier]} 权限`,
      description: `${themeNames[upgradeTheme]} 需要 ${tierNames[tier]} 订阅才能使用。${tier !== 'trial' ? '点击查看升级选项。' : ''}`,
      duration: 6000,
    });

    // 如果需要升级,延迟导航到支付中心
    if (tier !== 'trial') {
      setTimeout(() => {
        navigate('/payment-center');
      }, 1500);
    }
  }, [navigate, toast]);

  // 获取安全的主题(如果当前主题无权限,返回降级后的主题)
  const getSafeTheme = useCallback((targetTheme: Theme): Theme => {
    if (checkTheme(targetTheme)) {
      return targetTheme;
    }

    // 降级策略: premium -> advanced -> basic
    if (premiumPermission.pass) {
      // 优先返回premium主题
      const premiumThemes: Theme[] = ['rainbow', 'beige', 'green'];
      if (premiumThemes.includes(targetTheme)) return targetTheme;
    }

    if (advancedPermission.pass) {
      // 返回advanced主题
      return 'dark';
    }

    // 默认返回basic主题
    return 'light';
  }, [checkTheme, premiumPermission.pass, advancedPermission.pass]);

  // 获取当前用户可用的所有主题
  const getAvailableThemes = useCallback((): Theme[] => {
    const themes: Theme[] = ['light']; // 基础主题总是可用

    if (advancedPermission.pass) {
      themes.push('dark');
    }

    if (premiumPermission.pass) {
      themes.push('rainbow', 'beige', 'green');
    }

    return themes;
  }, [advancedPermission.pass, premiumPermission.pass]);

  return {
    // 权限状态
    hasPermission,
    isLoading,

    // 用户信息
    currentTier,
    isAuthenticated,

    // 主题信息
    currentTheme: theme,
    permissionLevel,
    requiredTier,
    needsUpgrade,

    // 操作方法
    checkTheme,
    requestUpgrade,
    getSafeTheme,
    getAvailableThemes,
  };
}

/**
 * 使用主题自动降级Hook
 * @description 自动检测主题权限,如果无权限则降级到安全主题
 * @param theme 当前主题
 * @param onThemeChange 主题变更回调
 */
export function useThemeAutoFallback(
  theme: Theme,
  onThemeChange: (theme: Theme) => void
) {
  const { hasPermission, isLoading, getSafeTheme } = useThemePermission(theme);

  useEffect(() => {
    // 权限系统加载完成后执行检查
    if (!isLoading && !hasPermission) {
      const safeTheme = getSafeTheme(theme);
      if (safeTheme !== theme) {
        console.log(`🎨 主题权限不足,自动从 ${theme} 降级到 ${safeTheme}`);
        onThemeChange(safeTheme);
      }
    }
  }, [theme, hasPermission, isLoading, getSafeTheme, onThemeChange]);

  return {
    hasPermission,
    isLoading,
  };
}
