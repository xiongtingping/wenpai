import React from 'react';
import { THEMES, useTheme, Theme } from '@/hooks/useTheme';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from './button';
import { Badge } from './badge';

/**
 * 检查是否为开发环境
 */
const isDevelopment = () => {
  return import.meta.env.DEV || process.env.NODE_ENV === 'development';
};

/**
 * 主题切换器组件
 * 仅专业/高级用户可见
 */
export const ThemeSwitcher: React.FC = () => {
  const { theme, switchTheme, themes, themeNames } = useTheme();
  const { hasRole, loading } = usePermissions();
  
  // 开发环境下跳过权限检查
  const isPro = isDevelopment() || hasRole('premium') || hasRole('pro') || hasRole('admin');

  if (loading && !isDevelopment()) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">加载中...</span>
      </div>
    );
  }

  if (!isPro && !isDevelopment()) {
    return (
      <Badge variant="secondary" className="ml-2">仅专业/高级用户可用</Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isDevelopment() && (
        <Badge variant="premium" className="text-xs">
          DEV
        </Badge>
      )}
      {themes.map((t) => (
        <Button
          key={t}
          size="sm"
          variant={theme === t ? 'default' : 'outline'}
          onClick={() => switchTheme(t)}
          className="min-w-[60px]"
        >
          {themeNames[t]}
        </Button>
      ))}
    </div>
  );
}; 