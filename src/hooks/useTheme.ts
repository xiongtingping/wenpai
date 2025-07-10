import { useState, useEffect, useCallback } from 'react';

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'green' | 'blue' | 'gold';

/**
 * 主题配置
 */
export const THEMES: Record<Theme, string> = {
  light: '明亮',
  dark: '暗黑',
  green: '护眼绿',
  blue: '科技蓝',
  gold: '专业黑金',
};

const THEME_KEY = 'wenpai_theme';

/**
 * 主题切换hook
 * @returns 当前主题、切换方法、主题列表
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    return saved || 'light';
  });

  // 切换主题
  const switchTheme = useCallback((next: Theme) => {
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
  }, []);

  // 初始化时应用主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    theme,
    switchTheme,
    themes: Object.keys(THEMES) as Theme[],
    themeNames: THEMES,
  };
} 