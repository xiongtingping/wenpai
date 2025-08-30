/**
 * 顶部导航栏组件
 * 全站通用的Logo、功能导航和用户功能导航
 * 优化版：桌面端16px字体，移动端14px，增强交互反馈
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BackToTop } from '@/components/ui/BackToTop';
// 🔒 [AUTHING_GUARD_NAVIGATION_v2025.08.14]
// 统一使用@authing/guard架构，禁止引入@authing/web
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { isDevelopment } from '@/utils/env-validator';
import { UserAvatar } from '@/components/auth/UserAvatar';
import {
  Home,
  FileText,
  Sparkles,
  TrendingUp,
  FolderOpen,
  Users,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Crown,
  Star,
  Zap,
  Shield,
  Gift,
  ChevronDown
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LogoWithText } from '@/components/ui/ThemeAwareLogo';

/**
 * 顶部导航栏组件
 */
export const TopNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const vipPermission = usePermission('vip:required');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);

  // 判断是否为首页
  const isHomePage = location.pathname === '/';

  /**
   * 检查是否应该显示升级按钮
   * 只有高级版用户（且在有效期内）不显示，其他用户都显示
   */
  const shouldShowUpgradeButton = () => {
    // 未登录用户显示
    if (!user || typeof user !== 'object') return true;

    const userObj = user as Record<string, unknown>;

    // 检查是否是高级版用户
    const isPremiumUser = userObj.tier === 'premium' ||
                         userObj.plan === 'premium' ||
                         userObj.subscriptionTier === 'premium' ||
                         userObj.userPlan === 'premium';

    // 如果是高级版用户，检查是否在有效期内
    if (isPremiumUser) {
      const subscriptionEndDate = userObj.subscriptionEndDate || userObj.endDate || userObj.expireDate;

      if (subscriptionEndDate) {
        const endDate = new Date(subscriptionEndDate as string);
        const now = new Date();

        // 如果在有效期内，不显示升级按钮
        if (endDate > now) {
          return false;
        }
      }
    }

    // 其他情况都显示升级按钮：
    // - 未登录用户
    // - 体验版用户 (trial)
    // - 专业版用户 (pro)
    // - 高级版用户但已过期
    return true;
  };

  // 功能导航菜单项
  const navItems = [
    { path: '/', label: '首页', icon: Home, requiresAuth: false },
    { path: '/adapt', label: 'AI内容适配器', icon: FileText, requiresAuth: true },
    { path: '/hot-topics', label: '全网雷达', icon: TrendingUp, requiresAuth: true },
    { path: '/creative-studio', label: '创意魔方', icon: Sparkles, requiresAuth: true },
    { path: '/library', label: '我的资料库', icon: FolderOpen, requiresAuth: true },
    { path: '/brand-library', label: '品牌库', icon: Users, requiresAuth: true },
  ];

  // 开发环境下跳过权限检查
  const isPro = isDevelopment();

  /**
   * 检查当前路径是否激活
   */
  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  /**
   * 处理导航点击
   */
  const handleNavigation = (item: typeof navItems[0]) => {
    // 无认证软模式：不再拦截，直接导航
    navigate(item.path);
  };

  /**
   * 移动端导航项组件
   */
  const MobileNavItem = ({ item }: { item: typeof navItems[0] }) => (
    <button
      onClick={() => {
        handleNavigation(item);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 w-full text-left ${
        isActivePath(item.path)
          ? 'btn-gradient-primary text-primary-foreground shadow-lg'
          : 'text-primary hover:text-accent hover:bg-accent/50'
      }`}
    >
      <item.icon className="w-5 h-5 text-current" />
      <span>{item.label}</span>
    </button>
  );

  // 动态设置头部高度变量，保证不同屏幕与密度都准确
  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const update = () => {
      const h = headerRef.current?.offsetHeight || 64;
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-[99999] w-full border-b shadow-sm theme-header-bg backdrop-blur-md border-border/20">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
          {/* 左侧Logo - 固定宽度 */}
          <div className="flex items-center w-48">
            <Link to="/" className="group">
              <div className="flex items-center space-x-3">
                <LogoWithText
                  size="md"
                  textSize="lg"
                  showHoverEffect={true}
                  showBackground={true}
                />
              </div>
            </Link>
          </div>

          {/* 中间导航菜单 - 绝对居中 */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="hidden lg:flex items-center">
              <NavBar
                positionClassName="relative"
                items={navItems.map(item => ({
                  name: item.label,
                  url: item.path,
                  icon: item.icon,
                  onClick: (e) => { e.preventDefault(); handleNavigation(item); }
                }))}
              />
            </div>
          </div>

            {/* 平板端下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden hover:bg-accent/50">
                  <Menu className="w-4 h-4 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <button
                      onClick={() => handleNavigation(item)}
                      className={`flex items-center space-x-2 text-sm font-medium w-full text-left ${
                        isActivePath(item.path) ? 'bg-accent text-accent-foreground' : 'text-primary'
                      }`}
                    >
                      <item.icon className="w-4 h-4 text-current" />
                      <span>{item.label}</span>
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 右侧用户区域 - 固定宽度平衡布局 */}
          <div className="flex items-center gap-2 w-48 justify-end">
            {/* 用户状态指示 */}
            {permissionLoading && !isDevelopment() && (
              <div className="hidden sm:flex items-center gap-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-xs text-secondary">权限加载中...</span>
              </div>
            )}

            {/* 用户头像和登录状态 */}
            <div className="flex items-center gap-2">
              {/* 立即解锁高级功能按钮 - 只对非高级版用户显示 */}
              {isAuthenticated && shouldShowUpgradeButton() && (
                <Button
                  onClick={() => navigate('/payment')}
                  className="btn-upgrade-gradient text-primary-foreground font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hidden sm:flex"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  立即解锁高级功能
                </Button>
              )}


              {/* 主题切换 */}
              <ThemeToggle />

              {/* 专业用户标识 */}
              {isAuthenticated && isPro && (
                <Badge variant="premium" className="text-xs hidden sm:inline-flex bg-primary text-primary-foreground border-0">
                  PRO
                </Badge>
              )}

              {/* ✅ FIXED: 用户头像组件 - 包含完整的下拉菜单功能 */}
              {/* 📌 修复问题：AI内容适配器等页面无法点击右上角个人中心 */}
              {/* 🔓 UNLOCKED: 已将静态Avatar替换为功能完整的UserAvatar组件，请勿改动 */}
              <UserAvatar
                showUsername={false}
                size="md"
                className="flex items-center"
              />
            </div>

            {/* 移动端菜单按钮 */}
            {/* The Sheet component was removed from imports, so this block is removed. */}
          </div>
        </div>
      </header>
    {/* 占位元素：与导航栏同高，避免内容被覆盖 */}
    <div aria-hidden className="h-[var(--header-height,64px)]"></div>
    </>
  );
};

// 导出带BackToTop的包装组件
export const TopNavigationWithBackToTop: React.FC = () => {
  return (
    <>
      <TopNavigation />
      <BackToTop />
    </>
  );
};

export default TopNavigation; 