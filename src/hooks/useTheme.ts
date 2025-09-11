import { useState, useEffect, useCallback } from 'react';
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from '@/hooks/useAuth';
import { generateStorageKey } from '@/utils/userDataIsolation';
import { userSettingsService, SETTING_KEYS } from '@/services/userSettingsService';

/**
 * 🎨 统一的多主题设计语言
 * 主题类型定义
 */
export type Theme = 'light' | 'dark' | 'beige' | 'gold' | 'rainbow';

/**
 * 🎨 主题配置 - 统一的设计语言
 */
export const THEMES: Record<Theme, { name: string; description: string; icon: string }> = {
  light: {
    name: '明亮模式',
    description: '清新明亮，适合白天使用',
    icon: '☀️'
  },
  dark: {
    name: '深色模式',
    description: '护眼深色，适合夜间使用',
    icon: '🌙'
  },
  beige: {
    name: '护眼米色',
    description: '温暖米色，长时间使用更舒适',
    icon: '🌾'
  },
  gold: {
    name: '专业金色',
    description: '奢华金色，商务专业风格',
    icon: '🏆'
  },
  rainbow: {
    name: '彩虹色',
    description: '活力彩虹，多彩渐变风格',
    icon: '🌈'
  }
};

/**
 * 主题切换hook - 支持用户ID隔离
 * @returns 当前主题、切换方法、主题列表
 */
export function useTheme() {
  const { user } = useAuth();

  // 生成用户专属的主题存储键
  const getThemeStorageKey = useCallback(() => {
    return generateStorageKey('wenpai_theme', user);
  }, [user?.id]);

  const [theme, setTheme] = useState<Theme>('beige'); // 默认使用护眼米色主题
  const [isInitialized, setIsInitialized] = useState(false);

  // 🎨 切换主题 - 增强的过渡效果，支持云端同步
  const switchTheme = useCallback(async (next: Theme) => {
    // 添加过渡类，创建平滑的主题切换效果
    document.documentElement.classList.add('theme-transitioning');

    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);

    // 保存到云端和本地
    try {
      if (user?.id) {
        // 保存到用户设置服务（云端同步）
        await userSettingsService.saveSetting(SETTING_KEYS.THEME_COLOR, next);
      }

      // 兜底：保存到本地存储
      const themeKey = getThemeStorageKey();
      localStorage.setItem(themeKey, next);
    } catch (error) {
      console.warn('保存主题设置失败:', error);
      // 兜底：保存到本地存储
      const themeKey = getThemeStorageKey();
      localStorage.setItem(themeKey, next);
    }

    // 过渡完成后移除过渡类（与CSS中的过渡时间匹配）
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  }, [getThemeStorageKey, user?.id]);

  // 初始化和监听用户变化，重新加载主题设置
  useEffect(() => {
    const loadTheme = async () => {
      try {
        let savedTheme: Theme | null = null;

        // 如果用户已登录，从云端获取
        if (user?.id) {
          userSettingsService.setUserId(user.id);
          savedTheme = await userSettingsService.getSetting(SETTING_KEYS.THEME_COLOR) as Theme;
        }

        // 兜底：从本地存储获取
        if (!savedTheme) {
          const themeKey = getThemeStorageKey();
          savedTheme = localStorage.getItem(themeKey) as Theme | null;
        }

        const newTheme = savedTheme || 'beige';

        if (newTheme !== theme || !isInitialized) {
          setTheme(newTheme);
          document.documentElement.setAttribute('data-theme', newTheme);
          setIsInitialized(true);
        }
      } catch (error) {
        console.warn('加载主题设置失败:', error);
        // 使用默认主题
        if (!isInitialized) {
          setTheme('beige');
          document.documentElement.setAttribute('data-theme', 'beige');
          setIsInitialized(true);
        }
      }
    };

    loadTheme();
  }, [user?.id, getThemeStorageKey, theme, isInitialized]);

  // 切换亮暗主题
  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    switchTheme(nextTheme);
  }, [theme, switchTheme]);

  // 初始化时应用主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    theme,
    switchTheme,
    toggleTheme,
    themes: Object.keys(THEMES) as Theme[],
    themeNames: THEMES,
  };
}
