import React from 'react';
import { THEMES, useTheme, Theme } from '@/hooks/useTheme';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from './button';
import { Badge } from './badge';

/**
 * 主题切换器组件
 * 仅专业/高级用户可见
 */
export const ThemeSwitcher: React.FC = () => {
  const { theme, switchTheme, themes, themeNames } = useTheme();
  const { hasRole, loading } = usePermissions();
  
  // 检查是否有专业/高级用户角色
  const isPro = hasRole('premium') || hasRole('pro') || hasRole('admin');

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">加载中...</span>
      </div>
    );
  }

  if (!isPro) {
    return (
      <Badge variant="secondary" className="ml-2">仅专业/高级用户可用</Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
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