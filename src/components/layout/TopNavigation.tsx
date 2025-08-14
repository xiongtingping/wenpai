/**
 * 顶部导航栏组件
 * 全站通用的Logo、功能导航和用户功能导航
 * 优化版：桌面端16px字体，移动端14px，增强交互反馈
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// 🔒 [AUTHING_GUARD_NAVIGATION_v2025.08.14]
// 统一使用@authing/guard架构，禁止引入@authing/web
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
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
import { DevPermissionSwitcher } from '@/components/dev/DevPermissionSwitcher';
import { LogoWithText } from '@/components/ui/ThemeAwareLogo';

/**
 * 顶部导航栏组件
 */
export const TopNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useUnifiedAuth();
  const vipPermission = usePermission('vip:required');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);

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
    if (item.requiresAuth && !isAuthenticated) {
      // 未登录用户，弹出登录弹窗
      login(item.path);
    } else {
      // 已登录用户或不需要认证的页面，直接跳转
      navigate(item.path);
    }
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

  return (
    <header className="sticky top-0 z-50 w-full border-b shadow-sm theme-header-bg backdrop-blur-sm border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 左侧Logo和导航 */}
          <div className="flex items-center space-x-6">
            {/* Logo - 主题感知的熊猫Logo */}
            <Link to="/" className="group">
              <div className="flex items-center space-x-3">
                <LogoWithText
                  size="md"
                  textSize="lg"
                  showHoverEffect={true}
                  showBackground={true}
                />
                {isDevelopment() && (
                  <Badge variant="premium" className="text-xs animate-pulse">
                    DEV
                  </Badge>
                )}
              </div>
            </Link>

            {/* 桌面端功能导航菜单 */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item)}
                  className={`flex items-center space-x-2 px-4 py-2 text-base font-medium rounded-md transition-all duration-200 relative group ${
                    isActivePath(item.path)
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-primary hover:text-accent hover:bg-accent/50 hover:border-b-2 hover:border-accent'
                  }`}
                >
                  <item.icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 text-current ${
                    isActivePath(item.path) ? 'text-primary' : ''
                  }`} />
                  <span>{item.label}</span>
                  {isActivePath(item.path) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-card rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>

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

          {/* 右侧用户区域 */}
          <div className="flex items-center gap-2">
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

              {/* 开发环境权限切换工具 */}
              <DevPermissionSwitcher />

              {/* 主题切换 */}
              <ThemeToggle />

              {/* 专业用户标识 */}
              {isAuthenticated && isPro && (
                <Badge variant="premium" className="text-xs hidden sm:inline-flex bg-primary text-primary-foreground border-0">
                  {isDevelopment() ? 'DEV' : 'PRO'}
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
      </div>
    </header>
  );
};

export default TopNavigation; 