import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
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
  Sparkles,
  Zap
} from 'lucide-react';

interface ToolLayoutProps {
  children: ReactNode;
}

/**
 * 页面配置接口
 */
interface PageConfig {
  path: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  level: number;
  parent?: string;
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
  },
  '/creative-studio': {
    path: '/creative-studio',
    title: '创意魔方',
    icon: Sparkles,
    level: 2,
    parent: '/',
  },
  '/library': {
    path: '/library',
    title: '我的资料库',
    icon: FolderOpen,
    level: 2,
    parent: '/',
  },
  '/bookmarks': {
    path: '/bookmarks',
    title: '网络收藏',
    icon: Bookmark,
    level: 3,
    parent: '/library',
  },
  '/content-extractor': {
    path: '/content-extractor',
    title: '智采器',
    icon: FileText,
    level: 3,
    parent: '/library',
  },
  '/emoji-generator': {
    path: '/emoji-generator',
    title: 'Emoji生成器',
    icon: Smile,
    level: 2,
    parent: '/',
  },
  '/emojis': {
    path: '/emojis',
    title: 'Emoji生成器',
    icon: Smile,
    level: 2,
    parent: '/',
  },
  '/share-manager': {
    path: '/share-manager',
    title: '一键转发',
    icon: Upload,
    level: 2,
    parent: '/',
  },
  '/wechat-templates': {
    path: '/wechat-templates',
    title: '朋友圈模板',
    icon: MessageCircle,
    level: 2,
    parent: '/',
  },
  '/hot-topics': {
    path: '/hot-topics',
    title: '全网雷达',
    icon: TrendingUp,
    level: 2,
    parent: '/',
  },
  '/brand-library': {
    path: '/brand-library',
    title: '品牌库',
    icon: Users,
    level: 2,
    parent: '/',
  },
  '/profile': {
    path: '/profile',
    title: '个人中心',
    icon: Settings,
    level: 2,
    parent: '/',
  },
  '/invite': {
    path: '/invite',
    title: '邀请好友',
    icon: Users,
    level: 3,
    parent: '/profile',
  },
  '/history': {
    path: '/history',
    title: '历史记录',
    icon: FileText,
    level: 2,
    parent: '/',
  },
  '/payment': {
    path: '/payment',
    title: '订阅管理',
    icon: Crown,
    level: 2,
    parent: '/',
  },
};

export default function ToolLayout({ children }: ToolLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // 获取当前页面配置
  const currentConfig: PageConfig = PAGE_CONFIGS[path] || {
    path,
    title: '页面',
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

  const breadcrumbs = buildBreadcrumbs();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex justify-between items-center h-16 px-6">
          {/* 左侧：Logo + 面包屑导航 */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <img src="https://static.devv.ai/ep7eod98hhq8.png" alt="文派" className="h-8 w-8" />
              <span className="font-bold text-lg">文派</span>
            </Link>
            
            {/* 面包屑导航 - 仅在二级页面及以下显示 */}
            {currentConfig.level > 1 && (
              <Breadcrumb className="flex items-center">
                <BreadcrumbList className="flex items-center">
                  {breadcrumbs.map((crumb, index) => {
                    const Icon = crumb.icon;
                    const isLast = index === breadcrumbs.length - 1;
                    
                    return (
                      <React.Fragment key={crumb.path}>
                        <BreadcrumbItem className="flex items-center">
                          {isLast ? (
                            <span className="text-gray-900 text-sm font-medium flex items-center gap-1.5">
                              <Icon className="h-4 w-4" />
                              {crumb.title}
                            </span>
                          ) : (
                            <BreadcrumbLink 
                              className="
                                cursor-pointer text-gray-500 hover:text-blue-600 
                                flex items-center gap-1.5 
                                transition-colors duration-200
                                hover:underline underline-offset-2
                                text-sm font-medium
                              "
                              onClick={() => navigate(crumb.path)}
                            >
                              <Icon className="h-4 w-4" />
                              {crumb.title}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast && (
                          <BreadcrumbSeparator className="mx-2 text-gray-400 text-sm">
                            /
                          </BreadcrumbSeparator>
                        )}
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
          
          {/* 右侧预留空间（可以放置全局操作按钮） */}
          <div></div>
        </div>
      </header>
      
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      
      <footer className="border-t py-6 bg-white">
        <div className="container text-center text-sm text-gray-500">
          <p>&copy; 2024 文派. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}