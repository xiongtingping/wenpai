/**
 * 顶部导航栏组件
 * 全站通用的Logo、功能导航和用户功能导航
 * 优化版：桌面端16px字体，移动端14px，增强交互反馈
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Home, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  FolderOpen, 
  Users, 
  Menu,
  Settings,
  LogOut,
  User,
  Crown
} from 'lucide-react';

/**
 * 检查是否为开发环境
 */
const isDevelopment = () => {
  return import.meta.env.DEV || process.env.NODE_ENV === 'development';
};

/**
 * 顶部导航栏组件
 */
export const TopNavigation: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, login } = useUnifiedAuthContext();
  const { loading: permissionLoading } = usePermissions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 功能导航菜单项
  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/adapt', label: 'AI内容适配器', icon: FileText },
    { path: '/creative-studio', label: '创意魔方', icon: Sparkles },
    { path: '/hot-topics', label: '全网雷达', icon: TrendingUp },
    { path: '/library', label: '我的资料库', icon: FolderOpen },
    { path: '/brand-library', label: '品牌库', icon: Users },
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
   * 移动端导航项组件
   */
  const MobileNavItem = ({ item }: { item: typeof navItems[0] }) => (
    <Link
      to={item.path}
      className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActivePath(item.path)
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
          : 'text-gray-700 hover:text-blue-600 hover:bg-accent/50'
      }`}
      onClick={() => setMobileMenuOpen(false)}
    >
      <item.icon className="w-5 h-5" />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 左侧Logo和导航 */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🎯</span>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur-sm"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
                文派
              </span>
              {isDevelopment() && (
                <Badge variant="premium" className="text-xs animate-pulse">
                  DEV
                </Badge>
              )}
            </Link>

            {/* 桌面端功能导航菜单 */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 text-base font-medium rounded-md transition-all duration-200 relative group ${
                    isActivePath(item.path)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-accent/50 hover:border-b-2 hover:border-blue-500'
                  }`}
                >
                  <item.icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActivePath(item.path) ? 'text-white' : ''
                  }`} />
                  <span>{item.label}</span>
                  {isActivePath(item.path) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* 平板端下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden hover:bg-accent/50">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-2 text-sm font-medium ${
                        isActivePath(item.path) ? 'bg-accent text-accent-foreground' : 'text-gray-700'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs text-muted-foreground">权限加载中...</span>
              </div>
            )}

            {/* 用户头像和登录状态 */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* 专业用户标识 */}
                {isPro && (
                  <Badge variant="premium" className="text-xs hidden sm:inline-flex bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    {isDevelopment() ? 'DEV' : 'PRO'}
                  </Badge>
                )}
                
                {/* 用户头像 */}
                <UserAvatar user={user} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:inline-flex hover:bg-accent/50 text-sm font-medium"
                  onClick={() => login()}
                >
                  登录
                </Button>
                <Button 
                  size="sm" 
                  className="hidden sm:inline-flex bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md text-sm font-medium"
                  onClick={() => login()}
                >
                  注册
                </Button>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden hover:bg-accent/50">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="relative">
                      <span className="text-2xl">🎯</span>
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-sm"></div>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      文派
                    </span>
                    {isDevelopment() && (
                      <Badge variant="premium" className="text-xs">
                        DEV
                      </Badge>
                    )}
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-8 space-y-4">
                  {/* 移动端功能导航菜单 */}
                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <MobileNavItem key={item.path} item={item} />
                    ))}
                  </nav>

                  {/* 移动端用户区域 */}
                  <div className="pt-4 border-t border-border/50">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                          <UserAvatar user={user} size="sm" showDropdown={false} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {user?.nickname || user?.username || '用户'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user?.email || ''}
                            </p>
                          </div>
                          {isPro && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-accent/50 rounded-lg transition-all duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            <span>个人中心</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-accent/50 rounded-lg transition-all duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>设置</span>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            login();
                            setMobileMenuOpen(false);
                          }}
                        >
                          登录
                        </Button>
                        <Button 
                          className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                          onClick={() => {
                            login();
                            setMobileMenuOpen(false);
                          }}
                        >
                          注册
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation; 