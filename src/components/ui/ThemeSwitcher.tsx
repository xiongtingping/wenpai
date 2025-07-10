import React from 'react';
import { THEMES, useTheme, Theme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './button';
import { Badge } from './badge';

/**
 * 主题切换器组件
 * 仅专业/高级用户可见
 */
export const ThemeSwitcher: React.FC = () => {
  const { theme, switchTheme, themes, themeNames } = useTheme();
  const { user } = useAuth();
  const plan = (user as any)?.plan;
  const isPro = plan === 'pro' || plan === 'premium' || (user as any)?.isProUser;

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
          className={theme === t ? 'font-bold' : ''}
        >
          {themeNames[t]}
        </Button>
      ))}
    </div>
  );
}; 