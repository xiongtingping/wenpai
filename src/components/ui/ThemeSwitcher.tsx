import React, { useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { useTheme, THEMES, Theme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * 🎨 增强的多主题切换器组件
 * 支持所有主题的切换，具有专业的视觉体验
 */
export const ThemeSwitcher: React.FC = () => {
  const { theme, switchTheme } = useTheme();
  const themePermission = usePermission('theme:switch');
  const [isOpen, setIsOpen] = useState(false);

  // 如果没有主题切换权限，不显示组件
  if (!themePermission.pass) {
    return null;
  }

  // 获取当前主题的图标
  const getCurrentThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'beige':
        return <span className="text-sm">🌾</span>;
      case 'gold':
        return <span className="text-sm">🏆</span>;
      case 'rainbow':
        return <span className="text-sm">🌈</span>;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    switchTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 transition-all duration-300 hover:scale-110 hover:bg-accent/50"
          title={`当前主题：${THEMES[theme].name}`}
        >
          <div className="relative transition-all duration-300 hover:rotate-12">
            {getCurrentThemeIcon()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 enhanced-card">
        <div className="p-2">
          <div className="text-sm font-medium text-foreground mb-2">选择主题</div>
          {Object.entries(THEMES).map(([themeKey, themeConfig]) => (
            <DropdownMenuItem
              key={themeKey}
              onClick={() => handleThemeChange(themeKey as Theme)}
              className="flex items-center gap-3 p-2 cursor-pointer transition-all duration-200 hover:bg-accent/50"
            >
              <span className="text-lg">{themeConfig.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{themeConfig.name}</div>
                <div className="text-xs text-muted-foreground">{themeConfig.description}</div>
              </div>
              {theme === themeKey && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};