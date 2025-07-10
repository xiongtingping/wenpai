/**
 * 顶部导航栏组件
 * 全站通用的核心功能模块导航
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * 顶部导航栏组件
 */
export const TopNavigation: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { hasRole, loading: permissionLoading } = usePermissions();

  // 导航菜单项
  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/hot-topics', label: '全网雷达', icon: '📡' },
    { path: '/content-extractor', label: '内容提取', icon: '📄' },
    { path: '/creative-studio', label: '创意工坊', icon: '🎨' },
    { path: '/platform-api', label: '平台API', icon: '🔌' },
  ];

  // 检查是否为专业用户
  const isPro = hasRole('premium') || hasRole('pro') || hasRole('admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 左侧Logo和导航 */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold text-primary">文派</span>
            </Link>

            {/* 导航菜单 */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* 右侧用户区域 */}
          <div className="flex items-center gap-2">
            {/* 主题切换器 */}
            <ThemeSwitcher />
            
            {/* 用户状态指示 */}
            {permissionLoading && (
              <div className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs text-muted-foreground">权限加载中...</span>
              </div>
            )}

            {/* 用户头像和登录状态 */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* 专业用户标识 */}
                {isPro && (
                  <Badge variant="premium" className="text-xs">
                    PRO
                  </Badge>
                )}
                
                {/* 用户头像 */}
                <UserAvatar user={user} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    登录
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation; 