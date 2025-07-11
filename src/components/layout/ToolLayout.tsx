import React, { ReactNode } from 'react';
import TopNavigation from './TopNavigation';

interface ToolLayoutProps {
  children: ReactNode;
}

/**
 * 工具页面布局组件
 * 提供统一的页面布局结构，支持响应式设计
 */
export default function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <TopNavigation />
      
      {/* 主内容区域 */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* 页脚 */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-medium text-gray-700">文派</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>&copy; 2024 文派. 保留所有权利.</span>
              <div className="hidden sm:flex items-center gap-4">
                <a href="/privacy" className="hover:text-gray-700 transition-colors">
                  隐私政策
                </a>
                <a href="/terms" className="hover:text-gray-700 transition-colors">
                  服务条款
                </a>
                <a href="/about" className="hover:text-gray-700 transition-colors">
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