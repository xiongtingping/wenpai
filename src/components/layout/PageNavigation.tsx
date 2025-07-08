/**
 * 页面导航组件
 * 提供面包屑导航、子模块切换和快速访问功能
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { UpgradeButton } from '@/components/ui/upgrade-button';
import { 
  ArrowLeft,
  Sparkles,
  Zap,
  Home,
  FileText,
  Bookmark,
  Upload,
  Edit,
  Calendar,
  MessageCircle,
  Smile,
  TrendingUp,
  Users,
  Settings,
  Crown,
  FolderOpen
} from 'lucide-react';

/**
 * 页面配置接口
 */
interface PageConfig {
  path: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  level: number; // 1-一级页面, 2-二级页面, 3-三级页面
  parent?: string; // 父页面路径
  category?: string; // 页面分类，用于子模块切换
  badge?: string; // 页面徽章，如"开发中"
  subModules?: Array<{
    path: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

/**
 * 页面配置映射
 */
const PAGE_CONFIGS: Record<string, PageConfig> = {
  '/': {
    path: '/',
    title: '文派',
    icon: Home,
    level: 1,
  },
  '/adapt': {
    path: '/adapt',
    title: 'AI内容适配器',
    icon: Zap,
    level: 2,
    parent: '/',
    category: 'ai-tools',
  },
  '/creative-studio': {
    path: '/creative-studio',
    title: '创意魔方',
    icon: Sparkles,
    level: 2,
    parent: '/',
    category: 'creative-tools',
  },
  '/library': {
    path: '/library',
    title: '我的资料库',
    icon: FolderOpen,
    level: 2,
    parent: '/',
    category: 'content-tools',
    subModules: [
      { path: '/library', title: '全部', icon: FolderOpen },
      { path: '/library', title: '网络收藏', icon: Bookmark },
      { path: '/library', title: '智采器', icon: FileText },
      { path: '/library', title: '文案管理', icon: Edit },
    ],
  },
  '/bookmarks': {
    path: '/bookmarks',
    title: '网络收藏',
    icon: Bookmark,
    level: 3,
    parent: '/library',
    category: 'content-tools',
  },
  '/content-extractor': {
    path: '/content-extractor',
    title: '智采器',
    icon: FileText,
    level: 3,
    parent: '/library',
    category: 'content-tools',
  },
  '/emoji-generator': {
    path: '/emoji-generator',
    title: 'Emoji生成器',
    icon: Smile,
    level: 2,
    parent: '/',
    category: 'creative-tools',
  },
  '/emojis': {
    path: '/emojis',
    title: 'Emoji生成器',
    icon: Smile,
    level: 2,
    parent: '/',
    category: 'creative-tools',
  },
  '/share-manager': {
    path: '/share-manager',
    title: '一键转发',
    icon: Upload,
    level: 2,
    parent: '/',
    category: 'distribution-tools',
  },
  '/wechat-templates': {
    path: '/wechat-templates',
    title: '朋友圈模板',
    icon: MessageCircle,
    level: 2,
    parent: '/',
    category: 'creative-tools',
  },
  '/hot-topics': {
    path: '/hot-topics',
    title: '全网雷达',
    icon: TrendingUp,
    level: 2,
    parent: '/',
    category: 'insight-tools',
    badge: '开发中',
  },
  '/brand-library': {
    path: '/brand-library',
    title: '品牌库',
    icon: Users,
    level: 2,
    parent: '/',
    category: 'insight-tools',
    badge: '开发中',
  },
  '/profile': {
    path: '/profile',
    title: '个人中心',
    icon: Settings,
    level: 2,
    parent: '/',
    category: 'user-tools',
  },
  '/invite': {
    path: '/invite',
    title: '邀请好友',
    icon: Users,
    level: 3,
    parent: '/profile',
    category: 'user-tools',
  },
  '/history': {
    path: '/history',
    title: '历史记录',
    icon: FileText,
    level: 2,
    parent: '/',
    category: 'user-tools',
  },
  '/payment': {
    path: '/payment',
    title: '订阅管理',
    icon: Crown,
    level: 2,
    parent: '/',
    category: 'user-tools',
  },
};

/**
 * 页面导航组件属性
 */
interface PageNavigationProps {
  /** 当前页面路径 */
  currentPath?: string;
  /** 页面标题 */
  title?: string;
  /** 页面描述 */
  description?: string;
  /** 是否显示AI适配器快速访问按钮 */
  showAdaptButton?: boolean;
  /** 额外的操作按钮 */
  actions?: React.ReactNode;
}

/**
 * 页面导航组件
 * @param props 组件属性
 * @returns React 组件
 */
export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPath,
  title,
  description,
  showAdaptButton = true,
  actions,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = currentPath || location.pathname;
  
  // 获取当前页面配置
  const currentConfig: PageConfig = PAGE_CONFIGS[path] || {
    path,
    title: title || '页面',
    icon: FileText,
    level: 2,
    parent: '/',
  };

  /**
   * 构建面包屑路径
   */
  const buildBreadcrumbs = () => {
    const breadcrumbs: PageConfig[] = [];
    let current = currentConfig;
    
    // 添加当前页面
    breadcrumbs.unshift(current);
    
    // 向上追溯父页面
    while (current.parent && PAGE_CONFIGS[current.parent]) {
      current = PAGE_CONFIGS[current.parent];
      breadcrumbs.unshift(current);
    }
    
    return breadcrumbs;
  };

  /**
   * 获取同类别的子模块
   */
  const getSubModules = () => {
    if (currentConfig.subModules) {
      return currentConfig.subModules;
    }
    
    // 如果是三级页面，找到二级页面的子模块
    if (currentConfig.level === 3 && currentConfig.parent) {
      const parentConfig = PAGE_CONFIGS[currentConfig.parent];
      return parentConfig?.subModules || [];
    }
    
    return [];
  };

  const breadcrumbs = buildBreadcrumbs();
  const subModules = getSubModules();

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        {/* 顶部导航行：返回按钮 + 右侧操作 */}
        <div className="flex items-center justify-between mb-3">
          {/* 左侧：返回按钮 */}
          <div className="flex items-center">
            {/* 优化后的返回按钮 */}
            {currentConfig.level > 1 && currentConfig.parent && (
              <Button
                variant="ghost"
                onClick={() => navigate(currentConfig.parent!)}
                className="
                  min-w-[44px] h-9 px-3 py-1.5
                  bg-gray-100 hover:bg-gray-200 
                  rounded-full
                  flex items-center gap-2
                  text-gray-700 hover:text-gray-900
                  border border-gray-200 hover:border-gray-300
                  transition-all duration-200 ease-in-out
                  hover:scale-105 hover:shadow-sm
                  active:scale-95
                  group
                  text-sm font-medium
                "
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>{PAGE_CONFIGS[currentConfig.parent!]?.title || '返回'}</span>
              </Button>
            )}
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-3">
            {/* 升级专业版按钮 */}
            <UpgradeButton />
            
            {/* AI适配器快速访问 - 只在二级页面显示 */}
            {showAdaptButton && path !== '/adapt' && currentConfig.level === 2 && (
              <Button
                onClick={() => navigate('/adapt')}
                className="
                  min-w-[44px] h-9 px-4 py-2
                  bg-blue-600 hover:bg-blue-700 
                  text-white
                  rounded-lg
                  flex items-center gap-2
                  transition-all duration-200 ease-in-out
                  hover:scale-105 hover:shadow-md
                  active:scale-95
                  group
                  border-0
                "
              >
                <Zap className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-sm font-medium">AI适配器</span>
              </Button>
            )}
            
            {/* 额外操作按钮 */}
            {actions}
          </div>
        </div>

        {/* 页面主标题区域 */}
        <div className="mb-4">
          <div className="flex items-center gap-2.5 mb-1">
            {React.createElement(currentConfig.icon, { className: "h-5 w-5 text-blue-600" })}
            <h1 className="text-xl font-bold text-gray-900">
              {title || currentConfig.title}
            </h1>
            {currentConfig.badge && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                {currentConfig.badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-gray-600 text-sm leading-relaxed ml-8">
              {description}
            </p>
          )}
        </div>

        {/* 子模块快速切换 */}
        {subModules.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-gray-100 mt-4">
            <span className="text-sm font-medium text-gray-500 mr-2">快速切换:</span>
            {subModules.map((module, index) => {
              const ModuleIcon = module.icon;
              const isActive = path === module.path;
              
              return (
                <Button
                  key={index}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => navigate(module.path)}
                  className={`
                    min-w-[44px] h-8 px-3 py-1.5
                    flex items-center gap-2
                    transition-all duration-200 ease-in-out
                    hover:scale-105 active:scale-95
                    ${isActive 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
                    }
                    rounded-lg
                  `}
                >
                  <ModuleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{module.title}</span>
                  {module.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ml-1 ${
                        isActive 
                          ? 'bg-white/20 text-white border-white/30' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {module.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageNavigation; 