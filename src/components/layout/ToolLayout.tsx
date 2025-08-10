import React, { ReactNode } from 'react';
import TopNavigation from './TopNavigation';
import PageTracker from '@/components/analytics/PageTracker';

interface ToolLayoutProps {
  children: ReactNode;
  /** 页面标题 */
  pageTitle?: string;
  /** 页面描述 */
  pageDescription?: string;
  /** 页面元数据 */
  pageMetadata?: Record<string, unknown>;
}

/**
 * 工具页面布局组件
 * 提供统一的页面布局结构，支持响应式设计
 */
function ToolLayout({ 
  children, 
  pageTitle,
  pageDescription,
  pageMetadata = {}
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-accent">
      {/* 页面访问记录 */}
      <PageTracker 
        title={pageTitle}
        description={pageDescription}
        metadata={{
          ...pageMetadata,
          layout: 'tool',
          hasNavigation: true
        }}
      />
      
      {/* 顶部导航栏 */}
      <TopNavigation />
      
      {/* 主内容区域 */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* 页脚 */}
      <footer className="border-t bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-medium text-foreground">文派</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>&copy; 2024 文派. 保留所有权利.</span>
              <div className="hidden sm:flex items-center gap-4">
                <a href="/privacy" className="hover:text-foreground transition-colors">
                  隐私政策
                </a>
                <a href="/terms" className="hover:text-foreground transition-colors">
                  服务条款
                </a>
                <a href="/about" className="hover:text-foreground transition-colors">
                  关于我们
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { ToolLayout };
export default ToolLayout;