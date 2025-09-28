import { useState, useEffect, useCallback } from 'react';
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from '@/hooks/useAuth';
import { generateStorageKey } from '@/utils/userDataIsolation';
import { userSettingsService, SETTING_KEYS } from '@/services/userSettingsService';

/**
 * 🎨 统一的多主题设计语言 
 * 主题类型定义 - 与ThemeToggle保持一致
 */
export type Theme = 'light' | 'dark' | 'rainbow' | 'beige' | 'green';

/**
 * 🎨 主题配置 - 统一的设计语言，与ThemeToggle保持一致
 */
export const THEMES: Record<Theme, { name: string; description: string; icon: string }> = {
  light: {
    name: '浅色',
    description: '清新明亮，适合白天使用',
    icon: '☀️'
  },
  dark: {
    name: '深色',
    description: '护眼深色，适合夜间使用',
    icon: '🌙'
  },
  rainbow: {
    name: '彩虹色',
    description: '活力彩虹，多彩渐变风格',
    icon: '🌈'
  },
  beige: {
    name: '护眼米色',
    description: '温暖米色，长时间使用更舒适',
    icon: '🌾'
  },
  green: {
    name: '绿色',
    description: '护眼绿色，自然清新风格',
    icon: '🌿'
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

  const [theme, setTheme] = useState<Theme>('light'); // 🔧 FIX: 默认主题改为light，与ThemeToggle一致
  const [isInitialized, setIsInitialized] = useState(false);

  // 🎨 切换主题 - 与ThemeToggle保持一致的存储方式
  const switchTheme = useCallback(async (next: Theme) => {
    // 添加过渡类，创建平滑的主题切换效果
    document.documentElement.classList.add('theme-transitioning');

    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);

    // 🔧 FIX: 与ThemeToggle保持一致的主题应用
    const html = document.documentElement;
    html.classList.remove('light', 'dark', 'rainbow', 'beige', 'green');
    html.classList.add(next);
    
    // Tailwind dark类兼容性
    if (next === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // 🔧 FIX: 与ThemeToggle保持一致的存储方式
    try {
      // 保存到ThemeToggle使用的标准位置
      localStorage.setItem('theme', next);
      
      // 保存到用户特定位置
      const themeKey = getThemeStorageKey();
      localStorage.setItem(themeKey, next);
      
      // 如果用户已登录，也保存到云端
      if (user?.id) {
        await userSettingsService.saveSetting(SETTING_KEYS.THEME_COLOR, next);
      }
      
      console.log(`🎨 useTheme切换主题: ${next}`);
    } catch (error) {
      console.warn('保存主题设置失败:', error);
    }

    // 过渡完成后移除过渡类
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  }, [getThemeStorageKey, user?.id]);

  // 🔧 FIX: 初始化时从ThemeToggle相同位置读取主题
  useEffect(() => {
    const loadTheme = async () => {
      try {
        let savedTheme: Theme | null = null;

        // 🔧 FIX: 优先从ThemeToggle使用的标准位置读取
        savedTheme = localStorage.getItem('theme') as Theme | null;
        
        // 兜底1：从用户特定位置获取
        if (!savedTheme) {
          const themeKey = getThemeStorageKey();
          savedTheme = localStorage.getItem(themeKey) as Theme | null;
        }

        // 兜底2：如果用户已登录，从云端获取
        if (!savedTheme && user?.id) {
          userSettingsService.setUserId(user.id);
          savedTheme = await userSettingsService.getSetting(SETTING_KEYS.THEME_COLOR) as Theme;
        }

        const validThemes = ['light', 'dark', 'rainbow', 'beige', 'green'];
        const newTheme = (savedTheme && validThemes.includes(savedTheme)) ? savedTheme : 'light';

        if (newTheme !== theme || !isInitialized) {
          setTheme(newTheme);
          
          // 🔧 FIX: 应用主题时与ThemeToggle保持一致
          const html = document.documentElement;
          html.setAttribute('data-theme', newTheme);
          html.classList.remove('light', 'dark', 'rainbow', 'beige', 'green');
          html.classList.add(newTheme);
          
          // Tailwind dark类兼容性
          if (newTheme === 'dark') {
            html.classList.add('dark');
          } else {
            html.classList.remove('dark');
          }
          
          setIsInitialized(true);
          // console.log(`🎨 useTheme加载主题: ${newTheme}`);
        }
      } catch (error) {
        console.warn('加载主题设置失败:', error);
        // 使用默认主题
        if (!isInitialized) {
          setTheme('light');
          document.documentElement.setAttribute('data-theme', 'light');
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
