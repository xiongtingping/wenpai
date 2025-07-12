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
  FolderOpen,
  ChevronRight
} from 'lucide-react';

/**
 * 二级页面导航配置
 */
const SECONDARY_NAV_ITEMS = [
  { path: '/', label: '首页', icon: Home },
  { path: '/adapt', label: 'AI内容适配器', icon: FileText },
  { path: '/creative-studio', label: '创意魔方', icon: Sparkles },
  { path: '/hot-topics', label: '全网雷达', icon: TrendingUp },
  { path: '/library', label: '我的资料库', icon: FolderOpen },
  { path: '/brand-library', label: '品牌库', icon: Users },
];

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
    title: '内容提取',
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
    badge: '免费',
  },
  '/brand-library': {
    path: '/brand-library',
    title: '品牌库',
    icon: Users,
    level: 2,
    parent: '/',
    category: 'insight-tools',
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
  /** 是否显示AI内容适配器快速访问按钮 */
  showAdaptButton?: boolean;
  /** 是否显示升级按钮 */
  showUpgradeButton?: boolean;
  /** 额外的操作按钮 */
  actions?: React.ReactNode;
}

/**
 * 页面导航组件
 */
export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPath,
  title,
  description,
  showAdaptButton = true,
  showUpgradeButton = true,
  actions,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = currentPath || location.pathname;

  /**
   * 检查当前路径是否激活
   */
  const isActivePath = (navPath: string) => {
    if (navPath === '/') {
      return path === '/';
    }
    return path.startsWith(navPath);
  };

  /**
   * 构建面包屑导航
   */
  const buildBreadcrumbs = () => {
    const breadcrumbs = [];
    const currentConfig = PAGE_CONFIGS[path];
    
    if (currentConfig) {
      // 添加父页面
      if (currentConfig.parent && PAGE_CONFIGS[currentConfig.parent]) {
        const parentConfig = PAGE_CONFIGS[currentConfig.parent];
        breadcrumbs.push({
          path: parentConfig.path,
          title: parentConfig.title,
          icon: parentConfig.icon,
        });
      }
      
      // 添加当前页面
      breadcrumbs.push({
        path: currentConfig.path,
        title: currentConfig.title,
        icon: currentConfig.icon,
        badge: currentConfig.badge,
      });
    }
    
    return breadcrumbs;
  };

  /**
   * 获取子模块列表
   */
  const getSubModules = () => {
    const currentConfig = PAGE_CONFIGS[path];
    if (!currentConfig?.category) return [];
    
    return Object.values(PAGE_CONFIGS).filter(
      config => config.category === currentConfig.category && config.path !== path
    );
  };

  const breadcrumbs = buildBreadcrumbs();
  const subModules = getSubModules();

  return (
    <div className="border-b bg-gradient-to-r from-background via-background/95 to-background/90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-6">
        {/* 面包屑导航 */}
        {breadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList className="flex-wrap">
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/" 
                    className="flex items-center gap-1 hover:text-primary transition-all duration-200 hover:scale-105"
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">首页</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={item.path}>
                    <BreadcrumbSeparator>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{item.title}</span>
                          {item.badge && (
                            <Badge variant="outline" className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200">
                              {item.badge}
                            </Badge>
                          )}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink 
                          href={item.path}
                          className="flex items-center gap-2 hover:text-primary transition-all duration-200 hover:scale-105"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{item.title}</span>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* 页面标题和描述 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {title || PAGE_CONFIGS[path]?.title || '页面'}
              </h1>
              {PAGE_CONFIGS[path]?.badge && (
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200 animate-pulse">
                  {PAGE_CONFIGS[path].badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* 操作按钮区域 */}
          <div className="flex items-center gap-2 flex-wrap">
            {actions}
            
            {/* AI内容适配器快速访问 */}
            {showAdaptButton && path !== '/adapt' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/adapt')}
                className="hidden sm:inline-flex hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
              >
                <Zap className="w-4 h-4 mr-2" />
                AI适配器
              </Button>
            )}
            
            {/* 升级按钮 */}
            {showUpgradeButton && (
              <UpgradeButton className="hidden sm:inline-flex" />
            )}
          </div>
        </div>

        {/* 子模块快速导航 */}
        {subModules.length > 0 && PAGE_CONFIGS[path]?.level > 2 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">相关功能</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent"></div>
            </div>
            <div className="flex flex-wrap gap-3">
              {subModules.map((module) => (
                <Button
                  key={module.path}
                  variant={path === module.path ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigate(module.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    path === module.path
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                      : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border-gray-300 hover:border-blue-300 hover:scale-105"
                  }`}
                >
                  <module.icon className="w-4 h-4" />
                  <span className="font-medium">{module.title}</span>
                  {module.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200">
                      {module.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageNavigation; 