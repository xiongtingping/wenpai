import React, { useEffect, useState } from 'react';
import { Sun, Moon, Palette, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/usePermission';
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useNavigate } from 'react-router-dom';
import { ThemeUpgradeDialog } from '@/components/ui/ThemeUpgradeDialog';
import { generateStorageKey } from '@/utils/userDataIsolation';
import { SubscriptionStateWrapper } from '@/components/ui/StateLoadingWrapper';

type Theme = 'light' | 'dark' | 'rainbow' | 'beige' | 'green';

interface ThemeConfig {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  permissionLevel: 'basic' | 'advanced' | 'premium';
  requiredPermission: string;
  description: string;
  badge?: string;
}

const themes: ThemeConfig[] = [
  {
    value: 'light',
    label: '浅色',
    icon: <Sun className="h-4 w-4 text-foreground" />,
    permissionLevel: 'basic',
    requiredPermission: 'theme:basic',
    description: '经典浅色主题，适合白天使用'
  },
  {
    value: 'dark',
    label: '深色',
    icon: <Moon className="h-4 w-4 text-foreground" />,
    permissionLevel: 'advanced',
    requiredPermission: 'theme:advanced',
    description: '护眼深色主题，适合夜间使用',
    badge: '专业版'
  },
  {
    value: 'rainbow',
    label: '彩虹色',
    icon: <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400" />,
    permissionLevel: 'premium',
    requiredPermission: 'theme:premium',
    description: '彩虹渐变主题，活力多彩风格',
    badge: '高级版'
  },
  {
    value: 'beige',
    label: '护眼米色',
    icon: <div className="w-4 h-4 rounded-full bg-amber-200 border border-amber-300" />,
    permissionLevel: 'premium',
    requiredPermission: 'theme:premium',
    description: '温暖米色主题，长时间使用更舒适',
    badge: '高级版'
  },
  {
    value: 'green',
    label: '绿色',
    icon: <div className="w-4 h-4 rounded-full bg-green-500" />,
    permissionLevel: 'premium',
    requiredPermission: 'theme:premium',
    description: '护眼绿色主题，自然清新风格',
    badge: '高级版'
  },
];

function getInitialTheme(user?: any): Theme {
  const themeKey = generateStorageKey('wenpai-theme', user);
  const stored = localStorage.getItem(themeKey) as Theme;
  
  // 如果有存储的主题且是有效主题，返回存储的主题
  if (stored && themes.some(t => t.value === stored)) {
    return stored;
  }
  
  // 🔧 修复：默认主题始终是 light，避免权限检查过早
  // 不再根据系统偏好自动设置深色主题，因为需要先进行权限检查
  return 'light';
}

export const ThemeToggle: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme(user));
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);
  const navigate = useNavigate();
  
  // 获取订阅状态以同步权限更新
  const { primaryStatus, refresh: refreshSubscription } = useSubscriptionStatus();

  // 获取权限检查结果
  const basicPermission = usePermission('theme:basic');
  const advancedPermission = usePermission('theme:advanced');
  const premiumPermission = usePermission('theme:premium');

  // 监听用户变化，重新加载主题
  useEffect(() => {
    const newTheme = getInitialTheme(user);
    if (newTheme !== theme) {
      setTheme(newTheme);
    }
  }, [user?.id]);
  
  // 监听订阅状态变化，同步权限更新
  useEffect(() => {
    if (primaryStatus?.status === 'active') {
      // 订阅状态更新时，刷新权限状态
      refreshSubscription();
    }
  }, [primaryStatus?.status, refreshSubscription]);

  // 监听订阅状态变化，重新检查主题权限
  useEffect(() => {
    if (isAuthenticated && user && primaryStatus) {
      // 当订阅状态发生变化时，重新验证当前主题权限
      const cfg = themes.find(t => t.value === theme);
      if (!cfg) return;

      const allowed = (() => {
        switch (cfg.permissionLevel) {
          case 'basic':
            return basicPermission.pass;
          case 'advanced':
            return advancedPermission.pass;
          case 'premium':
            return premiumPermission.pass;
          default:
            return false;
        }
      })();

      // 如果当前主题权限不足，回退到基础主题
      if (!allowed && theme !== 'light') {
        console.log(`🎨 订阅状态变化，主题权限不足，从 ${theme} 回退到 light`);
        setTheme('light');
        const themeKey = generateStorageKey('wenpai-theme', user);
        localStorage.setItem(themeKey, 'light');
        const html = document.documentElement;
        html.setAttribute('data-theme', 'light');
        html.classList.remove('dark');
      }
    }
  }, [primaryStatus, isAuthenticated, user, theme, basicPermission.pass, advancedPermission.pass, premiumPermission.pass]);

  // 🔧 优化权限检查逻辑，减少不必要的回退提示
  useEffect(() => {
    // 等待认证系统初始化完成
    if (!isAuthenticated && user === null) {
      // 认证状态未确定，跳过权限检查
      return;
    }
    
    const cfg = themes.find(t => t.value === theme);
    if (!cfg) return;

    // 检查权限
    const allowed = (() => {
      switch (cfg.permissionLevel) {
        case 'basic':
          return basicPermission.pass;
        case 'advanced':
          return advancedPermission.pass;
        case 'premium':
          return premiumPermission.pass;
        default:
          return false;
      }
    })();

    // 如果没有权限且当前主题不是light，则静默回退到light
    // 只有在用户主动设置了高级主题时才显示权限不足提示
    if (!allowed && theme !== 'light') {
      // 检查是否是用户主动设置的主题（而不是初始化时的默认主题）
      const themeKey = generateStorageKey('wenpai-theme', user);
      const storedTheme = localStorage.getItem(themeKey);
      
      // 只有当存储的主题与当前主题一致且用户已认证时，才说明是用户主动设置的
      if (storedTheme === theme && isAuthenticated) {
        console.log(`🎨 主题权限不足，从 ${theme} 回退到 light`);
      }
      
      setTheme('light');
      localStorage.setItem(themeKey, 'light');
      const html = document.documentElement;
      html.setAttribute('data-theme', 'light');
      html.classList.remove('dark');
    }
  }, [theme, basicPermission.pass, advancedPermission.pass, premiumPermission.pass, user, isAuthenticated]);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    // also toggle .dark class for tailwind `dark:` compatibility if any component uses it
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    const themeKey = generateStorageKey('wenpai-theme', user);
    localStorage.setItem(themeKey, theme);
  }, [theme, user]);

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  // 检查主题是否有权限
  const hasThemePermission = (themeConfig: ThemeConfig): boolean => {
    switch (themeConfig.permissionLevel) {
      case 'basic':
        return basicPermission.pass;
      case 'advanced':
        return advancedPermission.pass;
      case 'premium':
        return premiumPermission.pass;
      default:
        return false;
    }
  };

  // 处理主题切换
  const handleThemeChange = (themeConfig: ThemeConfig) => {
    if (hasThemePermission(themeConfig)) {
      setTheme(themeConfig.value);
    } else {
      // 权限不足，显示升级对话框
      setSelectedTheme(themeConfig);
      setUpgradeDialogOpen(true);
    }
  };

  // 获取当前用户等级
  const getCurrentTier = (): 'trial' | 'pro' | 'premium' => {
    if (premiumPermission.pass) return 'premium';
    if (advancedPermission.pass) return 'pro';
    return 'trial';
  };

  // 获取所需等级
  const getRequiredTier = (themeConfig: ThemeConfig): 'pro' | 'premium' => {
    return themeConfig.permissionLevel === 'premium' ? 'premium' : 'pro';
  };

  // 获取用户当前权限级别描述
  const getUserPermissionLevel = (): string => {
    if (premiumPermission.pass) return '高级版用户';
    if (advancedPermission.pass) return '专业版用户';
    if (basicPermission.pass) return '体验版用户';
    return '未登录用户';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="切换主题"
            className="h-9 w-9 p-0 rounded-full hover:bg-accent border border-border/50 bg-card/50 backdrop-blur-sm relative z-[9999]"
            title={`切换主题 - ${getUserPermissionLevel()}`}
          >
            <div className="text-foreground">
              {currentTheme.icon}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 z-[99999]">
          <div className="px-3 py-2 text-sm font-medium text-foreground">
            主题切换
          </div>
          <div className="px-3 py-1 text-xs text-muted-foreground">
            <SubscriptionStateWrapper>
              {getUserPermissionLevel()}
            </SubscriptionStateWrapper>
          </div>
          <DropdownMenuSeparator />

          {themes.map((themeOption) => {
            const hasPermission = hasThemePermission(themeOption);
            const isCurrentTheme = theme === themeOption.value;

            return (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption)}
                className={`flex items-center gap-3 px-3 py-2 ${
                  isCurrentTheme ? 'bg-accent' : ''
                } ${!hasPermission ? 'opacity-60' : ''}`}
                disabled={!hasPermission}
              >
                <div className="flex items-center gap-2 flex-1">
                  {themeOption.icon}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{themeOption.label}</span>
                      {themeOption.badge && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {themeOption.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!hasPermission && (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                  {isCurrentTheme && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate('/payment')}
            className="flex items-center gap-2 px-3 py-2 text-sm"
          >
            <Crown className="h-4 w-4 text-primary" />
            <span>解锁更多主题</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 升级引导对话框 */}
      {selectedTheme && (
        <ThemeUpgradeDialog
          open={upgradeDialogOpen}
          onOpenChange={setUpgradeDialogOpen}
          themeName={selectedTheme.label}
          requiredTier={getRequiredTier(selectedTheme)}
          currentTier={getCurrentTier()}
        />
      )}
    </>
  );
};

export default ThemeToggle;
