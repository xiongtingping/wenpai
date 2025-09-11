/**
 * ✅ FIXED: 2025-01-05 修复导航栏头像点击问题
 * 
 * 问题描述：在AI内容适配器等页面无法点击右上角个人中心
 * 解决方案：将UserAvatar改为使用Link包装的头像，直接链接到个人中心页面
 */

import React, { useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { LogoWithText } from '@/components/ui/logo-with-text';
// import { NavBar } from '@/components/ui/navbar';
import { SubscriptionStatusBadge } from '@/components/subscription/SubscriptionStatusBadge';
import { BackToTop } from '@/components/ui/BackToTop';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { getUserTier } from '@/utils/subscriptionUtils';
// import { isDevelopment } from '@/utils/env';
import { getUserDisplayName } from '@/utils/userDisplayUtils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

// 导航菜单项
const navItems: NavItem[] = [
  // { label: '首页', path: '/', icon: Home },
  // { label: '热点话题', path: '/hot-topics', icon: TrendingUp },
  // { label: '创意工坊', path: '/creative-studio', icon: Sparkles },
  // { label: '品牌库', path: '/brand-library', icon: Building },
  // { label: '收藏夹', path: '/bookmarks', icon: Bookmark },
];

// 权限检查状态
const permissionLoading = false;

/**
 * 顶部导航组件 - 响应式设计
 */
export const TopNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const { isAuthenticated, user } = useAuth();
  const { primaryStatus } = useSubscriptionStatus();
  
  // 判断当前路径是否为激活状态
  const isActivePath = (path: string): boolean => {
    return location.pathname === path;
  };

  // 处理导航点击
  const handleNavigation = (item: NavItem) => {
    navigate(item.path);
  };
  
  // 检查是否应该显示升级按钮
  const shouldShowUpgradeButton = (): boolean => {
    if (!isAuthenticated || !user || !primaryStatus) return false;

    const userTier = getUserTier(user);
    return userTier === 'trial';
  };

  // 检查用户是否为专业版用户
  const isPro = (): boolean => {
    if (!isAuthenticated || !user) return false;
    
    const userTier = getUserTier(user);
    return userTier === 'pro' || userTier === 'premium';
  };

  // 🔧 FIX: 动态计算导航栏高度
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
          <div className="flex h-16 items-center justify-between relative">
          {/* 左侧Logo */}
          <div className="flex items-center">
            <Link to="/" className="group">
              <div className="flex items-center space-x-3">
                <div className="text-xl font-bold">文派</div>
              </div>
            </Link>
          </div>

          {/* 中间导航菜单 - 绝对居中 */}
          <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
            <div className="hidden lg:flex items-center space-x-6">
              {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={(e: any) => { e.preventDefault(); handleNavigation(item); }}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧用户区域 - 靠右显示 */}
          <div className="flex items-center gap-2">
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
            
            {/* 用户状态指示 */}
            {permissionLoading && (
              <div className="hidden sm:flex items-center gap-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-xs text-secondary">权限加载中...</span>
              </div>
            )}

            {/* 用户头像和登录状态 */}
            <div className="flex items-center gap-2">
              {/* 升级按钮 - 只对非高级版用户显示 */}
              {isAuthenticated && shouldShowUpgradeButton() && (
                <Button
                  onClick={() => navigate('/payment')}
                  size="sm"
                  className="btn-upgrade-gradient text-primary-foreground p-2 rounded-lg transition-all duration-200 hover:shadow-lg hidden sm:flex"
                  title="升级到高级版"
                >
                  <Crown className="w-4 h-4" />
                </Button>
              )}

              {/* 专业用户标识 */}
              {isAuthenticated && isPro() && (
                <Badge variant="premium" className="text-xs hidden sm:inline-flex bg-primary text-primary-foreground border-0">
                  PRO
                </Badge>
              )}

              {/* 订阅状态标识 */}
              {isAuthenticated && (
                <SubscriptionStatusBadge className="hidden sm:inline-flex" />
              )}

              {/* ✅ FIXED: 用户头像链接到个人中心 */}
              {isAuthenticated && user && (
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-sm font-medium hover:bg-accent/50 px-2 py-1.5 rounded-md transition-all duration-200"
                  title="个人中心"
                >
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {user.nickname?.[0] || user.username?.[0] || user.email?.[0] || '用'}
                  </div>
                  <span className="hidden md:inline-block text-foreground">
                    {getUserDisplayName(user, '用户')}
                  </span>
                </Link>
              )}
              
              {/* 未登录状态 - 登录按钮 */}
              {!isAuthenticated && (
                <Button
                  onClick={() => navigate('/auth')}
                  size="sm"
                  variant="outline"
                  className="hover:bg-accent/50"
                >
                  登录
                </Button>
              )}
            </div>
          </div>
          </div>
        </div>
      </header>
      {/* 占位元素：与导航栏同高，避免内容被覆盖 */}
      <div aria-hidden className="header-spacer"></div>
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