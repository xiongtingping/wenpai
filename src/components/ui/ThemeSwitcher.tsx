import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

/**
 * 主题切换器组件
 */
export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const themePermission = usePermission('theme:switch');

  // 如果没有主题切换权限，不显示组件
  if (!themePermission.pass) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 p-0 transition-all duration-300 hover:scale-110 hover:bg-accent/50"
      title={`切换到${theme === 'light' ? '暗色' : '亮色'}主题`}
    >
      <div className="relative">
        {theme === 'light' ? (
          <Moon className="h-4 w-4 transition-all duration-300 hover:rotate-12" />
        ) : (
          <Sun className="h-4 w-4 transition-all duration-300 hover:rotate-12" />
        )}
      </div>
    </Button>
  );
}; 