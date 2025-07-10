import React, { ReactNode } from 'react';
import TopNavigation from './TopNavigation';

interface ToolLayoutProps {
  children: ReactNode;
}

/**
 * 工具页面布局组件
 * 提供统一的页面布局结构
 */
export default function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <TopNavigation />
      
      {/* 主内容区域 */}
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      
      {/* 页脚 */}
      <footer className="border-t py-6 bg-white">
        <div className="container text-center text-sm text-gray-500">
          <p>&copy; 2024 文派. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}