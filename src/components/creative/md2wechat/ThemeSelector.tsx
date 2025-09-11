/**
 * 主题选择器组件
 * 支持多种预设主题，实时预览和切换
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Check,
  Star,
  Sparkles,
  Zap,
  Mountain,
  Waves,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 主题配置接口
export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'basic' | 'business' | 'creative' | 'premium';
  icon: React.ReactNode;
  isDefault?: boolean;
  isFavorite?: boolean;
  requiresPremium?: boolean;
  preview: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

// 预设主题配置
const THEME_CONFIGS: ThemeConfig[] = [
  {
    id: 'default',
    name: 'default',
    displayName: '默认温暖风',
    description: '温馨舒适，适合日常内容分享',
    category: 'basic',
    icon: <Star className="w-4 h-4" />,
    isDefault: true,
    preview: {
      primaryColor: '#ff6b6b',
      backgroundColor: 'hsl(var(--background))',
      textColor: '#333333'
    }
  },
  {
    id: 'bytedance',
    name: 'bytedance',
    displayName: '字节范',
    description: '简洁现代，科技感强',
    category: 'business',
    icon: <Zap className="w-4 h-4" />,
    preview: {
      primaryColor: 'hsl(var(--primary))',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b'
    }
  },
  {
    id: 'apple',
    name: 'apple',
    displayName: '苹果风',
    description: '极简优雅，设计感突出',
    category: 'business',
    icon: <Mountain className="w-4 h-4" />,
    preview: {
      primaryColor: '#007aff',
      backgroundColor: 'hsl(var(--background))',
      textColor: 'hsl(var(--foreground))'
    }
  },
  {
    id: 'sports',
    name: 'sports',
    displayName: '运动风',
    description: '活力动感，适合健身运动内容',
    category: 'creative',
    icon: <Sparkles className="w-4 h-4" />,
    preview: {
      primaryColor: 'hsl(var(--warning))',
      backgroundColor: '#fef3c7',
      textColor: '#92400e'
    }
  },
  {
    id: 'chinese',
    name: 'chinese',
    displayName: '中国风',
    description: '古典雅致，传统文化韵味',
    category: 'creative',
    icon: <Waves className="w-4 h-4" />,
    requiresPremium: true,
    preview: {
      primaryColor: 'hsl(var(--destructive))',
      backgroundColor: '#fef2f2',
      textColor: '#7f1d1d'
    }
  },
  {
    id: 'cyber',
    name: 'cyber',
    displayName: '赛博朋克',
    description: '未来科幻，个性十足',
    category: 'premium',
    icon: <Cpu className="w-4 h-4" />,
    requiresPremium: true,
    preview: {
      primaryColor: '#8b5cf6',
      backgroundColor: '#1e1b4b',
      textColor: '#c4b5fd'
    }
  }
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  className?: string;
}

/**
 * 主题选择器组件
 */
export function ThemeSelector({
  selectedTheme,
  onThemeChange,
  className
}: ThemeSelectorProps) {

  // 获取当前选中的主题配置
  const currentTheme = THEME_CONFIGS.find(theme => theme.id === selectedTheme) || THEME_CONFIGS[0];

  // 按分类分组主题
  const themesByCategory = THEME_CONFIGS.reduce((acc, theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = [];
    }
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, ThemeConfig[]>);

  // 分类标签
  const categoryLabels = {
    basic: '基础主题',
    business: '商务主题',
    creative: '创意主题',
    premium: '高级主题'
  };

  // 处理主题选择
  const handleThemeSelect = (theme: ThemeConfig) => {
    if (theme.requiresPremium) {
      // TODO: 检查用户权限
      console.log('需要高级权限');
    }
    
    onThemeChange(theme.id);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">主题样式</span>
        <Badge variant="secondary" className="text-xs">
          {currentTheme.displayName}
        </Badge>
      </div>

      {/* 紧凑的主题选择器 - 单行显示 */}
      <div className="flex flex-wrap gap-2">
        {THEME_CONFIGS.map((theme) => (
          <button
            key={theme.id}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg border transition-all hover:shadow-sm relative",
              selectedTheme === theme.id
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => handleThemeSelect(theme)}
            title={theme.displayName}
          >
            {/* 主题预览图标 */}
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{
                backgroundColor: theme.preview.backgroundColor,
                color: theme.preview.primaryColor,
                border: `1px solid ${theme.preview.primaryColor}40`
              }}
            >
              {React.cloneElement(theme.icon as React.ReactElement, {
                className: "w-3 h-3"
              })}
            </div>

            {/* 选中状态指示 */}
            {selectedTheme === theme.id && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-2 h-2 text-primary-foreground" />
              </div>
            )}

            {/* 高级主题标识 */}
            {theme.requiresPremium && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                <Star className="w-2 h-2 text-background" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// 导出主题配置供其他组件使用
export { THEME_CONFIGS };