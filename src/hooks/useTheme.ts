import { useState, useEffect, useCallback } from 'react';
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from '@/hooks/useAuth';
import { generateStorageKey } from '@/utils/userDataIsolation';

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

  const [theme, setTheme] = useState<Theme>(() => {
    const themeKey = generateStorageKey('wenpai_theme', user);
    const saved = localStorage.getItem(themeKey) as Theme | null;
    return saved || 'beige'; // 默认使用护眼米色主题
  });

  // 🎨 切换主题 - 增强的过渡效果，支持用户ID隔离
  const switchTheme = useCallback((next: Theme) => {
    // 添加过渡类，创建平滑的主题切换效果
    document.documentElement.classList.add('theme-transitioning');

    setTheme(next);
    const themeKey = getThemeStorageKey();
    localStorage.setItem(themeKey, next);
    document.documentElement.setAttribute('data-theme', next);

    // 过渡完成后移除过渡类（与CSS中的过渡时间匹配）
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  }, [getThemeStorageKey]);

  // 监听用户变化，重新加载主题设置
  useEffect(() => {
    const themeKey = getThemeStorageKey();
    const saved = localStorage.getItem(themeKey) as Theme | null;
    const newTheme = saved || 'beige';

    if (newTheme !== theme) {
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  }, [user?.id, getThemeStorageKey, theme]);

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