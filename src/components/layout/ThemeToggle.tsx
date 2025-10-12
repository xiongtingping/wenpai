import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Palette, Lock, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

const createThemes = (t: (key: string) => string): ThemeConfig[] => [
  {
    value: 'light',
    label: t('components.labels.text_javh'),
    icon: <Sun className="h-4 w-4 text-foreground" />,
    permissionLevel: 'basic',
    requiredPermission: 'theme:basic',
    description: t('theme.descriptions.light', { defaultValue: '经典浅色主题，适合白天使用' })
  },
  {
    value: 'dark',
    label: t('components.labels.text_jezl'),
    icon: <Moon className="h-4 w-4 text-foreground" />,
    permissionLevel: 'advanced',
    requiredPermission: 'theme:advanced',
    description: t('theme.descriptions.dark', { defaultValue: '护眼深色主题，适合夜间使用' }),
    badge: t('subscription.tiers.pro')
  },
  {
    value: 'rainbow',
    label: t('components.labels.text_emon6'),
    icon: (
      <div
        className="w-4 h-4 rounded-full"
        style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))' }}
      />
    ),
    permissionLevel: 'premium',
    requiredPermission: 'theme:premium',
    description: t('theme.descriptions.rainbow', { defaultValue: '彩虹渐变主题，活力多彩风格' }),
    badge: t('subscription.tiers.premium')
  },
  {
    value: 'beige',
    label: t('components.labels.text_cxymif'),
    icon: (
      <div
        className="w-4 h-4 rounded-full border"
        style={{ backgroundColor: 'hsl(var(--warning-bg))', borderColor: 'hsl(var(--warning))' }}
      />
    ),
    permissionLevel: 'premium',
    requiredPermission: 'theme:premium',
    description: t('theme.descriptions.beige', { defaultValue: '温暖米色主题，长时间使用更舒适' }),
    badge: t('subscription.tiers.premium')
  },
  {
    value: 'green',
    label: t('components.labels.text_mbf7'),
    icon: (
      <div
        className="w-4 h-4 rounded-full border"
        style={{ backgroundColor: 'hsl(var(--success))', borderColor: 'hsl(var(--success))' }}
      />
    ),
    permissionLevel: 'premium',
    requiredPermission: 'theme:premium',
    description: t('theme.descriptions.green', { defaultValue: '护眼绿色主题，自然清新风格' }),
    badge: t('subscription.tiers.premium')
  },
];

function getInitialTheme(user?: any): Theme { 
  const themeKey = generateStorageKey('wenpai-theme', user);
  const userStoredTheme = localStorage.getItem(themeKey) as Theme;
  const globalStoredTheme = localStorage.getItem('theme') as Theme;
  
  // 有效的主题值
  const validThemes = ['light', 'dark', 'rainbow', 'beige', 'green'];
  
  // 🔧 FIX: 优先使用用户特定的主题，然后是全局主题
  const stored = userStoredTheme || globalStoredTheme;
  
  // 如果有存储的主题且是有效主题，返回存储的主题
  if (stored && validThemes.includes(stored)) {
    return stored;
  }
  
  // 🔧 修复：默认主题始终是 light，避免权限检查过早
  return 'light';
}

export const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const themes = createThemes(t);
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme(user));
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // 获取订阅状态以同步权限更新
  const { primaryStatus, refresh: refreshSubscription } = useSubscriptionStatus();

  // 获取权限检查结果
  const basicPermission = usePermission('theme:basic');
  const advancedPermission = usePermission('theme:advanced');
  const premiumPermission = usePermission('theme:premium');

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 监听用户变化，重新加载主题
  useEffect(() => {
    const newTheme = getInitialTheme(user);
    if (newTheme !== theme) {
      setTheme(newTheme);
    }
  }, [user?.id]);
  
  // 监听订阅状态变化，同步权限更新
  // 🔧 FIX: 移除refreshSubscription依赖，避免无限循环
  // primaryStatus变化时已经由store自动更新，无需手动刷新
  useEffect(() => {
    // primaryStatus更新时，主题权限会自动重新计算
    // 这里只需要确保theme配置正确即可
    if (primaryStatus?.status === 'active' && isAuthenticated) {
      // 订阅激活时，检查主题权限（下面的useEffect会处理）
    }
  }, [primaryStatus?.status, isAuthenticated]);

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
        setTheme('light');
        const themeKey = generateStorageKey('wenpai-theme', user);
        localStorage.setItem(themeKey, 'light');
        const html = document.documentElement;
        html.setAttribute('data-theme', 'light');
        html.classList.remove('dark');
      }
    }
  }, [primaryStatus, isAuthenticated, user, theme, basicPermission.pass, advancedPermission.pass, premiumPermission.pass]);

  // 🔧 权限验证：静默且快速地检查权限，避免闪烁
  useEffect(() => {
    // 只在权限系统加载完成后执行一次验证
    const isPermissionReady = basicPermission && advancedPermission && premiumPermission;

    if (!isPermissionReady) {
      return; // 等待权限系统初始化
    }

    const cfg = themes.find(t => t.value === theme);
    if (!cfg) return;

    // 检查当前主题的权限
    const hasPermission = (() => {
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

    // 如果没有权限且当前主题不是 light，立即静默回退
    if (!hasPermission && theme !== 'light') {

      // 立即更新状态和 DOM，避免延迟
      setTheme('light');

      const themeKey = generateStorageKey('wenpai-theme', user);
      localStorage.setItem(themeKey, 'light');
      localStorage.setItem('theme', 'light');

      const html = document.documentElement;
      html.setAttribute('data-theme', 'light');
      html.classList.remove('dark', 'rainbow', 'beige', 'green');
      html.classList.add('light');
    }
  }, [theme, basicPermission.pass, advancedPermission.pass, premiumPermission.pass, user]);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    
    // 🔧 FIX: 统一主题类管理，确保持久化
    html.classList.remove('light', 'dark', 'rainbow', 'beige', 'green');
    html.classList.add(theme);
    
    // Tailwind兼容性：dark类单独处理
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // 🔧 FIX: 同时保存到两个位置确保持久化
    const themeKey = generateStorageKey('wenpai-theme', user);
    localStorage.setItem(themeKey, theme);
    // 也保存到标准key，确保兼容性
    localStorage.setItem('theme', theme);
    
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
      setIsOpen(false);
    } else {
      // 权限不足，显示升级对话框
      setSelectedTheme(themeConfig);
      setUpgradeDialogOpen(true);
      setIsOpen(false);
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
    if (premiumPermission.pass) return t('subscription.userLevels.premium');
    if (advancedPermission.pass) return t('subscription.userLevels.pro');
    if (basicPermission.pass) return t('subscription.userLevels.trial');
    return t('subscription.userLevels.guest');
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          className="header-button"
          aria-label={`${t('settings.darkMode')} - ${getUserPermissionLevel()}`}
          title={`${t('theme.switchTheme')} - ${getUserPermissionLevel()}`}
          onClick={() => {
            setIsOpen(!isOpen);

            // 确保根元素可交互
            const root = document.getElementById('root');
            if (root && root.hasAttribute('aria-hidden')) {
              root.removeAttribute('aria-hidden');
            }
          }}
          type="button"
          aria-expanded={isOpen}
          data-testid="native-theme-toggle-trigger"
        >
          <div className="text-foreground">
            {currentTheme.icon}
          </div>
        </button>

        {isOpen && (
          <div
            className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-[1002]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题 */}
            <div className="px-3 py-2 text-sm font-medium text-foreground">
              {t('theme.settings', { defaultValue: '\u4e3b\u9898\u8bbe\u7f6e' })}
            </div>
            <div className="px-3 py-1 text-xs text-muted-foreground">
              <SubscriptionStateWrapper>
                {getUserPermissionLevel()}
              </SubscriptionStateWrapper>
            </div>
            
            {/* 分隔线 */}
            <div className="my-1 border-t border-border"></div>

            {/* 主题选项 */}
            {themes.map((themeOption) => {
              const hasPermission = hasThemePermission(themeOption);
              const isCurrentTheme = theme === themeOption.value;

              return (
                <button
                  key={themeOption.value}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent ${
                    isCurrentTheme ? 'bg-accent' : ''
                  } ${!hasPermission ? 'opacity-60' : ''}`}
                  onClick={() => handleThemeChange(themeOption)}
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
                </button>
              );
            })}

            {/* 分隔线 */}
            <div className="my-1 border-t border-border"></div>
            
            {/* 升级按钮 */}
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent"
              onClick={() => {
                setIsOpen(false);
                navigate('/payment-center');
              }}
            >
              <Crown className="h-4 w-4 text-primary" />
              <span>{t('theme.unlockMore', { defaultValue: '\u89e3\u9501\u66f4\u591a\u4e3b\u9898\u548c\u529f\u80fd' })}</span>
            </button>
          </div>
        )}
      </div>

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
