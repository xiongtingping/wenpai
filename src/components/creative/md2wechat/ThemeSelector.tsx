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
  Cpu,
  Lock,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
    category: 'creative',
    icon: <Cpu className="w-4 h-4" />,
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
  const navigate = useNavigate();
  const { toast } = useToast();

  // 权限检查
  const basicPermission = usePermission('theme:basic');
  const advancedPermission = usePermission('theme:advanced');
  const premiumPermission = usePermission('theme:premium');

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

  // 检查主题权限
  const hasThemePermission = (theme: ThemeConfig): boolean => {
    if (!theme.requiresPremium) {
      return basicPermission.pass; // 基础主题只需要基础权限
    }

    // 高级主题需要Premium权限
    return premiumPermission.pass;
  };

  // 处理主题选择
  const handleThemeSelect = (theme: ThemeConfig) => {
    const hasPermission = hasThemePermission(theme);

    if (!hasPermission) {
      // 权限不足,显示提示并引导升级
      toast({
        title: '🔒 需要升级权限',
        description: theme.requiresPremium
          ? `"${theme.displayName}" 主题需要高级版权限才能使用`
          : `"${theme.displayName}" 主题需要登录后才能使用`,
        action: theme.requiresPremium ? (
          <div
            className="flex items-center gap-1 cursor-pointer text-primary hover:underline"
            onClick={() => navigate('/payment-center')}
          >
            <Crown className="h-4 w-4" />
            <span>立即升级</span>
          </div>
        ) : undefined,
        duration: 5000,
      });
      return;
    }

    // 权限通过,切换主题
    onThemeChange(theme.id);
  };

  return (
    <div className={cn('space-y-2', className)} style={{display: 'block'}}>
      <div className="flex items-center gap-2 mb-2">
        <Palette className="w-3.5 h-3.5" />
        <span className="text-sm font-medium">主题样式</span>
        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
          {currentTheme.displayName}
        </Badge>
      </div>

      {/* 紧凑的主题选择器 - 强制水平单行显示 */}
      <div 
        className="flex flex-wrap gap-1.5" 
        style={{
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center'
        }}
      >
        {THEME_CONFIGS.map((theme) => {
          const hasPermission = hasThemePermission(theme);
          const isSelected = selectedTheme === theme.id;

          return (
          <button
            key={theme.id}
            className={cn(
              "flex items-center justify-center rounded-full border transition-all duration-200 relative overflow-hidden",
              isSelected
                ? "border-primary/60 bg-primary/10 shadow-lg ring-1 ring-primary/30"
                : hasPermission
                ? "border-border/30 hover:border-primary/50 bg-background/80 hover:bg-primary/5 shadow-sm hover:shadow-md hover:scale-110"
                : "border-border/20 bg-muted/50 opacity-60 cursor-not-allowed"
            )}
            style={{
              width: '36px',
              height: '36px',
              minWidth: '36px',
              minHeight: '36px',
              maxWidth: '36px',
              maxHeight: '36px',
              margin: '2px',
              aspectRatio: '1/1'
            }}
            onClick={() => handleThemeSelect(theme)}
            title={theme.displayName}
          >
            {/* 主题预览图标 */}
            <div
              className="w-full h-full rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: theme.preview.primaryColor + '20',
                color: theme.preview.primaryColor,
                border: selectedTheme === theme.id ? `1px solid ${theme.preview.primaryColor}60` : `1px solid ${theme.preview.primaryColor}20`,
                aspectRatio: '1/1',
                width: '32px',
                height: '32px',
                margin: '2px'
              }}
            >
              {React.cloneElement(theme.icon as React.ReactElement, {
                className: "w-4 h-4",
                style: { color: theme.preview.primaryColor }
              })}
            </div>

            {/* 选中状态指示 */}
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center shadow-md ring-1 ring-background">
                <Check className="w-2 h-2 text-primary-foreground" />
              </div>
            )}

            {/* 权限锁定/高级主题标识 */}
            {!hasPermission && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-gray-500 rounded-full flex items-center justify-center shadow-md ring-1 ring-background">
                <Lock className="w-2 h-2 text-white" />
              </div>
            )}
            {hasPermission && theme.requiresPremium && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center shadow-md ring-1 ring-background">
                <Star className="w-2 h-2 text-white" />
              </div>
            )}
          </button>
          );
        })}
      </div>
    </div>
  );
}

// 导出主题配置供其他组件使用
export { THEME_CONFIGS };