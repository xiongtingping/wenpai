/**
 * 顶部导航栏组件
 * 全站通用的核心功能模块导航
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import UserAvatar from '@/components/auth/UserAvatar';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { 
  Sparkles,
  Zap,
  TrendingUp,
  FolderOpen,
  Users,
  Settings,
  Crown,
  Home
} from 'lucide-react';

/**
 * 核心功能模块配置
 */
const CORE_MODULES = [
  {
    path: '/',
    title: '首页',
    icon: Home,
    description: '文派主页'
  },
  {
    path: '/adapt',
    title: 'AI内容适配器',
    icon: Zap,
    description: '一次创作，多平台适配'
  },
  {
    path: '/creative-studio',
    title: '创意魔方',
    icon: Sparkles,
    description: '激发创意灵感'
  },
  {
    path: '/hot-topics',
    title: '全网雷达',
    icon: TrendingUp,
    description: '热点话题监控',
    badge: '新功能'
  },
  {
    path: '/library',
    title: '我的资料库',
    icon: FolderOpen,
    description: '内容管理中心'
  },
  {
    path: '/brand-library',
    title: '品牌库',
    icon: Users,
    description: '品牌资料管理'
  }
];

/**
 * 用户功能模块
 */
const USER_MODULES = [
  {
    path: '/profile',
    title: '个人中心',
    icon: Settings,
    description: '账户设置'
  },
  {
    path: '/payment',
    title: '订阅管理',
    icon: Crown,
    description: '升级专业版'
  }
];

/**
 * 顶部导航栏组件
 */
export const TopNavigation: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const currentPath = location.pathname;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="https://static.devv.ai/ep7eod98hhq8.png" alt="文派" className="h-8 w-8" />
            <span className="font-bold text-xl text-gray-800">文派</span>
          </Link>

          {/* 核心功能导航 */}
          <nav className="hidden lg:flex items-center space-x-1">
            {CORE_MODULES.map((module) => {
              const ModuleIcon = module.icon;
              const isActive = currentPath === module.path;
              
              return (
                <Link
                  key={module.path}
                  to={module.path}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    flex items-center gap-2 min-w-[44px] h-10
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <ModuleIcon className="h-4 w-4" />
                  <span>{module.title}</span>
                  {module.badge && (
                    <Badge variant="outline" className="ml-1 text-xs bg-red-50 text-red-600 border-red-200">
                      {module.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 右侧用户区域 */}
          <div className="flex items-center gap-2">
            {/* 主题切换器 */}
            <ThemeSwitcher />
            {/* 用户头像等 */}
            {isAuthenticated ? (
              <>
                {/* 用户功能下拉菜单 */}
                <div className="hidden md:flex items-center space-x-1">
                  {USER_MODULES.map((module) => {
                    const ModuleIcon = module.icon;
                    const isActive = currentPath === module.path;
                    
                    return (
                      <Link
                        key={module.path}
                        to={module.path}
                        className={`
                          relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          flex items-center gap-2 min-w-[44px] h-9
                          ${isActive 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        <ModuleIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{module.title}</span>
                      </Link>
                    );
                  })}
                </div>
                
                {/* 用户头像 */}
                <UserAvatar />
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">登录</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">注册</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="lg:hidden border-t border-gray-100">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {CORE_MODULES.slice(1, 5).map((module) => {
                const ModuleIcon = module.icon;
                const isActive = currentPath === module.path;
                
                return (
                  <Link
                    key={module.path}
                    to={module.path}
                    className={`
                      flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                      flex items-center gap-1.5 min-w-[44px] h-8
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <ModuleIcon className="h-3 w-3" />
                    <span>{module.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation; 