/**
 * 🎨 主题上下文
 * 
 * 功能：
 * - 主题切换管理
 * - 系统主题检测
 * - 主题持久化
 * - 主题相关工具函数
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 获取系统主题
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 从localStorage获取保存的主题
 */
function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem('theme') as Theme;
    return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

/**
 * 保存主题到localStorage
 */
function saveTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // 忽略存储错误
  }
}

/**
 * 应用主题到DOM
 */
function applyTheme(actualTheme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(actualTheme);
  
  // 设置CSS变量
  if (actualTheme === 'dark') {
    root.style.colorScheme = 'dark';
  } else {
    root.style.colorScheme = 'light';
  }
}

/**
 * 主题提供者组件
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // 初始化主题
  useEffect(() => {
    const savedTheme = getSavedTheme();
    setThemeState(savedTheme);
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = getSystemTheme();
        setActualTheme(systemTheme);
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 计算实际主题
  useEffect(() => {
    let newActualTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      newActualTheme = getSystemTheme();
    } else {
      newActualTheme = theme;
    }
    
    setActualTheme(newActualTheme);
    applyTheme(newActualTheme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 使用主题Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * 主题工具函数
 */
export const themeUtils = {
  /**
   * 获取当前系统主题
   */
  getSystemTheme,
  
  /**
   * 检查是否为暗色主题
   */
  isDark: (theme: Theme): boolean => {
    if (theme === 'system') {
      return getSystemTheme() === 'dark';
    }
    return theme === 'dark';
  },
  
  /**
   * 获取主题显示名称
   */
  getThemeDisplayName: (theme: Theme): string => {
    const names = {
      light: '浅色',
      dark: '深色',
      system: '跟随系统'
    };
    return names[theme];
  },
  
  /**
   * 获取主题图标
   */
  getThemeIcon: (theme: Theme): string => {
    const icons = {
      light: '☀️',
      dark: '🌙',
      system: '💻'
    };
    return icons[theme];
  }
};

export default ThemeProvider;
