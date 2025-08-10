import React, { useEffect, useState } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const THEME_KEY = 'wenpai-theme';

type Theme = 'light' | 'dark' | 'hsl(var(--primary))' | 'beige' | 'hsl(var(--success))';

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: '浅色', icon: <Sun className="h-4 w-4 text-foreground" /> },
  { value: 'dark', label: '深色', icon: <Moon className="h-4 w-4 text-foreground" /> },
  { value: 'hsl(var(--primary))', label: '蓝色', icon: <div className="w-4 h-4 rounded-full bg-primary" /> },
  { value: 'beige', label: '护眼米色', icon: <div className="w-4 h-4 rounded-full bg-accent border border-border" /> },
  { value: 'hsl(var(--success))', label: '绿色', icon: <div className="w-4 h-4 rounded-full bg-green-500" /> },
];

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme;
  if (stored && themes.some(t => t.value === stored)) return stored;
  // fallback: prefers-color-scheme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    // also toggle .dark class for tailwind `dark:` compatibility if any component uses it
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="切换主题"
          className="h-9 w-9 p-0 rounded-full hover:bg-accent border border-border/50 bg-card/50 backdrop-blur-sm"
          title="切换主题"
        >
          <div className="text-foreground">
            {currentTheme.icon}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`flex items-center gap-2 ${
              theme === themeOption.value ? 'bg-accent' : ''
            }`}
          >
            {themeOption.icon}
            <span>{themeOption.label}</span>
            {theme === themeOption.value && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;

